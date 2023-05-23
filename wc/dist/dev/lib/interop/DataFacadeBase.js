/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "i18n!lib/nls/resources"], function (require, exports, core, resources) {
    "use strict";
    /**
     * Load data.
     * @function load
     * @memberOf DataFacadeBase.prototype
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
     * @returns {Promise}
     */
    var DataFacadeBase = /** @class */ (function (_super) {
        __extends(DataFacadeBase, _super);
        /**
         * @constructs DataFacadeBase
         * @extends Observable
         * @param {BackendInterop} interop
         * @param {EventPublisher} [eventPublisher]
         */
        function DataFacadeBase(interop, eventPublisher) {
            var _this = _super.call(this) || this;
            var that = _this;
            if (!interop) {
                throw new Error("DataFacade.constructor: interop is null");
            }
            /** @type BackendInterop */
            that._interop = interop;
            if (interop.bind) {
                interop.bind("server_version_changed", that._onServerVersionChanged, that);
            }
            if (eventPublisher) {
                that.setEventPublisher(eventPublisher);
            }
            return _this;
        }
        DataFacadeBase.prototype.setEventPublisher = function (eventPublisher) {
            this.eventPublisher = eventPublisher;
        };
        DataFacadeBase.prototype._publishEvent = function (eventName, eventArgs) {
            var eventPublisher = this.eventPublisher;
            if (eventPublisher) {
                eventPublisher.publish(eventName, eventArgs);
            }
        };
        /**
         * @param query
         * @protected
         */
        DataFacadeBase.prototype._normalizeQuery = function (query) {
            /*
                    if (!query.source && query.type)
                        query.source = query.type;
            */
            return query;
        };
        /**
         * Load objects from server via BackendInterop and publish event.
         * @param {Object} query
         * @param {Object} options
         * @returns {Promise}
         * @protected
         */
        DataFacadeBase.prototype._load = function (query, options) {
            var that = this, promise = that._interop.load(query, options);
            if (!options.suppressProcessEvent) {
                that._publishEvent("interop.load", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.process,
                    priority: "normal",
                    message: resources.loading,
                    promise: promise
                }));
            }
            return promise;
        };
        /**
         * Call server via Ajax
         * @param {Object|String|Function} ajaxSettings Ajax settings as for jQuery.ajax()
         * @param {Object} [options] additional options
         * @param {Boolean} [options.suppressEventOnError=false] do not publish pub/sub event on an error
         * @param {Boolean} [options.suppressAutoLogin=false] do not make auto login in case of a 401 response
         * @param {Boolean} [options.suppressCacheBreakthrough=false] do not add timestamp into query string for GET-request
         * @param {Object} [options.processEvent] data of notification event (kind=process) to override default
         * @param {Boolean} [options.suppressProcessEvent=false] do not publish pub/sub event for process
         * @return {*}
         */
        DataFacadeBase.prototype.ajax = function (ajaxSettings, options) {
            var that = this, settings, eventData, promise;
            if (core.lang.isString(ajaxSettings)) {
                settings = { url: ajaxSettings };
            }
            else if (core.lang.isFunction(ajaxSettings)) {
                settings = ajaxSettings();
            }
            else {
                settings = ajaxSettings;
            }
            options = options || {};
            promise = this._interop.ajax(settings, options)
                .done(function () {
                that._onAjaxSuccess(settings, options);
            }).fail(function (error) {
                that._onAjaxFail(error, settings, options);
            });
            if (!options.suppressProcessEvent) {
                eventData = core.lang.extend({
                    priority: "normal",
                    message: options.fileDownload ? resources["interop.downloading_file"] :
                        (settings.type === "POST" ? resources["interop.sending_data"] : resources.loading)
                }, options.processEvent, {
                    kind: core.SystemEvent.Kind.process,
                    promise: promise
                });
                that._publishEvent("interop.ajax", core.SystemEvent.create(eventData));
            }
            return promise;
        };
        DataFacadeBase.prototype._onAjaxSuccess = function (settings, options) {
        };
        DataFacadeBase.prototype._onAjaxFail = function (error, settings, options) {
            var action = (error && error.action || "ajax");
            this._handleInteropError(action, error, options);
        };
        /**
         * Cancel operation with id equals to opId.
         * @param {String} opId
         * @param {Object} [options]
         * @param {Boolean} [options.clientOnly] do not call server controller (api/cancel)
         * @returns {Promise}
         */
        DataFacadeBase.prototype.cancel = function (opId, options) {
            var that = this, settings = {
                url: "api/_cancel?$opId=" + opId,
                type: "POST"
            };
            options = options || {};
            that._interop.cancel(opId);
            if (!options.clientOnly) {
                return that._interop.ajax(settings);
            }
        };
        DataFacadeBase.prototype.beginBatch = function () {
            if (this._interop.beginBatch)
                this._interop.beginBatch();
        };
        DataFacadeBase.prototype.completeBatch = function () {
            if (this._interop.completeBatch)
                this._interop.completeBatch();
        };
        /**
         *
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} [options]
         * @param {String} [reason] "load" or "save" (default)
         * @protected
         * @fires DataFacadeBase#update
         */
        DataFacadeBase.prototype._triggerUpdate = function (objects, options, reason) {
            if (!objects || !objects.length) {
                return;
            }
            var that = this, args = {
                objects: objects,
                caller: options ? options.caller : null,
                reason: reason || "save"
            };
            // TODO: TOTHINK: м.б. надо асинхронно через window.setTimeout?
            /**
             * Objects change.
             * @event DataFacadeBase#update
             * @type {Object}
             * @property {Array} objects Domain objects in json-form (dto)
             * @property {*} caller An object which called DataFacade.save method
             * @property {String} reason A reason of updating objects: "save" or "load"
             */
            that.trigger("update", that, args);
        };
        /**
         * Handler to call on any error during remote save.
         * @param {Array} objects Json objects were being saved
         * @param {Object} error An error object got from BackendInterop.save
         * @param {Object} options Save options - the same as DataFacade.save
         * @param {jQuery.Deferred} defer Deferred to reject with normalized error
         * @protected
         */
        DataFacadeBase.prototype._onRemoteSaveError = function (objects, error, options, defer) {
            var that = this, event;
            // save operation can return json result (not exception) with 'error' field of type exception
            if (error.error && error.error.$isException) {
                error = that.errorFromJson(error.error);
            }
            options = options || {};
            if (!options.suppressEventOnError) {
                event = that.createSaveErrorEvent(error, options, objects);
                if (event) {
                    that._publishEvent("interop.save.error", event);
                }
            }
            if (defer) {
                defer.reject(error);
            }
            // interop error contains a list of obsolete deleted objects
            if (core.eth.isOptimisticConcurrency(error)) {
                var deletedObjects = error.deletedObjects;
                if (deletedObjects) {
                    that._triggerUpdateObsolete(deletedObjects, options);
                }
            }
        };
        DataFacadeBase.prototype._triggerUpdateObsolete = function (objects, options) {
            if (!objects || !objects.length) {
                return;
            }
            var that = this, args = {
                objects: null,
                deletedObjects: objects,
                caller: options ? options.caller : null,
                reason: "save"
            };
            window.setTimeout(function () {
                that.trigger("update", that, args);
            });
        };
        /**
         * Create a SystemEvent for save error.
         * @param {Object} error An error object got from BackendInterop.save
         * @param {Object} options Save options - the same as DataFacade.save
         * @param {Array<DomainObjectData>} objects Json objects were being saved
         * @returns {SystemEvent}
         */
        DataFacadeBase.prototype.createSaveErrorEvent = function (error, options, objects) {
            var event = this.createInteropErrorEvent("save", error);
            event.message = resources["interop.save.failed"] + ". " + event.message;
            event.priority = "high";
            // TODO: добавить операции Retry/Cancel, см. ObjectList.createAsyncSaveErrorEvent, надо вынести оттуда, чтобы также использовалось по умолчанию в дереве и любых других контекстах
            return event;
        };
        /**
         * Create a SystemEvent for save success.
         * @param {Object} response Server response
         * @returns {SystemEvent}
         */
        DataFacadeBase.prototype.createSaveSuccessEvent = function (response) {
            if (response && response.error) {
                // success but with warning
                return new core.SystemEvent({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "normal",
                    severity: "warning",
                    message: resources["interop.save.success_with_warning"] + ": " + response.error.message
                });
            }
            return new core.SystemEvent({
                kind: core.SystemEvent.Kind.notification,
                priority: "low",
                severity: "success",
                message: resources["interop.save.success"]
            });
        };
        DataFacadeBase.prototype._handleInteropError = function (action, error, options) {
            var that = this;
            if (!options || !options.suppressEventOnError) {
                that._publishEvent("interop.error", that.createInteropErrorEvent(action, error));
            }
        };
        /**
         * Create a SystemEvent for a general interop error
         * @param {String} action Executed action ("save", "load", "ajax" and so on)
         * @param {Object} error An error from the server parsed with BackendInterop.tryParseException
         * @return {SystemEvent}
         */
        DataFacadeBase.prototype.createInteropErrorEvent = function (action, error) {
            var menu;
            if (error && error.serverError && this._interop.config.isDebug) {
                menu = core.ui.Menu.create({ items: [{
                            name: "Debug",
                            command: core.createCommand({
                                execute: function () {
                                    var errorText = JSON.stringify(error.serverError, null, 2).replace(/\\r\\n/g, "\n").replace(/\\\\/g, "\\");
                                    core.ui.Dialog.create({
                                        header: "Server error debug info",
                                        menu: { remove: ["cancel"] },
                                        html: "<pre class='x-modal-error-info'>" + core.lang.encodeHtml(errorText) + "</pre>"
                                    }).render();
                                    return false;
                                }
                            })
                        }] });
            }
            return core.SystemEvent.create({
                kind: core.SystemEvent.Kind.notification,
                priority: "normal",
                severity: (error && error.hasUserDescription) ? "warning" : "error",
                message: (error && error.message)
                    ? error.message
                    : resources["interop.error.default"],
                error: error,
                menu: menu
            });
        };
        DataFacadeBase.prototype.createServerVersionChangedEvent = function (data) {
            return core.SystemEvent.create({
                kind: core.SystemEvent.Kind.actionRequest,
                // TODO: может priority="max"?
                message: core.safeHtml(resources["interop.server_version_changed.html"], resources["interop.server_version_changed"]),
                severity: "warning",
                uid: "interop.server_version_changed",
                data: data,
                menu: { hidden: true,
                    items: [{
                            name: "Reload",
                            title: resources["reload"],
                            command: core.createCommand({
                                execute: function () {
                                    /*if (window.applicationCache) {
                                     window.applicationCache.swapCache()
                                    }*/
                                    window.location.reload();
                                }
                            })
                        }
                        // TODO: команда "Игнорировать"/"Отложить" (возможно настраиваемая) ?
                        // или например в зависимости от разности версии: 1.0.0 => 2.0.0 не игнорируемая, 1.1.0 => 1.2.0 игнорируемая
                    ] }
            });
        };
        DataFacadeBase.prototype._onServerVersionChanged = function (args) {
            if (!args || args.oldVersion) {
                this._publishEvent("interop.server_version_changed", this.createServerVersionChangedEvent(args ? {
                    // for backward compatibility:
                    version: args.newVersion,
                    newVersion: args.newVersion,
                    oldVersion: args.oldVersion
                } : {
                    oldVersion: -1
                }));
            }
        };
        DataFacadeBase.prototype._objectsFromResponse = function (response, query) {
            if (!response) {
                return [];
            }
            var result, more;
            // substitute __metadata.type from query.type
            result = [].concat(response.result || []).filter(function (obj) {
                // TOTHINK: should we substitute id from query.source.id?
                if (!obj || !obj.id) {
                    return false;
                }
                // TODO: почему бы не взять сначала obj.__metadata.type?
                if (query.type) {
                    obj.__metadata = core.lang.append(obj.__metadata || {}, { type: query.type });
                    return true;
                }
                return !!(obj.__metadata && obj.__metadata.type);
            });
            // NOTE: query.type isn't suitable for objects in 'more'
            more = [].concat(response.more || []).filter(function (obj) {
                return !!(obj && obj.id && obj.__metadata && obj.__metadata.type);
            });
            return result.concat(more);
        };
        /**
         * Updates `objects` with data from server response (`response`).
         * @param {Array} objects Objects were being saved
         * @param {Object} response Response from DomainController
         * @param {Boolean} [repeated] Whether objects were already updated from another response
         * @protected
         */
        DataFacadeBase.prototype._updateSaved = function (objects, response, repeated) {
            var that = this, processedObjects = {};
            objects.forEach(function (obj) {
                var newId, updatedObj;
                if (!repeated) {
                    obj.__metadata.ts = obj.__metadata.ts + 1 || 1;
                    delete obj.__metadata.isNew;
                }
                // try to find newId
                if (response && response.newIds && response.newIds.length) {
                    response.newIds.some(function (o) {
                        if (o.id === obj.id && o.type === obj.__metadata.type) {
                            newId = o.newId;
                            return true;
                        }
                        return false;
                    });
                }
                // try to find updatedObj with new values of properties
                if (response && response.updatedObjects && response.updatedObjects.length) {
                    for (var i = 0; i < response.updatedObjects.length; i++) {
                        var o = response.updatedObjects[i];
                        if (o.id === (newId || obj.id) && o.__metadata.type === obj.__metadata.type) {
                            updatedObj = o;
                            // memorize the fact that we've processed the object
                            processedObjects[i] = true;
                            break;
                        }
                    }
                }
                // set __newValues
                if (newId) {
                    obj.__newValues = { id: newId };
                }
                that._setNewValuesFromResponse(updatedObj, obj);
            });
            if (response && response.updatedObjects && response.updatedObjects.length) {
                // now process objects in 'updatedObjects' which were not sent from the client (absent in 'objects')
                // BUT they should be updated as well
                core.lang.forEach(response.updatedObjects, function (obj, index) {
                    if (processedObjects[index]) {
                        return;
                    }
                    var newObj = obj;
                    that._setNewValuesFromResponse(obj, newObj);
                    if (!newObj.__metadata.ts) {
                        newObj.__newValues.__incrementTs = true;
                    }
                    objects.push(newObj);
                });
            }
        };
        DataFacadeBase.prototype._setNewValuesFromResponse = function (objFrom, objTo) {
            if (objFrom) {
                objTo.__newValues = objTo.__newValues || {};
                // copy all values from updatedObj except __metadata and id
                core.lang.forEach(objFrom, function (v, name) {
                    // in case of the same source and target objects
                    if (name === "__newValues")
                        return;
                    if (name === "__metadata") {
                        if (objFrom.__metadata.ts) {
                            objTo.__metadata.ts = objFrom.__metadata.ts;
                        }
                    }
                    else if (name !== "id") {
                        objTo.__newValues[name] = v;
                    }
                });
            }
            // delete resourceId for binary properties values
            core.lang.forEach(objTo, function (v, name) {
                if (v && v.$value === "LobPropValue") {
                    objTo.__newValues = objTo.__newValues || {};
                    v = core.lang.clone(v);
                    delete v.resourceId;
                    objTo.__newValues[name] = v;
                }
            });
        };
        DataFacadeBase.prototype._updateFromNewValues = function (objects) {
            objects.forEach(function (obj) {
                if (obj.__newValues) {
                    // WAS:
                    //if (obj.__newValues.__aux) {
                    //	obj.__aux = core.lang.extend(obj.__aux || {}, obj.__newValues.__aux);
                    //	delete obj.__newValues.__aux;
                    //}
                    //core.lang.extend(obj, obj.__newValues);
                    core.lang.forEach(obj.__newValues, function (v, name) {
                        if (name === "id" || name === "__incrementTs") {
                            return;
                        }
                        if (name === "__aux") {
                            obj.__aux = core.lang.extend(obj.__aux || {}, v);
                            return;
                        }
                        obj[name] = v;
                    });
                }
            });
        };
        DataFacadeBase.prototype.errorFromJson = function (exceptionJson) {
            return this._interop.tryParseException(exceptionJson);
        };
        return DataFacadeBase;
    }(core.lang.Observable));
    return DataFacadeBase;
});
//# sourceMappingURL=DataFacadeBase.js.map