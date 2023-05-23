/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/formatters", "lib/binding", "lib/ui/pe/PropertyEditor", "moment", "vendor/bootstrap-datetimepicker/bootstrap-datetimepicker", "xcss!lib/ui/styles/peDateTime"], function (require, exports, $, core, formatters, binding, PropertyEditor, moment) {
    "use strict";
    var lang = core.lang;
    var isoFormats = {
        date: "YYYY-MM-DD",
        time: "HH:mm",
        timeTz: "HH:mm",
        dateTime: "YYYY-MM-DDTHH:mm",
        dateTimeTz: "YYYY-MM-DDTHH:mmZ"
    };
    // override default options of datetimepicker
    core.lang.extend($.fn.datetimepicker.defaults, {
        locale: moment.locale(),
        useCurrent: false,
        showTodayButton: true,
        toolbarPlacement: "bottom",
        icons: {
            time: "x-icon x-icon-clock",
            date: "x-icon x-icon-calendar",
            up: "x-icon x-icon-angle-bracket-top",
            down: "x-icon x-icon-angle-bracket-bottom",
            previous: "x-icon x-icon-angle-bracket-left",
            next: "x-icon x-icon-angle-bracket-right",
            today: "x-icon x-icon-today"
        }
    });
    var peDateTime = /** @class */ (function (_super) {
        __extends(peDateTime, _super);
        /**
         * @class peString
         * @extends PropertyEditor
         * @param options
         */
        function peDateTime(options) {
            var _this = this;
            options = peDateTime.mixContextOptions(options, peDateTime.defaultOptions, peDateTime.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            // check correct vt
            if (!formatters.defaultFormats[_this.options.vt]) {
                throw new Error("peDateTime: unsupported var type: " + _this.options.vt);
            }
            _this.options.format = _this.options.format || formatters.defaultFormats[_this.options.vt];
            // calculate actual format (copy/paste from bootstrap-datetimepicker)
            _this.format = _this.options.format.replace(/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, function (input) {
                return moment.localeData().longDateFormat(input) || input;
            });
            var convertType = _this.options.vt === "date" ? "days" : "seconds";
            _this.min =
                (_this.options.minInclusive && moment(_this.options.minInclusive).toDate()) ||
                    (_this.options.minExclusive && moment(_this.options.minExclusive).add(1, convertType).toDate());
            _this.max =
                (_this.options.maxInclusive && moment(_this.options.maxInclusive).toDate()) ||
                    (_this.options.maxExclusive && moment(_this.options.maxExclusive).subtract(1, convertType).toDate());
            _this.commands = _this.createCommands();
            return _this;
        }
        peDateTime.prototype.useNative = function () {
            var nativeType;
            switch (this.options.vt) {
                case "timeTz":
                case "time":
                    nativeType = "time";
                    break;
                case "date":
                    nativeType = "date";
                    break;
                case "dateTimeTz":
                    nativeType = "datetime";
                    break;
                case "dateTime":
                    nativeType = "datetime-local";
                    break;
            }
            if (!nativeType) {
                return false;
            }
            var isNativeSupported = core.platform.modernizr.inputtypes[nativeType];
            switch (this.options.useNative) {
                case "always":
                    return isNativeSupported ? nativeType : undefined;
                case "never":
                    return undefined;
                case "mobileOnly":
                    return isNativeSupported && core.platform.isMobileDevice ? nativeType : undefined;
            }
        };
        peDateTime.prototype.doRender = function (domElement) {
            var that = this, bindableElement, useNativeInput = that.useNative(), nativeType = useNativeInput || "text";
            that.element = $("<div class='x-pe-datetime input-group'></div>").appendTo(domElement);
            that.element = $("<input type='" + nativeType + "' />").appendTo(that.element);
            that.element.attr("placeholder", that.options.placeholder || that.format);
            that.element.addClass("x-pe-datetime-input form-control");
            if (!that.options.nullable) {
                that.element.attr("required");
            }
            // datetimepicker присвоет элементу id, если он не задан. Однако базовый метод принудительно
            // устанавливает id элемента, поэтому мы должны позвать базовый метод до создания datetimepicker-а.
            _super.prototype.doRender.call(this, domElement);
            bindableElement = useNativeInput ? that._renderNative() : that._renderWidget();
            if (bindableElement) {
                bindableElement.onchange = bindableElement.onchange || function (handler) {
                    that.element.bind("change", handler);
                    return {
                        dispose: function () {
                            that.element.unbind("change", handler);
                        }
                    };
                };
                that.databind(bindableElement);
            }
            that.element.bind("input keyup", function () {
                var val = $(this).val();
                that.isEmpty(!val);
            });
            // trigger event for refresh
            that.element.trigger("input");
        };
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        peDateTime.prototype.createCommands = function () {
            var that = this;
            var commands = {};
            if (!that.options.hideClearButton) {
                commands.Clear = new core.commands.BoundCommand(that.doClear, that.canClear, that);
            }
            return core.lang.extend(commands, that.options.commands);
        };
        peDateTime.prototype.doClear = function () {
            var that = this;
            if (that.picker) {
                that.picker.date(null);
            }
            else if (that.element) {
                that.element.val("")
                    .trigger("input")
                    .trigger("change");
            }
            that.focus();
        };
        peDateTime.prototype.canClear = function () {
            return !this.disabled() && !this.isEmpty();
        };
        peDateTime.prototype._bindToEsc = function () {
            var that = this;
            that.element.keydown(function (e) {
                var $parent;
                if (e.which !== core.html.keyCode.ESCAPE || e.ctrlKey || e.shiftKey || e.metaKey) {
                    return;
                }
                if (that.picker) {
                    // do nothing if the picker is open: the picker is closed by itself on ESC and the focus remains on INPUT
                    $parent = that.picker.options().widgetParent || $(e.target).parent();
                    if ($parent.find("> .bootstrap-datetimepicker-widget").length) {
                        return;
                    }
                }
                $(e.target).blur();
            });
        };
        peDateTime.prototype._setWidth = function () {
            var that = this, width = that.options.width;
            if (width && that.$domElement) {
                that.$domElement.find("> .x-pe-datetime").css({ width: width });
            }
        };
        peDateTime.prototype._renderNative = function () {
            var that = this, bindableElement, format = isoFormats[that.options.vt];
            // wow! cool! но сейчас, как минимум в андровском (4.2.1) хроме (18.0)
            // на эти аттрибуты пикер не реагирует
            that.min && (that.element.prop("min", moment(that.min).format(format)));
            that.max && (that.element.prop("max", moment(that.max).format(format)));
            bindableElement = {
                set: function (v) {
                    var prev = that.element.val(), momentVal;
                    prev = prev && moment(prev);
                    if (!v !== !prev || v && prev && v.valueOf() !== prev.valueOf()) {
                        that.element.val((momentVal = moment(v)) ? momentVal.format(format) : "");
                    }
                },
                get: function () {
                    var v = that.element.val();
                    switch (that.options.vt) {
                        case "dateTime":
                        case "dateTimeTz":
                            v = moment(v, format).toDate();
                            break;
                        case "date":
                            v = moment(v, format).toDate();
                            break;
                        case "time":
                        case "timeTz":
                            v = moment("1970-01-01T" + v).toDate();
                            break;
                    }
                    return v;
                }
            };
            return bindableElement;
        };
        peDateTime.prototype._renderWidget = function () {
            var that = this, bindableElement, pickerOptions = {
                format: that.format || false,
                extraFormats: that._getExtraFormats(),
                defaultDate: that._getDefaultMoment(),
                minDate: that.min || false,
                maxDate: that.max || false,
                widgetParent: that.options.contextName === "inline" ? that.$domElement : undefined
            }, $picker;
            pickerOptions = core.lang.extend(pickerOptions, that.options.pickerOptions);
            if (that.options.openPickerOn !== "focus") {
                var buttonCssClass = that.options.vt === "time" || that.options.vt === "timeTz" ?
                    $.fn.datetimepicker.defaults.icons.time :
                    $.fn.datetimepicker.defaults.icons.date;
                that.element.after("<span class='input-group-addon x-pe-datetime-buttons'><span class='" + buttonCssClass + "'></span></span>");
                $picker = that.element.parent();
            }
            else {
                $picker = that.element;
            }
            $picker.datetimepicker(pickerOptions);
            that.picker = $picker.data("DateTimePicker");
            // add clear button
            if (that.commands.Clear) {
                that.element.addClass("has-clear-btn");
                var $clearBtn = $("<span class='clear-btn'>&times;</span>").insertAfter(that.element);
                binding.commandBind($clearBtn, that.commands.Clear);
            }
            that.element.on("keyup", function (e) {
                if (e.keyCode === core.html.keyCode.DOWN && that.picker) {
                    that.picker.show();
                }
            });
            // NOTE: focus is handled by widget without button out of box
            if (that.options.openPickerOn === "both") {
                that.element.focus(function () {
                    if (that.picker) {
                        that.picker.show();
                    }
                });
            }
            bindableElement = {
                set: function (v) {
                    if (that.picker) {
                        v = v ? moment(v) : null;
                        that.picker.date(v);
                    }
                },
                get: function () {
                    var v = that.picker && that.picker.date();
                    if (!v) {
                        return null;
                    }
                    return that._castMoment(v).toDate();
                },
                onchange: function (handler) {
                    $picker.on("change.dp", handler);
                    return {
                        dispose: function () {
                            $picker.off("change.dp", handler);
                        }
                    };
                }
            };
            return bindableElement;
        };
        peDateTime.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            this.isEmpty(!value);
        };
        /**
         * Change a value according to value type of PE
         * @param {moment} v
         * @returns {moment}
         * @private
         */
        peDateTime.prototype._castMoment = function (v) {
            switch (this.options.vt) {
                case "date":
                    v = v.startOf("day");
                    break;
                case "time":
                case "timeTz":
                    v = v.year(1970).month(0).date(1);
                    break;
            }
            return v;
        };
        peDateTime.prototype._getDefaultMoment = function () {
            var that = this;
            var v = that._castMoment(moment().startOf("day")); // to set time part to '0:00:00' (otherwise current time)
            if (that.min) {
                v = moment.max(v, moment(that.min));
            }
            if (that.max) {
                v = moment.min(v, moment(that.max));
            }
            return v;
        };
        peDateTime.prototype._getExtraFormats = function () {
            var that = this;
            if (!that.format) {
                return false;
            }
            // NOTE: collect all formats "shorher" than that.format, each in 2-digit year and 4-digit year form
            // "DD.MM.YYYY HH:mm" -> [ "DD", "DD.MM", "DD.MM.YY", "DD.MM.YYYY", "DD.MM.YY HH", "DD.MM.YYYY HH", "DD.MM.YY HH:mm", "DD.MM.YYYY HH:mm" ]
            var extraFormats = [], formatTokens = that.format.match(/(.)\1*/g), // groups of the same symbols
            indexYYYY = formatTokens.indexOf("YYYY");
            formatTokens.forEach(function (token, i) {
                if (!/\w/.test(token)) {
                    return;
                }
                var tokens = formatTokens.slice(0, i + 1), format = tokens.join("");
                // 2-digit year instead of 4-digit
                if (indexYYYY >= 0 && i >= indexYYYY) {
                    tokens[indexYYYY] = "YY";
                    extraFormats.push(tokens.join(""));
                }
                extraFormats.push(format);
            });
            return extraFormats;
        };
        peDateTime.prototype.unload = function (options) {
            var that = this;
            if (that.picker) {
                that.picker.hide();
                that.picker.destroy();
                that.picker = undefined;
            }
            _super.prototype.unload.call(this, options);
        };
        peDateTime.defaultOptions = {
            format: "",
            useNative: "mobileOnly",
            openPickerOn: "button",
            hideClearButton: false
        };
        peDateTime.contextDefaultOptions = {
            filter: {
                openPickerOn: "button"
            },
            inline: {
                openPickerOn: "focus"
            }
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], peDateTime.prototype, "isEmpty");
        return peDateTime;
    }(PropertyEditor));
    // backward compatibility: access to static fields via prototype
    peDateTime.mixin(/** @lends peDateTime.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peDateTime.defaultOptions,
        /** @obsolete use static contextDefaultOptions */
        contextDefaultOption: peDateTime.contextDefaultOptions
    });
    core.ui.peDateTime = peDateTime;
    core.ui.PropertyEditor.DefaultMapping["dateTime"] = peDateTime;
    core.ui.PropertyEditor.DefaultMapping["date"] = peDateTime;
    core.ui.PropertyEditor.DefaultMapping["time"] = peDateTime;
    core.ui.PropertyEditor.DefaultMapping["timeTz"] = peDateTime;
    core.ui.PropertyEditor.DefaultMapping["dateTimeTz"] = peDateTime;
    return peDateTime;
});
//# sourceMappingURL=peDateTime.js.map