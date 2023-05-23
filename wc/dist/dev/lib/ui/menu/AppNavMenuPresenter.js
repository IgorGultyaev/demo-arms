/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/MenuPresenterBase", "xcss!lib/ui/styles/menuNav"], function (require, exports, $, core, MenuPresenterBase) {
    "use strict";
    var AppNavMenuPresenter = /** @class */ (function (_super) {
        __extends(AppNavMenuPresenter, _super);
        /**
         * Application navigation toolbar presenter
         * @class AppNavMenuPresenter
         * @extends MenuPresenterBase
         * @param {Object} options
         */
        function AppNavMenuPresenter(options) {
            var _this = this;
            options = AppNavMenuPresenter.mixOptions(options, AppNavMenuPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        AppNavMenuPresenter.prototype._processItems = function (items, menuRoot) {
            if (this.options.hideSingle) {
                if (items.length <= 1) {
                    return;
                }
                var visibleItems = items.filter(function (item) { return !item.hidden && item.command &&
                    (!item.hideIfDisabled || core.lang.unlazy(item.command).canExecute()); });
                if (visibleItems.length <= 1) {
                    return;
                }
            }
            _super.prototype._processItems.call(this, items, menuRoot);
        };
        AppNavMenuPresenter.prototype._processItem = function (item) {
            var that = this, itemEl;
            if (item.hidden) {
                return;
            }
            if (item.name === "divider") {
                itemEl = that._createDivider(item);
            }
            else if (item.command) {
                itemEl = that._createActionItem(item);
                itemEl = that._createActionItemContainer(itemEl);
            }
            return itemEl;
        };
        AppNavMenuPresenter.prototype._createRootEl = function (domElement) {
            var autoScroll = this.options.autoScroll;
            domElement.addClass("x-app-navmenu");
            if (autoScroll) {
                $("<a href='#' class='x-icon x-icon-angle-bracket-left x-app-navmenu-btn hidden'></a>").appendTo(domElement);
            }
            var $menuContainer = $("<div class='x-app-navmenu-container'></div>")
                .width(this.options.autoFill ? 0 : "auto") // initially set width = 0, it will be calculated while reflow
                .appendTo(domElement);
            var $root = $("<ul class='x-app-navmenu-menu x-app-navbar-nav'></ul>")
                .appendTo($menuContainer);
            if (autoScroll) {
                $("<a href='#' class='x-icon x-icon-angle-bracket-right x-app-navmenu-btn hidden'></a>").appendTo(domElement);
            }
            return $root;
        };
        AppNavMenuPresenter.prototype._createActionItemContainer = function (anchor) {
            var el = $("<li></li>");
            el.append(anchor);
            return el;
        };
        AppNavMenuPresenter.prototype._createItemEl = function (item) {
            var anchor = $("<a class='x-menu-item' href='" + (item.url || "#") + "'></a>");
            if (item.hidden) {
                anchor.css("display", "none");
            }
            if (item.isDefaultAction) {
                anchor.addClass("x-menu-item-default");
            }
            if (this.options.itemCssClass) {
                anchor.toggleClass(this.options.itemCssClass);
            }
            var noFocus = this.options.noFocus ||
                item.presenterOptions && item.presenterOptions.noFocus ||
                item.noFocus;
            if (noFocus) {
                anchor.attr("tabIndex", -1);
            }
            return anchor;
        };
        AppNavMenuPresenter.prototype._onSelectedItemChanged = function (sender, name) {
            var $domElement = this.$domElement;
            name = name.split("#")[0];
            $domElement.find("a.active").removeClass("active");
            $domElement.find("a[name='" + name + "']").addClass("active");
        };
        AppNavMenuPresenter.prototype.beforeRender = function () { };
        AppNavMenuPresenter.prototype.afterRender = function () {
            var that = this;
            if (!that.viewModel || that.viewModel.isEmpty()) {
                that.renderStatus("waiting");
            }
            else {
                if (that.options.autoScroll) {
                    that._initScrollButtons();
                }
                if (that.options.autoFill) {
                    if (!that._resizeSubscribed) {
                        that._resizeSubscribed = true;
                        core.html.windowResize.bind(that._doReflow, that);
                    }
                    that.reflow();
                }
                that.renderStatus("ready");
            }
        };
        AppNavMenuPresenter.prototype._initScrollButtons = function () {
            var that = this, $me = that.$domElement, step = 50, $buttons = $me.find(".x-app-navmenu-btn");
            if ($me.length === 0)
                return;
            if (!$me[0].id) {
                $me[0].id = core.lang.uuid("q");
            }
            // expect to find two buttons (left/right)
            if ($buttons.length === 2) {
                $($buttons[0]).click(function (e) {
                    e.preventDefault();
                    that.scroll(-step);
                });
                $($buttons[1]).click(function (e) {
                    e.preventDefault();
                    that.scroll(step);
                });
            }
        };
        AppNavMenuPresenter.prototype._doReflow = function () {
            var that = this;
            if (!that.domElement || !that.options.autoFill) {
                return;
            }
            var $me = that.$domElement, $parent = $me.parent(), autoScroll = that.options.autoScroll, vp = core.html.getDisplayViewport(), myId = $me[0].id, $menu = $me.find(".x-app-navmenu-menu"), $container = $me.find(".x-app-navmenu-container");
            // compute widths of all elements (except the menu's one) of the same parent
            var widthOthers = 0;
            $parent.children().each(function () {
                if (this.id !== myId) {
                    widthOthers += $(this).outerWidth(true) + 1;
                }
            });
            // margin + padding
            var margin = $me.outerWidth(true) - $me.width();
            // compute space we have for the menu
            var width = vp.width - widthOthers - margin - core.platform.measureScrollbar();
            // compute actual width of the menu (what we need)
            var innerWidth = 0;
            $menu.children().each(function () {
                innerWidth += $(this).outerWidth(true) + 1;
            });
            if (innerWidth > width) {
                // we have less space than needed
                if (autoScroll) {
                    var $buttons = $me.find(".x-app-navmenu-btn");
                    // reduce the width of container by the width of scroll buttons
                    width -= $buttons.length * $buttons.outerWidth(true);
                    $container.width(width);
                    $buttons.removeClass("hidden");
                }
                else {
                    $container.width(width);
                }
            }
            else {
                // we have enough space
                $container.css("width", "auto");
                $menu.css("width", "auto");
                if (autoScroll) {
                    var $buttons = $me.find(".x-app-navmenu-btn");
                    $buttons.addClass("hidden");
                }
            }
            core.html.notifyDOMChanged();
        };
        AppNavMenuPresenter.prototype.scroll = function (step) {
            var $el = this.$domElement.find(".x-app-navmenu-container"), left = $el.scrollLeft() + step;
            left = left < 0 ? 0 : left;
            $el.scrollLeft(left);
        };
        AppNavMenuPresenter.prototype.unload = function (options) {
            var that = this;
            core.html.windowResize.unbind(that._doReflow, that);
            that._resizeSubscribed = false;
            _super.prototype.unload.call(this, options);
        };
        AppNavMenuPresenter.defaultOptions = {
            autoFill: true,
            autoScroll: true,
            tooltips: false,
            radio: true,
            hideSingle: true
        };
        return AppNavMenuPresenter;
    }(MenuPresenterBase));
    AppNavMenuPresenter.mixin(/** @lends AppNavMenuPresenter.prototype */ {
        defaultOptions: AppNavMenuPresenter.defaultOptions,
        reflow: core.lang.debounce("_doReflow", 0, true)
    });
    core.ui.AppNavMenuPresenter = AppNavMenuPresenter;
    return AppNavMenuPresenter;
});
//# sourceMappingURL=AppNavMenuPresenter.js.map