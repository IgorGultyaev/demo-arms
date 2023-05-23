/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "big", "vendor/jquery.mousewheel"], function (require, exports, $, core, Big) {
    "use strict";
    var InputSpinner = /** @class */ (function (_super) {
        __extends(InputSpinner, _super);
        function InputSpinner(options) {
            var _this = _super.call(this) || this;
            _this.options = core.lang.append(options || {}, InputSpinner.defaultOptions);
            if (_this.options.max !== undefined) {
                _this.max = new Big(_this.options.max);
            }
            if (_this.options.min !== undefined) {
                _this.min = new Big(_this.options.min);
            }
            return _this;
        }
        InputSpinner.prototype.attach = function (input, btnUp, btnDown) {
            var that = this, $input = input && $(input), $btnUp = btnUp && $(btnUp), $btnDown = btnDown && $(btnDown);
            if ($input) {
                if (that.$input && that.$input[0] !== $input[0]) {
                    that.$input.off(".inputspinner");
                }
                that.$input = $input;
                that.$input.on("keydown.inputspinner", that._onInputKeydown.bind(that));
                that.$input.on("mousewheel.inputspinner", that._onInputMousewheel.bind(that));
                that.$input.on("blur.inputspinner", that._onInputBlur.bind(that));
            }
            if ($btnUp) {
                if (that.$btnUp && that.$btnUp[0] !== $btnUp[0]) {
                    that.$btnUp.off(".inputspinner");
                }
                that.$btnUp = $btnUp;
                that.$btnUp.on("mousedown.inputspinner", that._onBtnUpMouseDown.bind(that));
                that.$btnUp.on("mouseup.inputspinner mouseleave.inputspinner", that._onButtonsMouseUp.bind(that));
            }
            if ($btnDown) {
                if (that.$btnDown && that.$btnDown[0] !== $btnDown[0]) {
                    that.$btnDown.off(".inputspinner");
                }
                that.$btnDown = $btnDown;
                that.$btnDown.on("mousedown.inputspinner", that._onBtnDownMouseDown.bind(that));
                that.$btnDown.on("mouseup.inputspinner mouseleave.inputspinner", that._onButtonsMouseUp.bind(that));
            }
        };
        InputSpinner.prototype.detach = function () {
            var that = this;
            if (that.$input) {
                that.$input.off(".inputspinner");
                that.$input = null;
            }
            if (that.$btnUp) {
                that.$btnUp.off(".inputspinner");
                that.$btnUp = null;
            }
            if (that.$btnDown) {
                that.$btnDown.off(".inputspinner");
                that.$btnDown = null;
            }
        };
        InputSpinner.prototype.increase = function () {
            this._incValue(this.options.step);
        };
        InputSpinner.prototype.decrease = function () {
            this._incValue(-this.options.step);
        };
        /**
         * Normalize value (val) to allowed range (min/max).
         * @param val
         * @param autoCorrect
         * @returns {any}
         * @private
         */
        InputSpinner.prototype._normalizeValue = function (val, autoCorrect) {
            if (val instanceof Big) {
                if (autoCorrect) {
                    if (this.min != null && val.lt(this.min)) {
                        return this.min;
                    }
                    if (this.max != null && val.gt(this.max)) {
                        return this.max;
                    }
                }
            }
            else {
                if (typeof val !== "number" || isNaN(val)) {
                    return this.options.initial || 0;
                }
                if (autoCorrect) {
                    if (this.min != null && this.min.gte(val)) {
                        return this.min;
                    }
                    if (this.max != null && this.max.lte(val)) {
                        return this.max;
                    }
                }
            }
            return val;
        };
        InputSpinner.prototype._parseValue = function (s) {
            return this.options.parser.call(this, s);
        };
        InputSpinner.prototype._formatValue = function (v) {
            return this.options.formatter.call(this, v);
        };
        InputSpinner.prototype._incValue = function (increment) {
            var that = this, $input = that.$input;
            var autoCorrect = that.options.autoCorrect;
            if (!$input) {
                return;
            }
            try {
                // parse & normalize current value
                var valueOld = that._normalizeValue(that._parseValue($input.val()), autoCorrect);
                // increment/decrement
                var valueNew = void 0;
                if (valueOld instanceof Big) {
                    valueNew = that._normalizeValue(valueOld.plus(increment), autoCorrect);
                }
                else {
                    valueNew = that._normalizeValue(valueOld + increment, autoCorrect);
                }
                var text = that._formatValue(valueNew);
                $input.val(text).trigger("change");
            }
            catch (ex) {
                // при парсинге значения может быть исключение (обычно оно обрабатывается байндингом - см. binding::bindOneWay,
                // ну тут мы напрямую зовем parse, просто игнорируем, ошибка байндинга должна
            }
        };
        InputSpinner.prototype._onInputKeydown = function (e) {
            var that = this, keyCode = core.html.keyCode;
            if (e.which === keyCode.UP || e.which === keyCode.DOWN) {
                if (e.which === keyCode.UP) {
                    that.increase();
                }
                else {
                    that.decrease();
                }
            }
        };
        InputSpinner.prototype._onInputMousewheel = function (e /*: JQueryMouseEventObject*/) {
            // handle mousewheel on focused <input> only
            if (e.target !== core.html.focused()) {
                return;
            }
            // NOTE: deltaY is normalized by jquery.mousewheel plugin
            var delta = e.deltaY;
            e.stopPropagation();
            e.preventDefault();
            if (delta < 0) {
                this.decrease();
            }
            else {
                this.increase();
            }
        };
        InputSpinner.prototype._onInputBlur = function () {
            var that = this;
            if (that.$input && that.$input.val() !== "") {
                that._incValue(0);
            }
        };
        InputSpinner.prototype._onBtnUpMouseDown = function () {
            this._onButtonsMouseDown(true);
        };
        InputSpinner.prototype._onBtnDownMouseDown = function () {
            this._onButtonsMouseDown(false);
        };
        InputSpinner.prototype._onButtonsMouseDown = function (isUp) {
            var that = this;
            if (isUp) {
                that.increase();
            }
            else {
                that.decrease();
            }
            if (that._mouseTimeout) {
                window.clearTimeout(that._mouseTimeout);
            }
            // NOTE: first delay is longer than others (250 vs 50)
            that._mouseTimeout = window.setTimeout(function () {
                if (that._mouseInterval) {
                    window.clearInterval(that._mouseInterval);
                }
                that._mouseInterval = window.setInterval(function () {
                    if (isUp) {
                        that.increase();
                    }
                    else {
                        that.decrease();
                    }
                }, 50);
            }, 250);
        };
        InputSpinner.prototype._onButtonsMouseUp = function () {
            var that = this;
            window.clearTimeout(that._mouseTimeout);
            window.clearInterval(that._mouseInterval);
            that._mouseTimeout = null;
            that._mouseInterval = null;
        };
        InputSpinner.defaultOptions = {
            step: 1,
            formatter: function (v) {
                return "" + v;
            },
            parser: function (text) {
                return parseFloat(text);
            },
            autoCorrect: true,
            initial: 0
        };
        return InputSpinner;
    }(core.lang.CoreClass));
    InputSpinner.mixin(/** @lends InputSpinner.prototype */ {
        defaultOptions: InputSpinner.defaultOptions
    });
    return InputSpinner;
});
//# sourceMappingURL=InputSpinner.js.map