/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/utils/datetimes", "lib/utils", "lib/formatters", "moment", "big", "i18n!lib/nls/resources"], function (require, exports, lang, datetimes, utils, formatters, moment, Big, resources) {
    "use strict";
    exports.__esModule = true;
    /**
     * Возвращает имя класса.
     * @param type - наименовнаие типа {string}
     *             - функция-класс доменного объекта
     *             - json-объект метаописателя типа
     */
    function typeNameOf(type) {
        return typeof type === "string" ?
            type :
            typeof type === "function" ?
                type.prototype.meta.name :
                type.name;
    }
    exports.typeNameOf = typeNameOf;
    /**
     * Возвращает идентификатор объекта
     * @param {String|DomainObject} obj Cтрока или доменный объект
     */
    function objectIdOf(obj) {
        //return obj ? (obj.id || obj) : obj;
        return lang.isObject(obj) ? obj.id : obj;
    }
    exports.objectIdOf = objectIdOf;
    /**
     * Return meta properties of model that reference to the specified type.
     */
    function propRefsTo(targetEntityInfo) {
        var model = targetEntityInfo.model, refs = [];
        lang.forEach(model.entities, function (entityInfo) {
            // TOTHINK: why entityInfo.declared, not entityInfo.props?
            lang.forEach(entityInfo.declared, function (propInfo) {
                if (propInfo.vt === "object") {
                    if (targetEntityInfo.base) {
                        for (var typeMeta = targetEntityInfo; typeMeta; typeMeta = typeMeta.base) {
                            if (propInfo.ref === typeMeta) {
                                refs.push(propInfo);
                                break;
                            }
                        }
                    }
                    else if (propInfo.ref === targetEntityInfo) {
                        refs.push(propInfo);
                    }
                }
                /*if (propInfo.vt === "object" && propInfo.ref === targetEntityInfo) {
                    refs.push(propInfo);
                }*/
            });
        });
        return refs;
    }
    exports.propRefsTo = propRefsTo;
    /**
     * Выбрасывает исключение, если у объекта не установлено свойство uow
     */
    function throwIfDetached(obj) {
        if (!obj.uow) {
            throw new Error("This operation with detached object isn't allowed");
        }
    }
    exports.throwIfDetached = throwIfDetached;
    /**
     * Уведомляет об изменении свойства, генерируя соответствующие события
     * @param {DomainObject} obj
     * @param {string} propName
     * @param propValue
     * @param oldValue
     * @param options
     * @param {ChangeBatchNotifier} [options.notifier] - батч событий
     */
    function notifyPropChanged(obj, propName, propValue, oldValue, options /*NotifyRawOptions*/) {
        if (options && options.suppressEvents) {
            return;
        }
        var sender = obj._sender || obj, notifier = options && options.notifier, args = {
            prop: propName,
            value: propValue,
            oldValue: oldValue,
            reason: "change"
        };
        if (options) {
            if (options.original) {
                args.reason = "load";
            }
            else if (options.norollback) {
                args.reason = "set";
            }
        }
        if (notifier) {
            notifier.trigger(obj, "change:" + propName, sender, propValue, oldValue);
            notifier.trigger(obj, "change", sender, args);
        }
        else {
            obj.trigger("change:" + propName, sender, propValue, oldValue);
            obj.trigger("change", sender, args);
        }
    }
    exports.notifyPropChanged = notifyPropChanged;
    /**
     * Уведомляет об установке значения свойства, генерируя соответствующие события
     * @param {DomainObject} obj
     * @param {string} propName
     * @param propValue
     * @param oldValue
     * @param {Object} options
     * @param {ChangeBatchNotifier} [options.notifier] - батч событий
     */
    function notifyPropSet(obj, propName, propValue, oldValue, options) {
        if (options && options.suppressEvents) {
            return;
        }
        var sender = obj._sender || obj, notifier = options && options.notifier, args = { prop: propName, value: propValue, oldValue: oldValue };
        if (notifier) {
            notifier.trigger(obj, "set", sender, args);
        }
        else {
            obj.trigger("set", sender, args);
        }
    }
    exports.notifyPropSet = notifyPropSet;
    /**
     * Уведомляет об получении значения свойства, генерируя соответствующие события
     * @param {DomainObject} obj
     * @param {string} propName
     * @param propValue
     * @param options
     * @param {ChangeBatchNotifier} [options.notifier] - батч событий
     */
    function notifyPropGet(obj, propName, propValue, options) {
        if (options && options.suppressEvents) {
            return;
        }
        var sender = obj._sender || obj, notifier = options && options.notifier, args = { prop: propName, value: propValue };
        if (notifier) {
            notifier.trigger(obj, "get", sender, args);
        }
        else {
            obj.trigger("get", sender, args);
        }
    }
    exports.notifyPropGet = notifyPropGet;
    /**
     * Возвращает "грязное" значение свойства (без дополнительных проверок и оборачиваний)
     * @param {DomainObject} obj доменный объект
     * @param propMeta метаданные свойства - json-объект
     * @param options
     */
    function getPropRaw(obj, propMeta, options) {
        if (options === void 0) { options = {}; }
        var propName = propMeta.name;
        if (options.original) {
            var undoState = lang.find(obj._undostack, function (state) { return state.values.hasOwnProperty(propName); });
            if (undoState) {
                return undoState.values[propName];
            }
        }
        return obj._propValues[propMeta.name];
    }
    exports.getPropRaw = getPropRaw;
    /**
     * Устанавливает "грязное" значение свойства (без дополнительных проверок и оборачиваний)
     * @param {DomainObject} obj доменный объект
     * @param propMeta метаданные свойства - json-объект
     * @param propValue значение свойства
     * @param {Object} options опции - json-объект с полями:
     * @param {Boolean} options.original - устанавливается оригинальное значение свойства. если свойство не менялось, то устанавливается текущее значение с опцией norollback
     * @param {Boolean} options.norollback - выполняется начальная установка свойства - значения НЕ копируются в коллекцию оригинальных значений
     * @param {Boolean} options.suppressEvents do not fire events ("set", "change")
     */
    function setPropRaw(obj, propMeta, propValue, options) {
        if (options === void 0) { options = {}; }
        if (propValue === undefined && !options.norollback) {
            // NOTE: Установка undefined означает, что свойство пытаются сделать не загруженным. Зачем?
            // Скорее всего, это результат какой-то ошибки. См. WC-1484.
            // Исключение - когда задан флаг norollback. Значит, выполняется DomainObject#rollbackState
            // или DomainObject#remove или что-то подобное.
            console.warn("Setting the domain property to 'undefined' is not allowed. Undefined was replaced by null.");
            propValue = null;
        }
        var propName = propMeta.name;
        if (options.original) {
            // NOTE: Оригинальное значение содержится в первом состоянии, где свойство менялось первый раз (if any).
            // Поищем его и в случае удачи заменим в нем значение.
            var undoState = lang.find(obj._undostack, function (state) { return state.values.hasOwnProperty(propName); });
            if (undoState) {
                undoState.values[propName] = propValue;
                return;
            }
        }
        var norollback = options.norollback || options.original, oldValue = obj._propValues[propName], valueChanged = !lang.isEqual(propValue, oldValue), propWrapper = obj._propWrappers[propName], originalValues;
        if (!norollback && valueChanged && propValue !== undefined &&
            oldValue && oldValue.$value === "NotAuthorizedPropValue") {
            throw exports.errors.createNotAuthorized();
        }
        if (valueChanged && !norollback) {
            var undoState = options.undoIndex >= 0 && obj._undostack[options.undoIndex] || exports.states.topUndoState(obj);
            originalValues = undoState.values;
            if (!originalValues.hasOwnProperty(propName)) {
                originalValues[propName] = oldValue;
            } /* See WC-1250:
            else if (lang.isEqual(originalValues[propName],propValue)) {
                let newState: DomainObjectLocalState;
                delete originalValues[propName];
                // check whatever undoState's values is empty
                newState = obj.localStates.normal;
                for (let key in originalValues) {
                    if (originalValues.hasOwnProperty(key)) {
                        // not empty
                        newState = obj.localStates.modified;
                        break;
                    }
                }
            }*/
            setLocalState(obj, obj.localStates.modified, options, undoState);
        }
        if (propValue !== undefined) {
            obj._propValues[propName] = propValue;
        }
        else {
            delete obj._propValues[propName];
        }
        // dispose prop wrapper if it's changed
        if (propWrapper) {
            var wrapperChanged = propMeta.vt === "object" ?
                (propValue !== undefined ? propWrapper.isGhost : !propWrapper.isGhost) :
                valueChanged;
            if (wrapperChanged) {
                if (typeof propWrapper.dispose === "function") {
                    propWrapper.dispose();
                }
                delete obj._propWrappers[propName];
            }
        }
        if (valueChanged) {
            notifyPropChanged(obj, propName, propValue, oldValue, options);
        }
        notifyPropSet(obj, propName, propValue, oldValue, options);
    }
    exports.setPropRaw = setPropRaw;
    /**
     * Remove id from opposite property without synchronization.
     * @param {DomainObject} obj
     * @param {PropertyMeta} propMeta
     * @param {String} id
     * @param {SetPropRawOptions} options
     */
    function removeFromOppositeNavProp(obj, propMeta, id, options) {
        var uow = obj.uow;
        if (propMeta.opposite) {
            var refObj = uow.find(propMeta.ref.name, id);
            if (refObj) {
                removeFromNavProp(refObj, propMeta.opposite, obj.id, options, /*noSync*/ true);
            }
            else {
                // object isn't loaded yet
                uow._objects.pendingRemove(propMeta.opposite, id, obj.id, options);
            }
        }
    }
    exports.removeFromOppositeNavProp = removeFromOppositeNavProp;
    function addToOppositeNavProp(obj, propMeta, id, options) {
        var uow = obj.uow;
        if (propMeta.opposite) {
            var refObj = uow.find(propMeta.ref.name, id);
            if (refObj) {
                addToNavProp(refObj, propMeta.opposite, obj.id, options, /*noSync*/ true);
            }
            else {
                // object isn't loaded yet
                uow._objects.pendingAdd(propMeta.opposite, id, obj.id, options);
            }
        }
    }
    exports.addToOppositeNavProp = addToOppositeNavProp;
    /**
     * Добавляет id к значению навигируемого свойства (для массивных) или замещает значение свойства (для скалярных).
     * Синхронизирует обратное свойство.
     * @param {DomainObject} obj исходный доменный объект, свойство которого модифицируется
     * @param {object} propMeta метаданные модифицируемого свойства объекта obj
     * @param {string|DomainObject} v идентификатор или объект, добавляемый к свойству
     * @param {object} [options]
     * @param {boolean} [noSync] не синхронизировать обратное свойство
     */
    function addToNavProp(obj, propMeta, v, options, noSync) {
        var id = objectIdOf(v), uow = obj.uow, value, changed;
        // изменяем само свойство
        value = getPropRaw(obj, propMeta, options);
        if (value && value.$value === "NotAuthorizedPropValue") {
            return;
        }
        if (!propMeta.many) {
            // NOTE: устанавливаем значение, только если старое значение отличается от нового
            // (в том числе, если старое было не загружено)
            if (value !== id) {
                setPropRaw(obj, propMeta, id, options);
                changed = true;
                // удаляем объект из старого обратного свойства
                // NOTE: делаем это независимо от флага noSync. В данном случае noSync должна препятствовать
                // повторному добавлению объекта в новое обратное свойство, но не удалению
                if (propMeta.opposite && uow && value) {
                    removeFromOppositeNavProp(obj, propMeta, value, options);
                }
            }
        }
        else {
            if (value === undefined) {
                // свойство не загружено
                if (uow) {
                    uow._objects.pendingAdd(propMeta, obj.id, id, options);
                    changed = true;
                }
            }
            else {
                if (value === null) {
                    // свойство пустое
                    value = [];
                }
                if (value.indexOf(id) < 0) {
                    // NOTE: перед модификацией массива его нужно обязательно клонировать,
                    // иначе изменится также текущее значение свойства и затем уже измененное значение попадет
                    // в коллекцию оригинальных значений
                    value = value.concat(id); // NOT: value.push(id)
                    setPropRaw(obj, propMeta, value, options);
                    changed = true;
                }
            }
        }
        // изменяем обратное свойство
        if (changed && !noSync && propMeta.opposite && uow) {
            addToOppositeNavProp(obj, propMeta, id, options);
        }
    }
    exports.addToNavProp = addToNavProp;
    /**
     * Удаляет id из значения навигируемого свойства. Синхронизирует обратное свойство.
     * @param {DomainObject} obj исходный доменный объект, свойство которого модифицируется
     * @param propMeta метаданные модифицируемого свойства объекта obj
     * @param {string} v идентификатор, удаляемый из свойства
     * @param {Object} [options]
     * @param {boolean} [noSync] - не синхронизировать обратное свойство
     */
    function removeFromNavProp(obj, propMeta, v, options, noSync) {
        var id = objectIdOf(v), uow = obj.uow, value, i, changed;
        // get current value
        value = getPropRaw(obj, propMeta, options);
        if (value && value.$value === "NotAuthorizedPropValue") {
            return;
        }
        if (value === undefined) {
            // property isn's loaded
            if (uow) {
                uow._objects.pendingRemove(propMeta, obj.id, id, options);
                changed = true;
            }
        }
        else {
            if (!propMeta.many) {
                // NOTE: update to null if and only if the old value equals to removing value (id)
                if (value === id) {
                    setPropRaw(obj, propMeta, null, options);
                    changed = true;
                }
            }
            else {
                // NOTE: check if removing value is in current value array
                if (value !== null && (i = value.indexOf(id)) >= 0) {
                    // NOTE: перед модификацией массива его нужно обязательно клонировать,
                    // иначе изменится также текущее значение свойства и затем уже измененное значение попадет
                    // в коллекцию оригинальных значений
                    value = value.slice();
                    value.splice(i, 1);
                    if (!value.length) {
                        value = null;
                    }
                    setPropRaw(obj, propMeta, value, options);
                    changed = true;
                }
            }
        }
        // update opposite property
        if (changed && !noSync && propMeta.opposite && uow) {
            removeFromOppositeNavProp(obj, propMeta, id, options);
        }
    }
    exports.removeFromNavProp = removeFromNavProp;
    //	function getEmptyNotNullValueForPropType(vt) {
    //		switch (vt) {
    //			case "boolean":
    //				return false;
    //		}
    //		return null;
    //	}
    /**
     * Returns initial value of the property
     * @param {Object} propMeta
     * @return {*}
     */
    function getInit(propMeta) {
        var initValue = propMeta.init;
        if (typeof initValue === "string") {
            initValue = exports.initFacets.getTypeInitFacet(initValue, propMeta);
        }
        if (typeof initValue === "function") {
            initValue = initValue(propMeta);
        }
        // если значения по умолчанию нет, то проставим null, чтобы отличать от незагруженных свойств
        if (initValue === undefined) {
            initValue = null;
            // Before 0.13 WAS: propMeta.nullable ?	null : getEmptyNotNullValueForPropType(propMeta.vt);
        }
        return initValue;
    }
    exports.getInit = getInit;
    /**
     * Устанавливает "состояние" объекта.
     * @param {DomainObject} obj Целевой объект.
     * @param {Number} value Значение.
     * @param {Object} [options] Опции. Необязательный параметр.
     * @param {Object} [undoState] Предыдущее состояние в стеке отката. Необязательный параметр, используется для оптимизации.
     */
    function setLocalState(obj, value, options, undoState) {
        var old = obj._localState;
        if (!options || !options.norollback) {
            if (!undoState) {
                undoState = exports.states.topUndoState(obj);
            }
            undoState.localState = Math.max(value, undoState.localState);
            value = Math.max(value, old);
        }
        if (value !== old) {
            obj._localState = value;
            notifyPropChanged(obj, "localState", value, old, options);
            if (obj.uow) {
                if (value === obj.localStates.invalid && old !== obj.localStates.invalid) {
                    // attached object become invalid - simulate detach
                    obj.trigger("detach");
                    obj.uow.trigger("detach", obj.uow, obj);
                }
                else if (old === obj.localStates.invalid && value !== obj.localStates.invalid) {
                    // attached object was invalid and come non-invalid - simulate attach
                    obj.trigger("attach");
                    obj.uow.trigger("attach", obj.uow, obj);
                }
            }
        }
    }
    exports.setLocalState = setLocalState;
    exports.errors = {
        createObjectNotFound: function (typeName, id) {
            return new Error(resources["object_not_found"]);
        },
        createNotAuthorized: function () {
            return new Error(resources["not_authrozied"]);
        }
    };
    /**
     * Search for an object in array by its type and id. Take into account inheritence
     * @param {Array} objects
     * @param {String} typeName
     * @param {String} id
     */
    function findObjectByIdentity(objects, typeName, id) {
        return lang.find(objects, function (obj) {
            if (obj.id !== id) {
                return false;
            }
            var typeMeta;
            for (typeMeta = obj.meta; typeMeta; typeMeta = typeMeta.base) {
                if (typeMeta.name === typeName) {
                    return true;
                }
            }
            return false;
        });
    }
    exports.findObjectByIdentity = findObjectByIdentity;
    function topUndoState(target) {
        return lang.last(target._undostack);
    }
    exports.states = {
        /**
         Возвращает последнее состояние в стеке отката объекта
         */
        topUndoState: topUndoState,
        /**
         Возвращает индекс состояния по его имени в стеке отката объекта
         */
        getUndoStateIndex: function (target, stateName) {
            var undostack = target._undostack, stateIndex;
            if (stateName === undefined) {
                stateIndex = undostack.length - 1;
            }
            else {
                for (var i = 0; i < undostack.length; i++) {
                    if (undostack[i].name === stateName) {
                        stateIndex = i;
                        break;
                    }
                }
            }
            return stateIndex;
        },
        /**
         Удаляет состояние из стека отката объекта
         */
        removeUndoState: function (target, stateIndex, stateFactory) {
            var undostack = target._undostack;
            undostack.splice(stateIndex, 1);
            if (!undostack.length) {
                undostack.push(stateFactory(""));
            }
        }
    };
    var LobPropValue = /** @class */ (function () {
        /**
         * @constructs LobPropValue
         * @param {Object} dto
         */
        function LobPropValue(dto) {
            lang.extend(this, dto);
        }
        LobPropValue.prototype.toString = function () {
            var that = this, size = utils.formatSize(that.size);
            if (that.fileName) {
                return that.fileName + (size ? " (" + size + ")" : "");
            }
            return size;
        };
        LobPropValue.prototype.toJson = function () {
            var that = this, ret = { $value: "LobPropValue" };
            lang.forEach(that, function (v, key) {
                if (that.hasOwnProperty(key) && !lang.isFunction(v)) {
                    ret[key] = v;
                }
            });
            return ret;
        };
        return LobPropValue;
    }());
    exports.LobPropValue = LobPropValue;
    /**
     * Специальные описатели значений свойств для возврата DomainObject.get на основании json-значения из _propValues.
     * Внутри DomainObject._propValues может быть значение - объект с полем $value,
     * по значению $value ищется знчение в словаре `values`. Если это функция, класс, то она вызывается через new с параметров json-объектом,
     * иначе (не функция) используется значение из словаря.
     * Всё это происходит в DomainObject._getSimplePropValue, т.е. при получении значения свойства DomainObject.get.
     * При присвоении (DomainObject.set) происходит обратное - см. DomainObject._setPropValue,
     * с помощью _parsePropValue переданное значение прообразуется в примитивное и помещается в DomainObject._propValues.
     * Для этого используется метод toJson переданного (в DomainObject.set) значения.
     * Если toJson у значения нет, но есть поле $value, то значение используется AS IS, без дальнейшего парсинга.
     * Иначае оно проходит через парсер свойства.
     */
    /**
     * Classes and value-object for prop values.
     * Can be used as output for `DomainObject.get` and input for `DomainObject.set`.
     */
    exports.values = {
        /**
         * Value for property without read right ("access denied").
         */
        NotAuthorizedPropValue: {
            isNotAuthorized: true,
            toString: function () {
                return resources["not_authorized"];
            },
            is: function (value) {
                return value && (value.isNotAuthorized || value.$value === "NotAuthorizedPropValue");
            },
            toJson: function () {
                return { $value: "NotAuthorizedPropValue" };
            }
        },
        /**
         * Class for values of Binary properties (vt="binary"). See peBinary.
         */
        LobPropValue: LobPropValue
    };
    exports.json = {
        /**
         * Convert a value from the server to domain prop json value.
         * The method is not being used currently anywhere.
         * @param v
         * @param {PropertyMeta} propMeta
         * @return {any}
         */
        materializeProp: function (v, propMeta) {
            // NOTE: метод materializeProp на самом деле не вызывается, см. WC-906
            // из-за того, что парсинг значений (и вызов parseISOString) все равно происходит в DomainObject.set (_setPropValue => _parsePropValue)
            if (lang.isString(v)) {
                // NOTE: начиная с 1.37 WC в качестве "нуля" для time использует дату 1970-01-01, ранее была 1900-01-01
                // поддержим здесь старое значение для Legacy-Server и jXFW
                if ((propMeta.vt === "time" || propMeta.vt === "timeTz") && v && v.indexOf("1900-01-01") > -1) {
                    v = v.replace("1900", "1970");
                }
                if (propMeta.vt === "dateTime" || propMeta.vt === "date" || propMeta.vt === "time") {
                    return datetimes.parseISOString(v, /*isGlobalTime*/ false);
                }
                if (propMeta.vt === "dateTimeTz" || propMeta.vt === "timeTz") {
                    return datetimes.parseISOString(v, /*isGlobalTime*/ true);
                }
            }
            return v;
        },
        /**
         * Convert domain prop json value for sending to server (also json).
         * @param v
         * @param {PropertyMeta} propMeta
         * @returns {any}
         */
        dematerializeProp: function (v, propMeta) {
            if (lang.isDate(v)) {
                // NOTE: для legacy-серверов можно сделать обратное преобразование materializeProp
                // if ((apiVersion = Application.current.config.apiVersion) < 3 || !apiVersion) {}
                if (propMeta.vt === "dateTime" || propMeta.vt === "date" || propMeta.vt === "time") {
                    return datetimes.toISOString(v, /*isGlobalTime*/ false);
                }
                if (propMeta.vt === "dateTimeTz" || propMeta.vt === "timeTz") {
                    return datetimes.toISOString(v, /*isGlobalTime*/ true);
                }
            }
            if (v instanceof Big) {
                if (propMeta.vt === "i8") {
                    return v.toFixed();
                }
                else {
                    // Big should be used only for i8, but just in case
                    return v.toString();
                }
            }
            // NOTE: может ввести общий сеханизм сериализации значений свойств?
            // Это не может быть toJson, т.к. те toJson, что выше в классах support.values.*,
            // на самом деле вызываются из DomainObject.parsePropValue
            // (т.е. при трансформации значения описателя свойства в json для _propValue)
            // Значение которое сюда попадает, это не экземпляр класса из values, а значение которое вернула toJson
            // Но можно ввести еще один словарь - значение $value на функцию возвращающую значение для пересылки.
            // if (v && v.$value && this.materializers[v.$value]) {}
            return v;
        }
    };
    var ChangeBatchNotifier = /** @class */ (function () {
        /**
         * Collect 'change', 'change:{prop}' and 'set' events and trigger them in a batch
         * @constructs ChangeBatchNotifier
         */
        function ChangeBatchNotifier() {
            this._batch = []; // TODO: use DomainObjectMap
        }
        /**
         * A replacement for NavigationPropBase trigger method.
         * Instead of events generating it collect events arguments till 'resume' method called.
         * @param {Object} ctx An object which generates event
         * @param {String} name Event name
         * @param {Object} sender Event sender (can differ from ctx)
         * @param {Object} data event's arguments
         */
        ChangeBatchNotifier.prototype.trigger = function (ctx, name, sender, data) {
            // NOTE: 'change:{prop}' is always triggered with 'change' event. We can handle 'change' event only.
            if (lang.stringStartsWith(name, "change:")) {
                return;
            }
            // we don't collect any events except of 'change' and 'set'
            var args = [];
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
            if (name !== "set" && name !== "change") {
                ctx.trigger.apply(ctx, args);
                return;
            }
            // get delayed events for specified context
            var events = this._getEvents(ctx);
            // find event args with the same name, sender and property name
            var prevArgs = lang.find(events, function (ea) {
                return ea[0] === name && ea[1] === sender &&
                    ea[2] && ea[2].prop && data && data.prop && ea[2].prop === data.prop;
            });
            if (!prevArgs) {
                events.push(args);
            }
            else {
                prevArgs[2].value = data.value;
            }
        };
        /**
         * Completes batch and generates all collected events.
         */
        ChangeBatchNotifier.prototype.resume = function () {
            this._batch.forEach(function (item) {
                lang.forEach(item.events, function (args) {
                    // trigger 'change' and 'set' events
                    item.ctx.trigger.apply(item.ctx, args);
                    // trigger 'change:{prop}' event together with 'change'
                    if (args[0] === "change" && args[2] && args[2].prop && args[2].hasOwnProperty("value")) {
                        item.ctx.trigger("change:" + args[2].prop, //eventName
                        args[1], //sender
                        args[2].value, //value
                        args[2].oldValue // oldValue
                        );
                    }
                });
            });
            this._batch.length = 0;
        };
        /**
         * Returns an array of arguments of 'trigger' method called for specified context
         * @param ctx
         * @returns {Array}
         * @private
         */
        ChangeBatchNotifier.prototype._getEvents = function (ctx) {
            var triggers = lang.find(this._batch, function (v) { return v.ctx === ctx; });
            if (!triggers) {
                triggers = { ctx: ctx, events: [] };
                this._batch.push(triggers);
            }
            return triggers.events;
        };
        return ChangeBatchNotifier;
    }());
    exports.ChangeBatchNotifier = ChangeBatchNotifier;
    exports.initFacets = {
        getTypeInitFacet: function (initFacet, propMeta) {
            switch (propMeta.vt) {
                case "date":
                case "time":
                case "dateTime":
                case "timeTz":
                case "dateTimeTz":
                    initFacet = exports.initFacets.dateTime[initFacet];
                    break;
            }
            return initFacet;
        },
        dateTime: {
            now: function (propMeta) {
                var format = propMeta.format ? propMeta.format : formatters.defaultFormats[propMeta.vt];
                var formatter = formatters.getDefaultFormatter(propMeta);
                // NOTE: time/timeTz values will be normalized later on assignment
                return moment(formatter(propMeta, new Date()), format).toDate();
            }
        }
    };
});
//# sourceMappingURL=support.js.map