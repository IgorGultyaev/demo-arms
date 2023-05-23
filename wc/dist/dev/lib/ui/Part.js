/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/core.html", "./.ui.types"], function (require, exports, $, lang, html, types) {
    "use strict";
    var Part = /** @class */ (function (_super) {
        __extends(Part, _super);
        /**
         * Common base class for a part implementation. A part should implement at least one method - `render`.
         * But this class also support some common practice for part.
         * @article [Part](docs:part)
         * @constructs Part
         * @extends Observable
         */
        function Part(options) {
            var _this = _super.call(this) || this;
            if (!_this.options) {
                _this.options = options || {};
            }
            else {
                // backward compatibility (before TS 1.8)
                if (options && options !== _this.options) {
                    _this.options = lang.appendEx(_this.options, options, { deep: true });
                }
            }
            _this.tweakOptions(_this.options);
            // initial state for `renderStatus` property - `unloaded`
            _this["_renderStatus"] = Part.RenderStatus.unloaded;
            return _this;
            //this.renderStatus(Part.prototype.renderStatuses.unloaded);
        }
        /**
         * @observable-property {Part.RenderStatus}
         * @description Current state of part rendering.
         *  lifecycle: unloaded -> ready -> unloaded
         *  lifecycle: unloaded -> waiting -> unloaded -> ready -> unloaded
         *  @since 0.17
         */
        Part.prototype.renderStatus = function (v) {
            if (!arguments.length) {
                return Part._get(this, "renderStatus");
            }
            var args = Part._set(this, "renderStatus", v);
            if (args) {
                this.onRenderStatusChange(v, args.oldValue);
            }
        };
        Part.prototype.onRenderStatusChange = function (value, oldValue) {
            var that = this;
            if (value === Part.RenderStatus.ready) {
                that.onReady();
                that.trigger("ready", that);
            }
            else {
                if (oldValue === Part.RenderStatus.ready) {
                    that.onUnready();
                }
                if (value === Part.RenderStatus.unloaded) {
                    that.trigger("unload", that);
                }
                else if (value === Part.RenderStatus.waiting) {
                    that.trigger("waiting", that);
                }
            }
        };
        /**
         * @deprecated Use static method Part.mixOptions
         */
        Part.prototype.mixOptions = function (options, defaultOptions) {
            if (defaultOptions && defaultOptions === this.options) {
                throw new Error("Field 'this.options' references to defaultOptions objects. Don't define field 'options' in the prototype.");
            }
            return Part.mixOptions(this.options || options, defaultOptions);
        };
        /**
         * Формирует опции парта, задавая значения по умолчанию.
         * Вызывать в конструкторе парта ДО вызова родительского конструктора. Не переопределяйте этот метод.
         * Если вы используете этот метод, не определяйте поле options в прототипе класса.
         * Вычисление runtime опций, зависящих от других опций, рекомендуется выполнять непосредственно в конструкторе
         * перед вызовом базового конструктора. Также можно переопределить метод `tweakOptions` (но не вызывать его).
         * @static
         * @param {Object} options Опции, переданные в конструктор
         * @param {Object} defaultOptions Опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя `this` (иначе возможно некорректное поведение при наследовании).
         * @returns {*}
         * @example
         * constructor: function (options) {
         *     options = MyPart.mixOptions(options, MyPart.prototype.defaultOptions);
         *     options.superOption = options.myOption; // fill runtime options (you can override `tweakOptions` also)
         *     MyPart.Super.call(this, options);
         *     // some code
         * },
         * defaultOptions: {
         *     // some options
         * }
         */
        Part.mixOptions = function (options, defaultOptions) {
            return lang.appendEx(options || {}, defaultOptions, { deep: true });
        };
        /**
         * @deprecated Use static method Part.mixContextOptions
         */
        Part.prototype.mixContextOptions = function (options, defaultOptions, contextDefaultOptions) {
            return Part.mixContextOptions(this.options || options, defaultOptions, contextDefaultOptions);
        };
        /**
         * Формирует опции парта с учетом контекста. Фактически данный метод формирует defaultOptions с учетом контекста,
         * а затем вызывает `mixOptions`.
         * Вызывать в конструкторе парта ДО вызова родительского конструктора. Не переопределяйте этот метод.
         * Вычисление runtime опций, зависящих от других опций, рекомендуется выполнять непосредственно в конструкторе
         * перед вызовом базового конструктора. Также можно переопределить метод `tweakOptions` (но не вызывать его).
         * @static
         * @param {Object} options Опции, переданные в конструктор
         * @param {Object} defaultOptions Опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя this (иначе возможно некорректное поведение при наследовании).
         * @param {Object} [contextDefaultOptions] Контекстные опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя this (иначе возможно некорректное поведение при наследовании).
         * @returns {*}
         * @example
         * constructor: function (options) {
         *     options = MyPart.mixContextOptions(options, MyPart.prototype.defaultOptions, MyPart.prototype.contextDefaultOptions);
         *     options.superOption = options.myOption; // fill runtime options (you can override `tweakOptions` also)
         *     MyPart.Super.call(this, options);
         *     // some code
         * },
         * defaultOptions: {
         *     // some options
         * }
         * contextDefaultOptions: {
         *     filter: {
         *	       commandsOptions: {
         *             Select: {
         *                 openInDialog: true
         *             }
         *         }
         *     }
         * }
         */
        Part.mixContextOptions = function (options, defaultOptions, contextDefaultOptions) {
            var contextName, contextOptions;
            if (options && contextDefaultOptions &&
                (contextName = options.contextName) &&
                (contextOptions = contextDefaultOptions[contextName])) {
                defaultOptions = lang.extendEx({}, defaultOptions, contextOptions, { deep: true });
            }
            // NOTE: `this` is a class here, not an instance
            return this.mixOptions(options, defaultOptions);
        };
        /**
         * Корректирует опции парта, вычисляя их значения в runtime.
         * Переопределите этот метод, если необходимо вычислить значения опций в зависимости от некоторых runtime условий.
         * Типичное использование - задать значение одной опции в зависимости от другой опции (например, в зависимости
         * от опции текущего класса нужно задать значение для опции базового класса). Подобную инициализацию также можно
         * выполнять непосредственно в конструкторе перед вызовом базового конструктора.
         * Если необходимо просто задать значения опций по умолчанию и они известны в design time, то удобней использовать
         * методы `mixOptions` и `mixContextOptions`.
         * Не вызывайте данный метод из наследников, он должен вызываться только в базовом конструкторе класса Part.
         * @param {Object} options Опции парта (после задания значений по умолчанию). Всегда заданы.
         * @virtual
         * @example
         * constructor: function (options) {
         *     options = MyPart.mixOptions(options, MyPart.prototype.defaultOptions);
         *     MyPart.Super.call(this, options);
         *     // some code
         * },
         * defaultOptions: {
         *     // some options
         * },
         * tweakOptions: function (options) {
         *     options.superOption = options.myOption;
         *     MyPart.Super.prototype.tweakOptions.call(this, options);
         * }
         */
        Part.prototype.tweakOptions = function (options) {
            // do not change anything by default
        };
        Part.prototype.applyHostContext = function (opt) {
            var navOpts = this.options.navigateOptions;
            if (navOpts && navOpts.openInDialog) {
                opt.host = "dialog";
            }
            var dlgOpts;
            if (opt.host === "dialog" && this.getDialogOptions) {
                // for backward compatibility before 1.26:
                dlgOpts = {
                    dialogOptions: this.getDialogOptions()
                };
            }
            if (navOpts || dlgOpts) {
                return lang.extendEx({}, dlgOpts, navOpts, { deep: true });
            }
        };
        Part.prototype.mixHostOptions = function (host, hostDefaultOptions) {
            if (host && hostDefaultOptions) {
                // TODO: это перезапишит опции, заданные в конструкторе!
                this.options = lang.extendEx(this.options, hostDefaultOptions[host], { deep: true });
            }
        };
        /**
         * Bind the part with a view model.
         * @param {Object} viewModel
         */
        Part.prototype.setViewModel = function (viewModel) {
            /**
             * @description View model of the part. It's a way to associate logic (part) with data (viewModel). View model should be set via `setViewModel` method.
             * @type {*}
             * */
            this.viewModel = viewModel;
        };
        /**
         * Bind the part with NavigationService.
         * @param {NavigationService} navigationService
         */
        Part.prototype.setNavigationService = function (navigationService) {
            var that = this;
            /**
             * @description Navigation service which can be used by the part to navigate to nested parts.
             * @type {NavigationService}
             */
            that.navigationService = navigationService;
            if (that._children) {
                that._children.forEach(function (child) {
                    if (child.part.setNavigationService) {
                        child.part.setNavigationService(navigationService);
                    }
                });
            }
        };
        /**
         * Render the part into DOM element. Core method of presentation model.
         * @param {JQuery|HTMLElement} domElement Part's container element
         */
        Part.prototype.render = function (domElement) {
            var that = this;
            that._throwIfDisposed();
            that.beforeRender(domElement);
            var task = that.doRender(domElement);
            if (lang.isPromise(task) && task.state() === "pending") {
                that.renderStatus(Part.RenderStatus.waiting);
                task.always(function () {
                    that.afterRender();
                });
                return task;
            }
            that.afterRender();
            return task;
        };
        /**
         * It's called in the begging of Part.render.
         * By default the method does nothing (extension point).
         * @param {HTMLElement|JQuery} domElement Part's container element
         */
        Part.prototype.beforeRender = function (domElement) {
        };
        /**
         * Does all heavy lifting of rendering.
         * Default implementation just sets renderStatus to `RenderStatuses.rendering` and assigns `domElement` field.
         * It's the method it's recommended to override (instead of `render`).
         * @param {HTMLElement|JQuery} domElement Part's container element
         */
        Part.prototype.doRender = function (domElement) {
            var that = this;
            if (!domElement) {
                throw new Error("Part.render was called without domElement");
            }
            if (that.domElement) {
                throw new Error("Part.render was called repeatedly without unload ");
            }
            that.renderStatus(Part.RenderStatus.rendering);
            that.$domElement = $(domElement);
            that.domElement = that.$domElement[0];
        };
        /**
         * It's called at the end of part's rendering.
         * By default the method updates `renderStatus` taking into account children's states.
         */
        Part.prototype.afterRender = function () {
            var that = this;
            if (that._children) {
                that._children.forEach(function (child) {
                    if (child.part.renderStatus && child.trackStatus /*&& child.part.renderStatus() !== Part.RenderStatus.ready*/) {
                        child.subscription = child.part.subscribe("change:renderStatus", function childRenderStatusChangeHandler(sender, value) {
                            if (value === Part.RenderStatus.rendering) {
                                that.renderStatus(Part.RenderStatus.rendering);
                            }
                            else if (that.renderStatus() !== Part.RenderStatus.unloaded) {
                                // NOTE: if current part is already unloaded then ignore the child status changing
                                that._updateRenderStatus(false);
                            }
                        });
                    }
                });
            }
            //
            that._updateRenderStatus(true);
        };
        Part.prototype._updateRenderStatus = function (afterRender) {
            var that = this, allready = true;
            if (that._children) {
                allready = that._children.every(function (child) {
                    return !child.trackStatus || !child.part.renderStatus
                        || child.part.renderStatus() === Part.RenderStatus.ready
                        || afterRender && child.part.renderStatus() === Part.RenderStatus.unloaded;
                });
            }
            if (allready) {
                that.renderStatus(Part.RenderStatus.ready);
            }
            else {
                that.renderStatus(Part.RenderStatus.waiting);
            }
        };
        /**
         * The method is called on "ready" event which is fired when `renderStatues` changes to `rendered`.
         * By default the method does nothing (extension point).
         * Please note that the method is subscribed on the event in `Part.constructor`. So a descendant class should not forget to call the base constructor.
         * @since 0.17
         */
        Part.prototype.onReady = function () { };
        /**
         * The method is called on "unload" and "waiting" events which are fired when `renderStatues` changes to `unloaded` and `waiting`.
         * By default the method does nothing (extension point).
         * Please note that the method is subscribed on the event in `Part.constructor`. So a descendant class should not forget to call the base constructor.
         * @since 0.17
         */
        Part.prototype.onUnready = function () { };
        /**
         * Helper method for generating DOM event `domChanged` on part's element.
         * Actually it uses html.notifyDOMChanged method.
         */
        Part.prototype.notifyDOMChanged = function () {
            html.notifyDOMChanged(this.domElement);
        };
        /**
         * Unload the part and render it again in the same DOM element.
         */
        Part.prototype.rerender = function () {
            var $domElement = this.$domElement;
            if (!$domElement) {
                throw new Error("Part.rerender was called without render");
            }
            //that.renderStatus(RenderStatus.rendering);
            this.unload({ reason: "rerender" });
            this.render($domElement);
            // TODO: highlight in debug
        };
        /**
         * Unload the part and its children.
         */
        Part.prototype.unload = function (options) {
            var rerender = options && options.reason === "rerender", that = this, i, child;
            if (that.isDisposed) {
                return;
            }
            if (!rerender) {
                that.renderStatus(Part.RenderStatus.unloaded);
            }
            // unload children, if a child was created during render then we'll dispose and remove it
            if (that._children) {
                for (i = that._children.length - 1; i >= 0; i--) {
                    child = that._children[i];
                    // NOTE: reason='rerender' нельзя передавать в дочерний парт,
                    // иначе он решит, что он ререндерится и не установит renderStatus в 'unload'.
                    that._unloadChild(child, options && options.reason !== "rerender" ? options : undefined);
                    if (child.disposeOnUnload || !child.keepOnUnload) {
                        that._children.splice(i, 1);
                    }
                }
            }
            if (that.$domElement) {
                // NOTE (to commented below): domElement is NOT privately owned by the part, e.g. parent part
                // has access to the same DOM element and can subscribe to some DOM event on it. Therefore
                // it's incorrect to unsubscribe all handlers from all events:
                // 	$(that.domElement).off()
                // Every part should unsubscribe its own handlers itself.
                var $element = that.$domElement;
                $element.empty();
                // if there were handlers for namespaced events (subscribed via jqOn), remove them all at once
                if (that._jqEventNs) {
                    $element.off(that._jqEventNs);
                    that._jqEventNs = undefined;
                }
            }
            that.domElement = undefined;
            that.$domElement = undefined;
        };
        /**
         * Dispose the part and its children. If it's needed unload first.
         * The instance should not be used after call of dispose.
         */
        Part.prototype.dispose = function (options) {
            var that = this;
            if (that.isDisposed) {
                return;
            }
            if (that.domElement) {
                that.unload(lang.append({}, options, { reason: "dispose" }));
            }
            if (that._children) {
                that._children.forEach(function (child) {
                    if (child.part.dispose) {
                        child.part.dispose(options);
                    }
                });
                that._children.length = 0;
            }
            _super.prototype.dispose.call(this);
            that.viewModel = undefined;
            that.navigationService = undefined;
            that.isDisposed = true;
        };
        Part.prototype._throwIfDisposed = function () {
            if (this.isDisposed) {
                throw new Error("Part was disposed");
            }
        };
        /**
         * Register a child part
         * @param {Part} part
         * @param {Object|Boolean} [options]
         * @param {Boolean} [options.disposeOnUnload] dispose the child part on current part unload
         * @param {Boolean} [options.keepOnUnload] reuse the child part on unload, i.e. unload it but keep the reference
         * @param {Boolean} [options.trackStatus] create dependent binding for renderStatus of the current part on child's renderStatus
         * @param {Boolean} [options.name] name of the child part, can be used in `getChild`
         * @since 0.17
         */
        Part.prototype.registerChild = function (part, options) {
            var that = this, i, child, item = { part: part };
            that._throwIfDisposed();
            if (lang.isBoolean(options)) {
                item.disposeOnUnload = options;
            }
            else if (options) {
                item.disposeOnUnload = options.disposeOnUnload;
                item.keepOnUnload = options.keepOnUnload;
                item.name = options.name;
                item.trackStatus = options.trackStatus;
            }
            if (!that._children) {
                that._children = [];
            }
            else if (that._children.length) {
                for (i = that._children.length - 1; i >= 0; i--) {
                    child = that._children[i];
                    if (child && child.part === part) {
                        // the part is already registered, just overwrite its options
                        lang.extendEx(child, item, {});
                        return;
                    }
                }
            }
            if (that.navigationService && part.setNavigationService) {
                part.setNavigationService(that.navigationService);
            }
            that._children.push(item);
        };
        /**
         * Return a registered child part by name or by index.
         * @param {String|Number} name Name or index of child part
         * @return {Part}
         * @since 0.17
         */
        Part.prototype.getChild = function (name) {
            var that = this, i, child;
            if (that._children) {
                if (lang.isNumber(name)) {
                    child = that._children[name];
                    if (child) {
                        return child.part;
                    }
                    return null;
                }
                for (i = that._children.length - 1; i >= 0; i--) {
                    child = that._children[i];
                    if (child && child.name === name) {
                        return child.part;
                    }
                }
                // TODO: if (recursive) // go deeper
            }
        };
        /**
         * Opposite method to resiterChild. Unload and remove child part.
         * @param {Part} part
         * @since 0.17
         */
        Part.prototype.unregisterChild = function (part) {
            var that = this, i, child;
            if (that._children) {
                for (i = that._children.length - 1; i >= 0; i--) {
                    child = that._children[i];
                    if (child && child.part === part) {
                        that._children.splice(i, 1);
                        that._unloadChild(child);
                        return;
                    }
                }
            }
        };
        Part.prototype._unloadChild = function (child, options) {
            if (child.disposeOnUnload && child.part.dispose) {
                child.part.dispose(options);
            }
            else if (child.part.unload) {
                child.part.unload(options);
            }
            if (child.subscription) {
                child.subscription.dispose();
                child.subscription = undefined;
            }
        };
        /**
         * Subscribe part's domElement on event(s) via jQuery.on method
         * automatically adding a namespace for event(s) which will be used in `unload`
         * to automatically unsubscribe from thet event(s).
         * @param args
         */
        Part.prototype.jqOn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var that = this, $element, events, nextArgs = -1;
            if (args[0] instanceof $) {
                // ($element: JQuery, event: string, cb)
                // ($element: JQuery, event: string, filter: string, cb)
                $element = args[0];
                events = args[1];
                nextArgs = 2;
            }
            else if (args[0].nodeType !== undefined) {
                // ($element: JQuery, event: string, cb)
                // ($element: JQuery, event: string, filter: string, cb)
                $element = $(args[0]);
                events = args[1];
                nextArgs = 2;
            }
            else {
                // (event, filter, cb) or (event, cb)
                $element = that.$domElement;
                events = args[0];
                nextArgs = 1;
            }
            var eventsArray = (events || "").match(/\S+/g) || [""];
            var jqNS = that._jqEventNs;
            if (!jqNS) {
                jqNS = that._jqEventNs = "." + (that.name || "") + lang.uuid();
            }
            for (var _a = 0, eventsArray_1 = eventsArray; _a < eventsArray_1.length; _a++) {
                var event_1 = eventsArray_1[_a];
                $element.on.apply($element, [event_1 + jqNS].concat(args.slice(nextArgs)));
            }
            return $element;
        };
        /**
         * Unsubscribe from event(s) previously subscribed via `jqOn` method
         */
        Part.prototype.jqOff = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var that = this;
            var jqNS = that._jqEventNs;
            if (!jqNS) {
                return;
            }
            var $element, events;
            if (args.length > 1 && args[0] instanceof $) {
                $element = args[0];
                events = args[1];
            }
            else if (args.length > 1 && args[0].nodeType !== undefined) {
                $element = $(args[0]);
                events = args[1];
            }
            else {
                $element = that.$domElement;
                events = args[0];
            }
            if (events) {
                var eventsArray = (events || "").match(/\S+/g) || [""];
                for (var _a = 0, eventsArray_2 = eventsArray; _a < eventsArray_2.length; _a++) {
                    var event_2 = eventsArray_2[_a];
                    $element.off(event_2 + jqNS);
                }
            }
            else {
                $element.off(jqNS);
            }
        };
        /**
         * Helper method to open specified part via current navigationService (in the region of the current part).
         * @param {String|Object} part Part instance or part name
         * @param {Object} [partOptions] Options that will be passed into part's constructor (if part is String) (see NavigationService.navigate)
         * @param {Function} [onReturn] Callback to be called when user returns from opened part (see NavigationService.navigate)
         * @returns {*}
         */
        Part.prototype.openPart = function (part, partOptions, onReturn) {
            if (!this.navigationService)
                throw new Error("Current part has no navigationService");
            return this.navigationService.navigate({
                part: part,
                partOptions: partOptions,
                onReturn: onReturn
            });
        };
        return Part;
    }(lang.Observable));
    (function (Part) {
        Part.RenderStatus = types.RenderStatus;
    })(Part || (Part = {}));
    // backward compatibility:
    Part.mixin({
        /** @obsolete use static RenderStatus */
        renderStatuses: types.RenderStatus
    });
    return Part;
});
//# sourceMappingURL=Part.js.map