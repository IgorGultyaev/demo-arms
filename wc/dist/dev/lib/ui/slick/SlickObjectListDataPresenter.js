/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/formatters", "lib/ui/Part", "lib/ui/menu/Menu", "lib/ui/slick/slick.bootstrap", "lib/ui/slick/SlickGridDataProvider", "i18n!lib/nls/resources", "xcss!lib/ui/styles/slickObjectListPresenter", "xcss!lib/ui/styles/contextParts", "vendor/jquery.mousewheel"], function (require, exports, $, core, formatters, Part, Menu, Slick, SlickGridDataProvider, resources) {
    "use strict";
    var lang = core.lang;
    var WAIT_LAYOUT_TIMEOUT = 100;
    var SlickObjectListDataPresenter = /** @class */ (function (_super) {
        __extends(SlickObjectListDataPresenter, _super);
        /**
         * @constructs SlickObjectListDataPresenter
         * @extends Part
         * @param options
         */
        function SlickObjectListDataPresenter(options) {
            var _this = this;
            options = SlickObjectListDataPresenter.mixOptions(options, SlickObjectListDataPresenter.defaultOptions);
            var gridOptions = options.gridOptions;
            if (gridOptions.multiSelect === undefined) {
                gridOptions.multiSelect = !!options.hasCheckboxes || !!options.canMoveRows;
            }
            // numbering rows is confused with grouping, turn it off
            if (options.grouping) {
                options.hasRowNum = false;
            }
            if (options.virtualHScroll === undefined) {
                options.virtualHScroll = gridOptions.forceFitColumns === false && gridOptions.autoHeight &&
                    !core.platform.supportTouch;
            }
            _this = _super.call(this, options) || this;
            _this.traceSource = new core.diagnostics.TraceSource("ui.SlickObjectListDataPresenter", _this.options.traceSourceName);
            _this.eventPublisher = core.Application.current.eventPublisher;
            _this._startIndex = 0;
            _this.userSettings = new core.UserSettings();
            _this.userSettings.bind("init:rowHeight", function (height) {
                _this.options.gridOptions.rowHeight = height;
            });
            return _this;
        }
        SlickObjectListDataPresenter.prototype.applyHostContext = function (opt) {
            _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, SlickObjectListDataPresenter.hostDefaultOptions);
            return null;
        };
        /**
         * It's implementation DataProvider.getItemMetadata
         * @param item
         * @returns {GridRowMetadata}
         */
        SlickObjectListDataPresenter.prototype.getItemMetadata = function (item) {
            var that = this, itemMetaOption = that.options.itemMetadata;
            if (lang.isFunction(itemMetaOption)) {
                itemMetaOption = itemMetaOption(item);
            }
            var itemMeta = lang.clone(itemMetaOption) || {};
            if (lang.get(item, "isRemoved")) {
                itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-removed-item");
            }
            if (lang.get(item, "isNew")) {
                itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-new-item");
            }
            if (lang.get(item, "isModified")) {
                itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-modified-item");
            }
            if (lang.get(item, "isInvalid")) {
                itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-disabled-item");
            }
            if (!that.viewModel.isItemSelectable(item)) {
                itemMeta.selectable = false;
                itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-nonselectable");
            }
            var violations = that.viewModel.violations;
            if (violations && violations.count()) {
                var myViols = violations.filter(function (v) { return v.object === item; });
                // "critical" | "error" | "warning" | "info"
                var clas = void 0;
                for (var _i = 0, myViols_1 = myViols; _i < myViols_1.length; _i++) {
                    var viol = myViols_1[_i];
                    if (viol.severity === "error" || viol.severity === "critical" || !viol.severity) {
                        clas = "-invalid";
                        break;
                    }
                    if (viol.severity === "warning") {
                        clas = "-warning";
                    }
                }
                if (clas) {
                    itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, clas);
                }
            }
            return itemMeta;
        };
        SlickObjectListDataPresenter.prototype.setViewModel = function (viewModel) {
            _super.prototype.setViewModel.call(this, viewModel);
            this._enrichModelColumns();
        };
        SlickObjectListDataPresenter.prototype.setNumbering = function (startIndex) {
            this._startIndex = startIndex || 0;
        };
        SlickObjectListDataPresenter.prototype.setActiveColumn = function (column) {
            var that = this;
            // don't do anything if the part is unloaded
            if (!that.grid || !that.domElement) {
                return;
            }
            if (that._activeSync) {
                return;
            }
            that._activeSync = true;
            try {
                var colIndex = that.grid.getColumnIndex(column.name);
                if (colIndex >= 0) {
                    that._activeColumn = colIndex;
                    that.renderGridAsync({ active: true });
                }
            }
            finally {
                that._activeSync = undefined;
            }
        };
        SlickObjectListDataPresenter.prototype.refreshItems = function (items) {
            var that = this, rows;
            if (!items) {
                that.dataProvider.invalidate();
                rows = { all: true };
            }
            else {
                items = lang.array(items);
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var item = items_1[_i];
                    var index = that.viewModel.items.indexOf(item);
                    if (index >= 0) {
                        var itemRows = that.dataProvider.invalidateItem(index);
                        rows = rows ? lang.extend(rows, itemRows) : itemRows;
                    }
                }
            }
            if (rows) {
                that.renderGridAsync({ rows: rows });
            }
        };
        SlickObjectListDataPresenter.prototype.changeRowHeight = function (increase, delta) {
            var that = this;
            var grid = that.grid;
            if (!grid) {
                return;
            }
            var columns = grid.getColumns();
            var options = grid.getOptions();
            delta = delta || that.options.rowHeightDelta;
            var rowHeight = options.rowHeight;
            if (increase) {
                if (that.options.rowHeightMax && (rowHeight > that.options.rowHeightMax)) {
                    return;
                }
                rowHeight = rowHeight + delta;
            }
            else {
                if (rowHeight <= that.options.rowHeightMin) {
                    return;
                }
                rowHeight = rowHeight - delta;
            }
            options.rowHeight = rowHeight;
            grid.setOptions(options);
            // NOTE: this make the grid refresh
            that._updateRowMultiline();
            grid.setColumns(columns);
            that.notifyDOMChanged();
            that.userSettings.set("rowHeight", rowHeight);
        };
        SlickObjectListDataPresenter.prototype.doRender = function (domElement) {
            var that = this;
            // NOTE: wrap domElement to ensure that it is jQuery set
            _super.prototype.doRender.call(this, $(domElement));
            // subscribe to events
            that.viewModel.selection.bind("change", that.onModelSelectionChange, that);
            that.viewModel.violations.bind("change", that.onModelViolationsChange, that);
            //that.viewModel.items.bind("change:orderBy", that.onModelItemsOrderbyChange, that);
            that.viewModel.bind("change:activeItem", that.onModelActiveItemChange, that);
            that.viewModel.bind("change:disabled", that.onDisabledChange, that);
            that.viewModel.bind("change:columns", that.onModelColumnsChange, that);
            that.viewModel.bind("containerResize", that.onWindowResize, that);
            core.html.windowResize.bind(that.onWindowResize, that);
            if (!that.gridElement) {
                that.createGrid();
            }
            else {
                that.gridElement.appendTo(that.domElement);
                // scroll to the inner viewport of the grid
                window.setTimeout(function () {
                    // part can be already unloaded
                    if (!that.grid || !that.domElement) {
                        return;
                    }
                    // scroll grid to make viewPort visible
                    var firstRow = that.grid.getViewport().top, rowHeight = that.grid.getOptions().rowHeight;
                    if (firstRow) {
                        $(that.grid.getCanvasNode()).parent().scrollTop(firstRow * rowHeight);
                    }
                });
                that.affixAdd();
                that.renderGrid({
                    rows: { all: true },
                    columns: true,
                    resize: true,
                    scroll: that.options.autoScrollToTop
                });
            }
        };
        SlickObjectListDataPresenter.prototype.afterRender = function () {
            // do nothing here, base method will be called in createGrid/renderGrid
        };
        SlickObjectListDataPresenter.prototype.unload = function () {
            var that = this;
            // unsubscribe
            if (that.viewModel) {
                that.viewModel.selection.unbind("change", null, that);
                that.viewModel.violations.unbind("change", null, that);
                //that.viewModel.items.unbind("change:orderBy", that.onModelItemsOrderbyChange, that);
                that.viewModel.unbind("change:activeItem", null, that);
                that.viewModel.unbind("change:disabled", null, that);
                that.viewModel.unbind("change:columns", null, that);
                that.viewModel.unbind("containerResize", null, that);
            }
            core.html.windowResize.unbind(that.onWindowResize, that);
            if (that._onMouseWheel) {
                that.gridElement.off("mousewheel", that._onMouseWheel);
                that._onMouseWheel = undefined;
            }
            if (that.gridElement) {
                that.affixRemove();
                that._updateHScroller({ remove: true });
                that.gridElement.detach();
            }
            if (that.grid) {
                that.grid.invalidateAllRows();
            }
            if (that.dataProvider) {
                that.dataProvider.invalidate();
            }
            _super.prototype.unload.call(this);
        };
        SlickObjectListDataPresenter.prototype.scrollToSelf = function () {
            this.renderGridAsync({ scroll: true });
        };
        SlickObjectListDataPresenter.prototype.dispose = function (options) {
            this.destroyGrid();
            _super.prototype.dispose.call(this, options);
        };
        SlickObjectListDataPresenter.prototype.isLayoutReady = function () {
            var that = this;
            if (!that.domElement) {
                that.traceSource.debug("isLayoutReady: no domElement");
                return false;
            }
            if (that.$domElement.is(":hidden")) {
                that.traceSource.debug("isLayoutReady: hidden");
                return false;
            }
            if (that.$domElement.closest(":animated").length) {
                that.traceSource.debug("isLayoutReady: animated");
                return false;
            }
            return true;
        };
        SlickObjectListDataPresenter.prototype.isRenderScheduled = function () {
            return !!this._asyncRenderOptions || this._asyncCreateScheduled;
        };
        SlickObjectListDataPresenter.prototype._updateRowMultiline = function () {
            if (this.grid.getOptions().rowHeight > this.options.rowHeightMultiline) {
                // высота стала достаточной, чтобы разрешить перенос слов, т.е. отключить "white-space: nowrap" для .slick-cell
                this.gridElement.addClass("x-grid-miltiline-rows");
            }
            else {
                this.gridElement.removeClass("x-grid-miltiline-rows");
            }
        };
        /**
         * @param {Object} [options]
         * @param {Boolean} [options.scroll]
         * @param {Boolean} [options.selection]
         * @param {Boolean} [options.active]
         * @param {Boolean} [options.columns]
         * @param {Boolean} [options.resize]
         * @param {Object} [options.rows] Keys are row indexes or 'all', values are always 'true' (e.g. {all:true} or {1:true,5:true,...,n:true})
         */
        SlickObjectListDataPresenter.prototype.renderGrid = function (options) {
            var that = this, grid = that.grid;
            // don't do anything if the part is unloaded
            if (!grid || !that.domElement) {
                return;
            }
            var isSmartHeight = grid.getOptions().smartHeight;
            // async refreshing is already scheduled - call refreshGridAsync one more to merge options
            if (that._asyncRenderOptions) {
                that.renderGridAsync(options);
                return;
            }
            // layout isn't ready yet - try later
            if (!that.isLayoutReady()) {
                that.renderGridAsync(options, WAIT_LAYOUT_TIMEOUT);
                return;
            }
            options = options || {};
            if (options.columns) {
                that._setupGridColumns();
                // NOTE: updating columns can add a column with checkboxes which we should update for selected row:
                if (!options.selection && !options.rows) {
                    that._selectGridRows();
                }
            }
            var rowsAll;
            if (options.rows) {
                if (options.rows.all || isSmartHeight) {
                    // В isSmartHeight режиме нельзя дорисовывать строки, т.к. их высота может измениться.
                    // Поэтому, нужно перерисовать все строки.
                    grid.updateRowCount();
                    grid.invalidateAllRows();
                    rowsAll = true;
                }
                else {
                    grid.invalidateRows(Object.keys(options.rows).map(function (i) { return parseInt(i); }));
                }
                grid.render();
            }
            if (options.resize) {
                var width = that.gridElement.width();
                if (that._gridWidth !== width) {
                    // В isSmartHeight режиме после ресайза меняются высоты строк. Поэтому перерисовка всего
                    if (isSmartHeight) {
                        grid.invalidateAllRows();
                        rowsAll = true;
                    }
                    grid.resizeCanvas();
                    that._gridWidth = width;
                }
            }
            if (options.violations || rowsAll) {
                that._applyViolations();
            }
            if (options.selection || rowsAll) {
                that._selectGridRows();
            }
            if (options.active || rowsAll) {
                that._activateGridRow();
            }
            if (options.scroll) {
                var scrollTo_1 = grid.getActiveCellNode();
                if (!scrollTo_1) {
                    if (grid.getSelectionModel())
                        scrollTo_1 = grid.getCellNode(lang.last(grid.getSelectedRows()) || 0, 0);
                }
                scrollTo_1 = scrollTo_1 || that.gridElement;
                core.html.scrollToElement({ element: scrollTo_1, align: "center" });
            }
            if (rowsAll && that.options.gridOptions.autoHeight) {
                that.affixRefresh();
            }
            if (options.columns || options.rows || options.resize) {
                that._updateHScroller();
            }
            that.trigger("render", that, options);
            _super.prototype.afterRender.call(this);
        };
        SlickObjectListDataPresenter.prototype.renderGridAsync = function (options, timeout) {
            var that = this;
            // don't do anything if the part is unloaded
            if (!that.grid || !that.domElement) {
                return;
            }
            options = options || {};
            // if async update scheduled, just merge options
            if (!!that._asyncRenderOptions) {
                lang.extendEx(that._asyncRenderOptions, options, { deep: true });
                return;
            }
            that._asyncRenderOptions = options;
            window.setTimeout(function () {
                var asyncRenderOptions = that._asyncRenderOptions;
                that._asyncRenderOptions = undefined;
                that.renderGrid(asyncRenderOptions);
            }, timeout);
        };
        SlickObjectListDataPresenter.prototype.createGrid = function () {
            var that = this, dataProviderOptions;
            // do nothing if grid is already created or part is unloaded, or async creation already scheduled
            if (that.grid || !that.domElement || that._asyncCreateScheduled) {
                return;
            }
            // if layout is not ready - schedule async create
            if (!that.isLayoutReady()) {
                that.createGridAsync(WAIT_LAYOUT_TIMEOUT);
                return;
            }
            that.gridElement = $("<div class='x-grid'></div>").appendTo(that.domElement);
            if (that.options.gridCssClass) {
                that.gridElement.addClass(that.options.gridCssClass);
            }
            // create data provider
            dataProviderOptions = {
                groupItemMetadataProvider: new Slick.Data.GroupItemMetadataProvider(),
                dataItemMetadataProvider: {
                    getItemMetadata: that.getItemMetadata.bind(that)
                },
                defaultGroupOptions: SlickObjectListDataPresenter.defaultGroupOptions
            };
            that.dataProvider = new SlickGridDataProvider(that.viewModel, dataProviderOptions);
            if (that.options.grouping) {
                that.dataProvider.setGrouping(that.options.grouping);
            }
            // create SlickGrid
            that.grid = new Slick.Grid(that.gridElement, that.dataProvider, [], that.options.gridOptions);
            // disable cell navigation by TAB
            // NOTE: we should bind 'keydown' handler before grid initialization. Otherwise Slick calls
            // e.preventDefault() and TAB doesn't change focused element.
            // NOTE: find() selects the same elements on which Slick binds 'handleKeyDown' handler
            that.gridElement.find("> [hideFocus], > .slick-viewport > .grid-canvas").keydown(function (e) {
                if (e.which === 9 && !e.ctrlKey && !e.metaKey) {
                    e.stopImmediatePropagation();
                }
            });
            // NOTE: draginit is a special event triggered by jquery.event.drag. This is in fact mousedown.
            // draginit (and therefore mousedown) can be stopped by Slick.CellSelectionModel (via Slick.CellRangeSelector)
            // and by Slick.RowMoveManager. But we need mousedown to close popups. So manually trigger mousedown
            // if draginit propagation was stopped.
            // It's important to do this before the registration of any Slick plugins.
            // See http://track.rnd.croc.ru/issue/WC-1338
            that.gridElement.find("> .slick-viewport > .grid-canvas").on("draginit", function (e) {
                // The commented code always triggers mousedown, even when drag&drop events are cancelled
                // (default behaviour). So by default mousedown will be triggered twice.
                // We want trigger only when draginit propagation was stopped.
                //$(e.currentTarget).trigger("mousedown");
                // Here e.isImmediatePropagationStopped() is always false because this is the first handler
                window.setTimeout(function () {
                    // Here all other handlers were processed and we can check e.isImmediatePropagationStopped()
                    if (e.isImmediatePropagationStopped()) {
                        $(e.currentTarget).trigger("mousedown");
                    }
                });
            });
            // initialize grid
            that._setupGridColumns();
            that.grid.init();
            that._updateRowMultiline();
            // extension point
            that.onGridInitializing({ grid: that.grid });
            // data provider rows events
            that.dataProvider.bind("rows.change", function (sender, args) {
                that.renderGridAsync({ rows: args.rows });
            });
            that.dataProvider.bind("group.collapsing", that.onGroupCollapsing, that);
            that._setSelectionModel(that.options.selectionModel);
            that._registerCopyManager();
            // enable auto tooltips
            // NOTE: AutoTooltips plugin throws an exception while dragging columns. The following onHeaderMouseEnter
            // handler fixes this bug (it should be subscribed before the plugin registration).
            that.grid.onHeaderMouseEnter.subscribe(function (e, args) {
                if (!args.column) {
                    e.stopImmediatePropagation();
                }
            });
            that.grid.registerPlugin(new Slick.AutoTooltips({ enableForHeaderCells: true }));
            // enable group collapse
            if (that.options.grouping) {
                that.grid.registerPlugin(dataProviderOptions.groupItemMetadataProvider);
            }
            // mouse & keyboard
            that.grid.onClick.subscribe(that.onGridClick.bind(that));
            that.grid.onDblClick.subscribe(that.onGridDblClick.bind(that));
            that.grid.onKeyDown.subscribe(that.onGridKeyDown.bind(that));
            // selection & activating handling
            that.grid.onSelectedRowsChanged.subscribe(that.onGridSelectedRowsChanged.bind(that));
            that.grid.onSort.subscribe(that.onGridSort.bind(that));
            that.grid.onActiveCellChanged.subscribe(that.onGridActiveCellChanged.bind(that));
            // handling changes in grid columns
            that.grid.onColumnsResized.subscribe(that.onGridColumnsChanged.bind(that));
            that.grid.onColumnsReordered.subscribe(that.onGridColumnsChanged.bind(that));
            that.grid.onColumnsReordered.subscribe(function (e, args) {
                var grid = args.grid;
                that._markGridColumnIconic(grid.getColumns(), that.options.rowStateIcon);
                // rerender grid
                grid.invalidateAllRows();
                grid.render();
            });
            // initial sorting
            //that._setGridSorting();
            // initial selection
            that._selectGridRows();
            that._activateGridRow();
            // init tooltip to show violations
            that._initViolationTooltip();
            // affix
            that.affixAdd();
            that.affixRefresh();
            that._updateHScroller();
            that._gridWidth = that.gridElement.width();
            // extension point
            that.onGridInitialized({ grid: that.grid });
            that.trigger("render", that, { rows: "all" });
            _super.prototype.afterRender.call(this);
        };
        SlickObjectListDataPresenter.prototype.createGridAsync = function (timeout) {
            var that = this;
            //if grid creation already scheduled, do nothing
            if (that._asyncCreateScheduled) {
                return;
            }
            //schedule async create
            that._asyncCreateScheduled = true;
            window.setTimeout(function () {
                //createGrid can reschedule createGridAsync if layout still isn't ready,
                //so first remove scheduled flag, than call createGrid
                that._asyncCreateScheduled = undefined;
                that.createGrid();
            }, timeout);
        };
        SlickObjectListDataPresenter.prototype.destroyGrid = function () {
            var that = this;
            if (that.dataProvider) {
                that.dataProvider.dispose();
                that.dataProvider = undefined;
            }
            if (that.grid) {
                that.grid.destroy();
                that.grid = undefined;
            }
            if (that.gridElement) {
                that.gridElement.remove();
                that.gridElement = undefined;
            }
            if (that._$virtualScroller) {
                // _$virtualScroller is inside gridElement and was already removed with it
                that._$virtualScroller = undefined;
            }
            if (that._$viewport) {
                // _$viewport is inside gridElement and was already removed with it
                that._$viewport = undefined;
            }
        };
        // Event handlers: begin
        /**
         * @protected
         * @param {Object} args
         * @param {Slick.Grid} args.grid
         */
        SlickObjectListDataPresenter.prototype.onGridInitializing = function (args) {
            this.trigger("gridInitializing", this, args);
        };
        /**
         * @protected
         * @param {Object} args
         * @param {Slick.Grid} args.grid
         */
        SlickObjectListDataPresenter.prototype.onGridInitialized = function (args) {
            this.trigger("gridInitialized", this, args);
        };
        SlickObjectListDataPresenter.prototype.onGroupCollapsing = function (sender, args) {
            var that = this, group = args.group, expandedItems = [];
            // collect all expanded items in the group including sub-groups
            that._collectExpandedItems(group, expandedItems);
            // if group has selected rows - remove them from selection and select group
            if (expandedItems.length && args.collapse) {
                var selectedItemsInGroup = that.viewModel.selection.all()
                    .filter(function (item) { return expandedItems.indexOf(item) >= 0; });
                if (selectedItemsInGroup.length) {
                    that.viewModel.selection.remove(selectedItemsInGroup);
                }
            }
            var activeItem = that.viewModel.activeItem();
            // if no active item or it is collapsing - activate group item
            if ((!activeItem && !that._activeNonDataItem) ||
                (expandedItems.length && expandedItems.indexOf(activeItem) >= 0)) {
                that._activeNonDataItem = group;
                that.viewModel.activeItem(null);
            }
            $(that.grid.getCellNode(args.row, 0)).find(".slick-group-toggle").addClass("loading");
        };
        SlickObjectListDataPresenter.prototype.onModelSelectionChange = function () {
            if (this._selectionSync) {
                return;
            }
            this.renderGridAsync({ selection: true });
        };
        SlickObjectListDataPresenter.prototype.onModelViolationsChange = function (sender, args) {
            this.renderGridAsync({ violations: true });
        };
        /*
            protected onModelItemsOrderbyChange(): void {
                if (this._columnsSync) { return; }
        
                this._setGridSorting();
            }
        */
        SlickObjectListDataPresenter.prototype.onModelActiveItemChange = function () {
            var that = this;
            if (that._activeSync) {
                return;
            }
            that.renderGridAsync({ active: true });
        };
        SlickObjectListDataPresenter.prototype.onModelColumnsChange = function () {
            var that = this;
            if (that._columnsSync) {
                return;
            }
            that._enrichModelColumns();
            that.renderGridAsync({ columns: true });
        };
        SlickObjectListDataPresenter.prototype.onWindowResize = function () {
            // NOTE: windowResize is already debounced, so set zero timeout
            this.renderGridAsync({ resize: true }, 0);
        };
        SlickObjectListDataPresenter.prototype.onMouseWheel = function (e) {
            var that = this;
            if (that._$virtualScroller) {
                if (e.shiftKey && !e.ctrlKey && !e.altKey) {
                    that._$virtualScroller.scrollLeft(that._$virtualScroller.scrollLeft() + e.deltaX * e.deltaFactor);
                }
            }
        };
        SlickObjectListDataPresenter.prototype.onDisabledChange = function () {
            var that = this, domElement = that.domElement;
            if (domElement) {
                that.unload();
                that.destroyGrid();
                that.render(domElement);
            }
        };
        SlickObjectListDataPresenter.prototype.onGridBeforeMoveRows = function (e, args) {
            return args.rows.every(function (i) {
                return (i !== args.insertBefore && i !== args.insertBefore - 1);
            });
        };
        SlickObjectListDataPresenter.prototype.onGridMoveRows = function (e, args) {
            var that = this, items = that.viewModel.items, insertIndex = args.insertBefore, movedItems;
            if (args.rows.length === 1) {
                // перемешаем одну строчку
                items.move(args.rows[0], args.rows[0] < insertIndex ? insertIndex - 1 : insertIndex);
            }
            else {
                // при перемещении нескольких строк все сложнее:
                // сортируем индексы и запоминаем элементы
                movedItems = lang.sort(args.rows).map(function (i) {
                    return items.get(i);
                });
                movedItems.forEach(function (item) {
                    var i = items.indexOf(item);
                    items.move(i, i < insertIndex ? insertIndex - 1 : insertIndex++);
                });
                // TODO: нужна оптимизация, чтобы обойтись без запоминания movedItems
            }
        };
        SlickObjectListDataPresenter.prototype.onGridSelectedRowsChanged = function (e, args) {
            var that = this, selectedRows, selectedDataItems;
            if (that._selectionSync) {
                return;
            }
            that._selectionSync = true;
            try {
                //getting all selected rows
                selectedRows = args.rows
                    .map(function (i) { return that.dataProvider.getItem(i); });
                //data rows - select them in view model
                selectedDataItems = selectedRows
                    .filter(function (rowItem) { return !rowItem.__nonDataRow; })
                    .map(function (rowItem) { return rowItem.item; });
                // support persistentSelection:
                // 	в selection надо оставить объекты, соответствующие args.rows,
                // 	при этом не удалив объекты, которых нет сейчас в items
                var removed_1 = [];
                that.viewModel.selection.forEach(function (item) {
                    // item - либо на текущей странице (есть в items) и исключен (его нет в selectedDataItems),
                    // 		либо на текущей и не менялся (есть в selectedDataItems),
                    //		либо на другой странице (тогда его нет в items)
                    if (that.viewModel.items.indexOf(item) >= 0) {
                        // item - элемент с текущей страницы
                        var idxExisting = selectedDataItems.indexOf(item);
                        if (idxExisting < 0) {
                            removed_1.push(item);
                        }
                        else {
                            // элемент с текущей страницы и остался выделенным, удалим его из selectedDataItems,
                            // чтобы там остались только новые выделенные
                            selectedDataItems.splice(idxExisting, 1);
                        }
                    }
                });
                // Оставшиеся в selectedDataItems - это вновь добавленные элементы
                that.viewModel.selection.remove(removed_1);
                that.viewModel.selection.add(selectedDataItems);
                // WAS: that.viewModel.selection.reset(selectedDataItems); - it was so easy
            }
            finally {
                that._selectionSync = undefined;
            }
        };
        SlickObjectListDataPresenter.prototype.onGridActiveCellChanged = function (e, args) {
            var that = this, activeItem;
            if (that._activeSync) {
                return;
            }
            that._activeSync = true;
            try {
                if (args.cell !== undefined) {
                    that._activeColumn = args.cell;
                }
                if (args.row !== undefined) {
                    activeItem = that.dataProvider.getItem(args.row);
                }
                if (activeItem) {
                    if (activeItem.item) {
                        that._activeNonDataItem = null;
                        that.viewModel.activeItem(activeItem.item);
                    }
                    else {
                        that._activeNonDataItem = activeItem;
                        that.viewModel.activeItem(null);
                    }
                    // scroll to active row
                    that.renderGridAsync({ scroll: true });
                }
                else {
                    that._activeNonDataItem = null;
                    that.viewModel.activeItem(null);
                }
            }
            finally {
                that._activeSync = undefined;
            }
        };
        SlickObjectListDataPresenter.prototype.onGridSort = function (e, args) {
            var sortCols = args.sortCols || [{ sortCol: args.sortCol, sortAsc: args.sortAsc }];
            var orderBy = sortCols.map(function (sortCol) {
                var col = sortCol.sortCol.source, // viewModel column
                name = col.name;
                if (!sortCol.sortAsc) {
                    name += " desc";
                }
                return name;
            });
            this._columnsSync = true;
            try {
                this.viewModel.orderBy(orderBy);
            }
            finally {
                this._columnsSync = false;
            }
        };
        SlickObjectListDataPresenter.prototype.onGridColumnsChanged = function (e, args) {
            var that = this, columns;
            if (!that.viewModel.updateColumns) {
                return;
            }
            if (that._columnsSync) {
                return;
            }
            that._columnsSync = true;
            try {
                columns = that.viewModel.columns.map(function (col) {
                    return {
                        name: col.name,
                        hidden: true
                    };
                });
                args.grid.getColumns().forEach(function (gridCol, i) {
                    var col = lang.find(columns, function (c) {
                        return c.name === gridCol.source.name;
                    });
                    if (col) {
                        col.width = gridCol.width;
                        col.hidden = false;
                        col.order = i;
                    }
                });
                that.viewModel.updateColumns(columns);
            }
            finally {
                that._columnsSync = undefined;
            }
            that._updateHScroller();
        };
        SlickObjectListDataPresenter.prototype.onGridClick = function (e, args) {
            if (e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            var that = this, gridCol = args.grid.getColumns()[args.cell], col, $target, cmd, cmdParams, dataItem, obj, menuItem;
            if (!gridCol) {
                return;
            }
            col = gridCol.source;
            if (!col) {
                return;
            }
            // ищем элемент с командой (класс .x-cmd-link) от текущего элемента вверх по дереву DOM,
            // но не выше текущей ячейки грида (класс .slick-cell)
            $target = $(e.target).closest(".x-cmd-link,.slick-cell");
            if (!$target.hasClass("x-cmd-link")) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            // NOTE: command can be specified as command object or command name in column or
            //  as html data-* attributes
            cmd = col.command || core.commands.dataCommandName($target);
            if (!cmd) {
                return;
            }
            dataItem = that.dataProvider.getItem(args.row);
            obj = dataItem && dataItem.item;
            //that.viewModel.activeItem(obj);
            // TODO: 'object' - subject to kill, чтобы команды списка не ожидали, что все презентеры задают этот параметр
            //  Правда data-презентеры все равно должны устанавливать list.selection
            cmdParams = lang.extend({}, col.commandParams, core.commands.dataCommandParams($target), { object: obj, list: that.viewModel });
            if (lang.isString(cmd)) {
                // if cmd is a name and there's an item in list's menu with such name then we'll execute it via menu
                menuItem = that.viewModel.menuRow.getItem(cmd);
                if (menuItem && menuItem.command) {
                    that.viewModel.menuRow.executeItem(menuItem, cmdParams);
                    return;
                }
                cmd = that.viewModel.commands[cmd];
            }
            if (cmd) {
                cmd.execute(cmdParams);
            }
        };
        SlickObjectListDataPresenter.prototype.onGridDblClick = function (e, args) {
            if (e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            var that = this, menuItem, item;
            // force selection of the current row
            item = that.dataProvider.getItem(args.row);
            //if grouping header collapse\expand
            if (item.__group) {
                if (item.collapsed) {
                    that.dataProvider.expandGroup(item.groupingKey);
                }
                else {
                    that.dataProvider.collapseGroup(item.groupingKey);
                }
                return;
            }
            if (item.__groupTotals) {
                return;
            }
            // item is a data, execute default command
            menuItem = that.findDefaultMenuItem();
            if (!menuItem) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            Menu.prototype.executeItem(menuItem, { list: that.viewModel });
        };
        SlickObjectListDataPresenter.prototype.onGridKeyDown = function (e, args) {
            if (e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            var that = this, keyCode = core.html.keyCode, item;
            if (e.which !== keyCode.LEFT && e.which !== keyCode.RIGHT) {
                return;
            }
            item = that.dataProvider.getItem(args.row);
            if (!item.__group) {
                return;
            }
            //if grouping header collapse\expand
            e.preventDefault();
            if (item.collapsed && e.which === keyCode.RIGHT) {
                that.dataProvider.expandGroup(item.groupingKey);
            }
            else if (!item.collapsed && e.which === keyCode.LEFT) {
                that.dataProvider.collapseGroup(item.groupingKey);
            }
        };
        SlickObjectListDataPresenter.prototype.onGridCopyCells = function (e, args) {
            var clipboard = core.ui.clipboard;
            if (!clipboard || !clipboard.isSupported) {
                return;
            }
            var that = this, ranges = args.ranges, columns = that.grid.getColumns(), extractor = that.options.gridOptions.dataItemColumnValueExtractor, text = "";
            // sort ranges
            ranges = lang.sort(ranges, function (r1, r2) { return (r1.fromRow - r2.fromRow) || (r1.fromCell - r2.fromCell); });
            for (var _i = 0, ranges_1 = ranges; _i < ranges_1.length; _i++) {
                var range = ranges_1[_i];
                for (var i = range.fromRow; i <= range.toRow; i++) {
                    var row = that.dataProvider.getItem(i);
                    if (row.__group || row.__groupTotals) {
                        continue;
                    }
                    for (var j = range.fromCell; j <= range.toCell; j++) {
                        var col = columns[j], val = extractor(row, col);
                        if (val != null) {
                            text += lang.htmlText("" + val);
                        }
                        if (j < range.toCell) {
                            text += "\t";
                        }
                    }
                    text += "\r\n";
                }
            }
            clipboard.copy(text);
        };
        // Event handlers: end
        // Slick formatters: begin
        SlickObjectListDataPresenter.prototype.rowNumCellFormatter = function (row, cell, value, columnDef, dataItem) {
            return (this.dataProvider.getUngroupedIndex(row) + this._startIndex + 1).toString();
        };
        SlickObjectListDataPresenter.prototype.identityFormatter = function (row, cell, value, columnDef, dataItem) {
            return value;
        };
        SlickObjectListDataPresenter.prototype.dataColumnFormatter = function (row, cell, value, columnDef, dataItem) {
            var that = this, dataProvider = that.dataProvider, col;
            if (dataProvider) {
                col = columnDef.source;
                if (value === dataProvider.loadingValue) {
                    return col.loadingHtml || that.options.loadingHtml;
                }
                if (value === dataProvider.errorValue) {
                    return col.errorHtml || that.options.errorHtml;
                }
            }
            return value;
        };
        // Slick formatters: end
        // Affix: begin
        SlickObjectListDataPresenter.prototype.affixAdd = function () {
            var that = this;
            if (that.options.affixHeader && that.eventPublisher && that.gridElement) {
                // trick: clear 'position:relative', otherwise affix doesn't work
                that.eventPublisher.publish("ui.affix.add_element", {
                    element: $(".slick-header", that.gridElement).css("position", ""),
                    controlledBy: that.gridElement,
                    affixTo: "top"
                });
            }
        };
        SlickObjectListDataPresenter.prototype.affixRemove = function () {
            var that = this;
            if (that.options.affixHeader && that.eventPublisher && that.gridElement) {
                that.eventPublisher.publish("ui.affix.remove_element", {
                    element: $(".slick-header", that.gridElement)
                });
            }
        };
        SlickObjectListDataPresenter.prototype.affixRefresh = function () {
            this.notifyDOMChanged();
        };
        // Affix: end
        SlickObjectListDataPresenter.prototype.findDefaultMenuItem = function () {
            var menu = this.viewModel.menuRow;
            return menu && menu.getDefaultItem();
        };
        SlickObjectListDataPresenter.prototype._enrichModelColumns = function () {
            var that = this, columns = [], columnRoles = {}, // all columns roles
            ensureRole;
            if (!that.viewModel.updateColumns) {
                return;
            }
            // calculate all roles
            that.viewModel.columns.forEach(function (col) {
                if (col.role) {
                    columnRoles[col.role] = true;
                }
            });
            // add service columns
            ensureRole = function (role) {
                if (!columnRoles[role]) {
                    columnRoles[role] = true;
                    columns.push({
                        name: "#" + role,
                        role: role,
                        order: -1
                    });
                }
            };
            if (that.options.canMoveRows) {
                ensureRole("reorder");
            }
            if (that.options.hasRowNum) {
                ensureRole("number");
            }
            if (that.options.hasCheckboxes) {
                ensureRole("checkbox");
            }
            if (columns.length) {
                that.viewModel.updateColumns(columns);
            }
        };
        SlickObjectListDataPresenter.prototype._markGridColumnIconic = function (gridColumns, rowStateIcon) {
            var iconInited;
            if (!rowStateIcon) {
                return;
            } // iconic states are disabled
            gridColumns.forEach(function (col) {
                if (rowStateIcon === true && col.source.role !== "data") {
                    return;
                }
                if (!iconInited && (rowStateIcon === true || col.source.name === rowStateIcon)) {
                    col.cssClass = core.html.addCssClass(col.cssClass, "x-slick-cell-iconic");
                    iconInited = true;
                }
                else {
                    col.cssClass = core.html.removeCssClass(col.cssClass, "x-slick-cell-iconic");
                }
            });
            if (!iconInited && rowStateIcon !== true) {
                // if we didn't find a named column for icon-state then we'll use default approach - first data-column
                this._markGridColumnIconic(gridColumns, true);
            }
        };
        SlickObjectListDataPresenter.prototype._setupGridColumns = function () {
            var that = this, gridColumns, sortable = that.options.canSort && !that.options.canMoveRows;
            if (!that.grid) {
                return;
            }
            // cleanup old columns plugins
            var plugins = {};
            gridColumns = that.grid.getColumns();
            for (var _i = 0, gridColumns_1 = gridColumns; _i < gridColumns_1.length; _i++) {
                var col = gridColumns_1[_i];
                if (col.__plugin) {
                    if (plugins[col.role]) {
                        // такого не должно быть
                        that.grid.unregisterPlugin(col.__plugin);
                    }
                    // NOTE:
                    // до версии 1.34 мы удаляли все плагины и добавляли заново.
                    // Но, если в новых колонках есть та же роль, но и плагин будет тот же, нет смысла его удалять и добавляться занового.
                    // Более того, это может работать неправильно, если плагин колонки должен быть добавлен до плагинов грида.
                    // Например, RowMoveManager должен быть создан до CellRangeSelector - см. https://track.rnd.croc.ru/issue/WC-1714),
                    // иначе не будет работать перенос строк с selectionMode: "cell".
                    // Т.к. _setupGridColumns вызывается в двух случаях: при создании грида (до создания плагинов),
                    // и при рендеренге грида (грид и плагины уже созданы),
                    // то во втором случае плагины грида уже созданы и надо сохранить плагины колонок, если они будут использованы.
                    plugins[col.role] = col.__plugin;
                }
            }
            // create grid columns from columns defined in viewModel
            gridColumns = [];
            for (var _a = 0, _b = that.viewModel.columns; _a < _b.length; _a++) {
                var col = _b[_a];
                if (col.hidden) {
                    continue;
                }
                var role = col.role || (col.command ? "command" : "data"), gridCol = {
                    id: col.name,
                    name: col.title,
                    role: role,
                    source: col,
                    gridOptions: null
                }, roleCol = that.options.columnRoles[role], plugin = void 0, selectCol = void 0;
                // move values from gridOptions into column
                if (col.gridOptions) {
                    lang.append(gridCol, col.gridOptions);
                    delete gridCol.gridOptions;
                }
                switch (role) {
                    case "data":
                        lang.append(gridCol, {
                            field: col.prop,
                            sortable: sortable && that.viewModel.isColumnSortable(col)
                        });
                        break;
                    case "checkbox":
                        plugin = plugins["checkbox"];
                        if (!plugin) {
                            plugin = new Slick.EnhancedCheckboxSelectColumn();
                            that.grid.registerPlugin(plugin);
                        }
                        else {
                            delete plugins["checkbox"];
                        }
                        selectCol = plugin.getColumnDefinition();
                        gridCol.id = selectCol.id;
                        gridCol.name = selectCol.name;
                        gridCol.formatter = selectCol.formatter;
                        gridCol.__plugin = plugin;
                        break;
                    case "reorder":
                        plugin = plugins["reorder"];
                        if (!plugin) {
                            plugin = new Slick.RowMoveManager();
                            plugin.onBeforeMoveRows.subscribe(that.onGridBeforeMoveRows.bind(that));
                            plugin.onMoveRows.subscribe(that.onGridMoveRows.bind(that));
                            that.grid.registerPlugin(plugin);
                            gridCol.__plugin = plugin;
                        }
                        else {
                            delete plugins["reorder"];
                        }
                        break;
                }
                // NOTE: formatters in grid and in viewModel have different signatures,
                // so we shouldn't copy col.formatter to gridCol.formatter
                gridCol.formatter = gridCol.formatter ||
                    (roleCol && roleCol.formatter && roleCol.formatter.bind(that)) ||
                    that.dataColumnFormatter.bind(that);
                lang.append(gridCol, col, roleCol);
                gridColumns.push(gridCol);
            }
            lang.forEach(plugins, function (p) {
                that.grid.unregisterPlugin(p);
            });
            that._markGridColumnIconic(gridColumns, that.options.rowStateIcon);
            that.grid.setColumns(gridColumns);
            that._setGridSorting();
        };
        SlickObjectListDataPresenter.prototype.createCellSelecectionModel = function () {
            // NOTE: CellSelectionModel работает неправильно - она учитывает только ячейку ОТ и ячейку ДО
            // (откуда и докуда тянули),при этом range может включать строку с selectable=false,
            // в итоге она попадет в selection.
            // Поэтому используем свой плагин EnhancedCellSelectionModel основанный на CellSelectionModel.
            /*	NOTE: CellSelectionModel plugin requires the following modules:
             "vendor/slick/plugins/slick.cellrangedecorator",
             "vendor/slick/plugins/slick.cellrangeselector",
             "vendor/slick/plugins/slick.cellselectionmodel"
             Наша реализация EnhancedCellSelectionModel:
             "slick.enhancedcellselectionmodel"
             */
            return new Slick.EnhancedCellSelectionModel({
                selectActiveCell: false,
                rangeSelector: {
                    selectionCss: {}
                }
            });
        };
        SlickObjectListDataPresenter.prototype.createRowSelectionModel = function () {
            /*	NOTE: RowSelectionModel plugin requires the following modules:
             "vendor/slick/plugins/slick.rowselectionmodel",
             */
            return new Slick.RowSelectionModel({ selectActiveRow: false });
        };
        SlickObjectListDataPresenter.prototype._setSelectionModel = function (model) {
            var grid = this.grid;
            if (model && lang.isObject(model) && model.init && model.destroy) {
                grid.setSelectionModel(model);
            }
            else if (model === "cell") {
                // select cells
                grid.setSelectionModel(this.createCellSelecectionModel());
            }
            else if (model === "none" || model === "off") {
                // не нужна SelectionModel
            }
            else {
                // select rows
                grid.setSelectionModel(this.createRowSelectionModel());
            }
        };
        SlickObjectListDataPresenter.prototype._registerCopyManager = function () {
            var that = this, plugin = new Slick.EnhancedCellCopyManager();
            plugin.onCopyCells.subscribe(that.onGridCopyCells.bind(that));
            that.grid.registerPlugin(plugin);
        };
        SlickObjectListDataPresenter.prototype._setGridSorting = function () {
            var that = this, orderBy = that.viewModel.orderedBy(), orderItem = orderBy && orderBy[0], col;
            if (!orderItem || !orderItem.prop) {
                // remove sorting (if any)
                that.grid.setSortColumns([]);
                return;
            }
            col = lang.find(that.grid.getColumns(), function (c) {
                // NOTE: see SlickObjectListDataPresenter.onGridSort as well
                return c.source && (c.source.name === orderItem.prop);
            });
            if (col) {
                that.grid.setSortColumn(col.id, !orderItem.desc);
            }
        };
        SlickObjectListDataPresenter.prototype._selectGridRows = function () {
            var that = this, selectedRows, activeRow;
            // don't do anything if the part is unloaded
            if (!that.grid || !that.domElement) {
                return;
            }
            if (that._selectionSync) {
                return;
            }
            that._selectionSync = true;
            try {
                selectedRows = that.viewModel.selection.all()
                    .map(function (item) { return that.dataProvider.getModelItemIndex(item); })
                    .filter(function (row) { return row >= 0; });
                if (that.grid.getSelectionModel()) {
                    that.grid.setSelectedRows(selectedRows);
                }
            }
            finally {
                that._selectionSync = undefined;
            }
        };
        SlickObjectListDataPresenter.prototype._activateGridRow = function () {
            var that = this, activeItem, activeRow;
            // don't do anything if the part is unloaded
            if (!that.grid || !that.domElement) {
                return;
            }
            if (that._activeSync) {
                return;
            }
            that._activeSync = true;
            try {
                activeItem = that.viewModel.activeItem();
                if (activeItem) {
                    activeRow = that.dataProvider.getModelItemIndex(that.viewModel.activeItem());
                    if (activeRow >= 0) {
                        that.grid.setActiveCell(activeRow, that._activeColumn || 0);
                    }
                    else {
                        that.grid.resetActiveCell();
                    }
                }
                else if (that._activeNonDataItem) {
                    activeRow = that.dataProvider.getItemIndex(that._activeNonDataItem);
                    if (activeRow >= 0) {
                        that.grid.setActiveCell(activeRow, 0);
                    }
                    else {
                        // active item isn't found - clear it
                        that._activeNonDataItem = null;
                        that.grid.resetActiveCell();
                    }
                }
                else {
                    that.grid.resetActiveCell();
                }
            }
            finally {
                that._activeSync = undefined;
            }
        };
        SlickObjectListDataPresenter.prototype._applyViolations = function () {
            var _this = this;
            if (!this.grid) {
                return;
            }
            var list = this.viewModel, violations = list.violations, hash = {};
            //
            violations.forEach(function (violation) {
                if (!violation.object) {
                    return;
                }
                var cssClass = "-invalid";
                if (violation.severity === "warning") {
                    cssClass = "-warning";
                }
                else if (violation.severity === "info") {
                    // not supported
                    return;
                }
                var row = _this.dataProvider.getModelItemIndex(violation.object);
                if (row >= 0) {
                    var rowHash = hash[row] || (hash[row] = {});
                    for (var _i = 0, _a = list.columns; _i < _a.length; _i++) {
                        var col = _a[_i];
                        if (col.hidden) {
                            continue;
                        }
                        var isInvalid = violation.props ?
                            col.prop && violation.props.indexOf(col.prop) >= 0 :
                            true;
                        if (isInvalid) {
                            // warning should not overwrite error:
                            if (violation.severity === "warning" && !rowHash[col.name] || violation.severity !== "warning") {
                                // NOTE: "-violation" class will be used for showing tooltip, see _initViolationTooltip
                                rowHash[col.name] = cssClass + " -violation";
                            }
                        }
                    }
                }
            });
            this.grid.setCellCssStyles("violations", hash);
        };
        SlickObjectListDataPresenter.prototype._getCellViolation = function (element) {
            var violations = this.viewModel.violations;
            if (!violations || !violations.count()) {
                return;
            }
            // NOTE: `getCellFromEvent` expects DOM Event as an argument, but in fact its `target` field is only used
            var cell = this.grid.getCellFromEvent({ target: element });
            if (!cell) {
                return;
            }
            var dataRow = this.dataProvider.getItem(cell.row), item = dataRow && dataRow.item;
            if (!item) {
                return;
            }
            var gridCol = this.grid.getColumns()[cell.cell], col = gridCol && gridCol.source;
            if (!col || !col.prop) {
                return;
            }
            return violations.find(function (v) {
                return v.object === item && v.props && v.props.indexOf(col.prop) >= 0;
            });
        };
        SlickObjectListDataPresenter.prototype._initViolationTooltip = function () {
            var that = this;
            // По умолчанию (значение false) создаем DOM-элемент c tooltip'ом под текущим элементом (строкой таблицы).
            // Попытаемся найти главный контейнер таблицы, чтобы создавать DOM-элемент c tooltip'ом в нем.
            // Не создаем в body, чтобы не было проблем с подсказками в диалогах.
            var tooltipContainer = false;
            var $listDataContainers = that.gridElement.parents(".x-list-data-container");
            if ($listDataContainers.length > 0 && $listDataContainers[0].id) {
                tooltipContainer = "#" + $listDataContainers[0].id;
            }
            that.gridElement.tooltip({
                selector: ".slick-cell.-violation",
                title: function () {
                    // NOTE: 'this' is the element that the tooltip is attached to
                    var violation = that._getCellViolation(this);
                    if (!violation) {
                        return "";
                    }
                    var message = violation.error;
                    return formatters.isHtml(message) ?
                        message.toHTML() :
                        lang.encodeHtml(message.toString()); // NOTE: result is always treated as HTML, so we should encode plain text
                },
                html: true,
                placement: "auto",
                delay: { show: 500 },
                container: tooltipContainer,
                trigger: "hover",
                // NOTE: the tooltip will be placed within the bounds of `viewport` element
                viewport: that.gridElement.find(".slick-viewport")
            });
        };
        SlickObjectListDataPresenter.prototype._updateHScroller = function (options) {
            var that = this, remove, $viewport, scrollWidth;
            if (!that.domElement || !that.gridElement) {
                return;
            }
            options = options || {};
            if (!that.options.virtualHScroll) {
                return;
            }
            $viewport = that._$viewport;
            if (!$viewport) {
                $viewport = that._$viewport = that.gridElement.find(".slick-viewport");
            }
            scrollWidth = $viewport[0].scrollWidth;
            remove = options.remove || (scrollWidth <= $viewport.width());
            if (remove) {
                if (that._$virtualScroller) {
                    that.eventPublisher.publish("ui.affix.remove_element", {
                        element: that._$virtualScroller
                    });
                    that._$virtualScroller.remove();
                    that._$virtualScroller = undefined;
                }
            }
            else {
                // create or update
                if (!that._$virtualScroller) {
                    // create
                    $viewport.css("overflow-x", "hidden");
                    that._$virtualScroller = $("<div><div style='width:" + scrollWidth + "px'>&nbsp;</div></div>")
                        .css({
                        height: core.platform.measureScrollbar() + "px",
                        "overflow-y": "hidden",
                        "overflow-x": "scroll",
                        width: "100%"
                    })
                        .appendTo(that.gridElement);
                    // sync scrolling: from scroller to grid:
                    that._$virtualScroller.on("scroll", function () {
                        var left = that._$virtualScroller.scrollLeft();
                        that._$virtualScroller._scrolling = true;
                        that._$viewport.scrollLeft(left);
                        that._$virtualScroller._scrolling = false;
                    });
                    // sync scrolling: from grid to scroller:
                    that._$viewport.on("scroll", function () {
                        if (that._$virtualScroller && !that._$virtualScroller._scrolling) {
                            var left = that._$viewport.scrollLeft();
                            that._$virtualScroller.scrollLeft(left);
                        }
                    });
                    that.eventPublisher.publish("ui.affix.add_element", {
                        element: that._$virtualScroller,
                        controlledBy: that.gridElement,
                        affixTo: "bottom"
                    });
                    if (!that._onMouseWheel) {
                        that._onMouseWheel = that.onMouseWheel.bind(that);
                        that.$domElement.on("mousewheel", ".x-grid", that._onMouseWheel);
                    }
                }
                else {
                    that._$virtualScroller.children().css("width", scrollWidth + "px");
                }
            }
        };
        SlickObjectListDataPresenter.prototype._collectExpandedItems = function (group, items) {
            if (!group || !group.__group || group.collapsed) {
                return;
            }
            if (group.rows) {
                for (var _i = 0, _a = group.rows; _i < _a.length; _i++) {
                    var row = _a[_i];
                    if (row.item) {
                        items.push(row.item);
                    }
                }
            }
            if (group.groups) {
                for (var _b = 0, _c = group.groups; _b < _c.length; _b++) {
                    var childGroup = _c[_b];
                    this._collectExpandedItems(childGroup, items);
                }
            }
        };
        SlickObjectListDataPresenter.defaultGroupOptions = {
            getter: null,
            formatter: null,
            comparer: function (a, b) { return (a.value === b.value ? 0 : (a.value > b.value ? 1 : -1)); },
            predefinedValues: [],
            aggregators: [],
            aggregateEmpty: false,
            aggregateCollapsed: false,
            aggregateChildGroups: false,
            collapsed: false,
            displayTotalsRow: true
        };
        /**
         * @static
         */
        SlickObjectListDataPresenter.defaultOptions = {
            hasCheckboxes: true,
            canMoveRows: false,
            canSort: true,
            affixHeader: true,
            autoScrollToTop: false,
            /**
             * loadingHtml Markup for column with value being loaded
             * @type {String}
             */
            loadingHtml: "<i class='text-muted'>" + resources.loading + "</i>",
            errorHtml: "<i class='text-danger text-bold'>" + resources["objectList.dataError"] + "</i>",
            gridCssClass: "",
            /**
             * name of selection model or Slick plugin instance
             * set grid selection model: cell | row | none
             * @type {String|Object}
             */
            selectionModel: "row",
            columnRoles: {
                data: {
                    width: 100,
                    cssClass: "x-slick-cell-data"
                },
                aux: {
                    width: 100,
                    sortable: true
                },
                command: {
                    width: 100,
                    sortable: false,
                    cssClass: "x-slick-cell-command",
                    formatter: SlickObjectListDataPresenter.prototype.identityFormatter
                },
                reorder: {
                    id: "#move",
                    width: 30,
                    //minWidth: 30,
                    resizable: false,
                    sortable: false,
                    cssClass: "x-slick-cell-reorder",
                    behavior: "selectAndMove"
                },
                number: {
                    id: "#num",
                    width: 45,
                    //minWidth: 30,
                    resizable: false,
                    sortable: false,
                    cssClass: "x-slick-cell-row-num",
                    formatter: SlickObjectListDataPresenter.prototype.rowNumCellFormatter
                },
                checkbox: {
                    width: 30,
                    //minWidth: 30,
                    resizable: false,
                    sortable: false,
                    cssClass: "x-slick-cell-checkbox",
                    toolTip: resources["objectList.columns.check"]
                },
                icon: {
                    id: "#icon",
                    width: 32,
                    sortable: false,
                    resizable: false,
                    cssClass: "x-slick-cell-icon",
                    toolTip: resources["objectList.columns.icon"] // for slick.autotooltips, otherwise tooltip is '<span...></span>'
                }
            },
            rowStateIcon: true,
            rowHeightDelta: 5,
            rowHeightMin: 27,
            rowHeightMax: undefined,
            rowHeightMultiline: 43,
            gridOptions: {
                explicitInitialization: true,
                enableCellNavigation: true,
                enableColumnReorder: true,
                enableTextSelectionOnCells: true,
                /**
                 * Prevents vertical scrolling in grid, turns off virtualization
                 * @type {Boolean}
                 */
                autoHeight: true,
                rowHeight: 32,
                defaultColumnWidth: 100,
                fullWidthRows: true,
                forceFitColumns: true,
                multiColumnSort: true,
                dataItemColumnValueExtractor: function (item, col) {
                    // overrides for grouping rows
                    if (item.__group) {
                        return "Title#" + item.groupingKey;
                    }
                    // overrides for totals rows
                    if (item.__groupTotals) {
                        return "Total#" + item.group.groupingKey;
                    }
                    return item.get(col.id);
                }
            }
        };
        SlickObjectListDataPresenter.hostDefaultOptions = {
            dialog: {
                affixHeader: false,
                virtualHScroll: false,
                gridOptions: {
                    autoHeight: false
                }
            }
        };
        return SlickObjectListDataPresenter;
    }(Part));
    // backward compatibility
    SlickObjectListDataPresenter.mixin({
        defaultOptions: SlickObjectListDataPresenter.defaultOptions,
        contextDefaultOptions: SlickObjectListDataPresenter.hostDefaultOptions,
        defaultGroupOptions: SlickObjectListDataPresenter.defaultGroupOptions
    });
    return SlickObjectListDataPresenter;
});
//# sourceMappingURL=SlickObjectListDataPresenter.js.map