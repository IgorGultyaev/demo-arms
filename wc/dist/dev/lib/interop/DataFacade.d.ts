/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import DataFacadeBase = require("lib/interop/DataFacadeBase");
import * as interop from ".interop";
import IDataFacade = interop.IDataFacade;
import IBackendInterop = interop.IBackendInterop;
import DomainObjectData = interop.DomainObjectData;
import SavedObjectData = interop.SavedObjectData;
import LoadQuery = interop.LoadQuery;
import LoadResponse = interop.LoadResponse;
import LoadOptions = interop.LoadOptions;
import SaveOptions = interop.SaveOptions;
import SaveResponse = interop.SaveResponse;
import IEventPublisher = core.IEventPublisher;
import Promise = core.lang.Promise;
declare class DataFacade extends DataFacadeBase implements IDataFacade {
    /**
     * @constructs DataFacade
     * @extends DataFacadeBase
     * @param {BackendInterop} interop
     * @param {EventPublisher} [eventPublisher]
     */
    constructor(interop: IBackendInterop, eventPublisher?: IEventPublisher);
    load(query: LoadQuery, options?: LoadOptions): Promise<LoadResponse>;
    /**
     * Save objects.
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} options Options
     * @param {*} [options.caller]
     * @param {String|Array} [options.hints] hints for passing to the server
     * @param {Boolean} [options.suppressEventOnError=false] Suppress event publishing on an error
     * @param {Boolean} [options.suppressEventOnSuccess=false] Suppress event publishing on success
     * @param {Boolean} [options.suppressProcessEvent=false] Suppress progress event publishing
     * @return {Promise} object for async operation of saving
     */
    save(objects: DomainObjectData[], options?: SaveOptions): Promise<SavedObjectData[]>;
    protected _onSaveDone(objects: DomainObjectData[], options: SaveOptions, response: SaveResponse): void;
}
export = DataFacade;
