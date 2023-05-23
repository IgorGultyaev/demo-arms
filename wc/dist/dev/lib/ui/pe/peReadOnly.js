/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/PropertyEditor", "lib/binding", "lib/formatters", "xcss!lib/ui/styles/peReadOnly"], function (require, exports, $, core, PropertyEditor, binding, formatters) {
    "use strict";
    var peReadOnly = /** @class */ (function (_super) {
        __extends(peReadOnly, _super);
        /**
         * @class peReadOnly
         * @extends PropertyEditor
         * @param options
         */
        function peReadOnly(options) {
            var _this = this;
            options = peReadOnly.mixOptions(options, peReadOnly.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peReadOnly.prototype.doRender = function (domElement) {
            var that = this, options = that.options;
            var presentation = that._generatePresentation(options);
            presentation.element.appendTo(domElement);
            that.element = presentation.element;
            that.element.addClass("x-pe-readonly form-control");
            if (options.placeholder) {
                that.element.attr("placeholder", options.placeholder);
            }
            that.databind(presentation.bindable);
            _super.prototype.doRender.call(this, domElement);
        };
        peReadOnly.prototype._generatePresentation = function (options) {
            var element, bindable;
            if (options.vt === "boolean") {
                element = $("<input type='checkbox' readonly onclick='return false'/>");
                bindable = binding.html(element, "checked");
            }
            else if ((options.vt === "string" && options.isMultiline) || options.vt === "text") {
                element = $("<textarea readonly />");
                element.attr("rows", options.rows || 1);
            }
            else {
                element = $("<input type='text' readonly />");
            }
            if (!bindable) {
                bindable = element;
            }
            return {
                element: element,
                bindable: bindable
            };
        };
        peReadOnly.prototype.createBindableProp = function () {
            var that = this;
            return binding.expr(that.viewModel, function () {
                var value = this[that.viewModelProp]();
                return formatters.formatPropValue(that.options, value);
            });
        };
        peReadOnly.defaultOptions = {
            rows: 1,
            nullable: true
        };
        return peReadOnly;
    }(PropertyEditor));
    // backward compatibility: access to static fields via prototype
    peReadOnly.mixin(/** @lends peDateTime.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peReadOnly.defaultOptions
    });
    core.ui.peReadOnly = peReadOnly;
    // NOTE: peViewOnly should be created for read-only properties by default (with priority 10). Use less priority here.
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.readOnly ? core.ui.peReadOnly : null;
    }, { priority: 9 });
    return peReadOnly;
});
//# sourceMappingURL=peReadOnly.js.map