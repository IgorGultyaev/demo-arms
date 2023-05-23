/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import { SocketSendOptions, SocketSubscriptionOptions } from "lib/interop/.interop";
import * as core from "core";
import Promise = lang.Promise;
import { BaseSockets } from "lib/interop/BaseSockets";
/**
 * Class for communicating with server via sockets using the SignalR.
 */
declare class SignalRSockets extends BaseSockets {
    /**
     * Default options.
     */
    static defaultOptions: SignalRSockets.Options;
    /**
     * Connection to a SignalR Hub.
     */
    private readonly _connection;
    /**
     * SignalR logger.
     */
    private readonly _logger;
    /**
     * Indicates that is no need to not initiate reconnection in case of intentional disconnect.
     */
    private _shouldReconnect;
    /**
     * Options.
     */
    options: SignalRSockets.Options;
    /**
     * Constructor.
     * @param {SignalRSockets.Options} options Configuration.
     * @param {IApplication} app Application instance.
     */
    constructor(options: SignalRSockets.Options, app: core.IApplication);
    /** @inheritdoc */
    protected _connect(): Promise<void>;
    /** @inheritdoc */
    disconnect(): Promise<void>;
    /** @inheritdoc */
    protected _send(destination: string, options?: SocketSendOptions): Promise<void>;
    /** @inheritdoc */
    protected _request<T>(destination: string, options?: SocketSendOptions): Promise<T>;
    /** @inheritdoc */
    isConnected(): boolean;
    /**
     * Обработка сообщений в канале.
     * @param args
     * @private
     */
    private _processMessage(...args);
    /** @inheritdoc */
    protected _subscribe(channel: string, options: SocketSubscriptionOptions, handler: (data: any) => void): void;
    /**
     * Resolve hub url based on root url from xconfig.
     * @param {string} hubUrl Hub url path.
     * @returns {string} Hub url path based on root url from xconfig.
     * @private
     */
    private _resolveHubUrl(hubUrl);
}
declare namespace SignalRSockets {
    interface Options {
        /**
         * Path to hub.
         */
        url?: string;
        /**
         * Logging level.
         */
        logLevel?: SignalRSockets.LogLevel;
        /**
         * Pause in milliseconds between attempts to automatically connect to the server when the connection is lost.
         * @desc -1 - to disable automatic reconnection.
         */
        restoreConnectionTimeout?: number;
    }
    enum LogLevel {
        /** Log level for very low severity diagnostic messages. */
        Trace = 0,
        /** Log level for low severity diagnostic messages. */
        Debug = 1,
        /** Log level for informational diagnostic messages. */
        Information = 2,
        /** Log level for diagnostic messages that indicate a non-fatal problem. */
        Warning = 3,
        /** Log level for diagnostic messages that indicate a failure in the current operation. */
        Error = 4,
        /** Log level for diagnostic messages that indicate a failure that will terminate the entire application. */
        Critical = 5,
        /** The highest possible log level. Used when configuring logging to indicate that no log messages should be emitted. */
        None = 6,
    }
}
export = SignalRSockets;
