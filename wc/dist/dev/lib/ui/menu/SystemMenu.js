/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/menu/Menu", "lib/ui/menu/DropDownMenuPresenter", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/SystemMenu.hbs"], function (require, exports, $, core, Menu, DropDownMenuPresenter, View, defaultTemplate) {
    "use strict";
    var lang = core.lang;
    var SystemMenu = /** @class */ (function (_super) {
        __extends(SystemMenu, _super);
        /**
         * @class SystemMenu
         * @extends View
         */
        function SystemMenu(options) {
            var _this = this;
            options = SystemMenu.mixOptions(options, SystemMenu.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.rootItems = new lang.ObservableCollection();
            if (_this.options.items && _this.options.items.length) {
                lang.forEach(_this.options.items, function (item) {
                    _this.addRootItem(item);
                });
            }
            return _this;
        }
        /**
         * Add (or update) a new (existing) item.
         * @param {Object} itemMd
         * @param {String} itemMd.name
         * @param {Number} [itemMd.order]
         * @param {String} [itemMd.title]
         * @param {String} [itemMd.html]
         * @param {String} [itemMd.badge]
         * @param {String} [itemMd.icon]
         * @param {Command} [itemMd.command]
         * @param {Function} [itemMd.getMenu]
         * @param {Array} [itemMd.items]
         * @param {Function} [itemMd.getPart]
         * @return {Observable} Observable-object created from json metadata
         */
        SystemMenu.prototype.addRootItem = function (itemMd) {
            var item = this.getRootItem(itemMd.name);
            if (item) {
                lang.forEach(itemMd, function (value, name) {
                    lang.set(item, name, value);
                });
            }
            else {
                item = new SystemMenu.RootItem(itemMd);
                this.rootItems.add(item);
            }
            return item;
        };
        /**
         * Return item by name
         * @param {String} name
         * @returns {Observable} Root item descriptor
         */
        SystemMenu.prototype.getRootItem = function (name) {
            var items = this.rootItems.all();
            return lang.find(items, function (i) {
                if (i.name === name) {
                    return i;
                }
            });
        };
        SystemMenu.prototype.doRender = function (domElement) {
            var that = this;
            that.rootItems.reset(lang.sort(that.rootItems.all(), function (i1, i2) {
                return lang.compare(i1.order() || 0, i2.order() || 0);
            }));
            _super.prototype.doRender.call(this, domElement);
            var $domElement = that.$domElement;
            $domElement.addClass("x-sys-menu");
            $domElement.find("a").each(function () {
                var linkEl = $(this), name = linkEl.attr("data-item-name"), submenuModel, submenuPresenter, itemContainer = linkEl.parent(), item = that.getRootItem(name);
                // root menu item can be a menu or something else
                submenuModel = item.getMenu ?
                    { getMenu: item.getMenu } :
                    item.items ?
                        new Menu({ items: item.items }) :
                        undefined;
                if (submenuModel) {
                    submenuPresenter = DropDownMenuPresenter.create({ viewModel: submenuModel });
                    submenuPresenter.render(itemContainer);
                }
                else if (item.getPart && typeof item.getPart === "function") {
                    linkEl.mousedown(function (e) {
                        if (itemContainer.hasClass("open")) {
                            // prevent closing popup on mouse down - it will be explicitly closed in _onShow
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }).buttonClick(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that._onShow($(this), item, itemContainer);
                    });
                }
            });
        };
        SystemMenu.prototype._onShow = function (link, rootItem, itemContainer) {
            var that = this, isActive = itemContainer.hasClass("open"), part, $part;
            if (!rootItem || !rootItem.getPart) {
                return;
            }
            that.$domElement.find("li.open").removeClass("open");
            if (rootItem._part) {
                rootItem._part.dispose();
                rootItem._part = undefined;
            }
            if (!isActive) {
                rootItem._part = part = rootItem.getPart();
                part.render(that.$domElement);
                $part = part.$domElement;
                if (part.bind) {
                    part.bind("unload", function () {
                        itemContainer.removeClass("open");
                        rootItem._part = undefined;
                    });
                }
                itemContainer.addClass("open");
                if (that.options.openItemCssClass && $part) {
                    $part.addClass(that.options.openItemCssClass);
                }
                // ограничиваем высоту popup экраном, чтобы юзер мог проскроллировать его:
                if ($part) {
                    $part.css("max-height", core.html.getDisplayViewport().height - $part.offset().top + core.html.$window.scrollTop());
                }
            }
        };
        /** Default options
         * @type {Object}
         * @property {Function|String} template Template
         * @property {String} openItemCssClass CSS-class for currently opened item's element
         * @property {Array} items Array of menu items descriptions
         */
        SystemMenu.defaultOptions = {
            template: defaultTemplate,
            //retargetElementSelector: ".x-app-navbar", //jQ-selector of parent element for retargeting (moving item's popup)
            //retargetScreenWidth: 767, //Screen width in pixel when items' popup will be retargeted
            openItemCssClass: undefined,
            items: undefined
        };
        return SystemMenu;
    }(View));
    (function (SystemMenu) {
        // TODO: RootItem должен быть общим для Menu - возможно отдельной реализации BoundMenu
        var RootItem = /** @class */ (function (_super) {
            __extends(RootItem, _super);
            /**
             * @class RootItem
             * @param itemMd
             * @param {String} itemMd.name
             * @param {Number} [itemMd.order]
             * @param {Boolean} [itemMd.hidden]
             * @param {String} itemMd.title
             * @param {String} [itemMd.html]
             * @param {String} [itemMd.badge]
             * @param {String} [itemMd.icon]
             * @param {Command} [itemMd.command]
             * @param {Function} [itemMd.getMenu]
             * @param {Array} [itemMd.items]
             * @param {Function} [itemMd.getPart]
             */
            function RootItem(itemMd) {
                var _this = _super.call(this) || this;
                var that = _this;
                that.name = itemMd.name;
                that.title(itemMd.title);
                that.html(itemMd.html);
                that.badge(itemMd.badge);
                that.icon(itemMd.icon);
                that.order(itemMd.order);
                that.hidden(itemMd.hidden);
                that.command(itemMd.command);
                that.getMenu = itemMd.getMenu;
                that.getPart = itemMd.getPart;
                that.items = itemMd.items;
                return _this;
            }
            RootItem.prototype.getHtml = function () {
                var item = this, html = item.html(), icon;
                if (!html) {
                    // no html explicitly specify, construct icon / title / badge
                    icon = item.icon() || item.name;
                    if (core.ui.iconProvider) {
                        icon = core.ui.iconProvider.getIcon(icon, { alone: true }) || "";
                    }
                    if (icon) {
                        html = icon;
                    }
                    else {
                        html = lang.encodeHtml(item.title() || item.name);
                    }
                }
                return html;
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "title");
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "html");
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "badge");
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "icon");
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "order");
            __decorate([
                lang.decorators.observableAccessor({ init: false })
            ], RootItem.prototype, "hidden");
            __decorate([
                lang.decorators.observableAccessor()
            ], RootItem.prototype, "command");
            return RootItem;
        }(lang.Observable));
        SystemMenu.RootItem = RootItem;
    })(SystemMenu || (SystemMenu = {}));
    core.ui.SystemMenu = SystemMenu;
    return SystemMenu;
});
//# sourceMappingURL=SystemMenu.js.map