/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Component", "lib/ui/handlebars/View", "lib/ui/editor/EditorPage", "lib/ui/pe/PropertyEditor", "lib/validation", "lib/ui/ConfirmDialog", "lib/ui/menu/Menu", "lib/ui/Carousel", "lib/ui/editor/ConcurrencyErrorPart", "lib/ui/validation/ViolationInfoPart", "lib/utils", "lib/formatters", "lib/ui/PartCommandMixin", "i18n!lib/nls/resources", "xhtmpl!lib/ui/templates/EditorFatalError.hbs", "lib/ui/validation/ContextPartMixin"], function (require, exports, $, core, Component, View, EditorPage, PropertyEditor, validation, ConfirmDialog, Menu, Carousel, ConcurrencyErrorPart, ViolationInfoPart, utils, formatters, PartCommandMixin, resources, fatalErrorTemplate, ContextPartMixin_1) {
    "use strict";
    var lang = core.lang;
    var ObservableCollection = lang.ObservableCollection;
    var ObjectEditor = /** @class */ (function (_super) {
        __extends(ObjectEditor, _super);
        /**
         * @constructs ObjectEditor
         * @extends Component
         * @param {Object} options
         */
        function ObjectEditor(options) {
            var _this = this;
            var originalOptions = options;
            options = ObjectEditor.mixOptions(options, ObjectEditor.defaultOptions);
            _this = _super.call(this, options) || this;
            _this._originalOptions = originalOptions;
            _this.app = core.Application.current;
            _this.traceSource = new core.diagnostics.TraceSource("ui.ObjectEditor", _this.options.traceSourceName);
            _this.title = _this.options.title;
            _this.subtitle = _this.options.subtitle;
            _this.rules = _this.options.rules;
            _this.pages = new ObservableCollection();
            _this.violations = new ObservableCollection();
            _this.violations.bind("change", _this._onViolationsChanged, _this);
            _this.currentPage(null);
            _this.editorContext = options.editorContext || { nested: false };
            _this._isIsolated = lang.coalesce(_this.options.isIsolated, !(options.uow || (options.viewModel && options.viewModel.uow)));
            _this.navigationService = options.navigationService || null;
            _this.contextParts = new ObservableCollection();
            _this.userSettings = core.UserSettings.create(_this.options.userSettings);
            utils.subscribeOnEvents(_this, options, ObjectEditor.Events);
            var viewModel = _this.options.viewModel, uow = (viewModel && viewModel.uow) || options.uow;
            if (uow) {
                _this.onSaveState(uow);
            }
            if (_this.options.initialJson) {
                // restore a draft
                uow = uow || (_this._ownUow = _this.app.createUnitOfWork({ connected: true }));
                uow.attachChanges(_this.options.initialJson);
            }
            // NOTE: don't create viewModel when option `viewModel` is null
            if (viewModel === undefined) {
                if (!options.type) {
                    options.type = _this.options.urlSuffix;
                }
                if (options.type && options.id) {
                    // load existing object
                    uow = uow || (_this._ownUow = _this.app.createUnitOfWork({ connected: true }));
                    viewModel = uow.get(options.type, options.id);
                }
                else if (options.type) {
                    // create a new object
                    // NOTE: we must call saveState before creating an object
                    uow = uow || (_this._ownUow = _this.app.createUnitOfWork({ connected: true }));
                    viewModel = uow.create(options.type);
                }
            }
            if (viewModel) {
                _this.setViewModel(viewModel);
            }
            _this._initializeMenu();
            // save current app state, it can be used in queryUnload/dispose to save a draft
            _this._appState = _this.app.stateManager.getCurrentState();
            _this.initPresenter();
            return _this;
        }
        ObjectEditor.prototype.applyHostContext = function (opt) {
            var navOpt = _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, ObjectEditor.hostDefaultOptions);
            return navOpt;
        };
        ObjectEditor.prototype.tweakOptions = function (options) {
            lang.appendEx(options, {
                presenterOptions: {
                    suppressAutoLoad: options.suppressAutoLoad
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        ObjectEditor.prototype._initState = function (viewModel) {
            var that = this, id = that._getViewModelId(viewModel) || that.options.id;
            // set part's state so in case of initialization fails the part has some meaningful state (see getState):
            that._state = {
                type: viewModel.meta ? viewModel.meta.name : that.options.type
            };
            if (id) {
                that._state.id = id;
            }
            if (that.options.page) {
                that._state.page = that.options.page;
            }
        };
        ObjectEditor.prototype.setViewModel = function (viewModel) {
            var _this = this;
            var that = this;
            that._initState(viewModel);
            var promisable = viewModel;
            if (lang.isFunction(viewModel.load)) {
                if (that.options.preloads) {
                    promisable = viewModel.load({ preloads: that.options.preloads });
                }
                else if (!viewModel.isLoaded) {
                    promisable = viewModel.load();
                }
            }
            promisable = lang.async.then(promisable, function (v) { return that.onSetViewModel(v) || v; });
            var task = lang.async.then(promisable, function (v) {
                that._setViewModelComplete(v);
            });
            if (lang.isPromise(task)) {
                that.initializationTask = task;
                task.fail(function (error) {
                    delete that.initializationTask;
                    /*
                     NOTE: error can be an interop-error from DataFacade, like:
                     {
                        error: "Internal Server Error"
                        exception: "java.lang.NullPointerException"
                        httpStatus: 500
                        message: "No message available"
                     }
                     */
                    if (error && error.message) {
                        that.error = error.message;
                    }
                    else {
                        that.error = error;
                    }
                    that.traceSource.error(error);
                    if (that.domElement) {
                        _this.rerender();
                    }
                });
            }
        };
        ObjectEditor.prototype.onSetViewModel = function (viewModel) {
            // that.options.onSetViewModel
            if (this.isDisposed) {
                return;
            }
            var onSetViewModel = this.options.onSetViewModel;
            if (viewModel && onSetViewModel) {
                viewModel = onSetViewModel.call(this, viewModel) || viewModel;
            }
            return viewModel;
        };
        ObjectEditor.prototype._setViewModelComplete = function (viewModel) {
            var that = this;
            delete that.initializationTask;
            if (that.isDisposed) {
                return;
            }
            if (that.title === undefined && viewModel.meta) {
                that.title = viewModel.meta.descr;
            }
            var uow = viewModel.uow, oldUow = that.viewModel && that.viewModel.uow;
            if (oldUow && oldUow !== uow) {
                that._disposeUow(oldUow);
            }
            if (uow) {
                uow.bind("detach", that._onObjectDetached, that);
            }
            that.error = undefined;
            _super.prototype.setViewModel.call(this, viewModel);
            if (that.pages.isEmpty()) {
                that._initialize();
                if (that.domElement) {
                    this.rerender();
                }
            }
            else {
                // NOTE: Это не первый вызов setViewModel, страницы уже инициализированы.
                // Удалим их все и выполним новую инициализацию. Можно было бы оставить и пройти по всем PE и задать новую VM,
                // но могут быть также кастомные шаблоны, которые зависят от VM. Проще все удалить.
                var domElement = that.domElement;
                if (that.domElement) {
                    domElement = that.domElement;
                    that.unload();
                }
                that.currentPage(null);
                // it's not the first initialization, we should to remove previous pages
                that.pages.forEach(function (page) {
                    if (lang.isFunction(page.unload)) {
                        page.unload({ reason: "dispose" });
                    }
                });
                that.pages.forEach(function (page) {
                    if (lang.isFunction(page.dispose)) {
                        page.dispose();
                    }
                });
                that.pages.clear();
                that._initialize();
                if (domElement) {
                    this.render(domElement);
                }
            }
        };
        ObjectEditor.prototype._initialize = function () {
            var that = this, pagesInfo = that.options.pages;
            try {
                that.onInitializing();
                if (pagesInfo) {
                    for (var _i = 0, pagesInfo_1 = pagesInfo; _i < pagesInfo_1.length; _i++) {
                        var pageInfo = pagesInfo_1[_i];
                        that._createPage(pageInfo);
                    }
                    if (that.options.page) {
                        var page = that.getPageByName(that.options.page);
                        if (page) {
                            that.currentPage(page);
                        }
                    }
                }
                else {
                    that._createDefaultPage();
                }
                that.onInitialized();
            }
            catch (error) {
                that.error = error;
                that.traceSource.error(error);
                if (that.app.config.isDebug) {
                    throw error;
                }
            }
        };
        ObjectEditor.prototype._onObjectDetached = function (sender, obj) {
            if (!this.pages) {
                return;
            } // already disposed
            this.pages.forEach(function (page) {
                var editors = page.editors;
                if (!editors) {
                    return;
                }
                for (var _i = 0, _a = Object.keys(editors); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var pe = editors[key];
                    if (pe.viewModel === obj) {
                        delete editors[key];
                        if (!pe.isDisposed) {
                            pe.dispose();
                        }
                    }
                }
            });
        };
        ObjectEditor.prototype.onInitializing = function () {
            this.trigger(ObjectEditor.Events.INITIALIZING, this);
        };
        ObjectEditor.prototype.onInitialized = function () {
            this.trigger(ObjectEditor.Events.INITIALIZED, this);
        };
        /**
         * Create an url query for initialization via navigating to a url
         */
        ObjectEditor.prototype.getState = function (partOptions) {
            var that = this;
            if (partOptions) {
                return {
                    type: partOptions.type,
                    id: partOptions.id,
                    page: partOptions.page
                };
            }
            var state = that._getViewModelState();
            if (state) {
                if (that.pages && that.pages.count() > 1) {
                    var curPage = that.currentPage();
                    if (curPage && curPage !== that.pages.get(0)) {
                        state.page = curPage.name;
                    }
                }
                that._state = state;
            }
            return that._state;
        };
        ObjectEditor.prototype._getViewModelState = function () {
            var viewModel = this.viewModel, state;
            if (viewModel) {
                state = {};
                var meta = viewModel.meta;
                if (meta) {
                    state.type = meta.name;
                }
                var id = this._getViewModelId(viewModel);
                if (id) {
                    state.id = id;
                }
            }
            return state;
        };
        ObjectEditor.prototype._getViewModelId = function (viewModel) {
            var id = viewModel.id;
            if (id) {
                var isNew = lang.isFunction(viewModel.isNew) ? viewModel.isNew() : false;
                if (!isNew) {
                    return id;
                }
            }
        };
        ObjectEditor.prototype.onStateChanged = function (state) {
            var that = this, curPage = that.currentPage();
            if (state && curPage && state.page !== curPage.name) {
                var page = state.page ?
                    that.getPageByName(state.page) :
                    that.pages.get(0);
                if (page) {
                    that.setCurrentPage(page, /*skipValidation=*/ false);
                    return true;
                }
            }
            return false;
        };
        ObjectEditor.prototype._initializeMenu = function () {
            var that = this;
            // initialize editor menu & commands
            that.commands = lang.extend(that.createCommands(), that.options.commands || {});
            that.menu = that.createMenu();
            that.menu.bindToPart(that);
            if (that.options.navigateSiblings && that.options.navigateSiblings.length > 1) {
                that.siblingsCarousel = new Carousel({
                    items: that.options.navigateSiblings,
                    formatter: null
                });
                var pos = that._getObjectIndex(that.options.navigateSiblings);
                if (pos > -1) {
                    that.siblingsCarousel.position(pos);
                }
                that.siblingsCarousel.bind("moving", that._onSiblingNavigate, that);
            }
        };
        ObjectEditor.prototype._onSiblingNavigate = function (sender, args) {
            var that = this;
            if (that._isClosing) {
                return;
            }
            if (!that.navigationService.replace) {
                return;
            }
            var item = sender.items().get(args.to);
            if (item) {
                that._isClosing = true;
                // NOTE: in any case we're preventing changing Carousel's position:
                //  if it's forbidden by queryUnload then it won't change
                //  if it's allowed (by default) it will be changed in editor being opened
                args.cancel = true;
                var result = that.queryNavigateSibling();
                lang.async.chain(result)
                    .then(function (reasonToStay) {
                    if (!reasonToStay) {
                        return that._doNavigateSibling(item);
                    }
                })
                    .always(function () {
                    that._isClosing = false;
                });
            }
        };
        ObjectEditor.prototype.queryNavigateSibling = function () {
            var that = this;
            // NOTE: Вызывать queryUnload для вложенного редактора нельзя, т.к. он проверяет наличие изменений
            // во всей uow, и таким образом будет предупреждать о наличие изменений, которые мы не делали.
            if (that._isIsolated) {
                // navigationService.replace() вызовет unload() текущего парта с reason:"close", но не вызовет
                // queryUnload(). Явно позовем queryUnload() с той же причиной.
                // NOTE: queryUnload переопределяется модулем черновиков, но в случае reason === "close",
                // черновик создаваться не будет
                return that.queryUnload({ reason: "close" });
            }
            if (that._uowStateName && that.viewModel.uow.hasChangesSince(that._uowStateName)) {
                var dialog = new ConfirmDialog({
                    header: this.title,
                    text: resources["objectEditor.nested_query_unload_prompt"],
                    menu: {
                        items: [
                            { name: "yes", title: resources["yes"], isDefaultAction: true },
                            { name: "no", title: resources["no"] },
                            { name: "cancel", title: resources["cancel"] }
                        ]
                    }
                });
                return dialog.open().then(function (result) {
                    if (result === "cancel") {
                        return resources["closing_canceled"];
                    }
                    if (result === "yes") {
                        // accept changes but do not close
                        return that.finish({ skipClose: true });
                    }
                });
            }
        };
        ObjectEditor.prototype._doNavigateSibling = function (partOptions) {
            var that = this;
            return that.navigationService.replace({
                part: that.name,
                partOptions: lang.extend(partOptions, {
                    navigateSiblings: that.options.navigateSiblings,
                    page: that.currentPage().name
                })
            });
        };
        ObjectEditor.prototype._getObjectIndex = function (siblings) {
            if (!lang.isArray(siblings)) {
                return -1;
            }
            var viewModel = this.options.viewModel, id = (viewModel && viewModel.id) || this.options.id;
            return lang.findIndex(siblings, function (item) { return (viewModel && item.viewModel === viewModel) || (id && item.id === id); });
        };
        ObjectEditor.prototype.getCloseResult = function (result) {
            var that = this;
            if (that.options.navigateSiblings && that.viewModel) {
                result.selectedId = that.viewModel.id;
            }
            return result;
        };
        ObjectEditor.prototype.createMenuDefaults = function () {
            var key = this._isIsolated ? "RootEditor" : "Editor";
            return Menu.defaultsFor(this.defaultMenus[key], key, this._getType());
        };
        ObjectEditor.prototype.createMenu = function () {
            return new Menu(this.createMenuDefaults(), this.options.menu);
        };
        ObjectEditor.prototype._getType = function () {
            var that = this;
            return that.options.type || (that.viewModel && that.viewModel.meta && that.viewModel.meta.name);
        };
        ObjectEditor.prototype._getPropertyEditorMd = function (viewModel, prop) {
            var that = this, typeMd = viewModel.meta, propMd;
            if (typeof prop === "string") {
                if (typeMd) {
                    propMd = typeMd.props[prop] || typeMd.complex[prop];
                    if (propMd) {
                        // fast-simple case: prop is string and we found a metaprop in VM's entity for it
                        return propMd;
                    }
                }
                if (that.app.config.isDebug && !propMd && prop && prop.indexOf(".") < 0)
                    throw new Error("ObjectEditor's viewModel doesn't have a property with name '" + prop + "'");
                // Prop is a string, but it contains ".", so it can be a prop-chain (like "prop1.prop2")
                prop = { name: prop };
            }
            if (!prop.name) {
                throw new Error("ObjectEditor: property editor metadata does not contain required field 'name'");
            }
            if (typeMd) {
                var propMdDeclared = typeMd.props[prop.name] || typeMd.complex[prop.name];
                if (!propMdDeclared) {
                    // no metaprop in VM's entity, prop can be a chain ("prop1.prop1")
                    var parts = prop.name.split(".");
                    if (parts.length > 1) {
                        prop.chain = {
                            props: []
                        };
                        for (var i = 0; i < parts.length; ++i) {
                            // NOTE: тут может быть сложный случай: 1-я часть навигируемое свойство, 2-ая комплексное,
                            // например: "organizer.address.street".
                            // TODO: для поддержки навигируемых свойств в комплексных типах потребуется доработка,
                            // т.к. нельзя просто брать до первой точки, первое навигируемое св-во может быть быть с точкой
                            // (complexProp.navPropOfComplexProp.otherNestedProp)
                            propMdDeclared = typeMd.props[parts[i]];
                            if (propMdDeclared) {
                                if (propMdDeclared.ref && propMdDeclared.ref.kind === "entity") {
                                    typeMd = propMdDeclared.ref;
                                }
                                prop.chain.props.push(propMdDeclared);
                                // it should be the last part of the chain
                            }
                            else if (typeMd.complex[parts[i]]) {
                                // current part - is a complex prop, join the rest parts to get a valuable prop
                                var propName = parts[i];
                                for (var j = i + 1; j < parts.length; ++j) {
                                    propName = propName + "." + parts[j];
                                }
                                // NOTE: теоретически цепочка может кончатся также комплексным, если для него написали РЕ
                                propMdDeclared = typeMd.props[propName] || typeMd.complex[propName];
                                if (!propMdDeclared && that.app.config.isDebug)
                                    throw new Error("ObjectEditor's viewModel doesn't have a property with name '" + prop.name + "'");
                                prop.chain.props.push(propMdDeclared);
                                break;
                            }
                        }
                    }
                }
                propMd = that._mergePropMd(propMdDeclared, prop);
            }
            else {
                propMd = prop;
            }
            return propMd;
        };
        ObjectEditor.prototype._mergePropMd = function () {
            var propMds = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                propMds[_i] = arguments[_i];
            }
            return lang.extend.apply(lang, [{}].concat(propMds));
        };
        ObjectEditor.prototype._createPage = function (pageInfo) {
            if (!pageInfo) {
                throw new Error("ObjectEditor: pageInfo wasn't specified");
            }
            var that = this, page = that._onCreatePage(pageInfo);
            if (!page) {
                return;
            }
            if (page.setObjectEditor) {
                page.setObjectEditor(that);
            }
            else {
                page.editor = that;
            }
            if (pageInfo.properties) {
                for (var _i = 0, _a = pageInfo.properties; _i < _a.length; _i++) {
                    var prop = _a[_i];
                    var propMd = that._getPropertyEditorMd(that.viewModel, prop);
                    if (propMd) {
                        page.editors[propMd.name] = that._createEditorForProp(page, propMd, that.viewModel);
                    }
                }
            }
            else if (!pageInfo.template) {
                // auto create editor for ALL properties
                that._generateAllEditors(page);
            }
            // sections - additional grouping of PEs:
            that.initSections(page, pageInfo);
            that._doAddPage(page);
            return page;
        };
        ObjectEditor.prototype.initSections = function (page, pageInfo) {
            var sectionsOpts = pageInfo.sections;
            if (sectionsOpts && sectionsOpts.length && page.editors) {
                var sections_1 = [];
                // пересортируем редакторы (pe) в editors так, чтобы они шли в порядке секций, а pe без секции первым
                var peToSection_1 = {}; // pe's name to its section (contains only pe with section)
                // group editors by sections
                sectionsOpts.forEach(function (section) {
                    if (!section.name || !section.properties || !section.properties.length)
                        return;
                    section.properties.forEach(function (propRef) {
                        peToSection_1[propRef] = section.name;
                    });
                });
                var emptySection_1 = new EditorPage.Section();
                emptySection_1.page = page;
                // pe's w/o section first
                lang.forEach(page.editors, function (pe, name) {
                    if (!peToSection_1[name]) {
                        // pe without section
                        emptySection_1.editors[name] = pe;
                    }
                });
                if (!lang.isEmptyObject(emptySection_1.editors)) {
                    sections_1.push(emptySection_1);
                }
                // then other w/section in the order of section -> section.properties
                sectionsOpts.forEach(function (sectionOpt) {
                    if (!sectionOpt.name) {
                        return;
                    }
                    var section = new EditorPage.Section(sectionOpt);
                    section.page = page;
                    sections_1.push(section);
                    sectionOpt.properties.forEach(function (propRef) {
                        var pe = page.editors[propRef];
                        if (pe) {
                            section.editors[propRef] = pe;
                        }
                    });
                    if (sectionOpt.autoHide) {
                        // hide section when all its editors are hidden
                        var allHidden_1 = true;
                        lang.forEach(section.editors, function (pe) {
                            pe.bind("change:hidden", section.recalculateHidden, section);
                            allHidden_1 = allHidden_1 && pe.hidden();
                        });
                        section.hidden(allHidden_1);
                    }
                });
                page.sections = sections_1;
            }
        };
        ObjectEditor.prototype._onCreatePage = function (pageInfo) {
            var that = this;
            pageInfo.contextName = that.contextName;
            var name = pageInfo.name;
            if (name) {
                // NOTE: page name will be used in DOM ids, it shouldn't contain spaces
                name = name.replace(/\s/gi, "_");
            }
            else {
                name = "page-" + (that.pages.count() + 1);
            }
            pageInfo.name = name;
            if (that.options.suppressAutoLoad) {
                pageInfo.presenterOptions = pageInfo.presenterOptions || {};
                pageInfo.presenterOptions.suppressAutoLoad = true;
            }
            return that.onCreatePage(pageInfo);
        };
        ObjectEditor.prototype.onCreatePage = function (pageInfo) {
            var onCreatePage = this.options.onCreatePage;
            if (onCreatePage) {
                var page = onCreatePage.call(this, pageInfo, this.viewModel);
                if (page) {
                    return page;
                }
                else if (page === false) {
                    return;
                }
            }
            var PageClass = lang.isFunction(pageInfo.Class) ? pageInfo.Class : EditorPage;
            return new PageClass(pageInfo, this.viewModel);
        };
        ObjectEditor.prototype._doAddPage = function (page) {
            var that = this, args = { page: page };
            that.onPageCreated(args);
            page = args.page;
            that.pages.add(page);
        };
        /**
         * Create a default page in case when editor's options have no pages metadata.
         * @protected
         */
        ObjectEditor.prototype._createDefaultPage = function () {
            var pageInfo = { name: "", title: "" };
            return this._createPage(pageInfo);
        };
        ObjectEditor.prototype.onPageCreated = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_CREATED, this, args);
        };
        ObjectEditor.prototype._generateAllEditors = function (page) {
            var that = this, viewModel = that.viewModel, meta = viewModel.meta;
            if (meta) {
                for (var propName in meta.props) {
                    var propMd = meta.props[propName];
                    if (propMd && !lang.isFunction(propMd)) {
                        page.editors[propMd.name] = that._createEditorForProp(page, propMd, viewModel);
                    }
                }
            }
        };
        ObjectEditor.prototype._createEditorForProp = function (page, propMd, viewModel) {
            var that = this, mixedPropMd = that._onCreatePropEditor(page, propMd, viewModel), propEditor = PropertyEditor.DefaultMapping.create(mixedPropMd, viewModel);
            propEditor.setNavigationService(page.navigationService);
            if (propEditor.userSettings) {
                that.userSettings.attach("pe_" + page.name + "_" + mixedPropMd.name, propEditor.userSettings);
            }
            propEditor.setEditorPage(page);
            return propEditor;
        };
        ObjectEditor.prototype._onCreatePropEditor = function (page, propMd, viewModel) {
            var that = this, mixedPropMd = lang.extend({}, propMd);
            mixedPropMd = that.onCreatePropEditor(page, mixedPropMd, viewModel) || mixedPropMd;
            // во вложенном редакторе редактор обратного свойств относительно того, откуда нас открыли - readonly
            if (propMd.opposite && that.editorContext.parentProp && that.editorContext.parentProp === propMd.opposite) {
                mixedPropMd.readOnly = true;
            }
            // set PE context option
            mixedPropMd.contextName = that.contextName;
            if (that.options.suppressAutoLoad) {
                mixedPropMd.presenterOptions = mixedPropMd.presenterOptions || {};
                mixedPropMd.presenterOptions.suppressAutoLoad = true;
            }
            return mixedPropMd;
        };
        ObjectEditor.prototype.onCreatePropEditor = function (page, propMeta, viewModel) {
            var onCreatePropEditor = this.options.onCreatePropEditor;
            if (onCreatePropEditor) {
                return onCreatePropEditor.call(this, page, propMeta, viewModel);
            }
            return propMeta;
        };
        /**
         * @protected
         * @returns {{SaveAndClose: (Command), Apply: (Command), CancelAndClose: (Command), SwitchToPage: (Command)}}
         */
        ObjectEditor.prototype.createCommands = function () {
            var that = this, cmdSaveClose = core.commands.createBoundCommand({
                execute: that.doSaveAndClose,
                canExecute: that.canSaveAndClose,
                debounce: that.options.commandsDebounce
            }, that), cmdApply = core.commands.createBoundCommand({
                execute: that.doApply,
                canExecute: that.canApply,
                debounce: that.options.commandsDebounce
            }, that), cmdCancel = core.createCommand({
                execute: function () {
                    that.cancel();
                },
                name: "CancelAndClose",
                debounce: that.options.commandsDebounce
            }), cmdSwitchToPage = core.createCommand({
                execute: function (args) {
                    that.switchToPage(args.pageName);
                },
                name: "SwitchToPage",
                debounce: that.options.commandsDebounce
            });
            return {
                SaveAndClose: cmdSaveClose,
                Apply: cmdApply,
                CancelAndClose: cmdCancel,
                SwitchToPage: cmdSwitchToPage
            };
        };
        ObjectEditor.prototype.findPropertyEditor = function (viewModel, propName) {
            for (var i = 0, l = this.pages.count(); i < l; i++) {
                var page = this.pages.get(i), pe = page.getPropertyEditor(propName, viewModel);
                if (pe)
                    return {
                        pe: pe,
                        pageName: page.name
                    };
            }
        };
        ObjectEditor.prototype.findPropertyEditorPage = function (propertyEditor) {
            return this.pages.find(function (page) {
                var pe = page.getPropertyEditor(propertyEditor.viewModelProp, propertyEditor.viewModel);
                return pe && pe === propertyEditor;
            });
        };
        /**
         * Executes 'iterator' function for each property editor of each page
         * @param {Function} iterator
         * @param {*} [context] this arguments for iterator
         */
        ObjectEditor.prototype.forEachPE = function (iterator, context) {
            this.pages.forEach(function (page) {
                lang.forEach(page.editors, function (pe) {
                    iterator.call(context, pe);
                });
            });
        };
        /**
         * Return array of descriptions of editor page.
         * @param {EditorPage} page
         * @returns {Array}
         */
        ObjectEditor.prototype.getPageSummary = function (page) {
            var summary = [];
            lang.forEach(page.editors, function (pe) {
                var viewModel = pe.viewModel, propTitle = pe.title(), propName = pe.viewModelProp, propMeta = viewModel.meta && viewModel.meta.props[propName], propVal;
                if (propMeta) {
                    propTitle = propTitle || propMeta.descr;
                    propVal = viewModel.getFormatted
                        ? viewModel.getFormatted(propName)
                        : undefined;
                }
                if (propVal === undefined) {
                    propVal = lang.get(viewModel, propName);
                    if (propVal) {
                        propVal = propVal.toString();
                    }
                }
                if (propVal) {
                    summary.push({
                        title: propTitle || propName,
                        value: propVal
                    });
                }
            });
            return summary;
        };
        ObjectEditor.prototype.doSaveAndClose = function (args) {
            return this.finish(args);
        };
        ObjectEditor.prototype.canSaveAndClose = function () {
            return this.canSave();
        };
        /**
         * Run validation for object and all pages, then commit all changes (if it's root editor), then close.
         * @param {Object} [cmdArgs] command arguments
         * @param {boolean} [cmdArgs.createNext] if specified than an editor for creating a next new object will be opened
         * @returns {Promise}
         */
        ObjectEditor.prototype.finish = function (cmdArgs) {
            if (cmdArgs === void 0) { cmdArgs = {}; }
            var that = this, args = {
                cancel: false,
                cmdArgs: cmdArgs,
                promise: undefined
            };
            that.onFinishing(args);
            if (args.cancel) {
                return lang.rejected();
            }
            if (args.promise && lang.isPromise(args.promise)) {
                return args.promise.then(function (result) {
                    if (result === false) {
                        return lang.rejected();
                    }
                    if (that.isDisposed) {
                        return lang.rejected();
                    }
                    return that._finish2(cmdArgs);
                });
            }
            return that._finish2(cmdArgs);
        };
        ObjectEditor.prototype._finish2 = function (cmdArgs) {
            var that = this;
            // NOTE: ContextPartComponentMixin._validateBeforeSave will call our runValidation
            return that._validateBeforeSave().then(function () {
                var args = {
                    reason: that._isIsolated ? "saveAndClose" : "close",
                    cmdArgs: cmdArgs,
                    cancel: false,
                    promise: undefined
                };
                that.onAccepting(args);
                if (args.cancel) {
                    return lang.rejected();
                }
                if (args.promise && lang.isPromise(args.promise)) {
                    return args.promise.then(function (result) {
                        if (result === false) {
                            return lang.rejected();
                        }
                        if (that.isDisposed) {
                            return lang.rejected();
                        }
                        return that._finish3(cmdArgs);
                    });
                }
                return that._finish3(cmdArgs);
            });
        };
        ObjectEditor.prototype._finish3 = function (cmdArgs) {
            var that = this;
            var res;
            if (that._isIsolated) {
                // saving in root context:
                res = that._saveChanges(cmdArgs);
            }
            else {
                that.onAcceptState();
                that._close(cmdArgs);
                res = true;
            }
            that.onFinished({ result: res });
            return res;
        };
        ObjectEditor.prototype.doApply = function (args) {
            return this.save(args ? args.async : false);
        };
        ObjectEditor.prototype.canApply = function () {
            return this.canSave();
        };
        ObjectEditor.prototype.canSave = function () {
            // TODO: если это создание нового, то пока объект пустой, сохранить/Ок заблокировано
            // TODO: если при сохранении возникла ошибка и объект удален, то сохранение заблокировано
            // && this.get("viewModel").get("uow").hasChanges();
            if (this._isIsolated && this.saving()) {
                return false;
            }
            var obj = this.viewModel;
            if (lang.get(obj, "isRemoved") || lang.get(obj, "isInvalid")) {
                return false;
            }
            return true;
            // WAS: return !this._isIsolated || !this.saving();
        };
        /**
         * Save changes ("Apply")
         * @param {Boolean} [isAsync=false] 'true' for non blocking save
         * @returns {JQuery.Promise}
         */
        ObjectEditor.prototype.save = function (isAsync) {
            var that = this;
            // saving in root context
            if (!that._isIsolated) {
                return lang.rejected();
            }
            // NOTE: ContextPartComponentMixin._validateBeforeSave will call our runValidation
            return that._validateBeforeSave().then(function () {
                var args = {
                    reason: "save",
                    cancel: false,
                    promise: undefined
                };
                that.onAccepting(args);
                if (args.cancel) {
                    return lang.rejected();
                }
                if (that.isDisposed) {
                    return lang.rejected();
                }
                if (args.promise && lang.isPromise(args.promise)) {
                    return args.promise.then(function (result) {
                        if (result === false) {
                            return lang.rejected();
                        }
                        if (that.isDisposed) {
                            return lang.rejected();
                        }
                        return that._save2(isAsync);
                    });
                }
                return that._save2(isAsync);
            });
        };
        ObjectEditor.prototype._save2 = function (isAsync) {
            var that = this, args = {};
            that.onSaving(args);
            if (args.cancel) {
                return lang.rejected();
            }
            that.saving(true);
            that._disposeParts();
            if (!isAsync) {
                that.isBusy(true);
            }
            var saveOptions = { onError: that._onSyncSaveError.bind(that) };
            if (args.interop) {
                saveOptions.interop = args.interop;
            }
            return that.doSave(saveOptions)
                .always(function () {
                if (that.isDisposed) {
                    return;
                }
                that.saving(false);
                if (!isAsync) {
                    that.isBusy(false);
                }
            })
                .then(function () {
                if (that.isDisposed) {
                    return;
                }
                that.onSaved({ blockingSave: !isAsync });
            });
        };
        ObjectEditor.prototype.onAccepting = function (args) {
            this.trigger(ObjectEditor.Events.ACCEPTING, this, args);
        };
        ObjectEditor.prototype.onFinishing = function (args) {
            this.trigger(ObjectEditor.Events.FINISHING, this, args);
        };
        ObjectEditor.prototype.onFinished = function (args) {
            this.trigger(ObjectEditor.Events.FINISHED, this, args);
        };
        ObjectEditor.prototype.onSaving = function (args) {
            this.trigger(ObjectEditor.Events.SAVING, this, args);
        };
        ObjectEditor.prototype.onSaved = function (args) {
            this.trigger(ObjectEditor.Events.SAVED, this, args);
        };
        ObjectEditor.prototype.onSaveError = function (args) {
            this.trigger(ObjectEditor.Events.SAVE_ERROR, this, args);
        };
        ObjectEditor.prototype._close = function (cmdArgs) {
            var that = this;
            if (cmdArgs && cmdArgs.skipClose) {
                return;
            }
            if (cmdArgs && cmdArgs.createNext) {
                return that.navigationService.replace({
                    part: that.name,
                    partOptions: that._originalOptions
                });
            }
            else {
                return that.navigationService.close(that.getCloseResult({ object: that.viewModel, success: true }));
            }
        };
        ObjectEditor.prototype._leave = function (success, cmdArgs) {
            var that = this;
            if (cmdArgs && cmdArgs.skipClose) {
                return lang.rejected();
            }
            return that.navigationService.leave(that.getCloseResult({
                object: that.viewModel,
                success: success
            }));
        };
        ObjectEditor.prototype._saveChanges = function (cmdArgs) {
            if (cmdArgs === void 0) { cmdArgs = {}; }
            var that = this, args = {
                // NOTE: SaveAndCreate mode won't work without blockingSave=true
                blockingSave: lang.coalesce(cmdArgs.blockingSave, that.options.blockingSave, cmdArgs.createNext),
                onAsyncError: that._onAsyncSaveError.bind(that),
                onSyncError: that._onSyncSaveError.bind(that),
                cancel: undefined
            };
            that.onSaving(args);
            if (args.cancel) {
                return lang.rejected();
            }
            that._disposeParts();
            that.saving(true);
            var saveOptions = {}, promiseSave;
            if (args.interop) {
                saveOptions.interop = args.interop;
            }
            if (args.blockingSave) {
                that.isBusy(true);
                saveOptions.onError = args.onSyncError;
                saveOptions.interop = { suppressProcessEvent: true };
                promiseSave = lang.when(that.doSave(saveOptions))
                    .always(function () {
                    if (that.isDisposed) {
                        return;
                    }
                    that.saving(false);
                    that.isBusy(false);
                }).then(function () {
                    if (that.isDisposed) {
                        return;
                    }
                    that.onSaved({ blockingSave: true });
                    that._close(cmdArgs);
                });
                // NOTE: we're NOT closing the editor here
            }
            else {
                var deferredSave_1 = lang.deferred();
                promiseSave = deferredSave_1.promise();
                // NOTE: Сначала закрываем редактор, а затем запускаем сохранение. В противном случае могут
                // возникнуть проблемы, если сохранение завершилось синхронно. Например, если при ошибке в процессе
                // синхронного сохранения успели выполнить команду "Вернуться к редактированию", то редактор
                // все равно будет закрыт.
                var promiseLeave = that._leave(promiseSave, cmdArgs);
                saveOptions.onError = args.onAsyncError;
                lang.when(that.doSave(saveOptions))
                    .done(function () {
                    that.saving(false);
                    that.onSaved({ blockingSave: false });
                    deferredSave_1.resolve();
                }).fail(function (err) {
                    that.saving(false);
                    deferredSave_1.reject(err);
                });
                // уничтожаем редактор только после того, как мы ушли из него и сохранение успешно завершилось
                lang.when(promiseSave, promiseLeave).then(function () {
                    // уничтожаем редактор
                    that._disposeInner();
                });
            }
            return promiseSave;
        };
        ObjectEditor.prototype.doSave = function (saveOptions) {
            if (saveOptions === void 0) { saveOptions = {}; }
            var tx = (this.options.transactionName || this.name);
            saveOptions = lang.extend(saveOptions, { interop: { tx: tx } });
            if (this.options.getSaveOptions) {
                saveOptions = this.options.getSaveOptions(saveOptions, this);
            }
            // NOTE: this method must not throw any exception
            try {
                return this.viewModel.uow.save(saveOptions);
            }
            catch (ex) {
                this.traceSource.error(ex);
                return lang.rejected(ex);
            }
        };
        ObjectEditor.prototype._onConcurrencyError = function (error) {
            var that = this, type = that.viewModel.meta.name, id = that.viewModel.id, deletedIdentities = error.deletedObjects, isRootDeleted = lang.some(deletedIdentities, 
            // todo: remove objectID , left for backward compatibility
            function (deletedObject) { return deletedObject.type === type && (deletedObject.id === id || deletedObject.objectID === id); }), errorPart;
            if (isRootDeleted) {
                // root object deleted. we can't resolve this - show blocking error: "Saving and continuing working with data are impossible."
                errorPart = new ViolationInfoPart({
                    message: error.message +
                        (lang.stringEndsWith(error.message, ".") ? " " : ". ") +
                        resources["interop.error.save_conflict_critical"],
                    severity: "critical"
                });
            }
            else if (error.obsoleteObjects && error.obsoleteObjects.length) {
                // if root object is not deleted and there're obsolete objects - try resolve
                errorPart = new ConcurrencyErrorPart({
                    editor: that,
                    error: error
                });
                errorPart.promise.done(function () {
                    that.closeContextPart(errorPart);
                });
            }
            else if (deletedIdentities && deletedIdentities.length) {
                // NOTE: устаревших объектов нет, но есть устаревшие-удаленные и это не корневой объект,
                // объекты из deletedObjects будут помечены как invalid в результате завершения обработки (см. UoW._onSaveFailed).
                // Если есть другие изменения в UoW, то можно повторить сохранение, оно уже выполнится без invalid-объектов,
                // правда ссылки на них остануться. Но если это старые ссылки, то на сервере их уже нет.
                // Если это новые локальные ссылки (изменные значения свойств), то при сохранении будут новые ошибки.
                // Если мы просто удалим invalid-объекты, то все свойства с ссылками на них станут модифицированными,
                // и при следующем сохранении объекты-владельцы этих свойств вызовут OptimisticConcurrency, т.к. ts у них остались старые.
                // Поэтому сначала мы перезагрузим все объекты со ссылками на invalid-объекты (из deletedObjects).
                // После этого могут остаться только локальные (несохраненые) ссылки. Они уже невалидны.
                // И после этого удалим всё со ссылками.
                that.viewModel.uow.purgeWithCascade(deletedIdentities);
                // prevent default handing in UoW._onSaveFailed as we've removed and detached all objects already
                error.deletedObjects = null;
                error.serverError.deletedObjects = null; // todo: remove
                errorPart = new ViolationInfoPart({
                    message: resources["interop.error.save_conflict_partial"],
                    severity: "critical"
                });
                // no obsolete objects only obsolete-deleted (but not the root),
                // "(Объект <> удален | Объекты <..> удалены) на сервере, их сохранение невозможно.
                // Если вы выполнили другие изменения, нажмите Сохранить для повтора."
            }
            else {
                // just in case
                errorPart = new ViolationInfoPart({
                    message: error.message,
                    severity: "critical"
                });
            }
            that.contextParts.add(errorPart);
        };
        ObjectEditor.prototype._onSyncSaveError = function (args) {
            var that = this, error = args.error;
            // NOTE: в принципе saving/isBusy сбрасываются в continuation промиса от UoW.save,
            // но данный метод вызывается раньше, т.к. он передается как опция onError для UoW.save
            // поэтому сбросим тут, чтобы как можно раньше.
            that.saving(false);
            that.isBusy(false);
            if (core.eth.isOptimisticConcurrency(error)) {
                // process concurrency error
                that._onConcurrencyError(error);
            }
            else {
                // defer which we're passing into createSaveErrorEvent can be used in event's commands
                var event_1 = that.app.dataFacade.createSaveErrorEvent(error, args.options, args.objects);
                that.createSaveErrorInfoPart(args, event_1);
            }
            // return control to Uow.save - complete: rejecting with the error - it'll reject promise returned from uow.save
            args.complete();
            that.onSaveError(args);
        };
        ObjectEditor.prototype.getSaveErrorMessage = function (event, violation) {
            return (violation && (violation.description || violation.error)) || (event.html ? formatters.safeHtml(event.html, event.message) : event.message);
        };
        ObjectEditor.prototype.createSaveErrorInfoPart = function (args, event) {
            var parts = [];
            // extract violation from server exception
            var violations = event.error.violations;
            if (violations && violations.length) {
                for (var _i = 0, violations_1 = violations; _i < violations_1.length; _i++) {
                    var violation = violations_1[_i];
                    var message = this.getSaveErrorMessage(event, violation);
                    violation.error = message;
                    // in server violation object is identity (type/id), we need DomainObject
                    if (this.viewModel && this.viewModel.uow && violation.object) {
                        if (this.viewModel.meta.name === violation.object.type &&
                            this.viewModel.id === violation.object.id) {
                            violation.object = this.viewModel;
                        }
                        else {
                            violation.object = this.viewModel.uow.find(violation.object.type, violation.object.id);
                        }
                    }
                }
            }
            else {
                violations = [{
                        error: this.getSaveErrorMessage(event),
                        severity: "error",
                        menu: event.menu,
                        props: []
                    }];
            }
            this._normalizeViolationArray(violations);
            this._triggerPropsViolationEvents(violations, this.currentPage());
            this.violations.reset(violations);
            if (this.presenter.activateContextParts) {
                this.presenter.activateContextParts();
            }
        };
        ObjectEditor.prototype._onAsyncSaveError = function (args) {
            var that = this, event = that.createAsyncSaveErrorEvent(args);
            if (event) {
                window.setTimeout(function () {
                    that.app.eventPublisher.publish("interop.save.error", event);
                });
            }
            else {
                args.complete();
            }
        };
        /**
         * Create an event object for publishing via EventPublisher.
         * @param {Object} args
         * @param {Object} args.error
         * @param {Object} args.options
         * @param {Object} args.objects Json object which were passed in dataFacade.save from UnitOfWork.save
         * @param {Object} args.states
         * @param {Object} args.deferred
         * @param {Function} args.complete Function to call for completion of save operation. This will signal (resolve/reject) on promise returned by UnitOfWork.save
         * @param {Function} args.resolve UnitOfWork's success handler
         * @param {Function} args.reject UnitOfWork's error handler
         * @returns {Object} Event object
         */
        ObjectEditor.prototype.createAsyncSaveErrorEvent = function (args) {
            var that = this, states = args.states, event = that.app.dataFacade.createSaveErrorEvent(args.error, args.options, args.objects);
            event.kind = core.SystemEvent.Kind.actionRequest;
            var menu = {
                items: [
                    {
                        name: "ReturnToEdit",
                        title: resources["objectEditor.return_to_edit"],
                        icon: "edit",
                        command: core.createCommand({
                            execute: function () {
                                // let's open the same editor instance
                                that.navigationService
                                    .navigate({ part: that })
                                    .done(function () {
                                    that._onSyncSaveError(args);
                                });
                            }
                        })
                    }, {
                        name: "Cancel",
                        title: resources["cancel"],
                        command: core.createCommand({
                            execute: function () {
                                args.complete();
                                // откатываем все состояния, кроме последнего (оно содержит изменения, сделанные во время сохранения)
                                if (states && lang.isArray(states)) {
                                    states.forEach(function (state, i) {
                                        if (i < states.length - 1) {
                                            that.viewModel.uow.rollbackState(state);
                                        }
                                    });
                                }
                                // уничтожаем редактор
                                that._disposeInner();
                            }
                        })
                    }
                ]
            };
            event.menu.mergeWith(menu);
            return event;
        };
        ObjectEditor.prototype.cancel = function () {
            // NOTE: rollback will be done on dispose
            this.navigationService.close(this.getCloseResult({ success: false }));
        };
        ObjectEditor.prototype.onSaveState = function (uow) {
            var that = this, uowStateName = that.options.uowStateName;
            uow = uow || (that.viewModel && that.viewModel.uow);
            if (uow && !that.options.skipSaveState) {
                if (!uowStateName) {
                    // если имя состояния uow не задано, то используем сгенерированное uow
                    that._uowStateName = uow.saveState();
                }
                else {
                    // иначе создаем именованное состояние, но только если оно уже не было создано ранее
                    that._uowStateName = uow.hasState(uowStateName) ? uowStateName : uow.saveState(uowStateName);
                }
            }
        };
        ObjectEditor.prototype.onRollbackState = function () {
            var that = this, uow = that.viewModel && that.viewModel.uow;
            if (uow && that._uowStateName) {
                // NOTE: if UoW has no such state it will do nothing
                uow.rollbackState(that._uowStateName);
                delete that._uowStateName;
            }
        };
        ObjectEditor.prototype.onAcceptState = function () {
            var that = this, uow = that.viewModel && that.viewModel.uow;
            if (uow && that._uowStateName) {
                // NOTE: if UoW has no such state it will do nothing
                uow.acceptState(that._uowStateName);
                delete that._uowStateName;
            }
        };
        ObjectEditor.prototype._renderError = function (domElement, msg) {
            var that = this;
            that._errorView = new View({
                template: fatalErrorTemplate,
                unbound: true,
                viewModel: {
                    title: that.title,
                    message: msg,
                    CloseCommand: core.createCommand({
                        execute: function () {
                            that.navigationService.close(that.getCloseResult({ success: false }));
                        }
                    })
                }
            });
            that._errorView.render(domElement);
            that.reportState(/*replaceState*/ false);
        };
        ObjectEditor.prototype._setError = function (domElement, error) {
            var that = this;
            that.error = error;
            that.$domElement = $(domElement);
            that.domElement = that.$domElement[0];
            that._renderError(domElement, error);
        };
        ObjectEditor.prototype.doRender = function (domElement) {
            var that = this;
            if (core.lang.isPromise(that.initializationTask) && that.initializationTask.state() === "pending") {
                return _super.prototype.doRender.call(this, domElement);
            }
            return that._render(domElement);
        };
        ObjectEditor.prototype._render = function (domElement) {
            var that = this;
            if (that.error) {
                that._renderError(domElement, that.error);
                return lang.rejected();
            }
            if (!that.viewModel) {
                that._setError(domElement, "No viewModel was defined for ObjectEditor");
                return lang.rejected();
            }
            if (!that.pages || that.pages.count() === 0) {
                that._setError(domElement, "No pages were defined for ObjectEditor");
                return lang.rejected();
            }
            var firstPageToShow = that.currentPage() || that.pages.find(function (p) { return !p.hidden(); });
            if (!firstPageToShow) {
                that._setError(domElement, "No visible pages were defined for ObjectEditor");
                return lang.rejected();
            }
            if (that.app.dataFacade && that.app.dataFacade.beginBatch) {
                that.app.dataFacade.beginBatch();
            }
            _super.prototype.doRender.call(this, domElement);
            var task = that._activatePage(firstPageToShow);
            return task.always(function () {
                if (that.app.dataFacade && that.app.dataFacade.completeBatch) {
                    that.app.dataFacade.completeBatch();
                }
            });
        };
        ObjectEditor.prototype.getPageByName = function (name) {
            return this.pages.find(function (page) { return page.name === name; });
        };
        /**
         * удаляет из текущего набора нарушений, нарушения связанные с указанной страницей
         * @param {Array|EditorPage|Object} pages - массив экземпляров EditorPage или метаданных страниц
         * @protected
         */
        ObjectEditor.prototype._removePageViolations = function (pages) {
            if (!pages) {
                return;
            }
            var that = this, pageArray = lang.array(pages), violationsToRemove = that.violations.all().filter(function (v) {
                return pageArray.some(function (page) { return v.pageName === page.name; });
            });
            that.violations.remove(violationsToRemove);
        };
        /**
         * Run validation.
         * @param {EditorPage} [page] a page to validate, can be empty when validating on closing (that means we're validating all pages)
         * @return {Array} An array with violations
         */
        ObjectEditor.prototype.runValidation = function (page) {
            var that = this, violations = that._validate(page), violationsOnOtherPages;
            that._triggerPropsViolationEvents(violations, page || that.currentPage());
            if (page) {
                // если валидация идет по странице (такое происходит только при навигации по вкладкам в режимах loose & strict) -
                // нужно удалить все нарушения по этой странице
                // все прошлые нарушения кроме нарушений по валидируемой странице
                violationsOnOtherPages = that.violations.all().filter(function (v) { return v.pageName !== page.name; });
            }
            if (violations && violations.length) {
                if (page) {
                    // из новых нарушений отфильтровываем только те, которые относятся к проверяемой странице
                    violations = that._filterPagesViolations(violations, page.name);
                    // общий скоуп
                    violations = violations.concat(violationsOnOtherPages);
                }
                // сортировка по номеру страницы
                violations = that._sortViolations(violations);
                that.violations.reset(violations);
            }
            else {
                // нарушений нет
                if (page) {
                    // тогда нужно убрать из общего списка нарушения по этой странице (если есть)
                    that.violations.reset(violationsOnOtherPages);
                }
                else {
                    // в случае общей валидации - просто очищаем
                    that.violations.clear();
                }
            }
            return violations || [];
        };
        ObjectEditor.prototype._validate = function (page) {
            var that = this;
            that.onValidating({ page: page });
            // 1. validate each PropertyEditor from all pages or a particular one
            var violations;
            if (page) {
                violations = that._validatePage(page);
            }
            else if (that.pages.count() > 0) {
                that.pages.forEach(function (page) {
                    violations = that._validatePage(page, violations);
                });
            }
            // 2. validate object (WITHOUT props) and get all its errors (if any)
            var violationsObj = validation.validateObject(that.viewModel);
            if (violationsObj && violationsObj.length) {
                violations = validation.appendViolation(violationsObj, violations);
            }
            // 3. call editor's rules/validators and get all its errors
            if (that.rules) {
                for (var _i = 0, _a = that.rules; _i < _a.length; _i++) {
                    var rule = _a[_i];
                    var violation = rule.validate(that.viewModel);
                    if (violation) {
                        violations = validation.appendViolation(violation, violations);
                    }
                }
            }
            var args = { page: page, result: violations };
            that.onValidated(args);
            violations = args.result;
            // normalize violation objects
            that._normalizeViolationArray(violations);
            return violations;
        };
        ObjectEditor.prototype._validatePage = function (page, violations) {
            var violationsNew = page.runValidation();
            if (violationsNew && violationsNew.length) {
                if (violations && violations.length) {
                    violations = violations.concat(violationsNew);
                }
                else {
                    violations = violationsNew;
                }
            }
            return violations;
        };
        /**
         * Handles PropertyEditor.violation changes.
         * @param {PropertyEditor} pe
         * @param {Violation} newVal
         * @param {Violation} oldVal
         * @private
         */
        ObjectEditor.prototype._onPEViolationChanged = function (pe, newVal, oldVal) {
            var that = this, violations;
            //  we should remove previous violation
            if (oldVal) {
                if (!oldVal.pageName) {
                    var page = that.findPropertyEditorPage(pe);
                    if (page) {
                        oldVal.pageName = page.name;
                    }
                }
                if (oldVal.props && oldVal.props.length > 1) {
                    // if the old violation is multi-prop, then we should clear other PEs
                    for (var _i = 0, _a = oldVal.props; _i < _a.length; _i++) {
                        var p = _a[_i];
                        if (p === pe.viewModelProp) {
                            continue;
                        }
                        var otherPE = that.findPropertyEditor(pe.viewModel, p);
                        if (otherPE && otherPE.pe.violation() === oldVal) {
                            // here's a tricky point: when we're setting violation(null) for the other PE _onPEViolationChanged will fire again with the same violation as oldVal
                            otherPE.pe.violation(null);
                        }
                    }
                }
                violations = that.violations.all().filter(function (v) { return !lang.isEqual(v, oldVal); });
            }
            // add the new violation
            if (newVal) {
                if (!newVal.pageName) {
                    var page = that.findPropertyEditorPage(pe);
                    if (page) {
                        newVal.pageName = page.name;
                    }
                }
                if (newVal.props && newVal.props.length > 1) {
                    // if the new violation is multi-prop, then we should set it for other PEs
                    for (var _b = 0, _c = newVal.props; _b < _c.length; _b++) {
                        var p = _c[_b];
                        if (p === pe.viewModelProp) {
                            continue;
                        }
                        var otherPE = that.findPropertyEditor(pe.viewModel, p);
                        if (otherPE && otherPE.pe.violation() !== newVal) {
                            otherPE.pe.violation(newVal);
                        }
                    }
                }
                if (!violations) {
                    violations = that.violations.all().slice(0);
                }
                violations.push(newVal);
            }
            if (violations) {
                violations = that._sortViolations(violations);
                that.violations.reset(violations);
            }
        };
        ObjectEditor.prototype._sortViolations = function (violations) {
            var that = this, pages = that.pages.all();
            return lang.sort(violations, function (v1, v2) {
                if (!v1.pageName && !v2.pageName) {
                    return 0;
                }
                if (!v1.pageName) {
                    return 1;
                }
                if (!v2.pageName) {
                    return -1;
                }
                return pages.indexOf(that.getPageByName(v1.pageName)) -
                    pages.indexOf(that.getPageByName(v2.pageName));
            });
        };
        ObjectEditor.prototype.onValidating = function (args) {
            this.trigger(ObjectEditor.Events.VALIDATING, this, args);
        };
        ObjectEditor.prototype.onValidated = function (args) {
            this.trigger(ObjectEditor.Events.VALIDATED, this, args);
        };
        ObjectEditor.prototype._normalizeViolationArray = function (violations) {
            if (!lang.isArray(violations)) {
                return;
            }
            // NOTE: по идее строк в массиве уже не может быть
            for (var i = 0; i < violations.length; ++i) {
                var item = violations[i], violation = void 0;
                if (lang.isString(item)) {
                    violations[i] = violation = { error: item };
                }
                else {
                    violation = item;
                }
                var pageName = void 0;
                if (!violation.pageName && (pageName = this._tryFindViolationPageName(violation))) {
                    violation.pageName = pageName;
                }
            }
        };
        /**
         * Фильтрует переданынй массив нарушений и возвращает массив нарушений страниц, т.е. нарушения,
         * у которых указано имя страницы (pageName), либо в редакторе объекта
         * для нарушения в свойстве объекта можно найти редактор свойства.
         * @param {Array} violations - массив объектов нарушений
         * с нарушениями (для того, что бы их можно было отнести к нарушениям страницы)
         * @param {String} [pageName]
         */
        ObjectEditor.prototype._filterPagesViolations = function (violations, pageName) {
            var that = this, pagesViolations = [];
            if (violations) {
                for (var _i = 0, violations_2 = violations; _i < violations_2.length; _i++) {
                    var violation = violations_2[_i];
                    if (violation.pageName && (!pageName || violation.pageName === pageName)) {
                        pagesViolations.push(violation);
                    }
                    else {
                        var violationPageName = that._tryFindViolationPageName(violation);
                        if (violationPageName && (!pageName || violationPageName === pageName)) {
                            violation.pageName = violationPageName;
                            pagesViolations.push(violation);
                        }
                    }
                }
            }
            return pagesViolations;
        };
        ObjectEditor.prototype._tryFindViolationPageName = function (violation) {
            if (violation.object && violation.props && violation.props.length > 0) {
                var that_1 = this, pe_1;
                // take first page that we can find
                lang.find(violation.props, function (prop) {
                    pe_1 = that_1.findPropertyEditor(violation.object, prop);
                    return !!pe_1;
                });
                if (pe_1) {
                    return pe_1.pageName;
                }
            }
        };
        ObjectEditor.prototype._bindPropEditorViolationChanged = function (page) {
            var _this = this;
            if (!page) {
                return;
            }
            lang.forEach(page.editors, function (pe) {
                pe.bind("change:violation", _this._onPEViolationChanged, _this);
            });
        };
        ObjectEditor.prototype._unbindPropEditorViolationChanged = function (page) {
            var _this = this;
            if (!page) {
                return;
            }
            lang.forEach(page.editors, function (pe) {
                pe.unbind("change:violation", null, _this);
            });
        };
        /**
         * Сгенерировать в доменных объектах при наличии нарушений у свойств события "error:{propName}"
         * На данные события подписываются редакторы свойств (см. PropertyEditor) для отображения статуса "ошибка".
         * @param {Array} violations - array of violations
         * @param {EditorPage} [page] - события генерируются только для нарушений на указанной странице
         * @private
         */
        ObjectEditor.prototype._triggerPropsViolationEvents = function (violations, page) {
            if (!violations) {
                return;
            }
            for (var _i = 0, violations_3 = violations; _i < violations_3.length; _i++) {
                var v = violations_3[_i];
                if ((!page || v.pageName === page.name) && v.object && v.props && v.props.length) {
                    for (var _a = 0, _b = v.props; _a < _b.length; _a++) {
                        var propName = _b[_a];
                        v.object.trigger("error:" + propName, v);
                    }
                }
            }
        };
        /**
         * Change current page onto a new one
         * @param {EditorPage} page New page to go to
         * @param {Boolean} [skipValidation=false] if true then there will be no validation for the current page
         * @returns {$.Deferred.promise} resolved - page was changed, otherwise - rejected
         */
        ObjectEditor.prototype.setCurrentPage = function (page, skipValidation) {
            var that = this, oldPage = that.currentPage();
            if (oldPage === page) {
                return lang.rejected();
            }
            return lang.when(that._pageSwitching(oldPage, page)).then(function () {
                var deactivateTask;
                if (oldPage) {
                    // validating page on leaving
                    if (!skipValidation && that.options.pageValidation !== "none") {
                        var violations = that.runValidation(oldPage);
                        // in 'strict' mode preventing page leaving if there are any errors on it
                        if (that.options.pageValidation === "strict") {
                            var pageViolations = that._filterPagesViolations(violations, oldPage.name);
                            if (that._hasValidationErrors(pageViolations)) {
                                return lang.rejected();
                            }
                        }
                    }
                    that._pageUnloading(oldPage);
                    deactivateTask = lang.when(that._deactivatePage(oldPage))
                        .then(function () {
                        that._pageUnloaded(oldPage);
                    });
                    //deactivateTask = that._deactivatePage(oldPage);
                }
                if (page) {
                    return lang.when(deactivateTask)
                        .then(function () { return that._activatePage(page); })
                        .done(function () {
                        that.reportState(/*replaceState*/ false);
                    });
                }
                return lang.resolved();
            });
        };
        ObjectEditor.prototype._activatePage = function (page) {
            var that = this, task;
            that.traceSource.debug("ObjectEditor._activatePage");
            page.setNavigationService(that.navigationService);
            that.currentPage(page);
            that._pageStarting(page);
            if (that.presenter.activatePage) {
                task = that.presenter.activatePage(page);
            }
            return lang.async.then(task, function () {
                that._pageStarted(page);
                // If the current page has errors then signal its PEs so they can render error statuses.
                // (errors could be due to previous checking on the page leaving in not 'none' mode or as result of Save)
                if (page.hasViolations()) {
                    that._triggerPropsViolationEvents(that.violations.all(), page);
                }
                that._bindPropEditorViolationChanged(page);
                return lang.resolved();
            });
        };
        ObjectEditor.prototype._deactivatePage = function (page) {
            var that = this, task;
            if (that.presenter.deactivatePage) {
                task = that.presenter.deactivatePage(page);
            }
            return lang.when(task).done(function () {
                that._unbindPropEditorViolationChanged(page);
                page.unload();
            });
        };
        ObjectEditor.prototype._pageSwitching = function (oldPage, newPage) {
            var args = {
                pageFrom: oldPage,
                pageTo: newPage,
                cancel: false,
                defer: undefined
            };
            this.onPageSwitching(args);
            if (args.cancel) {
                return lang.rejected();
            }
            return args.defer || lang.resolved();
        };
        ObjectEditor.prototype.onPageSwitching = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_SWITCHING, this, args);
        };
        ObjectEditor.prototype._pageUnloading = function (oldPage) {
            var args = { page: oldPage, index: this.pages.indexOf(oldPage) };
            this.onPageUnloading(args);
            if (oldPage.onUnloading) {
                oldPage.onUnloading();
            }
        };
        ObjectEditor.prototype.onPageUnloading = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_UNLOADING, this, args);
        };
        ObjectEditor.prototype._pageUnloaded = function (page) {
            var args = { page: page, index: this.pages.indexOf(page) };
            this.onPageUnloaded(args);
            if (page.onUnloaded) {
                page.onUnloaded();
            }
        };
        ObjectEditor.prototype.onPageUnloaded = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_UNLOADED, this, args);
        };
        ObjectEditor.prototype._pageStarting = function (page) {
            var args = { page: page, index: this.pages.indexOf(page) };
            this.onPageStarting(args);
            if (page.onStarting) {
                page.onStarting();
            }
        };
        ObjectEditor.prototype.onPageStarting = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_STARTING, this, args);
        };
        ObjectEditor.prototype._pageStarted = function (page) {
            var args = { page: page, index: this.pages.indexOf(page) };
            this.onPageStarted(args);
            if (page.onStarted) {
                page.onStarted();
            }
        };
        ObjectEditor.prototype.onPageStarted = function (args) {
            this.trigger(ObjectEditor.Events.PAGE_STARTED, this, args);
        };
        /**
         * Switch to a page with specified name
         * @param {string} name a page name
         * @returns {JQueryPromise}
         */
        ObjectEditor.prototype.switchToPage = function (name) {
            var page = this.getPageByName(name);
            if (page) {
                return this.setCurrentPage(page, /*skipValidation=*/ false);
            }
            return lang.rejected();
        };
        ObjectEditor.prototype.queryUnload = function (options) {
            if (this.error) {
                return;
            }
            var reason = _super.prototype.queryUnload.call(this, options);
            if (reason) {
                return reason;
            }
            var reasons = this.pages.all()
                .map(function (page) {
                if (typeof page.queryUnload === "function") {
                    return page.queryUnload(options);
                }
            })
                .filter(function (reason) { return !!reason; });
            if (reasons.length > 0) {
                return reasons[0];
            }
            return this.onQueryUnload(options);
        };
        ObjectEditor.prototype.onQueryUnload = function (options) {
            var that = this, args = { editor: that, preventingReason: undefined };
            that.trigger(ObjectEditor.Events.QUERY_UNLOAD, that, args);
            if (args.preventingReason) {
                return args.preventingReason;
            }
            if (that.viewModel && that.viewModel.uow && !that.saving()) {
                return that._checkForChangesLost(options);
            }
        };
        ObjectEditor.prototype._checkForChangesLost = function (options) {
            var that = this;
            if (that._isIsolated) {
                var changes = that.viewModel.uow.getChanges();
                if (that._hasMeaningfulChanges(changes)) {
                    return that.onQueryUnloadWithChanges(options);
                }
            }
            else if (that._uowStateName && that.viewModel.uow.hasChangesSince(that._uowStateName)) {
                // nested editor
                return that.onQueryUnloadWithChanges(options);
            }
        };
        ObjectEditor.prototype._hasMeaningfulChanges = function (changes) {
            if (!changes || changes.length === 0) {
                return false;
            }
            // objects with something more that just 'id' and '__metadata' (we expect they always exist):
            return lang.some(changes, function (obj) { return Object.keys(obj).length > 2; });
        };
        ObjectEditor.prototype.onQueryUnloadWithChanges = function (options) {
            var dialog = new ConfirmDialog({
                header: this.title,
                text: resources["objectEditor.query_unload_prompt"]
            });
            return dialog.open().then(function (result) {
                if (result === "no") {
                    return resources["closing_canceled"];
                }
            });
        };
        ObjectEditor.prototype.unload = function (options) {
            var that = this;
            if (!that.domElement) {
                return;
            } // already unloaded
            if (that.error) {
                _super.prototype.unload.call(this, options);
                return;
            }
            var oldPage = that.currentPage();
            if (oldPage) {
                that._pageUnloading(oldPage);
                that._unbindPropEditorViolationChanged(oldPage);
                that.pages.forEach(function (page) {
                    if (lang.isFunction(page.unload)) {
                        page.unload(options);
                    }
                });
                that._pageUnloaded(oldPage);
            }
            // NOTE: All pages must be unloaded first. Otherwise base method will clear DOM, but some PE use their DOM
            // element when unloading (e.g. peSlickObjectListPresenter detaches DOM element on unload and reinsert it
            // on render).
            _super.prototype.unload.call(this, options);
            that.onUnloaded(options);
        };
        ObjectEditor.prototype.onUnloaded = function (options) {
            this.trigger(ObjectEditor.Events.UNLOADED, this, options);
        };
        ObjectEditor.prototype._disposeInner = function () {
            this.dispose({ reason: "close" });
        };
        ObjectEditor.prototype._disposeUow = function (uow) {
            if (!uow) {
                return;
            }
            var that = this;
            // отвязываем uow от редактора (чужую)
            uow.unbind("detach", null, that);
            // убиваем свою uow в любом случае
            if (that._ownUow) {
                // если своя uow и чужая - разные, отвязываем её от редактора
                if (uow !== that._ownUow) {
                    that._ownUow.unbind("detach", null, that);
                }
                that._ownUow.dispose();
                that._ownUow = undefined;
            }
        };
        ObjectEditor.prototype.dispose = function (options) {
            var that = this;
            if (that.saving()) {
                that.traceSource.error("Disposing editor while saving");
            }
            if (that.isDisposed) {
                return;
            }
            options = options || {};
            that.onDisposed(options);
            // NOTE: base `dispose` calls `unload` which unloads all pages,
            // so we can't relate on base dispose at the end (as page.unload would be called for disposed objects),
            // and we can't call base dispose here as it clears viewModel (
            if (that.domElement) {
                that.unload({ reason: "dispose" });
            }
            // NOTE: base `dispose` calls presenter's dispose (see Component.dispose),
            // but presenter ObjectWizardStackedPresenter uses viewModel/pages to unsubscribe, so we should dispose it first
            that.disposePresenter();
            if (that.pages) {
                that.pages.forEach(function (page) {
                    if (lang.isFunction(page.dispose)) {
                        page.dispose(options);
                    }
                });
                that.pages.dispose();
                that.pages = undefined;
            }
            that.violations.unbind("change", null, that);
            that.violations.dispose();
            if (that._errorView) {
                that._errorView.dispose();
            }
            that._disposeParts();
            that.contextParts.dispose();
            // NOTE: rollback should be done after disposing pages and other. Otherwise UI may be updated during rollback.
            that.onRollbackState();
            if (that.viewModel) {
                that._disposeUow(that.viewModel.uow || that._ownUow);
            }
            _super.prototype.dispose.call(this, options);
        };
        ObjectEditor.prototype.onDisposed = function (options) {
            var that = this;
            if (that.error) {
                return;
            }
            that.trigger(ObjectEditor.Events.DISPOSED, that, options);
        };
        ObjectEditor.prototype.getTextPresentation = function () {
            return this.title + "\n" + this.viewModel.toString();
            /*that.pages.all().forEach(function (page) {
                if (page.getTextPresentation) {
                    text += page.getTextPresentation();
                }
                text += "\n";
            });*/
        };
        ObjectEditor.defaultOptions = {
            title: undefined,
            subtitle: undefined,
            /**
             * @type {Array}
             */
            pages: undefined,
            /**
             * Class of presenter
             * @type {Function}
             */
            Presenter: undefined,
            cssRootClass: "x-editor-base x-editor",
            /**
             * Array of validation rules
             * @type {Array}
             */
            rules: undefined,
            editorContext: { nested: false },
            navigationService: undefined,
            /**
             * Type name of viewModel (EntityType)
             * @type {String}
             */
            type: undefined,
            /**
             * Object identifier
             * @type {String}
             */
            id: undefined,
            viewModel: undefined,
            menu: undefined,
            commands: undefined,
            pageValidation: "none",
            skipSaveState: false,
            blockingSave: false,
            traceSourceName: undefined,
            onSetViewModel: undefined,
            onCreatePage: undefined,
            onCreatePropEditor: undefined,
            onPageUnloading: undefined,
            onPageUnloaded: undefined,
            onPageStarting: undefined,
            onPageStarted: undefined,
            onValidating: undefined,
            onValidated: undefined,
            onAccepting: undefined,
            onFinishing: undefined,
            onFinished: undefined,
            onSaving: undefined,
            onSaved: undefined,
            onQueryUnload: undefined,
            onUnloaded: undefined,
            navigateSiblings: undefined,
            contextName: undefined,
            /**
             * Prevent auto load unloaded objects in observable expressions.
             * It's option for presenter's View. Can be passed via `presenterOptions` as well.
             */
            suppressAutoLoad: undefined,
            navigateOptions: {
                dialogOptions: {
                    menu: false,
                    wide: true
                }
            },
            userSettings: {
                props: {
                    "contextParts": true
                    // contextParts: {
                    // 	isPinned: true
                    // }
                }
            },
            commandsDebounce: 250,
            commandsOptions: {} // required for PartCommandMixin
        };
        ObjectEditor.hostDefaultOptions = {};
        ObjectEditor.defaultMenus = {
            Editor: {
                items: [
                    {
                        name: "SaveAndClose",
                        title: resources["ok"],
                        icon: "ok",
                        hotKey: "ctrl+enter",
                        hint: resources["objectEditor.command_hint.saveAndClone"]
                    },
                    {
                        name: "CancelAndClose",
                        title: resources["cancel"],
                        icon: "cancel",
                        hint: resources["objectEditor.command_hint.cancelAndClose"]
                    }
                ]
            },
            RootEditor: {
                items: [
                    {
                        name: "SaveAndClose",
                        title: resources["save_close"],
                        icon: "save",
                        hotKey: "ctrl+enter",
                        hint: resources["objectEditor.command_hint.saveAndClone"],
                        items: [
                            {
                                name: "Apply",
                                title: resources["apply"],
                                icon: "ok",
                                hotKey: "ctrl+shift+s",
                                hint: resources["objectEditor.command_hint.apply"]
                            }
                        ]
                    }, {
                        name: "CancelAndClose",
                        title: resources["cancel"],
                        icon: "cancel",
                        hint: resources["objectEditor.command_hint.cancelAndClose"]
                    }
                ]
            }
        };
        __decorate([
            lang.decorators.constant(ObjectEditor.defaultMenus)
        ], ObjectEditor.prototype, "defaultMenus");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectEditor.prototype, "currentPage");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ObjectEditor.prototype, "saving");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ObjectEditor.prototype, "isBusy");
        __decorate([
            lang.decorators.constant("editor")
        ], ObjectEditor.prototype, "contextName");
        return ObjectEditor;
    }(Component));
    // mix methods from PartCommandMixin
    PartCommandMixin.mixinTo(ObjectEditor);
    ObjectEditor.mixin(ContextPartMixin_1.ContextPartComponentMixin);
    (function (ObjectEditor) {
        // NOTE: Тип модели может быть произвольный, не обязательно DomainObject. По идее тип нужно описать вот так:
        // export type Model = DomainObject | {};
        // Но в этом случае TS ругается на проверки вида:
        // if (viewModel.meta) { ... }
        // Возможно, в TS2.0 ситуация изменится.
        ObjectEditor.Events = {
            INITIALIZING: "initializing",
            INITIALIZED: "initialized",
            PAGE_CREATED: "pageCreated",
            PAGE_STARTING: "pageStarting",
            PAGE_STARTED: "pageStarted",
            PAGE_UNLOADING: "pageUnloading",
            PAGE_UNLOADED: "pageUnloaded",
            PAGE_SWITCHING: "pageSwitching",
            VALIDATING: "validating",
            VALIDATED: "validated",
            ACCEPTING: "accepting",
            FINISHING: "finishing",
            FINISHED: "finished",
            SAVING: "saving",
            SAVED: "saved",
            SAVE_ERROR: "saveError",
            QUERY_UNLOAD: "queryUnloaded",
            UNLOADED: "unloaded",
            DISPOSED: "disposed"
        };
    })(ObjectEditor || (ObjectEditor = {}));
    // backward compatibility:
    ObjectEditor.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: ObjectEditor.defaultOptions,
        /** @obsolete use static hostDefaultOptions */
        contextDefaultOptions: ObjectEditor.hostDefaultOptions,
        /** @obsolete use static Events */
        events: ObjectEditor.Events
    });
    core.ui.ObjectEditor = ObjectEditor;
    return ObjectEditor;
});
//# sourceMappingURL=ObjectEditor.js.map