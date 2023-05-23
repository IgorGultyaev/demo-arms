/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/core.html", "xcss!lib/ui/styles/core.jquery"], function (require, exports, $, lang, html) {
    "use strict";
    var keyCode = html.keyCode;
    /**
     * @deprecated use core.html.windowResize
     * Source: http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/
     * @param fn
     * @returns {*|function(this:string)}
     */
    $.fn.smartresize = function (fn) {
        return fn ? this.bind("resize", lang.debounce(fn, 100)) : this.trigger("smartresize");
    };
    /**
    * JQuery плагин для единообразной обработки клика мышкой и нажатии space или enter на элементах.
    * При нажатии на пробел или Enter по умолчанию вызывается событие click, но клавишные
    * события "поднимаются" выше. Это неудобно, если выше также есть обрабочик этих клавиш.
    * Поэтому явно давится обработку пробела и Enter-а.
    *
    * @param {function} handler обработчик клика, нажатия space|enter
    * @returns {object} chained JQuery селектор
    * @example
    * $("#someButton").buttonClick(function(e) {
    *			return false;
    * });
    */
    $.fn.buttonClick = function (handler) {
        return this.each(function () {
            var $this = $(this);
            $this.on("keydown keypress", function (e) {
                if (e.which === keyCode.ENTER || e.which === keyCode.SPACE) {
                    return false;
                }
            });
            $this.on("keyup", function (e) {
                if (e.which === keyCode.ENTER || e.which === keyCode.SPACE) {
                    e.preventDefault();
                    this.click();
                    return false;
                }
            });
            $this.on("click", handler);
            // TODO: use Fast Buttons (https://developers.google.com/mobile/articles/fast_buttons) or similar
        });
    };
    /**
     * Disable/enabled UI for each of the set of matched elements.
     * @param {boolean} [blocked=true]
     */
    $.fn.blocked = function (blocked) {
        // TODO: message or html to display over disabled element
        if (blocked === void 0) { blocked = true; }
        var that = this;
        if (blocked) {
            // NOTE: add 'blocked' class to all non-static elements
            that.each(function () {
                var $this = $(this), position = $this.css("position");
                if (!position || position === "static") {
                    $this.addClass("blocked");
                }
            });
            that.append("<div class='blocked-overlay'></div>");
        }
        else {
            that.find(">div.blocked-overlay").remove();
            that.removeClass("blocked");
        }
        return that;
    };
    function elementBox($element, position) {
        var offset = position || $element.offset(), h = $element.outerHeight(), w = $element.outerWidth();
        return {
            top: offset.top,
            left: offset.left,
            bottom: offset.top + h - 1,
            right: offset.left + w - 1,
            height: h,
            width: w
        };
    }
    /**
     * Change offset of an element to ensure it is fully visible inside a container element
     * @param container
     * @param {object} [position] Desired position of this element. If omitted current position is used.
     * @param {number} [position.top]
     * @param {number} [position.left]
     */
    $.fn.within = function (container, position) {
        var $container = $(container), containerBox = elementBox($container), box = elementBox(this, position), top, left;
        if (box.top < containerBox.top) {
            top = containerBox.top;
        }
        else if (box.bottom > containerBox.bottom) {
            top = Math.max(containerBox.top, containerBox.bottom - box.height + 1);
        }
        else if (position) {
            top = position.top;
        }
        if (box.left < containerBox.left) {
            left = containerBox.left;
        }
        else if (box.right > containerBox.right) {
            left = Math.max(containerBox.left, containerBox.right - box.width + 1);
        }
        else if (position) {
            left = position.left;
        }
        if (top !== undefined || left !== undefined) {
            this.offset({ top: top, left: left });
        }
        return this;
    };
    function textOverflow_onMouseEnter() {
        var $this = $(this);
        if ($this.innerWidth() < this.scrollWidth) {
            $this.attr("title", $.trim($this.text()));
        }
        else {
            $this.removeAttr("title");
        }
    }
    /**
     * Cuts too long text of every element and sets it as a title.
     * @returns {JQuery} the original jQuery set (this)
     */
    $.fn.textOverflow = function () {
        return this.addClass("text-overflow").mouseenter(textOverflow_onMouseEnter);
    };
    /**
     * Prevent bubbling of mouse and keyboard events outside of the element
     * @returns {JQuery} the original jQuery set (this)
     */
    $.fn.stopBubbling = function () {
        return this.on("click mousedown keydown keyup keypress show.bs.dropdown domChanged", function (e) {
            e.stopPropagation();
        });
    };
    /**
     * Prevent bubbling of keyboard events outside of the element
     * @returns {JQuery} the original jQuery set (this)
     */
    $.fn.stopKeyboardBubbling = function () {
        return this.on("keydown keyup keypress", function (e) {
            e.stopPropagation();
        });
    };
    if (!$.fn.zIndex) {
        // zIndex was removed in jQuery 1.11, it's copy-paste from jquery-ui#1.10.4
        $.fn.zIndex = function (zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }
            if (this.length) {
                var elem = $(this[0]), position = void 0, value = void 0;
                while (elem.length && elem[0] !== document) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }
            return 0;
        };
    }
    return $;
});
//# sourceMappingURL=core.jquery.js.map