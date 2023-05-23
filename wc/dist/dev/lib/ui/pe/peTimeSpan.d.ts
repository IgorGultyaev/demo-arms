/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import Menu = require("lib/ui/menu/Menu");
import "vendor/jquery.numeric";
import "xcss!lib/ui/styles/peTimeSpan";
import lang = core.lang;
declare class peTimeSpan extends PropertyEditor {
    static defaultOptions: peTimeSpan.Options;
    static contextDefaultOptions: lang.Map<peTimeSpan.Options>;
    static defaultMenu: lang.Map<Menu.Options>;
    /**
     * Object stores date part letter as key and the jQ-input as value
     */
    private _inputs;
    private static _fullFormat;
    options: peTimeSpan.Options;
    format: string[];
    commands: lang.Map<core.commands.ICommand>;
    menu: Menu;
    menuPresenter: core.ui.IPart;
    /**
     * isEmpty. By default it's description of the property
     * @observable-property {boolean}
     */
    isEmpty: lang.ObservableProperty<boolean>;
    /**
     * @constructs peTimeSpan
     * @extends PropertyEditor
     * @param {Object} options
     */
    constructor(options: peTimeSpan.Options);
    createMenuDefaults(): Menu.Options;
    createMenu(): Menu;
    /**
     * @protected
     * @returns {Object.<string, Command>}
     */
    createCommands(): lang.Map<core.commands.ICommand>;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _renderValueContainer(): void;
    protected _renderCustomMenu(container: JQuery): void;
    protected _makeInputsNumeric(): void;
    protected _setInputHandlers(): void;
    protected _bindValue(): void;
    protected _onDisabledChange(v: boolean): void;
    protected _getInputValues(): peTimeSpan.InputValue[];
    protected _updateIsEmpty(): void;
    protected _setMilliseconds(milliseconds: number): void;
    protected _getMilliseconds(): number;
    protected _canClear(): boolean;
    protected _doClear(): void;
    protected _addInput($container: JQuery, id: string, label: string): JQuery;
    protected _simplifyFormat(format: string): string[];
}
declare namespace peTimeSpan {
    interface Options extends PropertyEditor.Options {
        menu?: Menu.Options;
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        /**
         * String with shorthand for duration parts, see http://momentjs.com/docs/#/manipulating/add/
         * By default: dhm (days, hours, minutes)
         */
        format?: string;
        max?: number;
        zeroIsEmpty?: boolean;
    }
    interface InputValue {
        part: string;
        val: string;
    }
}
export = peTimeSpan;
