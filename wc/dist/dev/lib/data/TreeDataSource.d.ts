/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import lang = core.lang;
import * as interop from "lib/interop/.interop";
import Tree = require("lib/ui/tree/Tree");
import Application = core.Application;
import TreeLoadResponse = interop.TreeLoadResponse;
import Identity = Tree.Identity;
import Options = TreeDataSource.Options;
declare class TreeDataSource extends lang.CoreClass {
    app: Application;
    params: any;
    name: string;
    /**
     * @constructs TreeDataSource
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: Application, options: Options);
    loadChildren(nodePath: Identity[], params?: any, options?: any): lang.Promise<TreeLoadResponse>;
    preprocessParams(json: any): any;
    /**
     * Initialize cancellation of load via DataFacade.cancel.
     * @param {String} opId Identified (guid) of operation to cancel
     * @returns {Promise}
     */
    cancel(opId: string): lang.Promise<void>;
}
declare namespace TreeDataSource {
    interface Options {
        name: string;
        params?: any;
    }
}
export = TreeDataSource;
