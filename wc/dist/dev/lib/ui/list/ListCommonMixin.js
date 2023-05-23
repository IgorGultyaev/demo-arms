/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "lib/utils/ObservableCollectionView", "xhtmpl!lib/ui/templates/ObjectListSettings.hbs", "lib/formatters", "lib/validation", "i18n!lib/nls/resources", "lib/ui/Dialog", "./.list.types"], function (require, exports, core, View, ObservableCollectionView, settingsTemplate, formatters, validation, resources, Dialog, _list_types_1) {
    "use strict";
    exports.__esModule = true;
    //import "vendor/twemoji/twemoji";
    //import "xcss!vendor/twemoji/twemoji-awesome";
    var lang = core.lang;
    var ListColumnsSettings = /** @class */ (function (_super) {
        __extends(ListColumnsSettings, _super);
        /**
         * @constructs ListColumnsSettings
         * @extends Observable
         */
        function ListColumnsSettings(list, options) {
            var _this = _super.call(this) || this;
            options = lang.appendEx(options || {}, ListColumnsSettings.defaultOptions, { deep: true });
            var that = _this;
            that.columns = list.columns
                .filter(function (col) { return options.ignoreRoles ? !options.ignoreRoles[col.role] : true; })
                .map(function (col) { return lang.Observable.construct({
                name: col.name,
                title: col.title || col.name || "#",
                visible: !col.hidden
            }); });
            var hasHidden = that.columns.some(function (col) { return !col.visible(); });
            that.groupChecked(!hasHidden);
            that.bind("change:groupChecked", that._onGroupCheckedChange, that);
            return _this;
        }
        ListColumnsSettings.prototype._onGroupCheckedChange = function (sender, value) {
            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                var col = _a[_i];
                col.visible(value);
            }
        };
        ListColumnsSettings.defaultOptions = {
            ignoreRoles: {
                checkbox: true,
                reorder: true
            },
            dialogOptions: undefined,
            columnSettings: undefined,
            template: undefined
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ListColumnsSettings.prototype, "groupChecked");
        return ListColumnsSettings;
    }(lang.Observable));
    exports.ListColumnsSettings = ListColumnsSettings;
    function defaultFormatter(v, col) {
        var text = v == null ? "" : v.toString(); // undefined == null, don't use ===
        return formatters.textAsHtml(text, col.whitespaces);
    }
    /**
     * Mixin with common methods for List and peObjectList.
     */
    var ListCommonMixin = /** @class */ (function () {
        function ListCommonMixin() {
        }
        /**
         * Returns HTML of the cell
         * @param {*} item
         * @param {ObjectListColumn} col
         * @returns {any}
         */
        ListCommonMixin.prototype.getCellHtml = function (item, col) {
            var v = col.getter ? col.getter.call(item, col) : undefined;
            if (col.html !== false && col.formatterHtml) {
                return col.formatterHtml.call(item, v, col);
            }
            var formatter = col.formatter || defaultFormatter;
            var res = formatter.call(item, v, col);
            // возвращать результат formatter'a как есть небезопасно (XSS)!
            // Т.к. разработчик мог забыть encode, а в значении свойтва содеражиться код.
            // Возвращаем html только, если задан formatterHtml, либо formatter вернул SafeHtml.
            if (col.html !== false && formatters.isHtml(res)) {
                return res.toHTML();
            }
            if (col.html) {
                return res;
            }
            if (col.role === "data" || col.role === "aux") {
                return lang.encodeHtml(res);
            }
            return res;
        };
        /**
         * Initialize common properties: items and selection
         * Called by List and peObjectList in constructors.
         * @protected
         */
        ListCommonMixin.prototype._initializeProps = function () {
            var that = this;
            that.items = new ObservableCollectionView();
            that.selection = new lang.ObservableCollection();
            that.violations = new lang.ObservableCollection();
            // when removing an item, remove it from selection also
            if (!that.options.persistentSelection) {
                that.items.bind("change", function (sender, ea) {
                    if (ea && ea.removed && ea.removed.length) {
                        that.selection.remove(ea.removed);
                    }
                });
                // when changing `where` filter, apply it to the selection
                that.items.bind("change:where", function (sender, predicate) {
                    var selected = that.selection.all().filter(predicate);
                    that.selection.reset(selected);
                });
            }
            if (that.options.where) {
                that.items.where(that.options.where);
            }
            // NOTE: Option `orderBy` should be used after an initialization of `columns`.
            // This option will be used in `setupColumns`, don't use here
        };
        /**
         * Common logic for _initializeColumns implementations.
         * Method should be used only once (during initialization).
         * For updating columns in runtime use `updateColumns`.
         * @param {ObjectListColumn[]} columns
         */
        ListCommonMixin.prototype.setupColumns = function (columns) {
            var that = this, unnamedCountersByRole = {};
            columns = that._prepareColumns(columns);
            // set #{role} as a name for unnamed columns (e.g. #checkbox, #order, #data, #data2)
            for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                var col = columns_1[_i];
                if (!col.name) {
                    var n = unnamedCountersByRole[col.role] || 0;
                    unnamedCountersByRole[col.role] = ++n;
                    col.name = "#" + col.role;
                    if (n > 1) {
                        col.name += n;
                    }
                }
            }
            that.set("columns", columns);
            // init client sorting, orderBy should make client sorting (not server) and init orderedBy
            if (that.options.orderBy) {
                that.orderBy(that.options.orderBy);
            }
            if (that.userSettings) {
                that.userSettings.bind("init:columns", that._onColumnsInit, that);
            }
            that.bind("change:columns", that._onColumnsChanged, that);
        };
        ListCommonMixin.prototype._onColumnsChanged = function (sender, columns) {
            var that = this;
            if (that.userSettings && !that.userSettings.suppressEvents) {
                var userColumns = columns.map(function (col) { return ({
                    name: col.name,
                    width: col.width,
                    hidden: col.hidden,
                    order: col.order
                }); });
                that.userSettings.set("columns", userColumns);
            }
            if (that.onColumnsChanged) {
                that.onColumnsChanged(columns);
            }
        };
        ListCommonMixin.prototype._onColumnsInit = function (columns) {
            var that = this;
            if (columns) {
                // if current list columns differ from cached columns from userSettings
                // then we won't restore settings
                if (that._areColumnsChanged(columns)) {
                    // reset cached
                    that.userSettings.set("columns", undefined);
                }
                else {
                    // cached -> actual
                    that.updateColumns(columns);
                }
            }
        };
        ListCommonMixin.prototype._areColumnsChanged = function (columns) {
            var that = this, namesNew = that.columns.map(function (col) { return col.name; }), namesOld = columns.map(function (col) { return col.name; });
            if (namesNew.length !== namesOld.length) {
                return true;
            }
            namesNew = lang.sort(namesNew);
            namesOld = lang.sort(namesOld);
            for (var i = 0; i < namesNew.length; i++) {
                if (namesNew[i] !== namesOld[i]) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Updates current columns with data from specified columns.
         * @param {ObjectListColumn[]} columns
         * @param {Object} [options]
         * @param {Boolean} [options.onlyExisting] true: update only existing columns without adding
         */
        ListCommonMixin.prototype.updateColumns = function (columns, options) {
            var that = this, newColumns = lang.clone(that.columns), onlyExisting = options && options.onlyExisting;
            var _loop_1 = function (col) {
                if (!col.name) {
                    return "continue";
                } // ignore unnamed columns
                var index = lang.findIndex(newColumns, function (c) { return c.name === col.name; }), newCol = void 0;
                if (index >= 0) {
                    // updating an existing column
                    newCol = lang.extend({}, newColumns[index], col);
                    newColumns[index] = newCol;
                }
                else if (!onlyExisting) {
                    // adding a new column
                    newCol = that._initializeColumn ? that._initializeColumn(col) : col;
                    newColumns.push(newCol);
                }
            };
            // merge columns
            for (var _i = 0, columns_2 = columns; _i < columns_2.length; _i++) {
                var col = columns_2[_i];
                _loop_1(col);
            }
            newColumns = that._prepareColumns(newColumns);
            that.set("columns", newColumns);
        };
        /**
         * Rearrage columns by order, normalize some props (title, role)
         * @param {ObjectListColumn[]} columns
         * @return {ObjectListColumn[]}
         * @private
         */
        ListCommonMixin.prototype._prepareColumns = function (columns) {
            var that = this;
            columns = lang.sortBy(columns, function (col) { return col.order || 0; });
            for (var _i = 0, columns_3 = columns; _i < columns_3.length; _i++) {
                var col = columns_3[_i];
                col.role = col.role || (col.command ? "command" : "data");
                // append default values for the role
                var defaults = lang.unlazy(that.roleDefaults[col.role]);
                col = lang.append(col, defaults);
                col.title = col.title || resources["objectList.columns." + col.role] || col.name;
                col.getter = col.getter || lang.noop; // getter is required
            }
            return columns;
        };
        /**
         * Restore columns as they would be without applying user settings.
         */
        ListCommonMixin.prototype.resetColumns = function () {
            var that = this;
            if (that.userSettings) {
                that.userSettings.unbind("init:columns", null, that);
            }
            that.unbind("change:columns", null, that);
            that._initializeColumns();
            if (that.userSettings) {
                that.userSettings.set("columns", undefined);
            }
            if (that.onColumnsChanged) {
                that.onColumnsChanged(that.get("columns"));
            }
        };
        ListCommonMixin.prototype.isColumnSortable = function (column) {
            return true;
        };
        ListCommonMixin.prototype.orderedBy = function () {
            return this._orderedBy;
        };
        ListCommonMixin.prototype.setOrderedBy = function (orderBy) {
            var that = this;
            var _orderedBy = that._orderedBy;
            if (_orderedBy === orderBy || !_orderedBy && !orderBy) {
                return;
            }
            var changed = false;
            if (!_orderedBy !== !orderBy || _orderedBy.length !== orderBy.length) {
                changed = true;
            }
            else {
                for (var i = 0; i < orderBy.length; ++i) {
                    var left = _orderedBy[i];
                    var right = orderBy[i];
                    if (left.prop !== right.prop || !left.desc !== !right.desc) {
                        changed = true;
                        break;
                    }
                }
            }
            that._orderedBy = orderBy;
            // report to presenter to update columns sorting icons
            if (changed) {
                that.changed("columns");
            }
        };
        ListCommonMixin.prototype.orderBy = function (columns) {
            var _this = this;
            var parsed = this.items.parseOrderBy(columns);
            // NOTE: так как входные данные для parseOrderBy были строки, то в выходных элементах будут только
            // поля `prop` и `desc` (и не будет `getter` и `comparer`)
            var orderBy = parsed.map(function (item) {
                var col = lang.find(_this.columns, function (c) { return c.name === item.prop; });
                return !col ? item : {
                    prop: col.orderByProp || col.prop,
                    // don't use getter when `orderByProp` is specified
                    getter: col.orderByProp ? undefined : function () {
                        // NOTE: don't use lambda, this is another context here
                        return col.getter.call(this, col);
                    },
                    comparer: col.comparer,
                    desc: item.desc
                };
            });
            this.items.orderBy(orderBy);
            this.setOrderedBy(parsed);
        };
        ListCommonMixin.prototype.createColumnsSettings = function () {
            var that = this;
            var options = that.options.commandsOptions["Customize"];
            return (options && options.columnSettings && options.columnSettings.call(that))
                || new ListColumnsSettings(that, options);
        };
        /**
         * Open Dialog for customizing columns
         */
        ListCommonMixin.prototype.doCustomize = function () {
            var that = this;
            var commandsOptions = that.options.commandsOptions["Customize"] || {};
            var options = lang.extend({}, commandsOptions.dialogOptions || {});
            if (!options.body) {
                options.body = new View({
                    template: commandsOptions.template || settingsTemplate,
                    viewModel: that.createColumnsSettings()
                });
            }
            var dialogOptions = lang.appendEx(options, {
                header: resources["objectList.columnsSettings.header"],
                menu: {
                    update: [
                        {
                            command: core.createCommand({
                                execute: function (args) {
                                    args.dialog.close();
                                    that.resetColumns();
                                }
                            }),
                            name: "Reset",
                            hint: resources["objectList.columnsSettings.reset.hint"],
                            title: resources["objectList.columnsSettings.reset"]
                        }, {
                            command: core.createCommand({
                                execute: function (args) {
                                    args.dialog.close();
                                    that.orderBy([]);
                                },
                                canExecute: function () {
                                    var orderBy = that.items.orderBy();
                                    return !!(orderBy && orderBy.length);
                                }
                            }),
                            name: "RemoveSorting",
                            title: resources["objectList.columnsSettings.removeSorting"]
                        }
                    ]
                }
            }, { deep: true });
            var dialog = Dialog.create(dialogOptions);
            var dialogBodyViewModel = dialog.body().viewModel;
            dialog.open().then(function (result) {
                if (result !== "ok") {
                    return;
                }
                if (dialogBodyViewModel && dialogBodyViewModel.columns) {
                    var columns = dialogBodyViewModel.columns.map(function (col) {
                        return {
                            name: col.name(),
                            hidden: !col.visible()
                        };
                    });
                    that.updateColumns(columns);
                }
            });
        };
        ListCommonMixin.prototype.canChangeRowHeight = function () {
            var presenter = this.presenter;
            if (!presenter || !presenter.dataPresenter) {
                return false;
            }
            return this.state() === _list_types_1.ObjectListState.loaded;
        };
        ListCommonMixin.prototype.doIncreaseRowHeight = function () {
            var presenter = this.presenter;
            if (!presenter || !presenter.dataPresenter) {
                return;
            }
            presenter.dataPresenter.changeRowHeight(true);
        };
        ListCommonMixin.prototype.doDecreaseRowHeight = function () {
            var presenter = this.presenter;
            if (!presenter || !presenter.dataPresenter) {
                return;
            }
            presenter.dataPresenter.changeRowHeight(false);
        };
        ListCommonMixin.prototype.canCustomize = function () {
            return true;
        };
        /**
         * Checks if the node can be selected
         * @param item
         * @returns {boolean}
         */
        ListCommonMixin.prototype.isItemSelectable = function (item) {
            var that = this, filter = that.options.selectionFilter;
            return !!lang.coalesce(filter && filter(that, item), that._isItemSelectable(item));
        };
        /**
         * Checks if the node can be selected by default (w/o option selectionFilter)
         * @param item
         * @returns {boolean}
         */
        ListCommonMixin.prototype._isItemSelectable = function (item) {
            return true;
        };
        /**
         * Try to select items taking into account selectionFilter and logic from overrides (isItemSelectable)
         * @param items Items to be selected
         */
        ListCommonMixin.prototype.setSelection = function (items) {
            var that = this;
            items = items.filter(that.isItemSelectable, that);
            that.selection.reset(items);
        };
        ListCommonMixin.prototype.doSelectAll = function () {
            // NOTE: SelectAll selects (reset) all items bypassing any filters ('where')
            this.setSelection(this.items.source().all());
        };
        ListCommonMixin.prototype.canSelectAll = function () {
            if (this.options.selectionMode === "single")
                return false;
            // NOTE: to make accessing field observable we're doing it via `get` (with explicit firing events)
            // SelectAll available when there're not selected rows
            return this.get("selection").count() < this.get("items").source().count();
        };
        ListCommonMixin.prototype.doSelectNone = function () {
            this.selection.clear();
        };
        ListCommonMixin.prototype.canSelectNone = function () {
            if (this.options.selectionMode === "single")
                return false;
            return this.get("selection").count() > 0;
        };
        /**
         * Returns an array of selected items (if any) or an array with single activeItem (if any).
         * If there are no selected and active items, returns an empty array;
         * @returns {Array}
         */
        ListCommonMixin.prototype.currentItems = function () {
            var that = this;
            // NOTE: use this.get("selection") instead of this.selection for triggering 'get' event
            var selection = that.get("selection");
            // NOTE: it's important to touch `activeItem` before return to observe it
            var activeItem = that.activeItem();
            if (selection.count()) {
                return selection.all().filter(that.isItemSelectable, that);
            }
            if (activeItem && that.isItemSelectable(activeItem)) {
                return [activeItem];
            }
            return [];
        };
        ListCommonMixin.prototype.shouldValidateItems = function () {
            var validateItems = this.options.validateItems;
            return validateItems && validateItems !== "never";
        };
        ListCommonMixin.prototype.shouldValidateItem = function (item) {
            return false;
        };
        ListCommonMixin.prototype.validateItem = function (item) {
            var violations = validation.validateObjectWithProps(item), itemRules = this.options.itemRules;
            if (itemRules) {
                for (var _i = 0, itemRules_1 = itemRules; _i < itemRules_1.length; _i++) {
                    var rule = itemRules_1[_i];
                    var error = rule.validate(item);
                    if (error) {
                        var violation = validation.createViolation(error, item);
                        violations = validation.appendViolation(violation, violations);
                    }
                }
            }
            return violations;
        };
        ListCommonMixin.prototype.runItemsValidation = function (items) {
            if (!this.shouldValidateItems()) {
                return [];
            }
            var that = this, 
            //itemArray: T[]|lang.IObservableCollection<T> = items ? lang.array(items) : that.items,
            itemArray = items ? lang.array(items) : that.items, violations = [];
            itemArray.forEach(function (item) {
                if (that.shouldValidateItem(item)) {
                    var itemViolations = that.validateItem(item);
                    validation.appendViolation(itemViolations, violations);
                }
            });
            if (!items) {
                // validate all items - just reset violations collection
                that.violations.reset(violations);
            }
            else {
                // validate specified items - remove old violations with the same objects and then add new violations
                var removing_1 = [];
                if (items && that.violations.count()) {
                    that.violations.forEach(function (violation) {
                        if (violation.object && itemArray.indexOf(violation.object) >= 0) {
                            removing_1.push(violation);
                        }
                    });
                }
                // TODO: хорошо бы делать remove и add за одну операцию, чтобы событие change генерилось только один раз
                that.violations.remove(removing_1);
                that.violations.add(violations);
            }
            return violations;
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ListCommonMixin.prototype, "state");
        __decorate([
            lang.decorators.observableAccessor()
        ], ListCommonMixin.prototype, "stateMessage");
        __decorate([
            lang.decorators.observableAccessor()
        ], ListCommonMixin.prototype, "activeItem");
        return ListCommonMixin;
    }());
    exports.ListCommonMixin = ListCommonMixin;
    /**
     * @enum {String}
     */
    ListCommonMixin.prototype.states = _list_types_1.ObjectListState;
    // NOTE: getter/formatter will be used only if it's not specified in column's options (by an app dev)
    ListCommonMixin.prototype.roleDefaults = {
        data: {
            getter: function (col) {
                return lang.get(this, col.prop);
            },
            formatter: function (v, col) {
                var text;
                try {
                    var propMeta = (this.getPropMeta && col.prop) ?
                        this.getPropMeta(col.prop) :
                        { vt: col.vt };
                    // NOTE: formatPropValue принимает FormatOptions, состоящий из vt,formatter,formatterHtml,html.
                    // formatterHtml мы обработали в getCellHtml, но может быть задана одна опция html:true (и нет formatter/formatterHtml),
                    // в этом случае надо использовать getDefaultFormatterHtml (внутри formatPropValue это сделать нельзя, т.к. и
                    if (col.html) {
                        var metaFormatter = formatters.getDefaultFormatterHtml(propMeta);
                        if (lang.isFunction(metaFormatter)) {
                            // явно заданный html-форматтер для свойства
                            return formatters.safeHtml(metaFormatter(propMeta, v), v);
                        }
                    }
                    text = formatters.formatPropValue(propMeta, v);
                }
                catch (ex) {
                    // ignore any exceptions and return the result of toString() method below
                }
                if (text === undefined) {
                    text = v == null ? "" : v.toString(); // undefined == null, don't use ===
                }
                // NOTE: there's no html-encoding here because it will be done later in getCellHtml
                return text;
                // WAS before 1.30: return formatters.textAsHtml(text, col.whitespaces);
            }
        },
        command: {
            formatter: function (v, col) {
                return "<a href='#' class='x-cmd-link' tabIndex='-1'>" + lang.encodeHtml(col.title || col.name) + "</a>";
            }
        },
        aux: {
            getter: function (col) {
                var aux = this.aux;
                if (aux) {
                    return aux[col.prop || col.name];
                }
            },
            formatter: function (v, col) {
                var text = formatters.formatPropValue({ vt: col.vt }, v).toString();
                return formatters.textAsHtml(text, col.whitespaces);
            }
        },
        // NOTE: core.ui.iconProvider isn't set here, so we use a factory function instead of static value
        icon: function () {
            var iconProvider = core.ui.iconProvider;
            return !iconProvider ? undefined : {
                title: iconProvider.getIcon("picture"),
                errorHtml: iconProvider.getIcon("error", { title: resources["objectList.dataError"] }),
                loadingHtml: iconProvider.getIcon("loading", { title: resources.loading }),
                getter: function () {
                    return iconProvider.getObjectIconName(this);
                },
                formatter: function (v) {
                    return iconProvider.getIcon(v);
                }
            };
        }
    };
    exports["default"] = ListCommonMixin;
});
/**
 * @callback ObjectListColumnGetter
 * @this {Object} List item
 * @param {ObjectListColumn} col Metadata of a column
 * @returns {*} Typed value of a column
 */
/**
 * @callback ObjectListColumnFormatter
 * @this {Object} List item
 * @param {*} v Typed value of a column (returned by 'getter' callback or 'prop' value)
 * @param {ObjectListColumn} col Metadata of a column
 * @returns {String} Formatted value of a column
 */
/**
 * @callback ObjectListColumnComparer
 * @param {*} v1 Typed value of a column for first comparing item (returned by 'getter' callback or 'prop' value)
 * @param {*} v2 Typed value of a column for second comparing item (returned by 'getter' callback or 'prop' value)
 * @returns {Number} -1 if v1 less than v2, 1 if v1 greater than v2 and 0 if the values are equal
 */
/**
 * @typedef {Object} ObjectListColumn
 * @property {String} [name]
 * @property {String} [prop]
 * @property {String} [title]
 * @property {String} [role]
 * @property {ObjectListColumnGetter} [getter]
 * @property {ObjectListColumnFormatter} [formatter]
 * @property {ObjectListColumnComparer} [comparer]
 * @property {Number} [width]
 * @property {Boolean} [hidden]
 * @property {Number} [order]
 */
//# sourceMappingURL=ListCommonMixin.js.map