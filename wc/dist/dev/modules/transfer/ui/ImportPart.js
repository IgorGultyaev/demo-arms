/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!modules/transfer/ui/templates/ImportPart.hbs", "modules/transfer/Transfer", "i18n!lib/nls/resources", "i18n!modules/transfer/nls/resources", "lib/ui/menu/Menu", "lib/ui/ObjectComparePart", "lib/ui/editor/ObjectViewer", "xcss!./styles/transferPart"], function (require, exports, core, View, template, transfer, resources, resourcesModule, Menu, ObjectComparePart, ObjectViewer) {
    "use strict";
    var ImportPart = /** @class */ (function (_super) {
        __extends(ImportPart, _super);
        /**
         * @constructs ImportPart
         * @extends View
         * @param app
         * @param options
         */
        function ImportPart(app, options) {
            var _this = this;
            options = ImportPart.mixOptions(options, ImportPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.app = app;
            _this.title = options.title || resourcesModule["transfer.import"];
            _this.stateSeverity("info");
            _this.state(ImportPart.State.connecting);
            if (_this.options.client) {
                _this.client = _this.options.client;
                _this._initClient();
            }
            else if (transfer.Transfer.Instance) {
                // create or attach to running
                _this.isLoading(true);
                transfer.Transfer.Instance.getRunningOperation("import", true).always(function (client) {
                    _this.isLoading(false);
                    if (client) {
                        _this.client = client;
                        _this._initClient();
                    }
                    else {
                        _this.client = new transfer.ImportClient(app);
                        _this._initClient();
                    }
                });
            }
            _this.files = core.files;
            _this.messages = [];
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
            }
            return _this;
        }
        /**
         * @observable-property {ImportPart#state}
         */
        ImportPart.prototype.state = function (v) {
            if (!arguments.length) {
                return ImportPart._get(this, "state");
            }
            if (ImportPart._set(this, "state", v)) {
                this.onStateChange(v);
            }
        };
        ImportPart.prototype.onStateChange = function (v) {
            var that = this;
            switch (v) {
                case ImportPart.State.connecting:
                    that.stateTitle(resourcesModule["transfer.import.connecting"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.startingUp:
                    that.stateTitle(resourcesModule["transfer.import.starting"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.importing:
                    that.stateTitle(resourcesModule["transfer.import.running"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.uploading:
                    that.stateTitle(resourcesModule["transfer.import.uploading"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.suspended:
                    that.stateTitle(resourcesModule["transfer.import.suspended"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.initial:
                    that.stateTitle(resourcesModule["transfer.import.initial"]);
                    that.stateSeverity("info");
                    break;
                case ImportPart.State.failed:
                    that.stateTitle(resourcesModule["transfer.import.failed"]);
                    that.stateSeverity("danger");
                    break;
                case ImportPart.State.aborted:
                    that.stateTitle(resourcesModule["transfer.import.aborted"]);
                    that.stateSeverity("warning");
                    break;
                case ImportPart.State.aborting:
                    that.stateTitle(resourcesModule["transfer.import.aborting"]);
                    that.stateSeverity("warning");
                    break;
                case ImportPart.State.completed:
                    that.stateTitle(resourcesModule["transfer.import.completed"]);
                    that.stateSeverity("success");
                    break;
            }
        };
        /**
         * @observable-property {ImportPart#detailPart}
         */
        ImportPart.prototype.detailPart = function (v) {
            if (!arguments.length) {
                return ImportPart._get(this, "detailPart");
            }
            var args = ImportPart._set(this, "detailPart", v);
            if (args && args.oldValue) {
                args.oldValue.dispose();
            }
        };
        /**
         * @observable-property {ImportPart#state}
         */
        ImportPart.prototype.progress = function (v) {
            if (!arguments.length) {
                return ImportPart._get(this, "progress");
            }
            if (ImportPart._set(this, "progress", v)) {
                this.onProgressChange(v);
            }
        };
        ImportPart.prototype.onProgressChange = function (progress) {
            var that = this, $bar = that.$domElement.find(".progress-bar");
            $bar.css("width", progress + "%");
            $bar.text(progress + "%");
        };
        ImportPart.prototype._initClient = function () {
            var that = this, status = that.client.status();
            that.client.subscribe("started", that.onImportStarted, that);
            that.client.subscribe("historyUpdated", that.onHistoryUpdated, that);
            that.client.subscribe("running", that.onRunning, that);
            that.client.subscribe("aborting", that.onAborting, that);
            that.client.subscribe("suspendedOnVersionConflict", that.onVersionConflict, that);
            that.client.subscribe("suspendedOnUnresolvedObjects", that.onUnresolvedObjects, that);
            that.client.subscribe("suspendedOnError", that.onErrorOnProcessObject, that);
            that.client.subscribe("completed", that.onImportCompleted, that);
            that.client.subscribe("failed", that.onImportFailed, that);
            that.client.subscribe("aborted", that.onImportAborted, that);
            if (status === transfer.TransferStatus.None) {
                that.state(ImportPart.State.initial);
            }
            else if (status === transfer.TransferStatus.Running) {
                that.state(ImportPart.State.importing);
            }
            else {
                // NOTE: in any other state we have to refetch status to correctly react on events (create menu and so on)
                that.client.fetchStatus(true);
            }
        };
        ImportPart.prototype.createCommands = function () {
            var that = this, commands;
            commands = {
                Abort: core.createCommand({
                    execute: function () {
                        that.abort();
                    },
                    canExecute: function () {
                        var state = that.state();
                        return state === ImportPart.State.importing || state === ImportPart.State.suspended;
                    }
                }),
                Close: core.createCommand({
                    execute: function () {
                        that.close();
                    }
                }),
                UploadCancel: core.createCommand({
                    execute: that._uploadCancel.bind(that)
                }),
                Resume: core.createCommand({
                    execute: function (args) {
                        if (args.action !== undefined) {
                            that.resume(args.action);
                        }
                    }
                })
            };
            if (that.options.commands) {
                core.lang.forEach(that.options.commands, function (command, name) {
                    //commands[name] = typeof command === "function" ? (<core.commands.ICommandFactory>command)(that) : <ICommand>command;
                });
            }
            return commands;
        };
        ImportPart.prototype.createMenu = function () {
            return new Menu(this.options.menu);
        };
        ImportPart.prototype.isRunning = function () {
            var state = this.state();
            return state === ImportPart.State.importing ||
                state === ImportPart.State.suspended ||
                state === ImportPart.State.startingUp ||
                state === ImportPart.State.uploading;
        };
        ImportPart.prototype.isProgress = function () {
            var state = this.state();
            return state === ImportPart.State.importing ||
                state === ImportPart.State.suspended ||
                state === ImportPart.State.uploading;
        };
        ImportPart.prototype.onReady = function () {
            var that = this, inputElement, chainId;
            var $element = that.$domElement.find(".x-pe-binary");
            inputElement = $element.find("input[name=file]");
            inputElement.fileupload({
                url: that.files.uploadUrl,
                replaceFileInput: false,
                maxChunkSize: that.files.uploadChunkSize,
                // TODO нужно заюзать DropApi и как-то подсвечивать зону вброса
                dropZone: $element,
                dataType: "json",
                formData: [
                    {
                        name: "X-StorageType",
                        value: "resource"
                    }
                ],
                add: function (e, data) {
                    that._upload(data);
                },
                done: function (e, data) {
                    that._onUploadSuccess(data);
                },
                fail: function (e, data) {
                    that._onUploadFail(data);
                },
                progress: function (e, data) {
                    that._onUploadProgress(data);
                },
                chunksend: function (e, data) {
                    if (chainId) {
                        data.headers["X-ChunkChain"] = chainId;
                    }
                },
                chunkdone: function (e, data) {
                    if (data.result) {
                        chainId = data.result.resourceId;
                    }
                }
            });
            that.inputElement = inputElement;
            that.inputButton = $element.find(".x-pe-binary-uploadbutton");
            that.element = $element;
            that.client.isInBackground(false);
            that.app.eventPublisher.publish("transfer.ui.foreground");
            if (that.$menuContainer) {
                that.app.eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$menuContainer
                });
            }
            that.$menuContainer = that.$domElement.find(".x-transfer-menu-container");
            that.app.eventPublisher.publish("ui.affix.add_element", {
                element: that.$menuContainer,
                //controlledBy: container.find(".x-editor-pages"),
                affixTo: "bottom"
            });
        };
        ImportPart.prototype._removeSuspendedMenu = function () {
            var that = this;
            that.suspendMenu = null;
            that.trigger("change:suspendMenu");
            that.detailPart(null);
            that.errorMessage(null);
        };
        ImportPart.prototype.resume = function (action) {
            var that = this;
            that._removeSuspendedMenu();
            that.client.resume(action);
            that.state(ImportPart.State.importing);
        };
        ImportPart.prototype.close = function () {
            var that = this;
            if (this.isRunning()) {
                that.navigationService.leave();
            }
            else {
                // close and destroy the part
                that.isClosing = true; // it's flag for unload to not publish notification, as we're really destroying the part
                // explicitly set option `keepAlive = false` to force part disposing
                // NOTE: omitting options at all is NOT the same, default value of `keepAlive` is undefined
                that.navigationService.close(null, { keepAlive: false });
            }
        };
        ImportPart.prototype.abort = function () {
            var that = this;
            that._removeSuspendedMenu();
            that.state(ImportPart.State.aborting);
            that.client.abort();
        };
        ImportPart.prototype._upload = function (data) {
            var that = this;
            that.state(ImportPart.State.uploading);
            that._uploadToken = data.submit();
        };
        ImportPart.prototype._onUploadProgress = function (data) {
            var that = this, progress = core.lang.toInteger(data.loaded / data.total * 100);
            that.progress(progress);
        };
        ImportPart.prototype._onUploadSuccess = function (data) {
            var that = this;
            var result = data.result;
            if (that._uploadToken) {
                that._uploadToken = undefined;
            }
            if (!result && !result.resourceId) {
                // throw error?
                return;
            }
            that.resourceId = result.resourceId;
            // NOTE: that fires rerender
            that.state(ImportPart.State.startingUp);
            // start import
            that.startImport();
        };
        ImportPart.prototype._onUploadFail = function (data) {
            var that = this, error = that.files.handleUploadError(data.jqXHR, data.textStatus, data.errorThrown);
            if (that._uploadToken) {
                that._uploadToken = undefined;
            }
            if (error.isAbort) {
                that.state(ImportPart.State.initial);
            }
            else {
                that.state(ImportPart.State.failed);
            }
            that.errorMessage(error.message);
        };
        ImportPart.prototype._uploadCancel = function () {
            var that = this;
            if (that._uploadToken) {
                that._uploadToken.abort();
            }
        };
        ImportPart.prototype.startImport = function () {
            var that = this;
            that.progress(0);
            that.client.startImport(that.resourceId, that.options.scenario);
        };
        ImportPart.prototype.onImportStarted = function () {
            this.state(ImportPart.State.importing);
        };
        ImportPart.prototype.onHistoryUpdated = function (sender, args) {
            var _this = this;
            var history = args.history;
            if (history.length) {
                history.forEach(function (state) {
                    _this.progress(state.progressPercent);
                });
            }
        };
        ImportPart.prototype.onRunning = function () {
            this.state(ImportPart.State.importing);
        };
        ImportPart.prototype.onAborting = function () {
            this.state(ImportPart.State.aborting);
        };
        ImportPart.prototype.onVersionConflict = function (sender, args) {
            var that = this;
            /*
             XTsVersionConflictImportSuspendedStateInfo :
                 suspendedCause = ImportSuspendedCause.VersionConflict
                 importingObject: DomainObjectData
                 existingObject: DomainObjectData
             response: VersionConflictAction
             * */
            that.state(ImportPart.State.suspended);
            that._updateMenu(that.options.menus.versionConflict);
            that.errorMessage(args.state.errorMessage || args.state.message);
            var res = args.state.importSuspendedResult;
            if (res.importingObject && res.existingObject) {
                var part = new ObjectComparePart({
                    local: res.importingObject,
                    original: res.existingObject,
                    hint: "",
                    targetColumnTitle: resources["transfer.import.targetColumnTitle"],
                    sourceColumnTitle: resources["transfer.import.sourceColumnTitle"],
                    showMetadata: true
                });
                that.detailPart(part);
            }
        };
        ImportPart.prototype.onUnresolvedObjects = function (sender, args) {
            var that = this;
            /*
             XTsUnresolvedObjectsImportSuspendedStateInfo :
                 suspendedCause = ImportSuspendedCause.UnresolvedObjects
                 unresolvedObjects: []
             response: UnresolvedObjectsAction
            * */
            that.state(ImportPart.State.suspended);
            that._updateMenu(that.options.menus.unresolvedObjects);
            that.errorMessage(args.state.errorMessage || args.state.message);
            var res = args.state.importSuspendedResult;
            if (res.unresolvedObjects && res.unresolvedObjects.length) {
                that._openViewer(res.unresolvedObjects[0]);
            }
        };
        ImportPart.prototype._openViewer = function (objData) {
            var that = this, uow = that.app.createUnitOfWork();
            var obj = uow.fromJson(objData);
            var part = new ObjectViewer({
                viewModel: obj,
                menu: { items: [] },
                // do not load not-loaded properties
                suppressAutoLoad: true,
                // do not allow to open in nested viewer value objects
                disableValuesNavigation: true
            });
            that.detailPart(part);
        };
        ImportPart.prototype.onErrorOnProcessObject = function (sender, args) {
            var that = this;
            /*
             XTsErrorOnProcessObjectImportSuspendedStateInfo :
                 suspendedCause = ImportSuspendedCause.ErrorOnProcessObject
                 violatingObject: DomainObjectData
                 errorMessage: String
             response: ObjectProcessErrorAction
            * */
            that.state(ImportPart.State.suspended);
            that._updateMenu(that.options.menus.errorOnProcessObject);
            var res = args.state.importSuspendedResult;
            that.errorMessage(res.errorMessage);
            if (res.violatingObject) {
                that._openViewer(res.violatingObject);
            }
        };
        ImportPart.prototype._updateMenu = function (metadata) {
            var that = this, suspendMenu = new Menu(metadata);
            suspendMenu.bindToPart(that);
            that.suspendMenu = suspendMenu;
            //that.menu.mergeWith(menuAdd);
            that.trigger("change:suspendMenu");
        };
        ImportPart.prototype.onImportCompleted = function () {
            var that = this;
            that.state(ImportPart.State.completed);
            that.progress(100);
        };
        ImportPart.prototype.onImportFailed = function (sender, args) {
            var that = this;
            that.state(ImportPart.State.failed);
            if (args && args.message) {
                that.stateTitle(that.stateTitle() + ": " + args.message);
            }
            that.progress(100);
        };
        ImportPart.prototype.onImportAborted = function () {
            this.state(ImportPart.State.aborted);
            this.progress(100);
        };
        ImportPart.prototype.unload = function (options) {
            var that = this;
            _super.prototype.unload.call(this);
            if (!options || options.reason !== "rerender") {
                if (!that.isClosing && that.state() !== ImportPart.State.initial) {
                    that.client.isInBackground(true);
                }
            }
            if (that.$menuContainer) {
                that.app.eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$menuContainer
                });
            }
        };
        ImportPart.prototype.dispose = function (options) {
            if (this.client) {
                this.client.dispose();
                this.client = undefined;
            }
            _super.prototype.dispose.call(this, options);
        };
        ImportPart.defaultOptions = {
            template: template,
            scenario: undefined,
            client: undefined,
            commands: undefined,
            menu: { items: [
                    { name: "Abort", title: resourcesModule["transfer.cmd.abort"], order: 50 },
                    { name: "Close", title: resourcesModule["transfer.cmd.close"], order: 100 }
                ] },
            menus: {
                versionConflict: { items: [
                        {
                            name: "VersionConflict_Overwrite",
                            title: resourcesModule["transfer.cmd.overwrite"],
                            params: { action: transfer.VersionConflictAction.Overwrite },
                            commandName: "Resume",
                            hideIfDisabled: true,
                            items: [{
                                    name: "VersionConflict_OverwriteAll",
                                    title: resourcesModule["transfer.cmd.overwriteAll"],
                                    params: { action: transfer.VersionConflictAction.OverwriteAll },
                                    commandName: "Resume",
                                    hideIfDisabled: true
                                }, {
                                    name: "VersionConflict_OverwriteSameType",
                                    title: resourcesModule["transfer.cmd.overwriteSameType"],
                                    params: { action: transfer.VersionConflictAction.OverwriteSameType },
                                    commandName: "Resume",
                                    hideIfDisabled: true
                                }]
                        }, {
                            name: "VersionConflict_Skip",
                            title: resourcesModule["transfer.cmd.skip"],
                            params: { action: transfer.VersionConflictAction.Skip },
                            commandName: "Resume",
                            hideIfDisabled: true,
                            items: [{
                                    name: "VersionConflict_SkipAll",
                                    title: resourcesModule["transfer.cmd.skipAll"],
                                    params: { action: transfer.VersionConflictAction.SkipAll },
                                    commandName: "Resume",
                                    hideIfDisabled: true
                                }, {
                                    name: "VersionConflict_SkipSameType",
                                    title: resourcesModule["transfer.cmd.skipSameType"],
                                    params: { action: transfer.VersionConflictAction.SkipSameType },
                                    commandName: "Resume",
                                    hideIfDisabled: true
                                }]
                        }
                    ] },
                unresolvedObjects: { items: [
                        {
                            name: "UnresolvedObject_Skip",
                            title: resourcesModule["transfer.cmd.skip"],
                            params: { action: transfer.UnresolvedObjectsAction.Skip },
                            commandName: "Resume",
                            hideIfDisabled: true
                        }
                    ] },
                errorOnProcessObject: { items: [
                        {
                            name: "ObjectProcessErrorAction_Retry",
                            title: resourcesModule["transfer.cmd.retry"],
                            params: { action: transfer.ObjectProcessErrorAction.Retry },
                            commandName: "Resume",
                            hideIfDisabled: true
                        }, {
                            name: "ObjectProcessErrorAction_Skip",
                            title: resourcesModule["transfer.cmd.skip"],
                            params: { action: transfer.ObjectProcessErrorAction.Skip },
                            commandName: "Resume",
                            hideIfDisabled: true,
                            items: [{
                                    name: "ObjectProcessErrorAction_SkipAll",
                                    title: resourcesModule["transfer.cmd.skipAll"],
                                    params: { action: transfer.ObjectProcessErrorAction.SkipAll },
                                    commandName: "Resume",
                                    hideIfDisabled: true
                                }]
                        }
                    ] }
            }
        };
        __decorate([
            core.lang.decorators.observableAccessor()
        ], ImportPart.prototype, "stateTitle");
        __decorate([
            core.lang.decorators.observableAccessor()
        ], ImportPart.prototype, "stateSeverity");
        __decorate([
            core.lang.decorators.observableAccessor()
        ], ImportPart.prototype, "errorMessage");
        return ImportPart;
    }(View));
    ImportPart.mixin(/** @lends ImportPart.prototype */ {
        defaultOptions: ImportPart.defaultOptions
    });
    (function (ImportPart) {
        var State;
        (function (State) {
            State[State["connecting"] = 0] = "connecting";
            State[State["initial"] = 1] = "initial";
            State[State["uploading"] = 2] = "uploading";
            State[State["startingUp"] = 3] = "startingUp";
            State[State["importing"] = 4] = "importing";
            State[State["aborting"] = 5] = "aborting";
            State[State["aborted"] = 6] = "aborted";
            State[State["failed"] = 7] = "failed";
            State[State["suspended"] = 8] = "suspended";
            State[State["completed"] = 9] = "completed";
        })(State = ImportPart.State || (ImportPart.State = {}));
    })(ImportPart || (ImportPart = {}));
    return ImportPart;
});
//# sourceMappingURL=ImportPart.js.map