/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/pe/PropertyEditor", "lib/validation"], function (require, exports, core, PropertyEditor, validation) {
    "use strict";
    var lang = core.lang;
    var peEnumBase = /** @class */ (function (_super) {
        __extends(peEnumBase, _super);
        /**
         * @constructs peEnumBase
         * @extends PropertyEditor
         * @param options
         */
        function peEnumBase(options) {
            var _this = this;
            options = peEnumBase.mixOptions(options, peEnumBase.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.flags = lang.coalesce(_this.options.flags, options.ref && options.ref.flags);
            return _this;
        }
        peEnumBase.prototype.setViewModel = function (viewModel) {
            _super.prototype.setViewModel.call(this, viewModel);
            this.isDomain = viewModel && viewModel.meta && viewModel.meta.props && viewModel.meta.props[this.viewModelProp];
        };
        peEnumBase.prototype.members = function () {
            var that = this, opts = that.options, members;
            if (opts.includeMembers || opts.members) {
                if (opts.members && lang.isArray(opts.members)) {
                    console.warn("Usage of deprecated option peEnumBase.Options.members, use includeMembers instead");
                    opts.includeMembers = opts.members;
                }
                members = {};
                core.lang.forEach(opts.includeMembers, function (name) {
                    var member = opts.ref.members[name];
                    if (member) {
                        members[name] = member;
                    }
                });
            }
            if (opts.excludeMembers) {
                members = members || core.lang.clone(opts.ref.members);
                core.lang.forEach(opts.excludeMembers, function (name) {
                    delete members[name];
                });
            }
            return members || opts.ref.members;
        };
        peEnumBase.prototype.parseValue = function (v) {
            var that = this;
            var enumMeta = that.options.ref;
            var valueParser = validation.getParser(enumMeta.vt || "i4");
            if (valueParser) {
                var result = valueParser.tryParse(that.options, v);
                if (result && result.parsedValue) {
                    return result.parsedValue;
                }
            }
            if (v === "" || isNaN(v))
                return null;
            return v;
        };
        peEnumBase.prototype._onDisabledChange = function (disabled) {
            this.element.find("input:not([data-disabled])").prop("disabled", !!disabled);
        };
        peEnumBase.defaultOptions = {};
        return peEnumBase;
    }(PropertyEditor));
    peEnumBase.mixin({
        defaultOptions: peEnumBase.defaultOptions
    });
    core.ui.peEnumBase = peEnumBase;
    return peEnumBase;
});
//# sourceMappingURL=peEnumBase.js.map