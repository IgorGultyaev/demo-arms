/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import lang = core.lang;
import { LoadOptions, LoadPolicy, LoadPolicyRule, LoadQuery } from "lib/interop/.interop";
import { LoadRule } from "lib/interop/.interop.types";
declare class CacheManager extends lang.Observable {
    rule: LoadRule;
    cacheAge: number;
    /**
     * @constructs CacheManager
     * @extends Observable
     * @param {Object} [options]
     */
    constructor(options?: CacheManager.Options);
    options: CacheManager.Options;
    /**
     * Return load policy for DataFacadeSmart.
     * @param query
     * @param options
     * @returns {{rule: (String|Number), maxAge: Number, loadFirst: String, allowLocal: Boolean, allowRemote: Boolean, shouldCache: Boolean}}
     */
    getLoadPolicy(query: LoadQuery, options?: LoadOptions): LoadPolicy | string | LoadPolicyRule;
}
declare namespace CacheManager {
    interface Options {
        defaultRule?: LoadRule;
        cacheAge?: number;
    }
}
export = CacheManager;
