/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "xhtmpl!./templates/NotificationProcess.hbs"], function (require, exports, $, core, View, template) {
    "use strict";
    var NotificationProcess = /** @class */ (function (_super) {
        __extends(NotificationProcess, _super);
        /**
         * @constructs NotificationProcess
         * @extends View
         */
        function NotificationProcess(options) {
            var _this = this;
            options = NotificationProcess.mixOptions(options, NotificationProcess.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        NotificationProcess.prototype.render = function () {
            var that = this;
            if (that.viewModel.promise.state() !== "pending") {
                return;
            }
            that.viewModel.promise.always(function () {
                that.close();
            });
            if (that.options.timeout) {
                that._timeout = window.setTimeout(that._doRender.bind(that), that.options.timeout);
            }
            else {
                that._doRender();
            }
        };
        NotificationProcess.prototype._doRender = function () {
            var that = this;
            if (that.viewModel.promise.state() !== "pending") {
                return;
            }
            var $element = $("<div style='display: none' class='x-process-container'></div>").appendTo(that.options.container);
            _super.prototype.render.call(this, $element);
            that._rendering = true;
            $element.fadeTo(that.options.speed, 1, function () {
                that._rendering = true;
            });
            $element.find("a").on("click", function () {
                that.close();
                return false;
            });
            that.$domElement = $element;
            that.domElement = $element[0];
        };
        /**
         * Animated closing notification.
         * NOTE: If notification wasn't rendered (as timer hasn't fired yet) it clears the timer.
         * NOTE: It removes UI from DOM on animation completes .
         */
        NotificationProcess.prototype.close = function () {
            var that = this, $element = that.$domElement;
            if (that._timeout) {
                window.clearTimeout(that._timeout);
                that._timeout = undefined;
            }
            if ($element) {
                if (that._rendering) {
                    // fadeTo animation hasn't completed yet, it unsafe to schedule another concurrent animation
                    that.unload();
                }
                else {
                    $element.fadeOut(that.options.speed, function () {
                        that.unload();
                    });
                }
            }
        };
        NotificationProcess.prototype.unload = function () {
            var that = this, $element = that.$domElement;
            if (that._timeout) {
                window.clearTimeout(that._timeout);
            }
            _super.prototype.unload.call(this);
            if ($element) {
                $element.remove();
            }
        };
        NotificationProcess.defaultOptions = {
            template: template,
            timeout: 1000,
            speed: 300,
            container: document.body
        };
        return NotificationProcess;
    }(View));
    NotificationProcess.mixin({
        defaultOptions: NotificationProcess.defaultOptions
    });
    core.ui.NotificationProcess = NotificationProcess;
    return NotificationProcess;
});
//# sourceMappingURL=NotificationProcess.js.map