/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/slick/slick.bootstrap"], function (require, exports, core) {
    "use strict";
    var lang = core.lang;
    var ObservableExpression = lang.support.ObservableExpression;
    /**
     * ObservableExpression which also observes changing of id
     */
    var ObservableExpressionTrackingId = /** @class */ (function (_super) {
        __extends(ObservableExpressionTrackingId, _super);
        function ObservableExpressionTrackingId() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObservableExpressionTrackingId.prototype._track = function (source, args) {
            var tracker = _super.prototype._track.call(this, source, args);
            tracker.observe(source, "id"); //observe changing of id
            return tracker;
        };
        return ObservableExpressionTrackingId;
    }(ObservableExpression));
    var SlickGridDataProvider = /** @class */ (function (_super) {
        __extends(SlickGridDataProvider, _super);
        /**
         * @constructs SlickGridDataProvider
         * @extends Observable
         * @param viewModel
         * @param options
         */
        function SlickGridDataProvider(viewModel, options) {
            var _this = _super.call(this) || this;
            /**
             * Special value that represent loading cell
             */
            _this.loadingValue = lang.support.loadingValue;
            /**
             * Special value that represent an invalid cell
             */
            _this.errorValue = {
                toString: function () { return "Error!"; }
            };
            var that = _this;
            that.viewModel = viewModel; // viewModel with domain objects
            that._items = []; // SlickGridDataItems by viewModel indexes
            that._getters = {};
            that.options = lang.append(options || {}, SlickGridDataProvider.defaultOptions);
            that._groupingInfos = []; // group metadata
            that._groups = []; // group objects
            that._toggledGroupsByLevel = []; // group collapsed flag. usage: _toggledGroupsByLevel[level][groupingKey]
            that._groupingDelimiter = ":|:"; // grouping key delimiter.
            that._rowsById = null; // data row number by id cache
            that._groupRowsById = null; // group title row number by grouping key cache
            that._groupTotalRowsById = null; // group totals row number by grouping key cache
            that._rows = null; // current rows (Contains mix of SlickGridDataItems, group titles rows and group totals).
            // observe metadata changes
            that._getters["__itemMetadata"] = function () {
                return that.options.dataItemMetadataProvider.getItemMetadata(this);
            };
            that._initGetters();
            that.viewModel.items.bind("change", that.onItemsChange, that);
            that.viewModel.selection.bind("change", that.onSelectionChange, that);
            that.viewModel.violations.bind("change", that.onViolationsChange, that);
            return _this;
        }
        SlickGridDataProvider.prototype.dispose = function () {
            var that = this;
            that.invalidate();
            that.viewModel.items.unbind("change", null, that);
            that.viewModel.selection.unbind("change", null, that);
            that.viewModel.violations.unbind("change", null, that);
        };
        SlickGridDataProvider.prototype.invalidate = function () {
            var that = this;
            that._items.forEach(function (item) {
                if (item) {
                    item.dispose();
                }
            });
            that._items.length = 0;
            that.clearRows();
            that._initGetters();
        };
        /**
         * Invalidate an item with the specified index
         * @param viewModelIndex
         * @returns {RowsMap} Rows to refresh
         */
        SlickGridDataProvider.prototype.invalidateItem = function (viewModelIndex) {
            var that = this, item = that._items[viewModelIndex], rows;
            if (item) {
                item.invalidate();
            }
            if (that.isGroupingEnabled()) {
                // groups are possibly changed, clear rows cache
                that.clearRows();
                rows = { all: true };
            }
            else {
                rows = {};
                // no grouping => index in rows is equal to index in items
                rows[viewModelIndex] = true;
            }
            return rows;
        };
        SlickGridDataProvider.prototype._initGetters = function () {
            var that = this;
            var _loop_1 = function (col) {
                if (col.name) {
                    that._getters[col.name] = function () {
                        // NOTE: 'this' is a item of the list here, don't' use lambda
                        return that.viewModel.getCellHtml(this, col);
                    };
                }
            };
            for (var _i = 0, _a = that.viewModel.columns; _i < _a.length; _i++) {
                var col = _a[_i];
                _loop_1(col);
            }
        };
        SlickGridDataProvider.prototype.getLength = function () {
            var that = this;
            //if grouping disabled, just proxy call to viewModel
            if (!that.isGroupingEnabled()) {
                return that.getViewModelLength();
            }
            //else recalc rows and groups if necessary
            that.ensureRows();
            return that._rows.length;
        };
        SlickGridDataProvider.prototype.getItem = function (rowIndex) {
            var that = this;
            //if grouping disabled, just proxy call to viewModel
            if (!that.isGroupingEnabled()) {
                return that.getItemFromViewModel(rowIndex);
            }
            //else recalc rows and groups if necessary and return item
            that.ensureRows();
            return that._rows[rowIndex];
        };
        SlickGridDataProvider.prototype.getItemMetadata = function (rowIndex) {
            var that = this, item = that.getItem(rowIndex);
            if (!item) {
                return {};
            }
            // overrides for grouping rows
            if (item.__group) {
                var getGroupRowMetadata = this._groupingInfos[item.level].getGroupRowMetadata || that.options.groupItemMetadataProvider.getGroupRowMetadata;
                return getGroupRowMetadata.call(that.options.groupItemMetadataProvider, item);
                //return that.options.groupItemMetadataProvider.getGroupRowMetadata(<SlickGroup>item);
            }
            // overrides for totals rows
            if (item.__groupTotals) {
                var getTotalsRowMetadata = this._groupingInfos[item.group.level].getTotalsRowMetadata || that.options.groupItemMetadataProvider.getTotalsRowMetadata;
                return getTotalsRowMetadata.call(that.options.groupItemMetadataProvider, item);
                //return that.options.groupItemMetadataProvider.getTotalsRowMetadata(<SlickGroupTotals>item);
            }
            // NOTE: we're calling "__itemMetadata" getter, which is from that.options.dataItemMetadataProvider.getItemMetadata
            var itemMeta = item.get("__itemMetadata");
            return itemMeta === that.loadingValue ? {} : itemMeta;
        };
        SlickGridDataProvider.prototype.getItemIndex = function (item) {
            var that = this;
            if (!that.isGroupingEnabled()) {
                return that.viewModel.items.indexOf(item.item);
            }
            that.ensureRows();
            if (item.__groupTotals) {
                return that._groupTotalRowsById[item.group.groupingKey];
            }
            if (item.__group) {
                return that._groupRowsById[item.groupingKey];
            }
            return that._rowsById[item.item.id];
        };
        SlickGridDataProvider.prototype.getModelItemIndex = function (viewModelItem) {
            var that = this;
            if (!that.isGroupingEnabled()) {
                return that.viewModel.items.indexOf(viewModelItem);
            }
            that.ensureRows();
            return that._rowsById[viewModelItem.id];
        };
        SlickGridDataProvider.prototype.isItemSelectable = function (rowIndex) {
            var row = this.getItem(rowIndex), item = row && row.item;
            // NOTE: group/totals rows have no item
            return !!(item && this.viewModel.isItemSelectable(item));
        };
        /**
         * Returns the index of the row as if grouping is off.
         * @param rowIndex
         * @returns {number}
         */
        SlickGridDataProvider.prototype.getUngroupedIndex = function (rowIndex) {
            var that = this;
            if (!that.isGroupingEnabled()) {
                return rowIndex;
            }
            that.ensureRows();
            return that._ungroupedRows[rowIndex];
            // NOTE: Groups are sorted themselves, therefore the order of items in viewModel can be different
            // from the order of rows. So the commented code is incorrect.
            //let row = that._rows[rowIndex];
            //return that.viewModel.items.indexOf((<SlickGridDataItem>row).item);
        };
        SlickGridDataProvider.prototype.getGrouping = function () {
            return this._groupingInfos;
        };
        SlickGridDataProvider.prototype.setGrouping = function (groupingInfo) {
            var that = this;
            that._groups = [];
            that._toggledGroupsByLevel = [];
            that.clearRows();
            groupingInfo = groupingInfo || [];
            that._groupingInfos = lang.isArray(groupingInfo) ? groupingInfo : [groupingInfo];
            for (var i = 0; i < that._groupingInfos.length; i++) {
                var gi = that._groupingInfos[i] = lang.extend({}, that.options.defaultGroupOptions, that._groupingInfos[i]);
                gi.getterIsAFn = typeof gi.getter === "function";
                that._toggledGroupsByLevel[i] = {};
            }
            that.invalidate();
        };
        /**
         * @param args Either a Slick.Group's "groupingKey" property, or a
         * variable argument list of grouping values denoting a unique path to the row.  For
         * example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
         * the 'high' setGrouping.
         */
        SlickGridDataProvider.prototype.collapseGroup = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var that = this, arg0 = args[0];
            if (args.length === 1 && arg0.indexOf(that._groupingDelimiter) !== -1) {
                that._toggleGroup(arg0.split(that._groupingDelimiter).length - 1, arg0, true);
            }
            else {
                that._toggleGroup(args.length - 1, args.join(that._groupingDelimiter), true);
            }
        };
        /**
         * @param args Either a Slick.Group's "groupingKey" property, or a
         * variable argument list of grouping values denoting a unique path to the row.  For
         * example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
         * the 'high' setGrouping.
         */
        SlickGridDataProvider.prototype.expandGroup = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var that = this, arg0 = args[0];
            if (args.length === 1 && arg0.indexOf(that._groupingDelimiter) !== -1) {
                that._toggleGroup(arg0.split(that._groupingDelimiter).length - 1, arg0, false);
            }
            else {
                that._toggleGroup(args.length - 1, args.join(that._groupingDelimiter), false);
            }
        };
        SlickGridDataProvider.prototype._extractGroups = function (rows, parentGroup) {
            var that = this, groups = [], groupsByVal = {}, level = parentGroup ? parentGroup.level + 1 : 0, gi = that._groupingInfos[level], comparer = gi.comparer;
            for (var _i = 0, _a = gi.predefinedValues; _i < _a.length; _i++) {
                var val = _a[_i];
                var key = that._getGroupingKey(val), group = groupsByVal[key];
                if (!group) {
                    group = new Slick.Group();
                    group.value = val;
                    group.level = level;
                    group.groupingKey = (parentGroup ? parentGroup.groupingKey + that._groupingDelimiter : "") + key;
                    groups[groups.length] = group;
                    groupsByVal[key] = group;
                }
            }
            for (var _b = 0, rows_1 = rows; _b < rows_1.length; _b++) {
                var r = rows_1[_b];
                var val = that._getGroupingValue(r.item, gi), key = that._getGroupingKey(val), group = groupsByVal[key];
                if (!group) {
                    group = new Slick.Group();
                    group.value = val;
                    group.level = level;
                    group.groupingKey = (parentGroup ? parentGroup.groupingKey + that._groupingDelimiter : "") + key;
                    groups[groups.length] = group;
                    groupsByVal[key] = group;
                }
                group.rows[group.count++] = r;
            }
            if (level < that._groupingInfos.length - 1) {
                for (var _c = 0, groups_1 = groups; _c < groups_1.length; _c++) {
                    var group = groups_1[_c];
                    group.groups = that._extractGroups(group.rows, group);
                }
            }
            if (comparer) {
                groups = lang.sort(groups, comparer);
            }
            return groups;
        };
        SlickGridDataProvider.prototype._getGroupingValue = function (item, gi) {
            return gi.getterIsAFn ?
                gi.getter(item) :
                lang.get(item, gi.getter);
        };
        SlickGridDataProvider.prototype._getGroupingKey = function (val) {
            var key = (val && val.hasOwnProperty("id")) ? val.id : val; //if value - domain object, use id
            return "" + key;
        };
        SlickGridDataProvider.prototype._calculateGroupTotals = function (group) {
            var that = this, gi = that._groupingInfos[group.level], isLeafLevel = (group.level === that._groupingInfos.length), totals = new Slick.GroupTotals(), agg, idx = gi.aggregators.length, rowItemGetter = function (r) { return r.item; };
            while (idx--) {
                agg = gi.aggregators[idx];
                agg.init();
                agg.accumulate((!isLeafLevel && gi.aggregateChildGroups) ? group.groups : group.rows.map(rowItemGetter));
                agg.storeResult(totals);
            }
            totals.group = group;
            group.totals = totals;
        };
        SlickGridDataProvider.prototype._calculateTotals = function (groups, level) {
            if (level === void 0) { level = 0; }
            var that = this, gi = that._groupingInfos[level], idx = groups.length, g;
            while (idx--) {
                g = groups[idx];
                if (g.collapsed && !gi.aggregateCollapsed) {
                    continue;
                }
                // Do a depth-first aggregation so that parent setGrouping aggregators can access subgroup totals.
                if (g.groups) {
                    that._calculateTotals(g.groups, level + 1);
                }
                if (gi.aggregators.length && (gi.aggregateEmpty || g.rows.length || (g.groups && g.groups.length))) {
                    that._calculateGroupTotals(g);
                }
            }
        };
        SlickGridDataProvider.prototype._finalizeGroups = function (groups, level) {
            if (level === void 0) { level = 0; }
            var that = this, gi = that._groupingInfos[level], groupCollapsed = gi.collapsed, toggledGroups = that._toggledGroupsByLevel[level], idx = groups.length, g;
            while (idx--) {
                g = groups[idx];
                g.collapsed = groupCollapsed ^ toggledGroups[g.groupingKey];
                g.title = gi.formatter ? gi.formatter(g) : g.value;
                if (g.groups) {
                    that._finalizeGroups(g.groups, level + 1);
                    // Let the non-leaf setGrouping rows get garbage-collected.
                    // They may have been used by aggregates that go over all of the descendants,
                    // but at this point they are no longer needed.
                    g.rows = [];
                }
            }
        };
        SlickGridDataProvider.prototype._flattenGroupedRows = function (groups, level) {
            if (level === void 0) { level = 0; }
            var that = this, gi = that._groupingInfos[level], groupedRows = [], gl = 0;
            for (var _i = 0, groups_2 = groups; _i < groups_2.length; _i++) {
                var g = groups_2[_i];
                groupedRows[gl++] = g;
                if (!g.collapsed) {
                    var rows = g.groups ? that._flattenGroupedRows(g.groups, level + 1) : g.rows;
                    for (var _a = 0, rows_2 = rows; _a < rows_2.length; _a++) {
                        var r = rows_2[_a];
                        groupedRows[gl++] = r;
                    }
                }
                if (g.totals && gi.displayTotalsRow && (!g.collapsed || gi.aggregateCollapsed)) {
                    groupedRows[gl++] = g.totals;
                }
            }
            if (groups.length === 1 && groups[0].value === undefined) {
                // there is the only one unnamed group - hide it
                groupedRows = groupedRows.slice(1);
            }
            return groupedRows;
        };
        SlickGridDataProvider.prototype.getItemFromViewModel = function (viewModelIndex) {
            var that = this, viewModelItem, item = that._items[viewModelIndex];
            if (!item) {
                viewModelItem = that.viewModel.items.get(viewModelIndex);
                item = new SlickGridDataProvider.SlickGridDataItem(viewModelItem, that._getters, {
                    onchange: function () { that.onItemChange(viewModelIndex); },
                    loadingValue: that.loadingValue,
                    errorValue: that.errorValue
                }, 
                // NOTE: If grouping is enable, id of the item is used in _rowsById dictionary.
                // When id changes, onItemChange callback should be called to reset _rowsById.
                // So we must observe changing of id also - specify `trackId` flag
                that.isGroupingEnabled());
                that._items[viewModelIndex] = item;
            }
            return item;
        };
        SlickGridDataProvider.prototype.getViewModelLength = function () {
            return this.viewModel.items.count();
        };
        SlickGridDataProvider.prototype._toggleGroup = function (level, groupingKey, collapse) {
            var that = this, row = that._groupRowsById[groupingKey];
            that._toggledGroupsByLevel[level][groupingKey] = that._groupingInfos[level].collapsed ^ collapse;
            that.trigger("group.collapsing", that, {
                row: row,
                group: that._rows[row],
                collapse: collapse
            });
            that.invalidate();
            that.notifyRowsChanged();
        };
        SlickGridDataProvider.prototype.isGroupingEnabled = function () {
            return !!this._groupingInfos.length;
        };
        SlickGridDataProvider.prototype.onItemChange = function (viewModelIndex) {
            var rows = this.invalidateItem(viewModelIndex);
            this.notifyRowsChanged(rows);
        };
        SlickGridDataProvider.prototype.onItemsChange = function () {
            this.invalidate();
            this.notifyRowsChanged();
        };
        SlickGridDataProvider.prototype.onSelectionChange = function (sender, args) {
            var that = this;
            if (!that.isGroupingEnabled()) {
                return;
            }
            if (args && args.added) {
                that.ensureRows();
                // expand groups to ensure selected items are visible
                var expanded = void 0;
                for (var _i = 0, _a = args.added; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (that._rowsById[item.id] >= 0) {
                        continue;
                    } // row is already expanded
                    var level = 0, groupKey = "";
                    for (var _b = 0, _c = that._groupingInfos; _b < _c.length; _b++) {
                        var gi = _c[_b];
                        var val = that._getGroupingValue(item, gi), key = that._getGroupingKey(val);
                        if (groupKey) {
                            groupKey += that._groupingDelimiter;
                        }
                        groupKey += key;
                        that._toggledGroupsByLevel[level][groupKey] = that._groupingInfos[level].collapsed ^ 0;
                        level++;
                    }
                    expanded = true;
                }
                // invalide rows (only if at least one group was expanded)
                if (expanded) {
                    that.invalidate();
                    that.notifyRowsChanged();
                }
            }
        };
        SlickGridDataProvider.prototype.onViolationsChange = function (sender, args) {
            var _this = this;
            var violations = [];
            if (args) {
                if (args.added) {
                    violations = violations.concat(args.added);
                }
                if (args.removed) {
                    violations = violations.concat(args.removed);
                }
            }
            // invalidate rows to update metadata
            var rows = {};
            violations.forEach(function (violation) {
                if (!violation.object) {
                    return;
                }
                var row = _this.getModelItemIndex(violation.object);
                if (row >= 0 && !rows[row]) {
                    rows[row] = true;
                    var dataItem = _this.getItem(row);
                    if (lang.isFunction(dataItem.invalidate)) {
                        dataItem.invalidate();
                    }
                }
            });
            if (!lang.isEmpty(rows)) {
                this.notifyRowsChanged(rows);
            }
        };
        SlickGridDataProvider.prototype.clearRows = function () {
            var that = this;
            //clear indexes
            that._ungroupedRows = null;
            that._rowsById = null;
            that._groupRowsById = null;
            that._groupTotalRowsById = null;
            //and rows
            that._rows = null;
        };
        SlickGridDataProvider.prototype.ensureRows = function () {
            var that = this, dataRows;
            if (that._rows) {
                return;
            }
            //getting items
            dataRows = [];
            for (var i = 0, l = that.getViewModelLength(); i < l; i++) {
                dataRows.push(that.getItemFromViewModel(i));
            }
            // clear caches and indexes
            that.clearRows();
            // clear and recreate groups
            that._groups = [];
            if (that._groupingInfos.length) {
                that._groups = that._extractGroups(dataRows);
                if (that._groups.length) {
                    that._calculateTotals(that._groups);
                    that._finalizeGroups(that._groups);
                    that._rows = that._flattenGroupedRows(that._groups);
                }
            }
            that._rows = that._rows || dataRows;
            // build cache
            that._rowsById = {};
            that._groupRowsById = {};
            that._groupTotalRowsById = {};
            that._ungroupedRows = [];
            for (var i = 0, l = that._rows.length, n = 0; i < l; i++) {
                var row = that._rows[i];
                if (row.__groupTotals) {
                    that._groupTotalRowsById[row.group.groupingKey] = i;
                }
                else if (row.__group) {
                    that._groupRowsById[row.groupingKey] = i;
                    if (row.collapsed) {
                        n += row.count;
                    }
                }
                else {
                    that._rowsById[row.item.id] = i;
                    that._ungroupedRows[i] = n++;
                }
            }
        };
        SlickGridDataProvider.prototype.notifyRowsChanged = function (rows) {
            var that = this;
            // NOTE: if grouping is enabled all rows should be updated
            if (!rows || that.isGroupingEnabled()) {
                rows = { all: true };
            }
            that.trigger("rows.change", that, { rows: rows });
        };
        SlickGridDataProvider.defaultOptions = {
            dataItemMetadataProvider: undefined,
            groupItemMetadataProvider: undefined,
            defaultGroupOptions: {} //see SlickObjectListDataPresenter.defaultGroupOptions
        };
        return SlickGridDataProvider;
    }(lang.Observable));
    (function (SlickGridDataProvider) {
        var SlickGridDataItem = /** @class */ (function () {
            /**
             * @constructs SlickGridDataItem
             * @param item
             * @param getters
             * @param exprOptions
             * @param {Boolean} [trackId] Observe changing of id also
             */
            function SlickGridDataItem(item, getters, exprOptions, trackId) {
                var that = this;
                that.item = item;
                if (lang.support.isNotLoaded(that.item)) {
                    // NOTE: после загрузки может поменяться исходный объект
                    that.item.load().done(function (loadedObj) {
                        that.item = loadedObj;
                    });
                }
                // create an observable expression, which calculates values of all getters
                // NOTE: we're using class ObservableExpression directly to speed up
                var func = function SlickGridDataItemFunc() {
                    var caller = this, values = {};
                    lang.forEach(getters, function (getter, prop) {
                        try {
                            values[prop] = getter.call(caller);
                        }
                        catch (ex) {
                            values[prop] = exprOptions.errorValue;
                        }
                    });
                    return values;
                };
                that._expr = !trackId ?
                    new ObservableExpression(func, exprOptions) :
                    new ObservableExpressionTrackingId(func, exprOptions);
                that._loadingValue = exprOptions.loadingValue;
            }
            SlickGridDataItem.prototype.dispose = function () {
                var that = this;
                that.invalidate();
                that._expr.dispose();
                that._expr = undefined;
            };
            SlickGridDataItem.prototype.invalidate = function () {
                this._vals = undefined;
            };
            SlickGridDataItem.prototype.get = function (prop) {
                var that = this, values = that._vals;
                if (!values) {
                    values = that._vals = that._expr.evaluate(that.item);
                }
                return values === that._loadingValue ? that._loadingValue : values[prop];
            };
            return SlickGridDataItem;
        }());
        SlickGridDataProvider.SlickGridDataItem = SlickGridDataItem;
    })(SlickGridDataProvider || (SlickGridDataProvider = {}));
    // Backward compatibility
    SlickGridDataProvider.mixin({ defaultOptions: SlickGridDataProvider.defaultOptions });
    return SlickGridDataProvider;
});
//# sourceMappingURL=SlickGridDataProvider.js.map