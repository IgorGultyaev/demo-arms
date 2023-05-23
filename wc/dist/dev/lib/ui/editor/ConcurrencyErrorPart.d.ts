/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import ObjectEditor = require("./ObjectEditor");
import { ViolationSeverity } from "lib/validation";
import { DomainObjectData, ObjectIdentity, SaveInteropError } from "lib/interop/.interop";
declare class ConcurrencyErrorPart extends View {
    static defaultOptions: ConcurrencyErrorPart.Options;
    /**
     * @enum {String}
     */
    static actions: {
        keepServer: string;
        keepLocal: string;
        resolve: string;
    };
    /**
     * @observable-property {Boolean}
     */
    isBusy: lang.ObservableProperty<boolean>;
    options: ConcurrencyErrorPart.Options;
    error: SaveInteropError;
    severity: ViolationSeverity;
    editor: ObjectEditor;
    private _defer;
    promise: lang.Promise<void>;
    commands: ConcurrencyErrorPart.KnownCommands;
    menu: Menu;
    /**
     * Object editor concurrency error resolver part
     * @class ConcurrencyErrorPart
     * @extends View
     */
    constructor(options: ConcurrencyErrorPart.Options);
    /**
     * @protected
     * @returns {{KeepLocal: (Command), KeepServer: (Command), Resolve: (Command)}}
     */
    protected createCommands(): ConcurrencyErrorPart.KnownCommands;
    createMenu(): Menu;
    protected _onBusyChanged(sender: any, value: boolean): void;
    protected findOriginalObject(originalObjects: DomainObjectData[], obsoleteObject: ObjectIdentity): DomainObjectData;
    /**
     * @param {ConcurrencyErrorPart#actions} action
     * @private
     */
    protected _onExecute(action: string): void;
}
declare namespace ConcurrencyErrorPart {
    interface Options extends View.Options {
        error?: SaveInteropError;
        editor?: ObjectEditor;
        severity?: ViolationSeverity;
    }
    interface KnownCommands extends lang.Map<core.commands.Command> {
        KeepLocal?: core.commands.Command;
        KeepServer?: core.commands.Command;
        Resolve?: core.commands.Command;
    }
}
export = ConcurrencyErrorPart;
