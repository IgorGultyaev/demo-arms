/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import domain = require(".domain");
import IDomainObject = domain.IDomainObject;
import DomainObject = domain.DomainObject;
import DomainObjectUndoState = domain.DomainObject.UndoState;
import DomainObjectLocalState = domain.DomainObject.LocalState;
import EntityNameTerm = domain.EntityNameTerm;
import EntityMeta = domain.metadata.EntityMeta;
import PropertyMeta = domain.metadata.PropertyMeta;
import NotifyOptions = domain.NotifyOptions;
import GetPropOptions = domain.GetPropOptions;
import SetPropOptions = domain.SetPropOptions;
export interface IEventNotifier {
    trigger(ctx: any, name: string, ...args: any[]): void;
    resume(): void;
}
export interface NotifyRawOptions extends NotifyOptions {
    notifier?: IEventNotifier;
}
export interface SetPropRawOptions extends SetPropOptions, NotifyRawOptions {
    /**
     * Index of the state in undo stack where current value will be copied to. If not specified, the last (top) state will be used.
     * Ignored if option 'norollback' or 'original' is specified.
     */
    undoIndex?: number;
}
/**
 * Возвращает имя класса.
 * @param type - наименовнаие типа {string}
 *             - функция-класс доменного объекта
 *             - json-объект метаописателя типа
 */
export declare function typeNameOf(type: EntityNameTerm): string;
/**
 * Возвращает идентификатор объекта
 * @param {String|DomainObject} obj Cтрока или доменный объект
 */
export declare function objectIdOf(obj: string | IDomainObject): string;
/**
 * Return meta properties of model that reference to the specified type.
 */
export declare function propRefsTo(targetEntityInfo: EntityMeta): PropertyMeta[];
/**
 * Выбрасывает исключение, если у объекта не установлено свойство uow
 */
export declare function throwIfDetached(obj: IDomainObject): void;
export declare function notifyPropChanged(obj: DomainObject, propName: string, propValue: any, oldValue: any, options?: NotifyRawOptions): void;
export declare function notifyPropSet(obj: DomainObject, propName: string, propValue: any, oldValue: any, options?: NotifyRawOptions): void;
export declare function notifyPropGet(obj: DomainObject, propName: string, propValue: any, options?: NotifyRawOptions): void;
export declare function getPropRaw(obj: DomainObject, propMeta: PropertyMeta, options?: GetPropOptions): any;
export declare function setPropRaw(obj: DomainObject, propMeta: PropertyMeta, propValue: any, options?: SetPropRawOptions): void;
/**
 * Remove id from opposite property without synchronization.
 * @param {DomainObject} obj
 * @param {PropertyMeta} propMeta
 * @param {String} id
 * @param {SetPropRawOptions} options
 */
export declare function removeFromOppositeNavProp(obj: DomainObject, propMeta: PropertyMeta, id: string, options?: SetPropRawOptions): void;
export declare function addToOppositeNavProp(obj: DomainObject, propMeta: PropertyMeta, id: string, options?: SetPropRawOptions): void;
/**
 * Добавляет id к значению навигируемого свойства (для массивных) или замещает значение свойства (для скалярных).
 * Синхронизирует обратное свойство.
 * @param {DomainObject} obj исходный доменный объект, свойство которого модифицируется
 * @param {object} propMeta метаданные модифицируемого свойства объекта obj
 * @param {string|DomainObject} v идентификатор или объект, добавляемый к свойству
 * @param {object} [options]
 * @param {boolean} [noSync] не синхронизировать обратное свойство
 */
export declare function addToNavProp(obj: DomainObject, propMeta: PropertyMeta, v: string | IDomainObject, options?: SetPropRawOptions, noSync?: boolean): void;
/**
 * Удаляет id из значения навигируемого свойства. Синхронизирует обратное свойство.
 * @param {DomainObject} obj исходный доменный объект, свойство которого модифицируется
 * @param propMeta метаданные модифицируемого свойства объекта obj
 * @param {string} v идентификатор, удаляемый из свойства
 * @param {Object} [options]
 * @param {boolean} [noSync] - не синхронизировать обратное свойство
 */
export declare function removeFromNavProp(obj: DomainObject, propMeta: PropertyMeta, v: string | IDomainObject, options?: SetPropRawOptions, noSync?: boolean): void;
/**
 * Returns initial value of the property
 * @param {Object} propMeta
 * @return {*}
 */
export declare function getInit(propMeta: PropertyMeta): any;
export declare function setLocalState(obj: DomainObject, value: DomainObjectLocalState, options?: SetPropOptions, undoState?: DomainObjectUndoState): void;
export declare let errors: {
    createObjectNotFound: (typeName: string, id: string) => Error;
    createNotAuthorized: () => Error;
};
export declare function findObjectByIdentity(objects: DomainObject[], typeName: string, id: string): DomainObject;
export declare function findObjectByIdentity(objects: IDomainObject[], typeName: string, id: string): IDomainObject;
export declare let states: {
    topUndoState: {
        <T>(target: {
            _undostack: T[];
        }): T;
        <T>(target: any): T;
    };
    getUndoStateIndex: <T extends {
        name: string;
    }>(target: any, stateName?: string) => number;
    removeUndoState: <T>(target: any, stateIndex: number, stateFactory: (name: string) => T) => void;
};
export interface LobPropValueDto {
    size?: number;
    fileName?: string;
    mimeType?: string;
    /**
     * Specified for local (unsaved) value after value chosen and before it uploaded onto server.
     */
    pendingUpload?: boolean;
    /**
     * Specified for local (unsaved) value but uploaded onto server
     */
    resourceId?: string;
}
export declare class LobPropValue implements LobPropValueDto {
    size: number;
    fileName: string;
    /**
     * Specified for local (unsaved) value after value chosen and before it uploaded onto server.
     */
    pendingUpload?: boolean;
    /**
     * Specified for local (unsaved) value but uploaded onto server
     */
    resourceId?: string;
    mimeType?: string;
    /**
     * @constructs LobPropValue
     * @param {Object} dto
     */
    constructor(dto: LobPropValueDto);
    toString(): string;
    toJson(): any;
}
/**
 * Специальные описатели значений свойств для возврата DomainObject.get на основании json-значения из _propValues.
 * Внутри DomainObject._propValues может быть значение - объект с полем $value,
 * по значению $value ищется знчение в словаре `values`. Если это функция, класс, то она вызывается через new с параметров json-объектом,
 * иначе (не функция) используется значение из словаря.
 * Всё это происходит в DomainObject._getSimplePropValue, т.е. при получении значения свойства DomainObject.get.
 * При присвоении (DomainObject.set) происходит обратное - см. DomainObject._setPropValue,
 * с помощью _parsePropValue переданное значение прообразуется в примитивное и помещается в DomainObject._propValues.
 * Для этого используется метод toJson переданного (в DomainObject.set) значения.
 * Если toJson у значения нет, но есть поле $value, то значение используется AS IS, без дальнейшего парсинга.
 * Иначае оно проходит через парсер свойства.
 */
/**
 * Classes and value-object for prop values.
 * Can be used as output for `DomainObject.get` and input for `DomainObject.set`.
 */
export declare let values: {
    NotAuthorizedPropValue: {
        isNotAuthorized: boolean;
        toString: () => string;
        is: (value: any) => boolean;
        toJson: () => Object;
    };
    LobPropValue: typeof LobPropValue;
};
export declare let json: {
    materializeProp: (v: any, propMeta: PropertyMeta) => any;
    dematerializeProp: (v: any, propMeta: PropertyMeta) => any;
};
export declare class ChangeBatchNotifier implements IEventNotifier {
    private _batch;
    /**
     * Collect 'change', 'change:{prop}' and 'set' events and trigger them in a batch
     * @constructs ChangeBatchNotifier
     */
    constructor();
    /**
     * A replacement for NavigationPropBase trigger method.
     * Instead of events generating it collect events arguments till 'resume' method called.
     * @param {Object} ctx An object which generates event
     * @param {String} name Event name
     * @param {Object} sender Event sender (can differ from ctx)
     * @param {Object} data event's arguments
     */
    trigger(ctx: lang.IEventful, name: string, sender: any, data: any): void;
    /**
     * Completes batch and generates all collected events.
     */
    resume(): void;
    /**
     * Returns an array of arguments of 'trigger' method called for specified context
     * @param ctx
     * @returns {Array}
     * @private
     */
    private _getEvents(ctx);
}
export declare let initFacets: {
    getTypeInitFacet: (initFacet: string, propMeta: PropertyMeta) => any;
    dateTime: {
        now: (propMeta: PropertyMeta) => Date;
    };
};
