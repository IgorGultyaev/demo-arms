/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Part = require("lib/ui/Part");
import Menu = require("lib/ui/menu/Menu");
import IPart = core.ui.IPart;
declare abstract class MenuPresenterBase extends Part {
    static defaultOptions: MenuPresenterBase.Options;
    options: MenuPresenterBase.Options;
    viewModel: Menu;
    radio: boolean;
    /**
     * @constructs MenuPresenterBase
     * @extends Part
     * @param options
     */
    constructor(options: MenuPresenterBase.Options);
    protected _bindItemCommand(item: Menu.Item, itemEl: JQuery): void;
    protected doRender(domElement: JQuery | HTMLElement): core.lang.Promisable<void>;
    protected _onViewModelChanged(sender: Menu, args: core.lang.ObservableChangeArgs): void;
    protected _onMenuChanged(): void;
    protected abstract _createRootEl(domElement: JQuery | HTMLElement): JQuery;
    protected _processItems(items: Menu.Item[], menuRoot: JQuery): void;
    protected _processItem(item: Menu.Item): JQuery;
    protected _createDivider(item: Menu.Item): JQuery;
    /**
     * Create an element for action item (item with command), set up bindings
     * @param item
     * @returns {JQuery}
     * @protected
     */
    protected _createActionItem(item: Menu.Item): JQuery;
    /**
     * Wrap element for action item (created by _createActionItem) with an element
     * @param {JQuery} itemEl item element
     * @returns {JQuery} new item element
     * @protected
     */
    protected _createActionItemContainer(itemEl: JQuery): JQuery;
    /**
     * Create element for submenu - an item with sub items
     * @param {Menu.Item} item
     * @returns {JQuery}
     * @protected
     */
    protected _createSubmenuItem(item: Menu.Item): JQuery;
    protected _createSubmenuContainer(item: Menu.Item): JQuery;
    protected abstract _createItemEl(item: Menu.Item): JQuery;
    protected _addItemCommonAttrs(item: Menu.Item, itemEl: JQuery): void;
    protected _createDropDownPresenter(item: Menu.Item, presenterOptions: any): IPart;
    protected _onSelectedItemChanged(sender: Menu, name: string): void;
    protected _setupClickHandle(menuRoot: JQuery): void;
    unload(options?: Part.CloseOptions): void;
}
declare namespace MenuPresenterBase {
    interface Options extends Part.Options {
        orientation?: "horizontal" | "vertical";
        /**
         * Additional user CSS class for root element.
         * @type {String}
         */
        cssClass?: string;
        /**
         * Additional user CSS class for item element.
         * @type {String}
         */
        itemCssClass?: string;
        /**
         * Item element width (as value for css attribute 'width').
         * @type {Number}
         */
        itemWidth?: number | string;
        /**
         * Use reverse order of items
         * @type {Boolean}
         */
        reverse?: boolean;
        /**
         * @type {"both"|"icon"|"text"}
         */
        itemPresentation?: Menu.ItemPresentation;
        /**
         * Add tooltip for items with hint attribute
         * @type {Boolean}
         */
        tooltips?: boolean;
        /**
         * Radio buttons
         * @type {Boolean}
         */
        radio?: boolean;
        /**
         * @type {Boolean}
         */
        noFocus?: boolean;
        /**
         * Trigger dropdown menu above element instead of below (by default)
         * @type {Boolean}
         */
        dropup?: boolean;
        viewModel?: Menu;
        classes?: ClassesOptions;
    }
    interface ClassesOptions {
        root?: string;
        item?: string;
        itemDefault?: string;
        itemAction?: string;
        submenuItem?: string;
        submenuContainer?: string;
    }
}
export = MenuPresenterBase;
