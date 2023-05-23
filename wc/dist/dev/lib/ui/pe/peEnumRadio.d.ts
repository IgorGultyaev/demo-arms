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
import "xcss!lib/ui/styles/peEnumRadio";
import lang = core.lang;
declare class peEnumRadio extends peEnumBase {
    static defaultOptions: peEnumRadio.Options;
    options: peEnumRadio.Options;
    showNullValue: boolean;
    /**
     * @constructs peEnumRadio
     * @extends peEnumBase
     * @param options
     */
    constructor(options: peEnumRadio.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    focus(): void;
}
declare namespace peEnumRadio {
    interface Options extends peEnumBase.Options {
        useValueAsLabel?: boolean;
        orientation?: "vertical" | "horizontal";
        changeTrigger?: "keyPressed" | "lostFocus";
        nullValueText?: string;
        showNullValue?: boolean;
    }
}
export = peEnumRadio;
