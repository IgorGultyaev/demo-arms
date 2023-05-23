/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import DomainObjectMap = require("./DomainObjectMap");
import domain = require(".domain");
import IDomainObject = domain.IDomainObject;
import IDomainModel = domain.IDomainModel;
import DomainObject = domain.DomainObject;
import UnitOfWork = domain.UnitOfWork;
import PropertyMeta = domain.metadata.PropertyMeta;
import EntityNameTerm = domain.EntityNameTerm;
import ReferenceToObject = domain.ReferenceToObject;
import ChangeOptions = domain.ChangeOptions;
import SetPropOptions = domain.SetPropOptions;
/**
 * DomainObjectRegistry - множество доменных объектов с поиском по типу и id.
 * Может содержать как сами доменные объекты, так и незагруженные ghost-объекты.
 * Используется в UnitOfWork.
 */
declare class DomainObjectRegistry {
    private _model;
    private _uow;
    private _objects;
    private _undostack;
    /**
     * Конструктор
     * @param model Доменная модель
     * @param uow Родительская UnitOfWork
     */
    constructor(model: IDomainModel, uow: UnitOfWork);
    add(obj: IDomainObject, options: ChangeOptions, noSyncState?: boolean): void;
    remove(obj: IDomainObject, options?: ChangeOptions): void;
    find(type: EntityNameTerm, id: string): IDomainObject;
    all(): IDomainObject[];
    forEach(callback: (obj: IDomainObject) => void, context?: any): void;
    some(callback: (obj: IDomainObject) => boolean, context?: any): boolean;
    /**
    Получает объекты, ссылающиеся на другой объект.
    @returns Массив plain-объектов со свойствами:
    object - объект, ссылающийся на переданный объект
    prop - свойство, ссылающееся на переданный объект
    */
    objectRefsTo(obj: IDomainObject, refProps?: PropertyMeta[]): ReferenceToObject[];
    pendingAdd(propMeta: PropertyMeta, id: string, valueId: string, options: SetPropOptions): void;
    pendingRemove(propMeta: PropertyMeta, id: string, valueId: string, options: SetPropOptions): void;
    private _pendingVerb(verb, propMeta, id, valueId, options);
    /**
     * Применяет отложенные действия к объекту
     * @param {DomainObject} obj Объект, к которому применяются действия
     * @param {Object} [options]
     */
    applyPending(obj: DomainObject, options: SetPropOptions): void;
    /**
     * Применяет отложенные действия к объекту
     * @param {DomainObject} obj Объект, к которому применяются действия
     * @param {Array} actions Массив отложенных действий, которые нужно применить
     * @param {Number} undoIndex Индекс состояния в стеке отката, куда нужно скопировать исходное значение свойства
     * @param {Object} options
     * @param {boolean} deleteApplied
     * @returns {boolean} true, если хотя бы одно действие было применено
     */
    private _applyPending(obj, actions, undoIndex, options, deleteApplied);
    /**
     * Сохраняет текущее состояние
    */
    saveState(stateName?: string): string;
    /**
     * Откатывает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
    */
    rollbackState(stateName?: string): void;
    rollbackAll(): void;
    hasState(stateName: string): boolean;
    /**
     * Утверждает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
    */
    acceptState(stateName?: string): void;
    /**
     * Проверяет, есть ли сохраненные состояния (т.е. вызывался ли метод saveState без последующих
     * вызовов acceptState или rollbackState).
    */
    hasSavedStates(): boolean;
    /**
     * Returns names of all states in the undo stack
     * @returns {string[]}
     */
    getStateNames(): string[];
    /**
     * Replaces id of the object
     * @param obj
     * @param newId
     */
    replaceId(obj: IDomainObject, newId: string): void;
    private _replaceId(objectMap, propMeta, oldId, newId);
    /**
     * Создает "состояние" реестра, которое можно откатить или применить
     * @param {String} stateName Наименование состояния (может быть не задано)
     */
    private createState(stateName?);
    /**
     * Удаляет состояние из стека отката объекта
     */
    private removeState(stateIndex);
}
declare namespace DomainObjectRegistry {
    interface UndoState {
        name: string;
        added: DomainObjectMap<DomainObject>;
        removed: DomainObjectMap<DomainObject>;
        pending: DomainObjectMap<PendingAction[]>;
    }
    type PendingVerb = "add" | "remove";
    interface PendingAction {
        prop: PropertyMeta;
        id: string;
        verb: PendingVerb;
        original: boolean;
        norollback: boolean;
    }
}
export = DomainObjectRegistry;
