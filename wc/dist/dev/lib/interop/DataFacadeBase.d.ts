/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import { DomainObjectData, SavedObjectData, ExceptionData, InteropError, AjaxSettings, AjaxOptions, LoadQuery, LoadResponse, LoadOptions, SaveOptions, SaveResponse, IBackendInterop, SystemVersionChangedEventArgs, ObjectIdentity } from ".interop";
import IEventPublisher = core.IEventPublisher;
import SystemEvent = core.SystemEvent;
import Deferred = core.lang.Deferred;
import Promise = core.lang.Promise;
/**
 * Load data.
 * @function load
 * @memberOf DataFacadeBase.prototype
 * @param {Object} query query JSON-object
 * @param {Object|String} query.source name of source or JSON-object to load from
 * @param {String} query.source.type entityType when loading objects
 * @param {String} [query.source.id] objectId when loading a single object
 * @param {String} [query.source.propName] name of navigation property
 * @param {String} [query.type] entityType name of loading objects
 * @param {String} [query.preloads] array of property names or property chains
 * @param {Object} [query.params] query parameters
 * @param {Object} options
 * @param {String} [options.opId] cancellation operation id
 * @returns {Promise}
 */
declare abstract class DataFacadeBase extends core.lang.Observable {
    _interop: IBackendInterop;
    eventPublisher: IEventPublisher;
    /**
     * @constructs DataFacadeBase
     * @extends Observable
     * @param {BackendInterop} interop
     * @param {EventPublisher} [eventPublisher]
     */
    constructor(interop: IBackendInterop, eventPublisher?: IEventPublisher);
    setEventPublisher(eventPublisher: IEventPublisher): void;
    protected _publishEvent(eventName: string, eventArgs?: core.AppEventArgs): void;
    /**
     * @param query
     * @protected
     */
    protected _normalizeQuery(query: LoadQuery): LoadQuery;
    /**
     * Load objects from server via BackendInterop and publish event.
     * @param {Object} query
     * @param {Object} options
     * @returns {Promise}
     * @protected
     */
    protected _load(query: LoadQuery, options: LoadOptions): Promise<any>;
    /**
     * Call server via Ajax
     * @param {Object|String|Function} ajaxSettings Ajax settings as for jQuery.ajax()
     * @param {Object} [options] additional options
     * @param {Boolean} [options.suppressEventOnError=false] do not publish pub/sub event on an error
     * @param {Boolean} [options.suppressAutoLogin=false] do not make auto login in case of a 401 response
     * @param {Boolean} [options.suppressCacheBreakthrough=false] do not add timestamp into query string for GET-request
     * @param {Object} [options.processEvent] data of notification event (kind=process) to override default
     * @param {Boolean} [options.suppressProcessEvent=false] do not publish pub/sub event for process
     * @return {*}
     */
    ajax(ajaxSettings: AjaxSettings | string | (() => AjaxSettings), options?: AjaxOptions): Promise<any>;
    protected _onAjaxSuccess(settings: AjaxSettings, options: AjaxOptions): void;
    protected _onAjaxFail(error: InteropError, settings: AjaxSettings, options: AjaxOptions): void;
    /**
     * Cancel operation with id equals to opId.
     * @param {String} opId
     * @param {Object} [options]
     * @param {Boolean} [options.clientOnly] do not call server controller (api/cancel)
     * @returns {Promise}
     */
    cancel(opId: string, options?: {
        clientOnly?: boolean;
    }): Promise<any>;
    beginBatch(): void;
    completeBatch(): void;
    /**
     *
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} [options]
     * @param {String} [reason] "load" or "save" (default)
     * @protected
     * @fires DataFacadeBase#update
     */
    protected _triggerUpdate(objects: SavedObjectData[], options?: {
        caller?: any;
    }, reason?: string): void;
    /**
     * Handler to call on any error during remote save.
     * @param {Array} objects Json objects were being saved
     * @param {Object} error An error object got from BackendInterop.save
     * @param {Object} options Save options - the same as DataFacade.save
     * @param {jQuery.Deferred} defer Deferred to reject with normalized error
     * @protected
     */
    protected _onRemoteSaveError(objects: DomainObjectData[], error: any, options: SaveOptions, defer: Deferred<any>): void;
    protected _triggerUpdateObsolete(objects: ObjectIdentity[], options?: {
        caller?: any;
    }): void;
    /**
     * Create a SystemEvent for save error.
     * @param {Object} error An error object got from BackendInterop.save
     * @param {Object} options Save options - the same as DataFacade.save
     * @param {Array<DomainObjectData>} objects Json objects were being saved
     * @returns {SystemEvent}
     */
    createSaveErrorEvent(error: InteropError, options: SaveOptions, objects: DomainObjectData[]): SystemEvent;
    /**
     * Create a SystemEvent for save success.
     * @param {Object} response Server response
     * @returns {SystemEvent}
     */
    createSaveSuccessEvent(response: SaveResponse): SystemEvent;
    protected _handleInteropError(action: string, error: Error, options: AjaxOptions): void;
    /**
     * Create a SystemEvent for a general interop error
     * @param {String} action Executed action ("save", "load", "ajax" and so on)
     * @param {Object} error An error from the server parsed with BackendInterop.tryParseException
     * @return {SystemEvent}
     */
    createInteropErrorEvent(action: string, error: InteropError): SystemEvent;
    createServerVersionChangedEvent(data: any): SystemEvent;
    protected _onServerVersionChanged(args?: SystemVersionChangedEventArgs): void;
    protected _objectsFromResponse(response: LoadResponse, query: LoadQuery): DomainObjectData[];
    /**
     * Updates `objects` with data from server response (`response`).
     * @param {Array} objects Objects were being saved
     * @param {Object} response Response from DomainController
     * @param {Boolean} [repeated] Whether objects were already updated from another response
     * @protected
     */
    protected _updateSaved(objects: SavedObjectData[], response?: SaveResponse, repeated?: boolean): void;
    protected _setNewValuesFromResponse(objFrom: DomainObjectData, objTo: SavedObjectData): void;
    protected _updateFromNewValues(objects: SavedObjectData[]): void;
    errorFromJson(exceptionJson: ExceptionData): InteropError;
}
export = DataFacadeBase;
