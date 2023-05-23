/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
declare class NotAuthorizedNavigationPropSet extends lang.Observable {
    isLoaded: boolean;
    isNotAuthorized: boolean;
    isGhost: boolean;
    static singleton: NotAuthorizedNavigationPropSet;
    /**
     * @constructs NotAuthorizedNavigationPropSet
     * @extends Observable
     */
    constructor();
    load(): lang.Promise<any>;
    loadItems(): lang.Promise<any>;
    ids(): string[];
    count(): number;
    all(): any[];
    get(): void;
    first(): void;
    indexOf(): number;
    contains(): boolean;
    add(): void;
    remove(): void;
    move(): void;
    toString(): string;
}
export = NotAuthorizedNavigationPropSet;
