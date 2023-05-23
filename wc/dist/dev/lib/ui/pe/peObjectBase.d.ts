/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import domain = require("lib/domain/.domain");
import EntityMeta = domain.metadata.EntityMeta;
declare class peObjectBase extends PropertyEditor {
    static defaultOptions: peObjectBase.Options;
    options: peObjectBase.Options;
    /**
     * @description Base class for navigation property editors.
     * @constructs peObjectBase
     * @extends PropertyEditor
     * @param options
     */
    constructor(options?: peObjectBase.Options);
}
declare namespace peObjectBase {
    interface Options extends PropertyEditor.Options {
        /**
         * entity type name of the navigation property value
         */
        ref?: EntityMeta | string;
        flavor?: "full" | "aggregation" | "reference";
        freezeUrl?: boolean;
    }
}
export = peObjectBase;
