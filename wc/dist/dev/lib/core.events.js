/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/core.diagnostics"], function (require, exports, lang, diagnostics) {
    "use strict";
    exports.__esModule = true;
    var EventPublisher = /** @class */ (function (_super) {
        __extends(EventPublisher, _super);
        /**
         * Event publisher.
         * Initially publisher is frozen - all published events arn't processed and postponed till `start` method called.
         * @constucts EventPublisher
         * @memberOf module:"core.events"
         */
        function EventPublisher() {
            var _this = _super.call(this) || this;
            _this._events = new lang.Observable();
            /** @type TraceSource */
            _this.traceSource = new diagnostics.TraceSource("core.EventPublisher");
            _this._isDeferred = true;
            return _this;
        }
        /**
         * @deprecated Use `subscribe` method
         */
        EventPublisher.prototype.getEvent = function (eventName) {
            var that = this;
            return {
                subscribe: function (handler) {
                    return that.subscribe(eventName, handler);
                }
            };
        };
        /**
         * Subscribe the handler on the event.
         * @param {String} eventName Name of app event
         * @param {Function} handler Callback which will be called on the event publishing. Callback should expect argument of type AppEvent.
         * @returns {Object} Disposable object to unsubscribe
         */
        EventPublisher.prototype.subscribe = function (eventName, handler) {
            // wrap the handler to collect all handled events on publishing
            return this._events.subscribe(eventName, function (event, handledEvents) {
                // NOTE: create a shallow copy of the event for every handler
                var handlerEvent = lang.clone(event);
                handler.call(this, handlerEvent);
                handledEvents.push(handlerEvent);
            });
        };
        /**
         * Subscribe the handler on all events.
         * @param {Function} handler Callback which will be called on any event publishing.
         * @returns {Object} Disposable object to unsubscribe
         */
        EventPublisher.prototype.subscribeAll = function (handler) {
            return this.subscribe("*", handler);
        };
        /**
         * Publish event with its data.
         * The event processing will be postponed if start method wasn't called.
         * @param {String} eventName Name of app event
         * @param {Object|SystemEvent} [eventArgs] Data for the event. Subscribed callbacks get it via AppEvent.args field.
         * @param {Function} [eventArgs.defaultAction] Callback to be called if there're no any subscribers.
         * @param {Function} [eventArgs.initialize]
         */
        EventPublisher.prototype.publish = function (eventName, eventArgs) {
            var that = this, event = {
                eventName: eventName,
                args: eventArgs,
                processed: true
            }, handledEvents = [], processed;
            if (that._isDeferred) {
                // Application initialization hasn't finished yet, postpone the event
                if (!that._deferredEvents) {
                    that._deferredEvents = [];
                }
                that._deferredEvents.push(event);
                return;
            }
            if (eventArgs && lang.isFunction(eventArgs.initialize)) {
                eventArgs.initialize();
            }
            that._events.trigger(eventName, event, handledEvents);
            that._events.trigger("*", event, handledEvents);
            that.traceSource.debug("Published '" + eventName + "' event");
            // execute default callback if the event wasn't processed
            if (eventArgs && eventArgs.defaultAction) {
                processed = handledEvents.some(function (ev) { return ev.processed; });
                if (!processed) {
                    eventArgs.defaultAction();
                    that.traceSource.debug("Event '" + eventName + "' wasn't processed by subscribers and its defaultAction was executed");
                }
            }
        };
        /**
         * Start processing postponed (published earlier) events.
         * Also publishes "app.start" event.
         */
        EventPublisher.prototype.start = function () {
            var that = this;
            that._isDeferred = false;
            if (that._deferredEvents) {
                that._deferredEvents.forEach(function (event) {
                    that.publish(event.eventName, event.args);
                });
                that._deferredEvents = undefined;
            }
            that.publish("app.start");
        };
        return EventPublisher;
    }(lang.CoreClass));
    exports.EventPublisher = EventPublisher;
});
//# sourceMappingURL=core.events.js.map