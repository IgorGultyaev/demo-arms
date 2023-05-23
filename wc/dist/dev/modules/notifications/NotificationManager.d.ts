/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Notification = require("./ui/Notification");
import "./ui/Notification";
import "./ui/NotificationBar";
import NotificationProcess = require("./ui/NotificationProcess");
import "./ui/NotificationProcess";
import "./ui/EventLogView";
import PopupView = require("lib/ui/PopupView");
import lang = core.lang;
declare class NotificationManager extends lang.Observable {
    static defaultOptions: NotificationManager.Options;
    options: NotificationManager.Options;
    private _eventLog;
    private _activeNotifications;
    private _activeProcesses;
    private _notifyBar;
    private _pendingEvents;
    /**
     * @constructs NotificationManager
     * @extends Observable
     */
    constructor(options?: NotificationManager.Options);
    /**
     * Count of active events.
     * @observable-property {Number}
     */
    activeEvents: core.lang.ObservableProperty<number>;
    _processEventsAsync: () => void;
    /**
     * Process published SystemEvent
     * @param {String} name Application event name (as it was supplied to EventPublisher.publish)
     * @param {SystemEvent} sysEvent
     * @returns {Boolean} true if event was processed
     */
    processEvent(name: string, sysEvent: core.SystemEvent): boolean;
    protected _processEvents(): void;
    protected _initProps(sysEvent: core.SystemEvent): void;
    protected _processEvent(sysEvent: core.SystemEvent): void;
    createNotificationPart(sysEvent: core.SystemEvent): Notification;
    createProcessPart(sysEvent: core.SystemEvent): NotificationProcess;
    onBeforePublish(eventArgs: NotificationManager.PublishEventArgs): void;
    protected _addEventToLog(sysEvent: core.SystemEvent): void;
    /**
     * Return a UI part for SystemMenu showing EventLog.
     * @return {PopupView}
     */
    getEventLogView(): PopupView;
    dispose(): void;
}
declare namespace NotificationManager {
    interface Options {
        partsOptions: {
            process?: any;
            notification?: any;
            bar?: any;
        };
    }
    interface PublishEventArgs {
        event: core.SystemEvent;
        publish: boolean;
    }
}
export = NotificationManager;
