/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    /**
     * Loadable collection of DomainObjects. Can be used in peObjectList as a value of calculated property.
     */
    var DomainCollection = /** @class */ (function (_super) {
        __extends(DomainCollection, _super);
        function DomainCollection(uow, options) {
            var _this = _super.call(this) || this;
            _this.isLoaded = false;
            _this.uow = uow;
            _this.options = options;
            _this.entityType = options.entityType;
            return _this;
        }
        DomainCollection.prototype.load = function (options) {
            var that = this;
            options = lang.extend(options || {}, that.options);
            return that.uow.loadAll(that.entityType, options).then(function (objects) {
                that.add(objects);
                that.isLoaded = true;
                return that;
            });
        };
        __decorate([
            lang.decorators.constant(false)
        ], DomainCollection.prototype, "isGhost");
        return DomainCollection;
    }(lang.ObservableCollection));
    return DomainCollection;
});
//# sourceMappingURL=DomainCollection.js.map