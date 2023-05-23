/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "lib/ui/Component", "lib/ui/list/ListCommonMixin", "lib/ui/PartCommandMixin", "lib/ui/PartWithFilterMixin", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "lib/ui/list/.list.types", "lib/ui/ConfirmDialog"], function (require, exports, core, utils, Component, ListCommonMixin_1, PartCommandMixin, PartWithFilterMixin, Menu, resources, _list_types_1, ConfirmDialog) {
    "use strict";
    var lang = core.lang;
    var List = /** @class */ (function (_super) {
        __extends(List, _super);
        /**
         * @constructs List
         * @extends Component
         * @param app
         * @param options {Object}
         * @param options.columns {Array} Array of column descriptors
         * @param options.columns.name {String}
         * @param options.columns.prop {String}
         * @param options.columns.title {String}
         * @param options.columns.formatter {Function} [optional]
         */
        function List(app, options) {
            var _this = this;
            if (!app) {
                throw new Error("ArgumentException: app can't be null");
            }
            options = List.mixOptions(options, List.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.app = app;
            //that.state(that.states.initial);
            that.traceSource = new core.diagnostics.TraceSource("ui.List", that.options.traceSourceName || that.name);
            that.userSettings = core.UserSettings.create(that.options.userSettings);
            that.title = that.options.title;
            that._preinitialize();
            that._initializeColumns();
            that._initializeMenus();
            that.initPresenter();
            that.subscribeOnNavigation();
            utils.subscribeOnEvents(that, that.options, that.events);
            if (that.loader) {
                that.setInitial();
            }
            else {
                that.setData([]);
            }
            return _this;
        }
        List.prototype.tweakOptions = function (options) {
            // init properties from selectionMode
            if (options.selectionMode === "single") {
                options.hasCheckboxes = false;
                options.menuSelection = { items: [] };
                options.presenterOptions = options.presenterOptions || {};
                options.presenterOptions.selectionModel = "none";
                options.presenterOptions.gridOptions = options.presenterOptions.gridOptions || {};
                options.presenterOptions.gridOptions.multiSelect = false;
            }
            else if (options.selectionMode === "multiple") {
                options.hasCheckboxes = true;
            }
            lang.appendEx(options, {
                presenterOptions: {
                    hasCheckboxes: options.hasCheckboxes,
                    hasRowNum: options.hasRowNum
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        List.prototype._preinitialize = function () {
            var that = this;
            that._initializeProps();
            that.loader = that.createLoader();
            that.cancellable = that.options.cancellable && that.loader && !!that.loader.cancel;
            that.initFilter(that.options, that.userSettings);
        };
        List.prototype._initializeMenus = function () {
            var that = this;
            var commands = that.createCommands();
            that.commands = core.commands.unlazyCommands(commands, that);
            that.menuList = that.createListMenu();
            that._initMenu(that.menuList);
            that.menuListAux = that.createListMenuAux();
            that._initMenu(that.menuListAux);
            that.menuRow = that.createRowMenu();
            that._initMenu(that.menuRow);
            // NOTE: menuSelection will exist even without checkboxes as selection is still possible via shift-arrows/mouse
            // (it differentiates from Tree)
            that.menuSelection = that.createSelectionMenu();
            that._initMenu(that.menuSelection);
            if ((!that.menuSelection || that.menuSelection.isEmpty()) && (!that.menuRow || that.menuRow.isEmpty())) {
                that.options.presenterOptions.affixMenu = false;
            }
        };
        List.prototype._initMenu = function (menu) {
            if (menu) {
                menu.bindToPart(this, { list: this });
            }
        };
        List.prototype.createCommands = function () {
            var that = this, commands = {
                SelectAll: new core.commands.BoundCommand(that.doSelectAll, that.canSelectAll, that),
                SelectNone: new core.commands.BoundCommand(that.doSelectNone, that.canSelectNone, that)
            };
            if (that.loader) {
                commands.Reload = new core.commands.BoundCommand(that.doReload, that.canReload, that);
                if (that.cancellable) {
                    commands.CancelReload = new core.commands.BoundCommand(that.cancelReload, that.canCancelReload, that);
                }
            }
            if (that.columns && that.columns.length) {
                commands.Customize = new core.commands.BoundCommand(that.doCustomize, that.canCustomize, that);
            }
            commands.IncreaseRowHeight = new core.commands.BoundCommand(that.doIncreaseRowHeight, that.canChangeRowHeight, that);
            commands.DecreaseRowHeight = new core.commands.BoundCommand(that.doDecreaseRowHeight, that.canChangeRowHeight, that);
            lang.extend(commands, that.options.commands);
            return commands;
        };
        List.prototype.createListMenuDefaults = function () {
            return this.defaultMenus.List;
        };
        List.prototype.createListMenuAuxDefaults = function () {
            return this.defaultMenus.ListAux;
        };
        List.prototype.createListMenu = function () {
            var that = this, menu = new Menu(that.createListMenuDefaults(), that.options.menuList
            //that.options.hideExportMenu && { remove: ["Export"] }
            );
            // объединяем с меню фильтра
            if (that.filter && that.filter.menu) {
                menu.mergeWith(that.filter.menu);
                that._fieldWithFilterMenu = "menuList";
            }
            if (that.cancellable) {
                var menuItem = menu.getItem("Reload");
                if (menuItem) {
                    lang.append(menuItem, { hideIfDisabled: true });
                }
                menuItem = menu.getItem("CancelReload");
                if (menuItem) {
                    lang.append(menuItem, { hideIfDisabled: true });
                }
            }
            return menu;
        };
        List.prototype.createListMenuAux = function () {
            return new Menu(this.createListMenuAuxDefaults(), this.options.menuListAux);
        };
        List.prototype.createRowMenuDefaults = function () {
            return this.defaultMenus.ListRow;
        };
        List.prototype.createRowMenu = function () {
            return new Menu(this.createRowMenuDefaults(), this.options.menuRow);
        };
        List.prototype.createSelectionMenuDefaults = function () {
            return this.defaultMenus.Selection;
        };
        List.prototype.createSelectionMenu = function () {
            return new Menu(this.createSelectionMenuDefaults(), this.options.menuSelection);
        };
        List.prototype._initializeColumn = function (col) {
            var column = lang.isString(col) ? { name: col } : col;
            if (!column.prop && column.name) {
                column.prop = column.name;
            }
            return column;
        };
        List.prototype._initializeColumns = function () {
            var that = this, columns;
            if (that.options.columns) {
                // колонки заданы в опциях списка
                columns = that.options.columns.map(function (column) { return that._initializeColumn(column); });
            }
            else {
                columns = [];
            }
            that.setupColumns(columns);
        };
        List.prototype.runValidation = function () {
            return this.runItemsValidation();
        };
        List.prototype.dispose = function (options) {
            var that = this;
            that.state(_list_types_1.ObjectListState.disposed);
            that.disposeFilter();
            that.items.dispose();
            that.selection.dispose();
            that.violations.dispose();
            _super.prototype.dispose.call(this, options);
        };
        List.prototype.showFilterError = function (error) {
            this.hintMessage(resources["objectList.getRestrictionsError"] + error);
        };
        List.prototype.createLoader = function () {
            var that = this, loader = lang.unlazy(that.options.loader, that);
            // NOTE: if loader equals to 'null' that means that the list should not have ability to load/reload (data will be set externally).
            if (loader !== undefined) {
                return loader;
            }
            // create default loader from dataSource
            var ds = that.options.dataSource;
            if (ds !== undefined) {
                return new that.options.Loader(that.app, {
                    dataSource: ds,
                    cancellable: that.options.cancellable,
                    onMaterialize: that.options.onDataMaterialize
                });
            }
        };
        List.prototype.isLoading = function () {
            var that = this, state = that.state();
            return state === _list_types_1.ObjectListState.reloading || state === _list_types_1.ObjectListState.loadingMore;
        };
        /**
         * The implementation of the command 'Reload'
         * @param args
         * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
         * @returns {Promise.<DomainObject[]>}
         */
        List.prototype.doReload = function (args) {
            // TOTHINK: можно добавить режим persistentSelection, при котором selection будет переживать релоад...
            this.selection.clear();
            return this.reload(args);
        };
        List.prototype.canReload = function () {
            return !this.isLoading();
        };
        List.prototype.cancelReload = function () {
            this.loader.cancel();
        };
        List.prototype.canCancelReload = function () {
            return this.state() === _list_types_1.ObjectListState.reloading;
        };
        /**
         * @param args
         * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
         * @returns {Promise.<DomainObject[]>}
         */
        List.prototype.reload = function (args) {
            args = args || {};
            var that = this, 
            // NOTE: if args.params is specified, we'll ignore current restrictions (used for paging/server sorting)
            params = lang.coalesce(args.params, that.getFilterRestrictions());
            // NOTE: null params mean there was an error during getting params
            if (params == null) {
                return;
            }
            // NOTE: Using async execution to catch any errors in one place (fail callback in the end).
            return lang.async.chain().then(function () {
                that.traceSource.time("reload");
                that.state(_list_types_1.ObjectListState.reloading);
                that.hintMessage(undefined);
                // extend params
                if (that.options.loadParams) {
                    params = lang.extend(params, lang.isFunction(that.options.loadParams) ? that.options.loadParams() : that.options.loadParams);
                }
                lang.extend(params, args && args.params);
                return that._load(params);
            }).then(function (ea) {
                return that.setData(ea.items, ea.hints);
            }).fail(function (error) {
                that._setError(error);
            }).always(function () {
                that.traceSource.timeEnd("reload");
            }).value();
        };
        /**
         * @param args
         * @param {Object} args.params Loader parameters
         * @returns {Promise.<DomainObject[]>}
         */
        List.prototype.loadMore = function (args) {
            // TOTHINK: теперь список хранит условия последней загрузки в _lastLoadParams,
            // в принципе их можно тут подставить бы (т.к. LoadMore должно быть с предыдущими условиями),
            // но сейчас они приходят из pager'a и выпилить их оттуда непросто/
            // Важно, что сам по себе метод loadMore не совсем корректный, т.к. подразумевает, что предыдущие условия будут передаваться снаружи.
            var that = this;
            if (!that.loader) {
                throw new Error("ObjectList doesn't have a loader associated with it");
            }
            // NOTE: Using async execution to catch any errors in one place (fail callback in the end).
            return lang.async.chain().then(function () {
                that.traceSource.time("loadMore");
                that.state(_list_types_1.ObjectListState.loadingMore);
                that.hintMessage(undefined);
                return that._load(args && args.params);
            }).then(function (ea) {
                return that.addData(ea.items, ea.hints);
            }).fail(function (error) {
                that._setError(error);
            }).always(function () {
                that.traceSource.timeEnd("loadMore");
            }).value();
        };
        /**
         * Load items with specified params via the loader
         * @param params
         * @returns {Promise.<DataLoadEventArgs>} Promise of DataLoadEventArgs
         * @protected
         */
        List.prototype._load = function (params) {
            var that = this, ea = {}, promiseConfirm, promise;
            ea.params = params;
            that.onDataLoading(ea);
            if (ea.confirmationMessage) {
                promiseConfirm = ConfirmDialog.create({
                    header: resources["objectList.reloadCaption"],
                    text: ea.confirmationMessage
                }).open().then(function (result) {
                    if (result !== "yes") {
                        return lang.rejected(core.eth.canceled());
                    }
                });
            }
            else {
                promiseConfirm = lang.resolved();
            }
            promise = lang.async.then(promiseConfirm, function () {
                that.traceSource.time("loader:load");
                return that.loader.load(that, ea.params);
            });
            return lang.async.then(promise, function (result) {
                that.traceSource.timeEnd("loader:load");
                if (that.state() === _list_types_1.ObjectListState.disposed) {
                    return;
                }
                ea.items = result.items;
                ea.hints = result.hints;
                that.onDataLoaded(ea);
                return ea;
            });
        };
        /**
         * Set list's data
         * @param {Array} items An array of items (domain objects)
         * @param {Object} [hints]
         * @param {String} [hints.message]
         * @param {String} [hints.source]
         * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
         */
        List.prototype.setData = function (items, hints) {
            var that = this;
            if (hints && hints.message) {
                that.hintMessage(hints.message);
            }
            that.traceSource.time("setItems");
            items = that._prepareData(items, hints);
            // NOTE: см. ListCommonMixin._initializeProps, там selection синхронизируется с items,
            //	т.е. все текущие значения items удаляются из selection.
            // 	(BTW: side-effect от этого - сброс выделения при перезагрузке; даже, если результат тот же)
            //	но раз это так, то для оптимизации очистим всё сразу
            if (!that.options.persistentSelection) {
                that.selection.clear();
            }
            that.items.reset(items);
            that.activeItem(null);
            that.traceSource.timeEnd("setItems");
            that.lastError = null;
            if (!items.length) {
                that.stateMessage(that.options.stateMessages.noData);
            }
            else {
                that.stateMessage("");
            }
            that.state(_list_types_1.ObjectListState.loaded);
            return items;
        };
        /**
         * Add items to list
         * @param {Array} items An array of items (domain objects)
         * @param {Object} [hints]
         * @param {String} [hints.message]
         * @param {String} [hints.source]
         * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
         */
        List.prototype.addData = function (items, hints) {
            var that = this;
            if (hints && hints.message) {
                that.hintMessage(hints.message);
            }
            if (!items || !items.length) {
                return;
            }
            that.traceSource.time("addItems");
            items = that._prepareData(items, hints);
            that.items.add(items);
            if (that.state() === _list_types_1.ObjectListState.initial) {
                that.stateMessage("");
            }
            that.state(_list_types_1.ObjectListState.loaded);
            that.traceSource.timeEnd("addItems");
            return items;
        };
        /**
         * Change list's state to initial: no items, no activeItem, initial state message
         */
        List.prototype.setInitial = function () {
            var that = this;
            that.items.reset([]);
            that.selection.clear();
            that.activeItem(null);
            that.stateMessage(that.options.stateMessages.initial);
            that.state(_list_types_1.ObjectListState.initial);
        };
        List.prototype._prepareData = function (items, hints) {
            var that = this, args = { items: items, hints: hints };
            that.onDataPreparing(args);
            return args.items || [];
        };
        List.prototype._setError = function (error) {
            var that = this;
            if (core.eth.isCanceled(error)) {
                that.state(that.items.count() > 0 ? _list_types_1.ObjectListState.loaded : _list_types_1.ObjectListState.initial);
                that.hintMessage(error.message);
            }
            else {
                that.lastError = error;
                that.state(_list_types_1.ObjectListState.failed);
                // TODO: show the error details (error.message)
                that.stateMessage(that.options.stateMessages.loadFailed);
                that.traceSource.error(error);
            }
        };
        /**
         * @protected
         * @virtual
         * @param args
         * @param {Array} args.items An array of loaded items (domain objects)
         * @param {Object} [args.hints]
         */
        List.prototype.onDataPreparing = function (args) {
            var that = this, items = args.items;
            // wrap new objects if needed
            if (that.createViewModel && items) {
                args.items = items.map(function (obj) { return that.createViewModel(obj); });
            }
            that.trigger(List.events.DATA_PREPARING, that, args);
        };
        /**
         * @protected
         * @virtual
         * @param {DataLoadEventArgs} args
         */
        List.prototype.onDataLoading = function (args) {
            this.trigger(this.events.DATA_LOADING, this, args);
        };
        /**
         * @protected
         * @virtual
         * @param {DataLoadEventArgs} args
         */
        List.prototype.onDataLoaded = function (args) {
            this.trigger(this.events.DATA_LOADED, this, args);
        };
        List.prototype.beforeRender = function (domElement) {
            var that = this;
            // auto-load data before first render
            // NOTE: don't do this in the constructor, the filter needs some time to restore its restrictions from the userSettings (see WC-1297)
            if (that.options.autoLoad && that.state() === _list_types_1.ObjectListState.initial) {
                that.reload();
            }
            _super.prototype.beforeRender.call(this, domElement);
        };
        List.prototype.activate = function () {
            var presenter = this.presenter;
            if (!presenter) {
                return;
            }
            if (presenter.focus) {
                presenter.focus();
            }
            if (presenter.scrollToSelf) {
                presenter.scrollToSelf();
            }
        };
        List.prototype.getChangedItems = function () {
            //return null;
            // TODO: `hasChanges` - это специфика DomainObject, но здесь элементы могут быть любого типа.
            // Надо куда-то вынести этот код.
            return this.get("items").all().filter(function (obj) {
                return lang.isFunction(obj.hasChanges) && obj.hasChanges();
            });
        };
        List.defaultOptions = {
            filterExpanded: false,
            filterCollapsable: true,
            expandFilterTitle: resources["objectFilter.show"],
            collapseFilterTitle: resources["objectFilter.hide"],
            hasCheckboxes: false,
            navigateOptions: {
                dialogOptions: {
                    menu: false
                }
            },
            commandsOptions: {},
            stateMessages: {
                initial: resources["objectList.state.not_loaded"],
                noData: resources["objectList.state.no_data"],
                loadFailed: resources["objectList.state.load_failed"]
            },
            userSettings: {
                props: {
                    "filterExpanded": true,
                    "filter": true,
                    "contextParts": true,
                    "rowHeight": true
                }
            }
        };
        // NOTE: see also ObjectList.defaultMenu
        List.defaultMenus = {
            // Row menu
            ListRow: { items: [] },
            // Selection menu
            Selection: { items: [
                    {
                        name: "Selection",
                        title: resources.selection,
                        html: "<span class='x-icon x-icon-select-all visible-xs'></span><span class='hidden-xs'>" + resources.selected + "</span>" +
                            " <span class='x-list-menu-selection-counter'></span>/<span class='x-list-menu-total-counter'></span>",
                        items: [
                            { name: "SelectAll", title: resources.selectAll },
                            { name: "SelectNone", title: resources.selectNone }
                        ]
                    }
                ] },
            // List Menu
            List: { items: [
                    {
                        name: "Reload",
                        title: resources.reload,
                        icon: "refresh",
                        isDefaultAction: true,
                        order: 10
                    }, {
                        name: "CancelReload",
                        title: resources.cancel_reload,
                        icon: "stop",
                        order: 11
                    }
                ] },
            // List Menu Aux
            ListAux: { items: [
                    {
                        name: "Customize",
                        icon: "settings",
                        title: resources.customize,
                        presentation: "icon",
                        order: 10
                    }, {
                        name: "IncreaseRowHeight",
                        icon: "x-icon-menu4-outer",
                        title: resources["increase_row_height"],
                        presentation: "icon",
                        order: 20
                    }, {
                        name: "DecreaseRowHeight",
                        icon: "x-icon-menu4-inner",
                        title: resources["decrease_row_height"],
                        presentation: "icon",
                        order: 21
                    }
                ] }
        };
        /**
         * @enum {String}
         */
        List.events = {
            DATA_LOADING: "dataLoading",
            DATA_PREPARING: "dataPreparing",
            DATA_LOADED: "dataLoaded"
        };
        __decorate([
            lang.decorators.constant(List.defaultMenus)
        ], List.prototype, "defaultMenus");
        __decorate([
            lang.decorators.constant(List.events)
        ], List.prototype, "events");
        __decorate([
            lang.decorators.observableAccessor()
        ], List.prototype, "hintMessage");
        return List;
    }(Component));
    // NOTE: `as any` для TS 2.4
    PartCommandMixin.mixinTo(List);
    List.mixin(ListCommonMixin_1["default"]);
    List.mixin(PartWithFilterMixin);
    (function (List) {
        var Loader = /** @class */ (function () {
            function Loader(app, options) {
                this.app = app;
                this.options = options;
                this.dataSource = options.dataSource;
            }
            Loader.prototype.load = function (list, params) {
                var that = this, query = {
                    params: params
                }, options = {
                    opId: that.options.cancellable ? utils.generateGuid() : undefined
                };
                that._reloadOpId = options.opId;
                return that.dataSource.load(query, options).then(function (dsResult) {
                    var items = that.onMaterialize(dsResult);
                    return { items: items, hints: dsResult.hints };
                }).always(function () {
                    that._reloadOpId = undefined;
                });
            };
            Loader.prototype.cancel = function () {
                var that = this, opId = that._reloadOpId, ds = that.dataSource;
                if (opId && ds.cancel) {
                    ds.cancel(opId);
                    that._reloadOpId = undefined;
                }
            };
            Loader.prototype.onMaterialize = function (dsResult) {
                var that = this;
                var items = dsResult.result;
                if (that.options.onMaterialize) {
                    var args = { items: items, dsResult: dsResult };
                    that.options.onMaterialize.call(that, args);
                    items = args.items;
                }
                return items;
            };
            return Loader;
        }());
        List.Loader = Loader;
    })(List || (List = {}));
    List.defaultOptions.Loader = List.Loader;
    // backward compatibility:
    List.mixin(/** @lends List.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: List.defaultOptions
    });
    core.ui.List = List;
    /**
     * @deprecated Use core.ui.List component
     */
    core.ui.ObjectListSimple = List;
    return List;
});
//# sourceMappingURL=List.js.map