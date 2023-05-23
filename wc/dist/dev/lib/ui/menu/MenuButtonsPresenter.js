/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/MenuPresenterBase", "xcss!lib/ui/styles/menuButtons"], function (require, exports, $, core, MenuPresenterBase) {
    "use strict";
    var MenuButtonsPresenter = /** @class */ (function (_super) {
        __extends(MenuButtonsPresenter, _super);
        /**
         * Menu presenter based on Bootstrap buttons (.btn, .btn-group)
         * @constructs MenuButtonsPresenter
         * @extends MenuPresenterBase
         */
        function MenuButtonsPresenter(options) {
            var _this = this;
            options = MenuButtonsPresenter.mixOptions(options, MenuButtonsPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        MenuButtonsPresenter.prototype._createRootEl = function (domElement) {
            var options = this.options, rootEl;
            if (options.inline) {
                rootEl = domElement;
                this.options.classes.rootInline && rootEl.addClass(this.options.classes.rootInline);
            }
            else {
                rootEl = $("<div></div>").appendTo(domElement);
            }
            this.options.classes.root && rootEl.addClass(this.options.classes.root);
            if (!options.ungrouped) {
                rootEl.addClass(options.orientation === "vertical" ? "btn-group-vertical" : "btn-group");
            }
            if (this.radio) {
                rootEl.attr("data-toggle", "buttons");
                this.options.classes.rootRadio && rootEl.addClass(this.options.classes.rootRadio);
            }
            return rootEl;
        };
        MenuButtonsPresenter.prototype._createSubmenuContainer = function (item) {
            return $("<div class='" + this.options.classes.submenuContainer + "'></div>");
        };
        MenuButtonsPresenter.prototype._createItemEl = function (item) {
            var btn = $("<button type='button' class='" + this.options.classes.item + "' />");
            this._addItemCommonAttrs(item, btn);
            btn.button();
            return btn;
        };
        MenuButtonsPresenter.prototype._setupClickHandle = function (menuRoot) {
            var that = this;
            if (that.viewModel) {
                menuRoot.find("button").not(".dropdown-toggle").buttonClick(function (e) {
                    e.preventDefault();
                    var name = this.getAttribute("name");
                    var args = { $event: e };
                    that.viewModel.execute(name, args);
                });
            }
        };
        MenuButtonsPresenter.prototype._onSelectedItemChanged = function (sender, name) {
            var $domElement = this.$domElement;
            $domElement.find(".btn.active").removeClass("active");
            if (name) {
                var btn = $domElement.find(".btn[name='" + name + "']");
                // NOTE: да, можно использовать методы BS-плагина (см. http://getbootstrap.com/javascript/#buttons-checkbox-radio),
                // но для этого должна быть другая разметка (input type=radio):
                // btn.button("toggle");
                // Необходимость этого неясна, учитывая, что _createItemEl уже не сможет вернуть один элемент кнопки (их два: label/input)
                if (btn.length)
                    btn.addClass("active");
            }
        };
        MenuButtonsPresenter.prototype.focusItem = function (name) {
            this.$domElement.find("button[name='" + name + "']").focus();
        };
        MenuButtonsPresenter.defaultOptions = {
            ungrouped: false,
            inline: false,
            classes: {
                root: "x-menu-buttons",
                rootInline: "x-menu-buttons-inline",
                rootRadio: "x-menu-buttons-radio",
                item: "btn btn-default",
                itemDefault: "btn-primary",
                submenuContainer: "btn-group"
            }
        };
        return MenuButtonsPresenter;
    }(MenuPresenterBase));
    MenuButtonsPresenter.mixin({
        defaultOptions: MenuButtonsPresenter.defaultOptions
    });
    core.ui.MenuButtonsPresenter = MenuButtonsPresenter;
    return MenuButtonsPresenter;
});
//# sourceMappingURL=MenuButtonsPresenter.js.map