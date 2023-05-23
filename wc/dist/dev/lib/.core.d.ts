import lang = require("lib/core.lang");
import ui = require("lib/ui/.ui");
import domain = require("lib/domain/.domain");
import { IDataFacade } from "./interop/.interop";
import { Region } from "./core.composition";

export import ValueType = domain.metadata.ValueType;

export interface IPartRegistry {
	createPart(partName: string, options?: Object): ui.IPart;
	createDialog(options: any): ui.IDialog;
}
export interface AppEvent {
	eventName: string;
	args: any;
	processed: boolean;
}

export interface AppEventArgs {
	/**
	 * Callback to be called if there're no any subscribers.
	 */
	defaultAction?: () => void;

	initialize?: () => void;

	[key: string]: any;
}

export interface IEventPublisher {
	/**
	 * Subscribe the handler on the event.
	 * @param {String} eventName Name of app event
	 * @param {Function} handler Callback which will be called on the event publishing. Callback should expect argument of type AppEvent.
	 * @returns {Object} Disposable object to unsubscribe
	 */
	subscribe(eventName: string, handler: (event: AppEvent) => void): lang.IDisposable;

	/**
	 * Publish event with its data.
	 * The event processing will be postponed if start method wasn't called.
	 * @param {String} eventName Name of app event
	 * @param {Object|SystemEvent} [eventArgs] Data for the event. Subscribed callbacks get it via AppEvent.args field.
	 * @param {Function} [eventArgs.defaultAction] Callback to be called if there're no any subscribers.
	 * @param {Function} [eventArgs.initialize]
	 */
	publish(eventName: string, eventArgs?: AppEventArgs): void;
}

export interface IAppStateManager {
	pushState (state: AppState, options?: {replaceState?: boolean; freezeUrl?: boolean}): void;
	replaceState (state: AppState): void;
	applyState (state: AppState): lang.Promise<void>;
	getCurrentState (): AppState;
	getPreviousState (): AppState;
	getAreaUrl (areaName: string): string;
	getAreaStateUrl (areaName: string, stateName: string): string;
	getStateUrl (state: AppState): string;
}

export interface IUserSettingsStore {
	save(args: IUserSettings.EventArgs): void;
	load(args: IUserSettings.EventArgs): any;
}

export interface IUserSettings extends lang.IEventful {
	/**
	 * Name of settings to override part's name. It allows keeping a part's instances as different settings.
	 */
	name?: string;
	scope?: IUserSettings.Scope;
	suppressEvents: boolean;
	/**
	 * Change a property. Triggers "change" event with all values.
	 * @param {String} name
	 * @param value
	 */
	set(name: string, value: any): void;
	/**
	 * Bind the instance to a property of an Observable object.
	 * On the property change we'll fire "change" event with all values.
	 * @param owner Owner of the property
	 * @param propName Property name
	 */
	bindToProp(owner: lang.Observable, propName: string): void;
	/**
	 * Attach a nested part settings.
	 * @param {String} name name of nested part, will be used as setting name
	 * @param {UserSettings} nested
	 */
	attach(name: string, nested: IUserSettings): void;
	/**
	 * Attach settings store to the nested region.
	 * @param {String} name name of nested region, will be used as setting name
	 * @param {Region} region
	 */
	attachToRegion(name: string, region: Region): void;
	/**
	 * Set initial values (restore).
	 * @param json
	 */
	initialize(json: Object): void;
	/**
	 *
	 * @param props
	 */
	applyOverrides(props: IUserSettings.PropsMap): void;
	/**
	 * Get all values.
	 */
	getValues(): Object;
	/**
	 * Get a value.
	 * @param {String} name
	 */
	get(name: string): any;

	//bindAll(owner: lang.Observable): void;
}

export namespace IUserSettings {
	export interface Options {
		props?: PropsMap;
		name?: string;
		scope?: Scope;
	}

	export interface PropsMap {
		[name: string]: boolean | PropsMap;
	}

	/**
	 * Scopes for user settings:
	 * 	* global - the key for userSetting is part name
	 * 	* local - the key for userSettings is combination of area, region and part name (default)
	 * 	* any other values are for extensibility (we'll have to handle them in your UserSettingsStore implementation)
	 */
	export type Scope = "local" | "global" | string;

	export interface EventArgs {
		part: string;
		region?: string;
		area?: string;
		scope?: Scope;
		bundle?: any;
	}
}

export interface IApplication extends IPartRegistry {
	eventPublisher: IEventPublisher;
	stateManager: IAppStateManager;
	userSettingsStore: IUserSettingsStore;
	model: domain.IDomainModel;
	config: XConfig;
	createUnitOfWork(options?: {connected?: boolean}): domain.UnitOfWork;
	dataFacade: IDataFacade;
	areaManager: IAreaManager;
}

export interface IAreaManager {
	activateArea (areaName: string): lang.Promisable<boolean>;
	activateState (areaName: string, stateName: string|AreaStateActivateOptions, options?: ActivateOptions): lang.Promise<void>;
}

export interface INavigationService {
	navigate (options: INavigationService.NavigateOptions): lang.Promise<ui.IPart>;
	openModal (options: INavigationService.OpenModalOptions): lang.Promise<ui.IPart>;
	close (result?: any, options?: {keepAlive: boolean}): lang.Promise<void>;
	leave (result?: any): lang.Promise<void>;
	replace (options: INavigationService.NavigateOptions, closeOptions?: {keepAlive: boolean}): lang.Promise<ui.IPart>;
}
export namespace INavigationService {
	export interface NavigateOptionsBase {
		/**
		 * Part name or instance to activate
		 */
		part?: string | ui.IPart;
		/**
		 * Part's options if `part` is string. The object will be passed into part's constructor.
		 */
		partOptions?: any;
		/**
		 * Optional callback to be call on returning back
		 * @param result
		 */
		onReturn?: (result: any) => void;
	}
	export interface NavigateOptions extends NavigateOptionsBase {
		openInDialog?: boolean;
		/**
		 * Options for Region.activatePart
		 */
		activateOptions?: PartActivateOptions;
		/**
		 * Options for the constructor of Dialog
		 */
		dialogOptions?: any;
	}
	export interface OpenModalOptions extends NavigateOptionsBase {
		/**
		 * Options for the constructor of Dialog
		 */
		dialogOptions?: any;
	}
}
/** */
export interface UnloadOptions {
	reason?: UnloadReason;
	keepAlive?: boolean;		// unload but do not remove part from region
	keepStandalone?: boolean;	// remove part from region but keep its instance and do not dispose
	suppressUI?: boolean;		// suppress hiding animation
	activityContext?: any;		// internals
}
export type UnloadReason = "unload" | "suspend" | "close" | "leave" | "rerender" | "windowUnload" | "dispose";

export interface CanUnloadResult {
	canUnload: boolean;
	reasonToStay?: string;
}

/**
 * Describes a Region state as part of AppState.
 */
export interface RegionState {
	part?: string | ui.IPart;
	_partUid?: string;
	title?: string;
	partOptions?: any;
}

/**
 * Describes an Area state as part of AppState.
 */
export interface AreaStateOptions {
	/**
	 * Name of area state
	 */
	name: string;
	/**
	 * Title of area state
	 */
	title?: string;
	/**
	 * Flag for default state of area
	 */
	isDefault?: boolean;
}

export interface AreaStateActivateOptions {
	name: string;
	regionState: RegionState;
/*
	title?: string;
	part?: string | ui.IPart;
	partOptions?: any;
*/
}
/**
 * AppState describes the application state in terms of current area, area state, part in area's navigable region and its options.
 * AppState can be serialized into URL and restored from URL.
 */
export interface AppState {
	/**
	 * Area name
	 */
	area?: string;
	/**
	 * Area state
	 */
	areaState?: AreaStateOptions;
	/**
	 * Region state (part + part options)
	 */
	regionState?: RegionState;
	/**
	 * Whether currently in region the default part for areaState is activated
	 */
	isDefaultPart?: boolean;
	/**
	 * Original url
	 */
	url?: string;
	/**
	 * Normalized uri (without app root)
	 */
	route?: string;
	/**
	 * Internal stuff for restoring appstate on page reload.
	 */
	_reloadState?: any;
	/**
	 * Custom command (url like /exec/cmd)
	 */
	command?: {
		name: string,
		args?: any
	};
}

export interface ActivateOptions {
	//state?: AppState;
	/**
	 * True if state activation is happening in context of applying the AppState (i.e. AppStateManager.pushState method should not be called).
	 */
	disablePushState?: boolean;
	/**
	 * If `true` current areaState will be deactivated even if it's specified in stateName.
	 */
	fullSwitch?: boolean;
	/**
	 * Do not touch (push or change) AppState.
	 */
	doNotTouchAppState?: boolean;
	/**
	 * Keep part's instance alive after it's unloaded.
	 */
	keepAlive?: boolean;
	/**
	 * Do 'replaceState' instead of 'pushState' (makes sense it disablePushState is false).
	 */
	replaceState?: boolean;
	/**
	 * Do not change URL while pushing the new AppState.
	 */
	freezeUrl?: boolean;
}

export interface IPartOverrides {
	queryUnload?: () => boolean;
	unload?: () => void;
	show?: (element: HTMLElement) => void;
	hide?: (element: HTMLElement) => void;
}

export interface PartActivateOptions extends ActivateOptions {
	/**
	 * Json-object with methods: queryUnload, unload (Part API). They will be used instead of part's ones
	 */
	overrides?: IPartOverrides;
	activity?: any; //Activity;
	isNested?: boolean;
}

export interface PartStateChangeArgs {
	part: any;
	_partUid?: string;
	title: string;
	partOptions?: any;
}

/**
 * Тип pub-sub события "app.statechange"
 */
export interface AppStateChangeEvent extends AppEvent {
	args: AppStateChangeEventArgs;
}

export interface AppStateChangeEventArgs {
	state: AppState;
	url: string;
}
