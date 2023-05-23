/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/data/DataStoreBase", "i18n!lib/nls/resources"], function (require, exports, lang, DataStoreBase, resources) {
    "use strict";
    var DBConnection = /** @class */ (function () {
        function DBConnection(store, timeout) {
            var that = this;
            that.store = store;
            that.db = DataStoreIndexedDB.indexedDBUtils.openDB(store.name, store.getFullVersion(), store._onupgrade.bind(store));
            that.dispose = DBConnection.prototype.dispose.bind(that);
            that.db.fail(function (error) {
                that.store.onError(error);
            });
            // autoclose after timeout
            timeout = lang.isNumber(timeout) ? timeout : store.defaultTimeout;
            if (timeout > 0) {
                that.timeoutID = window.setTimeout(that.dispose, timeout);
            }
        }
        DBConnection.prototype.beginTx = function (storeNames, mode) {
            var _this = this;
            return this.db.then(function (db) {
                try {
                    var tx = db.transaction(storeNames, mode);
                    DataStoreIndexedDB.indexedDBUtils.on(tx, "error abort", function (e) {
                        e.preventDefault();
                        _this.store.onError(e.target.error);
                    });
                    return tx;
                }
                catch (ex) {
                    _this.store.onError(ex);
                    return lang.rejected(ex);
                }
            });
        };
        DBConnection.prototype.completeTx = function (tx) {
            return DataStoreIndexedDB.indexedDBUtils.completeTx(tx);
        };
        DBConnection.prototype.dispose = function () {
            var that = this;
            if (that.db) {
                that.db.done(DataStoreIndexedDB.indexedDBUtils.closeDB);
                that.db = null;
            }
            if (that.timeoutID) {
                window.clearTimeout(that.timeoutID);
                that.timeoutID = null;
            }
        };
        return DBConnection;
    }());
    /**
     * Connection bound to specified transaction
     * @type {*}
     */
    var TxDBConnection = /** @class */ (function () {
        function TxDBConnection(store, tx) {
            this.tx = tx;
            this.db = lang.resolved(tx.db);
            DataStoreIndexedDB.indexedDBUtils.on(tx, "error abort", function (e) {
                store.onError(e.target.error);
            });
        }
        TxDBConnection.prototype.beginTx = function () {
            return lang.resolved(this.tx);
        };
        TxDBConnection.prototype.completeTx = function (tx) {
            if (tx !== this.tx) {
                throw new Error("TxDBConnection.completeTx get transaction different from its own");
            }
            return lang.resolved();
        };
        TxDBConnection.prototype.dispose = function () {
            this.db = null;
            this.tx = null;
        };
        return TxDBConnection;
    }());
    var DataStoreIndexedDB = /** @class */ (function (_super) {
        __extends(DataStoreIndexedDB, _super);
        /**
         * @constructs DataStoreIndexedDB
         * @extends DataStoreBase
         * @param {String} name DB name
         * @param {String} version DB version
         * @param {Object} domainModelMeta Domain model metadata
         * @param {Object} [options]
         */
        function DataStoreIndexedDB(name, version, domainModelMeta, options) {
            var _this = _super.call(this, name, version, domainModelMeta, options) || this;
            if (!_this.isSupported)
                throw new Error("DataStore.ctor: indexedDB is not supported");
            if (_this.options.recreate) {
                _this.recreate();
            }
            return _this;
        }
        DataStoreIndexedDB.prototype.test = function (timeout) {
            var con = this._createConnection(timeout);
            return con.db.always(con.dispose);
        };
        DataStoreIndexedDB.prototype.recreate = function () {
            var that = this;
            return that.utils.deleteDB(that.name)
                .then(function () { return that.test(0); }) // infinite timeout
                .fail(function (error) { return that.onError(error); });
        };
        DataStoreIndexedDB.prototype.getFullVersion = function () {
            return (this.systemVersion << 24) + this.version; // high byte is systemVersion
        };
        /*protected*/ DataStoreIndexedDB.prototype._onupgrade = function (tx, oldFullVersion, newFullVersion) {
            var oldSystemVersion = oldFullVersion >> 24, // high byte
            newSystemVersion = newFullVersion >> 24, // high byte
            oldVersion = oldFullVersion & 0xFFFFFF, // 3 low bytes
            newVersion = newFullVersion & 0xFFFFFF; // 3 low bytes
            // upgrade system version
            if (newSystemVersion > oldSystemVersion) {
                this._onsysupgrade(tx, oldSystemVersion, newSystemVersion);
            }
            // upgrade application version
            if (newVersion > oldVersion) {
                this._onappupgrade(tx, oldVersion, newVersion);
            }
        };
        DataStoreIndexedDB.prototype._onsysupgrade = function (tx, oldSystemVersion, newSystemVersion) {
            var that = this, storeNames = Array.prototype.slice.call(tx.db.objectStoreNames), store, indexNames;
            if (storeNames.indexOf(that.queryStoreName) < 0) {
                store = tx.db.createObjectStore(that.queryStoreName);
            }
            else {
                store = tx.objectStore(that.queryStoreName);
            }
            indexNames = Array.prototype.slice.call(store.indexNames);
            if (indexNames.indexOf(that) < 0) {
                store.createIndex("__type", "__type");
            }
        };
        DataStoreIndexedDB.prototype._onappupgrade = function (tx, oldVersion, newVersion) {
            var that = this, dbStores = Array.prototype.slice.call(tx.db.objectStoreNames), modelStores = Object.keys(that.storedTypes), storesToDelete = lang.difference(dbStores, modelStores), storesToCreate = lang.difference(modelStores, dbStores), originalStoredTypes = that.storedTypes;
            // create new stores
            storesToCreate.forEach(function (name) {
                var store = tx.db.createObjectStore(name, { keyPath: "id" });
                store.createIndex("__hasChanges", "__hasChanges");
            });
            // onversionchange callback should be executed into the same transaction.
            that._upgradingTx = tx;
            // add types from db
            that.storedTypes = lang.clone(originalStoredTypes);
            lang.forEach(tx.db.objectStoreNames, function (name) {
                if (name !== that.queryStoreName) {
                    that.storedTypes[name] = true;
                }
            });
            var deferred = that.onversionchange(oldVersion, newVersion);
            return lang.when(deferred)
                .always(function () {
                that._upgradingTx = undefined;
                that.storedTypes = originalStoredTypes;
            })
                .done(function () {
                // NOTE: is IE10 skip store deletion because of bug:
                // https://connect.microsoft.com/IE/feedback/details/783672/indexeddb-getting-an-aborterror-exception-when-trying-to-delete-objectstore-inside-onupgradeneeded
                if (navigator.userAgent.match(/MSIE/i) != null) {
                    return;
                }
                storesToDelete.forEach(function (name) {
                    if (name !== that.queryStoreName) {
                        tx.db.deleteObjectStore(name);
                    }
                });
            });
        };
        /**
         * Load an object
         * @param type
         * @param id
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreIndexedDB.prototype.load = function (type, id, options) {
            var that = this;
            that._throwIfTypeInvalid(type);
            var con = that._createConnection();
            return lang.async.chain(that._getObj(con, type, id))
                .always(con.dispose)
                .then(function (obj) {
                return that._toUser(obj, options);
            })
                .value();
        };
        /**
         * Load several objects
         * @param identities
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreIndexedDB.prototype.loadMany = function (identities, options) {
            var that = this;
            identities.forEach(function (identity) {
                that._throwIfTypeInvalid(identity.type);
            });
            var con = that._createConnection();
            return lang.async.chain(that._getMany(con, identities))
                .always(con.dispose)
                .then(function (objects) {
                return objects.map(function (obj) {
                    return that._toUser(obj, options);
                });
            })
                .value();
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
        DataStoreIndexedDB.prototype.select = function (filter, options) {
            var that = this, objects = [], objFilter = lang.isString(filter) ? { type: filter } : filter, con;
            that._throwIfTypeInvalid(objFilter.type);
            con = that._createConnection();
            return lang.async.chain(con.beginTx([objFilter.type], "readonly"))
                .then(function (tx) {
                var store = tx.objectStore(objFilter.type), cursorRequest = objFilter.hasChanges === undefined ?
                    store.openCursor() :
                    store.index("__hasChanges").openCursor(IDBKeyRange.only(objFilter.hasChanges ? 1 : 0));
                return that.utils.fetch(cursorRequest, con);
            })
                .progress(function (obj) {
                if (!that._matchFilter(obj, objFilter)) {
                    return;
                }
                obj = that._fromDB(obj);
                obj = that._toUser(obj, options);
                objects.push(obj);
            })
                .always(con.dispose)
                .then(function () {
                return objects;
            })
                .value();
        };
        /**
         * Load all objects from the store. Use for debug only!
         * @param options
         * @param {Boolean} options.raw Keep raw properties (__original, isNew, isRemoved)
         * @return {*}
         */
        DataStoreIndexedDB.prototype.all = function (options) {
            var that = this, types = Object.keys(that.storedTypes), objects = [], con = that._createConnection();
            return lang.async.chain(con.beginTx(types, "readonly"))
                .then(function (tx) {
                var requests = types.map(function (type) {
                    return tx.objectStore(type).openCursor();
                });
                return that.utils.fetchMany(requests, con);
            })
                .progress(function (obj) {
                obj = that._fromDB(obj);
                obj = that._toUser(obj, options);
                objects.push(obj);
            })
                .always(con.dispose)
                .then(function () {
                return objects;
            })
                .value();
        };
        DataStoreIndexedDB.prototype.getChanges = function () {
            var that = this, types = Object.keys(that.storedTypes), objects = [], con = that._createConnection();
            return lang.async.chain(con.beginTx(types, "readonly"))
                .then(function (tx) {
                var requests = types.map(function (type) {
                    var store = tx.objectStore(type), index = store.index("__hasChanges");
                    return index.openCursor(IDBKeyRange.only(1));
                    //return index.openCursor(1);
                });
                return that.utils.fetchMany(requests, con);
            })
                .progress(function (obj) {
                obj = that._fromDB(obj);
                obj = that._getObjChanges(obj);
                objects.push(obj);
            })
                .always(con.dispose)
                .then(function () {
                return objects;
            })
                .value();
        };
        DataStoreIndexedDB.prototype.hasChanges = function () {
            var that = this, types = Object.keys(that.storedTypes), count = 0, con = that._createConnection();
            return lang.async.chain(con.beginTx(types, "readonly"))
                .then(function (tx) {
                var deferreds = types.map(function (type) {
                    var store = tx.objectStore(type), index = store.index("__hasChanges");
                    return that.utils.exec(index.count(1)).done(function (n) {
                        count += n;
                    });
                });
                return lang.when.apply(lang, deferreds)
                    .then(function () { return con.completeTx(tx); });
            })
                .always(con.dispose)
                .then(function () {
                return !!count;
            })
                .value();
        };
        /**
         * Remove objects of specific 'type' which don't have unsaved changes
         * @param {String} type
         * @returns {*}
         */
        DataStoreIndexedDB.prototype.clear = function (type) {
            this._throwIfTypeInvalid(type);
            var con = this._createConnection();
            return this._clear(con, type).always(con.dispose);
        };
        /**
         * Remove objects from DataStore
         * @param options
         * @param {Boolean} options.includePending Remove or not objects with unsaved changes
         * @returns {*}
         */
        DataStoreIndexedDB.prototype.clearAll = function (options) {
            var _this = this;
            var types = Object.keys(this.storedTypes), con = this._createConnection(), tasks = types.map(function (type) {
                return _this._clear(con, type, options);
            });
            return lang.when.apply(lang, tasks).always(con.dispose);
        };
        DataStoreIndexedDB.prototype.cacheQuery = function (query, response) {
            if (!query || !query.source) {
                throw new Error("DataStore.cacheQuery: query.source should be specified");
            }
            if (!response) {
                throw new Error("DataStore.cacheQuery: response should be specified");
            }
            var that = this, source = that._getQuerySource(query), identities, con;
            if (source.propName) {
                return this._cacheQueryProp(source, response); // can throw
            }
            if (source.id) {
                return lang.resolved();
            }
            identities = that._identity(response.result); // can throw
            con = that._createConnection();
            return lang.async.chain(con.beginTx([that.queryStoreName], "readwrite"))
                .then(function (tx) {
                var data = {
                    __timestamp: Date.now(),
                    result: identities,
                    hints: response.hints
                }, key = that._getQueryKey(source, query.params), type = that._getQueryType(query, data), store = tx.objectStore(that.queryStoreName);
                if (type) {
                    data.__type = type;
                }
                return that.utils.complete(store.put(data, key), con);
            })
                .always(con.dispose)
                .value();
        };
        DataStoreIndexedDB.prototype.query = function (query) {
            var that = this, source = that._getQuerySource(query), con, deferred;
            con = that._createConnection();
            if (source.propName) {
                deferred = that._queryProp(con, source.type, source.id, source.propName);
            }
            else if (source.id) {
                deferred = that._queryObject(con, source.type, source.id);
            }
            else {
                deferred = that._queryObjects(con, source, query.params);
            }
            return lang.async.always(deferred, con.dispose);
        };
        DataStoreIndexedDB.prototype._queryObject = function (con, type, id) {
            var _this = this;
            this._throwIfTypeInvalid(type);
            return this._getObj(con, type, id)
                .then(function (obj) {
                return _this._queryResponse(obj);
            });
        };
        DataStoreIndexedDB.prototype._queryObjects = function (con, source, params) {
            var that = this, timestamp, hints;
            return lang.async.chain(con.beginTx([that.queryStoreName], "readonly"))
                .then(function (tx) {
                var store = tx.objectStore(that.queryStoreName), key = that._getQueryKey(source, params);
                return that.utils.complete(store.get(key), con);
            })
                .then(function (data) {
                var result = data && data.result;
                if (!result) {
                    return undefined;
                }
                timestamp = data.__timestamp;
                hints = data.hints;
                return lang.isArray(result) ?
                    that._getMany(con, result) :
                    that._getObj(con, result.type, result.id);
            })
                .then(function (result) {
                var response = that._queryResponse(result, timestamp);
                response.hints = hints;
                return response;
            })
                .value();
        };
        DataStoreIndexedDB.prototype._queryProp = function (con, type, id, prop) {
            var that = this, timestamp, isObject;
            that._throwIfTypeInvalid(type);
            return lang.async.chain(that._getObj(con, type, id))
                .then(function (obj) {
                var v, propMeta = that.meta.entities[type].props[prop], identities;
                if (!obj || !propMeta || (v = obj[prop]) === undefined) {
                    return undefined;
                }
                timestamp = obj.__timestamp;
                if (propMeta.vt !== "object") {
                    return v;
                }
                if (v === null) {
                    return propMeta.many ? [] : null;
                }
                isObject = true;
                if (!propMeta.many) {
                    return that._getObj(con, propMeta.ref.name, v);
                }
                else {
                    //identities = lang.select(v, function (id) {
                    //	return { type: propMeta.ref.name, id: id };
                    //});
                    identities = v.map(function (id) {
                        return { type: propMeta.ref.name, id: id };
                    });
                    return that._getMany(con, identities)
                        .then(function (objects) {
                        return objects.length === identities.length ? objects : undefined;
                    });
                }
            })
                .then(function (result) {
                return isObject ?
                    that._queryResponse(result, timestamp) :
                    that._queryValueResponse(result, timestamp);
            })
                .value();
        };
        DataStoreIndexedDB.prototype._getQueryKey = function (source, params) {
            // NOTE: IE10 doesn't support array keys
            //			return [
            //				JSON.stringify(source),
            //				JSON.stringify(params || "")
            //			];
            return JSON.stringify({
                source: source,
                params: this._getParamsForCache(params)
            });
        };
        DataStoreIndexedDB.prototype._clear = function (con, type, options) {
            var _this = this;
            return lang.async.then(con.beginTx([type], "readwrite"), function (tx) {
                var store = tx.objectStore(type);
                if (options && options.includePending) {
                    return _this.utils.complete(store.clear(), con);
                }
                else {
                    var index = store.index("__hasChanges");
                    return _this.utils.fetch(index.openCursor(0), con)
                        .progress(function (obj, key) {
                        _this.utils.exec(store["delete"](key));
                    });
                }
            });
        };
        DataStoreIndexedDB.prototype._getObj = function (con, type, id) {
            var _this = this;
            this._throwIfTypeInvalid(type);
            return lang.async.chain(con.beginTx([type], "readonly"))
                .then(function (tx) {
                var store = tx.objectStore(type);
                return _this.utils.complete(store.get(id), con);
            })
                .then(function (obj) {
                return _this._fromDB(obj);
            })
                .value();
        };
        DataStoreIndexedDB.prototype._getMany = function (con, identities) {
            var _this = this;
            var result = [], objectsByType = lang.groupBy(identities, function (identity) {
                _this._throwIfTypeInvalid(identity.type);
                return identity.type;
            });
            return this._iterate(con, objectsByType, function (store, obj, existent) {
                if (existent && !existent.__metadata.isRemoved) {
                    result.push(existent);
                }
            }).then(function () {
                return result;
            });
        };
        DataStoreIndexedDB.prototype._update = function (objects, iterator) {
            var objectsByType = this._groupByType(objects), // can throw
            con = this._createConnection();
            return this._iterate(con, objectsByType, iterator, "readwrite").always(con.dispose);
        };
        DataStoreIndexedDB.prototype._iterate = function (con, objectsByType, iterator, txMode) {
            var that = this, types = Object.keys(objectsByType);
            if (!types.length) {
                return lang.resolved();
            }
            return lang.async.then(con.beginTx(types, txMode || "readonly"), function (tx) {
                lang.forEach(objectsByType, function (objectsOfType, type) {
                    var store = tx.objectStore(type);
                    lang.forEach(objectsOfType, function (obj) {
                        that.utils
                            .exec(store.get(obj.id))
                            .done(function (existent) {
                            existent = that._fromDB(existent);
                            iterator.call(that, store, obj, existent);
                        });
                    });
                });
                return con.completeTx(tx);
            });
        };
        DataStoreIndexedDB.prototype._commit = function (changes, iterator) {
            var that = this, objectsByType = that._groupByType(changes), // can throw
            types = that._getAncestors(Object.keys(objectsByType)), con;
            if (!types.length) {
                return lang.resolved();
            }
            con = that._createConnection();
            return lang.async.chain(that._iterate(con, objectsByType, iterator, "readwrite"))
                .then(function () {
                return con.beginTx(that.queryStoreName, "readwrite");
            })
                .then(function (tx) {
                var store = tx.objectStore(that.queryStoreName), index = store.index("__type"), requests = types.map(function (type) {
                    //return index.openCursor(type);
                    return index.openCursor(IDBKeyRange.only(type));
                });
                return that.utils.fetchMany(requests, con)
                    .progress(function (query, key) {
                    // NOTE: don't set to 0, because this is falsy value and will be ignored
                    query.__timestamp = -1; // outdated
                    return that.utils.exec(store.put(query, key));
                });
            })
                .always(con.dispose)
                .value();
        };
        DataStoreIndexedDB.prototype._createConnection = function (timeout) {
            return this._upgradingTx ?
                new TxDBConnection(this, this._upgradingTx) :
                new DBConnection(this, timeout);
        };
        /**
         * @method
         * @param {Object} error
         * @param {String} error.name
         * @param {String} error.message
         * @param {Number} error.code
         * @fires DataStoreIndexedDB#error
         * @async-debounce throttle=100
         */
        DataStoreIndexedDB.prototype.onError = function (error /*DOMError|DOMException|Error*/) {
            var message, newError;
            message = resources["datastore.error.raw"];
            if (error.message) {
                message += ": " + error.message;
            }
            else if (error.name) {
                var specific = resources["datastore.error." + error.name];
                if (specific) {
                    message += ": " + specific;
                }
                else {
                    message += " (" + error.name + ")";
                }
            }
            else if (error.code) {
                message += " (code = " + error.code + ")";
            }
            newError = new Error(message);
            newError.name = error.name || "Error";
            console.error(newError);
            /**
             * Error happened.
             * @event DataStoreIndexedDB#error
             * @type {Error}
             * @property {String} name Error name
             * @property {String} message Error description
             */
            this.trigger("error", newError);
        };
        return DataStoreIndexedDB;
    }(DataStoreBase));
    (function (DataStoreIndexedDB) {
        var indexedDBUtils;
        (function (indexedDBUtils) {
            indexedDBUtils.isSupported = !!window.indexedDB;
            function _deferredRequest(dbRequest) {
                var deferred = lang.deferred();
                if (dbRequest.readyState === "done") {
                    if (dbRequest.error) {
                        deferred.reject(dbRequest.error);
                    }
                    else {
                        deferred.resolve(dbRequest.result);
                    }
                }
                else {
                    on(dbRequest, "error", function (e) {
                        // otherwise an error will appears in Mozilla Firefox
                        e.preventDefault();
                        var target = e.target, error = (target.readyState === "done" && target.error) || e.type, tx = target.transaction;
                        if (tx) {
                            try {
                                tx.abort();
                            }
                            catch (ex) {
                            }
                        }
                        deferred.reject(error);
                    });
                }
                return deferred;
            }
            function _execRequest(dbRequest) {
                var deferred = _deferredRequest(dbRequest);
                if (deferred.state() === "pending") {
                    on(dbRequest, "success", function (e) {
                        deferred.resolve(e.target.result);
                    });
                }
                return deferred;
            }
            function _openRequest(openDbRequest) {
                // NOTE: we can define 'onblocked' callback here, but what should we do in that callback?
                // 'blocked' isn't an error, it is just a notification of temporary lock
                return _execRequest(openDbRequest);
            }
            function exec(dbRequest) {
                var deferred = _execRequest(dbRequest);
                return deferred.promise();
            }
            indexedDBUtils.exec = exec;
            /**
             * Executes IDBRequest and waits for completion of its transaction
             * @param dbRequest
             * @param con
             * @returns {Promise<any>}
             */
            function complete(dbRequest, con) {
                return _execRequest(dbRequest).then(function (result) {
                    return con
                        .completeTx(dbRequest.transaction)
                        .then(function () { return result; });
                });
            }
            indexedDBUtils.complete = complete;
            /**
             * Opens cursor, read all data from it and waits for completion of the request's transaction.
             * @param cursorRequest
             * @param con
             * @returns {Promise<void>}
             */
            function fetch(cursorRequest, con) {
                var deferred = _deferredRequest(cursorRequest);
                if (deferred.state() === "pending") {
                    on(cursorRequest, "success", function (e) {
                        var cursor = e.target.result;
                        if (cursor) {
                            deferred.notify(cursor.value, cursor.primaryKey);
                            cursor["continue"]();
                        }
                        else {
                            con.completeTx(cursorRequest.transaction).then(function () {
                                deferred.resolve();
                            });
                        }
                    });
                }
                return deferred.promise();
            }
            indexedDBUtils.fetch = fetch;
            /**
             * Opens one or many cursors, read all data from them and waits for completion of all transactions.
             * @param cursorRequests
             * @param con
             * @returns {Promise<void>}
             */
            function fetchMany(cursorRequests, con) {
                var done = cursorRequests.length;
                if (done === 0) {
                    return lang.resolved();
                }
                if (done === 1) {
                    return fetch(cursorRequests[0], con);
                }
                var deferred = lang.deferred();
                for (var _i = 0, cursorRequests_1 = cursorRequests; _i < cursorRequests_1.length; _i++) {
                    var cursorRequest = cursorRequests_1[_i];
                    fetch(cursorRequest, con)
                        .done(function () {
                        done--;
                        if (!done) {
                            deferred.resolve();
                        }
                    }).fail(function () {
                        deferred.reject.apply(deferred, arguments);
                    }).progress(function () {
                        deferred.notify.apply(deferred, arguments);
                    });
                }
                return deferred.promise();
            }
            indexedDBUtils.fetchMany = fetchMany;
            function openDB(name, version, onversionchange) {
                var openDbRequest = window.indexedDB.open(name, version), deferred = _openRequest(openDbRequest);
                if (onversionchange) {
                    on(openDbRequest, "upgradeneeded", function (e) {
                        onversionchange(e.target.transaction, e.oldVersion, e.newVersion);
                    });
                    return deferred.promise();
                }
            }
            indexedDBUtils.openDB = openDB;
            function closeDB(db) {
                db.close();
            }
            indexedDBUtils.closeDB = closeDB;
            function deleteDB(name) {
                var openDbRequest = window.indexedDB.deleteDatabase(name), deferred = _openRequest(openDbRequest);
                return deferred.promise();
            }
            indexedDBUtils.deleteDB = deleteDB;
            function completeTx(tx) {
                var deferred = lang.deferred();
                on(tx, "complete", function () {
                    deferred.resolve();
                });
                on(tx, "error abort", function (e) {
                    e.preventDefault();
                    deferred.reject(e.target.error);
                });
                return deferred.promise();
            }
            indexedDBUtils.completeTx = completeTx;
            function on(target, events, callback) {
                events.split(/\s+/).forEach(function (name) {
                    target.addEventListener(name, callback);
                });
            }
            indexedDBUtils.on = on;
        })(indexedDBUtils = DataStoreIndexedDB.indexedDBUtils || (DataStoreIndexedDB.indexedDBUtils = {}));
    })(DataStoreIndexedDB || (DataStoreIndexedDB = {}));
    DataStoreIndexedDB.mixin({
        utils: DataStoreIndexedDB.indexedDBUtils,
        isSupported: DataStoreIndexedDB.indexedDBUtils.isSupported,
        queryStoreName: "__x_query",
        systemVersion: 2,
        defaultTimeout: 30000
    });
    [
        "test", "recreate", "load", "loadMany", "select", "all",
        "getChanges", "hasChanges", "clear", "clearAll", "cacheQuery", "query", "_get"
    ].forEach(function (name) {
        DataStoreIndexedDB.prototype[name] = lang.async.wrap(DataStoreIndexedDB.prototype[name]);
    });
    DataStoreIndexedDB.prototype.onError = lang.debounce(DataStoreIndexedDB.prototype.onError);
    return DataStoreIndexedDB;
});
//# sourceMappingURL=DataStoreIndexedDB.js.map