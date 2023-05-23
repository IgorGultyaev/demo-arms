/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/PopupView", "i18n!lib/nls/resources", "./ui/Notification", "./ui/NotificationBar", "./ui/NotificationProcess", "./ui/EventLogView"], function (require, exports, core, PopupView, resources) {
    "use strict";
    var lang = core.lang;
    var NotificationManager = /** @class */ (function (_super) {
        __extends(NotificationManager, _super);
        /**
         * @constructs NotificationManager
         * @extends Observable
         */
        function NotificationManager(options) {
            var _this = _super.call(this) || this;
            _this.options = core.lang.appendEx(_this.options || options || {}, NotificationManager.defaultOptions, { deep: true });
            _this._eventLog = new lang.ObservableCollection();
            _this._eventLog.bind("change", function () {
                var active = 0;
                core.lang.forEach(_this._eventLog, function (item) {
                    if (item.state() !== "archived") {
                        active += 1;
                    }
                });
                _this.activeEvents(active);
            });
            _this._eventLog.bind("itemChange", function () {
                var active = 0;
                core.lang.forEach(_this._eventLog, function (item) {
                    if (item.state() !== "archived") {
                        active += 1;
                    }
                });
                _this.activeEvents(active);
            });
            _this._activeNotifications = new core.lang.ObservableCollection();
            _this._activeProcesses = new core.lang.ObservableCollection();
            _this._notifyBar = new core.ui.NotificationBar(_this.options.partsOptions.bar);
            _this._pendingEvents = [];
            return _this;
        }
        /**
         * Process published SystemEvent
         * @param {String} name Application event name (as it was supplied to EventPublisher.publish)
         * @param {SystemEvent} sysEvent
         * @returns {Boolean} true if event was processed
         */
        NotificationManager.prototype.processEvent = function (name, sysEvent) {
            var that = this, eventArgs;
            if (!sysEvent || !sysEvent.isSystemEvent || sysEvent.state() !== "pending") {
                return false;
            }
            sysEvent.type = name;
            eventArgs = { event: sysEvent, publish: !!sysEvent.message };
            that.onBeforePublish(eventArgs);
            if (!eventArgs.publish) {
                return false;
            }
            that._pendingEvents.push(sysEvent);
            that._processEventsAsync();
            return true;
        };
        NotificationManager.prototype._processEvents = function () {
            var event;
            while (this._pendingEvents.length) {
                event = this._pendingEvents.shift();
                this._processEvent(event);
            }
        };
        NotificationManager.prototype._initProps = function (sysEvent) {
            if (!sysEvent.kind) {
                if (sysEvent.promise) {
                    sysEvent.kind = "process";
                }
                else {
                    sysEvent.kind = "notification";
                }
            }
            if (!sysEvent.priority) {
                sysEvent.priority = "normal";
            }
            if (!sysEvent.severity) {
                sysEvent.severity = "info";
            }
        };
        NotificationManager.prototype._processEvent = function (sysEvent) {
            var that = this;
            that._initProps(sysEvent);
            if (sysEvent.kind === "process") {
                if (!sysEvent.promise) {
                    // log error
                    console.warn("NotificationManager: got SystemEvent with kind='process' but w/i promise");
                    return;
                }
                // process - это SystemEvent с promise'ом,
                // после завершения promise'a, нотификация должна удаляться
                // priority 'normal' won't be put in eventLog
                if (sysEvent.priority !== "normal") {
                    that._addEventToLog(sysEvent);
                    sysEvent.promise.always(function () {
                        that._eventLog.remove(sysEvent);
                    });
                }
                if (sysEvent.priority !== "low") {
                    that.createProcessPart(sysEvent);
                }
            }
            else if (sysEvent.kind === "notification") {
                if (sysEvent.priority !== "low") {
                    that._addEventToLog(sysEvent);
                }
                that.createNotificationPart(sysEvent);
            }
            else if (sysEvent.kind === "actionRequest") {
                if (!sysEvent.menu || sysEvent.menu.items.length === 0) {
                    sysEvent.menu = core.ui.Menu.create({
                        items: [{
                                name: "Close", title: resources["close"],
                                command: core.createCommand({
                                    execute: function () {
                                        // NOTE: it's empty command, but executing it will fire 'executed' event which is tracked by NotificationBar
                                    }
                                })
                            }]
                    });
                }
                that._notifyBar.add(sysEvent);
            }
        };
        NotificationManager.prototype.createNotificationPart = function (sysEvent) {
            var that = this, part = new core.ui.Notification(this.options.partsOptions.notification), toClose = [];
            part.setViewModel(sysEvent);
            // throttling: close active UI-notifications with the same type/priority/severity as the new one
            core.lang.forEach(that._activeNotifications, function (notification) {
                var event = notification.viewModel;
                if (event.type === sysEvent.type && event.priority === sysEvent.priority && event.severity === sysEvent.severity) {
                    toClose.push(notification);
                }
            });
            if (toClose.length) {
                core.lang.forEach(toClose, function (notification) {
                    notification.close(/*archive=*/ false);
                });
            }
            that._activeNotifications.add(part);
            var disposable = part.subscribe("close", function (sender) {
                disposable.dispose();
                that._activeNotifications.remove(sender);
            });
            window.setTimeout(function () {
                if (!part.isDisposed) {
                    part.render();
                }
            }, 0);
            return part;
        };
        NotificationManager.prototype.createProcessPart = function (sysEvent) {
            var that = this, part = new core.ui.NotificationProcess(that.options.partsOptions.process);
            part.setViewModel(sysEvent);
            part.render();
            that._activeProcesses.add(part);
            var disposable = part.subscribe("unload", function (sender) {
                disposable.dispose();
                that._activeProcesses.remove(sender);
            });
            return part;
        };
        NotificationManager.prototype.onBeforePublish = function (eventArgs) {
            this.trigger("notificationPublishing", this, eventArgs);
        };
        NotificationManager.prototype._addEventToLog = function (sysEvent) {
            var that = this;
            // notifications are added after processes (newest top)
            if (sysEvent.kind === core.SystemEvent.Kinds.notification) {
                // find the last process and append the new one after it:
                var startIdx_1 = 0;
                that._eventLog.some(function (item, i) {
                    if (item.kind !== core.SystemEvent.Kinds.process) {
                        startIdx_1 = i;
                        return true;
                    }
                    startIdx_1 = i + 1;
                });
                if (sysEvent.state() === "pending") {
                    sysEvent.state("active");
                }
                that._eventLog.insert(sysEvent, startIdx_1);
            }
            else {
                // processes are always added at the top
                that._eventLog.insert(sysEvent, 0);
            }
        };
        /**
         * Return a UI part for SystemMenu showing EventLog.
         * @return {PopupView}
         */
        NotificationManager.prototype.getEventLogView = function () {
            var eventLog = new core.ui.EventLogView(this._eventLog);
            return new PopupView({
                body: eventLog,
                title: resources["notifications.moduleName"],
                unbound: false,
                disposeOnClose: true,
                //height: "350",
                menu: eventLog.menu
            });
        };
        NotificationManager.prototype.dispose = function () {
            var that = this;
            that._activeNotifications.forEach(function (item) {
                item.close();
            });
            that._activeNotifications.clear();
            that._activeProcesses.forEach(function (item) {
                item.unload();
            });
            that._activeProcesses.clear();
        };
        NotificationManager.defaultOptions = {
            partsOptions: {
                process: {},
                notification: {},
                bar: {}
            }
        };
        __decorate([
            core.lang.decorators.observableAccessor()
        ], NotificationManager.prototype, "activeEvents");
        __decorate([
            lang.decorators.constant(lang.debounce("_processEvents", 100, "_queueEventTimer"))
        ], NotificationManager.prototype, "_processEventsAsync");
        return NotificationManager;
    }(lang.Observable));
    core.ui.NotificationManager = NotificationManager;
    return NotificationManager;
});
//# sourceMappingURL=NotificationManager.js.map