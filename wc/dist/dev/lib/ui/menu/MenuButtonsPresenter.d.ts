/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Menu = require("lib/ui/menu/Menu");
import MenuPresenterBase = require("lib/ui/menu/MenuPresenterBase");
import "xcss!lib/ui/styles/menuButtons";
declare class MenuButtonsPresenter extends MenuPresenterBase {
    static defaultOptions: MenuButtonsPresenter.Options;
    options: MenuButtonsPresenter.Options;
    /**
     * Menu presenter based on Bootstrap buttons (.btn, .btn-group)
     * @constructs MenuButtonsPresenter
     * @extends MenuPresenterBase
     */
    constructor(options: MenuButtonsPresenter.Options);
    protected _createRootEl(domElement: JQuery): JQuery;
    protected _createSubmenuContainer(item: Menu.Item): JQuery;
    protected _createItemEl(item: Menu.Item): JQuery;
    protected _setupClickHandle(menuRoot: JQuery): void;
    protected _onSelectedItemChanged(sender: Menu, name: string): void;
    focusItem(name: string): void;
}
declare namespace MenuButtonsPresenter {
    interface Options extends MenuPresenterBase.Options {
        ungrouped?: boolean;
        inline?: boolean;
        classes?: ClassesOptions;
    }
    interface ClassesOptions extends MenuPresenterBase.ClassesOptions {
        rootInline?: string;
        rootRadio?: string;
    }
}
export = MenuButtonsPresenter;
