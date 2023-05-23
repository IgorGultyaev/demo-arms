/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/domain/support"], function (require, exports, lang, support) {
    "use strict";
    // max age - 1000 years
    var MAX_AGE = 1000 * 365 * 24 * 60 * 60 * 1000;
    var DataStoreBase = /** @class */ (function (_super) {
        __extends(DataStoreBase, _super);
        /**
         * @constructs DataStoreBase
         * @extends Observable
         * @description Base implementation of local data cache
         * On errors all async methods must return the rejected deferred (instead of throwing an exception).
         * @param {String} name
         * @param {Number} version
         * @param {Object} domainModelMeta
         * @param {Object} [options]
         */
        function DataStoreBase(name, version, domainModelMeta, options) {
            var _this = _super.call(this) || this;
            if (!name)
                throw new Error("DataStore.ctor: database name should be specified");
            if (!version)
                throw new Error("DataStore.ctor: database version should be specified");
            if (!domainModelMeta)
                throw new Error("DataStore.ctor: domain metadata should be specified");
            _this.name = name;
            _this.version = version;
            _this.meta = domainModelMeta;
            _this.options = options || {};
            _this.storedTypes = {};
            lang.forEach(_this.meta.entities, function (entity, name) {
                // only persistent entities
                if (entity && !entity.temp) {
                    _this.storedTypes[name] = true;
                }
            });
            return _this;
        }
        DataStoreBase.prototype.onversionchange = function (oldVersion, newVersion) {
            var that = this;
            if (lang.isFunction(that.options.onversionchange)) {
                return that.options.onversionchange.call(that, that, oldVersion, newVersion);
            }
        };
        /**
         * @method
         * @params {Array} objects Objects to save (create or update local objects with client-side changes)
         * @returns {Promise}
         */
        DataStoreBase.prototype.save = function (objects, options) {
            var _this = this;
            var tag;
            if (options && options.tx) {
                tag = options.tx + "." + Date.now();
            }
            //let scheduledTagUpgrades = [];
            return this._update(objects, function (store, obj, existent) {
                if (!existent) {
                    existent = {
                        __metadata: { type: obj.__metadata.type },
                        id: obj.id
                    };
                }
                if (obj.__metadata.isNew) {
                    existent.__metadata.isNew = true;
                }
                if (obj.__metadata.isRemoved) {
                    existent.__metadata.isRemoved = true;
                }
                existent.__original = existent.__original || {};
                if (tag) {
                    // TODO: if (existent.__tx) scheduledTagUpgrades.push(existent.__tx);
                    // 	См. https://track.rnd.croc.ru/issue/WC-1542
                    // Как вариант можно объединяться все объекты всех последующих транзакций в текущую
                    existent.__tx = tag;
                }
                lang.forEach(obj, function (v, name) {
                    if (_this._isSpecialPropName(name)) {
                        return;
                    }
                    var old = existent[name];
                    if (lang.isEqual(v, old)) {
                        return;
                    }
                    if (!obj.__metadata.isNew) {
                        if (!existent.__original.hasOwnProperty(name)) {
                            existent.__original[name] = old;
                        }
                        else if (lang.isEqual(v, existent.__original[name])) {
                            delete existent.__original[name];
                        }
                    }
                    existent[name] = v;
                });
                if (!obj.__metadata.isNew) {
                    lang.append(existent.__original, obj.__original);
                }
                if (obj.__metadata.ts && obj.__metadata.ts !== existent.__metadata.ts) {
                    if (existent.__metadata.ts) {
                        lang.extendEx(existent.__original, { __metadata: { ts: existent.__metadata.ts } }, { deep: true });
                    }
                    existent.__metadata.ts = obj.__metadata.ts;
                }
                store.put(_this._toDB(existent, { updateTs: true }));
            });
            /*.then(() => {
                if (!scheduledTagUpgrades.length) {
                    return;
                }
                return this._upgradeObjectsTags(scheduledTagUpgrades, options.tx);
            });*/
        };
        //protected abstract _upgradeObjectsTags(tagsOld: string[], tagNew: string): Promise<void>;
        /**
         * Commit specified changes which makes objects in Store trustworthy.
         * Usually it is called after that objects were saved on the server.
         * @method
         * @param {Array} changes
         * @returns {Promise}
         */
        DataStoreBase.prototype.commit = function (changes) {
            var that = this;
            // Set values of navigation props with changed IDs to __newValues
            //
            // NOTE: Id may change for new objects only and all references to new objects must be in the same datagram.
            // Therefore we should update references in the committing objects (datagram) only, no need to update other objects in DataStore.
            // NOTE: This can be done in DataFacade._updateSaved, but DataFacade doesn't have access to domain metadata.
            that._updateRefIds(lang.array(changes));
            return that._commit(changes, function (store, obj, existent) {
                if (!existent) {
                    return;
                }
                if (obj.__metadata.isRemoved) {
                    store["delete"](obj.id);
                    return;
                }
                if (obj.__newValues && obj.__newValues.id) {
                    store["delete"](obj.id);
                }
                existent = that._commitObj(obj, existent);
                delete existent.__tx;
                if (obj.__metadata.ts > (existent.__metadata.ts || 0)) {
                    existent.__metadata.ts = obj.__metadata.ts;
                }
                else if (obj.__metadata.ts === undefined &&
                    existent.__metadata.ts != undefined &&
                    obj.__newValues["__incrementTs"]) {
                    // an additional object which was updated on the server
                    existent.__metadata.ts = existent.__metadata.ts + 1;
                }
                store.put(that._toDB(existent, { updateTs: true }));
            });
        };
        /**
         * Remove specified changes and restore previous data (if it exists).
         * @method
         * @param {Array} changes
         * @returns {Promise}
         */
        DataStoreBase.prototype.rollback = function (changes) {
            var that = this, updated = [];
            return lang.when(that._update(changes, function (store, obj, existent) {
                if (!existent) {
                    return;
                }
                if (obj.__metadata.isNew) {
                    updated.push({ __metadata: lang.extend({}, obj.__metadata, { isRemoved: true }), id: obj.id });
                    store["delete"](obj.id);
                    return;
                }
                // TOTHINK: а если isRemoved появился после getChanges?
                if (obj.__metadata.isRemoved) {
                    delete existent.__metadata.isRemoved;
                }
                existent.__original = existent.__original || {};
                var checkForEmpty = false;
                lang.forEach(obj, function (v, name) {
                    if (that._isSpecialPropName(name)) {
                        return;
                    }
                    if (!existent.hasOwnProperty(name) || lang.isEqual(v, existent[name])) {
                        // prop wasn't changed after getChanges
                        if (existent.__original.hasOwnProperty(name)) {
                            existent[name] = existent.__original[name];
                        }
                        else {
                            delete existent[name]; // TODO: это когда такое может быть?!
                        }
                        if (existent[name] === undefined) {
                            delete existent[name];
                            checkForEmpty = true;
                        }
                        delete existent.__original[name];
                    }
                });
                // restore ts
                if (obj.__metadata.ts && existent.__original.__metadata && existent.__original.__metadata.ts) {
                    existent.__metadata.ts = existent.__original.__metadata.ts;
                    delete existent.__original.__metadata; // NOTE: nothing except of ts in __original.__metadata
                }
                updated.push(that._toUser(lang.extend({}, existent), { keepFlags: true }));
                if (checkForEmpty) {
                    // if object has no prop (except for special) then remove it from store
                    if (Object.keys(existent).every(that._isSpecialPropName)) {
                        store["delete"](obj.id);
                        return;
                    }
                }
                delete existent["__tx"];
                store.put(that._toDB(existent));
            })).then(function () {
                return updated;
            });
        };
        /**
         * Put specified objects into Store, possibly replace existing objects.
         * @method
         * @param {Array} objects
         * @returns {Promise}
         */
        DataStoreBase.prototype.overwrite = function (objects) {
            var _this = this;
            return this._update(objects, function (store, obj, existent) {
                obj = lang.cloneEx(obj, { deep: true, exact: true });
                store.put(_this._toDB(obj));
            });
        };
        /**
         * Remove specified objects from Store.
         * @method
         * @param {Array} objects
         * @returns {Promise}
         */
        DataStoreBase.prototype.remove = function (objects) {
            return this._update(objects, function (store, obj, existent) {
                store["delete"](obj.id);
            });
        };
        /**
         * Put objects into Store as trustworthy data.
         * @method
         * @param {Array} objects json domain objects
         * @param {Object} [options]
         * @param {Boolean} [options.actualize] Update source objects with data from Store
         * @param {Boolean} [options.skipMissing] Ignore objects which can not be found in Store
         * @param {Boolean} [options.partial] Json data doesn't contains all properties loaded by default.
         * In this case the timestamp will not be updated and obsolete properties will not be removed.
         * @returns {Promise}
         */
        DataStoreBase.prototype.cache = function (objects, options) {
            var that = this;
            options = options || {};
            return that._update(objects, function (store, obj, existent) {
                if (!existent && options.skipMissing) {
                    return;
                }
                if (obj.__metadata.isRemoved) {
                    store["delete"](obj.id);
                    return;
                }
                existent = that._cacheObj(obj, existent);
                // NOTE: `obj.__metadata.ts` may be less than `existent.__metadata.ts`
                // (e.g. because of server database was restored from a backup - see WC-1456)
                var ts = obj.__metadata.ts;
                if (ts && ts !== (existent.__metadata.ts || 0)) {
                    if (!that._hasObjChanges(existent)) {
                        existent.__metadata.ts = ts;
                    }
                    else {
                        lang.extendEx(existent.__original, { __metadata: { ts: ts } }, { deep: true });
                    }
                    // delete obsolete props
                    if (!options.partial) {
                        lang.forEach(existent, function (v, name) {
                            if (that._isSpecialPropName(name)) {
                                return;
                            }
                            if (!obj.hasOwnProperty(name) && !existent.__original.hasOwnProperty(name)) {
                                delete existent[name];
                            }
                        });
                    }
                }
                // __aux are not merged, always overwrite them
                if (obj.__aux) {
                    existent.__aux = lang.clone(obj.__aux);
                }
                else {
                    delete existent.__aux;
                }
                // TODO: remove the code below (inside begin/end comments) when #XFW-269 will be fixed:
                // --- begin workaround ---
                //
                // TS isn't update while updating many-to-many navigation props on server (see #XFW-269).
                // So we can't be sure that those props weren't changed (even if ts is the same).
                // We have to delete them, if they aren't set in new cached objects.
                if (!options.partial) {
                    var typeMeta_1 = that.meta.entities[existent.__metadata.type];
                    lang.forEach(existent, function (v, name) {
                        if (that._isSpecialPropName(name)) {
                            return;
                        }
                        var propMeta = typeMeta_1.props[name];
                        if (propMeta && propMeta.many && !obj.hasOwnProperty(name) && !existent.__original.hasOwnProperty(name)) {
                            delete existent[name];
                        }
                    });
                }
                // --- end workaround ---
                if (options.actualize) {
                    that._actualize(obj, existent);
                }
                store.put(that._toDB(existent, { updateTs: !options.partial }));
            });
        };
        /**
         * Set values of navigation props with changed IDs to __newValues
         * @param changes
         * @protected
         */
        DataStoreBase.prototype._updateRefIds = function (changes) {
            var _this = this;
            changes.forEach(function (obj) {
                var newId = obj.__newValues && obj.__newValues.id;
                if (!newId) {
                    return;
                }
                var typeMeta = _this.meta.entities[obj.__metadata.type], propRefs = support.propRefsTo(typeMeta);
                changes.forEach(function (objRef) {
                    propRefs.forEach(function (propRef) {
                        if (objRef.__metadata.type !== propRef.entity.name) {
                            return;
                        }
                        var val = objRef[propRef.name], newVal, idx;
                        if (propRef.many && lang.isArray(val) && (idx = val.indexOf(obj.id)) >= 0) {
                            newVal = val.slice();
                            newVal[idx] = newId;
                        }
                        else if (!propRef.many && val === obj.id) {
                            newVal = newId;
                        }
                        if (newVal) {
                            objRef.__newValues = objRef.__newValues || {};
                            objRef.__newValues[propRef.name] = newVal;
                        }
                    });
                });
            });
        };
        DataStoreBase.prototype._commitObj = function (obj, existent) {
            var _this = this;
            if (!existent) {
                existent = lang.cloneEx(obj, { deep: true, exact: true });
                if (obj.__newValues) {
                    lang.forEach(obj.__newValues, function (v, name) {
                        if (_this._isSpecialPropName(name)) {
                            return;
                        }
                        existent[name] = v;
                    });
                    delete existent.__newValues;
                }
            }
            else {
                existent.__original = existent.__original || {};
                lang.forEach(obj, function (v, name) {
                    if (_this._isSpecialPropName(name)) {
                        return;
                    }
                    var newVal = v;
                    if (obj.__newValues && obj.__newValues.hasOwnProperty(name)) {
                        newVal = obj.__newValues[name];
                    }
                    _this._applyProp(name, existent, newVal, v);
                });
                if (obj.__newValues) {
                    lang.forEach(obj.__newValues, function (newVal, name) {
                        if (_this._isSpecialPropName(name)) {
                            return;
                        }
                        if (!obj.hasOwnProperty(name)) {
                            _this._applyProp(name, existent, newVal, newVal);
                        }
                    });
                }
            }
            if (obj.__newValues) {
                // update aux-objects
                if (obj.__newValues.__aux) {
                    existent.__aux = lang.extend(existent.__aux || {}, obj.__newValues.__aux);
                }
                // update id
                if (obj.__newValues.id) {
                    existent.id = obj.__newValues.id;
                }
            }
            //delete existent.__newValues;
            delete existent.__metadata.isNew;
            return existent;
        };
        DataStoreBase.prototype._cacheObj = function (obj, existent) {
            var _this = this;
            if (!existent) {
                existent = lang.cloneEx(obj, { deep: true, exact: true });
            }
            else {
                existent.__original = existent.__original || {};
                lang.forEach(obj, function (v, name) {
                    if (_this._isSpecialPropName(name)) {
                        return;
                    }
                    _this._applyProp(name, existent, v, v);
                });
            }
            return existent;
        };
        DataStoreBase.prototype._applyProp = function (name, existent, newVal, curVal) {
            if (!existent.__original.hasOwnProperty(name)) {
                existent[name] = newVal;
            }
            else if (!existent.hasOwnProperty(name) || lang.isEqual(curVal, existent[name])) {
                existent[name] = newVal;
                delete existent.__original[name];
            }
            else {
                // prop was changed after getChanges
                existent.__original[name] = newVal;
            }
        };
        DataStoreBase.prototype._actualize = function (obj, existent) {
            var _this = this;
            if (!existent) {
                return;
            }
            if (existent.__metadata.ts) {
                obj.__metadata.ts = existent.__metadata.ts;
            }
            if (existent.__metadata.isRemoved) {
                obj.__metadata.isRemoved = true;
            }
            lang.forEach(existent, function (v, name) {
                if (_this._isSpecialPropName(name)) {
                    return;
                }
                obj[name] = v;
            });
            // NOTE: __aux should not be actualized from cache
        };
        DataStoreBase.prototype._isSpecialPropName = function (name) {
            return name === "id" || lang.stringStartsWith(name, "__");
        };
        DataStoreBase.prototype._hasObjChanges = function (obj) {
            var _this = this;
            if (!obj) {
                return false;
            }
            return obj.__metadata.isNew || obj.__metadata.isRemoved || lang.some(obj.__original, function (v, name) {
                return !_this._isSpecialPropName(name);
            });
        };
        DataStoreBase.prototype._getObjChanges = function (obj) {
            var that = this, ret = {
                __metadata: obj.__metadata,
                id: obj.id
            }, typeMeta;
            if (!obj.__metadata.isRemoved) {
                typeMeta = that.meta.entities && that.meta.entities[obj.__metadata.type];
                lang.forEach(obj, function (v, name) {
                    var propMeta;
                    if (that._isSpecialPropName(name)) {
                        return;
                    }
                    if (obj.__metadata.isNew || (obj.__original && obj.__original.hasOwnProperty(name))) {
                        ret[name] = v;
                        if (!obj.__metadata.isNew) {
                            // copy original values of navigation sets
                            propMeta = typeMeta && typeMeta.props && typeMeta.props[name];
                            if (propMeta && propMeta.vt === "object" && propMeta.many) {
                                ret.__original = ret.__original || {};
                                ret.__original[name] = obj.__original[name];
                            }
                        }
                    }
                });
            }
            var tx = obj["__tx"];
            if (tx) {
                ret["__tx"] = tx;
            }
            return that._toUser(ret, { raw: true });
        };
        DataStoreBase.prototype._toUser = function (obj, options) {
            if (!obj) {
                return obj;
            }
            delete obj.__hasChanges;
            delete obj.__timestamp;
            if (!options || !options.raw) {
                delete obj.__original;
            }
            if (!options || !(options.keepFlags || options.raw)) {
                if (obj.__metadata.isNew) {
                    // before returning new object set nulls for all empty props:
                    var meta = this.meta.entities[obj.__metadata.type];
                    lang.forEach(meta.props, function (propMeta) {
                        if (obj[propMeta.name] === undefined) {
                            obj[propMeta.name] = null;
                        }
                    });
                    //propMeta = .props[source.propName];
                }
                delete obj.__metadata.isNew;
                delete obj.__metadata.isRemoved;
            }
            return obj;
        };
        /**
         * Convert object for storing in DB.
         * @param {Object} obj json object with data
         * @param {Object} options
         * @param {Boolean} [options.updateTs=false] true to update __timestamp field
         * @returns {Object} object for storing in DB (can be used as parameter for 'put' method)
         */
        DataStoreBase.prototype._toDB = function (obj, options) {
            if (!obj) {
                return obj;
            }
            obj.__hasChanges = this._hasObjChanges(obj) ? 1 : 0;
            if (options && options.updateTs) {
                obj.__timestamp = Date.now();
            }
            return obj;
        };
        DataStoreBase.prototype._fromDB = function (obj) {
            return obj;
        };
        DataStoreBase.prototype._identity = function (obj) {
            var _this = this;
            if (!obj) {
                return obj;
            }
            return lang.select(obj, function (o) {
                _this._throwIfNotValid(o);
                return { type: o.__metadata.type, id: o.id };
            });
        };
        DataStoreBase.prototype._cacheQueryProp = function (source, response) {
            var that = this, propMeta, obj;
            if (!source.type || !source.id || !source.propName) {
                return lang.resolved();
            }
            propMeta = that.meta.entities[source.type].props[source.propName];
            if (!propMeta) {
                return lang.resolved();
            }
            obj = { __metadata: { type: source.type }, id: source.id };
            obj[source.propName] = lang.select(response.result, function (o) {
                if (propMeta.vt !== "object") {
                    return o;
                }
                that._throwIfNotValid(o);
                return o.id;
            });
            return that.cache(obj, { skipMissing: true, partial: true });
        };
        DataStoreBase.prototype._queryResponse = function (objects, timestamp) {
            var _this = this;
            if (!objects) {
                return { found: false };
            }
            var processObj = function (obj) {
                if (!timestamp) {
                    timestamp = obj.__timestamp;
                }
                else if (obj.__timestamp < timestamp) {
                    timestamp = obj.__timestamp;
                }
                return _this._toUser(obj);
            };
            var result = lang.select(objects, processObj);
            return {
                found: true,
                age: timestamp === -1 ? MAX_AGE : Date.now() - timestamp,
                result: result
            };
        };
        DataStoreBase.prototype._queryValueResponse = function (v, timestamp) {
            if (v === undefined) {
                return { found: false };
            }
            return {
                found: true,
                age: timestamp === -1 ? MAX_AGE : Date.now() - timestamp,
                result: v
            };
        };
        DataStoreBase.prototype._throwIfNotValid = function (obj) {
            if (!obj) {
                throw new ReferenceError("Object is empty");
            }
            if (!obj.id) {
                throw new Error("Attribute 'id' must be specified");
            }
            if (!obj.__metadata || !obj.__metadata.type) {
                throw new Error("Property '__metadata.type' must be specified");
            }
            this._throwIfTypeInvalid(obj.__metadata.type);
        };
        DataStoreBase.prototype._throwIfTypeInvalid = function (type) {
            if (!type) {
                throw new ReferenceError("Type is not specified");
            }
            if (!this.storedTypes[type]) {
                throw new Error("Type '" + type + "' can't be stored. It doesn't exists in the domain model or it is temporary.");
            }
        };
        DataStoreBase.prototype._groupByType = function (objects) {
            var _this = this;
            var objectsArray = objects && lang.array(objects);
            if (!objectsArray || !objectsArray.length) {
                return {};
            }
            return lang.groupBy(objectsArray, function (obj) {
                _this._throwIfNotValid(obj);
                return obj.__metadata.type;
            });
        };
        DataStoreBase.prototype._matchFilter = function (obj, filter) {
            if ((filter.hasChanges !== undefined) && !filter.hasChanges !== !obj.__hasChanges) {
                return false;
            }
            if ((filter.isRemoved !== undefined) && !filter.isRemoved !== !obj.__metadata.isRemoved) {
                return false;
            }
            return true;
        };
        DataStoreBase.prototype._getParamsForCache = function (params) {
            if (!params || !params.$hints) {
                return params;
            }
            params = lang.clone(params);
            delete params.$hints;
            return params;
        };
        DataStoreBase.prototype._getQueryType = function (query, data) {
            return query.type || (data.result.length ? data.result[0].type : data.result.type);
        };
        DataStoreBase.prototype._getQuerySource = function (query) {
            var source = query.source;
            if (!source) {
                throw new Error("query.source should be specified");
            }
            return lang.isString(source) ? { type: source } : source;
        };
        /**
         * @param {Array} types names of domain types
         * @returns {Array} A string array: original types + ancestors
         * @private
         */
        DataStoreBase.prototype._getAncestors = function (types) {
            var _this = this;
            var map = {};
            types.forEach(function (type) {
                map[type] = true;
                var meta = _this.meta.entities[type];
                while (meta) {
                    map[meta.name] = true;
                    meta = meta.base;
                }
            });
            return Object.keys(map);
        };
        return DataStoreBase;
    }(lang.Observable));
    // Wrap all public methods by `lang.async.wrap`. So they always return a Promise object
    // and return rejected Promise instead of throwing error.
    ["save", "commit", "rollback", "overwrite", "remove", "cache"].forEach(function (name) {
        DataStoreBase.prototype[name] = lang.async.wrap(DataStoreBase.prototype[name]);
    });
    return DataStoreBase;
});
//# sourceMappingURL=DataStoreBase.js.map