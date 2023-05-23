/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import SlickObjectListDataPresenter = require("lib/ui/slick/SlickObjectListDataPresenter");
import "lib/ui/Popup";
import domain = require("lib/domain/.domain");
import list = require("lib/ui/list/.list");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import lang = core.lang;
import ValueType = domain.metadata.ValueType;
import IList = list.IList;
import ObjectListColumn = list.ObjectListColumn;
import SlickGrid = SlickObjectListDataPresenter.SlickGrid;
import peEnumDropDownSelect2 = require("lib/ui/pe/peEnumDropDownSelect2");
export declare class ColumnFilterCondition {
    static Enum: {
        [key: string]: any;
    };
}
export interface ISlickColumnFilterPersist {
    buildRestriction(): any;
    restoreRestriction(restriction: any): void;
    canRenderCondition(): boolean;
    renderCondition(domElement: JQuery | HTMLElement): void;
    paramName(): string;
}
export declare abstract class SlickColumnFilterBase extends core.ui.Part implements ISlickColumnFilterPersist {
    /**
     * @constructs SlickColumnFilterBase
     * @extends Part
     * @param options
     * @param {ObjectListColumn} options.column
     */
    constructor(isServerFilter: boolean, options?: SlickColumnFilterBase.Options);
    protected tweakOptions(options: SlickColumnFilterBase.Options): void;
    options: SlickColumnFilterBase.Options;
    column: ObjectListColumn;
    isServerFilter?: boolean;
    static defaultOptions: SlickColumnFilterBase.Options;
    abstract match(value: any): boolean;
    abstract isEmpty(): boolean;
    abstract clear(): void;
    abstract focus(): void;
    static events: {
        FILTER_CHANGED: string;
    };
    events: typeof SlickColumnFilterBase.events;
    protected _triggerFilterChanged(): void;
    protected _createPE(options: PropertyEditor.Options, viewModel?: any): PropertyEditor;
    paramName(): string;
    abstract buildRestriction(): any;
    abstract restoreRestriction(restriction: any): void;
    canRenderCondition(): boolean;
    renderCondition(domElement: JQuery | HTMLElement): void;
    protected peCondition: PropertyEditor;
    condition: lang.ObservableProperty<any>;
    protected isNullCondition(testField?: string): boolean;
    abstract getRenderConditionOptions(): peEnumDropDownSelect2.Options;
    protected doRender(domElement: JQuery | HTMLElement): void;
}
export declare namespace SlickColumnFilterBase {
    interface Options extends core.ui.Part.Options {
        vt?: ValueType;
        pe?: PropertyEditor.Options;
        column?: ObjectListColumn;
        rawValue?: boolean;
        cssClass?: string;
        conditionDropDownMembers?: string[];
        orientation?: "vertical" | "horizontal";
        paramName?: string;
    }
}
export declare class SlickColumnFilterValue extends SlickColumnFilterBase {
    /**
     * @constrcuts SlickColumnFilterValue
     * @extends SlickColumnFilterBase
     * @param options
     */
    constructor(isServerFilter: boolean, options?: SlickColumnFilterValue.Options);
    peDomElement: JQuery | HTMLElement;
    protected togglePeVisibility(): boolean;
    protected _conditionTokenChanged(): void;
    options: SlickColumnFilterValue.Options;
    /**
     * @observable-property {*}
     */
    value: lang.ObservableProperty<any>;
    protected pe: PropertyEditor;
    protected matcher: SlickColumnFilterValue.MatchCallback;
    protected defaultMatcher(value: any, filterValue: any): boolean;
    match(value: any): boolean;
    isEmpty(): boolean;
    clear(): void;
    focus(): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected defaultConditionItem(): string;
    protected isBooleanType(): boolean;
    canRenderCondition(): boolean;
    getRenderConditionOptions(): peEnumDropDownSelect2.Options;
    buildRestriction(): any;
    restoreRestriction(restriction: any): any;
    buildRestrictionBool(): any;
    restoreRestrictionBool(restriction: any): any;
    buildRestrictionString(): any;
    restoreRestrictionString(restriction: any): any;
}
export declare namespace SlickColumnFilterValue {
    interface Options extends SlickColumnFilterBase.Options {
        matcher?: MatchCallback;
    }
    type MatchCallback = (value: any, filterValue: any) => boolean;
}
export declare class SlickColumnFilterEnum extends SlickColumnFilterValue {
    constructor(isServerFilter: boolean, options?: SlickColumnFilterValue.Options);
    isFlags: boolean;
    protected defaultMatcher(value: any, filterValue: any): boolean;
    protected defaultConditionItem(): string;
    getRenderConditionOptions(): peEnumDropDownSelect2.Options;
    buildRestriction(): any;
    restoreRestriction(restriction: any): any;
}
export declare class SlickColumnFilterRange extends SlickColumnFilterBase {
    /**
     * @constructs SlickColumnFilterRange
     * @extends SlickColumnFilterBase
     * @param {Object} options
     */
    constructor(isServerFilter: boolean, options?: SlickColumnFilterRange.Options);
    options: SlickColumnFilterRange.Options;
    commands: core.commands.ICommandLazyMap;
    menu: core.ui.Menu;
    protected peFrom: PropertyEditor;
    protected peTo: PropertyEditor;
    static defaultOptions: SlickColumnFilterRange.Options;
    /**
     * @observable-property {*}
     */
    from: lang.ObservableProperty<any>;
    /**
     * @observable-property {*}
     */
    to: lang.ObservableProperty<any>;
    match(value: any): boolean;
    isEmpty(): boolean;
    clear(): void;
    focus(): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    getRenderConditionOptions(): peEnumDropDownSelect2.Options;
    canRenderCondition(): boolean;
    buildRestriction(): any;
    restoreRestriction(restriction: any): any;
}
export declare namespace SlickColumnFilterRange {
    interface Options extends SlickColumnFilterBase.Options {
        menu?: core.ui.Menu.Options;
        commands?: core.commands.ICommandLazyMap;
    }
}
declare module "lib/ui/list/.list" {
    interface ObjectListColumn {
        filter?: string | SlickObjectListDataPresenterAddon.ColumnFilterOptions;
    }
}
export declare const SlickObjectListDataPresenterOverrides: lang.Constructor<SlickObjectListDataPresenter>;
export declare class SlickObjectListDataPresenterAddon extends SlickObjectListDataPresenterOverrides {
    ColumnFilterClasses: lang.Map<lang.Constructor<SlickColumnFilterBase>>;
    storedFilters: lang.ObservableProperty<any>;
    isServerFilter: lang.ObservableProperty<boolean>;
    options: SlickObjectListDataPresenterAddon.Options;
    protected columnFilters: lang.Map<SlickColumnFilterBase>;
    protected applied: boolean;
    protected getIsServerFilter(): boolean;
    protected getServerFilterOptions(): SlickObjectListDataPresenterAddon.ColumnFilterServerOptions;
    setViewModel(viewModel: IList): void;
    protected _initCommands(): void;
    protected _clearFilters(): boolean;
    dispose(): void;
    protected _applyServerFilters(): void;
    protected onGridInitialized(args: {
        grid: SlickGrid;
    }): void;
    protected _createColumnFilter(col: ObjectListColumn): SlickColumnFilterBase;
    protected _calcColumnFilters(item: any): boolean;
    protected _applyColumnFilters(filter: SlickColumnFilterBase): void;
    protected _storeColumnFilters(filter: SlickColumnFilterBase): void;
    protected _applyColumnFiltersAsync: () => void;
    protected _onColumnFilterClick(col: ObjectListColumn, e: JQueryEventObject): void;
    protected _composeColumnRestrictions(args: any): void;
    protected _onListDataLoading(sender: any, args: any): void;
    protected _onListDataLoaded(): void;
    protected _updateClearButtonStyle(): void;
    private _restoreColumnFilterValue(colFilter);
    protected _onSelectionChange(sender: any, args: lang.ObservableCollectionChangeArgs<any>): void;
}
export declare namespace SlickObjectListDataPresenterAddon {
    interface ColumnFilterServerOptions {
        server?: boolean;
        paramName?: string;
        rawValues?: boolean;
        orientation?: "vertical" | "horizontal";
        cssClass?: string;
        maxFiltersCount?: number;
    }
    interface Options extends SlickObjectListDataPresenter.Options {
        columnFilters?: boolean | ColumnFilterServerOptions;
    }
    interface ColumnFilterOptions extends SlickColumnFilterBase.Options {
        name?: string;
    }
}
