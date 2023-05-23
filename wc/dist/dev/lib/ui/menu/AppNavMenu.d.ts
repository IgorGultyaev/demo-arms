/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Menu = require("lib/ui/menu/Menu");
declare class AppNavMenu extends Menu {
    _areaManager: core.composition.AreaManager;
    /**
     * @class AppNavMenu
     * @extends Menu
     * @param {AreaManager} areaManager
     * @param args
     * @param {...Object} One or more options. {@link Menu.constructor}
     */
    constructor(areaManager: core.composition.AreaManager, ...args: Menu.Options[]);
    static createDefaultMenu(areaManager: core.composition.AreaManager): Menu.Item[];
    bindToCommands(): void;
    doNavigateArea(args: any): void;
    doNavigateState(args: any): void;
    protected _onCurrentStateChanged(): void;
}
export = AppNavMenu;
