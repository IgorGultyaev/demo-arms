/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
declare class Filter extends lang.Observable {
    protected _restrictions: lang.ObservableDictionary;
    protected _disposes: lang.Map<lang.IDisposable>;
    /**
     * @class Filter
     * @extends Observable
     * @param items
     */
    constructor(items: any);
    protected _onRestrictionsChange(sender: any, args: any): void;
    set(map: any): void;
    add(name: any, expr: any): void;
    addRange(items: any): void;
    remove(name: string): void;
    clear(): void;
    protected _clearDisposes(): void;
    dispose(): void;
    toJson(): lang.Map<any>;
}
export = Filter;
