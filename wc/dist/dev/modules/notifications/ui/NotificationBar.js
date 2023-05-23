/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Carousel", "xhtmpl!./templates/NotificationBar.hbs", "lib/core.html"], function (require, exports, $, core, Carousel, tmplNotificationBar, html) {
    "use strict";
    var NotificationBar = /** @class */ (function (_super) {
        __extends(NotificationBar, _super);
        /**
         * Obtrusive notification.
         * @class NotificationBar
         * @extends View
         */
        function NotificationBar(options) {
            var _this = this;
            options = NotificationBar.mixOptions(options, NotificationBar.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.items().bind("change", _this._onEventsChanged.bind(_this));
            return _this;
            /*
             * TODO: поддержка priority=max - отображение модальной полоски в стиле win8
             * (http://www.jqueryscript.net/demo/Creating-Windows-8-Style-Toast-Notifications-with-jQuery-CSS3-Win8-Notify/)
             */
        }
        NotificationBar.prototype.add = function (sysEvent) {
            if (sysEvent.uid) {
                // event has unique id, find and replace existing event with the new one
                var item = this.items().find(function (item) {
                    return item.uid === sysEvent.uid;
                });
                if (item) {
                    this.items().remove(item);
                }
            }
            this.items().add(sysEvent);
        };
        NotificationBar.prototype._onEventsChanged = function (sender, ea) {
            var that = this, items = that.items(), count = items.count();
            if (ea.added) {
                core.lang.forEach(ea.added, function (item) {
                    // Once any menu item executed remove the event
                    item.menu.onceExecuted(function (args) {
                        if (!args || args.result !== false) {
                            that.items().remove(item);
                        }
                        else {
                            return false;
                        }
                    });
                });
            }
            if (that.position() >= count) {
                that.position(Math.max(count - 1, 0));
            }
            if (count === 0) {
                that.unload();
                html.notifyDOMChanged();
            }
            else if (!that.domElement) {
                that.render();
                html.notifyDOMChanged();
            }
        };
        NotificationBar.prototype.render = function () {
            _super.prototype.render.call(this, null);
        };
        NotificationBar.prototype.doRender = function (domElement) {
            var that = this, $navbar = $(".x-app-navbar"), $element = $("<div class='x-notification-bar-container'></div>");
            if ($navbar.length === 0) {
                if (document.body.firstChild) {
                    $element.insertBefore(document.body.firstChild);
                }
                else {
                    $element.appendTo(document.body);
                }
            }
            else {
                $navbar.after($element);
            }
            _super.prototype.doRender.call(this, $element);
            core.Application.current.eventPublisher.publish("ui.affix.add_element", {
                element: $element,
                stuckBehaviors: [] // reset default behaviors
            });
            core.html.notifyDOMChanged($element);
            $element.on("click", ".x-cmd-link", function (e) {
                var event = that.current();
                if (event && event.menu) {
                    if (core.commands.tryToExecuteHtmlCommand($(this), event.menu)) {
                        e.preventDefault();
                    }
                }
            });
        };
        NotificationBar.prototype.unload = function () {
            var that = this, $element = that.$domElement;
            // that.domElement - это элемент, в который отрендерился шаблон (x-notification-bar),
            // но мы еще создавали контейнер, его тоже надо удалить
            core.Application.current.eventPublisher.publish("ui.affix.remove_element", {
                element: that.domElement
            });
            _super.prototype.unload.call(this);
            $element.remove();
        };
        NotificationBar.defaultOptions = {
            template: tmplNotificationBar,
            unbound: false
        };
        return NotificationBar;
    }(Carousel));
    NotificationBar.mixin({
        defaultOptions: NotificationBar.defaultOptions
    });
    core.ui.NotificationBar = NotificationBar;
    return NotificationBar;
});
//# sourceMappingURL=NotificationBar.js.map