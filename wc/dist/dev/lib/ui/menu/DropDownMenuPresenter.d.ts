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
declare class DropDownMenuPresenter extends Part {
    static defaultOptions: DropDownMenuPresenter.Options;
    options: DropDownMenuPresenter.Options;
    viewModel: any;
    link: JQuery;
    menuEl: JQuery;
    /**
     * @class DropDownMenuPresenter
     * @extends Part
     */
    constructor(options?: DropDownMenuPresenter.Options);
    setViewModel(model: DropDownMenuPresenter.Model): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected doRender(domElement: JQuery | HTMLElement): core.lang.Promisable<void>;
    protected _bindToggleLinkToItems(): void;
    /**
     * On opening dropdown menu (toggle button/link was clicked)
     */
    protected onShow(): void;
    unload(options?: Part.CloseOptions): void;
    clear(): void;
    toggle(): void;
    protected _onMenuChanged(): void;
    protected _renderItems(items: Menu.Item[], $menu: JQuery): void;
    protected _renderItem(item: Menu.Item): JQuery;
    protected _createDivider(item: Menu.Item): JQuery;
    protected _createHeader(item: Menu.Item): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
    protected _getItemHtml(item: Menu.Item): string;
    protected _renderSubItems(subitems: Menu.Item[], $item: JQuery): void;
    protected _renderWaitStub(domElement: JQuery): void;
}
declare namespace DropDownMenuPresenter {
    interface Options extends Part.Options {
        /**
         * Bind container element (anchor by default) enable state to availability of any menu items
         * @type {Boolean}
         */
        disableIfEmpty?: boolean;
        /**
         * Icon name for button
         */
        toggleButtonIcon?: string;
        /**
         * Additional user CSS class for root menu (ul) element.
         * @type {String}
         */
        cssClass?: string;
        /**
         * Additional user CSS class for root element.
         * @type {String}
         */
        cssClassContainer?: string;
        /**
         * Additional user CSS class for item element.
         * @type {String}
         */
        itemCssClass?: string;
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
         * @type {Boolean}
         */
        noFocus?: boolean;
        /**
         * Trigger dropdown menu above element instead of below (by default)
         * @type {Boolean}
         */
        dropup?: boolean;
        viewModel?: any;
    }
    type Model = Menu | {
        getMenu?: (ctx?: any) => {
            items?: Menu.Item[];
        } | DropDownMenuPresenter.Model;
    };
}
export = DropDownMenuPresenter;
