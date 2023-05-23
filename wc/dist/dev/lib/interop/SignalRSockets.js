/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "@aspnet/signalr", "core", "lib/interop/BaseSockets", "xconfig"], function (require, exports, lang, signalR, core, BaseSockets_1, xconfig) {
    "use strict";
    var Methods = {
        ServerMessage: "ServerMessage",
        //TODO: SystemMessage: "SystemMessage",
        SubscribeOnChannels: "SubscribeOnChannels",
        UnsubscribeFromChannel: "UnsubscribeFromChannel"
    };
    /**
     * Class for communicating with server via sockets using the SignalR.
     */
    var SignalRSockets = /** @class */ (function (_super) {
        __extends(SignalRSockets, _super);
        /**
         * Constructor.
         * @param {SignalRSockets.Options} options Configuration.
         * @param {IApplication} app Application instance.
         */
        function SignalRSockets(options, app) {
            var _this = _super.call(this, app) || this;
            var that = _this;
            that.options = lang.appendEx(options || {}, SignalRSockets.defaultOptions, { deep: true });
            that.app = app;
            var hubUrl = that._resolveHubUrl(that.options.url);
            var connectionBuilder = new signalR.HubConnectionBuilder()
                .withUrl(hubUrl);
            if (that.options.logLevel)
                connectionBuilder = connectionBuilder.configureLogging(that.options.logLevel);
            _this._connection = connectionBuilder.build();
            that._connection.on(Methods.ServerMessage, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return that._processMessage.apply(that, args);
            });
            //TODO: системные сообщения that._connection.on(Methods.SystemMessage, that._processSystemMessage);
            if (that.options.restoreConnectionTimeout >= 0)
                that._connection.onclose(function (error) {
                    function start() {
                        if (that._shouldReconnect) {
                            that.connect().fail(function () {
                                setTimeout(function () { return start(); }, that.options.restoreConnectionTimeout);
                            });
                        }
                    }
                    if (that.app && that.app.eventPublisher) {
                        that.app.eventPublisher.publish(SignalRSockets.DISCONNECTED_EVENT);
                    }
                    start();
                });
            _this._logger = that._connection["logger"];
            return _this;
        }
        /** @inheritdoc */
        SignalRSockets.prototype._connect = function () {
            var _this = this;
            var that = this;
            var d = lang.Deferred();
            if (!this.isConnected()) {
                this._connection.start()
                    .then(function (value) {
                    that._shouldReconnect = true;
                    // восстановим подписку на новом соединении
                    if (that._subscription.private() && Object.keys(that._subscription.private()).length > 0) {
                        that._connection
                            .send(Methods.SubscribeOnChannels, Object.keys(that._subscription.private()), false)["catch"](function (reason) { return _this._logger.log(SignalRSockets.LogLevel.Error, reason); });
                    }
                    if (that._subscription.broadcasted() && Object.keys(that._subscription.broadcasted()).length > 0) {
                        that._connection
                            .send(Methods.SubscribeOnChannels, Object.keys(that._subscription.broadcasted()), true)["catch"](function (reason) { return _this._logger.log(SignalRSockets.LogLevel.Error, reason); });
                    }
                    if (that.app && that.app.eventPublisher) {
                        that.app.eventPublisher.publish(SignalRSockets.CONNECTED_EVENT);
                    }
                    d.resolve();
                })["catch"](function (reason) { return d.reject(reason); });
            }
            else {
                d.resolve();
            }
            return d.promise();
        };
        /** @inheritdoc */
        SignalRSockets.prototype.disconnect = function () {
            var d = lang.Deferred();
            if (this.isConnected()) {
                this._subscription.Reset();
                this._shouldReconnect = false;
                // ненужно отписываться вручную (в смысле покидать группы), т.к. SignalR делает это самостоятельно при потере соединения
                this._connection.stop()
                    .then(function (value) { return d.resolve(); }, function (reason) { return d.reject(reason); });
            }
            else {
                d.resolve();
            }
            return d.promise();
        };
        /** @inheritdoc */
        SignalRSockets.prototype._send = function (destination, options) {
            options = options || {};
            var d = lang.Deferred();
            try {
                this._connection
                    .send(destination, options.data)
                    .then(function (value) { return d.resolve(); }, function (reason) { return d.reject(reason); });
            }
            catch (e) {
                d.reject(e);
            }
            return d.promise();
        };
        /** @inheritdoc */
        SignalRSockets.prototype._request = function (destination, options) {
            options = options || {};
            var d = lang.Deferred();
            var args = [];
            if (options.data)
                args.push(options.data);
            (_a = this._connection).invoke.apply(_a, [destination].concat(args)).then(function (value) { return d.resolve(value); }, function (reason) { return d.reject(reason); });
            return d.promise();
            var _a;
        };
        /** @inheritdoc */
        SignalRSockets.prototype.isConnected = function () {
            return (this._connection && this._connection.state === signalR.HubConnectionState.Connected);
        };
        /**
         * Обработка сообщений в канале.
         * @param args
         * @private
         */
        SignalRSockets.prototype._processMessage = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!args || args.length === 0) {
                return;
            }
            var props = args[0];
            var target = props.channel.toLowerCase();
            var isBroadcast = !!props.broadcast;
            var subscription = isBroadcast ? this._subscription.broadcasted() : this._subscription.private();
            var data = args.slice(1);
            var methods = subscription[target];
            if (methods) {
                methods.forEach(function (m) { return m.handler.apply(_this, data); });
            }
            else {
                this._logger.log(SignalRSockets.LogLevel.Warning, "No handler found for '" + target + "' (broadcast is " + isBroadcast + ").");
            }
        };
        /** @inheritdoc */
        SignalRSockets.prototype._subscribe = function (channel, options, handler) {
            var _this = this;
            var that = this;
            var subscription = options.broadcasted ? this._subscription.broadcasted() : this._subscription.private();
            var currentHandlerIndex = lang.findIndex(subscription[channel], function (item) { return item.handler === handler; });
            if (currentHandlerIndex !== -1) {
                subscription[channel][currentHandlerIndex].unsubscribe = function () {
                    if (that.isConnected()) {
                        that._connection
                            .send(Methods.UnsubscribeFromChannel, channel, options.broadcasted)["catch"](function (reason) { return that._logger.log(SignalRSockets.LogLevel.Error, reason); });
                    }
                };
            }
            (_a = this._connection).send.apply(_a, [Methods.SubscribeOnChannels].concat([[channel], options.broadcasted]))["catch"](function (reason) { return _this._logger.log(SignalRSockets.LogLevel.Error, reason); });
            var _a;
        };
        /**
         * Resolve hub url based on root url from xconfig.
         * @param {string} hubUrl Hub url path.
         * @returns {string} Hub url path based on root url from xconfig.
         * @private
         */
        SignalRSockets.prototype._resolveHubUrl = function (hubUrl) {
            if (xconfig.root) {
                var hubUrlPrefix = xconfig.root;
                if (core.lang.last(hubUrlPrefix) === "/")
                    hubUrlPrefix = hubUrlPrefix.slice(0, -1);
                if (hubUrl && hubUrl[0] !== "/")
                    hubUrl = "/" + hubUrl;
                hubUrl = hubUrlPrefix + hubUrl;
            }
            return hubUrl;
        };
        /**
         * Default options.
         */
        SignalRSockets.defaultOptions = {
            url: "/_hubs/main",
            restoreConnectionTimeout: 5000
        };
        return SignalRSockets;
    }(BaseSockets_1.BaseSockets));
    (function (SignalRSockets) {
        var LogLevel;
        (function (LogLevel) {
            /** Log level for very low severity diagnostic messages. */
            LogLevel[LogLevel["Trace"] = 0] = "Trace";
            /** Log level for low severity diagnostic messages. */
            LogLevel[LogLevel["Debug"] = 1] = "Debug";
            /** Log level for informational diagnostic messages. */
            LogLevel[LogLevel["Information"] = 2] = "Information";
            /** Log level for diagnostic messages that indicate a non-fatal problem. */
            LogLevel[LogLevel["Warning"] = 3] = "Warning";
            /** Log level for diagnostic messages that indicate a failure in the current operation. */
            LogLevel[LogLevel["Error"] = 4] = "Error";
            /** Log level for diagnostic messages that indicate a failure that will terminate the entire application. */
            LogLevel[LogLevel["Critical"] = 5] = "Critical";
            /** The highest possible log level. Used when configuring logging to indicate that no log messages should be emitted. */
            LogLevel[LogLevel["None"] = 6] = "None";
        })(LogLevel = SignalRSockets.LogLevel || (SignalRSockets.LogLevel = {}));
    })(SignalRSockets || (SignalRSockets = {}));
    return SignalRSockets;
});
//# sourceMappingURL=SignalRSockets.js.map