/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectEditor = require("lib/ui/editor/ObjectEditor");
import EditorPage = require("lib/ui/editor/EditorPage");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import Promise = lang.Promise;
import ICommand = core.commands.ICommand;
import Command = core.commands.Command;
import Options = ObjectWizard.Options;
import KnownMenus = ObjectWizard.KnownMenus;
import KnownCommands = ObjectWizard.KnownCommands;
declare class ObjectWizard extends ObjectEditor {
    static defaultOptions: Options;
    static defaultMenus: KnownMenus;
    defaultMenus: KnownMenus;
    options: Options;
    commands: KnownCommands;
    menuPage: Menu;
    /**
     * @constructs ObjectWizard
     * @extends ObjectEditor
     * @param {Object} options
     */
    constructor(options?: Options);
    /**
     * Returns flag indicating whether current wizard is linear (true) and non-linear (false).
     * @returns {boolean}
     */
    isLinear(): boolean;
    /**
     * Returns a metadata for next page in non-linear wizard.
     * @param {EditorPage} [fromPage] Can be null for the first page
     * @param {Number} [nextIndex] Index of the next page (a page to return)
     * @returns {Object} Page metadata (supplied to ObjectEditor._createPage)
     */
    getNextStep(fromPage: EditorPage, nextIndex: number): EditorPage.Options;
    /**
     * Create a default page in case when editor's options have no pages metadata.
     * @protected
     */
    protected _createDefaultPage(): EditorPage;
    protected _initializeMenu(): void;
    protected createWizardMenu(): Menu;
    protected createWizardMenuDefaults(): Menu.Options;
    protected createPageMenu(): Menu;
    protected createPageMenuDefaults(): Menu.Options;
    /**
     * @protected
     * @override
     * @returns {Object.<string, Command>}
     */
    protected createCommands(): lang.Map<ICommand>;
    /**
     * Create an url query for initialization via navigating to a url
     */
    getState(partOptions?: Options): ObjectEditor.PartState;
    protected onPageStarted(args: ObjectEditor.PageEventArgs): void;
    protected _activatePage(page: EditorPage): Promise<void>;
    /**
     * Move wizard to a next page
     * @returns {Boolean} true if wizard changed current page, otherwise - false
     */
    forward(): Promise<void>;
    back(): Promise<void>;
    protected updateWizardCommands(page?: EditorPage): void;
    protected canSaveAndClose(): boolean;
    protected canSaveAndClose(v: boolean): void;
}
declare namespace ObjectWizard {
    interface Options extends ObjectEditor.Options {
        getNextStep?: (fromPage: EditorPage, nextIndex: number) => EditorPage.Options;
        menuPage?: Menu.Options;
    }
    interface KnownMenus extends lang.Map<Menu.Options> {
        Page?: Menu.Options;
        Wizard?: Menu.Options;
    }
    interface KnownCommands extends ObjectEditor.KnownCommands {
        Backward?: Command;
        Forward?: Command;
    }
}
export = ObjectWizard;
