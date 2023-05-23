/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/core.jquery", "lib/ui/pe/NavigationPropertyEditor", "lib/ui/menu/Menu", "lib/binding", "lib/formatters", "lib/ui/pe/PropertyEditor", "lib/ui/menu/MenuButtonsPresenter", "lib/ui/menu/DropDownMenuPresenter", "i18n!lib/nls/resources", "lib/ui/ConfirmDialog", "xcss!lib/ui/styles/peObject"], function (require, exports, core, $, NavigationPropertyEditor, Menu, binding, formatters, PropertyEditor, MenuButtonsPresenter, DropDownMenuPresenter, resources, ConfirmDialog) {
    "use strict";
    var lang = core.lang;
    var peObject = /** @class */ (function (_super) {
        __extends(peObject, _super);
        /**
         * @constructs peObject
         * @extends NavigationPropertyEditor
         * @param options
         */
        function peObject(options) {
            var _this = this;
            options = peObject.mixOptions(options, peObject.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.commands = lang.extend(_this.createCommands(), _this.options.commands);
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
                _this.menu.onItemExecuting = function (args) {
                    args.object = _this.value();
                    args.pe = _this;
                };
            }
            return _this;
        }
        peObject.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(peObject.defaultMenu, "peObject");
        };
        peObject.prototype.createMenu = function () {
            return new Menu(this.createMenuDefaults(), this.options.menu);
        };
        peObject.prototype.doRender = function (domElement) {
            var that = this, $element, $btnGroup, bindable, presentationContainer, presentation;
            // pe container:
            $element = $("<div class='x-pe-object'/>").appendTo(domElement);
            that.element = $element;
            // menu container:
            $btnGroup = $("<div class='btn-group pull-right' style='margin:0' />").appendTo($element);
            that.menuPresenter = that._createMenuPresenter();
            that.menuPresenter.setViewModel(that.menu);
            that.menuPresenter.render($btnGroup);
            that._button = $btnGroup.find("a.dropdown-toggle");
            // value presentation container:
            presentationContainer = $("<div class='x-pe-object-presentation-container' >").appendTo($element);
            presentation = $("<div></div>").textOverflow().appendTo(presentationContainer);
            bindable = {
                set: function (value) {
                    if (!value) {
                        var html = void 0;
                        if (lang.isFunction(that.options.emptyValue)) {
                            html = that.options.emptyValue.apply(that);
                        }
                        else {
                            html = that.options.emptyValue;
                        }
                        presentation.html(html);
                    }
                    else {
                        // NOTE: мы вставляем содержие как html осознанно (см. createBindableProp),
                        // если в опциях нет formatterHtml или html=false, то текстовое значение (от formatter), будет закодировано
                        presentation.html(value);
                    }
                }
            };
            that.databind(bindable);
            _super.prototype.doRender.call(this, domElement);
        };
        peObject.prototype._createMenuPresenter = function () {
            var that = this, presenter;
            if (that.options.menuPresentation === "buttons" ||
                (that.options.menuPresentation === "auto" &&
                    that.menu.hasOnly([that.commands["Unlink"], that.commands["Select"]]))) {
                presenter = MenuButtonsPresenter.create({
                    inline: true,
                    reverse: true,
                    itemPresentation: that.options.menuItemPresentation || "icon",
                    cssClass: "x-menu-btn-addon-right"
                });
            }
            else {
                // "dropdown" or "auto" and
                presenter = DropDownMenuPresenter.create();
            }
            return presenter;
        };
        peObject.prototype._onDisabledChange = function (disabled) {
            if (!this._button) {
                return;
            }
            var that = this, btnEl = that._button[0];
            if (!btnEl) {
                return;
            }
            // кнопка дропдауна от bootstrap не очень реагирует на установку аттрибута disabled
            // однако работает при установке соотв-го класса
            // так же отключается возможность установить фокус клавой
            disabled ?
                that._button.addClass("disabled")
                : that._button.removeClass("disabled");
            // отключается/включается переход по табу
            // запоминается текущий tabIndex для того, что бы его вернуть, когда pe раздизейблится
            // выполняется только когда _tabIndex еще не задан
            disabled && (that._tabIndex === undefined) && (that._tabIndex = btnEl.tabIndex);
            btnEl.tabIndex = disabled ? -1 : that._tabIndex || 0;
        };
        peObject.prototype._bindToEsc = function () {
            var that = this, menuClosing, $element = that.element || that.$domElement, keyCode = core.html.keyCode;
            $element.keydown(function (e) {
                if (e.which === keyCode.ESCAPE && $element.find(".btn-group.dropdown.open").length) {
                    menuClosing = true;
                }
            });
            $element.keyup(function (e) {
                if (e.which !== keyCode.ESCAPE || e.ctrlKey || e.shiftKey || e.metaKey || menuClosing) {
                    menuClosing = false;
                    return;
                }
                $(e.target).blur();
            });
        };
        peObject.prototype.createBindableProp = function () {
            var _this = this;
            return binding.expr(this.viewModel, function () {
                return formatters.formatPropHtml(_this.options, _this.value());
            });
        };
        peObject.prototype.currentValue = function () {
            return this.value();
        };
        peObject.prototype.unload = function (options) {
            var menuPresenter = this.menuPresenter;
            if (menuPresenter) {
                menuPresenter.unload();
            }
            _super.prototype.unload.call(this, options);
        };
        peObject.prototype._addObject = function (obj) {
            this.value(obj);
        };
        peObject.prototype._valueIds = function () {
            var value = this.value();
            return value ? [value.id] : [];
        };
        peObject.prototype.doUnlink = function () {
            var _this = this;
            // execute base command
            var obj = this.currentValue();
            if (obj) {
                // orphan check: currently object-value which has changes and will become unreachable
                return lang.async.then(this.checkForOrphan(), function (orphanCheck) {
                    _this.value(null);
                    if (orphanCheck.orphan) {
                        _this.viewModel.uow.detach(orphanCheck.value);
                    }
                });
            }
        };
        peObject.prototype.doDelete = function () {
            var _this = this;
            var obj = this.currentValue();
            if (obj) {
                var dialog = ConfirmDialog.create({
                    header: this.options.descr || resources["navigationPE.deleteHeader"],
                    text: resources["navigationPE.deletePrompt.one"]
                });
                return dialog.open().then(function (result) {
                    if (result !== "yes") {
                        return;
                    }
                    // unlink object first
                    _this.value(null);
                    if (_this.viewModel && _this.viewModel.uow) {
                        _this.viewModel.uow.remove(obj);
                    }
                });
            }
        };
        peObject.prototype.doSelect = function (args) {
            var _this = this;
            // overridden for possible orphan check: currently object-value which has changes and will become unreachable
            return lang.async.then(this.checkForOrphan(), function (orphanCheck) {
                // execute base command
                var cmdRes = _super.prototype.doSelect.call(_this, args);
                if (orphanCheck.orphan) {
                    // if command was executed (new value-object selected), detach previous orphan object on cmd completion
                    cmdRes.then(function (result) {
                        if (result && result.selection) {
                            _this.viewModel.uow.detach(orphanCheck.value);
                        }
                    });
                }
                return cmdRes;
            });
        };
        peObject.prototype.doCreate = function (args) {
            var _this = this;
            // overridden for possible orphan check: currently object-value which has changes and will become unreachable
            return lang.async.then(this.checkForOrphan(), function (orphanCheck) {
                // execute base command
                var cmdRes = _super.prototype.doCreate.call(_this, args);
                if (orphanCheck.orphan) {
                    // if command was executed (new value-object created), detach previous orphan object on cmd completion
                    cmdRes.then(function (result) {
                        if (result && result.success) {
                            _this.viewModel.uow.detach(orphanCheck.value);
                        }
                    });
                }
                return cmdRes;
            });
        };
        peObject.prototype.checkForOrphan = function () {
            var that = this, obj = that.value();
            if (!obj) {
                return { orphan: false, value: obj };
            }
            if (!that._isOrphan(obj)) {
                return { orphan: false, value: obj };
            }
            var dialog = ConfirmDialog.create({
                header: that.title(),
                text: resources["peObject.orphan"]
            });
            // warn user about losing data
            return dialog.open().then(function (result) {
                if (result !== "yes") {
                    // cancel command
                    return lang.rejected();
                }
                return { orphan: true, value: obj };
            });
        };
        peObject.defaultOptions = {
            /**
             * @type {"auto"|"buttons"|"dropdown"}
             */
            menuPresentation: "auto",
            menuItemPresentation: "icon",
            emptyValue: "<i class='text-muted'>" + resources["value_not_specified"] + "</i>"
        };
        peObject.defaultMenu = { items: [
                { name: "Select", title: resources["select"], icon: "search" },
                { name: "Create", title: resources["create"] },
                { name: "divider" },
                { name: "Edit", title: resources["edit"] },
                { name: "divider" },
                { name: "Unlink", title: resources["navigationPE.unlink.scalar"], icon: "clear" },
                { name: "Delete", title: resources["delete"] }
            ] };
        return peObject;
    }(NavigationPropertyEditor));
    // backward compatibility: access to static fields via prototype
    peObject.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: peObject.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: peObject.defaultMenu
    });
    core.ui.peObject = peObject;
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return !propMd.presentation ? core.ui.peObject : null;
    }, { vt: "object" });
    return peObject;
});
//# sourceMappingURL=peObject.js.map