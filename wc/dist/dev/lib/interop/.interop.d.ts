import { lang, IEventPublisher, SystemEvent } from "core";
import { AppEvent } from ".core";
import { Violation } from "lib/validation";
import {AppCacheState, LoadRule, SaveTarget} from "lib/interop/.interop.types";
import Promise = lang.Promise;
import IDisposable = lang.IDisposable;

export interface Identity {
	type: string;
	id: string;
}

export interface ObjectIdentity extends Identity {
	/**
	 * @deprecated to be removed in next version [TODO]
	 */
	objectID?: string;
}

export interface DomainObjectData {
	id?: string;
	__metadata?: {
		type: string;
		ts?: number;
		isNew?: boolean;
		isRemoved?: boolean;
	};
	__original?: lang.Map<any>;
	__aux?: lang.Map<any>;
	[key: string]: any;
}

export interface SavedObjectData extends DomainObjectData {
	__newValues?: {
		id?: string;
		__incrementTs?: boolean;
		__aux?: lang.Map<any>;
		[key: string]: any
	};
}

export interface ExceptionData {
	// from server:
	$isException?: boolean;
	$className?: string;
	$parentClasses?: string[];
	message: string;
	containsUserDescription?: boolean;
	// the same as containsUserDescription
	hasUserDescription?: boolean;

	// from client:
	httpStatus?: number;
	serverOffline?: boolean;
}

export interface InteropError extends Error {
	action?: string;
	serverError?: any;
	serverResponse?: any;
	hasUserDescription?: boolean;
	$className?: string;
	serverOffline?: boolean;
	httpStatus?: number;
}
export interface BusinessLogicException extends InteropError {
	violations?: Violation[];
}
export interface OptimisticConcurrencyException extends InteropError {
	//$className: "XOptimisticConcurrencyException";
	obsoleteObjects?: ObjectIdentity[];
	deletedObjects?: ObjectIdentity[];
}

export interface AjaxSettings extends JQueryAjaxSettings {
}

export interface AjaxOptions {
	/** do not publish pub/sub event on an error */
	suppressEventOnError?: boolean;
	/** do not publish pub/sub event after successful operation */
	suppressEventOnSuccess?: boolean;
	/** do not make auto login in case of a 401 response */
	suppressAutoLogin?: boolean;
	/** do not add timestamp into query string for GET-request */
	suppressCacheBreakthrough?: boolean;
	/** do not publish pub/sub event for process */
	suppressProcessEvent?: boolean;
	/** data of notification event (kind=process) to override default */
	processEvent?: any;
	/**
	 * The request can be sent either by GET or by POST.
	 * HTTP method will be chosen depending on the length of the request.
	 */
	supportsGetPost?: boolean;

	contentType?: string;
	fileDownload?: boolean;
	opId?: string;
	caller?: any;
	/**
	 * Option for DataFacadeSmart: return local not synchronized objects when loading locally
	 */
	forceLoadUnsync?: boolean;

	[key: string]: any;
}

export interface LoadQuerySource {
	/** Name of the source (e.g. EntityType or DataSource name) */
	type: string;
	/** objectId when loading a single object */
	id?: string;
	/** name of property of a single object */
	propName?: string;
}

export interface LoadQueryParams {
	[key: string]: any;
	$opId?: string;
	$hints?: string|string[];
	$expand?: string;
	// GetObjects specific
	$filter?: any;
	$orderby?: string;
	$skip?: number;
	$top?: number;
	$fetchTotal?: boolean;
}

export interface LoadQuerySpec {
	/** name of source to load from, or its specification */
	source?: LoadQuerySource | string | LoadQuerySource[];
	/** entityType name of loading objects */
	type?: string;
	/** array of property names or property chains */
	preloads?: string[] | string;
	/** query parameters */
	params?: LoadQueryParams;
	/** part of URI to non-standard loading, e.g. "_plain" or "_export" */
	route?: string;
}

export interface LoadQuery extends LoadQuerySpec {
	/** name of source to load from, or its specification */
	source: LoadQuerySource | string | LoadQuerySource[];
}

export interface LoadResponse {
	result?: DomainObjectData[]|DomainObjectData|any;
	more?: DomainObjectData[];
	hints?: ResponseHints;
}
export interface ResponseHints {
	message?: string;
	source?: "client" | "server";
	error?: any;
	[key: string]: any;
}

export interface LoadPolicy {
	loadFirst: "local" | "remote";
	allowRemote: boolean;
	allowLocal: boolean;
	shouldCache: boolean;
	maxAge?: number;
}
export interface LoadPolicyRule {
	rule: LoadRule;
	maxAge?: number;
}
export interface LoadOptions extends AjaxOptions {
	fileDownload?: boolean;
	policy?: LoadPolicy | LoadRule;
}

export interface TreeNodeData {
	data: DomainObjectData|any;
	isLeaf?: boolean;
}

export interface TreeLoadResponse {
	result: TreeNodeData[];
}

export interface SaveResponse {
	error?: ExceptionData;
	newIds?: { type: string; id: string; newId: string; }[];
	originalObjects?: DomainObjectData[];
	updatedObjects?: DomainObjectData[];
	/**
	 * It's only synchronization results (saving objects with splitting onto groups)
	 */
	ids?: Identity[];
}

export type SaveInteropError = SaveResponse & InteropError;

export interface AggregateSaveResponse {
	results: SaveResponse[];
}

export interface SaveOptions extends AjaxOptions {
	/** flag for synchronization mode (just add special argument to query string) */
	sync?: boolean;
	/** hints for passing to the server */
	hints?: string[]|string;
	policy?: SavePolicy;
	/** Custom server controller action for precessing the request. */
	action?: string;
	/** Transaction name */
	tx?: string;
}

export interface SavePolicy {
	target?: SaveTarget;
	shouldCache?: boolean; // unused?
}

export interface SystemVersionChangedEvent extends AppEvent {
	args: SystemVersionChangedEventArgs;
}
export interface SystemVersionChangedEventArgs {
	oldVersion: string;
	newVersion: string;
}

export interface DataUpdateEventArgs {
	objects: SavedObjectData[];
	deletedObjects?: ObjectIdentity[];
	/**
	 * UnitOfWork instance which called DataFacade.save
	 */
	caller?: any;
	/**
	 * Reason of updating: "load" or "save".
	 * "load" means objects were changed by other client, "save" means objects were changed by this client
	 */
	reason?: string;
}

export interface CheckConnectionResult {
	networkOnline: boolean;
	serverOnline: boolean;
}

export interface IBackendInterop extends lang.IEventful {
	config: XConfig;

	beginBatch(): void;
	completeBatch(): void;
	normalizeUrl(url: string): string;
	ajax(ajaxSettings: AjaxSettings, options?: AjaxOptions): lang.Promise<any>;
	cancel(opId: string): void;
	load(query: LoadQuery, options?: LoadOptions): lang.Promise<any>;
	save(objects: DomainObjectData[], options?: SaveOptions): lang.Promise<any>;
	tryParseException(exceptionJson: ExceptionData): InteropError;
	handleError(jqXhr: JQueryXHR, textStatus: string): InteropError|any;
	checkConnection(httpMethod?: string): lang.Promise<CheckConnectionResult>;
	checkAppCache?(cb: (appCacheState: AppCacheState) => void): void;
}

export interface IDataFacade extends lang.IEventful {
	//TODO: нехорошо, но снаружи нужен к handleError и normalizeUrl
	_interop: IBackendInterop;

	load(query: LoadQuery, options?: LoadOptions): lang.Promise<LoadResponse>;
	save(data: DomainObjectData[], options?: SaveOptions): lang.Promise<SavedObjectData[]>;
	ajax(ajaxSettings: AjaxSettings|String|(() => AjaxSettings), options?: AjaxOptions): lang.Promise<any>;
	cancel(opId: string): lang.Promise<any>;
	beginBatch(): void;
	completeBatch(): void;
	sockets?: ISockets;

	// TODO: вынести все, связанное с pub/sub, в отдельный интерфейс
	eventPublisher: IEventPublisher;
	setEventPublisher(eventPublisher: IEventPublisher): void;
	createSaveErrorEvent(error: InteropError, options: SaveOptions, objects: DomainObjectData[]): SystemEvent;
}

export interface IDataSource {
	load(query?: LoadQuerySpec, options?: LoadOptions): lang.Promise<LoadResponse>;
	cancel?(opId: string): lang.Promise<void>;
	buildQuery?(querySpec: LoadQuerySpec): LoadQuery;
}

export interface ISockets {
	/**
	 * Request data from server.
	 *
	 * The Promise returned by this method resolves when the server indicates it has finished processing received data.
	 * When the promise resolves, the server has finished invoking the method.
	 * If the server method returns a result, it is produced as the result of resolving the Promise.
	 *
	 * @param {string} destination Where the data will be sent.
	 * @param {SocketSendOptions} options Send options.
	 * @returns {Promise<T>} A Promise that resolves with the result of the server call, or rejects with an error.
	 */
	request<T = any>(destination: string, options?: SocketSendOptions): Promise<T>;

	/**
	 * Send data to the server. Does not wait for a response from the receiver.
	 *
	 * The Promise returned by this method resolves when the client has sent the invocation to the server.
	 * The server may still be processing the invocation.
	 *
	 * @param {string} destination Where the data will be sent.
	 * @param {SocketSendOptions} options Send options.
	 * @returns {Promise<void>} A Promise that resolves when the invocation has been successfully sent, or rejects with an error.
	 */
	send(destination: string, options?: SocketSendOptions): Promise<void>;


	/**
	 * Registers a handler that will be invoked when the server sent data to specified destination.
	 *
	 * @param {string} channel Where the data will be received from.
	 * @param {SocketSubscriptionOptions} options Subscription options.
	 * @param {Function} handler The handler that will be raised when the server sent data.
	 * @returns {IDisposable} Call dispose() to unsubscribe.
	 */
	subscribe(channel: string, options: SocketSubscriptionOptions, handler: (data: any) => void): IDisposable;

	/**
	 * Connect to server.
	 *
	 * @returns {Promise<void>} A Promise that resolves when the connection has been established, or rejects with an error.
	 */
	connect(): Promise<void>;

	/**
	 * Disconnect from server.
	 *
	 * @returns {Promise<void>} A Promise that resolves when the connection has been lost, or rejects with an error.
	 */
	disconnect(): Promise<void>;

	/**
	 * Is client connected to server.
	 *
	 * @returns {boolean} True when client is connected to server, False - otherwise.
	 */
	isConnected(): boolean;
}

/**
 * Send options.
 */
export interface SocketSendOptions {
	/**
	 * The data that will be sent to server.
	 */
	data?: any;

	/**
	 * If true, then data will be sent immediately if there is an open connection or its sending will be delayed until the connection is opened.
	 * Otherwise - an attempt will be made to send data immediately.
	 */
	waitForConnection?: boolean;
}

export interface SocketSubscriptionOptions {
	/**
	 * Is it broadcast channel?
	 */
	broadcasted: boolean;
}
