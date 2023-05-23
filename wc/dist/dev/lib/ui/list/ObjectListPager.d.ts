/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import List = require("lib/ui/list/List");
import ObjectListPaginatorBase = require("lib/ui/list/ObjectListPaginatorBase");
import peDropdown = require("lib/ui/pe/peEnumDropDownSelect");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import { LoadQueryParams } from "interop/.interop";
import ICommand = core.commands.ICommand;
import LoadOptions = List.LoadOptions;
import DataLoadEventArgs = List.DataLoadEventArgs;
import { DomainObject } from "lib/domain/.domain";
import DataSource = core.data.DataSource;
declare class ObjectListPager extends ObjectListPaginatorBase {
    static defaultOptions: ObjectListPager.Options;
    options: ObjectListPager.Options;
    /**
     * @observable-property {String}
     */
    pageStat: lang.ObservableProperty<string>;
    currentPage: lang.ObservableProperty<number>;
    pageRowCount: lang.ObservableProperty<number>;
    pageSizeTitle: lang.ObservableProperty<string>;
    isAsyncCounting: lang.ObservableProperty<boolean>;
    asyncCountDataSource: DataSource;
    pageSizeMenu: peDropdown;
    /**
     * Paginator for ObjectList for mode 'pages' (with commands LoadPrev/LoadNext)
     * @constructs ObjectListPager
     * @extends ObjectListPaginatorBase
     * @param options
     */
    constructor(options?: ObjectListPager.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _init(list: List<any>): void;
    protected _uninit(list: List<any>): void;
    private _initPageSizeMenu(options);
    private setPageSizeMenuValueSilent(pageSize);
    private findFittingMenuItem(pageSize, members?);
    private _initPageSizeInput(options);
    protected _validatePageSize(pageSize?: number): number;
    protected _recalculatePageSizeBeforeLoad(params: LoadQueryParams): void;
    protected _onListItemsChanges(items: lang.ObservableCollection<DomainObject>, args: lang.ObservableCollectionChangeArgs<DomainObject>): void;
    protected _updatePageStat(first: number, pageSize: number, total: number): void;
    private _total;
    /**
     * @protected
     * @virtual
     * @returns {Object.<String,ICommand>}
     */
    protected createCommands(): lang.Map<ICommand>;
    protected doLoadPrev(args?: LoadOptions): lang.Promise<any[]>;
    protected canLoadPrev(): boolean;
    protected doLoadNext(args: LoadOptions): lang.Promise<any[]>;
    protected canLoadNext(): boolean;
    protected doLoadPage(args: LoadOptions): lang.Promise<any[]>;
    protected canLoadPage(): boolean;
    /** Prepare data source for async count call */
    protected _asyncCountPrepare(list: List<any>): void;
    /** start async count call*/
    protected _asyncCountStart(args?: DataLoadEventArgs<any>): void;
    protected _onDataLoading(list: List<any>, args?: DataLoadEventArgs<any>): void;
    protected _onDataLoaded(list: List<any>, args?: DataLoadEventArgs<any>): void;
    protected _processTotalValue(args?: DataLoadEventArgs<any>): void;
    protected createMenu(): Menu;
    protected createPages(): ObjectListPager.PageInfo[];
}
declare namespace ObjectListPager {
    interface Options extends ObjectListPaginatorBase.Options {
        hidePageStat?: boolean;
        showPageSize?: boolean;
        pageSizeLabel?: string;
        /** Признак сохранения количества записей на странице в настройках пользователя*/
        storePageSize?: boolean;
        pageSizeMenu?: number[];
        asyncCountDataSource?: string | DataSource;
    }
    interface PageInfo {
        text: string;
        isCurrent?: boolean;
        loadParams?: {
            $skip: number;
        };
    }
}
export = ObjectListPager;
