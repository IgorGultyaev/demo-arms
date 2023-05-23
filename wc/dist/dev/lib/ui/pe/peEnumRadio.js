/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/peEnumBase", "lib/utils", "i18n!lib/nls/resources", "xcss!lib/ui/styles/peEnum", "xcss!lib/ui/styles/peEnumRadio"], function (require, exports, $, core, peEnumBase, utils, resources) {
    "use strict";
    var peEnumRadio = /** @class */ (function (_super) {
        __extends(peEnumRadio, _super);
        /**
         * @constructs peEnumRadio
         * @extends peEnumBase
         * @param options
         */
        function peEnumRadio(options) {
            var _this = this;
            options = peEnumRadio.mixOptions(options, peEnumRadio.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peEnumRadio.prototype.doRender = function (domElement) {
            var that = this, bindable;
            var element = $("<div/>").appendTo(domElement);
            element.addClass("x-pe-enum x-pe-enum-radio");
            var groupName = that.options.name + "_" + (that.viewModel.id || utils.generateGuid());
            var isHorizontal = that.options.orientation === "horizontal";
            that.showNullValue = that.options.nullable && that.options.showNullValue;
            if (that.showNullValue) {
                // add "null" option:
                var id = groupName + "_null";
                $("<div></div>")
                    .addClass(isHorizontal ? "radio-inline" : "radio")
                    .append($("<label />")
                    .attr("for", id)
                    .append($("<input />", { type: "radio", id: id, value: "", name: groupName }))
                    .append(that.options.nullValueText))
                    .appendTo(element);
            }
            var disabledMembers = {};
            if (that.options.disabledMembers) {
                core.lang.forEach(that.options.disabledMembers, function (name) {
                    disabledMembers[name] = true;
                });
            }
            core.lang.forEach(that.members(), function (enumMember, name) {
                var id = groupName + "_" + enumMember.value;
                var $input = $("<input />", {
                    type: "radio",
                    id: id,
                    value: enumMember.value,
                    name: groupName,
                    disabled: disabledMembers[name]
                });
                if (disabledMembers[name]) {
                    $input.attr("data-disabled", "1");
                }
                var text = enumMember.descr || name;
                if (!that.options.useValueAsLabel && that.options.itemFormatter) {
                    text = that.options.itemFormatter(enumMember);
                    if (core.isHtml(text)) {
                        text = text.toHTML();
                    }
                }
                $("<div></div>")
                    .addClass(isHorizontal ? "radio-inline" : "radio")
                    .append($("<label />")
                    .attr("for", id)
                    .append($input)
                    .append(that.options.useValueAsLabel ? enumMember.value : text))
                    .appendTo(element);
            });
            // принудительное фокусирование батона при клике мышкой
            element.bind("click", function (e) {
                if (e.target.tagName === "INPUT") {
                    $(e.target).focus();
                }
            });
            bindable = {
                get: function () {
                    var v = element.find("input:checked").val();
                    if (!that.isDomain) {
                        return that.parseValue(v);
                    }
                    return v !== undefined ? v : null;
                },
                set: function (v) {
                    if (v != null) {
                        element.find("input[value='" + v + "']").prop("checked", true);
                    }
                    else if (that.showNullValue) {
                        element.find("input[value='']").prop("checked", true);
                    }
                    else {
                        element.find("input:checked").prop("checked", false);
                    }
                },
                onchange: function (handler) {
                    // когда обновляется значение
                    if (that.options.changeTrigger === "keyPressed") {
                        // перемещение по группе (ползаем стрелками и перемещаем фокус)
                        element.find("input").bind("change", handler);
                    }
                    else {
                        // уходим из группы радиобатонов
                        that.element.focusout(function () {
                            window.setTimeout(function () {
                                if ($("[id*='" + that.id + "']").is($(document.activeElement))) {
                                    handler();
                                }
                            }, 200);
                        });
                    }
                    return {
                        dispose: function () {
                            element.find("input").unbind("change", handler);
                        }
                    };
                }
            };
            that.element = element;
            that.databind(bindable);
            return _super.prototype.doRender.call(this, domElement);
        };
        peEnumRadio.prototype.focus = function () {
            if (this.element) {
                var input = this.element.find("input");
                var checked = input.filter(":checked");
                var target = checked[0] || input[0];
                if (target) {
                    $(target).focus();
                }
            }
        };
        peEnumRadio.defaultOptions = {
            useValueAsLabel: undefined,
            orientation: "vertical",
            changeTrigger: "keyPressed",
            nullValueText: resources["not_specified"],
            showNullValue: true
        };
        return peEnumRadio;
    }(peEnumBase));
    peEnumRadio.mixin({
        defaultOptions: peEnumRadio.defaultOptions
    });
    core.ui.peEnumRadio = peEnumRadio;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        if (propMd.ref) {
            // либо явно указан presentation,
            // либо это не флаги и presentation по умолчанию
            if (propMd.presentation === "radio" ||
                !propMd.presentation && (!propMd.flags && (!propMd.ref.flags || propMd.flags === false))) {
                return core.ui.peEnumRadio;
            }
        }
    }, { vt: "enum" });
    return peEnumRadio;
});
//# sourceMappingURL=peEnumRadio.js.map