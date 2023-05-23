/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import "vendor/bootstrap-colorpicker/js/bootstrap-colorpicker";
import "xcss!vendor/bootstrap-colorpicker/css/bootstrap-colorpicker";
import "xcss!lib/ui/styles/peColorPicker";
import lang = core.lang;
import { Part } from "core.ui";
declare class peColorPicker extends PropertyEditor {
    static defaultOptions: peColorPicker.Options;
    options: peColorPicker.Options;
    commands: lang.Map<core.commands.ICommand>;
    colorPicker: any;
    isNumeric: boolean;
    _isNull: boolean;
    /**
     * @constructs peColorPicker
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peColorPicker.Options);
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
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    unload(options?: Part.CloseOptions): void;
    protected _isEmptyVal(value: any): boolean;
    protected _onPropChanged(sender: any, value: any): void;
}
declare namespace peColorPicker {
    interface Options extends PropertyEditor.Options {
        /**
         * Options for bootstrap-colorpicker control (see https://farbelous.io/bootstrap-colorpicker/v2/)
         */
        colorpicker?: any;
        useAlpha?: boolean;
        hideClearButton?: boolean;
        changeTrigger?: "keyPressed" | "lostFocus";
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        /**
         * Text for placeholder in input.
         */
        placeholder?: string;
    }
}
export = peColorPicker;
