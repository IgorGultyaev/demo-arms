/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="../vendor/moment/moment.d.ts" />
/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as _ from "underscore";
export declare function noop(...args: any[]): void;
export declare function forEach<T>(obj: T[], iterator: (item: T, index: number) => void, context?: any): any;
export declare function forEach<T>(obj: Map<T>, iterator: (item: T, key: string) => void, context?: any): any;
export declare function forEach(obj: any, iterator: (item: any, key: string) => void, context?: any): any;
export declare const every: {
    <T>(list: _.List<T>, iterator?: _.ListIterator<T, boolean>, context?: any): boolean;
    <T>(list: _.Dictionary<T>, iterator?: _.ObjectIterator<T, boolean>, context?: any): boolean;
};
export declare const some: {
    <T>(list: _.List<T>, iterator?: _.ListIterator<T, boolean>, context?: any): boolean;
    <T>(object: _.Dictionary<T>, iterator?: _.ObjectIterator<T, boolean>, context?: any): boolean;
};
export declare const clone: <T>(object: T) => T;
export declare const first: {
    <T>(array: _.List<T>): T;
    <T>(array: _.List<T>, n: number): T[];
};
export declare const last: {
    <T>(array: _.List<T>): T;
    <T>(array: _.List<T>, n: number): T[];
};
export declare const unique: {
    <T, TSort>(array: _.List<T>, iterator?: _.ListIterator<T, TSort>, context?: any): T[];
    <T, TSort>(array: _.List<T>, isSorted?: boolean, iterator?: _.ListIterator<T, TSort>, context?: any): T[];
};
export declare function contains<T>(list: T[] | Map<T>, value: T): boolean;
export declare const find: {
    <T>(list: _.List<T>, iterator: _.ListIterator<T, boolean>, context?: any): T;
    <T>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, boolean>, context?: any): T;
};
export declare function findIndex<T>(obj: T[], predicate: (item: T, index: number) => boolean, context?: any): number;
/**
 * Options for extendEx, appendEx and cloneEx methods
 */
export declare type ExtendOptions = {
    /**
     * Copy recursively.
     */
    deep?: boolean;
    /**
     * Copy exactly, i.e. copy props with undefined value.
     */
    exact?: boolean;
    /**
     * Props to ignore (do not copy).
     */
    except?: string[];
};
/**
 * Traverse all object value calling supplied iterator for each value.
 * @param {object} object A simple object to traverse
 * @param {Function} visitor Iterator with signature: function ({String} name, {*} value, {Array} path)
 * @param {object} [options]
 * @param {boolean} [options.visitObjects=false]
 * @param {boolean} [options.visitValues=true]
 */
export declare function traverseObject(object: Object, visitor: (name: string, value: any, path: string[], object: Object, isObject: boolean) => boolean | void, options?: {
    visitObjects?: boolean;
    visitValues?: boolean;
}): boolean;
/**
 * Create a copy of an object or an array
 * @param {object} obj
 * @param {object} [options]
 * @param {boolean} [options.deep] Clone nested values
 * @param {boolean} [options.exact] Copy undefined values
 * @returns {object} New object or array
 */
export declare function cloneEx<T>(obj: T, options: ExtendOptions): T;
export declare function extend<T, U>(obj: T, source: U): T & U;
export declare function extend<T, U1, U2>(obj: T, source1: U1, source2: U2): T & U1 & U2;
export declare function extend<T, U1, U2, U3>(obj: T, source1: U1, source2: U2, source3: U3): T & U1 & U2 & U3;
export declare function extend<T, U>(obj: T, ...sources: U[]): T & U;
export declare function extendEx<T, U>(obj: T, source: U, options: ExtendOptions): T & U;
export declare function extendEx<T, U1, U2>(obj: T, source1: U1, source2: U2, options: ExtendOptions): T & U1 & U2;
export declare function extendEx<T, U1, U2, U3>(obj: T, source1: U1, source2: U2, source3: U3, options: ExtendOptions): T & U1 & U2 & U3;
/**
 * @deprecated Use extendEx method
 */
export declare function deepExtend(...args: any[]): any;
/**
 * @deprecated Use extendEx method
 */
export declare function exactExtend(...args: any[]): any;
export declare function append<T, U>(obj: T, source: U): T & U;
export declare function append<T, U1, U2>(obj: T, source1: U1, source2: U2): T & U1 & U2;
export declare function append<T, U1, U2, U3>(obj: T, source1: U1, source2: U2, source3: U3): T & U1 & U2 & U3;
export declare function append<T, U>(obj: T, ...sources: U[]): T & U;
export declare function appendEx<T, U>(obj: T, source: U, options: ExtendOptions): T & U;
export declare function appendEx<T, U1, U2>(obj: T, source1: U1, source2: U2, options: ExtendOptions): T & U1 & U2;
export declare function appendEx<T, U1, U2, U3>(obj: T, source1: U1, source2: U2, source3: U3, options: ExtendOptions): T & U1 & U2 & U3;
/**
 * @deprecated Use appendEx method
 */
export declare function deepAppend(...args: any[]): any;
/**
 * Assign specified field in obj or a new object.
 * @param {object} obj
 * @param {string} propName
 * @param {*} propValue
 * @returns {object} enriched obj or new object with assigned value
 */
export declare function setValue(obj: any, propName: string, propValue: any): any;
/**
 * Overrides some methods of the object.
 * @param {object} obj
 * @param {object} overrides
 * @returns {object} obj
 * @example
 * var obj = {
 *     sayHello: function (name) { console.log("Hello, " + name + "!"); }
 * };
 * lang.override(obj, {
 *     sayHello: function (base, name) {
 *         // first argument is the original method
 *         // others are the arguments passed to the function by a caller
 *         base.call(this, "dear " + name);
 *     }
 * });
 * obj.sayHello("user"); // prints "Hello, dear user!"
 */
export declare function override(obj: any, overrides: Map<Function>): any;
export declare const difference: <T>(array: _.List<T>, ...others: _.List<T>[]) => T[];
export declare const groupBy: {
    <T>(list: _.List<T>, iterator?: _.ListIterator<T, any>, context?: any): _.Dictionary<T[]>;
    <T>(list: _.List<T>, iterator: string, context?: any): _.Dictionary<T[]>;
    <T>(list: _.Dictionary<T>, iterator?: _.ListIterator<T, any>, context?: any): _.Dictionary<T[]>;
    <T>(list: _.Dictionary<T>, iterator: string, context?: any): _.Dictionary<T[]>;
};
export declare function select<T, U>(obj: T[] | T, iterator: (item: T, index?: number) => U, context?: any): U[] | T;
export declare function select<T, U>(obj: T[], iterator: (item: T, index?: number) => U, context?: any): U[];
export declare function select<T, U>(obj: T, iterator: (item: T, index?: number) => U, context?: any): U;
/**
 * Checks whether value in 'source' argument starts with value in 'search' argument.
 * @param {string} source Source string to search in
 * @param {string} search Substring to search for
 * @return {boolean} true if source's value starts with search value.
 */
export declare function stringStartsWith(source: string, search: string): boolean;
export declare function stringEndsWith(source: string, search: string): boolean;
export declare function encodeHtml(str: string, whitespaces?: boolean): string;
export declare function decodeHtml(str: string): string;
/**
 * Extracts text from html
 * @param html
 * @returns {any}
 */
export declare function htmlText(html: string): string;
export declare function stringFormat(format: string, ...args: any[]): string;
/**
 * Returns an array of its arguments.
 * Unlike Array#concat this method appends array items whole.
 * Use this method via apply to make an array from arguments object for better performance:
 * @example
 * function foo() {
 *     var args = lang.concat.apply(null, arguments);
 * }
 * @param {...*} args
 * @returns {Array}
 */
export declare function concat(...args: any[]): any[];
export declare function concatExceptLast(...args: any[]): any[];
/**
 * Append one array to another. Not using Array.prototype.push.apply, as it may cause stack overflow
 * @param arrTarget - array to be expanded
 * @param arrSource - source array or single element to append to target array
 */
export declare function arrayAppend<T>(arrTarget: T[], arrSource: T[]): T[];
export declare function array<T>(value: T[] | T): T[];
export declare function arrayRemove<T>(array: T[], item: T): boolean;
/**
 * @deprecated Use 'find' method instead
 * @param array
 * @param finder
 * @returns {*}
 */
export declare function arrayFindFirst<T>(array: T[], finder: (item: T, index?: number) => boolean): T;
/**
 * @deprecated Use 'last' method instead
 * @param stack
 * @returns {*}
 */
export declare function stackTop<T>(stack: T[]): T;
/**
 * Returns the first non-undefined value among arguments.
 * @param {...*} args
 */
export declare function coalesce<T>(...args: T[]): T;
export declare const uuid: {
    (prefix: string): string;
    (): number;
};
export declare function debounce(func: Function | string, wait?: number, field?: string | boolean): any;
export declare const isArray: (a: any) => a is Array<any>;
export declare const isObject: (a: any) => a is Object;
export declare const isFunction: (a: any) => a is Function;
export declare const isString: (a: any) => a is string;
export declare const isNumber: (a: any) => a is number;
export declare const isBoolean: (a: any) => a is boolean;
export declare const isDate: (a: any) => a is Date;
export declare const isRegExp: (a: any) => a is RegExp;
export declare const isEmpty: (object: any) => boolean;
export declare const isEmptyObject: (obj: any) => boolean;
export declare function isNullOrEmpty(v: any): boolean;
export declare function isInteger(v: any): boolean;
export declare function isPlainObject(obj: any): boolean;
export declare function isClonable(obj: any): boolean;
export declare function isDisposable(obj: any): obj is IDisposable;
export declare function isError(obj: any): obj is Error;
export declare const isEqual: (object: any, other: any) => boolean;
/**
 * Compare two values for sorting. You can pass this method as an argument of Array.prototype.sort().
 * @param x
 * @param y
 * @returns {number}
 */
export declare function compare(x: any, y: any): number;
/**
 * Sorts an array's element. Unlike Array.prototype.sort(), doesn't modify an original array.
 * Uses stable sorting (unlike Array.prototype.sort()).
 * @param {Array} array an array to sort
 * @param {Function} [comparer] comparison function a-la Array.prototype.sort()
 * @returns {Array} new array
 */
export declare function sort<T>(array: T[], comparer?: (x: T, y: T) => number): T[];
/**
 * Sorts an array's element by a criterion produced by an iterator.
 * Uses stable sorting.
 * @param {Array} array an array to sort
 * @param {Function} iterator function that returns the value to compare
 * @param {*} [context] 'this' argument for calling iterator
 * @returns {Array} new array
 */
export declare const sortBy: {
    <T, TSort>(list: _.List<T>, iterator?: _.ListIterator<T, TSort>, context?: any): T[];
    <T>(list: _.List<T>, iterator: string, context?: any): T[];
};
export declare function toInteger(n: any): number;
export declare const Deferred: <T>(beforeStart?: (deferred: JQueryDeferred<T>) => any) => JQueryDeferred<T>;
export declare const deferred: <T>(beforeStart?: (deferred: JQueryDeferred<T>) => any) => JQueryDeferred<T>;
export interface Promise<T> extends JQueryPromise<T> {
}
export interface Deferred<T> extends JQueryDeferred<T> {
}
export declare type Promisable<T> = T | Promise<T>;
/**
 * jQuery Promise
 * @typedef {Deferred|jQuery.Deferred} Promise
 * @global
 */
/**
 * jQuery Promise
 * @typedef {Deferred|jQuery.Deferred} jQuery.Promise
 * @global
 */
export declare const when: <T>(...deferreds: (T | JQueryPromise<T>)[]) => JQueryPromise<T>;
export declare function whenAll(...args: Promise<void>[]): Promise<void>;
export declare function whenAll(...args: Promise<any>[]): Promise<any>;
export declare function whenAll(tasks: Promise<void>[]): Promise<void>;
export declare function whenAll(tasks: Promise<any>[]): Promise<any>;
export declare function whenAll(): Promise<void>;
export declare function resolved<T>(v: T, ...args: any[]): Promise<T>;
export declare function resolved(): Promise<void>;
export declare function rejected(...args: any[]): Promise<any>;
export declare function rejected<T>(...args: any[]): Promise<T>;
/**
 * Is obj a JQuery 1.x Promise/Deferred object?
 * IMPORTANT: it will return false for native promises.
 * @param {any} obj object to test
 * @return {boolean}
 */
export declare function isPromise(obj: any): obj is Promise<any>;
/**
 * If the Deferred is already resolved, this method returns the value passed as the first argument of
 * Deferred.resolve(). Otherwise it returns undefined.
 * @param deferred
 * @return {*}
 */
export declare function resolvedValue(deferred: Promise<any>): any;
export declare function parseJsonString(str: string): any;
export declare function observe(obj: any): any;
/**
 * Возвращает значение свойства name у объекта obj. Если у объекта obj есть метод с именем name,
 * то вернется результат вызова этого метода; иначе вернется поле с именем name.
 * @param obj
 * @param name
 * @return {*}
 */
export declare function get(obj: any, name: string): any;
export declare function set(obj: any, name: string, value: any): void;
/**
 * Возвращает функцию доступа к свойству с наименованием name. Если у объекта this есть метод с именем name,
 * то будет использоваться этот метод; иначе будет использоваться поле с именем name.
 * @param name
 * @return {Function}
 */
export declare function property(name: string): Function;
/**
 * Получает вложенное значение по пути от корневого объекта/пространства имен.
 * @param root {object}
 * @param path {string}
 */
export declare function nested(root: object, path: string): any;
export declare type Lazy<T> = T | Factory<T>;
export declare function unlazy<T>(v: Lazy<T>): T;
export declare function unlazy<T>(v: Lazy<T>, ...factoryArgs: any[]): T;
/**
 * The mode of overriding conflicting names:
 *  "always" - always override existent members (the mixin has higher priority), used by default
 *  "never" - never override existent members (the current class has higher priority)
 *  "inherited" - override inherited members declared in the ancestor classes only, but keep own members declared directly in the current class
 */
export declare type OverrideMemberMode = "always" | "never" | "inherited";
/**
 * Базовый класс для обеспечения обратной совместимости с lang.Class
 */
export declare class CoreClass {
    /**
     * Добавляет члены в текущий класс
     */
    static mixin(extension: Function | Object, override?: OverrideMemberMode): typeof CoreClass;
    /**
     * Создает наследника от класса
     */
    static extend(body: any): any;
    /**
     * Добавляет статические методы к классу
     */
    static shared(body: any): typeof CoreClass;
    static create<T extends CoreClass>(this: {
        new (): T;
    }): T;
    static create<T extends CoreClass, TArg, TArgEx extends TArg>(this: {
        new (_arg: TArg): T;
    }, arg: TArgEx): T;
    static create<T extends CoreClass, TArg1, TArg2, TArgEx1 extends TArg1, TArgEx2 extends TArg2>(this: {
        new (_arg1: TArg1, _arg2: TArg2): T;
    }, arg1: TArgEx1, arg2: TArgEx2): T;
    static create<T extends CoreClass, TArg1, TArg2, TArg3, TArgEx1 extends TArg1, TArgEx2 extends TArg2, TArgEx3 extends TArg3>(this: {
        new (_arg1: TArg1, _arg2: TArg2, _arg3: TArg3): T;
    }, arg1: TArgEx1, arg2: TArgEx2, arg3: TArgEx3): T;
}
export interface ClassFactory {
    (body: any): any;
    (parent: any, body: any): any;
    (parent: any, mixin: any, body: any): any;
    (parent: any, mixin1: any, mixin2: any, body: any): any;
    (parent: any, ...mixins: any[]): any;
    create(rootNamespace: any, fullClassName: string, ...ctorArgs: any[]): any;
    rootNamespace: Object;
}
/**
 * @type Function
 */
export declare const Class: ClassFactory;
export interface IDisposable {
    dispose(): void;
}
export interface IEventful {
    bind(eventName: string, callback: Function, context?: any): this;
    unbind(eventName?: string, callback?: Function, context?: any): this;
    subscribe(eventName: string, callback: Function, context?: any): IDisposable;
    trigger(eventName: string, ...args: any[]): this;
}
export interface ILoadable<T> {
    isLoaded: boolean;
    load(options?: any): Promise<T>;
}
export interface LoadArgs<T> {
    loaded: T;
}
export interface ICollection<T> {
    all(): T[];
    count(): number;
    get(i: number): T;
    indexOf(item: T): number;
    add(item: T | T[]): void;
    remove(item: T | T[]): void;
    clear(): void;
    reset(items: T | T[]): void;
    move(indexFrom: number, indexTo: number): void;
    forEach(iterator: (item: T, index: number, array: T[]) => void, context?: any): void;
    find(predicate: (item: T, index: number) => boolean, context?: any): T;
    toggle?(item: T): void;
}
export interface IObservableCollection<T> extends ICollection<T>, IEventful {
}
export interface Constructor<T> {
    new (...args: any[]): T;
}
export interface Factory<T> {
    (...args: any[]): T;
}
export interface Map<T> {
    [key: string]: T;
}
export interface ObservableGetter<T> {
    (): T;
}
export interface ObservableSetter<T> {
    (v: T): void;
}
export interface ObservableProperty<T> extends ObservableSetter<T>, ObservableGetter<T> {
}
export interface ObservablePropertyArgs {
    prop?: string;
    value?: any;
}
export interface ObservableGetArgs extends ObservablePropertyArgs {
}
export interface ObservableSetArgs extends ObservablePropertyArgs {
    oldValue?: any;
}
export interface ObservableChangeArgs extends ObservableSetArgs {
    reason?: ObservableNotifyReason;
}
export declare type ObservableNotifyReason = "change" | "load" | "set" | "autoLoad" | "loadError";
export interface ObservableCollectionChangeArgs<T> extends ObservableChangeArgs {
    added?: T[];
    removed?: T[];
    addedIndices?: number[];
}
export interface ObservableCollectionItemChangeArgs<T> {
    changed?: T[];
}
export declare class CountdownEvent extends CoreClass {
    private left;
    private onComplete;
    /**
     * @constructs CountdownEvent
     * @param left
     * @param onComplete
     */
    constructor(left: number, onComplete: () => void);
    signal(): void;
    dispose(): void;
}
export declare class Observable extends CoreClass implements IEventful, IDisposable {
    private _callbacks;
    /**
     * Объект, от которого наследуют компоненты для поддержки событий
     * @constructs Observable
     */
    constructor();
    /**
     * Подписывает обработчик callback на событие eventName. Если задан параметр context, то обработчик
     * будет вызван в контексте этого объекта (т.е. context будет выступать в качестве this). Если context
     * не задан, то обрабочик будет вызываться в контексте текущего observable-объекта.
     * @param {string} eventName
     * @param {Function} callback
     * @param {object} [context]
     * @return {*}
     */
    bind(eventName: string, callback: Function, context?: any): this;
    /**
     * Отписывает обработчик callback от события eventName. Обработчик отписывается, только если он был подписан
     * с тем же значением параметра context.
     * Если задано только eventName, то от события eventName отписываются все подписанные обработчики.
     * Если не заданы eventName, callback и context, то все подписанные обработчики отписываются от всех событий.
     * Если заданы eventName и context, то от события eventName отписываются все обработчики контекста.
     * Если задан только context, то отписываются все обработчики контекста от всех событий.
     * @param {string} [eventName]
     * @param {Function} [callback]
     * @param {object} [context]
     * @return {*}
     */
    unbind(eventName?: string, callback?: Function, context?: any): this;
    /**
     * Подписывает обработчик callback на событие eventName и возвращает disposable объект, который
     * отписывает этот обработчик в методе dispose.
     * Метод аналогичен методу bind, но возвращает disposable объект, который выполняет unbind.
     * @param {string} eventName
     * @param {Function} callback
     * @param {object} [context]
     * @return {object} Disposable объект, в методе dispose которого выполняется отписка
     * обработчика (unbind).
     */
    subscribe(eventName: string, callback: Function, context?: any): IDisposable;
    trigger(eventName: string, ...args: any[]): this;
    /**
     * Проверяет, что на событие eventName подписан хотя бы один обработчик.
     * Если имя события не задано, то проверяет, что хотя бы один обработчик подписан на любое событие.
     * @param {string} eventName
     * @return {boolean}
     */
    bound(eventName?: string): boolean;
    get(name: string): any;
    /**
     * Getter for implementing ObservableProperty manually.
     * Should be called `this._get(this, "name_of_prop");`
     * @param {Observable} that Current object
     * @param {string} name Name of property
     * @param {string} [field] Optional field name (if not specifed than "_$name" will be used
     * @returns {*}
     * @protected
     */
    protected static _get(that: Observable, name: string, field?: string): any;
    set(name: string, v: any): void;
    /**
     * Setter for implementing ObservableProperty manually.
     * Should be called `this._set(this, "name_of_prop", v);`
     * @param {Observable} that Current object
     * @param {string} name Name of property
     * @param v Prop value to be set
     * @param {string} [field] Optional field name (if not specifed than "_$name" will be used
     * @protected
     */
    protected static _set(that: Observable, name: string, v: any, field?: string): ObservableChangeArgs;
    /**
     * Trigger 'change' and 'change:prop' events to notify that the property was previously changed
     * @param {string} name the name of the changed property
     */
    changed(name: string): void;
    dispose(): void;
    declareProp(name: string, initial: any): void;
    static isObservable(obj: any): obj is Observable;
    /**
     * Get a value of `name` property whatever it is field, function-property or ObserableProperty.
     * If `name` is field/ObserableProperty when fires "get" Observable's event.
     * @param {*} obj Any object with `name` field
     * @param {string} name Name of property to get
     * @returns {*}
     */
    static get(obj: any, name: string): any;
    /**
     *
     * @param {string} name Name of the property
     * @param {string} [field] Name of the field created for property (by default _name)
     * @returns {ObservableProperty}
     */
    static accessor(name: string, field?: string): ObservableProperty<any>;
    static accessor<T>(name: string, field?: string): ObservableProperty<T>;
    static getter(name: string, field?: string): ObservableGetter<any>;
    static getter<T>(name: string, field?: string): ObservableGetter<T>;
    static setter(name: string, field?: string): ObservableSetter<any>;
    static setter<T>(name: string, field?: string): ObservableSetter<T>;
    /**
     * Create a new instance of {Observable} and
     * add observable properties for every field in supplied json-object into the new object.
     * @param {object} json key-value map for declaring and initializing the new object
     * @returns {Observable}
     */
    static construct(json: any): Observable;
}
export declare namespace Observable {
}
export declare class ObservableCollection<T> extends Observable implements IObservableCollection<T> {
    private _items;
    /**
     * @constructs ObservableCollection
     * @extends Observable
     * @param {Array} items
     */
    constructor(items?: T[]);
    dispose(): void;
    all(): T[];
    get(i: number | string): T;
    count(): number;
    isEmpty(): boolean;
    indexOf(item: T): number;
    add(item: T | T[]): void;
    remove(item: T | T[]): void;
    move(indexFrom: number, indexTo: number): void;
    clear(): void;
    /**
     * Replace current items with new one(s).
     * @param item New item or array of items
     */
    reset(item: T | T[]): void;
    forEach(iterator: (item: T, index: number, array: T[]) => void, context?: any): void;
    /**
     * Returns the first element that satisfies the provided testing function.
     * Analogue of `Array.prototype.find`.
     * @param predicate
     * @param context
     * @returns {any}
     */
    find(predicate: (item: T, index: number) => boolean, context?: any): T;
    some(iterator: (item: T, index: number) => boolean, context?: any): boolean;
    filter(iterator: (item: T, index: number, array?: T[]) => boolean, context?: any): T[];
    toggle(item: T): void;
    insert(item: T | T[], targetIdx: number): void;
    private _triggerGet(args);
    private _triggerChange(args);
    private _onItemChange(item);
    private _initItem(item);
    private _cleanupItem(item);
    static isObservableCollection(obj: any): obj is IObservableCollection<any>;
}
export declare class ObservableDictionary extends Observable {
    private _keys;
    /**
     * @constructs ObservableDictionary
     * @extends Observable
     * @param map
     */
    constructor(map?: Map<any>);
    add(key: string, value: any, ignoreRaise?: boolean): ObservableDictionary;
    remove(key: string): ObservableDictionary;
    addRange(map: Map<any>, ignoreRaise?: boolean): ObservableDictionary;
    clear(): ObservableDictionary;
    reset(map: Map<any>): ObservableDictionary;
    keys(): string[];
    values(): any[];
    all(): Map<any>;
    count(): number;
    contains(key: string): boolean;
    private _triggerChange(args);
    private _triggerItemChange(args);
    private _onItemChange(s, item);
    private _removeAll();
    private _removeProp(name);
}
export declare namespace collections {
    function createComparer<T>(orderBy: OrderBy[]): (x: any, y: any) => number;
    function parseOrderBy(orderBy: OrderByOrString | OrderByOrString[], oldOrderBy?: OrderByData[]): OrderBy[];
    interface OrderByData {
        prop?: string;
        desc?: boolean;
    }
    interface OrderBy {
        prop?: string;
        desc?: boolean;
        getter?: () => any;
        comparer?: (x: any, y: any) => number;
    }
    type OrderByOrString = OrderBy | string;
}
export declare class EventBinder extends CoreClass {
    private _owner;
    private _disposes;
    /**
     * @constructs EventBinder
     * @param owner
     */
    constructor(owner?: any);
    bind(target: IEventful, event: string, callback: Function): void;
    unbind(): void;
    dispose(): void;
}
export declare class Event extends CoreClass {
    private _owner;
    private _eventName;
    private _bound;
    private _innerEvent;
    /**
     * @constructs Event
     * @param {*} [owner] An object which will be passed in `sender` field of event's handler
     */
    constructor(owner?: any);
    /**
     * Subscribe the callback to the event
     * @param {Function} callback
     * @param {*} [context] A context (`this`) in which the callback will be called
     */
    bind(callback: Function, context?: any): void;
    /**
     * Unsubscribe the callback from the event
     * @param {Function} callback
     * @param {*} [context]
     */
    unbind(callback: Function, context?: any): void;
    /**
     * Trigger the event, i.e. execute all its callback.
     * @param {Object} [data]
     */
    trigger(data: any): void;
    protected onFirstBind?(): any;
    protected onLastUnbind?(): any;
}
export declare namespace Event {
}
/**
 * Создает объект-обертку, инкапсулирующий внутри себя исходный объект.
 * @param source Исходный объект
 * @param {object} [options]
 * @param {number} [options.proxyFields] Определяет, каким образовать проксировать исходные свойства, чтобы их изменения отразились в исходном объекте:
 *  1 - для каждого собственного свойства из исходного объекта в прокси-объекте создается одноименное свойство с get/set, которое перенаправляет обращения к свойству в поле исходного объекта;
 *  2 - все методы созданной обертки (включая все унаследованные) перенаправляются в исходные методы, вызываемые в контексте исходного объекта (this === source);
 *  3 - изменения исходных полей через прокси-объект не отражается на исходном объекте;
 *  0 - если браузер поддерживает свойства ES5, то выбирается режим 1; иначе - 2.
 * @return {*}
 * @see {@link http://wiki.rnd.croc.ru/pages/viewpage.action?pageId=37617859}
 */
export declare function proxy<T>(source: T, options?: proxy.Options): T;
export declare namespace proxy {
    const enum FieldProxying {
        default = 0,
        redirectProps = 1,
        bindMethods = 2,
        none = 3,
    }
    interface Options {
        fieldProxying?: FieldProxying;
    }
    var defaultFieldProxying: FieldProxying;
}
export declare class ViewModelExtender extends CoreClass {
    eventBinder: EventBinder;
    viewModel: any;
    /**
     * @constructs ViewModelExtender
     * @param originalViewModel
     * @param options
     */
    constructor(originalViewModel: any, options?: proxy.Options);
    declareProp(name: string, initial: any, onChange: Function): void;
    dispose(): void;
}
export declare namespace decorators {
    /**
     * Property decorator. Initializes the property with a constant in the class prototype.
     * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
     * @param {*} value Tthe value of the property.
     */
    function constant(value: any): PropertyDecorator;
    /**
     * Property decorator. Initializes the property with an 'Observable.accessor'.
     * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
     * @param {Object} [spec]
     */
    function observableAccessor<T>(spec?: {
        field?: string;
        init?: T;
    }): PropertyDecorator;
    /**
     * Property decorator. Initializes the property with an 'Observable.getter'.
     * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
     * @param {string} [field]
     */
    function observableGetter(field?: string): PropertyDecorator;
    /**
     * Property decorator. Initializes the property with an 'Observable.setter'.
     * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
     * @param {string} [field]
     */
    function observableSetter(field?: string): PropertyDecorator;
    /**
     * Method decorator. Wraps the method so that it returns a rejected Promise object if an error occurs.
     * If the original function executes successfully the wrapped method will just return the result.
     * But if the original method throws as error it will return a rejected Promise.
     */
    function asyncSafe(proto: any, methodName: string, descriptor?: PropertyDescriptor): void;
}
export declare namespace support {
    interface DependentObject {
        obj: any;
        props: {
            [name: string]: boolean;
        };
        callback?: (sender, args) => void;
    }
    interface DependencyTrack {
        observed: DependentObject[];
        tracked: any[];
    }
    interface ObservableExpressionDependencies extends DependencyTrack {
        isLoading: boolean;
        loadingError: Error;
    }
    interface IExpressionFactory {
        get: (text: string) => Function;
    }
    class DependencyTracker {
        private _observed;
        private _tracked;
        observe(obj: any, prop: string): void;
        track(obj: any): void;
        stop(): DependencyTrack;
        private _onGetSet(sender, args);
    }
    const ExpressionFactory: IExpressionFactory;
    function isNotLoaded(obj: any): boolean;
    /**
     * Special object that represent a value which is currently loading
     */
    let loadingValue: {
        toString: () => string;
    };
    interface IObservableExpression {
        evaluate(thisObj: any, argsArray?: any[] | IArguments): any;
        suppress(): void;
        resume(): void;
        dispose(): void;
    }
    class ObservableExpressionBase implements IObservableExpression {
        protected _expr: Function;
        protected _options: ObservableExpressionBase.Options;
        protected _dependencies: ObservableExpressionDependencies;
        protected _suppress: boolean;
        /**
         * @constructs ObservableExpressionBase
         * Basic observable expression.
         * @param {string|Function} expr
         * @param {object} [options]
         * @param {Function} [options.onchange] callback to be called on any change of objects observed while `expr` function execution
         */
        constructor(expr: Function | string, options?: ObservableExpression.Options);
        dispose(): void;
        suppress(): void;
        resume(): void;
        evaluate(thisObj: any, argsArray?: any[] | IArguments): any;
        protected _notify(reason: ObservableNotifyReason): void;
        protected _callback(reason: ObservableNotifyReason): void;
        protected _observe(): void;
        protected _reset(): void;
        protected _track(source: any, args?: any[] | IArguments): DependencyTracker;
        protected _init(source: any, args?: any[] | IArguments): any;
    }
    namespace ObservableExpressionBase {
        interface Options {
            onchange?: (reason?: ObservableNotifyReason) => void;
        }
    }
    class ObservableExpression extends ObservableExpressionBase {
        protected _options: ObservableExpression.Options;
        /**
         * @constructs ObservableExpression
         * @param {string|Function} expr
         * @param {object} [options]
         * @param {Function} [options.onchange] callback, который будет вызван при изменении объектов, задействованных при вызове функции
         * @param {*} [options.loadingValue] значение, возвращаемое функцией, если есть незагруженные объекты
         * @param {*} [options.errorValue] значение, возвращаемое функцией в случае ошибки
         * @param {boolean} [options.suppressAutoLoad] отключить автоматическую загрузку незагруженных объектов
         */
        constructor(expr: Function | string, options?: ObservableExpression.Options);
        evaluate(thisObj: any, argsArray?: any[] | IArguments): any;
        protected _init(source: any, args?: any[] | IArguments): any;
        static create(expr: Function | string, options?: ObservableExpression.Options): ObservableExpressionBase;
    }
    namespace ObservableExpression {
        interface Options extends ObservableExpressionBase.Options {
            loadingValue?: any;
            errorValue?: any;
            suppressAutoLoad?: boolean;
            autoLoad?: "always" | "onerror" | "disabled" | false;
        }
    }
    class AsyncIterator<T> {
        items: T[];
        iterator: (item: T, index: number) => Promise<any> | any;
        context: any;
        private _idx;
        private _defer;
        /**
         * @constructs AsyncIterator
         * @param {Array} items
         * @param {Function} iterator
         * @param {*} [context]
         */
        constructor(items: T[], iterator: (item: T, index: number) => Promise<any> | any, context?: any);
        execute(): Promise<any>;
        private _moveNext();
    }
}
import ObservableExpression = support.ObservableExpression;
export interface IDisposableFunction extends IDisposable {
    (...args: any[]): any;
}
export declare function observableExpression(expr: IDisposableFunction | Function | string, options?: ObservableExpression.Options): IDisposableFunction;
/**
 * Tries to evaluates the expression and loads all unloaded objects, which are used in the expression.
 * @param {string|Function} expr
 * @param {*} ctx this object for evaluating the expression
 * @param {...*} exprArgs arguments for evaluating the expression
 * @returns {Deferred} Deferred with result of evaluating the expression when all used objects are loaded.
 */
export declare function loadExpression(expr: Function | string, ctx: any, ...exprArgs: any[]): Promise<any>;
/**
 * Contains some methods for working with Deferred
 */
export declare namespace async {
    function attempt<T>(func: () => Promise<T>, context?: any): Promise<T>;
    function attempt<T>(func: () => T, context?: any): Promise<T>;
    /**
     * Calls iterator for every item in array.
     * Iterator may returns Deferred. In this case next item will be processed when Deferred will be resolved.
     * @param {Array} items
     * @param {Function} iterator
     * @param {*} context This object for calling iterator
     */
    function forEach<T>(items: T[], iterator: (item: T, index: number) => Promise<any> | any, context?: any): Promise<any>;
    function wrap<T>(func: (...args) => Promise<T>): (...args) => Promise<T>;
    function wrap<T>(func: (...args) => T): (...args) => Promise<T>;
    function wrap<T>(func: (...args) => void): (...args) => Promise<void>;
    /**
     * Wraps the function so that it returns a rejected Promise object if an error occurs.
     * If the original function executes successfully the wrapped function will just return the result.
     * But if the original function throws as error it will return a rejected Promise.
     * @param {Function} func
     * @returns {Function}
     */
    function safe<T>(func: (...args) => T): (...args) => Promise<T> | T;
    function then<T, U>(obj: Promise<T> | T, doneFilter: (v: T) => Promise<U>, failFilter?: (e: Error) => void): Promise<U>;
    function then<T, U>(obj: Promise<T>, doneFilter: (v: T) => U, failFilter?: (e: Error) => void): Promise<U>;
    function then<T, U>(obj: Promise<T>, doneFilter: (v: T) => void, failFilter?: (e: Error) => void): Promise<void>;
    function then<T, U>(obj: T, doneFilter: (v: T) => U | Promise<U>, failFilter?: (e: Error) => void): U | Promise<U>;
    function then<T, U>(obj: T, doneFilter: (v: T) => void | Promise<void>, failFilter?: (e: Error) => void): void | Promise<void>;
    function done<T>(obj: Promise<T>, callback: (v: T) => void): Promise<T>;
    function done<T>(obj: T, callback: (v: T) => void): T;
    function fail<T>(obj: Promise<T>, callback: (e: Error) => void): Promise<T>;
    function fail<T>(obj: T, callback: (e: Error) => void): T;
    function always<T>(obj: Promise<T> | T, callback: () => void): Promise<T>;
    function always<T>(obj: T, callback: () => void): T;
    function progress<T>(obj: Promise<T>, callback: (v: any) => void): Promise<T>;
    function progress<T>(obj: T, callback: (v: any) => void): T;
    function chain<T>(v: Promise<T>): IDeferredChain<T>;
    function chain<T>(v: T): IValueChain<T>;
    function chain(): IValueChain<void>;
    interface IDeferredChain<T> {
        value(): Promise<T>;
        then<U>(doneFilter: (v: T) => Promise<U>, failFilter?: (e: Error) => void): IDeferredChain<U>;
        then<U>(doneFilter: (v: T) => U, failFilter?: (e: Error) => void): IDeferredChain<U>;
        then<U>(doneFilter: (v: T) => void, failFilter?: (e: Error) => void): IDeferredChain<void>;
        done(callback: (v: T) => void): IDeferredChain<T>;
        fail(callback: (e: Error) => void): IDeferredChain<T>;
        always(callback: () => void): IDeferredChain<T>;
        progress(callback: (v: any) => void): IDeferredChain<T>;
    }
    interface IValueChain<T> {
        value(): T;
        then<U>(doneFilter: (v: T) => Promise<U>, failFilter?: (e: Error) => void): IDeferredChain<U>;
        then<U>(doneFilter: (v: T) => U, failFilter?: (e: Error) => void): IValueChain<U> | IDeferredChain<U>;
        then<U>(doneFilter: (v: T) => void, failFilter?: (e: Error) => void): IValueChain<void> | IDeferredChain<void>;
        done(callback: (v: T) => void): IValueChain<T>;
        fail(callback: (e: Error) => void): IValueChain<T>;
        always(callback: () => void): IValueChain<T>;
        progress(callback: (v: any) => void): IValueChain<T>;
    }
}
