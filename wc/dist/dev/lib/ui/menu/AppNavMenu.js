/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/menu/Menu", "lib/formatters"], function (require, exports, core, Menu, formatters) {
    "use strict";
    var AppNavMenu = /** @class */ (function (_super) {
        __extends(AppNavMenu, _super);
        /**
         * @class AppNavMenu
         * @extends Menu
         * @param {AreaManager} areaManager
         * @param args
         * @param {...Object} One or more options. {@link Menu.constructor}
         */
        function AppNavMenu(areaManager) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _this = this;
            if (!areaManager) {
                throw new Error("AppNavMenu.ctor: there is no areaManager was specified.");
            }
            areaManager.getAreas().forEach(function (area) {
                area.ensureInitialized();
            });
            var defaultItems = AppNavMenu.createDefaultMenu(areaManager);
            _this = _super.apply(this, [{ items: defaultItems }].concat(args)) || this;
            _this._areaManager = areaManager;
            _this.bindToCommands();
            // navigation menu is radio by default
            _this.radio = core.lang.coalesce(_this.options.radio, true);
            if (_this.radio) {
                _this._areaManager.bind("changeArea", _this._onCurrentStateChanged, _this);
                _this._areaManager.getAreas().forEach(function (area) {
                    area.bind("change:currentState", _this._onCurrentStateChanged, _this);
                });
            }
            return _this;
        }
        AppNavMenu.createDefaultMenu = function (areaManager) {
            var stateMan = areaManager.app.stateManager;
            return areaManager.getAreas()
                .map(function (area) {
                var title = area.title;
                var item = {
                    name: area.name || "default",
                    title: title ? title.toString() : undefined,
                    html: formatters.isHtml(title) ? title.toHTML() : undefined,
                    hideIfDisabled: true,
                    commandName: "NavigateArea",
                    params: {
                        area: area.name
                    },
                    url: stateMan.getAreaUrl(area.name),
                    items: []
                };
                core.lang.forEach(area.states, function (state, stateName) {
                    item.items.push({
                        name: (item.name + "#" + (stateName || "defaultState")),
                        title: state.title || stateName,
                        hideIfDisabled: true,
                        commandName: "NavigateState",
                        params: {
                            area: area.name,
                            state: state.name
                        },
                        url: stateMan.getAreaStateUrl(area.name, stateName)
                    });
                });
                if (item.items.length === 1) {
                    // We won't adding an item for the single only state:
                    // 1. high chance it has meaningless title, 2.
                    item.items = [];
                }
                return item;
            });
        };
        AppNavMenu.prototype.bindToCommands = function () {
            var that = this;
            that.acceptVisitor(function (item) {
                var area;
                if (item.commandName === "NavigateArea") {
                    area = that._areaManager.getArea(item.params["area"]);
                    if (area) {
                        item.command = core.commands.createBoundCommand({
                            execute: that.doNavigateArea.bind(that),
                            canExecute: function () {
                                return !this.hidden();
                            }
                        }, area);
                    }
                }
                else if (item.commandName === "NavigateState") {
                    area = that._areaManager.getArea(item.params["area"]);
                    if (area) {
                        var state = area.getState(item.params["state"]);
                        item.command = core.commands.createBoundCommand({
                            execute: that.doNavigateState.bind(that),
                            canExecute: function () {
                                return !this.hidden();
                            }
                        }, state);
                    }
                }
            });
        };
        AppNavMenu.prototype.doNavigateArea = function (args) {
            var _this = this;
            window.setTimeout(function () {
                _this._areaManager.activateArea(args.area);
            }, 0);
        };
        AppNavMenu.prototype.doNavigateState = function (args) {
            var _this = this;
            window.setTimeout(function () {
                _this._areaManager.activateState(args.area, args.state);
            }, 0);
        };
        AppNavMenu.prototype._onCurrentStateChanged = function () {
            var that = this, area = that._areaManager.getActiveArea(), areaName = area.name || "default", state = area.currentState, rootItem = that.getItem(areaName), miName = areaName + "#" + ((state && state.name) || "defaultState");
            if (rootItem) {
                if (rootItem.items && rootItem.items.length > 0) {
                    that.selectedItem(miName);
                }
                else {
                    that.selectedItem(rootItem.name);
                }
            }
        };
        return AppNavMenu;
    }(Menu));
    core.ui.AppNavMenu = AppNavMenu;
    return AppNavMenu;
});
//# sourceMappingURL=AppNavMenu.js.map