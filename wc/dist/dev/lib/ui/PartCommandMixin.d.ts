/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Part = require("lib/ui/Part");
import lang = core.lang;
import ICommand = core.commands.ICommand;
import INavigationService = core.INavigationService;
import IPart = core.ui.IPart;
import PartCommandOptions = PartCommandMixin.PartCommandOptions;
import PartCommandResult = PartCommandMixin.PartCommandResult;
interface PartCommandMixin extends lang.IEventful {
    navigationService: INavigationService;
}
/**
 * @exports PartCommandMixin
 */
declare abstract class PartCommandMixin implements lang.IEventful {
    options: PartCommandMixin.Options;
    commands: lang.Map<ICommand>;
    private _commandsOptHandlers;
    protected _createCommandOptions<T extends PartCommandOptions>(basicOptions: T, args: T, cmdName: string): T;
    protected _createCommandPart(cmdOptions: PartCommandOptions, cmdName: string): IPart;
    protected _openCommandPart(part: IPart, cmdOptions: PartCommandOptions, cmdName: string): PartCommandResult;
    protected getCommandOptions<T>(args: T, cmdName?: string): T;
    /**
     * Create full command arguments, create a part for it and navigate to the part.
     * @param {Object} basicOptions Default arguments for the command.
     * @param {Object} args Runtime command arguments.
     * @param {String} cmdName Command name ("Create", "Edit", so on).
     * @returns {*}
     */
    executePartCommand(basicOptions: PartCommandOptions, args: PartCommandOptions, cmdName: string): PartCommandResult;
    static mixOptions<T extends PartCommandMixin.Options>(options: T, defaultOptions: T): T;
    /**
     * Called before opening a nested part
     */
    protected onNavigating(args: PartCommandMixin.NavigatingArgs): void;
    /**
     * Called after closing a nested part
     */
    protected onNavigated(args: PartCommandMixin.NavigatedArgs): void;
    /**
     * Subscribes methods `onNavigating/onNavigated` in options on events `navigating/navigated`
     */
    protected subscribeOnNavigation(): void;
    /**
     * Mixins all required methods from PartCommandMixin to target class
     * @param targetClass
     */
    static mixinTo(targetClass: typeof Part): void;
}
declare namespace PartCommandMixin {
    import ObjectEditor = core.ui.ObjectEditor;
    import ObjectSelector = core.ui.ObjectSelector;
    type IPartFactory = (partOptions: any, commandOptions?: PartCommandOptions) => IPart;
    interface PartCommandOptions {
        /**
         * Name of command
         */
        name?: string;
        /**
         * Part name or instance to activate
         */
        part?: IPart | IPartFactory | string;
        /**
         * Part's options if `part` is string. The object will be passed into part's constructor.
         */
        partOptions?: any;
        /**
         * Optional callback to be call on returning back
         * @param result
         */
        onReturn?: (result: any) => void;
        /**
         * @deprecated Use activateOptions.freezeUrl instead
         */
        freezeUrl?: boolean;
        openInDialog?: boolean;
        /**
         * Options for Region.activatePart
         */
        activateOptions?: core.PartActivateOptions;
        /**
         * Options for the constructor of Dialog
         */
        dialogOptions?: any;
    }
    /**
     * Common options for commands which opens an ObjectEditor
     */
    interface EditorCommandOptions extends PartCommandOptions {
        partOptions?: ObjectEditor.Options;
        navigateSiblings?: boolean;
    }
    export import EditorCommandResult = ObjectEditor.Result;
    /**
     * Common options for commands which opens an ObjectSelector
     */
    interface SelectorCommandOptions extends PartCommandOptions {
        partOptions?: ObjectSelector.Options;
    }
    export import SelectorCommandResult = ObjectSelector.Result;
    /**
     * @deprecated Use EditorCommandOptions instead
     */
    type NavigationOptions = EditorCommandOptions;
    /**
     * @deprecated Use EditorCommandResult instead
     */
    type NavigationResult = EditorCommandResult;
    interface Options extends Part.Options {
        freezeUrl?: boolean;
        commandsOptions?: lang.Map<any | lang.Factory<any>>;
        commands?: core.commands.ICommandLazyMap;
        commandsDebounce?: number;
        onNavigating?(sender: IPart, args: NavigatingArgs): void;
        onNavigated?(sender: IPart, args: NavigatedArgs): void;
    }
    interface NavigatingArgs {
        part: IPart;
        commandOptions: PartCommandOptions;
        commandName: string;
    }
    interface NavigatedArgs {
        result: any;
        commandOptions: PartCommandOptions;
        commandName: string;
    }
    interface PartCommandResult {
        part: IPart;
        opened: core.lang.Promise<IPart>;
        closed: core.lang.Promise<any>;
    }
}
export = PartCommandMixin;
