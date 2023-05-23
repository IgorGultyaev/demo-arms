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
     * Словарь с составным ключом {key1, key2}
     */
    var PairedKeyMap = /** @class */ (function () {
        function PairedKeyMap() {
            this._values = {};
        }
        PairedKeyMap.prototype.get = function (key1, key2, defaultValue) {
            var values1 = this._values[key1] || (this._values[key1] = {});
            return values1[key2] || (values1[key2] = defaultValue);
        };
        PairedKeyMap.prototype.set = function (key1, key2, value) {
            var values1 = this._values[key1] || (this._values[key1] = {});
            values1[key2] = value;
        };
        PairedKeyMap.prototype.find = function (key1, key2) {
            var values1 = this._values[key1];
            return values1 && values1[key2];
        };
        PairedKeyMap.prototype.select = function (key1) {
            var values1 = this._values[key1];
            return values1 ? Object.keys(values1).map(function (key2) { return values1[key2]; }) : [];
        };
        PairedKeyMap.prototype.remove = function (key1, key2) {
            var values1 = this._values[key1];
            if (values1 && values1.hasOwnProperty(key2)) {
                delete values1[key2];
                if (lang.isEmptyObject(values1)) {
                    delete this._values[key1];
                }
                return true;
            }
            return false;
        };
        PairedKeyMap.prototype.forEach = function (callback, context) {
            lang.forEach(this._values, function (values1, key1) {
                lang.forEach(values1, function (value2, key2) {
                    callback.call(context, value2, key1, key2);
                });
            });
        };
        PairedKeyMap.prototype.some = function (callback, context) {
            return lang.some(this._values, function (values1, key1) {
                return lang.some(values1, function (value2, key2) {
                    return callback.call(context, value2, key1, key2);
                });
            });
        };
        PairedKeyMap.prototype.all = function () {
            var result = [];
            this.forEach(function (value) {
                result.push(value);
            });
            return result;
        };
        return PairedKeyMap;
    }());
    return PairedKeyMap;
});
//# sourceMappingURL=PairedKeyMap.js.map