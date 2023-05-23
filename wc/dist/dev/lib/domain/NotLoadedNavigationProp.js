/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "./support", "./NavigationPropBase", "i18n!lib/nls/resources"], function (require, exports, lang, support, NavigationPropBase, resources) {
    "use strict";
    var NotLoadedNavigationProp = /** @class */ (function (_super) {
        __extends(NotLoadedNavigationProp, _super);
        /**
         * Результат обращения к незагруженному скалярному навигируемому свойству.
         * @constructs NotLoadedNavigationProp
         * @extends NavigationPropBase
         * @param {DomainObject} parent
         * @param propMeta
         */
        function NotLoadedNavigationProp(parent, propMeta) {
            return _super.call(this, parent, propMeta) || this;
        }
        /**
         *
         * @param {Object} [options]
         * @param {Boolean} [options.idsOnly] do not load all value objects (by default they are loaded)
         * @param {Boolean} [options.reload] force loading even if all data is already loaded
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise} DomainObject (for scalar) or NavigationPropSet (for set)
         */
        NotLoadedNavigationProp.prototype.load = function (options) {
            var that = this, deferred = that._deferredLoad;
            // NOTE: Previous loading is already in progress - we can return it if no options are specified.
            // But if there are some options, we should load again with these options.
            if (deferred && lang.isEmpty(options)) {
                return deferred;
            }
            support.throwIfDetached(that._parent);
            if (that._parent.isGhost) {
                throw new Error("Object should be loaded");
            }
            // NOTE: wait until the previous loading is completed,
            // maybe after it we will not have to call DataFacade at all.
            return lang.async.then(deferred, function () {
                return that._doLoad(options);
            });
        };
        NotLoadedNavigationProp.prototype._doLoad = function (options) {
            var that = this;
            return that._deferredLoad = that._parent.uow
                .ensurePropLoaded(that._parent, that._propMeta.name, options)
                .then(function () {
                // propOrObj - объект-значение скалярного свойства или описатель массивного навигируемого свойства
                var propOrObj = that._parent.get(that._propMeta.name);
                if (propOrObj && !propOrObj.isGhost || propOrObj === null) {
                    that.trigger("load", that, { loaded: propOrObj });
                }
                return propOrObj;
            })
                .always(function () {
                // удаляем таск загрузки
                that._deferredLoad = undefined;
            });
        };
        /**
         * @deprecated Use `load` method instead
         */
        NotLoadedNavigationProp.prototype.loadItems = function (options) {
            if (!this._propMeta.many) {
                throw new Error("Метод loadItems не должен вызываться для скалярных навигируемых свойств.");
            }
            return this.load(options);
        };
        NotLoadedNavigationProp.prototype.toString = function () {
            return resources.not_loaded;
        };
        __decorate([
            lang.decorators.constant(false)
        ], NotLoadedNavigationProp.prototype, "isLoaded");
        __decorate([
            lang.decorators.constant(true)
        ], NotLoadedNavigationProp.prototype, "isGhost");
        return NotLoadedNavigationProp;
    }(NavigationPropBase));
    return NotLoadedNavigationProp;
});
//# sourceMappingURL=NotLoadedNavigationProp.js.map