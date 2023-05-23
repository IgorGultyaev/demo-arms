/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!./templates/EventLogView.hbs", "i18n!lib/nls/resources"], function (require, exports, core, View, tmplEventLogView, resources) {
    "use strict";
    var EventLogView = /** @class */ (function (_super) {
        __extends(EventLogView, _super);
        /**
         * @class EventLogView
         * @extends View
         * @param {ObservableCollection} eventLog
         * @param {Object} [options]
         */
        function EventLogView(eventLog, options) {
            var _this = this;
            options = EventLogView.mixOptions(options, EventLogView.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.events = eventLog;
            _this.commands = _this.createCommands();
            _this.menu = {
                items: [{
                        name: "RemoveAll",
                        title: resources["delete_all"],
                        icon: "remove",
                        command: core.createCommand({
                            execute: function () {
                                _this._removeAllEvents();
                                return false;
                            }
                        })
                    }, {
                        name: "ArchiveAll",
                        title: resources["archive_all"],
                        icon: "archive",
                        command: core.createCommand({
                            execute: function () {
                                _this._archiveAllEvents();
                                return false;
                            }
                        })
                    }]
            };
            return _this;
        }
        EventLogView.prototype.createCommands = function () {
            var _this = this;
            return {
                "Dismiss": core.createCommand({
                    execute: function (args) {
                        // TODO:
                        var item = args.item;
                        if (item) {
                            if (item.kind === "notification") {
                                // TODO: Run animation to remove the notification
                                _this._removeEvent(item);
                                return false;
                            }
                        }
                    }
                }),
                "Select": core.createCommand({
                    execute: function (args) {
                        var item = args.item;
                        if (item && item.kind === core.SystemEvent.Kinds.notification) {
                            _this.activeItem(item);
                            if (item.state() === "active" || item.state() === "pending") {
                                item.state("archived");
                            }
                        }
                    }
                })
            };
        };
        EventLogView.prototype._removeEvent = function (item) {
            if (this.activeItem() === item) {
                this.activeItem(null);
            }
            this.events.remove(item);
            item.state("archived");
        };
        EventLogView.prototype._removeAllEvents = function () {
            var toRemove = [];
            this.events.forEach(function (item) {
                if (item.kind === core.SystemEvent.Kinds.notification && item.state() !== "archived") {
                    item.state("archived");
                }
                if (item.state() === "archived") {
                    toRemove.push(item);
                }
            });
            this.events.remove(toRemove);
        };
        EventLogView.prototype._archiveAllEvents = function () {
            this.events.forEach(function (item) {
                if (item) {
                    if (item.kind === core.SystemEvent.Kinds.notification) {
                        item.state("archived");
                    }
                }
            });
        };
        EventLogView.defaultOptions = {
            template: tmplEventLogView,
            unbound: false
        };
        __decorate([
            core.lang.decorators.observableAccessor()
        ], EventLogView.prototype, "activeItem");
        return EventLogView;
    }(View));
    EventLogView.mixin({
        defaultOptions: EventLogView.defaultOptions
    });
    core.ui.EventLogView = EventLogView;
    return EventLogView;
});
//# sourceMappingURL=EventLogView.js.map