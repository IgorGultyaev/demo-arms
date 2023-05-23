/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import "xcss!lib/ui/styles/peBoolean";
import lang = core.lang;
declare class peBoolean extends PropertyEditor {
    static defaultOptions: peBoolean.Options;
    /**
     * Default options by context
     */
    static contextDefaultOptions: lang.Map<PropertyEditor.Options>;
    options: peBoolean.Options;
    /**
     * @constructs peBoolean
     * @extends PropertyEditor
     * @param {Object} options
     */
    constructor(options: peBoolean.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
}
declare namespace peBoolean {
    interface Options extends PropertyEditor.Options {
        /**
         * Checkbox with tree state (checked=>true, unchecked=>false, indeterminate=>null)
         * @type {Boolean}
         */
        threeStates?: boolean;
        /**
         * Show label (title) for checkbox. Also it enables showing help icon (if hint && !hideHelp)
         */
        showLabel?: boolean;
    }
}
export = peBoolean;
