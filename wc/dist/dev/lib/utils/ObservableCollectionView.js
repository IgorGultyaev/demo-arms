/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    var ObservableCollectionView = /** @class */ (function (_super) {
        __extends(ObservableCollectionView, _super);
        /**
         * Wrapping collection that supports filtering and ordering of the source collection.
         * @constructs ObservableCollectionView
         * @extends Observable
         * @param {Array|ObservableCollection} source
         */
        function ObservableCollectionView(source) {
            var _this = _super.call(this) || this;
            if (source) {
                _this._setSource(source);
            }
            else if (!arguments.length) {
                // если источник не передан, то создаем пустой
                _this._setSource([]);
            }
            return _this;
        }
        ObservableCollectionView.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._clearSource();
        };
        /**
         * Source collection
         * @param value
         * @return {*}
         */
        ObservableCollectionView.prototype.source = function (value) {
            var that = this;
            if (arguments.length) {
                that._clearSource();
                if (value) {
                    that._setSource(value);
                }
                that.trigger("change", that, {});
            }
            else {
                that.trigger("get", that, { prop: "source", value: that._source });
                return that._source;
            }
        };
        /**
         * Gets or sets an expression for ordering
         * @param {String|Array} [orderBy]
         * @returns {Array|undefined}
         */
        ObservableCollectionView.prototype.orderBy = function (orderBy) {
            var that = this;
            if (arguments.length) {
                that._items = undefined; // сбросим кэш
                var parsed = that.parseOrderBy(orderBy);
                that._comparer = lang.collections.createComparer(parsed);
                ObservableCollectionView._set(that, "orderBy", parsed);
                that.trigger("change", that, {});
            }
            else {
                return ObservableCollectionView._get(that, "orderBy");
            }
        };
        ObservableCollectionView.prototype.parseOrderBy = function (orderBy) {
            return lang.collections.parseOrderBy(orderBy, this._orderBy);
        };
        /**
         * @deprecated use `lang.collections.parseOrderBy` instead
         * @param orderBy
         * @param oldOrderBy
         * @return {any}
         */
        ObservableCollectionView.parseOrderBy = function (orderBy, oldOrderBy) {
            return lang.collections.parseOrderBy(orderBy, oldOrderBy);
        };
        /**
         * Gets or sets filtering function
         * @param {Function} [filter]
         * @returns {Function|undefined}
         */
        ObservableCollectionView.prototype.where = function (filter) {
            var that = this;
            if (arguments.length) {
                that._items = undefined; // сбросим кэш
                ObservableCollectionView._set(that, "where", filter);
                that.trigger("change", that, {});
            }
            else {
                return ObservableCollectionView._get(that, "where");
            }
        };
        ObservableCollectionView.prototype.all = function () {
            var that = this, ret = that._resultItems();
            ret.forEach(function (item, i) {
                that.trigger("get", that, { prop: i.toString(), value: item });
            });
            that.trigger("get", that, { prop: "all", value: ret });
            return ret;
        };
        ObservableCollectionView.prototype.get = function (i) {
            var that = this, ret = that._resultItems()[i];
            that.trigger("get", that, { prop: i.toString(), value: ret });
            return ret;
        };
        ObservableCollectionView.prototype.count = function () {
            var that = this, ret = that._resultItems().length;
            that.trigger("get", that, { prop: "count", value: ret });
            return ret;
        };
        ObservableCollectionView.prototype.indexOf = function (item) {
            return this._resultItems().indexOf(item);
        };
        ObservableCollectionView.prototype.add = function (item) {
            this._throwIfNoSource();
            this._source.add(item);
        };
        ObservableCollectionView.prototype.remove = function (item) {
            this._throwIfNoSource();
            this._source.remove(item);
        };
        ObservableCollectionView.prototype.move = function (indexFrom, indexTo) {
            var that = this;
            that._throwIfNoSource();
            if (that._comparer) {
                throw new Error("Перемещение элементов с заданным порядком невозможно");
            }
            if (that._where) {
                indexFrom = that._source.indexOf(that.get(indexFrom));
                indexTo = that._source.indexOf(that.get(indexTo));
            }
            that._source.move(indexFrom, indexTo);
        };
        ObservableCollectionView.prototype.clear = function () {
            this._items = undefined; // сбросим кэш
            if (this._source) {
                this._source.clear();
            }
        };
        ObservableCollectionView.prototype.reset = function (items) {
            this._throwIfNoSource();
            // сбросим кэш, т.к. полагаться на возникновение "change" при reset мы не можем
            // (если коллекция не изменилась, то события не будет)
            if (this._comparer || this._where) {
                this._items = undefined;
            }
            this._source.reset(items);
        };
        ObservableCollectionView.prototype.toggle = function (item) {
            this._throwIfNoSource();
            this._source.toggle(item);
        };
        ObservableCollectionView.prototype.forEach = function (iterator, context) {
            return this._resultItems().forEach(iterator, context);
        };
        ObservableCollectionView.prototype.find = function (predicate, context) {
            return lang.find(this._resultItems(), predicate, context);
        };
        ObservableCollectionView.prototype._throwIfNoSource = function () {
            if (!this._source) {
                throw new Error("Не задана коллекция-источник");
            }
        };
        /**
         * Returns filtered and sorted array of items
         */
        ObservableCollectionView.prototype._resultItems = function () {
            // TOTHINK: сделать этот метод ObservableExpression, тогда можно будет отслеживать изменения во вложенных
            // объектах (сейчас отслеживаются изменения только непосредственно в элементах коллекции)
            var that = this, items = that._items;
            if (!items) {
                if (!that._source) {
                    items = [];
                }
                else {
                    items = that._source.all();
                }
                if (that._where) {
                    items = items.filter(that._where);
                }
                if (that._comparer) {
                    items = lang.sort(items, that._comparer);
                }
                that._items = items;
            }
            return items;
        };
        ObservableCollectionView.prototype._setSource = function (source) {
            var that = this;
            if (!lang.ObservableCollection.isObservableCollection(source)) {
                // TODO: по идее в этом случае не обязательно создавать внутреннюю ObservableCollection и
                // синхронизироваться с ней. Можно было бы работать напрямую с массивом source, но это была бы
                // отдельная ветка кода.
                that._source = new lang.ObservableCollection(source);
                that._sourceOwned = true;
            }
            else {
                that._source = source; // source is already ObservableCollection
                that._sourceOwned = false;
            }
            that._source.bind("change", that._onSourceChange, that);
            that._source.bind("itemChange", that._onSourceItemChange, that);
        };
        ObservableCollectionView.prototype._clearSource = function () {
            var that = this;
            that._items = undefined; // сбросим кэш
            if (that._source) {
                that._source.unbind("change", null, that);
                that._source.unbind("itemChange", null, that);
                if (that._sourceOwned && that._source.dispose) {
                    that._source.dispose();
                }
                that._sourceOwned = undefined;
                that._source = undefined;
            }
        };
        /**
         * Проверяет, что элемент находится на своем месте в упорядоченном массиве
         * @param item
         * @return {Boolean}
         */
        ObservableCollectionView.prototype._isItemOrderCorrect = function (item) {
            var items = this._items, comparer = this._comparer, i = items.indexOf(item);
            // NOTE: indexOf - затратная операция (O(n)), хорошо бы сюда передавать уже известный индекс элемента.
            // Для этого нужно ввести индексы измененных элементов в аргументах события itemChange у ObservableCollection.
            return i < 0 ||
                (i === 0 || comparer(items[i - 1], item) <= 0) &&
                    (i === items.length - 1 || comparer(items[i + 1], item) >= 0);
        };
        /**
         * Проверяет, что элемент не изменил своего членства в коллекции
         * @param item
         * @returns {boolean}
         */
        ObservableCollectionView.prototype._isItemMembershipCorrect = function (item) {
            var oldMembership = this._items.indexOf(item) >= 0, newMembership = !!this._where(item);
            return oldMembership === newMembership;
        };
        ObservableCollectionView.prototype._onSourceChange = function (sender, args) {
            var that = this;
            that._items = undefined; // сбросим кэш
            // filter added and removed arrays
            if (that._where && args) {
                args = lang.clone(args);
                if (args.added) {
                    args.added = args.added.filter(that._where);
                }
                if (args.removed) {
                    args.removed = args.removed.filter(that._where);
                }
            }
            // re-trigger event
            that.trigger("change", that, args);
        };
        ObservableCollectionView.prototype._onSourceItemChange = function (sender, args) {
            var that = this;
            if (that._items && args && args.changed) {
                // проверим, что:
                // - каждый измененный элемент не изменил своего членства в коллекции
                //   (т.е. если элемент был в коллекции, то он в ней и остался; если элемент не принадлежал коллекции,
                //   то он в нее не добавился)
                // - каждый измененный элемент остается на своем месте в упорядоченной коллекции
                var changed = (that._where && !args.changed.every(that._isItemMembershipCorrect, that)) ||
                    (that._comparer && !args.changed.every(that._isItemOrderCorrect, that));
                if (changed) {
                    that._items = undefined; // сбросим кэш
                    that.trigger("change", that, {});
                    return;
                }
            }
            // just re-trigger event
            that.trigger("itemChange", that, args);
        };
        return ObservableCollectionView;
    }(lang.Observable));
    return ObservableCollectionView;
});
//# sourceMappingURL=ObservableCollectionView.js.map