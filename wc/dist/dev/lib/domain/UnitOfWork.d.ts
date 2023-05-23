/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import DomainObject = require("./DomainObject");
import DomainObjectRegistry = require("./DomainObjectRegistry");
import * as domain from ".domain";
import * as interop from "lib/interop/.interop";
import IDomainObject = domain.IDomainObject;
import IDomainModel = domain.IDomainModel;
import IDataFacade = interop.IDataFacade;
import DomainObjectData = interop.DomainObjectData;
import SavedObjectData = interop.SavedObjectData;
import LoadQuery = interop.LoadQuery;
import LoadResponse = interop.LoadResponse;
import ObjectIdentity = interop.ObjectIdentity;
import DataUpdateEventArgs = interop.DataUpdateEventArgs;
import EntityNameTerm = domain.EntityNameTerm;
import TypedNameTerm = domain.TypedNameTerm;
import PropertyMeta = domain.metadata.PropertyMeta;
import ReferenceToObject = domain.ReferenceToObject;
import ChangeOptions = domain.ChangeOptions;
import SetPropOptions = domain.SetPropOptions;
import ToJsonOptions = domain.ToJsonOptions;
import FromJsonOptions = domain.FromJsonOptions;
import LoadOptions = domain.LoadOptions;
import SaveOptions = UnitOfWork.SaveOptions;
import SaveResult = UnitOfWork.SaveResult;
/**
 * Creates an instance of domain object or a ghost
 * @callback CreateInstanceCallback
 * @param {Object} model
 * @param {String} typeName
 * @param {String} [id]
 * @returns {Object}
 */
declare class UnitOfWork extends lang.Observable {
    static saveToJsonOptions: ToJsonOptions;
    static changesToJsonOptions: ToJsonOptions;
    model: IDomainModel;
    protected _dataFacade: IDataFacade;
    protected _objects: DomainObjectRegistry;
    protected _saveToJsonOptions: ToJsonOptions;
    protected _changesToJsonOptions: ToJsonOptions;
    /**
     * Unit of work
     * @constructs UnitOfWork
     * @extends Observable
     * @param {Object} model
     * @param {DataFacadeBase} dataFacade
     * @param {Object} [options]
     * @param {boolean} [options.connected] Subscribe on DataFacade's 'update' event
     */
    constructor(model: IDomainModel, dataFacade: IDataFacade, options?: UnitOfWork.Options);
    /**
     * Don't handle 'update' event from DataFacade
     */
    isolated: boolean;
    /**
     * Observable read-only property. It signals that there are some changed objects (new, deleted or modified) in UoW.
     * @observable-getter {Boolean}
     */
    hasChanges: lang.ObservableGetter<boolean>;
    dispose(): void;
    /**
     * Returns all non-ghost objects in UnitOfWork.
     */
    all(): DomainObject[];
    /**
     * Iterates through all non-ghost objects.
     * @param {(obj: DomainObject) => void} callback
     * @param context A context (this) for the callback
     */
    forEach(callback: (obj: DomainObject) => void, context?: any): void;
    /**
     * Attach an object to this UnitOfWork. If the object is attached to another UoW, it'll detached first.
     * @param {IDomainObject} obj
     * @param {ChangeOptions} options
     * @return {IDomainObject}
     */
    attach(obj: IDomainObject, options?: ChangeOptions): IDomainObject;
    /**
     * Detach an object from the current UnitOfWork. If the object is attached to other UoW, do nothing.
     * @param {IDomainObject} obj
     * @param {ChangeOptions} options
     * @return {IDomainObject}
     */
    detach(obj: IDomainObject, options?: ChangeOptions): IDomainObject;
    private _onObjectChanged(obj, newState);
    /**
     * @observable-setter {Boolean}
     */
    private _setHasChanges;
    private _calculateHasChanged();
    hasChangesSince(stateName: string): boolean;
    find(type: EntityNameTerm, id: string, options: {
        ghost: boolean;
        removed?: boolean;
    }): IDomainObject | undefined;
    find(type: EntityNameTerm, id: string, options?: {
        removed?: boolean;
    }): DomainObject | undefined;
    create<T extends DomainObject>(type: TypedNameTerm<T>, props?: lang.Map<any>): T;
    /**
     * Required by lang.Observable. Don't use this overload;
     */
    get(name: string): any;
    get(type: EntityNameTerm, id: string, options?: {
        create?: (model: IDomainModel, typeName: string, id: string) => IDomainObject;
    }): IDomainObject;
    remove(obj: DomainObject, options?: ChangeOptions): void;
    fromJson(json: DomainObjectData[], options?: FromJsonOptions): DomainObject[];
    fromJson(json: DomainObjectData, options?: FromJsonOptions): DomainObject;
    /**
     * Parses DataFacade.load's response and maps its to DomainObjects
     * @param {Object} serverResponse Response from dataFacade.load
     * @param {Object} [options] options for `DomainObject.fromJson`
     * @return {DomainObject|Array}
     */
    fromServerResponse(serverResponse: LoadResponse, options?: FromJsonOptions): DomainObject | DomainObject[];
    /**
     * Наполняет текущую единицу работы данными объекта в виде json.
     * Если объект не существует в единице работы, то он добавляется.
     * По умолчанию обновляются значения оригинальных свойств объекта (управляется опцией dirty);
     * @prototype
     * @param {Object} json Данные объекта в виде json
     * @param {Object} options Опции
     * @param {Object} propOptions Дополнительные опции для установки свойств
     * @return {DomainObject}
     */
    protected _fromJsonObject(json: DomainObjectData, options: FromJsonOptions, propOptions: SetPropOptions): DomainObject;
    /**
     * Initialize just created new object
     * @param obj
     */
    protected _initNewObject(obj: DomainObject): void;
    /**
     * Load an object by id.
     * Guarantees that all specified preloads will be loaded (even if the dataFacade doesn't support preloads)
     * @param {String} type Name of object type (entity)
     * @param {String} id ObjectID
     * @param {Object} [options]
     * @param {Boolean} [options.reload] reload the object in any case otherwise it'll be loaded only if it's !isLoaded
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    load<T extends DomainObject>(type: TypedNameTerm<T>, id: string, options?: LoadOptions): lang.Promise<T>;
    /**
     * Reload an object by id.
     * Guarantees that all specified preloads will be reloaded (even if the dataFacade doesn't support preloads)
     * @param {String} type EntityType
     * @param {String} id ObjectId
     * @param {Object} [options]
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    reload<T extends DomainObject>(type: TypedNameTerm<T>, id: string, options?: LoadOptions): lang.Promise<T>;
    /**
     * Ensures that the object and all preload (if any) will be loaded (even if the dataFacade doesn't support preloads).
     * @param {DomainObject|NotLoadedObject} obj The real domain object or the ghost object.
     * @param {Object} [options]
     * @param {Boolean} [options.reload] reload the object in any case otherwise it'll be loaded only if it's !isLoaded
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    ensureLoaded<T extends DomainObject>(obj: IDomainObject, options?: LoadOptions): lang.Promise<T>;
    /**
     * Load an object from DataFacade.
     * @private
     * @param {String} type Name of object type (entity)
     * @param {String} id ObjectID
     * @param {Object} options
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    protected _doLoad<T extends DomainObject>(type: EntityNameTerm, id: string, options: LoadOptions): lang.Promise<T>;
    /**
     * Load the value of the property (even if it is already loaded). The property can be navigation or simple.
     * Take into account, that this method may not load all preloads if the dataFacade doesn't support preloads.
     * @param {String} type Name of object type (entity)
     * @param {String} id ObjectID
     * @param {String} propName The name of the property
     * @param {Object} [options]
     * @param {String} [options.preloads]
     * @param {Boolean} [options.reload]
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    loadProp(type: EntityNameTerm, id: string, propName: string, options?: LoadOptions): lang.Promise<any>;
    /**
     * Ensures that the property is loaded.
     * Take into account, that this method may not load all preloads if the dataFacade doesn't support preloads.
     * @param {DomainObject} obj The domain object.
     * @param {String} propName
     * @param {Object} [options]
     * @param {String} [options.preloads]
     * @param {Boolean} [options.reload]
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    ensurePropLoaded(obj: DomainObject, propName: string, options?: LoadOptions): lang.Promise<any>;
    /**
     * Load the value of the property from DataFacade.
     * @private
     * @param {String} type Name of object type (entity)
     * @param {String} id ObjectID
     * @param {String} propMeta The metadata of the navigation property
     * @param {Object} options
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    protected _doLoadProp(type: EntityNameTerm, id: string, propMeta: PropertyMeta, options: LoadOptions): lang.Promise<any>;
    /**
     * Load all objects of specified type.
     * @param {String} type Name of object type (entity)
     * @param {Object} [options]
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise}
     */
    loadAll<T extends DomainObject>(type: TypedNameTerm<T>, options?: LoadOptions): lang.Promise<T[]>;
    /**
     * Loads a number of objects by query
     * @param query Query for dataFacade.
     * @param [interop] Optional load options (policy) for DataFacade
     * @returns {lang.Promise<LoadResponse>}
     */
    loadQuery<T extends DomainObject>(query: LoadQuery, interop?: interop.LoadOptions): lang.Promise<T[]>;
    /**
     * Loads data via dataFacade.load
     * @param query Base query for dataFacade. It is extended by options (preloads and params).
     * @param options
     * @returns {lang.Promise<LoadResponse>}
     */
    protected _dataLoad(query: LoadQuery, options: LoadOptions): lang.Promise<LoadResponse>;
    /**
     * Loads all navigation properties specified in 'path'
     * @param {DomainObject} obj The root object
     * @param {String} path The chain of preloads
     * @param {Object} options Original options passed to UnitOfWork.load method
     */
    protected _loadPath(obj: DomainObject, path: string, options: LoadOptions): lang.Promise<DomainObject>;
    /**
     * Returns effective options for DomainObject.toJson being called during `save`.
     * @return {ToJsonOptions}
     */
    getSaveToJsonOptions(): ToJsonOptions;
    /**
     * Override default static options for DomainObject.toJson being called during `save` for current instance.
     * @param {ToJsonOptions} opt
     */
    setSaveToJsonOptions(opt: ToJsonOptions): void;
    /**
     * Returns effective options for DomainObject.toJson being called during `getChanges`.
     * @return {ToJsonOptions}
     */
    getChangesToJsonOptions(): ToJsonOptions;
    /**
     * Override default static options for DomainObject.toJson being called during `getChanges` for current instance.
     * @param {ToJsonOptions} opt
     */
    setChangesToJsonOptions(opt: ToJsonOptions): void;
    /**
     * Save all changes.
     * @param {Object} [options]
     * @param {Function} [options.onSuccess] Custom callback for handling save success
     * @param {Function} [options.onError] Custom callback for handling save error
     * @param {Function} [options.onPreprocess] a callback to call with json objects before calling DataFacade.save
     * @param {Object} [options.interop] Advanced options for DataFacade.save
     * @returns {*}
     * @fires UnitOfWork#saving
     * @fires UnitOfWork#saved
     * @fires UnitOfWork#saveError
     */
    save(options?: SaveOptions): lang.Promise<SaveResult>;
    protected _onSaving(objects: DomainObject[]): boolean;
    protected onSaving(args: {
        objects: DomainObject[];
        cancel?: boolean;
    }): void;
    protected _updateObjectWithNewValues(obj: DomainObject, json: SavedObjectData): void;
    /**
     * Handler on saving of own objects successfully completed.
     * NOTE: its behavior deffers from `_onDataUpdate` handler which is called on saving other UoW's objects completed,
     * In current case all objects are already updated, but they can be additionally changed on the server,
     * So here we only copy data from __newValues.
     * @param {Array<DomainObject>} objects Own objects which have been saved
     * @param {Array<DomainObject>} created
     * @param {Array<DomainObject>} deleted
     * @param states
     * @param {Array<SavedObjectData>} jsonObjects Json objects data returned from DataFacade (with newvalues)
     * @returns {UnitOfWork.SaveResult}
     * @private
     */
    protected _onSaved(objects: DomainObject[], created: DomainObject[], deleted: DomainObject[], states: string[], jsonObjects: SavedObjectData[]): SaveResult;
    protected onSaved(result: SaveResult): void;
    protected _onSaveFailed(objects: DomainObject[], error: Error, states: string[]): void;
    protected onSaveFailed(args: {
        objects: DomainObject[];
        error: Error;
    }): void;
    /**
     * Returns id to json map of changed objects.
     * @param {Object} [options] Options for `DomainObject.toJson` method. By default static object UnitOfWork._changesToJsonOptions is used.
     * @param {boolean} [options.onlyChanged]
     * @param {boolean} [options.onlyChangedOrInitial]
     * @param {boolean} [options.onlyPersistent]
     * @param {boolean} [options.nullIfEmpty]
     * @param {boolean} [options.originalArrays]
     * @param {boolean} [options.nometa]
     * @returns {DomainObjectData[]}
     */
    getChanges(options?: ToJsonOptions): DomainObjectData[];
    /**
     * Return a map with all objects from current UnitOfWork.
     * Each objects serialized with help of `toJson` with supplied options.
     * @param {Object} options Serialization objects
     * @param {boolean} [options.onlyChanged]
     * @param {boolean} [options.onlyChangedOrInitial]
     * @param {boolean} [options.onlyPersistent]
     * @param {boolean} [options.nullIfEmpty]
     * @param {boolean} [options.originalArrays]
     * @param {boolean} [options.nometa]
     * @returns {lang.Map<DomainObjectData>}
     */
    toJson(options?: ToJsonOptions): lang.Map<DomainObjectData>;
    /**
     * Return all changed object in JSON form and make rollback.
     * NOTE: Before 1.34 the method was returning lang.Map<DomainObjectData>.
     * @return {DomainObjectData[]}
     */
    detachChanges(): DomainObjectData[];
    /**
     * Attach JSON objects as dirty into the current UnitOfWork.
     * NOTE: Before 1.34 the method was accepting lang.Map<DomainObjectData>.
     * @param {DomainObject[]} changes
     */
    attachChanges(changes: lang.Map<DomainObjectData> | DomainObjectData[]): void;
    saveState(stateName?: string): string;
    acceptState(stateName?: string): void;
    rollbackState(stateName?: string): void;
    hasState(stateName: string): boolean;
    clear(): void;
    /**
     * Replaces id of the object
     * @param obj
     * @param newId
     */
    replaceId(obj: IDomainObject, newId: string): void;
    findRefsTo(obj: IDomainObject): ReferenceToObject[];
    protected _onDataUpdate(sender: any, args: DataUpdateEventArgs): void;
    protected _onObsoleteDeleted(identities: ObjectIdentity[], remove: boolean): void;
    /**
     * Remove objects with specified identities from UoW permanently with clearing all references. Objects become invalid.
     * @param {Array} objectIdentities
     * @returns {Promise}
     */
    purgeWithCascade(objectIdentities: ObjectIdentity[]): lang.Promise<void>;
}
declare namespace UnitOfWork {
    interface Options {
        /**
         * Subscribe on DataFacade's 'update' event
         */
        connected?: boolean;
    }
    interface SaveSuccessArgs {
        options: interop.SaveOptions;
        objects: SavedObjectData[];
        states: string[];
        deferred: lang.Deferred<SaveResult>;
        complete: () => void;
        resolve: (objects: SavedObjectData[]) => void;
        reject: (error?: Error) => void;
    }
    interface SaveErrorArgs {
        error: Error;
        options: interop.SaveOptions;
        objects: DomainObjectData[];
        states: string[];
        deferred: lang.Deferred<SaveResult>;
        complete: () => void;
        resolve: (objects: SavedObjectData[]) => void;
        reject: (error?: Error) => void;
    }
    interface SaveOptions {
        /**
         * Custom callback for handling save success
         */
        onSuccess?: (args: SaveSuccessArgs) => void;
        /**
         * Custom callback for handling save error
         */
        onError?: (args: SaveErrorArgs) => void;
        /**
         * A callback to call with json objects before calling DataFacade.save
         */
        onPreprocess?: (objects: DomainObjectData[]) => void;
        /**
         * Advanced options for DataFacade.save
         */
        interop?: interop.SaveOptions;
        /**
         * @deprecated Use interop.suppressEventOnError
         */
        suppressEventOnError?: boolean;
        /**
         * @deprecated Use interop.suppressEventOnSuccess
         */
        suppressEventOnSuccess?: boolean;
        /**
         * @deprecated Use interop.suppressProcessEvent
         */
        suppressProcessEvent?: boolean;
        /**
         * @deprecated Use interop.hints
         */
        hints?: string[] | string;
        /**
         * @deprecated Use interop.policy
         */
        policy?: any;
    }
    interface SaveResult {
        objects: DomainObject[];
        created: DomainObject[];
        deleted: DomainObject[];
        stateName: string;
    }
}
export = UnitOfWork;
