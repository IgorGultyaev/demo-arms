/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.jquery", "lib/core.lang", "lib/binding", "lib/core.diagnostics", "lib/ui/Part", "lib/ui/StatefulPart", "lib/formatters", "xhtmpl!lib/ui/templates/WaitingModal.hbs", "xhtmpl!lib/ui/templates/Each2.hbs", "i18n!lib/nls/resources", "handlebars-ext"], function (require, exports, $, lang, binding, diagnostics, Part, StatefulPart, formatters, waitingTemplate, each2Template, resources, Handlebars) {
    "use strict";
    // NOTE: define global object HBX which is used by generated code (by Handlebars.JavaScriptCompiler)
    // The extension contains 'get' method which is being used inside Handlebars.JavaScriptCompiler.prototype.nameLookup,
    // which in turn was extended by our xhtmpl rjs-plugin.
    // The 'get' method is being used for generating 'get' event on every property access.
    window["HBX"] = window["HBX"] || {
        get: lang.Observable.get
    };
    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        /**
         * @constructs View
         * @extends StatefulPart
         * @param {View.defaultOptions} options View options
         */
        function View(options) {
            var _this = this;
            options = View.mixOptions(options, View.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.unbound = that.options.unbound;
            that.suppressAutoLoad = that.options.suppressAutoLoad;
            that._isLoading = 0; // init loading counter
            if (that.options.template) {
                that.setTemplate(that.options.template);
            }
            if (that.options.viewModel) {
                that.setViewModel(that.options.viewModel);
            }
            return _this;
        }
        /**
         * Indicates that something is loading at the moment.
         * If the method is invoked without any arguments, it returns true if the internal loading counter is greater than zero.
         * If the method is invoked with an argument, it increase (an argument is true) or decrease (an argument is false)
         * the internal loading counter.
         * @param {boolean} [v]
         * @returns {boolean}
         */
        View.prototype.isLoading = function (v) {
            var that = this, name = "isLoading", n, old, args;
            if (!arguments.length) {
                n = that._isLoading;
                that.trigger("get", that, { prop: name, value: !!n });
                return !!n;
            }
            else {
                old = that._isLoading;
                if (v) {
                    n = old + 1;
                }
                else {
                    n = old - 1;
                }
                if (n < 0) {
                    console.error("isLoading counter is less than zero: " + v);
                }
                that._isLoading = n;
                args = { prop: name, value: !!n, oldValue: !!old };
                if (!!n != !!old) {
                    that.trigger("change:" + name, that, !!n, !!old);
                    that.trigger("change", that, args);
                }
                that.trigger("set", that, args);
                return !!n;
            }
        };
        View.prototype.setViewModel = function (viewModel) {
            var that = this, oldModel = that.viewModel;
            that.viewModel = viewModel;
            if (that.domElement && oldModel && oldModel !== viewModel) {
                that.rerender();
            }
        };
        View.prototype.setTemplate = function (template) {
            var that = this, expr;
            template = that.prepareTemplate(template);
            if (that.options.unbound) {
                that.template = template;
            }
            else {
                expr = lang.support.ObservableExpression.create(template, {
                    onchange: lang.debounce(that.onTemplateChange.bind(that)),
                    loadingValue: that.loadingValue,
                    suppressAutoLoad: that.suppressAutoLoad
                });
                that.template = function () {
                    var result = expr.evaluate(this, arguments);
                    that.onTemplateReturn(result);
                    return result;
                };
                that.template.dispose = function () {
                    expr.dispose();
                };
            }
        };
        /**
         *
         * @param {Function|string} template
         * @returns {Function}
         */
        View.prototype.prepareTemplate = function (template) {
            var that = this;
            template = View.compileTemplate(template);
            return that.options.unbound ?
                template :
                function () {
                    // NOTE: call 'isLoading' to observe changing of this property in the template
                    this.isLoading();
                    return template.apply(this, arguments);
                };
        };
        /**
         * Called when the observable template is changed.
         */
        View.prototype.onTemplateChange = function () {
            var that = this;
            // rerender if View isn't rendered yet and isn't disposed
            if (that.domElement && that.template) {
                that.rerender();
            }
        };
        /**
         * Called when the observable template returns.
         * @param {*} result
         */
        View.prototype.onTemplateReturn = function (result) {
            var that = this;
            // NOTE: it isn't enough to call 'isLoading(callCtx.isLoading)',
            // because isLoading can be set by external code
            if (result === that.loadingValue) {
                if (!that.template.isLoading) {
                    // set special flag indicating that loading was initiated by the template (not by external code)
                    that.template.isLoading = true;
                    that.isLoading(true);
                }
            }
            else {
                if (that.template.isLoading) {
                    // decrease isLoading counter if loading was initiated by the template only (not by external code)
                    that.isLoading(false);
                    that.template.isLoading = undefined;
                }
            }
        };
        View.prototype.doRender = function (domElement) {
            //var profile = Date.now();
            _super.prototype.doRender.call(this, domElement);
            var that = this, $container = that.$domElement, data, markup, loading;
            try {
                data = {
                    view: that,
                    callbacks: [],
                    context: that._renderContext ? lang.clone(that._renderContext) : {}
                };
                try {
                    markup = that.template(that.viewModel || that, { data: data });
                    if (that.options.unbound || !that.isLoading()) {
                        $container.html(markup);
                        View.applyCallbacks(data, $container);
                    }
                }
                finally {
                    if (!that.options.unbound && that.isLoading()) {
                        if (that.options.showWaitingAnimation && that.options.waitingTemplate) {
                            var waitingTemplate_1 = View.compileTemplate(that.options.waitingTemplate);
                            markup = waitingTemplate_1({ text: resources.wait });
                            $container.html(markup.toString());
                        }
                        else if (markup) {
                            $container.html(markup.toString());
                            $container.blocked(true);
                        }
                        loading = true;
                        // NOTE: if something is loading at the moment, template will be rerendered after loading.
                        // So there is no need to apply callbacks in this case.
                    }
                }
            }
            catch (error) {
                // if the error occurred during part's data is loading it doesn't mean a real error,
                // 'waiting' was already shown above
                if (loading) {
                    return;
                }
                if (!that.options.errorTemplate) {
                    throw error;
                }
                // render an error using errorTemplate
                console.error(error);
                try {
                    if (that.options.errorTemplate) {
                        markup = that.options.errorTemplate(error);
                        $container.html(markup);
                    }
                }
                catch (error2) {
                    console.error(error2);
                }
            }
            finally {
                that.notifyDOMChanged();
                // TODO: надо как-то включить сохранение времени рендеринга: $container.attr("data-render-time", Date.now() - profile);
            }
        };
        View.prototype.afterRender = function () {
            var that = this;
            if (that.isLoading()) {
                that.renderStatus(Part.RenderStatus.waiting);
            }
            else {
                _super.prototype.afterRender.call(this);
            }
        };
        View.prototype.unload = function (options) {
            if (this.$domElement) {
                // NOTE: the code below is optimized version of $(that.domElement).blocked(false);
                this.$domElement.removeClass("blocked");
            }
            _super.prototype.unload.call(this, options);
        };
        View.prototype.onReady = function () {
            this.trigger("render", this);
        };
        View.prototype.renderContext = function (v) {
            var that = this;
            if (arguments.length) {
                that._renderContext = v;
            }
            else {
                that._renderContext = that._renderContext || {};
            }
            return that._renderContext;
        };
        View.prototype.dispose = function (options) {
            var that = this;
            if (that.template) {
                if (that.template.dispose) {
                    that.template.dispose();
                }
                that.template = undefined;
            }
            _super.prototype.dispose.call(this, options);
        };
        /**
         * @deprecated Do not compile templates in runtime, use xhtmpl plugin to import templates instead
         */
        View.compileTemplate = function (template) {
            if (typeof template !== "function") {
                if (Handlebars.compile) {
                    template = Handlebars.compile(template, { data: true });
                }
            }
            return template;
        };
        View.newId = function () {
            return lang.uuid("x");
        };
        View.addCallback = function (data, callback, callbackArgs) {
            data.callbacks.push({
                func: callback,
                args: callbackArgs || []
            });
        };
        View.applyCallbacks = function (data, selector) {
            data.callbacks.forEach(function (callback) {
                var args = callback.args;
                args.push(selector);
                callback.func.apply(data.view, args);
            });
            data.callbacks.length = 0;
        };
        /**
         * Finds the specified DOM element.
         * @param {object} target Specifies target element.
         * @param {string} target.id The ID of the target element
         * @param {string} target.selector The jQuery selector of the target element
         * @param {JQuery} $root Root element that contains target element.
         * @param {boolean} [ignoreMissing] Ignore missing target
         * @returns {JQuery}
         */
        View.findElement = function (target, $root, ignoreMissing) {
            var id = typeof target === "string" ? target : target.id, element, $element;
            if (id) {
                // NOTE: document.getElementById is much faster then $.find("#id")
                element = document.getElementById(id);
                // NOTE: корневой элемент может быть не приаттачен к документу
                $element = element ? $(element) : $root.find("#" + id);
            }
            else if (target.selector === ":container") {
                $element = $root;
            }
            else {
                $element = $root.find(target.selector);
            }
            if (!$element.length) {
                if (ignoreMissing) {
                    return $element;
                }
                throw new Error("DOM element specified by target " + JSON.stringify(target) + " cannot be found");
            }
            return $element;
        };
        /**
         * @this {View}
         */
        View.renderChild = function (target, part, context, registerOptions, $root) {
            var element = View.findElement(target, $root);
            if (lang.isFunction(part)) {
                part = part();
                // NOTE: set disposeOnUnload, if it isn't specified explicitly
                registerOptions = lang.append(registerOptions || {}, { disposeOnUnload: true });
            }
            if (context && part.renderContext) {
                part.renderContext(context);
            }
            this.registerChild(part, registerOptions);
            // NOTE: теоретически парт уже может быть отрендерен, например логика синхронно среагировала на какое-то событие
            // и вызвала явно render. А потом асинхронно перестроилась вся view, содержащая этот парт
            if (part.renderStatus && part.renderStatus() !== "unloaded") {
                if (part.unload) {
                    part.unload();
                }
            }
            return part.render(element);
        };
        View.defaultOptions = {
            /**
             * Handlebars template to render the view. Usually you should load template via xhtml RequireJS-plugin
             * @type {Function}
             */
            template: undefined,
            /**
             * Handlebars template to render an error. Usually you should load template via xhtml RequireJS-plugin
             * @type {Function}
             */
            errorTemplate: function (error) { return "<span class='label label-danger'>" + error + "</span>"; },
            waitingTemplate: waitingTemplate,
            showWaitingAnimation: false,
            /**
             * Whether View should be bound to its viewModel changes or not. By default it's bound.
             * That means that View will rerender on every viewModel change.
             * @type {Boolean}
             */
            unbound: false,
            /**
             * ViewModel.
             * @type {*}
             */
            viewModel: undefined
        };
        View.Handlebars = Handlebars;
        return View;
    }(StatefulPart));
    View.mixin({
        defaultOptions: View.defaultOptions,
        traceSource: new diagnostics.TraceSource("ui.handlebars.View"),
        loadingValue: {
            toString: function () {
                return resources["loading"];
            }
        }
    });
    /**
     * @constant
     * @type {string}
     * @private
     */
    var LAST_ID_KEY = "-last-id";
    (function (View) {
        var HelperMarkup = /** @class */ (function () {
            /**
             * Provides some methods and properties for rendering Handlebars helpers
             * @constructs HelperMarkup
             * @param {Object} helperOptions
             * @param {Object} helperOptions.data
             * @param {Object} helperOptions.hash
             * @param {String} helperOptions.hash.target
             * @article (Helper "target")[docs:helper-target]
             */
            function HelperMarkup(helperOptions) {
                var that = this, data = helperOptions.data, target = helperOptions.hash.target, lastId;
                if (target === ":pop-id" || target === ":peek-id") {
                    lastId = data[LAST_ID_KEY];
                    if (!lastId) {
                        throw new Error("You must call {{push-id}} helper first.");
                    }
                    if (target === ":pop-id") {
                        data[LAST_ID_KEY] = undefined;
                    }
                    that.target = { id: lastId };
                }
                else if (target && target.length) {
                    that.target = { selector: target };
                }
                else {
                    that.target = { id: View.newId() };
                    that.inplace = true;
                }
                that.data = data;
                that._hash = helperOptions.hash;
                that.ignoreMissingTarget = helperOptions.hash["ignore-missing-target"];
            }
            /**
             * Returns a clone of the helper hash without service attributes
             * @returns {Object}
             */
            HelperMarkup.prototype.getHash = function () {
                var hash = lang.clone(this._hash);
                delete hash.target;
                delete hash["ignore-missing-target"];
                return hash;
            };
            /**
             * Returns helper HTML for using in Handlebars
             * @returns {Handlebars.SafeString}
             */
            HelperMarkup.prototype.getHtml = function () {
                var that = this, html = "";
                if (that.inplace) {
                    html = " id=\"" + that.target.id + "\" ";
                }
                return new Handlebars.SafeString(html);
            };
            return HelperMarkup;
        }());
        View.HelperMarkup = HelperMarkup;
        /**
         * @constructs ChildViewMarkup
         * @extends HelperMarkup
         */
        var ChildViewMarkup = /** @class */ (function (_super) {
            __extends(ChildViewMarkup, _super);
            function ChildViewMarkup() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChildViewMarkup.prototype.getHash = function () {
                var hash = _super.prototype.getHash.call(this);
                delete hash.tag;
                if (this.inplace) {
                    delete hash.cssClass;
                }
                return hash;
            };
            ChildViewMarkup.prototype.getHtml = function () {
                var that = this, html = "", tagName, cssClass;
                if (that.inplace) {
                    tagName = that._hash.tag || "span";
                    cssClass = that._hash.cssClass;
                    html = "<" + tagName + " id='" + that.target.id + "'"; // open tag
                    if (cssClass) {
                        html += " class='" + cssClass + "'";
                    } // class attribute
                    html += "></" + tagName + ">"; // close tag
                }
                return new Handlebars.SafeString(html);
            };
            ChildViewMarkup.prototype.getRegisterOptions = function (options) {
                var that = this, hash = that._hash;
                options = options || {};
                ["disposeOnUnload", "keepOnUnload", "trackStatus", "name"].forEach(function (key) {
                    var v = hash[key];
                    if (v !== undefined) {
                        options[key] = v;
                    }
                });
                return options;
            };
            /**
             * Add a callback that registers the child part and renders it
             * @param {Part|Function} part An instance of part of a factory that creates part
             * @param {Object} [options] default options for Part.registerChild method
             */
            ChildViewMarkup.prototype.registerPendingChild = function (part, options) {
                var that = this, data = that.data, registerOptions = that.getRegisterOptions(options);
                if (!data || !data.view) {
                    throw new Error("HB helper must be inside View template");
                }
                View.addCallback(data, View.renderChild, [that.target, part, data.context, registerOptions]);
            };
            return ChildViewMarkup;
        }(HelperMarkup));
        View.ChildViewMarkup = ChildViewMarkup;
    })(View || (View = {}));
    Handlebars.registerHelper("push-id", function (options) {
        var elementId = View.newId();
        options.data[LAST_ID_KEY] = elementId;
        return new Handlebars.SafeString(elementId);
    });
    Handlebars.registerHelper("peek-id", function (options) {
        var elementId = options.data[LAST_ID_KEY];
        return new Handlebars.SafeString(elementId);
    });
    Handlebars.registerHelper("pop-id", function (options) {
        var elementId = options.data[LAST_ID_KEY];
        options.data[LAST_ID_KEY] = undefined;
        return new Handlebars.SafeString(elementId);
    });
    Handlebars.registerHelper("pre", function (options) {
        return options.fn.call(this, options);
    });
    Handlebars.registerHelper("observe", function (context, options) {
        if (arguments.length === 1) {
            options = context;
            context = this;
        }
        var markup = new View.ChildViewMarkup(options), viewFactory = function () {
            return new View({
                template: options.fn,
                viewModel: context,
                suppressAutoLoad: options.data && options.data.view && options.data.view.suppressAutoLoad
            });
        };
        markup.registerPendingChild(viewFactory);
        return markup.getHtml();
    });
    Handlebars.registerHelper("observe-wait", function (context, options) {
        if (!context) {
            throw new Error("handlebars 'observe-wait' helper: context is null");
        }
        if (!options.hash || !options.hash.expr) {
            throw new Error("handlebars 'observe-wait' helper: expr attribute wasn't specified");
        }
        var markup = new View.ChildViewMarkup(options), viewFactory = function () {
            var view, waitExpr = lang.observableExpression(options.hash.expr, { onchange: function () {
                    var wait = waitExpr.call(context);
                    if (!wait && view._waiting) {
                        view._waiting = false;
                        view.isLoading(false);
                    }
                    else if (wait && !view._waiting) {
                        view._waiting = true;
                        view.isLoading(true);
                    }
                } }), inverse = function () {
                var res = options.inverse(context);
                if (!res) {
                    var waitingTemplate_2 = View.compileTemplate(View.defaultOptions.waitingTemplate);
                    res = waitingTemplate_2.apply(this, arguments);
                }
                return res;
            }, template = function () {
                var wait = waitExpr.call(context);
                if (wait) {
                    if (!view._waiting) {
                        view.isLoading(true);
                        view._waiting = true;
                    }
                    return lang.support.loadingValue.toString();
                }
                return options.fn.apply(this, arguments);
            };
            view = new View({
                template: template,
                showWaitingAnimation: true,
                waitingTemplate: inverse,
                viewModel: context,
                suppressAutoLoad: options.data && options.data.view && options.data.view.suppressAutoLoad
            });
            return lang.override(view, {
                dispose: function (base) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    waitExpr.dispose();
                    base.apply(this, args);
                }
            });
        };
        markup.registerPendingChild(viewFactory, { trackStatus: true });
        return markup.getHtml();
    });
    Handlebars.registerHelper("unbound", function (context, options) {
        var markup = new View.ChildViewMarkup(options), viewFactory = function () {
            return new View({
                template: options.fn,
                viewModel: context,
                unbound: true,
                suppressAutoLoad: options.data && options.data.view && options.data.view.suppressAutoLoad
            });
        };
        markup.registerPendingChild(viewFactory);
        return markup.getHtml();
    });
    Handlebars.registerHelper("observe-each", function (context, options) {
        if (!context) {
            throw new Error("handlebars 'observe-each' helper: context is null");
        }
        var items = context && typeof context.all === "function" ? context.all() : context, ret = "";
        // NOTE: просто вызываем хелпер observe для каждого элемента
        lang.forEach(items, function (item) {
            ret = ret + Handlebars.helpers["observe"](item, options);
        });
        return ret;
    });
    /**
     * Наход DOM-элемент, соответствующий элементу коллекции (item).
     * @param {JQuery} $collection Корневой элемент коллекции
     * @param item Элемент коллекци
     * @param opts Опции байндинга
     * @returns {JQuery}
     */
    function getCollectionItemElement($collection, item, opts) {
        var matchAttr = opts.attr;
        // NOTE: в случае таблицы может появиться tbody между table на который указывает target хелпера и tr, которые выводит шаблон
        // TODO: наверное надо опцию при включении которой ищем "*", а по умолчанию как ">*"
        var q = $collection[0].tagName === "TABLE" ? "*" : ">*";
        var prop;
        if (opts.prop) {
            prop = lang.get(item, opts.prop);
        }
        else {
            // TODO: Это не работает для удаленных обектов (removed) - надо передавать индексы удаленных в параметрамх события
            // prop = collection.indexOf(item);
            throw new Error("each2 helper: missing required argument prop");
        }
        return $collection.find(q + "[" + matchAttr + "='" + prop + "']");
    }
    function collectionBind(data, target, collection, that, execIteration, inverse, opts, $root) {
        var element = View.findElement(target, $root);
        if (!collection) {
            return "";
        }
        var matchAttr = opts.attr;
        var q = ">*";
        if (element[0].tagName === "TABLE") {
            q = "*";
        }
        var disposable = collection.subscribe("change", function (sender, args) {
            var dataNew = lang.extend({}, data);
            dataNew.callbacks = [];
            var count = collection.count();
            if (count === 0) {
                // коллекция стала пустой
                element.html(inverse(that));
                return;
            }
            if (args.removed) {
                for (var _i = 0, _a = args.removed; _i < _a.length; _i++) {
                    var item = _a[_i];
                    getCollectionItemElement(element, item, opts).remove();
                }
            }
            if (args.added) {
                // если коллекция была пустая (т.е. ничего не удаляли), то надо очистить элемент, т.к. в нем может быть результат else
                if (count === args.added.length && (!args.removed || !args.removed.length)) {
                    element.empty();
                }
                if (args.addedIndices && args.addedIndices.length === args.added.length) {
                    if (count === args.added.length) {
                        // все что добавили, это теперь текущая коллкция, поэтому insert эквивалентен add
                        var ret = "";
                        for (var i = 0; i < args.added.length; i++) {
                            ret += execIteration(dataNew, i, i, count);
                        }
                        $(ret).appendTo(element);
                    }
                    else {
                        // insert into the middle
                        for (var i = 0; i < args.added.length; i++) {
                            var targetIdx = args.addedIndices[i];
                            html = execIteration(dataNew, targetIdx + i, targetIdx + i, count);
                            var nodeInsert = void 0;
                            if (targetIdx > 0) {
                                var item = collection.get(targetIdx - 1);
                                nodeInsert = getCollectionItemElement(element, item, opts);
                                $(html).insertAfter(nodeInsert);
                            }
                            else {
                                // targetIdx==0, (в коллекции были элементы до вставки)
                                // найдем первый DOM-элемент и вставим перед ним
                                nodeInsert = element.find(q + "[" + matchAttr + "]").first();
                                $(html).insertBefore(nodeInsert);
                            }
                        }
                    }
                }
                else {
                    // there're no indices, so we'll add new items at the bottom
                    var ret = "";
                    for (var i = count - args.added.length; i < count; i++) {
                        ret += execIteration(dataNew, i, i, count);
                    }
                    $(ret).appendTo(element);
                }
            }
            //
            View.applyCallbacks(dataNew, element);
        });
        binding.setupNodeDisposables(element).push(disposable);
        var count = collection.count();
        var html = "";
        // данный метод вызывает в рамках applyCallbacks дочернего вью CollectionView, т.е. при итерации data.callbacks.
        // в процессе рендеринга (execIteration) могут добавляться дополнительные колбэки (байндинги/дочерние view),
        // их нельзя добавлять в тот же data, т.к. итерация уже идет,
        // кроме того необходимо добавить созданный html ДО вызова этих колбеков
        var dataNew = lang.extend({}, data);
        dataNew.callbacks = [];
        for (var i = 0; i < count; i++) {
            html += execIteration(dataNew, i, i, count);
        }
        if (count === 0) {
            html = inverse(that);
        }
        element.html(html);
        View.applyCallbacks(dataNew, element);
        // для каждого dom-элемента, соответствующему элементу коллекции, надо установить атрибиты
        if (count > 0) {
            element.children().each(function (index, elem) {
                if (opts.prop) {
                    elem.setAttribute(matchAttr, lang.get(collection.get(index), opts.prop));
                }
                else {
                    elem.setAttribute(matchAttr, index.toString());
                }
            });
        }
    }
    var CollectionView = /** @class */ (function (_super) {
        __extends(CollectionView, _super);
        function CollectionView(options) {
            var _this = _super.call(this, options) || this;
            _this.bindOptions = options.bindOptions;
            return _this;
        }
        return CollectionView;
    }(View));
    Handlebars.registerHelper("each2", function (context, options) {
        // NOTE: ожидаем, что context - это ObservableCollection
        var data = options.data;
        var markup = new View.ChildViewMarkup(options);
        if (data.view && data.view instanceof CollectionView) {
            // мы уже внутри CollectionView (шаблон тот же)
            View.addCallback(data, collectionBind, [data].concat(data.view.bindOptions));
            return markup.getHtml();
        }
        // первый вызов хелпера - обернем шаблон хелпера в CollectionView с самим собой в качестве шаблона
        if (!context) {
            if (options.inverse) {
                return options.inverse(this);
            }
            return "";
        }
        if (!lang.ObservableCollection.isObservableCollection(context)) {
            throw new Error("each2 helper expects context to be an ObservableCollection");
        }
        var fn = options.fn;
        // NOTE: код execIteration практически без изменений взят из Handlebars
        function execIteration(data, field, index, last) {
            if (data) {
                data.key = field;
                data.index = index;
                data.first = index === 0;
                data.last = !!last;
                /*if (contextPath) {
                 data.contextPath = contextPath + field;
                 }*/
            }
            return fn(context.get(field), {
                data: data,
                blockParams: Handlebars.Utils.blockParams([context[field], field], [field, null])
            });
        }
        var opts = {
            // matchBy: options.hash["match-prop"] ? "prop" : "index",
            prop: options.hash["match-prop"],
            attr: options.hash["match-attr"] || "data-match"
        };
        if (!opts.prop) {
            throw new Error("each2 helper: missing required argument 'match-prop'");
        }
        var that = this;
        var viewFactory = function () {
            return new CollectionView({
                template: each2Template,
                viewModel: context,
                bindOptions: [markup.target, context, that, execIteration, options.inverse, opts],
                suppressAutoLoad: options.data && options.data.view && options.data.view.suppressAutoLoad
            });
        };
        markup.registerPendingChild(viewFactory);
        return markup.getHtml();
    });
    var hb_each_helper = Handlebars.helpers["each"];
    Handlebars.registerHelper("each", function (context, options) {
        var items = context && typeof context.all === "function" ? context.all() : context;
        return hb_each_helper(items, options);
    });
    function databind(markupHelper, obj, propName, bindingName, $root) {
        var element;
        var target = markupHelper.target;
        try {
            element = View.findElement(target, $root, markupHelper.ignoreMissingTarget);
        }
        catch (e) {
            throw new Error("View: data-bind helper ('" + bindingName + "') failed to find DOM-element for expression '" + propName + "'. Original error: " + e);
        }
        if (!element.length && markupHelper.ignoreMissingTarget) {
            return;
        }
        var bindableElement = binding.html(element, bindingName);
        var bindableProp = binding.expr(obj, propName);
        binding.databind(bindableElement, bindableProp);
    }
    Handlebars.registerHelper("data-bind", function (options) {
        var that = this, markup = new View.HelperMarkup(options);
        lang.forEach(markup.getHash(), function (value, key) {
            View.addCallback(options.data, databind, [markup, that, value, key]);
        });
        return markup.getHtml();
    });
    function databindblock(markupHelper, obj, hash, $root) {
        var target = markupHelper.target;
        var propName = hash.expr || hash.prop;
        var element;
        try {
            element = View.findElement(target, $root, markupHelper.ignoreMissingTarget);
        }
        catch (e) {
            throw new Error("View: data-bind helper failed to find DOM-element for expression '" + propName + "'. Original error: " + e);
        }
        if (!element.length && markupHelper.ignoreMissingTarget) {
            return;
        }
        var bindableElement = binding.html(element, hash), bindableProp = binding.expr(obj, propName);
        binding.databind(bindableElement, bindableProp);
    }
    Handlebars.registerHelper("data-bind-block", function (options) {
        var that = this, markup = new View.HelperMarkup(options), hash = markup.getHash();
        View.addCallback(options.data, databindblock, [markup, that, hash]);
        return markup.getHtml();
    });
    function toggleClassBind(target, obj, propName, cssClass, $root) {
        var element = View.findElement(target, $root), bindableElement = binding.html(element, { name: "cssClassToggle", cssClass: cssClass }), bindableProp = binding.expr(obj, propName);
        binding.databind(bindableElement, bindableProp);
    }
    /**
     * HB-Helper "toggleClass"
     * @example
     * <span {{toggleClass -disabled="disabled"}}></span>
     * Element will get css class '-disabled' when and only when the expression "disabled" will be true.
     * In the simplest case expression is a prop name in the current context
     */
    Handlebars.registerHelper("toggleClass", function (options) {
        var that = this, markup = new View.HelperMarkup(options);
        lang.forEach(markup.getHash(), function (value, key) {
            View.addCallback(options.data, toggleClassBind, [markup.target, that, value, key]);
        });
        return markup.getHtml();
    });
    function commandbind(markupHelper, cmd, args, $root) {
        var target = markupHelper.target;
        if (!cmd) {
            throw new Error("Error in command-binding for element with target " + JSON.stringify(target) + ": no command");
        }
        var element = View.findElement(target, $root, markupHelper.ignoreMissingTarget);
        if (!element.length && markupHelper.ignoreMissingTarget) {
            return;
        }
        binding.commandBind(element, cmd, args);
    }
    Handlebars.registerHelper("command-bind", function (context, options) {
        if (!context && (!options || !options.hash.canBeEmpty)) {
            throw new Error("handlebars 'command-bind' helper: context is null");
        }
        if (!context) {
            return null;
        }
        var markup = new View.HelperMarkup(options);
        View.addCallback(options.data, commandbind, [markup, context, markup.getHash()]);
        return markup.getHtml();
    });
    Handlebars.registerHelper("render", function (context, options) {
        if (!context) {
            throw new Error("handlebars 'render' helper: context is null");
        }
        if (options.hash && options.hash.index !== undefined && lang.isArray(context)) {
            context = context[options.hash.index];
        }
        var markup = new View.ChildViewMarkup(options);
        markup.registerPendingChild(context);
        return markup.getHtml();
    });
    Handlebars.registerHelper("expr", function (context) {
        var expr = lang.support.ExpressionFactory.get(context);
        return expr.call(this);
    });
    /**
     * @deprecated Use 'compare' helper
     */
    Handlebars.registerHelper("if-eq", function (v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    /**
     * @deprecated Use standard 'unless' helper
     */
    Handlebars.registerHelper("if-not", function (v, options) {
        if (!v) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper("if-not-last", function (options) {
        var len = options.hash.total, index;
        if (len === undefined) {
            throw new Error("handlebars 'if-not-last' helper: total length is undefined");
        }
        if (options.data) {
            index = options.data.index;
        }
        if (index !== len - 1)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    var hb_compare_operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };
    Handlebars.registerHelper("compare", function (lvalue, operator, rvalue, options) {
        if (arguments.length < 3) {
            throw new Error("Handlebars Helper 'compare' needs at least 2 arguments");
        }
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        var op = hb_compare_operators[operator];
        if (!op) {
            throw new Error("Handlebars Helper 'compare': unknown operator " + operator);
        }
        var result = op(lvalue, rvalue);
        if (result) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper("first", function (context, options) {
        // NOTE: this helper is mostly copy-paste of 'each' helper
        var fn = options.fn, inverse = options.inverse;
        var data, key;
        if (options.data) {
            data = Handlebars.createFrame(options.data);
        }
        if (context) {
            if (lang.ObservableCollection.isObservableCollection(context)) {
                return fn(context.get(0), { data: data });
            }
            if (lang.isArray(context)) {
                if (context.length > 0)
                    return fn(context[0], { data: data });
            }
            else {
                key = Object.keys(context)[0];
                if (key)
                    return fn(context[key], { data: data });
            }
        }
        return inverse(this);
    });
    Handlebars.registerHelper("debug", function (optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
        if (optionalValue) {
            console.log("Value");
            console.log("====================");
            console.log(optionalValue);
        }
    });
    Handlebars.registerHelper("format", function () {
        var context = arguments.length > 1 ? arguments[0] : this, // context is optional
        options = arguments[arguments.length - 1], hash = options.hash, formatter = hash.formatter;
        if (lang.isFunction(formatter)) {
            // formatter-as-function:
            //   {{format "prop1" formatter=this.['getFormatted']}} => this.getFormatted("prop1)
            //   {{format prop1 "value1" formatter=options.['myFormatter']}} => options.myFormatter(prop1_val,"value1")
            // pass all arguments except the last one (it's options) to the formatter
            var args = lang.concatExceptLast.apply(null, arguments);
            return formatter.apply(this, args);
        }
        var prop = hash.prop;
        if (prop) {
            // prop-as-string:
            //    {{format prop="prop1" vt="date" format="LL"}}
            // try to get domain metadata
            var propMeta = context.meta && context.meta.props && context.meta.props[prop];
            if (propMeta) {
                hash = lang.extend({}, propMeta, hash);
            }
            // move context to property value
            context = lang.get(context, prop);
        }
        return formatters.formatPropValue(hash, context);
    });
    Handlebars.registerHelper("or", function () {
        // NOTE: omit the last argument - options
        for (var i = 0; i < arguments.length - 1; i++) {
            var v = arguments[i];
            if (v) {
                return true;
            }
        }
        return false;
    });
    Handlebars.registerHelper("and", function () {
        // NOTE: omit the last argument - options
        for (var i = 0; i < arguments.length - 1; i++) {
            var v = arguments[i];
            if (!v) {
                return false;
            }
        }
        return arguments.length > 1;
    });
    Handlebars.registerHelper("not", function () {
        return !arguments[0];
    });
    // Process another template in the same context
    Handlebars.registerHelper("template", function (template, options) {
        if (!template) {
            return null;
        }
        if ((lang.isPlainObject(template) || lang.isArray(template))) {
            if (options.hash.key === undefined) {
                throw "HB-helper template: template is an object or array but no key in hash specified";
            }
            template = template[options.hash.key];
            if (!template) {
                return null;
            }
        }
        template = View.compileTemplate(template);
        var data = options.data ? Handlebars.createFrame(options.data) : undefined, markup = template(options.hash.context || this, { data: data });
        return new Handlebars.SafeString(markup);
    });
    Handlebars.registerHelper("object", function (options) {
        return options.hash;
    });
    return View;
});
//# sourceMappingURL=View.js.map