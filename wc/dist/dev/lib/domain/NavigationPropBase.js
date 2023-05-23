/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    var NavigationPropBase = /** @class */ (function (_super) {
        __extends(NavigationPropBase, _super);
        /**
         * @constructs NavigationPropBase
         * @extends Observable
         */
        function NavigationPropBase(parent, propMeta) {
            var _this = _super.call(this) || this;
            _this._parent = parent;
            _this._propMeta = propMeta;
            return _this;
        }
        return NavigationPropBase;
    }(lang.Observable));
    return NavigationPropBase;
});
//# sourceMappingURL=NavigationPropBase.js.map