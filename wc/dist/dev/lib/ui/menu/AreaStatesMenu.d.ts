/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Menu = require("lib/ui/menu/Menu");
import Area = core.composition.Area;
import Item = AreaStatesMenu.Item;
declare class AreaStatesMenu extends Menu {
    items: Item[];
    private _disposes;
    /**
     * Menu for area's states. Accepts an area instance in costructor and generates single level menu
     * with items for each the area's state.
     * @constructs AreaStatesMenu
     * @extends Menu
     * @option {Area} area Area with states
     */
    constructor(area: Area, additionalMenu?: Menu.Options);
    dispose(): void;
    protected _subscribe(obj: core.lang.Observable, eventName: string, callback: Function, context?: any): void;
}
declare namespace AreaStatesMenu {
    interface Item extends Menu.Item {
        url?: string;
    }
}
export = AreaStatesMenu;
