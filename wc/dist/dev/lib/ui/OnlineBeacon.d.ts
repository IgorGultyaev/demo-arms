/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Menu = require("lib/ui/menu/Menu");
import "xcss!lib/ui/styles/onlineBeacon";
import { IApplication } from "lib/.core";
import { DataFacadeSmart } from "core.interop";
declare class OnlineBeacon extends View {
    static defaultOptions: OnlineBeacon.Options;
    static defaultMenu: Menu.Options;
    options: OnlineBeacon.Options;
    app: IApplication;
    dataFacade: DataFacadeSmart;
    commands: core.lang.Map<core.commands.ICommand>;
    menu: Menu;
    /**
     * @class OnlineBeacon
     * @extends View
     * @param {Application} app
     * @param {Object} [options]
     */
    constructor(app: IApplication, options: OnlineBeacon.Options);
    createMenuDefaults(): Menu.Options;
    createMenu(): Menu;
    /**
     * Create commands
     * @protected
     * @returns {{
         * 		online: (Command),
         * 		offline: (Command),
         * 		check: (Command),
         * 		resolve: (Command)
         * 	}}
     */
    createCommands(): core.lang.Map<core.commands.ICommand>;
}
declare namespace OnlineBeacon {
    interface Options extends View.Options {
        menu?: Menu.Options;
    }
}
export = OnlineBeacon;
