/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Tree = require("lib/ui/tree/Tree");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import Menu = require("lib/ui/menu/Menu");
import PartWithFilterMixin = require("lib/ui/PartWithFilterMixin");
import UnitOfWork = require("lib/domain/UnitOfWork");
import lang = core.lang;
import domain = require("lib/domain/.domain");
import TreeDataSource = require("lib/data/TreeDataSource");
import Promise = lang.Promise;
import IPart = core.ui.IPart;
import IFilterPart = core.ui.IFilterPart;
import ICommand = core.commands.ICommand;
import DomainObject = domain.DomainObject;
import EditorCommandOptions = PartCommandMixin.EditorCommandOptions;
import EditorCommandResult = PartCommandMixin.EditorCommandResult;
import CreateOptions = ObjectTree.CreateOptions;
import EditOptions = ObjectTree.EditOptions;
import Identity = Tree.Identity;
import TreeNode = Tree.Node;
import ITreeLoader = Tree.ITreeLoader;
import IObjectTreePresenter = ObjectTree.IObjectTreePresenter;
import Options = ObjectTree.Options;
import KnownMenus = ObjectTree.KnownMenus;
import { DomainObjectData, SaveOptions } from "../../interop/.interop";
declare class ObjectTree extends Tree {
    static defaultOptions: Options;
    static defaultMenus: KnownMenus;
    defaultMenus: KnownMenus;
    defaultLoader: ITreeLoader;
    options: Options;
    presenter: IObjectTreePresenter;
    title: string;
    uow: UnitOfWork;
    filter: IFilterPart;
    protected _fieldWithFilterMenu: string;
    /**
     * Saving is in progress.
     * @observable-property {Boolean}
     */
    saving: lang.ObservableProperty<boolean>;
    /**
     * @constructs ObjectTree
     * @extends Tree
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: core.Application, options?: Options);
    protected _initializeProps(): void;
    getNodeLoadParams(node: TreeNode): any;
    protected showFilterError(error: string): void;
    protected defaultIdentifier(tree: Tree, node: TreeNode): Identity;
    protected _isNodeSelectable(node: TreeNode): boolean;
    /**
     * @protected
     * @returns {{Edit: BoundCommand, Create: BoundCommand, Delete: BoundCommand, Reload: BoundCommand, ReloadRoot: BoundCommand, Save: ?BoundCommand, Cancel: ?BoundCommand, DeleteSelection: BoundCommand, SelectChildren: BoundCommand, SelectSiblings: BoundCommand,SelectNone: BoundCommand }}
     */
    protected createCommands(): lang.Map<ICommand>;
    protected createTreeMenuDefaults(): Menu.Options;
    protected createTreeMenu(): Menu;
    protected createNodeMenuDefaults(node: TreeNode): Menu.Options;
    protected createSelectionMenuDefaults(): Menu.Options;
    isDomainNode(node: TreeNode): boolean;
    isOperableNode(node: TreeNode): boolean;
    protected doCreate(args: CreateOptions): Promise<EditorCommandResult>;
    protected canCreate(): boolean;
    protected onBeforeCreate(createOptions: CreateOptions): void;
    protected onAfterCreate(result: EditorCommandResult, createOptions: CreateOptions): void;
    protected doEdit(args: EditOptions): Promise<EditorCommandResult>;
    protected canEdit(): boolean;
    protected onBeforeEdit(editOptions: EditOptions): void;
    protected onAfterEdit(result: EditorCommandResult, editOptions: EditOptions): void;
    protected _getNodeType(node: TreeNode): string;
    protected _createEditBasicOptions(node: TreeNode): EditorCommandOptions;
    protected doDelete(): void;
    protected canDelete(): boolean;
    protected doDeleteSelection(): void;
    protected canDeleteSelection(): boolean;
    protected _deleteObjects(objects: DomainObject[]): void;
    doSave(): Promise<any>;
    protected canSave(): boolean;
    protected _saveChanges(): Promise<any>;
    protected _onSaveError(args: UnitOfWork.SaveErrorArgs): void;
    protected onSaving(args: ObjectTree.SavingEventArgs): void;
    protected onSaved(args: ObjectTree.SavedEventArgs): void;
    protected onSaveError(args: {
        objects: DomainObjectData[];
        error: Error;
    }): void;
    protected doCancel(): void;
    protected canCancel(): boolean;
    protected onObjectDetached(sender: UnitOfWork, obj: DomainObject): void;
    activate(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
interface ObjectTree extends PartCommandMixin, PartWithFilterMixin {
}
declare namespace ObjectTree {
    interface Options extends Tree.Options, PartCommandMixin.Options, PartWithFilterMixin.Options {
        dataSource?: TreeDataSource;
        uow?: UnitOfWork;
        editable?: boolean;
        commands?: core.commands.ICommandLazyMap;
        title?: string;
        transactionName?: string;
        getSaveOptions?: (saveOptions: UnitOfWork.SaveOptions, tree: ObjectTree) => UnitOfWork.SaveOptions;
    }
    interface KnownMenus extends lang.Map<Menu.Options> {
        Tree?: Menu.Options;
        EditableTree?: Menu.Options;
        TreeNode?: Menu.Options;
        TreeSelection?: Menu.Options;
    }
    interface CreateOptions extends EditorCommandOptions {
        type: string;
        parentNode?: TreeNode;
        isLeaf?: boolean;
    }
    interface EditOptions extends EditorCommandOptions {
        parentNode?: TreeNode;
    }
    interface IObjectTreePresenter extends IPart {
        focus?(): void;
        scrollToSelf?(): void;
    }
    const Events: {
        SAVING: string;
        SAVED: string;
        SAVE_ERROR: string;
    };
    interface SavingEventArgs {
        cancel?: boolean;
        interop?: SaveOptions;
    }
    interface SavedEventArgs {
    }
}
export = ObjectTree;
