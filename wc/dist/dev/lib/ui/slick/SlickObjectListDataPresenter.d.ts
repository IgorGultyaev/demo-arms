/// <reference types="jquery" />
/// <reference types="slickgrid" />
/// <reference types="slickgrid/slick.rowselectionmodel" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Part = require("lib/ui/Part");
import Menu = require("lib/ui/menu/Menu");
import * as Slick from "lib/ui/slick/slick.bootstrap";
import SlickGridDataProvider = require("lib/ui/slick/SlickGridDataProvider");
import "xcss!lib/ui/styles/slickObjectListPresenter";
import "xcss!lib/ui/styles/contextParts";
import "vendor/jquery.mousewheel";
import { Violation } from "lib/validation";
import list = require("lib/ui/list/.list");
import lang = core.lang;
import IList = list.IList;
import IObjectListDataPresenter = list.IObjectListDataPresenter;
import SlickGroup = SlickGridDataProvider.SlickGroup;
import RowsMap = SlickGridDataProvider.RowsMap;
import GridRowMetadata = SlickGridDataProvider.GridRowMetadata;
import GroupingOptions = SlickGridDataProvider.GroupingOptions;
import GroupCollapsingEventArgs = SlickGridDataProvider.GroupCollapsingEventArgs;
import Options = SlickObjectListDataPresenter.Options;
import RenderGridOptions = SlickObjectListDataPresenter.RenderGridOptions;
import ObjectListColumn = SlickObjectListDataPresenter.ObjectListColumn;
import GridColumn = SlickObjectListDataPresenter.GridColumn;
import SlickGrid = SlickObjectListDataPresenter.SlickGrid;
import SlickSelectionModel = SlickObjectListDataPresenter.SlickSelectionModel;
declare class SlickObjectListDataPresenter extends Part implements IObjectListDataPresenter {
    static defaultGroupOptions: GroupingOptions;
    /**
     * @static
     */
    static defaultOptions: Options;
    static hostDefaultOptions: lang.Map<Options>;
    options: Options;
    viewModel: IList;
    eventPublisher: core.IEventPublisher;
    traceSource: core.diagnostics.TraceSource;
    grid: SlickGrid;
    gridElement: JQuery;
    dataProvider: SlickGridDataProvider;
    private _$virtualScroller;
    private _$viewport;
    private _onMouseWheel;
    private _asyncRenderOptions;
    private _asyncCreateScheduled;
    private _activeNonDataItem;
    private _activeColumn;
    private _selectionSync;
    private _activeSync;
    private _columnsSync;
    private _gridWidth;
    private _startIndex;
    /**
     * @constructs SlickObjectListDataPresenter
     * @extends Part
     * @param options
     */
    constructor(options?: Options);
    applyHostContext(opt?: {
        host: string;
    }): core.INavigationService.NavigateOptions;
    /**
     * It's implementation DataProvider.getItemMetadata
     * @param item
     * @returns {GridRowMetadata}
     */
    getItemMetadata(item: any): GridRowMetadata;
    setViewModel(viewModel: IList): void;
    setNumbering(startIndex: number): void;
    setActiveColumn(column: ObjectListColumn): void;
    refreshItems(items?: any[] | any): void;
    changeRowHeight(increase: boolean, delta?: number): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected afterRender(): void;
    unload(): void;
    scrollToSelf(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    isLayoutReady(): boolean;
    isRenderScheduled(): boolean;
    protected _updateRowMultiline(): void;
    /**
     * @param {Object} [options]
     * @param {Boolean} [options.scroll]
     * @param {Boolean} [options.selection]
     * @param {Boolean} [options.active]
     * @param {Boolean} [options.columns]
     * @param {Boolean} [options.resize]
     * @param {Object} [options.rows] Keys are row indexes or 'all', values are always 'true' (e.g. {all:true} or {1:true,5:true,...,n:true})
     */
    protected renderGrid(options?: RenderGridOptions): void;
    protected renderGridAsync(options?: RenderGridOptions, timeout?: number): void;
    protected createGrid(): void;
    protected createGridAsync(timeout?: number): void;
    protected destroyGrid(): void;
    /**
     * @protected
     * @param {Object} args
     * @param {Slick.Grid} args.grid
     */
    protected onGridInitializing(args: {
        grid: SlickGrid;
    }): void;
    /**
     * @protected
     * @param {Object} args
     * @param {Slick.Grid} args.grid
     */
    protected onGridInitialized(args: {
        grid: SlickGrid;
    }): void;
    protected onGroupCollapsing(sender: SlickGridDataProvider, args: GroupCollapsingEventArgs): void;
    protected onModelSelectionChange(): void;
    protected onModelViolationsChange(sender: IList, args: lang.ObservableCollectionChangeArgs<Violation>): void;
    protected onModelActiveItemChange(): void;
    protected onModelColumnsChange(): void;
    protected onWindowResize(): void;
    protected onMouseWheel(e: any): void;
    protected onDisabledChange(): void;
    protected onGridBeforeMoveRows(e: JQueryEventObject, args: any): void;
    protected onGridMoveRows(e: JQueryEventObject, args: any): void;
    protected onGridSelectedRowsChanged(e: JQueryEventObject, args: Slick.OnSelectedRowsChangedEventArgs<any>): void;
    protected onGridActiveCellChanged(e: JQueryEventObject, args: Slick.OnActiveCellChangedEventArgs<any>): void;
    protected onGridSort(e: JQueryEventObject, args: Slick.OnSortEventArgs<any>): void;
    protected onGridColumnsChanged(e: JQueryEventObject, args: Slick.GridEventArgs<any>): void;
    protected onGridClick(e: JQueryEventObject, args: Slick.OnClickEventArgs<any>): void;
    protected onGridDblClick(e: JQueryEventObject, args: Slick.OnDblClickEventArgs<any>): void;
    protected onGridKeyDown(e: JQueryEventObject, args: Slick.OnKeyDownEventArgs<any>): void;
    protected onGridCopyCells(e: JQueryEventObject, args: Slick.OnCopyCellsEventArgs<any>): void;
    protected rowNumCellFormatter(row: number, cell: number, value: any, columnDef: GridColumn, dataItem: any): any;
    protected identityFormatter(row: number, cell: number, value: any, columnDef: GridColumn, dataItem: any): any;
    protected dataColumnFormatter(row: number, cell: number, value: any, columnDef: GridColumn, dataItem: any): any;
    protected affixAdd(): void;
    protected affixRemove(): void;
    protected affixRefresh(): void;
    protected findDefaultMenuItem(): Menu.Item;
    protected _enrichModelColumns(): void;
    protected _markGridColumnIconic(gridColumns: GridColumn[], rowStateIcon: string | boolean): void;
    protected _setupGridColumns(): void;
    protected createCellSelecectionModel(): Slick.EnhancedCellSelectionModel<{}>;
    protected createRowSelectionModel(): Slick.RowSelectionModel<{}, {}>;
    protected _setSelectionModel(model: string | SlickSelectionModel): void;
    protected _registerCopyManager(): void;
    protected _setGridSorting(): void;
    protected _selectGridRows(): void;
    protected _activateGridRow(): void;
    protected _applyViolations(): void;
    protected _getCellViolation(element: Element): Violation;
    protected _initViolationTooltip(): void;
    protected _updateHScroller(options?: {
        remove?: boolean;
    }): void;
    protected _collectExpandedItems(group: SlickGroup, items: any[]): void;
}
declare namespace SlickObjectListDataPresenter {
    interface Options extends Part.Options {
        hasCheckboxes?: boolean;
        hasRowNum?: boolean;
        canMoveRows?: boolean;
        canSort?: boolean;
        affixHeader?: boolean;
        /**
         * Автоматически скролировать вверх к первой строчке при обновлении данных в таблице
         */
        autoScrollToTop?: boolean;
        /**
         * Enables virtual horizontal scrolling - scrollbar affixes about row menu.
         * By default the mode will be enabled if forceFitColumns=false & autoHeight=true.
         */
        virtualHScroll?: boolean;
        traceSourceName?: string;
        /**
         * Markup for column with value being loaded
         */
        loadingHtml?: string;
        /**
         * Markup for column with error
         */
        errorHtml?: string;
        /**
         * Name of model or Slick plugin instance
         * set grid selection model: cell or row
         */
        selectionModel?: "row" | "cell" | "none" | SlickSelectionModel;
        itemMetadata?: GridRowMetadata | ((item) => GridRowMetadata);
        columnRoles?: lang.Map<GridColumn>;
        grouping?: GroupingOptions | GroupingOptions[];
        gridOptions?: Slick.GridOptions<Object>;
        gridCssClass?: string;
        rowStateIcon?: boolean | string;
        /**
         * Number of pixels used to increase/decrease row height
         */
        rowHeightDelta?: number;
        rowHeightMin?: number;
        rowHeightMax?: number;
        rowHeightMultiline?: number;
    }
    interface SlickGrid extends Slick.Grid<Slick.SlickData> {
    }
    interface SlickSelectionModel extends Slick.SelectionModel<Slick.SlickData, any> {
    }
    interface GridColumn extends Slick.Column<Slick.SlickData> {
        source?: ObjectListColumn;
        role?: string;
    }
    interface ObjectListColumn extends list.ObjectListColumn {
        gridOptions?: GridColumn;
    }
    interface RenderGridOptions {
        scroll?: boolean;
        selection?: boolean;
        active?: boolean;
        columns?: boolean;
        resize?: boolean;
        violations?: boolean;
        rows?: RowsMap;
    }
}
export = SlickObjectListDataPresenter;
