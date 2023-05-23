/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/peEnumBase", "xcss!lib/ui/styles/peEnum", "xcss!lib/ui/styles/peEnumCheckbox"], function (require, exports, $, core, peEnumBase) {
    "use strict";
    var lang = core.lang;
    var peEnumCheckbox = /** @class */ (function (_super) {
        __extends(peEnumCheckbox, _super);
        /**
         * @constructs peEnumCheckbox
         * @extends peEnumBase
         * @param options
         */
        function peEnumCheckbox(options) {
            var _this = this;
            options = peEnumCheckbox.mixOptions(options, peEnumCheckbox.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peEnumCheckbox.prototype.doRender = function (domElement) {
            var that = this, ref = that.options.ref, $element = $("<div class='x-pe-enum x-pe-enum-checkbox' />").appendTo(domElement);
            if (that.options.orientation === "horizontal") {
                $element.addClass("x-pe-enum-checkbox-horizontal");
            }
            var disabledMembers = {};
            if (that.options.disabledMembers) {
                core.lang.forEach(that.options.disabledMembers, function (name) {
                    disabledMembers[name] = true;
                });
            }
            lang.forEach(that.members(), function (enumMember, name) {
                // для флагов нулевой элемент генерируется только если свойство нулабельное
                if (!that.flags || (enumMember.value !== 0 || that.options.nullable)) {
                    var $input = $("<input />", {
                        type: "checkbox",
                        value: enumMember.value,
                        name: that.options.name,
                        disabled: disabledMembers && disabledMembers[name]
                    });
                    if (disabledMembers[name]) {
                        $input.attr("data-disabled", "1");
                    }
                    var text = enumMember.descr || name;
                    if (that.options.itemFormatter) {
                        text = that.options.itemFormatter(enumMember);
                        if (core.isHtml(text)) {
                            text = text.toHTML();
                        }
                    }
                    $("<div></div>")
                        .addClass(that.options.orientation === "horizontal" ? "checkbox-inline" : "checkbox")
                        .append($("<label />")
                        .append($input)
                        .append(text))
                        .appendTo($element);
                }
            });
            // эмуляция поведения радиобатонов для чекбоксов
            if (!that.flags) {
                $element.find("input").bind("change", function () {
                    // все кроме кликнутого снимаются
                    $element.find(":checkbox").not($(this)).prop("checked", false);
                    that.options.nullable || $(this).prop("checked", true);
                });
            }
            else {
                // если это флаги - нужно добавить обработку нулевого элемента
                that._zeroMember = core.lang.find(that.members(), function (enumMember) { return enumMember.value === 0; });
                // дополнительная логика при кликах на чекбоксах при условии наличии нулевого элемента и нулабельности свойства
                if (that._zeroMember && that.options.nullable) {
                    var zeroCheckElement_1 = $element.find(":checkbox[value='0']").bind("change", function () {
                        // если кликнули по нулевому элементу - снимаем галки со всех остальных
                        $element.find(":checkbox").not($(this)).prop("checked", false);
                        $(this).prop("checked", $(this).prop("checked"));
                    });
                    // если кликнули по остальным галкам - снять галку нулевого элемента
                    $element.find(":checkbox").not(zeroCheckElement_1).bind("change", function () {
                        zeroCheckElement_1.prop("checked", false);
                    });
                }
            }
            // принудительное фокусирование чекбокса при клике мышкой
            $element.find("input").click(function (e) {
                e.stopPropagation();
                $(e.currentTarget).focus();
            });
            // при клике по лейблу генерится "лишний" клик на чекбоксе - воспрепятствуем
            $element.find("label").click(function (e) {
                e.stopPropagation();
            });
            that.element = $element;
            that.databind(that._getBindable($element));
            return _super.prototype.doRender.call(this, domElement);
        };
        peEnumCheckbox.prototype._getBindable = function ($element) {
            var that = this, bindable;
            if (that.flags) {
                bindable = {
                    get: function () {
                        var v = 0;
                        $element.find("input:checked").each(function (index, el) {
                            v = v | $(el).val();
                        });
                        // сняты все галки
                        if (!$element.find("input:checked").length) {
                            // нет нулевого, свойство нулабельное - значение null
                            // нет нулевого, свойство не ненулабельное - значение тоже null и будет ошибка валидации
                            // есть нулевой, нулабельное - зачение null
                            if (!that._zeroMember || that._zeroMember && that.options.nullable) {
                                v = null;
                            }
                        }
                        // для случая наличия нулевого элемента и ненулабельности - значение будет 0
                        return v;
                    },
                    set: function (v) {
                        if (v == null) {
                            $element.find("input:checked").prop("checked", false);
                        }
                        else if (v === 0 && that._zeroMember && that.options.nullable) {
                            $element.find(":checkbox[value='0']").prop("checked", true);
                        }
                        else {
                            $element.find("input").each(function (index, el) {
                                var elementVal = parseInt($(el).val()) || 0, checked = elementVal && (v & elementVal) === elementVal;
                                $(el).prop("checked", checked);
                            });
                        }
                    }
                };
            }
            else {
                bindable = {
                    get: function () {
                        var v = $element.find("input:checked").val();
                        if (!that.isDomain) {
                            return that.parseValue(v);
                        }
                        return v;
                    },
                    set: function (v) {
                        if (v == null) {
                            $element.find("input:checked").prop("checked", false);
                        }
                        else {
                            $element.find("input").each(function (index, el) {
                                var checked = $(el).val() == v; // don't use strict compare ===, string and numbers can be compared here
                                $(el).prop("checked", checked);
                            });
                        }
                    }
                };
            }
            bindable.onchange = function (handler) {
                $element.find("input").bind("change", handler);
                return {
                    dispose: function () {
                        $element.find("input").unbind("change", handler);
                    }
                };
            };
            return bindable;
        };
        peEnumCheckbox.defaultOptions = {};
        return peEnumCheckbox;
    }(peEnumBase));
    peEnumCheckbox.mixin({
        defaultOptions: peEnumCheckbox.defaultOptions
    });
    core.ui.peEnumCheckbox = peEnumCheckbox;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        if (propMd.ref) {
            // либо явно указан presentation в виде чекбоксов,
            // либо это флаги (не отключенные для свойства) и presentation по умолчанию
            if (propMd.presentation === "checkbox" ||
                !propMd.presentation && (propMd.flags || propMd.ref.flags && propMd.flags !== false)) {
                return core.ui.peEnumCheckbox;
            }
        }
    }, { vt: "enum" });
    return peEnumCheckbox;
});
//# sourceMappingURL=peEnumCheckbox.js.map