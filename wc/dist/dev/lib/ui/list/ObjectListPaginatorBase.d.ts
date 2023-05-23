/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import List = require("lib/ui/list/List");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import { LoadQueryParams } from "interop/.interop";
import { IObjectListPaginator, PagingOptions } from "ui/list/.list";
import ICommand = core.commands.ICommand;
import DataLoadEventArgs = List.DataLoadEventArgs;
import { ObjectListState } from "lib/ui/list/.list.types";
declare abstract class ObjectListPaginatorBase extends View implements IObjectListPaginator {
    options: ObjectListPaginatorBase.Options;
    pageSize: number;
    commands: lang.Map<ICommand>;
    menu: Menu;
    protected _hasNext: boolean;
    protected _loadParams: LoadQueryParams;
    protected _top: number;
    /**
     * The number of skipped items
     * @observable-property {Number}
     */
    skippedItems: lang.ObservableProperty<number>;
    /**
     * @observable-property {Boolean}
     */
    protected hasMoreItems: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {String}
     */
    protected message: lang.ObservableProperty<string>;
    /**
     * Base class for ObjectList's paginators
     * @constructs ObjectListPaginatorBase
     * @extends View
     * @param options
     */
    constructor(options?: ObjectListPaginatorBase.Options);
    /**
     * Parent list
     * @observable-property {ObjectList}
     */
    list(v?: List<any>): List<any>;
    /**
     * @protected
     * @virtual
     * @returns {Menu}
     */
    protected createMenu(): Menu;
    /**
     * @protected
     * @virtual
     * @returns {Object.<String,ICommand>}
     */
    protected abstract createCommands(): lang.Map<ICommand>;
    protected _onListChanged(list: List<any>, old: List<any>): void;
    protected _init(list: List<any>): void;
    protected _uninit(list: List<any>): void;
    protected _onListStateChanged(list: List<any>, state: ObjectListState): void;
    protected _onDataLoading(list: List<any>, args?: DataLoadEventArgs<any>): void;
    protected _onDataLoaded(list: List<any>, args?: DataLoadEventArgs<any>): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
declare namespace ObjectListPaginatorBase {
    interface Options extends View.Options, PagingOptions {
        menu?: Menu.Options;
        /**
         * Number of rows on page. Set to 0 to use server restrictions only.
         */
        pageSize?: number;
        /**
         * Support paging even if no hint `paging` in the server response
         */
        force?: boolean;
    }
}
export = ObjectListPaginatorBase;
