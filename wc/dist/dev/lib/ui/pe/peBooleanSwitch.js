/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/pe/PropertyEditor", "lib/formatters", "i18n!lib/nls/resources", "xcss!lib/ui/styles/peBooleanSwitch"], function (require, exports, $, core, binding, PropertyEditor, formatters, resources) {
    "use strict";
    var peBooleanSwitch = /** @class */ (function (_super) {
        __extends(peBooleanSwitch, _super);
        /**
         * @constructs peBooleanSwitch
         * @extends PropertyEditor
         * @param {Object} options
         */
        function peBooleanSwitch(options) {
            var _this = this;
            options = peBooleanSwitch.mixOptions(options, peBooleanSwitch.defaultOptions);
            _this = _super.call(this, options) || this;
            if ((_this.options.threeStates === undefined) && _this.options.nullable) {
                _this.options.threeStates = true;
            }
            return _this;
        }
        peBooleanSwitch.prototype.doRender = function (domElement) {
            var that = this, element = $("<div></div>").appendTo(domElement).addClass("x-pe-bool-switch").attr("tabindex", 0), options = that.options, inputs = [], selection, groupName = that.id, trueTitle = options.trueTitle || formatters.formatPropValue(options, true), falseTitle = options.falseTitle || formatters.formatPropValue(options, false);
            //that.groupName = groupName;
            if (!options.threeStates && options.nullable) {
                // 2-states nullable: true & null
                inputs.push(that._addInput(element, groupName, true, trueTitle));
                inputs.push(that._addInput(element, groupName, null, falseTitle));
            }
            else {
                // not-nullable or 3-states: true & false
                if (options.threeStates) {
                    inputs.push(that._addInput(element, groupName, null, options.nullTitle));
                }
                inputs.push(that._addInput(element, groupName, true, trueTitle));
                inputs.push(that._addInput(element, groupName, false, falseTitle));
            }
            // find selection marker
            selection = $("<a></a>").appendTo(element).css({ display: "none" });
            that.element = element;
            that._addInputHandlers(inputs, selection);
            that._bindToHtml(groupName);
            that._bindToDisabled();
            if (!that.disabled()) {
                that._addKeyboardHandlers();
            }
            _super.prototype.doRender.call(this, domElement);
        };
        peBooleanSwitch.prototype.focus = function () {
            if (this.disabled()) {
                return;
            }
            if (!this.element) {
                return;
            }
            this.element.focus();
        };
        peBooleanSwitch.prototype._addInput = function (parent, name, value, title) {
            var id = this._getInputId(name, value);
            var input = $("<input />", { type: "radio", name: this.viewModelProp, id: id, tabindex: -1 }).appendTo(parent);
            if (value != null) {
                input.attr("value", value ? "true" : "false");
            }
            var $label = $("<label></label>").appendTo(parent);
            if (formatters.isHtml(title)) {
                $label.html(title.toHTML());
            }
            else {
                $label.text(title);
            }
            $label.addClass("x-pe-bool-switch-label").attr("for", id);
            return input;
        };
        peBooleanSwitch.prototype._getInputId = function (group, val) {
            return group + "_" + (val != null ? val.toString() : "null");
        };
        peBooleanSwitch.prototype._addInputHandlers = function (inputs, selection) {
            var that = this;
            for (var i = 0; i < inputs.length; i++) {
                var input = $(inputs[i]);
                input.change(function (e) {
                    var label = $("label[for='" + e.target.id + "']");
                    that._setSelection(label, selection);
                });
            }
        };
        peBooleanSwitch.prototype._setSelection = function (item, sel) {
            var that = this, lastSelected = that._animatingTo
                ? that._animatingTo
                : that.element.find("label.selected");
            if (that._animatingTo) {
                // NOTE: because of jquery.animate-enhanced plugin, animation can be unstoppable
                // If jquery.animate-enhanced choose to use CSS3 transitions animation's callback will called anyway
                that._animatingTo.data("animation-canceled", true);
                sel.stop(true);
                that._animatingTo = null;
                //sel.hide();
                //lastSelected = that.element.find('label.selected');
            }
            if (!lastSelected.length) {
                // initial selection - on the page load
                item.addClass("selected");
                return;
            }
            // remove css-border under selected item
            lastSelected.removeClass("selected");
            // if was not animating put selection element under previously selected item
            if (!that._animatingTo) {
                sel.css({ left: lastSelected.position().left, width: lastSelected.outerWidth() });
            }
            sel.show();
            // set new end point
            that._animatingTo = item;
            // run animation to the end point
            sel.animate({ left: item.position().left, width: item.outerWidth() }, 100, "swing", function () {
                // set css-border under new selected item
                if (item.data("animation-canceled")) {
                    item.removeData("animation-canceled");
                    return;
                }
                item.addClass("selected");
                that._animatingTo = null;
                sel.hide();
            });
        };
        peBooleanSwitch.prototype._addKeyboardHandlers = function () {
            var that = this, element = that.element, keyCode = core.html.keyCode;
            // set keyup handler on outer div
            element.keyup(function (e) {
                if (that.disabled()) {
                    return;
                }
                if (e.keyCode === keyCode.SPACE || e.keyCode === keyCode.RIGHT) {
                    that._switchNext();
                }
                if (e.keyCode === keyCode.LEFT) {
                    that._switchPrev();
                }
            });
            // block default behaviour of radio buttons
            element.find("input[type='radio']").keyup(function (e) {
                e.preventDefault();
            });
            // block space handling on document
            element.keydown(function (e) {
                if (e.keyCode === keyCode.SPACE || e.keyCode === keyCode.RIGHT || e.keyCode === keyCode.LEFT) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        };
        peBooleanSwitch.prototype._switchNext = function () {
            var element = this.element;
            var current = element.find("input:checked");
            var next = element.find("input:checked ~ input");
            if (!current.length || !next.length) {
                next = element.find("input").eq(0);
            }
            else {
                next = next.eq(0);
            }
            this._doSwitch(next);
        };
        peBooleanSwitch.prototype._switchPrev = function () {
            var inputs = this.element.find("input[type='radio']");
            var previous;
            for (var i = 0; i < inputs.length; i++) {
                if (inputs.eq(i).is(":checked")) {
                    break;
                }
                previous = inputs.eq(i);
            }
            previous = previous || inputs.last();
            this._doSwitch(previous);
        };
        peBooleanSwitch.prototype._doSwitch = function (input) {
            if (!input.is(":checked")) {
                input.prop("checked", true).trigger("change");
                // no need to call _setSelection here. it will be called from the input's change handler
            }
        };
        peBooleanSwitch.prototype._parseBoolean = function (str) {
            if (str === "true" || str === "1")
                return true;
            if (str === "false" || str === "0")
                return false;
            return null;
        };
        peBooleanSwitch.prototype._bindToHtml = function (groupName) {
            var that = this, element = that.element, bindable = {
                get: function () {
                    var v = element.find("input:checked").attr("value");
                    return v !== undefined ? that._parseBoolean(v) : null;
                },
                set: function (v) {
                    var id = that._getInputId(groupName, v), input = element.find("#" + id);
                    if (v === false && !input.length && !that.options.threeStates) {
                        // NOTE: special-case: для значения false в 2-х позиционном PE, будет считать false как null,
                        // иначе оно не отобразится
                        id = that._getInputId(groupName, null);
                        input = element.find("#" + id);
                    }
                    if (!input.length) {
                        // there's no input for current value (e.g. nullable=false but property is null) - remove selection
                        element.find("input:checked").prop("checked", false);
                        element.find("label.selected").removeClass("selected");
                        that._animatingTo = null;
                    }
                    else {
                        that._doSwitch(input);
                    }
                },
                onchange: function (handler) {
                    element.find("input").bind("change", handler);
                    return {
                        dispose: function () {
                            element.find("input").unbind("change", handler);
                        }
                    };
                }
            };
            that.databind(bindable);
        };
        peBooleanSwitch.prototype._bindElementToDisabled = function () {
            var that = this, inputs = that.element.find("input");
            for (var i = 0; i < inputs.length; i++) {
                binding.databind(binding.html(inputs[i], "disabled"), binding.domain(that, "disabled"), { oneway: true });
            }
            var bindable = {
                set: function (disabled) {
                    disabled
                        ? that.element.attr("tabindex", -1)
                        : that.element.remove("tabindex");
                }
            };
            binding.databind(bindable, binding.domain(that, "disabled"));
        };
        peBooleanSwitch.defaultOptions = {
            trueTitle: resources["peBooleanSwitch.true"],
            falseTitle: resources["peBooleanSwitch.false"],
            nullTitle: resources["peBooleanSwitch.null"],
            threeStates: undefined
        };
        return peBooleanSwitch;
    }(PropertyEditor));
    // backward compatibility: access to static fields via prototype
    peBooleanSwitch.mixin(/** @lends peBooleanSwitch.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peBooleanSwitch.defaultOptions
    });
    core.ui.peBooleanSwitch = peBooleanSwitch;
    PropertyEditor.DefaultMapping["boolean"] = peBooleanSwitch;
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return (!propMd.presentation || propMd.presentation === "switch") ? core.ui.peBooleanSwitch : null;
    }, { vt: "boolean" });
    return peBooleanSwitch;
});
//# sourceMappingURL=peBooleanSwitch.js.map