/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import Menu = require("lib/ui/menu/Menu");
import * as interop from "lib/interop/.interop";
import lang = core.lang;
import ICommand = core.commands.ICommand;
declare class AuthMenu extends Component {
    /**
     * @type {Object}
     * @property {String} defaultTitle
     * @property {Object} commands
     * @property {Object} menu
     * @property {String} userDisplayField Name of field of user json object to display
     */
    static defaultOptions: AuthMenu.Options;
    /**
     * Static (used by all instances) default menu metadata.
     * @type {Object}
     */
    static defaultMenu: Menu.Options;
    /**
     * Title for menu root element.
     * @observable-property {string}
     */
    rootTitle: lang.ObservableProperty<string>;
    options: AuthMenu.Options;
    menu: Menu;
    commands: core.commands.ICommandLazyMap;
    dataFacade: interop.IDataFacade;
    private _disposes;
    /**
     * @constructs AuthMenu
     * @extends Component
     * @param {DataFacadeBase} dataFacade
     * @param {EventPublisher} eventPublisher
     * @param {AuthMenu#defaultOptions} [options]
     */
    constructor(dataFacade: interop.IDataFacade, eventPublisher: core.IEventPublisher, options: AuthMenu.Options);
    /**
     * Create commands
     * @protected
     * @returns {{Login: (Command), Logout: (Command)}}
     */
    protected createCommands(): lang.Map<ICommand>;
    /**
     * Create menu.
     * @protected
     * @return {Menu}
     */
    protected createMenu(): Menu;
    /**
     * Get default menu metadata.
     * @protected
     * @return {Object}
     */
    protected createDefaultMenu(): Menu.Options;
    dispose(options?: core.ui.Part.CloseOptions): void;
    /**
     * Update menu for "unauthorized" state (no user logged in)
     * @protected
     */
    activateUnauthorizedMenu(): void;
    /**
     * Update menu for "authorized" state (a user logged in)
     * @protected
     * @param {Object} [user]
     */
    activateAuthorizedMenu(user: Object): void;
    /**
     * @protected
     * @param {Object} [user]
     */
    protected onSetRootTitle(user?: Object): void;
    /**
     * @inheritDoc
     */
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
}
declare namespace AuthMenu {
    interface Options extends Component.Options {
        defaultTitle?: string;
        commands?: lang.Map<ICommand>;
        menu?: Menu.Options;
        userDisplayField?: string;
    }
}
export = AuthMenu;
