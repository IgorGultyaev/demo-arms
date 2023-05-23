/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./ReportPartBase", "lib/ui/menu/Menu", "lib/ui/PartWithFilterMixin", "i18n!lib/nls/resources", "i18n!modules/reporting/nls/resources"], function (require, exports, core, ReportPartBase, Menu, PartWithFilterMixin, resources, resourcesModule) {
    "use strict";
    var ReportPart = /** @class */ (function (_super) {
        __extends(ReportPart, _super);
        /**
         * @constructs ReportPart
         * @extends ReportPartBase
         * @param {Application} app
         * @param {Object} options
         */
        function ReportPart(app, options) {
            var _this = this;
            options = ReportPart.mixOptions(options, ReportPart.defaultOptions);
            _this = _super.call(this, app, options) || this;
            if (_this.options.autoGenerate) {
                _this.commands.Build.execute();
            }
            else {
                _this.stateMessage(resources["reportPart.pressToBuild"]);
            }
            if (_this.options.isNested) {
                _this.commands.GoBack.canExecute(true);
            }
            return _this;
        }
        ReportPart.prototype._initializeProps = function () {
            var that = this;
            _super.prototype._initializeProps.call(this);
            that.initFilter(that.options, that.userSettings);
        };
        ReportPart.prototype._createMenuDefaults = function () {
            var that = this;
            var menu = Menu.defaultsFor(ReportPart.defaultMenu, "ReportPart", this.options.reportName);
            // replace command title 'Build' onto 'Reload' if there are no filter
            if (menu && menu.items.length && !that.filter && that.options.autoGenerate) {
                core.lang.some(menu.items, function (item) {
                    if (item.name === "Build") {
                        item.title = resources.reload;
                        return true;
                    }
                });
            }
            return menu;
        };
        ReportPart.prototype._createMenu = function () {
            var that = this;
            var menu = _super.prototype._createMenu.call(this);
            if (that.filter && that.filter.menu) {
                menu.mergeWith(that.filter.menu);
                that._fieldWithFilterMenu = "menu";
            }
            return menu;
        };
        /**
         * Create commands
         * @protected
         * @override
         * @returns {Object.<string, Command>}
         */
        ReportPart.prototype.createCommands = function () {
            var that = this, commands = _super.prototype.createCommands.call(this);
            return core.lang.extend(commands, {
                Navigate: core.createCommand({
                    name: "Navigate",
                    execute: that._doNavigate.bind(that)
                }),
                GoBack: core.createCommand({
                    name: "GoBack",
                    canExecute: false,
                    execute: that._doGoBack.bind(that)
                })
            });
        };
        ReportPart.prototype._doNavigate = function (cmdOptions) {
            var that = this;
            if (that.navigationService) {
                that.openPart(cmdOptions.partName, cmdOptions.partOptions);
            }
        };
        ReportPart.prototype.getParams = function () {
            var params = this.getFilterRestrictions();
            if (params == null) {
                return;
            }
            // TODO: или наоборот: extend({}, params, this.options.params) ?
            return core.lang.extend({}, this.options.params, params);
        };
        ReportPart.prototype.showFilterError = function (error) {
            this.hintMessage(resources["reportPart.getRestrictionsError"] + error);
        };
        ReportPart.prototype.dispose = function (options) {
            this.disposeFilter();
            _super.prototype.dispose.call(this, options);
        };
        ReportPart.defaultOptions = {
            filterExpanded: true,
            /**
             * @type Boolean
             */
            filterCollapsable: true,
            autoGenerate: false,
            expandFilterTitle: resources["objectFilter.show"],
            collapseFilterTitle: resources["objectFilter.hide"],
            userSettings: {
                props: {
                    "filterExpanded": true,
                    "filter": true
                }
            }
        };
        ReportPart.defaultMenu = {
            items: [
                {
                    name: "GoBack",
                    title: resources.back,
                    hideIfDisabled: true,
                    icon: "arrow-left",
                    order: 10
                }, {
                    name: "Build",
                    title: resourcesModule["reportPart.build"],
                    icon: "report",
                    isDefaultAction: true,
                    order: 10
                }
            ]
        };
        return ReportPart;
    }(ReportPartBase));
    ReportPart.mixin({
        defaultOptions: ReportPart.defaultOptions,
        defaultMenu: ReportPart.defaultMenu
    });
    ReportPart.mixin(PartWithFilterMixin);
    return ReportPart;
});
//# sourceMappingURL=ReportPart.js.map