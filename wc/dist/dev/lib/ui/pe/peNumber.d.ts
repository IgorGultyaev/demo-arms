/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import InputSpinner = require("lib/ui/pe/InputSpinner");
import Big = require("big");
import "xcss!lib/ui/styles/peNumber";
import "vendor/jquery.numeric";
import lang = core.lang;
declare class peNumber extends PropertyEditor {
    static defaultOptions: peNumber.Options;
    private _spinner;
    options: peNumber.Options;
    isInteger: boolean;
    commands: lang.Map<core.commands.ICommand>;
    /**
     * @constructs peNumber
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peNumber.Options);
    protected _initValidationRules(): void;
    useNative(): boolean;
    /**
     * @observable-property {Boolean}
     */
    isEmpty: lang.ObservableProperty<boolean>;
    /**
     * @protected
     * @returns {Object.<string, Command>}
     */
    createCommands(): lang.Map<core.commands.ICommand>;
    canClear(): boolean;
    doClear(): void;
    format(v: any): string;
    parse(text: string): number;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _onInputBlur(): void;
    protected _renderSpinButtons($container: JQuery, spinnerOptions: peNumber.SpinnerOptions): void;
    protected _onPropChanged(sender: any, value: any): void;
}
declare namespace peNumber {
    interface SpinnerOptions {
        /**
         * Style of spinner buttins (increment/decrement):
         *    hidden - no buttons, vertical - vertical arrows up and down, horizontal - plus/minus buttons besides
         */
        buttons?: "hidden" | "vertical" | "horizontal";
        icons?: "arrows" | "plusminus";
        options?: InputSpinner.Options;
        InputSpinner?: InputSpinnerConstructor;
    }
    interface InputSpinnerConstructor {
        new (options: InputSpinner.Options): InputSpinner;
    }
    interface Options extends PropertyEditor.Options {
        hideClearButton?: boolean;
        changeTrigger?: "keyPressed" | "lostFocus";
        decimalSeparator?: string;
        minValue?: number | string | Big;
        maxValue?: number | string | Big;
        range?: number[] | string[] | Big[];
        step?: number;
        useNative?: "mobileOnly" | "always" | "never";
        /**
         * Style of spinner buttons: false - disable competely, "hidden" - support mouse/keyboard but hide buttons, "vertical"
         */
        spinner?: boolean | "hidden" | SpinnerOptions;
        autoCorrect?: boolean;
        /**
         * @type {peNumberParserCallback}
         */
        parser?: (v: any) => number;
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        /**
         * disable adding maxlength for integers with number of digits in maxValue
         */
        noMaxLength?: boolean;
        /**
         * Value for INPUT's maxlength attribute.
         */
        maxLength?: number;
        /**
         * Text for placeholder in input.
         */
        placeholder?: string;
    }
}
export = peNumber;
