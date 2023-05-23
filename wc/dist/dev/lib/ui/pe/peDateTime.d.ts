/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import moment = require("moment");
import "vendor/bootstrap-datetimepicker/bootstrap-datetimepicker";
import "xcss!lib/ui/styles/peDateTime";
import lang = core.lang;
import { IBindable } from "lib/binding";
import { Part } from "core.ui";
declare class peDateTime extends PropertyEditor {
    static defaultOptions: peDateTime.Options;
    static contextDefaultOptions: lang.Map<peDateTime.Options>;
    s: JQueryAjaxSettings;
    /**
     * isEmpty.
     * @observable-property {boolean}
     */
    isEmpty: lang.ObservableProperty<boolean>;
    options: peDateTime.Options;
    format: string;
    min: Date;
    max: Date;
    commands: peDateTime.KnownCommands;
    picker: BootstrapV3DatetimePicker.Datetimepicker;
    /**
     * @class peString
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peDateTime.Options);
    useNative(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /**
     * @protected
     * @returns {Object.<string, Command>}
     */
    createCommands(): peDateTime.KnownCommands;
    doClear(): void;
    canClear(): boolean;
    protected _bindToEsc(): void;
    protected _setWidth(): void;
    protected _renderNative(): IBindable;
    protected _renderWidget(): IBindable;
    protected _onPropChanged(sender: any, value: any): void;
    /**
     * Change a value according to value type of PE
     * @param {moment} v
     * @returns {moment}
     * @private
     */
    protected _castMoment(v: moment.Moment): moment.Moment;
    protected _getDefaultMoment(): moment.Moment;
    protected _getExtraFormats(): false | any[];
    unload(options?: Part.CloseOptions): void;
}
declare namespace peDateTime {
    interface Options extends PropertyEditor.Options {
        format?: string;
        useNative?: "always" | "never" | "mobileOnly";
        maxInclusive?: Date;
        minInclusive?: Date;
        maxExclusive?: Date;
        minExclusive?: Date;
        pickerOptions?: BootstrapV3DatetimePicker.DatetimepickerOptions;
        openPickerOn?: "focus" | "button" | "both";
        hideClearButton?: boolean;
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        /**
         * Text for placeholder in input.
         */
        placeholder?: string;
    }
    interface KnownCommands extends lang.Map<core.commands.Command> {
        Clear?: core.commands.Command;
    }
}
export = peDateTime;
