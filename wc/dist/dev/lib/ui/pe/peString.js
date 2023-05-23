/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/pe/PropertyEditor", "i18n!lib/nls/resources", "lib/ui/menu/Menu", "lib/ui/menu/MenuButtonsPresenter", "xcss!lib/ui/styles/peString"], function (require, exports, $, core, binding, PropertyEditor, resources, Menu, MenuButtonsPresenter) {
    "use strict";
    var lang = core.lang;
    var peString = /** @class */ (function (_super) {
        __extends(peString, _super);
        /**
         * @class peString
         * @extends PropertyEditor
         * @param options
         */
        function peString(options) {
            var _this = this;
            options = peString.mixContextOptions(options, peString.defaultOptions, peString.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            _this.isMultiline = !!core.lang.coalesce(_this.options.isMultiline, _this.options.vt === "text");
            _this.options.rows = _this.isMultiline ? _this.options.rows : 1;
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
            }
            return _this;
        }
        peString.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(peString.defaultMenu, "peString");
        };
        peString.prototype.createMenu = function () {
            return new Menu(this.createMenuDefaults(), this.options.menu);
        };
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        peString.prototype.createCommands = function () {
            var that = this;
            var commands = {};
            if (!that.options.hideClearButton) {
                commands.Clear = new core.commands.BoundCommand(that.doClear, that.canClear, that);
            }
            return core.lang.extend(commands, that.options.commands);
        };
        peString.prototype.doClear = function () {
            if (!this.element) {
                return;
            }
            $(this.element).val("")
                .trigger("input")
                .trigger("change")
                .focus();
        };
        peString.prototype.canClear = function () {
            return !this.disabled() && !this.isEmpty();
        };
        peString.prototype.doRender = function (domElement) {
            var that = this, options = that.options, $textBox, bindable;
            if (that.isMultiline) {
                $textBox = that._renderTextArea(domElement);
            }
            else {
                $textBox = that._renderInputText(domElement);
            }
            that.element = $textBox;
            $textBox.addClass("form-control").attr("name", options.name);
            if (!options.nullable) {
                $textBox.attr("required");
            }
            if (options.placeholder) {
                $textBox.attr("placeholder", options.placeholder);
            }
            binding.databind(binding.html($textBox, "disabled"), binding.domain(that, "disabled"));
            bindable = binding.html($textBox, that.options.changeTrigger === "keyPressed" ? "valueLive" : undefined);
            that.databind(bindable);
            // trigger event for refresh
            $textBox.trigger("input");
            _super.prototype.doRender.call(this, domElement);
        };
        peString.prototype._renderTextArea = function (domElement) {
            return $("<textarea />")
                .appendTo(domElement)
                .addClass("x-pe-text")
                .attr("rows", this.options.rows || 1);
        };
        peString.prototype._renderInputText = function (domElement) {
            var that = this, $container = $("<div class='x-pe-string input-group'/>").appendTo(domElement), iconHtml = that.options.addonIcon && core.ui.iconProvider ? core.ui.iconProvider.getIcon(that.options.addonIcon) : "", $addon = iconHtml ? $("<span class='input-group-addon'>" + iconHtml + "</span>").appendTo($container) : null, $textBox = $("<span class='x-pe-string-textbox'></span>").appendTo($container), $input = $("<input class='x-pe-string-input' type='" + that.options.inputType + "'/>").appendTo($textBox), $clearBtn;
            if (that.options.maxLen) {
                $input.attr("maxlength", that.options.maxLen);
            }
            $input.bind("input keyup", function () {
                var val = $(this).val();
                that.isEmpty(!val);
            });
            if (that.commands.Clear) {
                $input.addClass("has-clear-btn");
                $clearBtn = $("<span class='clear-btn'>&times;</span>").appendTo($textBox);
                binding.commandBind($clearBtn, that.commands.Clear);
            }
            if (that.menu.items && that.menu.items.length) {
                that._renderCustomMenu($container);
            }
            if (!that.options.hideLetterCounter) {
                that._renderLetterCounter($container, $input);
            }
            return $input;
        };
        peString.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            this.isEmpty(!value);
        };
        peString.prototype._renderCustomMenu = function ($container) {
            var that = this;
            var $btnContainer = $("<span class='input-group-btn' />").appendTo($container);
            that.menuPresenter = MenuButtonsPresenter.create({
                ungrouped: true,
                inline: true,
                itemPresentation: "icon"
            });
            that.menuPresenter.setViewModel(that.menu);
            that.menuPresenter.render($btnContainer);
        };
        peString.prototype._renderLetterCounter = function ($container, $textBox) {
            var that = this;
            var $counterEl = $("<span class='input-group-addon x-pe-string-counter' />")
                .attr("title", resources["peString.letterCounter.tip"])
                .appendTo($container);
            $textBox.bind("input keyup", function () {
                var val = $(this).val();
                that._updateLetterCounter($counterEl, val);
            });
            that.viewModel.bind("change:" + that.viewModelProp, function (sender, value) {
                that._updateLetterCounter($counterEl, value);
            }, that);
        };
        peString.prototype._updateLetterCounter = function ($counterEl, val) {
            var maxLen = this.options.maxLen;
            val = (val ? val.toString().length + "" : "0");
            if (maxLen) {
                val = val + "/" + maxLen;
            }
            $counterEl.text(val);
        };
        peString.defaultOptions = {
            /**
             * Specifies the number of rows for a multiline text. Ignored if 'isMultiline' == false.
             * @type Number
             */
            rows: 3,
            /**
             * type for html input control ("text" by default)
             */
            inputType: "text",
            hideLetterCounter: false,
            hideClearButton: false
        };
        /**
         * Default options by context
         */
        peString.contextDefaultOptions = {
            filter: {
                hideLetterCounter: true
            },
            inline: {
                hideLetterCounter: true
            }
        };
        peString.defaultMenu = {
            items: []
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], peString.prototype, "isEmpty");
        return peString;
    }(PropertyEditor));
    peString.mixin(/** @lends peString.prototype */ {
        defaultOptions: peString.defaultOptions,
        contextDefaultOption: peString.contextDefaultOptions
    });
    core.ui.peString = peString;
    core.ui.PropertyEditor.DefaultMapping["string"] = peString;
    core.ui.PropertyEditor.DefaultMapping["text"] = peString;
    core.ui.PropertyEditor.DefaultMapping["uuid"] = peString;
    return peString;
});
//# sourceMappingURL=peString.js.map