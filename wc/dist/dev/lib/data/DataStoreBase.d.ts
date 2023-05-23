/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import * as domain from "lib/domain/.domain";
import * as interop from "lib/interop/.interop";
import Promise = lang.Promise;
import ModelMeta = domain.metadata.ModelMeta;
import Identity = interop.Identity;
import DomainObjectData = interop.DomainObjectData;
import SavedObjectData = interop.SavedObjectData;
import StoredObjectData = DataStoreBase.StoredObjectData;
import StoredResponse = DataStoreBase.StoredResponse;
import StoredObjectFilter = DataStoreBase.StoredObjectFilter;
import LoadQuery = interop.LoadQuery;
import LoadQuerySource = interop.LoadQuerySource;
import LoadQueryParams = interop.LoadQueryParams;
import LoadResponse = DataStoreBase.LoadResponse;
import Options = DataStoreBase.Options;
import CacheOptions = DataStoreBase.CacheOptions;
import FromStoreOptions = DataStoreBase.FromStoreOptions;
import ToStoreOptions = DataStoreBase.ToStoreOptions;
import IObjectStoreIterator = DataStoreBase.IObjectStoreIterator;
declare abstract class DataStoreBase extends lang.Observable {
    isSupported: boolean;
    systemVersion: number;
    version: number;
    name: string;
    storedTypes: lang.Map<boolean>;
    protected meta: ModelMeta;
    protected options: Options;
    /**
     * @constructs DataStoreBase
     * @extends Observable
     * @description Base implementation of local data cache
     * On errors all async methods must return the rejected deferred (instead of throwing an exception).
     * @param {String} name
     * @param {Number} version
     * @param {Object} domainModelMeta
     * @param {Object} [options]
     */
    constructor(name: string, version: number, domainModelMeta: ModelMeta, options?: Options);
    protected onversionchange(oldVersion: number, newVersion: number): void | Promise<void>;
    /**
     * @abstract
     */
    abstract test(): Promise<any>;
    /**
     * @abstract
     */
    abstract recreate(): Promise<any>;
    /**
     * Load an object
     * @abstract
     * @param type
     * @param id
     * @param options
     */
    abstract load(type: string, id: string, options?: FromStoreOptions): Promise<DomainObjectData>;
    /**
     * Load several objects
     * @abstract
     * @param identities
     * @param options
     */
    abstract loadMany(identities: Identity[], options?: FromStoreOptions): Promise<DomainObjectData[]>;
    /**
     * Load all objects of specified type
     * @abstract
     * @param filter
     * @param options
     */
    abstract select(filter: StoredObjectFilter | string, options?: FromStoreOptions): Promise<DomainObjectData[]>;
    /**
     * Load all objects from the store. Use for debug only!
     * @abstract
     * @param options
     */
    abstract all(options?: FromStoreOptions): Promise<DomainObjectData[]>;
    /**
     * @abstract
     */
    abstract getChanges(): Promise<DomainObjectData[]>;
    /**
     * @abstract
     */
    abstract hasChanges(): Promise<boolean>;
    /**
     * Remove objects of specific 'type' which don't have unsaved changes
     * @abstract
     * @param type
     */
    abstract clear(type: string): Promise<void>;
    /**
     * Remove objects from DataStore
     * @abstract
     * @param options
     */
    abstract clearAll(options?: {
        includePending?: boolean;
    }): Promise<void>;
    /**
     * @abstract
     * @param query
     * @param response
     */
    abstract cacheQuery(query: LoadQuery, response: LoadResponse): Promise<void>;
    /**
     * @abstract
     * @param query
     */
    abstract query(query: LoadQuery): Promise<LoadResponse>;
    /**
     * @method
     * @params {Array} objects Objects to save (create or update local objects with client-side changes)
     * @returns {Promise}
     */
    save(objects: DomainObjectData[] | DomainObjectData, options?: DataStoreBase.SaveOptions): Promise<void>;
    /**
     * Commit specified changes which makes objects in Store trustworthy.
     * Usually it is called after that objects were saved on the server.
     * @method
     * @param {Array} changes
     * @returns {Promise}
     */
    commit(changes: SavedObjectData[] | SavedObjectData): Promise<void>;
    /**
     * Remove specified changes and restore previous data (if it exists).
     * @method
     * @param {Array} changes
     * @returns {Promise}
     */
    rollback(changes: DomainObjectData[] | DomainObjectData): Promise<DomainObjectData[]>;
    /**
     * Put specified objects into Store, possibly replace existing objects.
     * @method
     * @param {Array} objects
     * @returns {Promise}
     */
    overwrite(objects: DomainObjectData[] | DomainObjectData): Promise<void>;
    /**
     * Remove specified objects from Store.
     * @method
     * @param {Array} objects
     * @returns {Promise}
     */
    remove(objects: DomainObjectData[] | DomainObjectData): Promise<void>;
    /**
     * Put objects into Store as trustworthy data.
     * @method
     * @param {Array} objects json domain objects
     * @param {Object} [options]
     * @param {Boolean} [options.actualize] Update source objects with data from Store
     * @param {Boolean} [options.skipMissing] Ignore objects which can not be found in Store
     * @param {Boolean} [options.partial] Json data doesn't contains all properties loaded by default.
     * In this case the timestamp will not be updated and obsolete properties will not be removed.
     * @returns {Promise}
     */
    cache(objects: DomainObjectData[] | DomainObjectData, options?: CacheOptions): Promise<void>;
    /**
     * @protected
     * @abstract
     */
    protected abstract _update(objects: DomainObjectData[] | DomainObjectData, iterator: IObjectStoreIterator<DomainObjectData>): any;
    /**
     * Set values of navigation props with changed IDs to __newValues
     * @param changes
     * @protected
     */
    protected _updateRefIds(changes: SavedObjectData[]): void;
    /**
     * @protected
     * @abstract
     */
    protected abstract _commit(changes: SavedObjectData[] | SavedObjectData, iterator: IObjectStoreIterator<SavedObjectData>): any;
    protected _commitObj(obj: SavedObjectData, existent: StoredObjectData): StoredObjectData;
    protected _cacheObj(obj: DomainObjectData, existent: StoredObjectData): StoredObjectData;
    protected _applyProp(name: string, existent: StoredObjectData, newVal: any, curVal: any): void;
    protected _actualize(obj: DomainObjectData, existent: StoredObjectData): void;
    protected _isSpecialPropName(name: string): boolean;
    protected _hasObjChanges(obj: DomainObjectData): boolean;
    protected _getObjChanges(obj: DomainObjectData): DomainObjectData;
    protected _toUser(obj: StoredObjectData, options?: FromStoreOptions): DomainObjectData;
    /**
     * Convert object for storing in DB.
     * @param {Object} obj json object with data
     * @param {Object} options
     * @param {Boolean} [options.updateTs=false] true to update __timestamp field
     * @returns {Object} object for storing in DB (can be used as parameter for 'put' method)
     */
    protected _toDB(obj: StoredObjectData, options?: ToStoreOptions): StoredObjectData;
    protected _fromDB(obj: StoredObjectData): StoredObjectData;
    protected _identity(obj: DomainObjectData[]): Identity[];
    protected _identity(obj: DomainObjectData): Identity;
    protected _cacheQueryProp(source: LoadQuerySource, response: LoadResponse): Promise<void>;
    protected _queryResponse(objects?: StoredObjectData[] | StoredObjectData, timestamp?: number): LoadResponse;
    protected _queryValueResponse(v: any, timestamp: number): LoadResponse;
    protected _throwIfNotValid(obj: DomainObjectData): void;
    protected _throwIfTypeInvalid(type: string): void;
    protected _groupByType<T extends DomainObjectData>(objects: T[] | T): lang.Map<T[]>;
    protected _matchFilter(obj: StoredObjectData, filter: StoredObjectFilter): boolean;
    protected _getParamsForCache(params: LoadQueryParams): LoadQueryParams;
    protected _getQueryType(query: LoadQuery, data: StoredResponse): string;
    protected _getQuerySource(query: LoadQuery): LoadQuerySource;
    /**
     * @param {Array} types names of domain types
     * @returns {Array} A string array: original types + ancestors
     * @private
     */
    protected _getAncestors(types: string[]): string[];
}
declare namespace DataStoreBase {
    interface Options {
        recreate?: boolean;
        onversionchange?: (store: DataStoreBase, oldVersion: number, newVersion: number) => Promise<void> | void;
    }
    interface StoredObjectData extends DomainObjectData {
        __hasChanges?: number;
        __timestamp?: number;
        __tx?: string;
        __original?: {
            __metadata?: {
                type: string;
                ts?: number;
            };
            [key: string]: any;
        };
    }
    interface StoredResponse {
        result: Identity[] | Identity;
        hints?: lang.Map<any>;
        __timestamp?: number;
        __type?: string;
    }
    interface StoredObjectFilter {
        /**
         * Load objects with changes. Calling with hasChanges = false returns object without any changes.
         */
        hasChanges?: boolean;
        /**
         * Load removed objects. Calling with isRemoved = false returns object which are not removed.
         */
        isRemoved?: boolean;
        /**
         * Type of objects.
         */
        type?: string;
    }
    interface LoadResponse extends interop.LoadResponse {
        found?: boolean | "unsync";
        age?: number;
    }
    interface SaveOptions {
        /** hints for passing to the server */
        hints?: string[] | string;
        /** Custom server controller action for precessing the request. */
        action?: string;
        /** Transaction name */
        tx?: string;
    }
    interface CacheOptions {
        /**
         * Update source objects with data from Store
         */
        actualize?: boolean;
        /**
         * Ignore objects which can not be found in Store
         */
        skipMissing?: boolean;
        /**
         * Json data doesn't contains all properties loaded by default
         */
        partial?: boolean;
    }
    interface FromStoreOptions {
        /**
         * Keep raw properties (__original, isNew, isRemoved)
         */
        raw?: boolean;
        /**
         * Keep boolean flags (isNew, isRemoved)
         */
        keepFlags?: boolean;
    }
    interface ToStoreOptions {
        /**
         * Update __timestamp field
         */
        updateTs?: boolean;
    }
    interface IObjectStore {
        put(obj: StoredObjectData): void;
        delete(id: string): void;
    }
    interface IObjectStoreIterator<T> {
        (store: IObjectStore, obj: T, existent: StoredObjectData): void;
    }
}
export = DataStoreBase;
