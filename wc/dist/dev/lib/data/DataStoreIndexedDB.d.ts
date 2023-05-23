/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import DataStoreBase = require("lib/data/DataStoreBase");
import * as domain from "lib/domain/.domain";
import * as interop from "lib/interop/.interop";
import Promise = lang.Promise;
import ModelMeta = domain.metadata.ModelMeta;
import Identity = interop.Identity;
import DomainObjectData = interop.DomainObjectData;
import SavedObjectData = interop.SavedObjectData;
import StoredObjectData = DataStoreBase.StoredObjectData;
import StoredObjectFilter = DataStoreBase.StoredObjectFilter;
import LoadQuery = interop.LoadQuery;
import LoadResponse = DataStoreBase.LoadResponse;
import FromStoreOptions = DataStoreBase.FromStoreOptions;
import IObjectStoreIterator = DataStoreIndexedDB.IObjectStoreIterator;
import IDBConnection = DataStoreIndexedDB.IDBConnection;
declare class DataStoreIndexedDB extends DataStoreBase {
    utils: typeof DataStoreIndexedDB.indexedDBUtils;
    queryStoreName: string;
    defaultTimeout: number;
    /**
     * @constructs DataStoreIndexedDB
     * @extends DataStoreBase
     * @param {String} name DB name
     * @param {String} version DB version
     * @param {Object} domainModelMeta Domain model metadata
     * @param {Object} [options]
     */
    constructor(name: string, version: number, domainModelMeta: ModelMeta, options?: DataStoreBase.Options);
    test(timeout?: number): Promise<IDBDatabase>;
    recreate(): Promise<IDBDatabase>;
    getFullVersion(): number;
    _onupgrade(tx: any, oldFullVersion: any, newFullVersion: any): void;
    protected _onsysupgrade(tx: IDBTransaction, oldSystemVersion: number, newSystemVersion: number): void;
    private _upgradingTx;
    protected _onappupgrade(tx: IDBTransaction, oldVersion: number, newVersion: number): Promise<void>;
    /**
     * Load an object
     * @param type
     * @param id
     * @param options
     * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
     * @return {*}
     */
    load(type: string, id: string, options?: FromStoreOptions): Promise<DomainObjectData>;
    /**
     * Load several objects
     * @param identities
     * @param options
     * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
     * @return {*}
     */
    loadMany(identities: Identity[], options?: FromStoreOptions): Promise<DomainObjectData[]>;
    /**
     * Load all objects of specified type
     * @param {Object|String} filter String value will be interpreted as a type
     * @param {String} filter.type Type of objects to load
     * @param {Boolean} [filter.hasChanges] Load objects with changes. Calling with hasChanges = false returns object without any changes.
     * @param {Boolean} [filter.isRemoved] Load removed objects. Calling with isRemoved = false returns object which are not removed.
     * @param [options]
     * @param {Boolean} [options.raw] Keep raw properties (__original, isNew, isRemoved)
     * @return {*}
     */
    select(filter: StoredObjectFilter | string, options?: FromStoreOptions): Promise<DomainObjectData[]>;
    /**
     * Load all objects from the store. Use for debug only!
     * @param options
     * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
     * @return {*}
     */
    all(options?: FromStoreOptions): Promise<DomainObjectData[]>;
    getChanges(): Promise<DomainObjectData[]>;
    hasChanges(): Promise<boolean>;
    /**
     * Remove objects of specific 'type' which don't have unsaved changes
     * @param {String} type
     * @returns {*}
     */
    clear(type: string): Promise<void>;
    /**
     * Remove objects from DataStore
     * @param options
     * @param {Boolean} options.includePending Remove or not objects with unsaved changes
     * @returns {*}
     */
    clearAll(options?: {
        includePending?: boolean;
    }): Promise<void>;
    cacheQuery(query: LoadQuery, response: LoadResponse): Promise<void>;
    query(query: LoadQuery): Promise<LoadResponse>;
    private _queryObject(con, type, id);
    private _queryObjects(con, source, params);
    private _queryProp(con, type, id, prop);
    private _getQueryKey(source, params);
    private _clear(con, type, options?);
    protected _getObj(con: IDBConnection, type: string, id: string): Promise<StoredObjectData>;
    protected _getMany(con: IDBConnection, identities: Identity[]): Promise<StoredObjectData[]>;
    protected _update(objects: DomainObjectData[] | DomainObjectData, iterator: IObjectStoreIterator<DomainObjectData>): Promise<void>;
    protected _iterate<T extends {
        id: string;
    }>(con: IDBConnection, objectsByType: lang.Map<T[]>, iterator: IObjectStoreIterator<T>, txMode?: IDBTransactionMode): Promise<void>;
    protected _commit(changes: SavedObjectData[] | SavedObjectData, iterator: IObjectStoreIterator<SavedObjectData>): Promise<void>;
    private _createConnection(timeout?);
    /**
     * @method
     * @param {Object} error
     * @param {String} error.name
     * @param {String} error.message
     * @param {Number} error.code
     * @fires DataStoreIndexedDB#error
     * @async-debounce throttle=100
     */
    onError(error: any): void;
}
declare namespace DataStoreIndexedDB {
    interface IDBConnection extends lang.IDisposable {
        db: Promise<IDBDatabase>;
        /**
         *
         * @param storeNames
         * @param {"readonly" | "readwrite" | "versionchange"} mode
         */
        beginTx(storeNames: string[], mode: IDBTransactionMode): Promise<IDBTransaction>;
        completeTx(tx: IDBTransaction): Promise<void>;
    }
    type IDBTransactionMode = "readonly" | "readwrite" | "versionchange";
    interface IObjectStoreIterator<T> extends DataStoreBase.IObjectStoreIterator<T> {
    }
    namespace indexedDBUtils {
        const isSupported: boolean;
        function exec(dbRequest: IDBRequest): Promise<any>;
        /**
         * Executes IDBRequest and waits for completion of its transaction
         * @param dbRequest
         * @param con
         * @returns {Promise<any>}
         */
        function complete(dbRequest: IDBRequest, con: IDBConnection): Promise<any>;
        /**
         * Opens cursor, read all data from it and waits for completion of the request's transaction.
         * @param cursorRequest
         * @param con
         * @returns {Promise<void>}
         */
        function fetch(cursorRequest: IDBRequest, con: IDBConnection): Promise<void>;
        /**
         * Opens one or many cursors, read all data from them and waits for completion of all transactions.
         * @param cursorRequests
         * @param con
         * @returns {Promise<void>}
         */
        function fetchMany(cursorRequests: IDBRequest[], con: IDBConnection): Promise<void>;
        function openDB(name: string, version: number, onversionchange: Function): Promise<any>;
        function closeDB(db: IDBDatabase): void;
        function deleteDB(name: string): Promise<void>;
        function completeTx(tx: IDBTransaction): Promise<void>;
        function on(target: IDBRequest | IDBTransaction, events: string, callback: EventListener): void;
    }
}
export = DataStoreIndexedDB;
