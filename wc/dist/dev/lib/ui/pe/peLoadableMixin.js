/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    var peLoadableMixin = /** @class */ (function () {
        function peLoadableMixin() {
        }
        peLoadableMixin.prototype._onDataLoading = function (args) {
            var that = this;
            // block input in lookup field (if exist)
            that.state(peLoadableMixin.State.loading);
            that.onDataLoading(args);
            that._renderBeginLoading();
        };
        peLoadableMixin.prototype._renderBeginLoading = function () { };
        peLoadableMixin.prototype._onDataLoaded = function (args) {
            var that = this;
            that.onDataLoaded(args);
            that.lastError = null;
            that.isDataLoaded = true;
            that.state(peLoadableMixin.State.loaded);
            that._renderEndLoading();
            that._setItems(args.items);
        };
        peLoadableMixin.prototype._renderEndLoading = function () { };
        peLoadableMixin.prototype._onFailed = function (error) {
            var that = this;
            that.lastError = error;
            that.isDataLoaded = false;
            that.state(peLoadableMixin.State.failed);
            that._renderEndLoading();
            that.renderError(error);
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], peLoadableMixin.prototype, "state");
        return peLoadableMixin;
    }());
    (function (peLoadableMixin) {
        peLoadableMixin.State = {
            initial: "initial",
            loading: "loading",
            loaded: "loaded",
            failed: "failed",
            disposed: "disposed"
        };
    })(peLoadableMixin || (peLoadableMixin = {}));
    return peLoadableMixin;
});
//# sourceMappingURL=peLoadableMixin.js.map