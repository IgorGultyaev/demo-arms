/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./NotificationManager", "i18n!lib/nls/resources", "i18n!./nls/resources"], function (require, exports, core, NotificationManager, resources, resourcesModule) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    // extend common resources
    lang.forEach(resourcesModule, function (value, key) {
        resources[key] = value;
    });
    core.createModule("notifications", function (app) {
        return {
            initialize: function () {
                var notificationMgr = new NotificationManager();
                app.notificationManager = notificationMgr;
                if (app.sysMenu) {
                    var menuItem_1 = app.sysMenu.getRootItem("notifications");
                    if (!menuItem_1) {
                        menuItem_1 = app.sysMenu.addRootItem({
                            name: "notifications",
                            getPart: function () {
                                return notificationMgr.getEventLogView();
                            }
                        });
                    }
                    app.notificationManager.bind("change:activeEvents", function (sender, count) {
                        if (count > 0) {
                            menuItem_1.badge(count);
                        }
                        else {
                            menuItem_1.badge("");
                        }
                    });
                }
                app.eventPublisher.subscribeAll(function (ev) {
                    if (app.notificationManager) {
                        if (ev.eventName === "app.unload") {
                            app.notificationManager.dispose();
                            ev.processed = true;
                        }
                        else {
                            ev.processed = app.notificationManager.processEvent(ev.eventName, ev.args);
                        }
                    }
                    else {
                        ev.processed = false;
                    }
                });
            }
        };
    });
});
//# sourceMappingURL=module-notifications.js.map