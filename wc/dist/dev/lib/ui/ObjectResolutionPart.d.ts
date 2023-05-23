/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectComparePart = require("lib/ui/ObjectComparePart");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import ICommand = core.commands.ICommand;
import Options = ObjectResolutionPart.Options;
declare class ObjectResolutionPart extends ObjectComparePart {
    static defaultOptions: Options;
    static defaultMenu: Menu.Options;
    options: Options;
    commands: lang.Map<ICommand>;
    menu: Menu;
    /**
     * @observable-property {Boolean}
     */
    checkedAll: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    isLocalRemoved: lang.ObservableProperty<boolean>;
    private _checking;
    /**
     * @class ObjectResolutionPart
     * @extends ObjectComparePart
     * @param {Object} options
     * @param {} options.local
     */
    constructor(options?: Options);
    protected createMenu(): Menu;
    /**
     * @protected
     * @returns {{Resolve: (Command), ConfirmDeletion: {Command}, Cancel: (Command)}}
     */
    protected createCommands(): lang.Map<ICommand>;
    setViewModel(): void;
    protected _onCheckedAllChanged(): void;
    protected _onCheckedPropChanged(): void;
    protected doResolve(): void;
    protected doConfirmDeletion(): void;
    protected doCancel(): void;
}
declare namespace ObjectResolutionPart {
    interface Options extends ObjectComparePart.Options {
        menu?: Menu.Options;
        commands?: lang.Map<ICommand>;
    }
}
export = ObjectResolutionPart;
