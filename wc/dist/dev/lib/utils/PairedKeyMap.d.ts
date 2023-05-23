/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
/**
 * Словарь с составным ключом {key1, key2}
 */
declare class PairedKeyMap<T> {
    private _values;
    constructor();
    get(key1: string, key2: string, defaultValue?: T): T;
    set(key1: string, key2: string, value: T): void;
    find(key1: string, key2: string): T;
    select(key1: string): T[];
    remove(key1: string, key2: string): boolean;
    forEach(callback: (item: T, key1: string, key2: string) => void, context?: any): void;
    some(callback: (item: T, key1: string, key2: string) => boolean, context?: any): boolean;
    all(): T[];
}
export = PairedKeyMap;
