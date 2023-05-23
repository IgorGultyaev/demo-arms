/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/core.commands", "lib/core.html"], function (require, exports, $, lang, commands, corehtml) {
    "use strict";
    exports.__esModule = true;
    /**
     * @exports binding
     * @description  Data-binding может осуществляться между специальными bindable значениями.
     * Под bindable значениям понимается любой объект, содержащий методы:
     * get()  - возвращает привязываемое значение;
     * set(v) - устанавливает привязываемое значение;
     * onchange(handler)  - подписывает обработчик на изменение значения.
     * Может возвращать объект с методом dispose(), в котором обработчик должен отписываться.
     * Этот метод будет вызван при разрыве binding-а;
     * Любой из методов может отсутствовать. Например, если нет метода onchange, то изменения значения не будут отслеживаться, т.е. binding будет "одноразовый".
     * Если, например, нет метода set, то binding будет односторонним.
    */
    function executeBinding(target, source, debounce) {
        var sourceErrorable = typeof source.setError === "function";
        var targetErrorable = typeof target.setError === "function";
        function setter() {
            if (lang.isNumber(debounce)) {
                // если debounce === 0, то просто вызовем onchange асинхронно
                lang.debounce(function () {
                    target.set(source.get());
                }, debounce, "__onchange_debounced_timeout").call(this);
            }
            else {
                // если debounce не задан (undefined), то просто вызовем onchange
                target.set(source.get());
            }
        }
        if (sourceErrorable || targetErrorable) {
            var error = null;
            try {
                setter.call(this);
            }
            catch (ex) {
                error = ex;
            }
            // устанавливаем ошибку и в источнике, и в приемнике (или сбрасываем, если ошибки нет)
            if (sourceErrorable) {
                source.setError(error);
            }
            if (targetErrorable) {
                target.setError(error);
            }
        }
        else {
            // in case of error it will bubble up
            setter.call(this);
        }
    }
    // region databind method
    function bindOneWay(target, source, debounce) {
        var disposable;
        var timerHolder = {};
        if (typeof source.onchange === "function" &&
            typeof source.get === "function" &&
            typeof target.set === "function") {
            var handler = function () {
                executeBinding.call(timerHolder, target, source, debounce);
            };
            disposable = source.onchange(handler);
            if (typeof target.ondispose === "function"
                && disposable && typeof disposable.dispose === "function") {
                target.ondispose(disposable);
            }
        }
        return disposable;
    }
    /**
     * Bind two bindable objects to each other.
     * @param {Bindable} target
     * @param {Bindable} source
     * @param {object} [options]
     * @param {boolean} [options.oneway] if true that bind target to source only, otherwise bind source to target as well
     * @returns {{dispose:function}} disposable to break the binding
     */
    function databind(target, source, options) {
        options = options || {};
        // устанавливаем начальное значение
        // В случае ошибки, исключение не будет обработано
        if (typeof target.set === "function" && typeof source.get === "function") {
            executeBinding(target, source);
        }
        var disposable1 = bindOneWay(target, source, options.debounceTarget);
        var disposable2 = !options.oneway ? bindOneWay(source, target, options.debounceSource) : undefined;
        if (!disposable1 || typeof disposable1.dispose !== "function") {
            return disposable2;
        }
        if (!disposable2 || typeof disposable2.dispose !== "function") {
            return disposable1;
        }
        return {
            dispose: function () {
                disposable1.dispose();
                disposable2.dispose();
            }
        };
    }
    exports.databind = databind;
    /**
     * @deprecated Use lang.support.loadingValue instead
     */
    exports.loading = lang.support.loadingValue;
    // endregion databind method
    // region html binding
    function parseString(v) {
        return v == null ? "" : v.toString();
    }
    function parseBool(v) {
        return !!v;
    }
    // стандартные опции, используемые при конструировании bindable значений для html-элементов
    exports.htmlBindingOptions = {
        text: {
            accessor: $.fn.text,
            parse: parseString
        },
        html: {
            accessor: $.fn.html,
            parse: parseString
        },
        value: {
            event: "change",
            accessor: $.fn.val,
            parse: parseString
        },
        valueLive: {
            // TODO: также надо детектировать cut/undo/redo
            event: "keyup paste change",
            accessor: $.fn.val,
            parse: parseString,
            eventHandler: function (e) {
                if (e.type === "paste") {
                    // NOTE: 'paste' event is triggered before input's value changed
                    var $this_1 = $(e.currentTarget || e.srcElement);
                    var callback = function () {
                        $this_1.change();
                    };
                    window.setTimeout(callback, 0);
                }
            }
        },
        disabled: {
            accessor: function (v) {
                var $this = this, tagName = ($this.length && $this[0].tagName), isForm = /(BUTTON|INPUT|OPTGROUP|OPTION|SELECT|TEXTAREA)/.test(tagName), tabindex;
                if (arguments.length > 0) {
                    // set:
                    if (v) {
                        if (isForm) {
                            $this.prop("disabled", true);
                        }
                        else {
                            $this.addClass("disabled");
                            $this.bind("click keydown keyup", false); // event handler returns false
                            // store tabIndex
                            tabindex = $this.attr("tabIndex");
                            if (tabindex) {
                                $this.data("tabIndex", tabindex);
                            }
                            $this.attr("tabIndex", -1);
                        }
                    }
                    else {
                        if (isForm) {
                            $this.prop("disabled", false);
                        }
                        else {
                            $this.removeClass("disabled");
                            $this.unbind("click keydown keyup", false);
                            // restore tabIndex
                            tabindex = $this.data("tabIndex");
                            if (tabindex) {
                                $this.attr("tabIndex", tabindex);
                                $this.removeData("tabIndex");
                            }
                            else {
                                $this.removeAttr("tabIndex");
                            }
                        }
                    }
                }
                else {
                    // get:
                    return isForm ? $this.prop("disabled") : $this.hasClass("disabled");
                }
            },
            parse: parseBool
        },
        enabled: {
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set:
                    exports.htmlBindingOptions.disabled.accessor.call(this, !v);
                }
                else {
                    // get:
                    return !exports.htmlBindingOptions.disabled.accessor.call(this);
                }
            },
            parse: parseBool
        },
        readonly: {
            accessor: function (v) {
                // TODO: jQuery 3.x: remove using removeAttr, use prop("readonly", true/false)
                if (arguments.length > 0) {
                    if (v) {
                        // set:
                        this.attr("readonly", true);
                    }
                    else {
                        // get:
                        this.removeAttr('readonly');
                    }
                }
                else {
                    return this.attr("readonly");
                }
            },
            parse: parseBool
        },
        visibility: {
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set:
                    (v) ? this.show() : this.hide();
                }
                else {
                    // get:
                    // NOTE: `!this.is(":visible")` не работает, если элемент еще не отрендерен
                    return this.css("display") !== "none";
                }
            },
            parse: parseBool
        },
        hidden: {
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set:
                    (v) ? this.hide() : this.show();
                }
                else {
                    // get:
                    // NOTE: `!this.is(":visible")` не работает, если элемент еще не отрендерен
                    return this.css("display") === "none";
                }
            },
            parse: parseBool
        },
        transparent: {
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set:
                    this.css("visibility", v ? "hidden" : "");
                }
                else {
                    // get:
                    return this.css("visibility") === "hidden";
                }
            },
            parse: parseBool
        },
        checked: {
            getSpecific: function ($element) {
                if ($element[0].type === "radio") {
                    return {
                        eventHandler: function (e) {
                            if (!$(e.target).prop("checked")) {
                                return;
                            }
                            $("input[name='" + e.target.name + "']:not(:checked)").trigger("change", false);
                        }
                    };
                }
            },
            event: "change",
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set
                    this.prop("checked", !!v);
                }
                else {
                    // get
                    return !!this.prop("checked");
                }
            },
            parse: parseBool
        },
        radioGroup: {
            event: "change",
            group: undefined,
            getSpecific: function () {
                var groupName = this.group, selector = "input[type='radio']";
                if (groupName) {
                    selector += "[name='" + groupName + "']";
                }
                return {
                    accessor: function (v) {
                        if (arguments.length > 0) {
                            // set (v - is a value of one of radio buttons)
                            this.find(selector + "[value='" + v + "']").prop("checked", true);
                        }
                        else {
                            // get
                            return this.find(selector + ":checked").attr("value");
                        }
                    }
                };
            }
        },
        checkedNull: {
            event: "change",
            accessor: function (v) {
                if (arguments.length > 0) {
                    // set
                    this.prop("checked", !!v);
                }
                else {
                    // get
                    return this.prop("checked") ? true : null;
                }
            }
        },
        select: {
            event: "change",
            accessor: $.fn.val,
            parse: parseString
        },
        optionsSource: {
            accessor: function (source) {
                var html = "";
                if (source) {
                    lang.forEach(source, function (value, key) {
                        html += "<option value='" + lang.encodeHtml(key) + "'>" + lang.encodeHtml(value) + "</option>";
                    });
                    this.html(html);
                }
            }
        },
        cssClass: {
            /**
             *
             * @param {Object|Array|String} [value]
             */
            accessor: function (value) {
                var that = this;
                if (arguments.length > 0) {
                    // setting:
                    value = value || {};
                    if (lang.isArray(value)) {
                        this.get(0).className = value.join(" ");
                    }
                    else if (lang.isString(value)) {
                        this.get(0).className = value;
                    }
                    else {
                        lang.forEach(value, function (toggle, className) {
                            that.toggleClass(className, !!toggle);
                        });
                    }
                }
                else {
                    // getting:
                    var currentClassNames = (this.get(0).className || "").split(/\s+/);
                    value = {};
                    if (currentClassNames.length === 1 && currentClassNames[0] === "") {
                        return value;
                    }
                    for (var i = 0; i < currentClassNames.length; i++) {
                        value[currentClassNames[i]] = true;
                    }
                    return value;
                }
            }
        },
        cssClassToggle: {
            cssClass: undefined,
            getSpecific: function ($element) {
                var className = this.cssClass || $element.attr("data-cssClassToggle");
                if (className) {
                    return {
                        accessor: function (value) {
                            if (arguments.length > 0) {
                                this.toggleClass(className, value);
                            }
                        }
                    };
                }
            }
        }
    };
    // отображение тэгов html-элементов на опции по умолчанию
    var htmlBindingOptionsByName = {
        input: exports.htmlBindingOptions.value,
        textarea: exports.htmlBindingOptions.value,
        checkbox: exports.htmlBindingOptions.checked,
        select: exports.htmlBindingOptions.select
    };
    var DisposableDataKey = "x-dispose";
    // shared args for "domChanged" event
    var domChangedEvenArgs = { binding: true };
    function setupNodeDisposables($element) {
        var disposables = $element.data(DisposableDataKey);
        if (!disposables) {
            disposables = [];
            $element.data(DisposableDataKey, disposables);
        }
        return disposables;
    }
    exports.setupNodeDisposables = setupNodeDisposables;
    /**
     * Create a new bindable object for a HTML element.
     * @param {HTMLElement|jQuery} el target HTMLDOME-element or jQuery-object for the binding
     * @param {String|Object} [options] Binding name or binding options (specification)
     * @param {String} [options.name] Binding name
     * @param {Function} [options.getSpecific] callback returning an `options` object for bindable - can be used for runtime customization (e.g. using of arguments in accessor function)
     * @param {Function} [options.accessor] function-accessor for setting and getting value to/from html-element
     * @param {Function} [options.parse]
     * @param {String} [options.event] event name
     * @param {Function} [options.eventHandler] An additional handler bound to the event
     * @return {Bindable}
    */
    function htmlBind(el, options) {
        if (!el) {
            throw new Error("binding.html: element is null");
        }
        var selector = $(el);
        if (!options) {
            if (selector.length) {
                // получаем опции по тэгу
                options = htmlBindingOptionsByName[selector[0].tagName.toLowerCase()];
            }
        }
        else if (typeof options === "string") {
            // получаем опции по имени
            options = exports.htmlBindingOptions[options];
        }
        else if (options.name) {
            options = lang.append(options, exports.htmlBindingOptions[options.name]);
        }
        // по умолчанию привязка к тексту
        if (!options) {
            options = exports.htmlBindingOptions.text;
        }
        // make TS compiler happy:
        options = options;
        // может быть уточнение для конкретного элемента
        if (options.getSpecific) {
            options = lang.extend({}, options, options.getSpecific(selector));
        }
        var accessor = options.accessor;
        var bindable = {};
        if (accessor) {
            bindable.get = function () {
                return accessor.call(selector);
            };
            bindable.set = function (v) {
                if (v === lang.support.loadingValue) {
                    v = null;
                }
                // make TS compiler happy:
                //options = <html.Options>options;
                if (options.parse) {
                    v = options.parse(v);
                }
                if (v !== accessor.call(selector)) {
                    accessor.call(selector, v);
                    selector.trigger("domChanged", domChangedEvenArgs);
                }
            };
        }
        if (options.event) {
            var eventHandler_1 = options.eventHandler;
            bindable.onchange = function (handler) {
                if (eventHandler_1) {
                    var original_1 = handler;
                    handler = function (e) {
                        eventHandler_1(e);
                        original_1(e);
                    };
                }
                selector.bind(options.event, handler);
                return {
                    dispose: function () {
                        selector.unbind(options.event, handler);
                    }
                };
            };
        }
        bindable.ondispose = function (disposable) {
            var disposables = setupNodeDisposables(selector);
            disposables.push(disposable);
        };
        bindable.setError = function (error) {
            if (error && error.message) {
                error = error.message;
            }
            if (this.error !== error) {
                this.error = error;
                $(this).trigger("bindingErrorChanged", this.error);
            }
        };
        return bindable;
    }
    exports.html = htmlBind;
    var oldCleanData = $.cleanData;
    $.cleanData = function (elems) {
        var el;
        for (var i = 0; (el = elems[i]) !== undefined; i++) {
            var disposables = $.data(el, DisposableDataKey);
            //disposables = el[DisposableDataKey];
            if (disposables && disposables.length) {
                disposables.forEach(function (disposable) {
                    disposable.dispose();
                });
            }
        }
        oldCleanData(elems);
    };
    // endregion html method
    // region expr binding
    var BindableExpression = /** @class */ (function () {
        /**
         * @see `"core.lang".observableExpression`
         * @constructs BindableExpression
         * @article [BindableExpression](docs:bindableexpression)
         * @param {*} source
         * @param {(Function|string)} expr
         */
        function BindableExpression(source, expr) {
            var that = this;
            that._source = source;
            that._expr = lang.observableExpression(expr, {
                onchange: function () { that.notify(); }
            });
            that._callbacks = [];
            // NOTE: после загрузки может поменяться исходный объект
            if (lang.support.isNotLoaded(that._source)) {
                that._source.load().done(function (loadedObj) {
                    that._source = loadedObj;
                });
            }
        }
        BindableExpression.prototype.dispose = function () {
            this._callbacks.length = 0;
            this._expr.dispose();
        };
        BindableExpression.prototype.notify = function () {
            var that = this, args = arguments;
            that._callbacks.forEach(function (callback) {
                callback.apply(that, args);
            });
        };
        BindableExpression.prototype.get = function () {
            return this._expr.call(this._source);
        };
        BindableExpression.prototype.set = function (v) {
            this._expr.call(this._source, v);
        };
        BindableExpression.prototype.onchange = function (callback) {
            var that = this;
            that._callbacks.push(callback);
            return {
                dispose: function () {
                    lang.arrayRemove(that._callbacks, callback);
                    if (!that._callbacks.length) {
                        that.dispose();
                    }
                }
            };
        };
        return BindableExpression;
    }());
    function exprBind(source, expr) {
        return new BindableExpression(source, expr);
    }
    exports.expr = exprBind;
    // for backward compatibility
    exports.domain = exprBind;
    // endregion expr binding
    function commandBind(element, cmd, args) {
        var onClick = function (e) {
            if (corehtml.isExternalClick(e)) {
                return;
            }
            e.preventDefault();
            if (cmd.canExecute()) {
                var $this = $(this);
                var name_1 = commands.dataCommandName($this) || cmd.name;
                var cmdArgs = lang.extend({}, args, { name: name_1 }, commands.dataCommandParams($this));
                var ret = cmd.execute(cmdArgs);
                if (ret === false) {
                    return false;
                }
            }
        };
        $(element).buttonClick(onClick);
        var disposable = databind(htmlBind(element, "enabled"), exprBind(cmd, "canExecute"));
        return {
            dispose: function () {
                $(element).unbind("click", onClick);
                disposable.dispose();
            }
        };
    }
    exports.commandBind = commandBind;
});
//# sourceMappingURL=binding.js.map