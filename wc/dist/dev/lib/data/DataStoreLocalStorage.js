/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/data/DataStoreBase"], function (require, exports, core, DataStoreBase) {
    "use strict";
    var lang = core.lang;
    var DataStoreLocalStorage = /** @class */ (function (_super) {
        __extends(DataStoreLocalStorage, _super);
        /**
         * @constructs DataStoreLocalStorage
         * @extends DataStoreBase
         * @param name
         * @param version
         * @param domainModelMeta
         * @param options
         */
        function DataStoreLocalStorage(name, version, domainModelMeta, options) {
            var _this = _super.call(this, name, version, domainModelMeta, options) || this;
            var that = _this;
            that._prefix = "store/" + name + "/";
            that._objPrefix = that._prefix + "obj/";
            that._queryPrefix = that._prefix + "query/";
            if (that.options.recreate) {
                that.recreate();
            }
            else {
                that._init();
            }
            return _this;
        }
        DataStoreLocalStorage.prototype.test = function () {
            return lang.resolved();
        };
        DataStoreLocalStorage.prototype.recreate = function () {
            var that = this;
            return lang.async.attempt(function () {
                var keys = [];
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._prefix)) {
                        keys.push(key);
                    }
                });
                keys.forEach(function (key) {
                    that.storage.removeItem(key);
                });
                return that._init();
            });
        };
        DataStoreLocalStorage.prototype._init = function () {
            var that = this, sysVersionKey = that._prefix + "__x_sys_version", versionKey = that._prefix + "__x_version", oldSysVersion, oldVersion, deferred;
            that._initializing = true;
            oldSysVersion = parseInt(that.storage.getItem(sysVersionKey), 10) || 0;
            oldVersion = parseInt(that.storage.getItem(versionKey), 10) || 0;
            deferred = lang.resolved();
            if (oldSysVersion < that.systemVersion) {
                deferred = deferred.then(function () {
                    return that._onsysupgrade(oldSysVersion, that.systemVersion);
                }).then(function () {
                    that.storage.setItem(sysVersionKey, that.systemVersion.toString());
                });
            }
            if (oldVersion < that.version) {
                deferred = deferred.then(function () {
                    return that._onappupgrade(oldVersion, that.version);
                }).then(function () {
                    that.storage.setItem(versionKey, that.version.toString());
                });
            }
            return deferred.always(function () {
                that._initializing = false;
            }).done(function () {
                that._initialized = true;
            });
        };
        DataStoreLocalStorage.prototype._onsysupgrade = function (oldSystemVersion, newSystemVersion) {
        };
        DataStoreLocalStorage.prototype._onappupgrade = function (oldVersion, newVersion) {
            var that = this, deferred;
            // custom code
            deferred = that.onversionchange(oldVersion, newVersion);
            // delete objects missed in the domain model
            return lang.when(deferred).done(function () {
                var keysToRemove = [];
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix)) {
                        var type = obj.__metadata.type;
                        if (!that.storedTypes[type]) {
                            keysToRemove.push(key);
                        }
                    }
                });
                keysToRemove.forEach(function (key) {
                    that.storage.removeItem(key);
                });
            });
        };
        DataStoreLocalStorage.prototype._throwIfNotInited = function () {
            if (!this._initialized && !this._initializing) {
                throw new Error("DataStoreLocalStorage wasn't properly initialized");
            }
        };
        DataStoreLocalStorage.prototype._throwIfTypeInvalid = function (type) {
            var that = this;
            if (!that._initializing) {
                _super.prototype._throwIfTypeInvalid.call(this, type);
                return;
            }
            if (!type) {
                throw new ReferenceError("Type is not specified");
            }
        };
        /**
         * Load an object
         * @param type
         * @param id
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreLocalStorage.prototype.load = function (type, id, options) {
            var that = this;
            return lang.async.attempt(function () {
                var obj;
                that._throwIfNotInited();
                that._throwIfTypeInvalid(type);
                obj = that._getObj(type, id);
                return that._toUser(obj, options);
            });
        };
        /**
         * Load several objects
         * @param identities
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreLocalStorage.prototype.loadMany = function (identities, options) {
            var that = this;
            return lang.async.attempt(function () {
                that._throwIfNotInited();
                identities.forEach(function (identity) {
                    that._throwIfTypeInvalid(identity.type);
                });
                return that._getMany(identities).map(function (obj) {
                    return that._toUser(obj, options);
                });
            });
        };
        /**
         * Load all objects of specified type
         * @param {Object|String} filter String value will be interpreted as a type
         * @param {String} filter.type Type of objects to load
         * @param {Boolean} [filter.hasChanges] Load objects with changes. Calling with hasChanges = false returns object without any changes.
         * @param {Boolean} [filter.isRemoved] Load removed objects. Calling with isRemoved = false returns object which are not removed.
         * @param [options]
         * @param {Boolean} [options.raw] Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreLocalStorage.prototype.select = function (filter, options) {
            var that = this;
            return lang.async.attempt(function () {
                var objects = [], objFilter = lang.isString(filter) ? { type: filter } : filter;
                that._throwIfNotInited();
                that._throwIfTypeInvalid(objFilter.type);
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix + objFilter.type + "/")) {
                        if (obj.__metadata.type !== objFilter.type) {
                            console.warn("DataStoreLocalStorage: " + key + ": the type in key isn't equal the type in value (" + obj.__metadata.type + ")");
                            return;
                        }
                        if (!that._matchFilter(obj, objFilter)) {
                            return;
                        }
                        obj = that._fromDB(obj);
                        obj = that._toUser(obj, options);
                        objects.push(obj);
                    }
                });
                return objects;
            });
        };
        /**
         * Load all objects from the store. Use for debug only!
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreLocalStorage.prototype.all = function (options) {
            var that = this;
            return lang.async.attempt(function () {
                var objects = [];
                that._throwIfNotInited();
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix)) {
                        obj = that._fromDB(obj);
                        obj = that._toUser(obj, options);
                        objects.push(obj);
                    }
                });
                return objects;
            });
        };
        DataStoreLocalStorage.prototype.getChanges = function () {
            var that = this;
            return lang.async.attempt(function () {
                var objects = [];
                that._throwIfNotInited();
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix) && obj.__hasChanges) {
                        obj = that._fromDB(obj);
                        obj = that._getObjChanges(obj);
                        objects.push(obj);
                    }
                });
                return objects;
            });
        };
        DataStoreLocalStorage.prototype.hasChanges = function () {
            var that = this;
            return lang.async.attempt(function () {
                that._throwIfNotInited();
                return that.storage.some(function (obj, key) {
                    return lang.stringStartsWith(key, that._objPrefix) && obj.__hasChanges;
                });
            });
        };
        /**
         * Remove objects of specific 'type' which don't have unsaved changes
         * @param {String} type
         * @returns {*}
         */
        DataStoreLocalStorage.prototype.clear = function (type) {
            var that = this;
            return lang.async.attempt(function () {
                that._throwIfNotInited();
                that._throwIfTypeInvalid(type);
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix + type + "/")) {
                        obj = that._fromDB(obj);
                        if (obj && !obj.__hasChanges) {
                            that.storage.removeItem(key);
                        }
                    }
                });
            });
        };
        /**
         * Remove objects from DataStore
         * @param options
         * @param {Boolean} options.includePending Remove or not objects with unsaved changes
         * @returns {*}
         */
        DataStoreLocalStorage.prototype.clearAll = function (options) {
            var that = this;
            return lang.async.attempt(function () {
                that._throwIfNotInited();
                options = options || {};
                that.storage.forEach(function (obj, key) {
                    if (lang.stringStartsWith(key, that._objPrefix)) {
                        if (options.includePending) {
                            that.storage.removeItem(key);
                        }
                        else {
                            obj = that._fromDB(obj);
                            if (obj && !obj.__hasChanges) {
                                that.storage.removeItem(key);
                            }
                        }
                    }
                });
            });
        };
        DataStoreLocalStorage.prototype.cacheQuery = function (query, response) {
            var that = this;
            return lang.async.attempt(function () {
                if (!query || !query.source) {
                    throw new Error("DataStore.cacheQuery: query.source should be specified");
                }
                if (!response) {
                    throw new Error("DataStore.cacheQuery: response should be specified");
                }
                var source = that._getQuerySource(query);
                if (source.propName) {
                    return that._cacheQueryProp(source, response); // can throw
                }
                if (source.id) {
                    return;
                }
                that._throwIfNotInited();
                var identities = that._identity(response.result), // can throw
                data = {
                    __timestamp: Date.now(),
                    result: identities,
                    hints: response.hints
                }, key = that._getQueryKey(source, query.params), type = that._getQueryType(query, data);
                if (type) {
                    data.__type = type;
                }
                that.storage.setObject(key, data);
            });
        };
        DataStoreLocalStorage.prototype.query = function (query) {
            var that = this;
            return lang.async.attempt(function () {
                var source = that._getQuerySource(query), response;
                if (!source) {
                    throw new Error("DataStore.query: query.source should be specified");
                }
                that._throwIfNotInited();
                if (source.propName) {
                    response = that._queryProp(source.type, source.id, source.propName);
                }
                else if (source.id) {
                    response = that._queryObject(source.type, source.id);
                }
                else {
                    response = that._queryObjects(source, query.params);
                }
                return response;
            });
        };
        DataStoreLocalStorage.prototype._queryObject = function (type, id) {
            var that = this, obj;
            that._throwIfTypeInvalid(type);
            obj = that._getObj(type, id);
            return that._queryResponse(obj);
        };
        DataStoreLocalStorage.prototype._queryObjects = function (source, params) {
            var that = this, key = that._getQueryKey(source, params), data = that.storage.getObject(key), result, response;
            if (!data || !data.result) {
                return that._queryResponse();
            }
            result = lang.isArray(data.result) ?
                that._getMany(data.result) :
                that._getObj(data.result.type, data.result.id);
            response = that._queryResponse(result, data.__timestamp);
            response.hints = data.hints;
            return response;
        };
        DataStoreLocalStorage.prototype._queryProp = function (type, id, prop) {
            var that = this, propMeta = that.meta.entities[type].props[prop], obj = that._getObj(type, id), v, isObject, identities, objects, result;
            if (!obj || !propMeta || (v = obj[prop]) === undefined) {
                result = undefined;
            }
            else if (propMeta.vt !== "object") {
                result = v;
            }
            else if (v === null) {
                result = propMeta.many ? [] : null;
            }
            else if (!propMeta.many) {
                isObject = true;
                result = that._getObj(propMeta.ref.name, v);
            }
            else {
                isObject = true;
                identities = lang.select(v, function (id) {
                    return { type: propMeta.ref.name, id: id };
                });
                objects = that._getMany(identities);
                result = objects.length === identities.length ? objects : undefined;
            }
            return isObject ?
                that._queryResponse(result, obj && obj.__timestamp) :
                that._queryValueResponse(result, obj && obj.__timestamp);
        };
        DataStoreLocalStorage.prototype._getQueryKey = function (source, params) {
            return this._queryPrefix + JSON.stringify(source) + "/" + JSON.stringify(this._getParamsForCache(params) || "");
        };
        DataStoreLocalStorage.prototype._update = function (objects, iterator) {
            var that = this, objectsByType = that._groupByType(objects); // can throw
            that._iterate(objectsByType, iterator);
        };
        DataStoreLocalStorage.prototype._iterate = function (objectsByType, iterator) {
            var that = this;
            that._throwIfNotInited();
            lang.forEach(objectsByType, function (objectsOfType, type) {
                var store = that._store(type);
                lang.forEach(objectsOfType, function (obj) {
                    var existent = that._getObj(type, obj.id);
                    iterator.call(that, store, obj, existent);
                });
            });
        };
        DataStoreLocalStorage.prototype._commit = function (changes, iterator) {
            var that = this, objectsByType = that._groupByType(changes), // can throw
            types = that._getAncestors(Object.keys(objectsByType));
            that._iterate(objectsByType, iterator);
            that.storage.forEach(function (query, key) {
                if (lang.stringStartsWith(key, that._queryPrefix) &&
                    query.__type && types.indexOf(query.__type) >= 0) {
                    // NOTE: don't set to 0, because this is falsy value and will be ignored
                    query.__timestamp = -1; // outdated
                    that.storage.setObject(key, query);
                }
            });
        };
        DataStoreLocalStorage.prototype._store = function (type) {
            var that = this;
            return {
                "put": function (v) {
                    that._put(v);
                },
                "delete": function (id) {
                    that._delete(type, id);
                }
            };
        };
        DataStoreLocalStorage.prototype._getObj = function (type, id) {
            var that = this, obj;
            that._throwIfNotInited();
            that._throwIfTypeInvalid(type);
            obj = that.storage.getObject(that._objPrefix + type + "/" + id);
            return that._fromDB(obj);
        };
        DataStoreLocalStorage.prototype._getMany = function (identities) {
            var that = this, objects = [];
            that._throwIfNotInited();
            identities.forEach(function (identity) {
                that._throwIfTypeInvalid(identity.type);
                var obj = that._getObj(identity.type, identity.id);
                if (obj && !obj.__metadata.isRemoved) {
                    objects.push(obj);
                }
            });
            return objects;
        };
        DataStoreLocalStorage.prototype._put = function (object) {
            var that = this;
            that._throwIfNotInited();
            that._throwIfNotValid(object);
            that.storage.setObject(that._objPrefix + object.__metadata.type + "/" + object.id, object);
        };
        DataStoreLocalStorage.prototype._delete = function (type, id) {
            var that = this;
            that._throwIfNotInited();
            that._throwIfTypeInvalid(type);
            that.storage.removeItem(that._objPrefix + type + "/" + id);
        };
        DataStoreLocalStorage.prototype._toDB = function (obj, options) {
            obj = _super.prototype._toDB.call(this, obj, options);
            if (!obj) {
                return obj;
            }
            // NOTE: undefined values aren't serialized to JSON, so serialize their names explictly
            var originalUndefined = [];
            if (obj.__original) {
                lang.forEach(obj.__original, function (v, name) {
                    if (v === undefined) {
                        originalUndefined.push(name);
                    }
                });
            }
            if (originalUndefined.length) {
                obj.__originalUndefined = originalUndefined;
            }
            return obj;
        };
        DataStoreLocalStorage.prototype._fromDB = function (obj) {
            obj = _super.prototype._fromDB.call(this, obj);
            if (!obj) {
                return obj;
            }
            // NOTE: set explictly serialized undefined values
            if (obj.__originalUndefined) {
                obj.__original = obj.__original || {};
                lang.forEach(obj.__originalUndefined, function (name) {
                    obj.__original[name] = undefined;
                });
                delete obj.__originalUndefined;
            }
            return obj;
        };
        return DataStoreLocalStorage;
    }(DataStoreBase));
    DataStoreLocalStorage.mixin({
        isSupported: core.platform.modernizr.localstorage,
        systemVersion: 2,
        storage: core.localStorage
    });
    return DataStoreLocalStorage;
});
//# sourceMappingURL=DataStoreLocalStorage.js.map