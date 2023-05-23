/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "xhtmpl!./templates/Notification.hbs", "vendor/notify/jquery.notify", "xcss!./styles/module-notifications"], function (require, exports, $, core, View, template) {
    "use strict";
    var lang = core.lang;
    var Notification = /** @class */ (function (_super) {
        __extends(Notification, _super);
        /**
         * @constructs Notification
         * @extends View
         */
        function Notification(options) {
            var _this = this;
            options = Notification.mixOptions(options, Notification.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        Notification.prototype.render = function () {
            _super.prototype.render.call(this, null);
        };
        Notification.prototype.doRender = function (domElement) {
            var that = this;
            if (that._isClosed) {
                return;
            }
            that._notification = that._container.notify("create", {}, // empty parameters
            {
                close: function () {
                    that.dispose();
                },
                open: function () {
                    that._onShown();
                },
                expires: that.persist ? 0 : that.options.timeout,
                speed: that.options.speed
            });
            _super.prototype.doRender.call(this, that._notification.element);
            // add a hook for links with special class, clicking on that links will execute corresponding commands
            if (that.viewModel.menu) {
                $(that._notification.element).on("click", ".x-cmd-link", function (e) {
                    if (core.commands.tryToExecuteHtmlCommand($(this), that.viewModel.menu)) {
                        e.preventDefault();
                    }
                });
            }
            // hook clicking on little cross - we'll close notification
            that._notification.element.find(".ui-notify-close").click(function (e) {
                e.preventDefault();
                that.close(/*archive=*/ true);
                return false;
            });
        };
        /**
         *
         * @param {SystemEvent} sysEvent
         */
        Notification.prototype.setViewModel = function (sysEvent) {
            var that = this;
            _super.prototype.setViewModel.call(this, sysEvent);
            that.persist = (sysEvent.priority === "high");
            if (that.viewModel.menu) {
                that.viewModel.menu.onceExecuted(that._onCmdExecuted.bind(that));
            }
            // if event is removed via EventLog (while UI-notification is still open) then we should close (not dispose as we want to be sure to close UI)
            sysEvent.bind("change:state", function (sender, state) {
                if (state === "archived") {
                    that.close(/*archive=*/ false);
                }
            }, that);
        };
        Notification.prototype._onShown = function () {
            if (this._isClosed) {
                return;
            }
            this.viewModel.state(core.SystemEvent.State.active);
        };
        Notification.prototype._onCmdExecuted = function (args) {
            var archive = (!args || args.result !== false);
            // If user executes any command in UI-notification it will close the UI-notification
            // (as he clicks the "cross" button)
            this.close(/*archive=*/ archive);
        };
        Notification.prototype.close = function (archive) {
            var that = this, notification = that._notification;
            that._isClosed = true;
            if (notification) {
                that._notification = undefined;
                // notification.close will call 'dispose' later
                notification.close();
            }
            else {
                // closing not rendered notification
                that.dispose();
            }
            if (that.viewModel) {
                // UI-notification has been manually closed by user
                that.viewModel.unbind("change:state", null, that);
                if (archive && that.viewModel.state() === core.SystemEvent.State.active) {
                    that.viewModel.state(core.SystemEvent.State.archived);
                }
                else if (that.viewModel.state() === core.SystemEvent.State.pending) {
                    // notification is being closed even before it was shown, change its state from 'pending' to 'active' for clearance
                    that.viewModel.state(core.SystemEvent.State.active);
                }
            }
        };
        Notification.prototype.dispose = function () {
            var that = this;
            that._isClosed = true;
            that.trigger("close", that);
            that._notification = undefined;
            _super.prototype.dispose.call(this);
        };
        Notification.defaultOptions = {
            template: template,
            unbound: true,
            timeout: 5000,
            speed: 500
        };
        __decorate([
            lang.decorators.constant($("<div style='display:none' class='noprint'><div></div></div>").appendTo(document.body).notify())
        ], Notification.prototype, "_container");
        return Notification;
    }(View));
    Notification.mixin({
        defaultOptions: Notification.defaultOptions
    });
    core.ui.Notification = Notification;
    return Notification;
});
//# sourceMappingURL=Notification.js.map