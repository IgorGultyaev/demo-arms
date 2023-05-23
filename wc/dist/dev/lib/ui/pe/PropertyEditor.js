/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Component", "lib/binding", "lib/formatters", "lib/validation", "lib/utils", "i18n!lib/nls/resources", "bootstrap", "jquery-ui/core"], function (require, exports, $, core, Component, binding, formatters, validation, utils, resources) {
    "use strict";
    var lang = core.lang;
    var TIMEOUT_VALIDATION_FIELD = "_timeout_validation";
    var DefaultMapping = {
        peNotAuthorized: undefined,
        peNotImplemented: undefined,
        _resolvers: {},
        _findFactory: function (vt, propMeta) {
            var resolvers = this._resolvers[vt || ""], result = null;
            lang.some(resolvers, function (item) {
                var factory = item.resolver(propMeta);
                if (factory) {
                    result = {
                        factory: factory,
                        priority: item.priority
                    };
                    return true;
                }
                return false;
            });
            return result;
        },
        /**
         * Maps metadata of PE to implementation class
         * @param {Function} resolver A function which gets a metadata of PE and returns implementation class or null
         * @param {Object} [options]
         * @param {String} [options.vt]
         * @param {Number} [options.priority=0]
         * @returns {PropertyEditor.DefaultMapping}
         */
        register: function (resolver, options) {
            if (!resolver) {
                throw new Error("PropertyEditor.DefaultMapping.register: resolver is null");
            }
            options = options || {};
            var vt = options.vt || "", resolvers = this._resolvers[vt] || [];
            resolvers.push({
                resolver: resolver,
                priority: options.priority || 0
            });
            // sort by priority (desc)
            this._resolvers[vt] = lang.sortBy(resolvers, function (item) { return -item.priority; });
            return this;
        },
        getImpl: function (propMd) {
            var that = this, itemVt = propMd.vt && that._findFactory(propMd.vt, propMd), itemAll = that._findFactory("", propMd), item = (itemAll && (!itemVt || itemAll.priority > itemVt.priority)) ? itemAll : itemVt;
            if (item && item.factory) {
                return item.factory;
            }
            // otherwise search for PE in static fields of DefaultMapping
            return lang.find(that, function (v, key) { return key === propMd.vt; });
        },
        /**
         * Create the property editor and optionally set viewModel
         * @param {Object} propMd
         * @param {*} [viewModel]
         * @returns {PropertyEditor} Created property editor
         */
        create: function (propMd, viewModel) {
            var peImpl;
            if (propMd.PropertyEditor) {
                peImpl = propMd.PropertyEditor;
            }
            else {
                peImpl = PropertyEditor.DefaultMapping.getImpl(propMd) || PropertyEditor.DefaultMapping.peNotImplemented;
            }
            var pe = peImpl.create(propMd);
            if (viewModel) {
                if (!pe.setViewModel) {
                    throw new Error("Property editor implementation for prop '" + propMd.name + "' doesn't have required method setViewModel");
                }
                pe.setViewModel(viewModel);
            }
            return pe;
        }
    };
    var PropertyEditor = /** @class */ (function (_super) {
        __extends(PropertyEditor, _super);
        /**
         * @constructs PropertyEditor
         * @extends Component
         * @param {Object} options
         * @param {String} options.name
         * @param {String} options.descr
         * @param {String} options.vt
         * @param {String} [options.hint]
         * @param {boolean} [options.nullable]
         * @param {boolean} [options.readOnly=false]
         * @param {Object} [options.formatter]
         * @param {String} [options.formatterName]
         * @param {Array} [options.rules]
         * @param {Object} [options.layout]
         * @param {boolean} [options.hidden=false]
         * @param {boolean} [options.disabled=false]
         */
        function PropertyEditor(options) {
            var _this = this;
            options = PropertyEditor.mixContextOptions(options, PropertyEditor.defaultOptions, PropertyEditor.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            _this._validateRequiredOptions(_this.options);
            _this.viewModelProp = _this.options.name;
            _this.fullName = _this.options.name;
            _this.viewModel = null; // NOTE: viewModel is assigned later, in setViewModel
            _this.title(_this.options.descr || _this.options.name);
            _this.layout = _this.options.layout;
            if (_this.options.hidden) {
                _this.hidden(true);
            }
            if (_this.options.disabled) {
                _this.disabled(true);
            }
            _this.autoValidate(_this.options.autoValidate);
            _this.bind("change:autoValidate", function (sender, v) {
                if (!v) {
                    // abandon pending async validation (if any)
                    window.clearTimeout(_this[TIMEOUT_VALIDATION_FIELD]);
                    _this[TIMEOUT_VALIDATION_FIELD] = null;
                }
            });
            // TODO: nullable для массивных не поддерживается, но нужен способ отобразить "звездочку" обязательности
            _this.notnull(!_this.options.nullable /*&& !this.options.many*/);
            return _this;
        }
        /**
         * Whether property if mandatory.
         * @observable-property {Boolean}
         */
        PropertyEditor.prototype.notnull = function (v) {
            if (!arguments.length) {
                return PropertyEditor._get(this, "notnull");
            }
            if (PropertyEditor._set(this, "notnull", v)) {
                this.onNotnullChange(v);
            }
        };
        PropertyEditor.prototype.useNotNullStyle = function () {
            return this.options.useNotNullStyle == null ? this.notnull() : !!this.options.useNotNullStyle;
        };
        PropertyEditor.prototype.onNotnullChange = function (v) {
            this.options.nullable = !v;
        };
        /**
         * Binding error
         * @observable-property {Object}
         */
        PropertyEditor.prototype.bindingError = function (v) {
            if (!arguments.length) {
                return PropertyEditor._get(this, "bindingError");
            }
            if (PropertyEditor._set(this, "bindingError", v)) {
                this._onBindingErrorChanged(v);
            }
        };
        /**
         * Violation
         * @observable-property {Object}
         */
        PropertyEditor.prototype.violation = function (v) {
            if (!arguments.length) {
                return PropertyEditor._get(this, "violation");
            }
            if (PropertyEditor._set(this, "violation", v)) {
                this._onViolationChanged(v);
            }
        };
        PropertyEditor.prototype.createId = function (viewModel, prop) {
            var id = prop + "_" + (viewModel.id || utils.generateGuid());
            // replace symbols which may be used in css selectors
            return id.replace(/[.,#>+~]/g, "_");
        };
        PropertyEditor.prototype.setEditorPage = function (page) {
            this.editorPage = page;
        };
        PropertyEditor.prototype.setViewModel = function (viewModel) {
            var _this = this;
            var that = this, oldModel = that.viewModel;
            if (lang.support.isNotLoaded(viewModel)) {
                if (oldModel) {
                    that._unsubscribeViewModel();
                }
                viewModel.load().done(function (viewModel) {
                    viewModel = that.onSetViewModel(viewModel) || viewModel;
                    _super.prototype.setViewModel.call(_this, viewModel);
                    if (that.domElement) {
                        that.rerender();
                    }
                });
                // prevent sync rerender (below)
                oldModel = null;
            }
            else {
                viewModel = that.onSetViewModel(viewModel) || viewModel;
                if (oldModel && oldModel !== viewModel) {
                    that._unsubscribeViewModel();
                }
            }
            if (viewModel) {
                that.id = that.createId(viewModel, that.viewModelProp);
            }
            _super.prototype.setViewModel.call(this, viewModel);
            // NOTE: нам надо подписаться на события VM, но мы это сделаем в onReady,
            // т.к. реакция нужна для отрендеренного РЕ
            if (oldModel !== viewModel) {
                if (that.domElement && viewModel) {
                    that.rerender();
                }
                else if (that.domElement && !viewModel) {
                    // not-null -> null
                    that._domElement = that.domElement;
                    that.unload();
                }
                else if (that._domElement && !that.domElement && viewModel) {
                    // PE was rendered before VM was set to null, render it back again
                    that.render(that._domElement);
                }
            }
        };
        PropertyEditor.prototype._unsubscribeViewModel = function () {
            var that = this;
            // unsubscribe on the current viewModel
            if (that.viewModel && that.viewModel.unbind && that.viewModelProp) {
                that.viewModel.unbind("change:" + that.viewModelProp, null, that);
                that.viewModel.unbind("error:" + that.viewModelProp, null, that);
            }
        };
        PropertyEditor.prototype.onSetViewModel = function (viewModel) {
            // NOTE: propMd/options могут указывать на цепочку свойств от VM,
            // таким образом viewModel это не наша ViewModel, а как бы родительская, относительно которой мы должны пройти цепочку
            // В обычном случае можно считать, что цепочка состоит из одного свойства.
            var that = this;
            var propMd = that.options;
            var propChain = propMd.chain;
            if (viewModel && propChain) {
                var viewModelRoot = viewModel;
                // current name contains full chain, change it to local prop relatively to PE's VM
                that._chainPropName = propMd.name;
                propMd.name = propChain.props[propChain.props.length - 1].name;
                that.viewModelProp = propMd.name;
                // NOTE: в качестве цепочки поддерживает 2-уровня: prop1.prop2, везьмем prop1 и переполучим VM для PE
                viewModel = core.lang.get(viewModel, propChain.props[0].name);
                // NOTE: сбросим chain, чтобы при повторных вызовах setViewModel (например, при загрузке объекта), мы сюда не попали
                propMd.chain = null;
                that._observePropChain(viewModelRoot, propChain);
            }
            var onSetViewModel = this.options.onSetViewModel;
            if (viewModel && onSetViewModel) {
                viewModel = onSetViewModel.call(this, viewModel);
            }
            var value = that._getRawValue(viewModel);
            if (value && value.isNotAuthorized) {
                // NOTE: ранее NotAuthorized значение анализировалось перед созданием PE в PropertyEditorMap.create (WC-1189)
                that.onNotAuthorized();
            }
            return viewModel;
        };
        PropertyEditor.prototype._observePropChain = function (vmRoot, chain) {
            var _this = this;
            var that = this;
            // NOTE: в качестве цепочки поддерживает 2-уровня: prop1.prop2,
            // где prop1 это навигируемое св-во, prop2 это просто свойство (но оно может быть свойство комплексного типа, т.е. содержать "." в имени)
            var propName = chain.props[0].name;
            var expr = lang.observableExpression(lang.property(propName), {
                onchange: function (reason) {
                    if (reason === "loadError") {
                        console.warn("PropertyEditor: ObservableExpression failed on loading '" + chain.props.map(function (p) { return p.name; }).join(".") + "'");
                        // NOTE: нам нужна ошибка, возникшая при загрузке
                        try {
                            expr.apply(vmRoot);
                        }
                        catch (ex) {
                            _this.violation(ex);
                        }
                        expr.dispose();
                    }
                    else {
                        expr.dispose();
                        that._observePropChain(vmRoot, chain);
                    }
                }
            });
            var val = expr.apply(vmRoot);
            if (val === null || val === undefined) {
                // Объект владелец текущего свойтсва-цепочки пропал. Надо очистить/скрыть PE.
                // Т.к. если его оставить, то байндинг продолжит работать.
                // При установке viewModel=null PE будет выгружен (unload), это разрушит байндинги.
                // Одного hidden может быть недостаточно, если он не задействован в шаблоне.
                // Альтернативный вариант - disabled(true), то тогда может остаться текущее значение в поле.
                that.hidden(true);
                that.setViewModel(null);
            }
            else if (lang.support.loadingValue !== val) {
                // У свойства цепочки есть значение, если ранее оно было скрыто, его надо показать
                // Важно, что в реализации hidden PE может обращаться к своей VM, поэтому установим ее до
                that.setViewModel(val);
                if (that.options.hidden !== true) {
                    // Но свойство могло быть скрыто прикладной логикой, в этом случае показывать не будем
                    that.hidden(false);
                }
            }
            // else: значение свойства корневой VM - loadingValue, т.е. объект/свойство не загружен(ы),
            //		они загрузятся автоматичеки (в observableExpression) и после загрузки вызовется onchange,
            //		и мы опять попадем сюда же.
            that.addDisposable(expr, null, true);
        };
        /**
         * @deprecated Use Part.mixOptions instead
         * @param staticOptions
         * @param options
         * @returns {*}
         */
        PropertyEditor.prototype.mergeOptions = function (staticOptions, options) {
            return utils.mergeOptions(staticOptions, options);
        };
        PropertyEditor.prototype._validateRequiredOptions = function (options) {
            if (!options.name) {
                throw new Error("PropertyEditor.constructor: required attribute options.name wasn't specified");
            }
            if (!options.vt) {
                throw new Error("PropertyEditor.constructor: required attribute options.vt wasn't specified");
            }
        };
        PropertyEditor.prototype.createBindableProp = function () {
            // NOTE: так не верно!
            //return binding.expr(this.viewModel, this.viewModelProp);
            // viewModelProp может быть именем комплексного свойства, содержащим точки (например,
            // address.locality.type). Если передать такое выражение в текстовом виде, то будет попытка получать
            // последовательно свойства "address"."locality"."type". А нам нужно одно свойство с точками:
            // "address.locality.type". Поэтому передадим в байндинг функцию-accessor (к тому же так
            // не нужно парсить текст - должно быть чуть быстрее).
            return binding.expr(this.viewModel, lang.property(this.viewModelProp));
            // NOTE: можно было бы сразу получить accessor у viewModel, как в закомментированном коде:
            //return binding.expr(this.viewModel, this.viewModel[this.viewModelProp]);
            // Но если viewModel в данный момент не прогружена (isLoaded == false), то нужной функции
            // еще не будет и все упадет.
        };
        /**
         * Bind DOMElement to viewModel's property
         * @param {HTMLElement|jQuery|bindable} element DOM-элемент, jQuery-множество или любое bindable значение
         */
        PropertyEditor.prototype.databind = function (element) {
            var that = this, bindableProp = that.createBindableProp();
            var bindableElement = (element.nodeType || element instanceof $) ?
                binding.html(element) : element;
            $(bindableElement).on("bindingErrorChanged", function (event, error) {
                that.bindingError(error);
            });
            var disposable = binding.databind(bindableElement, bindableProp, { debounceSource: that.options.debounce });
            that.addDisposable(disposable);
        };
        PropertyEditor.prototype._bindToDisabled = function () {
            this._bindElementToDisabled();
            this._bindNullableToDisabled();
        };
        /**
         * Creates binding between disabled prop and html:
         * if the current part contains _onDisabledChange method then binding will call it,
         * otherwise simple html "disabled" binding will be created.
         * @protected
         */
        PropertyEditor.prototype._bindElementToDisabled = function () {
            var that = this, disposable;
            if (that._onDisabledChange) {
                disposable = binding.databind({
                    set: function (v) {
                        // NOTE: изменение disabled может быть true <-> false,
                        // если оно undefined - это начальное значение, его можно игнорировать
                        if (v !== undefined) {
                            that._onDisabledChange(v);
                        }
                    }
                }, binding.expr(that, "disabled"));
            }
            else {
                disposable = that.element ?
                    binding.databind(binding.html(that.element, "disabled"), binding.expr(that, "disabled")) :
                    undefined;
            }
            that.addDisposable(disposable, "disabled-html");
        };
        /**
         * Creates binding between disabled prop and nullable options:
         * for disabled PE set nullable=true, for enabled PE restores previous value.
         * @private
         */
        PropertyEditor.prototype._bindNullableToDisabled = function () {
            var that = this, disposable = binding.databind({
                set: function (v) {
                    if (v) {
                        // changed disababled := true
                        that._nullable = !!that.options.nullable;
                        that.options.nullable = true;
                    }
                    else if (that._nullable !== undefined) {
                        // changed disabled := false and there's a previous value
                        that.options.nullable = that._nullable;
                        that._nullable = undefined;
                    }
                }
            }, binding.expr(that, "disabled"));
            that.addDisposable(disposable, "disabled-nullable");
        };
        PropertyEditor.prototype.createViolation = function (error) {
            return validation.createViolation(error, this.viewModel, this.options);
        };
        /**
         * Run validation for the current property editor - validate viewModel's property with PE's metadata
         * @return {Object} violation object or undefined if there was no errors
         */
        PropertyEditor.prototype.runValidation = function (options) {
            var that = this;
            if (!that.shouldValidate(options)) {
                return null;
            }
            if (that.bindingError()) {
                return that.createViolation(that.bindingError());
            }
            var violation = that.validateProp();
            if (!violation && that.validate) {
                violation = that.createViolation(that.validate());
            }
            that.violation(violation);
            return violation;
        };
        /**
         * Validate property current value using rules in options.
         * @returns {Violation}
         */
        PropertyEditor.prototype.validateProp = function () {
            return validation.validateProp(this.viewModel, this.options);
        };
        PropertyEditor.prototype.shouldValidate = function (options) {
            return !this.hidden() && this.viewModel;
        };
        PropertyEditor.prototype._onPropChanged = function (sender, value) {
            if (value && value.isNotAuthorized) {
                // NOTE: ранее NotAuthorized значение анализировалось перед созданием PE в PropertyEditorMap.create (WC-1189)
                // TODO: обрабатывать обратную установку (NotAuthorized -> не-NotAuthorized)?
                this.onNotAuthorized();
            }
            else {
                if (this._notAuthorized) {
                    // NotAuthorized -> не-NotAuthorized
                    this.onNotAuthorized(/*rollback:*/ true);
                }
                if (this.autoValidate()) {
                    this.runValidationAsync({ reason: "auto" });
                }
            }
        };
        PropertyEditor.prototype.onNotAuthorized = function (rollback) {
            var that = this;
            if (rollback) {
                if (that._notAuthorized) {
                    that.disabled(that._notAuthorized.disabled);
                    that.hidden(that._notAuthorized.hidden);
                }
                that._notAuthorized = undefined;
            }
            else {
                that._notAuthorized = {
                    disabled: that.disabled(),
                    hidden: that.hidden()
                };
                // Это вызовет rerender
                that.disabled(true);
                that.hidden(true);
            }
        };
        PropertyEditor.prototype._onPropErrorChanged = function (error) {
            this.violation(error);
        };
        /**
         * Handler for changing "bindingError"
         * @param {*} newVal
         * @private
         */
        PropertyEditor.prototype._onBindingErrorChanged = function (newVal) {
            // NOTE: this will clear violation error if it exists
            this.renderError(newVal);
        };
        /**
         * Handler for changin "violation".
         * It's also called directly if violation already exists during render.
         * @param {*} [newVal]
         * @private
         */
        PropertyEditor.prototype._onViolationChanged = function (newVal) {
            var violation = newVal;
            if (!arguments.length) {
                violation = this.violation();
            }
            this.renderError(violation || this.bindingError());
        };
        /**
         * Add a "disposable" - an object holding some subscription to destroy on unload.
         * Usually disposables are created with binding.databind or Observable.subscribe.
         * @param disposable
         * @param [name] optional name of subscription to guarantee its uniqueness (dispose existing).
         * @param [persisted] true to dispose the disposable on dispose instead of unload
         */
        PropertyEditor.prototype.addDisposable = function (disposable, name, persisted) {
            var that = this;
            var disposables;
            if (persisted) {
                that._disposesPersisted = disposables = that._disposesPersisted || [];
            }
            else {
                that._disposes = disposables = that._disposes || [];
            }
            if (name) {
                // Если задано имя, то байндинг именованный и его disposable может быть найден
                // Это используется для гарантирования исключения повторного байндинга
                // Например, метод _bindElementToDisabled вызывается из onReady,
                // и может вызывать более одного раза.
                // В этом случае предыдущий байндинг не уничтожен, т.к. unload не было.
                // Найдем его и уничтожим.
                for (var i = 0; i < disposables.length; i++) {
                    var item = disposables[i];
                    if (item.name === name) {
                        item.dispose();
                        disposables.splice(i, 1);
                        break;
                    }
                }
            }
            if (disposable && disposable.dispose) {
                if (name) {
                    disposable.name = name;
                }
                disposables.push(disposable);
            }
        };
        PropertyEditor.prototype._getRawValue = function (viewModel) {
            var that = this;
            var value;
            viewModel = viewModel || that.viewModel;
            if (viewModel) {
                // NOTE: получим значение св-ва, без генерации событий
                if (viewModel.get) {
                    value = viewModel.get(that.viewModelProp, { suppressEvents: true });
                }
                else {
                    value = viewModel[that.viewModelProp];
                    if (value && typeof value === "function") {
                        value = value.call(that);
                    }
                }
            }
            return value;
        };
        PropertyEditor.prototype.doRender = function (domElement) {
            this._domElement = undefined; // see setViewModel(null)
            if (this._notAuthorized) {
                // NOTE: ранее NotAuthorized значение анализировалось перед созданием PE в PropertyEditorMap.create (WC-1189)
                this.renderNotAuthorize(domElement);
                return;
            }
            var result = _super.prototype.doRender.call(this, domElement);
            // add cssClass
            // NOTE: не переносить в onReady, т.к. PE может отрисоваться в состоянии waiting, а cssClass нужен в любом случае
            var cssClass = this.options.cssClass;
            if (cssClass) {
                $(domElement).addClass(cssClass);
            }
            return result;
        };
        PropertyEditor.prototype.afterRender = function () {
            _super.prototype.afterRender.call(this);
            // NOTE: не переносить в onReady, т.к. onReady может вызываться несколько раз, а отписки от jq-событий нет
            this._bindHotkeys();
        };
        PropertyEditor.prototype.onReady = function () {
            _super.prototype.onReady.call(this);
            var that = this;
            if (that.viewModel && that.viewModel.bind) {
                // NOTE: симметричная отписка в onUnready
                that.viewModel.bind("change:" + that.viewModelProp, that._onPropChanged, that);
                that.viewModel.bind("error:" + that.viewModelProp, that._onPropErrorChanged, that);
            }
            if (that.violation()) {
                that._onViolationChanged();
            }
            that._bindToDisabled();
            if (that.element && that.id) {
                that.element.attr("id", that.id);
            }
            that._setWidth();
        };
        PropertyEditor.prototype.onUnready = function () {
            this._unsubscribeViewModel();
        };
        PropertyEditor.prototype.unload = function (options) {
            _super.prototype.unload.call(this, options);
            var that = this;
            if (that._disposes) {
                for (var _i = 0, _a = that._disposes; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
                that._disposes = undefined;
            }
            if (that._nullable !== undefined) {
                // Reset nullable options back to its original value
                // (which could be spoiled in _bindNullableToDisabled if PE was disabled).
                that.options.nullable = that._nullable;
            }
            that._unsubscribeViewModel();
            that.bindingError("");
            that.violation(null);
        };
        PropertyEditor.prototype.dispose = function (options) {
            var that = this;
            if (that._disposesPersisted) {
                for (var _i = 0, _a = that._disposesPersisted; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
                that._disposesPersisted = undefined;
            }
            that.editorPage = undefined;
            _super.prototype.dispose.call(this, options);
        };
        PropertyEditor.prototype._setWidth = function () {
            var that = this;
            if (that.element && that.options.width) {
                $(that.element).css({ width: that.options.width });
            }
        };
        PropertyEditor.prototype._bindHotkeys = function () {
            if (this.options.blurOnEsc) {
                this._bindToEsc();
            }
        };
        PropertyEditor.prototype._bindToEsc = function () {
            var that = this, $element = that.element || that.$domElement;
            $element.keyup(function (e) {
                if (e.which !== core.html.keyCode.ESCAPE || e.ctrlKey || e.shiftKey || e.metaKey) {
                    return;
                }
                $(e.target).blur();
            });
        };
        PropertyEditor.prototype.renderError = function (error) {
            var that = this, $element = that.element || that.$domElement;
            if ($element) {
                that._renderError(error, $element);
            }
        };
        PropertyEditor.prototype._renderError = function (error, $element) {
            $element
                .toggleClass("-invalid", !!error)
                .trigger("pe.invalid", error);
            // HACK: workaround for BS Tooltip race conditions:
            // Tooltip can't be reinitialize (title will be old), so we have to destroy it first.
            // But BS Tooltip has race conditions (see https://github.com/twbs/bootstrap/issues/16376) as destroy method is async.
            // So we manually remove "fade" class from internal tooltip element to make 'hide' method (called inside destroy) synchronous.
            var tooltip = $element.data("bs.tooltip");
            if (tooltip) {
                if (tooltip.$tip)
                    tooltip.$tip.removeClass("fade");
                tooltip.destroy();
            }
            if (error) {
                var html = this._errorToHtml(error);
                if (html) {
                    $element.tooltip({
                        html: true,
                        title: html,
                        delay: { show: 500 },
                        trigger: "hover"
                    });
                }
            }
        };
        PropertyEditor.prototype._errorToHtml = function (error) {
            var message = error.error || error.message || error;
            return formatters.isHtml(message) ?
                message.toHTML() :
                lang.encodeHtml(message.toString());
        };
        PropertyEditor.prototype.renderNotAuthorize = function (domElement) {
            $("<input type='text' class='x-pe-string uneditable-input' disabled readonly />")
                .val(resources["not_authorized"])
                .appendTo(domElement);
            _super.prototype.doRender.call(this, domElement);
        };
        /**
         * Returns true if the editor should fill entire row.
         * The method is used in templates.
         * @return {boolean}
         */
        PropertyEditor.prototype.isFullWidth = function () {
            return this.layout && this.layout.position === "row";
        };
        PropertyEditor.prototype.focus = function () {
            var that = this, $element = that.element || that.$domElement;
            if (!$element) {
                return;
            }
            if (that.disabled()) {
                return;
            }
            var $focusable = $element.filter(":focusable:first");
            if (!$focusable.length) {
                $focusable = $element.find(":focusable:first");
            }
            $focusable.focus();
        };
        PropertyEditor.prototype.scrollToSelf = function () {
            core.html.scrollToElement({ element: this.domElement, align: "center" });
        };
        PropertyEditor.prototype.activate = function () {
            // NOTE: focus can force scrolling, but it ignores affixed elements. So we must manually scroll first.
            this.scrollToSelf();
            this.focus();
        };
        /**
         * Gets or sets current property value
         * @param {*} [v] a new property value
         * @return {*} Current property value (if no arguments were specified)
         */
        PropertyEditor.prototype.value = function (v) {
            var that = this, 
            // NOTE: use this.get("viewModel") instead of this.viewModel for triggering 'get' event
            viewModel = that.get("viewModel");
            if (!that.options.many && arguments.length > 0) {
                viewModel[that.viewModelProp](v);
            }
            else {
                return viewModel[that.viewModelProp]();
            }
        };
        PropertyEditor.DefaultMapping = DefaultMapping;
        PropertyEditor.defaultOptions = {
            /**
             * Property Name
             * @type {String}
             */
            name: undefined,
            /**
             * Description
             * @type {String}
             */
            descr: undefined,
            /**
             * Var Type
             * @type {String}
             */
            vt: undefined,
            /**
             * Hint
             * @type {String}
             */
            hint: undefined,
            /**
             * Whether property is nullable or not
             * @type {Boolean}
             */
            nullable: undefined,
            readOnly: false,
            formatter: undefined,
            formatterName: undefined,
            rules: undefined,
            layout: { position: "cell" },
            hidden: undefined,
            disabled: undefined,
            width: undefined,
            onSetViewModel: undefined,
            /**
             * clear focus from PE when ESC pressed
             */
            blurOnEsc: true,
            /**
             * Run a validation when changing the property of viewModel
             * @type {Boolean}
             */
            autoValidate: true,
            /**
             * Context in which the PE is created
             * @type {String}
             */
            contextName: undefined,
            debounce: undefined
        };
        /**
         * Default options by context
         */
        PropertyEditor.contextDefaultOptions = {};
        __decorate([
            lang.decorators.observableAccessor()
        ], PropertyEditor.prototype, "title");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], PropertyEditor.prototype, "hidden");
        __decorate([
            lang.decorators.observableAccessor()
        ], PropertyEditor.prototype, "disabled");
        __decorate([
            lang.decorators.observableAccessor()
        ], PropertyEditor.prototype, "autoValidate");
        __decorate([
            lang.decorators.constant(lang.debounce("runValidation", 100, TIMEOUT_VALIDATION_FIELD))
        ], PropertyEditor.prototype, "runValidationAsync");
        return PropertyEditor;
    }(Component));
    PropertyEditor.mixin(/** @lends PropertyEditor.prototype */ {
        defaultOptions: PropertyEditor.defaultOptions,
        /**
         * Default options by context
         */
        contextDefaultOptions: PropertyEditor.contextDefaultOptions
    });
    var peNotImplemented = /** @class */ (function (_super) {
        __extends(peNotImplemented, _super);
        /**
         * @constructs peNotImplemented
         * @extends PropertyEditor
         */
        function peNotImplemented(options) {
            return _super.call(this, options) || this;
        }
        peNotImplemented.prototype.render = function (domElement) {
            $("<span style='color:red'>PropertyEditor for vartype '" + this.options.vt + "' has not been implemented yet</span>")
                .appendTo(domElement);
            return _super.prototype.render.call(this, domElement);
        };
        return peNotImplemented;
    }(PropertyEditor));
    var peNotAuthorized = /** @class */ (function (_super) {
        __extends(peNotAuthorized, _super);
        /**
         * @constructs peNotAuthorized
         * @extends PropertyEditor
         */
        function peNotAuthorized(options) {
            var _this = _super.call(this, options) || this;
            _this.hidden(true);
            _this.disabled(true);
            return _this;
        }
        peNotAuthorized.prototype.render = function (domElement) {
            $("<input type='text' class='x-pe-string uneditable-input' disabled readonly />")
                .val(resources["not_authorized"])
                .appendTo(domElement);
            return _super.prototype.render.call(this, domElement);
        };
        return peNotAuthorized;
    }(PropertyEditor));
    /**
     * Global map where all PE implementations register their mappings: prop type to PE-class
     */
    core.ui.PropertyEditor = PropertyEditor;
    core.ui.peNotImplemented = peNotImplemented;
    core.ui.peNotAuthorized = peNotAuthorized;
    DefaultMapping.peNotImplemented = peNotImplemented;
    DefaultMapping.peNotAuthorized = peNotAuthorized;
    return PropertyEditor;
});
//# sourceMappingURL=PropertyEditor.js.map