/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import NavigationPropertyEditor = require("lib/ui/pe/NavigationPropertyEditor");
import Menu = require("lib/ui/menu/Menu");
import "xcss!lib/ui/styles/peObject";
import ui = require("lib/ui/.ui");
import domain = require("lib/domain/.domain");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import IPart = ui.IPart;
import DomainObject = domain.DomainObject;
import lang = core.lang;
import Promise = lang.Promise;
import EditorCommandOptions = PartCommandMixin.EditorCommandOptions;
import EditorCommandResult = PartCommandMixin.EditorCommandResult;
import SelectorCommandOptions = PartCommandMixin.SelectorCommandOptions;
import SelectorCommandResult = PartCommandMixin.SelectorCommandResult;
import { IBindable } from "lib/binding";
import { Part } from "core.ui";
declare class peObject extends NavigationPropertyEditor {
    static defaultOptions: peObject.Options;
    static defaultMenu: Menu.Options;
    options: peObject.Options;
    menu: Menu;
    commands: lang.Map<core.commands.ICommand>;
    private menuPresenter;
    private _button;
    private _tabIndex;
    /**
     * @constructs peObject
     * @extends NavigationPropertyEditor
     * @param options
     */
    constructor(options?: peObject.Options);
    protected createMenuDefaults(): Menu.Options;
    protected createMenu(): Menu;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _createMenuPresenter(): IPart;
    protected _onDisabledChange(disabled: boolean): void;
    protected _bindToEsc(): void;
    protected createBindableProp(): IBindable;
    currentValue(): DomainObject;
    unload(options?: Part.CloseOptions): void;
    protected _addObject(obj: DomainObject): void;
    protected _valueIds(): string[];
    protected doUnlink(): lang.Promisable<void>;
    protected doDelete(): void | lang.Promisable<void>;
    protected doSelect(args: SelectorCommandOptions): Promise<SelectorCommandResult>;
    protected doCreate(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected checkForOrphan(): lang.Promisable<peObject.OrphanCheckResult>;
}
interface peObject {
    value(v: DomainObject): void;
    value(): DomainObject;
}
declare namespace peObject {
    interface Options extends NavigationPropertyEditor.Options {
        menu?: Menu.Options;
        /**
         * @type {"auto"|"buttons"|"dropdown"}
         */
        menuPresentation?: "auto" | "buttons" | "dropdown";
        menuItemPresentation?: Menu.ItemPresentation;
        /**
         * Html or callback returning html for empty value presentation
         */
        emptyValue?: string | (() => string);
    }
    interface OrphanCheckResult {
        orphan: boolean;
        value: DomainObject;
    }
}
export = peObject;
