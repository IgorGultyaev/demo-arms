/// <reference path="../../../vendor/fancytree/jquery.fancytree.dnd.d.ts" />
/// <reference types="jquery.fancytree" />
/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Tree = require("lib/ui/tree/Tree");
import "lib/ui/ExpandablePanel";
import "vendor/fancytree/jquery.fancytree";
import "vendor/fancytree/jquery.fancytree.table";
import "vendor/fancytree/jquery.fancytree.glyph";
import "xcss!lib/ui/styles/tree";
import "xcss!lib/ui/styles/FancytreePresenter";
import lang = core.lang;
import { INavigationService } from "lib/.core";
import { HostContextOptions } from "lib/ui/.ui";
declare class FancytreePresenter extends View {
    static defaultOptions: FancytreePresenter.Options;
    static hostDefaultOptions: lang.Map<FancytreePresenter.Options>;
    options: FancytreePresenter.Options;
    uiTree: Fancytree.Fancytree;
    eventPublisher: core.IEventPublisher;
    _selecting: boolean;
    _activating: boolean;
    _timeoutAffix: number;
    viewModel: Tree;
    templates: HandlebarsTemplateDelegate[];
    _columnCount: number;
    /**
     * @constructs FancytreePresenter
     * @extends View
     */
    constructor(options?: FancytreePresenter.Options);
    applyHostContext(opt: HostContextOptions): INavigationService.NavigateOptions;
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected createUiTree($tree: JQuery): Fancytree.Fancytree;
    /**
     * Fancytree Default Options builder.
     * @param {JQuery} $tree - JQuery tree element.
     * @returns Default Fancytree options.
     */
    private _buildDefaultTreeOptions($tree);
    /**
     * Enable Drag'n'Drop support.
     * @param treeOptions - Fancytree options.
     */
    private _enableDragAndDrop(treeOptions);
    /**
     * Enable table mode with multiple columns.
     * @param {JQuery} $tree - JQuery tree element.
     */
    private _enableMultiColum($tree);
    /**
     * Enable local search.
     * @param {JQuery} $tree - JQuery tree element.
     * @param treeOptions - Fancytree options.
     */
    private _enableLocalSearch($tree, treeOptions);
    /**
     * Search text change handler.
     */
    private _searchTextChanged();
    /**
     * Applies current search text filter.
     * @param {Tree.Node} startNode - Node to start search from. Default - ROOT node.
     */
    private _applySearch(startNode?);
    /**
     * HTML-highlight the specified text in the source.
     * @param {string} source - Source text.
     * @param {string} textToHighlight - Text to highlight.
     * @param {boolean} isHtmlEncoded - Is source text html-markup.
     * @returns {string} Formatted text (HTML).
     */
    private _highlight(source, textToHighlight, isHtmlEncoded);
    /**
     * Hide node from UI if it not matched to search text.
     * @param {Fancytree.FancytreeNode} uiNode - Fancytree node.
     */
    static hideFilteredNode(uiNode: Fancytree.FancytreeNode): void;
    /**
     * Is local search enabled.
     * @returns {boolean} - `true` if local search is enabled, otherwise`false`.
     */
    isSearchEnabled(): boolean;
    /**
     * Is local search in columns enabled.
     * @returns {boolean} - true` if local search in columns is enabled, otherwise`false`.
     * @private
     */
    private _isColumnsSearchEnabled();
    /**
     * Correctly deactivates and deselect tree node in UI.
     * @param {Fancytree.FancytreeNode} uiNode - Fancytree node.
     */
    private static _deselectUiNode(uiNode);
    unload(): void;
    focus(): void;
    scrollToSelf(): void;
    findUiNode(node: Tree.Node): Fancytree.FancytreeNode;
    createUiNodeData(node: Tree.Node): Fancytree.NodeData;
    activateNode(node: Tree.Node, options?: {
        expand: boolean;
    }): void;
    /**
     * Select or deselect tree nodes
     * @param {TreeNode|Array} nodes A single tree node or an array of nodes.
     * @param {Boolean} [select=true] Should be nodes selected (by default) or deselected.
     * @returns {jQuery.Promise}
     * NOTE: This method doesn't modify viewModel.selection()
     */
    selectNodes(nodes: Tree.Node | Tree.Node[], select?: boolean): lang.Promise<void>;
    protected _scrollToUiNode(uiNode: Fancytree.FancytreeNode): void;
    protected _onUiActivate(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiDeactivate(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiFocusTree(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiBlurTree(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiExpandCollapse(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiLazyLoad(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiCreateNode(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    private _renderColumns(node);
    protected _onUiRenderColumns(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiDblClick(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _onUiKeyDown(e: JQueryEventObject): void;
    protected _onUiSelect(e: JQueryEventObject, ctx: Fancytree.EventData): void;
    protected _executeDefaultMenuItem(): void;
    protected _onExternalFocus(): void;
    protected _addNewNodes(nodes: Tree.Node[]): void;
    protected _onTreeNodesChange(tree: Tree, ea: any): void;
    protected _onTreeNodeChange(tree: Tree, ea: lang.ObservableChangeArgs & {
        changed: Tree.Node;
    }): void;
    protected _onActiveNodeChange(tree: Tree, node: Tree.Node): void;
    protected _onSelectionChange(sender: lang.IObservableCollection<Tree.Node>, ea: lang.ObservableCollectionChangeArgs<Tree.Node>): void;
    protected _refreshAffixAsync(delay?: number): void;
    protected _copyToClipboad(): void;
}
declare namespace FancytreePresenter {
    interface Options extends View.Options {
        autoHeight?: boolean;
        treeHeight?: number;
        affixMenu?: boolean;
        hasCheckboxes?: boolean;
        hasNumbering?: boolean;
        hideMenuNode?: boolean;
        hideMenuTree?: boolean;
        showTitle?: boolean;
        cssClass?: string;
        menuNodeCssClass?: string;
        menuTreeCssClass?: string;
        columns?: Tree.TreeColumn[];
        treeOptions?: Fancytree.FancytreeOptions & {
            [key: string]: any;
        };
        dnd?: boolean;
        scrollToActiveNode?: boolean;
        partialTemplates?: lang.Map<HandlebarsTemplateDelegate>;
        templates?: string[];
        search?: Tree.SearchOptions | boolean;
    }
}
export = FancytreePresenter;
