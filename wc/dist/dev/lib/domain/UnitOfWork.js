/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "./support", "./DomainObject", "./DomainObjectRegistry", "lib/core.eth"], function (require, exports, lang, support, DomainObject, DomainObjectRegistry, eth) {
    "use strict";
    var DomainObjectLocalState = DomainObject.LocalState;
    /**
     * Creates an instance of domain object or a ghost
     * @callback CreateInstanceCallback
     * @param {Object} model
     * @param {String} typeName
     * @param {String} [id]
     * @returns {Object}
     */
    var UnitOfWork = /** @class */ (function (_super) {
        __extends(UnitOfWork, _super);
        /**
         * Unit of work
         * @constructs UnitOfWork
         * @extends Observable
         * @param {Object} model
         * @param {DataFacadeBase} dataFacade
         * @param {Object} [options]
         * @param {boolean} [options.connected] Subscribe on DataFacade's 'update' event
         */
        function UnitOfWork(model, dataFacade, options) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.model = model;
            that._objects = new DomainObjectRegistry(model, that);
            /**
             * @type {DataFacadeBase}
             * @private
             */
            that._dataFacade = dataFacade;
            if (options && options.connected && lang.Observable.isObservable(that._dataFacade)) {
                that._dataFacade.bind("update", that._onDataUpdate, that);
            }
            return _this;
        }
        UnitOfWork.prototype.dispose = function () {
            var that = this;
            // unbind
            if (lang.Observable.isObservable(that._dataFacade)) {
                that._dataFacade.unbind("update", null, that);
            }
            // dispose all objects
            that._objects.forEach(function (obj) {
                obj.dispose();
            });
            _super.prototype.dispose.call(this);
        };
        /**
         * Returns all non-ghost objects in UnitOfWork.
         */
        UnitOfWork.prototype.all = function () {
            return this._objects.all().filter(function (obj) {
                return !obj.isGhost;
            });
        };
        /**
         * Iterates through all non-ghost objects.
         * @param {(obj: DomainObject) => void} callback
         * @param context A context (this) for the callback
         */
        UnitOfWork.prototype.forEach = function (callback, context) {
            return this._objects.forEach(function (obj) {
                if (!obj.isGhost) {
                    callback.call(context, obj);
                }
            });
        };
        /**
         * Attach an object to this UnitOfWork. If the object is attached to another UoW, it'll detached first.
         * @param {IDomainObject} obj
         * @param {ChangeOptions} options
         * @return {IDomainObject}
         */
        UnitOfWork.prototype.attach = function (obj, options) {
            var that = this;
            if (!obj.meta) {
                throw new Error("UnitOfWork.attach: cannot attach not a DomainObject");
            }
            if (obj.uow && obj.uow === that) {
                return obj;
            }
            var obj2 = obj;
            if (obj2._localState === DomainObjectLocalState.invalid) {
                throw new Error("UnitOfWork.attach: cannot attach invalid object");
            }
            if (obj.uow) {
                obj.uow.detach(obj);
            }
            that._objects.add(obj, options);
            if (!obj.isGhost) {
                obj.bind("change:localState", that._onObjectChanged, that);
                if (obj.hasChanges()) {
                    this._setHasChanges(true);
                }
            }
            return obj;
        };
        /**
         * Detach an object from the current UnitOfWork. If the object is attached to other UoW, do nothing.
         * @param {IDomainObject} obj
         * @param {ChangeOptions} options
         * @return {IDomainObject}
         */
        UnitOfWork.prototype.detach = function (obj, options) {
            var that = this;
            if (!obj.meta) {
                return;
            }
            if (obj.uow && obj.uow !== this) {
                // the object is from foreign UoW,
                return;
            }
            that._objects.remove(obj, options);
            if (!obj.isGhost) {
                obj.unbind("change:localState", null, that);
                if (obj.hasChanges()) {
                    that._calculateHasChanged();
                }
            }
            return obj;
        };
        UnitOfWork.prototype._onObjectChanged = function (obj, newState) {
            // NOTE: the state of a single object can't be changed to zero. It's only possible as a result of
            // calling acceptState() or rollbackState()
            if (newState > 0) {
                this._setHasChanges(true);
            }
        };
        UnitOfWork.prototype._calculateHasChanged = function () {
            var hasChanges = this._objects.some(function (obj) {
                return !obj.isGhost && obj.hasChanges();
            });
            this._setHasChanges(hasChanges);
        };
        UnitOfWork.prototype.hasChangesSince = function (stateName) {
            return this._objects.some(function (obj) {
                return !obj.isGhost && obj.hasChangesSince(stateName);
            });
        };
        UnitOfWork.prototype.find = function (type, id, options) {
            var obj = this._objects.find(support.typeNameOf(type), id), found = obj &&
                ((options && options.ghost) || !obj.isGhost) &&
                ((options && options.removed) || obj._localState < obj.localStates.removed || (options && options.ghost && obj._localState === undefined));
            return found ? obj : undefined;
        };
        UnitOfWork.prototype.create = function (type, props) {
            var that = this, obj = that.model.factory.createObject(that.model, support.typeNameOf(type));
            that._initNewObject(obj);
            that.attach(obj);
            // установим переданные свойства
            // NOTE: объект должен быть уже присоединен к UoW, так как при установке навигируемых
            // свойств возможна синхронизация с другими объектами.
            if (props) {
                obj.set(props);
            }
            return obj;
        };
        /**
         * Find an object by type and id. If an object is not found a ghost object will be created.
         * @param {Class|String} type
         * @param {String} id
         * @param {Object} [options]
         * @param {CreateInstanceCallback} [options.create] A function which creates the desired object, if it is not found in the UoW.
         * @returns {*}
         */
        UnitOfWork.prototype.get = function (type, id, options) {
            var that = this, typeName = support.typeNameOf(type), obj = that._objects.find(typeName, id);
            if (!obj) {
                obj = options && options.create ?
                    options.create(that.model, typeName, id) :
                    that.model.factory.createGhost(that.model, typeName, id);
                that.attach(obj);
            }
            return obj;
        };
        UnitOfWork.prototype.remove = function (obj, options) {
            var that = this;
            // объект уже может удаляться при каскадном удалении.
            // к объекту может вести несколько путей с каскадным удалением, поэтому полагаться на один флаг нельзя
            if (obj.__removing) {
                return;
            }
            // уже detached, либо
            if (!obj.uow) {
                return;
            }
            try {
                obj.__removing = true;
                options = options || {};
                // ищем свойства, которые ссылаются на тип удаляемого объекта
                var propRefs = support.propRefsTo(obj.meta);
                // удаляем все ссылки от существующих объектов
                var objectRefs = that._objects.objectRefsTo(obj, propRefs), localStates = obj.localStates;
                for (var _i = 0, objectRefs_1 = objectRefs; _i < objectRefs_1.length; _i++) {
                    var ref = objectRefs_1[_i];
                    if (ref.prop.onDelete === "cascade") {
                        // каскадное удаление
                        that.remove(ref.object, options);
                    }
                    else if (ref.prop.onDelete === "removeRelation" ||
                        options.norollback ||
                        obj._localState === localStates.created ||
                        ref.object._localState === localStates.created) {
                        // разрываем связь для с removeRelation, а также если задана опция norollback или
                        // если хотя бы один из двух объектов новый
                        support.removeFromNavProp(ref.object, ref.prop, obj.id, options);
                    }
                }
                // добавляем отложенные действия для объектов, которые могут быть загружены потом
                for (var _a = 0, propRefs_1 = propRefs; _a < propRefs_1.length; _a++) {
                    var prop = propRefs_1[_a];
                    if (prop.onDelete === "cascade" ||
                        prop.onDelete === "removeRelation" ||
                        options.norollback) {
                        that._objects.pendingRemove(prop, "*", obj.id, options);
                    }
                }
                if (obj._localState === localStates.created) {
                    // если объект был создан в последнем состоянии, то его можно выкинуть из UoW
                    if (support.states.topUndoState(obj).localState === localStates.created) {
                        that.detach(obj, options);
                    }
                    // новый объект становится невалидным после удаления
                    support.setLocalState(obj, localStates.invalid, options);
                }
                else if (obj._localState === localStates.invalid) {
                    // если объект стал невалидным в последнем состоянии, то его можно выкинуть из UoW
                    if (support.states.topUndoState(obj).localState === localStates.invalid) {
                        that.detach(obj, options);
                    }
                }
                else {
                    if (obj.isGhost) {
                        // not-loaded, replace it with a empty loaded
                        that.detach(obj, options);
                        obj = that.model.factory.createObject(that.model, obj.meta.name, obj.id);
                        that.attach(obj, { norollback: true });
                    }
                    support.setLocalState(obj, localStates.removed, options);
                }
            }
            finally {
                delete obj.__removing;
            }
        };
        /**
         * Наполняет текущую единицу работы данными одного или нескольких объектов в виде json.
         * Если объект не существует в единице работы, то он добавляется.
         * По умолчанию обновляются значения оригинальных свойств объекта (управляется опцией dirty);
         * @param {Object|Array} json Данные объекта в виде json или массив таких данных
         * @param {Object} [options] Дополнительные опции:
         * @param {Boolean} [options.dirty] Признак недостоверных данных: true - обновляются текущие свойства объекта; false - оригинальные
         * @return {DomainObject|Array}
         */
        UnitOfWork.prototype.fromJson = function (json, options) {
            if (options === void 0) { options = {}; }
            var that = this, propOptions = { original: !options.dirty, norollback: !options.dirty };
            return lang.select(json, function (jsonObj) { return that._fromJsonObject(jsonObj, options, propOptions); });
        };
        /**
         * Parses DataFacade.load's response and maps its to DomainObjects
         * @param {Object} serverResponse Response from dataFacade.load
         * @param {Object} [options] options for `DomainObject.fromJson`
         * @return {DomainObject|Array}
         */
        UnitOfWork.prototype.fromServerResponse = function (serverResponse, options) {
            options = lang.setValue(options, "norollback", true);
            if (serverResponse.more) {
                this.fromJson(serverResponse.more, options);
            }
            if (serverResponse.result) {
                return this.fromJson(serverResponse.result, options);
            }
            return [];
        };
        /**
         * Наполняет текущую единицу работы данными объекта в виде json.
         * Если объект не существует в единице работы, то он добавляется.
         * По умолчанию обновляются значения оригинальных свойств объекта (управляется опцией dirty);
         * @prototype
         * @param {Object} json Данные объекта в виде json
         * @param {Object} options Опции
         * @param {Object} propOptions Дополнительные опции для установки свойств
         * @return {DomainObject}
         */
        UnitOfWork.prototype._fromJsonObject = function (json, options, propOptions) {
            if (!json) {
                return null;
            }
            if (!json.__metadata || !json.__metadata.type) {
                throw new Error("Invalid json data of DomainObjectData, no __metadata or type field");
            }
            var that = this, local = that.find(json.__metadata.type, json.id, { removed: true, ghost: true }), obj;
            if (local && !local.isGhost) {
                obj = local.fromJson(json, options, propOptions);
            }
            else {
                obj = that.model.factory.createObject(that.model, json.__metadata.type, json.id);
                if (json.__metadata.isNew) {
                    that._initNewObject(obj);
                }
                else {
                    // set default values for temp properties
                    obj.clear({
                        norollback: true,
                        suppressEvents: true,
                        propFilter: function (propMeta) {
                            return propMeta.temp;
                        }
                    });
                }
                // NOTE: we have to attach the object before calling 'fromJson' method, otherwise navigation properties will not be synchronized
                that.attach(obj, propOptions);
                // fill the object
                obj.fromJson(json, options, propOptions);
                if (local) {
                    // trigger 'load' for the ghost
                    local.trigger("load", local, { loaded: obj });
                }
            }
            return obj;
        };
        /**
         * Initialize just created new object
         * @param obj
         */
        UnitOfWork.prototype._initNewObject = function (obj) {
            obj.isLoaded = true;
            support.setLocalState(obj, obj.localStates.created);
            // set default values for all properties
            obj.clear({ norollback: true, suppressEvents: true });
        };
        /**
         * Load an object by id.
         * Guarantees that all specified preloads will be loaded (even if the dataFacade doesn't support preloads)
         * @param {String} type Name of object type (entity)
         * @param {String} id ObjectID
         * @param {Object} [options]
         * @param {Boolean} [options.reload] reload the object in any case otherwise it'll be loaded only if it's !isLoaded
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.load = function (type, id, options) {
            if (options === void 0) { options = {}; }
            var that = this;
            if (options.reload) {
                return that.reload(type, id, options);
            }
            var obj = that.find(type, id) || that._doLoad(type, id, options);
            return lang.async.then(obj, function (loaded) { return that.ensureLoaded(loaded, options); });
        };
        /**
         * Reload an object by id.
         * Guarantees that all specified preloads will be reloaded (even if the dataFacade doesn't support preloads)
         * @param {String} type EntityType
         * @param {String} id ObjectId
         * @param {Object} [options]
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.reload = function (type, id, options) {
            if (options === void 0) { options = {}; }
            var that = this, uow2;
            if (!options.preloads) {
                return that._doLoad(type, id, options);
            }
            // NOTE: it's difficult to determine whether a preload was really loaded from dataFacade or already was in UoW.
            // So load objects in a separate UoW (without 'reload' option) and merge results then.
            // NOTE (for commented code): it would be great to create an instance of the same class,
            // but we don't know arguments of its constructor (particularly, constructors of child classes
            // for concrete models get only one arguments - dataFacade)
            //uow2 = new that.constructor(that.model, that._dataFacade);
            uow2 = new UnitOfWork(that.model, that._dataFacade);
            delete options.reload; // should we clone options before?
            return lang.async.then(uow2.load(type, id, options), function () {
                var json = uow2.all().map(function (o) { return o.toJson({ aux: true }); });
                that.fromJson(json);
                return that.find(type, id);
            }).always(function () {
                uow2.dispose();
            });
        };
        /**
         * Ensures that the object and all preload (if any) will be loaded (even if the dataFacade doesn't support preloads).
         * @param {DomainObject|NotLoadedObject} obj The real domain object or the ghost object.
         * @param {Object} [options]
         * @param {Boolean} [options.reload] reload the object in any case otherwise it'll be loaded only if it's !isLoaded
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.ensureLoaded = function (obj, options) {
            if (options === void 0) { options = {}; }
            var that = this, objLocal, preloads = options.preloads, deferred;
            if (options.reload && (!obj["isNew"] || !obj["isNew"]())) {
                // prevent reload for new object
                return that.reload(obj.meta.name, obj.id, options);
            }
            if (!obj.isLoaded) {
                objLocal = that.find(obj.meta.name, obj.id);
                if (objLocal) {
                    obj = objLocal;
                }
            }
            deferred = lang.when(obj && obj.isLoaded ? obj : that._doLoad(obj.meta.name, obj.id, options));
            if (!preloads || !preloads.length) {
                return deferred;
            }
            return deferred.then(function (loaded) {
                var preloadArray = typeof preloads === "string" ? preloads.split(/\s*,\s*/) : preloads;
                // TODO: здесь происходит параллельная загрузка прелоадов, это очень плохо, т.к. ветки могут быть параллельные
                // например для объекта User загружают "groups.users" и "groups.owner" -
                // если изначально свойство groups незагружено, то будет выволнены два параллельных запроса для groups
                // (с предлоадом "users" и "owner")
                return lang.whenAll(preloadArray.map(function (path) {
                    return that._loadPath(loaded, path, options);
                })).then(function () {
                    return loaded;
                });
            });
        };
        /**
         * Load an object from DataFacade.
         * @private
         * @param {String} type Name of object type (entity)
         * @param {String} id ObjectID
         * @param {Object} options
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype._doLoad = function (type, id, options) {
            var that = this, typeName = support.typeNameOf(type), query = {
                source: {
                    type: typeName,
                    id: id
                },
                type: typeName
            };
            return that._dataLoad(query, options)
                .then(function (response) {
                if (!response || !response.result) {
                    return lang.rejected(support.errors.createObjectNotFound(typeName, id));
                }
                try {
                    var result = that.fromServerResponse(response), obj = lang.isArray(result) ? support.findObjectByIdentity(result, typeName, id) : result;
                    if (!obj) {
                        return lang.rejected(support.errors.createObjectNotFound(typeName, id));
                    }
                    return obj;
                }
                catch (ex) {
                    return lang.rejected(ex);
                }
            });
        };
        /**
         * Load the value of the property (even if it is already loaded). The property can be navigation or simple.
         * Take into account, that this method may not load all preloads if the dataFacade doesn't support preloads.
         * @param {String} type Name of object type (entity)
         * @param {String} id ObjectID
         * @param {String} propName The name of the property
         * @param {Object} [options]
         * @param {String} [options.preloads]
         * @param {Boolean} [options.reload]
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.loadProp = function (type, id, propName, options) {
            if (options === void 0) { options = {}; }
            var that = this, typeName = support.typeNameOf(type), obj = !options.reload ? that.find(typeName, id) : undefined;
            if (obj) {
                return that.ensurePropLoaded(obj, propName, options);
            }
            var propMeta = that.model.meta.entities[typeName].props[propName];
            return that._doLoadProp(type, id, propMeta, options);
        };
        /**
         * Ensures that the property is loaded.
         * Take into account, that this method may not load all preloads if the dataFacade doesn't support preloads.
         * @param {DomainObject} obj The domain object.
         * @param {String} propName
         * @param {Object} [options]
         * @param {String} [options.preloads]
         * @param {Boolean} [options.reload]
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.ensurePropLoaded = function (obj, propName, options) {
            if (options === void 0) { options = {}; }
            var that = this, propMeta = obj.getPropMeta(propName), v;
            if (!options.reload) {
                v = obj.get(propName);
                if ((v && v.isNotAuthorized) ||
                    (propMeta.vt === "object" ? v === null || v.isLoaded : v !== undefined)) {
                    return lang.resolved(v);
                }
            }
            if (obj.isInvalid()) {
                // prevent loading prop of an invalid object - set the prop value to null
                support.setPropRaw(obj, propMeta, null, { original: true });
                return lang.resolved(obj.get(propName));
            }
            if (obj.isNew()) {
                // created object cannot be loaded from server
                if (propMeta.vt === "object") {
                    // navigation prop can contains not loaded objects, but we can't load prop as usual, we have to load objects
                    var navProp = (options.reload ? obj.get(propName) : v);
                    return navProp.load();
                }
                else {
                    return lang.resolved(options.reload ? obj.get(propName) : v);
                }
            }
            return that._doLoadProp(obj.meta.name, obj.id, propMeta, options);
        };
        /**
         * Load the value of the property from DataFacade.
         * @private
         * @param {String} type Name of object type (entity)
         * @param {String} id ObjectID
         * @param {String} propMeta The metadata of the navigation property
         * @param {Object} options
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype._doLoadProp = function (type, id, propMeta, options) {
            var that = this, typeName = support.typeNameOf(type), propName = propMeta.name, query = {
                source: {
                    type: typeName,
                    id: id,
                    propName: propName
                },
                type: (propMeta.vt === "object" && propMeta.ref.name) || typeName
            };
            if (propMeta.temp) {
                return lang.resolved(undefined);
            }
            return that._dataLoad(query, options)
                .then(function (response) {
                try {
                    var parentObj = that.find(type, id, { removed: true }), 
                    //parentJson: DomainObjectData,
                    v = void 0;
                    if (propMeta.vt !== "object") {
                        v = response.result;
                    }
                    else {
                        // NOTE: Next call of `fromServerResponse` may sync the value of the navigation property that
                        // is loading now. If the property is not loaded now, pending actions will be created.
                        // Set property value as null to prevent the creation of pending actions.
                        // TOTHINK: `fromServerResponse` may update the property value because of the synchronization,
                        // but that value will be overwritten later. How to prevent the synchronization (only for one
                        // loading property)?
                        if (parentObj && !parentObj.isGhost && support.getPropRaw(parentObj, propMeta) === undefined) {
                            support.setPropRaw(parentObj, propMeta, null, { norollback: true, suppressEvents: true });
                        }
                        var objects = that.fromServerResponse(response);
                        if (!objects) {
                            v = null;
                        }
                        else if (propMeta.many) {
                            // collection prop
                            v = lang.array(objects).map(function (o) { return o.id; });
                        }
                        else {
                            // scalar prop
                            if (!lang.isArray(objects)) {
                                v = objects.id;
                            }
                            else if (!objects.length) {
                                v = null;
                            }
                            else if (objects.length === 1) {
                                v = objects[0].id;
                            }
                            else {
                                return lang.rejected(new Error("DataFacade returned more than one object as a value of scalar navigation prop"));
                            }
                        }
                    }
                    if (parentObj && !parentObj.isGhost) {
                        // set the property value as if it is received from the server
                        parentObj.fromJson((_a = {}, _a[propName] = v, _a), { partial: true });
                    }
                    return parentObj.get(propName);
                }
                catch (ex) {
                    return lang.rejected(ex);
                }
                var _a;
            });
        };
        /**
         * Load all objects of specified type.
         * @param {String} type Name of object type (entity)
         * @param {Object} [options]
         * @param {String} [options.preloads] Preloads (will be passed to server controller)
         * @param {Object} [options.params] Params (will be passed to server controller)
         * @param {Object} [options.interop] Advanced options for DataFacade.load
         * @returns {Promise}
         */
        UnitOfWork.prototype.loadAll = function (type, options) {
            if (options === void 0) { options = {}; }
            var that = this, typeName = support.typeNameOf(type), query = {
                source: {
                    type: typeName
                },
                type: typeName
            };
            return that._dataLoad(query, options)
                .then(function (response) {
                if (!response || !response.result) {
                    return [];
                }
                try {
                    return that.fromServerResponse(response);
                }
                catch (ex) {
                    return lang.rejected(ex);
                }
            });
        };
        /**
         * Loads a number of objects by query
         * @param query Query for dataFacade.
         * @param [interop] Optional load options (policy) for DataFacade
         * @returns {lang.Promise<LoadResponse>}
         */
        UnitOfWork.prototype.loadQuery = function (query, interop) {
            var that = this;
            interop = lang.append(interop || {}, {
                caller: this
            });
            return that._dataFacade.load(query, interop)
                .then(function (response) {
                if (!response) {
                    return [];
                }
                try {
                    return that.fromServerResponse(response);
                }
                catch (ex) {
                    return lang.rejected(ex);
                }
            });
        };
        /**
         * Loads data via dataFacade.load
         * @param query Base query for dataFacade. It is extended by options (preloads and params).
         * @param options
         * @returns {lang.Promise<LoadResponse>}
         */
        UnitOfWork.prototype._dataLoad = function (query, options) {
            // extend base query
            if (options.preloads) {
                query.preloads = options.preloads;
            }
            if (options.params) {
                query.params = options.params;
            }
            // extract interop options
            var interopOptions = lang.append(options.interop || {}, {
                caller: this,
                policy: options.policy
            });
            return this._dataFacade.load(query, interopOptions);
        };
        /**
         * Loads all navigation properties specified in 'path'
         * @param {DomainObject} obj The root object
         * @param {String} path The chain of preloads
         * @param {Object} options Original options passed to UnitOfWork.load method
         */
        UnitOfWork.prototype._loadPath = function (obj, path, options) {
            if (obj.isGhost) {
                throw new Error("An object must be loaded");
            }
            if (!path || !path.length) {
                return;
            }
            var that = this, dotIndex = -1, prop, propMeta, nextPath, nextObj;
            // NOTE: path may contain valuable property from complex property (e.g. "address.locality.name")
            do {
                dotIndex = path.indexOf(".", dotIndex + 1);
                prop = dotIndex >= 0 ? path.slice(0, dotIndex) : path;
            } while (dotIndex > 0 && obj.meta.complex[prop]);
            propMeta = obj.meta.props[prop];
            if (!propMeta) {
                return;
            }
            nextPath = dotIndex >= 0 ? path.slice(dotIndex + 1) : "";
            nextObj = obj.get(prop);
            if (propMeta.vt !== "object") {
                // необъектное свойство может быть только последним в цепочке
                if (nextPath.length) {
                    throw new Error("The primitive property '" + prop + "' is not last in the preload chain");
                }
                // но оно тоже может быть не загружено
                return obj.uow.ensurePropLoaded(obj, prop, lang.append({ preloads: nextPath }, options));
            }
            if (!nextObj || nextObj.isNotAuthorized) {
                return;
            }
            return nextObj.load(lang.append({ preloads: nextPath }, options))
                .then(function (loaded) {
                if (!loaded || !nextPath) {
                    return loaded;
                }
                var objects = propMeta.many ? loaded.all() : [loaded], deferreds = objects.map(function (item) {
                    return that._loadPath(item, nextPath, options);
                });
                return lang.when.apply(null, deferreds);
            });
        };
        /**
         * Returns effective options for DomainObject.toJson being called during `save`.
         * @return {ToJsonOptions}
         */
        UnitOfWork.prototype.getSaveToJsonOptions = function () {
            return this._saveToJsonOptions || UnitOfWork.saveToJsonOptions;
        };
        /**
         * Override default static options for DomainObject.toJson being called during `save` for current instance.
         * @param {ToJsonOptions} opt
         */
        UnitOfWork.prototype.setSaveToJsonOptions = function (opt) {
            this._saveToJsonOptions = lang.extend({}, UnitOfWork.saveToJsonOptions, opt);
        };
        /**
         * Returns effective options for DomainObject.toJson being called during `getChanges`.
         * @return {ToJsonOptions}
         */
        UnitOfWork.prototype.getChangesToJsonOptions = function () {
            return this._changesToJsonOptions || UnitOfWork.changesToJsonOptions;
        };
        /**
         * Override default static options for DomainObject.toJson being called during `getChanges` for current instance.
         * @param {ToJsonOptions} opt
         */
        UnitOfWork.prototype.setChangesToJsonOptions = function (opt) {
            this._changesToJsonOptions = lang.extend({}, UnitOfWork.changesToJsonOptions, opt);
        };
        /**
         * Save all changes.
         * @param {Object} [options]
         * @param {Function} [options.onSuccess] Custom callback for handling save success
         * @param {Function} [options.onError] Custom callback for handling save error
         * @param {Function} [options.onPreprocess] a callback to call with json objects before calling DataFacade.save
         * @param {Object} [options.interop] Advanced options for DataFacade.save
         * @returns {*}
         * @fires UnitOfWork#saving
         * @fires UnitOfWork#saved
         * @fires UnitOfWork#saveError
         */
        UnitOfWork.prototype.save = function (options) {
            // TODO: поддержка сохранения изменений внутри одного заданного состояния
            if (options === void 0) { options = {}; }
            var that = this, saving = [], objects = [], created = [], deleted = [], jsonObjects = [], states = that._objects.getStateNames(), newStateName, deferredSave, saveOptions;
            that.forEach(function (obj) {
                var localState = obj._localState;
                if (localState && localState !== obj.localStates.invalid) {
                    saving.push(obj);
                }
            });
            if (that._onSaving(saving)) {
                return lang.rejected(new Error("Operation was cancelled"));
            }
            var toJsonOpt = that.getSaveToJsonOptions();
            saving.forEach(function (obj) {
                var localState = obj._localState, json = obj.toJson(toJsonOpt);
                // с опцией nullIfEmpty метода toJson вместо объектов без свойств вернуться null
                if (json) {
                    objects.push(obj);
                    if (localState === obj.localStates.created) {
                        created.push(obj);
                    }
                    if (localState === obj.localStates.removed) {
                        deleted.push(obj);
                    }
                    jsonObjects.push(json);
                }
            });
            // на время сохранения создаем дополнительное состояние
            newStateName = that.saveState();
            states.push(newStateName);
            if (!jsonObjects.length) {
                deferredSave = lang.resolved();
            }
            else {
                saveOptions = lang.append(options.interop || {}, {
                    caller: that,
                    policy: options.policy,
                    hints: options.hints,
                    suppressEventOnError: !!options.onError || options.suppressEventOnError,
                    suppressEventOnSuccess: options.suppressEventOnSuccess,
                    suppressProcessEvent: options.suppressProcessEvent
                });
                if (lang.isFunction(options.onPreprocess)) {
                    options.onPreprocess(jsonObjects);
                }
                deferredSave = that._dataFacade.save(jsonObjects, saveOptions);
            }
            var deferredOut = lang.Deferred(), resolve = function (jsonObjects) {
                var result = that._onSaved(objects, created, deleted, states, jsonObjects);
                deferredOut.resolve(result);
            }, reject = function (error) {
                that._onSaveFailed(objects, error, states);
                deferredOut.reject(error);
            }, onSaveDone = function (jsonObjects) {
                if (options.onSuccess) {
                    options.onSuccess({
                        options: saveOptions,
                        objects: jsonObjects,
                        states: states,
                        deferred: deferredOut,
                        complete: resolve.bind(that, jsonObjects),
                        resolve: resolve,
                        reject: reject
                    });
                }
                else {
                    resolve(jsonObjects);
                }
            }, onSaveFail = function (error) {
                if (options.onError) {
                    options.onError({
                        error: error,
                        options: saveOptions,
                        objects: jsonObjects,
                        states: states,
                        deferred: deferredOut,
                        complete: reject.bind(that, error),
                        resolve: resolve,
                        reject: reject
                    });
                }
                else {
                    reject(error);
                }
            };
            deferredSave.then(onSaveDone, onSaveFail);
            return deferredOut.promise();
        };
        UnitOfWork.prototype._onSaving = function (objects) {
            var args = {
                objects: objects
            };
            this.onSaving(args);
            return args.cancel;
        };
        UnitOfWork.prototype.onSaving = function (args) {
            this.trigger("saving", this, args);
        };
        UnitOfWork.prototype._updateObjectWithNewValues = function (obj, json) {
            var newTs = undefined;
            if (json.__newValues) {
                // это случай, когда с сервера не прислали ts в измененном объекте
                if (json.__newValues["__incrementTs"]) {
                    newTs = obj.ts + 1;
                    obj.ts = newTs;
                }
                lang.forEach(json.__newValues, function (v, name) {
                    if (name === "id") {
                        obj.setId(v);
                    }
                    else if (name === "__aux") {
                        lang.extend(obj.aux, v);
                    }
                    else if (name !== "__incrementTs") {
                        // update local object with values from server
                        obj.set(name, v, { norollback: true });
                    }
                });
            }
            // с сервера прислали новый ts - значит нужно установить это значение объекту
            if (!newTs && json.__metadata && json.__metadata.ts) {
                obj.ts = json.__metadata.ts;
            }
        };
        /**
         * Handler on saving of own objects successfully completed.
         * NOTE: its behavior deffers from `_onDataUpdate` handler which is called on saving other UoW's objects completed,
         * In current case all objects are already updated, but they can be additionally changed on the server,
         * So here we only copy data from __newValues.
         * @param {Array<DomainObject>} objects Own objects which have been saved
         * @param {Array<DomainObject>} created
         * @param {Array<DomainObject>} deleted
         * @param states
         * @param {Array<SavedObjectData>} jsonObjects Json objects data returned from DataFacade (with newvalues)
         * @returns {UnitOfWork.SaveResult}
         * @private
         */
        UnitOfWork.prototype._onSaved = function (objects, created, deleted, states, jsonObjects) {
            var that = this, result;
            if (jsonObjects && jsonObjects.length) {
                var processedObjects_1 = {};
                objects.forEach(function (obj) {
                    for (var i = 0; i < jsonObjects.length; i++) {
                        var json = jsonObjects[i];
                        if (json.id === obj.id && json.__metadata.type === obj.meta.name) {
                            obj.ts = json.__metadata.ts;
                            // object can be changed on save
                            if (json.__newValues) {
                                that._updateObjectWithNewValues(obj, json);
                            }
                            // memorize the fact that we've processed the object
                            processedObjects_1[i] = true;
                            break;
                        }
                    }
                });
                // now process objects in 'jsonObjects' which were not sent from the client (absent in 'objects')
                // BUT they should be updated as well
                lang.forEach(jsonObjects, function (json, index) {
                    if (processedObjects_1[index]) {
                        return;
                    }
                    var type = json.__metadata && json.__metadata.type;
                    var obj = that.find(type, json.id, { removed: true });
                    if (obj) {
                        that._updateObjectWithNewValues(obj, json);
                    }
                });
            }
            // Accept all states except the latest one (which was created for saving)
            states.forEach(function (state, i) {
                if (i < states.length - 1) {
                    that.acceptState(state);
                }
            });
            deleted.forEach(function (obj) {
                support.setLocalState(obj, obj.localStates.invalid, { norollback: true });
                that.detach(obj);
            });
            result = {
                objects: objects,
                created: created,
                deleted: deleted,
                stateName: lang.last(states)
            };
            if (objects.length) {
                that.onSaved(result);
            }
            return result;
        };
        UnitOfWork.prototype.onSaved = function (result) {
            this.trigger("saved", this, result);
        };
        UnitOfWork.prototype._onSaveFailed = function (objects, error, states) {
            var that = this;
            // Смержим изменения до сохранения и изменения, сделанные во время сохранения.
            // Для этого нужно просто проаксептить состояние, сделанное на время сохранения
            // (это последнее из переданных состояний).
            that.acceptState(lang.last(states));
            // invalidate obsolete-deleted objects
            if (error) {
                if (eth.isOptimisticConcurrency(error)) {
                    var deletedObjects = error.deletedObjects;
                    if (deletedObjects && deletedObjects.length) {
                        // NOTE: we're NOT detaching/removing obsolete objects here (comparing to onDataUpdate)
                        that._onObsoleteDeleted(deletedObjects, false);
                    }
                }
            }
            that.onSaveFailed({
                objects: objects,
                error: error
            });
        };
        UnitOfWork.prototype.onSaveFailed = function (args) {
            this.trigger("saveError", this, args);
        };
        /**
         * Returns id to json map of changed objects.
         * @param {Object} [options] Options for `DomainObject.toJson` method. By default static object UnitOfWork._changesToJsonOptions is used.
         * @param {boolean} [options.onlyChanged]
         * @param {boolean} [options.onlyChangedOrInitial]
         * @param {boolean} [options.onlyPersistent]
         * @param {boolean} [options.nullIfEmpty]
         * @param {boolean} [options.originalArrays]
         * @param {boolean} [options.nometa]
         * @returns {DomainObjectData[]}
         */
        UnitOfWork.prototype.getChanges = function (options) {
            var changes = [];
            options = options ? lang.extend({}, this.getChangesToJsonOptions(), options) : this.getChangesToJsonOptions();
            this.forEach(function (obj) {
                var json;
                if (obj._localState) {
                    json = obj.toJson(options);
                    // с опцией nullIfEmpty метода toJson вместо объектов без свойств вернуться null
                    if (json) {
                        changes.push(json);
                    }
                }
            });
            return changes;
        };
        /**
         * Return a map with all objects from current UnitOfWork.
         * Each objects serialized with help of `toJson` with supplied options.
         * @param {Object} options Serialization objects
         * @param {boolean} [options.onlyChanged]
         * @param {boolean} [options.onlyChangedOrInitial]
         * @param {boolean} [options.onlyPersistent]
         * @param {boolean} [options.nullIfEmpty]
         * @param {boolean} [options.originalArrays]
         * @param {boolean} [options.nometa]
         * @returns {lang.Map<DomainObjectData>}
         */
        UnitOfWork.prototype.toJson = function (options) {
            var that = this, result = {};
            that.forEach(function (obj) {
                if (obj._localState) {
                    var json = obj.toJson(options);
                    // с опцией nullIfEmpty метода toJson вместо объектов без свойств вернуться null
                    if (json) {
                        result[obj.id] = json;
                    }
                }
            });
            return result;
        };
        /**
         * Return all changed object in JSON form and make rollback.
         * NOTE: Before 1.34 the method was returning lang.Map<DomainObjectData>.
         * @return {DomainObjectData[]}
         */
        UnitOfWork.prototype.detachChanges = function () {
            var changes = this.getChanges();
            this._objects.rollbackAll();
            return changes;
        };
        /**
         * Attach JSON objects as dirty into the current UnitOfWork.
         * NOTE: Before 1.34 the method was accepting lang.Map<DomainObjectData>.
         * @param {DomainObject[]} changes
         */
        UnitOfWork.prototype.attachChanges = function (changes) {
            var _this = this;
            if (lang.isArray(changes)) {
                changes.forEach(function (json) {
                    _this.fromJson(json, { dirty: true });
                });
            }
            else {
                // before 1.34, deprecated
                console.warn("DEPRECATED: UnitOfWork.attachChanges(Map<DomainObjectData>) is deprecated, use attachChanges(DomainObjectData[])");
                Object.keys(changes).forEach(function (id) {
                    var json = changes[id];
                    _this.fromJson(json, { dirty: true });
                });
            }
        };
        UnitOfWork.prototype.saveState = function (stateName) {
            return this._objects.saveState(stateName);
        };
        UnitOfWork.prototype.acceptState = function (stateName) {
            this._objects.acceptState(stateName);
            this._calculateHasChanged();
        };
        UnitOfWork.prototype.rollbackState = function (stateName) {
            this._objects.rollbackState(stateName);
            this._calculateHasChanged();
        };
        UnitOfWork.prototype.hasState = function (stateName) {
            return this._objects.hasState(stateName);
        };
        UnitOfWork.prototype.clear = function () {
            var _this = this;
            this._objects.all().forEach(function (obj) {
                _this.detach(obj);
            });
        };
        /**
         * Replaces id of the object
         * @param obj
         * @param newId
         */
        UnitOfWork.prototype.replaceId = function (obj, newId) {
            this._objects.replaceId(obj, newId);
        };
        UnitOfWork.prototype.findRefsTo = function (obj) {
            return this._objects.objectRefsTo(obj);
        };
        UnitOfWork.prototype._onDataUpdate = function (sender, args) {
            var that = this, options = { partial: !args || args.reason !== "load" };
            // args.caller - это объект, инициировавший обращение к dataFacade. Если это текущая UoW, то никакой
            // дополнительной обработки не нужно: все данные будут обработаны в месте вызова методов dataFacade.
            if (!args || args.caller === that || that.isolated) {
                return;
            }
            if (args.objects && args.objects.length) {
                args.objects.forEach(function (json) {
                    var type = json.__metadata && json.__metadata.type, local = type && json.id && that.find(type, json.id, { removed: true }), newId;
                    if (local) {
                        local.fromJson(json, options);
                        newId = json.__newValues && json.__newValues.id;
                        if (newId) {
                            local.setId(newId, { allowForSaved: true });
                            // NOTE: other properties from __newValues should be already moved to json itself
                        }
                        if (json.__newValues && json.__newValues["__incrementTs"]) {
                            local.ts = local.ts + 1;
                        }
                    }
                });
            }
            var deletedObjects = args.deletedObjects;
            if (deletedObjects && deletedObjects.length) {
                that._onObsoleteDeleted(deletedObjects, true);
            }
        };
        UnitOfWork.prototype._onObsoleteDeleted = function (identities, remove) {
            if (!identities || !identities.length) {
                return;
            }
            var that = this;
            for (var _i = 0, identities_1 = identities; _i < identities_1.length; _i++) {
                var id = identities_1[_i];
                var local = id.type && id.id && this.find(id.type, id.id, { removed: false });
                if (local) {
                    // found a non-deleted local object, which known as has been deleted on the server
                    support.setLocalState(local, local.localStates.invalid);
                    if (remove) {
                        that.remove(local);
                        //that.detach(local);
                    }
                }
            }
        };
        /**
         * Remove objects with specified identities from UoW permanently with clearing all references. Objects become invalid.
         * @param {Array} objectIdentities
         * @returns {Promise}
         */
        UnitOfWork.prototype.purgeWithCascade = function (objectIdentities) {
            var that = this;
            var tasks = [];
            var deletedObjects = [];
            objectIdentities.forEach(function (obsoleteId) {
                var obsolete = that.find(obsoleteId.type, obsoleteId.id);
                if (obsolete) {
                    deletedObjects.push(obsolete);
                    var objectRefs = that.findRefsTo(obsolete);
                    if (objectRefs.length) {
                        objectRefs.forEach(function (obj) {
                            var dependant = obj.object;
                            tasks.push(that.reload(dependant.meta.name, dependant.id, { interop: { suppressEventOnError: true } })
                                .then(null, function (err) {
                                // NOTE: важно не использовать fail, т.к. его результат игнорируется.
                                if (eth.isObjectNotFound(err)) {
                                    // мы перегружали владельца ссылки на устаревший-удаленный (obsolete),
                                    // а он тоже удален
                                    // TODO: надо рекурсивно повторить: удалить dependant и все ссылки на него
                                    deletedObjects.push(dependant);
                                }
                                return lang.resolved();
                            }));
                        });
                    }
                }
            });
            // we have an array of task of reload objects with references to deleted objects, wait for all to complete
            if (tasks.length) {
                return lang.whenAll(tasks)
                    .then(function () {
                    // all dependant objects were reloaded,
                    // now really delete deleted object (with clearing refs and detach)
                    deletedObjects.forEach(function (obj) {
                        support.setLocalState(obj, obj.localStates.invalid);
                        that.remove(obj);
                    });
                });
            }
            deletedObjects.forEach(function (obj) {
                support.setLocalState(obj, obj.localStates.invalid);
                that.remove(obj);
            });
            return lang.resolved();
        };
        UnitOfWork.saveToJsonOptions = {
            onlyChangedOrInitial: true,
            onlyPersistent: true,
            nullIfEmpty: true,
            originalArrays: true
        };
        UnitOfWork.changesToJsonOptions = {
            onlyChanged: true,
            onlyPersistent: true,
            nullIfEmpty: true
        };
        __decorate([
            lang.decorators.asyncSafe
        ], UnitOfWork.prototype, "_loadPath");
        return UnitOfWork;
    }(lang.Observable));
    UnitOfWork.mixin({
        hasChanges: lang.Observable.getter("hasChanges"),
        _setHasChanges: lang.Observable.setter("hasChanges")
    });
    return UnitOfWork;
});
//# sourceMappingURL=UnitOfWork.js.map