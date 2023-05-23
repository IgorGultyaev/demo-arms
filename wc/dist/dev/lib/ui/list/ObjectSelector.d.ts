/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectList = require("lib/ui/list/ObjectList");
import Menu = require("lib/ui/menu/Menu");
import domain = require("lib/domain/.domain");
import lang = core.lang;
import Application = core.Application;
import ICommand = core.commands.ICommand;
import CommandArgs = core.commands.CommandArgs;
import Options = ObjectSelector.Options;
import KnownMenus = ObjectSelector.KnownMenus;
import DomainObject = domain.DomainObject;
declare class ObjectSelector extends ObjectList {
    static defaultOptions: Options;
    static defaultMenus: KnownMenus;
    defaultMenus: KnownMenus;
    static hostDefaultOptions: lang.Map<Options>;
    options: Options;
    /**
     * @constructs ObjectSelector
     * @extends ObjectList
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: Application, options?: Options);
    applyHostContext(opt?: {
        host: string;
    }): core.INavigationService.NavigateOptions;
    /**
     * Checks if the node can be selected by default (w/o option selectionFilter)
     * @param item
     * @override
     * @returns {boolean}
     */
    protected _isItemSelectable(item: DomainObject): boolean;
    protected createListMenuDefaults(): Menu.Options;
    protected createRowMenuDefaults(): Menu.Options;
    /**
     * @protected
     * @override
     * @returns {{Reload: BoundCommand, Select: BoundCommand, Close: BoundCommand}}
     */
    protected createCommands(): lang.Map<ICommand>;
    protected canSelect(): boolean;
    protected select(): void;
    close(args?: CommandArgs): void;
}
declare namespace ObjectSelector {
    interface Options extends ObjectList.Options {
        contextName?: string;
        excludeIds?: string[];
        limits?: SelectionLimits;
    }
    interface SelectionLimits {
        min?: number;
        max?: number;
    }
    interface KnownMenus extends ObjectList.KnownMenus {
        Selector?: Menu.Options;
        SelectorRow?: Menu.Options;
    }
    interface Result {
        selection: DomainObject[];
    }
}
export = ObjectSelector;
