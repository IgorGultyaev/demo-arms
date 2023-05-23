/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "vendor/jquery.scrollTo"], function (require, exports, $, lang) {
    "use strict";
    exports.__esModule = true;
    /**
     * @exports "core.html"
     */
    exports.$document = $(document);
    exports.$window = $(window);
    exports.$body = $(document.body);
    exports.platform = { isMobileDevice: undefined }; // NOTE: assigned in core.js after core.Platform initialized
    var ignoreWindowUnload;
    // NOTE: In Chrome a click on a "mailto:" link raises window's beforeunload/unload events.
    // That's terrible as in beforeunload we unload all areas and regions.
    // So here's a hack especially for Chrome:
    // `preventWindowUnload` method sets a special flag (it should be called in mailto's onclick handler)
    // and a beforeunload handler checks it later.
    // We cannot just set and leave the flag as in other browsers
    // (or even in Chrome if it changes its behavior later) it'll prevent our logic in beforeunload from execution.
    // So we clear it via setTimeout.
    window.preventWindowUnload = function () {
        ignoreWindowUnload = true;
        window.setTimeout(function () {
            ignoreWindowUnload = false;
        });
    };
    exports.$window.bind("beforeunload", function (e) {
        if (ignoreWindowUnload) {
            e.stopImmediatePropagation();
            e.preventDefault();
            ignoreWindowUnload = false;
        }
    });
    // prevent opening dragged files in window
    exports.$document.on("drop dragover", function (e) {
        e.preventDefault();
    });
    function _isDisplayed(element) {
        // fast-forward check for the current element
        if (element.style && element.style.display === "none")
            return false;
        var display = findEffectiveStyleProperty(element, "display");
        if (display === "none")
            return false;
        if (!element.parentNode) {
            // reach the root, if it's document that 'visible' otherwise it's a detached element (i.e. 'not-visible)
            return element === element.ownerDocument;
        }
        if (element.parentNode.style) {
            return _isDisplayed(element.parentNode);
        }
        return true;
    }
    /**
     * Determines if the specified element is visible.
     * An element can be rendered invisible by setting the CSS "visibility"
     * property to "hidden", or the "display" property to "none", either for the
     * element itself or one if its ancestors.  This method will fail if
     * the element is not present.
     * @description Code was borrowed from Selenium (http://svn.openqa.org/svn/selenium-on-rails/selenium-on-rails/selenium-core/scripts/selenium-api.js)
     * @param {HTMLElement|JQuery} element an HTMLDOMElement or jquery selector
     * @return {boolean} true if the specified element is visible, false otherwise
     */
    function isVisible(element) {
        var htmlElement = element.nodeType ? element : element[0];
        // DGF if it's an input tag of type "hidden" then it's not visible
        if (htmlElement.tagName && htmlElement.type) {
            if (htmlElement.tagName.toLowerCase() == "input" && htmlElement.type.toLowerCase() == "hidden") {
                return false;
            }
        }
        if (!_isDisplayed(htmlElement))
            return false;
        var visibility = findEffectiveStyleProperty(htmlElement, "visibility");
        return (visibility != "hidden");
    }
    exports.isVisible = isVisible;
    function findEffectiveStyleProperty(element, property) {
        var effectiveStyle = findEffectiveStyle(element);
        var propertyValue = effectiveStyle[property];
        if (propertyValue === "inherit" && element.parentNode && element.parentNode.style) {
            return findEffectiveStyleProperty(element.parentNode, property);
        }
        return propertyValue;
    }
    exports.findEffectiveStyleProperty = findEffectiveStyleProperty;
    function findEffectiveStyle(element) {
        if (element.style == undefined) {
            return undefined; // not a styled element
        }
        if (window.getComputedStyle) {
            // DOM-Level-2-CSS
            return window.getComputedStyle(element, null);
        }
        if (element["currentStyle"]) {
            // non-standard IE alternative
            return element["currentStyle"];
            // TODO: this won't really work in a general sense, as
            //   currentStyle is not identical to getComputedStyle()
            //   ... but it's good enough for "visibility"
        }
        if (window.document.defaultView && window.document.defaultView.getComputedStyle) {
            return window.document.defaultView.getComputedStyle(element, null);
        }
        throw new Error("cannot determine effective stylesheet in this browser");
    }
    exports.findEffectiveStyle = findEffectiveStyle;
    /**
     * Concatenates string and className using space as separator. Doesn't check for duplicates.
     * @param s
     * @param className
     * @returns {string}
     */
    function appendCssClass(s, className) {
        return s ? s + " " + className : className;
    }
    exports.appendCssClass = appendCssClass;
    /**
     * Concatenates string and className using space as separator. Doesn't modify input string if it already contains className.
     * @param s
     * @param className
     * @returns {string}
     */
    function addCssClass(s, className) {
        if (!s) {
            return className;
        }
        var classes = s.split(" ");
        return classes.indexOf(className) >= 0 ? s : s + " " + className;
    }
    exports.addCssClass = addCssClass;
    function removeCssClass(s, className) {
        if (!s) {
            return s;
        }
        var classes = s.split(" ");
        return lang.arrayRemove(classes, className) ? classes.join(" ") : s;
    }
    exports.removeCssClass = removeCssClass;
    var _viewport = { height: 0, width: 0 }; // cache object for getDisplayViewport
    /**
     * Return display viewport (display viewport defers from layout viewport on mobile device)
     * @returns {{height: Number, width: Number}}
     */
    function getDisplayViewport() {
        _viewport.height = exports.platform.isMobileDevice ? window.innerHeight : this.$window.height();
        _viewport.width = exports.platform.isMobileDevice ? window.innerWidth : this.$window.width();
        return _viewport;
    }
    exports.getDisplayViewport = getDisplayViewport;
    var scrollAlignModes = {
        "top": "top",
        "bottom": "bottom",
        "center": "center"
    };
    /**
     * Scroll document to element
     * @param {Object|HTMLElement|jQuery} options an options or HTMLElement (see. options.element)
     * @param {HTMLElement|jQuery} options.element An element to scroll to
     * @param {String} [options.align="top"] align mode: "top", "bottom", "center"
     * @param {Number} [options.margin=0] margin for top/bottom align
     * @param {{top:Number,height:Number}} [options.viewport]
     * @param {Function} [options.onAfter] Function to be called after the scrolling ends
     */
    function scrollToElement(options) {
        if (!options)
            return;
        var opts;
        if (options instanceof $ || options["nodeType"] !== undefined) {
            opts = { element: options };
        }
        else {
            opts = options;
        }
        if (!opts.element)
            return;
        var align = opts.align || "top";
        if (!scrollAlignModes[align])
            throw new Error("html.scrollToElement: unknown align mode: " + align);
        var $element = $(opts.element), elementTop = $element.offset().top, elementHeight = $element.outerHeight(), viewportTop = this.$window.scrollTop(), viewportBottom = viewportTop + this.$window.height(), scrollTo;
        if (elementTop < viewportTop || elementTop + elementHeight > viewportBottom || opts.force) {
            // element is out of viewport, we need to scroll document to it
            if (align === "center") {
                scrollTo = elementTop -
                    ((viewportBottom + viewportTop) / 2 - viewportTop) + // the relative position of viewPort centre
                    elementHeight / 2;
            }
            else if (align === "top") {
                scrollTo = elementTop;
            }
            else if (align === "bottom") {
                scrollTo = elementTop + elementHeight - (viewportBottom - viewportTop);
            }
            $.scrollTo(scrollTo, 100, { easing: "swing", onAfter: opts.onAfter });
        }
        else if (opts.onAfter) {
            opts.onAfter();
        }
    }
    exports.scrollToElement = scrollToElement;
    /**
     * Check whether document's root is wider than browser screen, i.e. there should be horizontal scrollbar (if "overflow-x:auto")
     * @returns {boolean}
     */
    function isDocumentHScrollable() {
        if (exports.platform.isMobileDevice) {
            // "zoom" on mobile means viewports are not equals (see http://www.quirksmode.org/mobile/viewports2.html)
            return document.documentElement.clientWidth !== window.innerWidth;
        }
        try {
            // Taken from: http://stackoverflow.com/questions/6605367/how-do-i-detect-if-there-are-scrollbars-on-a-browser-window
            var root = document.compatMode === "BackCompat" ? document.body : document.documentElement;
            return root.scrollWidth > root.clientWidth;
        }
        catch (e) { }
        return false;
    }
    exports.isDocumentHScrollable = isDocumentHScrollable;
    /**
     * Find focused DOM element
     * @returns {HTMLElement} focused DOM element or null
     */
    function focused() {
        var element = document.activeElement;
        return (element && element.tagName !== "BODY" && (!document.hasFocus || document.hasFocus())) ? element : null;
    }
    exports.focused = focused;
    /**
     * Collection of keyboard constants with some support functions
     */
    exports.keyCode = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        INSERT: 45,
        DELETE: 46,
        NUM_0: 48,
        NUM_1: 49,
        NUM_2: 50,
        NUM_3: 51,
        NUM_4: 52,
        NUM_5: 53,
        NUM_6: 54,
        NUM_7: 55,
        NUM_8: 56,
        NUM_9: 57,
        C: 67,
        D: 68,
        F: 70,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_ADD: 107,
        NUMPAD_ENTER: 108,
        NUMPAD_SUBTRACT: 109,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        COMMA: 188,
        PERIOD: 190,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        /**
         * Return true if key in keyboard event is keyboard navigation
         * @param {Object} keyEvent - jQuery event
         * @returns {boolean} true if key in event is keyboard navigation
         */
        isNavigationKey: function (keyEvent) {
            if (!keyEvent) {
                return false;
            }
            return [
                exports.keyCode.TAB,
                exports.keyCode.PAGE_UP,
                exports.keyCode.PAGE_DOWN,
                exports.keyCode.END,
                exports.keyCode.HOME,
                exports.keyCode.LEFT,
                exports.keyCode.UP,
                exports.keyCode.RIGHT,
                exports.keyCode.DOWN
            ].indexOf(keyEvent.which) >= 0;
        },
        isDigit: function (keyEvent) {
            if (!keyEvent) {
                return false;
            }
            return [
                exports.keyCode.NUM_0,
                exports.keyCode.NUM_1,
                exports.keyCode.NUM_2,
                exports.keyCode.NUM_3,
                exports.keyCode.NUM_4,
                exports.keyCode.NUM_5,
                exports.keyCode.NUM_6,
                exports.keyCode.NUM_7,
                exports.keyCode.NUM_8,
                exports.keyCode.NUM_9
            ].indexOf(keyEvent.which) >= 0;
        },
        isF: function (keyEvent) {
            if (!keyEvent) {
                return false;
            }
            return [
                exports.keyCode.F1,
                exports.keyCode.F2,
                exports.keyCode.F3,
                exports.keyCode.F4,
                exports.keyCode.F5,
                exports.keyCode.F6,
                exports.keyCode.F7,
                exports.keyCode.F8,
                exports.keyCode.F9,
                exports.keyCode.F10,
                exports.keyCode.F11,
                exports.keyCode.F12
            ].indexOf(keyEvent.which) >= 0;
        }
    };
    /**
     * Appends overlayer element (popup, dropdown ect.) to DOM in order to show it over other elements
     * @param {HTMLElement|jQuery} overlayer an element to overlay
     * @param {HTMLElement|jQuery} [owner] an element in main markup, which owns the overlayer (e.g. input element for dropdown)
     * @returns {jQuery} a target element where the 'overlayer' is appended to (if any) or an empty jQuery set.
     */
    function overlay(overlayer, owner) {
        var $overlayer = $(overlayer), $owner, $target, zindexTarget, zindexOverlay;
        if (owner) {
            $owner = $(owner);
            // find any of html.overlay.targets
            $target = $owner.closest(overlay.targets.join(","));
        }
        if (!$target || !$target.length) {
            $overlayer.appendTo("body");
            return $(); // empty jQuery set
        }
        $overlayer.appendTo($target);
        // increase z-index
        zindexTarget = parseInt($target.css("z-index"), 10);
        zindexOverlay = parseInt($overlayer.css("z-index"), 10);
        if (!isNaN(zindexTarget) && !isNaN(zindexOverlay)) {
            $overlayer.css("z-index", zindexTarget + zindexOverlay);
        }
        return $target;
    }
    exports.overlay = overlay;
    /**
     * The extensible list of selectors which can host overlayers
     * @type {Array}
     */
    overlay.targets = [];
    function notifyDOMChanged(element) {
        // NOTE: currently we're just firing the custom event on the document.
        // It can be changed in the future: firing the event on the source element itself and then bubbling to the document.
        if (element) {
            $(element).trigger("domChanged");
        }
        else {
            exports.$document.trigger("domChanged");
        }
    }
    exports.notifyDOMChanged = notifyDOMChanged;
    var WindowResizeEvent = /** @class */ (function (_super) {
        __extends(WindowResizeEvent, _super);
        function WindowResizeEvent() {
            return _super.call(this, exports.$window) || this;
        }
        WindowResizeEvent.prototype.onResize = function (e) {
            this.trigger(e);
        };
        WindowResizeEvent.prototype.onFirstBind = function () {
            var that = this;
            that._onResizeDebounced = lang.debounce(that.onResize.bind(that), 100);
            exports.$window.bind("resize", that._onResizeDebounced);
        };
        WindowResizeEvent.prototype.onLastUnbind = function () {
            exports.$window.unbind("resize", this._onResizeDebounced);
        };
        return WindowResizeEvent;
    }(lang.Event));
    exports.WindowResizeEvent = WindowResizeEvent;
    /**
     * Global debounced event 'window.resize'
     */
    exports.windowResize = new WindowResizeEvent();
    function isExternalClick(e) {
        if (e.currentTarget && e.currentTarget.tagName === "A" &&
            (e.ctrlKey || e.shiftKey || e.altKey || e.which > 1)) {
            // if user clicks a link with ctrl/shift/alt/wheel then let the browser to process the click
            // NOTE: left mouse button = 1, but in IE8 it's always 0!
            var href = $(e.currentTarget).attr("href");
            if (href && href !== "#") {
                return true;
            }
        }
        return false;
    }
    exports.isExternalClick = isExternalClick;
});
//# sourceMappingURL=core.html.js.map