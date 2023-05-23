/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import "vendor/jquery.fileDownload";
import { IBackendInterop, CheckConnectionResult, DomainObjectData, ExceptionData, AjaxSettings, AjaxOptions, LoadQuery, LoadOptions, SaveOptions, InteropError as IInteropError } from ".interop";
import lang = core.lang;
import Deferred = lang.Deferred;
import Promise = lang.Promise;
import { AppCacheState } from "lib/interop/.interop.types";
import { IDomainModel } from "lib/domain/.domain";
declare class BackendInterop extends lang.Observable implements IBackendInterop {
    config: XConfig;
    apiUrlPrefix: string;
    clientVersion: string;
    serverVersion: string;
    preventCaching: boolean;
    traceSource: core.diagnostics.TraceSource;
    protected batching: number;
    protected batch: BackendInterop.BatchItem[];
    private _operations;
    /**
     * @constructs BackendInterop
     * @extends Observable
     * @param {XConfig} xconfig
     */
    constructor(xconfig?: XConfig, model?: IDomainModel);
    HEADER_SERVER_VER: string;
    checkAppCache(cb: (appCacheState: AppCacheState) => void): void;
    filterServerResponse(jqXHR: JQueryXHR): void;
    protected _onAppOnline(e: any): void;
    protected _onAppOffline(e: any): void;
    beginBatch(): void;
    protected _addBatchItem(ajaxSettings: AjaxSettings, options: AjaxOptions): Promise<any>;
    completeBatch(): void;
    _executeAjax(ajaxSettings: AjaxSettings, defer: Deferred<any>, repeating?: boolean): Promise<any>;
    protected _executeAjaxSuccess(ajaxSettings: AjaxSettings, defer: Deferred<any>, repeating?: boolean): Promise<any>;
    ajax(ajaxSettings: AjaxSettings, options?: AjaxOptions): Promise<any>;
    protected _downloadFile(ajaxSettings: AjaxSettings, options: AjaxOptions, deferred: Deferred<void>): void;
    protected _fixAjaxSettings(settings: AjaxSettings, options: AjaxOptions): void;
    cancel(opId: string): void;
    normalizeUrl(url: string): string;
    protected createAjaxSettings(query: LoadQuery): AjaxSettings;
    /**
     * Load objects by query.
     * @param {Object} query query JSON-object
     * @param {Object|String} query.source name of source to load from, or its specification
     * @param {String} query.source.type Name of the source (e.g. EntityType or DataSource name)
     * @param {String} [query.source.id] objectId when loading a single object
     * @param {String} [query.source.propName] name of navigation property
     * @param {String} [query.type] entityType name of loading objects
     * @param {String} [query.preloads] array of property names or property chains
     * @param {Object} [query.params] query parameters
     * @param {Object} options
     * @param {String} [options.opId] cancellation operation id
     * @param {Boolean} [options.suppressAutoLogin=false]
     * @param {String} [options.contentType] MIME content type of the response (e.g. "application/vnd.ms-excel")
     * @param {Boolean} [options.fileDownload=false] Return result as a file, it makes the browser to open "Save as" dialog
     * @returns {Promise} object for async operation. Continuations arguments:
     *      - done: data - array of domain objects in json-form
     *      - fail: error - json object with parsed server error.
     */
    load(query: LoadQuery, options?: LoadOptions): Promise<any>;
    /**
     * Save objects.
     * @param objects domain objects in json-form (dto)
     * @param {Object} options
     * @param {Boolean} [options.sync=false] flag for synchronization mode (just add special argument to query string)
     * @param {String|Array} [options.hints] hints for passing to the server
     * @return {JQuery.promise} object for async operation of saving
    */
    save(objects: DomainObjectData[], options?: SaveOptions): Promise<any>;
    checkConnection(httpMethod?: string): Promise<CheckConnectionResult>;
    protected _isException(json: ExceptionData): boolean;
    handleError(jqXhr: JQueryXHR, textStatus: string): IInteropError | any;
    exceptionHandlers: lang.Map<(exceptionJson: ExceptionData) => IInteropError>;
    /**
     * Parses json-object of an error from the server.
     * @param {Object} exceptionJson Error from the server
     * @param {Boolean} exceptionJson.containsUserDescription
     * @param {String} exceptionJson.$className Server exception type name
     * @return {Error}
     */
    tryParseException(exceptionJson: ExceptionData): IInteropError;
}
declare namespace BackendInterop {
    type BatchItem = {
        ajaxSettings: AjaxSettings;
        options: AjaxOptions;
        defer: Deferred<any>;
    };
}
export = BackendInterop;
