/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/PropertyEditor", "lib/binding", "vendor/bootstrap-colorpicker/js/bootstrap-colorpicker", "xcss!vendor/bootstrap-colorpicker/css/bootstrap-colorpicker", "xcss!lib/ui/styles/peColorPicker"], function (require, exports, $, core, PropertyEditor, binding) {
    "use strict";
    var lang = core.lang;
    var peColorPicker = /** @class */ (function (_super) {
        __extends(peColorPicker, _super);
        /**
         * @constructs peColorPicker
         * @extends PropertyEditor
         * @param options
         */
        function peColorPicker(options) {
            var _this = this;
            options = peColorPicker.mixOptions(options, peColorPicker.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.isNumeric = that.options.vt === "i4";
            that.commands = that.createCommands();
            return _this;
        }
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        peColorPicker.prototype.createCommands = function () {
            var that = this, commands = {};
            if (!that.options.hideClearButton) {
                commands.Clear = new core.commands.BoundCommand(that.doClear, that.canClear, that);
            }
            return core.lang.extend(commands, that.options.commands);
        };
        peColorPicker.prototype.canClear = function () {
            return !this.disabled() && !this.isEmpty();
        };
        peColorPicker.prototype.doClear = function () {
            if (!this.element) {
                return;
            }
            this._isNull = true;
            this.colorPicker.setValue();
            this.element.val("");
        };
        peColorPicker.prototype.doRender = function (domElement) {
            var that = this, options = that.options, $container = $("<div class='x-pe-colorpicker input-group colorpicker-component'/>").appendTo(domElement), $input = $("<input class='form-control' type='text' autocomplete='off' />").appendTo($container);
            $input.attr("name", options.name);
            $input.bind("input keyup", function () {
                var isEmpty = that._isEmptyVal($(this).val());
                that.isEmpty(isEmpty);
                that._isNull = isEmpty;
            });
            if (!options.nullable) {
                $input.attr("required");
            }
            if (options.placeholder) {
                $input.attr("placeholder", options.placeholder);
            }
            if (that.commands["Clear"]) {
                $input.addClass("has-clear-btn");
                var $clearBtn = $("<span class='clear-btn'>&times;</span>").appendTo($container);
                binding.commandBind($clearBtn, that.commands["Clear"]);
            }
            var $addon = $("<span class='input-group-addon'><i></i></span>").appendTo($container);
            $container.colorpicker(lang.extend({ format: "hex" }, that.options.colorpicker));
            that.colorPicker = $container.data("colorpicker");
            binding.databind(binding.html($input, "disabled"), binding.domain(that, "disabled"));
            that.element = $input;
            // trigger event for refresh
            $input.trigger("input");
            var bindable = binding.html($input, {
                name: that.options.changeTrigger === "keyPressed" ? "valueLive" : "value",
                accessor: function (v) {
                    if (arguments.length > 0) {
                        if ((v === "" || v == null) && that._isNull) {
                            that.element.val("");
                            return;
                        }
                        if (that.isNumeric) {
                            // integer
                            v = v | 0;
                            // number => RGB components (bytes)
                            var r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff;
                            var alpha = that.options.useAlpha ? ((v >> 24) & 0xff) / 100 : 1;
                            var hsb = that.colorPicker.color.RGBtoHSB(r, g, b, alpha);
                            that.colorPicker.setValue(hsb);
                        }
                        else {
                            that.colorPicker.setValue(v);
                        }
                    }
                    else {
                        //if (that.isEmpty()) { return null; }
                        var color = that.colorPicker.color;
                        if (that._isNull && color.toHex() === "#000000") {
                            return null;
                        }
                        if (that.isNumeric) {
                            var rgb = color.toRGB();
                            var nColor = (rgb.r << 16) + (rgb.g << 8) + rgb.b;
                            if (that.options.useAlpha) {
                                var alpha = (rgb.a * 100) | 0;
                                nColor += (alpha << 24);
                            }
                            return nColor;
                        }
                        else {
                            return color.toHex();
                        }
                    }
                },
                // disable builtin domain->html parsing (toString calling)
                parse: null
            });
            that.databind(bindable);
            _super.prototype.doRender.call(this, domElement);
        };
        peColorPicker.prototype.unload = function (options) {
            this.element.colorpicker("destroy");
            _super.prototype.unload.call(this, options);
        };
        peColorPicker.prototype._isEmptyVal = function (value) {
            return !value && value !== 0; // null, undefined, ""
        };
        peColorPicker.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            var empty = this._isEmptyVal(value);
            this.isEmpty(empty);
            this._isNull = empty;
        };
        peColorPicker.defaultOptions = {
            useAlpha: false
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], peColorPicker.prototype, "isEmpty");
        return peColorPicker;
    }(PropertyEditor));
    core.ui.peColorPicker = peColorPicker;
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return (propMd.contentType === "color" && (propMd.vt === "i4" || propMd.vt === "string")) ? core.ui.peColorPicker : null;
    });
    return peColorPicker;
});
//# sourceMappingURL=peColorPicker.js.map