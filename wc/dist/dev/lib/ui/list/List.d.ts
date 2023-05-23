/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import ListCommonMixin from "lib/ui/list/ListCommonMixin";
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import PartWithFilterMixin = require("lib/ui/PartWithFilterMixin");
import Menu = require("lib/ui/menu/Menu");
import { IObjectList, IObjectListLoader, IObjectListPresenter, ObjectListColumn, ObjectListLoaderResult, PagingOptions } from ".list";
import { LoadQueryParams, IDataSource, LoadResponse } from "lib/interop/.interop";
import { Violation } from "lib/validation";
import lang = core.lang;
import Promise = lang.Promise;
import Application = core.Application;
import MenuOptions = Menu.Options;
import ICommand = core.commands.ICommand;
import LoadOptions = List.LoadOptions;
import DataLoadEventArgs = List.DataLoadEventArgs;
declare class List<T> extends Component implements IObjectList<T>, ListCommonMixin<T> {
    static defaultOptions: List.Options;
    static defaultMenus: List.KnownMenus;
    defaultMenus: List.KnownMenus;
    /**
     * @enum {String}
     */
    static events: {
        DATA_LOADING: string;
        DATA_PREPARING: string;
        DATA_LOADED: string;
    };
    events: typeof List.events;
    /**
     * Additional message reporting something useful for the user
     * @observable-property {String}
     */
    hintMessage: lang.ObservableProperty<string>;
    options: List.Options;
    app: Application;
    presenter: IObjectListPresenter;
    commands: lang.Map<ICommand>;
    menuList: Menu;
    menuListAux: Menu;
    menuRow: Menu;
    menuSelection: Menu;
    title: string;
    traceSource: core.diagnostics.TraceSource;
    cancellable: boolean;
    lastError: Error;
    protected loader: IObjectListLoader<T>;
    /**
     * @constructs List
     * @extends Component
     * @param app
     * @param options {Object}
     * @param options.columns {Array} Array of column descriptors
     * @param options.columns.name {String}
     * @param options.columns.prop {String}
     * @param options.columns.title {String}
     * @param options.columns.formatter {Function} [optional]
     */
    constructor(app: Application, options?: List.Options);
    protected tweakOptions(options: List.Options): void;
    protected _preinitialize(): void;
    protected _initializeMenus(): void;
    protected _initMenu(menu: Menu): void;
    protected createCommands(): core.commands.ICommandLazyMap;
    protected createListMenuDefaults(): Menu.Options;
    protected createListMenuAuxDefaults(): Menu.Options;
    protected createListMenu(): Menu;
    protected createListMenuAux(): Menu;
    protected createRowMenuDefaults(): Menu.Options;
    protected createRowMenu(): Menu;
    protected createSelectionMenuDefaults(): Menu.Options;
    protected createSelectionMenu(): Menu;
    protected _initializeColumn(col: ObjectListColumn | string): ObjectListColumn;
    protected _initializeColumns(): void;
    runValidation(): Violation[];
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected showFilterError(error: string): void;
    protected createViewModel?(obj: T): T;
    protected createLoader(): IObjectListLoader<T>;
    isLoading(): boolean;
    /**
     * The implementation of the command 'Reload'
     * @param args
     * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
     * @returns {Promise.<DomainObject[]>}
     */
    protected doReload(args?: LoadOptions): lang.Promise<T[]>;
    protected canReload(): boolean;
    protected cancelReload(): void;
    protected canCancelReload(): boolean;
    /**
     * @param args
     * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
     * @returns {Promise.<DomainObject[]>}
     */
    reload(args?: LoadOptions): lang.Promise<T[]>;
    /**
     * @param args
     * @param {Object} args.params Loader parameters
     * @returns {Promise.<DomainObject[]>}
     */
    loadMore(args?: LoadOptions): lang.Promise<T[]>;
    /**
     * Load items with specified params via the loader
     * @param params
     * @returns {Promise.<DataLoadEventArgs>} Promise of DataLoadEventArgs
     * @protected
     */
    protected _load(params?: LoadQueryParams): lang.Promise<DataLoadEventArgs<T>>;
    /**
     * Set list's data
     * @param {Array} items An array of items (domain objects)
     * @param {Object} [hints]
     * @param {String} [hints.message]
     * @param {String} [hints.source]
     * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
     */
    setData(items: T[], hints?: any): T[];
    /**
     * Add items to list
     * @param {Array} items An array of items (domain objects)
     * @param {Object} [hints]
     * @param {String} [hints.message]
     * @param {String} [hints.source]
     * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
     */
    addData(items: T[], hints?: any): T[];
    /**
     * Change list's state to initial: no items, no activeItem, initial state message
     */
    setInitial(): void;
    protected _prepareData(items: T[], hints?: any): T[];
    protected _setError(error: Error): void;
    /**
     * @protected
     * @virtual
     * @param args
     * @param {Array} args.items An array of loaded items (domain objects)
     * @param {Object} [args.hints]
     */
    protected onDataPreparing(args: DataLoadEventArgs<T>): void;
    /**
     * @protected
     * @virtual
     * @param {DataLoadEventArgs} args
     */
    protected onDataLoading(args: DataLoadEventArgs<T>): void;
    /**
     * @protected
     * @virtual
     * @param {DataLoadEventArgs} args
     */
    protected onDataLoaded(args: DataLoadEventArgs<T>): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    activate(): void;
    getChangedItems(): Array<any>;
}
interface List<T> extends ListCommonMixin<T>, PartCommandMixin, PartWithFilterMixin {
}
declare namespace List {
    class Loader<T> implements IObjectListLoader<T> {
        app: Application;
        options: List.LoaderOptions;
        dataSource: IDataSource;
        private _reloadOpId;
        constructor(app: Application, options: List.LoaderOptions);
        load(list: IObjectList<T>, params?: LoadQueryParams): Promise<ObjectListLoaderResult<T>>;
        cancel(): void;
        protected onMaterialize(dsResult: LoadResponse): T[];
    }
    interface Options extends Component.Options, ListCommonMixin.Options, PartCommandMixin.Options, PartWithFilterMixin.Options {
        title?: string;
        traceSourceName?: string;
        menuList?: MenuOptions;
        menuListAux?: MenuOptions;
        menuRow?: MenuOptions;
        menuSelection?: MenuOptions;
        stateMessages?: StateMessages;
        autoLoad?: boolean;
        loader?: IObjectListLoader<any> | ((list: List<any>) => IObjectListLoader<any>);
        Loader?: new (app: Application, options: List.LoaderOptions) => IObjectListLoader<any>;
        /**
         * Additional params for DataSource (will be combined with filter's restrictions)
         */
        loadParams?: LoadQueryParams | (() => LoadQueryParams);
        dataSource?: IDataSource;
        cancellable?: boolean;
        paging?: boolean | number | PagingOptions;
        onDataLoading?: <T>(sender: List<T>, args: DataLoadEventArgs<T>) => void;
        onDataLoaded?: <T>(sender: List<T>, args: DataLoadEventArgs<T>) => void;
        onDataPreparing?: <T>(sender: List<T>, args: DataLoadEventArgs<T>) => void;
        onDataMaterialize?: <T>(args: List.DataMaterializeArgs<T>) => void;
    }
    interface LoaderOptions {
        dataSource: IDataSource;
        cancellable?: boolean;
        /**
         * @this {ObjectListLoader} Loader instance
         */
        onMaterialize?: <T>(this: IObjectListLoader<T>, args: List.DataMaterializeArgs<T>) => void;
    }
    interface KnownMenus extends lang.Map<Menu.Options> {
        ListRow?: Menu.Options;
        Selection?: Menu.Options;
        List?: Menu.Options;
        ListAux?: Menu.Options;
    }
    interface StateMessages {
        initial?: string;
        noData?: string;
        loadFailed?: string;
    }
    interface LoadOptions {
        params?: LoadQueryParams;
    }
    interface DataLoadEventArgs<T> {
        params?: LoadQueryParams;
        items?: T[];
        hints?: any;
        confirmationMessage?: string;
    }
    interface DataMaterializeArgs<T> {
        items: T[];
        dsResult: LoadResponse;
    }
}
export = List;
