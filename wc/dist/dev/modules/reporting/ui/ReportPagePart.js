/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./ReportPartBase", "lib/ui/menu/Menu", "i18n!lib/nls/resources"], function (require, exports, core, ReportPartBase, Menu, resources) {
    "use strict";
    var ReportPagePart = /** @class */ (function (_super) {
        __extends(ReportPagePart, _super);
        /**
         * @constructs ReportPagePart
         * @extends ReportPartBase
         * @param {Application} app
         * @param {Object} options
         */
        function ReportPagePart(app, options) {
            var _this = this;
            options = ReportPagePart.mixOptions(options, ReportPagePart.defaultOptions);
            _this = _super.call(this, app, options) || this;
            if (app.pageModel.reports) {
                if (options.showTitle && !options.title) {
                    // NOTE: that.options.reportName was initialized in ReportPartBase._initializeProps
                    // 		even if it wasn't specified explicitly (taken from urlSuffix)
                    var report = app.pageModel.reports[_this.options.reportName.toLocaleLowerCase()];
                    if (report)
                        _this.title(report.title);
                }
            }
            _this.commands.Build.execute();
            return _this;
        }
        /**
         * Create commands
         * @protected
         * @override
         * @returns {Object.<string, Command>}
         */
        ReportPagePart.prototype.createCommands = function () {
            var that = this;
            var commands = _super.prototype.createCommands.call(this);
            commands.Print = core.createCommand({
                name: "Print",
                execute: that._doPrint.bind(that)
            });
            commands.GoBack = core.createCommand({
                name: "GoBack",
                canExecute: false,
                execute: that._doGoBack.bind(that)
            });
            return commands;
        };
        ReportPagePart.prototype._createMenuDefaults = function () {
            return Menu.defaultsFor(ReportPagePart.defaultMenu, "ReportPagePart", this.options.reportName);
        };
        ReportPagePart.prototype.invalidateCommands = function () {
            var that = this;
            _super.prototype.invalidateCommands.call(this);
            that.commands.Print.canExecute(that._commandsAvailable);
            // проверим, что в истории есть хотя бы один парт
            var area = that.app.areaManager.getActiveArea(), region = area.regionManager.getNavigableRegion(), history = region.getPartsHistory(false);
            if (history && history.length) {
                // считаем, что отчет является вложенным
                that.commands.GoBack.canExecute(true);
            }
        };
        ReportPagePart.prototype._doPrint = function () {
            window.print();
        };
        ReportPagePart.prototype._getReportPartName = function () {
            return "ReportPagePart";
        };
        ReportPagePart.defaultOptions = {};
        ReportPagePart.defaultMenu = {
            items: [
                {
                    name: "GoBack",
                    title: resources.back,
                    hideIfDisabled: true,
                    icon: "arrow-left",
                    order: 10
                }, {
                    name: "Build",
                    title: resources.reload,
                    icon: "refresh",
                    isDefaultAction: true,
                    order: 10
                }, {
                    name: "Print",
                    title: resources.print,
                    icon: "print",
                    order: 20
                }
            ]
        };
        return ReportPagePart;
    }(ReportPartBase));
    ReportPagePart.mixin({
        defaultOptions: ReportPagePart.defaultOptions,
        defaultMenu: ReportPagePart.defaultMenu
    });
    return ReportPagePart;
});
//# sourceMappingURL=ReportPagePart.js.map