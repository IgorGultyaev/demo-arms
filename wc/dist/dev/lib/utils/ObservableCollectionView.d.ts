/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import OrderBy = lang.collections.OrderBy;
import OrderByOrString = lang.collections.OrderByOrString;
import OrderByData = lang.collections.OrderByData;
import WhereCallback = ObservableCollectionView.WhereCallback;
declare class ObservableCollectionView<T> extends lang.Observable implements lang.IObservableCollection<T> {
    private _source;
    private _sourceOwned;
    private _comparer;
    private _orderBy;
    private _where;
    private _items;
    /**
     * Wrapping collection that supports filtering and ordering of the source collection.
     * @constructs ObservableCollectionView
     * @extends Observable
     * @param {Array|ObservableCollection} source
     */
    constructor(source?: T[] | lang.IObservableCollection<T>);
    dispose(): void;
    source(): lang.IObservableCollection<T>;
    source(value: T[] | lang.IObservableCollection<T>): void;
    orderBy(): OrderBy[];
    orderBy(orderBy: OrderByOrString | OrderByOrString[]): void;
    parseOrderBy(orderBy: OrderByOrString | OrderByOrString[]): OrderBy[];
    /**
     * @deprecated use `lang.collections.parseOrderBy` instead
     * @param orderBy
     * @param oldOrderBy
     * @return {any}
     */
    static parseOrderBy(orderBy: OrderByOrString | OrderByOrString[], oldOrderBy?: OrderByData[]): OrderBy[];
    where(): WhereCallback<T>;
    where(filter: WhereCallback<T>): void;
    all(): T[];
    get(i: number | string): T;
    count(): number;
    indexOf(item: T): number;
    add(item: T | T[]): void;
    remove(item: T | T[]): void;
    move(indexFrom: number, indexTo: number): void;
    clear(): void;
    reset(items: T | T[]): void;
    toggle(item: T): void;
    forEach(iterator: (item: T, index: number, array: T[]) => void, context?: any): void;
    find(predicate: (item: T, index: number) => boolean, context?: any): T;
    private _throwIfNoSource();
    /**
     * Returns filtered and sorted array of items
     */
    private _resultItems();
    private _setSource(source);
    private _clearSource();
    /**
     * Проверяет, что элемент находится на своем месте в упорядоченном массиве
     * @param item
     * @return {Boolean}
     */
    private _isItemOrderCorrect(item);
    /**
     * Проверяет, что элемент не изменил своего членства в коллекции
     * @param item
     * @returns {boolean}
     */
    private _isItemMembershipCorrect(item);
    private _onSourceChange(sender, args);
    private _onSourceItemChange(sender, args);
}
declare namespace ObservableCollectionView {
    interface WhereCallback<T> {
        (item: T, index?: number): any;
    }
}
export = ObservableCollectionView;
