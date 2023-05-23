/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import NotLoadedNavigationProp = require("./NotLoadedNavigationProp");
import domain = require(".domain");
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
import INavigationPropSet = domain.INavigationPropSet;
import { Promise } from "lib/core.lang";
import { LoadOptions } from "lib/interop/.interop";
declare class NotLoadedNavigationPropSet extends NotLoadedNavigationProp implements INavigationPropSet {
    /**
     * Результат обращения к незагруженному массивногму навигируемому свойству.
     * @constructs NotLoadedNavigationPropSet
     * @extends NotLoadedNavigationProp
     * @param {DomainObject} parent
     * @param propMeta
     */
    constructor(parent: DomainObject, propMeta: PropertyMeta);
    _error(): any;
    load(options?: LoadOptions): Promise<INavigationPropSet>;
    all(): DomainObject[];
    get(index: number | string): DomainObject;
    count(): number;
    indexOf(item: DomainObject): number;
    add(item: DomainObject[] | DomainObject): void;
    remove(item: DomainObject[] | DomainObject): void;
    clear(): void;
    reset(items: DomainObject[] | DomainObject): void;
    move(indexFrom: number, indexTo: number): void;
    forEach(iterator: (item: DomainObject, index: number, array: DomainObject[]) => void, context?: any): void;
    find(predicate: (item: DomainObject, index: number) => boolean, context?: any): DomainObject;
}
export = NotLoadedNavigationPropSet;
