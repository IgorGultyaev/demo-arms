/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "./NotLoadedNavigationProp"], function (require, exports, NotLoadedNavigationProp) {
    "use strict";
    var NotLoadedNavigationPropSet = /** @class */ (function (_super) {
        __extends(NotLoadedNavigationPropSet, _super);
        /**
         * Результат обращения к незагруженному массивногму навигируемому свойству.
         * @constructs NotLoadedNavigationPropSet
         * @extends NotLoadedNavigationProp
         * @param {DomainObject} parent
         * @param propMeta
         */
        function NotLoadedNavigationPropSet(parent, propMeta) {
            return _super.call(this, parent, propMeta) || this;
        }
        NotLoadedNavigationPropSet.prototype._error = function () {
            return new Error("Property " + this._propMeta.name + " is not loaded");
        };
        NotLoadedNavigationPropSet.prototype.load = function (options) {
            return _super.prototype.load.call(this, options);
        };
        NotLoadedNavigationPropSet.prototype.all = function () {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.get = function (index) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.count = function () {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.indexOf = function (item) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.add = function (item) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.remove = function (item) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.clear = function () {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.reset = function (items) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.move = function (indexFrom, indexTo) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.forEach = function (iterator, context) {
            throw this._error();
        };
        NotLoadedNavigationPropSet.prototype.find = function (predicate, context) {
            throw this._error();
        };
        return NotLoadedNavigationPropSet;
    }(NotLoadedNavigationProp));
    return NotLoadedNavigationPropSet;
});
//# sourceMappingURL=NotLoadedNavigationPropSet.js.map