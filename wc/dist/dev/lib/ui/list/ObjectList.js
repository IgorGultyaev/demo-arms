/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/list/List", "lib/ui/list/ObjectListLoader", "lib/data/DataSource", "lib/ui/menu/Menu", "lib/ui/ConfirmDialog", "i18n!lib/nls/resources", "lib/ui/validation/ContextPartMixin", "lib/ui/list/ObjectListMixin"], function (require, exports, core, List, ObjectListLoader, DataSource, Menu, ConfirmDialog, resources, ContextPartMixin_1, ObjectListMixin) {
    "use strict";
    var lang = core.lang;
    var ObservableCollection = lang.ObservableCollection;
    var ObjectList = /** @class */ (function (_super) {
        __extends(ObjectList, _super);
        /**
         * @constructs ObjectList
         * @extends List
         * @param {Application} app
         * @param {Object} options
         * @param {Array} options.columns Array of column descriptors
         * @param {String} options.columns.name
         * @param {String} options.columns.prop
         * @param {String} options.columns.title
         * @param {Function} [options.columns.formatter]
         * @param {Object} options.stateMessages Overwrite state messages (key - name of state, value - message text)
         */
        function ObjectList(app, options) {
            var _this = this;
            options = ObjectList.mixOptions(options, ObjectList.defaultOptions);
            _this = _super.call(this, app, options) || this;
            return _this;
        }
        ObjectList.prototype.tweakOptions = function (options) {
            if (!options.validateItems) {
                options.validateItems = options.editable ? "explicit" : "never";
            }
            _super.prototype.tweakOptions.call(this, options);
        };
        ObjectList.prototype.findDomainProp = function (column) {
            var entity = this._entityType;
            if (!entity) {
                return;
            }
            return entity.props[column.prop || column.name];
        };
        ObjectList.prototype._preinitialize = function () {
            var that = this;
            that.entityType = that.options.entityType || that.options.urlSuffix;
            // NOTE: traceSource is already created by List's constructor
            //that.traceSource = new core.diagnostics.TraceSource("ui.ObjectList", that.options.traceSourceName || that.name || that.entityType);
            that.traceSource.className = "ui.ObjectList";
            that.traceSource.name = that.options.traceSourceName || that.name || that.entityType;
            // NOTE: uow нужно создать до вызова базового метода, т.к. она используется при создании loader-а
            that.uow = that.options.uow || that.app.createUnitOfWork({ connected: true });
            that._ownUow = !that.options.uow;
            that.uow.bind("detach", that.onObjectDetached, that);
            that.keepChangesOnReload = lang.coalesce(that.options.keepChangesOnReload, !that._ownUow);
            _super.prototype._preinitialize.call(this);
            that._initOrderBy();
            if (!that.entityType && that.loader) {
                that.entityType = that.loader.entityType;
            }
            that._entityType = that.app.model.meta.entities[that.entityType];
            //if (!that._entityType) { throw new Error("ObjectList.ctor:unknown entityType: " + that.entityType); }
            that.contextParts = new ObservableCollection();
            that.violations.bind("change", that._onViolationsChanged, that);
        };
        ObjectList.prototype._initOrderBy = function () {
            var that = this;
            var orderByServer;
            var opt = that.options.orderByServer;
            if (opt === true) {
                orderByServer = { mode: "always" };
            }
            else if (opt === false) {
                orderByServer = { mode: "never" };
            }
            else if (!opt) {
                orderByServer = { mode: "auto" };
            }
            else if (lang.isString(opt) || lang.isArray(opt)) {
                orderByServer = { mode: "always", initial: opt };
            }
            else {
                orderByServer = opt;
            }
            if (orderByServer.initial && core.lang.isString(orderByServer.initial)) {
                orderByServer.initial = [orderByServer.initial];
            }
            if (orderByServer.mode === "reloadOnly" && (!orderByServer.initial || !orderByServer.initial.length)) {
                // reloadOnly w/o initial makes no sense
                orderByServer.mode = "auto";
            }
            that.options.orderByServer = orderByServer;
            that._orderByServer = orderByServer && orderByServer.mode === "always";
            if (orderByServer && orderByServer.mode === "always") {
                // disable client orderBy for server sorting
                that.options.orderBy = undefined;
            }
            // NOTE: see ListCommonMixin.setupColumns as well
        };
        ObjectList.prototype.createLoader = function () {
            var that = this, loader = lang.unlazy(that.options.loader, that);
            // NOTE: if loader equals to 'null' that means that the list should not have ability to load/reload (data will be set externally).
            if (loader !== undefined) {
                return loader;
            }
            var ds = that.options.dataSource || new DataSource(that.app, {
                entityType: that.entityType,
                preloads: that.options.preloads
            });
            return new that.options.Loader(that.app, {
                uow: that.uow,
                dataSource: ds,
                entityType: that.entityType,
                loadPolicy: that.options.loadPolicy,
                cancellable: that.options.cancellable,
                onMaterialize: that.options.onDataMaterialize
            });
        };
        ObjectList.prototype.createListMenuDefaults = function () {
            var key = this.options.editable ? "EditableList" : "List";
            var menuOptions = Menu.defaultsFor(this.defaultMenus[key], key, this.entityType);
            if (this.options.hideExportMenu) {
                menuOptions = Menu.merge(menuOptions, { remove: ["Export"] });
            }
            return menuOptions;
        };
        ObjectList.prototype.createRowMenuDefaults = function () {
            var key = this.options.readOnly ? "ReadOnlyRow" : "ListRow";
            return Menu.defaultsFor(this.defaultMenus[key], key, this.entityType);
        };
        ObjectList.prototype.createSelectionMenuDefaults = function () {
            return Menu.defaultsFor(this.defaultMenus.Selection, "Selection", this.entityType);
        };
        ObjectList.prototype._initializeColumn = function (col, initFromLoader, initFromType) {
            var that = this, column = typeof col === "string" ? { name: col } : col;
            column.role = column.role || (column.command ? "command" : "data");
            if (column.role === "data") {
                if (initFromLoader && that.loader && that.loader.columns) {
                    lang.some(that.loader.columns, function (col) {
                        if (col.name === column.name) {
                            lang.append(column, col);
                            return true;
                        }
                    });
                }
                if (!column.getter) {
                    // NOTE: если у колонки нет prop и есть getter, то предполагать prop на основе name небезопасно (WC-1399)
                    column.prop = column.prop || column.name;
                }
                if (initFromType) {
                    var prop = that.findDomainProp(column);
                    if (prop) {
                        lang.append(column, {
                            name: prop.name,
                            title: prop.descr,
                            vt: prop.vt
                        });
                    }
                }
            }
            column.name = column.name || column.prop;
            return column;
        };
        ObjectList.prototype._generateColumnFromType = function () {
            var that = this, columns = [];
            if (!that._entityType) {
                // if we get to the generating columns from type then it MUST specified
                throw new Error("ObjectList: list's options has no entityType nor columns specified");
            }
            lang.forEach(that._entityType.props, function (prop) {
                if (prop.vt === "binary") {
                    return;
                } // skip binaries
                var col = that._initializeColumn({
                    name: prop.name,
                    prop: prop.name,
                    title: prop.descr,
                    vt: prop.vt
                }, /*initFromLoader=*/ false, /*initFromType=*/ false);
                columns.push(col);
            });
            return columns;
        };
        ObjectList.prototype._initializeColumns = function () {
            var that = this, columns;
            // NOTE: we'are not calling the base method here (in List)
            if (that.options.columns) {
                // columns were specified in the list's options
                columns = that.options.columns.map(function (col) { return that._initializeColumn(col, /*initFromLoader=*/ true, /*initFromType=*/ true); });
            }
            else if (that.loader && that.loader.columns) {
                // columns were NOT specified in the list's options, try to take them from loader
                columns = that.loader.columns.map(function (col) { return that._initializeColumn(col, /*initFromLoader=*/ false, /*initFromType=*/ true); });
            }
            if (!columns || !columns.length) {
                columns = that._generateColumnFromType();
            }
            that.setupColumns(columns);
        };
        /**
         * @protected
         */
        ObjectList.prototype.onColumnsChanged = function () {
            var that = this, menuItem = that.menuListAux.getItem("Customize");
            // update menu
            if (menuItem) {
                var hasHidden = that.columns.some(function (col) { return col.hidden; });
                menuItem.cssClass = hasHidden ? "x-menu-item-badge-warning" : "";
                // notify that property 'menuList' was changed
                that.changed("menuList");
            }
        };
        /**
         * @protected
         * @override
         * @returns {{Reload: BoundCommand, Edit: BoundCommand, Delete: BoundCommand, Create: BoundCommand, Save: BoundCommand, Cancel: BoundCommand}}
         */
        ObjectList.prototype.createCommands = function () {
            var that = this, commands = _super.prototype.createCommands.call(this);
            commands.View = new core.commands.BoundCommand({
                execute: that.doView,
                canExecute: that.canView,
                debounce: that.options.commandsDebounce
            }, that);
            if (!that.options.readOnly) {
                commands.Edit = new core.commands.BoundCommand({
                    execute: that.doEdit,
                    canExecute: that.canEdit,
                    debounce: that.options.commandsDebounce
                }, that);
                commands.Delete = new core.commands.BoundCommand({
                    execute: that.doDelete,
                    canExecute: that.canDelete,
                    debounce: that.options.commandsDebounce
                }, that);
                commands.DeleteSelection = new core.commands.BoundCommand({
                    execute: that.doDeleteSelection,
                    canExecute: that.canDeleteSelection,
                    debounce: that.options.commandsDebounce
                }, that);
                commands.Create = new core.commands.BoundCommand({
                    execute: that.doCreate,
                    canExecute: that.canCreate,
                    debounce: that.options.commandsDebounce
                }, that);
            }
            if (that.options.editable) {
                commands.Save = new core.commands.BoundCommand({
                    execute: that.doSave,
                    canExecute: that.canSave,
                    debounce: that.options.commandsDebounce
                }, that);
                commands.Cancel = new core.commands.BoundCommand({
                    execute: that.doCancel,
                    canExecute: that.canCancel,
                    debounce: that.options.commandsDebounce
                }, that);
            }
            lang.extend(commands, that.options.commands);
            return commands;
        };
        /*private _isObjectOperable(obj: DomainObject): boolean {
            return obj && !lang.get(obj, "isRemoved") && !lang.get(obj, "isInvalid");
        }*/
        ObjectList.prototype.doCreate = function (args) {
            args = args || {};
            var that = this, type = args.type || that.entityType;
            return that.executePartCommand({
                part: "ObjectEditor:" + type,
                partOptions: that.options.editable ?
                    { type: type, uow: that.uow } :
                    { type: type }
            }, args, "Create").closed;
        };
        ObjectList.prototype.canCreate = function () {
            return this.navigationService && !!this.navigationService.navigate;
        };
        ObjectList.prototype.onBeforeCreate = function (createOptions) { };
        ObjectList.prototype.onAfterCreate = function (result, createOptions) {
            var that = this, type = createOptions.partOptions && createOptions.partOptions.type || that.entityType;
            if (!result || !result.success || !result.object) {
                that.activate();
                return;
            }
            lang.when(result.success).then(function () {
                that.onObjectCreated(type, result.object);
            });
        };
        /**
         * Object creation handler.
         * @param {String} type Type of object
         * @param {DomainObject} obj Object (viewModel) was returned from editor
         */
        ObjectList.prototype.onObjectCreated = function (type, obj) {
            this.uow.attach(obj);
            /*
            it could make sense to reload object (was removed in WC-749):
            that._uow
                .get(type, obj.id) // if the object was create in other uow then we'll get a stub otherwise it'll the created object
                .load(that.objectLoadOptions)
                .load({ policy: {
                    loadFirst: "local",
                    allowRemote: true,
                    allowLocal: true,
                    shouldCache: false
                }})
                .done(function (obj) {
                    that.addObject(obj);
                });
            */
            this.addObject(obj);
        };
        ObjectList.prototype.doEdit = function (args) {
            var that = this, obj = that.activeItem();
            return that.executePartCommand({
                part: "ObjectEditor:" + obj.meta.name,
                partOptions: that.options.editable ?
                    { viewModel: obj } :
                    { type: obj.meta.name, id: obj.id }
            }, args, "Edit").closed;
        };
        ObjectList.prototype.canEdit = function () {
            var that = this;
            return that.navigationService && that.navigationService.navigate &&
                that._isObjectOperable(that.activeItem());
        };
        ObjectList.prototype.onBeforeEdit = function (editOptions) {
            var that = this, partOptions;
            if (editOptions.navigateSiblings) {
                partOptions = editOptions.partOptions = editOptions.partOptions || {};
                partOptions.navigateSiblings = that.items.all().map(function (item) {
                    var siblingOptions = that.options.editable ?
                        { viewModel: item } :
                        { type: item.meta.name, id: item.id };
                    return lang.append(siblingOptions, partOptions);
                });
            }
        };
        ObjectList.prototype.onAfterEdit = function (result, editOptions) {
            this.onSiblingsNavigated(result, editOptions);
            this.activate();
        };
        ObjectList.prototype.doView = function (args) {
            var that = this, obj = that.activeItem();
            return that.executePartCommand({
                part: "ObjectViewer:" + obj.meta.name,
                partOptions: { viewModel: obj }
            }, args, "View").closed;
        };
        ObjectList.prototype.canView = function () {
            var that = this;
            return that.navigationService && that.navigationService.navigate &&
                that._isObjectOperable(that.activeItem());
        };
        ObjectList.prototype.onBeforeView = function (viewOptions) {
            var that = this, partOptions;
            if (viewOptions.navigateSiblings) {
                partOptions = viewOptions.partOptions = viewOptions.partOptions || {};
                partOptions.navigateSiblings = that.items.all().map(function (item) {
                    return lang.append({ viewModel: item }, partOptions);
                });
            }
        };
        ObjectList.prototype.onAfterView = function (result, viewOptions) {
            this.onSiblingsNavigated(result, viewOptions);
            this.activate();
        };
        ObjectList.prototype.onSiblingsNavigated = function (result, options) {
            var obj;
            if (options && options.navigateSiblings &&
                result && result.selectedId && (obj = this.items.find(function (item) { return item.id === result.selectedId; }))) {
                this.activeItem(obj);
            }
        };
        ObjectList.prototype.doDelete = function () {
            this._deleteObjects();
        };
        ObjectList.prototype.canDelete = function () {
            var that = this;
            if (!that.options.editable && that.saving()) {
                return false;
            }
            if (that._isObjectOperable(that.activeItem())) {
                return true;
            }
            var selection = that.get("selection");
            return selection.count() > 0 && selection.some(that._isObjectOperable, that);
        };
        ObjectList.prototype.doDeleteSelection = function () {
            var objects = this.selection.all();
            this._deleteObjects(objects);
        };
        ObjectList.prototype.canDeleteSelection = function () {
            var that = this;
            if (!that.options.editable && that.saving()) {
                return false;
            }
            var selection = that.get("selection");
            return selection.count() > 0 && !selection.some(function (obj) { return !that._isObjectOperable(obj); });
        };
        ObjectList.prototype.executeDelete = function (objects) {
            var that = this;
            var activeObj = that.activeItem();
            objects.forEach(function (obj) {
                that.uow.remove(obj);
                if (obj === activeObj) {
                    that.activeItem(null);
                }
            });
            // NOTE: deleted objects will be removed from 'items' collection in onObjectDetached
            if (!that.options.editable) {
                that.doSave().fail(function () {
                    that.uow.rollbackState();
                });
            }
        };
        ObjectList.prototype.doSave = function () {
            var _this = this;
            return this._validateBeforeSave().then(function () {
                _this._saveChanges();
            });
        };
        ObjectList.prototype.canSave = function () {
            return !this.saving() && this.get("uow").hasChanges();
        };
        ObjectList.prototype._saveChanges = function () {
            var that = this;
            var args = {
                cancel: undefined
            };
            that.onSaving(args);
            if (args.cancel) {
                return lang.rejected();
            }
            that.saving(true);
            var tx = (this.options.transactionName || this.name);
            var saveOptions = {
                onError: that._onSaveError.bind(that),
                interop: {
                    tx: tx,
                    // NOTE: disabling suppressing publishing an event for an error (as we're passing onError)
                    suppressEventOnError: false
                }
            };
            if (args.interop) {
                saveOptions.interop = args.interop;
            }
            if (that.options.getSaveOptions) {
                saveOptions = that.options.getSaveOptions(saveOptions, this);
            }
            return that.uow.save(saveOptions).always(function () {
                that.saving(false);
                that.onSaved({});
            });
        };
        ObjectList.prototype._onSaveError = function (args) {
            // TODO: надо объединить логику с редактором
            var that = this, error = args.error;
            if (core.eth.isOptimisticConcurrency(error)) {
                var deleted = error.deletedObjects;
                if (deleted && deleted.length) {
                    that.uow.purgeWithCascade(deleted);
                    // prevent default handing in UoW._onSaveFailed as we've removed and detached all objects already
                    error.deletedObjects = null;
                    error.serverError.deletedObjects = null; // todo: remove
                }
            }
            // complete save (i.e. rejecting with the error)
            args.complete();
            that.onSaveError(args);
        };
        ObjectList.prototype.onSaving = function (args) {
            this.trigger(ObjectList.Events.SAVING, this, args);
        };
        ObjectList.prototype.onSaved = function (args) {
            this.trigger(ObjectList.Events.SAVED, this, args);
        };
        ObjectList.prototype.onSaveError = function (args) {
            this.trigger(ObjectList.Events.SAVE_ERROR, this, args);
        };
        ObjectList.prototype.doCancel = function () {
            var that = this;
            that.uow.rollbackState();
            // the list can have some violations in previous uow state, clear violations
            that.violations.clear();
        };
        ObjectList.prototype.canCancel = function () {
            return !this.saving() && this.get("uow").hasChanges();
        };
        ObjectList.prototype.canSelectAll = function () {
            var that = this;
            var paging = that.options.paging;
            if (that.options.persistentSelection &&
                paging && paging.mode && paging.mode === "pages") {
                return true;
            }
            return _super.prototype.canSelectAll.call(this);
        };
        /*
        protected doSelectAll(): void {
            let that = this;
            NOTE: см. WC-1386 ObjectList: развитие операции "Выбрать всё" (frozen)
            let paging = <PagingOptions>that.options.paging;
            if (that.options.persistentSelection &&
                paging && paging.mode && paging.mode === "pages") {
                // Операция SelectAll для paging.mode=page + persistentSelection должна добавить в selection объекты со всех страниц.
                // Но добавить объекты в items нельзя (они не относятся к тек.странице), поэтому напрямую зовем loader.
                that.loader.load(that, that._lastLoadParams).then((result: ObjectListLoaderResult) => {
                    if (result.hints && result.hints.hasNext) {
                        // Even without paging params server can limit result due to its own limits.
                        // This can be misleading for users as they asked for "all" but get only first N rows, add hint.
                        that.hintMessage("Из-за ограничения сервера загружены и выбраны первые " + result.items.length + " записей");
                    }
                    let items = that._prepareData(result.items, result.hints);
                    that.setSelection(items);
                });
    
            } else {
                that.setSelection(that.items.all());
            }
        }
         */
        ObjectList.prototype.shouldValidateItem = function (item) {
            return item.isNew() || item.isModified();
        };
        ObjectList.prototype.getCommand = function (cmdName) {
            return this.commands[cmdName];
        };
        ObjectList.prototype.dispose = function (options) {
            var that = this;
            that.uow.unbind("detach", null, that);
            if (that._ownUow) {
                that.uow.dispose();
            }
            that._disposeParts();
            that.contextParts.dispose();
            _super.prototype.dispose.call(this, options);
        };
        /**
         * @override
         * @param args
         * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
         * @returns {Promise.<DomainObject[]>}
         */
        ObjectList.prototype.reload = function (args) {
            var _this = this;
            var that = this;
            if (!that.loader) {
                throw new Error("ObjectList doesn't have a loader associated with it");
            }
            if (!that.keepChangesOnReload && that.uow.hasChanges()) {
                return ConfirmDialog.create({
                    header: resources["objectList.reloadCaption"],
                    text: resources["objectList.reloadWarning"]
                }).open().then(function (result) {
                    if (result === "yes") {
                        that.doCancel();
                        return _super.prototype.reload.call(_this, args);
                    }
                    return lang.rejected();
                });
            }
            return _super.prototype.reload.call(this, args);
        };
        /**
         * @override
         */
        ObjectList.prototype._load = function (params) {
            params = this._applyServerSort(params);
            return _super.prototype._load.call(this, params);
        };
        ObjectList.prototype._applyServerSort = function (params) {
            var that = this;
            var opt = that.options.orderByServer;
            // if server sorting and it's not reload for sort (i.e. no sorting in args)
            if ((that._orderByServer || opt.mode === "reloadOnly") && (!params || !params.$orderby)) {
                params = params || {};
                // as it's not reload for sorting, restore orderBy from previous load (to keep sorting consistent)
                if (that._lastLoadParams && that._lastLoadParams.$orderby) {
                    params.$orderby = that._lastLoadParams.$orderby;
                }
                else if (opt.initial) {
                    // initial load - take orderBy from option
                    // NOTE: do not use parseOrderByServer, as initial sort columns have nothing in common with client columns.
                    params.$orderby = opt.initial.join(",");
                }
                // NOTE: orderByServer option will overwrite sorting in loadParams and in loader/DS
            }
            return params;
        };
        /**
         * Set list's data
         * @override
         * @param {Array} items An array of items (domain objects)
         * @param {Object} [hints]
         * @param {String} [hints.message]
         * @param {String} [hints.source]
         * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
         */
        ObjectList.prototype.setData = function (items, hints) {
            var that = this;
            if (that.keepChangesOnReload) {
                // there could be new unsaved objects in the list which will disappear on `setData`
                that.items.forEach(function (obj) {
                    if (obj.hasChanges() && items.indexOf(obj) < 0) {
                        if (!items.length) {
                            // server result contains no data,
                            // as we're going to add unsaved object into the list
                            // we should inform the user that reload returned no data
                            hints = { message: resources["objectList.hint.no_data_except_unsaved"] };
                        }
                        items.push(obj);
                    }
                });
            }
            var itemsOld;
            if (!that.options.keepAllObjects) {
                // NOTE: ObservableCollectionView<T>.all returns reference to inner array, so we need to clone it
                itemsOld = [].concat(that.items.all());
            }
            items = _super.prototype.setData.call(this, items, hints);
            // attach all objects to our UoW
            if (items && items.length) {
                core.lang.forEach(items, function (item) {
                    if (item.meta)
                        that.uow.attach(item);
                });
            }
            // if new items aren't contained in current list items, remove them (detach) from uow,
            // but for persistentSelection we won't remove object in selection
            // NOTE: it's important to do this after reset
            if (!that.options.keepAllObjects) {
                that._suppressOnObjectDetached = true;
                try {
                    for (var _i = 0, itemsOld_1 = itemsOld; _i < itemsOld_1.length; _i++) {
                        var item = itemsOld_1[_i];
                        if (items.indexOf(item) < 0 && (!that.options.persistentSelection || that.selection.indexOf(item) < 0)) {
                            that.uow.detach(item);
                        }
                    }
                }
                finally {
                    that._suppressOnObjectDetached = false;
                }
            }
            if (!items.length && hints && hints.source === "client") {
                that.stateMessage(that.options.stateMessages.noLocalData);
            }
            return items;
        };
        ObjectList.prototype.orderBy = function (columns) {
            var _this = this;
            var that = this;
            if (that._orderByServer) {
                // for server sorting "orderBy" means reloading with the same params as previous results were loaded
                // plus the new order-by condition (from clicked grid's column(s))
                var args = {
                    params: that._lastLoadParams
                };
                var parsed = lang.collections.parseOrderBy(columns, this.orderedBy());
                var columnsNorm = parsed.map(function (item) {
                    // item.prop это элемент из columns, найдем описание колонки для него
                    var col = lang.find(_this.columns, function (c) { return c.name === item.prop; });
                    // NOTE: если колонки нет, или у колонки нет ни orderByProp, ни prop, то сортировать нечего
                    //if (!col) { return item.prop; }
                    var orderByProp = col.orderByProp || col.prop;
                    return (col && orderByProp && !col.disableSort)
                        ? { prop: orderByProp, desc: item.desc } : null;
                }).filter(function (item) { return !!item; });
                // if no appropriate sorting expression was formed, there's no need for reload
                if (columnsNorm.length > 0) {
                    that.setOrderedBy(columnsNorm);
                    args.params.$orderby = columnsNorm.map(function (item) { return item.prop + (item.desc ? " desc" : ""); }).join(",");
                    // NOTE: doReload clears selection as well
                    that.doReload(args);
                }
            }
            else {
                _super.prototype.orderBy.call(this, columns);
            }
        };
        ObjectList.prototype.isColumnSortable = function (column) {
            if (this._orderByServer) {
                if (lang.isString(column)) {
                    column = lang.find(this.columns, function (c) { return c.name === column; });
                }
                return !!column && !!(column.orderByProp || column.prop) && !column.disableSort;
            }
            return true;
        };
        /**
         * @protected
         * @override
         * @param {DataLoadEventArgs} args
         */
        ObjectList.prototype.onDataLoaded = function (args) {
            var that = this;
            // keep load params but w/o paging
            // (if we need to reuse params (for reload/sorting/export) then we'll need them w/o paging args)
            that._lastLoadParams = lang.cloneEx(args.params, { except: ["$top", "$skip", "$fetchTotal"] });
            // TODO: init orderedBy
            var opt = that.options.orderByServer;
            // if paging w/mode="throttle" enabled, server returned paged data and server-sorting isn't disabled
            if (args.hints && args.hints.paging &&
                that.options.paging && that.options.paging.mode === "throttle" &&
                opt.mode === "auto") {
                // NOTE: клиентская сортировка в режиме throttle выглядит очень плохо,
                // поэтому отключаем ее пока не загрузим все данные, см. WC-1395
                if (args.hints.hasNext) {
                    if (!that._orderByServer) {
                        // changing client to server sorting
                        that._orderByServer = true;
                        that.items.orderBy([]);
                        // TODO: extract orderedBy from that._lastLoadParams or from args.hints
                        that.setOrderedBy([]);
                    }
                }
                else {
                    // last portion of paged data (or full page) was loaded, now we can use client sorting again
                    if (that._orderByServer) {
                        // changing server to client sorting
                        that._orderByServer = undefined;
                        // NOTE: some columns could change their sortable attribute
                        that.changed("columns");
                    }
                }
            }
            _super.prototype.onDataLoaded.call(this, args);
        };
        ObjectList.prototype.onObjectDetached = function (sender, obj) {
            if (obj && !this._suppressOnObjectDetached) {
                this.items.remove(obj);
            }
        };
        /**
         * Add an object to list
         * @protected
         * @param obj
         */
        ObjectList.prototype.addObject = function (obj) {
            var that = this, items = that._prepareData([obj]);
            if (!items || !items.length) {
                return;
            }
            that.items.add(items);
            that.activeItem(items[0]);
            that.state(that.states.loaded);
            that.stateMessage("");
            window.setTimeout(function () {
                that.activate();
            });
        };
        /*
            protected getResourceKey(key: string): string {
                return "objectList." + (this.options.editable ? "editable." : "") + key;
            }
        */
        ObjectList.prototype.getMessage = function (resources, op, mod) {
            if (this.options.editable) {
                var res = resources["objectList_editable." + op + "." + mod];
                if (res) {
                    return res;
                }
            }
            return resources["objectList." + op + "." + mod];
        };
        /**
         * Return all objects in current UnitOfWork with changes.
         * @return {Array<DomainObject>}
         */
        ObjectList.prototype.getChangedItems = function () {
            var changes = [];
            var uow = this.get("uow");
            uow.forEach(function (obj) {
                if (obj.hasChanges()) {
                    changes.push(obj);
                }
            });
            return changes;
        };
        ObjectList.defaultOptions = {
            /**
             * @type {ObjectListColumn[]}
             */
            columns: undefined,
            /**
             * @type {Part|String}
             */
            filter: undefined,
            /**
             * Additional params for DataSource (will be combined with filter's restrictions)
             * @type {Object|Function}
             */
            loadParams: undefined,
            /**
             * {String|Object} DataFacade's load policy. It can be rule name ("remoteFirst", "localFirst", "localIfOffline", "cached") or policy object (see CacheManager)
             */
            loadPolicy: undefined,
            /**
             * @type Boolean
             */
            autoLoad: undefined,
            loader: undefined,
            Loader: ObjectListLoader,
            /**
             * @type DataSource
             */
            dataSource: undefined,
            /**
             * @type Boolean
             */
            cancellable: false,
            /**
             * @type {Boolean|Number|Object}
             */
            paging: undefined,
            /**
             * @type UnitOfWork
             */
            uow: undefined,
            /**
             * @type Boolean
             */
            editable: false,
            /**
             * Allow multi select. For SlickGrid means adding a column with checkboxes.
             * @type {Boolean}
             */
            hasCheckboxes: true,
            //selectionMode: "multiple",
            /**
             * @type Boolean
             */
            readOnly: false,
            /**
             * @type String
             */
            traceSourceName: undefined,
            /**
             * @type Boolean
             */
            hideExportMenu: false,
            title: undefined,
            commands: undefined,
            commandsOptions: {
                /**
                 * Options for 'Create' command
                 * @type {Object|Function}
                 */
                Create: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of editor (see `ObjectEditor.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     * */
                    openInDialog: undefined
                },
                /**
                 * Options for 'Edit' command
                 * @type {Object|Function}
                 */
                Edit: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of editor or a callback to create it (see `ObjectEditor.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     * */
                    openInDialog: undefined,
                    /**
                     * Show carousel in editor for navigating sibling objects in list
                     * @type {Boolean}
                     */
                    navigateSiblings: true
                },
                /**
                 * Options for 'View' command
                 * @type {Object|Function}
                 */
                View: {
                    /**
                     * Part name of viewer (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of viewer or a callback to create it (see `ObjectViewer.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening viewer in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     * */
                    openInDialog: undefined,
                    /**
                     * Show carousel in viewer for navigating sibling objects in list
                     * @type {Boolean}
                     */
                    navigateSiblings: true
                },
                /**
                 * See `ListColumnsSettings.defaultOptions`
                 * @type {Object}
                 */
                Customize: {}
            },
            onDataLoading: undefined,
            onDataLoaded: undefined,
            onDataPreparing: undefined,
            onDataMaterialize: undefined,
            stateMessages: {
                noLocalData: resources["objectList.state.no_local_data"]
            },
            commandsDebounce: 250
        };
        ObjectList.defaultMenus = {
            // Row menu
            ListRow: { items: [
                    { name: "Create", title: resources.create, hotKey: "ins" },
                    { name: "Delete", title: resources["delete"], hotKey: "del" },
                    { name: "Edit", title: resources.edit, isDefaultAction: true }
                ] },
            ReadOnlyRow: { items: [
                    { name: "View", title: resources.view, isDefaultAction: true }
                ] },
            // Selection menu (inherits from List)
            Selection: List.defaultMenus.Selection,
            // List Menu (inherits from List)
            List: List.defaultMenus.List,
            ListAux: List.defaultMenus.ListAux,
            EditableList: { items: [
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
                    }, {
                        name: "Save",
                        title: resources.save,
                        html: "<span class='x-icon x-icon-save'></span><span class='hidden-xs'>" + resources.save + "</span>" +
                            "<span class='x-list-menu-pendingObjects'></span>",
                        icon: "save",
                        order: 20
                    }, {
                        name: "Cancel",
                        title: resources.cancel,
                        icon: "undo",
                        order: 30
                    }
                ] }
        };
        __decorate([
            lang.decorators.constant(ObjectList.defaultMenus)
        ], ObjectList.prototype, "defaultMenus");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ObjectList.prototype, "saving");
        return ObjectList;
    }(List));
    ObjectList.mixin({
        /** @type {Object} */
        defaultOptions: ObjectList.defaultOptions
    });
    ObjectList.mixin(ContextPartMixin_1.ContextPartComponentMixin);
    List.mixin(ObjectListMixin);
    (function (ObjectList) {
        ObjectList.Events = {
            SAVING: "saving",
            SAVED: "saved",
            SAVE_ERROR: "saveError"
        };
    })(ObjectList || (ObjectList = {}));
    core.ui.ObjectList = ObjectList;
    return ObjectList;
});
/**
 * @typedef {Object} DataLoadEventArgs
 * @description Arguments of `dataLoading` and `dataLoaded` events
 * @property {Object} [params] Parameters for the loader. Can be changed in `dataLoading`.
 * @property {Array} [items] An array of loaded items (domain objects). Can be changed in `dataLoaded`.
 * @property {Object} [hints] Hints returned by the loader. Can be changed in `dataLoaded`.
 */
//# sourceMappingURL=ObjectList.js.map