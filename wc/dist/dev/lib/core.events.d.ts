/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import * as diagnostics from "lib/core.diagnostics";
import { AppEvent, AppEventArgs, IEventPublisher } from ".core";
import IDisposable = lang.IDisposable;
export declare class EventPublisher extends lang.CoreClass implements IEventPublisher {
    traceSource: diagnostics.TraceSource;
    private _events;
    private _deferredEvents;
    private _isDeferred;
    /**
     * Event publisher.
     * Initially publisher is frozen - all published events arn't processed and postponed till `start` method called.
     * @constucts EventPublisher
     * @memberOf module:"core.events"
     */
    constructor();
    /**
     * @deprecated Use `subscribe` method
     */
    getEvent(eventName: any): {
        subscribe: (handler: any) => lang.IDisposable;
    };
    /**
     * Subscribe the handler on the event.
     * @param {String} eventName Name of app event
     * @param {Function} handler Callback which will be called on the event publishing. Callback should expect argument of type AppEvent.
     * @returns {Object} Disposable object to unsubscribe
     */
    subscribe(eventName: string, handler: (event: AppEvent) => void): IDisposable;
    /**
     * Subscribe the handler on all events.
     * @param {Function} handler Callback which will be called on any event publishing.
     * @returns {Object} Disposable object to unsubscribe
     */
    subscribeAll(handler: (event: AppEvent) => void): IDisposable;
    /**
     * Publish event with its data.
     * The event processing will be postponed if start method wasn't called.
     * @param {String} eventName Name of app event
     * @param {Object|SystemEvent} [eventArgs] Data for the event. Subscribed callbacks get it via AppEvent.args field.
     * @param {Function} [eventArgs.defaultAction] Callback to be called if there're no any subscribers.
     * @param {Function} [eventArgs.initialize]
     */
    publish(eventName: string, eventArgs?: AppEventArgs): void;
    /**
     * Start processing postponed (published earlier) events.
     * Also publishes "app.start" event.
     */
    start(): void;
}
