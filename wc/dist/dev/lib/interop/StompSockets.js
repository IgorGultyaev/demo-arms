/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "vendor/stomp", "vendor/sockjs-client", "lib/interop/BaseSockets", "lib/utils", "jquery"], function (require, exports, lang, stomp, SockJS, BaseSockets_1, utils, $) {
    "use strict";
    /**
     * Class for communicating with server via sockets using the STOMP protocol.
     */
    var StompSockets = /** @class */ (function (_super) {
        __extends(StompSockets, _super);
        /**
         * Constructor.
         * @param {StompSockets.Options} options Configuration.
         * @param {IApplication} app Application instance.
         */
        function StompSockets(options, app) {
            var _this = _super.call(this, app) || this;
            /**
             * Indicates that the connection was set at least once.
             * It is necessary to prevent a bunch of disconnection events.
             */
            _this._wasConnected = false;
            var that = _this;
            that.options = lang.appendEx(options || {}, StompSockets.defaultOptions, { deep: true });
            that.options.stopReconnectOnHttpErrorCodes = that.options.stopReconnectOnHttpErrorCodes || [];
            return _this;
        }
        /** @inheritdoc */
        StompSockets.prototype._connect = function () {
            var that = this;
            var deferred = lang.Deferred();
            if (!that.isConnected()) {
                this.client = that._getClient();
                this.client.connect(/*headers*/ {}, function () {
                    that._successConnect();
                    deferred.resolve();
                }, function (error) {
                    var restoreConnectionTimeout = that.options.restoreConnectionTimeout;
                    if (!that._shouldReconnect || restoreConnectionTimeout < 0) {
                        deferred.reject(error);
                        return;
                    }
                    if (!that.client.connected && that._wasConnected) {
                        that._wasConnected = false;
                        if (that.app && that.app.eventPublisher) {
                            that.app.eventPublisher.publish(StompSockets.DISCONNECTED_EVENT);
                        }
                    }
                    if (restoreConnectionTimeout >= 0 && !that.client.connected) {
                        var delayedReconnect_1 = function () { return setTimeout(function () {
                            that.connect();
                        }, restoreConnectionTimeout); };
                        if (!that.options.stopReconnectOnHttpErrorCodes || that.options.stopReconnectOnHttpErrorCodes.length === 0) {
                            delayedReconnect_1();
                        }
                        else {
                            var url_1 = that._resolveEndpoint(that.app, that.options.url);
                            /// проверим доступность ресурса
                            var requestType_1 = "HEAD";
                            $.ajax(url_1, { type: requestType_1 })
                                .done(function () { return delayedReconnect_1(); })
                                .fail(function (xhr) {
                                if (that.options.stopReconnectOnHttpErrorCodes.indexOf(xhr.status) < 0) {
                                    delayedReconnect_1();
                                }
                                else {
                                    // считаем, что ресурс уже не станет доступным
                                    // публикуем событие, что произошла ошибка соединения
                                    var eventArgs = {
                                        status: xhr.status,
                                        requestUrl: url_1,
                                        requestType: requestType_1,
                                        client: that,
                                        ignoreError: false
                                    };
                                    that.app.eventPublisher.publish(StompSockets.HTTP_ERROR_EVENT, eventArgs);
                                    // если в обработчике события указали игноривать ошибку - делаем реконнект
                                    if (eventArgs.ignoreError) {
                                        delayedReconnect_1();
                                    }
                                }
                            });
                        }
                    }
                    deferred.reject(error);
                });
            }
            else {
                deferred.resolve();
            }
            return deferred.promise();
        };
        /**
         * Handling a successful connection.
         * @private
         */
        StompSockets.prototype._successConnect = function () {
            var _this = this;
            var that = this;
            that._shouldReconnect = true;
            // восстановим подписку на новом соединении
            if (that._subscription.private()) {
                var subs_1 = that._subscription.private();
                lang.forEach(Object.keys(subs_1), function (item) {
                    lang.forEach(subs_1[item], function (s) {
                        var toUnsubscribe = _this._clientSubscribe(_this._extractDestination(item, false), s.handler);
                        s.unsubscribe = function () { return toUnsubscribe.unsubscribe(); };
                    });
                });
            }
            if (that._subscription.broadcasted()) {
                var subs_2 = that._subscription.broadcasted();
                lang.forEach(Object.keys(subs_2), function (item) {
                    lang.forEach(subs_2[item], function (s) {
                        var toUnsubscribe = _this._clientSubscribe(_this._extractDestination(item, true), s.handler);
                        s.unsubscribe = function () { return toUnsubscribe.unsubscribe(); };
                    });
                });
            }
            if (that.app && that.app.eventPublisher) {
                that.app.eventPublisher.publish(StompSockets.CONNECTED_EVENT);
                that._wasConnected = true;
            }
        };
        /** @inheritdoc */
        StompSockets.prototype.disconnect = function () {
            var that = this;
            var deferred = lang.Deferred();
            if (that.isConnected()) {
                this._subscription.Reset();
                this._shouldReconnect = false;
                this.client.disconnect(function () {
                    deferred.resolve();
                });
            }
            else {
                deferred.resolve();
            }
            return deferred.promise();
        };
        /** @inheritdoc */
        StompSockets.prototype._send = function (destination, options) {
            options = options || {};
            var d = lang.Deferred();
            destination = this._normalizeDestination(destination);
            try {
                this.client
                    .send(destination, { "content-type": "application/json;charset=UTF-8" }, JSON.stringify(options.data));
                d.resolve();
            }
            catch (e) {
                d.reject(e);
            }
            return d.promise();
        };
        /** @inheritdoc */
        StompSockets.prototype._request = function (destination, options) {
            options = options || {};
            var that = this;
            var d = lang.Deferred();
            var guid = utils.generateGuid();
            destination = destination || "";
            destination = destination + "/" + guid;
            if (destination[0] !== "/")
                destination = "/" + destination;
            var responseDestination = this.options.queuePrefix + destination;
            var subscr = this._clientSubscribe(this.options.userPrefix + responseDestination, function (data) {
                d.resolve(data);
            }, function (data) {
                d.reject(data);
            });
            that.client
                .send(that._normalizeDestination(destination), { "reply-to": responseDestination }, JSON.stringify(options.data));
            return d.promise().then(function (r) { subscr.unsubscribe(); return r; });
        };
        /** @inheritdoc */
        StompSockets.prototype._subscribe = function (channel, options, handler) {
            var subscription = options.broadcasted ? this._subscription.broadcasted() : this._subscription.private();
            var destination = this._extractDestination(channel, options.broadcasted);
            var toUnsubscribe = this._clientSubscribe(destination, handler).unsubscribe;
            var currentHandlerIndex = lang.findIndex(subscription[channel], function (item) { return item.handler === handler; });
            if (currentHandlerIndex !== -1) {
                subscription[channel][currentHandlerIndex].unsubscribe = function () { return toUnsubscribe(); };
            }
        };
        /**
         * Wrap the subscribing process.
         * @param {string} destination Destination.
         * @param {(data: any) => void} handler Data handler.
         * @param {(data: any) => void} onError Error handler.
         * @returns {any} stomp.Client.subscribe() method result.
         * @private
         */
        StompSockets.prototype._clientSubscribe = function (destination, handler, onError) {
            return this.client.subscribe(destination, function (frame) {
                var result = frame.body;
                var headers = frame.headers || {};
                var contentType = headers["content-type"] || "";
                var isJson = contentType.toLowerCase().indexOf("application/json") > -1;
                if (isJson) {
                    try {
                        result = JSON.parse(result);
                    }
                    catch (e) {
                        // если ошибка, то считаем, что пришел не JSON, а строка,
                        // поэтому отправим в хэндлер как есть
                    }
                }
                if (onError && frame.headers && (frame.headers["message-type"] + "").toLowerCase() === "exception")
                    onError(result);
                else
                    handler(result);
            });
        };
        /**
         * Substitute special prefix for subscription destination.
         * @param {string} channel Channel.
         * @param {boolean} isBroadcasted Is broadcast channel.
         * @returns {string} Subscription destination.
         * @private
         */
        StompSockets.prototype._extractDestination = function (channel, isBroadcasted) {
            var destination = channel;
            if (isBroadcasted)
                destination = this._prefixDestination(this.options.topicPrefix, channel);
            else
                destination = this._prefixDestination(this.options.userPrefix + this.options.queuePrefix, channel);
            return destination;
        };
        /** @inheritdoc */
        StompSockets.prototype.isConnected = function () {
            return (this.client && this.client.connected);
        };
        /**
         * Substitute application prefix.
         * @param {string} destination Destination.
         * @returns {string} Prefixed destination.
         * @private
         */
        StompSockets.prototype._normalizeDestination = function (destination) {
            return this._prefixDestination(this.options.applicationDestinationPrefix, destination);
        };
        /**
         * Substitute prefix to destination in compliance with the rules of separation by a slash.
         * @param {string} prefix Prefix.
         * @param {string} destination Destination.
         * @returns {string} Prefixed destination.
         * @private
         */
        StompSockets.prototype._prefixDestination = function (prefix, destination) {
            if (destination && destination.length > 0 && destination[0] !== "/")
                destination = "/" + destination;
            destination = prefix + destination;
            return destination;
        };
        /**
         * Get STOMP client over websoket.
         * @returns {stomp.Client} stomp.Client
         * @private
         */
        StompSockets.prototype._getClient = function () {
            var that = this;
            var url = that._resolveEndpoint(that.app, that.options.url);
            var ws = new SockJS(url, null, {
                transports: that.options.transports
            });
            return stomp.over(ws);
        };
        /**
         * Get full address of the endpoint responsible for connecting to sockets.
         * @param {IApplication} app Application instance.
         * @param {string} endpoint Relative endpoint path.
         * @returns {string} Full address of the endpoint.
         * @private
         */
        StompSockets.prototype._resolveEndpoint = function (app, endpoint) {
            var config = app.config;
            var hostname = window.location.hostname; //"localhost"
            var port = window.location.port; //"8080"
            var protocol = window.location.protocol; //"http:"
            var rootOfApp = config.root || ""; //"/data-facade/"
            endpoint = endpoint || "";
            var portSuffix = (port != null && port !== "") ? ":" + port : "";
            var builder = protocol + "//" + hostname + portSuffix;
            if (rootOfApp.length > 0) {
                // rootOfApp должно начинаться со слэша, но не заканчиваться им
                if (rootOfApp[0] !== "/")
                    rootOfApp = "/" + rootOfApp;
                if (rootOfApp[rootOfApp.length - 1] === "/")
                    rootOfApp = rootOfApp.slice(0, -1);
                builder = builder + rootOfApp;
            }
            if (endpoint.length > 0 && endpoint[0] !== "/")
                endpoint = "/" + endpoint;
            builder = builder + endpoint;
            return builder;
        };
        /**
         * Default options.
         */
        StompSockets.defaultOptions = {
            url: "/jxfw-ws",
            applicationDestinationPrefix: "/app",
            queuePrefix: "/queue",
            topicPrefix: "/topic",
            userPrefix: "/user",
            restoreConnectionTimeout: 5000,
            stopReconnectOnHttpErrorCodes: [401, 403, 404],
            transports: ["websocket", "xhr-polling", "iframe-xhr-polling"]
        };
        return StompSockets;
    }(BaseSockets_1.BaseSockets));
    return StompSockets;
});
//# sourceMappingURL=StompSockets.js.map