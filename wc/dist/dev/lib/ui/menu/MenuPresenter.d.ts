/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Menu = require("lib/ui/menu/Menu");
import MenuPresenterBase = require("lib/ui/menu/MenuPresenterBase");
import "xcss!lib/ui/styles/menu";
declare class MenuPresenter extends MenuPresenterBase {
    static defaultOptions: MenuPresenter.Options;
    /**
     * Menu presenter for action menus (based on buttons)
     * @constructs MenuPresenter
     * @extends MenuPresenterBase
     * @param options See MenuPresenterBase.prototype.defaultOptions
     * @param {Object} options.viewModel
     */
    constructor(options?: MenuPresenterBase.Options);
    protected _createRootEl(domElement: JQuery | HTMLElement): JQuery;
    protected _createSubmenuContainer(item: Menu.Item): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
}
declare namespace MenuPresenter {
    interface Options extends MenuPresenterBase.Options {
    }
}
export = MenuPresenter;
