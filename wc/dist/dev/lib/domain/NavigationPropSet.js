/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "underscore", "./support", "./NavigationPropBase"], function (require, exports, core, _, support, NavigationPropBase) {
    "use strict";
    var Application = core.Application;
    var lang = core.lang;
    var NavigationPropSet = /** @class */ (function (_super) {
        __extends(NavigationPropSet, _super);
        /**
         * Descriptor of a loaded collection navigation property of DomainObject.
         *
         * Множество доменных объектов, являющееся значением загруженного массивного навигируемого свойства
         * @constructs NavigationPropSet
         * @extends NavigationPropBase
         * @param {DomainObject} parent
         * @param propMeta
         */
        function NavigationPropSet(parent, propMeta) {
            var _this = _super.call(this, parent, propMeta) || this;
            var that = _this;
            that.all().forEach(function (obj) {
                that._initObj(obj);
            });
            that._parent.bind("change:" + that._propMeta.name, that._onPropChange, that);
            that._updateIsLoaded();
            return _this;
        }
        NavigationPropSet.prototype.dispose = function () {
            var that = this;
            that.all().forEach(function (obj) {
                that._cleanupObj(obj);
            });
            that._parent.unbind("change:" + that._propMeta.name, null, that);
            _super.prototype.dispose.call(this);
        };
        /**
         * @param {Object} [options]
         * @param {Boolean} [options.idsOnly] do not load all value objects (by default they are loaded)
         * @param {Boolean} [options.reload] force loading even if all data is already loaded
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise} NavigationPropSet
         */
        NavigationPropSet.prototype.load = function (options) {
            var that = this, deferred = that._deferredLoad;
            // NOTE: Previous loading is already in progress - we can return it if no options are specified.
            // But if there are some options, we should load again with these options.
            if (deferred && lang.isEmpty(options)) {
                return deferred;
            }
            support.throwIfDetached(that._parent);
            // NOTE: wait until the previous loading is completed,
            // maybe after it we will not have to call DataFacade at all.
            return lang.async.then(deferred, function () { return that._doLoad(options); });
        };
        NavigationPropSet.prototype._doLoad = function (options) {
            if (options === void 0) { options = {}; }
            var that = this, deferred;
            if (options.reload) {
                deferred = that._reload(options);
            }
            else if (options.idsOnly) {
                deferred = lang.resolved();
            }
            else {
                deferred = that._load(options);
            }
            return that._deferredLoad = deferred
                .then(function () { return that; })
                .always(function () { that._deferredLoad = undefined; });
        };
        /**
         * Загрузка (load) для случая не idsOnly и не reload
         * @param {NavigationPropSet.LoadOptions} options
         * @return {Promise<any>}
         * @private
         */
        NavigationPropSet.prototype._load = function (options) {
            var that = this, notLoadedItems = that.all().filter(function (obj) { return !obj.isLoaded; });
            var loadManySupported = Application.current.config.apiVersion >= 2;
            if (!notLoadedItems.length) {
                // all items are already loaded, but
                // if options contains preloads then we have to check that all properties are loaded inside value objects
                // See WC-1648
                if (options.preloads) {
                    var preloads_1 = typeof options.preloads === "string" ? options.preloads.split(/\s*,\s*/) : options.preloads;
                    var loadedCount_1 = 0;
                    var requests_1 = [];
                    var preloads2load_1 = {};
                    var loadMany_1 = { preloads2load: {}, requests: [], type: null };
                    // поищием у скольких объектов в текущем свойстве не загружены свойства preloads.
                    // preloads - это массив цепочек, в каждой цепочке нас будет интересовать только первое свойство.
                    that.forEach(function (obj, idx) {
                        //let item = { type: obj.meta.name, id: obj.id/*, preloads: []*/};
                        var notLoadedPathes = _.flatten(preloads_1.map(function (path) {
                            var propMeta = obj.getPropFromPath(path);
                            if (propMeta != null) {
                                var valObj = obj.get(propMeta.name);
                                if (lang.support.isNotLoaded(valObj)) {
                                    var raw = obj._propValues[propMeta.name];
                                    if (raw !== undefined /*!obj.isPropLoaded(propMeta.name)*/) {
                                        if (propMeta.many) {
                                            // массивное свойство с известными id, но незагруженными объектами
                                            return raw.map(function (id) {
                                                return {
                                                    path: path,
                                                    pathNext: path.slice(propMeta.name.length + 1),
                                                    object: { type: propMeta.ref.name, id: id },
                                                    type: propMeta.ref.name
                                                };
                                            });
                                        }
                                        else {
                                            // если это скалярное свойство с известным значением, но незагруженным объектом,
                                            // мы можем грузить сразу объект значение (с остатком цепочки, если есть)
                                            return {
                                                path: path,
                                                pathNext: path.slice(propMeta.name.length + 1),
                                                object: { type: propMeta.ref.name, id: valObj.id },
                                                type: propMeta.ref.name
                                            };
                                        }
                                    }
                                    return {
                                        path: path,
                                        object: null // значит грузить владельца свойства
                                    };
                                }
                            }
                        }), true)
                            .filter(function (path) { return !!path; });
                        if (notLoadedPathes.length) {
                            requests_1.push({ type: obj.meta.name, id: obj.id });
                            notLoadedPathes.forEach(function (i) { preloads2load_1[i.path] = null; });
                            if (lang.every(notLoadedPathes, function (i) { return i.object !== null; }) && loadManySupported && loadMany_1) {
                                // есть вероятность, то можно сразу загрузить объекты-значения (если они все одного типа)
                                var type_1 = loadMany_1.type;
                                if (!type_1) {
                                    loadMany_1.type = type_1 = notLoadedPathes[0].type;
                                }
                                var typeChanged_1 = false;
                                notLoadedPathes.forEach(function (i) {
                                    if (i.pathNext) {
                                        loadMany_1.preloads2load[i.pathNext] = null;
                                    }
                                    loadMany_1.requests.push(i.object);
                                    if (i.type !== type_1) {
                                        typeChanged_1 = true;
                                    }
                                });
                                if (typeChanged_1) {
                                    // ничего не выйдет
                                    loadMany_1 = null;
                                }
                            }
                            else {
                                // ничего не выйдет
                                loadMany_1 = null;
                            }
                        }
                        if (obj.isLoaded)
                            loadedCount_1++;
                    });
                    if (requests_1.length > 0) {
                        // кол-во объектов с незагруженным свойством меньше половины количества loaded объектов в свойстве,
                        // если у нас версия API не меньше 2, то загрузим объекты отдельно
                        // TODO: если загрузка происходит в рамках UnitOfWork.ensureLoaded, то надо передать соседние ветки прелоадов
                        if (loadMany_1 && loadMany_1.requests.length) {
                            var query = {
                                source: loadMany_1.requests,
                                preloads: Object.keys(loadMany_1.preloads2load),
                                type: loadMany_1.type
                            };
                            return that._parent.uow.loadQuery(query).then(function () { return that; });
                        }
                        else if ((requests_1.length <= loadedCount_1 / 2) && loadManySupported) {
                            var query = {
                                source: requests_1,
                                preloads: Object.keys(preloads2load_1),
                                type: that._propMeta.ref.name
                            };
                            return that._parent.uow.loadQuery(query).then(function () { return that; });
                        }
                        else {
                            // иначе перезагрузим свойство
                            return that._parent.uow.loadProp(that._parent.meta.name, that._parent.id, that._propMeta.name, { reload: true, preloads: options.preloads });
                        }
                    }
                }
                return lang.resolved(that);
            }
            if (that._parent.isNew()) {
                return that._loadMultiple(notLoadedItems, options);
            }
            if (notLoadedItems.length > 1) {
                // two or more items aren't loaded - load the whole property
                return that._loadProp(options);
            }
            // only one item isn't loaded - load it (we can reduce a traffic so)
            return notLoadedItems[0].load(options)
                .then(null, function () {
                // fallback: load the whole property
                return that._loadProp(options);
            });
        };
        NavigationPropSet.prototype._reload = function (options) {
            var that = this;
            return that._parent.isNew() ?
                that._loadMultiple(that.all(), options) :
                that._loadProp(options);
        };
        NavigationPropSet.prototype._loadMultiple = function (items, options) {
            var that = this, dataFacade = that._parent.uow._dataFacade;
            try {
                // NOTE: load several times in a batch
                if (dataFacade.beginBatch)
                    dataFacade.beginBatch();
                var itemsDeferred = items.map(function (obj) {
                    return obj.load(options);
                });
                return lang.when.apply(null, itemsDeferred);
            }
            finally {
                if (dataFacade.completeBatch)
                    dataFacade.completeBatch();
            }
        };
        NavigationPropSet.prototype._loadProp = function (options) {
            var that = this;
            return that._parent.uow.ensurePropLoaded(that._parent, that._propMeta.name, options);
        };
        /**
         * @deprecated Use `load` method instead
         */
        NavigationPropSet.prototype.loadItems = function (options) {
            return this.load(options);
        };
        NavigationPropSet.prototype.ids = function () {
            var ret = this._getIds();
            this._triggerGet({ prop: "ids", value: ret });
            return ret;
        };
        NavigationPropSet.prototype.count = function () {
            var ret = this._getIds().length;
            this._triggerGet({ prop: "count", value: ret });
            return ret;
        };
        NavigationPropSet.prototype.all = function () {
            var that = this, ret = that._getIds().map(that._getValueObject, that);
            ret.forEach(function (obj, i) {
                that._triggerGet({ prop: i.toString(), value: obj });
            });
            that._triggerGet({ prop: "all", value: ret });
            return ret;
        };
        NavigationPropSet.prototype.get = function (index) {
            var that = this, id = that._getIds()[index], ret = id ? that._getValueObject(id) : undefined;
            that._triggerGet({ prop: index.toString(), value: ret });
            return ret;
        };
        /**
        *
        * @param {String|Object} [type] наименование типа, если задан второй параметр - идентификатор, либо идентификатор объекта (тогда в качесте типа используется тип свойства)
        * @param {string} [type.type] наименование типа
        * @param {string} [type.id] идентификатор объекта
        * @param {string} [id] идентификатор объекта, если первый параметр типа string (имя типа)
        */
        NavigationPropSet.prototype.first = function (type, id) {
            var that = this, identity, ids, ret;
            if (arguments.length > 0) {
                if (arguments.length === 2) {
                    identity = { type: type, id: id };
                }
                else if (arguments.length === 1) {
                    identity = (typeof type === "string") ?
                        { type: that._propMeta.ref, id: type } : // single string parameter - objectId
                        type; // single non-string parameter - identity json, TODO: check fields
                }
                else {
                    throw new Error("first: Unexpected parameter count - " + arguments.length);
                }
                ret = that._parent.uow.get(identity.type, identity.id);
            }
            else {
                ids = that._getIds();
                ret = ids.length ? that._getValueObject(ids[0]) : null;
            }
            that._triggerGet({ prop: "first", value: ret });
            return ret;
        };
        NavigationPropSet.prototype.indexOf = function (obj) {
            var id = support.objectIdOf(obj);
            return this._getIds().indexOf(id);
        };
        NavigationPropSet.prototype.contains = function (obj) {
            return this.indexOf(obj) >= 0;
        };
        NavigationPropSet.prototype.add = function (item) {
            var _this = this;
            this._iterate(item, function (id) { return support.addToNavProp(_this._parent, _this._propMeta, id); });
        };
        NavigationPropSet.prototype.remove = function (item) {
            var _this = this;
            this._iterate(item, function (id) { return support.removeFromNavProp(_this._parent, _this._propMeta, id); });
        };
        NavigationPropSet.prototype.reset = function (items) {
            this.clear();
            this.add(items);
        };
        NavigationPropSet.prototype.clear = function () {
            var ids = this._getIds().slice();
            this.remove(ids);
        };
        NavigationPropSet.prototype.move = function (indexFrom, indexTo) {
            var that = this, ids = that._getIds().slice(), movedId = ids[indexFrom];
            ids.splice(indexFrom, 1);
            ids.splice(indexTo, 0, movedId);
            support.setPropRaw(that._parent, that._propMeta, ids);
        };
        /**
         * Iterating through all objects in the property.
         * Please note, that despite of signature of iterator it WON'T get `array` argument (array of objects).
         * @param iterator
         * @param [context]
         */
        NavigationPropSet.prototype.forEach = function (iterator, context) {
            var that = this, ids = that._getIds();
            ids.forEach(function (id, index) {
                var obj = that._getValueObject(id);
                iterator.call(context, obj, index);
            });
        };
        NavigationPropSet.prototype.find = function (predicate, context) {
            var that = this, ids = that._getIds();
            for (var i = 0, l = ids.length; i < l; i++) {
                var id = ids[i], obj = that._getValueObject(id);
                if (predicate.call(context, obj, i)) {
                    return obj;
                }
            }
            return undefined;
        };
        NavigationPropSet.prototype.toString = function () {
            return this.all()
                .map(function (obj) { return obj.toString(); })
                .join("; ");
        };
        NavigationPropSet.prototype._onPropChange = function (sender, value, oldValue) {
            var that = this, args = {};
            if (arguments.length >= 3) {
                args.added = _.difference(value || [], oldValue || []).map(that._getValueObject, that);
                args.removed = _.difference(oldValue || [], value || []).map(that._getValueObject, that);
                //args.changed = [];
            }
            that._triggerChange(args);
        };
        NavigationPropSet.prototype._onObjChange = function (sender, args) {
            var that = this;
            // TODO: обработка незагруженных объектов
            if (!args || !args.prop || !that._propMeta.opposite || that._propMeta.opposite.name !== args.prop) {
                if (that.isLoaded != sender.isLoaded) {
                    that._updateIsLoaded();
                }
                that.trigger("itemChange", that, { changed: [sender] });
            }
        };
        NavigationPropSet.prototype._onObjLoad = function (sender, args) {
            var that = this;
            if (!args || !args.loaded) {
                that._triggerChange({});
            }
            else if (args.loaded !== sender) {
                that._triggerChange({ added: [args.loaded], removed: [sender] });
            }
        };
        NavigationPropSet.prototype._iterate = function (items, iterator, context) {
            return lang.isArray(items) ? items.forEach(iterator, context) : iterator.call(context, items);
        };
        NavigationPropSet.prototype._getValueObject = function (id) {
            support.throwIfDetached(this._parent);
            return this._parent.uow.get(this._propMeta.ref, id);
        };
        NavigationPropSet.prototype._getIds = function () {
            return support.getPropRaw(this._parent, this._propMeta) || [];
        };
        NavigationPropSet.prototype._updateIsLoaded = function () {
            var that = this, items = that._getIds().map(that._getValueObject, that);
            that.isLoaded = items.every(function (obj) {
                return obj.isLoaded;
            });
        };
        NavigationPropSet.prototype._initObj = function (obj) {
            var that = this;
            obj.bind("change", that._onObjChange, that);
            if (obj.isGhost && !obj.isLoaded) {
                obj.bind("load", that._onObjLoad, that);
            }
        };
        NavigationPropSet.prototype._cleanupObj = function (obj) {
            var that = this;
            obj.unbind("change", null, that);
            obj.unbind("load", null, that);
        };
        NavigationPropSet.prototype._triggerGet = function (args) {
            this.trigger("get", this, args);
        };
        NavigationPropSet.prototype._triggerChange = function (args) {
            var that = this;
            if (args.added && args.added.length) {
                args.added.forEach(that._initObj, that);
            }
            if (args.removed && args.removed.length) {
                args.removed.forEach(that._cleanupObj, that);
            }
            that._updateIsLoaded();
            that.trigger("change", that, args);
        };
        __decorate([
            lang.decorators.constant(false)
        ], NavigationPropSet.prototype, "isGhost");
        return NavigationPropSet;
    }(NavigationPropBase));
    return NavigationPropSet;
});
//# sourceMappingURL=NavigationPropSet.js.map