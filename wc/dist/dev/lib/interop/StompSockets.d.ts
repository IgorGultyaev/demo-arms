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
import { BaseSockets, IHttpErrorEventArgs as BaseHttpErrorEventArgs } from "lib/interop/BaseSockets";
/**
 * Class for communicating with server via sockets using the STOMP protocol.
 */
declare class StompSockets extends BaseSockets {
    /**
     * Default options.
     */
    static defaultOptions: StompSockets.Options;
    /**
     * STOMP client.
     */
    private client;
    /**
     * Indicates that the connection was set at least once.
     * It is necessary to prevent a bunch of disconnection events.
     */
    private _wasConnected;
    /**
     * Indicates that is no need to not initiate reconnection in case of intentional disconnect.
     */
    private _shouldReconnect;
    /**
     * Options.
     */
    options: StompSockets.Options;
    /**
     * Constructor.
     * @param {StompSockets.Options} options Configuration.
     * @param {IApplication} app Application instance.
     */
    constructor(options: StompSockets.Options, app: core.IApplication);
    /** @inheritdoc */
    protected _connect(): Promise<void>;
    /**
     * Handling a successful connection.
     * @private
     */
    private _successConnect();
    /** @inheritdoc */
    disconnect(): Promise<void>;
    /** @inheritdoc */
    protected _send(destination: string, options?: SocketSendOptions): Promise<void>;
    /** @inheritdoc */
    protected _request<T>(destination: string, options?: SocketSendOptions): Promise<T>;
    /** @inheritdoc */
    protected _subscribe(channel: string, options: SocketSubscriptionOptions, handler: (data: any) => void): void;
    /**
     * Wrap the subscribing process.
     * @param {string} destination Destination.
     * @param {(data: any) => void} handler Data handler.
     * @param {(data: any) => void} onError Error handler.
     * @returns {any} stomp.Client.subscribe() method result.
     * @private
     */
    private _clientSubscribe(destination, handler, onError?);
    /**
     * Substitute special prefix for subscription destination.
     * @param {string} channel Channel.
     * @param {boolean} isBroadcasted Is broadcast channel.
     * @returns {string} Subscription destination.
     * @private
     */
    private _extractDestination(channel, isBroadcasted);
    /** @inheritdoc */
    isConnected(): boolean;
    /**
     * Substitute application prefix.
     * @param {string} destination Destination.
     * @returns {string} Prefixed destination.
     * @private
     */
    private _normalizeDestination(destination);
    /**
     * Substitute prefix to destination in compliance with the rules of separation by a slash.
     * @param {string} prefix Prefix.
     * @param {string} destination Destination.
     * @returns {string} Prefixed destination.
     * @private
     */
    private _prefixDestination(prefix, destination);
    /**
     * Get STOMP client over websoket.
     * @returns {stomp.Client} stomp.Client
     * @private
     */
    private _getClient();
    /**
     * Get full address of the endpoint responsible for connecting to sockets.
     * @param {IApplication} app Application instance.
     * @param {string} endpoint Relative endpoint path.
     * @returns {string} Full address of the endpoint.
     * @private
     */
    private _resolveEndpoint(app, endpoint);
}
declare namespace StompSockets {
    interface Options {
        /**
         * Handshake endpoint.
         */
        url?: string;
        /**
         * The prefix of all destinations that the server listens on.
         */
        applicationDestinationPrefix?: string;
        /**
         * The prefix of all destinations to which the server sends data as for exchanging 1 to 1.
         */
        queuePrefix?: string;
        /**
         * The prefix of all destinations to which the server sends data as for exchanging 1 to N.
         */
        topicPrefix?: string;
        /**
         * Destination prefix in cases of sending a messages to a specific user.
         */
        userPrefix?: string;
        /**
         * Pause in milliseconds between attempts to automatically connect to the server when the connection is lost.
         * @desc -1 - to disable automatic reconnection.
         */
        restoreConnectionTimeout?: number;
        /**
         * List of HTTP Status Codes that determining the need to cancel connection restoring.
         */
        stopReconnectOnHttpErrorCodes?: number[];
        /**
         * List of possible transport for communication with the server.
         * @example ["websocket", "xhr-polling", "iframe-xhr-polling"]
         */
        transports?: string[];
    }
    type IHttpErrorEventArgs = BaseHttpErrorEventArgs;
}
export = StompSockets;
