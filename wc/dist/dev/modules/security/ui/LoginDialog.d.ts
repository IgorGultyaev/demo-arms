/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Dialog = require("lib/ui/Dialog");
import View = require("lib/ui/handlebars/View");
import "vendor/moment/moment-duration-format";
import "xcss!./styles/loginDialog";
import { AuthProvider, SecurityConfig } from "../interop";
import * as interop from "lib/interop/.interop";
import AjaxSettings = interop.AjaxSettings;
import ICommand = core.commands.ICommand;
import lang = core.lang;
import ProviderInfo = LoginDialog.ProviderInfo;
declare class LoginDialog extends Dialog {
    static statusMessages: lang.Map<string>;
    static defaultOptions: LoginDialog.Options;
    private _disabled;
    authTypes: lang.ObservableProperty<lang.ObservableCollection<ProviderInfo>>;
    /**
     * Name of currently active auth provider.
     * @observable-property {*}
     */
    currentAuthType: lang.ObservableProperty<string>;
    /**
     * @observable-property {*}
     */
    currentAuthProvider: lang.ObservableProperty<LoginDialog.AuthView>;
    /**
     * @observable-property {Boolean}
     */
    hasOpenAuth: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    rememberMe: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {LoginDialog#statusMessages}
     */
    status: lang.ObservableProperty<string>;
    options: LoginDialog.Options;
    dataFacade: interop.IDataFacade;
    security: SecurityConfig;
    providers: lang.Map<LoginDialog.AuthView>;
    /**
     * @constructs LoginDialog
     * @extends Dialog
     * @param {DataFacadeBase} dataFacade
     * @param {Object} security
     * @param {Object} [security.windowsAuth]
     * @param {String} security.windowsAuth.loginUrl
     * @param {Object} [security.formsAuth]
     * @param {String} security.formsAuth.loginUrl
     * @param {Object} [security.openAuth]
     * @param {String} security.openAuth.loginUrl
     * @param {Array} security.openAuth.providers
     * @param {Object} [options]
     */
    constructor(dataFacade: interop.IDataFacade, security: SecurityConfig, options?: LoginDialog.Options);
    initAuthTypes(secCfg: SecurityConfig): void;
    _createProvider(name: string, options: LoginDialog.AuthView.Options): void;
    afterRender(): void;
    _enable(bEnabled: boolean): void;
    executeAuth(ajaxSettings: AjaxSettings): void;
    protected on2fAuthStep2(result: interop.LoginConfirm2f): void;
    protected promptFor2fSecret(result: interop.LoginConfirm2f): lang.Promise<string>;
    protected onAuthSuccess(result: any): void;
    protected onAuthError(error: any): void;
    executeAuthExternal(ajaxSettings: AjaxSettings): void;
    protected _onPopupClosed(): void;
}
declare namespace LoginDialog {
    interface Options extends Dialog.Options {
        providers: lang.Map<new (host: LoginDialog, options: AuthView.Options) => AuthView>;
    }
    interface ProviderInfo {
        name: string;
        title: string;
        isDefault: boolean;
    }
    class AuthView extends View {
        /**
         * @observable-property {LoginDialog#statusMessages}
         */
        status: lang.ObservableProperty<string>;
        static defaultOptions: AuthView.Options;
        host: LoginDialog;
        cmdLogin: ICommand;
        /**
         * @class AppNavMenu
         * @extends Menu
         */
        constructor(host: LoginDialog, options: AuthView.Options);
        protected beforeLogin(): boolean;
        protected _doLogin(args: any): void;
    }
    namespace AuthView {
        interface Options extends View.Options, AuthProvider {
        }
    }
    class WindowsAuthView extends AuthView {
        static defaultOptions: WindowsAuthView.Options;
        options: WindowsAuthView.Options;
        constructor(host: LoginDialog, options: WindowsAuthView.Options);
        protected _doLogin(): void;
    }
    namespace WindowsAuthView {
        interface Options extends LoginDialog.AuthView.Options {
            loginUrl: string;
        }
    }
    class FormsAuthView extends AuthView {
        static defaultOptions: FormsAuthView.Options;
        options: FormsAuthView.Options;
        /**
         * @observable-property {string}
         */
        userName: lang.ObservableProperty<string>;
        /**
         * @observable-property {string}
         */
        password: lang.ObservableProperty<string>;
        constructor(host: LoginDialog, options: FormsAuthView.Options);
        protected beforeLogin(): boolean;
        protected _validate(propName?: string): boolean;
        protected _doLogin(): void;
        protected afterRender(): void;
    }
    namespace FormsAuthView {
        interface Options extends AuthView.Options {
            loginUrl: string;
        }
    }
    class OpenAuthView extends AuthView {
        static defaultOptions: OpenAuthView.Options;
        options: OpenAuthView.Options;
        /**
         * @observable-property {ObservableCollection}
         */
        openAuthProviders: lang.ObservableProperty<lang.ObservableCollection<any>>;
        constructor(host: LoginDialog, options: OpenAuthView.Options);
        _doLogin(args: any): void;
    }
    namespace OpenAuthView {
        interface Options extends AuthView.Options {
            loginUrl: string;
            providers?: any;
        }
    }
}
export = LoginDialog;
