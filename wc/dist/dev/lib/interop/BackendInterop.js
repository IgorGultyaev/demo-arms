/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/utils", "i18n!lib/nls/resources", "lib/interop/.interop.types", "vendor/jquery.fileDownload"], function (require, exports, $, core, utils, resources, _interop_types_1) {
    "use strict";
    var lang = core.lang;
    /**
     * @type {TraceSource}
     */
    var traceSource = new core.diagnostics.TraceSource("interop.backend");
    var BackendInterop = /** @class */ (function (_super) {
        __extends(BackendInterop, _super);
        /**
         * @constructs BackendInterop
         * @extends Observable
         * @param {XConfig} xconfig
         */
        function BackendInterop(xconfig, model) {
            var _this = _super.call(this) || this;
            _this.config = xconfig || { root: "" };
            _this.apiUrlPrefix = "api/"; // v1/
            _this.clientVersion = xconfig && xconfig.software ? xconfig.software.clientLibVersion : undefined;
            _this.serverVersion = null;
            _this.preventCaching = true;
            _this.traceSource = traceSource;
            _this.batching = 0;
            _this._operations = {};
            core.$window.on("online", _this._onAppOnline.bind(_this));
            core.$window.on("offline", _this._onAppOffline.bind(_this));
            return _this;
        }
        BackendInterop.prototype.checkAppCache = function (cb) {
            var that = this, appCache = window.applicationCache, hooks;
            if (appCache) {
                /*
                 0 	UNCACHED 	Has not been cached
                 1 	IDLE 	Has finished updating, or otherwise doing nothing
                 2 	CHECKING 	Seeing if the manifest has changed
                 3 	DOWNLOADING 	Any file in the manifest is being downloaded
                 4 	UPDATEREADY 	The manifest has been changed
                 5 	OBSOLETE 	The cache is obsolete
                 */
                if (appCache.status === appCache.UNCACHED) {
                    cb("uncached");
                }
                else {
                    // There's appCache in use.
                    // There could be events had fired before BackendInterop was created (we hooked them in bootloader.js)
                    // NOTE: we cannot rely on applicationCache.status, it can report incorrect status, so we rely on events
                    hooks = appCache.hooks; // hooks field is added by bootloader
                    if (hooks) {
                        if (hooks.error) {
                            cb("error");
                            return;
                        }
                        if (hooks.cached) {
                            cb("cached");
                            return;
                        }
                        if (hooks.noupdate) {
                            cb("noupdate");
                            return;
                        }
                        if (hooks.updateready) {
                            cb("updateready");
                            return;
                        }
                        if (hooks.obsolete) {
                            cb("obsolete");
                            return;
                        }
                    }
                    if (appCache.status === appCache.OBSOLETE) {
                        cb("obsolete");
                    }
                    else if (appCache.status === appCache.UPDATEREADY) {
                        cb("updateready");
                    }
                    else if (appCache.status === appCache.IDLE) {
                        cb("noupdate");
                    }
                    else {
                        // CHECKING/DOWNLOADING in progress
                        appCache.onerror = function () {
                            cb("error");
                        };
                        appCache.onobsolete = function () {
                            cb("obsolete");
                        };
                        appCache.onupdateready = function () {
                            cb("updateready");
                        };
                        appCache.oncached = function () {
                            cb("cached");
                        };
                        appCache.onnoupdate = function () {
                            cb("noupdate");
                        };
                        /*                  TODO: report progress?
                                            appCache.onprogress = function () {
                        
                                            };
                        */
                    }
                }
            }
        };
        BackendInterop.prototype.filterServerResponse = function (jqXHR) {
            var that = this, srvVer, args;
            srvVer = jqXHR.getResponseHeader(that.HEADER_SERVER_VER);
            if (srvVer && that.serverVersion !== srvVer) {
                args = {
                    oldVersion: that.serverVersion,
                    newVersion: srvVer
                };
                that.serverVersion = srvVer;
                that.trigger("server_version_changed", args);
            }
        };
        BackendInterop.prototype._onAppOnline = function (e) {
            this.traceSource.info("online");
            this.trigger("online", null);
        };
        BackendInterop.prototype._onAppOffline = function (e) {
            this.traceSource.info("offline");
            this.trigger("offline", null);
        };
        BackendInterop.prototype.beginBatch = function () {
            var that = this;
            if (!that.batching) {
                that.batch = [];
            }
            that.batching++;
        };
        BackendInterop.prototype._addBatchItem = function (ajaxSettings, options) {
            var defer = lang.Deferred();
            this.batch.push({ ajaxSettings: ajaxSettings, options: options, defer: defer });
            return defer.promise();
        };
        BackendInterop.prototype.completeBatch = function () {
            var that = this, batch;
            that.batching--;
            if (!that.batching) {
                batch = that.batch;
                for (var _i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                    var request = batch_1[_i];
                    that._fixAjaxSettings(request.ajaxSettings, request.options);
                    that._executeAjax(request.ajaxSettings, request.defer);
                }
                that.batch = null;
            }
        };
        BackendInterop.prototype._executeAjax = function (ajaxSettings, defer, repeating) {
            var that = this;
            return that._executeAjaxSuccess(ajaxSettings, defer, repeating)
                .fail(function (jqXhr, textStatus) {
                var error = that.handleError(jqXhr, textStatus);
                that.traceSource.info("Ajax request to " + ajaxSettings.url + " failed: " + JSON.stringify(error));
                if (defer) {
                    defer.reject(error);
                }
            });
        };
        BackendInterop.prototype._executeAjaxSuccess = function (ajaxSettings, defer, repeating) {
            var that = this;
            that.traceSource.debug("Sending a " + ajaxSettings.type + " ajax request " + ajaxSettings.url);
            return $.ajax(ajaxSettings)
                .done(function (data, status, jqXHR) {
                that.filterServerResponse(jqXHR);
                if (defer) {
                    defer.resolve(data);
                }
            });
        };
        BackendInterop.prototype.ajax = function (ajaxSettings, options) {
            var that = this, defer = lang.Deferred();
            options = options || {};
            that._fixAjaxSettings(ajaxSettings, options);
            if (options.fileDownload) {
                that._downloadFile(ajaxSettings, options, defer);
            }
            else {
                that._executeAjax(ajaxSettings, defer, !!options.suppressAutoLogin);
                if (options.opId) {
                    that._operations[options.opId] = defer;
                    defer.always(function () {
                        delete that._operations[options.opId];
                    });
                }
            }
            return defer.promise();
        };
        BackendInterop.prototype._downloadFile = function (ajaxSettings, options, deferred) {
            var that = this, url = ajaxSettings.url;
            that.traceSource.debug("Downloading file from " + url + " via [" + ajaxSettings.type + "]");
            $.fileDownload(url, {
                data: ajaxSettings.data,
                cookieName: options.cookieName,
                httpMethod: ajaxSettings.type,
                successCallback: function () {
                    that.traceSource.debug("File from " + url + " successfully downloaded");
                    deferred.resolve();
                },
                failCallback: function (response) {
                    var responseJson = null;
                    if (response) {
                        try {
                            responseJson = JSON.parse(response);
                        }
                        catch (e) {
                            // ignore error
                        }
                    }
                    var message = (responseJson && responseJson.message) || resources["interop.download_error"], error = new InteropError(message);
                    error.serverError = responseJson;
                    error.action = "downloadFile";
                    that.traceSource.warn("Error during downloading a file from " + url + ": " + response);
                    deferred.reject(error);
                }
            });
        };
        BackendInterop.prototype._fixAjaxSettings = function (settings, options) {
            var that = this, url, urlDelimiter, headers = "";
            options = options || {};
            if (!settings.url) {
                console.error("BackendInterop: no url was specified for ajax");
            }
            url = that.normalizeUrl(settings.url);
            if (that.preventCaching && !options.suppressCacheBreakthrough && settings.type !== "POST") {
                urlDelimiter = url.indexOf("?") < 0 ? "?" : "&";
                url += urlDelimiter + "tm=" + Date.now();
            }
            url = encodeURI(url);
            if (options.fileDownload) {
                if (options.contentType) {
                    headers = "Accept=" + options.contentType + ";";
                }
                options.cookieName = "fileDownload-" + utils.generateGuid();
                headers += "X-FileDownload=" + options.cookieName;
                urlDelimiter = url.indexOf("?") < 0 ? "?" : "&";
                url += urlDelimiter + ("$headers=" + encodeURIComponent(headers));
            }
            settings.url = url;
            if (options.opId) {
                if (!settings.data) {
                    settings.data = {};
                }
                settings.data.$opId = options.opId;
            }
            if (settings.data) {
                lang.forEach(settings.data, function (v, key) {
                    // NOTE: before 1.35 it was isPlainObject
                    if (v && !lang.isArray(v) && lang.isObject(v)) {
                        // NOTE: if we pass an object in data to jQuery, it'll serialize it into query string as
                        // "{key}[prop_1][prop_1_1]={value of v.prop_1.prop_1_1}"
                        // As it's hard to parse on the server, we're preventing this by manually serializing into json
                        settings.data[key] = JSON.stringify(v);
                    }
                });
            }
            if (that.clientVersion) {
                settings.headers = {
                    "x-client-ver": that.clientVersion
                };
            }
            if (!options.fileDownload) {
                if (options.contentType) {
                    settings.accepts = { "*": options.contentType };
                }
                else {
                    if (lang.stringStartsWith(url, that.config.apiroot + "api/")) {
                        // for api ajax calls setup Accept header as "application/json" by default
                        settings.accepts = lang.extend({ "*": "application/json" }, settings.accepts);
                    }
                }
            }
            if (!settings.type && options.supportsGetPost) {
                urlDelimiter = url.indexOf("?") < 0 ? "?" : "&";
                var possibleUrl = url + urlDelimiter + $.param(settings.data);
                // calculate Query String length for GET request
                var queryLen = possibleUrl.indexOf("?") >= 0
                    ? (possibleUrl.length - possibleUrl.indexOf("?") - 1)
                    : 0;
                // choose HTTP method depending on the length of Query String
                settings.type = queryLen <= core.platform.limits.queryStringMaxLen ? "GET" : "POST";
            }
        };
        BackendInterop.prototype.cancel = function (opId) {
            if (!opId) {
                return;
            }
            var defer = this._operations[opId];
            if (defer) {
                defer.reject(core.eth.canceled());
            }
        };
        BackendInterop.prototype.normalizeUrl = function (url) {
            var root = this.config.apiroot;
            if (root && url) {
                // если это не абсолютный url и он не начинается с корня сайта "/myapp/" или "/", то добавим корень сайта в начало
                // т.е. "http://example.com/myapp" и "/myapp" не трогаем, а "api/load" станет "/myapp/api/load" (или "/api")
                if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0 && url.indexOf(root) !== 0) {
                    url = utils.combinePaths(root, url);
                }
            }
            return url;
        };
        BackendInterop.prototype.createAjaxSettings = function (query) {
            var url = this.apiUrlPrefix;
            if (query.route) {
                url += query.route;
            }
            if (lang.last(url) !== "/") {
                url += "/";
            }
            var data = {};
            var source = query.source;
            if (lang.isArray(source)) {
                url += "_load";
                data.ids = source.map(function (s) {
                    return s.type + "(" + s.id + ")";
                }).join(",");
            }
            else if (typeof source === "string") {
                url += source;
            }
            else {
                url += source.type;
                if (source.id) {
                    url += ("(" + source.id + ")");
                    if (source.propName) {
                        url += "/" + source.propName;
                    }
                }
            }
            // preloads
            if (query.preloads) {
                var expand = typeof query.preloads === "string"
                    ? query.preloads
                    : query.preloads.join(",");
                if (expand) {
                    data.$expand = expand;
                }
            }
            // parameters
            if (query.params) {
                lang.extend(data, query.params);
            }
            return {
                url: url,
                data: data
            };
        };
        /**
         * Load objects by query.
         * @param {Object} query query JSON-object
         * @param {Object|String} query.source name of source to load from, or its specification
         * @param {String} query.source.type Name of the source (e.g. EntityType or DataSource name)
         * @param {String} [query.source.id] objectId when loading a single object
         * @param {String} [query.source.propName] name of navigation property
         * @param {String} [query.type] entityType name of loading objects
         * @param {String} [query.preloads] array of property names or property chains
         * @param {Object} [query.params] query parameters
         * @param {Object} options
         * @param {String} [options.opId] cancellation operation id
         * @param {Boolean} [options.suppressAutoLogin=false]
         * @param {String} [options.contentType] MIME content type of the response (e.g. "application/vnd.ms-excel")
         * @param {Boolean} [options.fileDownload=false] Return result as a file, it makes the browser to open "Save as" dialog
         * @returns {Promise} object for async operation. Continuations arguments:
         *      - done: data - array of domain objects in json-form
         *      - fail: error - json object with parsed server error.
         */
        BackendInterop.prototype.load = function (query, options) {
            if (!query.source) {
                throw new Error("BackendInterop.load: query.source must be specified");
            }
            options = options || {};
            if (options.supportsGetPost === undefined) {
                options.supportsGetPost = true; // supports GET and POST by default
            }
            var ajaxSettings = this.createAjaxSettings(query);
            return this.batching && !options.fileDownload ?
                this._addBatchItem(ajaxSettings, options) :
                this.ajax(ajaxSettings, options);
        };
        /**
         * Save objects.
         * @param objects domain objects in json-form (dto)
         * @param {Object} options
         * @param {Boolean} [options.sync=false] flag for synchronization mode (just add special argument to query string)
         * @param {String|Array} [options.hints] hints for passing to the server
         * @return {JQuery.promise} object for async operation of saving
        */
        BackendInterop.prototype.save = function (objects, options) {
            var that = this, hints, queryStr = "", ajaxSettings;
            options = options || {};
            if (options.sync) {
                queryStr += "?$sync=1";
            }
            if (options.hints) {
                hints = options.hints;
                if (lang.isArray(hints)) {
                    hints = hints.join(",");
                }
                if (queryStr) {
                    queryStr += "&";
                }
                else {
                    queryStr += "?";
                }
                queryStr = queryStr + "$hints=" + hints;
            }
            var action = "_store";
            if (options.action) {
                action = action + "/" + options.action;
            }
            if (options.tx) {
                if (queryStr) {
                    queryStr += "&";
                }
                else {
                    queryStr += "?";
                }
                queryStr = queryStr + "$tx=" + options.tx + "." + Date.now();
            }
            ajaxSettings = {
                url: that.apiUrlPrefix + action + queryStr,
                data: JSON.stringify(objects)
            };
            ajaxSettings.type = "POST";
            ajaxSettings.contentType = "application/json";
            ajaxSettings.processData = false;
            return that.ajax(ajaxSettings, {});
        };
        BackendInterop.prototype.checkConnection = function (httpMethod) {
            var that = this, defer = lang.Deferred(), ajaxSettings;
            try {
                if (navigator && !navigator.onLine) {
                    defer.resolve({ networkOnline: false, serverOnline: false });
                }
                else {
                    // Browser thinks it's online, let's check actual server connectivity
                    ajaxSettings = { url: that.apiUrlPrefix + "ping" };
                    if (httpMethod) {
                        ajaxSettings.type = httpMethod;
                    }
                    that.ajax(ajaxSettings).then(function () {
                        defer.resolve({ networkOnline: true, serverOnline: true });
                    }, function () {
                        defer.resolve({ networkOnline: true, serverOnline: false });
                    });
                }
            }
            catch (error) {
                that.traceSource.error("BackendInterop.checkConnection error: " + error.meesage);
                that.traceSource.error(error);
                defer.resolve({ networkOnline: false, serverOnline: false }); // TOTHINK: ?
            }
            return defer.promise();
        };
        BackendInterop.prototype._isException = function (json) {
            return json && json.$isException;
        };
        BackendInterop.prototype.handleError = function (jqXhr, textStatus) {
            var that = this, status = jqXhr.status, contentType = jqXhr.getResponseHeader("Content-Type") || "", responseJson, exception, message, serverOffline, result;
            if (lang.isObject(jqXhr.responseText)) {
                responseJson = jqXhr.responseText;
            }
            else if (contentType.indexOf("application/json") > -1) {
                responseJson = jqXhr.responseText ? JSON.parse(jqXhr.responseText) : null;
            }
            else if (contentType.indexOf("text/html") > -1) {
                var re = /<meta\s*name="x-custom-error"/im;
                if (re.test(jqXhr.responseText)) {
                    // we've got custom html-response with an error
                    var matches = /<body>([\s\S]*)<\/body>/im.exec(jqXhr.responseText);
                    if (matches && matches.length === 2) {
                        var html = matches[1];
                        if (html) {
                            var tmp = document.createElement("DIV");
                            tmp.innerHTML = html;
                            message = tmp.textContent || tmp.innerText;
                        }
                    }
                }
            }
            // NOTE: responseJson can be a json-object of exception, GroupSaveResult or something else
            // In general we except:
            // - an exception (has message and $isException fields)
            // - some object with error field containing an exception
            // - any other object - in this case we can't parse and understand result and return Error object.
            // Important: In all cases we'll add the following fields into returning object: message, httpStatus
            // Try to extract the error message:
            //	- firstly try to get message from exception
            if (responseJson) {
                // try to extract exception object
                if (that._isException(responseJson)) {
                    exception = responseJson;
                    responseJson = null;
                }
                else if (that._isException(responseJson.error)) {
                    // NOTE: support a special case: a JSON with 'error' field
                    exception = responseJson.error;
                    delete responseJson.error;
                }
                // try to extract message from exception/json result
                if (exception) {
                    message = exception.message;
                }
                else if (responseJson.message) {
                    message = responseJson.message;
                }
                else if (responseJson.error && responseJson.error.message) {
                    message = responseJson.error.message;
                }
            }
            //	- otherwise pickup default message basing on httpStatus
            if (!message) {
                if (status === 404 || status === 503) {
                    if (jqXhr.getResponseHeader("Connection") === "close") {
                        message = resources["interop.server_unavailable"];
                        serverOffline = true;
                    }
                    else {
                        message = resources["interop.resource_or_page_not_found"];
                    }
                }
                else if (status >= 500) {
                    message = resources["interop.server_critical_error"];
                }
                else if (status > 0) {
                    message = resources["interop.server_interaction_error"];
                }
                else {
                    // status=0 means:
                    //	- TCP connection was closed but no http response returned (e.g. due to firewall)
                    //  - connection was aborted by XHR (XHR.abort), it could be aborted by jQuery due to timeout
                    //	- connection was aborted by browser (e.g. due to DNS error or some other network errors)
                    //	- for a GET-request the server returns 301/302/304/307 (redirects) with cross-origin Location
                    // Except connection was aborted by XHR we treat status=0 as "server inaccessibility"
                    message = textStatus === "timeout"
                        ? resources["interop.server_interaction_timeout"]
                        : resources["interop.server_unavailable"];
                    serverOffline = textStatus !== "abort";
                }
            }
            // if responseJson is an exception then convert it into Error object,
            // otherwise we left it to client code
            if (exception) {
                // the response is an exception
                result = that.tryParseException(exception);
                result = lang.appendEx(result, responseJson, { deep: false });
            }
            else if (responseJson) {
                // the response is some json but not an exception
                result = responseJson;
            }
            else {
                // we couldn't parse response as json at all
                result = new Error(message);
                result.serverResponse = jqXhr.responseText;
            }
            if (result && !result.message) {
                result.message = message;
            }
            // serverOffline
            result.serverOffline = result.serverOffline || serverOffline || undefined;
            if (exception) {
                exception.serverOffline = result.serverOffline;
            }
            // httpStatus
            if (result.httpStatus === undefined) {
                result.httpStatus = status;
                if (exception && exception.httpStatus === undefined) {
                    exception.httpStatus = status;
                }
            }
            return result;
        };
        /**
         * Parses json-object of an error from the server.
         * @param {Object} exceptionJson Error from the server
         * @param {Boolean} exceptionJson.containsUserDescription
         * @param {String} exceptionJson.$className Server exception type name
         * @return {Error}
         */
        BackendInterop.prototype.tryParseException = function (exceptionJson) {
            // TODO: support exceptions chains via 'innerException' property
            var handler;
            var error;
            if (exceptionJson.$className) {
                handler = this.exceptionHandlers[exceptionJson.$className];
                if (handler) {
                    error = handler(exceptionJson);
                }
                else if (exceptionJson.$parentClasses && exceptionJson.$parentClasses.length) {
                    // find handlers for base (parent) type of the exception
                    for (var i = 0; i < exceptionJson.$parentClasses.length; i++) {
                        var className = exceptionJson.$parentClasses[i];
                        handler = this.exceptionHandlers[className];
                        if (handler) {
                            error = handler(exceptionJson);
                        }
                    }
                }
                if (!error) {
                    error = new InteropError(exceptionJson.message);
                }
                // copy common props:
                error.serverError = exceptionJson;
                error.hasUserDescription = !!exceptionJson.containsUserDescription || !!exceptionJson.hasUserDescription;
                if (exceptionJson.httpStatus) {
                    error.httpStatus = exceptionJson.httpStatus;
                }
                // TODO: хорошо бы ввести некую идентификацию типов ошибок, не привязанную к типам исключений
                error.$className = exceptionJson.$className;
            }
            return error;
        };
        return BackendInterop;
    }(lang.Observable));
    BackendInterop.mixin({
        HEADER_SERVER_VER: "x-ver",
        appCacheStates: _interop_types_1.AppCacheState,
        exceptionHandlers: {
            "XBusinessLogicException": function (exceptionJson) {
                var error = new BusinessLogicException(exceptionJson.message);
                if (exceptionJson.violations) {
                    var violations = [];
                    for (var i = 0; i < exceptionJson.violations.length; i++) {
                        var srvVio = exceptionJson.violations[i];
                        if (srvVio.items && srvVio.items.length) {
                            violations.push({
                                error: srvVio.message || exceptionJson.message,
                                props: srvVio.items.map(function (item) { return utils.toLowerCamel(item.propertyName); }),
                                // По идее, identity может быть разным для всех элементов, но тут одно из двух - либо показывать все свойства
                                // и обеспечить одинаковый identity при формировании исключения на сервере, либо показывать только первое.
                                // Думается, что первый вариант более правильный, т.к. в противном случае в объекте на клиенте оказываются не все элементы
                                // по "непонятной" причине.
                                object: srvVio.items[0].identity,
                                severity: srvVio.ignorable ? "warning" : "error",
                                description: srvVio.description,
                                rule: srvVio.ruleId
                            });
                        }
                        else {
                            violations.push({
                                error: srvVio.message || exceptionJson.message,
                                severity: srvVio.ignorable ? "warning" : "error",
                                description: srvVio.description,
                                rule: srvVio.ruleId
                            });
                        }
                    }
                    error.violations = violations;
                }
                return error;
            },
            "XOptimisticConcurrencyException": function (exceptionJson) {
                var obsolete = exceptionJson.obsoleteObjects, deleted = exceptionJson.deletedObjects, message;
                if (obsolete && deleted) {
                    if (deleted.length > 0 && obsolete.length === 0) {
                        message = resources["interop.error.OptimisticConcurrency.deleted"];
                    }
                    else if (obsolete.length > 0 && deleted.length === 0) {
                        message = resources["interop.error.OptimisticConcurrency.changed"];
                    }
                }
                message = message || resources["interop.error.OptimisticConcurrency"];
                var error = new OptimisticConcurrencyException(message);
                error.obsoleteObjects = obsolete;
                error.deletedObjects = deleted;
                return error;
            }
            /*			NOTE: кажется логичным трактовать недоступность СУБД как "недоступность сервера",
             однако это имеет побочные эффекты: при синхронизации, которая падает с XStorageInaccessibilityException,
             меняется состояние на serverOnline=false, потом делает ping, который успешен,
             и состояние меняется обратно serverOnline=true.
             В этоге постоянно отображается множество нотификаций "Восстановлена связь с сервером".
    
             "XStorageInaccessibilityException": function (responseJson, error) {
             error.serverOffline = true;
             //responseJson.message = resources["interop.error.StorageInaccessibility"];
             }
             */
        }
    });
    var BusinessLogicException = /** @class */ (function (_super) {
        __extends(BusinessLogicException, _super);
        function BusinessLogicException() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return BusinessLogicException;
    }(Error));
    var InteropError = /** @class */ (function (_super) {
        __extends(InteropError, _super);
        function InteropError(message) {
            var _this = _super.call(this) || this;
            _this.name = "InteropError";
            _this.message = message;
            return _this;
        }
        return InteropError;
    }(Error));
    var OptimisticConcurrencyException = /** @class */ (function (_super) {
        __extends(OptimisticConcurrencyException, _super);
        function OptimisticConcurrencyException(message) {
            var _this = _super.call(this, message) || this;
            _this.name = "OptimisticConcurrencyError";
            return _this;
        }
        return OptimisticConcurrencyException;
    }(InteropError));
    core.interop = core.interop || {};
    core.interop.BackendInterop = BackendInterop;
    return BackendInterop;
});
//# sourceMappingURL=BackendInterop.js.map