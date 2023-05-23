/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Popup", "xhtmpl!lib/ui/templates/PopupView.hbs", "i18n!lib/nls/resources", "xcss!lib/ui/styles/popupView"], function (require, exports, core, Popup, defaultTemplate, resources) {
    "use strict";
    var PopupView = /** @class */ (function (_super) {
        __extends(PopupView, _super);
        /**
         * @constructs PopupView
         * @extends Popup
         * @description PopupView consists of a scaffolding frame (specified by template option)
         * and an inner part (specified by body or bodyTemplate options).
         * @param {PopupView.defaultOptions} options
         */
        function PopupView(options) {
            var _this = this;
            options = PopupView.mixOptions(options, PopupView.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.commands = core.lang.extend(_this.createCommands(), _this.options.commands || {});
            _this.title = _this.options.title;
            _this.menu = new core.ui.Menu(_this.getDefaultMenuMetadata());
            if (_this.options.menu) {
                _this.menu.mergeWith(_this.options.menu);
            }
            return _this;
        }
        PopupView.prototype.getDefaultMenuMetadata = function () {
            if (this.options.showCross) {
                return { items: [
                        { name: "close", icon: "close", title: resources.close, command: this.commands.Close, order: 100 }
                    ] };
            }
        };
        /**
         * Create commands
         * @protected
         * @returns {{Close: (Command)}}
         */
        PopupView.prototype.createCommands = function () {
            var that = this;
            var cmdClose = core.createCommand({
                name: "Close",
                execute: function () {
                    that.close();
                }
            });
            return {
                Close: cmdClose
            };
        };
        /** @type {Object} */
        PopupView.defaultOptions = {
            template: defaultTemplate,
            rootCssClass: "x-popupview",
            /** whether show close button */
            showCross: true
        };
        return PopupView;
    }(Popup));
    PopupView.mixin({
        defaultOptions: PopupView.defaultOptions
    });
    // popup element can host other overlayers
    //core.html.overlay.targets.push(".x-popupview");
    core.ui.PopupView = PopupView;
    return PopupView;
});
//# sourceMappingURL=PopupView.js.map