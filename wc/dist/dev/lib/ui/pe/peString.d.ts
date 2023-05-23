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
import MenuButtonsPresenter = require("lib/ui/menu/MenuButtonsPresenter");
import "xcss!lib/ui/styles/peString";
import lang = core.lang;
declare class peString extends PropertyEditor {
    static defaultOptions: peString.Options;
    /**
     * Default options by context
     */
    static contextDefaultOptions: lang.Map<peString.Options>;
    static defaultMenu: lang.Map<Menu.Options>;
    /**
     * isEmpty.
     * @observable-property {boolean}
     */
    isEmpty: lang.ObservableProperty<boolean>;
    options: peString.Options;
    menu: Menu;
    commands: peString.KnownCommands;
    isMultiline: boolean;
    menuPresenter: MenuButtonsPresenter;
    /**
     * @class peString
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peString.Options);
    createMenuDefaults(): Menu.Options;
    createMenu(): Menu;
    /**
     * @protected
     * @returns {Object.<string, Command>}
     */
    createCommands(): peString.KnownCommands;
    doClear(): void;
    canClear(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _renderTextArea(domElement: JQuery | HTMLElement): JQuery;
    protected _renderInputText(domElement: JQuery | HTMLElement): JQuery;
    protected _onPropChanged(sender: any, value: any): void;
    protected _renderCustomMenu($container: JQuery): void;
    protected _renderLetterCounter($container: JQuery, $textBox: JQuery): void;
    protected _updateLetterCounter($counterEl: JQuery, val: string): void;
}
declare namespace peString {
    interface Options extends PropertyEditor.Options {
        isMultiline?: boolean;
        /**
         * Specifies the number of rows for a multiline text. Ignored if 'isMultiline' == false.
         * @type Number
         */
        rows?: number;
        changeTrigger?: "keyPressed" | "lostFocus";
        /**
         * type for html input control ("text" by default)
         */
        inputType?: string;
        hideLetterCounter?: boolean;
        hideClearButton?: boolean;
        addonIcon?: string;
        maxLen?: number;
        menu?: Menu.Options;
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
export = peString;
