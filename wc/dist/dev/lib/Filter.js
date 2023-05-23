/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/binding"], function (require, exports, lang, binding) {
    "use strict";
    var Filter = /** @class */ (function (_super) {
        __extends(Filter, _super);
        /**
         * @class Filter
         * @extends Observable
         * @param items
         */
        function Filter(items) {
            var _this = _super.call(this) || this;
            var that = _this;
            that._disposes = {};
            that._restrictions = new lang.ObservableDictionary();
            items && that.addRange(items);
            that._restrictions.bind("itemChange", that._onRestrictionsChange, that);
            that._restrictions.bind("itemsChange", that._onRestrictionsChange, that);
            return _this;
        }
        Filter.prototype._onRestrictionsChange = function (sender, args) {
            this.trigger("change", this, args);
        };
        Filter.prototype.set = function (map) {
            this._restrictions.reset(map);
        };
        Filter.prototype.add = function (name, expr) {
            var that = this, bindable, v;
            // TODO так себе проверка на bindable
            (bindable = (expr && (lang.isFunction(expr.onchange) ||
                lang.isFunction(expr.set) ||
                lang.isFunction(expr.get)))) || (v = expr);
            (typeof expr === "function") && (v = expr());
            that._restrictions.add(name, v);
            bindable && (that._disposes[name] = binding.databind(binding.domain(that._restrictions, name), expr));
        };
        Filter.prototype.addRange = function (items) {
            var _this = this;
            lang.forEach(items, function (val, name) {
                _this.add(name, val);
            });
        };
        Filter.prototype.remove = function (name) {
            var that = this, d = that._disposes[name];
            if (lang.isDisposable(d)) {
                d.dispose();
                delete that._disposes[name];
            }
            that._restrictions.remove(name);
        };
        Filter.prototype.clear = function () {
            this._clearDisposes();
            this._restrictions.clear();
        };
        Filter.prototype._clearDisposes = function () {
            lang.forEach(this._disposes, function (d) {
                if (lang.isDisposable(d)) {
                    d.dispose();
                }
            });
        };
        Filter.prototype.dispose = function () {
            var that = this;
            that._clearDisposes();
            that._restrictions.unbind("itemChange", null, that);
            that._restrictions.unbind("itemsChange", null, that);
            that._restrictions.dispose();
        };
        Filter.prototype.toJson = function () {
            return this._restrictions.all();
        };
        return Filter;
    }(lang.Observable));
    return Filter;
});
//# sourceMappingURL=Filter.js.map