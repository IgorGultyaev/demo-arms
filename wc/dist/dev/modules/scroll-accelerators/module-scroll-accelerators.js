/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "waypoints", "xcss!./styles/scroll-accelerators"], function (require, exports, core) {
    "use strict";
    exports.__esModule = true;
    // начиная с какой позиции скрола появляются скрываемые акселераторы
    var acceleratorsShowOnPos = -42;
    var acceleratorHtml = "<a href='#' class='x-scroll-accelerator noprint' tabindex='-1'><span class='x-icon x-icon-alone'></span></a>";
    var acceleratedUpClass = "x-scroll-accel-top";
    var acceleratedDownClass = "x-scroll-accel-bottom";
    var acceleratedUpSelector = "." + acceleratedUpClass;
    var acceleratedDownSelector = "." + acceleratedDownClass;
    var acceleratorClassTmpl = "x-scroll-accelerator-";
    var accelIconClassTmpl = "x-icon-arrow-";
    var _$scrollRoot;
    function getScrollRoot(delta) {
        if (_$scrollRoot) {
            return _$scrollRoot;
        }
        var body = document.body;
        var prev = body.scrollTop;
        body.scrollTop += delta;
        if (body.scrollTop === prev) {
            // body.scrollTop is always 0
            return $(document.documentElement);
        }
        else {
            body.scrollTop -= delta;
            return core.html.$body;
        }
    }
    // создание акселераторов
    function createAccelerator(direction, domElement, clickHandler) {
        return domElement.find("." + acceleratorClassTmpl + direction).length ||
            $(acceleratorHtml)
                .appendTo(domElement)
                .addClass(acceleratorClassTmpl + direction)
                .click(clickHandler)
                .find("span")
                .addClass(accelIconClassTmpl + direction)
                .end();
    }
    function upAcceleratorClick(event) {
        event.preventDefault();
        var // позиция для проверки при акселерировании кверху
        contextBottomPos = core.$window.scrollTop(), 
        // начальная позиция куда нужно скролить
        initialScrollToPos = 0, isContent = false, checkFn = function (anchorPos, posForTest, curScrollTo, visualPageTop) {
            if (anchorPos < posForTest + visualPageTop && anchorPos > curScrollTo) {
                return anchorPos;
            }
        }, context = $(".x-scroll-accel-context").filter(":visible").first();
        if (context.length) {
            isContent = true;
            contextBottomPos = context.height();
        }
        else {
            context = getScrollRoot(-1);
        }
        processAcceleration(context, "up", checkFn, initialScrollToPos, contextBottomPos, isContent /*contentScrolling*/);
    }
    function downAcceleratorClick(event) {
        event.preventDefault();
        var // позиция для проверки при акселерировании книзу
        contextBottomPos = core.$window.scrollTop() + core.$window.height(), 
        // начальная позиция куда нужно скролить
        initialScrollToPos = core.$document.height(), isContent = false, checkFn = function (anchorPos, posForTest, curScrollTo, visualPageTop) {
            if (anchorPos > posForTest + visualPageTop && anchorPos < curScrollTo) {
                return anchorPos;
            }
        }, context = $(".x-scroll-accel-context").filter(":visible").first();
        if (context.length) {
            isContent = true;
            contextBottomPos = context.scrollTop() + context.height();
            initialScrollToPos = context.prop("scrollHeight");
        }
        else {
            context = getScrollRoot(1);
        }
        processAcceleration(context, "down", checkFn, initialScrollToPos, contextBottomPos, isContent /*contentScrolling*/);
    }
    /**
     * находит следующий элемент к которому нужно отскролится и скролится к нему
     * @param {JQuery} context - контекст скролинга
     * @param {"up"|"down"} direction - направление "up" "down"
     * @param {Function} checkFn - функция проверки элемента при поиске
     * @param {Number} initialScrollToPos - начальная позиция куда скролить (вверх или низ страницы)
     * @param {Number} contextBottomPos - координаты нижней границы
     * @param {Boolean} isContentScrolling - признак того, что скролится контент
     */
    function processAcceleration(context, direction, checkFn, initialScrollToPos, contextBottomPos, isContentScrolling) {
        var winHeight = context.height(), scrollTop = context.scrollTop(), 
        // признак нижнего акселерирования элемента
        isScrollToBottom = false, 
        // результат проверки элемента
        testResult, 
        // позиция куда нужно скролить
        scrollToPos = initialScrollToPos, 
        // суммарная высота понаприлипавших элементов до скрола
        stuckedHeightBeforeScroll = calcStuckedHeight(context, direction), 
        // вообще все ускоренные элементы в текущей area
        rawAcceleratedElements, 
        // ускоренные элементы без дочерних ускоренных элементов в текущей area (они будут видимые)
        acceleratedElements, 
        // высота прилепленных элементов
        layoutPageTop = calcFixedHeight(context, direction), 
        // визуальный верх страницы
        pageTop = layoutPageTop + stuckedHeightBeforeScroll, 
        // признак того, что будет выполнятся скролирование контента в текущем элементе
        isContentScroll = false;
        // все ускоренные элементы в текущей area (они будут видимые)
        // и из текущего контекста
        rawAcceleratedElements = context.find(acceleratedUpSelector + "," + acceleratedDownSelector)
            .filter(":visible");
        // и без детей которые тоже ускоренные
        acceleratedElements = rawAcceleratedElements
            .filter(function () {
            var elm = $(this);
            var accelParent = elm.parents(acceleratedUpSelector + "," + acceleratedDownSelector).first();
            if (!accelParent.length)
                return true;
            var parentInSet = false;
            rawAcceleratedElements.each(function () {
                if (this === accelParent.get(0)) {
                    parentInSet = true;
                    return false;
                }
            });
            return !parentInSet;
        });
        acceleratedElements.each(function () {
            var element = $(this), elementTop = element.position().top;
            // в случае скролирования контента добавить положение скрола контекста
            // т.к. положение расчитывается относительно ближайшего позиционированного родителя
            isContentScrolling && (elementTop += context.scrollTop());
            var elementScrollHeight = element.prop("scrollHeight");
            // если это элемент который находится в scrollTop и
            // не отскроллен до конца (когда скролить надо вниз)
            // 		или доскролен до верха (если вверх)
            if (elementTop === scrollTop + pageTop &&
                ((direction === "down" && elementScrollHeight !== element.scrollTop() + element.height()) ||
                    (direction === "up" && element.scrollTop() !== 0))) {
                // смотрим. есть ли у него акселерированные дети
                if (element.find(acceleratedUpSelector + "," + acceleratedDownSelector).length) {
                    // значит нужно начинать скролить контейнер. переключаем контекст
                    processAcceleration(element, direction, checkFn, direction === "down" ? element.prop("scrollHeight") : 0, direction === "down" ? element.scrollTop() + element.height() : element.scrollTop(), true /*isContentScrolling*/);
                    // в таком случае дальнейшую обработку элементов текущего контекста нужно прекращать
                    isContentScroll = true;
                    return false;
                }
            }
            // элемент акселерирован кверху
            if (element.hasClass(acceleratedUpClass) && (testResult = checkFn(elementTop, scrollTop, scrollToPos, pageTop))) {
                scrollToPos = testResult;
                isScrollToBottom = false;
            }
            // элемент акселерирован к низу
            if (element.hasClass(acceleratedDownClass) &&
                (testResult = checkFn(elementTop + element.height(), contextBottomPos, scrollToPos, pageTop))) {
                scrollToPos = testResult;
                isScrollToBottom = true;
            }
        });
        if (isContentScroll)
            return;
        scrollToPos = isScrollToBottom ? (scrollToPos - winHeight) : (scrollToPos - pageTop);
        context.animate({ scrollTop: scrollToPos }, 100, function () {
            // если в процессе скролинга что-то прилипло, то нужно высчитать новую высоту прилипших
            var stuckedHeightAfterScroll = calcStuckedHeight(context, direction);
            // прилипло новое. нужно компенсировать
            if (stuckedHeightAfterScroll !== stuckedHeightBeforeScroll) {
                context.animate({ scrollTop: scrollToPos - stuckedHeightAfterScroll }, 100);
            }
        });
    }
    // TODO эти две функции надо куда-то вынести.
    var fixedTopClass = ".x-layout-top-fixed";
    var fixedBottomClass = ".x-layout-bottom-fixed";
    function calcFixedHeight(context, direction) {
        var total = 0, dataHeight, elementHeight, fixedClass = direction === "up" ? fixedTopClass : fixedBottomClass;
        context.find(fixedClass).each(function () {
            var element = $(this);
            if (element.css("position") === "fixed") {
                elementHeight = element.outerHeight();
                (dataHeight = element.attr("data-offset-height")) &&
                    dataHeight > elementHeight &&
                    (elementHeight = dataHeight);
                total += elementHeight;
            }
        });
        return total;
    }
    var stuckedTopClass = ".affix-stuck-top";
    var stuckedBottomClass = ".affix-stuck-bottom";
    function calcStuckedHeight(context, direction) {
        var total = 0, stuckedClass = direction === "up" ? stuckedTopClass : stuckedBottomClass;
        context.find(stuckedClass).filter(":visible").each(function () {
            total += $(this).outerHeight();
        });
        return total;
    }
    core.createModule("scroll-accelerators", function (app, options) {
        return {
            initialize: function (app) {
                if (!options || !options.disabled) {
                    var $container = $("<div class='x-scroll-accelerators'></div>").appendTo(core.html.$body);
                    createAccelerator("up", $container, upAcceleratorClick);
                    createAccelerator("down", $container, downAcceleratorClick);
                    core.$window.waypoint(function (direction) {
                        if (direction === "down") {
                            $(".x-scroll-accelerators").addClass("x-scroll-accelerators--show");
                        }
                        else {
                            $(".x-scroll-accelerators").removeClass("x-scroll-accelerators--show");
                        }
                    }, {
                        offset: acceleratorsShowOnPos
                    });
                    core.platform.bind("change:printing", function (sender, value) {
                        $(".x-scroll-accelerators").toggle(!value);
                    });
                }
            }
        };
    });
});
//# sourceMappingURL=module-scroll-accelerators.js.map