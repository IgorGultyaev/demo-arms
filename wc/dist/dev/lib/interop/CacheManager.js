/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/interop/.interop.types"], function (require, exports, core, _interop_types_1) {
    "use strict";
    var lang = core.lang;
    var CacheManager = /** @class */ (function (_super) {
        __extends(CacheManager, _super);
        /**
         * @constructs CacheManager
         * @extends Observable
         * @param {Object} [options]
         */
        function CacheManager(options) {
            var _this = _super.call(this) || this;
            _this.options = {
                defaultRule: undefined,
                cacheAge: 60000 // milliseconds
            };
            options = options || {};
            _this.rule = options.defaultRule || _this.options.defaultRule;
            _this.cacheAge = options.cacheAge || _this.options.cacheAge;
            return _this;
        }
        /**
         * Return load policy for DataFacadeSmart.
         * @param query
         * @param options
         * @returns {{rule: (String|Number), maxAge: Number, loadFirst: String, allowLocal: Boolean, allowRemote: Boolean, shouldCache: Boolean}}
         */
        CacheManager.prototype.getLoadPolicy = function (query, options) {
            var policy = {
                rule: this.rule,
                maxAge: this.cacheAge
            };
            options = options || {};
            if (!query.type && query.route) {
                // non-domain data is requested, local caching is not supported
                policy.rule = _interop_types_1.LoadRule.remoteOnly;
            }
            else if (options["preventCaching"] && policy.rule === _interop_types_1.LoadRule.cached) {
                policy.rule = _interop_types_1.LoadRule.localIfOffline;
            }
            return policy;
        };
        return CacheManager;
    }(lang.Observable));
    CacheManager.mixin({
        rules: _interop_types_1.LoadRule
    });
    return CacheManager;
});
//# sourceMappingURL=CacheManager.js.map