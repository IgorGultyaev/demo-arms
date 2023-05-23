/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peEnumBase = require("lib/ui/pe/peEnumBase");
import formatters = require("lib/formatters");
import "xcss!lib/ui/styles/peBooleanSwitch";
import lang = core.lang;
declare class peEnumSwitch extends peEnumBase {
    static defaultOptions: peEnumSwitch.Options;
    private _animatingTo;
    options: peEnumSwitch.Options;
    /**
     * @constructs peEnumSwitch
     * @extends PropertyEditor
     * @param {Object} options
     */
    constructor(options: peEnumSwitch.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    focus(): void;
    protected _addInput(parent: JQuery, name: string, value: any, title: string | formatters.SafeHtml): JQuery;
    protected _getInputId(group: string, val: any): string;
    protected _addInputHandlers(inputs: JQuery[], selection: JQuery): void;
    protected _setSelection(item: JQuery, sel: JQuery): void;
    protected _addKeyboardHandlers(): void;
    protected _switchNext(): void;
    protected _switchPrev(): void;
    protected _doSwitch(input: JQuery): void;
    protected _bindToHtml(groupName: string): void;
    protected _bindElementToDisabled(): void;
}
declare namespace peEnumSwitch {
    interface Options extends peEnumBase.Options {
        useValueAsLabel?: boolean;
        nullValueText?: string | formatters.SafeHtml;
    }
}
export = peEnumSwitch;
