/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import { IDataSource, LoadQuery, LoadQuerySpec, LoadQueryParams, LoadOptions, LoadResponse } from "lib/interop/.interop";
import { ObjectListColumn } from "lib/ui/list/.list";
import { IApplication } from "core";
import lang = core.lang;
import Promise = lang.Promise;
import Options = DataSource.Options;
declare class DataSource extends lang.CoreClass implements IDataSource {
    app: IApplication;
    name: string;
    supportQuery: boolean;
    isDomain: boolean;
    entityType: string;
    columns: ObjectListColumn[];
    protected preloads: string | string[];
    protected params: LoadQueryParams;
    /**
     * @constructs DataSource
     * @article [DataSource](docs:datasource)
     * @param {Application} app
     * @param {Object} options
     * @param {String} options.name DataSource's name, it is also used as entityType's name if it isn't specified
     * @param {String} options.entityType EntityType's name
     * @param {String|Array} [options.preloads]
     * @param {String|Array} [options.orderBy] Requests objects in specific order. Each element of array is a property name with optional ' asc' or ' desc'.
     * E.g. ["created desc", "title"] or "created desc, title".
     * @param {Boolean} [options.supportQuery] server controller supports querying (uses UnitOfWork.QueryObjects facilities)
     * @param {Boolean} [options.isDomain] Indicates that DataSource returns domain objects data. This options is ignored if 'supportQuery' or 'entityType' options are specified.
     * @param {Array} [options.columns] Array of columns descriptions
     * @param {Object} [options.params] static parameters for DataFacade.load
     */
    constructor(app: IApplication, options?: Options);
    protected _prepareParams(json: LoadQueryParams): LoadQueryParams;
    buildQuery(querySpec: LoadQuerySpec): LoadQuery;
    /**
     * Load data via DataFacade.
     * @param {Object} [query] see `DataFacade.load` (query.params will be combined with current DataSource's restrictions in 'params' field)
     * @param {Object} [options] options for DataFacade.load method.
     * @returns {Promise} An object with result field
     */
    load(query?: LoadQuerySpec, options?: LoadOptions): Promise<LoadResponse>;
    protected _load(querySpec: LoadQuerySpec, options?: LoadOptions): Promise<LoadResponse>;
    protected _loadOld(params: LoadQueryParams, opId: string, options?: LoadOptions): Promise<LoadResponse>;
    /**
     * Initialize cancellation of load via DataFacade.cancel.
     * @param {String} opId Identified (guid) of operation to cancel
     * @returns {Promise}
     */
    cancel(opId: string): Promise<void>;
}
declare namespace DataSource {
    interface Options {
        name?: string;
        entityType?: string;
        supportQuery?: boolean;
        isDomain?: boolean;
        preloads?: string | string[];
        columns?: ObjectListColumn[];
        params?: LoadQueryParams;
        orderBy?: string | string[];
    }
}
export = DataSource;
