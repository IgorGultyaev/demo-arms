/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Part = require("lib/ui/Part");
import Menu = require("lib/ui/menu/Menu");
import AppNavMenuPresenter = require("lib/ui/menu/AppNavMenuPresenter");
import LanguageMenu = require("lib/ui/menu/LanguageMenu");
import SystemMenu = require("lib/ui/menu/SystemMenu");
import OnlineBeacon = require("lib/ui/OnlineBeacon");
import MenuNavGridPresenter = require("lib/ui/menu/MenuNavGridPresenter");
import "xcss!lib/ui/styles/appToolbar";
declare class AppToolbar extends View {
    defaultOptions: AppToolbar.Options;
    options: AppToolbar.Options;
    sysMenu: SystemMenu;
    eventPublisher: core.events.EventPublisher;
    navMenuPresenter: AppNavMenuPresenter;
    langMenu: LanguageMenu;
    onlineBeacon: OnlineBeacon;
    authMenu: any;
    /**
     * Application navigation menu.
     * @observable-property {AppNavMenu}
     */
    appNavMenu: core.lang.ObservableProperty<Menu>;
    /**
     * @constructs View
     * @extends StatefulPart
     * @param {Application} app
     * @param {View.defaultOptions} options View options
     */
    constructor(app: core.Application, options?: AppToolbar.Options);
    initComponents(app: core.Application): void;
    initSystemMenu(app: core.Application): void;
    initNavToolbar(app: any): void;
    initLanguageMenu(app: any): void;
    initOnlineBeacon(app: any): void;
    initAuthMenu(app: any): void;
    protected afterRender(): void;
    protected onReady(): void;
}
declare namespace AppToolbar {
    interface Options extends Part.Options {
        template?: HandlebarsTemplateDelegate;
        sysMenu?: Menu.Options;
        navToolbar?: boolean | AppNavMenuPresenter.Options;
        navGridPresenter?: MenuNavGridPresenter.Options;
        langMenu?: boolean | LanguageMenu.Options;
        onlineBeacon?: boolean | any;
        authMenu?: boolean | any;
        affix?: any;
        theme?: string;
        cssClass?: string;
    }
}
export = AppToolbar;
