/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Menu = require("lib/ui/menu/Menu");
import MenuPresenterBase = require("lib/ui/menu/MenuPresenterBase");
import "xcss!lib/ui/styles/menuNav";
declare class MenuNavPresenter extends MenuPresenterBase {
    static defaultOptions: MenuNavPresenter.Options;
    /**
     * Menu presenter for navigation menus (based on links)
     * @constructs MenuNavPresenter
     * @extends MenuPresenterBase
     * @param options
     */
    constructor(options?: MenuPresenterBase.Options);
    protected _createRootEl(domElement: JQuery | HTMLElement): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
    protected _createActionItemContainer(itemEl: JQuery): JQuery;
    protected _createSubmenuContainer(item: Menu.Item): JQuery;
    protected _setupClickHandle(menuRoot: JQuery): void;
    protected _onSelectedItemChanged(sender: Menu, name: string): void;
}
declare namespace MenuNavPresenter {
    interface Options extends MenuPresenterBase.Options {
    }
}
export = MenuNavPresenter;
