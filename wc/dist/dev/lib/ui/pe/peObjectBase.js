/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/ui/pe/PropertyEditor"], function (require, exports, PropertyEditor) {
    "use strict";
    var peObjectBase = /** @class */ (function (_super) {
        __extends(peObjectBase, _super);
        /**
         * @description Base class for navigation property editors.
         * @constructs peObjectBase
         * @extends PropertyEditor
         * @param options
         */
        function peObjectBase(options) {
            var _this = this;
            options = peObjectBase.mixOptions(options, peObjectBase.defaultOptions);
            _this = _super.call(this, options) || this;
            if (_this.options.flavor === "aggregation" && _this.options.freezeUrl === undefined) {
                _this.options.freezeUrl = true;
            }
            return _this;
        }
        peObjectBase.defaultOptions = {
            ref: undefined,
            /**
             * A kind of relationship
             * @type {"full"|"aggregation"|"reference"}
             */
            flavor: "full",
            /**
             * If true then nested parts will be opened with 'freezeAppState' option
             * @type {Boolean}
             */
            freezeUrl: undefined
        };
        return peObjectBase;
    }(PropertyEditor));
    /*
    interface peObjectBase {
        // set empty type of value - type should be overridden in child classes
        value(v: {}): void;
        value(): {};
    }
    */
    peObjectBase.mixin({
        defaultOptions: peObjectBase.defaultOptions
    });
    return peObjectBase;
});
//# sourceMappingURL=peObjectBase.js.map