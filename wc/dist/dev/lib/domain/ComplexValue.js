/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * The value of the complex property
     */
    var ComplexValue = /** @class */ (function () {
        function ComplexValue(parent, propMeta) {
            this.parent = parent;
            this.propMeta = propMeta;
        }
        ComplexValue.prototype.get = function (propName, options) {
            var fullPropName = this.getParentPropName(propName);
            return this.parent.get(fullPropName, options);
        };
        ComplexValue.prototype.set = function (propName, propValue, options) {
            var fullPropName = this.getParentPropName(propName);
            this.parent.set(fullPropName, propValue);
        };
        ComplexValue.prototype.getParentPropName = function (propName) {
            return this.propMeta.name + "." + propName;
        };
        return ComplexValue;
    }());
    return ComplexValue;
});
//# sourceMappingURL=ComplexValue.js.map