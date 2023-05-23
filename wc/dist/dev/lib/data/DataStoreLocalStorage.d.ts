/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import DataStoreBase = require("lib/data/DataStoreBase");
import * as domain from "lib/domain/.domain";
import * as interop from "lib/interop/.interop";
import lang = core.lang;
import Promise = lang.Promise;
import Promisable = lang.Promisable;
import ModelMeta = domain.metadata.ModelMeta;
import Identity = interop.Identity;
import DomainObjectData = interop.DomainObjectData;
import SavedObjectData = interop.SavedObjectData;
import StoredObjectFilter = DataStoreBase.StoredObjectFilter;
import LoadQuery = interop.LoadQuery;
import LoadQuerySource = interop.LoadQuerySource;
import LoadQueryParams = interop.LoadQueryParams;
import LoadResponse = DataStoreBase.LoadResponse;
import FromStoreOptions = DataStoreBase.FromStoreOptions;
import ToStoreOptions = DataStoreBase.ToStoreOptions;
import IObjectStore = DataStoreBase.IObjectStore;
import IObjectStoreIterator = DataStoreLocalStorage.IObjectStoreIterator;
import StoredObjectData = DataStoreLocalStorage.StoredObjectData;
declare class DataStoreLocalStorage extends DataStoreBase {
    storage: typeof core.localStorage;
    protected _prefix: string;
    protected _objPrefix: string;
    protected _queryPrefix: string;
    protected _initializing: boolean;
    protected _initialized: boolean;
    /**
     * @constructs DataStoreLocalStorage
     * @extends DataStoreBase
     * @param name
     * @param version
     * @param domainModelMeta
     * @param options
     */
    constructor(name: string, version: number, domainModelMeta: ModelMeta, options?: DataStoreBase.Options);
    test(): Promise<void>;
    recreate(): Promise<void>;
    protected _init(): Promise<void>;
    protected _onsysupgrade(oldSystemVersion: number, newSystemVersion: number): Promisable<void>;
    protected _onappupgrade(oldVersion: number, newVersion: number): Promise<void>;
    protected _throwIfNotInited(): void;
    protected _throwIfTypeInvalid(type: string): void;
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
    protected _queryObject(type: string, id: string): LoadResponse;
    protected _queryObjects(source: LoadQuerySource, params: LoadQueryParams): LoadResponse;
    protected _queryProp(type: string, id: string, prop: string): LoadResponse;
    protected _getQueryKey(source: LoadQuerySource, params: LoadQueryParams): string;
    protected _update(objects: DomainObjectData[] | DomainObjectData, iterator: IObjectStoreIterator<DomainObjectData>): void;
    protected _iterate<T extends DomainObjectData>(objectsByType: core.lang.Map<T[]>, iterator: IObjectStoreIterator<T>): void;
    protected _commit(changes: SavedObjectData[] | SavedObjectData, iterator: IObjectStoreIterator<SavedObjectData>): void;
    protected _store(type: string): IObjectStore;
    protected _getObj(type: string, id: string): StoredObjectData;
    protected _getMany(identities: Identity[]): StoredObjectData[];
    protected _put(object: StoredObjectData): void;
    protected _delete(type: string, id: string): void;
    protected _toDB(obj: StoredObjectData, options?: ToStoreOptions): StoredObjectData;
    protected _fromDB(obj: StoredObjectData): StoredObjectData;
}
declare namespace DataStoreLocalStorage {
    interface IObjectStoreIterator<T> extends DataStoreBase.IObjectStoreIterator<T> {
    }
    interface StoredObjectData extends DataStoreBase.StoredObjectData {
        __originalUndefined?: string[];
    }
}
export = DataStoreLocalStorage;
