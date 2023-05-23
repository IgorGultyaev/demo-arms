/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import { IDataSource, LoadQuery, LoadQuerySpec, LoadQueryParams, LoadOptions, LoadResponse } from "lib/interop/.interop";
import { DomainObject, UnitOfWork } from "lib/domain/.domain";
import * as list from "lib/ui/list/.list";
import Application = core.Application;
import ObjectListColumn = list.ObjectListColumn;
import IObjectListLoader = ObjectListLoader.IObjectListLoader;
declare class ObjectListLoader implements IObjectListLoader {
    options: ObjectListLoader.Options;
    app: Application;
    uow: UnitOfWork;
    entityType: string;
    dataSource: IDataSource;
    columns: ObjectListColumn[];
    private _reloadOpId;
    /**
     * @constructs ObjectListLoader
     * @param {Application} app
     * @param {Object} options
     * @param {DataSource} options.dataSource
     * @param {String} [options.entityType]
     * @param {Object} [options.loadPolicy]
     * @param {Boolean} [options.cancellable]
     * @param {UnitOfWork} [options.uow]
     * @param {Function} [options.onMaterialize]
     */
    constructor(app: Application, options: ObjectListLoader.Options);
    buildQuery(list: list.IObjectList<DomainObject>, params?: LoadQueryParams): LoadQuery;
    load(list: list.IObjectList<DomainObject>, params?: LoadQueryParams): core.lang.Promise<list.ObjectListLoaderResult<DomainObject>>;
    cancel(): void;
    protected onLoading(query: LoadQuerySpec, options: LoadOptions): void;
    protected onMaterialize(dsResult: LoadResponse): DomainObject[];
    protected onError(error: Error): Error;
}
declare namespace ObjectListLoader {
    interface Options {
        dataSource: IDataSource;
        entityType?: string;
        loadPolicy?: any;
        cancellable?: boolean;
        uow?: UnitOfWork;
        /**
         * @this {ObjectListLoader} Loader instance
         */
        onMaterialize?: (args: MaterializeArgs) => void;
    }
    interface MaterializeArgs {
        items: DomainObject[];
        dsResult: LoadResponse;
    }
    interface IObjectListLoader extends list.IObjectListLoader<DomainObject> {
        entityType?: string;
        columns?: ObjectListColumn[];
        buildQuery?(list: list.IObjectList<DomainObject>, params?: LoadQueryParams): LoadQuery;
    }
}
export = ObjectListLoader;
