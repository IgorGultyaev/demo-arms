/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/editor/ObjectEditor", "lib/ui/menu/Menu", "lib/ui/ConfirmDialog", "i18n!lib/nls/resources", "xcss!lib/ui/styles/objectFilter"], function (require, exports, core, ObjectEditor, Menu, ConfirmDialog, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectFilter = /** @class */ (function (_super) {
        __extends(ObjectFilter, _super);
        /**
         * @constructs ObjectFilter
         * @extends ObjectEditor
         * @param {Object} options
         */
        function ObjectFilter(options) {
            var _this = this;
            options = ObjectFilter.mixOptions(options, ObjectFilter.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.comparers = _this.options.comparers || {};
            _this.bind("change:restrictions", _this._onRestrictionsChange, _this);
            if (_this.userSettings) {
                _this.userSettings.bindToProp(_this, "restrictions");
            }
            if (_this.options.savedFilters) {
                var item = _this.menu.getItem("ManageFilters");
                if (item) {
                    item.getMenu = _this._getManageFilterMenu.bind(_this);
                }
                if (_this.userSettings) {
                    _this.userSettings.bindToProp(_this, "savedRestrictions");
                }
            }
            return _this;
        }
        ObjectFilter.prototype.createMenuDefaults = function () {
            var menuOptions = Menu.defaultsFor(this.defaultMenu, "Filter", this._getType());
            if (!this.options.savedFilters) {
                menuOptions = Menu.merge(menuOptions, { remove: ["ManageFilters"] });
            }
            return menuOptions;
        };
        /**
         * @protected
         * @override
         * @returns {{ClearFilter: (Command), SaveFilter: (Command)}}
         */
        ObjectFilter.prototype.createCommands = function () {
            var that = this, cmdClear = core.createCommand({
                name: "ClearFilter",
                execute: function () {
                    that.clearRestrictions();
                }
            }), cmdSave = core.createCommand({
                name: "SaveFilter",
                execute: function () {
                    that.saveFilter();
                }
            }), cmdRestore = core.createCommand({
                name: "RestoreFilter",
                execute: function (args) {
                    var restrictions = args.restrictions;
                    if (restrictions) {
                        that.clearRestrictions();
                        that.applyRestrictions(restrictions, "RestoreFilterCommand");
                    }
                }
            }), cmdMerge = core.createCommand({
                name: "MergeFilter",
                execute: function (args) {
                    var restrictions = args.restrictions;
                    if (restrictions) {
                        that.applyRestrictions(restrictions, "MergeFilterCommand");
                    }
                }
            }), cmdDeleteFilter = core.createCommand({
                name: "DeleteFilter",
                execute: function (args) {
                    var i = args.index, restrictions = that.savedRestrictions();
                    if (restrictions && i != null) {
                        restrictions.splice(i, 1);
                        that.savedRestrictions(restrictions);
                        that.trigger("change:savedRestrictions", that, restrictions, restrictions);
                    }
                }
            }), cmdDeleteFilters = core.createCommand({
                name: "DeleteFilters",
                execute: function () {
                    var confirm = new ConfirmDialog({
                        text: resources["objectFilter.delete_all_filters_prompt"]
                    });
                    confirm.open().done(function (result) {
                        if (result === "yes") {
                            that.savedRestrictions(null);
                            // TODO: publish acknowledge
                        }
                    });
                }
            });
            return {
                ClearFilter: cmdClear,
                SaveFilter: cmdSave,
                RestoreFilter: cmdRestore,
                MergeFilter: cmdMerge,
                DeleteFilter: cmdDeleteFilter,
                DeleteFilters: cmdDeleteFilters
            };
        };
        ObjectFilter.prototype._getManageFilterMenu = function () {
            var that = this, filterData = that._toJson(that.viewModel), items = [
                {
                    name: "SaveFilter",
                    title: resources["objectFilter.saveFilter"] + "...",
                    icon: "x-icon-download-2",
                    command: that.commands.SaveFilter
                }, {
                    name: "divider"
                }
            ];
            // disable "SaveFilter" if current restrictions are empty
            that.commands.SaveFilter.canExecute(lang.some(filterData, function (v) { return v != null && v !== ""; }));
            var restrictions = that.savedRestrictions(), runtimeRestrictions = that.options.filters, hasRestrictions = lang.isArray(restrictions) && restrictions.length, hasRuntimeRestrictions = lang.isArray(runtimeRestrictions) && runtimeRestrictions.length;
            if (hasRestrictions || hasRuntimeRestrictions) {
                items.push({
                    name: "header",
                    title: resources["objectFilter.filters"]
                });
                if (hasRuntimeRestrictions) {
                    runtimeRestrictions.forEach(function (item) {
                        var menuItem = that._createFilterMenuItem(item, true /*isRuntime*/);
                        items.push(menuItem);
                    });
                }
                if (hasRestrictions) {
                    restrictions.forEach(function (item, i) {
                        var menuItem = that._createFilterMenuItem(item, false /*isRuntime*/);
                        menuItem.items.unshift({
                            name: "Delete",
                            title: resources["objectFilter.deleteSavedFilter"],
                            command: that.commands.DeleteFilter,
                            params: { index: i }
                        });
                        items.push(menuItem);
                    });
                    items.push({
                        name: "divider"
                    });
                    items.push({
                        name: "DeleteFilters",
                        icon: "delete",
                        title: resources["delete_all"],
                        command: that.commands.DeleteFilters
                    });
                }
            }
            else {
                items.push({
                    name: "Info",
                    title: resources["objectFilter.noSavedFilters"],
                    disabled: true
                });
            }
            return {
                items: items
            };
        };
        ObjectFilter.prototype._createFilterMenuItem = function (restrictionItem, isRuntime) {
            var commands = this.commands;
            return {
                title: restrictionItem.title,
                name: restrictionItem.title,
                params: { restrictions: restrictionItem.restrictions, descr: restrictionItem.descr, isRuntime: isRuntime },
                command: commands.RestoreFilter,
                hint: restrictionItem.descr ? ObjectFilter.formatFilterDesc(restrictionItem.descr) : null,
                items: [
                    {
                        name: "Merge",
                        title: resources["objectFilter.mergeSavedFilter"],
                        icon: "filter",
                        command: commands.MergeFilter,
                        params: { restrictions: restrictionItem.restrictions, descr: restrictionItem.descr, isRuntime: isRuntime }
                    }
                ]
            };
        };
        ObjectFilter.prototype._saveFilter = function (filterData, filterDesc) {
            var that = this, restrictions = that.savedRestrictions(), editor = new that.SaveFilterEditor(restrictions, filterData, filterDesc);
            that.navigationService.openModal({
                part: editor,
                /*dialogOptions: {
                    header: resources["objectFilter.saveFilter"]
                },*/
                onReturn: function (restrictions) {
                    if (restrictions) {
                        that.savedRestrictions(restrictions);
                        that.trigger("change:savedRestrictions", that, restrictions, restrictions);
                        // TODO: publish acknowledge
                    }
                }
            });
        };
        ObjectFilter.prototype.saveFilter = function () {
            var that = this;
            if (!that.viewModel.uow) {
                return;
            }
            var json = that._toJson(that.viewModel);
            if (!json || lang.isEmptyObject(json)) {
                return;
            }
            // remove empty props
            for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
                var key = _a[_i];
                var v = json[key];
                if (v === undefined || v === null || v === "") {
                    delete json[key];
                }
            }
            if (lang.isEmptyObject(json)) {
                return;
            }
            // create descr with restrictions description
            var filterDescr = [];
            that.pages.forEach(function (page) {
                var summary = that.getPageSummary(page);
                if (summary) {
                    summary.forEach(function (item) {
                        filterDescr.push(item);
                    });
                }
            });
            that._saveFilter(json, filterDescr);
        };
        ObjectFilter.prototype._fromJson = function (viewModel, data) {
            if (viewModel.fromJson) {
                viewModel.fromJson(data, { dirty: true }, { original: false, norollback: true });
            }
        };
        ObjectFilter.prototype._toJson = function (viewModel) {
            // TODO: what if there is no toJson?
            return viewModel.toJson({ nometa: true });
        };
        ObjectFilter.prototype.setViewModel = function (viewModel) {
            if (this.options.emptyRestrictions) {
                this._fromJson(viewModel, this.options.emptyRestrictions);
            }
            _super.prototype.setViewModel.call(this, viewModel);
        };
        ObjectFilter.prototype._setViewModelComplete = function (viewModel) {
            _super.prototype._setViewModelComplete.call(this, viewModel);
            this._emptyRestrictions = this._createEmptyRestrictions();
        };
        ObjectFilter.prototype.isEmpty = function () {
            return lang.isEqual(this._emptyRestrictions, this._toJson(this.viewModel));
        };
        ObjectFilter.prototype.clearRestrictions = function () {
            var that = this;
            if (!that.viewModel) {
                return;
            }
            // set autoValidate to false for each PE to prevent validation when clearing properties
            that.forEachPE(function (pe) {
                pe.autoValidate(false);
            });
            that.viewModel.clear();
            if (that.options.emptyRestrictions) {
                that._fromJson(that.viewModel, that.options.emptyRestrictions);
            }
            // update emptyRestrictions-object as props could change after clear (init:"now")
            that._emptyRestrictions = that._toJson(that.viewModel);
            // remove all violations and restore autoValidate for each PE
            that.violations.clear();
            that.forEachPE(function (pe) {
                pe.violation(null);
                pe.autoValidate(true);
            });
        };
        /**
         * Applying new restrictions - set them as viewModel.
         * @param {Object|Promise|Function} restrictions New restrictions as JSON, or Promise of JSON, or function returning JSON or Promise of JSON
         * @param {string} [source]
         */
        ObjectFilter.prototype.applyRestrictions = function (restrictions, source) {
            var that = this;
            if (that.initializationTask) {
                // initialization hasn't finished yet (it's asynchronous probably)
                lang.when(that.initializationTask).done(function () {
                    that._applyRestrictions(restrictions, source);
                });
            }
            else {
                that._applyRestrictions(restrictions, source);
            }
        };
        ObjectFilter.prototype._applyRestrictions = function (restrictions, source) {
            var that = this, data;
            if (lang.isFunction(restrictions)) {
                data = restrictions.call(that);
            }
            else {
                data = restrictions;
            }
            lang.when(data).done(function (restrictions) {
                that.onApplyRestriction(restrictions, source);
            });
        };
        ObjectFilter.prototype.onApplyRestriction = function (restrictions, source) {
            var res = true;
            if (source === "RestoreSettings") {
                res = this.onRestrictionsRestored(restrictions);
            }
            if (res !== false) {
                this._fromJson(this.viewModel, restrictions);
            }
        };
        ObjectFilter.prototype.onRestrictionsRestored = function (restrictions) {
            var that = this, onRestrictionsRestored = that.options && that.options.onRestrictionsRestored;
            if (onRestrictionsRestored) {
                return onRestrictionsRestored.call(that, restrictions);
            }
            var curJson = that._toJson(that.viewModel);
            // when restoring restrictions from UserSettings they should NOT overwrite current nonempty prop values in VM (WC-1406)
            lang.forEach(restrictions, function (value, prop) {
                var curVal = curJson[prop];
                // but if the value is default value from init facet or emptyRestrictions option
                // then it should be overwritten
                if (curVal !== undefined && curVal !== that._emptyRestrictions[prop]) {
                    delete restrictions[prop];
                }
            });
            return true;
        };
        ObjectFilter.prototype.onSaveRestrictions = function (restrictions) {
            var _this = this;
            // filter non-empty properties
            var json = {};
            lang.forEach(restrictions, function (value, prop) {
                if (value !== undefined && _this._emptyRestrictions[prop] !== value) {
                    json[prop] = value;
                }
            });
            return json;
        };
        ObjectFilter.prototype.getRestrictions = function () {
            var that = this, violations = that.runValidation();
            if (violations && violations.length) {
                var err = new Error(resources["objectFilter.error_get_restrictions"]);
                err.violations = violations;
                throw err;
            }
            // TODO: support nested objects/prop-chains
            var json = that._toJson(that.viewModel);
            var restrictions = that._createRestrictions(json);
            // set observable property 'restrictions' which is bound to userSettings
            that._applyingRestrictions = true;
            json = that.onSaveRestrictions(json) || json;
            that.restrictions(json);
            that._applyingRestrictions = false;
            return restrictions;
        };
        ObjectFilter.prototype._onRestrictionsChange = function (sender, value) {
            var that = this;
            if (!that._applyingRestrictions) {
                if (value) {
                    that.applyRestrictions(value, "RestoreSettings");
                }
                else {
                    that.clearRestrictions();
                }
            }
        };
        ObjectFilter.prototype._createRestrictions = function (json) {
            var that = this, restrictions = {};
            lang.forEach(json, function (v, key) {
                if (v !== undefined && v !== null && v !== "") {
                    that._addRestriction(restrictions, key, v);
                }
            });
            return restrictions;
        };
        ObjectFilter.prototype._createEmptyRestrictions = function () {
            var that = this;
            var viewModel = that.viewModel;
            var emptyJson = that.options.emptyRestrictions;
            if (!viewModel || !viewModel.meta) {
                return emptyJson || {};
            }
            // NOTE: create a new object in the separated UoW
            var uow = that.app.createUnitOfWork({ connected: false });
            var obj = uow.create(viewModel.meta);
            if (emptyJson) {
                that._fromJson(obj, emptyJson);
            }
            var json = that._toJson(obj);
            uow.dispose();
            return json;
        };
        ObjectFilter.prototype._addRestriction = function (restrictions, key, v) {
            var comparer = this.comparers[key], map;
            if (comparer) {
                if (lang.isFunction(comparer)) {
                    map = comparer.call(this, v);
                }
                else if (typeof comparer === "object") {
                    map = comparer;
                }
                else {
                    map = (_a = {},
                        _a[key] = (_b = {},
                            _b[comparer] = v,
                            _b),
                        _a);
                }
            }
            else {
                map = (_c = {},
                    _c[key] = v,
                    _c);
            }
            this._mergeRestrictions(restrictions, map);
            var _a, _b, _c;
        };
        ObjectFilter.prototype._mergeRestrictions = function (objTo, objFrom) {
            for (var _i = 0, _a = Object.keys(objFrom); _i < _a.length; _i++) {
                var key = _a[_i];
                var v = objTo[key];
                if (v) {
                    // equality comparer by default
                    // NOTE: we use isPlainObject instead of isObject, because isObject returns true for Dates
                    //let comp = lang.isObject(v) ? v : { eq: v };
                    var comp = lang.isPlainObject(v) ? v : { eq: v };
                    v = lang.extend(comp, objFrom[key]);
                }
                else {
                    v = objFrom[key];
                }
                objTo[key] = v;
            }
        };
        ObjectFilter.formatFilterDesc = function (desc) {
            if (!desc || !desc.length) {
                return "";
            }
            // let hint = "";
            // desc.forEach(propDesc => {
            // 	if (hint) { hint += "; "; }
            // 	hint += propDesc.title + ": " + propDesc.value;
            // });
            // return hint;
            return desc.map(function (propDesc) { return propDesc.title + ": " + propDesc.value; }).join("; ");
        };
        /**
         * @type {Object}
         * @property {Object} comparers
         * @property {Object} presenterOptions
         * @property {Boolean} savedFilters
         */
        ObjectFilter.defaultOptions = {
            comparers: undefined,
            cssRootClass: "x-editor-base x-editor-filter",
            savedFilters: true,
            onRestrictionsRestored: undefined,
            userSettings: {
                props: {
                    "contextParts": false,
                    "restrictions": true,
                    "savedRestrictions": true
                }
            }
        };
        /**
         * @type {Object}
         */
        ObjectFilter.defaultMenu = {
            items: [
                {
                    name: "ClearFilter",
                    title: resources["objectFilter.clear"],
                    icon: "clear",
                    order: 15
                }, {
                    name: "ManageFilters",
                    title: resources["objectFilter.filters"],
                    icon: "filter",
                    order: 16,
                    // NOTE: getMenu is initialized in runtime, but we must specify some value here:
                    // otherwise this item will be removed in ObjectEditor._initializeMenu
                    getMenu: function () { return ({}); }
                }
            ]
        };
        __decorate([
            lang.decorators.constant("filter")
        ], ObjectFilter.prototype, "contextName");
        __decorate([
            lang.decorators.constant(true)
        ], ObjectFilter.prototype, "canDisplayViolations");
        __decorate([
            lang.decorators.constant(ObjectFilter.defaultMenu)
        ], ObjectFilter.prototype, "defaultMenu");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectFilter.prototype, "restrictions");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectFilter.prototype, "savedRestrictions");
        return ObjectFilter;
    }(ObjectEditor));
    (function (ObjectFilter) {
        var SaveFilterEditor = /** @class */ (function (_super) {
            __extends(SaveFilterEditor, _super);
            /**
             * @constructs SaveFilterEditor
             * @extends ObjectEditor
             * @param restrictions
             * @param filterData
             * @param filterDesc
             */
            function SaveFilterEditor(restrictions, filterData, filterDesc) {
                var _this = this;
                if (!lang.isArray(restrictions)) {
                    restrictions = [];
                }
                var options = SaveFilterEditor.createDefaultOptions(restrictions, filterDesc);
                _this = _super.call(this, options) || this;
                _this.restrictions = restrictions;
                _this.filterData = filterData;
                _this.filterDesc = filterDesc;
                return _this;
            }
            SaveFilterEditor.createDefaultOptions = function (restrictions, filterDesc) {
                if (!lang.isArray(restrictions)) {
                    restrictions = [];
                }
                var viewModel = SaveFilterEditor.createViewModel(restrictions, filterDesc);
                var enumFilters = { name: "filters", vt: "string", members: [] };
                for (var _i = 0, restrictions_1 = restrictions; _i < restrictions_1.length; _i++) {
                    var item = restrictions_1[_i];
                    enumFilters.members.push({ descr: item.title, value: item.title });
                }
                return {
                    title: resources["objectFilter.saveFilter"],
                    pages: [{
                            name: "main",
                            properties: [
                                {
                                    name: "filterDesc",
                                    vt: "string",
                                    descr: resources["objectFilter.saveFilter.currentRestrictions"],
                                    nullable: true,
                                    PropertyEditor: core.ui.peViewOnly
                                }, {
                                    name: "isNew",
                                    vt: "boolean",
                                    presentation: "switch",
                                    nullable: false,
                                    trueTitle: resources["objectFilter.saveFilter.saveAsNew"],
                                    falseTitle: resources["objectFilter.saveFilter.saveAsExisting"],
                                    layout: { noLabel: true }
                                }, {
                                    name: "existingFilter",
                                    vt: "enum",
                                    hidden: true,
                                    descr: resources["objectFilter.saveFilter.existingFilter"],
                                    nullable: true,
                                    ref: enumFilters,
                                    presentation: "select2",
                                    noResultsText: resources["objectFilter.noSavedFilters"],
                                    placeholder: resources["objectFilter.saveFilter.chooseFilter"]
                                }, {
                                    name: "name",
                                    vt: "string",
                                    descr: resources.name,
                                    nullable: true,
                                    maxLength: 512,
                                    hideLetterCounter: true,
                                    menu: { items: [{
                                                name: "CopyRest",
                                                hint: resources["objectFilter.saveFilter.copyCurrentRestrictions"],
                                                icon: "copy",
                                                command: core.createCommand({
                                                    execute: function () {
                                                        viewModel.name(viewModel.filterDesc());
                                                    }
                                                })
                                            }] }
                                }, {
                                    name: "existingFilterDesc",
                                    vt: "string",
                                    hidden: true,
                                    descr: resources["objectFilter.saveFilter.chosenFilterRestrictions"],
                                    nullable: true,
                                    PropertyEditor: core.ui.peViewOnly
                                }
                            ]
                        }],
                    viewModel: viewModel
                    /*presenterOptions: {
                        hideMenu: true,
                        showTitle: false,
                        affixParts: false
                    }*/
                };
            };
            SaveFilterEditor.createViewModel = function (restrictions, filterDesc) {
                var viewModel = lang.observe({
                    filterDesc: ObjectFilter.formatFilterDesc(filterDesc),
                    isNew: true,
                    name: "",
                    existingFilter: "",
                    existingFilterDesc: "",
                    validate: function () {
                        if (this.isNew()) {
                            if (!this.name()) {
                                return resources["objectFilter.saveFilter.empty_name_error"];
                            }
                            var newFilterName_1 = this.name();
                            if (newFilterName_1 && restrictions.some(function (item) { return item.title === newFilterName_1; })) {
                                return {
                                    error: resources["objectFilter.saveFilter.non_unique_error"],
                                    menu: new Menu({
                                        items: [{
                                                title: resources.overwrite,
                                                name: "Overwrite",
                                                command: core.createCommand({
                                                    execute: function () {
                                                        viewModel.isNew(false);
                                                        viewModel.existingFilter(viewModel.name());
                                                    }
                                                })
                                            }]
                                    })
                                };
                            }
                        }
                        else {
                            if (!this.existingFilter()) {
                                return resources["objectFilter.saveFilter.empty_existingFilter_error"];
                            }
                            if (!this.name()) {
                                return resources["objectFilter.saveFilter.empty_name_error"];
                            }
                        }
                    }
                });
                return viewModel;
            };
            SaveFilterEditor.prototype.onSetViewModel = function (viewModel) {
                var that = this;
                viewModel.bind("change:existingFilter", function (obj, val) {
                    if (val) {
                        for (var _i = 0, _a = that.restrictions; _i < _a.length; _i++) {
                            var item = _a[_i];
                            if (item.title === val) {
                                obj.existingFilterDesc(ObjectFilter.formatFilterDesc(item.descr));
                                obj.name(item.title);
                                break;
                            }
                        }
                    }
                    else {
                        obj.existingFilterDesc(null);
                    }
                });
                viewModel.bind("change:isNew", function (obj, val) {
                    that.findPropertyEditor(viewModel, "existingFilter").pe.hidden(val);
                    that.findPropertyEditor(viewModel, "existingFilterDesc").pe.hidden(val);
                });
                return viewModel;
            };
            SaveFilterEditor.prototype.createMenu = function () {
                return new Menu(SaveFilterEditor.defaultMenu);
            };
            SaveFilterEditor.prototype.createCommands = function () {
                var that = this;
                return {
                    Ok: core.createCommand({
                        execute: function () {
                            var violations = that.runValidation();
                            if (!violations || !violations.length) {
                                that.navigationService.close(that.updateRestrictions());
                            }
                        }
                    }),
                    Cancel: core.createCommand({
                        execute: function () {
                            that.navigationService.close();
                        }
                    })
                };
            };
            SaveFilterEditor.prototype.updateRestrictions = function () {
                var that = this, viewModel = that.viewModel;
                if (viewModel.isNew()) {
                    that.restrictions.push({
                        title: viewModel.name(),
                        restrictions: that.filterData,
                        descr: that.filterDesc,
                        created: new Date()
                    });
                }
                else {
                    var title = viewModel.existingFilter();
                    for (var _i = 0, _a = that.restrictions; _i < _a.length; _i++) {
                        var item = _a[_i];
                        if (item.title === title) {
                            item.title = viewModel.name();
                            item.restrictions = that.filterData;
                            item.descr = that.filterDesc;
                            item.updated = new Date();
                            break;
                        }
                    }
                }
                return that.restrictions;
            };
            SaveFilterEditor.defaultMenu = {
                items: [
                    { name: "Ok", title: resources.ok, isDefaultAction: true },
                    { name: "Cancel", title: resources.cancel }
                ]
            };
            return SaveFilterEditor;
        }(ObjectEditor));
        ObjectFilter.SaveFilterEditor = SaveFilterEditor;
    })(ObjectFilter || (ObjectFilter = {}));
    // backward compatibility:
    ObjectFilter.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: ObjectFilter.defaultOptions,
        /** @obsolete use static SaveFilterEditor */
        SaveFilterEditor: ObjectFilter.SaveFilterEditor
    });
    core.ui.ObjectFilter = ObjectFilter;
    return ObjectFilter;
});
//# sourceMappingURL=ObjectFilter.js.map