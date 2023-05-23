/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/Part", "lib/ui/menu/Menu", "lib/ui/menu/DropDownMenuPresenter"], function (require, exports, $, core, binding, Part, Menu, DropDownMenuPresenter) {
    "use strict";
    var MenuPresenterBase = /** @class */ (function (_super) {
        __extends(MenuPresenterBase, _super);
        /**
         * @constructs MenuPresenterBase
         * @extends Part
         * @param options
         */
        function MenuPresenterBase(options) {
            var _this = this;
            options = MenuPresenterBase.mixOptions(options, MenuPresenterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            if (_this.options.viewModel) {
                _this.setViewModel(_this.options.viewModel);
            }
            return _this;
        }
        MenuPresenterBase.prototype._bindItemCommand = function (item, itemEl) {
            if (item.command) {
                if (item.hideIfDisabled) {
                    // TODO: хорошо бы также менять поле hidden для item
                    binding.databind(binding.html(itemEl, "visibility"), binding.expr(item.command, item.command.canExecute));
                }
                else {
                    binding.databind(binding.html(itemEl, "enabled"), binding.expr(item.command, item.command.canExecute));
                }
            }
        };
        MenuPresenterBase.prototype.doRender = function (domElement) {
            if (!this.viewModel) {
                throw new Error("MenuPresenter.render: viewModel wasn't set");
            }
            var that = this, options = that.options, items = that.viewModel.items, menuRoot;
            that.radio = options.radio || that.viewModel.radio;
            // NOTE: для radio menu должны были не забыть вызвать bindToCommands, иначе работать не будет
            // Может тут позвать явно: if (that.radio) that.viewModel.bindToCommands() ?
            _super.prototype.doRender.call(this, domElement);
            menuRoot = that._createRootEl(domElement);
            // user root css-class
            if (options.cssClass) {
                menuRoot.addClass(options.cssClass);
            }
            if (options.orientation === "vertical") {
                menuRoot.addClass("x-menu--vertical");
            }
            that._processItems(items, menuRoot);
            if (that.radio) {
                var selectedItem = that.viewModel.selectedItem();
                if (selectedItem) {
                    that._onSelectedItemChanged(that.viewModel, selectedItem);
                }
            }
            that.viewModel.bind("change", that._onViewModelChanged, that);
            that._setupClickHandle(menuRoot);
        };
        MenuPresenterBase.prototype._onViewModelChanged = function (sender, args) {
            if (args && args.prop === "selectedItem") {
                this._onSelectedItemChanged(sender, args.value);
            }
            else {
                this._onMenuChanged();
            }
        };
        MenuPresenterBase.prototype._onMenuChanged = function () {
            this.rerender();
        };
        MenuPresenterBase.prototype._processItems = function (items, menuRoot) {
            var that = this;
            if (items && items.length > 0) {
                if (that.options.reverse) {
                    items = items.slice().reverse();
                }
                items.forEach(function (item) {
                    var itemEl = that._processItem(item);
                    if (itemEl) {
                        itemEl.appendTo(menuRoot);
                    }
                });
            }
        };
        MenuPresenterBase.prototype._processItem = function (item) {
            var that = this, itemEl;
            if (item.hidden) {
                return;
            }
            if (item.name === "divider") {
                itemEl = that._createDivider(item);
            }
            else if ((item.items && item.items.length) || item.getMenu) {
                // submenu (note: it can contain own command)
                itemEl = that._createSubmenuItem(item);
            }
            else if (item.command || item.url) {
                // action item
                itemEl = that._createActionItem(item);
                itemEl = that._createActionItemContainer(itemEl);
            }
            // else: TODO: an item without command or submenu - what is it? info? checkbox?
            if (itemEl) {
                if (item.cssClass) {
                    itemEl.addClass(item.cssClass);
                }
            }
            return itemEl;
        };
        MenuPresenterBase.prototype._createDivider = function (item) {
            return null;
        };
        /**
         * Create an element for action item (item with command), set up bindings
         * @param item
         * @returns {JQuery}
         * @protected
         */
        MenuPresenterBase.prototype._createActionItem = function (item) {
            var that = this;
            var itemPresentation = item.presentation || that.options.itemPresentation;
            var itemHtml = Menu.getItemHtml(item, itemPresentation), itemEl = that._createItemEl(item);
            if (item.command) {
                itemEl.addClass(that.options.classes.itemAction);
            }
            if (that.options.itemWidth) {
                itemEl.css({ width: that.options.itemWidth });
            }
            itemEl
                .prop({
                name: item.name,
                title: item.hint && !that.options.tooltips && itemPresentation !== "icon" ? item.hint : item.title
            })
                .html(itemHtml);
            if (item.hint && that.options.tooltips) {
                itemEl.prop({ title: item.hint });
                $(itemEl).tooltip({ delay: { show: 500 } });
            }
            that._bindItemCommand(item, itemEl);
            if (item.disabled) {
                if (item.hideIfDisabled) {
                    return null;
                }
                itemEl.prop("disabled", "disabled");
                itemEl.addClass("disabled");
            }
            return itemEl;
        };
        /**
         * Wrap element for action item (created by _createActionItem) with an element
         * @param {JQuery} itemEl item element
         * @returns {JQuery} new item element
         * @protected
         */
        MenuPresenterBase.prototype._createActionItemContainer = function (itemEl) {
            return itemEl;
        };
        /**
         * Create element for submenu - an item with sub items
         * @param {Menu.Item} item
         * @returns {JQuery}
         * @protected
         */
        MenuPresenterBase.prototype._createSubmenuItem = function (item) {
            var that = this, btnDropdown = that._createSubmenuContainer(item);
            var itemEl = that._createActionItem(item);
            itemEl.appendTo(btnDropdown);
            if (item.command) {
                // - the item has command AND submenu, it'll consist of two elements: action "button" and dropdown "button"
                // 1. action "button" - already created itemEl (in _createActionItem)
                // 2. dropdown "button"
                itemEl = that._createItemEl(item);
                if (item.hideIfDisabled) {
                    binding.databind(binding.html(itemEl, "visibility"), binding.expr(item.command, item.command.canExecute));
                }
                itemEl.appendTo(btnDropdown);
            }
            itemEl
                .addClass(that.options.classes.submenuItem)
                .append($("<span class='caret' />"));
            var subMenu = item.getMenu ?
                { getMenu: item.getMenu } :
                new Menu({ items: item.items });
            var presenterOptions = {
                viewModel: subMenu,
                dropup: that.options.dropup,
                disableIfEmpty: item.disableIfEmpty
            };
            var dropMenuPresenter = that._createDropDownPresenter(item, presenterOptions);
            dropMenuPresenter.render(itemEl);
            that.registerChild(dropMenuPresenter, { disposeOnUnload: true });
            return btnDropdown;
        };
        MenuPresenterBase.prototype._createSubmenuContainer = function (item) {
            return null;
        };
        MenuPresenterBase.prototype._addItemCommonAttrs = function (item, itemEl) {
            if (item.hidden) {
                itemEl.css("display", "none");
            }
            if (item.isDefaultAction && this.options.classes.itemDefault) {
                itemEl.addClass(this.options.classes.itemDefault);
            }
            if (this.options.itemCssClass) {
                itemEl.addClass(this.options.itemCssClass);
            }
            if (this.options.noFocus || (item.presenterOptions && item.presenterOptions.noFocus)) {
                itemEl.attr("tabIndex", -1);
            }
        };
        MenuPresenterBase.prototype._createDropDownPresenter = function (item, presenterOptions) {
            if (item.presenterOptions) {
                core.lang.extend(presenterOptions, item.presenterOptions);
            }
            return DropDownMenuPresenter.create(presenterOptions);
        };
        MenuPresenterBase.prototype._onSelectedItemChanged = function (sender, name) { };
        /*
         _onSelectedItemChanged: function (sender, name) {
         var that = this;
         $(that.domElement).find("li.active").removeClass('active');
         $(that.domElement).find("li a[name='" + name + "']").parent().addClass("active");
         },
         */
        MenuPresenterBase.prototype._setupClickHandle = function (menuRoot) {
            var that = this;
            if (that.viewModel) {
                menuRoot.find(".x-menu-item-action").buttonClick(function (e) {
                    if (core.html.isExternalClick(e)) {
                        // if user clicks a link with ctrl/shift/alt/wheel then let the browser to process the click
                        return;
                    }
                    var name = this.getAttribute("name");
                    if (name) {
                        var item = that.viewModel.getItem(name);
                        if (item && item.command) {
                            e.preventDefault();
                            that.viewModel.executeItem(item, { $event: e });
                        }
                    }
                });
            }
        };
        MenuPresenterBase.prototype.unload = function (options) {
            var that = this;
            if (that.viewModel) {
                that.viewModel.unbind("change", null, that);
            }
            _super.prototype.unload.call(this, options);
        };
        MenuPresenterBase.defaultOptions = {
            orientation: "horizontal",
            /**
             * @type {"both"|"icon"|"text"}
             */
            itemPresentation: "both",
            /**
             * Add tooltip for items with hint attribute
             * @type {Boolean}
             */
            tooltips: true,
            classes: {
                itemAction: "x-menu-item-action",
                submenuItem: "dropdown-toggle"
            }
        };
        return MenuPresenterBase;
    }(Part));
    MenuPresenterBase.mixin({
        defaultOptions: MenuPresenterBase.defaultOptions
    });
    core.ui.MenuPresenterBase = MenuPresenterBase;
    return MenuPresenterBase;
});
//# sourceMappingURL=MenuPresenterBase.js.map