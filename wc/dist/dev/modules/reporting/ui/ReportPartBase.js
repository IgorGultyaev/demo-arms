/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "lib/ui/Component", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "lib/ui/menu/MenuButtonsPresenter"], function (require, exports, core, utils, Component, Menu, resources) {
    "use strict";
    var lang = core.lang;
    var ReportPartBase = /** @class */ (function (_super) {
        __extends(ReportPartBase, _super);
        /**
         * @constructs ReportPartBase
         * @extends Component
         * @param {Application} app
         * @param {Object} options
         */
        function ReportPartBase(app, options) {
            var _this = this;
            if (!app)
                throw new Error("ReportPartBase.ctor: app can't be null");
            options = ReportPartBase.mixOptions(options, ReportPartBase.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.app = app;
            that.title(options.title);
            that.state(ReportPartBase.State.initial);
            that.userSettings = core.UserSettings.create(that.options.userSettings);
            that._initializeProps();
            that.commands = that.createCommands();
            that._initializeMenus();
            that.initPresenter();
            that.bind("change:state", function (sender, state) {
                that._stateChanged(state);
            });
            return _this;
        }
        ReportPartBase.prototype.tweakOptions = function (options) {
            core.lang.appendEx(options, {
                presenterOptions: {
                    template: options.template,
                    bound: options.bound,
                    affixTableHeader: options.affixTableHeader
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        ReportPartBase.prototype.isGenerating = function () {
            return this.state() === ReportPartBase.State.generating;
        };
        ReportPartBase.prototype.isInitial = function () {
            return this.state() === ReportPartBase.State.initial;
        };
        ReportPartBase.prototype._initializeProps = function () {
            var that = this;
            that.options.reportName = that.options.reportName || that.options.urlSuffix;
            if (!that.options.reportName) {
                throw new Error("ReportPartBase.ctor: options.reportName were not specified.");
            }
        };
        ReportPartBase.prototype._initializeMenus = function () {
            var that = this;
            that.menu = that._createMenu();
            if (that.menu) {
                that.menu.bindToPart(that);
            }
        };
        ReportPartBase.prototype._createMenuDefaults = function () {
            // no default menu in base implementation
            return null;
        };
        ReportPartBase.prototype._createMenu = function () {
            // base implementation
            return new Menu(this._createMenuDefaults(), this.options.menu);
        };
        /**
         * Create commands
         * @protected
         * @returns {{Build: BoundCommand, Export: BoundCommand, OpenReport: BoundCommand}}
         */
        ReportPartBase.prototype.createCommands = function () {
            var that = this, commands = {
                Build: new core.commands.BoundCommand(that._doBuild, that),
                Export: new core.commands.BoundCommand(that._doOpen, that),
                OpenReport: new core.commands.BoundCommand(that._doOpenReport, that)
            };
            core.lang.extend(commands, that.options.commands);
            return commands;
        };
        ReportPartBase.prototype._stateChanged = function (state) {
            var that = this;
            that._commandsAvailable = (state !== ReportPartBase.State.generating);
            that.invalidateCommands();
        };
        ReportPartBase.prototype.invalidateCommands = function () {
            var that = this, canExec = that._commandsAvailable;
            that.commands.Build.canExecute(canExec);
            that.commands.Export.canExecute(canExec && !that.lastError());
        };
        /**
         * Override base getState to add current params into URL.
         */
        ReportPartBase.prototype.getState = function () {
            if (this.options.params) {
                return { params: this.options.params || {} };
            }
        };
        /**
         * Returns merge result of external params (passed via options) and current params.
         * @return {Object}
         * @protected
         */
        ReportPartBase.prototype.getParams = function () {
            return core.lang.extend({}, this.options.params || {});
        };
        ReportPartBase.prototype._doBuild = function () {
            var that = this, params, query, task;
            that.hintMessage(undefined);
            params = that.getParams();
            // NOTE: null params mean there was an error during getting params
            if (params == null) {
                return;
            }
            try {
                that.state(ReportPartBase.State.generating);
                that.hintMessage(undefined);
                // если идет второе построение отчета - нужно обновлять в любом случае
                params.refresh = that._needRefresh || that.options.refresh;
                // в следующий раз точно обновлять
                that._needRefresh = true;
                if (that.options.dontCacheXslFo) {
                    params.dontCacheXslFo = true;
                }
                var baseUrl = that.app.config.modules["reporting"].apiRoute;
                query = {
                    url: baseUrl + "/" + that.options.reportName,
                    data: params
                };
                task = that.app.dataFacade.ajax(query, {
                    processEvent: { message: resources["reportPart.building"] },
                    supportsGetPost: true,
                    contentType: "text/html"
                });
                return task.then(function (result) {
                    try {
                        that.reportContent(result);
                        return result;
                    }
                    finally {
                        that.lastError(null);
                        that.state(ReportPartBase.State.generated);
                        that.stateMessage("");
                    }
                }, function (error) {
                    that._onError(error);
                });
            }
            catch (ex) {
                that._onError(ex);
                return core.lang.rejected(ex);
            }
        };
        ReportPartBase.prototype._doOpen = function (cmdOptions) {
            var that = this;
            that.hintMessage(undefined);
            var params = that.getParams();
            // NOTE: null params mean there was an error during getting params
            if (params == null) {
                return;
            }
            cmdOptions = cmdOptions || {};
            try {
                var format = cmdOptions.format || "HTML";
                if (that.options.refresh) {
                    params.refresh = true;
                }
                if (that.options.dontCacheXslFo) {
                    params.dontCacheXslFo = true;
                }
                var baseUrl = that.app.config.modules["reporting"].apiRoute;
                var url = (format === "HTML" ? "display/report" : baseUrl) + "/" + that.options.reportName;
                if (format !== "HTML") {
                    params.format = format;
                    that._downloadReport(url, params);
                }
                else {
                    var root = that.app.config.root;
                    if (root && url.indexOf(root) !== 0) {
                        url = utils.combinePaths(root, url);
                    }
                    if (params) {
                        var queryString = utils.buildUriParams({ params: params });
                        if (queryString) {
                            url += "?" + encodeURI(queryString);
                        }
                    }
                    window.open(url, "_blank", "menubar=0, scrollbars=1, location=1, resizable=1", true);
                }
            }
            catch (ex) {
                that._onError(ex);
            }
        };
        ReportPartBase.prototype._downloadReport = function (url, params) {
            var that = this;
            that.app.eventPublisher.publish("report.export.begin", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.notification,
                priority: "low",
                severity: "info",
                message: resources["reportPart.buildStarted"]
            }));
            var ajaxSettings = {
                url: url,
                data: params,
                type: "GET"
            };
            return that.app.dataFacade.ajax(ajaxSettings, { fileDownload: true, processEvent: { message: resources["interop.retrieving_data"] } }).done(function () {
                // файл получен на браузер. сейчас браузер предложит сохранение и тд
                that.app.eventPublisher.publish("report.export.success", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "low",
                    severity: "success",
                    message: resources["reportPart.reportDownloaded"]
                }));
            });
        };
        ReportPartBase.prototype._onError = function (e) {
            var that = this;
            that.lastError(e);
            that.reportContent(null);
            that.state(ReportPartBase.State.failed);
            that.stateMessage(resources["reportPart.buildingError"] + e.message);
        };
        ReportPartBase.prototype._doGoBack = function () {
            if (this.navigationService) {
                this.navigationService.close();
            }
        };
        /**
         * Open a nested report
         * @param {Object} cmdOptions
         * @private
         */
        ReportPartBase.prototype._doOpenReport = function (cmdOptions) {
            var that = this;
            if (that.navigationService) {
                var reportParams = core.lang.extend(cmdOptions.reportParams, { isNested: true });
                that.navigationService.navigate({
                    part: that._getReportPartName() + ":" + cmdOptions.reportName,
                    partOptions: reportParams
                });
            }
        };
        ReportPartBase.prototype._getReportPartName = function () {
            return "ReportPart";
        };
        ReportPartBase.prototype.processLink = function (uri) {
            var that = this, parsedUri, cmdName, cmdParams, cmd;
            parsedUri = that._parseUri(decodeURI(uri));
            // external link?
            if (!parsedUri) {
                return;
            }
            // it's an internal link
            cmdName = parsedUri.cmdName;
            cmd = that.commands[cmdName];
            if (!cmd) {
                return true;
            }
            cmdParams = that._getCmdParamsFromParsedUri(parsedUri);
            cmdParams = core.lang.extend(cmdParams, { name: cmdName });
            cmd.execute(cmdParams);
            return true;
        };
        /**
         * Parse internal link determining:
         * action name (command name), action spec (some name for command), action params (json object params for command)
         * @param {string} uri
         * @return {{cmdName, cmdSpec, cmdParams}}
         * @protected
         */
        ReportPartBase.prototype._parseUri = function (uri) {
            // parse the uri like: webclient://{name}/{spec}?{params}
            // e.g.: "webClient://OpenReport/Surveys?autoGenerate=true&params.organizer=0D60B1BB-B425-412C-A667-4A010CFA8547
            var re = /webclient:\/\/([^/]+)(?:\/([^/]+))?\?(.+)/i;
            var match = re.exec(uri);
            if (match) {
                var params = match[3];
                if (params) {
                    params = utils.parseUriParams(params);
                }
                return {
                    cmdName: match[1],
                    cmdSpec: match[2],
                    cmdParams: params
                };
            }
        };
        /**
         * Returns params for command determined on parsed uri.
         * @param {Object} parsedUri a result of _parseUri method
         * @returns {Object}
         * @protected
         */
        ReportPartBase.prototype._getCmdParamsFromParsedUri = function (parsedUri) {
            switch (parsedUri.cmdName) {
                case "Navigate":
                    return {
                        partName: parsedUri.cmdSpec,
                        partOptions: parsedUri.cmdParams
                    };
                case "OpenReport":
                    return {
                        reportName: parsedUri.cmdSpec,
                        reportParams: parsedUri.cmdParams
                    };
                default:
                    return parsedUri.cmdParams;
            }
        };
        ReportPartBase.defaultOptions = {
            refresh: false,
            dontCacheXslFo: false,
            bound: true,
            affixTableHeader: true,
            showTitle: true
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "state");
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "reportContent");
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "lastError");
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "hintMessage");
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "stateMessage");
        __decorate([
            lang.decorators.observableAccessor()
        ], ReportPartBase.prototype, "title");
        return ReportPartBase;
    }(Component));
    (function (ReportPartBase) {
        ReportPartBase.State = {
            initial: "initial",
            generating: "generating",
            generated: "generated",
            failed: "failed"
        };
    })(ReportPartBase || (ReportPartBase = {}));
    ReportPartBase.mixin({
        defaultOptions: ReportPartBase.defaultOptions,
        states: ReportPartBase.State
    });
    return ReportPartBase;
});
//# sourceMappingURL=ReportPartBase.js.map