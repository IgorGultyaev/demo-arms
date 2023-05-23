/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/core.html", "xcss!./styles/affix"], function (require, exports, $, lang, html) {
    "use strict";
    exports.__esModule = true;
    var utils;
    (function (utils) {
        function toElement(element) {
            return (!element || element.nodeType) ? element : element[0];
        }
        utils.toElement = toElement;
        var _window;
        function invalidate() {
            _window = undefined;
        }
        utils.invalidate = invalidate;
        /**
         * Get the position of the element relative to the document
         * @param element
         * @returns {Position}
         */
        function pos(element) {
            var wndPos = windowPos();
            var rect = toElement(element).getBoundingClientRect();
            return {
                top: rect.top + wndPos.top,
                bottom: rect.bottom + wndPos.top,
                left: rect.left + wndPos.left,
                right: rect.right + wndPos.left,
                height: rect.bottom - rect.top,
                width: rect.right - rect.left // rect.width  may be undefined in old browsers
            };
        }
        utils.pos = pos;
        /**
         * Get the position of the window relative to the document
         * @returns {Position}
         */
        function windowPos() {
            if (!_window) {
                var top_1 = html.$window.scrollTop(), left = html.$window.scrollLeft(), height = html.$window.outerHeight(), width = html.$window.outerWidth();
                _window = {
                    top: top_1,
                    bottom: top_1 + height,
                    left: left,
                    right: left + width,
                    height: height,
                    width: width
                };
            }
            return _window;
        }
        utils.windowPos = windowPos;
        function intersectedHorz(pos1, pos2) {
            // Intersected:
            //    [pos1.left, pos1.right]
            //          [pos1.left, pos2.right]
            // OR
            //    [pos1.left, pos1.right]
            //   [pos1.left,     pos2.right]
            // OR
            //         [pos1.left, pos1.right]
            //   [pos1.left, pos2.right]
            // Not intersected:
            //                           [pos1.left, pos1.right]
            //   [pos1.left, pos2.right]
            // OR
            //   [pos1.left, pos1.right]
            //                         [pos1.left, pos2.right]
            // OR
            //                         [pos1.left, pos1.right]
            //   [pos1.left, pos2.right]
            return pos1.left < pos2.right && pos1.right > pos2.left;
        }
        utils.intersectedHorz = intersectedHorz;
    })(utils = exports.utils || (exports.utils = {}));
    var AffixManager = /** @class */ (function () {
        function AffixManager(options) {
            /**
             * @readonly
             */
            this._items = {
                top: new AffixStack("top"),
                bottom: new AffixStack("bottom")
            };
            this.options = lang.append(options || {}, AffixManager.defaultOptions);
            this.init();
        }
        AffixManager.prototype.init = function () {
            var that = this;
            that._offset = {
                top: that.options.topOffset || that.calcDirOffset("top"),
                bottom: that.options.bottomOffset || that.calcDirOffset("bottom")
            };
        };
        AffixManager.prototype.addElement = function (options) {
            if (!options.element) {
                options = { element: options };
            }
            if (!this.validateElement(options.element)) {
                return;
            }
            var item = new AffixItemImpl(options);
            var stack = this._items[item.dir];
            stack.add(item);
            this.refresh();
        };
        AffixManager.prototype.removeElement = function (options) {
            var element = $(options.element || options)[0];
            if (!this.validateElement(element)) {
                return;
            }
            for (var _i = 0, _a = [this._items.top, this._items.bottom]; _i < _a.length; _i++) {
                var stack = _a[_i];
                var index = lang.findIndex(stack.items, function (item) { return item.$element[0] === element; });
                if (index >= 0) {
                    var item = stack.items[index];
                    item.detach();
                    stack.remove(index);
                    this.refresh();
                    return;
                }
            }
        };
        AffixManager.prototype.suspend = function (options) {
            if (options === void 0) { options = { suspend: true }; }
            this._suspended = options.suspend;
            this.runRefresh(1 /* forced */);
        };
        /**
         * Asynchronously refreshes affixing state for all items
         * @params {Object} [options]
         * @param {number} [options.mode]
         */
        AffixManager.prototype.refresh = function (options) {
            var that = this;
            that._scheduledMode = that.getRefreshMode(options);
            if (!that._scheduledTimeout) {
                that._scheduledTimeout = window.setTimeout(function () {
                    that._scheduledTimeout = undefined;
                    that.runRefresh(that._scheduledMode);
                });
            }
        };
        /**
         * Synchronously refreshes affixing state for all items, if asynchronous refreshing was scheduling
         */
        AffixManager.prototype.refreshIfScheduled = function () {
            if (this._scheduledTimeout) {
                this.runRefresh(this._scheduledMode);
            }
        };
        /**
         * Synchronously refreshes affixing state for all items
         * @params {Object} [options]
         * @param {number} [options.mode]
         */
        AffixManager.prototype.refreshSync = function (options) {
            var mode = this.getRefreshMode(options);
            this.runRefresh(mode);
        };
        AffixManager.prototype.getRefreshMode = function (options) {
            var mode = (options && options.mode) || 0 /* normal */;
            return this._scheduledMode === undefined ? mode : Math.max(this._scheduledMode, mode);
        };
        AffixManager.prototype.clearScheduled = function () {
            this._scheduledMode = undefined;
            if (this._scheduledTimeout) {
                window.clearTimeout(this._scheduledTimeout);
                this._scheduledTimeout = undefined;
            }
        };
        AffixManager.prototype.runRefresh = function (mode) {
            var that = this;
            var stacks = [that._items.top, that._items.bottom];
            that.invalidate();
            if (mode === 1 /* forced */) {
                // открепляем все элементы
                stacks.forEach(function (stack) {
                    stack.restore();
                });
                // переинициализируем
                that.init();
            }
            if (!that._suspended) {
                // сначала пересчитываем позиции элементов
                if (mode >= 0 /* normal */) {
                    stacks.forEach(function (stack) {
                        stack.recalc();
                    });
                }
                // собственно прикрепление
                stacks.forEach(function (stack) {
                    stack.refresh(that);
                });
            }
        };
        AffixManager.prototype.invalidate = function () {
            this.clearScheduled();
            // invalidate window position
            utils.invalidate();
        };
        AffixManager.prototype.getItemViewport = function (item) {
            var offsetTop = this._items.top.calcItemOffset(item) + this._offset.top;
            var offsetBottom = this._items.bottom.calcItemOffset(item) + this._offset.bottom;
            return this.createViewport(offsetTop, offsetBottom);
        };
        AffixManager.prototype.getElementViewport = function (pos) {
            var offsetTop = this._items.top.calcElementOffset(pos) + this._offset.top;
            var offsetBottom = this._items.bottom.calcElementOffset(pos) + this._offset.bottom;
            return this.createViewport(offsetTop, offsetBottom);
        };
        AffixManager.prototype.isInViewport = function (element, align) {
            if (!this.validateElement(element)) {
                return true;
            }
            var window = utils.windowPos();
            var pos = utils.pos(element);
            // элемент за пределами текущего окна - нет смысла вычислять viewport
            if (!this.isInside(pos, window, align)) {
                return false;
            }
            var viewport = this.getElementViewport(pos);
            return this.isInside(pos, viewport, align);
        };
        AffixManager.prototype.getScrollTop = function (element, align) {
            var that = this;
            if (!that.validateElement(element)) {
                return undefined;
            }
            var window = utils.windowPos();
            var pos = utils.pos(element);
            var offsets = lang.clone(that._offset);
            function calcViewport() {
                var height = window.height - offsets.top - offsets.bottom;
                var top;
                switch (align) {
                    case "top":
                        top = pos.top;
                        break;
                    case "bottom":
                        top = Math.max(0, pos.bottom - height);
                        break;
                    case "center":
                        top = Math.max(0, (pos.top + pos.bottom - height) / 2);
                        break;
                }
                return that.createViewport(offsets.top, offsets.bottom, top);
            }
            var viewport = calcViewport();
            var directions = ["bottom", "top"];
            for (var _i = 0, directions_1 = directions; _i < directions_1.length; _i++) {
                var dir = directions_1[_i];
                for (var _a = 0, _b = that._items[dir].items; _a < _b.length; _a++) {
                    var item = _b[_a];
                    if (utils.intersectedHorz(item.pos, pos) && item.shouldAttach(viewport)) {
                        offsets[dir] += item.pos.height;
                        viewport = calcViewport();
                    }
                }
            }
            return viewport.top - viewport.offsetTop;
        };
        AffixManager.prototype.validateElement = function (element) {
            return element && element.length !== 0;
        };
        AffixManager.prototype.calcDirOffset = function (dir) {
            var total = 0;
            $(".x-layout-" + dir + "-fixed").each(function (i, elem) {
                var pos = utils.pos(elem), windowPos = utils.windowPos(), offset = Math.abs(pos[dir] - windowPos[dir]) + pos.height;
                total = Math.max(total, offset);
            });
            return total;
        };
        AffixManager.prototype.isInside = function (pos, rect, align) {
            if (pos.height <= rect.height) {
                // элемент меньшего размера должен быть полностью виден
                return pos.top >= rect.top && pos.bottom <= rect.bottom;
            }
            var y;
            switch (align) {
                case "top":
                    y = pos.top;
                    break;
                case "center":
                    y = (pos.top + pos.bottom) / 2;
                    break;
                case "bottom":
                    y = pos.bottom;
                    break;
            }
            return rect.top <= y && y <= rect.bottom;
        };
        AffixManager.prototype.createViewport = function (offsetTop, offsetBottom, top) {
            var window = utils.windowPos();
            var height = window.height - offsetTop - offsetBottom;
            if (top === undefined) {
                top = window.top + offsetTop;
            }
            return {
                top: top,
                bottom: top + height,
                left: window.left,
                right: window.right,
                height: height,
                width: window.width,
                offsetTop: offsetTop,
                offsetBottom: offsetBottom
            };
        };
        AffixManager.knownStuckBehaviors = {
            /**
             * Default behavior which creates a placeholder element
             */
            "default": {
                attach: function (item) {
                    // NOTE: placeholder может создаваться внутри других stuckBehaviors
                    if (!item.$placeholder) {
                        item.$placeholder = $("<div class='sticky-stub noprint'></div>")
                            .css({
                            position: item.$element.css("position"),
                            height: item.pos.height + "px"
                        })
                            .insertBefore(item.$element);
                        /* TODO: WC-1628
                        // if we're in dialog (.modal) then we have to move element from inside its parent
                        if (item.$element.parents(".modal").css("position") === "fixed") {
                            item.$element.insertBefore(".modal");
                            item.moved = true;
                        }*/
                    }
                },
                reflow: function (item, viewport) {
                    // NOTE: Позиция элемента могла измениться из-за прилипания/отлипания предшествующих элементов или
                    // изменения их высоты. Поэтому устанавливать позицию нужно всегда, даже если элемент уже был прилеплен.
                    var offset = item.dir === "top" ? viewport.offsetTop : viewport.offsetBottom;
                    item.$element.css(item.dir, offset + "px");
                    item.affixedOffset = offset;
                },
                detach: function (item) {
                    if (item.$placeholder) {
                        /*TODO: WC-1628
                        if (item.moved) {
                            // item was moved out of its parent, move it back
                            item.$element.insertAfter(item.$placeholder);
                            item.moved = false;
                        }*/
                        item.$placeholder.remove();
                        item.$placeholder = undefined;
                    }
                    item.$element.css(item.dir, "");
                    item.affixedOffset = undefined;
                }
            },
            controlledBy: {
                recalc: function (item) {
                    item._ctrlByPos = undefined; // reset cached position of controlledBy element
                },
                shouldAttach: function (item, viewport) {
                    var ctrlBy = item.options.controlledBy;
                    if (ctrlBy) {
                        //let ctrlByPos = utils.pos(ctrlBy);
                        var ctrlByPos = item._ctrlByPos || (item._ctrlByPos = utils.pos(ctrlBy));
                        if (item.dir === "top") {
                            if (ctrlByPos.bottom < viewport.top + item.pos.height || ctrlByPos.top > viewport.bottom) {
                                return false;
                            }
                        }
                        else {
                            if (ctrlByPos.bottom < viewport.top || ctrlByPos.top > viewport.bottom - item.pos.height) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            },
            preserveWidth: {
                attach: function (item) {
                    // backup width val
                    if (item.options.fixedWidth) {
                        var widthOld = item.$element.css("width");
                        if (widthOld !== undefined) {
                            item.$element.data("affix-width", widthOld);
                        }
                    }
                    var width = item.pos.width + "px";
                    item.$element.css("width", width);
                    if (item.$placeholder) {
                        item.$placeholder.css("width", width);
                    }
                },
                detach: function (item) {
                    // backup width val
                    var widthOld = item.options.fixedWidth ? item.$element.data("affix-width") || "" : "";
                    item.$element.css("width", widthOld);
                }
            },
            hscroll: {
                reflow: function (item, viewport) {
                    // TODO: для элементов с margin-left будет прыжок право, т.к. pos.left уже равен left+margin
                    // NOTE: в pos.left у нас резальтат getBoundingClientRect, который учитывает margin-Left,
                    // если мы просто установим это значение для элемента с margin-left, то он сдвинется вправо на величину margin (WC-1844)
                    // поэтому мы ее вычитаем
                    var marginLeft = parseInt(item.$element.css("margin-left")) || 0;
                    item.$element.css("left", (item.pos.left - viewport.left - marginLeft) + "px");
                },
                detach: function (item) {
                    item.$element.css("left", "");
                }
            },
            suspendByScreenWidth: {
                shouldAttach: function (item) {
                    var minWidth = item.options.suspendByScreenWidth;
                    return !minWidth || utils.windowPos().width > minWidth;
                }
            }
        };
        AffixManager.defaultOptions = {};
        return AffixManager;
    }());
    exports.AffixManager = AffixManager;
    var AffixStack = /** @class */ (function () {
        function AffixStack(dir) {
            this.items = [];
            //this.items = [];
            this.dir = dir;
            this.comparer = dir === "top" ?
                function (x, y) { return x.pos.top - y.pos.top; } :
                function (x, y) { return y.pos.bottom - x.pos.bottom; };
        }
        AffixStack.prototype.add = function (item) {
            this.items.push(item);
        };
        AffixStack.prototype.remove = function (i) {
            this.items.splice(i, 1);
        };
        AffixStack.prototype.restore = function () {
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                item.detach();
            }
        };
        AffixStack.prototype.recalc = function () {
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                item.adjustSize();
            }
            for (var _b = 0, _c = this.items; _b < _c.length; _b++) {
                var item = _c[_b];
                item.recalc();
            }
            this.items.sort(this.comparer);
        };
        AffixStack.prototype.refresh = function (manager) {
            var _this = this;
            var changed = false;
            // собственно прикрепление
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                var attached = item.attached;
                this.affixItem(item, manager);
                changed = changed || (attached !== item.attached);
            }
            // добавляем тень
            if (changed) {
                this.items.forEach(function (item, i) {
                    _this.shadowItem(item, i);
                });
            }
        };
        AffixStack.prototype.affixItem = function (item, manager) {
            var viewport = manager.getItemViewport(item);
            if (item.shouldAttach(viewport)) {
                if (!item.attached) {
                    item.attach(viewport);
                }
                else {
                    item.reflow(viewport);
                }
            }
            else {
                if (item.attached) {
                    item.detach();
                }
            }
        };
        AffixStack.prototype.shadowItem = function (target, index) {
            var shadow = target.attached;
            if (shadow) {
                // ищем прилепленные элементы, следующие за заданным и пересекающиеся с ним по горизонтали
                for (var i = index + 1, len = this.items.length; i < len; i++) {
                    var item = this.items[i];
                    if (item.attached && utils.intersectedHorz(item.pos, target.pos)) {
                        shadow = false;
                        break;
                    }
                }
            }
            target.$element.toggleClass("affix-stuck--shadow", shadow);
        };
        // protected shadowItem(target: AffixItemImpl, index: number): void {
        // 	target.$element.css("z-index", target.attached ? 900 + index : "");
        // }
        AffixStack.prototype.calcItemOffset = function (target) {
            // ищем прилепленные элементы, предшествующие заданному и пересекающиеся с ним по горизонтали
            var intersecting = [];
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                // NOTE: элементы отсортированы по позиции. Если нашли заданный, то все последующие идут после него и
                // могут быть проигнорированы.
                if (item === target) {
                    break;
                }
                if (item.attached && utils.intersectedHorz(item.pos, target.pos)) {
                    // NOTE: до 1.37 просто складывали height - это неверно, см. WC-1843 (offset += item.pos.height)
                    intersecting.push(item);
                }
            }
            // среди всех intersecting надо найти элмент с максимальным affixedOffset и к нему добавить offset этого элемента
            if (intersecting.length) {
                return this._calcIntersectingHeight(intersecting);
            }
            return 0;
        };
        AffixStack.prototype.calcElementOffset = function (pos) {
            // ищем прилепленные элементы, пересекающиеся с заданным по горизонтали
            var intersecting = [];
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.attached && utils.intersectedHorz(item.pos, pos)) {
                    // NOTE: до 1.37 просто складывали height - это неверно, см. WC-1843 (offset += item.pos.height)
                    intersecting.push(item);
                }
            }
            // среди всех intersecting надо найти элмент с максимальным affixedOffset и к нему добавить offset этого элемента
            if (intersecting.length) {
                return this._calcIntersectingHeight(intersecting);
            }
            return 0;
        };
        AffixStack.prototype._calcIntersectingHeight = function (intersecting) {
            // метор принимает массив affixed элементов, с которыми пересекается по горизонтале некий элемент (текущий),
            // метод должен вернуть смещение для прикрепления этого элемента.
            // это смещение получается как максимальное смещение из пересекаемых элементов + высота элемента с максимальным смещением
            // но элементов с максимальным смещение может быть несколько, и из них надо взять элемент с максмальной высотой
            // Т.о. алгоритм: найти множество элементов с максимальным смещением, среди них найти максимальную высоту,
            // вернуть результат сложения этого смещения и высоты.
            //let maxItem = intersecting[0];
            var maxOffset = intersecting[0].affixedOffset;
            // 1. находим максмальное смещение
            for (var _i = 0, intersecting_1 = intersecting; _i < intersecting_1.length; _i++) {
                var item = intersecting_1[_i];
                if (item.affixedOffset > maxOffset) {
                    maxOffset = item.affixedOffset;
                }
            }
            // 2. среди элементов с этим смещением (максимальным), находим максмальную высоту
            var maxHeight = 0;
            for (var _a = 0, intersecting_2 = intersecting; _a < intersecting_2.length; _a++) {
                var item = intersecting_2[_a];
                if (item.affixedOffset === maxOffset) {
                    if (item.pos.height > maxHeight) {
                        maxHeight = item.pos.height;
                    }
                }
            }
            return maxOffset + maxHeight;
        };
        return AffixStack;
    }());
    exports.AffixStack = AffixStack;
    var AffixItemImpl = /** @class */ (function () {
        function AffixItemImpl(options) {
            var that = this;
            that.options = options = lang.append(options, AffixItemImpl.defaultOptions);
            that.$element = $(options.element);
            that.dir = options.affixTo || "top";
            that.stuckBehaviors = [];
            if (options.stuckBehaviors) {
                for (var _i = 0, _a = options.stuckBehaviors; _i < _a.length; _i++) {
                    var v = _a[_i];
                    var behavior = lang.isString(v) ? AffixManager.knownStuckBehaviors[v] : v;
                    if (behavior) {
                        that.stuckBehaviors.push(behavior);
                    }
                }
            }
            // Если дефолтный behavior не задан явно, то добавим его первым элементов.
            // NOTE: Он необходим, чтобы создать $placeholder, на основании которого затем будет вычисляться позиция
            // уже прилепленного элемента. Однако, можно явно создать $placeholder в кастомном behavior-е, задав
            // дефолтный behavior после кастомного.
            that._addKnownBehavior("default", true);
            // добавляем knownStuckBehaviors, наименованиями которых совпадают с наименованиями переданных опций
            for (var _b = 0, _c = Object.keys(options); _b < _c.length; _b++) {
                var name_1 = _c[_b];
                that._addKnownBehavior(name_1);
            }
        }
        AffixItemImpl.prototype._addKnownBehavior = function (name, toBeginning) {
            var behavior = AffixManager.knownStuckBehaviors[name];
            var stuckBehaviors = this.stuckBehaviors;
            if (behavior && stuckBehaviors.indexOf(behavior) < 0) {
                if (toBeginning) {
                    stuckBehaviors.unshift(behavior);
                }
                else {
                    stuckBehaviors.push(behavior);
                }
            }
        };
        AffixItemImpl.prototype.adjustSize = function () {
            if (this.options.resizable && this.$placeholder) {
                this.$placeholder.outerHeight(this.$element.outerHeight());
            }
        };
        AffixItemImpl.prototype.recalc = function () {
            var that = this;
            that.pos = utils.pos(that.$placeholder || that.$element);
            for (var _i = 0, _a = that.stuckBehaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                if (behavior.recalc) {
                    behavior.recalc(that);
                }
            }
        };
        AffixItemImpl.prototype.shouldAttach = function (viewport) {
            var that = this;
            if (that.dir === "top" ? that.pos.top >= viewport.top : that.pos.bottom <= viewport.bottom) {
                return false;
            }
            for (var _i = 0, _a = that.stuckBehaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                // Если хотя бы один behavior вернул false, то прилеплять не нужно
                if (behavior.shouldAttach && behavior.shouldAttach(that, viewport) === false) {
                    return false;
                }
            }
            return true;
        };
        AffixItemImpl.prototype.attach = function (viewport) {
            var that = this;
            if (that.attached) {
                return;
            }
            // Сначала запускаем stuckBehaviors. При этом дефолтный behavior создаст placeholder, установит ему высоту и
            // добавит его в DOM. Это приведет к увеличению высоты документа, но scrollTop должен сохраниться.
            for (var _i = 0, _a = that.stuckBehaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                if (behavior.attach) {
                    behavior.attach(that, viewport);
                }
            }
            // Затем добавляем css классы affix-stuck* к элементу. Это установит position: fixed, что в свою очередь
            // обратно уменьшит высоту документа. Но scrollTop по-прежнему должен сохраниться.
            that.$element.addClass("affix-stuck affix-stuck-" + that.dir);
            // NOTE: Если сначала добавить css классы, то высота документа сначала уменьшится. При этом если документ был
            // проскроллирован до самого низу, то scrollTop также уменьшится. Затем, когда после добавления заглушки
            // высота снова увеличится scrollTop будет уже меньше начального значения. Это делает невозможным
            // проскроллировать документ до конца вниз - см. WC-1328.
            // При рендеринге элемента генерируется событие domChanged, которое обрабатывается в module-affix и
            // приводит к refresh. Но как правило, affixed элементы имеют фиксированные размеры и рендеринг внутри
            // таких элементов не должен приводить к refresh. Поэтому давим эскалацию события domChanged выше.
            // Если же элемент может менять размеры, то можно указать опцию resizable.
            if (!that.options.resizable) {
                that.$element.on("domChanged.affix", function () { return false; });
            }
            that.attached = true;
            that.reflow(viewport);
            // Уведомяем, что элемент прилепился
            // NOTE: делать это нужно после вызова reflow, чтобы элемент был уже корректно спозиционирован
            that.$element.trigger("affixStuck");
        };
        AffixItemImpl.prototype.reflow = function (viewport) {
            var that = this;
            if (!that.attached) {
                return;
            }
            for (var _i = 0, _a = that.stuckBehaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                if (behavior.reflow) {
                    behavior.reflow(that, viewport);
                }
            }
        };
        AffixItemImpl.prototype.detach = function () {
            var that = this;
            if (!that.attached) {
                return;
            }
            that.$element.removeClass("affix-stuck affix-stuck-" + that.dir);
            if (!that.options.resizable) {
                that.$element.off("domChanged.affix");
            }
            for (var _i = 0, _a = that.stuckBehaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                if (behavior.detach) {
                    behavior.detach(that);
                }
            }
            that.$element.trigger("affixUnstuck");
            that.attached = false;
        };
        AffixItemImpl.defaultOptions = {
            element: undefined,
            stuckBehaviors: ["default", "preserveWidth", "hscroll"]
        };
        return AffixItemImpl;
    }());
    exports.AffixItemImpl = AffixItemImpl;
});
//# sourceMappingURL=affix.js.map