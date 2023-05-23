/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import lang = require("lib/core.lang");
import { ISockets, SocketSendOptions, SocketSubscriptionOptions } from ".interop";
import Promise = lang.Promise;
import IDisposable = lang.IDisposable;
export declare type SubscriptionsDefinition = {
    [name: string]: Array<SubscriptionDefinition>;
};
export declare type SubscriptionDefinition = {
    /**
     * The handler that will be raised when the server sent data.
     * @param data
     */
    handler: (data: any) => void;
    /**
     * Additional action to unsubscribe.
     */
    unsubscribe: () => void;
};
/**
 * Subscriptions to the channel.
 */
export declare class ChanelSubscription {
    private _subscription;
    constructor();
    /**
     * Subscriptions to private channels.
     * @returns {SubscriptionsDefinition}
     */
    private(): SubscriptionsDefinition;
    /**
     * Subscriptions to broadcast channels.
     * @returns {SubscriptionsDefinition}
     */
    broadcasted(): SubscriptionsDefinition;
    /**
     * Clear all subscription data.
     * @constructor
     */
    Reset(): void;
}
/**
 * Base class for working with sockets.
 * Additionally encapsulates the deferred sending messages to the server when a connection is established.
 */
export declare abstract class BaseSockets implements ISockets {
    /**
     * Event name that will be triggered by eventPublisher, when connection is established.
     * @type {string}
     */
    static CONNECTED_EVENT: string;
    /**
     * Event name that will be triggered by eventPublisher, when connection is lost.
     * @type {string}
     */
    static DISCONNECTED_EVENT: string;
    /**
     * Event name that will be triggered by eventPublisher, when client receives an http error when trying to connect.
     * @type {string}
     */
    static HTTP_ERROR_EVENT: string;
    /** @inheritdoc */
    abstract disconnect(): Promise<void>;
    /** @inheritdoc */
    abstract isConnected(): boolean;
    /**
     * Private and broadcasted subscription list.
     */
    protected _subscription: ChanelSubscription;
    /**
     * OnConnected event callbacks.
     */
    private _onConnectedCallbacks;
    /**
     * Specific connection process implementation.
     * @returns {Promise<void>}
     */
    protected abstract _connect(): Promise<void>;
    /**
     * Specific sending data process implementation.
     * @param {string} destination Where the data will be sent.
     * @param {SocketSendOptions} options Configuration.
     * @returns {Promise<void>}
     */
    protected abstract _send(destination: string, options?: SocketSendOptions): Promise<void>;
    /**
     * Specific requesting data process implementation.
     * @param {string} destination Where the data will be sent.
     * @param {SocketSendOptions} options Configuration.
     * @returns {Promise<T>}
     */
    protected abstract _request<T>(destination: string, options?: SocketSendOptions): Promise<T>;
    /**
     * Specific subscribe process implementation.
     * @param {string} channel Channel.
     * @param {SocketSubscriptionOptions} options Configuration.
     * @param {(data: any) => void} handler The handler that will be raised when the server sent data.
     */
    protected abstract _subscribe(channel: string, options: SocketSubscriptionOptions, handler: (data: any) => void): void;
    /**
     * Application instance.
     */
    protected app: core.IApplication;
    /**
     * Constructor.
     * @param {IApplication} app Application instance.
     */
    constructor(app: core.IApplication);
    /** @inheritdoc */
    connect(): Promise<void>;
    /** @inheritdoc */
    send(destination: string, options?: SocketSendOptions): Promise<void>;
    /** @inheritdoc */
    request<T>(destination: string, options?: SocketSendOptions): Promise<T>;
    /**
     * Add callback to handle connection event.
     * @param {() => void} method Callback to handle connection event.
     */
    onConnected(method: () => void): void;
    /** @inheritdoc */
    subscribe(channel: string, options: SocketSubscriptionOptions, handler: (data: any) => void): IDisposable;
    /**
     * Unsubscribe.
     * @param {string} channel Channel.
     * @param {boolean} isBroadcasted Is broadcast channel?
     * @param {(data: any) => void} handler Subscription handler instance.
     */
    private _unsubscribe(channel, isBroadcasted, handler);
}
export interface IHttpErrorEventArgs {
    status: number;
    requestUrl: string;
    requestType: string;
    client: BaseSockets;
    ignoreError: boolean;
}
