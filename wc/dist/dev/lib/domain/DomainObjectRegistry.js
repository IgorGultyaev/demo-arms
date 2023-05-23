/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/utils", "./support", "./DomainObjectMap"], function (require, exports, lang, utils, support, DomainObjectMap) {
    "use strict";
    /**
     * DomainObjectRegistry - множество доменных объектов с поиском по типу и id.
     * Может содержать как сами доменные объекты, так и незагруженные ghost-объекты.
     * Используется в UnitOfWork.
     */
    var DomainObjectRegistry = /** @class */ (function () {
        /**
         * Конструктор
         * @param model Доменная модель
         * @param uow Родительская UnitOfWork
         */
        function DomainObjectRegistry(model, uow) {
            var that = this;
            that._model = model;
            that._uow = uow;
            that._objects = new DomainObjectMap(model);
            that._undostack = [that.createState("")];
        }
        /**
         * Adds an object
         */
        DomainObjectRegistry.prototype.add = function (obj, options, noSyncState) {
            var that = this;
            if (!obj.isGhost && obj.uow && obj.uow !== that._uow) {
                obj.purge();
            }
            obj.uow = that._uow;
            that._objects.add(obj, obj);
            if (obj.isGhost) {
                return;
            }
            // Синхронизируем текущие состояний объекта и UnitOfWork.
            if (!noSyncState) {
                // Accept-им все состояния, кроме первого.
                // После этого все оригинальные значения должны оказаться в первом (и единственном) состоянии
                while (obj._undostack.length > 1) {
                    obj.acceptState();
                }
                // Количество и наименования состояний объекта должны соответствовать всему множеству:
                // добавляем недостающие состояния в _начало_ стека
                that._undostack.forEach(function (state, i) {
                    if (i === that._undostack.length - 1) {
                        // последнее состояние просто переименовываем
                        support.states.topUndoState(obj).name = state.name;
                    }
                    else {
                        // остальные состояния добавляем перед последним
                        obj._undostack.splice(i, 0, obj.createState(state.name));
                    }
                });
            }
            // применяем отложенные действия
            that.applyPending(obj, options);
            if (!options || !options.norollback) {
                // фиксируем изменение в составе объектов
                var state = support.states.topUndoState(that);
                if (!state.removed.remove(obj)) {
                    state.added.add(obj, obj);
                }
            }
            that._uow.trigger("attach", that._uow, obj);
        };
        /**
         * Удаляет объект из множества
         */
        DomainObjectRegistry.prototype.remove = function (obj, options) {
            if (!obj.isGhost) {
                obj.purge();
            }
            if (obj.uow) {
                obj.uow = null;
            }
            if (!this._objects.remove(obj)) {
                return;
            }
            obj.trigger("detach");
            if (obj.isGhost) {
                return;
            }
            if (!options || !options.norollback) {
                // фиксируем изменение в составе объектов
                var state = support.states.topUndoState(this);
                if (!state.added.remove(obj)) {
                    state.removed.add(obj, obj);
                }
            }
            // TODO: удалять отложенные действия для объекта и ссылок на него
            this._uow.trigger("detach", this._uow, obj);
        };
        DomainObjectRegistry.prototype.find = function (type, id) {
            return this._objects.find(type, id);
        };
        DomainObjectRegistry.prototype.all = function () {
            return this._objects.all();
        };
        DomainObjectRegistry.prototype.forEach = function (callback, context) {
            return this._objects.forEach(callback, context);
        };
        DomainObjectRegistry.prototype.some = function (callback, context) {
            return this._objects.some(callback, context);
        };
        /**
        Получает объекты, ссылающиеся на другой объект.
        @returns Массив plain-объектов со свойствами:
        object - объект, ссылающийся на переданный объект
        prop - свойство, ссылающееся на переданный объект
        */
        DomainObjectRegistry.prototype.objectRefsTo = function (obj, refProps) {
            var that = this, refs = [];
            refProps = refProps || support.propRefsTo(obj.meta);
            for (var _i = 0, refProps_1 = refProps; _i < refProps_1.length; _i++) {
                var propInfo = refProps_1[_i];
                var objects = that._objects.select(propInfo.entity.name);
                if (objects) {
                    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
                        var refObj = objects_1[_a];
                        if (!refObj.isGhost) {
                            var value = support.getPropRaw(refObj, propInfo), hasId = Array.isArray(value) ? value.indexOf(obj.id) >= 0 : value === obj.id;
                            if (hasId) {
                                refs.push({
                                    object: refObj,
                                    prop: propInfo
                                });
                            }
                        }
                    }
                }
            }
            return refs;
        };
        DomainObjectRegistry.prototype.pendingAdd = function (propMeta, id, valueId, options) {
            this._pendingVerb("add", propMeta, id, valueId, options);
        };
        DomainObjectRegistry.prototype.pendingRemove = function (propMeta, id, valueId, options) {
            this._pendingVerb("remove", propMeta, id, valueId, options);
        };
        DomainObjectRegistry.prototype._pendingVerb = function (verb, propMeta, id, valueId, options) {
            var state = support.states.topUndoState(this);
            var actions = state.pending.get(propMeta.entity.name, id, []);
            actions.push({
                verb: verb,
                prop: propMeta,
                id: valueId,
                original: options && options.original,
                norollback: options && options.norollback
            });
        };
        /**
         * Применяет отложенные действия к объекту
         * @param {DomainObject} obj Объект, к которому применяются действия
         * @param {Object} [options]
         */
        DomainObjectRegistry.prototype.applyPending = function (obj, options) {
            if (!obj || obj.isGhost) {
                return;
            }
            var that = this;
            that._undostack.forEach(function (state, index) {
                // применяем действия, заданные для конкретного объекта
                var actions = state.pending.findObj(obj);
                if (that._applyPending(obj, actions, index, options, /*deleteApplied*/ true)) {
                    // если хоть одно действие было примено, то нужно удалить их
                    // NOTE: вместо примененных действий в массиве будут undefined, т.к. мы указали параметр deleteApplied
                    var pending = actions.filter(function (action) { return !!action; });
                    if (pending.length) {
                        state.pending.add(obj, pending);
                    }
                    else {
                        state.pending.remove(obj);
                    }
                }
                // применяем действия, заданные для всех объектов
                actions = state.pending.find(obj.meta.name, "*");
                that._applyPending(obj, actions, index, options, /*deleteApplied*/ false);
                // NOTE: для * не нужно удалять примененные действия, так они могут потребоваться для других объектов
            });
        };
        /**
         * Применяет отложенные действия к объекту
         * @param {DomainObject} obj Объект, к которому применяются действия
         * @param {Array} actions Массив отложенных действий, которые нужно применить
         * @param {Number} undoIndex Индекс состояния в стеке отката, куда нужно скопировать исходное значение свойства
         * @param {Object} options
         * @param {boolean} deleteApplied
         * @returns {boolean} true, если хотя бы одно действие было применено
         */
        DomainObjectRegistry.prototype._applyPending = function (obj, actions, undoIndex, options, deleteApplied) {
            if (!actions) {
                return;
            }
            var applied = false;
            actions.forEach(function (action, i) {
                var propMeta = action.prop, actionOptions;
                // There is no sense to apply pending actions to the unloaded navigation set.
                // Indeed it will add the same pending action one more.
                if (propMeta.many && support.getPropRaw(obj, propMeta) === undefined) {
                    return;
                }
                // Merge pending and runtime options
                actionOptions = options ? lang.clone(options) : {};
                actionOptions.original = action.original;
                actionOptions.norollback = action.norollback || action.original;
                actionOptions.undoIndex = undoIndex;
                if (action.verb === "add") {
                    support.addToNavProp(obj, propMeta, action.id, actionOptions, /*noSync*/ true);
                }
                else if (action.verb === "remove") {
                    support.removeFromNavProp(obj, propMeta, action.id, actionOptions, /*noSync*/ true);
                }
                applied = true;
                // delete applied actions (if not '*' only)
                if (deleteApplied) {
                    actions[i] = undefined;
                }
            });
            return applied;
        };
        /**
         * Сохраняет текущее состояние
        */
        DomainObjectRegistry.prototype.saveState = function (stateName) {
            var that = this, state = that.createState(stateName);
            // сохраняем состояния всех объектов
            that._objects.forEach(function (obj) {
                if (!obj.isGhost) {
                    obj.saveState(state.name);
                }
            });
            that._undostack.push(state);
            return state.name;
        };
        /**
         * Откатывает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
        */
        DomainObjectRegistry.prototype.rollbackState = function (stateName) {
            var that = this;
            var stateIndex = support.states.getUndoStateIndex(that, stateName);
            if (stateIndex === undefined) {
                return;
            }
            var state = that._undostack[stateIndex];
            var nextState = that._undostack[stateIndex + 1];
            // откатываем добавление объектов
            state.added.forEach(function (obj) {
                obj.rollbackState(state.name);
                if (nextState) {
                    if (!nextState.removed.remove(obj)) {
                        nextState.added.add(obj, obj);
                    }
                }
                else {
                    that.remove(obj, { norollback: true });
                }
            });
            // откатываем удаление объектов
            state.removed.forEach(function (obj) {
                obj.rollbackState(state.name);
                if (nextState) {
                    if (!nextState.added.remove(obj)) {
                        nextState.removed.add(obj, obj);
                    }
                }
                else {
                    that.add(obj, { norollback: true }, true);
                }
            });
            // NOTE: pending actions удалятся сами собой, так как они берутся в том числе из состояний в стеке
            // откатываем состояния всех объектов
            that._objects.forEach(function (obj) {
                if (!obj.isGhost) {
                    obj.rollbackState(state.name);
                }
            });
            that.removeState(stateIndex);
        };
        DomainObjectRegistry.prototype.rollbackAll = function () {
            var _this = this;
            var states = this._undostack.slice().reverse();
            states.forEach(function (state) {
                _this.rollbackState(state.name);
            });
        };
        DomainObjectRegistry.prototype.hasState = function (stateName) {
            return support.states.getUndoStateIndex(this, stateName) >= 0;
        };
        /**
         * Утверждает изменения, сделанные после вызова метода saveState с таким же наименованием состояния
        */
        DomainObjectRegistry.prototype.acceptState = function (stateName) {
            var that = this;
            var stateIndex = support.states.getUndoStateIndex(that, stateName);
            if (stateIndex === undefined) {
                return;
            }
            var state = that._undostack[stateIndex];
            var prevState = that._undostack[stateIndex - 1];
            // перенесем pending actions
            if (prevState) {
                state.pending.forEach(function (stateActions, type, id) {
                    var actions = prevState.pending.get(type, id, []);
                    stateActions.forEach(function (action) {
                        actions.push(action);
                    });
                });
            }
            state.added.forEach(function (obj) {
                obj.acceptState(state.name);
                if (prevState && !prevState.removed.remove(obj)) {
                    prevState.added.add(obj, obj);
                }
            });
            state.removed.forEach(function (obj) {
                obj.acceptState(state.name);
                if (prevState && !prevState.added.remove(obj)) {
                    prevState.removed.add(obj, obj);
                }
            });
            // утверждаем состояния всех объектов
            that._objects.forEach(function (obj) {
                if (!obj.isGhost) {
                    obj.acceptState(state.name);
                }
            });
            that.removeState(stateIndex);
        };
        /**
         * Проверяет, есть ли сохраненные состояния (т.е. вызывался ли метод saveState без последующих
         * вызовов acceptState или rollbackState).
        */
        DomainObjectRegistry.prototype.hasSavedStates = function () {
            // NOTE: первое состояние есть всегда, оно не считается сохраненным
            return this._undostack.length > 1;
        };
        /**
         * Returns names of all states in the undo stack
         * @returns {string[]}
         */
        DomainObjectRegistry.prototype.getStateNames = function () {
            return this._undostack.map(function (s) { return s.name; });
        };
        /**
         * Replaces id of the object
         * @param obj
         * @param newId
         */
        DomainObjectRegistry.prototype.replaceId = function (obj, newId) {
            var that = this, refProps = support.propRefsTo(obj.meta), found;
            refProps.forEach(function (propMeta) {
                that._replaceId(that._objects, propMeta, obj.id, newId);
                // also replace in undostack
                that._undostack.forEach(function (state) {
                    that._replaceId(state.removed, propMeta, obj.id, newId);
                    that._replaceId(state.added, propMeta, obj.id, newId);
                    // also replace in pending actions
                    var entityActions = state.pending.select(propMeta.entity.name);
                    entityActions.forEach(function (actions) {
                        actions.forEach(function (action) {
                            if (action.prop === propMeta && action.id === obj.id) {
                                action.id = newId;
                            }
                        });
                    });
                });
            });
            found = that._objects.remove(obj);
            obj.id = newId;
            if (found) {
                that._objects.add(obj, obj);
            }
        };
        DomainObjectRegistry.prototype._replaceId = function (objectMap, propMeta, oldId, newId) {
            var objects = objectMap.select(propMeta.entity.name);
            if (objects) {
                objects.forEach(function (obj) {
                    if (!obj.isGhost) {
                        obj.replaceRefId(propMeta, oldId, newId);
                    }
                });
            }
        };
        /**
         * Создает "состояние" реестра, которое можно откатить или применить
         * @param {String} stateName Наименование состояния (может быть не задано)
         */
        DomainObjectRegistry.prototype.createState = function (stateName) {
            var model = this._model;
            return {
                name: stateName || stateName === "" ? stateName : "state_" + utils.generateGuid(),
                added: new DomainObjectMap(model),
                removed: new DomainObjectMap(model),
                pending: new DomainObjectMap(model)
            };
        };
        /**
         * Удаляет состояние из стека отката объекта
         */
        DomainObjectRegistry.prototype.removeState = function (stateIndex) {
            var _this = this;
            support.states.removeUndoState(this, stateIndex, function (stateName) {
                return _this.createState(stateName);
            });
        };
        return DomainObjectRegistry;
    }());
    return DomainObjectRegistry;
});
//# sourceMappingURL=DomainObjectRegistry.js.map