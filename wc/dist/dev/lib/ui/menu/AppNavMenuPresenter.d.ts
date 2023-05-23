/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Part = require("lib/ui/Part");
import Menu = require("lib/ui/menu/Menu");
import MenuPresenterBase = require("lib/ui/menu/MenuPresenterBase");
import "xcss!lib/ui/styles/menuNav";
declare class AppNavMenuPresenter extends MenuPresenterBase {
    static defaultOptions: AppNavMenuPresenter.Options;
    options: AppNavMenuPresenter.Options;
    private _resizeSubscribed;
    /**
     * Application navigation toolbar presenter
     * @class AppNavMenuPresenter
     * @extends MenuPresenterBase
     * @param {Object} options
     */
    constructor(options?: AppNavMenuPresenter.Options);
    protected _processItems(items: Menu.Item[], menuRoot: JQuery): void;
    protected _processItem(item: Menu.Item): JQuery;
    protected _createRootEl(domElement: JQuery): JQuery;
    protected _createActionItemContainer(anchor: JQuery): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
    protected _onSelectedItemChanged(sender: Menu, name: string): void;
    protected beforeRender(): void;
    protected afterRender(): void;
    protected _initScrollButtons(): void;
    protected _doReflow(): void;
    /**
     * Async reflow. Initialized later via mixin.
     */
    reflow: () => void;
    scroll(step: number): void;
    unload(options?: Part.CloseOptions): void;
}
declare namespace AppNavMenuPresenter {
    interface Options extends MenuPresenterBase.Options {
        autoFill?: boolean;
        autoScroll?: boolean;
        tooltips?: boolean;
        radio?: boolean;
        hideSingle?: boolean;
    }
}
export = AppNavMenuPresenter;
