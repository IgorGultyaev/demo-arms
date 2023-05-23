/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import binding = require("lib/binding");
import "xcss!lib/ui/styles/peReadOnly";
import lang = core.lang;
declare class peReadOnly extends PropertyEditor {
    static defaultOptions: peReadOnly.Options;
    options: peReadOnly.Options;
    /**
     * @class peReadOnly
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peReadOnly.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _generatePresentation(options: any): {
        element: any;
        bindable: any;
    };
    protected createBindableProp(): binding.IBindable;
}
declare namespace peReadOnly {
    interface Options extends PropertyEditor.Options {
        rows?: number;
        /**
         * Text for placeholder in input.
         */
        placeholder?: string;
    }
}
export = peReadOnly;
