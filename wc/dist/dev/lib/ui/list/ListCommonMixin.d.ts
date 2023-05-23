/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Part = require("lib/ui/Part");
import ObservableCollectionView = require("lib/utils/ObservableCollectionView");
import validation = require("lib/validation");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import Dialog = require("lib/ui/Dialog");
import lang = core.lang;
import { ObjectListColumn, IList, IObjectList } from ".list";
import { ObjectListState, ListSelectionMode } from "./.list.types";
import Violation = validation.Violation;
import ObjectRule = validation.ObjectRule;
import OrderByData = lang.collections.OrderByData;
export declare class ListColumnsSettings extends lang.Observable {
    static defaultOptions: ListColumnsSettings.Options;
    columns: ListColumnsSettings.ColumnItem[];
    /**
     * @constructs ListColumnsSettings
     * @extends Observable
     */
    constructor(list: IList, options: ListColumnsSettings.Options);
    /**
     * @observable-property {Boolean}
     */
    groupChecked: lang.ObservableProperty<boolean>;
    private _onGroupCheckedChange(sender, value);
}
export declare namespace ListColumnsSettings {
    interface Options {
        ignoreRoles?: lang.Map<boolean>;
        dialogOptions?: Dialog.Options;
        /**
         * A function that returns a viewModel for customizing the dialog
         */
        columnSettings?: lang.Factory<lang.Observable>;
        template?: HandlebarsTemplateDelegate | string;
    }
    interface ColumnItem extends lang.Observable {
        name: lang.ObservableProperty<string>;
        title: lang.ObservableProperty<string>;
        visible: lang.ObservableProperty<boolean>;
    }
}
export interface ListCommonMixin<T> extends lang.Observable {
    userSettings: core.IUserSettings;
}
/**
 * Mixin with common methods for List and peObjectList.
 */
export declare abstract class ListCommonMixin<T> implements IObjectList<T> {
    states: typeof ObjectListState;
    roleDefaults: lang.Map<ObjectListColumn | (() => ObjectListColumn)>;
    /**
     * @observable-property {ObjectListState}
     */
    state: lang.ObservableProperty<ObjectListState>;
    /**
     * @observable-property {String}
     */
    stateMessage: lang.ObservableProperty<string>;
    /**
     * @observable-property {*}
     */
    activeItem: lang.ObservableProperty<T>;
    items: ObservableCollectionView<T>;
    selection: lang.ObservableCollection<T>;
    violations: lang.ObservableCollection<Violation>;
    columns: ObjectListColumn[];
    commands: lang.Map<core.commands.ICommand>;
    options: ListCommonMixin.Options;
    /**
     * Returns HTML of the cell
     * @param {*} item
     * @param {ObjectListColumn} col
     * @returns {any}
     */
    getCellHtml(item: T, col: ObjectListColumn): string;
    /**
     * Initialize common properties: items and selection
     * Called by List and peObjectList in constructors.
     * @protected
     */
    protected _initializeProps(): void;
    protected onColumnsChanged?(columns: ObjectListColumn[]): void;
    protected _initializeColumn?(col: ObjectListColumn | string): ObjectListColumn;
    /**
     * Initialize columns
     * @protected
     * @abstract
     */
    protected abstract _initializeColumns(): void;
    /**
     * Common logic for _initializeColumns implementations.
     * Method should be used only once (during initialization).
     * For updating columns in runtime use `updateColumns`.
     * @param {ObjectListColumn[]} columns
     */
    protected setupColumns(columns: ObjectListColumn[]): void;
    private _onColumnsChanged(sender, columns);
    private _onColumnsInit(columns);
    private _areColumnsChanged(columns);
    /**
     * Updates current columns with data from specified columns.
     * @param {ObjectListColumn[]} columns
     * @param {Object} [options]
     * @param {Boolean} [options.onlyExisting] true: update only existing columns without adding
     */
    updateColumns(columns: ObjectListColumn[], options?: {
        onlyExisting?: boolean;
    }): void;
    /**
     * Rearrage columns by order, normalize some props (title, role)
     * @param {ObjectListColumn[]} columns
     * @return {ObjectListColumn[]}
     * @private
     */
    private _prepareColumns(columns);
    /**
     * Restore columns as they would be without applying user settings.
     */
    protected resetColumns(): void;
    isColumnSortable(column: string | ObjectListColumn): boolean;
    private _orderedBy;
    orderedBy(): OrderByData[];
    protected setOrderedBy(orderBy?: OrderByData[]): void;
    orderBy(columns: string | string[] | OrderByData | OrderByData[]): void;
    protected createColumnsSettings(): ListColumnsSettings;
    /**
     * Open Dialog for customizing columns
     */
    protected doCustomize(): void;
    protected canChangeRowHeight(): boolean;
    protected doIncreaseRowHeight(): void;
    protected doDecreaseRowHeight(): void;
    protected canCustomize(): boolean;
    /**
     * Checks if the node can be selected
     * @param item
     * @returns {boolean}
     */
    isItemSelectable(item: T): boolean;
    /**
     * Checks if the node can be selected by default (w/o option selectionFilter)
     * @param item
     * @returns {boolean}
     */
    protected _isItemSelectable(item: T): boolean;
    /**
     * Try to select items taking into account selectionFilter and logic from overrides (isItemSelectable)
     * @param items Items to be selected
     */
    setSelection(items: any[]): void;
    protected doSelectAll(): void;
    protected canSelectAll(): boolean;
    protected doSelectNone(): void;
    protected canSelectNone(): boolean;
    /**
     * Returns an array of selected items (if any) or an array with single activeItem (if any).
     * If there are no selected and active items, returns an empty array;
     * @returns {Array}
     */
    protected currentItems(): T[];
    protected shouldValidateItems(): boolean;
    protected shouldValidateItem(item: T): boolean;
    protected validateItem(item: T): Violation[];
    runItemsValidation(items?: T[] | T): Violation[];
    abstract activate(): void;
    abstract getChangedItems(): Array<T>;
}
export declare namespace ListCommonMixin {
    interface Options extends Part.Options, PartCommandMixin.Options {
        columns?: (ObjectListColumn | string)[];
        /**
         * true - inline edit for lists if SlickInlineEditAddon enabled
         */
        inlineEdit?: boolean;
        /**
         * Name of a property or array of properties to use for sorting
         * @type Array|String
         */
        orderBy?: string | string[];
        /**
         * Function for client filtering
         * @type Function
         */
        where?: <T>(item: T, index?: number) => any;
        /**
         * true - show rows numbers
         */
        hasRowNum?: boolean;
        /**
         * true - show check boxes and allow multiple selection
         */
        hasCheckboxes?: boolean;
        /**
         * Selection mode: "multiple" or "single"
         */
        selectionMode?: ListSelectionMode;
        /**
         * Keep selected rows (selection) on page switching (in paging mode).
         */
        persistentSelection?: boolean;
        /**
         * A callback to check whether a row can be added to selection (true - can, false - cannot)
         */
        selectionFilter?: ListSelectionFilterCallback;
        validateItems?: "never" | "explicit" | "always";
        itemRules?: ObjectRule[];
    }
    type ListSelectionFilterCallback = <T>(list: IList, item: T) => boolean;
}
export default ListCommonMixin;
