/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/menu/Menu"], function (require, exports, core, Menu) {
    "use strict";
    var AreaStatesMenu = /** @class */ (function (_super) {
        __extends(AreaStatesMenu, _super);
        /**
         * Menu for area's states. Accepts an area instance in costructor and generates single level menu
         * with items for each the area's state.
         * @constructs AreaStatesMenu
         * @extends Menu
         * @option {Area} area Area with states
         */
        function AreaStatesMenu(area, additionalMenu) {
            var _this = this;
            var stateMan = area.areaManager.app.stateManager, 
            // NOTE: use single command for all items and use its arguments
            command = core.createCommand({
                execute: function (args) {
                    area.activateState(args.stateName);
                }
            }), menuItems = [];
            core.lang.forEach(area.states, function (state, stateName) {
                menuItems.push({
                    name: stateName,
                    title: state.title || stateName,
                    command: command,
                    params: { stateName: stateName },
                    hidden: state.hidden(),
                    url: stateMan.getAreaStateUrl(area.name, stateName)
                });
            });
            // NOTE: we're setting radio=false because we'll track selectedItem manually
            var menuMd = { items: menuItems, radio: false };
            if (additionalMenu) {
                menuMd = Menu.merge(menuMd, additionalMenu);
            }
            _this = _super.call(this, menuMd) || this;
            _this._disposes = [];
            core.lang.forEach(area.states, function (state, stateName) {
                _this._subscribe(state, "change:hidden", function (sender, val) {
                    _this.getItem(stateName).hidden = val;
                    _this.trigger("change");
                });
            });
            _this.bindToCommands();
            if (area.currentState) {
                _this.selectedItem(area.currentState.name);
            }
            _this._subscribe(area, "change:currentState", function (sender, value) {
                _this.selectedItem(value);
            });
            return _this;
        }
        AreaStatesMenu.prototype.dispose = function () {
            for (var _i = 0, _a = this._disposes; _i < _a.length; _i++) {
                var d = _a[_i];
                d.dispose();
            }
            this._disposes = undefined;
            _super.prototype.dispose.call(this);
        };
        AreaStatesMenu.prototype._subscribe = function (obj, eventName, callback, context) {
            var disposable = obj.subscribe(eventName, callback, context);
            this._disposes.push(disposable);
        };
        return AreaStatesMenu;
    }(Menu));
    core.ui.AreaStatesMenu = AreaStatesMenu;
    return AreaStatesMenu;
});
//# sourceMappingURL=AreaStatesMenu.js.map