/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import support = require("./support");
import ComplexValue = require("lib/domain/ComplexValue");
import { IDomainObject, DomainObjectData, UnitOfWork, GetPropOptions, SetPropOptions, ClearPropOptions, ToJsonOptions, FromJsonOptions, LoadOptions, metadata } from ".domain";
import EntityMeta = metadata.EntityMeta;
import PropertyMeta = metadata.PropertyMeta;
import ComplexPropertyMeta = metadata.ComplexPropertyMeta;
import UndoState = DomainObject.UndoState;
/**
 * A callback to iterate via the domain object's properties
 * @callback DomainPropertyPredicate
 * @param {Object} propMeta
 * @param {DomainObject} obj
 * @returns {Boolean}
 */
declare class DomainObject extends lang.Observable implements IDomainObject {
    /**
     * States of domain object (possible values for 'localState' property)
     * @enum {number}
     */
    localStates: typeof DomainObject.LocalState;
    meta: EntityMeta;
    isGhost: boolean;
    id: string;
    ts: number;
    isLoaded: boolean;
    uow: UnitOfWork;
    aux: lang.Map<any>;
    protected _propValues: lang.Map<any>;
    protected _propWrappers: lang.Map<any>;
    protected _localState: DomainObject.LocalState;
    protected _undostack: UndoState[];
    protected _sender: DomainObject;
    protected _deferredLoad: lang.Promise<this>;
    /**
     * Domain object.
     * @constructs DomainObject
     * @extends Observable
     * @param {String} id ObjectID - unique identifier
     */
    constructor(id?: string);
    dispose(): void;
    /**
     * Release resources
     */
    protected purge(): void;
    /**
     * Current object state
     * @observable-getter {DomainObject#localStates}
     */
    localState: lang.ObservableGetter<DomainObject.LocalState>;
    isModified(): boolean;
    isNew(): boolean;
    isRemoved(): boolean;
    isInvalid(): boolean;
    getPropMeta(propName: string): PropertyMeta;
    get(propName: string, options?: GetPropOptions): any;
    set(propName: string, propValue: any, options?: SetPropOptions): void;
    set(props: lang.Map<any>, options?: SetPropOptions): void;
    /**
     * Removes the property from the current values and the undo stack. So the property becomes unloaded.
     * If removed property should be loaded by default, the object becomes unloaded (flag isLoaded is false).
     * @param {String} propName
     */
    remove(propName: string): void;
    /**
     * Clear values of all properties by setting default values.
     * @param {Object} [options]
     * @param {DomainPropertyPredicate} [options.propFilter]
     */
    clear(options?: ClearPropOptions): void;
    /**
     * Whatever the object has any unsaved changes
     * @returns {boolean}
     */
    hasChanges(): boolean;
    hasChangesSince(stateName: string): boolean;
    /**
     * Whatever the property 'propName' has unsaved changes.
     * @param {String} propName Property name to check
     * @returns {boolean}
     */
    hasPropChanges(propName: string): boolean;
    /**
     * Whatever the object has any unsaved changes except of 'propName' property
     * @param {String} propName
     * @returns {boolean}
     */
    hasChangesExcept(propName: string): boolean;
    load(options?: LoadOptions): lang.Promise<this>;
    /**
     * Reload current object from the server (or DataStore)
     * @param {Object} options Options for UnitOfWork.load
     * @returns {Promise} current instance with reloaded values
     */
    reload(options?: LoadOptions): lang.Promise<DomainObject>;
    createJsonStub(): DomainObjectData;
    /**
     * Serialize current object into json representation.
     * @param {Object} [options]
     * @param {Boolean} [options.onlyChanged] To add only changed properties
     * @param {Boolean} [options.onlyChangedOrInitial] To add only changed properties or initial values for new objects
     * @param {Boolean} [options.onlyPersistent] To add only persistent properties
     * @param {Boolean} [options.nullIfEmpty] To return null for empty object (by default an empty json will be returned)
     * @param {Boolean} [options.originalArrays] To add original values of array properties (it's applicable only for not new objects)
     * @param {Boolean} [options.nometa] Do not add __metadata and id fields
     * @returns {JSON}
     */
    toJson(options?: ToJsonOptions): DomainObjectData;
    /**
     * Наполняет текущий объект данными в виде json.
     * По умолчанию обновляются значения оригинальных свойств (управляется опцией dirty).
     * @param {Object} json Данные объекта в виде json
     * @param {Object} [options] Дополнительные опции
     * @param {Boolean} [options.dirty] Признак недостоверных данных: true - обновляются текущие свойства объекта; false - оригинальные
     * @param {Boolean} [options.partial] Означает, что json-данные содержат не все необходимые свойства.
     * По умолчанию, если не задана опция dirty, то объект становится загруженным (устанавливается флаг isLoaded).
     * Кроме того, если ts в json-данных больше текущего, то также удаляются все свойства, которых нет в json.
     * Оба этих действия отключаются опцией partial.
     * @param {Object} propOptions Дополнительные опции для установки свойств. Если не заданы, то вычисляются на основании options. Используются для оптимизации.
     * @return {DomainObject} Текущий объект
     */
    fromJson(json: DomainObjectData, options?: FromJsonOptions, propOptions?: SetPropOptions): DomainObject;
    /**
     * Создает состояние для стека отката, но не добавляет его в стек.
     * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
     * @ignore
     */
    protected createState(stateName?: string): UndoState;
    /**
     * Сохраняет текущее состояние объекта
     * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
     * @ignore
    */
    saveState(stateName?: string): string;
    /**
     * Утверждает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
     * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
     * @ignore
    */
    acceptState(stateName?: string): void;
    /**
     * Откатывает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
     * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
     * @ignore
    */
    rollbackState(stateName?: string): void;
    /**
     * Setup ts in DomainObject
     * @param {Number} ts
     */
    setTs(ts: number): void;
    /**
     * Set the value of id
     * @param id New value of id
     * @param [options]
     * @param {Boolean} [options.allowForSaved] Id can be set for an object in any state, not for created only
     */
    setId(id: string, options?: {
        allowForSaved?: boolean;
    }): void;
    /**
     * Replaces oldId to newId in the value of the navigation property
     * @param propMeta Metadata of navigation property
     * @param oldId
     * @param newId
     */
    protected replaceRefId(propMeta: PropertyMeta, oldId: string, newId: string): void;
    /**
     * Returns current object formatted presentation.
     * @param [format] optional name of formatter to use otherwise (if empty) default formatter will be used
     * @return {String}
    */
    toString(format?: string): string;
    /**
     * Return formatted value of the property
     * @param {String} propName property name
     * @return {String} formatted value
     */
    getFormatted(propName: string): string;
    /**
     * Returns initial value of the property
     * @param {String} propName
     * @returns {*}
     */
    getInit(propName: string): any;
    protected _getSimplePropValue(propMeta: PropertyMeta, options: GetPropOptions): any;
    /**
     * возвращает "типизированное" значение навигируемого свойства
     */
    protected _getNavPropValue(propMeta: PropertyMeta, options: GetPropOptions): any;
    /**
     * устанавливает значение навигируемого свойства
     */
    protected _setNavPropValue(propMeta: PropertyMeta, propValue: any, options: support.SetPropRawOptions): void;
    /**
     * Получает значение свойства по его метаданным
     */
    protected _getPropValue(propMeta: PropertyMeta, options: GetPropOptions): any;
    /**
     * Получает значение комплексного свойства по его метаданным
     */
    protected _getComplexValue(propMeta: ComplexPropertyMeta, options: GetPropOptions): ComplexValue;
    protected _parsePropValue(propMeta: PropertyMeta, propValue: any, skipValidation?: boolean): any;
    /**
     * Set property value.
     * @param propMeta Property metadata
     * @param propValue Property value
     * @param [options] Options
     */
    protected _setPropValue(propMeta: PropertyMeta, propValue: any, options?: support.SetPropRawOptions): void;
    protected _setComplexValue(propMeta: ComplexPropertyMeta, propValue: any, options?: support.SetPropRawOptions): void;
    protected _deletePropValue(propMeta: PropertyMeta): void;
    /**
     * Удаляет состояние из стека отката объекта
     */
    protected _removeState(stateIndex: number, options: SetPropOptions, minLocalState?: DomainObject.LocalState): void;
    /**
     * Возвращает состояние из стека отката объекта, в котором первый раз произошли изменения
     * @returns {*}
     */
    protected _firstChangedState(): UndoState;
    /**
     * Возвращает исходное значение свойства
     * @param propMeta
     */
    protected _getOriginalRaw(propMeta: PropertyMeta): any;
    /**
     * Replace an element of array
     */
    private _replaceItem<T>(items, searchItem, replaceItem, copy?);
    getPropFromPath(path: string): PropertyMeta;
    isPropLoaded(propName: string): boolean;
}
declare namespace DomainObject {
    enum LocalState {
        /** Default object state */
        "default" = 0,
        /** Synonym for "default" */
        normal = 0,
        /** Object was changed */
        modified = 1,
        /** New object, created but not saved */
        "new" = 2,
        /** Synonym for "new" */
        created = 2,
        /** Object was marked as deleted but not saved */
        removed = 3,
        /** Invalid object, e.g. removed after save */
        invalid = 4,
    }
    type UndoState = {
        name: string;
        values: lang.Map<any>;
        localState?: LocalState;
        ts?: number;
    };
}
export = DomainObject;
