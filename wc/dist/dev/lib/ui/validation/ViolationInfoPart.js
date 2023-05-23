/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/ViolationInfoPart.hbs"], function (require, exports, core, View, defaultTemplate) {
    "use strict";
    var ViolationInfoPart = /** @class */ (function (_super) {
        __extends(ViolationInfoPart, _super);
        /**
         * class for object editor info
         * @constructs ViolationInfoPart
         * @extends View
         * @param {Object} options
         * @param {String|SafeHtml} options.message
         * @param {Number} options.severity
         * @param {String} options.menu
         */
        function ViolationInfoPart(options) {
            var _this = this;
            options = ViolationInfoPart.mixOptions(options, ViolationInfoPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.message(options.message);
            _this.severity = options.severity;
            _this.menu = options.menu;
            _this.persistent = options.persistent;
            return _this;
        }
        ViolationInfoPart.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            if (that.severity) {
                that.$domElement.find(".x-context-part").addClass("x-context-part--" + that.severity);
            }
        };
        ViolationInfoPart.defaultOptions = {
            template: defaultTemplate,
            severity: "error",
            message: undefined,
            menu: undefined
        };
        __decorate([
            core.lang.decorators.observableAccessor()
        ], ViolationInfoPart.prototype, "message");
        return ViolationInfoPart;
    }(View));
    return ViolationInfoPart;
});
//# sourceMappingURL=ViolationInfoPart.js.map