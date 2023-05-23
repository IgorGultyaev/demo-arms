/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/peEnumDropDownBase", "lib/ui/pe/peEnumCheckbox", "xcss!lib/ui/styles/peEnum", "xcss!lib/ui/styles/peEnumDropDownSelect"], function (require, exports, $, core, peEnumDropDownBase, peEnumCheckbox) {
    "use strict";
    var lang = core.lang;
    var peEnumDropDownSelect = /** @class */ (function (_super) {
        __extends(peEnumDropDownSelect, _super);
        /**
         * @constructs peEnumDropDownSelect
         * @extends peEnumDropDownBase
         * @param {peEnumDropDownSelect.Options} options
         */
        function peEnumDropDownSelect(options) {
            var _this = this;
            options = peEnumDropDownSelect.mixContextOptions(options, peEnumDropDownSelect.defaultOptions, peEnumDropDownSelect.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peEnumDropDownSelect.prototype.doRender = function (domElement) {
            var that = this, options = that.options, flags = that.flags, bindable, select;
            _super.prototype.doRender.call(this, domElement);
            that.element.addClass("x-pe-enum-dropdown-select");
            select = that.select;
            if (!flags) {
                bindable = {
                    get: function () {
                        var v = select.val();
                        if (!that.isDomain) {
                            return that.parseValue(v);
                        }
                        return v;
                    },
                    set: function (v) {
                        select.val(v);
                    }
                };
            }
            else {
                if ((core.platform.isMobileDevice || options.modalMultiple) && that.navigationService) {
                    that.select.hide();
                    var valuePresenter_1 = $("<div class='value-presentation'/>").appendTo(that.element);
                    valuePresenter_1.on("click", function (e) {
                        e.preventDefault();
                        that._selectOptions();
                    });
                    that._valuePresenter = valuePresenter_1;
                    bindable = {
                        set: function (v) {
                            var txtValue = "";
                            if (v == undefined) {
                                txtValue = options.placeholder;
                            }
                            else {
                                lang.forEach(that.members(), function (enumMember) {
                                    if ((v & enumMember.value) == enumMember.value) {
                                        txtValue && (txtValue += "; ");
                                        txtValue += (enumMember.descr || enumMember.name);
                                    }
                                });
                            }
                            valuePresenter_1.text(txtValue);
                        }
                    };
                }
                else {
                    if (options.multipleSize !== undefined) {
                        that.select.prop("size", options.multipleSize);
                    }
                    if (options.multipleHeight !== undefined) {
                        that.select.css("height", options.multipleHeight);
                    }
                    bindable = {
                        get: function () {
                            return that._getFlagsValue();
                        },
                        set: function (v) {
                            that._setFlagsValue(v);
                        }
                    };
                }
            }
            bindable.onchange = function (handler) {
                select.bind("change", handler);
                return {
                    dispose: function () {
                        select.unbind("change", handler);
                    }
                };
            };
            that.databind(bindable);
        };
        peEnumDropDownSelect.prototype._selectOptions = function () {
            var that = this, options = that.options, innerPE, innerViewModel = core.lang.Observable.create(), modelProp = that.viewModelProp;
            if (that.disabled()) {
                return;
            }
            innerPE = new peEnumCheckbox(options);
            innerViewModel[modelProp] = core.lang.Observable.accessor(modelProp);
            innerViewModel[modelProp](that.viewModel[modelProp]());
            innerPE.setViewModel(innerViewModel);
            that.navigationService.openModal({
                part: innerPE,
                dialogOptions: {
                    header: options.placeholder,
                    overlay: true
                },
                onReturn: function (result) {
                    if (result === "ok") {
                        that.viewModel[modelProp](innerViewModel[modelProp]());
                    }
                }
            });
        };
        peEnumDropDownSelect.prototype._setWidth = function () {
            this.select.css("width", this.options.width);
        };
        peEnumDropDownSelect.defaultOptions = {
            multipleHeight: undefined,
            multipleSize: undefined,
            modalMultiple: false
        };
        return peEnumDropDownSelect;
    }(peEnumDropDownBase));
    // backward compatibility:
    peEnumDropDownSelect.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: peEnumDropDownSelect.defaultOptions
    });
    core.ui.peEnumDropDownSelect = peEnumDropDownSelect;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        if (propMd.ref &&
            (core.platform.isMobileDevice ||
                (propMd.ref.flags && propMd.presentation === "select") ||
                (!propMd.ref.flags && propMd.presentation === "select"))) {
            return core.ui.peEnumDropDownSelect;
        }
    }, { vt: "enum" });
    return peEnumDropDownSelect;
});
//# sourceMappingURL=peEnumDropDownSelect.js.map