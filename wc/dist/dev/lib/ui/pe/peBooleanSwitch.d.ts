/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import formatters = require("lib/formatters");
import "xcss!lib/ui/styles/peBooleanSwitch";
import lang = core.lang;
declare class peBooleanSwitch extends PropertyEditor {
    static defaultOptions: peBooleanSwitch.Options;
    private _animatingTo;
    options: peBooleanSwitch.Options;
    /**
     * @constructs peBooleanSwitch
     * @extends PropertyEditor
     * @param {Object} options
     */
    constructor(options: peBooleanSwitch.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    focus(): void;
    protected _addInput(parent: JQuery, name: string, value: boolean | null, title: string | formatters.SafeHtml): JQuery;
    protected _getInputId(group: string, val: boolean | null): string;
    protected _addInputHandlers(inputs: JQuery[], selection: JQuery): void;
    protected _setSelection(item: JQuery, sel: JQuery): void;
    protected _addKeyboardHandlers(): void;
    protected _switchNext(): void;
    protected _switchPrev(): void;
    protected _doSwitch(input: JQuery): void;
    protected _parseBoolean(str: string): boolean | null;
    protected _bindToHtml(groupName: string): void;
    protected _bindElementToDisabled(): void;
}
declare namespace peBooleanSwitch {
    interface Options extends PropertyEditor.Options {
        /**
         * Checkbox with tree state (checked=>true, unchecked=>false, indeterminate=>null)
         * @type {Boolean}
         */
        threeStates?: boolean;
        trueTitle?: string | formatters.SafeHtml;
        falseTitle?: string | formatters.SafeHtml;
        nullTitle?: string | formatters.SafeHtml;
    }
}
export = peBooleanSwitch;
