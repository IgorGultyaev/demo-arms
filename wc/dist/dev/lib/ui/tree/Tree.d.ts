/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import Menu = require("lib/ui/menu/Menu");
import formatters = require("lib/formatters");
import lang = core.lang;
import Deferred = lang.Deferred;
import Promise = lang.Promise;
import Application = core.Application;
import MenuOptions = Menu.Options;
import ICommand = core.commands.ICommand;
import Options = Tree.Options;
import Identity = Tree.Identity;
import TreeNodeData = Tree.TreeNodeData;
import ITreeLoader = Tree.ITreeLoader;
import { ICommandLazyMap } from "lib/core.commands";
declare class Tree extends Component {
    static defaultOptions: Options;
    Node: typeof Tree.Node;
    ROOT_NODE_NAME: string;
    options: Options;
    app: core.Application;
    commands: lang.Map<ICommand>;
    menuTree: Menu;
    menuNode: Menu;
    menuSelection: Menu;
    private _root;
    private _selection;
    protected traceSource: core.diagnostics.TraceSource;
    /**
     * @constructs Tree
     * @extends Component
     */
    constructor(app: Application, options?: Options);
    dispose(options?: core.ui.Part.CloseOptions): void;
    /**
     * Root node of the tree.
     * @observable-getter {Tree.Node}
     */
    root: lang.ObservableGetter<Tree.Node>;
    /**
     * Active node of the tree.
     * @observable-property {Tree.Node}
     */
    activeNode: lang.ObservableProperty<Tree.Node>;
    /**
     * Selected (checked) nodes.
     * @observable-getter {Array}
     */
    selection: lang.ObservableGetter<lang.IObservableCollection<Tree.Node>>;
    /**
     * Additional message reporting something useful for the user
     * @observable-property {String}
     */
    hintMessage: lang.ObservableProperty<string>;
    /**
     * @observable-property {string}
     */
    searchText: lang.ObservableProperty<string>;
    protected tweakOptions(options: Options): void;
    /**
     * Returns an array of selected nodes (if any) or an array with single activeNode (if any).
     * If there are no selected and active nodes, returns an empty array;
     * @returns {Array}
     */
    currentNodes(): Tree.Node[];
    /**
     *
     * @virtual
     * @param {Tree.Node} node
     * @returns {{type: string, id: string}}
     */
    getNodeIdentity(node: Tree.Node): Identity;
    protected defaultIdentifier(tree: Tree, node: Tree.Node): Identity;
    /**
     *
     * @virtual
     * @param {Tree.Node} node
     * @returns {string}
     */
    getNodeTitle(node: Tree.Node): string;
    protected defaultFormatter(tree: Tree, node: Tree.Node): string;
    /**
     *
     * @virtual
     * @param {Tree.Node} node
     * @returns {String}
     */
    getNodeIcon(node: Tree.Node): string;
    protected defaultIconizer(tree: Tree, node: Tree.Node): string;
    /**
     *
     * @virtual
     * @param {Tree.Node} node
     * @param {Object} column
     * @returns {String}
     */
    getNodeColumnValue(node: Tree.Node, column: Tree.TreeColumn): string | formatters.SafeHtml;
    /**
     *
     * @method
     * @virtual
     * @param {Tree.Node} node
     * @param {*} params
     * @param {*} options
     * @returns {Deferred}
     */
    getNodeChildren(node: Tree.Node, params?: any, options?: any): TreeNodeData[] | Promise<TreeNodeData[]>;
    protected defaultLoader: ITreeLoader;
    /**
     *
     * @virtual
     * @param node
     * @returns {*}
     */
    getNodeLoadParams(node: Tree.Node): any;
    getNodeParent(node: Tree.Node): Tree.Node;
    getNodePath(node: Tree.Node): Identity[];
    /**
     * Checks if the node can be selected
     * @param node
     * @returns {boolean}
     */
    isNodeSelectable(node: Tree.Node): boolean;
    /**
     * Checks if the node can be selected by default (w/o option selectionFilter)
     * @param node
     * @returns {boolean}
     */
    protected _isNodeSelectable(node: Tree.Node): boolean;
    addNode(node: Tree.Node, targetNode?: Tree.Node, suppressEvent?: boolean): void;
    protected createNodeFromJson(json: TreeNodeData): Tree.Node;
    addJson(json: TreeNodeData, targetNode?: Tree.Node): Tree.Node;
    addJsons(childrenData: TreeNodeData[], targetNode?: Tree.Node): void;
    removeNode(node: Tree.Node): void;
    removeNodeChildren(node: Tree.Node): void;
    loadNodeChildren(node: Tree.Node, options?: any): Promise<void>;
    protected _fillNodeChildren(node: Tree.Node, params: any, deferred: Deferred<void>, options: any): void;
    private _resumeLoader(node);
    protected _activateChild(node: Tree.Node, index: number): void;
    protected _failNode(node: Tree.Node, ex: Error): void;
    visit(node: Tree.Node, iterator: (item: Tree.Node) => void, context?: any): void;
    isDescendantNode(node: Tree.Node, ancestor: Tree.Node): boolean;
    /**
     * @protected
     * @returns {Object.<string, Command>}
     */
    protected createCommands(): ICommandLazyMap;
    protected createTreeMenuDefaults(): MenuOptions;
    protected createTreeMenu(): Menu;
    protected createNodeMenuDefaults(node?: Tree.Node): MenuOptions;
    protected createNodeMenu(node?: Tree.Node): Menu;
    protected createSelectionMenuDefaults(): MenuOptions;
    protected createSelectionMenu(): Menu;
    protected _onNodeChange(sender: Tree.Node, ea: lang.ObservableChangeArgs): void;
    protected _initializeProps(): void;
    protected _initializeMenus(): void;
    protected _initMenu(menu: Menu): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected _onActiveNodeChanged(sender: Tree, node: Tree.Node): void;
    appendToSelection(nodes: Tree.Node[]): void;
    protected doSelectChildren(): void;
    protected canSelectChildren(): boolean;
    protected doSelectSiblings(): void;
    protected canSelectSiblings(): boolean;
    protected doSelectNone(): void;
    protected canSelectNone(): boolean;
    doReloadActive(): Promise<void>;
    protected canReloadActive(): boolean;
    doReloadRoot(): Promise<void>;
    protected canReloadRoot(): boolean;
    dragStart(node: Tree.Node): boolean;
    dragEnter(node: Tree.Node, otherNode: Tree.Node): boolean;
    dragDrop(node: Tree.Node, otherNode: Tree.Node): lang.Promise<boolean> | boolean | undefined;
    private _isSearchEnabled();
    /**
     * Marks nodes in the model as "filtered" according to the text filter.
     * @param {string} matchRegexp - Escaped search string.
     * @param startNode - Node to start search from.
     */
    filterTreeNodes(matchRegexp: string, startNode: Tree.Node): void;
    /**
     * Checks whether the node's text data matches a regular expression.
     * @param {Tree.Node} node - Tree node to check.
     * @param {RegExp} match - Regular expression.
     * @returns {boolean} - `true` if the node's text data matches the regular expression, otherwise`false`.
     */
    private _isNodeMatched(node, match);
    /**
     * Is local search in columns enabled.
     * @returns {boolean} - true` if local search in columns is enabled, otherwise`false`.
     * @private
     */
    private _isColumnsSearchEnabled();
    /**
     * Refresh info about the count of found nodes.
     */
    refreshSearchStat(): void;
}
declare namespace Tree {
    class Node extends lang.Observable {
        /**
         * @deprecated Use Tree.NodeState
         */
        static States: typeof Tree.NodeState;
        private _state;
        private _children;
        private _data;
        /**
         * @constructs Tree.Node
         * @extends Observable
         */
        constructor(data: any, isLeaf?: boolean);
        dispose(): void;
        /**
         * @observable-property {*}
         */
        data: lang.ObservableProperty<any>;
        /**
         * @observable-property {String}
         */
        icon: lang.ObservableProperty<string>;
        /**
         * @observable-property {Tree.NodeState}
         */
        state: lang.ObservableProperty<Tree.NodeState>;
        /**
         * @observable-property {String}
         */
        message: lang.ObservableProperty<string>;
        /**
         * @observable-property {Tree.Node}
         */
        parent: lang.ObservableProperty<Tree.Node>;
        /**
         * @observable-getter {ObservableCollection}
         */
        children: lang.ObservableGetter<lang.IObservableCollection<Tree.Node>>;
        /**
         * Indicates that node is NOT matched Tree.searchText and all of it children
         * @observable-property {boolean}
         */
        filtered: lang.ObservableProperty<boolean>;
        /**
         * Indicates that node is matched Tree.searchText
         */
        searchTextMatched: boolean;
        transientChildren: boolean;
        protected _onStateChange(sender: Tree.Node, v: Tree.NodeState): void;
    }
    interface Options extends Component.Options {
        hasCheckboxes?: boolean;
        hasNumbering?: boolean;
        search?: boolean | SearchOptions;
        commands?: core.commands.ICommandLazyMap;
        menuTree?: Menu.Options | ((tree: Tree) => Menu.Options);
        menuNode?: Menu.Options | ((tree: Tree, node: Tree.Node) => Menu.Options);
        menuSelection?: Menu.Options | ((tree: Tree) => Menu.Options);
        identifier?: TreeNodeIdentifierCallback;
        formatter?: TreeNodeFormatterCallback;
        iconizer?: TreeNodeIconizerCallback;
        selectionFilter?: TreeNodeFilterCallback;
        loader?: ITreeLoader;
        loaderObsExp?: "disabled" | boolean;
        autoLoad?: boolean;
        traceSourceName?: string;
        columns?: TreeColumn[];
        dnd?: DragAndDropHandler;
        strings?: {
            not_loaded?: string;
            load_failed?: string;
            no_data?: string;
        };
    }
    interface DragAndDropHandler {
        dragStart(node: Tree.Node): boolean;
        dragEnter(node: Tree.Node, otherNode: Tree.Node): boolean;
        dragDrop(node: Tree.Node, otherNode: Tree.Node): lang.Promise<boolean> | boolean | undefined;
    }
    const NodeState: {
        initial: "initial";
        loading: "loading";
        loaded: "loaded";
        failed: "failed";
        disposed: "disposed";
    };
    type NodeState = (typeof NodeState)[keyof typeof NodeState];
    interface Identity {
        type?: string;
        id?: string;
    }
    interface TreeNodeData {
        data?: any;
        icon?: string;
        children?: TreeNodeData[];
        isLeaf?: boolean;
        transientChildren?: boolean;
    }
    interface TreeColumn {
        name: string;
        title?: string;
        html?: boolean;
        colspan?: (node: Tree.Node) => number;
        getter?: (node: Tree.Node) => string | formatters.SafeHtml;
    }
    type TreeNodeFilterCallback = (tree: Tree, node: Tree.Node) => boolean;
    type TreeNodeIdentifierCallback = (tree: Tree, node: Tree.Node) => Identity;
    type TreeNodeFormatterCallback = (tree: Tree, node: Tree.Node) => string;
    type TreeNodeLoadCallback = (tree: Tree, node: Tree.Node, params?: any, options?: any) => TreeNodeData[] | Promise<TreeNodeData[]>;
    type TreeNodeIconizerCallback = (tree: Tree, node: Tree.Node) => string;
    interface ITreeLoader {
        loadChildren: TreeNodeLoadCallback;
    }
    interface SearchOptions {
        enable: boolean;
        searchInColumns?: boolean;
        showStat?: boolean;
    }
}
export = Tree;
