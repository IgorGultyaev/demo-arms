/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils/datetimes", "i18n!lib/nls/resources", "i18n!modules/transfer/nls/resources", "lib/utils"], function (require, exports, core, datetimes, resources, resourcesModule, utils) {
    "use strict";
    exports.__esModule = true;
    // extend common resources
    core.lang.forEach(resourcesModule, function (value, key) {
        resources[key] = value;
    });
    var traceSource = new core.diagnostics.TraceSource("transfer");
    var TransferStatus;
    (function (TransferStatus) {
        TransferStatus[TransferStatus["None"] = 0] = "None";
        TransferStatus[TransferStatus["StartingUp"] = 1] = "StartingUp";
        TransferStatus[TransferStatus["Running"] = 2] = "Running";
        TransferStatus[TransferStatus["Aborting"] = 3] = "Aborting";
        TransferStatus[TransferStatus["Aborted"] = 4] = "Aborted";
        TransferStatus[TransferStatus["Failed"] = 5] = "Failed";
        TransferStatus[TransferStatus["Suspended"] = 6] = "Suspended";
        TransferStatus[TransferStatus["Completed"] = 7] = "Completed";
        TransferStatus[TransferStatus["StreamingData"] = 8] = "StreamingData";
    })(TransferStatus = exports.TransferStatus || (exports.TransferStatus = {}));
    var ImportSuspendedCause;
    (function (ImportSuspendedCause) {
        ImportSuspendedCause[ImportSuspendedCause["Unknown"] = 0] = "Unknown";
        ImportSuspendedCause[ImportSuspendedCause["UnresolvedObjects"] = 1] = "UnresolvedObjects";
        ImportSuspendedCause[ImportSuspendedCause["VersionConflict"] = 2] = "VersionConflict";
        ImportSuspendedCause[ImportSuspendedCause["ErrorOnProcessObject"] = 3] = "ErrorOnProcessObject";
    })(ImportSuspendedCause = exports.ImportSuspendedCause || (exports.ImportSuspendedCause = {}));
    var VersionConflictAction;
    (function (VersionConflictAction) {
        VersionConflictAction[VersionConflictAction["Abort"] = 0] = "Abort";
        VersionConflictAction[VersionConflictAction["Overwrite"] = 1] = "Overwrite";
        VersionConflictAction[VersionConflictAction["Skip"] = 2] = "Skip";
        VersionConflictAction[VersionConflictAction["OverwriteAll"] = 3] = "OverwriteAll";
        VersionConflictAction[VersionConflictAction["SkipAll"] = 4] = "SkipAll";
        VersionConflictAction[VersionConflictAction["OverwriteSameType"] = 5] = "OverwriteSameType";
        VersionConflictAction[VersionConflictAction["SkipSameType"] = 6] = "SkipSameType";
    })(VersionConflictAction = exports.VersionConflictAction || (exports.VersionConflictAction = {}));
    var UnresolvedObjectsAction;
    (function (UnresolvedObjectsAction) {
        UnresolvedObjectsAction[UnresolvedObjectsAction["Abort"] = 0] = "Abort";
        UnresolvedObjectsAction[UnresolvedObjectsAction["Skip"] = 1] = "Skip";
    })(UnresolvedObjectsAction = exports.UnresolvedObjectsAction || (exports.UnresolvedObjectsAction = {}));
    var ObjectProcessErrorAction;
    (function (ObjectProcessErrorAction) {
        ObjectProcessErrorAction[ObjectProcessErrorAction["Abort"] = 0] = "Abort";
        ObjectProcessErrorAction[ObjectProcessErrorAction["Retry"] = 1] = "Retry";
        ObjectProcessErrorAction[ObjectProcessErrorAction["Skip"] = 2] = "Skip";
        ObjectProcessErrorAction[ObjectProcessErrorAction["SkipAll"] = 3] = "SkipAll";
    })(ObjectProcessErrorAction = exports.ObjectProcessErrorAction || (exports.ObjectProcessErrorAction = {}));
    var TransferClientBase = /** @class */ (function (_super) {
        __extends(TransferClientBase, _super);
        function TransferClientBase(app) {
            var _this = _super.call(this) || this;
            var that = _this;
            var baseUrl = app.config.modules["transfer"].apiRoute;
            that.urls = {
                baseUrl: baseUrl,
                getstatus: baseUrl + "/getstatus",
                start: "",
                resume: baseUrl + "/resume",
                abort: baseUrl + "/abort"
            };
            that.eventPublisher = app.eventPublisher;
            that.dataFacade = app.dataFacade;
            that.pollingTimeout = 500;
            that.history = [];
            that._getStatusThis = that._getStatus.bind(that);
            that.status(TransferStatus.None);
            that.isInBackground(false);
            that.bind("change:status", function (sender, val) {
                that._updateTitle();
            });
            that.bind("change:isInBackground", function (sender, val) {
                if (val) {
                    // we're in the background
                    that._publishProcess();
                }
                else {
                    if (that._bgNotificationDeferred) {
                        // hide 'process'
                        that._bgNotificationDeferred.resolve();
                        that._bgNotificationDeferred = undefined;
                    }
                }
            });
            return _this;
        }
        TransferClientBase.prototype._publishProcess = function () {
            var that = this;
            if (that._bgNotificationDeferred) {
                that._bgNotificationDeferred.reject();
            }
            that._bgNotificationDeferred = core.lang.Deferred();
            // show 'process'
            that.eventPublisher.publish("transfer.running", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.process,
                priority: "high",
                // TODO: нужно observable expression для шаблона нотификации, чтобы ui обновлялся
                message: that.statusTitle(),
                promise: that._bgNotificationDeferred.promise(),
                menu: {
                    items: [{
                            name: "Open",
                            title: "Открыть",
                            command: Transfer.Instance.cmdActivateOp,
                            params: { client: that }
                        }]
                }
            }));
        };
        TransferClientBase.prototype._updateTitle = function () {
            var that = this, val = that.status(), title = "";
            switch (val) {
                case TransferStatus.StartingUp:
                    title = resources[that.eventPrefix + ".starting"];
                    break;
                case TransferStatus.Running:
                    title = resources[that.eventPrefix + ".running"];
                    break;
                case TransferStatus.Suspended:
                    title = resources[that.eventPrefix + ".suspended"];
                    break;
                case TransferStatus.Failed:
                    title = resources[that.eventPrefix + ".failed"];
                    break;
                case TransferStatus.Aborted:
                    title = resources[that.eventPrefix + ".aborted"];
                    break;
                case TransferStatus.Aborting:
                    title = resources[that.eventPrefix + ".aborting"];
                    break;
                case TransferStatus.Completed:
                    title = resources[that.eventPrefix + ".completed"];
                    break;
            }
            that.statusTitle(title);
        };
        TransferClientBase.prototype.connect = function (opId) {
            var that = this;
            if (!opId) {
                return;
            }
            if (that._disposed) {
                return;
            }
            if (that.status() !== TransferStatus.None) {
                throw new Error("TransferClient must be in 'TransferStatus.None' state");
            }
            // TODO: какой тут статус?
            return that._requestStatus(opId)
                .done(function (result) {
                // the operation with id=opId does exist
                that._onStarted(opId);
                that.onGetStatusSuccess(result);
            })
                .fail(function (error) {
                that.onInteropFail(error, resourcesModule[that.eventPrefix + ".connect.error"]);
            });
        };
        TransferClientBase.prototype._start = function (params) {
            var that = this;
            that.status(TransferStatus.StartingUp);
            return that.dataFacade.ajax({
                url: that.urls.start + "?" + utils.paramsToQueryString(params)
            }, { suppressEventOnError: true }).done(function (result) {
                that._onStarted(result.opId);
                // schedule polling
                that.scheduleGetStatus();
            }).fail(function (error) {
                that.onInteropFail(error, resourcesModule[that.eventPrefix + ".start.error"]);
            });
        };
        TransferClientBase.prototype._onStarted = function (opId) {
            var that = this;
            if (!opId) {
                return;
            }
            if (that._disposed) {
                return;
            }
            that.status(TransferStatus.Running);
            that.opId = opId;
            that.eventPublisher.publish("transfer.started", { client: that });
            window.setTimeout(function () {
                that.trigger(ExportClient.Events.started, that);
                if (that.isInBackground()) {
                    that._publishProcess();
                }
            }, 0);
        };
        TransferClientBase.prototype._requestStatus = function (opId, params) {
            var that = this, query = "?opId=" + opId;
            if (params) {
                query = query + "&" + utils.paramsToQueryString(params);
            }
            return that.dataFacade.ajax({ url: that.urls.getstatus + query }, { suppressEventOnError: true });
        };
        TransferClientBase.prototype._getStatus = function (all) {
            var that = this, params;
            if (that._disposed) {
                return;
            }
            if (that._timerPoll) {
                window.clearTimeout(that._timerPoll);
                that._timerPoll = undefined;
            }
            if (!all && that.nextSince) {
                params = { since: datetimes.toISOString(that.nextSince, false) };
            }
            return that._requestStatus(that.opId, params)
                .done(function (result) {
                that.onGetStatusSuccess(result, all);
            }).fail(function (error) {
                that.onInteropFail(error, resourcesModule["transfer.getstatus.error"]);
            });
        };
        TransferClientBase.prototype.fetchStatus = function (all) {
            return this._getStatus(all);
        };
        TransferClientBase.prototype.scheduleGetStatus = function () {
            var that = this;
            if (that._disposed) {
                return;
            }
            if (that._timerPoll) {
                window.clearTimeout(that._timerPoll);
            }
            that._timerPoll = window.setTimeout(that._getStatusThis, that.pollingTimeout);
        };
        TransferClientBase.prototype.onGetStatusSuccess = function (result, allHistory) {
            var that = this, status;
            if (that._disposed) {
                return;
            }
            if (!result || !result.lastState) {
                that.dispose();
                // todo: publish event
                return;
            }
            /*
            {
                "intermediateStates": [ {
                        "status": 1,
                        "timeStamp": "2015-06-18T20:05:02.098",
                        "progressPercent": 0,
                        "message": "",
                        "errorMessage": null,
                        "exportSuspendedResult": null,
                        "importSuspendedResult": null
                    }, {
                        "status": 2,
                        "timeStamp": "2015-06-18T20:05:02.110",
                        "progressPercent": 0,
                        "message": "Инициализация окружения",
                        "errorMessage": null,
                        "exportSuspendedResult": null,
                        "importSuspendedResult": null
                    },
                ],
                "lastState": {
                    "status": 2,
                    "timeStamp": "2015-06-18T20:05:02.210",
                    "progressPercent": 50,
                    "message": "Выполняется экспорт, начало выполнения шага User",
                    "errorMessage": null,
                    "exportSuspendedResult": null,
                    "importSuspendedResult": null
                },
                "collectingDateTime": "2015-06-18T20:05:02.627"
            }
            */
            if (allHistory) {
                that.history = [];
            }
            var newHistory = result.intermediateStates || [];
            if (that.history.length) {
                // lastState может дублировать последнее состояние, надо его отсечь
                var lastCurState = that.history[that.history.length - 1], lastNewState = result.lastState;
                if (lastCurState.status !== lastNewState.status ||
                    lastCurState.progressPercent !== lastNewState.progressPercent ||
                    lastCurState.timeStamp !== lastNewState.timeStamp) {
                    newHistory.push(result.lastState);
                }
            }
            else {
                newHistory.push(result.lastState);
            }
            that.history.push.apply(that.history, newHistory);
            if (newHistory.length) {
                that.trigger("historyUpdated", that, { history: newHistory });
            }
            status = result.lastState.status;
            if (status === TransferStatus.Completed ||
                status === TransferStatus.Aborted ||
                status === TransferStatus.Failed) {
                that.onFinished(result.lastState);
                that.dispose();
            }
            else if (status === TransferStatus.Suspended) {
                that.onSuspended(result);
            }
            else if (status === TransferStatus.Running) {
                that.nextSince = new Date();
                that.onRunning();
            }
            else if (status === TransferStatus.Aborting) {
                that.nextSince = new Date();
                that.onAborting();
            }
            else {
                that._onUnknownError("onGetStatusSuccess: Unknown status '" + result.lastState.status + "'. State: " + JSON.stringify(result));
            }
        };
        TransferClientBase.prototype.onInteropFail = function (error, msg) {
            if (this._disposed) {
                return;
            }
            // TODO: Если операция не существуте, в независимости что клиент думает, переходим в failed
            // TODO: Если ошибка вызвана interop/взаимодействием, то можно предложить повторить
            this.onFailed(error.message);
        };
        // TODO: what type of action?
        TransferClientBase.prototype.resume = function (action) {
            var that = this;
            if (that._disposed) {
                return;
            }
            if (that.status() !== TransferStatus.Suspended) {
                return;
            }
            var query = "?opId=" + that.opId + "&action=" + action;
            that.nextSince = new Date();
            that.dataFacade.ajax({
                url: that.urls.resume + query
            }, { suppressEventOnError: true }).done(function () {
                that.onRunning();
            }).fail(function (error) {
                that.onInteropFail(error, resourcesModule[that.eventPrefix + ".resume.error"]);
            });
        };
        TransferClientBase.prototype.abort = function () {
            var that = this;
            if (that._disposed) {
                return;
            }
            if (!that.opId) {
                that.dispose();
                return;
            }
            var query = "?opId=" + that.opId;
            return that.dataFacade.ajax({
                url: that.urls.abort + query
            }, { suppressEventOnError: true }).done(function () {
                that.onAborted();
            }).fail(function (error) {
                that.onInteropFail(error, resourcesModule[that.eventPrefix + ".abort.error"]);
            });
        };
        TransferClientBase.prototype.onRunning = function () {
            var that = this;
            if (that.status() !== TransferStatus.Running) {
                that.status(TransferStatus.Running);
                that.trigger("running", that);
            }
            // schedule next poll
            that.scheduleGetStatus();
        };
        TransferClientBase.prototype.onAborting = function () {
            var that = this;
            if (that.status() !== TransferStatus.Aborting) {
                that.status(TransferStatus.Aborting);
                that.trigger("aborting", that);
            }
            // schedule next poll
            that.scheduleGetStatus();
        };
        TransferClientBase.prototype.onSuspended = function (result) {
            var that = this;
            that.status(TransferStatus.Suspended);
            if (that.isInBackground()) {
                that.eventPublisher.publish(that.eventPrefix + ".suspended", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "high",
                    severity: "info",
                    message: resourcesModule[that.eventPrefix + ".suspended"]
                }));
            }
            that.trigger(ExportClient.Events.suspended, that, { state: result.lastState });
        };
        TransferClientBase.prototype.onFinished = function (state) {
            var that = this;
            if (state.status === TransferStatus.Failed) {
                that.onFailed(state.errorMessage || state.message);
            }
            else if (state.status === TransferStatus.Aborted) {
                that.onAborted();
            }
            else if (state.status === TransferStatus.Completed) {
                that.onCompleted(state);
            }
        };
        TransferClientBase.prototype.onAborted = function () {
            var that = this;
            that.status(TransferStatus.Aborted);
            if (that.isInBackground()) {
                that.eventPublisher.publish(that.eventPrefix + ".aborted", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "high",
                    severity: "info",
                    message: resourcesModule[that.eventPrefix + ".aborted"]
                }));
            }
            that.trigger("aborted", that);
            that.eventPublisher.publish("transfer.finished", { client: that });
        };
        TransferClientBase.prototype.onFailed = function (message) {
            var that = this;
            that.status(TransferStatus.Failed);
            if (that.isInBackground()) {
                that.eventPublisher.publish(that.eventPrefix + ".failed", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "high",
                    severity: "error",
                    message: resourcesModule[that.eventPrefix + ".failed"] + ": " + message
                }));
            }
            that.trigger("failed", that, { message: message });
            that.eventPublisher.publish("transfer.finished", { client: that });
        };
        TransferClientBase.prototype.onCompleted = function (state) {
            var that = this;
            that.status(TransferStatus.Completed);
            that.trigger("completed", that, { state: state });
            that.eventPublisher.publish("transfer.finished", { client: that });
        };
        TransferClientBase.prototype.dispose = function () {
            var that = this;
            if (that._disposed) {
                return;
            }
            that._disposed = true;
            that.nextSince = undefined;
            if (that._bgNotificationDeferred) {
                that._bgNotificationDeferred.reject();
                that._bgNotificationDeferred = undefined;
            }
            if (that._timerPoll) {
                window.clearTimeout(that._timerPoll);
                that._timerPoll = undefined;
            }
            that.trigger(ExportClient.Events.disposed, that);
        };
        TransferClientBase.prototype._onUnknownError = function (error) {
            var that = this;
            traceSource.error(error);
            that.onFailed(error);
            that.dispose();
        };
        TransferClientBase.prototype.terminate = function (error) {
            // TODO: надо свести все failure к единому выходу. Причины ошибок:
            // 	- ошибка на сервере
            //	- ошибка на клиенте
            //	- ошибка во время вызова (interop)
            //	- юзер прервал операцию
            // В случае ошибки на клиенте, операция на сервере может остаться запущенной, и к ней можно будет приконектится.
            // Но в случае ошибки на сервере, клиентский парт должен всегда переходить в состояние failed
            // В случае interop-ошибки, теоретически, можно продолжать попытки
            // Главное, чтобы при переходе клиентского парта (и ImportClient) в состояние failed, при закрытии парт удалялся.
            // Для того, чтобы можно было начать новую операцию.
            this.dispose();
        };
        // TODO:
        TransferClientBase.Events = {
            "started": "started",
            "suspended": "suspended",
            "disposed": "disposed"
        };
        return TransferClientBase;
    }(core.lang.Observable));
    exports.TransferClientBase = TransferClientBase;
    TransferClientBase.prototype.isInBackground = core.lang.Observable.accessor("isInBackground");
    TransferClientBase.prototype.status = core.lang.Observable.accessor("status");
    TransferClientBase.prototype.statusTitle = core.lang.Observable.accessor("statusTitle");
    var ExportClient = /** @class */ (function (_super) {
        __extends(ExportClient, _super);
        function ExportClient(app) {
            var _this = _super.call(this, app) || this;
            _this.type = "export";
            _this.urls.start = _this.urls.baseUrl + "/startexport";
            _this.eventPrefix = "transfer.export";
            return _this;
        }
        ExportClient.prototype.startExport = function (scenario) {
            if (!scenario) {
                return;
            }
            return this._start({ scenario: scenario });
        };
        ExportClient.prototype.onCompleted = function (state) {
            var that = this;
            if (that.isInBackground()) {
                that.eventPublisher.publish("transfer.export.completed", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.actionRequest,
                    priority: "high",
                    severity: "success",
                    message: resourcesModule["transfer.export.completed"],
                    menu: {
                        items: [{
                                name: "Download",
                                title: resourcesModule["transfer.export.download_file"],
                                command: core.createCommand(function () {
                                    that.downloadExport();
                                })
                            }, {
                                name: "Close",
                                title: resources["close"],
                                command: core.createCommand(function () { })
                            }]
                    }
                }));
                /*that.eventPublisher.publish("transfer.export.completed", core.SystemEvent.create({
                    kind: core.SystemEvent.Kinds.notification,
                    priority: "normal",
                    severity: "success",
                    message: resourcesModule["transfer.export.completed"]
                }));*/
            }
            _super.prototype.onCompleted.call(this, state);
        };
        ExportClient.prototype.downloadExport = function (suppressEvents) {
            var that = this;
            if (!that.opId) {
                return;
            }
            return that.dataFacade.ajax({
                url: this.urls.baseUrl + "/download?opId=" + that.opId
            }, { fileDownload: true }).done(function () {
                // everything is OK, exported data were download
                if (!suppressEvents) {
                    that.eventPublisher.publish("transfer.export.downloaded", core.SystemEvent.create({
                        kind: core.SystemEvent.Kind.notification,
                        priority: "normal",
                        severity: "success",
                        message: resourcesModule["transfer.export.downloaded"]
                    }));
                }
            }).fail(function (error) {
                if (!suppressEvents) {
                    core.Application.current.eventPublisher.publish("interop.error", core.SystemEvent.create({
                        kind: core.SystemEvent.Kind.notification,
                        priority: "high",
                        severity: "error",
                        message: resources["interop.download_error"] + (error.message ? ": " + error.message : ""),
                        error: error
                    }));
                }
            });
        };
        return ExportClient;
    }(TransferClientBase));
    exports.ExportClient = ExportClient;
    var ImportClient = /** @class */ (function (_super) {
        __extends(ImportClient, _super);
        function ImportClient(app, options) {
            var _this = _super.call(this, app) || this;
            _this.type = "import";
            _this.options = options || {};
            _this.urls.start = _this.urls.baseUrl + "/startimport";
            _this.eventPrefix = "transfer.import";
            return _this;
        }
        ImportClient.prototype.startImport = function (resourceId, scenario) {
            return this._start({ resourceId: resourceId, scenario: scenario });
        };
        ImportClient.prototype.onSuspended = function (result) {
            var that = this, state = result.lastState, actions = that.options.suspendedActions, unknown;
            _super.prototype.onSuspended.call(this, result);
            if (state.importSuspendedResult) {
                /*
                 XTsVersionConflictImportSuspendedStateInfo :
                     suspendedCause = ImportSuspendedCause.VersionConflict
                     importingObject
                     existingObject
                     response: VersionConflictAction
                 XTsErrorOnProcessObjectImportSuspendedStateInfo :
                     suspendedCause = ImportSuspendedCause.ErrorOnProcessObject
                     violatingObject
                     errorMessage
                     response: ObjectProcessErrorAction
                 XTsUnresolvedObjectsImportSuspendedStateInfo :
                     suspendedCause = ImportSuspendedCause.UnresolvedObjects
                     unresolvedObjects: []
                     response: UnresolvedObjectsAction
                 */
                var cause = state.importSuspendedResult.suspendedCause;
                switch (cause) {
                    case ImportSuspendedCause.VersionConflict:
                        if (actions && actions.versionConflict !== undefined) {
                            that.resume(actions.versionConflict);
                        }
                        else {
                            that.onVersionConflict(state);
                        }
                        break;
                    case ImportSuspendedCause.ErrorOnProcessObject:
                        if (actions && actions.error !== undefined) {
                            that.resume(actions.error);
                        }
                        else {
                            that.onErrorOnProcessObject(state);
                        }
                        break;
                    case ImportSuspendedCause.UnresolvedObjects:
                        if (actions && actions.unresolvedObjects !== undefined) {
                            that.resume(actions.unresolvedObjects);
                        }
                        else {
                            that.onUnresolvedObjects(state);
                        }
                        break;
                    default:
                        unknown = true;
                        break;
                }
            }
            else {
                unknown = true;
            }
            if (unknown) {
                that._onUnknownError("Response for suspended state doesn't contain known suspendedCause");
            }
        };
        ImportClient.prototype.onVersionConflict = function (state) {
            // input:
            // 	importingObject: DomainObjectData
            // 	existingObject: DomainObjectData
            // output: VersionConflictAction
            var args = {
                state: state
            };
            this.trigger("suspendedOnVersionConflict", this, args);
        };
        ImportClient.prototype.onErrorOnProcessObject = function (state) {
            // input:
            // 	violatingObject: DomainObjectData
            // 	errorMessage: string
            // output: ObjectProcessErrorAction
            var args = {
                state: state
            };
            this.trigger("suspendedOnError", this, args);
        };
        ImportClient.prototype.onUnresolvedObjects = function (state) {
            // input:
            //	unresolvedObjects: Array<DomainObjectData>
            // output: UnresolvedObjectsAction
            var args = {
                state: state
            };
            this.trigger("suspendedOnUnresolvedObjects", this, args);
        };
        return ImportClient;
    }(TransferClientBase));
    exports.ImportClient = ImportClient;
    var Transfer = /** @class */ (function (_super) {
        __extends(Transfer, _super);
        function Transfer(app, options) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.app = app;
            that.runningOps = [];
            that.runningOpsCount(0);
            that.options = core.lang.appendEx(options || {}, Transfer.defaultOptions, { deep: true });
            that.cmdExport = core.createCommand({
                execute: function (args) {
                    that.startExport(args.scenario);
                },
                canExecute: function () {
                    return that.runningOps.length === 0;
                }
            });
            that.cmdOpenExport = core.createCommand({
                execute: function (args) {
                    that.openExport(args);
                },
                canExecute: function () {
                    return that.runningOps.length === 0;
                }
            });
            that.cmdOpenImport = core.createCommand({
                execute: function (args) {
                    that.openImport(args);
                },
                canExecute: function () {
                    return that.runningOps.length === 0;
                }
            });
            that.cmdActivateOp = core.createCommand({
                execute: function (args) {
                    var client = args.client;
                    if (client) {
                        that._openOpPart(client.type, { client: args.client });
                    }
                }
            });
            return _this;
        }
        Transfer.prototype.getRunningOperation = function (type, isInBackground) {
            var that = this;
            if (!that._operationsDefer || that._operationsDefer.state() !== "pending") {
                that._operationsDefer = that._loadOperations(isInBackground);
            }
            return that._operationsDefer.then(function (ops) {
                that._operationsDefer = undefined;
                if (ops && ops.length) {
                    for (var i = 0; i < ops.length; i++) {
                        if (ops[i].type === type) {
                            return ops[i];
                        }
                    }
                }
                return null;
            });
        };
        Transfer.prototype.getOperations = function (isInBackground) {
            var that = this;
            if (that._operationsDefer && that._operationsDefer.state() === "pending") {
                return that._operationsDefer.promise();
            }
            that._operationsDefer = that._loadOperations(isInBackground);
            return that._operationsDefer.promise();
        };
        Transfer.prototype.startExport = function (scenario) {
            var that = this;
            var client = new ExportClient(that.app);
            client.isInBackground(true);
            client.startExport(scenario);
            return client;
        };
        Transfer.prototype._openOpPart = function (stateName, options) {
            var that = this;
            var state = {
                name: stateName,
                regionState: {
                    partOptions: options
                }
            };
            that.app.areaManager.activateState("transfer", state);
        };
        Transfer.prototype.openExport = function (options) {
            this._openOpPart("export", options);
        };
        Transfer.prototype.openImport = function (options) {
            this._openOpPart("import", options);
        };
        Transfer.prototype.onOpStarted = function (client) {
            var that = this, count = that.runningOps.push(client); // push returns the new length of the array
            that.runningOpsCount(count);
            if (that.options.updateSysMenu && that.app.sysMenu) {
                var menuItem = that.app.sysMenu.getRootItem("transfer");
                if (menuItem) {
                    menuItem.badge(count.toString());
                }
            }
        };
        Transfer.prototype.onOpFinished = function (client) {
            var that = this, count;
            if (core.lang.arrayRemove(that.runningOps, client)) {
                // operation was removed from running, decrease count
                count = that.runningOps.length;
                that.runningOpsCount(count);
                if (that.options.updateSysMenu && that.app.sysMenu) {
                    var menuItem = that.app.sysMenu.getRootItem("transfer");
                    if (menuItem) {
                        menuItem.badge(count === 0 ? "" : count.toString());
                    }
                }
            }
        };
        Transfer.prototype.initialize = function () {
            var that = this, app = that.app;
            app.eventPublisher.subscribe("transfer.started", function (ev) {
                var client = ev.args.client;
                that.onOpStarted(client);
            });
            app.eventPublisher.subscribe("transfer.finished", function (ev) {
                var client = ev.args.client;
                that.onOpFinished(client);
            });
            Transfer.Instance = that;
            if (that.options.fetchOpsOnLogin) {
                app.eventPublisher.subscribe("security.login", function (ev) {
                    that._operationsDefer = that._loadOperations(true);
                });
            }
            if (that.options.fetchOpsOnInit) {
                that._operationsDefer = that._loadOperations(true);
            }
        };
        Transfer.prototype._loadOperations = function (isInBackground) {
            var that = this, defer = core.lang.Deferred();
            var baseUrl = that.app.config.modules["transfer"].apiRoute;
            that.app.dataFacade.ajax({
                url: baseUrl + "/list"
            }, { suppressEventOnError: true }).then(function (result) {
                if (result.operations && result.operations.length) {
                    var tasks_1 = [];
                    var operations_1 = [];
                    result.operations.forEach(function (op) {
                        var opId = op.opId, type = op.type, client;
                        if (type === "export") {
                            client = new ExportClient(that.app);
                        }
                        else if (type === "import") {
                            client = new ImportClient(that.app);
                        }
                        if (client) {
                            if (isInBackground !== undefined) {
                                client.isInBackground(isInBackground);
                            }
                            // `connect` will publish an event which will call `onOpStarted`
                            var t = client.connect(opId).then(function () {
                                operations_1.push(client);
                            });
                            tasks_1.push(t);
                        }
                    });
                    core.lang.whenAll(tasks_1).then(function () {
                        defer.resolve(operations_1);
                    });
                }
                else {
                    defer.resolve();
                }
            }).fail(function () {
                // NOTE: here we're swallow the error
                defer.resolve();
            });
            return defer;
        };
        Transfer.prototype.createSysMenu = function (options) {
            var that = this, i, scenario, exportMd = options["export"], importMd = options["import"];
            if (!that.app.sysMenu) {
                return;
            }
            var items = [];
            if (exportMd) {
                for (i = 0; i < exportMd.length; i++) {
                    scenario = exportMd[i];
                    items.push({
                        name: "export-" + scenario.name,
                        title: resources["transfer.export"] + " \"" + scenario.title + "\"",
                        icon: "x-icon-upload-2",
                        command: that.cmdExport,
                        params: { scenario: scenario.name }
                    });
                }
            }
            if (importMd) {
                var importScenarios = [];
                if (core.lang.isArray(importMd)) {
                    importScenarios = importMd;
                }
                else if (core.lang.isObject(importMd)) {
                    importScenarios = [importMd];
                }
                if (importScenarios.length) {
                    importScenarios.forEach(function (scenario) {
                        items.push({
                            name: "import-" + scenario.name,
                            title: resources["transfer.import"] + " \"" + scenario.title + "\"",
                            icon: "x-icon-download-2",
                            command: that.cmdOpenImport,
                            params: { scenario: scenario.name }
                        });
                    });
                }
                else {
                    items.push({
                        name: "Import",
                        title: resources["transfer.import"],
                        icon: "x-icon-download-2",
                        hideIfDisabled: undefined,
                        command: that.cmdOpenImport
                    });
                }
            }
            that.sysMenuItems = items;
            that.app.sysMenu.addRootItem({
                name: "transfer",
                icon: "x-icon-lightning",
                getMenu: that.getSysMenuItems.bind(that)
            });
        };
        Transfer.prototype.getSysMenuItems = function () {
            // TODO: add Activate
            var that = this, items = this.sysMenuItems || [], menu = { items: [] };
            core.lang.arrayAppend(menu.items, items);
            that.runningOps.forEach(function (client) {
                var item = {
                    name: "Activate",
                    title: resourcesModule["transfer.cmd.activate." + client.type],
                    command: that.cmdActivateOp,
                    params: { client: client }
                };
                menu.items.push(item);
            });
            return menu;
        };
        Transfer.defaultOptions = {
            updateSysMenu: true,
            fetchOpsOnInit: false,
            fetchOpsOnLogin: true
        };
        return Transfer;
    }(core.lang.Observable));
    exports.Transfer = Transfer;
    Transfer.prototype.runningOpsCount = core.lang.Observable.accessor("runningOpsCount");
});
//# sourceMappingURL=Transfer.js.map