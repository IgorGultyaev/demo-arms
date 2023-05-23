/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/core.diagnostics"], function (require, exports, lang, diagnostics) {
    "use strict";
    var traceSource = new diagnostics.TraceSource("interop.DataSynchronizer");
    var DataSynchronizer = /** @class */ (function (_super) {
        __extends(DataSynchronizer, _super);
        /**
         * @constructs DataSynchronizer
         * @extends Observable
         * @param {DataStoreBase} dataStore
         * @param {{save:Function, ping: Function}} options
         */
        function DataSynchronizer(dataStore, options) {
            var _this = this;
            if (!dataStore)
                throw new Error("DataSynchronizer.ctor: dataStore should be specified");
            if (!options || !options.save || !options.ping)
                throw new Error("DataSynchronizer.ctor: interop with 'ping' and 'save' actions should be specified");
            _this = _super.call(this) || this;
            _this._store = dataStore;
            _this.state(DataSynchronizer.State.Idle);
            _this._scheduled = undefined;
            _this.maxInterval = DataSynchronizer.defaultOptions.maxInterval;
            _this.defaultInterval = DataSynchronizer.defaultOptions.defaultInterval;
            _this._clearStats();
            _this._saveAction = options.save;
            _this._pingAction = options.ping;
            _this._pingFn = _this._ping.bind(_this);
            _this._pingOnlyFn = _this._pingOnly.bind(_this);
            _this._syncFn = _this._sync.bind(_this);
            return _this;
        }
        DataSynchronizer.prototype.isSynchronizing = function () {
            return this.state() === DataSynchronizer.State.Synchronizing;
        };
        DataSynchronizer.prototype.isScheduledOrSynchronizing = function () {
            return this._scheduled !== undefined || this.state() === DataSynchronizer.State.Synchronizing;
        };
        DataSynchronizer.prototype._clearStats = function () {
            var that = this;
            that._attempts = 0;
            that._interval = that.defaultInterval;
            that._intervalStep = that.defaultInterval;
        };
        DataSynchronizer.prototype.setIdle = function () {
            var that = this;
            /*isSynchronizing = that.isSynchronizing() && that._scheduled;*/
            that.state(DataSynchronizer.State.Idle);
            /*if (isSynchronizing) {
             that._scheduled = false;
             that.scheduleSync(false);
             }*/
            if (that._pendingSync) {
                that._pendingSync = false;
                that.scheduleSync(false);
            }
        };
        /**
         * Schedules synchronization.
         * @param {Boolean} pingOnly if true then first call will be 'ping' and only if it succeeded then continue to save
         * @returns {boolean} true if a task was schedule otherwise false
         */
        DataSynchronizer.prototype.scheduleSync = function (pingOnly) {
            var that = this;
            // cancel cancellation
            that.cancellationRequested = false;
            if (that.isSynchronizing() || that._scheduled) {
                that._pendingSync = true;
                traceSource.debug("scheduleSync was ignored as it's already scheduled or synchronizing is in progress");
                return false;
            }
            if (that._attempts > 5) {
                if (that._interval <= that.maxInterval) {
                    that._interval = that._interval + that._intervalStep;
                }
            }
            traceSource.debug("scheduleSync scheduled, pingOnly=" + pingOnly + ", interval=" + that._interval);
            that._scheduled = window.setTimeout(pingOnly ? that._pingFn : that._syncFn, that._interval);
            return true;
        };
        DataSynchronizer.prototype._ping = function () {
            var that = this;
            that._scheduled = undefined;
            if (that._cancelIfRequested()) {
                return;
            }
            that.state(DataSynchronizer.State.Synchronizing);
            that._attempts++;
            that._pingAction()
                .done(function (result) {
                that.state(DataSynchronizer.State.Idle);
                if (that._cancelIfRequested()) {
                    return;
                }
                if (result.serverOnline) {
                    that._clearStats();
                    that._sync();
                }
                else {
                    that.scheduleSync(true);
                }
            });
        };
        DataSynchronizer.prototype._sync = function () {
            var that = this;
            that._scheduled = undefined;
            if (that.isSynchronizing()) {
                // scheduled timer fired, but previous synchronization hasn't finished yet.
                return;
            }
            that.state(DataSynchronizer.State.Synchronizing);
            that._store.getChanges().done(function (objects) {
                if (lang.isEmpty(objects)) {
                    that._clearStats();
                    that.setIdle();
                    that._onSyncSuccess(null, null, /*suppressEvent*/ true);
                    return;
                }
                that._attempts++;
                that._saveAction(objects, { sync: true })
                    .done(function (response) {
                    that._onSaveDone(objects, response, /*isSuccess*/ true);
                })
                    .fail(function (response) {
                    that._onSaveDone(objects, response, /*isSuccess*/ false);
                });
            });
        };
        DataSynchronizer.prototype._onSaveDone = function (objects, response, isSuccess) {
            var that = this, syncFailures = [];
            that._clearStats();
            if (response && response.error) {
                var syncResult = response;
                // single object/group failed
                if (syncResult.httpStatus) {
                    syncResult.error.httpStatus = syncResult.httpStatus;
                }
                syncFailures.push({
                    error: syncResult.error,
                    result: response,
                    objects: [].concat(objects)
                });
                objects = [];
            }
            else if (response && response.results) {
                // several groups were being save,
                // request may failed partially or completely, or succeeded (if there're no SaveResponse with error)
                var syncResult = response;
                lang.forEach(syncResult.results, function (result) {
                    if (!result.ids && response.results.length > 1) {
                        traceSource.warn("Incorrect server response: AggregateSaveResponse contains more than 1 group but a group has no ids field");
                    }
                    if (result.error) {
                        // a group saving failed with an error
                        var failure_1 = {
                            error: result.error,
                            result: result,
                            objects: objects
                        };
                        if (response.httpStatus) {
                            failure_1.error.httpStatus = response.httpStatus;
                        }
                        /*if (!result.ids && response.results.length === 1) {
                            failure.objects = [].concat(objects);
                            objects = [];
                        }*/
                        if (result.ids) {
                            failure_1.objects = [];
                            lang.forEach(result.ids, function (id) {
                                var obj = lang.find(objects, function (o) {
                                    return (o.id === id.id) && o.__metadata && o.__metadata.type === id.type;
                                });
                                if (obj) {
                                    failure_1.objects.push(obj);
                                    // remove from original objects those ones which failed to save
                                    lang.arrayRemove(objects, obj);
                                }
                            });
                        }
                        else if (response.results.length === 1) {
                            // the single group failed - all objects are source of the failure
                            failure_1.objects = [].concat(objects);
                            objects = [];
                        }
                        else {
                            // и что делать? групп >1, но в текущей нет ids
                        }
                        syncFailures.push(failure_1);
                    }
                });
            }
            else if (!isSuccess) {
                // request failed with an exception
                return that._onSyncError([{
                        objects: objects,
                        error: response.serverError || response,
                        result: response
                    }]);
            }
            // NOTE: now `objects` contains only successfully saved original objects
            if (syncFailures.length > 0) {
                // some failed..
                if (objects.length > 0) {
                    // and some succeeded, we should commit succeeded
                    that._onSyncSuccess(objects, response, /*suppressEvent=*/ true);
                }
                // ... and publish error for failed
                that._onSyncError(syncFailures);
            }
            else {
                // all succeeded
                that.setIdle();
                that._onSyncSuccess(objects, response);
            }
        };
        DataSynchronizer.prototype._onSyncSuccess = function (objects, response, suppressEvent) {
            this.trigger("sync.success", { changes: objects, response: response, suppressEvent: suppressEvent });
        };
        DataSynchronizer.prototype._onSyncError = function (failures) {
            var _this = this;
            var defer = lang.Deferred();
            defer.done(function () {
                _this.setIdle();
            });
            this.trigger("sync.error", { failures: failures, defer: defer });
        };
        /**
         * Cancel all activity (scheduled timers and synchronization in progress)
         */
        DataSynchronizer.prototype.cancel = function () {
            var that = this;
            traceSource.debug("cancellation requested");
            that.cancellationRequested = true;
            if (that._pingOnlyScheduled !== undefined) {
                window.clearTimeout(that._pingOnlyScheduled);
            }
            if (that._scheduled !== undefined) {
                window.clearTimeout(that._scheduled);
            }
        };
        DataSynchronizer.prototype._cancelIfRequested = function () {
            var that = this;
            if (that.cancellationRequested) {
                that.cancellationRequested = false;
                that.state(DataSynchronizer.State.Idle);
                that._clearStats();
                return true;
            }
            return false;
        };
        DataSynchronizer.prototype.schedulePing = function () {
            var that = this;
            // cancel cancellation
            that.cancellationRequested = false;
            // NOTE: here we have a separate flag for timer threshold - _pingOnlyScheduled, then in scheduleSync (_scheduled)
            if (that.isScheduledOrSynchronizing() || that._pingOnlyScheduled !== undefined) {
                traceSource.debug("schedulePing was ignored as it's already scheduled or synchronizing is in progress");
                return;
            }
            if (that._attempts > 5) {
                if (that._interval <= that.maxInterval) {
                    that._interval = that._interval + that._intervalStep;
                }
            }
            that._pingOnlyScheduled = window.setTimeout(that._pingOnlyFn, that._interval);
        };
        DataSynchronizer.prototype._pingOnly = function () {
            var that = this;
            // NOTE: we're not changing state to 'synchronizing' because we don't want to prevent synchronization
            that._pingOnlyScheduled = undefined;
            that._attempts++;
            that._pingAction()
                .done(function (result) {
                that.state(DataSynchronizer.State.Idle);
                if (result.serverOnline) {
                    that._clearStats();
                }
            });
        };
        DataSynchronizer.defaultOptions = {
            defaultInterval: 500,
            maxInterval: 10000
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], DataSynchronizer.prototype, "state");
        return DataSynchronizer;
    }(lang.Observable));
    // backward compatibility
    DataSynchronizer.mixin({
        states: DataSynchronizer.State
    });
    (function (DataSynchronizer) {
        DataSynchronizer.State = {
            Idle: "idle",
            Synchronizing: "synchronizing"
        };
    })(DataSynchronizer || (DataSynchronizer = {}));
    return DataSynchronizer;
});
//# sourceMappingURL=DataSynchronizer.js.map