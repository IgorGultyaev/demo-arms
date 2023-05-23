/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Component", "lib/ui/editor/EditorPageController", "lib/validation", "xhtmpl!lib/ui/templates/EditorPage.section.hbs", "lib/ui/menu/Menu"], function (require, exports, core, Component, EditorPageController, validation, templateSection, Menu) {
    "use strict";
    var lang = core.lang;
    var EditorPage = /** @class */ (function (_super) {
        __extends(EditorPage, _super);
        /**
         * @constructs EditorPage
         * @extends Component
         * @param options
         * @param viewModel
         */
        function EditorPage(options, viewModel) {
            var _this = this;
            options = EditorPage.mixContextOptions(options, EditorPage.defaultOptions, EditorPage.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            _this.initTab();
            _this.rules = _this.options.rules;
            _this.initLayout();
            _this.viewModel = viewModel;
            _this.editors = {};
            if (_this.options.hidden) {
                _this.hidden(_this.options.hidden);
            }
            _this.initController();
            _this.initPresenter();
            return _this;
        }
        EditorPage.prototype.initTab = function () {
            var that = this;
            that.name = that.options.name;
            that.tab = {};
            if (lang.isString(that.options.title)) {
                that.title = that.options.title;
                that.tab = {
                    title: that.title,
                    html: that.title
                };
            }
            else if (that.options.title) {
                var tabOptions = that.options.title;
                that.title = tabOptions.title;
                that.tab = core.lang.extendEx({}, tabOptions, {
                    title: that.title,
                    html: tabOptions.html || Menu.getItemHtml(tabOptions)
                }, { deep: true });
            }
            that.title = that.title || that.name;
            that.tab.html = that.tab.html || that.title;
        };
        EditorPage.prototype.initLayout = function () {
            var that = this;
            // соотношение ширины столбцов "label"|"propEditor" в терминах разметки bootstrap
            that.labelColumnRatio = that.options.labelColumnRatio;
            if (that.labelColumnRatio >= 12 || that.labelColumnRatio <= 0) {
                that.labelColumnRatio = EditorPage.defaultOptions.labelColumnRatio;
            }
            that.peColumnRatio = 12 - that.labelColumnRatio;
        };
        EditorPage.prototype.initController = function () {
            var that = this;
            var controller = that.options.controller;
            if (controller) {
                if (EditorPageController.is(controller)) {
                    that.controller = controller;
                }
                else if (lang.isArray(controller)) {
                    that.controller = new EditorPageController(that, controller);
                }
                else {
                    that.controller = new EditorPageController(that, [controller]);
                }
            }
        };
        EditorPage.prototype.tweakOptions = function (options) {
            lang.append(options, {
                bound: !!options.template
            });
            lang.appendEx(options, {
                presenterOptions: {
                    template: options.template,
                    bound: options.bound,
                    cssClass: options.cssClass,
                    highlightFocused: options.highlightFocused,
                    peFocusOnClickContainer: options.peFocusOnClickContainer
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        EditorPage.prototype.doRender = function (domElement) {
            var that = this;
            if (that.controller && that.controller.prepare) {
                that.controller.prepare(that);
            }
            return _super.prototype.doRender.call(this, domElement);
        };
        /**
         * Called by ObjectEditor after page is activated
         */
        EditorPage.prototype.onStarted = function () {
            var that = this;
            that.focusFirstPE(false /*force*/);
            if (that.controller) {
                that.controller.start(that);
            }
        };
        /**
         * Set focus on first property editor
         * @param {boolean} force if true - skip check for already focused DOM element
         */
        EditorPage.prototype.focusFirstPE = function (force) {
            var presenter = this.presenter;
            if (presenter && presenter.focusFirstPE) {
                presenter.focusFirstPE(force);
            }
        };
        EditorPage.prototype.setNavigationService = function (navigationService) {
            this.navigationService = navigationService;
            // Set up navigationService for all nested property editors
            lang.forEach(this.editors, function (pe) {
                pe.setNavigationService(navigationService);
            });
        };
        EditorPage.prototype.setObjectEditor = function (editor) {
            var that = this;
            that.editor && that.editor.violations.unbind("change", null, that);
            that.editor = editor;
            that.editor.violations.bind("change", that._onViolationsChanged, that);
        };
        EditorPage.prototype._onViolationsChanged = function () {
            var that = this, hasViolations = that.editor.violations.all().some(function (v) { return v.pageName === that.name; });
            that.hasViolations(hasViolations);
        };
        EditorPage.prototype.queryUnload = function (options) {
            var reason;
            lang.some(this.editors, function (pe) {
                if (lang.isFunction(pe.queryUnload)) {
                    reason = pe.queryUnload(options);
                    return !!reason;
                }
            });
            return reason || _super.prototype.queryUnload.call(this, options);
        };
        EditorPage.prototype.unload = function (options) {
            var controller = this.controller;
            if (controller) {
                controller.stop();
            }
            _super.prototype.unload.call(this, options);
        };
        EditorPage.prototype.dispose = function (options) {
            _super.prototype.dispose.call(this, options);
            var that = this;
            that.editor.violations.unbind("change", null, that);
            // NOTE: EditorPage's presenter (a View) doesn't own PEs and as so, it didn't dispose them in unload (see View.unload)
            lang.forEach(that.editors, function (pe) {
                if (lang.isFunction(pe.dispose)) {
                    pe.dispose(options);
                }
            });
            that.editors = undefined;
        };
        EditorPage.prototype.getPropertyEditor = function (propName, viewModel) {
            var that = this;
            viewModel = viewModel || that.viewModel;
            if (that.editors) {
                return lang.find(that.editors, function (pe) { return pe.viewModel === viewModel && pe.viewModelProp === propName; });
            }
        };
        EditorPage.prototype.getPropertyEditorByPath = function (propPath) {
            var that = this;
            if (propPath.indexOf(".") < 0) {
                that.getPropertyEditor(propPath, that.viewModel);
            }
            var parts = propPath.split("."), obj = that.viewModel, propName = propPath;
            if (obj.meta) {
                for (var i = 0; i < parts.length; ++i) {
                    propName = parts[i];
                    // TODO: в случае реализации поддержки навигируемых свойств в комплексных типах (WC-1595), потребуется доработка
                    if (obj.meta.complex[propName]) {
                        // перед нами комплексное свойство - значит остаток цепочки это полное наименование примитивного свойства (prop1.prop2.prop3)
                        for (var j = i + 1; j < parts.length; ++j) {
                            propName = propName + "." + parts[j];
                        }
                        break;
                    }
                    if (obj.meta.props[propName]) {
                        if (i === parts.length - 1) {
                            break;
                        }
                        obj = obj[propName]();
                        if (!obj) {
                            return null;
                        }
                        /*
                         TODO: support syntax like "questions.10.name", where "10" is an index in 'questions' property
                         if (prop.many || lang.isArray(obj)) {
                         if (new RegExp("\[(\d+)\]").test(parts[i + 1])) {}
                         } */
                    }
                }
            }
            return that.getPropertyEditor(propName, obj);
        };
        EditorPage.prototype.getPrevPropertyEditor = function (pe) {
            // TODO: надо учитывать порядок tabIndex'ов
            var that = this, keys = Object.keys(that.editors);
            for (var i = 1; i < keys.length; ++i) {
                var peCur = that.editors[keys[i]];
                if (peCur === pe) {
                    return that.editors[keys[i - 1]];
                }
            }
        };
        EditorPage.prototype.getNextPropertyEditor = function (pe) {
            // TODO: надо учитывать порядок tabIndex'ов
            var that = this, keys = Object.keys(that.editors);
            for (var i = 0; i < keys.length - 1; ++i) {
                var peCur = that.editors[keys[i]];
                if (peCur === pe) {
                    return that.editors[keys[i + 1]];
                }
            }
        };
        /**
        * Run validation for all property editors (pe) on the page.
        * It also updates hasViolations property.
        * @return {Array|null} array of violation objects or undefined if there was no errors.
        */
        EditorPage.prototype.runValidation = function () {
            var that = this, violations = [];
            if (!that.shouldValidate()) {
                return null;
            }
            if (that.rules) {
                lang.forEach(that.rules, function (rule) {
                    var violation = rule.validate(that.viewModel);
                    if (violation) {
                        violations = validation.appendViolation(violation, violations);
                    }
                });
            }
            if (that.editors) {
                lang.forEach(that.editors, function (pe) {
                    var violation = pe.runValidation();
                    if (violation) {
                        violations = validation.appendViolation(violation, violations);
                    }
                });
            }
            if (violations.length) {
                for (var _i = 0, violations_1 = violations; _i < violations_1.length; _i++) {
                    var violation = violations_1[_i];
                    violation.pageName = that.name;
                }
                return violations;
            }
            return null;
        };
        EditorPage.prototype.shouldValidate = function () {
            return !this.hidden();
        };
        EditorPage.prototype.getTextPresentation = function () {
            var that = this, text = "";
            if (that.editors) {
                lang.forEach(that.editors, function (pe) {
                    text = text + pe.title() + ": ";
                    if (pe.formattedValue) {
                        text += pe.formattedValue();
                    }
                    else {
                        text += pe.value();
                    }
                    text += "\n";
                });
            }
            return text;
        };
        EditorPage.defaultOptions = {
            labelColumnRatio: 4,
            cssColumnPrefix: "col-md-",
            hidden: false,
            bound: undefined,
            highlightFocused: true
        };
        EditorPage.contextDefaultOptions = {
            filter: {
                highlightFocused: false
            }
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], EditorPage.prototype, "hidden");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], EditorPage.prototype, "hasViolations");
        return EditorPage;
    }(Component));
    (function (EditorPage) {
        var Section = /** @class */ (function (_super) {
            __extends(Section, _super);
            function Section(options) {
                var _this = this;
                options = lang.appendEx(options || {}, Section.defaultOptions, { deep: true });
                _this = _super.call(this) || this;
                _this.name = options.name;
                _this.title(options.title);
                _this.hidden(options.hidden || false);
                _this.editors = {};
                _this.template = options.template;
                return _this;
            }
            Section.prototype.recalculateHidden = function () {
                var hiddenAll = lang.every(this.editors, function (pe) {
                    return pe.hidden();
                });
                this.hidden(hiddenAll);
            };
            Section.defaultOptions = {
                template: templateSection
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], Section.prototype, "title");
            __decorate([
                lang.decorators.observableAccessor()
            ], Section.prototype, "hidden");
            return Section;
        }(lang.Observable));
        EditorPage.Section = Section;
    })(EditorPage || (EditorPage = {}));
    EditorPage.mixin({
        defaultOptions: EditorPage.defaultOptions,
        contextDefaultOptions: EditorPage.contextDefaultOptions
    });
    core.ui.EditorPage = EditorPage;
    return EditorPage;
});
//# sourceMappingURL=EditorPage.js.map