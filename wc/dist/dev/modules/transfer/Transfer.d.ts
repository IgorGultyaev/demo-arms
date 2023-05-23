/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import * as interop from "lib/interop/.interop";
import Deferred = core.lang.Deferred;
import Promise = core.lang.Promise;
export declare enum TransferStatus {
    None = 0,
    StartingUp = 1,
    Running = 2,
    Aborting = 3,
    Aborted = 4,
    Failed = 5,
    Suspended = 6,
    Completed = 7,
    StreamingData = 8,
}
export declare enum ImportSuspendedCause {
    Unknown = 0,
    UnresolvedObjects = 1,
    VersionConflict = 2,
    ErrorOnProcessObject = 3,
}
export declare enum VersionConflictAction {
    Abort = 0,
    Overwrite = 1,
    Skip = 2,
    OverwriteAll = 3,
    SkipAll = 4,
    OverwriteSameType = 5,
    SkipSameType = 6,
}
export declare enum UnresolvedObjectsAction {
    Abort = 0,
    Skip = 1,
}
export declare enum ObjectProcessErrorAction {
    Abort = 0,
    Retry = 1,
    Skip = 2,
    SkipAll = 3,
}
export interface TransferImportSuspendedState {
    suspendedCause: ImportSuspendedCause;
}
export interface TransferImportSuspendedStateVersionConflict extends TransferImportSuspendedState {
    importingObject: interop.DomainObjectData;
    existingObject: interop.DomainObjectData;
}
export interface TransferImportSuspendedStateUnresolvedObject extends TransferImportSuspendedState {
    unresolvedObjects: Array<interop.DomainObjectData>;
}
export interface TransferImportSuspendedStateErrorOnProcessObject extends TransferImportSuspendedState {
    violatingObject: interop.DomainObjectData;
    errorMessage: string;
}
export interface TransferOperationState {
    status: TransferStatus;
    timeStamp: Date;
    progressPercent: number;
    message: string;
    errorMessage: string;
    exportSuspendedResult: Object;
    importSuspendedResult: TransferImportSuspendedStateVersionConflict | TransferImportSuspendedStateUnresolvedObject | TransferImportSuspendedStateErrorOnProcessObject;
}
export interface TransferOperationStatusResult {
    lastState: TransferOperationState;
    intermediateStates?: TransferOperationState[];
}
export interface TransferOperationStartResult {
    opId: string;
}
export interface TransferOperationListResult {
    operations: {
        opId: string;
        type: string;
        isCompleted: boolean;
    }[];
}
export declare class TransferClientBase extends core.lang.Observable {
    static Events: {
        "started": string;
        "suspended": string;
        "disposed": string;
    };
    dataFacade: interop.IDataFacade;
    eventPublisher: core.IEventPublisher;
    opId: string;
    status: core.lang.ObservableProperty<TransferStatus>;
    statusTitle: core.lang.ObservableProperty<string>;
    isInBackground: core.lang.ObservableProperty<boolean>;
    nextSince: Date;
    urls: {
        baseUrl: string;
        start: string;
        getstatus: string;
        resume: string;
        abort: string;
    };
    eventPrefix: string;
    pollingTimeout: number;
    history: Array<TransferOperationState>;
    type: string;
    protected _disposed: boolean;
    private _timerPoll;
    private _getStatusThis;
    private _bgNotificationDeferred;
    constructor(app: core.IApplication);
    protected _publishProcess(): void;
    protected _updateTitle(): void;
    connect(opId: string): Promise<TransferOperationStatusResult>;
    protected _start(params: any): Promise<TransferOperationStartResult>;
    protected _onStarted(opId: string): void;
    protected _requestStatus(opId: string, params?: any): Promise<TransferOperationStatusResult>;
    protected _getStatus(all?: boolean): Promise<TransferOperationStatusResult>;
    fetchStatus(all?: boolean): Promise<TransferOperationStatusResult>;
    scheduleGetStatus(): void;
    protected onGetStatusSuccess(result: TransferOperationStatusResult, allHistory?: boolean): void;
    protected onInteropFail(error: Error, msg: string): void;
    resume(action: any): void;
    abort(): Promise<void>;
    protected onRunning(): void;
    protected onAborting(): void;
    protected onSuspended(result: TransferOperationStatusResult): void;
    protected onFinished(state: TransferOperationState): void;
    protected onAborted(): void;
    protected onFailed(message: string): void;
    protected onCompleted(state: TransferOperationState): void;
    dispose(): void;
    protected _onUnknownError(error: string): void;
    terminate(error: any): void;
}
export declare class ExportClient extends TransferClientBase {
    type: string;
    constructor(app: core.IApplication);
    startExport(scenario: string): Promise<TransferOperationStartResult>;
    protected onCompleted(state: TransferOperationState): void;
    downloadExport(suppressEvents?: boolean): Promise<any>;
}
export declare class ImportClient extends TransferClientBase {
    type: string;
    options: ImportClient.Options;
    constructor(app: core.IApplication, options?: ImportClient.Options);
    startImport(resourceId: string, scenario?: string): Promise<TransferOperationStartResult>;
    protected onSuspended(result: TransferOperationStatusResult): void;
    protected onVersionConflict(state: TransferOperationState): void;
    protected onErrorOnProcessObject(state: TransferOperationState): void;
    protected onUnresolvedObjects(state: TransferOperationState): void;
}
export declare namespace ImportClient {
    interface Options {
        suspendedActions?: {
            versionConflict: VersionConflictAction;
            unresolvedObjects: UnresolvedObjectsAction;
            error: ObjectProcessErrorAction;
        };
    }
}
export interface TransferScenario {
    name: string;
    title: string;
}
export interface TransferSysMenuOptions {
    "export"?: Array<TransferScenario>;
    "import"?: boolean | Array<TransferScenario> | TransferScenario;
}
export declare class Transfer extends core.lang.Observable {
    /**
     * Singleton
     */
    static Instance: Transfer;
    static defaultOptions: Transfer.Options;
    options: Transfer.Options;
    app: core.Application;
    runningOps: Array<TransferClientBase>;
    runningOpsCount: core.lang.ObservableProperty<number>;
    cmdExport: core.commands.ICommand;
    cmdOpenExport: core.commands.ICommand;
    cmdOpenImport: core.commands.ICommand;
    cmdActivateOp: core.commands.ICommand;
    sysMenuItems: Array<any>;
    private _operationsDefer;
    constructor(app: core.Application, options?: Transfer.Options);
    getRunningOperation(type: string, isInBackground?: boolean): Promise<TransferClientBase>;
    getOperations(isInBackground?: boolean): Promise<TransferClientBase[]>;
    startExport(scenario: string): ExportClient;
    protected _openOpPart(stateName: string, options?: any): void;
    openExport(options?: any): void;
    openImport(options?: any): void;
    protected onOpStarted(client: TransferClientBase): void;
    protected onOpFinished(client: TransferClientBase): void;
    initialize(): void;
    protected _loadOperations(isInBackground?: boolean): Deferred<TransferClientBase[]>;
    createSysMenu(options: TransferSysMenuOptions): void;
    getSysMenuItems(): {
        items: any[];
    };
}
export declare namespace Transfer {
    interface Options {
        updateSysMenu?: boolean;
        fetchOpsOnInit?: boolean;
        fetchOpsOnLogin?: boolean;
    }
}
