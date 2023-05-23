/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/pe/PropertyEditor", "lib/ui/pe/peLoadableMixin", "lib/formatters", "i18n!lib/nls/resources", "lib/utils", "lib/utils/ObservableCollectionView", "lib/ui/menu/Menu"], function (require, exports, core, PropertyEditor, peLoadableMixin, formatters, resources, utils, ObservableCollectionView, Menu) {
    "use strict";
    var lang = core.lang;
    var State = peLoadableMixin.State;
    var PropertyEditorLookup = /** @class */ (function (_super) {
        __extends(PropertyEditorLookup, _super);
        /**
         * @constructs peDropDownLookup
         * @extends PropertyEditor
         * @param options
         */
        function PropertyEditorLookup(options) {
            var _this = this;
            options = PropertyEditorLookup.mixOptions(options, PropertyEditorLookup.defaultOptions);
            if (options.mode === PropertyEditorLookup.Modes.live && !options.lookupParam) {
                throw new Error("PropertyEditorLookup.ctor: options.lookupParam was not specified for live search mode.");
            }
            if (options.mode === PropertyEditorLookup.Modes.live) {
                options.isLookup = true;
            }
            if (options.showEmptyItem === undefined) {
                options.showEmptyItem = options.nullable;
            }
            if (options.emptyValueTextFromDropDown) {
                options.emptyValueText = options.dropDownEmptyItemText;
            }
            _this = _super.call(this, options) || this;
            var that = _this;
            that.app = core.Application.current;
            that.dataProvider = that.createDataProvider();
            that.visualStyle = that.options.visualStyle || PropertyEditorLookup.VisualStyle.lookup;
            that.items = new lang.ObservableCollection();
            that.viewItems = new ObservableCollectionView();
            if (that.options.orderBy) {
                that.viewItems.orderBy(that.options.orderBy);
            }
            that.viewItems.bind("change", function () {
                that._renderViewItems();
            });
            that._isOpen = false;
            that.isDataLoaded = false;
            that._isLookupStarted = false;
            that.state(peLoadableMixin.State.initial);
            //that.commands = that.createCommands();
            that.commands = lang.extend(that.createCommands(), that.options.commands);
            that.menu = that._createMenu();
            if (that.menu) {
                that.menu.bindToPart(that);
            }
            that.bind("change", function (sender, e) {
                if (e.prop === "filter") {
                    that._filterChanged(e);
                }
            });
            if (that.options.filter) {
                that.filter(that.options.filter);
            }
            utils.subscribeOnEvents(that, that.options, that.events);
            if (that.visualStyle === PropertyEditorLookup.VisualStyle.dropdown) {
                that.bind(that.events.OPENED, function () {
                    this._btnContainer.find(".x-icon-angle-bracket-bottom")
                        .removeClass("x-icon-angle-bracket-bottom")
                        .addClass("x-icon-angle-bracket-top");
                });
                that.bind(that.events.CLOSED, function () {
                    this._btnContainer.find(".x-icon-angle-bracket-top")
                        .removeClass("x-icon-angle-bracket-top")
                        .addClass("x-icon-angle-bracket-bottom");
                });
            }
            return _this;
        }
        PropertyEditorLookup.prototype.renderMenu = function ($rootElement) {
            var that = this;
            if (!that.menu.isEmpty()) {
                that._btnContainer = $("<div class='input-group-btn'></div>").appendTo($rootElement);
                that.menuPresenter = core.ui.MenuButtonsPresenter.create({
                    inline: true,
                    ungrouped: true,
                    reverse: true,
                    itemPresentation: "icon"
                });
                that.menuPresenter.setViewModel(that.menu);
                that.menuPresenter.render(that._btnContainer);
            }
        };
        PropertyEditorLookup.prototype.render = function (domElement) {
            var that = this;
            if (that.visualStyle === PropertyEditorLookup.VisualStyle.dropdown) {
                $(domElement).addClass("x-property-editor-lookup");
            }
            _super.prototype.render.call(this, domElement);
            that.databind(that.createBindableElement());
            if (that.options.mode === that.modes.preload) {
                that.reload();
            }
        };
        PropertyEditorLookup.prototype.createDataProvider = function () {
            var options = this.options, dataProvider = options.dataProvider;
            if (dataProvider) {
                return lang.unlazy(dataProvider, this);
            }
            var DataProvider = options.DataProvider;
            if (DataProvider) {
                return new DataProvider(this);
            }
            return undefined;
        };
        /**
         * Create commands
         * @protected
         * @returns {{Toggle: BoundCommand, Reload: (BoundCommand|undefined), Unlink: BoundCommand}}
         */
        PropertyEditorLookup.prototype.createCommands = function () {
            var that = this, options = that.options, cmdToggleDrop = new core.commands.BoundCommand(that.doToggleDrop, that.canToggleDrop, that), cmdReload, cmdClear;
            if (options.canReload) {
                cmdReload = new core.commands.BoundCommand(that._doReload, that.canReload, that);
            }
            if (options.canClear) {
                cmdClear = new core.commands.BoundCommand(that._doClear, that.canClear, that);
            }
            return {
                Toggle: cmdToggleDrop,
                Reload: cmdReload,
                Unlink: cmdClear
            };
        };
        PropertyEditorLookup.prototype._createMenuDefaults = function () {
            return Menu.defaultsFor(this.visualStyle === PropertyEditorLookup.VisualStyle.lookup ?
                PropertyEditorLookup.defaultMenuOldStyle : PropertyEditorLookup.defaultMenu, "peObject");
        };
        PropertyEditorLookup.prototype._createMenu = function () {
            return new Menu(this._createMenuDefaults(), this.options.menu);
        };
        PropertyEditorLookup.prototype._onRestrictionsChanged = function (restrictions) {
            this.isDataLoaded = false;
            this.onRestrictionsChanged(restrictions);
        };
        PropertyEditorLookup.prototype.onRestrictionsChanged = function (restrictions) {
            this.trigger(this.events.RESTRICTIONS_CHANGED, this, restrictions);
        };
        PropertyEditorLookup.prototype._filterChanged = function (e) {
            var that = this, oldValue = e.oldValue, newValue = e.value;
            if (lang.Observable.isObservable(oldValue)) {
                oldValue.unbind("change", null, that);
            }
            that._onRestrictionsChanged(newValue);
            if (lang.Observable.isObservable(newValue)) {
                newValue.bind("change", that._onRestrictionsChanged, that);
            }
        };
        PropertyEditorLookup.prototype.unload = function (options) {
            var that = this;
            that._close();
            that.viewItems.clear();
            if (that.menuPresenter) {
                that.menuPresenter.unload();
            }
            _super.prototype.unload.call(this, options);
        };
        PropertyEditorLookup.prototype.dispose = function (options) {
            var that = this;
            that.unbind();
            that.items.dispose();
            that.viewItems.dispose();
            var filter = that.filter();
            if (lang.Observable.isObservable(filter)) {
                filter.unbind("change", null, that);
            }
            var dataProvider = that.dataProvider;
            if (lang.isDisposable(dataProvider)) {
                dataProvider.dispose();
            }
            _super.prototype.dispose.call(this, options);
            that.state(peLoadableMixin.State.disposed);
        };
        // TODO: maybe protected createBindableProp(): IBindable
        PropertyEditorLookup.prototype._getLoadParams = function (params) {
            var that = this, options = that.options, filter = lang.unlazy(that.filter(), that.viewModel), filterParams;
            if (filter) {
                filterParams = filter.toJson ? filter.toJson() : filter;
            }
            params = lang.extend(filterParams || {}, params);
            if (options.mode === that.modes.live && !params[options.lookupParam]) {
                params[options.lookupParam] = "";
                // delete params[options.lookupParam];
            }
            return params;
        };
        PropertyEditorLookup.prototype.reload = function (params) {
            var that = this, args = {};
            return lang.async.chain().then(function () {
                args.query = { params: that._getLoadParams(params) };
                args.options = {};
                that._onDataLoading(args);
                return that.dataProvider.loadItems(args.query, args.options);
            }).then(function (items) {
                if (that.state() === State.disposed) {
                    return;
                }
                args.items = items;
                that._onDataLoaded(args);
                that.onLoaded();
                //return items;
            }).then(function () { return lang.resolved(); }, function (error) {
                if (core.eth.isCanceled(error)) {
                    // load was cancel - it's ok and not an error
                    return lang.resolved();
                }
                that._onFailed(error);
                return error;
            }).value();
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype.onDataLoading = function (args) {
            this.trigger(this.events.DATA_LOADING, this, args);
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype.onDataLoaded = function (args) {
            this.trigger(this.events.DATA_LOADED, this, args);
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype.onLoaded = function () {
            this.trigger(this.events.LOADED, this);
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype._setItems = function (items) {
            this.items.reset(items);
            this.viewItems.reset(items);
        };
        PropertyEditorLookup.prototype._getDropdownValuePresentation = function (item) {
            return this.dataProvider.getItemPresentation(item);
        };
        PropertyEditorLookup.prototype._searchForSuggestions = function (term) {
            var that = this, options = that.options;
            if (options.mode === that.modes.live) {
                var params = (_a = {},
                    _a[options.lookupParam] = term || "",
                    _a);
                return that.reload(params).then(function () { return that.items.all(); });
            }
            if (that.isDataLoaded) {
                return lang.resolved(that._filterItems(that.items, term));
            }
            return that.reload().then(function () { return that._filterItems(that.items, term); });
            var _a;
        };
        PropertyEditorLookup.prototype._lookupMatcherDefault = function (item, term, matchMode) {
            var that = this, text = that._getDropdownValuePresentation(item).toString().toLowerCase();
            if (matchMode === that.matchModes.equals) {
                return text === term.toLowerCase();
            }
            if (matchMode === that.matchModes.startsWith) {
                return text.indexOf(term.toLowerCase()) === 0;
            }
            // if (matchMode === that.matchModes.contains):
            return text.indexOf(term.toLowerCase()) !== -1;
        };
        PropertyEditorLookup.prototype._filterItems = function (items, term, matchMode) {
            var that = this, matcher = that.options.lookupMatcher || that._lookupMatcherDefault.bind(that);
            term = term || "";
            matchMode = matchMode || that.options.matchMode;
            return items.all().filter(function (item) {
                return matcher(item, term, matchMode);
            });
        };
        PropertyEditorLookup.prototype._isAllowInteraction = function () {
            var that = this;
            return that.state() !== State.loading && !that.disabled();
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype._renderBeginLoading = function () {
            // block input in lookup field (if exist)
            var that = this;
            that.element.addClass("loading");
            // TODO: loading
        };
        /**
         * @override
         * @protected
         */
        PropertyEditorLookup.prototype._renderEndLoading = function () {
            var that = this;
            that.element.removeClass("loading");
            // TODO: loading
        };
        PropertyEditorLookup.prototype.doToggleDrop = function () {
            this.toggle();
        };
        PropertyEditorLookup.prototype.canToggleDrop = function () {
            return this._isAllowInteraction();
        };
        PropertyEditorLookup.prototype._doReload = function () {
            var that = this;
            that.reload();
            if (that.menuPresenter) {
                that.menuPresenter.focusItem("Reload");
            }
        };
        PropertyEditorLookup.prototype.canReload = function () {
            return this._isAllowInteraction();
        };
        PropertyEditorLookup.prototype._doClear = function () {
            var that = this;
            that.value(null);
            if (that.menuPresenter) {
                that.menuPresenter.focusItem("Toggle");
            }
        };
        PropertyEditorLookup.prototype.canClear = function () {
            return this._isAllowInteraction() && !!this.value();
        };
        PropertyEditorLookup.prototype.toggle = function () {
            var that = this;
            that._isLookupStarted = false;
            that._toggle();
        };
        PropertyEditorLookup.prototype._toggle = function () {
            var that = this;
            if (that._isOpen) {
                that._close();
            }
            else {
                that._open();
            }
        };
        /**
         * @enum {String}
         */
        PropertyEditorLookup.Modes = {
            /**
             * "live" - load is initiated every time a value changed in lookup field.
             * The mode is only supported when an external DataSource is used
             */
            "live": "live",
            /**
             * "preload" - load is initiated on initialization
             */
            "preload": "preload",
            /**
             * "demand" - load is initiated by demand. It's default mode.
             */
            "demand": "demand"
        };
        /**
         * @enum {String}
         */
        PropertyEditorLookup.MatchModes = {
            "equals": "equals",
            "startsWith": "startsWith",
            "contains": "contains"
        };
        PropertyEditorLookup.VisualStyle = {
            "lookup": "lookup",
            "dropdown": "dropdown"
        };
        /**
         * @enum {String}
         */
        PropertyEditorLookup.Events = {
            OPENED: "opened",
            CLOSED: "closed",
            /* data loading */
            DATA_LOADING: "dataLoading",
            /* data loaded */
            DATA_LOADED: "dataLoaded",
            /* data loaded and set */
            LOADED: "Loaded",
            /* restrictions changed */
            RESTRICTIONS_CHANGED: "restrictionsChanged"
        };
        PropertyEditorLookup.defaultOptions = {
            filter: undefined,
            /**
             * @type Array|String
             */
            orderBy: undefined,
            /**
             * demand, preload, demand (default)
             * @type peDropDownLookup.prototype.modes
             */
            mode: "demand",
            matchMode: "contains",
            canReload: true,
            canClear: true,
            isLookup: true,
            lookupMinChars: 2,
            lookupDelay: 250,
            dropDownEmptyItemText: "<i class='text-muted'>&lt; " + resources["value_not_set"] + " &gt;</i>",
            emptyValueTextFromDropDown: false,
            emptyValueText: "<i class='text-muted'>" + resources["value_not_specified"] + "</i>",
            loadingText: "<i class='text-muted'>" + resources["loading"] + "</i>",
            /**
             * filter restrictions changed event handler
             * @type {Function}
             */
            onRestrictionsChanged: undefined,
            /**
             * data loading event handler
             * @type {Function}
             */
            onDataLoading: undefined,
            /**
             * data loaded event handler
             * @type {Function}
             */
            onDataLoaded: undefined,
            selectOnTab: true,
            visualStyle: "lookup"
        };
        PropertyEditorLookup.defaultMenuOldStyle = {
            items: [
                { name: "Toggle", title: resources.select, icon: "search" },
                { name: "Reload", title: resources.reload, icon: "refresh" }
                //{ name: "Unlink", title: resources["navigationPE.unlink.scalar"], icon: "clear" }
            ]
        };
        PropertyEditorLookup.defaultMenu = {
            items: [
                { name: "Toggle", title: resources.select, icon: "angle-bracket-bottom" }
            ]
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], PropertyEditorLookup.prototype, "filter");
        return PropertyEditorLookup;
    }(PropertyEditor));
    PropertyEditorLookup.mixin(peLoadableMixin);
    // backward compatibility: access to static fields via prototype\
    PropertyEditorLookup.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: PropertyEditorLookup.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: PropertyEditorLookup.defaultMenu,
        /** @obsolete use static State */
        states: peLoadableMixin.State,
        /** @obsolete use static Modes */
        modes: PropertyEditorLookup.Modes,
        /** @obsolete use static MatchModes */
        matchModes: PropertyEditorLookup.MatchModes,
        /** @obsolete use static Events */
        events: PropertyEditorLookup.Events
    });
    (function (PropertyEditorLookup) {
        var DataProviderBase = /** @class */ (function () {
            function DataProviderBase(pe) {
                this.pe = pe;
                this.dataSource = pe.options.dataSource;
            }
            DataProviderBase.prototype.loadItems = function (query, options) {
                var that = this;
                return lang.async.chain().then(function () {
                    var dataSource = that.dataSource;
                    if (!dataSource) {
                        throw new Error("peDropDownLookup.DataProviderBase: dataSource must be specified");
                    }
                    // cancel previous operation
                    if (that._reloadOpId && dataSource.cancel) {
                        try {
                            dataSource.cancel(that._reloadOpId);
                        }
                        catch (ex) {
                        }
                    }
                    that._reloadOpId = utils.generateGuid();
                    options = options || {};
                    options.opId = that._reloadOpId;
                    return dataSource.load(query, options);
                }).always(function () {
                    that._reloadOpId = null;
                }).then(function (response) {
                    return that.getItems(response);
                }).value();
            };
            return DataProviderBase;
        }());
        PropertyEditorLookup.DataProviderBase = DataProviderBase;
        var PlainDataProvider = /** @class */ (function (_super) {
            __extends(PlainDataProvider, _super);
            function PlainDataProvider(pe) {
                return _super.call(this, pe) || this;
            }
            PlainDataProvider.prototype.getItems = function (response) {
                return response.result;
            };
            PlainDataProvider.prototype.getValue = function (item) {
                return item;
            };
            PlainDataProvider.prototype.getValuePresentation = function (value) {
                return this.getItemPresentation(value);
            };
            PlainDataProvider.prototype.getItemPresentation = function (item) {
                return item != null ? item.toString() : "";
            };
            return PlainDataProvider;
        }(DataProviderBase));
        PropertyEditorLookup.PlainDataProvider = PlainDataProvider;
        var JsonDataProvider = /** @class */ (function (_super) {
            __extends(JsonDataProvider, _super);
            function JsonDataProvider(pe) {
                var _this = _super.call(this, pe) || this;
                var options = _this.AdapterOptions(), jsonAdapter = options.jsonAdapter;
                if (jsonAdapter) {
                    if (!lang.isFunction(jsonAdapter.getPresentation) || !lang.isFunction(jsonAdapter.getId)) {
                        throw new Error("jsonAdapter should have 'getPresentation' and 'getId' methods");
                    }
                    _this.jsonAdapter = jsonAdapter;
                }
                else {
                    if (!options.displayField || !options.idField) {
                        throw new Error("plain (json) DataSource was specified but none of required options: jsonAdapter or displayField/idField");
                    }
                    _this.jsonAdapter = {
                        getPresentation: function (value) {
                            return value ? value[options.displayField] : "";
                        },
                        getId: function (value) {
                            return value ? value[options.idField] : null;
                        }
                    };
                }
                return _this;
            }
            JsonDataProvider.prototype.AdapterOptions = function () {
                return this.pe.options;
            };
            JsonDataProvider.prototype.getItems = function (response) {
                return response.result;
            };
            JsonDataProvider.prototype.getValue = function (item) {
                var id = this.jsonAdapter.getId(item), refType = this.AdapterOptions().ref;
                this._ensureUow();
                return this.uow.get(refType || this.AdapterOptions().entityType, id);
            };
            JsonDataProvider.prototype.getValuePresentation = function (value) {
                var that = this;
                if (value === null) {
                    return "";
                }
                if (!that.pe.isDataLoaded) {
                    return formatters.formatPropHtml(that.pe.options, value);
                }
                // NOTE: we need to format the value in the same way as it's in dropDown list
                var item = lang.find(that.pe.items.all(), function (item) { return that.jsonAdapter.getId(item) === value.id; });
                if (!item) {
                    return formatters.formatPropHtml(that.pe.options, value);
                }
                return that.getItemPresentation(item).toString();
            };
            JsonDataProvider.prototype.getItemPresentation = function (item) {
                return this.jsonAdapter.getPresentation(item);
            };
            JsonDataProvider.prototype._ensureUow = function () {
                if (!this.uow) {
                    this.uow = this.AdapterOptions().uow || (this.pe.viewModel && this.pe.viewModel.uow);
                    if (!this.uow) {
                        this.uow = this.pe.app.createUnitOfWork({ connected: true });
                        this._ownUow = true;
                    }
                }
            };
            JsonDataProvider.prototype.dispose = function () {
                if (this.uow && this._ownUow) {
                    this.uow.dispose();
                }
            };
            return JsonDataProvider;
        }(DataProviderBase));
        PropertyEditorLookup.JsonDataProvider = JsonDataProvider;
        var DomainDataProvider = /** @class */ (function (_super) {
            __extends(DomainDataProvider, _super);
            function DomainDataProvider(pe) {
                var _this = _super.call(this, pe) || this;
                _this.uow = _this.pe.options.uow;
                if (!_this.uow) {
                    _this.uow = _this.pe.app.createUnitOfWork({ connected: true });
                    _this._ownUow = true;
                }
                return _this;
            }
            DomainDataProvider.prototype.getItems = function (response) {
                return this.uow.fromServerResponse(response);
            };
            DomainDataProvider.prototype.getValue = function (item) {
                return item;
            };
            DomainDataProvider.prototype.getValuePresentation = function (value) {
                return formatters.formatPropValue(this.pe.options, value).toString();
            };
            DomainDataProvider.prototype.getItemPresentation = function (item) {
                // NOTE: результат getItemPresentation, если он строка, вставляется как $.text(),
                // поэтому необходимости в дополнительном html-энкодинге нет .
                // Поэтому здесь мы не используем formatPropHtml (он всегда возвращает html как строку).
                // А если результат SafeHtml, то он вставляется как $.html.
                var options = this.pe.options;
                var formatterHtml = options.formatterHtml;
                if (lang.isFunction(formatterHtml)) {
                    // явно заданный html-форматтер для свойства
                    return formatters.safeHtml(formatterHtml(item));
                }
                var val = formatters.formatPropValue(options, item);
                if (!val) {
                    return "";
                }
                if (formatters.isHtml(val)) {
                    return val;
                }
                return val.toString();
                // return formatters.formatPropHtml(this.pe.options, item);
            };
            DomainDataProvider.prototype.dispose = function () {
                if (this.uow && this._ownUow) {
                    this.uow.dispose();
                }
            };
            return DomainDataProvider;
        }(DataProviderBase));
        PropertyEditorLookup.DomainDataProvider = DomainDataProvider;
    })(PropertyEditorLookup || (PropertyEditorLookup = {}));
    return PropertyEditorLookup;
});
//# sourceMappingURL=PropertyEditorLookup.js.map