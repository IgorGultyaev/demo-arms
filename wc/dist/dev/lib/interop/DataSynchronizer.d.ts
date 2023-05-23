/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import * as interop from "lib/interop/.interop";
import DataStoreBase = require("lib/data/DataStoreBase");
import { Deferred } from "lib/core.lang";
declare class DataSynchronizer extends lang.Observable {
    static defaultOptions: {
        defaultInterval: number;
        maxInterval: number;
    };
    private cancellationRequested;
    private _store;
    private _scheduled;
    private _pingOnlyScheduled;
    private _attempts;
    private _pendingSync;
    private maxInterval;
    private defaultInterval;
    private _interval;
    private _intervalStep;
    private _saveAction;
    private _pingAction;
    private _pingFn;
    private _pingOnlyFn;
    private _syncFn;
    /**
     * @observable-property {DataSynchronizer.State}
     */
    state: lang.ObservableProperty<DataSynchronizer.State>;
    /**
     * @constructs DataSynchronizer
     * @extends Observable
     * @param {DataStoreBase} dataStore
     * @param {{save:Function, ping: Function}} options
     */
    constructor(dataStore: DataStoreBase, options: DataSynchronizer.Options);
    isSynchronizing(): boolean;
    isScheduledOrSynchronizing(): boolean;
    protected _clearStats(): void;
    setIdle(): void;
    /**
     * Schedules synchronization.
     * @param {Boolean} pingOnly if true then first call will be 'ping' and only if it succeeded then continue to save
     * @returns {boolean} true if a task was schedule otherwise false
     */
    scheduleSync(pingOnly: boolean): boolean;
    protected _ping(): void;
    protected _sync(): void;
    protected _onSaveDone(objects: interop.DomainObjectData[], response: any, isSuccess: boolean): void;
    protected _onSyncSuccess(objects: interop.DomainObjectData[], response: any, suppressEvent?: boolean): void;
    protected _onSyncError(failures: DataSynchronizer.SyncFailture[]): void;
    /**
     * Cancel all activity (scheduled timers and synchronization in progress)
     */
    cancel(): void;
    protected _cancelIfRequested(): boolean;
    schedulePing(): void;
    protected _pingOnly(): void;
}
declare namespace DataSynchronizer {
    interface Options {
        save: (objects: interop.DomainObjectData[], options?: interop.SaveOptions) => lang.Promise<any>;
        ping: () => lang.Promise<PingResult>;
    }
    interface PingResult {
        networkOnline: boolean;
        serverOnline: boolean;
    }
    const State: {
        Idle: "idle";
        Synchronizing: "synchronizing";
    };
    type State = (typeof State)[keyof typeof State];
    interface SyncSuccessEventArgs {
        changes: interop.DomainObjectData[];
        response: any;
        suppressEvent?: boolean;
    }
    interface SyncFailture {
        objects: interop.DomainObjectData[];
        error: interop.ExceptionData;
        result: interop.SaveResponse;
    }
    interface SyncFailtureEventArgs {
        failures: SyncFailture[];
        defer: Deferred<void>;
    }
}
export = DataSynchronizer;
