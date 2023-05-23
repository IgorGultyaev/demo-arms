/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/pe/PropertyEditor", "xcss!lib/ui/styles/peBoolean"], function (require, exports, $, core, binding, PropertyEditor) {
    "use strict";
    var checkStates = {
        unchecked: 0,
        checked: 1,
        indeterminate: 2
    };
    var peBoolean = /** @class */ (function (_super) {
        __extends(peBoolean, _super);
        /**
         * @constructs peBoolean
         * @extends PropertyEditor
         * @param {Object} options
         */
        function peBoolean(options) {
            var _this = this;
            options = peBoolean.mixContextOptions(options, peBoolean.defaultOptions, peBoolean.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            if ((_this.options.threeStates === undefined) && _this.options.nullable) {
                _this.options.threeStates = true;
            }
            else if (_this.options.threeStates && !_this.options.nullable) {
                // NOTE: illegal combination: we can't store '3rd state' in a not-null property
                _this.options.threeStates = false;
            }
            return _this;
        }
        peBoolean.prototype.doRender = function (domElement) {
            var that = this, options = that.options;
            var element = $("<input type='checkbox'/>").appendTo(domElement);
            if (options.showLabel) {
                element.wrap("<div class='checkbox'></div>");
                element.wrap("<label></label>");
                var $parent = element.parent();
                $parent.append(that.title());
                // NOTE: ObjectEditorPresenter для опции pe hint выводит тултип при наведении на иконку "?",
                // которая в свою очередь выводится в шаблоне EditorPage.peContainer
                // Но иконка выводится для label, если задана опция showLabel, то следовательно label в шаблоне не выводится
                // Выведем иконку помощи (если есть hint) справа от лейбла
                if (!options.hideHelp && options.hint) {
                    var iconHtml = core.ui.iconProvider.getIcon("help", { addCssClass: "x-pe-help" });
                    if (iconHtml) {
                        $parent.append(" " + iconHtml);
                    }
                }
            }
            element.addClass("x-pe-bool");
            element.attr("name", options.name);
            // принудительное фокусирование чекбокса при клике мышкой
            element.bind("click", function () {
                $(this).focus();
            });
            that.element = element;
            var bindableElement;
            if (options.threeStates) {
                // поддержка nullable чекбоксов
                // TODO добавить поддержку стокового браузера android и Safari mobile on iOS 3.1
                // см. трик с прозрачностью http://stackoverflow.com/questions/1726096/tri-state-check-box-in-html
                // определение поддержки indeterminate - http://www.softwire.com/blog/index.php/2012/06/18/using-tri-state-checkboxes-in-html/
                var correctionChangeHandler_1 = function () {
                    var checkState = element.data("check_state");
                    element.data("check_state", !checkState ? checkStates.indeterminate : (checkState - 1));
                };
                bindableElement = {
                    get: function () {
                        return (element.data("check_state") === checkStates.indeterminate)
                            ? null
                            : !!element.data("check_state");
                    },
                    set: function (v) {
                        if (v == null) {
                            element.prop("indeterminate", true);
                            element.data("check_state", checkStates.indeterminate);
                        }
                        else {
                            element.prop("indeterminate", false);
                            element.prop("checked", !!v);
                            element.data("check_state", v ? checkStates.checked : checkStates.unchecked);
                        }
                    },
                    onchange: function (handler) {
                        element.bind("change", correctionChangeHandler_1);
                        element.bind("change", handler);
                        return {
                            dispose: function () {
                                element.unbind("change", handler);
                                element.unbind("change", correctionChangeHandler_1);
                            }
                        };
                    }
                };
            }
            else if (options.nullable) {
                bindableElement = binding.html(element, "checkedNull");
            }
            else {
                bindableElement = binding.html(element, "checked");
            }
            that.databind(bindableElement);
            _super.prototype.doRender.call(this, domElement);
        };
        peBoolean.defaultOptions = {};
        /**
         * Default options by context
         */
        peBoolean.contextDefaultOptions = {
            "inline": {
                hideHelp: true
            }
        };
        return peBoolean;
    }(PropertyEditor));
    // backward compatibility: access to static fields via prototype
    peBoolean.mixin(/** @lends peBoolean.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peBoolean.defaultOptions
    });
    core.ui.peBooleanCheckbox = peBoolean;
    core.ui.peBoolean = peBoolean;
    PropertyEditor.DefaultMapping["boolean"] = peBoolean;
    PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.presentation === "checkbox" ? core.ui.peBoolean : null;
    }, { vt: "boolean" });
    return peBoolean;
});
//# sourceMappingURL=peBoolean.js.map