/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectTree = require("lib/ui/tree/ObjectTree");
import Menu = require("lib/ui/menu/Menu");
import Tree = require("lib/ui/tree/Tree");
import lang = core.lang;
import Application = core.Application;
import MenuOptions = Menu.Options;
import ICommand = core.commands.ICommand;
import CommandArgs = core.commands.CommandArgs;
import Options = ObjectTreeSelector.Options;
declare class ObjectTreeSelector extends ObjectTree {
    static defaultOptions: Options;
    static defaultMenus: ObjectTree.KnownMenus;
    defaultMenus: ObjectTree.KnownMenus;
    static hostDefaultOptions: lang.Map<Options>;
    options: Options;
    /**
     * @constructs ObjectTreeSelector
     * @extends ObjectTree
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: Application, options?: Options);
    applyHostContext(opt?: {
        host: string;
    }): core.INavigationService.NavigateOptions;
    protected createNodeMenuDefaults(node: Tree.Node): MenuOptions;
    protected createCommands(): lang.Map<ICommand>;
    protected _isNodeSelectable(node: Tree.Node): boolean;
    protected doSelect(): void;
    protected canSelect(): boolean;
    protected doClose(): void;
    protected close(args?: CommandArgs): void;
}
declare namespace ObjectTreeSelector {
    interface Options extends ObjectTree.Options {
        entityType?: string;
        excludeIds?: string[];
    }
}
export = ObjectTreeSelector;
