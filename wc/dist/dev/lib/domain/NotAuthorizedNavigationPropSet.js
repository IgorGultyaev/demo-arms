/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "./support"], function (require, exports, lang, support) {
    "use strict";
    var NotAuthorizedNavigationPropSet = /** @class */ (function (_super) {
        __extends(NotAuthorizedNavigationPropSet, _super);
        /**
         * @constructs NotAuthorizedNavigationPropSet
         * @extends Observable
         */
        function NotAuthorizedNavigationPropSet() {
            return _super.call(this) || this;
        }
        NotAuthorizedNavigationPropSet.prototype.load = function () {
            return lang.resolved();
        };
        NotAuthorizedNavigationPropSet.prototype.loadItems = function () {
            return lang.resolved(this);
        };
        NotAuthorizedNavigationPropSet.prototype.ids = function () {
            return [];
        };
        NotAuthorizedNavigationPropSet.prototype.count = function () {
            return 0;
        };
        NotAuthorizedNavigationPropSet.prototype.all = function () {
            return [];
        };
        NotAuthorizedNavigationPropSet.prototype.get = function () { };
        NotAuthorizedNavigationPropSet.prototype.first = function () { };
        NotAuthorizedNavigationPropSet.prototype.indexOf = function () {
            return -1;
        };
        NotAuthorizedNavigationPropSet.prototype.contains = function () {
            return false;
        };
        NotAuthorizedNavigationPropSet.prototype.add = function () {
            throw support.errors.createNotAuthorized();
        };
        NotAuthorizedNavigationPropSet.prototype.remove = function () {
            throw support.errors.createNotAuthorized();
        };
        NotAuthorizedNavigationPropSet.prototype.move = function () {
            throw support.errors.createNotAuthorized();
        };
        NotAuthorizedNavigationPropSet.prototype.toString = function () {
            return support.values.NotAuthorizedPropValue.toString();
        };
        __decorate([
            lang.decorators.constant(true)
        ], NotAuthorizedNavigationPropSet.prototype, "isLoaded");
        __decorate([
            lang.decorators.constant(true)
        ], NotAuthorizedNavigationPropSet.prototype, "isNotAuthorized");
        __decorate([
            lang.decorators.constant(true)
        ], NotAuthorizedNavigationPropSet.prototype, "isGhost");
        return NotAuthorizedNavigationPropSet;
    }(lang.Observable));
    NotAuthorizedNavigationPropSet.singleton = new NotAuthorizedNavigationPropSet();
    return NotAuthorizedNavigationPropSet;
});
//# sourceMappingURL=NotAuthorizedNavigationPropSet.js.map