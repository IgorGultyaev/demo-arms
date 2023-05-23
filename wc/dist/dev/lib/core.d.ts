/// <reference path="core.all.d.ts" />
/// <reference path="../vendor/.stubs.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
/**
 * @type module:"core.lang"
 */
import * as lang from "lib/core.lang";
/**
 * @type module:"core.binding"
 */
import * as binding from "lib/binding";
/**
 * @type module:"core.events"
 */
import * as events from "lib/core.events";
/**
 * @type module:"core.composition"
 */
import * as composition from "lib/core.composition";
/**
 * @type module:"core.diagnostics"
 */
import * as diagnostics from "lib/core.diagnostics";
/**
 * @type module:"core.commands"
 */
import * as commands from "lib/core.commands";
/**
 * @type module:"core.html"
 */
import * as html from "lib/core.html";
/**
 * @type module:"core.eth"
 */
import * as eth from "lib/core.eth";
import "vendor/modernizr";
import "vendor/history";
import "vendor/moment/locale/ru";
import { AppState, IApplication, IAppStateManager, IUserSettings, IUserSettingsStore } from ".core";
import { IPart, IDialog } from "ui/.ui";
import { IDataFacade } from "interop/.interop";
import { IDomainModel, UnitOfWork } from "domain/.domain";
import { ui as coreui, interop as coreinterop } from "core";
import Promise = lang.Promise;
import SystemMenu = require("ui/menu/SystemMenu");
/**
 * @exports core
 */
export { lang, binding, events, composition, diagnostics, commands, html, eth };
/**
 * Global cached JQuery object for `document`.
 * @type {JQuery}
 */
export declare let $document: JQuery;
/**
 * Global cached JQuery object for `window`.
 * @type {JQuery}
 */
export declare let $window: JQuery;
export declare let nls: {
    resources: any;
    merge: (resourcesModule: lang.Map<string>, prefix?: string) => lang.Map<string>;
};
/**
 * Virtual `ui` namespace where all ui components add themselves to.
 * @type {any}
 */
export declare let ui: typeof coreui;
export declare namespace ui {
}
export declare let interop: typeof coreinterop;
export declare namespace interop {
}
export import createCommand = commands.createCommand;
import { isHtml, SafeHtml, safeHtml } from "lib/formatters";
export { isHtml, SafeHtml, safeHtml };
/**
 * @typedef {object} XConfig
 * @global
 * @property {string} apiroot Api root path ("/" or "/myapp/")
 * @property {string} root Presentation root path ("/" or "/myapp/")
 * @property {string} appName name of the application
 * @property {string} clientBase path from `root` to
 * @property {boolean} isDebug debug mode
 * @property {String} defaultLanguage name of default language
 * @property {object} supportedLanguages An object which fields as language names and values are language description - an object with fields `title`, `short`
 * @property {object} modules An object with modules configurations - every field corresponds to a module and its value is a config object of the module
 * @property {object} software An object with software description
 * @property {string} software.clientLibVersion client lib (WebClient) version
 * @property {string} software.serverLibVersion server lib (WebClient) version
 * @property {string} software.appVersion application version
 * @property {object} security An object with security configuration
 * @property {string} security.logoutUrl An url relative to `apiroot` to log out
 */
export declare class SystemEvent extends lang.Observable {
    /**
     * @deprecated Use SystemEvent.State
     */
    static States: typeof SystemEvent.State;
    /**
     * @deprecated Use SystemEvent.Kind
     */
    static Kinds: typeof SystemEvent.Kind;
    kind: SystemEvent.Kind;
    uid: string;
    type: string;
    priority: string;
    message: string;
    html: string;
    severity: string;
    promise: lang.Promise<any>;
    error: Error;
    data: any;
    timestamp: Date;
    defaultAction: () => void;
    menu: any;
    /**
     * @observable-property {SystemEventState}
     */
    state: lang.ObservableProperty<SystemEvent.State>;
    /**
     * Always `true` to distinguish `SystemEvent` instances.
     * @constant {Boolean}
     */
    isSystemEvent: boolean;
    /**
     * System event. An object to represent an application-wide event. Usually it's published via `EventPublisher`.
     * @constructs SystemEvent
     * @memberOf module:core
     * @extends Observable
     * @param {Object} data
     * @param {String} data.type
     * @param {SystemEvent#kinds} data.kind A kind of notification: notification, process, actionRequest
     * @param {"high"|"normal"|"low"} data.priority A priority: high, normal, low
     * @param {String} data.message Title of notification
     * @param {String} [data.html] Html code to use instead of plain text in message
     * @param {"error"|"warning"|"success"|"info"} [data.severity] A severity of the notification: 'error', 'warning', 'success', 'info'
     * @param {Promise} [data.promise] A process' promise which will resolved when the process finishes
     * @param {Object} [data.error] Event is being created for an interop error
     * @param {*} [data.data] Any event specific data
     * @param {Function} [data.defaultAction]
     * @param {Object} [data.menu]
     */
    constructor(data: SystemEvent.Options);
    initialize(): void;
    /**
     * Return formatted timestamp of the event.
     * @return {String}
     */
    createdFormatted(): string;
    /**
     * Return flag whether the event has a menu.
     * @return {Boolean}
     */
    hasMenu(): boolean;
}
export declare namespace SystemEvent {
    interface Options {
        /** Event type: it's the `name` passed into `EventPublisher.publish`
         * @type {String}
         */
        type?: string;
        /** Event kind
         * @type {"notification"|"process"|"actionRequest"}
         */
        kind?: SystemEvent.Kind;
        /** Event priority.
         * @type {"high"|"normal"|"low"}
         */
        priority?: SystemEvent.Priority;
        /** event title
         * @type {String|SafeHtml}
         */
        message?: string | SafeHtml;
        /** unique identifier
         * @type {String}
         */
        uid?: string;
        /** html of event title: html will be used instead of title where it's applicable
         * @type {String}
         * @deprecated use SafeHtml in message
         */
        html?: string;
        /** event severity - importance: 'error', 'warning', 'success', 'info'
         * @type {"error"|"warning"|"success"|"info"}
         */
        severity?: SystemEvent.Severity;
        /** A `Promise` object for process-event - the notification will be closed where the promise is resolved
         * @type {jQuery.Promise}
         */
        promise?: lang.Promise<any>;
        /** Error object in case when the event represents an interop error
         * @type {Object}
         */
        error?: any;
        /** Any event specific data
         * @type {*}
         */
        data?: any;
        defaultAction?: any;
        menu?: any;
    }
    const State: {
        pending: "pending";
        active: "active";
        archived: "archived";
    };
    type State = (typeof State)[keyof typeof State];
    const Kind: {
        notification: "notification";
        process: "process";
        actionRequest: "actionRequest";
    };
    type Kind = (typeof Kind)[keyof typeof Kind];
    const Priority: {
        high: "high";
        normal: "normal";
        low: "low";
    };
    type Priority = (typeof Priority)[keyof typeof Priority];
    const Severity: {
        error: "error";
        warning: "warning";
        success: "success";
        info: "info";
    };
    type Severity = (typeof Severity)[keyof typeof Severity];
}
export declare class Platform extends lang.Observable {
    defaultLanguage: string;
    modernizr: ModernizrStatic;
    scrollbarWidth: number;
    supportTouch: boolean;
    isMobileDevice: boolean;
    features: {
        resizeOnZoom?: boolean;
    };
    limits: {
        queryStringMaxLen: number;
    };
    browser: {
        ie?: {
            version?: number;
        };
        iemobile?: {
            version?: number;
        };
        webkit?: {
            version?: number;
        };
        firefox?: {
            version?: number;
        };
    };
    os: {
        android?: {
            version?: number;
        };
        mac?: {};
    };
    $metaViewport: JQuery;
    private _userscalableRegex;
    private _maxscaleRegex;
    private _printing;
    /**
     * @constructs Platform
     * @extends Observable
     * @memberOf! module:core
     * @param {XConfig} config
     */
    constructor(config: XConfig);
    /**
     * @observable-property {Boolean}
     */
    printing: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {String}
     */
    language: lang.ObservableProperty<string>;
    /**
     * @observable-property {Boolean}
     */
    animation: lang.ObservableProperty<boolean>;
    protected _initFeatures(): void;
    isTouchDevice(): boolean;
    getUserScalable(): boolean;
    /**
     * Set meta tag 'viewport' values minimum-scale/maximum-scale. Setting them to "1.0" disables user zooming in mobile browsers.
     * @param {String} [minScale="1.0"]
     * @param {String} [maxScale="1.0"]
     */
    setUserScalable(minScale: string, maxScale: string): void;
    localize(resource: string | lang.Map<string>): string;
    measureScrollbar(): number;
}
/**
 * Global instance of {Platform}. Available as `core.platform`.
 * @type {Platform}
 */
export declare const platform: Platform;
/**
 * Global wrapper for `window.localStorage` available as `core.localStorage`.
 * @type {Object}
 */
export declare const localStorage: {
    prefix: string;
    impl: Storage;
    setItem: (key: string, value: string) => void;
    getItem: (key: string) => string;
    removeItem: (key: string) => void;
    setObject: (key: string, value: any) => void;
    getObject: (key: string) => any;
    forEach: (iterator: (val: any, key: string, ctx: any) => boolean | void, thisArg?: void) => boolean;
    some: (iterator: (val: any, key: string, ctx: any) => boolean | void, thisArg?: any) => boolean;
    setupPrefix: (prefix: string) => void;
};
/**
 * Global wrapper for `core.localStorage` for working with application settings. It implements hierarchy of settings (bundle -> value).
 * @type {Object}
 */
export declare const settings: {
    store: {
        prefix: string;
        impl: Storage;
        setItem: (key: string, value: string) => void;
        getItem: (key: string) => string;
        removeItem: (key: string) => void;
        setObject: (key: string, value: any) => void;
        getObject: (key: string) => any;
        forEach: (iterator: (val: any, key: string, ctx: any) => boolean | void, thisArg?: void) => boolean;
        some: (iterator: (val: any, key: string, ctx: any) => boolean | void, thisArg?: any) => boolean;
        setupPrefix: (prefix: string) => void;
    };
    prefix: string;
    _getStoreKey: (key: string) => string;
    getItem: (fqname: string) => string;
    setItem: (fqname: string, value: string) => void;
    getBundle: (name: string) => any;
    setBundle: (name: string, bundle: Object) => void;
    clear: (bundleName?: string) => void;
    getBundleNames: () => string[];
};
/**
 *
 */
export declare class UserSettings extends lang.Observable implements IUserSettings {
    private __values;
    private _propsOverrides;
    private _initialized;
    suppressEvents: boolean;
    name: string;
    scope: UserSettings.Scope;
    /**
     * @constructs UserSettings
     * @extends Observable
     * @memberOf! module:core
     * @params {Object} [options] map with prop names and booleans where`false` means to ignore the property in bindToProp/attach
     */
    constructor(options?: UserSettings.Options);
    /**
     * Change a property. Triggers "change" event with all values.
     * @param {String} name
     * @param value
     */
    set(name: string, value: any): void;
    initialize(json: Object): void;
    /**
     * Bind the instance to a property of an Observable object.
     * On the property change we'll fire "change" event with all values.
     * @param {Observable} owner
     * @param {String} propName
     */
    bindToProp(owner: lang.Observable, propName: string): void;
    /**
     * Attach a nested part settings.
     * @param {String} name name of nested part, will be used as setting name
     * @param {UserSettings} nested
     */
    attach(name: string, nested: IUserSettings): void;
    applyOverrides(props: IUserSettings.PropsMap): void;
    /**
     * Attach settings store to the nested region.
     * @param {String} name name of nested region, will be used as setting name
     * @param {Region} region
     */
    attachToRegion(name: string, region: composition.Region): void;
    getValues(): Object;
    get(name: string): any;
    static create(options?: false | UserSettings.Options): IUserSettings;
}
export declare namespace UserSettings {
    interface Options extends IUserSettings.Options {
    }
    export import PropsMap = IUserSettings.PropsMap;
    export import Scope = IUserSettings.Scope;
    export import EventArgs = IUserSettings.EventArgs;
    const Events: {
        INITIALIZING: string;
        INITIALIZED: string;
    };
}
export declare class UserSettingsStore extends lang.Observable implements IUserSettingsStore {
    bundleName: string;
    settings: any;
    /**
     * @constructs UserSettingsStore
     * @extends Observable
     * @memberOf! module:core
     */
    constructor(settings: any);
    /**
     * Save part's user settings.
     * @method
     * @async-debounce throttle=100
     * @param {Object} args
     * @param {String} args.area area name
     * @param {String} args.region region name
     * @param {String} args.part part name
     * @param {Object} args.bundle settings object
     */
    save: (args: UserSettings.EventArgs) => void;
    /**
     * Save part's user settings.
     * @param {Object} args
     * @param {String} args.area
     * @param {String} args.region
     * @param {String} args.part
     * @param {Object} args.bundle
     */
    protected _save(args: UserSettings.EventArgs): void;
    /**
     * Return user settings for part-in-region-in-area
     * @param {Object} args
     * @param {String} args.area Area name
     * @param {String} args.region Region name
     * @param {String} args.part Part name
     * @returns {*}
     */
    load(args: UserSettings.EventArgs): any;
    protected _getKey(area: string, region: string, part: string, scope: UserSettings.Scope): string;
    /**
     * Remove user settings of all parts.
     */
    clearAll(): void;
}
/**
 * @callback ModuleInitializer
 * @param {Application} app Application
 * @param {Object} options Module options
 * */
export interface IAppModule {
    initialize?: (app: Application) => void;
    handlers?: lang.Map<Function>;
}
export interface AppModuleFactoryFn {
    (app: Application, options?: any): void | IAppModule;
}
export declare function createModule(factoryFn: AppModuleFactoryFn): void;
export declare function createModule(factoryFn: AppModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}): void;
export declare function createModule(factoryFn: AppModuleFactoryFn, module: any): void;
export declare function createModule(factoryFn: AppModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}, module: any): void;
export declare function createModule(moduleName: string, factoryFn: AppModuleFactoryFn): void;
export declare function createModule(moduleName: string, factoryFn: AppModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}): void;
export declare function createModule(moduleName: string, factoryFn: AppModuleFactoryFn, module: any): void;
export declare function createModule(moduleName: string, factoryFn: AppModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}, module: any): void;
/**
 * @callback AreaModuleInitializer
 * @param {Application} app Application
 * @param {Area} area
 * @param {Object} options Module options
 */
export interface AppAreaModuleFactoryFn {
    (app: Application, area: composition.Area, options?: Object): any;
}
export declare function createAreaModule(factoryFn: AppAreaModuleFactoryFn): void;
export declare function createAreaModule(factoryFn: AppAreaModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}): void;
export declare function createAreaModule(factoryFn: AppAreaModuleFactoryFn, module: any): void;
export declare function createAreaModule(factoryFn: AppAreaModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}, module: any): void;
export declare function createAreaModule(areaName: string, factoryFn: AppAreaModuleFactoryFn): void;
export declare function createAreaModule(areaName: string, factoryFn: AppAreaModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}): void;
export declare function createAreaModule(areaName: string, factoryFn: AppAreaModuleFactoryFn, module: any): void;
export declare function createAreaModule(areaName: string, factoryFn: AppAreaModuleFactoryFn, options: {
    modulesRegistry: lang.Map<AppModuleFactoryFn>;
}, module: any): void;
export interface ApplyStateOptions {
    start?: boolean;
    disablePushState?: boolean;
    fullSwitch?: boolean;
    doNotTouchAppState?: boolean;
}
export declare class AppStateManager extends lang.Observable implements IAppStateManager {
    /**
     * Defaults for AppStateManager
     * @type {Object}
     * @property {String} defaultArea - name of default area in url ("index")
     * @property {String} defaultState - name of default state in url ("default")
     * @property {String} displayRoot - name of UI root url segment ("display")
     * @property {String} goRoot - name of "go" url segment ("go")
     */
    static defaultOptions: AppStateManager.Options;
    options: AppStateManager.Options;
    app: Application;
    started: boolean;
    root: string;
    traceSource: diagnostics.TraceSource;
    private _pushing;
    private _startTimer;
    private _reRoutePattern;
    /**
     * Base title for the application (will the used for all areas/states)
     * @observable-property {String}
     */
    baseTitle: lang.ObservableProperty<string>;
    /**
     * @constructs AppStateManager
     * @extends Observable
     * @memberOf module:core
     * @article [Navigation](docs:navigation)
     * @param {Application} app
     * @param {Object} [options]
     */
    constructor(app: Application, options?: AppStateManager.Options);
    protected _getClientUrl(state: HistoryState): string;
    protected _parseRoute(route: string, ignoreUnknown: boolean): AppState;
    protected removeRootFromUrl(url: string): string;
    /**
     * This method can be overridden for processing url custom commands.
     * A custom command is a term in url "/term"..
     * The method can return:
     * 	- a `AppState` object to push (the simplest case is `{}` - go to app root).
     *  - a Promise of `AppState` object
     *  - empty (null/undefined) - do nothing, implementation should make pushState on its own
     * @param {String} cmdName
     * @param {String} route
     * @param {Object} [cmdArgs]
     * @returns {AppState}
     */
    protected onCommand(cmdName: string, route: string, cmdArgs?: any): lang.Promisable<AppState>;
    /**
     * This method can be overridden for processing custom url.
     * Returning an empty object means "go to root".
     * Custom app logic can override and process any custom url. In this case it should return null.
     * @param {String} route
     * @returns {AppState}
     */
    protected onUnknownRoute(route: string): AppState;
    start(): void;
    getStateTitle(state: AppState): string;
    getPageTitle(state: AppState): string;
    /**
     * Update current browser url, serializing specified state into the url
     * @param {AppState} state Current application state
     * @param {Object} options
     * @param {Boolean} [options.replaceState] Pass true if you want to replace the current url with the new one without adding record into browser history.
     * @param {Boolean} [options.freezeUrl] do not change URL while pushing the new AppState
     */
    pushState(state: AppState, options?: {
        replaceState?: boolean;
        freezeUrl?: boolean;
    }): void;
    /**
     * Replace current browser url, serializing specified state into the url
     * @param {AppState} state Current application state
     */
    replaceState(state: AppState): void;
    /**
     * Switch current state of application without deactivating current area state if it's same as the new one.
     * @param {AppState} state A new application state
     * @returns {Promise}
     */
    applyState(state: AppState): Promise<void>;
    /**
     * Switch current state of application. Also change the browser URL.
     * It makes 'full switch', i.e. deactivate current area state even if it's the same in the new state.
     * @param {AppState} state A new application state
     * @returns {Promise}
     */
    switchState(state: AppState): Promise<void>;
    /**
     * @param state
     * @param options
     * @returns {JQueryPromise}
     * @private
     */
    private _applyState(state, options);
    protected _execUrlCommand(appState: AppState, options: ApplyStateOptions): Promise<void>;
    private _applyAppState(state, options);
    getAreaUrl(areaName: string): string;
    getAreaStateUrl(areaName: string, stateName: string): string;
    getStateUrl(state: AppState): string;
    /**
     * Return current application state
     * @returns {AppState}
     */
    getCurrentState(): AppState;
    getPreviousState(): AppState;
}
export declare namespace AppStateManager {
    interface Options {
        defaultArea: string;
        defaultState: string;
        displayRoot: string;
        goRoot: string;
        execRoot: string;
    }
}
export declare class Application implements IApplication {
    static defaultOptions: Application.Options;
    static current: Application;
    config: XConfig;
    options: Application.Options;
    /**
     * Domain model of Application.
     * @type {IDomainModel} */
    model: IDomainModel;
    /**
     * Data Facade
     * @type {DataFacade} */
    dataFacade: IDataFacade;
    rootElement: HTMLElement;
    $rootElement: JQuery;
    initContainerElement: JQuery;
    /**
     * Global publish/subscriber.
     * @type {EventPublisher} */
    eventPublisher: events.EventPublisher;
    /**
     * Manager all areas.
     * @type {AreaManager} */
    areaManager: composition.AreaManager;
    /**
     * Manage application state via URL.
     * @type {AppStateManager} */
    stateManager: AppStateManager;
    /**
     * Store of parts settings.
     * @type {UserSettingsStore} */
    userSettingsStore: UserSettingsStore;
    sysMenu: SystemMenu;
    /**
     * @constructs Application
     * @memberOf module:core
     * @param {XConfig} config XConfig object placed on the page on the server
     * @param {Object} [options]
     * @param {String|Function} [options.template] Template of the application page for client-side rendering
     * @param {Boolean} options.ignoreModules If specified then Application won't use modules registry on its initialization
     * @param {Object} options.modulesRegistry
     */
    constructor(config: XConfig, options?: Application.Options);
    protected createComponents(): void;
    /** @deprecated use Application.State */
    static States: typeof Application.State;
    /** @deprecated use Application.State */
    states: typeof Application.State;
    preinitialize(): void;
    /**
     * Initialization state. It happens after all modules initialized.
     * @return {Promise} If implementation returns a promise then next stage (post-initialization) will be postponed till it resolved.
     */
    initialize(): void | Promise<void>;
    /**
     * Post-initialization stage (latest). It happens after AppStateManager applied current state from url.
     * Publishes pub/sub "app.start" event.
     */
    postinitialize(): void;
    /**
     * @param {Object} [options]
     * @param {boolean} [options.connected] Subscribe on DataFacade's 'update' event
     * @returns {UnitOfWork}
     */
    createUnitOfWork(options?: UnitOfWork.Options): UnitOfWork;
    /**
     * Initialize the application: initialize areas and its regions from markup, initialize modules, start AppStateManager
     * @param {jQuery|HTMLElement} rootElement
     */
    run(rootElement?: JQuery | HTMLElement): Promise<void>;
    protected _run(rootElement?: JQuery | HTMLElement): Promise<void>;
    protected _run1(rootElement?: JQuery | HTMLElement): Promise<void>;
    protected appendGridHeightTester(): void;
    createDataFacade(): IDataFacade | Promise<IDataFacade>;
    /**
     * @param {String} state
     * @param {Error} [error]
     * @private
     */
    protected _onStateChanged(state: Application.State, error?: any): void;
    /**
     * Create Area objects from DOM markup and add them to the areaManager.
     * @private
     */
    protected _initAreas(): void;
    /**
     * Initialize app modules registered via `core.createAppModule` and `core.createAreaModule` methods.
     * @private
     * @param modules - List of modules
     */
    protected _initModules(modules?: string[]): void;
    /**
     * Register part factory.
     * @param {String} partName Name of the part. It will be used to create part via createPart method.
     * @param {Function} creator
     */
    registerPart(partName: string, creator: (options?: any) => IPart): void;
    /**
 * Create a part instance.
 * @param {String} partName Name of the part
 * @param {Object} [options] Options to pass to part's constructor
 * @returns {Part}
 */
    createPart(partName: string, options?: any): IPart;
    /**
     * Creates a dialog
     * @param {Object} [options] Options to pass to dialog's constructor
     * @returns {Dialog}
     */
    createDialog(options: any): IDialog;
    /**
     * Return all registered parts names.
     * @returns {String[]}
     */
    getAllPartNames(): string[];
    /**
     * Check whather the specified part was registered.
     * @param {string} partName Name of the part
     * @return {boolean}
     */
    isPartRegistered(partName: string): boolean;
    updateAppVersion(ver: string): void;
    protected onAppStateChanged(args: Application.StateChangedArgs): void;
    protected onLoading(): void;
    protected onUnloading(): void;
    protected onInitialized(): void;
    protected onStarted(): void;
    protected onFailed(error: Error): void;
    onUnknownArea(areaName: string): composition.Area;
}
export declare namespace Application {
    interface Options {
        template?: HandlebarsTemplateDelegate;
        modulesRegistry?: lang.Map<AppModuleFactoryFn>;
        ignoreModules?: boolean;
        dataFacade?: IDataFacade | lang.Promise<IDataFacade>;
        EventPublisher?: {
            new (): events.EventPublisher;
        };
        AreaManager?: {
            new (app: IApplication, options?: composition.AreaManager.Options): composition.AreaManager;
        };
        StateManager?: {
            new (app: IApplication, options?: AppStateManager.Options): AppStateManager;
        };
        UserSettingsStore?: {
            new (settings): UserSettingsStore;
        };
    }
    const State: {
        loading: "loading";
        initialized: "initialized";
        started: "started";
        failed: "failed";
        unloading: "unloading";
    };
    type State = (typeof State)[keyof typeof State];
    interface StateChangedArgs {
        state: Application.State;
        error?: Error;
    }
}
/**
 * Register a part factory.
 * @param {String} partName Part name
 * @param {Function} creator Function to be called when part creation requested (see core.createPart)
 */
export declare function registerPart(partName: string, creator: (options?: any) => IPart): void;
/**
 * Create an instance of part
 * @param {String} partName name of the part
 * @param {Object} [options] parameters of part's constructor
 * @returns {Part}
 */
export declare function createPart(partName: string, options?: any): IPart;
/**
 * Remove part registration (created with `registerPart`.
 * @param {string} partName Part name
 * @return {boolean} true if a part factory was really removed
 */
export declare function removePart(partName: string): boolean;
