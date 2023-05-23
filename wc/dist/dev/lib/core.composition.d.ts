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
 * @type module:"core.diagnostics"
 */
import * as diagnostics from "lib/core.diagnostics";
import * as Part from "lib/ui/Part";
import "vendor/history";
import "lib/ui/WaitingModal";
import * as core from ".core";
import { IPart, IStatefulPart, IDialog } from "lib/ui/.ui";
import { SafeHtml } from "lib/formatters";
import Promise = lang.Promise;
import UnloadOptions = core.UnloadOptions;
import CanUnloadResult = core.CanUnloadResult;
import UnloadReason = core.UnloadReason;
/**
 * Region behaviors - a map of names to behavior object. Each value is a `RegionBehavior` object.
 * @type {Object}
 */
export interface IRegionBehavior {
    attach(region: Region, domElement: JQuery | HTMLElement, options?: Object): void;
    detach?(): void;
}
export declare let regionBehaviors: lang.Map<IRegionBehavior>;
/**
 * @typedef {Object} CompositionDebugOptions
 * @property {String|Object} regionMenu Attach `debug` behavior to region which adds a debug menu to upper right corner of region's element.
 */
/**
 * Debug Options
 */
export interface CompositionDebugOptions {
    regionMenu?: boolean | Object;
}
export interface AreaStateSpec {
    name: string;
    title?: string;
    hidden?: boolean;
    isDefault?: boolean;
    transient?: boolean;
}
export declare class AreaState extends lang.Observable {
    app: core.IApplication;
    name: string;
    title: string;
    map: lang.Map<IPart | string>;
    regionManager: RegionManager;
    activateOptions: core.ActivateOptions;
    transient: boolean;
    /**
     * @constructs AreaState
     * @extends Observable
     * @memberOf module:"core.composition"
     * @param {Application} app
     * @param {object} stateSpec json object with AreaState specification
     * @param {string} stateSpec.name
     * @param {string} [stateSpec.title]
     * @param {boolean} [stateSpec.hidden]
     * @param map
     * @param {RegionManager} regionManager
     */
    constructor(app: core.IApplication, stateSpec: AreaStateSpec, map: lang.Map<IPart | string>, regionManager: RegionManager);
    /**
     * @observable-property {boolean}
     */
    hidden: lang.ObservableProperty<boolean>;
    /**
     * Activate this state.
     * @param {RegionState} regionState
     * @param {object} [options]
     * @param {boolean} options.disablePushState
     * @param {AppState} options.state
     * @returns {Promise}
     */
    activate(regionState: core.RegionState, options: core.ActivateOptions): lang.Promise<void>;
    protected _getPartName(part: any): string;
    /**
     * Implementation of state activation.
     * @param {RegionState} regionState
     * @param {object} [options]
     * @param {boolean} options.disablePushState
     * @param {AppState} options.state
     * @returns {Promise}
     */
    private _doActivate(regionState, options);
    protected _pushAreaState(): void;
    protected _onActivated(options?: core.ActivateOptions): void;
    /**
     * Deactivate current state. That means unloading all parts except specified in switchableParts.
     * @param {Object} switchableParts "Region to part" map with parts which should not be unloaded
     * @returns {Promise}
     */
    deactivate(switchableParts: lang.Map<IPart | string>): lang.Promise<void>;
    protected _doDeactivate(switchableParts: lang.Map<IPart | string>): lang.Promise<void>;
    protected _onDeactivated(): void;
    resetRegion(regionName: string): void;
}
export declare class Area extends lang.Observable {
    app: core.IApplication;
    name: string;
    title: string | SafeHtml;
    transient: boolean;
    options: Area.Options;
    domElement: HTMLElement;
    $domElement: JQuery;
    states: lang.Map<AreaState>;
    currentState: AreaState;
    initialized: boolean;
    regionManager: RegionManager;
    areaManager: AreaManager;
    extensions: lang.Map<any>;
    protected _lastAppState: core.AppState;
    private _isActive;
    private _defaultStateName;
    private _pendingState;
    private _activeActivation;
    /**
     * @constructs Area
     * @extends Observable
     * @param {Application} app
     * @param {string} name
     * @param {object} options
     * @param {string} [options.title]
     * @param {boolean} [options.hidden]
     */
    constructor(app: core.IApplication, name: string, options?: Area.Options);
    /**
     * True for hidden area. Not just hidden from UI (as all areas excepts active) but hidden from all navigation menus.
     * @observable-property {boolean}
     */
    hidden: lang.ObservableProperty<boolean>;
    /**
     * True for currently active (visible) area (all others are hidden)
     * @observable-property {boolean}
     */
    isActive: lang.ObservableProperty<boolean>;
    getAppState(regionState?: core.RegionState, regionName?: string): core.AppState;
    /**
     * Initialize area. Search for regions in supplied domElement and add them into regionManager.
     * @param {JQuery|HTMLElement} domElement
     */
    initialize(domElement: JQuery | HTMLElement): void;
    /**
     * Add a new state into the area.
     * @param {object|String} stateSpec - name of the state or json object with its specification
     * @param {string} stateSpec.name
     * @param {string} stateSpec.title
     * @param {boolean} stateSpec.isDefault
     * @param {object|string} map An object which keys are regions names and values are parts (names or instances), or part name for navigable region
     * @param {object} [activateOptions]
     * @returns {Area}
     */
    addState(stateSpec: string | AreaStateSpec, map: lang.Map<IPart | string> | string, activateOptions?: core.ActivateOptions): Area;
    getState(stateName: string): AreaState;
    /**
     * Activates specified state. That means activating part for each region
     * which were set up before with addState/setRegionStates methods.
     * @param {string} state
     * @param {object} [options]
     * @param {AppState} [options.state] AppState object
     * @param {boolean} [options.disablePushState] True if state activating is happening in context of applying App state (i.e. AppStateManager.pushState method should not be called)
     * @param {boolean} [options.fullSwitch=false] If true current areaState will be deactivated even if it's specified in stateName
     * @return {Promise}
     */
    activateState(state: string | core.AreaStateActivateOptions, options?: core.ActivateOptions): lang.Promise<void>;
    protected _tearDownActivation(fail?: boolean): void;
    setDefaultState(stateName: string): void;
    /**
     * Returns name of area default state. It could be a state explicitly specified via `setDefaultState` or the only state of the area.
     * @return {String} Name of the area state
     */
    getDefaultState(): string;
    protected _createDefaultState(): AreaState;
    suspend(): void;
    resume(): lang.Promisable<void>;
    /**
     * Shows current area.
     * @deprecated use areaManager.activateState/activateArea
     */
    show(): lang.Promisable<void>;
    close(): void;
    protected _onActivating(): lang.Promisable<void>;
    protected _onShown(): void;
    protected _hide(): void;
    /**
     * @deprecated use areaManager.activateState/activateArea
     */
    hide(): void;
    applyCurrentState(): void;
    ensureInitialized(): void;
}
export declare namespace Area {
    interface Options {
        title?: string | SafeHtml;
        hidden?: boolean;
        debug?: CompositionDebugOptions;
    }
}
export declare class AreaManager extends lang.Observable implements core.IAreaManager {
    protected _areas: Array<Area>;
    protected _currentArea: Area;
    protected _defaultArea: string;
    app: core.IApplication;
    areasContainer: JQuery;
    areaCssClass: string;
    options: AreaManager.Options;
    /**
     * @constructs AreaManager
     * @extends Observable
     * @memberOf module:"core.composition"
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: core.IApplication, options?: AreaManager.Options);
    /**
     * Returns area instance with the specified name.
     * @param {String} name Area name
     * @returns {Area}
     */
    getArea(name: string): Area;
    /**
     * Returns all areas
     * @returns {Array<Area>}
     */
    getAreas(): Array<Area>;
    /**
     * Create and initialize a new Area.
     * @param {String} name Area name. It should be unique.
     * @param {JQuery|HTMLElement} [domElement] Root HTML element for the area. If not specified, it will be created (as div) under application root element.
     * @param {Object} [options] Area parameters, see Area.constructor.
     * @return {Area}
     */
    createArea(name: string, domElement?: JQuery | HTMLElement, options?: Area.Options): Area;
    protected getAreaOptions(options?: Area.Options): Area.Options;
    protected _onAreaActivated(area: Area): void;
    protected _onAreaRequestActivation(sender: Area): void;
    protected _onAreaRequestClose(area: Area): void;
    /**
     * Remove specified area. This will unloads all its regions with their parts.
     * @param {String|Area} area An area instance or name
     */
    removeArea(area: string | Area): void;
    /**
     * Set an area as default. Default area is an area to switch application root ("/") is mapped.
     * @param {String|Area} area
     */
    setDefaultArea(area: string | Area): void;
    /**
     * Returns currently active area.
     * @returns {Area|null}
     */
    getActiveArea(): Area;
    /**
     * Hide currently active area and show specified one.
     * For the new area the method restores previous area state or activates a default one.
     * @param {string} areaName Area name to show
     * @returns {boolean} true if Area activated, or false - Area is unknown
     */
    activateArea(areaName: string): lang.Promisable<boolean>;
    /**
     * Hide currently active area and show specified one.
     * @param {String} areaName Area name to show
     * @param {String|AreaStateActivateOptions} areaState Area's state name to activate
     * @param {ActivateOptions} [options]
     */
    activateState(areaName: string, areaState: string | core.AreaStateActivateOptions, options?: core.ActivateOptions): lang.Promise<void>;
    protected _doActivateArea(newArea: Area, applyingState?: boolean): lang.Promisable<void>;
}
export declare namespace AreaManager {
    interface Options {
        debug?: CompositionDebugOptions;
    }
}
/**
 * @typedef {Object} AreaManagerOptions
 * @property {CompositionDebugOptions} debug
 */
/**
 * @event RegionManager#"region.statechange"
 * @property {RegionManager} sender
 * @property {object} args
 * @property {string} args.regionName
 * @property {Region} args.region
 * @property {object} args.regionState
 * @property {Part} args.regionState.part
 * @property {string} args.regionState._partUid part's id
 * @property {object} [args.regionState.partOptions] part's state
 * @property {string} [args.regionState.title] part's title
 * @property {object} args.options
 * @property {boolean} [args.options.replaceState]
 */
export declare class RegionManager extends lang.Observable {
    partRegistry: core.IPartRegistry;
    regions: lang.Map<Region>;
    area: Area;
    options: RegionManager.Options;
    /**
     * @constructs RegionManager
     * @extends Observable
     * @memberOf module:"core.composition"
     * @param partRegistry
     * @param {Object} [options]
     * @param {CompositionDebugOptions} [options.debug]
     */
    constructor(partRegistry: core.IPartRegistry, options?: RegionManager.Options);
    /**
     * Return a region by its name.
     * @param {String} name
     * @returns {Region}
     */
    getRegion(name: string): Region;
    /**
     * Add region
     * @param {Region} region
     * @returns {Region}
     */
    addRegion(region: Region): Region;
    /**
     * Unload all regions.
     * @param {Object} [options]
     */
    unloadAll(options?: UnloadOptions): void;
    /**
     * Create a new Region
     * @param {String} name
     * @param {RegionOptions} options
     * @returns {Region}
     */
    createRegion(name: string, options?: Region.Options): Region;
    /**
     * Find and return a navigable Region.
     * @returns {Region}
     */
    getNavigableRegion(): Region;
    /**
     * Remove region.
     * @param {string|Region} region
     */
    removeRegion(region: string | Region): boolean;
}
/**
 * @typedef {Object} RegionManagerOptions
 * @property {CompositionDebugOptions} debug
 */
export declare namespace RegionManager {
    interface Options {
        debug?: CompositionDebugOptions;
    }
}
export declare class PartHelper {
    part: IPart | IStatefulPart;
    rendered: boolean;
    disposed: boolean;
    activity: Activity;
    region: Region;
    partDomSelector: JQuery;
    partDomElement: HTMLElement;
    traceSource: diagnostics.TraceSource;
    keepAlive: boolean;
    freezeUrl: boolean;
    keepStandalone: boolean;
    effects: {
        show?: (el: HTMLElement) => void;
        hide?: (el: HTMLElement) => void;
    };
    overrides: core.IPartOverrides;
    isNested: boolean;
    hiddenInitially: boolean;
    partStateChangeCallback: (part: PartHelper, state: core.PartStateChangeArgs, options?: {
        replaceState?: boolean;
    }) => void;
    partUserSettingsChangeCallback: (part: IPart, bundle: Object) => void;
    /**
     * @constructs PartHelper
     * @description "Part inside region" wrapper class. For internal use only.
     * @param {Part} part
     * @param {object} options
     * @param {TraceSource} options.traceSource
     * @param {object} options.effects
     * @param {object} options.overrides
     * @param {boolean} options.isNested
     * @param {boolean} options.keepAlive
     * @param {boolean} options.freezeUrl
     */
    constructor(part: IPart, options: PartHelper.Options);
    protected _initializeContainer(regionDomElement: JQuery | HTMLElement): void;
    render(regionDomElement: JQuery | HTMLElement): lang.Promisable<any>;
    /**
     *
     * @param options
     * @param {String} options.reason
     * @param {Object} options.activityContext
     * @return {Object|jQuery.Deferred}
     */
    canUnload(options: UnloadOptions): lang.Promisable<CanUnloadResult>;
    protected _canUnloadResult(reasonToStay: string): CanUnloadResult;
    unload(options: UnloadOptions): lang.Promisable<void>;
    protected _unload2(options: UnloadOptions): lang.Promisable<void>;
    protected _show(): lang.Promisable<any>;
    protected _hide(): lang.Promisable<any>;
    dispose(options?: UnloadOptions): void;
    subscribeOnStateChange(callback: (part: PartHelper, state: core.PartStateChangeArgs, options?: Region.StateChangeOptions) => void): void;
    unsubscribeOnStateChange(): void;
    onPartStateChanged(state: core.PartStateChangeArgs, options?: {
        replaceState?: boolean;
    }): void;
    subscribeOnUserSettingsChange(callback: (part: IPart, bundle: Object) => void, context: any): string;
    unsubscribeOnUserSettingsChange(): void;
    onPartUserSettingsChanged(sender: any, bundle: Object): void;
    protected _throwIfDisposed(): void;
}
export declare namespace PartHelper {
    interface Options {
        isNested: boolean;
        hiddenInitially: boolean;
        keepAlive: boolean;
        freezeUrl: boolean;
        effects: {
            show?: (el: HTMLElement) => void;
            hide?: (el: HTMLElement) => void;
        };
        overrides: core.IPartOverrides;
        traceSource: diagnostics.TraceSource;
    }
}
export interface ITransition {
    sourceStateId: string;
    sourcePart: IPart;
    target: IPart;
    callback: (v: any) => void;
    freezeUrl?: boolean;
}
export declare class Activity extends lang.Observable {
    private _region;
    _transitions: Array<ITransition>;
    /**
     * @constructs Activity
     * @extends Observable
     * @memberOf module:"core.composition"
     * @param {Region} region
     */
    constructor(region: Region);
    /**
     * Suspend active part and activate the specified part in context of the activity.
     * @param {Part} part A part to activate
     * @param {Object} options
     * @param {Function} [options.onReturn] Callback to be called on return
     * @param {String} [options.sourceStateId]
     * @param {Part} [options.sourcePart]
     * @param {Object} [options.activateOptions] options for Region.activatePart
     * @returns {Promise}
     */
    forward(part: IPart, options: Activity.ForwardOptions): Promise<IPart>;
    /**
     * Close active part and activate previous one
     * @param {*} result
     * @param {object} [options]
     * @param {boolean} options.keepAlive Do to destroy current part (will be passed to `Region.closeActivePart`)
     * @param {boolean} options.disableResume Do to resume previous part (only unload current part)
     * @returns {Promise}
     */
    backward(result: any, options?: {
        keepAlive?: boolean;
        disableResume?: boolean;
    }): Promise<void>;
    onPartRemoved(removedPart: IPart): void;
    dispose(): void;
}
export declare namespace Activity {
    interface ForwardOptions {
        sourceStateId?: string;
        sourcePart?: IPart;
        onReturn?: (v: any) => void;
        /**
         * Options for Region.activatePart
         */
        activateOptions?: core.PartActivateOptions;
    }
}
export declare class NavigationService extends lang.Observable implements core.INavigationService {
    region: Region;
    partRegistry: core.IPartRegistry;
    _currentActivity: Activity;
    /**
     * @constructs NavigationService
     * @extends Observable
     * @memberOf module:"core.composition"
     * @param {Region} region Host region
     * @param {Object} partRegistry
     */
    constructor(region: Region, partRegistry: core.IPartRegistry);
    /**
     * Suspend active part and switch to another.
     * @param options - JSON-object:
     * @param {Object|String} options.part Part instance or part name
     * @param {Object} [options.partOptions] Options that will be passed into part's constructor (if part is Stirng)
     * @param {Function} [options.onReturn] Callback to be called on return
     * @param {Object} [options.activateOptions] options for Region.activatePart
     * @return {Promise} Promise of Part
     */
    navigate(options: NavigationService.NavigateOptions): Promise<IPart>;
    /**
     * Opens a dialog and renders the part inside it.
     * @param {Object} options
     * @param {Part|String} options.part Part instance or part name
     * @param {Object} [options.partOptions] Options that will be passed into part's constructor (if part is Stirng)
     * @param {Function} [options.onReturn] Callback to be called on return
     * @param {Object} [options.dialogOptions] options for `Dialog` constructor.
     * @return {Promise} Deferred of Part
     */
    openModal(options: NavigationService.OpenModalOptions): Promise<IPart>;
    protected doOpenModal(part: IPart, options: NavigationService.OpenModalOptions): Promise<IPart>;
    protected _getPartInstance(options: NavigationService.NavigateOptions): IPart;
    protected _applyHostContext(part: IPart, options: NavigationService.NavigateOptions, host: string): NavigationService.NavigateOptions;
    /**
     * Creates a dialog
     * @param {Object} [options] Options to pass to dialog's constructor
     * @returns {Dialog}
     */
    createDialog(options: any): IDialog;
    /**
     * Close and destroy current part and return to previous suspended part.
     * @param {*} [result] Any object which will be passed into the callback specified in `onReturn` option of `navigate` method.
     * @param {object} [options]
     * @param {boolean} [options.keepAlive] if `true` then it's equivalent to `leave`
     */
    close(result?: any, options?: {
        keepAlive: boolean;
    }): Promise<void>;
    /**
     * Unload current part (but not destroy) and return to previous suspended part.
     * @param {*} [result] Any object which will be passed into the callback specified in `onReturn` option of `navigate` method.
     */
    leave(result?: any): Promise<void>;
    protected _back(result?: any, options?: {
        keepAlive: boolean;
    }): Promise<void>;
    /**
     * Close (and optionally destroy) current part and navigate to the new one.
     * @param {NavigationService.NavigateOptions} options See `navigate` method
     * @param {object} [closeOptions]
     * @param {boolean} [closeOptions.keepAlive]
     * @returns {Promise<IPart>}
     */
    replace(options: NavigationService.NavigateOptions, closeOptions?: {
        keepAlive: boolean;
    }): Promise<IPart>;
}
export declare namespace NavigationService {
    interface NavigateOptions extends Activity.ForwardOptions, core.INavigationService.NavigateOptions {
    }
    interface OpenModalOptions extends core.INavigationService.OpenModalOptions {
    }
}
/**
 * @typedef {object} UnloadOptions
 * @property {string} reason
 */
export declare class Region extends Part {
    static defaultOptions: Region.Options;
    name: string;
    navigable: boolean;
    isInBackground: boolean;
    options: Region.Options;
    navigationService: NavigationService;
    traceSource: diagnostics.TraceSource;
    effects: {};
    _activePartHelper: PartHelper;
    _navigableAutoSet: boolean;
    private _parts;
    private _activeActivation;
    private _domElement;
    /**
     * @constructs Region
     * @extends Part
     * @memberOf module:"core.composition"
     * @fires Region#statechange
     * @param {string} name
     * @param {object} options
     */
    constructor(name: string, options?: Region.Options);
    /**
     * Render region, i.e. render current part if it exists.
     * In spite of Part.render Region.render allow several sequential calls (without unload).
     * @param {JQuery|HTMLElement} domElement
     */
    render(domElement?: JQuery | HTMLElement): lang.Promisable<void>;
    rerender(): lang.Promisable<void>;
    /**
     * Unload Region with active part
     * @param {UnloadOptions} options
     * @returns {JQueryPromise<void>|void}
     */
    unload(options: UnloadOptions): void;
    /**
     * Unload active part while the region is going to background (as part of inactive area).
     */
    suspend(): void;
    /**
     * Restore (render) the part which was active when suspend was called.
     */
    resume(): void;
    protected _lookupHelper(part: IPart): PartHelper;
    protected _arrangeHelper(part: IPart, options?: core.PartActivateOptions): PartHelper;
    /**
     * Try ti unload part with a reason ("unload" by default). Calls part's 'queryUnload' then ''unload
     * @param {PartHelper} partHelper
     * @param {string} [reason]  A reason for unload: "unload", "suspend", "close", "leave".
     * @return {Promise}
     * @private
     */
    protected _tryToUnloadPart(partHelper: PartHelper, reason?: UnloadReason): Promise<CanUnloadResult | void>;
    /**
     * Unload specified part and optionally remove and dispose it.
     * @param {PartHelper} partHelper
     * @param {object} options
     * @param {string} [options.reason]  A reason for unload: "unload", "suspend", "close", "leave".
     * @param {boolean} [options.keepAlive=false]  Only unload part and do not remove and dispose it
     * @param {boolean} [options.keepStandalone] Only unload part and remove it, but do not dispose (deferred dispose)
     * @returns {Promise}
     * @private
     */
    protected _unloadPart(partHelper: PartHelper, options: UnloadOptions): Promise<void>;
    protected _disposeActivity(partHelper: PartHelper, disposeOptions: UnloadOptions): void;
    protected _removePart(partHelper: PartHelper): void;
    /**
     * Part's 'statechange' event handler. Also called directly on a part rendering completion.
     * @param {PartHelper} partHelper
     * @param {object} partState Part's state - an arbitrary object
     * @param {object} options
     * @param {boolean} [options.replaceState] replace current AppState with the new one
     * @param {boolean} [options.freezeUrl] do not change URL while pushing the new AppState
     * @private
     */
    protected _onPartStateChanged(partHelper: PartHelper, partState: core.PartStateChangeArgs, options?: Region.StateChangeOptions): void;
    /**
     * Handler to be called when part's userSettings changed.
     * @param {string} part part
     * @param {Object} bundle settings' values
     * @private
     */
    protected _onPartUserSettingsChanged(part: IPart, bundle: Object): void;
    protected _onPartAdded(partHelper: PartHelper): void;
    protected _onPartRemoved(partHelper: PartHelper): void;
    protected onPartAdded(partHelper: PartHelper): void;
    protected onPartRemoved(partHelper: PartHelper): void;
    protected onPartRendered(partHelper: PartHelper): void;
    protected onPartUnloaded(partHelper: PartHelper): void;
    protected _triggerPartEvent(eventName: string, partHelper: PartHelper): void;
    /**
     * Activate part which was suspended earlier.
     * @param {Part} part Part to activate
     * @param {AppState} appState restored AppState on the moment when the part was suspended
     * @returns {Promise}
     */
    resumePreviousPart(part: IPart, appState: core.AppState): Promise<void>;
    suspendActivePart(activity: Activity): Promise<void>;
    /**
     * Unload and destroy (optionally) currently active part.
     * @param {object} [options]
     * @param {boolean} options.keepAlive Do not destroy active part (only unload)
     * @returns {Promise}
     */
    closeActivePart(options?: {
        keepAlive?: boolean;
    }): Promise<void>;
    queryUnloadActivePart(options: UnloadOptions): Promise<void>;
    unloadActivePart(options: UnloadOptions): Promise<void>;
    protected _throwIfWasNotRendered(): void;
    protected _tearDownActivation(): void;
    /**
     * Accept part and make it active in the region.
     * Currently active part will be unloaded, if it allows that.
     * A part can reject unloading by returning a message (string) or rejected promise of message from its 'unload' method.
     * In this case the method returns that message and doesn't change the active part.
     *
     * @param {Part} part Part instance to activate (the part can either exist or not exist in the region)
     * @param {object} [options] Options for the part being activated
     * @param {object} [options.overrides] Json-object with methods: queryUnload, unload (Part API). They will be used instead of part's ones
     * @param {boolean} [options.keepAlive] Keep part's instance alive after it's unloaded
     * @param {AppState} [options.state] AppState state object to pass into Part.changeState if the part is activated already
     * @param {boolean} [options.disablePushState]
     * @param {boolean} [options.freezeUrl=false] do not change URL while pushing the new AppState
     * @param {boolean} [options.doNotTouchAppState=false] do not touch (push or change) AppState
     * @param {Activity} [options.activity]
     * @param {boolean} [options.isNested]
     */
    activatePart(part: IPart, options?: core.PartActivateOptions): Promise<void>;
    protected _activatePart2(part: IPart, options?: core.PartActivateOptions): Promise<void>;
    protected _activatePart3(partHelper: PartHelper, options?: core.PartActivateOptions): Promise<void>;
    protected _reportInitialPartState(partHelper: PartHelper, options?: core.PartActivateOptions): void;
    /**
     * Return existing (but not always active) part by its name.
     * @param {string} partName
     * @returns {object}
     */
    getPart(partName: string): IPart;
    /**
     * Return existing (but not always active) part by its id.
     * @param {string} partUid Part's unique identifier.
     * @returns {*}
     */
    getPartByUid(partUid: string): IPart;
    /**
     * Returns currently active part in the region.
     * @returns {Part}
     */
    getActivePart(): IPart;
    /**
     * Check if part exists inside the region.
     * @param {string|object} part Part instance or part name to check
     * @return {boolean}
     */
    isPartActive(part: string | IPart): boolean;
    resetState(): void;
    /**
     * Attach a behavior to current Region.
     * Behavior can be an object with `attach` method or
     * a string with name of global behavior from `"module:core.composition".regionBehaviors` map.
     * @param {string|RegionBehavior} behavior
     * @param {*} options Any options to behavior
     */
    addBehavior(behavior: string | IRegionBehavior, options?: any): void;
    getPartsHistory(includeSource: boolean): Array<IPart>;
    getDebugInfo(): Object;
}
/** */
export declare namespace Region {
    interface Options extends Part.Options {
        navigable?: boolean;
        hiddenInitially?: boolean;
        traceSourceName?: string;
    }
    interface StateChangeArgs {
        region?: Region;
        regionName?: string;
        regionState?: core.RegionState;
        appState?: core.AppState;
        options?: StateChangeOptions;
    }
    interface StateChangeOptions {
        replaceState?: boolean;
        freezeUrl?: boolean;
        removePrevious?: boolean;
    }
}
