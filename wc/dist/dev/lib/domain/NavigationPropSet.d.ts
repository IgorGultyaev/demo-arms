/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import NavigationPropBase = require("./NavigationPropBase");
import domain = require(".domain");
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
import LoadOptions = NavigationPropSet.LoadOptions;
import INavigationPropSet = domain.INavigationPropSet;
import lang = core.lang;
declare class NavigationPropSet extends NavigationPropBase implements INavigationPropSet {
    isLoaded: boolean;
    isGhost: boolean;
    private _deferredLoad;
    /**
     * Descriptor of a loaded collection navigation property of DomainObject.
     *
     * Множество доменных объектов, являющееся значением загруженного массивного навигируемого свойства
     * @constructs NavigationPropSet
     * @extends NavigationPropBase
     * @param {DomainObject} parent
     * @param propMeta
     */
    constructor(parent: DomainObject, propMeta: PropertyMeta);
    dispose(): void;
    /**
     * @param {Object} [options]
     * @param {Boolean} [options.idsOnly] do not load all value objects (by default they are loaded)
     * @param {Boolean} [options.reload] force loading even if all data is already loaded
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise} NavigationPropSet
     */
    load(options?: LoadOptions): lang.Promise<this>;
    protected _doLoad(options?: LoadOptions): lang.Promise<this>;
    /**
     * Загрузка (load) для случая не idsOnly и не reload
     * @param {NavigationPropSet.LoadOptions} options
     * @return {Promise<any>}
     * @private
     */
    private _load(options);
    private _reload(options);
    private _loadMultiple(items, options);
    private _loadProp(options);
    /**
     * @deprecated Use `load` method instead
     */
    loadItems(options?: LoadOptions): lang.Promise<INavigationPropSet>;
    ids(): string[];
    count(): number;
    all(): DomainObject[];
    get(index: number | string): DomainObject;
    /**
    *
    * @param {String|Object} [type] наименование типа, если задан второй параметр - идентификатор, либо идентификатор объекта (тогда в качесте типа используется тип свойства)
    * @param {string} [type.type] наименование типа
    * @param {string} [type.id] идентификатор объекта
    * @param {string} [id] идентификатор объекта, если первый параметр типа string (имя типа)
    */
    first(type?: any, id?: string): DomainObject;
    indexOf(obj: DomainObject | string): number;
    contains(obj: DomainObject | string): boolean;
    add(item: DomainObject | DomainObject[] | string | string[]): void;
    remove(item: DomainObject | DomainObject[] | string | string[]): void;
    reset(items: string | string[] | DomainObject | DomainObject[]): void;
    clear(): void;
    move(indexFrom: number, indexTo: number): void;
    /**
     * Iterating through all objects in the property.
     * Please note, that despite of signature of iterator it WON'T get `array` argument (array of objects).
     * @param iterator
     * @param [context]
     */
    forEach(iterator: (item: DomainObject, index: number, array: DomainObject[]) => void, context?: any): void;
    find(predicate: (item: DomainObject, index: number) => boolean, context?: any): DomainObject;
    toString(): string;
    private _onPropChange(sender, value, oldValue);
    private _onObjChange(sender, args);
    private _onObjLoad(sender, args?);
    private _iterate(items, iterator, context?);
    private _getValueObject(id);
    private _getIds();
    private _updateIsLoaded();
    private _initObj(obj);
    private _cleanupObj(obj);
    private _triggerGet(args);
    private _triggerChange(args);
}
declare namespace NavigationPropSet {
    interface LoadOptions extends domain.LoadOptions {
        idsOnly?: boolean;
    }
}
export = NavigationPropSet;
