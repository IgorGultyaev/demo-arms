/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/MenuPresenterBase", "xcss!lib/ui/styles/menuNav"], function (require, exports, $, core, MenuPresenterBase) {
    "use strict";
    var MenuNavGridPresenter = /** @class */ (function (_super) {
        __extends(MenuNavGridPresenter, _super);
        /**
         * Grid menu presenter for navigation menus
         * @constructs MenuNavGridPresenter
         * @extends MenuPresenterBase
         * @param {Object} options
         */
        function MenuNavGridPresenter(options) {
            var _this = this;
            options = MenuNavGridPresenter.mixOptions(options, MenuNavGridPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        MenuNavGridPresenter.prototype._createRootEl = function (domElement) {
            return $("<tbody></tbody>").appendTo($("<table class='" + this.options.classes.root + "'></table>").appendTo(domElement));
        };
        MenuNavGridPresenter.prototype._createItemEl = function (item) {
            var anchor = $("<a href='" + (item.url || "#") + "'></a>");
            if (this.options.itemCssClass) {
                anchor.toggleClass(this.options.itemCssClass);
            }
            return anchor;
        };
        MenuNavGridPresenter.prototype._processItems = function (items, menuRoot) {
            var that = this, cnt = 0;
            if (items && items.length > 0) {
                var menuRowContainer_1;
                items.forEach(function (item) {
                    if (cnt % that.options.columns === 0) {
                        menuRowContainer_1 = $("<tr></tr>").appendTo(menuRoot);
                    }
                    var itemElm = that._processItem(item);
                    if (itemElm) {
                        cnt++;
                        if (item.cssClass) {
                            itemElm.addClass(item.cssClass);
                        }
                        itemElm.appendTo(menuRowContainer_1);
                    }
                });
            }
        };
        MenuNavGridPresenter.prototype._processItem = function (item) {
            var that = this;
            if (item.hidden) {
                return;
            }
            if (item.command) {
                if (!core.lang.unlazy(item.command).canExecute()) {
                    return;
                }
            }
            var itemCellContainer = $("<td class='" + that.options.classes.cell + "' />");
            var itemContainer = $("<div class='" + that.options.classes.section + "' />").appendTo(itemCellContainer);
            if (!that.options.hideHeaders) {
                var itemEl = that._createActionItem(item);
                itemEl = $("<h4></h4>").append(itemEl);
                itemContainer.append(itemEl);
            }
            if ((item.items && item.items.length) || item.getMenu) {
                var subItemsContainer = that._createSubItems(item);
                if (subItemsContainer) {
                    if (!that.options.hideHeaders) {
                        itemContainer.append($("<hr/>"));
                    }
                    subItemsContainer.appendTo(itemContainer);
                }
            }
            return itemCellContainer;
        };
        MenuNavGridPresenter.prototype._createSubItems = function (item) {
            var that = this, subItemsContainer = $("<ul/>"), subMenuItems = item.getMenu ?
                item.getMenu().items :
                item.items;
            if (subMenuItems && subMenuItems.length > 0) {
                subMenuItems.forEach(function (item) {
                    if (item.hidden) {
                        return;
                    }
                    if (item.command) {
                        if (!core.lang.unlazy(item.command).canExecute()) {
                            return;
                        }
                    }
                    var itemEl = that._createActionItem(item);
                    if (itemEl) {
                        if (item.cssClass) {
                            itemEl.addClass(item.cssClass);
                        }
                        itemEl = $("<li></li>").append(itemEl);
                        itemEl.appendTo(subItemsContainer);
                    }
                });
            }
            return subItemsContainer;
        };
        MenuNavGridPresenter.prototype._onSelectedItemChanged = function (sender, name) {
            var that = this;
            var $sel = that.$domElement;
            $sel.find("a.active").removeClass("active");
            $sel.find(".x-app-nav-cell.active").removeClass("active");
            $sel.find("a[name='" + name + "']").addClass("active").parents(".x-app-nav-cell").addClass("active");
        };
        /**
         * @type {Object}
         */
        MenuNavGridPresenter.defaultOptions = {
            /**
             * Columns number. if you change this options - change style .x-app-nav-cell (width)
             * @type {Number}
             */
            columns: 3,
            classes: {
                root: "x-app-nav-grid",
                cell: "x-app-nav-cell",
                section: "x-app-nav-section"
            }
        };
        return MenuNavGridPresenter;
    }(MenuPresenterBase));
    MenuNavGridPresenter.mixin({
        defaultOptions: MenuNavGridPresenter.defaultOptions
    });
    core.ui.MenuNavGridPresenter = MenuNavGridPresenter;
    return MenuNavGridPresenter;
});
//# sourceMappingURL=MenuNavGridPresenter.js.map