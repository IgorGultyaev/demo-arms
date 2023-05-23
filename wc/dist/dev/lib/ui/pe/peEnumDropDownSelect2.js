/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "underscore", "lib/ui/pe/peEnumDropDownBase", "vendor/select2/select2", "i18n!lib/nls/resources", "xcss!vendor/select2/content/select2", "xcss!lib/ui/styles/peEnum", "xcss!lib/ui/styles/peEnumDropDownSelect2"], function (require, exports, $, core, _, peEnumDropDownBase, Select2, resources) {
    "use strict";
    var lang = core.lang;
    // TODO var AttachContainer = $.fn.select2.amd.require("select2/dropdown/attachContainer");
    function AttachContainer(decorated, $element, options) {
        decorated.call(this, $element, options);
    }
    AttachContainer.prototype.position = function (decorated, $dropdown, $container) {
        var $dropdownContainer = $container.find(".dropdown-wrapper");
        $dropdownContainer.append($dropdown);
        $dropdown.addClass("select2-dropdown--below").addClass("select2-dropdown-inplace");
        $container.addClass("select2-container--below");
    };
    var peEnumDropDownSelect2 = /** @class */ (function (_super) {
        __extends(peEnumDropDownSelect2, _super);
        /**
         * @constructs peEnumDropDownSelect2
         * @extends peEnumDropDownBase
         * @param options
         */
        function peEnumDropDownSelect2(options) {
            var _this = this;
            options = peEnumDropDownSelect2.mixContextOptions(options, peEnumDropDownSelect2.defaultOptions, peEnumDropDownSelect2.contextDefaultOptions);
            // TODO: options = peEnumDropDownSelect2.mixOptions2(options);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peEnumDropDownSelect2.prototype.doRender = function (domElement) {
            var that = this, flags = that.flags, bindable, select;
            _super.prototype.doRender.call(this, domElement);
            that.element.addClass("x-pe-enum-dropdown-select2");
            select = that.select;
            select.removeClass("form-control");
            select.attr("data-disabled", 0);
            var modalParent = that.select.parents(".modal");
            var selectOptions = that.getSelectOptions(modalParent);
            if (that.options.dropdownPosition === "inplace") {
                selectOptions = that.addDropdownAdapter(selectOptions);
            }
            that.select2 = new Select2(select, selectOptions);
            if (that.options.dropdownPosition === "inplace") {
                // notify Affix about changes in dom
                select.bind("select2:opening", function () {
                    that.notifyDOMChanged();
                });
                select.bind("select2:close", function () {
                    that.notifyDOMChanged();
                });
            }
            // workaround: for multi-select selecting a value should clear search field (by default it doesn't)
            if (that.select2.options.options.multiple && that.select2.selection) {
                that.select2.on("select", function () {
                    that.select2.selection.$search.val("");
                    that.select2.selection.handleSearch();
                });
            }
            // workaround: по умолчанию Select2 не гасит keyup, в диалоге оно доходят до меню,
            // и, например, Enter/ESC закрывают диалог.
            // Попытка починить Select2 пока не удалась, см. https://github.com/select2/select2/issues/4495
            // Поэтому просто блокируем все события (элемент $dropdown находится не под $container)
            // Ес-но, это ломает нормальное поведение PE, когда по ESC мы делаем blur
            that.select2.$container.stopKeyboardBubbling();
            that.select2.$dropdown.stopKeyboardBubbling();
            if (that.options.dropDownCssClass) {
                that.select2.$dropdown.addClass(that.options.dropDownCssClass);
            }
            if (!flags) {
                bindable = {
                    get: function () {
                        var v = select.val();
                        if (!that.isDomain) {
                            return that.parseValue(v);
                        }
                        return v;
                    },
                    set: function (v) {
                        select.val(v != null ? v.toString() : v).trigger("change.select2");
                    }
                };
            }
            else {
                bindable = {
                    get: function () {
                        var v = 0;
                        $.each(select.val(), function (i, optionVal) {
                            v = v | optionVal;
                        });
                        return v;
                    },
                    set: function (v) {
                        var options = _.filter(_.pluck(that.members(), "value"), function (memberValue) {
                            return (v & memberValue) === memberValue;
                        });
                        select.val(options).trigger("change.select2");
                    }
                };
            }
            bindable.onchange = function (handler) {
                select.bind("change", handler);
                return {
                    dispose: function () {
                        select.unbind("change", handler);
                    }
                };
            };
            that.databind(bindable);
            // workaround: multi-select отображаемый в диалоге будет иметь placeholder обрезанный width:100px (https://github.com/select2/select2/issues/4513)
            if (flags && !select.is(":visible")) {
                if (modalParent.length && !modalParent.is(":visible")) {
                    // dialog is hidden, postpone resize when it's shown
                    modalParent.on("shown.bs.modal.select2", function () {
                        that.select2.selection.resizeSearch();
                        modalParent.off("shown.bs.modal.select2");
                    });
                }
                else {
                    // dialog is visible, but control is invisible, make resize with timer
                    // NOTE: Стандартный ObjectEditorPresenter показывает страницу синхронно сразу после рендеринга
                    window.setTimeout(function () {
                        that.select2.selection.resizeSearch();
                    });
                }
            }
            if (that._tabIndex) {
                that._setTabIndex(that._tabIndex);
            }
        };
        peEnumDropDownSelect2.prototype.getSelectOptions = function (modalParent) {
            var that = this;
            var options = that.options;
            var flags = that.flags;
            // NOTE: Можно загрузкить языковой файл (добавить в начало: import "vendor/select2/i18n/ru"),
            // но он падает, т.к. ожидает jQuery.fn.select2, поэтому определим объект Translation:
            var Language = {
                noResults: function () { return that.options.noResultsText; },
                searching: function () { return resources["searching"]; },
                maximumSelected: function () { return ""; }
            };
            var selectOpts = {
                allowClear: options.nullable && !flags,
                width: options.width,
                dropdownAutoWidth: options.dropdownAutoWidth,
                minimumResultsForSearch: options.hideSearch ? Infinity : options.minimumResultsForSearch,
                // by default dropdown will be under body, but in dialog we move it under modal root
                dropdownParent: modalParent.length ? modalParent : undefined,
                closeOnSelect: options.closeOnSelect !== undefined ? options.closeOnSelect : (flags ? false : true),
                language: Language
            };
            if (options.itemFormatter) {
                var members_1 = that.members();
                selectOpts.escapeMarkup = function (markup) {
                    return markup;
                };
                selectOpts.templateResult = function (result) {
                    // result - is a data item with fields: id, text, title, selected, disabled, element
                    if (result.loading) {
                        return result.text;
                    }
                    var member = lang.find(members_1, function (i) { return i.value.toString() === result.id; });
                    if (member) {
                        var text = options.itemFormatter(member);
                        return text && core.isHtml(text) ? text.toHTML() : text;
                    }
                    return result.text;
                };
            }
            return lang.extendEx(selectOpts, options.select2, { deep: true });
        };
        peEnumDropDownSelect2.prototype.addDropdownAdapter = function (options) {
            // NOTE: Код взять из Select2 (Defaults.prototype.apply),
            //  по умолчаню Select2 использует AttachBody в качестве dropdownAdapter,
            //  dropdownAdapter можно переопределить через опцию,
            //  но вместе с этим приходится повторять настройку всей цепочики декораторов
            // NOTE: важно: в отличии от кода в select2 здесь в опции еще не подставлены defaults
            var Utils = $.fn.select2.amd.require("select2/utils");
            var Dropdown = $.fn.select2.amd.require("select2/dropdown");
            var DropdownSearch = $.fn.select2.amd.require("select2/dropdown/search");
            var CloseOnSelect = $.fn.select2.amd.require("select2/dropdown/closeOnSelect");
            var MinimumResultsForSearch = $.fn.select2.amd.require("select2/dropdown/minimumResultsForSearch");
            if (options.dropdownAdapter == null) {
                if (this.flags) {
                    options.dropdownAdapter = Dropdown;
                }
                else {
                    var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);
                    options.dropdownAdapter = SearchableDropdown;
                }
                if (options.minimumResultsForSearch !== 0) {
                    options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, MinimumResultsForSearch);
                }
                if (options.closeOnSelect) {
                    options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, CloseOnSelect);
                }
                options.dropdownAdapter = Utils.Decorate(options.dropdownAdapter, AttachContainer);
            }
            return options;
        };
        peEnumDropDownSelect2.prototype.focus = function () {
            if (this.select2) {
                this.select2.focus();
            }
            //this.select.select2("focus");
        };
        peEnumDropDownSelect2.prototype._setWidth = function () {
            // ничего не делаем - ширина установлена в render
        };
        peEnumDropDownSelect2.prototype._onDisabledChange = function (disabled) {
            this.select.prop("disabled", disabled);
            // IE8-IE10 hack: несмотря на поддержку mutation events (и onpropertychanged в IE8) для disabled-элементов они не работают!
            if (core.platform.browser.ie && core.platform.browser.ie.version < 11) {
                // simulate setting disabled - see select2._syncAttributes
                var select2 = this.select2;
                select2.options.set("disabled", disabled);
                disabled ? select2.trigger("disable", {}) : select2.trigger("enable", {});
            }
        };
        peEnumDropDownSelect2.prototype._renderError = function (error, element) {
            var that = this;
            _super.prototype._renderError.call(this, error, element);
            // TODO:
            if (that.select && that.select) {
                that.select.toggleClass("-invalid", !!error);
                //that.select.select2("dropdown").toggleClass("-invalid", !!error);
            }
        };
        peEnumDropDownSelect2.prototype.unload = function (options) {
            var that = this;
            if (that.select2) {
                that.select2.destroy();
                that.select2 = undefined; // prevent repeated dispose
            }
            _super.prototype.unload.call(this, options);
        };
        peEnumDropDownSelect2.defaultOptions = {
            dropdownAutoWidth: false,
            hideSearch: false,
            minimumResultsForSearch: 4,
            //dropdownPosition: "inplace",
            closeOnSelect: undefined // by default: false for flags, true - otherwise
        };
        peEnumDropDownSelect2.contextDefaultOptions = {
            filter: {
                dropdownPosition: "absolute"
            },
            editor: {
                dropdownPosition: "inplace"
            },
            inline: {
                dropdownPosition: "inplace"
            }
        };
        return peEnumDropDownSelect2;
    }(peEnumDropDownBase));
    peEnumDropDownSelect2.mixin({
        defaultOptions: peEnumDropDownSelect2.defaultOptions
    });
    core.ui.peEnumDropDownSelect2 = peEnumDropDownSelect2;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        // it's default PE for enums and for flags with presentation=="dropdown"
        if (propMd.ref && !core.platform.isMobileDevice) {
            if (propMd.presentation === "select2" ||
                propMd.presentation === "dropdown" ||
                !propMd.presentation && !propMd.flags && !propMd.ref.flags) {
                return core.ui.peEnumDropDownSelect2;
            }
        }
        // NOTE: as it's the default PE for non-flag-enum props,
        // increase priority to overtake peEnumRadio but not peViewOnly (which priority is 10) as peEnumDropDownSelect2 doesn't support readonly mode
    }, { vt: "enum", priority: 5 });
    return peEnumDropDownSelect2;
});
//# sourceMappingURL=peEnumDropDownSelect2.js.map