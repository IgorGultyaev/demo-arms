/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peEnumBase = require("lib/ui/pe/peEnumBase");
import "xcss!lib/ui/styles/peEnum";
import "xcss!lib/ui/styles/peEnumCheckbox";
import { IBindable } from "lib/binding";
import lang = core.lang;
declare class peEnumCheckbox extends peEnumBase {
    static defaultOptions: peEnumCheckbox.Options;
    options: peEnumCheckbox.Options;
    private _zeroMember;
    /**
     * @constructs peEnumCheckbox
     * @extends peEnumBase
     * @param options
     */
    constructor(options?: peEnumCheckbox.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _getBindable($element: JQuery): IBindable;
}
declare namespace peEnumCheckbox {
    interface Options extends peEnumBase.Options {
        orientation?: "vertical" | "horizontal";
    }
}
export = peEnumCheckbox;
