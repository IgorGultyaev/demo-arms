/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.jquery", "core", "lib/ui/slick/SlickObjectListDataPresenter", "i18n!lib/nls/resources", "lib/ui/Popup"], function (require, exports, $, core, SlickObjectListDataPresenter, resources) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    //region filter parts
    var ColumnFilterCondition = /** @class */ (function () {
        function ColumnFilterCondition() {
        }
        ColumnFilterCondition.Enum = {
            descr: resources["condition.title"],
            vt: "string",
            nullable: false,
            members: {
                "eq": { value: "eq", descr: resources["condition.eq"] },
                "ne": { value: "ne", descr: resources["condition.ne"] },
                "contains": { value: "contains", descr: resources["condition.contains"] },
                "starts": { value: "starts", descr: resources["condition.starts"] },
                "ends": { value: "ends", descr: resources["condition.ends"] },
                "not-contains": { value: "not-contains", descr: resources["condition.not-contains"] },
                "not-starts": { value: "not-starts", descr: resources["condition.not-starts"] },
                "not-ends": { value: "not-ends", descr: resources["condition.not-ends"] },
                "null": { value: "null", descr: resources["condition.null"] },
                "not-null": { value: "not-null", descr: resources["condition.not-null"] },
                // for flags
                "all": { value: "all", descr: resources["condition.all"] },
                "not-all": { value: "not-all", descr: resources["condition.not-all"] }
            }
        };
        return ColumnFilterCondition;
    }());
    exports.ColumnFilterCondition = ColumnFilterCondition;
    var SlickColumnFilterBase = /** @class */ (function (_super) {
        __extends(SlickColumnFilterBase, _super);
        /**
         * @constructs SlickColumnFilterBase
         * @extends Part
         * @param options
         * @param {ObjectListColumn} options.column
         */
        function SlickColumnFilterBase(isServerFilter, options) {
            var _this = this;
            options = SlickColumnFilterBase.mixOptions(options, SlickColumnFilterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.column = _this.options.column;
            _this.isServerFilter = isServerFilter;
            return _this;
        }
        SlickColumnFilterBase.prototype.tweakOptions = function (options) {
            var pe = options.pe;
            // ensure vt is initialized
            if (!pe.vt || pe.vt === "object") {
                pe.vt = "string";
            }
            // column filters are always nullable
            pe.nullable = true;
            // facets (e.g. minLen) should not be applied to column filters, turn validation rules off
            pe.rules = [];
            _super.prototype.tweakOptions.call(this, options);
        };
        SlickColumnFilterBase.prototype._triggerFilterChanged = function () {
            this.trigger(this.events.FILTER_CHANGED, this);
        };
        SlickColumnFilterBase.prototype._createPE = function (options, viewModel) {
            options = lang.append(options || {}, this.options.pe);
            return core.ui.PropertyEditor.DefaultMapping.create(options, viewModel || this);
        };
        // ISlickColumnFilterPersist API
        SlickColumnFilterBase.prototype.paramName = function () {
            return this.options.paramName || this.column.prop;
        };
        SlickColumnFilterBase.prototype.canRenderCondition = function () {
            return this.isServerFilter && !this.options.rawValue;
        };
        SlickColumnFilterBase.prototype.renderCondition = function (domElement) {
            var that = this;
            if (!that.canRenderCondition())
                return;
            var opts = lang.extend({
                name: "condition",
                vt: "enum",
                ref: ColumnFilterCondition.Enum,
                nullable: false,
                placeholder: resources["condition.title"],
                dropDownCssClass: "x-column-filter-dropdown"
            }, that.getRenderConditionOptions());
            that.peCondition = core.ui.PropertyEditor.DefaultMapping.create(opts, that);
            that.peCondition.render(domElement);
            that.registerChild(that.peCondition, true);
        };
        SlickColumnFilterBase.prototype.isNullCondition = function (testField) {
            var val = (testField || this.condition());
            return val === ColumnFilterCondition.Enum.members["null"].value ||
                val === ColumnFilterCondition.Enum.members["not-null"].value;
        };
        // Part API
        SlickColumnFilterBase.prototype.doRender = function (domElement) {
            this.renderCondition(domElement);
            _super.prototype.doRender.call(this, domElement);
        };
        SlickColumnFilterBase.defaultOptions = {
            /**
             * @prototype {Object} pe metadata of inner PE
             */
            pe: {
                contextName: "inline",
                changeTrigger: "keyPressed"
            }
        };
        SlickColumnFilterBase.events = {
            FILTER_CHANGED: "filterChanged"
        };
        __decorate([
            lang.decorators.constant(SlickColumnFilterBase.events)
        ], SlickColumnFilterBase.prototype, "events");
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickColumnFilterBase.prototype, "condition");
        return SlickColumnFilterBase;
    }(core.ui.Part));
    exports.SlickColumnFilterBase = SlickColumnFilterBase;
    var SlickColumnFilterValue = /** @class */ (function (_super) {
        __extends(SlickColumnFilterValue, _super);
        /**
         * @constrcuts SlickColumnFilterValue
         * @extends SlickColumnFilterBase
         * @param options
         */
        function SlickColumnFilterValue(isServerFilter, options) {
            var _this = _super.call(this, isServerFilter, options) || this;
            var that = _this;
            that.matcher = that.options.matcher || that.defaultMatcher;
            that.bind("change:value", that._triggerFilterChanged, that);
            _this.bind("change:condition", _this._conditionTokenChanged, _this);
            return _this;
        }
        SlickColumnFilterValue.prototype.togglePeVisibility = function () {
            if (this.peDomElement && this.pe) {
                var shouldHide = this.isNullCondition();
                $(this.peDomElement).toggleClass("hidden", shouldHide);
                this.pe.hidden(shouldHide);
                return true;
            }
            return false;
        };
        SlickColumnFilterValue.prototype._conditionTokenChanged = function () {
            var wasHidden = !!(this.pe && this.pe.hidden());
            if (this.togglePeVisibility()) {
                var curValueIsNull = this.isNullCondition(this.value());
                if (wasHidden && !this.pe.hidden() && curValueIsNull) {
                    this.value(null);
                }
                else {
                    this.trigger(this.events.FILTER_CHANGED, this);
                }
            }
        };
        SlickColumnFilterValue.prototype.defaultMatcher = function (value, filterValue) {
            // NOTE: value and filterValue are not empty here
            return value.toString().toLowerCase().indexOf(filterValue.toString().toLowerCase()) >= 0;
        };
        // Filter API
        SlickColumnFilterValue.prototype.match = function (value) {
            var filterValue = this.value();
            if (lang.isNullOrEmpty(filterValue)) {
                return true;
            }
            if (lang.isNullOrEmpty(value)) {
                return false;
            }
            return this.matcher(value, filterValue);
        };
        SlickColumnFilterValue.prototype.isEmpty = function () {
            return lang.isNullOrEmpty(this.value()) && !this.isNullCondition();
        };
        SlickColumnFilterValue.prototype.clear = function () {
            this.value(null);
            this.condition(this.defaultConditionItem());
        };
        SlickColumnFilterValue.prototype.focus = function () {
            var pe = this.pe;
            if (pe) {
                pe.focus();
            }
        };
        // Part API
        SlickColumnFilterValue.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            var $div = $("<div class='x-pe'></div>").appendTo(domElement);
            that.peDomElement = $div;
            that.pe = that._createPE({ name: "value" });
            that.pe.render($div);
            that.registerChild(that.pe, true);
            that.togglePeVisibility();
        };
        // ISlickColumnFilterPersist API
        //region server filter case
        SlickColumnFilterValue.prototype.defaultConditionItem = function () {
            return this.isBooleanType() ? "eq" : "contains";
        };
        SlickColumnFilterValue.prototype.isBooleanType = function () {
            return this.options.pe.vt === "boolean";
        };
        SlickColumnFilterValue.prototype.canRenderCondition = function () {
            return !this.isBooleanType() && _super.prototype.canRenderCondition.call(this);
        };
        SlickColumnFilterValue.prototype.getRenderConditionOptions = function () {
            return {
                cssClass: this.options.cssClass || "x-column-filter-condition-hor",
                disabled: this.options.conditionDropDownMembers && this.options.conditionDropDownMembers.length === 1,
                excludeMembers: ["all", "not-all"],
                includeMembers: this.options.conditionDropDownMembers || undefined
            };
        };
        SlickColumnFilterValue.prototype.buildRestriction = function () {
            return this.isBooleanType() ? this.buildRestrictionBool() : this.buildRestrictionString();
        };
        SlickColumnFilterValue.prototype.restoreRestriction = function (restriction) {
            return this.isBooleanType() ? this.restoreRestrictionBool(restriction) : this.restoreRestrictionString(restriction);
        };
        SlickColumnFilterValue.prototype.buildRestrictionBool = function () {
            var filterValue = this.value();
            if (filterValue == null)
                return undefined;
            if (this.options.rawValue)
                return filterValue;
            return { "eq": filterValue };
        };
        SlickColumnFilterValue.prototype.restoreRestrictionBool = function (restriction) {
            var filterValue = this.options.rawValue ? restriction : restriction && restriction.eq;
            this.value(filterValue);
        };
        SlickColumnFilterValue.prototype.buildRestrictionString = function () {
            var filterValue = this.value();
            if (this.options.rawValue)
                return filterValue;
            if (this.isNullCondition()) {
                filterValue = this.condition();
            }
            else if (!filterValue) {
                return undefined;
            }
            var filterCond = this.condition() || this.defaultConditionItem();
            var ret = {};
            ret[filterCond] = filterValue;
            return ret;
        };
        SlickColumnFilterValue.prototype.restoreRestrictionString = function (restriction) {
            var condName = restriction && Object.keys(restriction)[0] ||
                (this.options.conditionDropDownMembers && this.options.conditionDropDownMembers[0]) ||
                this.defaultConditionItem();
            var filterValue = this.options.rawValue ? restriction : (restriction && restriction[condName]);
            this.value(filterValue);
            if (this.options.rawValue) {
                this.condition(this.defaultConditionItem());
            }
            else {
                this.condition(condName);
            }
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickColumnFilterValue.prototype, "value");
        return SlickColumnFilterValue;
    }(SlickColumnFilterBase));
    exports.SlickColumnFilterValue = SlickColumnFilterValue;
    var SlickColumnFilterEnum = /** @class */ (function (_super) {
        __extends(SlickColumnFilterEnum, _super);
        function SlickColumnFilterEnum(isServerFilter, options) {
            var _this = _super.call(this, isServerFilter, options) || this;
            var peMd = _this.options.pe;
            var ref = peMd.ref;
            _this.isFlags = lang.coalesce(peMd.flags, ref && ref.flags);
            return _this;
        }
        SlickColumnFilterEnum.prototype.defaultMatcher = function (value, filterValue) {
            return this.isFlags ? (value & filterValue) === filterValue : value == filterValue;
        };
        // ISlickColumnFilterPersist API
        //region server filter case
        SlickColumnFilterEnum.prototype.defaultConditionItem = function () {
            return this.isFlags ? "all" : "eq";
        };
        SlickColumnFilterEnum.prototype.getRenderConditionOptions = function () {
            return {
                cssClass: this.options.cssClass || "x-column-filter-condition-vert",
                disabled: this.options.conditionDropDownMembers && this.options.conditionDropDownMembers.length === 1,
                includeMembers: this.options.conditionDropDownMembers ||
                    (this.isFlags ? ["all", "not-all"] : ["eq", "ne"]).concat(["null", "not-null"])
            };
        };
        SlickColumnFilterEnum.prototype.buildRestriction = function () {
            var filterValue = this.value();
            if (this.options.rawValue)
                return filterValue;
            if (this.isNullCondition()) {
                filterValue = this.condition();
            }
            else if (!filterValue) {
                return undefined;
            }
            var filterCond = this.condition() || this.defaultConditionItem();
            var ret = {};
            ret[filterCond] = filterValue;
            return ret;
        };
        SlickColumnFilterEnum.prototype.restoreRestriction = function (restriction) {
            var condName = restriction && Object.keys(restriction)[0] ||
                (this.options.conditionDropDownMembers && this.options.conditionDropDownMembers[0]) ||
                this.defaultConditionItem();
            var filterValue = this.options.rawValue ? restriction : (restriction && restriction[condName]);
            this.value(filterValue);
            if (this.options.rawValue) {
                this.condition(this.defaultConditionItem());
            }
            else {
                this.condition(condName);
            }
        };
        return SlickColumnFilterEnum;
    }(SlickColumnFilterValue));
    exports.SlickColumnFilterEnum = SlickColumnFilterEnum;
    var SlickColumnFilterRange = /** @class */ (function (_super) {
        __extends(SlickColumnFilterRange, _super);
        /**
         * @constructs SlickColumnFilterRange
         * @extends SlickColumnFilterBase
         * @param {Object} options
         */
        function SlickColumnFilterRange(isServerFilter, options) {
            var _this = this;
            options = SlickColumnFilterRange.mixOptions(options, SlickColumnFilterRange.defaultOptions);
            _this = _super.call(this, isServerFilter, options) || this;
            var that = _this;
            that.commands = that.options.commands;
            that.menu = new core.ui.Menu(that.options.menu);
            that.menu.bindToPart(that);
            that.bind("change:from", that._triggerFilterChanged, that);
            that.bind("change:to", that._triggerFilterChanged, that);
            return _this;
        }
        // Filter API
        SlickColumnFilterRange.prototype.match = function (value) {
            var that = this, from = that.from(), to = that.to();
            return (lang.isNullOrEmpty(from) || (value != null && from <= value)) &&
                (lang.isNullOrEmpty(to) || (value != null && value <= to));
        };
        SlickColumnFilterRange.prototype.isEmpty = function () {
            return lang.isNullOrEmpty(this.from()) && lang.isNullOrEmpty(this.to());
        };
        SlickColumnFilterRange.prototype.clear = function () {
            this.from(null);
            this.to(null);
        };
        SlickColumnFilterRange.prototype.focus = function () {
            var peFrom = this.peFrom;
            if (peFrom) {
                peFrom.focus();
            }
        };
        // Part API
        SlickColumnFilterRange.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            var $from = $("<div class='x-pe'></div>");
            that.peFrom = that._createPE({ name: "from" });
            that.peFrom.render($from);
            var $to = $("<div class='x-pe'></div>");
            that.peTo = that._createPE({ name: "to" });
            that.peTo.render($to);
            var $menu = $("<div class='x-menu-bar'></div>"), menuPresenter = new core.ui.MenuPresenter({ viewModel: that.menu });
            menuPresenter.render($menu);
            that.$domElement.append($from, $to, $menu);
            that.registerChild(that.peFrom, true);
            that.registerChild(that.peTo, true);
            that.registerChild(menuPresenter, true);
        };
        // ISlickColumnFilterPersist API
        SlickColumnFilterRange.prototype.getRenderConditionOptions = function () {
            return {};
        };
        SlickColumnFilterRange.prototype.canRenderCondition = function () {
            return false;
        };
        SlickColumnFilterRange.prototype.buildRestriction = function () {
            var from = this.from() ? this.from() : undefined, to = this.to() ? this.to() : undefined;
            if (!from && !to)
                return undefined;
            if (this.options.rawValue) {
                from = from ? from : "";
                to = to ? to : "";
                return from + ";" + to;
            }
            return { "ge": from, "le": to };
        };
        SlickColumnFilterRange.prototype.restoreRestriction = function (restriction) {
            if (this.options.rawValue) {
                restriction = restriction == null || typeof (restriction) !== "string" ? "" : restriction;
                var pair = restriction.split(";");
                this.from(pair[0]);
                this.to(pair.length ? pair[1] : "");
                return;
            }
            this.from(restriction && restriction.ge);
            this.to(restriction && restriction.le);
        };
        SlickColumnFilterRange.defaultOptions = {
            menu: {
                items: [
                    { name: "Clear", title: resources.clear }
                ]
            },
            commands: {
                Clear: function (that) {
                    return new core.commands.BoundCommand(that.clear, // execute
                    function () { return !that.isEmpty(); }, // canExecute
                    that);
                }
            },
            pe: {
                openPickerOn: "both" // for peDateTime only!
            }
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickColumnFilterRange.prototype, "from");
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickColumnFilterRange.prototype, "to");
        return SlickColumnFilterRange;
    }(SlickColumnFilterBase));
    exports.SlickColumnFilterRange = SlickColumnFilterRange;
    // See https://github.com/Microsoft/TypeScript/issues/4890
    // TODO: вынести в core.lang?
    function override(Super) {
        var methods = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            methods[_i - 1] = arguments[_i];
        }
        var C = /** @class */ (function (_super) {
            __extends(C, _super);
            function C() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return C;
        }(Super));
        for (var _a = 0, methods_1 = methods; _a < methods_1.length; _a++) {
            var name_1 = methods_1[_a];
            C.prototype[name_1] = Super.prototype[name_1];
        }
        return C;
    }
    exports.SlickObjectListDataPresenterOverrides = override(SlickObjectListDataPresenter, "setViewModel", "dispose", "onGridInitialized");
    var SlickObjectListDataPresenterAddon = /** @class */ (function (_super) {
        __extends(SlickObjectListDataPresenterAddon, _super);
        function SlickObjectListDataPresenterAddon() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SlickObjectListDataPresenterAddon.prototype.getIsServerFilter = function () {
            if (this.isServerFilter() == null) {
                var isServer = this.options && this.options.columnFilters &&
                    this.options.columnFilters.server;
                this.isServerFilter(isServer);
            }
            return this.isServerFilter();
        };
        SlickObjectListDataPresenterAddon.prototype.getServerFilterOptions = function () {
            return this.options.columnFilters;
        };
        SlickObjectListDataPresenterAddon.prototype.setViewModel = function (viewModel) {
            var that = this;
            _super.prototype.setViewModel.call(this, viewModel);
            that.viewModel.bind("dataLoaded", that._onListDataLoaded, that);
            if (this.getIsServerFilter()) {
                var list_1 = that.viewModel;
                if (list_1 && list_1.userSettings) {
                    list_1.userSettings.bindToProp(this, "storedFilters");
                }
                this.viewModel.bind("dataLoading", this._onListDataLoading, this);
                this._initCommands();
            }
            else {
                that.viewModel.selection.bind("change", that._onSelectionChange, that);
            }
        };
        SlickObjectListDataPresenterAddon.prototype._initCommands = function () {
            var that = this, list = that.viewModel, filterPart = list.getFilterPart(), filterPartCmd = filterPart && filterPart.commands;
            if (filterPartCmd) {
                var menu = {
                    items: [{
                            name: "ClearFilter",
                            title: "Очистить все фильтры"
                        }]
                };
                list.menuList.mergeWith(menu);
                filterPartCmd.ClearFilter.bind("executed", function (e, ctx) {
                    if (that._clearFilters())
                        list.reload();
                });
            }
            else {
                var menu = {
                    items: [{
                            name: "ClearFilter",
                            title: "Очистить фильтры в колонках",
                            icon: "clear",
                            order: 15,
                            command: core.createCommand({
                                execute: function () {
                                    if (that._clearFilters())
                                        list.reload();
                                }
                            })
                        }]
                };
                list.menuList.mergeWith(menu);
            }
        };
        SlickObjectListDataPresenterAddon.prototype._clearFilters = function () {
            var that = this;
            that.storedFilters(null);
            if (that.columnFilters) {
                var cleared_1 = false;
                lang.forEach(that.columnFilters, function (filter) {
                    cleared_1 = cleared_1 || !filter.isEmpty();
                    filter.clear();
                });
                return cleared_1;
            }
            return true;
        };
        SlickObjectListDataPresenterAddon.prototype.dispose = function () {
            var that = this;
            that.viewModel.unbind("dataLoading", null, that);
            that.viewModel.unbind("dataLoaded", null, that);
            that.viewModel.selection.unbind("change", null, that);
            if (that.columnFilters) {
                lang.forEach(that.columnFilters, function (filter) {
                    filter.dispose();
                });
                that.columnFilters = undefined;
            }
            _super.prototype.dispose.call(this);
        };
        SlickObjectListDataPresenterAddon.prototype._applyServerFilters = function () {
            var list = this.viewModel;
            list.reload();
        };
        SlickObjectListDataPresenterAddon.prototype.onGridInitialized = function (args) {
            var that = this, grid = args.grid;
            if (that.options.columnFilters) {
                that.columnFilters = {};
                for (var _i = 0, _a = that.viewModel.columns; _i < _a.length; _i++) {
                    var col = _a[_i];
                    var filter = that._createColumnFilter(col);
                    if (filter) {
                        filter.bind("filterChanged", that._applyColumnFiltersAsync, that);
                        that.columnFilters[col.prop] = filter;
                        if (that.getIsServerFilter()) {
                            filter.bind("ready", function (e1) {
                                var $target = e1.$domElement;
                                $target.bind("keyup", function (e) {
                                    if (e.which === core.html.keyCode.ENTER) {
                                        // подменим клавишу, чтобы сработало закрытие фильтра
                                        e.which = core.html.keyCode.ESCAPE;
                                        that._applyServerFilters();
                                    }
                                });
                            });
                        }
                    }
                }
                grid.onHeaderCellRendered.subscribe(function (e, args) {
                    var col = args.column.source, filter = col && col.prop && that.columnFilters[col.prop];
                    if (filter) {
                        $("<span class='slick-column-filter'></span>")
                            .click(that._onColumnFilterClick.bind(that, col))
                            .appendTo(args.node);
                        if (!filter.isEmpty()) {
                            $(args.node).addClass("slick-header-column-filtered");
                        }
                    }
                });
                grid.onBeforeHeaderCellDestroy.subscribe(function (e, args) {
                    $(".slick-column-filter", args.node).remove();
                });
                // Force the grid to re-render the header now that the events are hooked up.
                grid.setColumns(grid.getColumns());
            }
            _super.prototype.onGridInitialized.call(this, args);
        };
        SlickObjectListDataPresenterAddon.prototype._createColumnFilter = function (col) {
            if (!col || col.role !== "data" || !col.prop) {
                return;
            }
            var that = this, filterOpt = col.filter;
            // filter === null || filter === false => no filter
            if (filterOpt !== undefined && !filterOpt) {
                return;
            }
            if (lang.isFunction(filterOpt)) {
                return filterOpt.call(that, col);
            }
            // create options for SlickColumnFilterBase
            var options = {
                column: col,
                pe: {}
            };
            // extend by explicitly specified filter options
            lang.extend(options, filterOpt);
            // extend by domain metadata
            var list = that.viewModel;
            if (list.findDomainProp) {
                var prop = list.findDomainProp(col);
                lang.append(options.pe, prop);
            }
            // calculate vt
            options.pe.vt = options.pe.vt || options.vt || col.vt;
            // choose SlickColumnFilterBase implementation
            var Ctor;
            if (lang.isString(filterOpt)) {
                Ctor = that.ColumnFilterClasses[filterOpt];
            }
            else if (filterOpt && filterOpt.name) {
                Ctor = that.ColumnFilterClasses[filterOpt.name];
            }
            if (!Ctor) {
                switch (options.pe.vt) {
                    case "dateTime":
                    case "date":
                    case "time":
                    case "dateTimeTz":
                    case "timeTz":
                    case "ui1":
                    case "i2":
                    case "i4":
                    case "float":
                    case "double":
                    case "decimal":
                        Ctor = SlickColumnFilterRange;
                        break;
                    case "enum":
                        Ctor = SlickColumnFilterEnum;
                        break;
                    case "smallBin":
                        //TODO: implement smallBin PE
                        return;
                    default:
                        Ctor = SlickColumnFilterValue;
                        break;
                }
            }
            if (!this.getIsServerFilter()) {
                return new Ctor(false, options);
            }
            var filterOpts = this.getServerFilterOptions(), orientation = options.orientation || filterOpts.orientation;
            options.rawValue = options.rawValue == null ? filterOpts.rawValues : options.rawValue;
            options.cssClass = options.cssClass || filterOpts.cssClass ||
                (!orientation ? undefined : orientation === "vertical" ? "x-column-filter-condition-vert" : "x-column-filter-condition-hor");
            var filterObj = new Ctor(true, options);
            this._restoreColumnFilterValue(filterObj);
            return filterObj;
        };
        SlickObjectListDataPresenterAddon.prototype._calcColumnFilters = function (item) {
            var that = this;
            if (lang.isFunction(item.hasChanges) && item.hasChanges()) {
                return true;
            }
            return lang.every(that.columnFilters, function (filter, prop) {
                var col = filter.column, getter = col.getter, v = getter ? getter.call(item, col) : lang.get(item, prop);
                return filter.match(v);
            });
        };
        SlickObjectListDataPresenterAddon.prototype._applyColumnFilters = function (filter) {
            if (!!filter && this.getIsServerFilter())
                return this._storeColumnFilters(filter);
            var that = this;
            // set 'where' condition for items (selection will be auto-updated)
            that.viewModel.items.where(function (item) { return that._calcColumnFilters(item); });
            // toggle 'slick-header-column-filtered' css class for headers
            if (that.grid && that.gridElement) {
                var $headers_1 = that.gridElement.find(".slick-header-column");
                var appliedSome_1 = false;
                that.grid.getColumns().forEach(function (col, i) {
                    var prop = col.source && col.source.prop;
                    if (prop) {
                        var filter_1 = that.columnFilters[prop];
                        var applied = !!(filter_1 && !filter_1.isEmpty());
                        if (applied) {
                            appliedSome_1 = true;
                        }
                        $headers_1.eq(i).toggleClass("slick-header-column-filtered", applied);
                    }
                });
                that.applied = appliedSome_1;
            }
        };
        SlickObjectListDataPresenterAddon.prototype._storeColumnFilters = function (filter) {
            var that = this, curFilter = lang.extend({}, this.storedFilters());
            curFilter[filter.paramName()] = filter.buildRestriction();
            this.storedFilters(curFilter);
            if (that.grid && that.gridElement) {
                var $headers_2 = that.gridElement.find(".slick-header-column");
                that.grid.getColumns().forEach(function (col, i) {
                    if ((col.source && col.source.prop) === filter.column.prop) {
                        $headers_2.eq(i).toggleClass("slick-header-column-filtered", !filter.isEmpty());
                    }
                });
            }
        };
        SlickObjectListDataPresenterAddon.prototype._onColumnFilterClick = function (col, e) {
            e.preventDefault();
            e.stopPropagation();
            var that = this, filter = that.columnFilters[col.prop];
            // NOTE: The filter may be still rendered if previous popup is closing with animation at the moment.
            // This can happen on click to the filter icon when popup is already opened.
            if (!filter || filter.domElement) {
                return;
            }
            var $target = $(e.target), $headerColumn = $target.closest(".slick-header-column", that.gridElement.get(0)), $header = $headerColumn.closest(".slick-header", that.gridElement.get(0)), $viewport = $(".slick-viewport", that.gridElement), popup = new core.ui.Popup({
                rootCssClass: "x-grid-column-filter",
                unbound: true,
                body: filter,
                preserveBody: true
            });
            function close() {
                popup.close();
            }
            function reposition() {
                var $popup = popup.$domElement, offset = $target.offset(), position = {
                    top: offset.top + $target.height(),
                    left: offset.left
                };
                $popup.within(that.gridElement, position);
            }
            popup.bind("ready", function () {
                $headerColumn.addClass("slick-header-column-active");
                $header.on("affixStuck affixUnstuck", reposition);
                $viewport.on("scroll", close);
                core.$window.on("resize", close);
            });
            popup.bind("unload", function () {
                $headerColumn.removeClass("slick-header-column-active");
                $header.off("affixStuck affixUnstuck", reposition);
                $viewport.off("scroll", close);
                core.$window.off("resize", close);
            });
            popup.render(that.gridElement);
            reposition();
            filter.focus();
        };
        SlickObjectListDataPresenterAddon.prototype._composeColumnRestrictions = function (args) {
            var that = this, filterOptions = this.getServerFilterOptions(), restrictions = {}, restrictionsCount = 0;
            if (!filterOptions)
                return;
            if (that.columnFilters) {
                lang.forEach(that.columnFilters, function (filter, prop) {
                    var r = filter.buildRestriction();
                    if (r) {
                        restrictions[filter.paramName()] = r;
                        restrictionsCount++;
                    }
                });
                that.storedFilters(restrictions);
            }
            else if (that.storedFilters()) {
                lang.forEach(that.storedFilters(), function (filter, propName) {
                    restrictions[propName] = filter;
                    restrictionsCount++;
                });
            }
            if (restrictionsCount > filterOptions.maxFiltersCount) {
                args.confirmationMessage = resources["objectList.tooManyFilters"];
            }
            args.params = args.params || {};
            if (filterOptions.paramName) {
                args.params[filterOptions.paramName] = restrictions;
            }
            else {
                args.params = lang.extend(args.params, restrictions);
            }
        };
        SlickObjectListDataPresenterAddon.prototype._onListDataLoading = function (sender, args) {
            this._composeColumnRestrictions(args);
        };
        SlickObjectListDataPresenterAddon.prototype._onListDataLoaded = function () {
            var that = this, filters = that.columnFilters, isServerFilter = that.getIsServerFilter();
            if (!filters)
                return;
            lang.forEach(filters, function (filter) {
                // NOTE: unbind and bind again to prevent applying each filter separately
                filter.unbind("filterChanged", null, that);
                if (isServerFilter) {
                    that._restoreColumnFilterValue(filter);
                }
                else {
                    filter.clear();
                }
                filter.bind("filterChanged", that._applyColumnFiltersAsync, that);
            });
            if (isServerFilter) {
                that._updateClearButtonStyle();
            }
            else {
                // apply all filters at once
                that._applyColumnFilters(null);
            }
        };
        SlickObjectListDataPresenterAddon.prototype._updateClearButtonStyle = function () {
            var that = this, list = this.viewModel, listFilterPart = list.getFilterPart(), allEmpty = !that.storedFilters() || lang.isEmpty(that.storedFilters()), menuItem = list.menuList && list.menuList.getItem("ClearFilter");
            if (menuItem) {
                if (listFilterPart && listFilterPart.isEmpty) {
                    allEmpty = allEmpty && listFilterPart.isEmpty();
                }
                menuItem.cssClass = !allEmpty ? "x-menu-item-badge-warning" : "";
                list.changed("menuList");
            }
        };
        SlickObjectListDataPresenterAddon.prototype._restoreColumnFilterValue = function (colFilter) {
            var storedFilters = this.storedFilters(), filterVal = storedFilters && storedFilters[colFilter.paramName()];
            colFilter.restoreRestriction(filterVal);
        };
        SlickObjectListDataPresenterAddon.prototype._onSelectionChange = function (sender, args) {
            var that = this;
            var filters = that.columnFilters;
            if (!filters || !that.applied) {
                return;
            }
            // there is at least one applied (active) column filter
            if (args && args.added) {
                for (var _i = 0, _a = args.added; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (that.viewModel.items.indexOf(item) < 0) {
                        // we've found the object which is in selection but not in items,
                        // this means that it's hidden by filters. clear them.
                        that._onListDataLoaded();
                        return;
                    }
                }
            }
        };
        __decorate([
            lang.decorators.constant({
                "value": SlickColumnFilterValue,
                "enum": SlickColumnFilterEnum,
                "range": SlickColumnFilterRange
            })
        ], SlickObjectListDataPresenterAddon.prototype, "ColumnFilterClasses");
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickObjectListDataPresenterAddon.prototype, "storedFilters");
        __decorate([
            lang.decorators.observableAccessor()
        ], SlickObjectListDataPresenterAddon.prototype, "isServerFilter");
        __decorate([
            lang.decorators.constant(lang.debounce(SlickObjectListDataPresenterAddon.prototype._applyColumnFilters, 200, true))
        ], SlickObjectListDataPresenterAddon.prototype, "_applyColumnFiltersAsync");
        return SlickObjectListDataPresenterAddon;
    }(exports.SlickObjectListDataPresenterOverrides));
    exports.SlickObjectListDataPresenterAddon = SlickObjectListDataPresenterAddon;
    lang.extend(SlickObjectListDataPresenter.prototype, SlickObjectListDataPresenterAddon.prototype);
});
//# sourceMappingURL=SlickColumnFiltersAddon.js.map