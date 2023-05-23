/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Part", "lib/ui/menu/Menu", "lib/binding", "i18n!lib/nls/resources"], function (require, exports, $, core, Part, Menu, binding, resources) {
    "use strict";
    var lang = core.lang;
    var DropDownMenuPresenter = /** @class */ (function (_super) {
        __extends(DropDownMenuPresenter, _super);
        /**
         * @class DropDownMenuPresenter
         * @extends Part
         */
        function DropDownMenuPresenter(options) {
            var _this = this;
            if (!core.lang.isPlainObject(options)) {
                options = { viewModel: options };
            }
            options = DropDownMenuPresenter.mixOptions(options, DropDownMenuPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            if (options && options.viewModel) {
                _this.setViewModel(options.viewModel);
            }
            return _this;
        }
        DropDownMenuPresenter.prototype.setViewModel = function (model) {
            var that = this;
            if (lang.Observable.isObservable(that.viewModel)) {
                that.viewModel.unbind("change", null, that);
            }
            _super.prototype.setViewModel.call(this, model);
            if (lang.Observable.isObservable(that.viewModel)) {
                that.viewModel.bind("change", that._onMenuChanged, that);
            }
            if (that.domElement) {
                that.rerender();
            }
        };
        DropDownMenuPresenter.prototype.dispose = function (options) {
            var that = this;
            if (lang.Observable.isObservable(that.viewModel)) {
                that.viewModel.unbind("change", null, that);
            }
            _super.prototype.dispose.call(this, options);
        };
        DropDownMenuPresenter.prototype.doRender = function (domElement) {
            var that = this, container = $(domElement);
            _super.prototype.doRender.call(this, domElement);
            if (!container.hasClass("dropdown-toggle")) {
                var anchorInContainer = container.find(".dropdown-toggle");
                that.link = anchorInContainer.length ? anchorInContainer :
                    $("<a class='btn btn-default dropdown-toggle' href='#'>"
                        + (core.ui.iconProvider && that.options.toggleButtonIcon ? core.ui.iconProvider.getIcon(that.options.toggleButtonIcon) : "")
                        + "</a>")
                        .appendTo(container);
            }
            else {
                // the supplied element is a link itself, so container will its parent
                that.link = container;
                container = container.parent();
            }
            container.addClass("dropdown");
            if (that.options.dropup) {
                container.addClass("dropup");
            }
            // user root css-class
            if (that.options.cssClassContainer) {
                container.addClass(that.options.cssClassContainer);
            }
            that.link
                .attr("data-toggle", "dropdown") // support Bootstrap Dropdown
                .dropdown() // init Bootstrap Dropdown
                .buttonClick(function () {
                if ($(this.parentElement).hasClass("open")) {
                    that.onShow(); // reinitialize menu on opening
                }
            });
            that.menuEl = $("<ul class='dropdown-menu' role='menu'>").appendTo(container);
            if (that.options.cssClass) {
                container.addClass(that.options.cssClass);
            }
            if (that.options.noFocus) {
                that.link.prop("tabIndex", -1);
            }
            that.menuEl.on("click", "a", function (e) {
                var $this = $(this);
                var $item = $this.parent(), name = $item.data("item-name"), args = $item.data("command-params") || {};
                if (name && that.viewModel) {
                    args.$event = e;
                    e.preventDefault();
                    if (that.viewModel.onItemExecuting) {
                        that.viewModel.onItemExecuting.call(that, args);
                    }
                    if (!args.cancel) {
                        that.viewModel.execute(name, args);
                    }
                }
                else if (!name && $this.attr("href") === "#") {
                    return false;
                }
            });
            container.keydown(function (e) {
                var isActive = container.hasClass("open");
                switch (e.which) {
                    case core.html.keyCode.TAB:
                        // close on Tab
                        if (isActive) {
                            that.link.dropdown("toggle");
                        }
                        break;
                }
            });
            // radio?
            // reverse?
            that._bindToggleLinkToItems();
        };
        DropDownMenuPresenter.prototype._bindToggleLinkToItems = function () {
            var that = this;
            //if not items list is dynamic
            if (that.link && that.options.disableIfEmpty && that.viewModel && !that.viewModel.getMenu) {
                // NOTE: binding should be auto-disposed when DOM element is removed
                binding.databind(binding.html(that.link, "enabled"), binding.expr(that.viewModel, function () {
                    var menu = this;
                    return menu.items.some(function (item, i) {
                        var cmd = item.command;
                        if (!cmd) {
                            return false;
                        }
                        // simulate getting command as an observable property
                        menu.trigger("get", menu, { prop: "command" + i, value: cmd });
                        return cmd.canExecute();
                    });
                }));
            }
        };
        /**
         * On opening dropdown menu (toggle button/link was clicked)
         */
        DropDownMenuPresenter.prototype.onShow = function () {
            var that = this;
            if (that.viewModel.getMenu) {
                var menuOrTask = that.viewModel.getMenu();
                if (core.lang.isPromise(menuOrTask) && menuOrTask.state() === "pending") {
                    that._renderWaitStub(that.menuEl);
                }
                core.lang.when(menuOrTask).then(function (newModel) {
                    var getMenuFn;
                    if (newModel) {
                        getMenuFn = newModel.getMenu || that.viewModel.getMenu;
                        if (lang.Observable.isObservable(that.viewModel)) {
                            that.viewModel.unbind("change", null, that);
                        }
                        that.viewModel = Menu.create(newModel);
                        that.viewModel.getMenu = getMenuFn;
                        if (lang.Observable.isObservable(that.viewModel)) {
                            that.viewModel.bind("change", that._onMenuChanged, that);
                        }
                    }
                    if (!newModel || !that.viewModel.items) {
                        that.viewModel.items = [];
                    }
                    that._renderItems(that.viewModel.items, that.menuEl);
                });
            }
            else {
                that._renderItems(that.viewModel.items, that.menuEl);
            }
        };
        DropDownMenuPresenter.prototype.unload = function (options) {
            this.clear();
            _super.prototype.unload.call(this, options);
        };
        DropDownMenuPresenter.prototype.clear = function () {
            var that = this, container = that.menuEl.parent();
            if (container && container.hasClass("open")) {
                that.link.dropdown("toggle");
            }
            this.menuEl.empty();
        };
        DropDownMenuPresenter.prototype.toggle = function () {
            this.link && this.link.click();
        };
        DropDownMenuPresenter.prototype._onMenuChanged = function () {
            this.clear();
        };
        DropDownMenuPresenter.prototype._renderItems = function (items, $menu) {
            var that = this, count = 0, countIcon = 0;
            $menu.empty();
            if (!items) {
                return;
            }
            items.forEach(function (item) {
                var $item = that._renderItem(item);
                if ($item) {
                    $item.appendTo($menu);
                    count += 1;
                    if ($item.data("icon") === "1") {
                        countIcon += 1;
                    }
                }
            });
            // hide empty menu
            if (count === 0) {
                $menu.addClass("-empty");
            }
            else {
                $menu.removeClass("-empty");
                // если всех элементы presentation: "icon", то надо удалить min-width: 160px
                if (countIcon === count) {
                    that.menuEl.css("min-width", "initial");
                }
            }
        };
        DropDownMenuPresenter.prototype._renderItem = function (item) {
            var that = this;
            var $item;
            if (item.name === "divider" && !item.hidden) {
                $item = that._createDivider(item);
            }
            else if (item.name === "header" && !item.hidden) {
                $item = that._createHeader(item);
            }
            else if (Menu.isItemVisible(item)) {
                $item = that._createItemEl(item);
                $item.data("icon", (item.presentation || this.options.itemPresentation) === "icon" ? "1" : "0");
                // NOTE: хак, чтобы не вызывать canExecute 2-ой раз:
                // если заданы hideIfDisabled и command, при этом isItemVisible==true (выше),
                // то это означает, что canExecute команды точно вернул true (см. isItemVisible)
                var enabled = item.hideIfDisabled && item.command || Menu.isItemEnabled(item);
                if (!enabled) {
                    $item.addClass("disabled");
                }
                else {
                    if (item.params) {
                        $item.data("command-params", item.params);
                    }
                    if (item.hint && that.options.tooltips) {
                        $item.prop({ title: item.hint });
                        $item.tooltip({ delay: { show: 500 } });
                    }
                    if (item.items) {
                        this._renderSubItems(item.items, $item);
                    }
                }
            }
            if ($item) {
                if (item.cssClass) {
                    $item.addClass(item.cssClass);
                }
            }
            return $item;
        };
        DropDownMenuPresenter.prototype._createDivider = function (item) {
            return $("<li role='presentation' class='divider'></li>");
        };
        DropDownMenuPresenter.prototype._createHeader = function (item) {
            return $("<li role='presentation' class='dropdown-header'>" + item.title + "</li>");
        };
        DropDownMenuPresenter.prototype._createItemEl = function (item) {
            var itemHtml = this._getItemHtml(item);
            var $item = $("<li><a href='" + (item.url || "#") + "'>" + itemHtml + "</a></li>")
                .data("item-name", item.name)
                .prop({ name: item.name, title: item.title })
                .attr("name", item.name);
            if (this.options.itemCssClass) {
                $item.addClass(this.options.itemCssClass);
            }
            return $item;
        };
        DropDownMenuPresenter.prototype._getItemHtml = function (item) {
            if (item.html) {
                return item.html;
            }
            return Menu.getItemHtml(item, item.presentation || this.options.itemPresentation);
        };
        DropDownMenuPresenter.prototype._renderSubItems = function (subitems, $item) {
            if (!subitems || !subitems.length) {
                return;
            }
            var $submenu = $("<ul></ul>");
            subitems.forEach(function (item) {
                item.presentation = item.presentation || "icon";
            });
            this._renderItems(subitems, $submenu);
            if ($submenu.children().length) {
                $item.addClass("dropdown-submenu").append($submenu);
            }
        };
        DropDownMenuPresenter.prototype._renderWaitStub = function (domElement) {
            var waitContainer = $("<div />")
                .css({
                "marginLeft": 10,
                "marginRight": 10,
                "display": "inline-block",
                "verticalAlign": "text-top"
            })
                .addClass("x-waiting-container")
                .addClass(core.ui.getWaitingIconClass(16));
            domElement.empty();
            $("<li></li>").text(resources["wait"]).prepend(waitContainer).appendTo(domElement);
        };
        DropDownMenuPresenter.defaultOptions = {
            /**
             * Trigger dropdown menu above element instead of below (by default)
             * @type {Boolean}
             */
            dropup: false,
            /**
             * Bind container element (anchor by default) enable state to availability of any menu items
             * @type {Boolean}
             */
            disableIfEmpty: true,
            toggleButtonIcon: "menu",
            tooltips: true
        };
        return DropDownMenuPresenter;
    }(Part));
    DropDownMenuPresenter.mixin({
        defaultOptions: DropDownMenuPresenter.defaultOptions
    });
    core.ui.DropDownMenuPresenter = DropDownMenuPresenter;
    return DropDownMenuPresenter;
});
//# sourceMappingURL=DropDownMenuPresenter.js.map