/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/MenuPresenterBase", "xcss!lib/ui/styles/menu"], function (require, exports, $, core, MenuPresenterBase) {
    "use strict";
    var MenuPresenter = /** @class */ (function (_super) {
        __extends(MenuPresenter, _super);
        /**
         * Menu presenter for action menus (based on buttons)
         * @constructs MenuPresenter
         * @extends MenuPresenterBase
         * @param options See MenuPresenterBase.prototype.defaultOptions
         * @param {Object} options.viewModel
         */
        function MenuPresenter(options) {
            var _this = this;
            options = MenuPresenterBase.mixOptions(options, MenuPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        MenuPresenter.prototype._createRootEl = function (domElement) {
            return $("<div class='" + this.options.classes.root + "'>").appendTo(domElement);
        };
        MenuPresenter.prototype._createSubmenuContainer = function (item) {
            return $("<div class='" + this.options.classes.submenuContainer + "'></div>");
        };
        MenuPresenter.prototype._createItemEl = function (item) {
            var btn = $("<button type='button' class='" + this.options.classes.item + "' />");
            this._addItemCommonAttrs(item, btn);
            btn.button();
            return btn;
        };
        MenuPresenter.defaultOptions = {
            classes: {
                root: "x-menu",
                item: "x-menu-item",
                itemDefault: "x-menu-item-default",
                submenuContainer: "x-menu-item-dropdown"
            }
        };
        return MenuPresenter;
    }(MenuPresenterBase));
    core.ui.MenuPresenter = MenuPresenter;
    return MenuPresenter;
});
//# sourceMappingURL=MenuPresenter.js.map