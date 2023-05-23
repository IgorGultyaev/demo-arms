/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/MenuPresenterBase", "xcss!lib/ui/styles/menuNav"], function (require, exports, $, core, MenuPresenterBase) {
    "use strict";
    var MenuNavPresenter = /** @class */ (function (_super) {
        __extends(MenuNavPresenter, _super);
        /**
         * Menu presenter for navigation menus (based on links)
         * @constructs MenuNavPresenter
         * @extends MenuPresenterBase
         * @param options
         */
        function MenuNavPresenter(options) {
            var _this = this;
            options = MenuNavPresenter.mixOptions(options, MenuNavPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        MenuNavPresenter.prototype._createRootEl = function (domElement) {
            return $("<ul class='" + this.options.classes.root + "'></ul>").appendTo(domElement);
        };
        MenuNavPresenter.prototype._createItemEl = function (item) {
            var anchor = $("<a class='" + this.options.classes.item + "' href='" + (item.url || "#") + "'></a>");
            this._addItemCommonAttrs(item, anchor);
            return anchor;
        };
        MenuNavPresenter.prototype._createActionItemContainer = function (itemEl) {
            var el = $("<li></li>");
            el.append(itemEl);
            return el;
        };
        MenuNavPresenter.prototype._createSubmenuContainer = function (item) {
            return $("<li class='" + this.options.classes.submenuContainer + "'></li>");
        };
        MenuNavPresenter.prototype._setupClickHandle = function (menuRoot) {
            var that = this;
            menuRoot.find("li > a").buttonClick(function (e) {
                if (core.html.isExternalClick(e)) {
                    // if user clicks a link with ctrl/shift/alt/wheel then let the browser to process the click
                    return;
                }
                /*
                let $anchor = $(e.currentTarget);
                if ($anchor.attr("href") && $anchor.attr("target") === "_blank") {
                    return;
                }*/
                var name = this.getAttribute("name");
                if (name) {
                    var item = that.viewModel.getItem(name);
                    if (item && item.command) {
                        e.preventDefault();
                        that.viewModel.executeItem(item, { $event: e });
                    }
                }
                //that.viewModel.execute(name, { $event: e });
            });
        };
        MenuNavPresenter.prototype._onSelectedItemChanged = function (sender, name) {
            var $domElement = this.$domElement;
            $domElement.find("a.active").removeClass("active");
            $domElement.find("a[name='" + name + "']").addClass("active");
        };
        MenuNavPresenter.defaultOptions = {
            classes: {
                root: "x-menu-nav",
                item: "x-menu-item",
                itemDefault: "x-menu-item-default",
                submenuContainer: "x-menu-item-dropdown"
            }
        };
        return MenuNavPresenter;
    }(MenuPresenterBase));
    core.ui.MenuNavPresenter = MenuNavPresenter;
    return MenuNavPresenter;
});
//# sourceMappingURL=MenuNavPresenter.js.map