/// <reference types="slickgrid" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import "lib/ui/slick/slick.bootstrap";
import lang = core.lang;
import ObservableExpression = lang.support.ObservableExpression;
import { IList } from "ui/list/.list";
import { Violation } from "lib/validation";
import Options = SlickGridDataProvider.Options;
import RowsMap = SlickGridDataProvider.RowsMap;
import GroupingOptions = SlickGridDataProvider.GroupingOptions;
import SlickGroup = SlickGridDataProvider.SlickGroup;
import SlickGroupTotals = SlickGridDataProvider.SlickGroupTotals;
import GridRow = SlickGridDataProvider.GridRow;
import GridRowMetadata = SlickGridDataProvider.GridRowMetadata;
declare class SlickGridDataProvider extends lang.Observable implements Slick.DataProvider<Slick.SlickData> {
    static defaultOptions: Options;
    viewModel: IList;
    options: Options;
    private _items;
    private _getters;
    private _groupingInfos;
    private _groups;
    private _toggledGroupsByLevel;
    private _groupingDelimiter;
    private _rowsById;
    private _groupRowsById;
    private _groupTotalRowsById;
    private _rows;
    /**
     * Maps the index of the row (the same as in `_rows`) to the index as if grouping is off.
     */
    private _ungroupedRows;
    /**
     * @constructs SlickGridDataProvider
     * @extends Observable
     * @param viewModel
     * @param options
     */
    constructor(viewModel: IList, options?: Options);
    /**
     * Special value that represent loading cell
     */
    loadingValue: {
        toString: () => string;
    };
    /**
     * Special value that represent an invalid cell
     */
    errorValue: {
        toString: () => string;
    };
    dispose(): void;
    invalidate(): void;
    /**
     * Invalidate an item with the specified index
     * @param viewModelIndex
     * @returns {RowsMap} Rows to refresh
     */
    invalidateItem(viewModelIndex: number): RowsMap;
    protected _initGetters(): void;
    getLength(): number;
    getItem(rowIndex: number): GridRow;
    getItem<T extends SlickGridDataProvider.SlickGridDataItem>(rowIndex: number): T;
    getItem<T extends SlickGroup>(rowIndex: number): T;
    getItem<T extends SlickGroupTotals>(rowIndex: number): T;
    getItemMetadata(rowIndex: number): GridRowMetadata;
    getItemIndex(item: GridRow): number;
    getModelItemIndex(viewModelItem: any): number;
    isItemSelectable(rowIndex: number): boolean;
    /**
     * Returns the index of the row as if grouping is off.
     * @param rowIndex
     * @returns {number}
     */
    getUngroupedIndex(rowIndex: number): number;
    getGrouping(): SlickGridDataProvider.GroupingInfo[];
    setGrouping(groupingInfo: GroupingOptions | GroupingOptions[]): void;
    /**
     * @param args Either a Slick.Group's "groupingKey" property, or a
     * variable argument list of grouping values denoting a unique path to the row.  For
     * example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
     * the 'high' setGrouping.
     */
    collapseGroup(...args: string[]): void;
    /**
     * @param args Either a Slick.Group's "groupingKey" property, or a
     * variable argument list of grouping values denoting a unique path to the row.  For
     * example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
     * the 'high' setGrouping.
     */
    expandGroup(...args: string[]): void;
    protected _extractGroups(rows: SlickGridDataProvider.SlickGridDataItem[], parentGroup?: SlickGroup): SlickGroup[];
    protected _getGroupingValue(item: any, gi: SlickGridDataProvider.GroupingInfo): any;
    protected _getGroupingKey(val: any): string;
    protected _calculateGroupTotals(group: SlickGroup): void;
    protected _calculateTotals(groups: SlickGroup[], level?: number): void;
    protected _finalizeGroups(groups: SlickGroup[], level?: number): void;
    protected _flattenGroupedRows(groups: SlickGroup[], level?: number): GridRow[];
    protected getItemFromViewModel(viewModelIndex: number): SlickGridDataProvider.SlickGridDataItem;
    protected getViewModelLength(): number;
    protected _toggleGroup(level: number, groupingKey: string, collapse: boolean): void;
    protected isGroupingEnabled(): boolean;
    protected onItemChange(viewModelIndex: number): void;
    protected onItemsChange(): void;
    protected onSelectionChange(sender: any, args: lang.ObservableCollectionChangeArgs<any>): void;
    protected onViolationsChange(sender: any, args: lang.ObservableCollectionChangeArgs<Violation>): void;
    protected clearRows(): void;
    protected ensureRows(): void;
    protected notifyRowsChanged(rows?: RowsMap): void;
}
declare namespace SlickGridDataProvider {
    interface Options {
        dataItemMetadataProvider: {
            getItemMetadata(item: any): GridRowMetadata;
        };
        groupItemMetadataProvider: Slick.Data.GroupItemMetadataProvider<Slick.SlickData>;
        defaultGroupOptions: Slick.Data.GroupingOptions<Slick.SlickData>;
    }
    interface RowsMap {
        all?: boolean;
        [row: number]: boolean;
    }
    interface GroupingOptions extends Slick.Data.GroupingOptions<Slick.SlickData> {
        getGroupRowMetadata?: (item: any) => {};
        getTotalsRowMetadata?: (item: any) => {};
    }
    class SlickGridDataItem {
        item: any;
        private _expr;
        private _loadingValue;
        private _vals;
        /**
         * @constructs SlickGridDataItem
         * @param item
         * @param getters
         * @param exprOptions
         * @param {Boolean} [trackId] Observe changing of id also
         */
        constructor(item: any, getters: lang.Map<() => any>, exprOptions: ObservableExpression.Options, trackId?: boolean);
        dispose(): void;
        invalidate(): void;
        get(prop: string): any;
    }
    interface DataRow extends SlickGridDataItem {
    }
    interface NonDataRow extends Slick.NonDataRow {
        __nonDataRow?: boolean;
    }
    interface SlickGroup extends NonDataRow, Slick.Group<SlickGridDataItem> {
        __group?: boolean;
    }
    interface SlickGroupTotals extends NonDataRow, Slick.GroupTotals<SlickGridDataItem> {
        __groupTotals?: boolean;
    }
    type GridRow = SlickGridDataItem | SlickGroup | SlickGroupTotals;
    type GridRowMetadata = Slick.RowMetadata<GridRow>;
    interface GroupingInfo extends GroupingOptions {
        getterIsAFn: boolean;
        collapsed: any;
    }
    interface GroupCollapsingEventArgs {
        row: number;
        group: SlickGroup;
        collapse: boolean;
    }
}
export = SlickGridDataProvider;
