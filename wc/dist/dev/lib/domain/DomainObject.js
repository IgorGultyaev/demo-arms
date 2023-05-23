/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/utils", "./support", "lib/formatters", "lib/domain/NotLoadedNavigationProp", "lib/domain/NotLoadedNavigationPropSet", "lib/domain/NavigationPropSet", "lib/domain/NotAuthorizedNavigationPropSet", "lib/domain/NotLoadedObject"], function (require, exports, lang, utils, support, formatters, NotLoadedNavigationProp, NotLoadedNavigationPropSet, NavigationPropSet, NotAuthorizedNavigationPropSet, NotLoadedObject) {
    "use strict";
    /**
     * A callback to iterate via the domain object's properties
     * @callback DomainPropertyPredicate
     * @param {Object} propMeta
     * @param {DomainObject} obj
     * @returns {Boolean}
     */
    var DomainObject = /** @class */ (function (_super) {
        __extends(DomainObject, _super);
        /**
         * Domain object.
         * @constructs DomainObject
         * @extends Observable
         * @param {String} id ObjectID - unique identifier
         */
        function DomainObject(id) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.id = typeof id === "string" ? id : utils.generateGuid();
            that.isLoaded = false;
            that._propValues = {};
            that._propWrappers = {};
            that._localState = 0;
            that._undostack = [that.createState("")];
            // Запомним текущий объект в качестве источника при генерации событий.
            // NOTE: при создании наследника через Object.create поле _sender будет указывать на исходный
            // объект, т.о. источник событий останется неизменным.
            that._sender = that;
            /**
             * Auxiliary objects from the server - this is a map by name to aux-object
             * @type {Object}
             */
            that.aux = {};
            return _this;
        }
        DomainObject.prototype.dispose = function () {
            this.purge();
            _super.prototype.dispose.call(this);
        };
        /**
         * Release resources
         */
        DomainObject.prototype.purge = function () {
            // вызовем dispose для описателей свойств
            lang.forEach(this._propWrappers, function (propWrapper) {
                if (typeof propWrapper.dispose === "function") {
                    propWrapper.dispose();
                }
            });
            this._propWrappers = {};
        };
        DomainObject.prototype.isModified = function () {
            return this.localState() === this.localStates.modified;
        };
        DomainObject.prototype.isNew = function () {
            return this.localState() === this.localStates.created;
        };
        DomainObject.prototype.isRemoved = function () {
            return this.localState() === this.localStates.removed;
        };
        DomainObject.prototype.isInvalid = function () {
            return this.localState() === this.localStates.invalid;
        };
        DomainObject.prototype.getPropMeta = function (propName) {
            var propMeta = this.meta.props[propName];
            if (!propMeta) {
                throw new Error("Для доменного класса '" + this.meta.name + "' не определено свойство '" + propName + "'");
            }
            return propMeta;
        };
        DomainObject.prototype.get = function (propName, options) {
            var propMeta = this.meta.props[propName];
            if (propMeta) {
                return this._getPropValue(propMeta, options);
            }
            var complexPropMeta = this.meta.complex[propName];
            if (complexPropMeta) {
                return this._getComplexValue(complexPropMeta, options);
            }
            return _super.prototype.get.call(this, propName);
        };
        DomainObject.prototype.set = function (propName, propValue, options) {
            var that = this, propMeta, complexPropMeta;
            if (typeof propName !== "string") {
                // значения свойств могут быть заданы в виде JSON
                // NOTE: в этом случае первый аргумент - это JSON, второй - опции
                lang.forEach(propName, function (value, name) {
                    that.set(name, value, propValue);
                });
            }
            else if (propMeta = that.meta.props[propName]) {
                that._setPropValue(propMeta, propValue, options);
            }
            else if (complexPropMeta = that.meta.complex[propName]) {
                that._setComplexValue(complexPropMeta, propValue, options);
            }
            else {
                _super.prototype.set.call(this, propName, propValue);
            }
        };
        /**
         * Removes the property from the current values and the undo stack. So the property becomes unloaded.
         * If removed property should be loaded by default, the object becomes unloaded (flag isLoaded is false).
         * @param {String} propName
         */
        DomainObject.prototype.remove = function (propName) {
            var propMeta = this.getPropMeta(propName);
            this._deletePropValue(propMeta);
        };
        /**
         * Clear values of all properties by setting default values.
         * @param {Object} [options]
         * @param {DomainPropertyPredicate} [options.propFilter]
         */
        DomainObject.prototype.clear = function (options) {
            var that = this, filter = options && options.propFilter;
            lang.forEach(that.meta.props, function (propMeta) {
                if (filter && !filter(propMeta, that)) {
                    return;
                }
                var initValue = support.getInit(propMeta);
                that._setPropValue(propMeta, initValue, options);
            });
        };
        /**
         * Whatever the object has any unsaved changes
         * @returns {boolean}
         */
        DomainObject.prototype.hasChanges = function () {
            return !!this.localState();
        };
        DomainObject.prototype.hasChangesSince = function (stateName) {
            var that = this, stateIndex, state, i;
            stateIndex = stateName === undefined ? 0 : support.states.getUndoStateIndex(that, stateName);
            if (stateIndex >= 0) {
                for (i = stateIndex; i < that._undostack.length; i++) {
                    state = that._undostack[i];
                    if (state.localState) {
                        return true;
                    }
                }
            }
            return false;
        };
        /**
         * Whatever the property 'propName' has unsaved changes.
         * @param {String} propName Property name to check
         * @returns {boolean}
         */
        DomainObject.prototype.hasPropChanges = function (propName) {
            var undoState = lang.find(this._undostack, function (state) { return state.values.hasOwnProperty(propName); });
            if (undoState) {
                return !lang.isEqual(undoState.values[propName], this._propValues[propName]);
            }
            return false;
        };
        /**
         * Whatever the object has any unsaved changes except of 'propName' property
         * @param {String} propName
         * @returns {boolean}
         */
        DomainObject.prototype.hasChangesExcept = function (propName) {
            if (this.isNew())
                return true;
            return this._undostack.some(function (undoState) {
                return Object.keys(undoState.values).some(function (prop) { return prop !== propName; });
            });
        };
        DomainObject.prototype.load = function (options) {
            var that = this, deferred = that._deferredLoad;
            if (that._localState === that.localStates.created && (!options || !options.preloads) ||
                that._localState === that.localStates.invalid) {
                return lang.resolved(that);
            }
            // NOTE: Previous loading is already in progress - we can return it if no options are specified.
            // But if there are some options, we should load again with these options.
            if (deferred && lang.isEmpty(options)) {
                return deferred;
            }
            support.throwIfDetached(that);
            // NOTE: wait until the previous loading is completed,
            // maybe after it we will not have to call DataFacade at all.
            return lang.async.then(deferred, function () {
                return that._deferredLoad = that.uow.ensureLoaded(that, options)
                    .then(function () { return that; })
                    .always(function () { that._deferredLoad = undefined; });
            });
        };
        /**
         * Reload current object from the server (or DataStore)
         * @param {Object} options Options for UnitOfWork.load
         * @returns {Promise} current instance with reloaded values
         */
        DomainObject.prototype.reload = function (options) {
            if (options === void 0) { options = {}; }
            options.reload = true;
            return this.load(options);
        };
        DomainObject.prototype.createJsonStub = function () {
            return {
                __metadata: { type: this.meta.name },
                id: this.id
            };
        };
        /**
         * Serialize current object into json representation.
         * @param {Object} [options]
         * @param {Boolean} [options.onlyChanged] To add only changed properties
         * @param {Boolean} [options.onlyChangedOrInitial] To add only changed properties or initial values for new objects
         * @param {Boolean} [options.onlyPersistent] To add only persistent properties
         * @param {Boolean} [options.nullIfEmpty] To return null for empty object (by default an empty json will be returned)
         * @param {Boolean} [options.originalArrays] To add original values of array properties (it's applicable only for not new objects)
         * @param {Boolean} [options.nometa] Do not add __metadata and id fields
         * @returns {JSON}
         */
        DomainObject.prototype.toJson = function (options) {
            var that = this, json = that.createJsonStub(), propNames;
            options = options || {};
            if (options.onlyPersistent && that.meta.temp) {
                return null;
            }
            if (that.ts) {
                json.__metadata.ts = that.ts;
            }
            if (that._localState === that.localStates.removed && !options.propsForRemoved) {
                json.__metadata.isRemoved = true;
            }
            else {
                var isRemoved = that._localState === that.localStates.removed;
                if (isRemoved) {
                    json.__metadata.isRemoved = true;
                }
                var isNew_1 = that._localState === that.localStates.created;
                if (isNew_1) {
                    json.__metadata.isNew = true;
                }
                propNames = Object.keys(that._propValues);
                propNames = propNames.filter(function (propName) {
                    if (options.onlyPersistent && that.meta.props[propName].temp) {
                        return false;
                    }
                    var propHasChanges = that.hasPropChanges(propName);
                    if (options.onlyChanged && !propHasChanges) {
                        return false;
                    }
                    if (options.onlyChangedOrInitial && !propHasChanges && (!isNew_1 || that._propValues[propName] === null)) {
                        // NOTE: i.e. initial values from metadata should be treated as "changed" (even if they wasn't changed by user)
                        return false;
                    }
                    return true;
                });
                if (options.nullIfEmpty && !propNames.length && !isNew_1 && !isRemoved) {
                    return null;
                }
                propNames.forEach(function (propName) {
                    var propMeta = that.meta.props[propName], original, originals;
                    json[propName] = support.json.dematerializeProp(that._propValues[propName], propMeta);
                    // добавляем исходные значения массивных свойств, если нужно
                    if (options.originalArrays && !isNew_1 && propMeta.vt === "object" && propMeta.many) {
                        original = that._getOriginalRaw(propMeta);
                        if (original !== undefined) {
                            originals = json.__original || (json.__original = {});
                            originals[propName] = support.json.dematerializeProp(original, propMeta);
                        }
                    }
                });
            }
            // TODO: optimization: don't create __metadata field at all
            if (options.nometa) {
                delete json.__metadata;
                delete json.id;
            }
            if (options.aux && that.aux) {
                json.__aux = lang.clone(that.aux);
            }
            return json;
        };
        /**
         * Наполняет текущий объект данными в виде json.
         * По умолчанию обновляются значения оригинальных свойств (управляется опцией dirty).
         * @param {Object} json Данные объекта в виде json
         * @param {Object} [options] Дополнительные опции
         * @param {Boolean} [options.dirty] Признак недостоверных данных: true - обновляются текущие свойства объекта; false - оригинальные
         * @param {Boolean} [options.partial] Означает, что json-данные содержат не все необходимые свойства.
         * По умолчанию, если не задана опция dirty, то объект становится загруженным (устанавливается флаг isLoaded).
         * Кроме того, если ts в json-данных больше текущего, то также удаляются все свойства, которых нет в json.
         * Оба этих действия отключаются опцией partial.
         * @param {Object} propOptions Дополнительные опции для установки свойств. Если не заданы, то вычисляются на основании options. Используются для оптимизации.
         * @return {DomainObject} Текущий объект
         */
        DomainObject.prototype.fromJson = function (json, options, propOptions) {
            if (options === void 0) { options = {}; }
            var that = this, state, meta = json.__metadata;
            if (meta && that.meta.name !== meta.type) {
                throw new Error("DomainObject.update: objects types mismatch");
            }
            if (that.id && json.id && that.id !== json.id) {
                throw new Error("DomainObject.update: objects id mismatch");
            }
            propOptions = propOptions || { original: !options.dirty, norollback: !options.dirty };
            if (!options.dirty && !options.partial) {
                // пришли все данные объекта и они достоверные
                that.isLoaded = true;
            }
            lang.forEach(json, function (propValue, propName) {
                if (propName === "__aux") {
                    lang.extend(that.aux, json.__aux);
                    return;
                }
                // Ignoring id and other special fields which names start with __
                if (propName === "id" || lang.stringStartsWith(propName, "__")) {
                    return;
                }
                var propMeta = that.meta.props[propName];
                // NOTE: it's ok to have additional fields in json which doesn't correspond to domain properties
                if (propMeta) {
                    //propValue = support.json.materializeProp(propValue, propMeta);
                    that._setPropValue(propMeta, propValue, propOptions);
                }
            });
            if (meta) {
                // данные достоверные и если ts поменялся, то свойства, которые не пришли в JSON,
                // могут содержать устаревшие значения: удалим их (кроме временных)
                if (!options.dirty && !options.partial && meta.ts > that.ts) {
                    lang.forEach(that.meta.props, function (propMeta, propName) {
                        if (!propMeta.temp && !json.hasOwnProperty(propName) && !that.hasPropChanges(propName)) {
                            that._deletePropValue(propMeta);
                        }
                    });
                }
                if (meta.ts && meta.ts !== that.ts) {
                    if (options.dirty) {
                        state = that._firstChangedState(); // may be empty if json doesn't contain any properties
                        if (state) {
                            state.ts = that.ts;
                        }
                        that.ts = meta.ts;
                    }
                    else if (!that._localState || options.partial) {
                        // object is unchanged OR it's applying save result (partial=true)
                        that.ts = meta.ts;
                    }
                    else {
                        // объект измененный: сохраним ts в первом состоянии, где были изменения.
                        // если будет откат до этого состояния, то текущий ts объекта обновится
                        state = that._firstChangedState(); // should always be not empty
                        state.ts = meta.ts;
                    }
                }
                if (meta.isNew) {
                    support.setLocalState(that, that.localStates.created, propOptions);
                }
                if (meta.isRemoved) {
                    support.setLocalState(that, that.localStates.invalid, propOptions);
                    if (that.uow && propOptions.norollback) {
                        that.uow.detach(that);
                    }
                }
            }
            // могли обновиться навигируемые свойства, применяем отложенные действия
            if (that.uow) {
                that.uow._objects.applyPending(that, propOptions);
            }
            return that;
        };
        /**
         * Создает состояние для стека отката, но не добавляет его в стек.
         * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
         * @ignore
         */
        DomainObject.prototype.createState = function (stateName) {
            return {
                name: stateName || stateName === "" ? stateName : "state_" + utils.generateGuid(),
                values: {},
                localState: 0
            };
        };
        /**
         * Сохраняет текущее состояние объекта
         * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
         * @ignore
        */
        DomainObject.prototype.saveState = function (stateName) {
            var state = this.createState(stateName);
            this._undostack.push(state);
            return state.name;
        };
        /**
         * Утверждает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
         * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
         * @ignore
        */
        DomainObject.prototype.acceptState = function (stateName) {
            var that = this;
            var stateIndex = support.states.getUndoStateIndex(that, stateName);
            if (stateIndex === undefined) {
                return;
            }
            var state = that._undostack[stateIndex];
            var prevState = that._undostack[stateIndex - 1];
            // если состояние вложенное, то перенесем оригинальные значения свойств в предыдущее состояние
            if (prevState) {
                prevState.localState = Math.max(prevState.localState, state.localState);
                lang.appendEx(prevState.values, state.values, { exact: true });
                if (!prevState.ts && state.ts) {
                    prevState.ts = state.ts;
                }
            }
            // если в данном состоянии объект стал невалидным, то удаляем его (и все ссылки на него)
            if (state.localState === that.localStates.invalid && that.uow) {
                that.uow.remove(that, { norollback: true });
            }
            that._removeState(stateIndex, { norollback: true });
        };
        /**
         * Откатывает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
         * ВНИМАНИЕ: Метод не предназначен для использования в прикладном коде.
         * @ignore
        */
        DomainObject.prototype.rollbackState = function (stateName) {
            var that = this, stateIndex, state, nextStates, nextChangedState;
            stateIndex = support.states.getUndoStateIndex(that, stateName);
            if (stateIndex === undefined) {
                return;
            }
            state = that._undostack[stateIndex];
            nextStates = that._undostack.slice(stateIndex + 1);
            // откатываем свойства
            Object.keys(state.values).forEach(function (propName) {
                // свойство изменилось в последующих состояниях?
                var propChangedState = lang.find(nextStates, function (nextState) { return nextState.values.hasOwnProperty(propName); });
                if (propChangedState) {
                    propChangedState.values[propName] = state.values[propName];
                }
                else {
                    // если свойство не изменялось после текущего состояния, то вернем его в текущее значение
                    support.setPropRaw(that, that.meta.props[propName], state.values[propName], { norollback: true });
                }
            }, that);
            if (state.ts) {
                nextChangedState = lang.find(nextStates, function (nextState) { return !!nextState.localState; });
                if (nextChangedState) {
                    nextChangedState.ts = state.ts;
                }
                else {
                    that.ts = state.ts;
                }
            }
            if (state.localState === that.localStates.created) {
                // если объект новый, то удаляем его (и все ссылки на него)
                if (that.uow) {
                    that.uow.remove(that, { norollback: true });
                }
                // после отката новый объект становится не валидным во всех состояниях
                that._undostack.forEach(function (nextState) {
                    nextState.localState = that.localStates.invalid;
                });
                that._removeState(stateIndex, { norollback: true }, that.localStates.invalid);
            }
            else {
                that._removeState(stateIndex, { norollback: true });
            }
        };
        /**
         * Setup ts in DomainObject
         * @param {Number} ts
         */
        DomainObject.prototype.setTs = function (ts) {
            this.ts = ts;
        };
        /**
         * Set the value of id
         * @param id New value of id
         * @param [options]
         * @param {Boolean} [options.allowForSaved] Id can be set for an object in any state, not for created only
         */
        DomainObject.prototype.setId = function (id, options) {
            var that = this, oldId = that.id;
            support.throwIfDetached(that);
            if (that._localState !== that.localStates.created && (!options || !options.allowForSaved)) {
                throw new Error("You can not set an id for the saved (not new) object");
            }
            that.uow.replaceId(that, id);
            // trigger change event
            support.notifyPropChanged(that, "id", id, oldId);
        };
        /**
         * Replaces oldId to newId in the value of the navigation property
         * @param propMeta Metadata of navigation property
         * @param oldId
         * @param newId
         */
        DomainObject.prototype.replaceRefId = function (propMeta, oldId, newId) {
            var that = this, oldValue, newValue;
            // undostack
            that._undostack.forEach(function (state) {
                var value = state.values[propMeta.name];
                if (value) {
                    if (propMeta.many) {
                        that._replaceItem(value, oldId, newId);
                    }
                    else if (value === oldId) {
                        state.values[propMeta.name] = newId;
                    }
                }
            });
            // current props
            oldValue = support.getPropRaw(that, propMeta);
            if (oldValue) {
                if (propMeta.many) {
                    newValue = that._replaceItem(oldValue, oldId, newId, true);
                }
                else if (oldValue === oldId) {
                    newValue = newId;
                }
                if (newValue) {
                    support.setPropRaw(that, propMeta, newValue, { norollback: true });
                }
            }
        };
        /**
         * Returns current object formatted presentation.
         * @param [format] optional name of formatter to use otherwise (if empty) default formatter will be used
         * @return {String}
        */
        DomainObject.prototype.toString = function (format) {
            var that = this, formatters = that.meta.formatters, formatter, result;
            if (formatters) {
                if (format && lang.isString(format)) {
                    formatter = formatters[format];
                }
                if (!formatter) {
                    formatter = formatters["default"];
                }
            }
            if (lang.isFunction(formatter)) {
                result = formatter.apply(that);
            }
            if (result === undefined || result === null) {
                result = that.meta.descr + " (id: " + that.id + ")";
            }
            return result;
        };
        /**
         * Return formatted value of the property
         * @param {String} propName property name
         * @return {String} formatted value
         */
        DomainObject.prototype.getFormatted = function (propName) {
            var propMeta = this.getPropMeta(propName);
            var propValue = this.get(propName);
            return formatters.formatPropValue(propMeta, propValue).toString();
        };
        /**
         * Returns initial value of the property
         * @param {String} propName
         * @returns {*}
         */
        DomainObject.prototype.getInit = function (propName) {
            var propMeta = this.getPropMeta(propName);
            return support.getInit(propMeta);
        };
        DomainObject.prototype._getSimplePropValue = function (propMeta, options) {
            var wrappers = this._propWrappers, value = wrappers[propMeta.name], raw;
            if (value) {
                return value;
            }
            raw = support.getPropRaw(this, propMeta, options);
            if (raw && raw.$value) {
                value = support.values[raw.$value];
                if (lang.isFunction(value)) {
                    value = new value(raw);
                    wrappers[propMeta.name] = value;
                }
                return value || raw;
            }
            return raw;
        };
        /**
         * возвращает "типизированное" значение навигируемого свойства
         */
        DomainObject.prototype._getNavPropValue = function (propMeta, options) {
            var that = this;
            support.throwIfDetached(that);
            var propWrappers = that._propWrappers, value = propWrappers[propMeta.name], raw;
            if (value) {
                return value;
            }
            raw = support.getPropRaw(that, propMeta, options);
            if (raw === undefined && !propMeta.temp) {
                // значение свойства неизвестно - возвращаем описатель свойства, который потом можно прогрузить
                // NOTE: для временных свойств не возвращаем NotLoadedNavigationProp*, т.к. загружать их смысла нет
                return propMeta.many
                    ? propWrappers[propMeta.name] = new NotLoadedNavigationPropSet(that, propMeta)
                    : propWrappers[propMeta.name] = new NotLoadedNavigationProp(that, propMeta);
            }
            if (raw && raw.$value === "NotAuthorizedPropValue") {
                return propMeta.many ?
                    NotAuthorizedNavigationPropSet.singleton :
                    that.uow.get(propMeta.ref, "_not_authorized_", {
                        create: that.uow.model.factory.createNotAuthorized
                    });
            }
            if (propMeta.many) {
                // массивное навигируемое свойство
                return propWrappers[propMeta.name] = new NavigationPropSet(that, propMeta);
            }
            if (raw !== null) {
                // известно значение свойства - возвращаем объект или заглушку с заданным id
                return that.uow.get(propMeta.ref, raw);
            }
            return raw;
        };
        /**
         * устанавливает значение навигируемого свойства
         */
        DomainObject.prototype._setNavPropValue = function (propMeta, propValue, options) {
            var that = this, oldValue = support.getPropRaw(that, propMeta, options), added, removed, i, innerOptions;
            if (propValue && propValue.$value === "NotAuthorizedPropValue") {
                support.setPropRaw(that, propMeta, propValue, options);
                return;
            }
            if (propMeta.many && propValue !== null && !Array.isArray(propValue)) {
                throw new Error("Массивному навигируемому свойству можно присваивать только массив объектов или идентификаторов. " +
                    "Используйте методы модификации коллекции");
            }
            options = options || {};
            // вычисляем "различия" в старом и новом значениях - id, которые необходимо добавить в свойство
            // и которые необходимо удалить
            if (!propMeta.many) {
                // scalar prop
                oldValue = support.objectIdOf(oldValue);
                propValue = support.objectIdOf(propValue);
                /*if (oldValue !== propValue) {
                    removed = oldValue ? [oldValue] : [];
                    added = propValue ? [propValue] : [];
                } else {
                    removed = [];
                    added = [];
                }*/
            }
            else {
                // array prop
                // normalize propValue to array of ids (not objects)
                if (oldValue) {
                    oldValue = oldValue.map(support.objectIdOf);
                }
                if (propValue) {
                    propValue = propValue.length > 0 ? propValue.map(support.objectIdOf) : null;
                }
                // remove duplicating values
                if (propValue && propValue.length > 1) {
                    propValue = _.unique(propValue);
                }
                // TODO: по идее производительность _.difference - O(n^2), нужна оптимизация
                removed = oldValue ? lang.difference(oldValue, propValue) : [];
                added = propValue ? lang.difference(propValue, oldValue) : [];
            }
            if (!that.uow) {
                // для не приаттаченного объекта синхронизация не нужна, просто устанавливаем значение
                if (propValue === null && oldValue !== null || (added && added.length) || (removed && removed.length)) {
                    support.setPropRaw(that, propMeta, propValue, options);
                }
            }
            else {
                innerOptions = lang.clone(options);
                // NOTE: events generation will be packed into a batch (events will be generated on .resume)
                innerOptions.notifier = innerOptions.notifier || new support.ChangeBatchNotifier();
                try {
                    if (oldValue === undefined) {
                        // если значение еще не было задано, то предварительно установим для него null
                        support.setPropRaw(that, propMeta, null, innerOptions);
                    }
                    // на основании полученных различий выполняем модификации
                    // NOTE: propValue - новое значение, removed - удаленные id, added - добавленные id,
                    // т.е. из текущего значение надо удалить все removed и добавить все added.
                    // Но, если так делать, то получившееся значение (массив) будет отличаться порядком элементов от propValue
                    // Поэтому добавление для массивного обрабытваем отдельно, кроме того более эффективно, чем через addToNavProp
                    // (для каждого значение не надо получать текущее значение и искать в нем, мы уже вычислили разницу выше)
                    if (propMeta.many) {
                        // array prop
                        support.setPropRaw(that, propMeta, propValue, innerOptions);
                        // синхронизируем обратные свойства удаленных и добавленных обектов
                        for (i = 0; i < removed.length; i = i + 1) {
                            support.removeFromOppositeNavProp(that, propMeta, removed[i], innerOptions);
                        }
                        for (i = 0; i < added.length; i = i + 1) {
                            support.addToOppositeNavProp(that, propMeta, added[i], innerOptions);
                        }
                    }
                    else {
                        // scalar prop
                        if (oldValue !== propValue) {
                            if (oldValue) {
                                support.removeFromNavProp(that, propMeta, oldValue, innerOptions);
                            }
                            if (propValue) {
                                support.addToNavProp(that, propMeta, propValue, innerOptions);
                            }
                        }
                    }
                }
                finally {
                    if (!options.notifier) {
                        innerOptions.notifier.resume();
                    }
                }
            }
        };
        /**
         * Получает значение свойства по его метаданным
         */
        DomainObject.prototype._getPropValue = function (propMeta, options) {
            var propValue;
            if (propMeta.vt !== "object") {
                propValue = this._getSimplePropValue(propMeta, options);
            }
            else {
                propValue = this._getNavPropValue(propMeta, options);
            }
            support.notifyPropGet(this, propMeta.name, propValue, options);
            return propValue;
        };
        /**
         * Получает значение комплексного свойства по его метаданным
         */
        DomainObject.prototype._getComplexValue = function (propMeta, options) {
            var that = this;
            support.throwIfDetached(that);
            var name = propMeta.name;
            var wrappers = that._propWrappers;
            var value = wrappers[name];
            if (!value) {
                var model = that.uow.model;
                value = model.factory.createComplex(model, that, propMeta);
                wrappers[name] = value;
            }
            support.notifyPropGet(that, propMeta.name, value, options);
            return value;
        };
        DomainObject.prototype._parsePropValue = function (propMeta, propValue, skipValidation) {
            var result;
            if (propValue && lang.isFunction(propValue.toJson)) {
                return propValue.toJson();
            }
            if (propValue && propValue.$value) {
                return propValue;
            }
            // check value format and parse
            if (propMeta.tryParse) {
                result = propMeta.tryParse(propValue, skipValidation);
                if (result && result.errorMsg) {
                    // NOTE: errorMsg can be string or SafeHtml
                    if (skipValidation)
                        return undefined;
                    throw result.errorMsg;
                    //throw new Error(result.errorMsg);
                }
                else {
                    propValue = result ? result.parsedValue : propValue;
                }
            }
            return propValue;
        };
        /**
         * Set property value.
         * @param propMeta Property metadata
         * @param propValue Property value
         * @param [options] Options
         */
        DomainObject.prototype._setPropValue = function (propMeta, propValue, options) {
            var that = this;
            if (propValue === undefined) {
                support.setPropRaw(that, propMeta, undefined, options);
            }
            else {
                // check value format and parse: skipValidation for original values
                var raw = this._parsePropValue(propMeta, propValue, options && options.original);
                if (propMeta.vt === "object") {
                    that._setNavPropValue(propMeta, raw, options);
                }
                else {
                    support.setPropRaw(that, propMeta, raw, options);
                }
            }
        };
        DomainObject.prototype._setComplexValue = function (propMeta, propValue, options) {
            // TODO:
            throw new Error("Setting the value of the complex property is not supported");
        };
        DomainObject.prototype._deletePropValue = function (propMeta) {
            var that = this;
            var propName = propMeta.name;
            lang.forEach(that._undostack, function (state) {
                delete state.values[propName];
            });
            // removing the property which have to be loaded by default - reset isLoaded in this case
            if (!propMeta.lazyLoad && !propMeta.many && !propMeta.temp && that._localState !== that.localStates.created) {
                that.isLoaded = false;
            }
            that._setPropValue(propMeta, undefined, { norollback: true });
        };
        /**
         * Удаляет состояние из стека отката объекта
         */
        DomainObject.prototype._removeState = function (stateIndex, options, minLocalState) {
            var _this = this;
            support.states.removeUndoState(this, stateIndex, function (stateName) {
                return _this.createState(stateName);
            });
            // устанавливаем новое состояние объекта как максимальное по всему стеку
            var maxLocalState = this._undostack.reduce(function (v, undoState) {
                return Math.max(v, undoState.localState);
            }, minLocalState || 0);
            support.setLocalState(this, maxLocalState, options);
        };
        /**
         * Возвращает состояние из стека отката объекта, в котором первый раз произошли изменения
         * @returns {*}
         */
        DomainObject.prototype._firstChangedState = function () {
            return lang.find(this._undostack, function (state) { return !!state.localState; });
        };
        /**
         * Возвращает исходное значение свойства
         * @param propMeta
         */
        DomainObject.prototype._getOriginalRaw = function (propMeta) {
            var propName = propMeta.name, undoState = lang.find(this._undostack, function (state) { return state.values.hasOwnProperty(propName); });
            return undoState && undoState.values[propName];
        };
        /**
         * Replace an element of array
         */
        DomainObject.prototype._replaceItem = function (items, searchItem, replaceItem, copy) {
            var i = items.indexOf(searchItem);
            if (i >= 0) {
                if (copy) {
                    items = items.slice();
                }
                items[i] = replaceItem;
                return items;
            }
        };
        DomainObject.prototype.getPropFromPath = function (path) {
            if (!path || !path.length) {
                return;
            }
            var dotIndex = -1, prop;
            // NOTE: path may contain valuable property from complex property (e.g. "address.locality.name")
            do {
                dotIndex = path.indexOf(".", dotIndex + 1);
                prop = dotIndex >= 0 ? path.slice(0, dotIndex) : path;
            } while (dotIndex > 0 && this.meta.complex[prop]);
            var propMeta = this.meta.props[prop];
            if (!propMeta) {
                return;
            }
            return propMeta;
        };
        DomainObject.prototype.isPropLoaded = function (propName) {
            var raw = this._propValues[propName];
            // фактически любое кроме undefined значение означает, что свойство загружено
            return (raw !== undefined);
        };
        return DomainObject;
    }(lang.Observable));
    (function (DomainObject) {
        var LocalState;
        (function (LocalState) {
            /** Default object state */
            LocalState[LocalState["default"] = 0] = "default";
            /** Synonym for "default" */
            LocalState[LocalState["normal"] = 0] = "normal";
            /** Object was changed */
            LocalState[LocalState["modified"] = 1] = "modified";
            /** New object, created but not saved */
            LocalState[LocalState["new"] = 2] = "new";
            /** Synonym for "new" */
            LocalState[LocalState["created"] = 2] = "created";
            /** Object was marked as deleted but not saved */
            LocalState[LocalState["removed"] = 3] = "removed";
            /** Invalid object, e.g. removed after save */
            LocalState[LocalState["invalid"] = 4] = "invalid";
        })(LocalState = DomainObject.LocalState || (DomainObject.LocalState = {}));
    })(DomainObject || (DomainObject = {}));
    DomainObject.mixin({
        /**
         * States of domain object (possible values for 'localState' property)
         * @enum {number}
         */
        localStates: DomainObject.LocalState,
        /**
         * Current object state
         * @observable-getter {DomainObject#localStates}
         */
        localState: lang.Observable.getter("localState"),
        // для обратной совместимости
        getPropValue: DomainObject.prototype.get,
        setPropValue: DomainObject.prototype.set
    });
    NotLoadedObject.mixin({
        /**
         * States of domain object (possible values for 'localState' property)
         * @enum {number}
         */
        localStates: DomainObject.LocalState
    });
    return DomainObject;
});
//# sourceMappingURL=DomainObject.js.map