/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/list/ObjectList", "i18n!lib/nls/resources"], function (require, exports, $, core, ObjectList, resources) {
    "use strict";
    var lang = core.lang;
    var stripElement = $("<div />");
    function stripHtml(value) {
        return stripElement.html(value).text();
    }
    // original methods to override
    var base = {};
    ["createCommands", "onDataLoaded"].forEach(function (name) {
        base[name] = ObjectList.prototype[name];
    });
    // HACK: typed implementation of partial class ObjectList
    var ObjectListExportable = /** @class */ (function (_super) {
        __extends(ObjectListExportable, _super);
        function ObjectListExportable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObjectListExportable.prototype.createCommands = function () {
            var that = this, commands = base.createCommands.call(that); // NOTE: don't call super - endless recursion
            commands.Export = new core.commands.BoundCommand(that.doExport, that.canExport, that);
            return commands;
        };
        ObjectListExportable.prototype.onDataLoaded = function (args) {
            var that = this;
            that._exportable = args.hints && args.hints["exportable"];
            base.onDataLoaded.call(that, args); // NOTE: don't call super - endless recursion
        };
        ObjectListExportable.prototype.doExport = function (args) {
            var that = this;
            args = that.getCommandOptions(args, "Export");
            if (!args.forceClientData && that.canExportAll()) {
                return that.doExportAll(args);
            }
            if (that.canExportData()) {
                return that.doExportData(args);
            }
        };
        ObjectListExportable.prototype.canExport = function () {
            var that = this;
            return that.canExportAll() || that.canExportData();
        };
        /**
         *
         * @param {Object} [args]
         * @param {String} [args.format] Format name for XFW3 ReportService subsystem
         * @param {String} [args.fileName] File name (w/o extension) to download
         * @param {String} [args.prefix] File name prefix
         * @param {Object} [args.layoutOptions] Options for report layout
         * @param {String} [args.layoutOptions.pageFormat] Page format: "A4", "A5", "A3", "Letter")
         * @param {String} [args.layoutOptions.pageOrientation] Page orientation: "0", "90", "landscape", "portrait"
         * @param {String} [args.layoutOptions.pageMargin] Margin for page body: "20mm"
         * @return {*}
         */
        ObjectListExportable.prototype.doExportData = function (args) {
            args = args || {};
            var that = this, exportOptions = that._normalizeExportOptions(args), exportColumns, exportRows = [], dataColumns = [], exportDeferreds = [];
            exportColumns = that._normalizeExportColumns(function (col) {
                // NOTE: merge the column with nested `export` object (if any) to override export-specific options
                var dataColumn = !col["export"] ?
                    col :
                    lang.extendEx({}, col, col["export"], { deep: true });
                if (dataColumn.role === "data") {
                    dataColumns.push(dataColumn);
                }
                return true;
            });
            exportColumns.forEach(function (col) {
                col.vt = "string"; // we send formatted values only
            });
            lang.forEach(that.items.all(), function (item) {
                var exportRow = {};
                lang.forEach(dataColumns, function (col) {
                    var deferred = lang.loadExpression(that.getCellHtml, that, item, col);
                    deferred.done(function (v) {
                        exportRow[col.name] = stripHtml(v);
                    });
                    if (deferred.state() !== "resolved") {
                        exportDeferreds.push(deferred);
                    }
                });
                exportRows.push(exportRow);
            });
            return lang.when.apply(that, exportDeferreds)
                .fail(function (ex) {
                var message = resources["objectList.exportError"];
                if (ex && ex.message) {
                    message = message + ": " + ex.message;
                }
                that.app.eventPublisher.publish("objectList.export.error", core.SystemEvent.create({
                    severity: "error",
                    message: message,
                    error: ex
                }));
            })
                .then(function () {
                exportOptions.columns = exportColumns;
                exportOptions.rows = exportRows;
                return that.app.dataFacade.ajax({
                    url: "api/_export/_plain",
                    data: { $export: JSON.stringify(exportOptions) },
                    type: "POST"
                }, {
                    fileDownload: true,
                    processEvent: { message: resources["interop.retrieving_data"] }
                });
            })
                .done(function (result) {
                that.onAfterExport(result, args);
            });
        };
        ObjectListExportable.prototype.canExportData = function () {
            return this.state() === this.states.loaded;
        };
        ObjectListExportable.prototype.doExportAll = function (args) {
            args = args || {};
            var that = this, params = that._lastLoadParams;
            if (params == null) {
                return;
            }
            if (!that.loader.buildQuery) {
                return;
            }
            return lang.async.chain().then(function () {
                var query, exportOptions = that._normalizeExportOptions(args);
                exportOptions.columns = that._normalizeExportColumns();
                params = lang.append({ $export: exportOptions }, args.params, params);
                query = that.loader.buildQuery(that, params);
                // fix URL
                query.route = "_export";
                return that.app.dataFacade.load(query, {
                    policy: "remoteOnly",
                    fileDownload: true,
                    processEvent: { message: resources["interop.retrieving_data"] }
                });
            }).done(function (result) {
                that.onAfterExport(result, args);
            }).value();
        };
        ObjectListExportable.prototype.canExportAll = function () {
            var that = this;
            return that.loader && that.loader.buildQuery && that._exportable && that.state() === that.states.loaded;
        };
        ObjectListExportable.prototype._normalizeExportOptions = function (args) {
            return {
                format: args.format,
                fileName: args.fileName,
                fileNamePrefix: args.fileNamePrefix || args.prefix || this.entityType,
                layout: args.layout || args.layoutOptions
            };
        };
        ObjectListExportable.prototype._normalizeExportColumns = function (iterator) {
            var that = this;
            return that.columns
                .filter(function (col) {
                var exportOpt = col["export"], hidden = lang.coalesce(exportOpt && exportOpt.hidden, col.hidden), role = lang.coalesce(exportOpt && exportOpt.role, col.role);
                if (hidden || role !== "data" && role !== "aux" && role !== "number") {
                    return false;
                }
                return iterator ? iterator(col) : true;
            })
                .map(function (col) {
                return lang.extend({
                    name: col.name,
                    title: col.title,
                    prop: col.prop,
                    role: col.role,
                    width: col.width,
                    vt: col.vt
                }, col["export"]);
            });
        };
        ObjectListExportable.prototype.onAfterExport = function (result, args) {
            var that = this;
            that.app.eventPublisher.publish("objectList.export.success", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.notification,
                priority: "low",
                severity: "success",
                message: resources["objectList.exportDownloaded"]
            }));
        };
        return ObjectListExportable;
    }(ObjectList));
    lang.extend(ObjectList.prototype, ObjectListExportable.prototype);
    return ObjectList;
});
//# sourceMappingURL=ObjectListExportable.js.map