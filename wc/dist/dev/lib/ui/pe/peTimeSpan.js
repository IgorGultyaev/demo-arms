/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/PropertyEditor", "lib/ui/pe/InputSpinner", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "moment", "lib/utils", "vendor/jquery.numeric", "xcss!lib/ui/styles/peTimeSpan"], function (require, exports, $, core, PropertyEditor, InputSpinner, Menu, resources, moment, utils) {
    "use strict";
    var lang = core.lang;
    var peTimeSpan = /** @class */ (function (_super) {
        __extends(peTimeSpan, _super);
        /**
         * @constructs peTimeSpan
         * @extends PropertyEditor
         * @param {Object} options
         */
        function peTimeSpan(options) {
            var _this = this;
            options = peTimeSpan.mixContextOptions(options, peTimeSpan.defaultOptions, peTimeSpan.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            _this.format = _this._simplifyFormat(_this.options.format);
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
            }
            return _this;
        }
        peTimeSpan.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(peTimeSpan.defaultMenu, "peTimeSpan");
        };
        peTimeSpan.prototype.createMenu = function () {
            return new Menu(this.createMenuDefaults(), this.options.menu);
        };
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        peTimeSpan.prototype.createCommands = function () {
            var that = this, commands = {};
            if (that.options.nullable) {
                commands.Clear = new core.commands.BoundCommand(that._doClear, that._canClear, that);
            }
            return lang.extend(commands, that.options.commands);
        };
        peTimeSpan.prototype.doRender = function (domElement) {
            var that = this;
            that.element = $("<div></div>").appendTo(domElement).addClass("x-pe-timespan");
            that._renderValueContainer();
            that._makeInputsNumeric();
            that._setInputHandlers();
            that._bindValue();
            that._bindToDisabled();
            _super.prototype.doRender.call(this, domElement);
        };
        peTimeSpan.prototype._renderValueContainer = function () {
            var that = this, $element = that.element, $container = $("<div></div>").appendTo($element).addClass("value-container input-group");
            that._inputs = {};
            for (var _i = 0, _a = that.format; _i < _a.length; _i++) {
                var formatPart = _a[_i];
                that._inputs[formatPart] =
                    that._addInput($container, formatPart, resources["timeSpan." + formatPart]);
            }
            if (!that.menu.isEmpty()) {
                that._renderCustomMenu($container);
            }
        };
        peTimeSpan.prototype._renderCustomMenu = function (container) {
            var that = this, btnContainer = $("<div class='input-group-btn' />").appendTo(container);
            that.menuPresenter = core.ui.MenuButtonsPresenter.create({
                ungrouped: true,
                inline: true,
                itemPresentation: "icon"
            });
            that.menuPresenter.setViewModel(that.menu);
            that.menuPresenter.render(btnContainer);
        };
        peTimeSpan.prototype._makeInputsNumeric = function () {
            this.element.find("input.number-box").numeric({ decimal: false, negative: false });
        };
        peTimeSpan.prototype._setInputHandlers = function () {
            var that = this, $element = that.element, $valueContainer = $element.find(".value-container"), inputSpinner = new InputSpinner({
                min: 0,
                max: that.options.max,
                autoCorrect: true
            });
            // recalculate isEmpty state on any input change
            $valueContainer.find(".number-box").bind("change", function () {
                that._updateIsEmpty();
            });
            $valueContainer.find("input.number-box").focus(function (e) {
                inputSpinner.attach(e.target);
            }).blur(function () {
                inputSpinner.detach();
            });
            if (!that.disabled()) {
                $valueContainer.find(".time-part-box").click(function (e) {
                    var id = $(e.target).attr("for"), $input = that.element.find("#" + id);
                    $input.focus();
                });
            }
        };
        peTimeSpan.prototype._bindValue = function () {
            var that = this, $element = that.element, bindable = {
                get: function () {
                    return that._getMilliseconds();
                },
                set: function (v) {
                    that._setMilliseconds(v);
                },
                onchange: function (handler) {
                    $element.find(".value-container .number-box").bind("change", handler);
                    return {
                        dispose: function () {
                            $element.find(".value-container .number-box").unbind("change", handler);
                        }
                    };
                }
            };
            that.databind(bindable);
        };
        peTimeSpan.prototype._onDisabledChange = function (v) {
            var that = this, $valueContainer = that.element.find(".value-container");
            lang.forEach(that._inputs, function ($input) {
                $input.prop("disabled", v);
            });
            if (v) {
                $valueContainer.addClass("disabled");
            }
            else {
                $valueContainer.removeClass("disabled");
            }
        };
        // protected _switchNext(editedId): void {
        // 	let that = this,
        // 		prop,
        // 		inputs = [],
        // 		current,
        // 		idx = -1;
        //
        // 	if (!editedId) return;
        //
        // 	for (prop in that._inputs) {
        // 		if (that._inputs.hasOwnProperty(prop)) {
        // 			current = that._inputs[prop];
        // 			inputs.push(current);
        //
        // 			if (current.attr("id") === editedId) {
        // 				idx = inputs.length - 1;
        // 			}
        // 		}
        // 	}
        // 	if (idx < 0) {
        // 		return; // something goes wrong
        // 	}
        //
        // 	idx++;
        //
        // 	if (idx < inputs.length){
        // 		inputs[idx].focus();
        // 	}
        // 	// focus should go further
        // }
        peTimeSpan.prototype._getInputValues = function () {
            var that = this, prop, inputs = that._inputs, values = [];
            for (prop in inputs) {
                if (inputs.hasOwnProperty(prop)) {
                    values.push({
                        part: prop,
                        val: inputs[prop].val()
                    });
                }
            }
            return values;
        };
        peTimeSpan.prototype._updateIsEmpty = function () {
            var inputValues = this._getInputValues();
            var zeroIsEmpty = this.options.zeroIsEmpty;
            var isEmpty = lang.every(inputValues, function (item) { return item.val === null || item.val === "" || (zeroIsEmpty && item.val === "0"); });
            this.isEmpty(isEmpty);
        };
        peTimeSpan.prototype._setMilliseconds = function (milliseconds) {
            var that = this, parsed = utils.splitDuration(milliseconds, that.format);
            if (!parsed) {
                that._doClear();
                return;
            }
            var $inputs = that._inputs;
            for (var unit in parsed) {
                if (parsed.hasOwnProperty(unit)) {
                    $inputs[unit].val(parsed[unit]);
                }
            }
            that._updateIsEmpty();
        };
        peTimeSpan.prototype._getMilliseconds = function () {
            var that = this, i, values = that._getInputValues();
            if (that.isEmpty()) {
                return null;
            }
            var dt = moment("1970-01-01");
            for (i = 0; i < values.length; i++) {
                var val = values[i].val;
                var nVal = val === "" ? 0 : Math.abs(parseInt(val, 10));
                if (isNaN(nVal)) {
                    return null;
                }
                if (nVal > 0) {
                    dt.add(nVal, values[i].part);
                }
            }
            // return is difference between 1970-01-01 and a new date created as 1970-01-01 + Interval
            return dt.diff(moment("1970-01-01"));
        };
        peTimeSpan.prototype._canClear = function () {
            return !this.disabled() && !this.isEmpty();
        };
        peTimeSpan.prototype._doClear = function () {
            var prop, inputs = this._inputs, first;
            for (prop in inputs) {
                if (inputs.hasOwnProperty(prop)) {
                    inputs[prop].val(null);
                    if (!first) {
                        first = inputs[prop];
                    }
                }
            }
            first.trigger("change");
        };
        peTimeSpan.prototype._addInput = function ($container, id, label) {
            var fullId = this.viewModel.id + "_" + this.viewModelProp + "_" + id, $input = $("<input>", {
                id: fullId,
                type: "text"
            }).appendTo($container).addClass("number-box form-control");
            $("<label for='" + fullId + "'>" + label + "</label>").appendTo($container).addClass("time-part-box input-group-addon");
            return $input;
        };
        peTimeSpan.prototype._simplifyFormat = function (format) {
            format = format || peTimeSpan.defaultOptions.format;
            return peTimeSpan._fullFormat.split("").filter(function (part) {
                return format.indexOf(part) !== -1;
            });
        };
        peTimeSpan.defaultOptions = {
            format: "dhm",
            max: 1000,
            zeroIsEmpty: undefined
        };
        peTimeSpan.contextDefaultOptions = {
            filter: {
                zeroIsEmpty: true
            }
        };
        peTimeSpan.defaultMenu = {
            items: [
                { name: "Clear", title: resources["clear"], icon: "clear" }
            ]
        };
        peTimeSpan._fullFormat = "yMdhms";
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], peTimeSpan.prototype, "isEmpty");
        return peTimeSpan;
    }(PropertyEditor));
    // backward compatibility: access to static fields via prototype
    peTimeSpan.mixin(/** @lends peTimeSpan.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peTimeSpan.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: peTimeSpan.defaultMenu,
        /** @obsolete use static contextDefaultOptions */
        contextDefaultOptions: peTimeSpan.contextDefaultOptions
    });
    core.ui.peTimeSpan = peTimeSpan;
    PropertyEditor.DefaultMapping["timeSpan"] = peTimeSpan;
    return peTimeSpan;
});
//# sourceMappingURL=peTimeSpan.js.map