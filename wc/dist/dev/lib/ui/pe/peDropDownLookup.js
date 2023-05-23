/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/core.jquery", "rx", "lib/ui/pe/PropertyEditorLookup", "lib/utils", "lib/binding", "lib/formatters", "i18n!lib/nls/resources", "lib/ui/pe/peLoadableMixin", "lib/ui/menu/MenuButtonsPresenter", "xcss!lib/ui/styles/peObjectDropDownLookup"], function (require, exports, core, $, Rx, PropertyEditorLookup, utils, binding, formatters, resources, peLoadableMixin) {
    "use strict";
    var lang = core.lang;
    var peDropDownLookup = /** @class */ (function (_super) {
        __extends(peDropDownLookup, _super);
        /**
         * @constructs peDropDownLookup
         * @extends PropertyEditor
         * @param options
         */
        function peDropDownLookup(options) {
            var _this = this;
            options = peDropDownLookup.mixOptions(options, peDropDownLookup.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            // идентификатор контрола. используется при определении id контент контролов при работе с фокусом.
            var cid = utils.generateGuid();
            that._inputId = "inputLookup" + cid;
            that._dropId = "drop" + cid;
            return _this;
        }
        peDropDownLookup.prototype.render = function (domElement) {
            var that = this, options = that.options, $rootElement, $valueContainer, $presentationContainer, $clearBtn;
            // pe container:
            $rootElement = $("<div class='x-pe-object-dropdown input-group'></div>").appendTo(domElement);
            // value container:
            $valueContainer = $("<div class='value-container'></div>").appendTo($rootElement);
            // buttons:
            that.renderMenu($rootElement);
            $presentationContainer = $("<div class='presentation-container'></div>").appendTo($valueContainer);
            that._presentation = $("<span/>").appendTo($presentationContainer);
            that._loading = $("<div class='x-waiting-container' title='" + resources["loading"] + "'></div>")
                .hide() // initially invisible
                .appendTo($valueContainer);
            $("<span></span>").addClass(core.ui.getWaitingIconClass(16)).appendTo(that._loading);
            if (options.isLookup) {
                that._setupLookup($valueContainer);
            }
            if (that.commands["Unlink"]) {
                $valueContainer.addClass("has-clear-btn");
                $clearBtn = $("<span class='clear-btn'>&times;</span>").appendTo($valueContainer);
                binding.commandBind($clearBtn, that.commands["Unlink"]);
            }
            //that._dropContainer = $("<div id='" + that._dropId + "' class='drop-container' ></div>").appendTo("body");
            that._dropContainer = $("<div id='" + that._dropId + "' class='drop-container' ></div>")
                .stopBubbling()
                .mousedown(function () { return false; });
            if (that.options.dropDownCssClass) {
                that._dropContainer.addClass(that.options.dropDownCssClass);
            }
            that._dropScroll = $("<div class='drop-scroll'></div>").appendTo(that._dropContainer);
            that._dropdown = $("<ul class='dropdown-menu' tabindex='-1'></ul>").appendTo(that._dropScroll);
            that._dropdown
                .on("click", function (e) {
                //console.log("peLookup click");
                e.stopPropagation();
                e.preventDefault();
                that._selectCurrentDropDownValue();
            })
                .on("mouseenter", "li", that._mouseEnter.bind(that));
            //core.html.overlay(that._dropContainer, that.domElement);
            that.element = $rootElement;
            that.element
                .on("keypress keydown", that._keypress.bind(that))
                .on("keyup", that._keyup.bind(that));
            // if pe (any inner elements) lost focus - check activeElement. if it is outside a pe - close drop
            that.element.focusout(function () {
                window.setTimeout(function () {
                    if (!that._isFocusInside()) {
                        that._close();
                    }
                });
            });
            _super.prototype.render.call(this, domElement);
        };
        peDropDownLookup.prototype.unload = function (options) {
            var that = this;
            $("#" + that._dropId).remove();
            _super.prototype.unload.call(this, options);
        };
        peDropDownLookup.prototype._onDisabledChange = function (disabled) {
            this._disableInput(disabled);
        };
        peDropDownLookup.prototype.createBindableProp = function () {
            var that = this;
            return binding.expr(that.viewModel, function () {
                // NOTE: this === that.viewModel here. Don't use lambda instead of function, otherwise this === that)
                var value = this[that.viewModelProp]();
                return that.dataProvider.getValuePresentation(value);
            });
        };
        peDropDownLookup.prototype.createBindableElement = function () {
            var that = this;
            return {
                set: function (value) {
                    if (value === lang.support.loadingValue) {
                        that._disableInput(true);
                        that._presentation.html(that.options.loadingText);
                    }
                    else {
                        that._disableInput(false);
                        if (value === null || value === "") {
                            that._presentation.html(that.options.emptyValueText);
                        }
                        else {
                            that._presentation.text(value);
                            if (that._presentation.hasClass("lookup-active")) {
                                // NOTE: lookup input currently is active (and _presentation is hidden)
                                // So the current prop value has been changed during lookup input active (it can be done due to prop value loading)
                                // If the user didn't change initial lookup value then update it basing on the new prop value.
                                if (that._inputInitialVal === that._input.val()) {
                                    that._inputInitialVal = that._getInputValuePresentation();
                                    that._input.val(that._inputInitialVal);
                                }
                            }
                        }
                    }
                },
                setError: function (error) {
                    that._disableInput(false);
                    var message = null;
                    if (error) {
                        that._presentation.empty();
                        if (core.eth.isObjectNotFound(error)) {
                            // the value object was deleted, reset value to null
                            that.value(null);
                        }
                        else if (error.httpStatus) {
                            message = resources["peDropDownLookup.loadingError"] + error.message;
                        }
                    }
                    that.renderError(message);
                }
            };
        };
        /**
         * Select item with specified index
         * @param {Number} index index to select
         */
        peDropDownLookup.prototype.selectIndex = function (index) {
            var item = this.viewItems.get(index), value = this.dataProvider.getValue(item);
            this.value(value);
        };
        /**
         * Select first item
         */
        peDropDownLookup.prototype.selectFirst = function () {
            if (this.viewItems.count() > 0) {
                this.selectIndex(0);
            }
        };
        /**
         * Select item if single
         */
        peDropDownLookup.prototype.selectSingle = function () {
            if (this.viewItems.count() === 1) {
                this.selectIndex(0);
            }
        };
        /**
         * Disable property editor if only one item exists
         */
        peDropDownLookup.prototype.disableIfSingle = function () {
            if (this.viewItems.count() === 1) {
                this.disabled(true);
            }
        };
        peDropDownLookup.prototype._disableInput = function (disabled) {
            var that = this;
            if (that._input && disabled !== undefined) {
                that._input.prop("disabled", (disabled !== false) || !!that.disabled());
            }
        };
        peDropDownLookup.prototype._readonlyInput = function (readonly) {
            var that = this;
            if (that._input) {
                that._input.prop("readonly", (readonly !== false));
                //ie10 bug. ie10 does not change readonly if cursor already inside field
                if (that._input.is(":focus")) {
                    var input = that._input[0];
                    // NOTE: IE8 does not support setSelectionRange
                    if (input.setSelectionRange) {
                        input.setSelectionRange(input.selectionStart, input.selectionEnd);
                    }
                }
            }
        };
        /**
         * @override
         * @protected
         */
        peDropDownLookup.prototype._renderBeginLoading = function () {
            _super.prototype._renderBeginLoading.call(this);
            this._readonlyInput(true);
            this._loading.show();
        };
        /**
         * @override
         * @protected
         */
        peDropDownLookup.prototype._renderEndLoading = function () {
            _super.prototype._renderEndLoading.call(this);
            this._readonlyInput(false);
            this._loading.hide();
        };
        peDropDownLookup.prototype._setupLookup = function (valueContainer) {
            var that = this, keyCode = core.html.keyCode;
            that._input = $("<input id='" + that._inputId + "' type='text' class='form-control' />")
                .appendTo(valueContainer)
                .focus(function () {
                var inputValBefore = that._input.val();
                lang.loadExpression(that._getInputValuePresentation, that)
                    .done(function (v) {
                    that._presentation.addClass("lookup-active");
                    if (!inputValBefore || inputValBefore === v) {
                        // input's val wasn't change by the user while we were loading lookup list
                        that._inputInitialVal = v;
                        that._input.val(that._inputInitialVal);
                        that._input.select();
                    }
                });
            })
                .blur(function () {
                that._inputInitialVal = undefined;
                if (!that._isLookupStarted) {
                    that._presentation.removeClass("lookup-active");
                    that._input.val("");
                }
            })
                .on("mousedown", function () {
                // fix for chrome\safari. They set cursor at mouseup event
                // and if we want to select all text on focus event we need to supress mouseup once
                if (!that._input.is(":focus")) {
                    that._input.one("mouseup", function (e) {
                        e.preventDefault();
                    });
                }
            });
            // open control on mouse enter
            var mouseDownFirst = that.visualStyle === PropertyEditorLookup.VisualStyle.lookup ? undefined : Rx.Observable
                .fromEvent(that._input, "mousedown").where(function (ev) {
                return !that._isLookupStarted && !that._isOpen;
            }).select(function (ev) { return $(ev.target).val(); });
            // sequence of input values from 'keyup' event
            var keyupVals = Rx.Observable
                .fromEvent(that._input, "keyup")
                .where(function (ev) {
                return !that._isLookupStarted && (ev.which > keyCode.DOWN || // всякие буквы
                    ev.which === keyCode.SPACE ||
                    ev.which === keyCode.BACKSPACE ||
                    ev.which === keyCode.DELETE);
            })
                .select(function (ev) { return $(ev.target).val(); })
                .where(function (text) {
                return text.length >= that.options.lookupMinChars // либо что-то введено
                    || text.length === 0 // либо вообще пусто после ввода (значит стирали) и нужно показывать всё
                    || that._isOpen;
            } // или дропдаун уже открыт
            )
                .debounce(that.options.lookupDelay);
            // sequence of input values from 'paste' event
            var pasteVals = Rx.Observable
                .fromEvent(that._input, "paste")
                .delay(0) // asynchronously to have time to update input value
                .select(function (ev) { return $(ev.target).val(); })
                .where(function (text) { return text.length >= that.options.lookupMinChars || that._isOpen; });
            // merge 'keyup' and 'paste' sequences and process values from them
            var subscription = Rx.Observable.merge(mouseDownFirst, keyupVals, pasteVals)
                .flatMapLatest(function (text) {
                that._isLookupStarted = true;
                return that._searchForSuggestions(text)
                    .then(null, function (err) {
                    // NOTE: Ошибка уже отобразилась внутри _searchForSuggestions.
                    // Здесь просто возвращаем пустой Deferred, чтобы не было ошибки в Rx
                    return lang.resolved();
                });
            })
                .subscribe(function (results) {
                if (results) {
                    that.viewItems.reset(results);
                    if (!that._isOpen) {
                        that._open();
                    }
                    that._isLookupStarted = false;
                    if (results.length === 1) {
                        if (that._filterItems(that.viewItems, $(that._input).val(), that.matchModes.equals).length === 1) {
                            // the text in lookup field strictly equals to the single option value (in lookup dropdown)
                            // so automatically choose it as selected value
                            var item = that.viewItems.get(0);
                            that._selectValue(item);
                        }
                    }
                }
                else {
                    // NOTE: отсутствие results свидетельствует об ошибке
                    that._close();
                    that._isLookupStarted = false;
                }
            });
            that.addDisposable(subscription);
        };
        peDropDownLookup.prototype._getInputValuePresentation = function () {
            var value = this.value();
            if (value == null) {
                return "";
            }
            return this.dataProvider.getValuePresentation(value).toString();
        };
        peDropDownLookup.prototype.doToggleDrop = function () {
            var that = this;
            if (!that._selectInsteadExecute()) {
                _super.prototype.doToggleDrop.call(this);
            }
        };
        peDropDownLookup.prototype._doReload = function () {
            var that = this;
            if (!that._selectInsteadExecute()) {
                // NOTE: do not pass command' args into reload
                if (that._input) {
                    that._input.focus();
                }
                _super.prototype._doReload.call(this);
            }
        };
        peDropDownLookup.prototype._selectInsteadExecute = function () {
            if (this._isOpen) {
                return this._selectCurrentDropDownValue();
            }
            return false;
        };
        peDropDownLookup.prototype._selectCurrentDropDownValue = function () {
            var active = this._dropdown.find(".active");
            if (!active.length) {
                return false;
            }
            var item = active.data("object");
            this._selectValue(item);
            return true;
        };
        peDropDownLookup.prototype._selectValue = function (item) {
            var that = this, value = that.dataProvider.getValue(item);
            that.value(value === undefined ? null : value); // undefined -> null
            if (that._input) {
                that._resetInput();
            }
            that._close();
        };
        peDropDownLookup.prototype._hasActive = function () {
            return this._dropdown.find(".active").length > 0;
        };
        peDropDownLookup.prototype._resetInput = function () {
            var that = this;
            that._presentation.removeClass("lookup-active");
            /*	ранее мы уводимо фокус на кнопку. но ее может не быть и тогда все ломалось
            if (that.menuPresenter) {
                that.menuPresenter.focusItem("Toggle");
            }
            */
            that._input.blur().focus();
        };
        peDropDownLookup.prototype._keyup = function (e) {
            var that = this, keyCode = core.html.keyCode;
            switch (e.keyCode) {
                case keyCode.TAB:
                case keyCode.ENTER:
                    if (e.keyCode === keyCode.TAB && !that.options.selectOnTab) {
                        break;
                    }
                    if (that._isOpen && that._selectCurrentDropDownValue()) {
                        return false;
                    }
                    break;
                case keyCode.ESCAPE:// escape
                    if (that._isOpen) {
                        that._resetInput();
                        that._close();
                        return false;
                    }
                    break;
            }
        };
        peDropDownLookup.prototype._keypress = function (e) {
            var that = this, keyCode = core.html.keyCode;
            switch (e.keyCode) {
                case keyCode.BACKSPACE:
                    //if input element is readonly (while loading) backspase shouldn't go back
                    if (that._input && that._input.prop("readonly")) {
                        return false;
                    }
                    break;
                case keyCode.TAB:
                    break;
                case keyCode.ENTER:
                case keyCode.ESCAPE:
                    return false;
                case keyCode.UP:
                    if (e.type === "keydown") {
                        that._prev();
                    }
                    return false;
                case keyCode.DOWN:
                    if (!that._isOpen) {
                        if (e.target.id) {
                            that._isLookupStarted = false;
                        }
                        that._open();
                    }
                    if (e.type === "keydown") {
                        that._next();
                    }
                    return false;
            }
        };
        peDropDownLookup.prototype._next = function () {
            var active = this._dropdown.find(".active").removeClass("active"), next = active.next();
            if (!next.length) {
                next = $(this._dropdown.find("li")[0]);
            }
            next.addClass("active");
            this._ensureItemInView(this._dropScroll, next);
        };
        peDropDownLookup.prototype._prev = function () {
            var active = this._dropdown.find(".active").removeClass("active"), prev = active.prev();
            if (!prev.length) {
                prev = this._dropdown.find("li").last();
            }
            prev.addClass("active");
            this._ensureItemInView(this._dropScroll, prev);
        };
        peDropDownLookup.prototype._ensureItemInView = function (view, item) {
            if (!view.length || !item.length) {
                return;
            }
            var viewTop = view.scrollTop(), viewBottom = viewTop + view.height(), elemTop = item.position().top, elemBottom = elemTop + item.height();
            if (elemBottom > viewBottom || elemTop < viewTop) {
                view.scrollTo(item, 100, { easing: "swing" });
            }
        };
        peDropDownLookup.prototype._mouseEnter = function (e) {
            this._dropdown.find(".active").removeClass("active");
            $(e.currentTarget).addClass("active");
        };
        peDropDownLookup.prototype._renderViewItems = function () {
            var that = this;
            that._dropdown.empty();
            if (that.options.showEmptyItem) {
                $("<li><a href='#' tabindex='-1'>" + that.options.dropDownEmptyItemText + "</a></li>").appendTo(that._dropdown);
            }
            try {
                that.viewItems.forEach(function (item) {
                    var $li = $("<li></li>").data("object", item).appendTo(that._dropdown);
                    var text = that._getDropdownValuePresentation(item);
                    // NOTE: _getDropdownValuePresentation возвращает строку, которая может быть Html,
                    // если задана опция formatterHtml или formatter вернул SafeHtml.
                    // Во всех остальных случах строка должна быть html-encoded, поэтому тут вставим ее как HTML.
                    var $item = $("<a href='#' tabindex='-1'></a>");
                    if (formatters.isHtml(text)) {
                        $item.html(text.toHTML());
                    }
                    else {
                        $item.text(text.toString());
                    }
                    $item.appendTo($li);
                });
            }
            catch (ex) {
                console.error(ex);
                throw ex;
            }
            // make the single option active by default (so pressing Enter will select it as prop value)
            if (that.viewItems.count() === 1) {
                that._dropdown.children(":last-child").addClass("active");
            }
        };
        peDropDownLookup.prototype.toggle = function () {
            var that = this;
            if (that._input) {
                that._input.focus();
            }
            _super.prototype.toggle.call(this);
        };
        peDropDownLookup.prototype._open = function () {
            var that = this;
            if (!that.isDataLoaded) {
                that.reload().
                    done(function () {
                    //if focus leaved from pe, while loading, do nothing
                    if (!that._isFocusInside()) {
                        return;
                    }
                    that._open2();
                });
            }
            else {
                if (!that._isLookupStarted) {
                    that.viewItems.reset(that.items.all());
                }
                that._open2();
            }
        };
        /**
         * Corrects the position of dropContainer
         * @param {JQuery} $overlayContainer Parent "overlay" element for dropContainer (if any).
         * @private
         */
        peDropDownLookup.prototype._layoutDropContainer = function ($overlayContainer) {
            var that = this;
            // get coordinates of the parent relative to the document.
            var pos = that.element.offset();
            // NOTE: если контролл внутри какого-то overlay элемента (например, в диалоге), то позиция относительно
            // документа (которую возвращает offset) может не соответствовать абсолютной позиции контрола дропдауна,
            // т.к. в документе мог быть скроллинг, который отключается при показе диалога
            var offPos = $overlayContainer && $overlayContainer.offset() || { top: 0, left: 0 };
            // растянуть дроп на всю ширину контрола и опустить его так что бы был чуть ниже
            // нижнего края презентейшена
            that._dropContainer.css({
                width: that.element.outerWidth(),
                top: pos.top + that.element.outerHeight() - offPos.top,
                left: pos.left - offPos.left
            });
        };
        peDropDownLookup.prototype._open2 = function () {
            var that = this;
            that._isOpen = true;
            // NOTE: если domElement внутри overlay-элемента (например, диалога), то помещаем dropContainer туда же
            var $overlayContainer = core.html.overlay(that._dropContainer, that.$domElement);
            that._layoutDropContainer($overlayContainer);
            that._onDomChange = lang.debounce(function () {
                if (that._isOpen) {
                    that._layoutDropContainer($overlayContainer);
                }
            });
            core.$document.on("domChanged", that._onDomChange);
            that._dropContainer.show();
            that.element.addClass("open");
            that._dropScroll.scrollTop(0);
            that.onOpened();
        };
        peDropDownLookup.prototype.onOpened = function () {
            this.trigger(this.events.OPENED, this, { dropContainer: this._dropContainer });
        };
        peDropDownLookup.prototype._close = function () {
            var that = this;
            that._isOpen = false;
            if (that._onDomChange) {
                core.$document.off("domChanged", that._onDomChange);
                that._onDomChange = undefined;
            }
            that.element.removeClass("open");
            if (that._dropContainer) {
                that._dropContainer.hide();
            }
            that.onClosed();
        };
        peDropDownLookup.prototype.onClosed = function () {
            this.trigger(this.events.CLOSED, this, {});
        };
        peDropDownLookup.prototype.focus = function () {
            var that = this;
            if (that._input) {
                that._input.focus();
            }
            else if (that._btnContainer) {
                that._btnContainer.find(".btn:last").focus();
            }
        };
        peDropDownLookup.prototype._isFocusInside = function () {
            return $(document.activeElement).parents("#" + this.id + ", #" + this._dropId).length > 0;
        };
        peDropDownLookup.defaultOptions = {};
        return peDropDownLookup;
    }(PropertyEditorLookup));
    // backward compatibility: access to static fields via prototype\
    peDropDownLookup.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: peDropDownLookup.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: peDropDownLookup.defaultMenu,
        /** @obsolete use static State */
        states: peLoadableMixin.State,
        /** @obsolete use static Modes */
        modes: peDropDownLookup.Modes,
        /** @obsolete use static MatchModes */
        matchModes: peDropDownLookup.MatchModes,
        /** @obsolete use static Events */
        events: peDropDownLookup.Events
    });
    (function (peDropDownLookup) {
        /**
         * @obsolete Use base PropertyEditorLookup.DataProviderBase<TValue, TItem>
         */
        var DataProviderBase = /** @class */ (function (_super) {
            __extends(DataProviderBase, _super);
            function DataProviderBase() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DataProviderBase;
        }(PropertyEditorLookup.DataProviderBase));
        peDropDownLookup.DataProviderBase = DataProviderBase;
        /**
         * @obsolete Use base PropertyEditorLookup.PlainDataProvider<TItem>
         */
        var PlainDataProvider = /** @class */ (function (_super) {
            __extends(PlainDataProvider, _super);
            function PlainDataProvider() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return PlainDataProvider;
        }(PropertyEditorLookup.PlainDataProvider));
        peDropDownLookup.PlainDataProvider = PlainDataProvider;
        /**
         * @obsolete Use base PropertyEditorLookup.PlainDataProvider<TItem>
         */
        var DomainDataProvider = /** @class */ (function (_super) {
            __extends(DomainDataProvider, _super);
            function DomainDataProvider() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DomainDataProvider;
        }(PropertyEditorLookup.DomainDataProvider));
        peDropDownLookup.DomainDataProvider = DomainDataProvider;
    })(peDropDownLookup || (peDropDownLookup = {}));
    core.ui.peDropDownLookup = peDropDownLookup;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.presentation === "dropdown" ? core.ui.peDropDownLookup : null;
    });
    return peDropDownLookup;
});
//# sourceMappingURL=peDropDownLookup.js.map