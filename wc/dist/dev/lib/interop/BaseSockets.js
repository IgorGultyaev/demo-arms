/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    exports.__esModule = true;
    /**
     * Subscriptions to the channel.
     */
    var ChanelSubscription = /** @class */ (function () {
        function ChanelSubscription() {
            this.Reset();
        }
        /**
         * Subscriptions to private channels.
         * @returns {SubscriptionsDefinition}
         */
        ChanelSubscription.prototype.private = function () {
            return this._subscription.private;
        };
        /**
         * Subscriptions to broadcast channels.
         * @returns {SubscriptionsDefinition}
         */
        ChanelSubscription.prototype.broadcasted = function () {
            return this._subscription.broadcasted;
        };
        /**
         * Clear all subscription data.
         * @constructor
         */
        ChanelSubscription.prototype.Reset = function () {
            this._subscription = { private: {}, broadcasted: {} };
        };
        return ChanelSubscription;
    }());
    exports.ChanelSubscription = ChanelSubscription;
    /**
     * Base class for working with sockets.
     * Additionally encapsulates the deferred sending messages to the server when a connection is established.
     */
    var BaseSockets = /** @class */ (function () {
        /**
         * Constructor.
         * @param {IApplication} app Application instance.
         */
        function BaseSockets(app) {
            /**
             * OnConnected event callbacks.
             */
            this._onConnectedCallbacks = [];
            this.app = app;
            this._subscription = new ChanelSubscription();
        }
        /** @inheritdoc */
        BaseSockets.prototype.connect = function () {
            var _this = this;
            var that = this;
            return this._connect().then(function () {
                // вызовем все колбэки на событии установки соединения
                while (that._onConnectedCallbacks && that._onConnectedCallbacks.length > 0) {
                    var callback = that._onConnectedCallbacks.shift();
                    if (callback) {
                        callback.apply(_this);
                    }
                }
            });
        };
        /** @inheritdoc */
        BaseSockets.prototype.send = function (destination, options) {
            var _this = this;
            options = options || {};
            if (options && options.waitForConnection && !this.isConnected()) {
                var d_1 = lang.Deferred();
                // если указано ждать соединение, то на событии подключения вызовем send()
                this.onConnected(function () {
                    _this.send(destination, options)
                        .then(function (value) { return d_1.resolve(); }, function (reason) { return d_1.reject(reason); });
                });
                return d_1.promise();
            }
            else {
                return this._send(destination, options);
            }
        };
        /** @inheritdoc */
        BaseSockets.prototype.request = function (destination, options) {
            var _this = this;
            options = options || {};
            if (options && options.waitForConnection && !this.isConnected()) {
                var d_2 = lang.Deferred();
                // если указано ждать соединение, то на событии подключения вызовем request()
                this.onConnected(function () {
                    _this.request(destination, options)
                        .then(function (value) { return d_2.resolve(value); }, function (reason) { return d_2.reject(reason); });
                });
                return d_2.promise();
            }
            else {
                return this._request(destination, options);
            }
        };
        /**
         * Add callback to handle connection event.
         * @param {() => void} method Callback to handle connection event.
         */
        BaseSockets.prototype.onConnected = function (method) {
            this._onConnectedCallbacks.push(method);
        };
        /** @inheritdoc */
        BaseSockets.prototype.subscribe = function (channel, options, handler) {
            var _this = this;
            if (!channel || !handler) {
                return {
                    dispose: function () { }
                };
            }
            channel = channel.toLowerCase();
            var subscription = options.broadcasted ? this._subscription.broadcasted() : this._subscription.private();
            if (!subscription[channel]) {
                subscription[channel] = [];
            }
            var toUnsubscribe = {
                dispose: function () { return _this._unsubscribe(channel, options.broadcasted, handler); }
            };
            // Preventing adding the same handler multiple times.
            if (lang.findIndex(subscription[channel], function (item) { return item.handler === handler; }) !== -1) {
                return toUnsubscribe;
            }
            subscription[channel].push({ handler: handler, unsubscribe: function () { } });
            // если сейчас нет соединения, то ничего здесь не делаем,
            // т.к. подписка автоматически восстановится при восстановлении соединения
            if (this.isConnected()) {
                this._subscribe(channel, options, handler);
            }
            return toUnsubscribe;
        };
        /**
         * Unsubscribe.
         * @param {string} channel Channel.
         * @param {boolean} isBroadcasted Is broadcast channel?
         * @param {(data: any) => void} handler Subscription handler instance.
         */
        BaseSockets.prototype._unsubscribe = function (channel, isBroadcasted, handler) {
            if (!channel) {
                return;
            }
            channel = channel.toLowerCase();
            var subscription = isBroadcasted ? this._subscription.broadcasted() : this._subscription.private();
            var handlers = subscription[channel];
            if (!handlers) {
                return;
            }
            if (handler) {
                var removeIdx = lang.findIndex(handlers, function (item) { return item.handler === handler; });
                if (removeIdx !== -1) {
                    handlers[removeIdx].unsubscribe();
                    handlers.splice(removeIdx, 1);
                    if (handlers.length === 0) {
                        delete subscription[channel];
                    }
                }
            }
            else {
                delete subscription[channel];
            }
        };
        /**
         * Event name that will be triggered by eventPublisher, when connection is established.
         * @type {string}
         */
        BaseSockets.CONNECTED_EVENT = "sockets.connected";
        /**
         * Event name that will be triggered by eventPublisher, when connection is lost.
         * @type {string}
         */
        BaseSockets.DISCONNECTED_EVENT = "sockets.disconnected";
        /**
         * Event name that will be triggered by eventPublisher, when client receives an http error when trying to connect.
         * @type {string}
         */
        BaseSockets.HTTP_ERROR_EVENT = "sockets.http.error";
        return BaseSockets;
    }());
    exports.BaseSockets = BaseSockets;
});
//# sourceMappingURL=BaseSockets.js.map