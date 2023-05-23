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
import lang = core.lang;
import ICommand = core.commands.ICommand;
import LoadOptions = List.LoadOptions;
import DataLoadEventArgs = List.DataLoadEventArgs;
declare class ObjectListPaginator extends ObjectListPaginatorBase {
    defaultOptions: ObjectListPaginator.Options;
    options: ObjectListPaginator.Options;
    /**
     * Paginator for ObjectList for mode 'throttle' (with command 'LoadMore')
     * @constructs ObjectListPaginator
     * @extends ObjectListPaginatorBase
     * @param options
     */
    constructor(options?: ObjectListPaginator.Options);
    /**
     * @protected
     * @virtual
     * @returns {Object.<String,ICommand>}
     */
    protected createCommands(): lang.Map<ICommand>;
    protected doLoadMore(args?: LoadOptions): lang.Promise<any[]>;
    protected canLoadMore(): boolean;
    protected _onDataLoaded(list: List<any>, args: DataLoadEventArgs<any>): void;
}
declare namespace ObjectListPaginator {
    interface Options extends ObjectListPaginatorBase.Options {
    }
}
export = ObjectListPaginator;
