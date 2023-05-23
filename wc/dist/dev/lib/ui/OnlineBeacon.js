/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/OnlineBeacon.hbs", "lib/ui/ConfirmDialog", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "xcss!lib/ui/styles/onlineBeacon"], function (require, exports, core, View, template, ConfirmDialog, Menu, resources) {
    "use strict";
    var OnlineBeacon = /** @class */ (function (_super) {
        __extends(OnlineBeacon, _super);
        /**
         * @class OnlineBeacon
         * @extends View
         * @param {Application} app
         * @param {Object} [options]
         */
        function OnlineBeacon(app, options) {
            var _this = this;
            options = OnlineBeacon.mixOptions(options, OnlineBeacon.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.app = app;
            // NOTE: OnlineBeacon can only work with DataFacadeSmart
            _this.dataFacade = app.dataFacade;
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
            }
            return _this;
        }
        OnlineBeacon.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(OnlineBeacon.defaultMenu, "OnlineBeacon");
        };
        OnlineBeacon.prototype.createMenu = function () {
            return new Menu(this.createMenuDefaults(), this.options.menu);
        };
        /**
         * Create commands
         * @protected
         * @returns {{
             * 		online: (Command),
             * 		offline: (Command),
             * 		check: (Command),
             * 		resolve: (Command)
             * 	}}
         */
        OnlineBeacon.prototype.createCommands = function () {
            var that = this;
            return {
                online: core.createCommand({
                    execute: function () {
                        that.dataFacade.manuallyDisconnected(false);
                    },
                    canExecute: function () {
                        return that.dataFacade.manuallyDisconnected();
                    }
                }),
                offline: core.createCommand({
                    execute: function () {
                        ConfirmDialog.create({
                            header: resources["interop.go_offline"],
                            text: resources["interop.go_offline_prompt"]
                        }).open().done(function (result) {
                            if (result === "yes") {
                                that.dataFacade.manuallyDisconnected(true);
                            }
                        });
                    },
                    canExecute: function () {
                        return !that.dataFacade.manuallyDisconnected();
                    }
                }),
                check: core.createCommand({
                    execute: function () {
                        that.dataFacade.checkConnection().then(function (result) {
                            if (!result || result.notificationPublished) {
                                return;
                            }
                            if (result.serverOnline) {
                                that.app.eventPublisher.publish("ui.OnlineBeacon.online", core.SystemEvent.create({
                                    kind: core.SystemEvent.Kind.notification,
                                    priority: "low",
                                    message: resources["interop.server_online"]
                                }));
                            }
                            else {
                                that.app.eventPublisher.publish("ui.OnlineBeacon.offline", core.SystemEvent.create({
                                    kind: core.SystemEvent.Kind.notification,
                                    priority: "low",
                                    message: resources["interop.server_offline"]
                                }));
                            }
                        });
                    }
                }),
                resolve: core.createCommand({
                    execute: function () {
                        that.app.stateManager.applyState({ area: "offline" });
                    }
                })
            };
        };
        OnlineBeacon.defaultOptions = {
            template: template,
            unbound: true // NOTE: main layout is fixed
        };
        OnlineBeacon.defaultMenu = {
            items: [{
                    name: "online",
                    title: resources["interop.go_online"],
                    hideIfDisabled: true
                }, {
                    name: "offline",
                    title: resources["interop.go_offline"],
                    hideIfDisabled: true
                }, {
                    name: "check",
                    title: resources["interop.check_connection"]
                }]
        };
        return OnlineBeacon;
    }(View));
    // backward compatibility: access to static fields via prototype
    OnlineBeacon.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: OnlineBeacon.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: OnlineBeacon.defaultMenu
    });
    core.ui.OnlineBeacon = OnlineBeacon;
    return OnlineBeacon;
});
//# sourceMappingURL=OnlineBeacon.js.map