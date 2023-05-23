/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import DataSource = require("lib/data/DataSource");
import peLoadableMixin = require("lib/ui/pe/peLoadableMixin");
import formatters = require("lib/formatters");
import ObservableCollectionView = require("lib/utils/ObservableCollectionView");
import IDataProvider = PropertyEditorLookup.IDataProvider;
import * as domain from "lib/domain/.domain";
import DomainObject = domain.DomainObject;
import UnitOfWork = domain.UnitOfWork;
import EntityMeta = domain.metadata.EntityMeta;
import { LoadQuerySpec, LoadOptions, LoadQueryParams, LoadResponse } from "lib/interop/.interop";
import lang = core.lang;
import IJsonSerializable = PropertyEditorLookup.IJsonSerializable;
import DataLoadEventArgs = peLoadableMixin.DataLoadEventArgs;
import Menu = require("lib/ui/menu/Menu");
import Part = require("lib/ui/Part");
import ICommand = core.commands.ICommand;
import { IBindable } from "lib/binding";
declare abstract class PropertyEditorLookup extends PropertyEditor {
    /**
     * @enum {String}
     */
    static Modes: {
        "live": string;
        "preload": string;
        "demand": string;
    };
    /**
     * @enum {String}
     */
    static MatchModes: {
        "equals": string;
        "startsWith": string;
        "contains": string;
    };
    static VisualStyle: {
        "lookup": string;
        "dropdown": string;
    };
    /**
     * @enum {String}
     */
    static Events: {
        OPENED: string;
        CLOSED: string;
        DATA_LOADING: string;
        DATA_LOADED: string;
        LOADED: string;
        RESTRICTIONS_CHANGED: string;
    };
    static defaultOptions: PropertyEditorLookup.Options;
    static defaultMenuOldStyle: Menu.Options;
    static defaultMenu: Menu.Options;
    /**
     * @enum {String}
     */
    modes: typeof PropertyEditorLookup.Modes;
    /**
     * @enum {String}
     */
    matchModes: typeof PropertyEditorLookup.MatchModes;
    /**
     * @enum {String}
     */
    events: typeof PropertyEditorLookup.Events;
    visualStyle: PropertyEditorLookup.VisualStyle;
    /**
     * @observable-property {Function|Object}
     */
    filter: lang.ObservableProperty<lang.Lazy<Object | IJsonSerializable>>;
    options: PropertyEditorLookup.Options;
    menu: Menu;
    commands: lang.Map<ICommand>;
    items: lang.ObservableCollection<any>;
    app: core.Application;
    dataProvider: IDataProvider<any, any>;
    protected viewItems: ObservableCollectionView<any>;
    protected menuPresenter: core.ui.MenuButtonsPresenter;
    protected _btnContainer: JQuery;
    protected _isOpen: boolean;
    protected _isLookupStarted: boolean;
    /**
     * @constructs peDropDownLookup
     * @extends PropertyEditor
     * @param options
     */
    constructor(options?: PropertyEditorLookup.Options);
    protected renderMenu($rootElement: JQuery): void;
    render(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected abstract createBindableElement(): IBindable;
    protected createDataProvider(): IDataProvider<any, any>;
    /**
     * Create commands
     * @protected
     * @returns {{Toggle: BoundCommand, Reload: (BoundCommand|undefined), Unlink: BoundCommand}}
     */
    protected createCommands(): lang.Map<ICommand>;
    protected _createMenuDefaults(): Menu.Options;
    protected _createMenu(): Menu;
    private _onRestrictionsChanged(restrictions);
    protected onRestrictionsChanged(restrictions: lang.Lazy<Object | IJsonSerializable>): void;
    protected _filterChanged(e: lang.ObservableChangeArgs): void;
    unload(options?: Part.CloseOptions): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected _getLoadParams(params: LoadQueryParams): LoadQueryParams;
    reload(params?: LoadQueryParams): lang.Promise<void>;
    /**
     * @override
     * @protected
     */
    protected onDataLoading(args: DataLoadEventArgs): void;
    /**
     * @override
     * @protected
     */
    protected onDataLoaded(args: DataLoadEventArgs): void;
    /**
     * @override
     * @protected
     */
    protected onLoaded(): void;
    /**
     * @override
     * @protected
     */
    protected _setItems(items: any[]): void;
    protected _getDropdownValuePresentation(item: any): string | formatters.SafeHtml;
    protected _searchForSuggestions(term: string): lang.Promise<any[]>;
    protected _lookupMatcherDefault(item: any, term: string, matchMode: PropertyEditorLookup.MatchMode): boolean;
    protected _filterItems<T>(items: lang.IObservableCollection<T>, term: string, matchMode?: PropertyEditorLookup.MatchMode): T[];
    protected _isAllowInteraction(): boolean;
    /**
     * @override
     * @protected
     */
    protected _renderBeginLoading(): void;
    /**
     * @override
     * @protected
     */
    protected _renderEndLoading(): void;
    protected doToggleDrop(): void;
    protected canToggleDrop(): boolean;
    protected _doReload(): void;
    protected canReload(): boolean;
    protected _doClear(): void;
    protected canClear(): boolean;
    protected abstract _renderViewItems(): void;
    toggle(): void;
    private _toggle();
    protected abstract _open(): void;
    protected abstract _close(): void;
}
interface PropertyEditorLookup extends peLoadableMixin {
}
declare namespace PropertyEditorLookup {
    type State = string;
    type Mode = string;
    type MatchMode = string;
    type VisualStyle = string;
    interface IJsonSerializable {
        toJson(): Object;
    }
    /**
     * Provides data for peDropDownLookup.
     * TValue - type of value of peDropDownLookup, TItem - type of raw data item returned by this provider.
     */
    interface IDataProvider<TValue, TItem> {
        loadItems(query?: LoadQuerySpec, options?: LoadOptions): lang.Promise<TItem[]>;
        getValue(item: TItem): TValue;
        getValuePresentation(value: TValue): string | formatters.SafeHtml;
        getItemPresentation(item: TItem): string | formatters.SafeHtml;
        dispose?(): void;
    }
    interface Options extends PropertyEditor.Options {
        dataProvider?: IDataProvider<any, any> | ((pe?: PropertyEditorLookup) => IDataProvider<any, any>);
        DataProvider?: new (pe?: PropertyEditorLookup) => IDataProvider<any, any>;
        dataSource?: DataSource;
        menu?: Menu.Options;
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        filter?: lang.Lazy<Object | IJsonSerializable>;
        /**
         * @type Array|String
         */
        orderBy?: string | string[];
        /**
         * demand, preload, demand (default)
         * @type peDropDownLookup.prototype.modes
         */
        mode?: Mode;
        matchMode?: MatchMode;
        canReload?: boolean;
        canClear?: boolean;
        isLookup?: boolean;
        lookupMinChars?: number;
        lookupDelay?: number;
        lookupParam?: string;
        lookupMatcher?: (item: any, term: string, matchMode: MatchMode) => boolean;
        showEmptyItem?: boolean;
        dropDownEmptyItemText?: string;
        emptyValueTextFromDropDown?: boolean;
        emptyValueText?: string;
        loadingText?: string;
        /**
         * filter restrictions changed event handler
         * @type {Function}
         */
        onRestrictionsChanged?: (sender: PropertyEditorLookup, restrictions: lang.Lazy<Object | IJsonSerializable>) => void;
        /**
         * data loading event handler
         * @type {Function}
         */
        onDataLoading?: (sender: PropertyEditorLookup, args: DataLoadEventArgs) => void;
        /**
         * data loaded event handler
         * @type {Function}
         */
        onDataLoaded?: (sender: PropertyEditorLookup, args: DataLoadEventArgs) => void;
        /**
         * loaded event handler
         * @type {Function}
         */
        onLoaded?: (sender: PropertyEditorLookup) => void;
        selectOnTab?: boolean;
        /**
         * lookup: show Refresh and Search Buttons
         * dropdown: arrows up and down
         */
        visualStyle?: PropertyEditorLookup.VisualStyle;
    }
    interface JsonAdapter {
        getPresentation(jsonItem: any): string | formatters.SafeHtml;
        getId(jsonItem: any): string;
    }
    interface AdapterOptions {
        ref?: EntityMeta;
        entityType?: string;
        uow?: UnitOfWork;
        urlSuffix?: string;
        /**
         * Json Adapter - an object with two methods: getId and getPresentation, which accept an json object from DataSource result
         * It's only used with plain DataSource (DataSource returns json, not domain objects)
         * @type {Object}
         */
        jsonAdapter?: JsonAdapter;
        displayField?: string;
        idField?: string;
    }
    abstract class DataProviderBase<TValue, TItem> implements IDataProvider<TValue, TItem> {
        dataSource: DataSource;
        protected pe: PropertyEditorLookup;
        private _reloadOpId;
        constructor(pe: PropertyEditorLookup);
        loadItems(query?: LoadQuerySpec, options?: LoadOptions): lang.Promise<TItem[]>;
        protected abstract getItems(response: LoadResponse): TItem[];
        abstract getValue(item: TItem): TValue;
        abstract getValuePresentation(value: TValue): string | formatters.SafeHtml;
        abstract getItemPresentation(item: TItem): string | formatters.SafeHtml;
    }
    class PlainDataProvider<TItem> extends DataProviderBase<TItem, TItem> {
        constructor(pe: PropertyEditorLookup);
        protected getItems(response: LoadResponse): TItem[];
        getValue(item: TItem): TItem;
        getValuePresentation(value: TItem): string;
        getItemPresentation(item: TItem): string;
    }
    class JsonDataProvider<TItem> extends DataProviderBase<DomainObject, TItem> {
        protected jsonAdapter: JsonAdapter;
        protected uow: UnitOfWork;
        private _ownUow;
        constructor(pe: PropertyEditorLookup);
        private AdapterOptions();
        protected getItems(response: LoadResponse): TItem[];
        getValue(item: TItem): DomainObject;
        getValuePresentation(value: DomainObject): string;
        getItemPresentation(item: TItem): string | formatters.SafeHtml;
        private _ensureUow();
        dispose(): void;
    }
    class DomainDataProvider extends DataProviderBase<DomainObject, DomainObject> {
        protected uow: UnitOfWork;
        private _ownUow;
        constructor(pe: PropertyEditorLookup);
        protected getItems(response: LoadResponse): DomainObject[];
        getValue(item: DomainObject): DomainObject;
        getValuePresentation(value: DomainObject): string | formatters.SafeHtml;
        getItemPresentation(item: DomainObject): string | formatters.SafeHtml;
        dispose(): void;
    }
}
export = PropertyEditorLookup;
