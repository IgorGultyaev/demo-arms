/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import DataFacadeBase = require("lib/interop/DataFacadeBase");
import DataSynchronizer = require("lib/interop/DataSynchronizer");
import CacheManager = require("lib/interop/CacheManager");
import diagnostics = require("lib/core.diagnostics");
import DataStoreBase = require("lib/data/DataStoreBase");
import { DomainObjectData, SavedObjectData, InteropError, AjaxSettings, AjaxOptions, LoadQuery, LoadResponse, LoadOptions, SaveOptions, IBackendInterop, CheckConnectionResult as CheckConnectionResultBase, LoadPolicy } from ".interop";
import { LoadRule, SaveMode, SaveTarget } from "lib/interop/.interop.types";
import lang = core.lang;
import IEventPublisher = core.IEventPublisher;
import SystemEvent = core.SystemEvent;
import Promise = lang.Promise;
declare class DataFacadeSmart extends DataFacadeBase {
    static defaultOptions: DataFacadeSmart.Options;
    options: DataFacadeSmart.Options;
    protected _supportNetworkRealtimeEvents: boolean;
    protected _cacheManager: CacheManager;
    private _synchronizr;
    private _store;
    private _lastCheckCon;
    /**
     * @class DataFacadeSmart
     * @extends DataFacadeBase
     * @param {BackendInterop} interop
     * @param {EventPublisher} eventPublisher
     * @param {DataStoreBase} dataStore
     * @param {Object} options Additional options
     * @param {CacheManager} options.cacheManager
     * @param {Function} options.DataSynchronizer
     * @param {"remoteFirst"|"localFirst"|"localIfOffline"|"cached"|"remoteOnly"|"localOnly"} options.loadRule
     * @param {Boolean} options.supportNetworkRealtimeEvents
     * @param {"smart"|"offline"|"remoteOnly"} options.saveMode Saving mode: smart, offline, online (by default 'smart'), see property saveMode
     */
    constructor(interop: IBackendInterop, eventPublisher: IEventPublisher, dataStore: DataStoreBase, options?: DataFacadeSmart.Options);
    setEventPublisher(eventPublisher: IEventPublisher): void;
    /**
     * Current saving mode
     * @observable-property {DataFacadeSmart#saveMode}
     */
    saveMode: lang.ObservableProperty<SaveMode>;
    /**
     * Network is accessible on the device. If true, serverOnline MAY be true or false.
     * @observable-property {boolean}
     */
    networkOnline: lang.ObservableProperty<boolean>;
    /**
     * Server was accessible on last check. If true then networkOnline MUST be true.
     * @observable-property {boolean}
     */
    serverOnline: lang.ObservableProperty<boolean>;
    /**
     * Where to save data.
     * @observable-property {DataFacadeSmart#saveTarget}
     */
    saveTarget: lang.ObservableProperty<SaveTarget>;
    /**
     * If true then DataFacade will not try to call the server at all.
     * @observable-property {boolean}
     */
    manuallyDisconnected: lang.ObservableProperty<boolean>;
    /**
     * DataSynchronizer is synchronizing offline changes.
     * @observable-property {boolean}
     */
    isSynchronizing: lang.ObservableProperty<boolean>;
    /**
     * An error occurred during offline changes synchronization and DataFacade's waiting for its processing completes.
     * @observable-property {boolean}
     */
    isSyncErrorProcessing: lang.ObservableProperty<boolean>;
    traceSource: diagnostics.TraceSource;
    protected _initDataStore(dataStore: DataStoreBase): void;
    protected _initDataStore2(dataStore: DataStoreBase): void;
    protected _createDataSynchronizer(dataStore: DataStoreBase): DataSynchronizer;
    protected _getDefaultLoadRule(): LoadRule;
    protected _createCacheManager(): CacheManager;
    protected _updateSaveTarget(doSchedule?: boolean): void;
    dispose(): void;
    ajax(ajaxSettings: AjaxSettings | string | (() => AjaxSettings), options?: AjaxOptions): Promise<any>;
    protected _onAjaxSuccess(settings: AjaxSettings, options: AjaxOptions): void;
    protected _onAjaxFail(error: InteropError, settings: AjaxSettings, options: AjaxOptions): void;
    protected _normalizeResponse(response: LoadResponse): LoadResponse;
    protected _addResponseHint(response: LoadResponse, fieldName: string, fieldValue: any): LoadResponse;
    protected _localResponse(response: LoadResponse, policies: any): LoadResponse;
    protected _serverResponse(response: LoadResponse): LoadResponse;
    protected _serverErrorResponse(response: LoadResponse, error: InteropError): LoadResponse;
    /**
     * Load data.
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
     * @param {String|Object} [options.policy] explicit policy (if specified it will override CacheManager's rule)
     * @returns {*}
     */
    load(query: LoadQuery, options?: LoadOptions): Promise<LoadResponse>;
    /**
     * Calculates load policy
     * @param query
     * @param options
     * @returns {{policy: Object, onlinePolicy: Object}}
     * @private
     */
    protected _getLoadPolicy(query: LoadQuery, options?: LoadOptions): {
        policy: LoadPolicy;
        onlinePolicy: LoadPolicy;
    };
    loadRemotely(query: LoadQuery, options: LoadOptions): Promise<LoadResponse>;
    loadLocally(query: LoadQuery, options: LoadOptions): Promise<DataStoreBase.LoadResponse>;
    /**
     * Run server connection checking.
     * @param {Object} options
     * @param {Boolean} [options.suppressSaveTargetUpdate=false]
     * @returns {Promise} Promise will be revolved (never rejected) into object {networkOnline: boolean, serverOnline: boolean, notificationPublished: boolean}
     */
    checkConnection(options?: {
        suppressSaveTargetUpdate: boolean;
    }): Promise<DataFacadeSmart.CheckConnectionResult>;
    protected _schedulePing(): void;
    /**
     * Save objects.
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} options Options
     * @param {Object} options.policy
     * @param {String} options.policy.target Where to save, see `DataFacadeSmart.saveTargets`
     * @param {Boolean} options.policy.shouldCache Whether to cache saved object locally or not
     * @param {String|Array} [options.hints] hints for save operation (passed to the server)
     * @param {Boolean} options.suppressAutoLogin
     * @param {Boolean} [options.suppressEventOnError=false] Suppress event publishing on an error
     * @param {Boolean} [options.suppressEventOnSuccess=false] Suppress event publishing on success
     * @param {Boolean} [options.suppressProcessEvent=false] Suppress progress event publishing
     * @return {Promise} object for async operation of saving
     */
    save(objects: DomainObjectData[], options?: SaveOptions): lang.Promise<SavedObjectData[]>;
    /**
     * Save objects into local store.
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} options options for interop
     * @param {Boolean} options.suppressAutoLogin
     * @param {Boolean} options.suppressEventOnSuccess
     * @param {Boolean} options.suppressEventOnError
     * @param {jQuery.Deferred} defer
     */
    protected _saveLocally(objects: DomainObjectData[], options: SaveOptions, defer: lang.Deferred<DomainObjectData[]>): void;
    protected _scheduleSyncIfNeeded(): boolean;
    /**
     * Continuation on successful save into local store.
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} options options for interop
     * @param {Boolean} options.suppressAutoLogin
     * @param {Boolean} options.suppressEventOnSuccess
     * @param {Boolean} options.suppressEventOnError
     */
    protected _onLocalSaveDone(objects: DomainObjectData[], options: SaveOptions): void;
    protected _saveRemotely(objects: DomainObjectData[], options: SaveOptions, deferred: lang.Deferred<DomainObjectData[]>): void;
    /**
     * Continuation on successful save to the server.
     * @param {Array} objects domain objects in json-form (dto)
     * @param {Object} options options for interop
     * @param {Boolean} options.suppressAutoLogin
     * @param {Boolean} options.suppressEventOnSuccess
     * @param {Boolean} options.suppressEventOnError
     * @param {Object} response server response
     * @param {Object} response.error
     * @param {Array} response.ids array of objects identities which saving was failed
     * @param {Object} response.newIdentityMap TODO
     * @param {Array} response.originalObjects
     * @param {Array} response.updatedObjects
     */
    _onRemoteSaveDone(objects: DomainObjectData[], options: SaveOptions, response: any): void;
    /**
     * Create a SystemEvent for save error.
     * @param {Object} error An error object got from BackendInterop.save
     * @param {Object} options Save options - the same as DataFacade.save
     * @param {Array<DomainObject>} objects Json objects were being saved
     * @returns {SystemEvent}
     */
    createSaveErrorEvent(error: InteropError, options: SaveOptions, objects: DomainObjectData[]): SystemEvent;
    createInteropErrorEvent(action: string, error: InteropError): SystemEvent;
    protected _addGoOfflineMenuItem(sysEvent: SystemEvent): void;
    protected _onStoreSynced(syncResult: DataSynchronizer.SyncSuccessEventArgs): void;
    protected _onSyncRetry(syncResult: DataSynchronizer.SyncFailtureEventArgs): void;
    protected _onSyncCancel(syncResult: DataSynchronizer.SyncFailtureEventArgs): void;
    /**
     * Handles 'sync.error' event from DataSynchronizer.
     * Important: the method should signal on syncResult.defer in ALL cases.
     * @param syncResult
     * @param {Array} syncResult.failures Array of errors (with at least one item), where error object is {objects:[], error:{}}
     * @param {jQuery.Deferred} syncResult.defer
     * @protected
     */
    protected _onStoreSyncError(syncResult: DataSynchronizer.SyncFailtureEventArgs): void;
    protected _isUnrecoverableError(error: InteropError): boolean;
    protected _isServerInaccessibilityError(error: InteropError): boolean;
    /**
     * Handles unrecoverable synchronization errors.
     * @param syncResult SyncResult from DataSynchronizer
     * @param {Array} syncResult.failures Array of errors (with at least one item), where error object is {objects:[], error:{}}
     * @param {jQuery.Deferred} syncResult.defer
     * @protected
     */
    protected _onStoreSyncUnrecoverableError(syncResult: DataSynchronizer.SyncFailtureEventArgs): void;
    createSyncErrorEvent(syncResult: DataSynchronizer.SyncFailtureEventArgs): SystemEvent;
    /**
     * Handles 'error' event from DataStore.
     * @param {Error} error
     * @protected
     */
    protected _onStoreRawError(error: Error): void;
    /**
     * Recreate DataStore with user prompt.
     * @protected
     */
    protected _recreateStore(): Promise<void>;
}
declare namespace DataFacadeSmart {
    interface Options {
        cacheManager?: CacheManager;
        CacheManager?: new (options: CacheManager.Options) => CacheManager;
        DataSynchronizer?: new (dataStore: DataStoreBase, options: DataSynchronizer.Options) => DataSynchronizer;
        loadRule?: LoadRule;
        saveMode?: SaveMode;
        allowGoOffline?: boolean;
        supportNetworkRealtimeEvents?: boolean;
        checkConnectionTimeout?: number;
        forceLoadUnsync?: boolean;
    }
    interface CheckConnectionResult extends CheckConnectionResultBase {
        notificationPublished?: boolean;
    }
}
export = DataFacadeSmart;
