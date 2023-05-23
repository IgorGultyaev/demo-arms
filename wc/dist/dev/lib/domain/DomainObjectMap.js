/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/utils/PairedKeyMap", "./support"], function (require, exports, PairedKeyMap, support) {
    "use strict";
    var DomainObjectMap = /** @class */ (function () {
        /**
         * Словарь, отображающий доменные объекты на значения произвольного типа
         * @constructs DomainObjectMap
         */
        function DomainObjectMap(model) {
            this._model = model;
            this._map = new PairedKeyMap();
        }
        DomainObjectMap.prototype.add = function (obj, value) {
            var key = this._getKey(obj);
            this._map.set(key, obj.id, value);
        };
        DomainObjectMap.prototype.remove = function (obj) {
            var key = this._getKey(obj);
            return this._map.remove(key, obj.id);
        };
        DomainObjectMap.prototype.find = function (entityType, id) {
            var key = this._getTypeKey(entityType);
            return this._map.find(key, id);
        };
        DomainObjectMap.prototype.findObj = function (obj) {
            var key = this._getKey(obj);
            return this._map.find(key, obj.id);
        };
        DomainObjectMap.prototype.get = function (entityType, id, defaultValue) {
            var key = this._getTypeKey(entityType);
            return this._map.get(key, id, defaultValue);
        };
        DomainObjectMap.prototype.select = function (entityType) {
            var key = this._getTypeKey(entityType);
            return this._map.select(key);
        };
        DomainObjectMap.prototype.forEach = function (callback, context) {
            this._map.forEach(callback, context);
        };
        DomainObjectMap.prototype.some = function (callback, context) {
            return this._map.some(callback, context);
        };
        DomainObjectMap.prototype.all = function () {
            return this._map.all();
        };
        DomainObjectMap.prototype._getKey = function (obj) {
            return this._getRoot(obj.meta).name;
        };
        DomainObjectMap.prototype._getTypeKey = function (entityType) {
            var entityMeta = this._model.meta.entities[support.typeNameOf(entityType)];
            return this._getRoot(entityMeta).name;
        };
        DomainObjectMap.prototype._getRoot = function (entityMeta) {
            var parentMeta;
            while (parentMeta = entityMeta.base) {
                entityMeta = parentMeta;
            }
            return entityMeta;
        };
        return DomainObjectMap;
    }());
    return DomainObjectMap;
});
//# sourceMappingURL=DomainObjectMap.js.map