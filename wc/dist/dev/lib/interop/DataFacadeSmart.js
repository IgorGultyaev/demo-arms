/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/interop/DataFacadeBase", "lib/interop/DataSynchronizer", "lib/interop/CacheManager", "lib/core.diagnostics", "i18n!lib/nls/resources", "lib/ui/menu/Menu", "lib/ui/ConfirmDialog", "lib/interop/.interop.types"], function (require, exports, core, DataFacadeBase, DataSynchronizer, CacheManager, diagnostics, resources, Menu, ConfirmDialog, _interop_types_1) {
    "use strict";
    var lang = core.lang;
    var DataFacadeSmart = /** @class */ (function (_super) {
        __extends(DataFacadeSmart, _super);
        /**
         * @class DataFacadeSmart
         * @extends DataFacadeBase
         * @param {BackendInterop} interop
         * @param {EventPublisher} eventPublisher
         * @param {DataStoreBase} dataStore
         * @param {Object} options Additional options
         * @param {CacheManager} options.cacheManager
         * @param {Function} options.DataSynchronizer
         * @param {"remoteFirst"|"localFirst"|"localIfOffline"|"cached"|"remoteOnly"|"localOnly"} options.loadRule
         * @param {Boolean} options.supportNetworkRealtimeEvents
         * @param {"smart"|"offline"|"remoteOnly"} options.saveMode Saving mode: smart, offline, online (by default 'smart'), see property saveMode
         */
        function DataFacadeSmart(interop, eventPublisher, dataStore, options) {
            var _this = _super.call(this, interop, eventPublisher) || this;
            _this.traceSource = new diagnostics.TraceSource("interop.DataFacade");
            if (!dataStore) {
                throw new Error("DataFacade.ctor: DataStore should be specified");
            }
            _this.options = lang.appendEx(options || {}, DataFacadeSmart.defaultOptions, { deep: true });
            _this._initDataStore(dataStore);
            // Do we support real-time network events (online/offline)? - unfortunately Modernizr unable to detect them
            _this._supportNetworkRealtimeEvents = _this.options.supportNetworkRealtimeEvents;
            _this.manuallyDisconnected(!!core.settings.getItem("DataFacade.manuallyDisconnected"));
            _this.saveMode(_this.options.saveMode);
            _this.networkOnline(true);
            _this.serverOnline(true);
            _this._updateSaveTarget(/*doSchedule=*/ true);
            _this._cacheManager = _this._createCacheManager();
            if (interop.bind) {
                interop.bind("offline", function () {
                    _this.traceSource.debug("DataFacade gets 'offline' event from interop");
                    // network has disappeared, we're offline for sure
                    _this.networkOnline(false);
                    _this.serverOnline(false);
                    if (_this.saveMode() !== _interop_types_1.SaveMode.remoteOnly) {
                        _this.saveTarget(_interop_types_1.SaveTarget.local);
                    }
                });
                interop.bind("online", function () {
                    _this.traceSource.debug("DataFacade gets 'online' event from interop");
                    // network has appeared,
                    // it means only that network is available, server MAY be still offline, but we care about this only in 'smart' mode
                    _this.networkOnline(true);
                    if (!_this.manuallyDisconnected() && _this.saveMode() === _interop_types_1.SaveMode.smart) {
                        // NOTE: after network restored we need to restore online/serverOnline statuses
                        _this.checkConnection().then(function () {
                            _this._scheduleSyncIfNeeded();
                        });
                    }
                });
            }
            if (interop.checkAppCache) {
                interop.checkAppCache(function (result) {
                    if (result === "updateready") {
                        _this._onServerVersionChanged();
                    }
                    if (result !== "uncached") {
                        var isObsolete_1 = (result === "obsolete");
                        _this.checkConnection().then(function (result) {
                            if (isObsolete_1 && !result.serverOnline) {
                                _this._publishEvent("interop.appcache_obsolete_warning", core.SystemEvent.create({
                                    kind: core.SystemEvent.Kind.notification,
                                    priority: "high",
                                    message: resources["interop.appcache_obsolete_warning"],
                                    severity: "warning"
                                }));
                            }
                        });
                    }
                });
            }
            _this.bind("change:manuallyDisconnected", function (sender, v) {
                if (!v) {
                    // NOTE: after manuallyDisconnected changed from true to false we need to restore online/serverOnline statuses
                    _this.checkConnection().then(function () {
                        _this._scheduleSyncIfNeeded();
                    });
                }
                else {
                    if (_this.saveMode() !== _interop_types_1.SaveMode.remoteOnly) {
                        _this.saveTarget(_interop_types_1.SaveTarget.local);
                    }
                    _this._synchronizr.cancel();
                }
                core.settings.setItem("DataFacade.manuallyDisconnected", v);
            });
            _this.bind("change:saveMode", function () {
                _this._updateSaveTarget();
            });
            return _this;
        }
        DataFacadeSmart.prototype.setEventPublisher = function (eventPublisher) {
            var _this = this;
            _super.prototype.setEventPublisher.call(this, eventPublisher);
            eventPublisher.subscribe("interop.sync.retry", function (ev) {
                _this._onSyncRetry(ev.args);
            });
            eventPublisher.subscribe("interop.sync.cancel", function (ev) {
                _this._onSyncCancel(ev.args);
            });
        };
        DataFacadeSmart.prototype._initDataStore = function (dataStore) {
            var that = this;
            that._onStoreRawError = lang.debounce(that._onStoreRawError, 100);
            if (lang.isPromise(dataStore)) {
                dataStore.then(function (dataStore) {
                    that._initDataStore2(dataStore);
                    that._updateSaveTarget(/*doSchedule=*/ true);
                });
            }
            else {
                that._initDataStore2(dataStore);
            }
        };
        DataFacadeSmart.prototype._initDataStore2 = function (dataStore) {
            var that = this;
            that._store = dataStore;
            that._store.bind("error", that._onStoreRawError, that);
            that._synchronizr = that._createDataSynchronizer(dataStore);
            dataStore.test();
        };
        DataFacadeSmart.prototype._createDataSynchronizer = function (dataStore) {
            var that = this;
            var synchronizer = new that.options.DataSynchronizer(dataStore, {
                save: that._interop.save.bind(that._interop),
                ping: that.checkConnection.bind(that)
            });
            synchronizer.bind("sync.success", that._onStoreSynced, that);
            synchronizer.bind("sync.error", that._onStoreSyncError, that);
            synchronizer.bind("change:state", function (sender, value) {
                that.isSynchronizing(value === DataSynchronizer.State.Synchronizing);
            });
            return synchronizer;
        };
        DataFacadeSmart.prototype._getDefaultLoadRule = function () {
            var rule = this.options.loadRule;
            if (!rule) {
                switch (this.saveMode()) {
                    case _interop_types_1.SaveMode.smart:
                        rule = _interop_types_1.LoadRule.localIfOffline;
                        break;
                    case _interop_types_1.SaveMode.remoteOnly:
                        rule = _interop_types_1.LoadRule.remoteFirst;
                        break;
                    default:
                        rule = _interop_types_1.LoadRule.cached;
                        break;
                }
            }
            return rule;
        };
        DataFacadeSmart.prototype._createCacheManager = function () {
            var that = this;
            return that.options.cacheManager ||
                new that.options.CacheManager({ defaultRule: that._getDefaultLoadRule() });
        };
        DataFacadeSmart.prototype._updateSaveTarget = function (doSchedule) {
            var that = this;
            switch (that.saveMode()) {
                case _interop_types_1.SaveMode.smart:
                    if (!that.manuallyDisconnected() && that.serverOnline()) {
                        if (!that._store) {
                            // Initial initialization while DataStore isn't ready yet
                            that.saveTarget(_interop_types_1.SaveTarget.remoteFirst);
                            break;
                        }
                        lang.when(that._store.hasChanges())
                            .done(function (hasChanges) {
                            // TODO: может здесь вызвать checkConnection если serverOnline=false ?
                            that.saveTarget(hasChanges ? _interop_types_1.SaveTarget.local : _interop_types_1.SaveTarget.remoteFirst);
                            if (doSchedule && hasChanges) {
                                that._scheduleSyncIfNeeded();
                            }
                        })
                            .fail(function () {
                            that.saveTarget(_interop_types_1.SaveTarget.remoteFirst);
                        });
                    }
                    else {
                        that.saveTarget(_interop_types_1.SaveTarget.local);
                    }
                    break;
                case _interop_types_1.SaveMode.offline:
                    that.saveTarget(_interop_types_1.SaveTarget.local);
                    if (doSchedule) {
                        that._scheduleSyncIfNeeded();
                    }
                    break;
                case _interop_types_1.SaveMode.remoteOnly:
                    that.saveTarget(_interop_types_1.SaveTarget.remoteOnly);
                    break;
            }
        };
        DataFacadeSmart.prototype.dispose = function () {
            this._store.unbind("error", null, this);
            this._synchronizr.cancel();
        };
        DataFacadeSmart.prototype.ajax = function (ajaxSettings, options) {
            // TODO: ajax resposes caching: if (options.cachable) {}
            if (this.manuallyDisconnected()) {
                var error = new Error(resources["interop.server_unavailable"]);
                error.serverOffline = true;
                this._handleInteropError("ajax", error, options);
                return lang.rejected(error);
            }
            return _super.prototype.ajax.call(this, ajaxSettings, options);
        };
        DataFacadeSmart.prototype._onAjaxSuccess = function (settings, options) {
            this.serverOnline(true);
        };
        DataFacadeSmart.prototype._onAjaxFail = function (error, settings, options) {
            _super.prototype._onAjaxFail.call(this, error, settings, options);
            if (error.serverOffline) {
                this.serverOnline(false);
            }
        };
        DataFacadeSmart.prototype._normalizeResponse = function (response) {
            response = response || {};
            response.hints = response.hints || {};
            return response;
        };
        DataFacadeSmart.prototype._addResponseHint = function (response, fieldName, fieldValue) {
            response = this._normalizeResponse(response);
            response.hints[fieldName] = fieldValue;
            return response;
        };
        DataFacadeSmart.prototype._localResponse = function (response, policies) {
            response = this._normalizeResponse(response);
            response.hints.source = "client";
            if (policies.onlinePolicy && policies.onlinePolicy.loadFirst !== policies.policy.loadFirst) {
                response.hints.message = resources["interop.hint.returned_local_data_due_to_server_offline"];
            }
            return response;
        };
        DataFacadeSmart.prototype._serverResponse = function (response) {
            response = this._normalizeResponse(response);
            response.hints.source = "server";
            return response;
        };
        DataFacadeSmart.prototype._serverErrorResponse = function (response, error) {
            response = this._normalizeResponse(response);
            lang.extend(response.hints, {
                message: resources["interop.hint.returned_local_data_due_to_server_error"],
                source: "client",
                error: error
            });
            return response;
        };
        /**
         * Load data.
         * @param {Object} query query JSON-object
         * @param {Object|String} query.source name of source or JSON-object to load from
         * @param {String} query.source.type entityType when loading objects
         * @param {String} [query.source.id] objectId when loading a single object
         * @param {String} [query.source.propName] name of navigation property
         * @param {String} [query.type] entityType name of loading objects
         * @param {String} [query.preloads] array of property names or property chains
         * @param {Object} [query.params] query parameters
         * @param {Object} options
         * @param {String} [options.opId] cancellation operation id
         * @param {String|Object} [options.policy] explicit policy (if specified it will override CacheManager's rule)
         * @returns {*}
         */
        DataFacadeSmart.prototype.load = function (query, options) {
            var that = this;
            options = options || {};
            query = that._normalizeQuery(query);
            var policies = that._getLoadPolicy(query, options);
            var policy = options.policy = policies.policy;
            var defer = lang.Deferred();
            if (policy.loadFirst === "remote") {
                that.loadRemotely(query, options)
                    .done(function (response) {
                    defer.resolve(that._serverResponse(response));
                })
                    .fail(function (error) {
                    if (that._isUnrecoverableError(error)) {
                        // Bad Data: the request illegal and should not be repeated!
                        defer.reject(error);
                    }
                    else {
                        if (that.serverOnline()) {
                            // Remote load failed but serverOnline=true, we should update it.
                            // But we cannot be sure about what kind of error we got from loadRemotely
                            // It could mean something different than server inaccessibility error
                            if (that._isServerInaccessibilityError(error)) {
                                that.serverOnline(false);
                                that._schedulePing();
                            }
                        }
                        if (policy.allowLocal) {
                            // TODO: здесь нюанс - мы получили какую-то ошибку и скрываем ее, если данные найдутся локально
                            // Это может быть не то, что мы хотели, возвращая ошибку с сервера.
                            that.loadLocally(query, options)
                                .done(function (response) {
                                if (!response || !response.found) {
                                    defer.reject(error);
                                }
                                else if (response) {
                                    // found something locally, we have to ignore maxAge as server load failed anyway
                                    defer.resolve(that._serverErrorResponse(response, error));
                                    // as we're going to return cached data and an error occurred, let's show a warning to user
                                    that._handleInteropError("load", error, options);
                                }
                            })
                                .fail(function (error) {
                                // it isn't a normal situation
                                defer.reject(error);
                            });
                        }
                        else {
                            defer.reject(error);
                        }
                    }
                });
            }
            else {
                that.loadLocally(query, options)
                    .done(function (response) {
                    var maxAge = lang.coalesce(policy.maxAge, policies.onlinePolicy && policies.onlinePolicy.maxAge);
                    if (!response || !response.found) {
                        if (policy.allowRemote && that.serverOnline()) {
                            that.loadRemotely(query, options)
                                .done(function (response) {
                                defer.resolve(that._serverResponse(response));
                            })
                                .fail(function (error) {
                                if (that._isServerInaccessibilityError(error)) {
                                    that.serverOnline(false);
                                    that._schedulePing();
                                }
                                defer.reject(error);
                            });
                        }
                        else {
                            // NOTE: actually we're returning empty result ({found:false})
                            defer.resolve(that._localResponse(response, policies));
                        }
                        if (!that.serverOnline()) {
                            that._schedulePing();
                        }
                    }
                    else if (lang.isNumber(maxAge) || response.found === "unsync") {
                        // NOTE: response.found can be true, false or "unsync". Last value means that the cached
                        // result was not found, but the response contains unsynchronized objects only.
                        // found locally but we should check cache age
                        if (lang.isNumber(response.age) && response.age <= maxAge) {
                            // TODO: проверить, что полученные объкты содержат все свойства, загружаемые по умолчанию (скалярные без lazyLoad)
                            defer.resolve(that._localResponse(response, policies));
                        }
                        else {
                            // local data is outdated (or contains only unsynchronized objects), we should load remotely
                            // BUT if we're offline or an error occurred, then the data will be used anyway
                            if (policy.allowRemote && that.serverOnline()) {
                                that.loadRemotely(query, options)
                                    .done(function (response) {
                                    defer.resolve(that._serverResponse(response));
                                })
                                    .fail(function (error) {
                                    if (that._isUnrecoverableError(error)) {
                                        defer.reject(error);
                                    }
                                    else {
                                        if (that._isServerInaccessibilityError(error)) {
                                            that.serverOnline(false);
                                            that._schedulePing();
                                        }
                                        // as we're going to return cached data and an error occurred, let's show warning to user
                                        that._handleInteropError("load", error, options);
                                        defer.resolve(that._serverErrorResponse(response, error));
                                    }
                                });
                            }
                            else {
                                that._schedulePing();
                                response = that._localResponse(response, policies);
                                response.hints.message = resources["interop.hint.returned_local_data_due_to_server_offline"];
                                defer.resolve(response);
                            }
                        }
                    }
                    else {
                        // i.e. response.found=true
                        // TODO: проверить, что полученные объкты содержат все свойства, загружаемые по умолчанию (скалярные без lazyLoad)
                        if (!that.serverOnline()) {
                            that._schedulePing();
                        }
                        defer.resolve(that._localResponse(response, policies));
                    }
                })
                    .fail(function (error) {
                    // it isn't a normal situation
                    if (policy.allowRemote && that.serverOnline()) {
                        that.loadRemotely(query, options)
                            .done(function (response) {
                            defer.resolve(that._serverResponse(response));
                        })
                            .fail(function (error) {
                            if (that._isServerInaccessibilityError(error)) {
                                that.serverOnline(false);
                                that._schedulePing();
                            }
                            defer.reject(error);
                        });
                    }
                    else {
                        defer.reject(error);
                    }
                    if (!that.serverOnline()) {
                        that._schedulePing();
                    }
                });
            }
            defer.fail(function (error) {
                that._handleInteropError("load", error, options);
            });
            return defer.promise();
        };
        /**
         * Calculates load policy
         * @param query
         * @param options
         * @returns {{policy: Object, onlinePolicy: Object}}
         * @private
         */
        DataFacadeSmart.prototype._getLoadPolicy = function (query, options) {
            var that = this;
            var onlinePolicy;
            var policy = options.policy || that._cacheManager.getLoadPolicy(query, options);
            if (!policy || !policy.loadFirst) {
                // 'policy' is not a full policy (LoadPolicy), it's a rule (LoadRule/LoadPolicyRule).
                //	It can be a rule name or an object with a rule name:
                var rule = void 0;
                if (lang.isString(policy)) {
                    rule = _interop_types_1.LoadRule[policy];
                }
                else {
                    rule = _interop_types_1.LoadRule[policy.rule];
                }
                // normalize rule name to enum:
                if (!rule) {
                    // probably we encountered an incorrect CacheManager implementation:
                    // it didn't return nor a policy nor a rule.
                    rule = that._getDefaultLoadRule();
                }
                // Now 'rule' is a value of LoadRule
                // TODO: remove AlwaysRemote/AlwaysLocal in 0.11 version
                if (rule === _interop_types_1.LoadRule.remoteFirst) {
                    policy = {
                        loadFirst: "remote",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: false
                    };
                }
                else if (rule === _interop_types_1.LoadRule.localFirst) {
                    policy = {
                        loadFirst: "local",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: true
                    };
                }
                else if (rule === _interop_types_1.LoadRule.localIfOffline) {
                    policy = {
                        loadFirst: that.serverOnline() ? "remote" : "local",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: true
                    };
                    onlinePolicy = {
                        loadFirst: "remote",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: true
                    };
                }
                else if (rule === _interop_types_1.LoadRule.cached) {
                    policy = {
                        loadFirst: "local",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: true,
                        maxAge: policy.maxAge
                    };
                }
                else if (rule === _interop_types_1.LoadRule.remoteOnly) {
                    policy = {
                        loadFirst: "remote",
                        allowRemote: true,
                        allowLocal: false,
                        shouldCache: false
                    };
                }
                else if (rule === _interop_types_1.LoadRule.localOnly) {
                    policy = {
                        loadFirst: "local",
                        allowRemote: false,
                        allowLocal: true,
                        shouldCache: false
                    };
                }
            }
            if (that.manuallyDisconnected()) {
                onlinePolicy = onlinePolicy || policy;
                policy = {
                    loadFirst: "local",
                    allowRemote: false,
                    allowLocal: true,
                    shouldCache: false
                };
            }
            return {
                policy: policy,
                onlinePolicy: onlinePolicy
            };
        };
        DataFacadeSmart.prototype.loadRemotely = function (query, options) {
            var that = this, response, objects, policy = (options && options.policy);
            // NOTE: maybe we should pass options to backendInterop.load?
            return that._load(query, options)
                .then(function (r) {
                response = r;
                that.serverOnline(true);
                // don't cache anything from custom route
                if (query.route) {
                    return true;
                }
                // cache data in the store
                objects = that._objectsFromResponse(response, query);
                return lang.when(policy.allowLocal && objects && objects.length &&
                    that._store.cache(objects, { actualize: true, skipMissing: !policy.shouldCache }))
                    .then(function () {
                    if (policy.shouldCache) {
                        return that._store.cacheQuery(query, response);
                    }
                })
                    .then(function () {
                    return true;
                }, function () {
                    // NOTE: ignore any errors while caching
                    return lang.resolved();
                });
            })
                .then(function () {
                // уведомляем об обновлении данных
                if (objects && objects.length) {
                    that._triggerUpdate(objects, options, "load");
                }
                return response;
            });
        };
        DataFacadeSmart.prototype.loadLocally = function (query, options) {
            options = options || {};
            var that = this, forceLoadUnsync = lang.coalesce(options.forceLoadUnsync, that.options.forceLoadUnsync), deferredQuery = that._store.query(query), deferredSelect;
            if (!forceLoadUnsync || !query.type || query.source.id || query.source.propName) {
                return deferredQuery;
            }
            deferredSelect = that._store.select({
                type: query.type,
                hasChanges: true,
                isRemoved: false // not removed objects
            });
            return lang.when(deferredQuery, deferredSelect)
                .then(function (response, changed) {
                if (changed && changed.length) {
                    // found non-synchronized objects
                    changed.forEach(function (obj) {
                        // NOTE: hasUnsyncChanges is used in DomainObject.fromJson overridden module-security
                        obj.__metadata.hasUnsyncChanges = true;
                    });
                    if (response.found) {
                        if (lang.isArray(response.result)) {
                            // add non-synchronized to response
                            // TODO: use DomainObjectMap. But we need domain model for this.
                            var ids_1 = {};
                            response.result.forEach(function (obj) {
                                ids_1[obj.id] = obj;
                            });
                            changed.forEach(function (obj) {
                                var found = ids_1[obj.id];
                                if (found) {
                                    // NOTE: hasUnsyncChanges is used in DomainObject.fromJson overridden module-security
                                    found.__metadata.hasUnsyncChanges = true;
                                }
                                else {
                                    response.result.push(obj);
                                }
                            });
                        }
                        else {
                            // response found in cache but it's empty
                            response.result = changed;
                        }
                    }
                    else {
                        // return only non-synchonized objects
                        response = {
                            found: "unsync",
                            result: changed
                        };
                    }
                }
                return response;
            });
        };
        /**
         * Run server connection checking.
         * @param {Object} options
         * @param {Boolean} [options.suppressSaveTargetUpdate=false]
         * @returns {Promise} Promise will be revolved (never rejected) into object {networkOnline: boolean, serverOnline: boolean, notificationPublished: boolean}
         */
        DataFacadeSmart.prototype.checkConnection = function (options) {
            var that = this;
            if (!that._interop.checkConnection) {
                that.networkOnline(true);
                that.serverOnline(true);
                if (that.saveMode() !== _interop_types_1.SaveMode.remoteOnly) {
                    that.saveTarget(_interop_types_1.SaveTarget.local);
                }
                return lang.resolved({ networkOnline: true, serverOnline: true });
            }
            // threshold
            if (that._lastCheckCon && Date.now() - that._lastCheckCon < that.options.checkConnectionTimeout) {
                return lang.resolved({
                    networkOnline: that.networkOnline(),
                    serverOnline: that.serverOnline()
                });
            }
            // NOTE:
            return that._interop.checkConnection("POST")
                .then(function (result) {
                that._lastCheckCon = Date.now();
                if (that.traceSource.enabled("debug")) {
                    that.traceSource.debug(function () { return "checkConnection: " + JSON.stringify(result); });
                }
                var networkOnline = result.networkOnline, serverOnline = result.serverOnline;
                if (serverOnline && !networkOnline) {
                    that.traceSource.warn("BackendIntreop.checkConnection returns inconsistent values: serverOnline is true, but networkOnline is false");
                    networkOnline = true;
                }
                if (that.serverOnline() && !serverOnline) {
                    result.notificationPublished = true;
                    that._publishEvent("interop.offline", core.SystemEvent.create({
                        kind: core.SystemEvent.Kind.notification,
                        priority: "normal",
                        message: resources["interop.offline"]
                    }));
                }
                else if (that.serverOnline() === false && serverOnline) {
                    result.notificationPublished = true;
                    that._publishEvent("interop.online", core.SystemEvent.create({
                        kind: core.SystemEvent.Kind.notification,
                        priority: "normal",
                        message: resources["interop.online"]
                    }));
                }
                that.networkOnline(networkOnline);
                that.serverOnline(serverOnline);
                if (!options || !options.suppressSaveTargetUpdate) {
                    // now update 'saveTarget' property, it depends on current saveMode
                    if (that.saveMode() === _interop_types_1.SaveMode.smart) {
                        var curMode = that.saveTarget();
                        if (curMode === undefined) {
                            // NOTE: we're here from constructor, checkConnection/updateSaveTarget are called concurrently
                            that.saveTarget(serverOnline ? _interop_types_1.SaveTarget.remoteFirst : _interop_types_1.SaveTarget.local);
                        }
                        else if (!serverOnline) {
                            that.saveTarget(_interop_types_1.SaveTarget.local);
                        }
                        else if (curMode === _interop_types_1.SaveTarget.local && serverOnline) {
                            // In smart mode if there's no changes we should change saveTarget to "remoteFirst"
                            that._updateSaveTarget();
                        }
                    }
                }
                return result;
            });
        };
        DataFacadeSmart.prototype._schedulePing = function () {
            var that = this;
            if (that.manuallyDisconnected()) {
                return;
            }
            if (!that.networkOnline() && that._supportNetworkRealtimeEvents) {
                return;
            }
            // schedule ping if and only if DataSynchronizer isn't synchronizing any changes
            if (!that._synchronizr.isScheduledOrSynchronizing()) {
                that._synchronizr.schedulePing();
                that.traceSource.debug("DataFacade scheduled ping");
            }
        };
        /**
         * Save objects.
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} options Options
         * @param {Object} options.policy
         * @param {String} options.policy.target Where to save, see `DataFacadeSmart.saveTargets`
         * @param {Boolean} options.policy.shouldCache Whether to cache saved object locally or not
         * @param {String|Array} [options.hints] hints for save operation (passed to the server)
         * @param {Boolean} options.suppressAutoLogin
         * @param {Boolean} [options.suppressEventOnError=false] Suppress event publishing on an error
         * @param {Boolean} [options.suppressEventOnSuccess=false] Suppress event publishing on success
         * @param {Boolean} [options.suppressProcessEvent=false] Suppress progress event publishing
         * @return {Promise} object for async operation of saving
         */
        DataFacadeSmart.prototype.save = function (objects, options) {
            var defer = lang.Deferred();
            options = options || {};
            if (options.policy && options.policy.target) {
                if (!_interop_types_1.SaveTarget[options.policy.target]) {
                    // some illegal value was supplied, ignore it
                    options.policy.target = this.saveTarget();
                }
            }
            else {
                options.policy = lang.extend({}, options.policy, { target: this.saveTarget() });
            }
            if (options.policy.target === _interop_types_1.SaveTarget.local) {
                this._saveLocally(objects, options, defer);
            }
            else {
                this._saveRemotely(objects, options, defer);
            }
            return defer.promise();
        };
        /**
         * Save objects into local store.
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} options options for interop
         * @param {Boolean} options.suppressAutoLogin
         * @param {Boolean} options.suppressEventOnSuccess
         * @param {Boolean} options.suppressEventOnError
         * @param {jQuery.Deferred} defer
         */
        DataFacadeSmart.prototype._saveLocally = function (objects, options, defer) {
            var that = this;
            that.saveTarget(_interop_types_1.SaveTarget.local);
            that._store.save(objects, options)
                .done(function () {
                that._onLocalSaveDone(objects, options);
                defer.resolve(objects);
                that._scheduleSyncIfNeeded();
            })
                .fail(function (error) {
                defer.reject(error);
            });
        };
        DataFacadeSmart.prototype._scheduleSyncIfNeeded = function () {
            var that = this;
            if (that.manuallyDisconnected()) {
                return;
            }
            if (!that.networkOnline() && that._supportNetworkRealtimeEvents) {
                return;
            }
            // NOTE: if server isn't accessible we should NOT eat network bandwidth by sending all changes each time,
            // instead we'll continue to "ping" server
            var res = that._synchronizr.scheduleSync(/*pingOnly=*/ !that.serverOnline());
            that.traceSource.debug("DataFacade scheduled synchronization, serverOnline=" + that.serverOnline());
            return res;
        };
        /**
         * Continuation on successful save into local store.
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} options options for interop
         * @param {Boolean} options.suppressAutoLogin
         * @param {Boolean} options.suppressEventOnSuccess
         * @param {Boolean} options.suppressEventOnError
         */
        DataFacadeSmart.prototype._onLocalSaveDone = function (objects, options) {
            var that = this;
            // update ts in objects
            that._updateSaved(objects);
            // notify all about data change
            that._triggerUpdate(objects, options);
            if (!options || !options.suppressEventOnSuccess) {
                that._publishEvent("interop.save.success.local", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "low",
                    severity: "success",
                    message: resources["interop.save.success.local"]
                }));
            }
        };
        DataFacadeSmart.prototype._saveRemotely = function (objects, options, deferred) {
            var that = this;
            var promise = that._interop.save(objects, options)
                .done(function (response) {
                that._onRemoteSaveDone(objects, options, response);
                deferred.resolve(objects);
            })
                .fail(function (error) {
                if (that._isUnrecoverableError(error) || options.policy.target === _interop_types_1.SaveTarget.remoteOnly) {
                    that._onRemoteSaveError(objects, error, options, deferred);
                }
                else {
                    // the error can be a result of server inaccessibility
                    that.checkConnection({ suppressSaveTargetUpdate: true })
                        .done(function (result) {
                        if (result.serverOnline) {
                            // TODO: here we can check for error details to go offline automatically
                            // or we can prompt user to decide whether go offline or not.
                            that._onRemoteSaveError(objects, error, options, deferred);
                        }
                        else {
                            that._saveLocally(objects, options, deferred);
                        }
                    });
                }
            });
            if (!options.suppressProcessEvent) {
                that._publishEvent("interop.save", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.process,
                    priority: "normal",
                    message: resources.saving,
                    promise: promise
                }));
            }
        };
        /**
         * Continuation on successful save to the server.
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} options options for interop
         * @param {Boolean} options.suppressAutoLogin
         * @param {Boolean} options.suppressEventOnSuccess
         * @param {Boolean} options.suppressEventOnError
         * @param {Object} response server response
         * @param {Object} response.error
         * @param {Array} response.ids array of objects identities which saving was failed
         * @param {Object} response.newIdentityMap TODO
         * @param {Array} response.originalObjects
         * @param {Array} response.updatedObjects
         */
        DataFacadeSmart.prototype._onRemoteSaveDone = function (objects, options, response) {
            var that = this;
            that.networkOnline(true);
            that.serverOnline(true);
            // update ts in objects
            that._updateSaved(objects, response);
            that._store.commit(objects).done(function () {
                // NOTE: _updateFromNewValues must be executed after store.commit(), because
                // old values are used in DataStore.
                that._updateFromNewValues(objects);
                // TODO: почему мы здесь не передаем caller в опциях как в "connected" DataFacade?
                that._triggerUpdate(objects, options);
                if (!options.suppressEventOnSuccess) {
                    that._publishEvent("interop.save.success", that.createSaveSuccessEvent(response));
                }
            });
        };
        /**
         * Create a SystemEvent for save error.
         * @param {Object} error An error object got from BackendInterop.save
         * @param {Object} options Save options - the same as DataFacade.save
         * @param {Array<DomainObject>} objects Json objects were being saved
         * @returns {SystemEvent}
         */
        DataFacadeSmart.prototype.createSaveErrorEvent = function (error, options, objects) {
            // NOTE: base createSaveErrorEvent will call createInteropErrorEvent
            var evn = _super.prototype.createSaveErrorEvent.call(this, error, options, objects);
            if (this.saveTarget() === _interop_types_1.SaveTarget.remoteOnly) {
                evn.menu.removeItem("GoOffline");
            }
            else {
                if (this.options.allowGoOffline && !this.manuallyDisconnected()) {
                    // ensure event's menu has "GoOffline" item
                    this._addGoOfflineMenuItem(evn);
                }
            }
            return evn;
        };
        DataFacadeSmart.prototype.createInteropErrorEvent = function (action, error) {
            var that = this;
            var evn = _super.prototype.createInteropErrorEvent.call(this, action, error);
            // If the error is not a result of data/request itself (i.e. not "UnrecoverableError"),
            // then we'll add menu item "GoOffline"
            if (that.options.allowGoOffline && !that.manuallyDisconnected() && !that._isUnrecoverableError(error)) {
                that._addGoOfflineMenuItem(evn);
            }
            return evn;
        };
        DataFacadeSmart.prototype._addGoOfflineMenuItem = function (sysEvent) {
            var _this = this;
            var menu = {
                items: [{
                        name: "GoOffline",
                        title: resources["interop.go_offline"],
                        hint: resources["interop.go_offline_hint"],
                        icon: "offline",
                        command: core.createCommand({
                            execute: function () {
                                _this.manuallyDisconnected(true);
                                _this._publishEvent("interop.went_offline", core.SystemEvent.create({
                                    kind: core.SystemEvent.Kind.notification,
                                    priority: "normal",
                                    message: resources["interop.went_offline"]
                                }));
                            }
                        })
                    }]
            };
            if (sysEvent.menu) {
                sysEvent.menu.mergeWith(menu);
            }
            else {
                sysEvent.menu = Menu.create(menu);
            }
        };
        DataFacadeSmart.prototype._onStoreSynced = function (syncResult) {
            var that = this, changes = syncResult.changes, response = syncResult.response, hasChanges = !lang.isEmpty(changes), defer;
            that.networkOnline(true);
            that.serverOnline(true);
            if (hasChanges) {
                // update saved object from new values
                // NOTE: response can be SaveResponse or AggregateSaveResponse
                if (response && lang.isArray(response.results)) {
                    response.results.forEach(function (result, i) {
                        that._updateSaved(changes, result, /*repeated*/ i > 0);
                    });
                }
                else {
                    that._updateSaved(changes, response);
                }
                defer = that._store.commit(changes);
            }
            lang.async.done(defer, function () {
                if (that.saveMode() === _interop_types_1.SaveMode.smart) {
                    that._updateSaveTarget();
                }
                // raise 'update' event with updated values
                if (hasChanges) {
                    that._updateFromNewValues(changes);
                    that._triggerUpdate(changes);
                }
                if (!syncResult.suppressEvent) {
                    that._publishEvent("interop.sync.success", core.SystemEvent.create({
                        kind: core.SystemEvent.Kind.notification,
                        priority: "normal",
                        severity: "success",
                        message: resources["interop.sync.changes_synced"]
                    }));
                }
                that.traceSource.debug("Offline changes synchronized");
            });
        };
        DataFacadeSmart.prototype._onSyncRetry = function (syncResult) {
            if (syncResult.defer) {
                syncResult.defer.resolve();
            }
            this._scheduleSyncIfNeeded();
        };
        DataFacadeSmart.prototype._onSyncCancel = function (syncResult) {
            var that = this;
            if (syncResult.defer) {
                syncResult.defer.resolve();
            }
            var changes = [];
            syncResult.failures.forEach(function (failure) {
                changes = changes.concat(failure.objects);
            });
            that._store.rollback(changes).then(function (rollbacked) {
                var updated = [], tasks = [];
                lang.forEach(rollbacked, function (obj) {
                    if (!obj.__metadata.isRemoved) {
                        // reload object
                        var policy = {
                            loadFirst: "local",
                            allowRemote: true,
                            allowLocal: true,
                            shouldCache: true
                            // TODO: maxAge: loadPolicy.maxAge
                        };
                        // successful load will cause firing 'update' event
                        tasks.push(that.load({
                            source: { type: obj.__metadata.type, id: obj.id },
                            type: obj.__metadata.type
                        }, { policy: policy })
                            .then(function (response) {
                            if (response && response.age) {
                                // data loaded from local cache, therefore 'update' event didn't fire
                                // (as it only fires on remote load)
                                updated.push(response.result);
                            }
                        }));
                    }
                    else {
                        updated.push(obj);
                    }
                });
                if (tasks.length > 0) {
                    lang.whenAll(tasks).then(function () {
                        that._triggerUpdate(updated);
                    });
                }
                else if (updated.length > 0) {
                    that._triggerUpdate(updated);
                }
                // After we made store.rollback there should be no pending changes in store,
                // so in smart mode we should go online
                if (that.saveMode() === _interop_types_1.SaveMode.smart) {
                    that._updateSaveTarget();
                }
            });
        };
        /**
         * Handles 'sync.error' event from DataSynchronizer.
         * Important: the method should signal on syncResult.defer in ALL cases.
         * @param syncResult
         * @param {Array} syncResult.failures Array of errors (with at least one item), where error object is {objects:[], error:{}}
         * @param {jQuery.Deferred} syncResult.defer
         * @protected
         */
        DataFacadeSmart.prototype._onStoreSyncError = function (syncResult) {
            var that = this;
            that.traceSource.debug("An error occurred during offline changes synchronization.");
            var failures = syncResult.failures;
            var firstError;
            failures.forEach(function (failure) {
                if (failure.error && failure.error.$isException) {
                    failure.error = that.errorFromJson(failure.error);
                    if (!firstError) {
                        firstError = failure.error;
                    }
                }
            });
            that.isSyncErrorProcessing(true);
            if (syncResult.defer) {
                syncResult.defer.always(function () {
                    that.isSyncErrorProcessing(false);
                });
            }
            if (that._isUnrecoverableError(firstError)) {
                that._onStoreSyncUnrecoverableError(syncResult);
            }
            else if (that._isServerInaccessibilityError(firstError)) {
                that.serverOnline(false);
                if (syncResult.defer) {
                    syncResult.defer.resolve();
                }
                that._scheduleSyncIfNeeded();
            }
            else {
                that.checkConnection()
                    .then(function (result) {
                    if (!result.serverOnline || !result.networkOnline) {
                        if (syncResult.defer) {
                            syncResult.defer.resolve();
                        }
                        that._scheduleSyncIfNeeded();
                    }
                    else {
                        that._onStoreSyncUnrecoverableError(syncResult);
                    }
                });
            }
        };
        DataFacadeSmart.prototype._isUnrecoverableError = function (error) {
            return core.eth.isUnrecoverableError(error);
        };
        DataFacadeSmart.prototype._isServerInaccessibilityError = function (error) {
            if (error && error.serverOffline) {
                return true;
            }
            return !this.networkOnline() && this._supportNetworkRealtimeEvents;
        };
        /**
         * Handles unrecoverable synchronization errors.
         * @param syncResult SyncResult from DataSynchronizer
         * @param {Array} syncResult.failures Array of errors (with at least one item), where error object is {objects:[], error:{}}
         * @param {jQuery.Deferred} syncResult.defer
         * @protected
         */
        DataFacadeSmart.prototype._onStoreSyncUnrecoverableError = function (syncResult) {
            var event = this.createSyncErrorEvent(syncResult);
            this._publishEvent("interop.sync.error", event);
        };
        DataFacadeSmart.prototype.createSyncErrorEvent = function (syncResult) {
            var that = this, failures = syncResult.failures, firstError = failures[0].error, message = failures.length === 1 ?
                resources["interop.sync.error"] + (firstError.message ? ": " + firstError.message : "") : resources["interop.sync.error.many"] + firstError.message, menu = { items: [
                    {
                        name: "Retry",
                        title: resources["interop.sync.retry"],
                        command: core.createCommand({
                            execute: function () {
                                that._publishEvent("interop.sync.retry", syncResult);
                            }
                        })
                    }, {
                        name: "Cancel",
                        title: resources["interop.sync.cancel"],
                        command: core.createCommand({
                            execute: function () {
                                that._publishEvent("interop.sync.cancel", syncResult);
                            }
                        })
                    }
                ] };
            if (that.options.allowGoOffline && !that.manuallyDisconnected() /*&& !that._isUnrecoverableError(firstError)*/) {
                menu.items.push({
                    name: "GoOffline",
                    title: resources["interop.go_offline"],
                    icon: "offline",
                    command: core.createCommand({
                        execute: function () {
                            that.manuallyDisconnected(true);
                            if (syncResult.defer) {
                                syncResult.defer.resolve();
                            }
                            that._publishEvent("interop.went_offline", core.SystemEvent.create({
                                kind: core.SystemEvent.Kind.notification,
                                priority: "normal",
                                message: resources["interop.went_offline"]
                            }));
                        }
                    })
                });
            }
            return core.SystemEvent.create({
                kind: core.SystemEvent.Kind.actionRequest,
                data: syncResult,
                severity: firstError.hasUserDescription ? "warning" : "error",
                message: message,
                menu: menu
            });
        };
        /**
         * Handles 'error' event from DataStore.
         * @param {Error} error
         * @protected
         */
        DataFacadeSmart.prototype._onStoreRawError = function (error) {
            var that = this;
            that.traceSource.warn("store access error: " + error.message);
            that._publishEvent("interop.store.error.raw", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.actionRequest,
                severity: "error",
                error: error,
                uid: "store:" + (error.name || error.message),
                message: core.safeHtml(lang.encodeHtml(error.message) + "<br/>" + resources["interop.store.error.raw.html"], error.message),
                menu: {
                    hidden: true,
                    items: [{
                            name: "Recreate",
                            command: new core.commands.BoundCommand(that._recreateStore, that)
                        }
                    ]
                }
            }));
        };
        /**
         * Recreate DataStore with user prompt.
         * @protected
         */
        DataFacadeSmart.prototype._recreateStore = function () {
            var that = this;
            return ConfirmDialog.create({
                header: resources["interop.store.recreate.header"],
                text: resources["interop.store.recreate.prompt"]
            })
                .open().then(function (result) {
                if (result === "yes") {
                    return that._store.recreate().then(function () {
                        that._publishEvent("interop.store.error", core.SystemEvent.create({
                            kind: core.SystemEvent.Kind.notification,
                            priority: "normal",
                            severity: "success",
                            message: resources["interop.store.recreate.success"]
                        }));
                    });
                }
            });
        };
        DataFacadeSmart.defaultOptions = {
            saveMode: "smart",
            checkConnectionTimeout: 1000,
            forceLoadUnsync: false,
            allowGoOffline: true,
            supportNetworkRealtimeEvents: true,
            DataSynchronizer: DataSynchronizer,
            CacheManager: CacheManager,
            cacheManager: undefined,
            loadRule: undefined
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], DataFacadeSmart.prototype, "saveMode");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], DataFacadeSmart.prototype, "networkOnline");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], DataFacadeSmart.prototype, "serverOnline");
        __decorate([
            lang.decorators.observableAccessor()
        ], DataFacadeSmart.prototype, "saveTarget");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], DataFacadeSmart.prototype, "manuallyDisconnected");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], DataFacadeSmart.prototype, "isSynchronizing");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], DataFacadeSmart.prototype, "isSyncErrorProcessing");
        return DataFacadeSmart;
    }(DataFacadeBase));
    // backward compatibility
    DataFacadeSmart.mixin({
        saveModes: _interop_types_1.SaveMode,
        saveTargets: _interop_types_1.SaveTarget
    });
    core.interop = core.interop || {};
    core.interop.DataFacadeSmart = DataFacadeSmart;
    return DataFacadeSmart;
});
//# sourceMappingURL=DataFacadeSmart.js.map