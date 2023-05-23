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
declare class MenuNavGridPresenter extends MenuPresenterBase {
    /**
     * @type {Object}
     */
    static defaultOptions: MenuNavGridPresenter.Options;
    options: MenuNavGridPresenter.Options;
    /**
     * Grid menu presenter for navigation menus
     * @constructs MenuNavGridPresenter
     * @extends MenuPresenterBase
     * @param {Object} options
     */
    constructor(options: MenuNavGridPresenter.Options);
    protected _createRootEl(domElement: JQuery | HTMLElement): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
    protected _processItems(items: Menu.Item[], menuRoot: JQuery): void;
    protected _processItem(item: Menu.Item): JQuery;
    protected _createSubItems(item: Menu.Item): JQuery;
    protected _onSelectedItemChanged(sender: Menu, name: string): void;
}
declare namespace MenuNavGridPresenter {
    interface Options extends MenuPresenterBase.Options {
        /**
         * Columns number. if you change this options - change style .x-app-nav-cell (width)
         * @type {Number}
         */
        columns?: number;
        hideHeaders?: boolean;
        classes?: ClassesOptions;
    }
    interface ClassesOptions extends MenuPresenterBase.ClassesOptions {
        cell?: string;
        section?: string;
    }
}
export = MenuNavGridPresenter;
