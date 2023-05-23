/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/validation", "lib/ui/pe/PropertyEditor", "lib/ui/pe/InputSpinner", "lib/binding", "big", "xcss!lib/ui/styles/peNumber", "vendor/jquery.numeric"], function (require, exports, $, core, validation, PropertyEditor, InputSpinner, binding, Big) {
    "use strict";
    //import ui = require("lib/ui/.ui");
    //import domain = require("lib/domain/.domain");
    var lang = core.lang;
    var peNumber = /** @class */ (function (_super) {
        __extends(peNumber, _super);
        /**
         * @constructs peNumber
         * @extends PropertyEditor
         * @param options
         */
        function peNumber(options) {
            var _this = this;
            options = peNumber.mixOptions(options, peNumber.defaultOptions);
            if (options.format && typeof options.format !== "string")
                options.decimalSeparator = options.decimalSeparator || options.format.decimalSeparator;
            _this = _super.call(this, options) || this;
            var that = _this;
            var vt = that.options.vt;
            that.isInteger = vt === "ui1" || vt === "i2" || vt === "i4" || vt === "i8";
            that.commands = that.createCommands();
            // create validation rules for facets minValue/maxValue/range if they don't exist
            _this._initValidationRules();
            return _this;
        }
        peNumber.prototype._initValidationRules = function () {
            var options = this.options;
            var rules = {};
            if (options.rules && options.rules.length) {
                for (var i = 0; i < options.rules.length; i++) {
                    var rule = options.rules[i];
                    if (rule.name) {
                        rules[rule.name] = rule;
                    }
                }
            }
            var newRules = [];
            if (options.minValue != null && !rules["minValue"]) {
                newRules.push(validation.facets["minValue"]);
            }
            if (options.maxValue != null && !rules["maxValue"]) {
                newRules.push(validation.facets["maxValue"]);
            }
            if (options.range && options.range.length === 2 && !rules["range"]) {
                newRules.push(validation.facets["range"]);
            }
            if (newRules.length) {
                options.rules = options.rules ? options.rules.concat(newRules) : newRules;
            }
        };
        peNumber.prototype.useNative = function () {
            var isNativeSupported = core.platform.modernizr.inputtypes["number"];
            switch (this.options.useNative) {
                case "always":
                    return isNativeSupported;
                case "never":
                    return false;
                case "mobileOnly":
                    return isNativeSupported && core.platform.isMobileDevice;
            }
        };
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        peNumber.prototype.createCommands = function () {
            var that = this, commands = {};
            if (!that.options.hideClearButton) {
                commands.Clear = new core.commands.BoundCommand(that.doClear, that.canClear, that);
            }
            return core.lang.extend(commands, that.options.commands);
        };
        peNumber.prototype.canClear = function () {
            return !this.disabled() && !this.isEmpty();
        };
        peNumber.prototype.doClear = function () {
            if (!this.element) {
                return;
            }
            $(this.element).val("")
                .trigger("input")
                .trigger("change")
                .focus();
        };
        peNumber.prototype.format = function (v) {
            var that = this, text = "", separator = that.options.decimalSeparator, formatter = that.options.formatter;
            // the problem is that options.formatter is always specified (see postprocessEntity in domain.ts),
            // so we can't simply call that formatter
            if (v == null || isNaN(v)) {
                return "";
            } // null|undefined|NaN
            if (formatter) {
                text = formatter.call(that, v, { format: { decimalSeparator: separator } });
                return text;
            }
            text = v.toString();
            if (separator) {
                text = text.replace(".", separator);
            }
            return text;
        };
        peNumber.prototype.parse = function (text) {
            var that = this, parser = that.options.parser, separator;
            // NOTE: despite options.formatter the options.parser isn't specified by default
            if (parser) {
                return parser.call(that, text);
            }
            if (text === "") {
                return null;
            }
            separator = that.options.decimalSeparator;
            if (separator) {
                text = text.replace(separator, ".");
            }
            var res;
            if (that.options.tryParse) {
                res = that.options.tryParse(text, false);
            }
            else {
                res = validation.getParser(that.options.vt).tryParse(that.options, text);
            }
            if (res.errorMsg) {
                throw res.errorMsg;
            }
            return res.parsedValue;
        };
        peNumber.prototype.doRender = function (domElement) {
            var that = this, options = that.options, useNativeInput = that.useNative(), $container = $("<div class='x-pe-number input-group'/>").appendTo(domElement), $input = $("<input class='form-control' type='" + (useNativeInput ? "number" : "text") + "' autocomplete='off' />").appendTo($container), $clearBtn, bindable, minValue, maxValue;
            $input.attr("name", options.name);
            $input.bind("input keyup", function () {
                var val = $(this).val();
                that.isEmpty(!val);
            });
            // init min/max
            if (options.minValue !== undefined) {
                minValue = options.minValue;
            }
            if (options.maxValue !== undefined) {
                maxValue = options.maxValue;
            }
            if (options.range && options.range.length === 2) {
                minValue = options.range[0];
                maxValue = options.range[1];
            }
            // если min/max не заданы в фасетах свойства, надо подставлять min/max от типа (vt),
            // чтобы юзер не мой выйти за допустимый диапазон
            if (minValue === undefined) {
                // NOTE: тут не важно, minValue это Number или Big, т.к. InputSpinner поддерживает оба
                var parser = validation.getParser(options.vt);
                minValue = parser.minValue;
            }
            if (maxValue === undefined) {
                // NOTE: тут не важно, minValue это Number или Big, т.к. InputSpinner поддерживает оба
                var parser = validation.getParser(options.vt);
                maxValue = parser.maxValue;
            }
            // set INPUT'a attrs
            if (minValue !== undefined) {
                // NOTE: minValue can be Big
                $input.attr("min", minValue.toString());
            }
            if (maxValue !== undefined) {
                // NOTE: maxValue can be Big
                $input.attr("max", maxValue.toString());
            }
            // for integers limit total length of input with the length of max value (as string)
            // e.g.: if maxValue is 999 and user entered 100 then it makes no sense to enter more digits
            if (options.maxLength != undefined) {
                $input.attr("maxlength", options.maxLength);
            }
            else if (options.formatter && that.isInteger && maxValue != undefined && !options.noMaxLength) {
                var maxLength = maxValue.toString().length;
                if (new Big(maxValue).lt(0)) {
                    maxLength++;
                }
                $input.attr("maxlength", maxValue.toString().length);
                /*
                 TODO: для i2/i4/ui1: при вводе количества цифр, равном количеству цифр в maxValue, переходить на следующий PE (возможно опцией)
                 if (that.options.autoBlur) {}
                 */
            }
            if (!options.nullable) {
                $input.attr("required");
            }
            if (options.placeholder) {
                $input.attr("placeholder", options.placeholder);
            }
            if (options.step) {
                $input.attr("step", options.step);
            }
            if (!useNativeInput) {
                // NOTE: для нативного контрола никаких дополнительных контролов не добавляем
                $input.numeric({
                    decimal: that.isInteger ? false : (that.options.decimalSeparator || ".")
                });
                if (that.commands["Clear"]) {
                    $input.addClass("has-clear-btn");
                    $clearBtn = $("<span class='clear-btn'>&times;</span>").appendTo($container);
                    binding.commandBind($clearBtn, that.commands["Clear"]);
                }
                if (options.spinner) {
                    var spinnerOpts = void 0;
                    if (options.spinner !== "hidden") {
                        // true or SpinnerOptions (not false and not "hidden")
                        spinnerOpts = options.spinner === true ? {
                            buttons: "horizontal",
                            icons: "plusminus"
                        } : options.spinner;
                    }
                    //let ImplClass = spinnerOpts.InputSpinner || InputSpinner;
                    var inputSpinnerUserOpts = spinnerOpts && spinnerOpts.options;
                    var inputSpinnerOpts = {
                        min: minValue,
                        max: maxValue,
                        step: options.step,
                        autoCorrect: options.autoCorrect,
                        formatter: that.format.bind(that),
                        parser: that.parse.bind(that)
                    };
                    if (inputSpinnerOpts) {
                        inputSpinnerOpts = core.lang.extend(inputSpinnerOpts, inputSpinnerUserOpts);
                    }
                    var Impl = spinnerOpts && spinnerOpts.InputSpinner || InputSpinner;
                    that._spinner = new Impl(inputSpinnerOpts);
                    that._spinner.attach($input);
                    if (spinnerOpts) {
                        // true or SpinnerOptions (not false and not "hidden")
                        that._renderSpinButtons($container, spinnerOpts);
                    }
                }
                else {
                    $input.on("blur.penumber", that._onInputBlur.bind(that));
                }
            }
            binding.databind(binding.html($input, "disabled"), binding.domain(that, "disabled"));
            that.element = $input;
            bindable = binding.html($input, {
                name: that.options.changeTrigger === "keyPressed" ? "valueLive" : "value",
                // NOTE: override standard accessor $.fn.val for usage of format/parse
                accessor: function (v) {
                    var $this = this;
                    if (arguments.length > 0) {
                        $this.val(that.format(v));
                    }
                    else {
                        return that.parse($this.val());
                    }
                },
                // disable builtin domain->html parsing (toString calling)
                parse: null
            });
            that.databind(bindable);
            // trigger event for refresh
            $input.trigger("input");
            _super.prototype.doRender.call(this, domElement);
        };
        // В режиме без спиннера событие смены значения не вызывается из-под IE.
        // Поэтому, запустим вручную при потере фокуса.
        peNumber.prototype._onInputBlur = function () {
            if (this.element) {
                this.element.trigger("change");
            }
        };
        peNumber.prototype._renderSpinButtons = function ($container, spinnerOptions) {
            var that = this;
            if (spinnerOptions.buttons === "hidden") {
                return;
            }
            var $spinner = $("<span class='input-group-addon x-pe-number-spinner'></span>").appendTo($container);
            var $btnUp, $btnDown;
            if (spinnerOptions.buttons === "vertical") {
                $spinner.addClass("x-pe-number-spinner-vertical");
            }
            else {
                $spinner.addClass("x-pe-number-spinner-horizontal");
            }
            // for vertical: first button - UP, next - DOWN, for horizontal: first - DOWN, next - UP
            if (spinnerOptions.icons === "arrows") {
                if (spinnerOptions.buttons === "vertical") {
                    $btnUp = $("<button class='btn' tabindex='-1'><span class='caret caret-up'></span></button>").appendTo($spinner);
                    $btnDown = $("<button class='btn' tabindex='-1'><span class='caret'></span></button>").appendTo($spinner);
                }
                else {
                    $btnDown = $("<button class='btn' tabindex='-1'><span class='caret'></span></button>").appendTo($spinner);
                    $btnUp = $("<button class='btn' tabindex='-1'><span class='caret caret-up'></span></button>").appendTo($spinner);
                }
            }
            else {
                if (spinnerOptions.buttons === "vertical") {
                    $btnUp = $("<button class='btn' tabindex='-1'><span class='x-icon x-icon-plus'></span></button>").appendTo($spinner);
                    $btnDown = $("<button class='btn' tabindex='-1'><span class='x-icon x-icon-minus'></span></button>").appendTo($spinner);
                }
                else {
                    $btnDown = $("<button class='btn' tabindex='-1'><span class='x-icon x-icon-minus'></span></button>").appendTo($spinner);
                    $btnUp = $("<button class='btn' tabindex='-1'><span class='x-icon x-icon-plus'></span></button>").appendTo($spinner);
                }
            }
            $spinner.on("click", function () {
                var $input = that.element;
                if (!$input.is(":focus")) {
                    $input.focus();
                }
            });
            var bindableDisabled = binding.expr(that, "disabled");
            that._spinner.attach(undefined /* don't change input */, $btnUp, $btnDown);
            binding.databind(binding.html($btnUp, "disabled"), bindableDisabled);
            binding.databind(binding.html($btnDown, "disabled"), bindableDisabled);
        };
        peNumber.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            this.isEmpty(!value && value !== 0);
        };
        peNumber.defaultOptions = {
            step: 1,
            useNative: "mobileOnly",
            spinner: { buttons: "horizontal", icons: "plusminus" },
            autoCorrect: false
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], peNumber.prototype, "isEmpty");
        return peNumber;
    }(PropertyEditor));
    /**
     * Returns text presentation of the value
     * @callback peNumberFormatterCallback
     * @this peNumber
     * @param {Number|String|*} v
     * @returns {String}
     */
    /**
     * Returns typed value of the string presentation
     * @callback peNumberParserCallback
     * @this peNumber
     * @param {String} text
     * @returns {Number|null|NaN}
     */
    // backward compatibility: access to static fields via prototype
    peNumber.mixin(/** @lends peNumber.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peNumber.defaultOptions
    });
    core.ui.peNumber = peNumber;
    PropertyEditor.DefaultMapping["i8"] = peNumber;
    PropertyEditor.DefaultMapping["i4"] = peNumber;
    PropertyEditor.DefaultMapping["i2"] = peNumber;
    PropertyEditor.DefaultMapping["ui1"] = peNumber;
    PropertyEditor.DefaultMapping["single"] = peNumber;
    PropertyEditor.DefaultMapping["float"] = peNumber;
    PropertyEditor.DefaultMapping["double"] = peNumber;
    PropertyEditor.DefaultMapping["decimal"] = peNumber;
    return peNumber;
});
//# sourceMappingURL=peNumber.js.map