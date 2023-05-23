/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "./support"], function (require, exports, lang, support) {
    "use strict";
    var NotLoadedObject = /** @class */ (function (_super) {
        __extends(NotLoadedObject, _super);
        /**
         * Representation of a not-loaded domain object with known identity.
         * @constructs NotLoadedObject
         * @extends Observable
         * @param meta
         * @param id
         */
        function NotLoadedObject(meta, id) {
            var _this = _super.call(this) || this;
            _this.meta = meta;
            _this.id = id;
            return _this;
        }
        NotLoadedObject.prototype.load = function (options) {
            var that = this, deferred = that._deferredLoad;
            // NOTE: Previous loading is already in progress - we can return it if no options are specified.
            // But if there are some options, we should load again with these options.
            if (deferred && lang.isEmpty(options)) {
                return deferred;
            }
            support.throwIfDetached(that);
            // NOTE: wait until the previous loading is completed,
            // maybe after it we will not have to call DataFacade at all.
            return lang.async.then(deferred, function () {
                return that._doLoad(options);
            });
        };
        NotLoadedObject.prototype._doLoad = function (options) {
            var that = this;
            return that._deferredLoad = that.uow.ensureLoaded(that, options)
                .always(function () { that._deferredLoad = undefined; });
        };
        NotLoadedObject.prototype.toString = function () {
            var that = this;
            return that.meta.descr + " (" + that.meta.name + ") (id: " + that.id + ")";
        };
        __decorate([
            lang.decorators.constant(true)
        ], NotLoadedObject.prototype, "isGhost");
        __decorate([
            lang.decorators.constant(false)
        ], NotLoadedObject.prototype, "isLoaded");
        return NotLoadedObject;
    }(lang.Observable));
    return NotLoadedObject;
});
//# sourceMappingURL=NotLoadedObject.js.map