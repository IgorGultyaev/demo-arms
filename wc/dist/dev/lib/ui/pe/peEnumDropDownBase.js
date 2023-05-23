/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/peEnumBase", "i18n!lib/nls/resources"], function (require, exports, $, core, peEnumBase, resources) {
    "use strict";
    var lang = core.lang;
    var peEnumDropDownBase = /** @class */ (function (_super) {
        __extends(peEnumDropDownBase, _super);
        /**
         * @constructs peEnumDropDownBase
         * @extends peEnumBase
         * @param options
         */
        function peEnumDropDownBase(options) {
            var _this = this;
            options = peEnumDropDownBase.mixOptions(options, peEnumDropDownBase.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peEnumDropDownBase.prototype.tweakOptions = function (options) {
            var placeholder = options.placeholder;
            if (!options.placeholder) {
                options.placeholder = options.flags
                    ? resources["select_value_prompt"]
                    : resources["select_values_prompt"];
            }
        };
        peEnumDropDownBase.prototype._renderSelect = function (domElement) {
            var that = this, options = that.options;
            var select = $("<select />").appendTo(domElement);
            select.addClass("form-control");
            select.attr("data-placeholder", options.placeholder);
            if (that.flags) {
                select.attr("multiple", "multiple");
            }
            else {
                // $("<option />").appendTo(select); - зачем это?
            }
            that._renderOptions(select);
            return select;
        };
        peEnumDropDownBase.prototype._renderOptions = function (select) {
            var that = this, flags = that.flags;
            // render members as <options> except zero-value member for flags
            core.lang.forEach(that.members(), function (enumMember) {
                if (!flags || enumMember.value !== 0) {
                    var text = enumMember.descr || enumMember.name || enumMember.value;
                    if (that.options.itemFormatter) {
                        text = that.options.itemFormatter(enumMember);
                        if (core.isHtml(text)) {
                            text = text.toString();
                        }
                    }
                    var $opt = $("<option />", {
                        value: enumMember.value,
                        text: text,
                        title: text
                    });
                    if (that.options.disabledMembers && lang.contains(that.options.disabledMembers, enumMember.name)) {
                        $opt.prop("disabled", true);
                    }
                    $opt.appendTo(select);
                }
            });
        };
        peEnumDropDownBase.prototype.render = function (domElement) {
            var that = this;
            var element = $("<div></div>").appendTo(domElement);
            element.addClass("x-pe-enum x-pe-enum-dropdown");
            that.element = element;
            that.select = that._renderSelect(element);
            if (that._tabIndex) {
                that._setTabIndex(that._tabIndex);
            }
            _super.prototype.render.call(this, domElement);
        };
        peEnumDropDownBase.prototype._getFlagsValue = function () {
            var v = 0;
            this.select.find("option:selected").each(function (index, optElement) {
                v = v | $(optElement).val();
            });
            return v;
        };
        peEnumDropDownBase.prototype._setFlagsValue = function (v) {
            var that = this;
            that.select.find("option").each(function (index, optElement) {
                var elementVal = $(optElement).val();
                if ((v & elementVal) == elementVal) {
                    $(optElement).attr("selected", "selected");
                }
                else {
                    $(optElement).removeAttr("selected");
                }
            });
        };
        peEnumDropDownBase.prototype._setWidth = function () { };
        peEnumDropDownBase.prototype._onDisabledChange = function (disabled) {
            var that = this, select = that.select;
            // TODO: jQuery 3.x: use select.prop("disabled", disabled)
            disabled ?
                select.prop("disabled", "disabled") :
                select.removeAttr("disabled");
            // отключается/включается переход по табу
            // запоминается текущий tabIndex для того, что бы его вернуть, когда pe раздизейблится
            // выполняется только когда _tabIndex еще не задан
            disabled && (that._tabIndex === undefined) && (that._tabIndex = select[0].tabIndex);
            that._setTabIndex(disabled ? -1 : that._tabIndex || 0);
        };
        peEnumDropDownBase.prototype.tabIndex = function (index) {
            var that = this;
            if (!arguments.length) {
                return that._tabIndex || (that.element && that.element.find("select").prop("tabIndex"));
            }
            else {
                that._tabIndex = index;
                if (that.element) {
                    that._setTabIndex(index);
                }
            }
        };
        peEnumDropDownBase.prototype._setTabIndex = function (index) {
            this.select.prop("tabIndex", index);
        };
        peEnumDropDownBase.defaultOptions = {
            width: "100%",
            noResultsText: resources["no_matches"],
            placeholder: undefined
        };
        return peEnumDropDownBase;
    }(peEnumBase));
    peEnumDropDownBase.mixin({
        defaultOptions: peEnumDropDownBase.defaultOptions
    });
    core.ui.peEnumDropDownBase = peEnumDropDownBase;
    return peEnumDropDownBase;
});
//# sourceMappingURL=peEnumDropDownBase.js.map