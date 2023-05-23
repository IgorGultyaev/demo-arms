/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "i18n!modules/clipboard/nls/resources", "xcss!modules/clipboard/styles/copy-button"], function (require, exports, $, core, resourcesModule) {
    "use strict";
    exports.__esModule = true;
    exports.isSupported = document.queryCommandSupported && document.queryCommandSupported("copy");
    if (exports.isSupported) {
        // Additionally check version of the browser. See:
        //  https://hacks.mozilla.org/2015/09/flash-free-clipboard-for-the-web/
        //  https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
        // Supported in: Chrome - 43+, Firefox - 41+, IE - 8+, Opera - 29+, Safari - Nope
        var browser = core.platform.browser;
        if (browser.webkit && browser.webkit.version < 43 ||
            browser.firefox && browser.firefox.version < 41) {
            //browser.ie && browser.ie.version < 9 /* browser.ie && browser.opera.version<29 || browser.safari */) {
            exports.isSupported = false;
        }
    }
    /**
     * Copies text data to clipboard
     * @param {string} data
     * @returns {boolean}
     */
    function copy(data) {
        if (!data || !exports.isSupported) {
            return false;
        }
        var $element = $("<textarea></textarea>");
        try {
            // Prevent zooming on iOS
            $element
                .css({
                // Prevent zooming on iOS
                fontSize: "12pt",
                position: "absolute",
                left: "-1000px",
                // Move element to the same position vertically
                top: (window.pageYOffset || document.documentElement.scrollTop) + "px"
            })
                .val(data)
                .focusin(function () { return false; })
                .appendTo(document.body)
                .select();
            // NOTE: select won't work on iOS it should be:
            // $element.focus();
            // $element[0].setSelectionRange(0, data.length);
            // but execCommand("copy") also won't work on iOS and Safari
            return document.execCommand("copy");
        }
        catch (ex) {
            // an error signals that copy to clipboard is not supported
            exports.isSupported = false;
            return false;
        }
        finally {
            $element.remove();
        }
    }
    exports.copy = copy;
    var CopyButton = /** @class */ (function () {
        function CopyButton(target, options) {
            if (!exports.isSupported) {
                return;
            }
            var that = this, $element = $(target);
            that.$element = $element;
            that.options = options;
            that._click = that.onClick.bind(that);
            $element.click(that._click);
            var tooltipOpts = that.options.tooltip;
            if (tooltipOpts) {
                that._tooltipTitle = resourcesModule["clipboard.copy"];
                tooltipOpts = core.lang.extend({
                    title: function () { return that._tooltipTitle; },
                    placement: "top",
                    trigger: "hover",
                    delay: { show: 200, hide: 0 }
                }, tooltipOpts);
                $element.tooltip(tooltipOpts);
            }
        }
        CopyButton.prototype.onClick = function () {
            var that = this, text = that.options.text(), copied = copy(text);
            if (copied && that.options.tooltip) {
                that._tooltipTitle = resourcesModule["clipboard.copied"];
                that.$element.tooltip("show");
                that._tooltipTitle = resourcesModule["clipboard.copy"];
            }
            // TODO: error handling
        };
        CopyButton.prototype.dispose = function () {
            var that = this;
            that.$element.off("click", that._click);
            if (that.options.tooltip) {
                that.$element.tooltip("destroy");
            }
        };
        return CopyButton;
    }());
    exports.CopyButton = CopyButton;
    core.ui.clipboard = {
        isSupported: exports.isSupported,
        copy: copy,
        CopyButton: CopyButton
    };
});
//# sourceMappingURL=module-clipboard.js.map