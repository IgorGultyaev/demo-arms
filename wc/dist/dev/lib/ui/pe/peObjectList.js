/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "lib/ui/pe/NavigationPropertyEditor", "lib/ui/list/ListCommonMixin", "lib/ui/list/ObjectListMixin", "lib/ui/menu/Menu", "lib/ui/pe/PropertyEditor", "lib/ui/ConfirmDialog", "i18n!lib/nls/resources", "xcss!lib/ui/styles/peObjectList"], function (require, exports, core, utils, NavigationPropertyEditor, ListCommonMixin_1, ObjectListMixin, Menu, PropertyEditor, ConfirmDialog, resources) {
    "use strict";
    var lang = core.lang;
    var peObjectList = /** @class */ (function (_super) {
        __extends(peObjectList, _super);
        /**
         * @constructs peObjectList
         * @extends NavigationPropertyEditor
         * @mixes ListCommonMixin
         * @param {Object} options
         */
        function peObjectList(options) {
            var _this = this;
            options = peObjectList.mixOptions(options, peObjectList.defaultOptions);
            _this = _super.call(this, options) || this;
            _this._initializeProps(); // see ListCommonMixin
            _this.layout = _this.options.layout;
            _this.userSettings = core.UserSettings.create(_this.options.userSettings);
            _this.commands = lang.extend(_this.createCommands(), _this.options.commands);
            _this.menuRow = _this.createRowMenu();
            if (_this.menuRow) {
                _this.menuRow.bindToPart(_this);
            }
            _this.menuSelection = _this.createSelectionMenu();
            if (_this.menuSelection) {
                _this.menuSelection.bindToPart(_this);
            }
            // NOTE: specify viewModel as null to skip setting viewModel to presenter
            _this.initPresenter({ viewModel: null });
            _this.state(_this.states.initial);
            utils.subscribeOnEvents(_this, _this.options, _this.events);
            _this._bindToDisabled();
            _this.violations.bind("change", _this._onViolationsChange, _this);
            return _this;
        }
        peObjectList.prototype.tweakOptions = function (options) {
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
                validateItems: options.readOnly ? "never" : "explicit",
                presenterOptions: {
                    canMoveRows: !!options.indexed && !options.readOnly,
                    canSort: !options.orderBy,
                    hasCheckboxes: lang.coalesce(options.hasCheckboxes, !options.readOnly),
                    hasRowNum: options.hasRowNum
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        peObjectList.prototype.createCommands = function () {
            var that = this, commands = _super.prototype.createCommands.call(this);
            commands.SelectAll = new core.commands.BoundCommand(that.doSelectAll, that.canSelectAll, that);
            commands.SelectNone = new core.commands.BoundCommand(that.doSelectNone, that.canSelectNone, that);
            commands.Customize = new core.commands.BoundCommand(that.doCustomize, that.canCustomize, that);
            commands.IncreaseRowHeight = new core.commands.BoundCommand(that.doIncreaseRowHeight, that.canChangeRowHeight, that);
            commands.DecreaseRowHeight = new core.commands.BoundCommand(that.doDecreaseRowHeight, that.canChangeRowHeight, that);
            return commands;
        };
        peObjectList.prototype.doDeleteSelection = function () {
            var objects = this.selection.all().slice();
            this._deleteObjects(objects);
        };
        peObjectList.prototype.canDeleteSelection = function () {
            return !this.disabled() && this.get("selection").count();
        };
        peObjectList.prototype.doUnlinkSelection = function () {
            var objects = this.selection.all().slice();
            return this.doUnlinkObjects(objects);
            /*return lang.async.then(this.doUnlinkObjects(objects), () => {
                this.activate();
            });*/
        };
        peObjectList.prototype.canUnlinkSelection = function () {
            return !this.disabled() && this.get("selection").count();
        };
        peObjectList.prototype.createRowMenuDefaults = function () {
            // TODO: how to get objectName?
            var key = "peObjectListRow";
            return Menu.defaultsFor(this.defaultMenus[key], key);
        };
        peObjectList.prototype.createSelectionMenuDefaults = function () {
            // TODO: how to get objectName?
            var key = "peObjectListSelection";
            return Menu.defaultsFor(this.defaultMenus[key], key);
        };
        peObjectList.prototype.createRowMenu = function () {
            return new Menu(this.createRowMenuDefaults(), this.options.menuRow);
        };
        peObjectList.prototype.createSelectionMenu = function () {
            return new Menu(this.createSelectionMenuDefaults(), this.options.menuSelection);
        };
        peObjectList.prototype.setViewModel = function (viewModel) {
            _super.prototype.setViewModel.call(this, viewModel);
            var that = this;
            // NOTE: viewModel can be null, viewModel can be a not-loaded object
            if (that.viewModel && that.viewModel[that.viewModelProp]) {
                // init columns
                that._initializeColumns();
                var value = that.value();
                if (value && !lang.support.isNotLoaded(value)) {
                    that.items.source(value);
                    that.state(that.states.loaded);
                }
                // NOTE: if the property isn't loaded here, it will be loaded in render method
                // TODO: what if value is null?
                if (that.presenter && that.presenter.setViewModel) {
                    that.presenter.setViewModel(that);
                }
            }
        };
        peObjectList.prototype._initializeColumns = function () {
            var that = this, columns = [];
            if (lang.isArray(that.options.columns)) {
                for (var _i = 0, _a = that.options.columns; _i < _a.length; _i++) {
                    var col = _a[_i];
                    var column = lang.isString(col) ? { prop: col } : col;
                    if (!column.role || column.role === "data") {
                        column.name = column.name || column.prop;
                        if (!column.getter) {
                            // NOTE: если у колонки нет prop и есть getter, то предполагать prop на основе name небезопасно (WC-1399)
                            column.prop = column.prop || column.name;
                        }
                        var prop = that.findDomainProp(column);
                        column.title = column.title || (prop && prop.descr) || column.name;
                        //column.vt = column.vt || (prop && prop.vt);
                        if (!column.vt && prop) {
                            column.vt = prop.vt;
                        }
                    }
                    columns.push(column);
                }
            }
            else {
                // auto-generating columns from type's metadata
                var propMeta_1 = that.viewModel.meta.props[that.viewModelProp]; // may be undefined for calculated properties
                lang.forEach(that.valueObjectEntityType.props, function (prop, propName) {
                    if ((propMeta_1 && prop.opposite === propMeta_1) || // ignore reverse props
                        (prop.ref && prop.many) || // ignore navigation set props
                        prop.vt === "binary") {
                        return;
                    }
                    columns.push({
                        name: propName,
                        prop: propName,
                        title: prop.descr,
                        vt: prop.vt
                    });
                });
            }
            that.setupColumns(columns);
        };
        peObjectList.prototype._ensurePropLoaded = function () {
            var that = this;
            if (that.viewModel[that.viewModelProp]) {
                var value = that.value(), propLoadOptions = {
                    preloads: that.options.preloads
                };
                if (lang.support.isNotLoaded(value)) {
                    that.state(that.states.reloading);
                    return value.load(propLoadOptions).then(function () {
                        that._onDataLoaded();
                    }, function () {
                        that.state(that.states.failed);
                        that.stateMessage(resources["objectList.state.load_failed"]);
                    });
                }
                else if (value !== that.items.source()) {
                    that._onDataLoaded(value);
                }
            }
        };
        peObjectList.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            this._ensurePropLoaded();
        };
        peObjectList.prototype._onDataLoaded = function (data) {
            var that = this;
            if (that.isDisposed) {
                return;
            }
            that.items.source(data || that.value());
            that.state(that.states.loaded);
            that.onDataLoaded();
        };
        peObjectList.prototype.onDataLoaded = function () {
            var that = this;
            that.trigger(that.events.DATA_LOADED, that);
        };
        peObjectList.prototype.dispose = function (options) {
            _super.prototype.dispose.call(this, options);
            this.items.dispose();
            this.selection.dispose();
            this.violations.dispose();
        };
        peObjectList.prototype.beforeRender = function (domElement) {
            _super.prototype.beforeRender.call(this, domElement);
            this._ensurePropLoaded();
        };
        peObjectList.prototype._onViolationsChange = function () {
            var violation = this.violation();
            if (violation && !violation.aggregated) {
                return;
            }
            if (this.violations.find(function (item) {
                return (!item.severity || item.severity === "error" || item.severity === "critical");
            })) {
                // convert several items violations to single aggregated violation
                violation = this.createViolation(this.options.descr + ": " + resources["peObjectList.validation.itemsViolations"]);
                violation.aggregated = true;
            }
            else {
                violation = undefined;
            }
            this.violation(violation);
        };
        peObjectList.prototype.runValidation = function (options) {
            _super.prototype.runValidation.call(this);
            if (this.shouldValidateItems(options)) {
                this.runItemsValidation();
            }
            // NOTE: runValidation and runItemsValidation set violation themselves
            return this.violation();
        };
        peObjectList.prototype._errorToHtml = function (error) {
            // don't show violation for the whole PE, separated violations are shown for items
            if (error.aggregated) {
                return;
            }
            return _super.prototype._errorToHtml.call(this, error);
        };
        /* -- api for ObjectListPresenter (me as model) */
        // achtung: copy-paste from ObjectList
        //findObject(type, id) {
        //	let that = this;
        //	return that.value().first(type, id);
        //}
        peObjectList.prototype.currentValue = function () {
            return this.activeItem();
        };
        peObjectList.prototype.findDomainProp = function (column) {
            var entity = this.valueObjectEntityType;
            if (!entity) {
                return;
            }
            return entity.props[column.prop || column.name];
        };
        peObjectList.prototype.focus = function () {
            var presenter = this.presenter;
            if (presenter && presenter.focus) {
                presenter.focus();
            }
            else {
                _super.prototype.focus.call(this);
            }
        };
        peObjectList.prototype.scrollToSelf = function () {
            var presenter = this.presenter;
            if (!presenter || !presenter.scrollToSelf) {
                _super.prototype.scrollToSelf.call(this);
                return;
            }
            presenter.scrollToSelf();
        };
        peObjectList.prototype.onBeforeEdit = function (editOptions) {
            var that = this, partOptions;
            if (editOptions.navigateSiblings) {
                partOptions = editOptions.partOptions = editOptions.partOptions || {};
                partOptions.navigateSiblings = that.items.all()
                    .map(function (item) { return lang.append({ viewModel: item }, partOptions); });
            }
        };
        peObjectList.prototype.onAfterEdit = function (result, editOptions) {
            var _this = this;
            this.onSiblingsNavigated(result, editOptions);
            _super.prototype.onAfterEdit.call(this, result, editOptions);
            // validate edited object
            if (result && result.success) {
                // NOTE: `result.object` is ObjectEditor's viewModel, which can be overridden by the editor
                // and diffirred from the original item. But `partOptions.viewModel` points to original item.
                var obj_1 = editOptions.partOptions.viewModel || result.object;
                // validate edited item
                lang.async.then(result.success, function () {
                    _this.runItemsValidation(obj_1);
                });
            }
        };
        peObjectList.prototype.onAfterCreate = function (result, createOptions) {
            _super.prototype.onAfterCreate.call(this, result, createOptions);
            if (result && result.success && result.object) {
                var obj_2 = createOptions.partOptions.viewModel || result.object;
                obj_2 = this.items.find(function (item) { return item.id === obj_2.id; });
                if (obj_2) {
                    this.activeItem(obj_2);
                }
            }
        };
        peObjectList.prototype.onSiblingsNavigated = function (result, options) {
            var obj;
            if (options && options.navigateSiblings &&
                result && result.selectedId && (obj = this.items.find(function (item) { return item.id === result.selectedId; }))) {
                this.activeItem(obj);
            }
        };
        peObjectList.prototype._onSelectedValues = function (result) {
            _super.prototype._onSelectedValues.call(this, result);
            // NOTE: all objects in result.selection must be in UoW after executing base method
            var objects = result && result.selection;
            if (!objects || !objects.length) {
                return;
            }
            // activate first object
            this.activeItem(objects[0]);
            // reset current selection if there are several selected objects
            if (objects.length > 1) {
                this.selection.reset(objects);
            }
        };
        peObjectList.prototype._addObject = function (obj) {
            var propValue = this.value();
            if (propValue.indexOf(obj) < 0) {
                propValue.add(obj);
            }
        };
        peObjectList.prototype._valueIds = function () {
            var value = this.value();
            // NOTE: `ids()` is optional method
            return value.ids ? value.ids() : value.all().map(function (o) { return o.id; });
        };
        peObjectList.prototype.onColumnsChanged = function () {
            var that = this, menuItem = that.menuRow.getItem("Customize");
            // update menu
            if (menuItem) {
                var hasHidden = that.columns.some(function (col) { return col.hidden; });
                menuItem.cssClass = hasHidden ? "x-menu-item-badge-warning" : "";
                // notify that property 'menuRow' was changed
                that.changed("menuRow");
            }
        };
        peObjectList.prototype.shouldValidateItem = function (item) {
            return item.isNew() || item.isModified();
        };
        peObjectList.prototype.canUnlink = function () {
            return !this.disabled() && (!!this.currentValue() || this.get("selection").count() > 0);
        };
        peObjectList.prototype.doUnlink = function () {
            return this._unlinkObjects();
        };
        peObjectList.prototype._unlinkObjects = function (objects) {
            var that = this, activeObj = that.activeItem(), selection;
            // #1: detect what should we unlink
            if (!objects) {
                if (that.options.selectionMode === "single") {
                    if (!activeObj) {
                        return;
                    }
                    objects = [activeObj];
                }
                else {
                    selection = that.selection.all();
                    var selectionCount = selection.length;
                    if (selectionCount === 0 && activeObj) {
                        objects = [activeObj];
                    }
                    else if (selectionCount > 0 && activeObj) {
                        // there are selected objects AND active - it's the most subtle case for UX
                        if (selection.indexOf(activeObj) > -1) {
                            // selection includes the active
                            objects = selection;
                        }
                        else {
                            // we couldn't determine what to delete
                            objects = null;
                        }
                    }
                    else if (selectionCount > 0 && !activeObj) {
                        // there are only selected objects
                        objects = selection;
                    }
                    else {
                        // nothing to unlink
                        return;
                    }
                }
            }
            // now we have a set of objects to unlink - `objects` (or may be not if it's unclear what to unlink),
            // #2: construct a confirmation for user
            var confirmation = that.getOperationConfirmation("unlink", objects, selection, activeObj);
            if (!confirmation) {
                return;
            }
            // #3: ask user
            lang.async.then(confirmation, function (confirmation) {
                if (confirmation.text) {
                    ConfirmDialog.create({
                        header: resources["objectList.name"],
                        text: confirmation.text,
                        menu: confirmation.menu
                    }).open().done(function (result) {
                        if (result === "Selected") {
                            objects = selection;
                            result = "yes";
                        }
                        else if (result === "Active") {
                            objects = [activeObj];
                            result = "yes";
                        }
                        if (result === "yes") {
                            that.doUnlinkObjects(objects);
                        }
                    });
                }
                else if (confirmation.objects) {
                    // no text, delete silently
                    that.doUnlinkObjects(objects);
                }
            });
        };
        peObjectList.prototype.doUnlinkObjects = function (objects) {
            var that = this, orphanObjects = objects.filter(function (obj) { return that._isOrphan(obj); });
            // NOTE: склонируем массив, т.к. это может быть selection.all() (а это ссылка, и при исключении объектов они будут удаляться из selection)
            objects = [].concat.apply([], objects);
            // if objects being unlinked are changes and has no other references (except the current property),
            // we'll detach these objects (as they would become "orphan")
            if (orphanObjects.length > 0) {
                // among objects being unlinked there're some orphans: changed objects which become unreachable,
                // there could be the following cases:
                //		- one unlinked object
                //		- several unlinked objects and all of them are orphans
                //		- several unlinked objects but only some of they are orphans
                var msgText = void 0;
                if (objects.length === 1) {
                    msgText = resources["peObjectList.orphan.unlink.one"];
                }
                else if (objects.length === orphanObjects.length) {
                    msgText = resources["peObjectList.orphan.unlink.many_all"];
                }
                else {
                    msgText = resources["peObjectList.orphan.unlink.many_some"];
                }
                var dialog = ConfirmDialog.create({
                    header: that.title(),
                    text: msgText
                });
                return dialog.open().then(function (result) {
                    if (result !== "yes") {
                        return lang.rejected();
                    }
                    // remove references from property
                    that.executeUnlink(objects);
                    // detach orphan objects
                    return orphanObjects.forEach(function (obj) {
                        that.viewModel.uow.detach(obj);
                    });
                });
            }
            that.executeUnlink(objects);
        };
        peObjectList.prototype.executeUnlink = function (objects) {
            var _this = this;
            var activeObj = this.activeItem();
            objects.forEach(function (obj) {
                if (obj === activeObj) {
                    _this.activeItem(null);
                }
            });
            // NOTE: при исключении объектов для _каждого_ из них:
            // 	меняется items списка -> это вызывает обновление грида, валидацию, байндинги команд
            //	объект удаляется из selection (если он в него входит) -> это вызывает обновление селекшена грида, байндинги команд
            this.value().remove(objects);
            //this.activate(); - это выделяет первую строку. Не совсем ясно зачем.
        };
        peObjectList.prototype.shouldValidateItems = function (options) {
            if (!this.shouldValidate(options)) {
                return false;
            }
            switch (this.options.validateItems) {
                case "explicit":
                    return !options || options.reason !== "auto";
                case "always":
                    return true;
                case "never":
                default:
                    return false;
            }
        };
        peObjectList.prototype.doDelete = function () {
            return this._deleteObjects();
        };
        peObjectList.prototype.executeDelete = function (objects) {
            var _this = this;
            var uow = this.viewModel.uow;
            var activeObj = this.activeItem();
            objects.forEach(function (obj) {
                uow.remove(obj);
                if (obj === activeObj) {
                    _this.activeItem(null);
                }
            });
            // unlink objects first
            this.value().remove(objects);
            objects.forEach(function (obj) {
                uow.remove(obj);
            });
            //this.activate(); - это выделяет первую строку. Не совсем ясно зачем.
        };
        peObjectList.prototype.getMessage = function (resources, op, mod) {
            var res = resources["peObjectList." + op + "." + mod];
            if (res) {
                return res;
            }
            res = resources["objectList_editable." + op + "." + mod];
            if (res) {
                return res;
            }
            return resources["objectList." + op + "." + mod];
        };
        peObjectList.prototype.getChangedItems = function () {
            var propValue = this.value();
            return propValue.all().filter(function (obj) {
                return lang.isFunction(obj.hasChanges) && obj.hasChanges();
            });
        };
        peObjectList.defaultOptions = {
            indexed: false,
            commands: {},
            layout: { position: "row" }
        };
        peObjectList.defaultMenus = {
            peObjectListRow: { items: [
                    { name: "Select", title: resources.select },
                    { name: "Create", title: resources.create, hotKey: "ins" },
                    { name: "Edit", title: resources.edit, isDefaultAction: true },
                    { name: "View", title: resources.view, isDefaultAction: true },
                    { name: "Unlink", title: resources["navigationPE.unlink.many"] },
                    { name: "Delete", title: resources["delete"], hotKey: "del" },
                    {
                        name: "Customize",
                        icon: "settings",
                        title: resources.customize,
                        presentation: "icon",
                        order: 100
                    }, {
                        name: "RowHeight",
                        icon: "x-icon-menu4-outer",
                        presentation: "icon",
                        order: 101,
                        items: [{
                                name: "IncreaseRowHeight",
                                title: resources["increase_row_height"],
                                icon: "x-icon-menu4-outer",
                                presentation: "icon",
                                order: 1
                            }, {
                                name: "DecreaseRowHeight",
                                title: resources["decrease_row_height"],
                                icon: "x-icon-menu4-inner",
                                presentation: "icon",
                                order: 2
                            }]
                    }
                ] },
            peObjectListSelection: { items: [
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
                ] }
        };
        return peObjectList;
    }(NavigationPropertyEditor));
    // NOTE: use `override: "inherited"` to keep existent `shouldValidateItem` and `shouldValidateItems` methods
    peObjectList.mixin(ListCommonMixin_1["default"], /*override*/ "inherited");
    peObjectList.mixin(ObjectListMixin);
    peObjectList.mixin(/** @lends peObjectList.prototype */ {
        defaultOptions: peObjectList.defaultOptions,
        defaultMenus: peObjectList.defaultMenus,
        /**
         * @enum {String}
         */
        events: {
            /* data loaded event */
            DATA_LOADED: "dataLoaded"
        }
    });
    core.ui.peObjectList = peObjectList;
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.many ? core.ui.peObjectList : null;
    }, { vt: "object", priority: 10 });
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.many && propMd.presentation === "list" ? core.ui.peObjectList : null;
    }, { vt: "object", priority: 20 });
    return peObjectList;
});
//# sourceMappingURL=peObjectList.js.map