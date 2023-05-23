/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core"], function (require, exports, core) {
    "use strict";
    var lang = core.lang;
    var EditorPageController = /** @class */ (function (_super) {
        __extends(EditorPageController, _super);
        /**
         * @constructs EditorPageController
         * @example
         *  controller: [
         *      {
         *          onchange: "prop1",
         *          apply: [
         *              {
         *                  condition: {"equal": false},
         *                  disable: "prop2",
         *                  enable: "prop3",
         *                  else: {
         *                    enable: "prop2",
         *                    disable: "prop3",
         *                  }
         *              },
         *              {
         *                  condition: function(v) {return !v},
         *                  goto: "prop3.prop31.prop312"
         *              }
         *          ]
         *      }
         *  ]
         * @param {EditorPage} page EditorPage object
         * @param {Object} options
         */
        function EditorPageController(page, options) {
            var _this = _super.call(this) || this;
            _this.page = page;
            _this.options = options;
            return _this;
        }
        EditorPageController.is = function (value) {
            return value && value.start && value.stop;
        };
        EditorPageController.prototype.getPropertyEditor = function (value) {
            return this.page.getPropertyEditorByPath(value);
        };
        EditorPageController.prototype.start = function (page) {
            var that = this, vm = page.viewModel;
            this.page = page;
            if (lang.Observable.isObservable(vm)) {
                that.viewModel = vm;
            }
            else {
                console.error("EditorPageController: cannot be used with page viewModel that is not Observable");
                return;
            }
            that._dispoables = [];
            lang.forEach(that.options, function (desc) {
                try {
                    var handler = function (propValue, propName) {
                        lang.forEach(desc.apply, function (beh) {
                            that._executeBehavior(beh, propValue, propName);
                        });
                    };
                    var val_1 = that.subscribe(desc.onchange, handler, desc.onchangeReason);
                    if (desc.onstart && val_1 !== undefined && val_1 !== lang.support.loadingValue) {
                        lang.forEach(desc.apply, function (beh) {
                            that._executeBehavior(beh, val_1);
                        });
                    }
                }
                catch (ex) {
                    console.error("Error on page controller initialization for onchange '" + desc.onchange + "', see next error");
                    console.error(ex);
                }
            });
        };
        /**
         *
         * @param beh behavior options
         * @param propValue Prop value
         * @param propName Prop name only for the case of "*" subscription
         * @private
         */
        EditorPageController.prototype._executeBehavior = function (beh, propValue, propName) {
            var that = this;
            var apply = true;
            var condition = beh.condition;
            if (lang.isFunction(condition)) {
                apply = (condition(propValue));
            }
            else if (lang.isObject(condition)) {
                apply = that._executeCondition(condition, propValue);
            }
            if (apply) {
                that._applyBehavior(beh, propValue, propName);
            }
            else if (beh["else"]) {
                that._applyBehavior(beh["else"], propValue, propName);
            }
        };
        EditorPageController.prototype._executeCondition = function (condition, propValue) {
            if (condition.hasOwnProperty("equal"))
                return propValue == condition.equal;
            if (condition.hasOwnProperty("equal-strict"))
                return propValue === condition["equal-strict"];
            if (condition.hasOwnProperty("not-equal"))
                return propValue != condition["not-equal"];
            if (condition.hasOwnProperty("not-equal-strict"))
                return propValue !== condition["not-equal-strict"];
            return false;
        };
        EditorPageController.prototype._applyBehavior = function (beh, propValue, propName) {
            var _this = this;
            var names = Object.keys(beh);
            lang.forEach(names, function (name) {
                var handler = EditorPageController.behaviors[name];
                if (handler) {
                    var prop = beh[name];
                    // NOTE: в качестве значения опции бехейвера может быть имя или массив свойств, к которым его надо применить,
                    // либо, для execute - функция + аргументы события "change" при изменении свойства.
                    // Т.е. для бехейвера "execute" 1-ый параметр (prop) - это функция, которую мы передаем в бихейер,
                    // там он ее вызовет со вторым параметром. Плюс для execute и onchange="*" передается propName.
                    if (lang.isArray(prop)) {
                        prop.forEach(function (prop) {
                            handler.call(_this, prop, propValue);
                        });
                    }
                    else {
                        handler.call(_this, prop, propValue, propName);
                    }
                }
            });
        };
        EditorPageController.prototype._callHandlerWithLoaded = function (handler, val, prop) {
            var that = this;
            var obj = that.viewModel;
            if (val && lang.support.isNotLoaded(val)) {
                val.load().then(function () {
                    val = lang.get(obj, prop);
                    handler.call(that, val, prop);
                });
            }
            else {
                handler.call(that, val, prop);
            }
        };
        EditorPageController.prototype.subscribe = function (onchangeExpr, handler, onchangeReason) {
            var that = this, obj = that.viewModel, val;
            if (onchangeExpr === "*") {
                var handlerWrap_1 = function (sender, args) {
                    if (!args || that.checkReason(args.reason, onchangeReason)) {
                        // NOTE: при использовании OE юзеры получат значение свойства, а не raw-значение,
                        // поэтому тут тоже надо так же (для массивных свойств они будут отличаться)
                        var value = lang.get(sender, args.prop);
                        // NOTE: значение может быть незагружено, и в отличии от OE само оно не загрузится
                        that._callHandlerWithLoaded(handler, value, args.prop);
                    }
                };
                obj.bind("change", handlerWrap_1);
                that._dispoables.push({
                    dispose: function () {
                        obj.unbind("change", handlerWrap_1);
                    }
                });
            }
            else {
                var exprOptions = {};
                var expr_1 = lang.observableExpression(onchangeExpr, exprOptions);
                // NOTE: мы всегда создаем ObservableExpression (а не ObservableExpressionBase), т.к. autoLoad работает
                exprOptions.onchange = function (reason) {
                    // NOTE: выражение надо перевычислять при каждом onchange, иначе отслеживание остановится (не вносить в checkReason
                    var value = expr_1.call(obj);
                    if (that.checkReason(reason, onchangeReason) || expr_1["__ignoreCheckReason"]) {
                        delete expr_1["__ignoreCheckReason"];
                        if (value !== lang.support.loadingValue) {
                            that._callHandlerWithLoaded(handler, value);
                        }
                        else {
                            // изменилось значение на незагруженное,
                            // observableExpression его загрузит и onchange вызовется еще раз, но reason будет "autoLoad"
                            // если для контроллера не задано "autoLoad" в onchangeReason (задано только "change" или ничего),
                            // то мы рискуем потерять изменение, т.к. checkReason в следующий раз не сработает,
                            // поэтому вызываем обработчик сейчас
                            if (onchangeReason && (!lang.isArray(onchangeReason) && onchangeReason !== "autoLoad" ||
                                lang.isArray(onchangeReason) && onchangeReason.indexOf("autoLoad") === -1)) {
                                expr_1["__ignoreCheckReason"] = true;
                            }
                        }
                    }
                };
                // to create actual subscriptions (on "get" events) we need to execute observable-expression
                val = expr_1.call(obj);
                that._dispoables.push(expr_1);
            }
            return val;
        };
        EditorPageController.prototype.checkReason = function (reason, reasonSpec) {
            if (!reason || reasonSpec === "*" ||
                !reasonSpec && (reason === "change" || reason === "autoLoad")) {
                return true;
            }
            if (lang.isArray(reasonSpec)) {
                return reasonSpec.indexOf(reason) > -1;
            }
            else {
                return reason === reasonSpec;
            }
        };
        /*
            navigateToObject: function(obj, path) {
            var parts,
                i;
            if (path.indexOf(".") === -1)
                return {object: obj, prop: path};
            parts = path.split(".")
            for(i = 0; i < parts.length - 1; ++i) {
                obj = obj[parts[i]]();
                if (!obj)
                    return null;
            }
            return {object: obj, prop: parts[parts.length - 1]};
        },*/
        EditorPageController.prototype.stop = function () {
            lang.forEach(this._dispoables, function (disposable) {
                disposable.dispose();
            });
        };
        EditorPageController.behaviors = {
            disable: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.disabled(true);
                }
            },
            enable: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.disabled(false);
                }
            },
            hide: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.hidden(true);
                }
            },
            show: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.hidden(false);
                }
            },
            notnull: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.notnull(true);
                }
            },
            nullable: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.notnull(false);
                }
            },
            goto: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.focus();
                }
            },
            validate: function (value) {
                var pe = this.getPropertyEditor(value);
                if (pe) {
                    pe.runValidation();
                }
            },
            goToNext: function () {
                var pe = this.page.getActivePropertyEditor();
                if (pe) {
                    pe = this.page.getNextPropertyEditor(pe);
                    if (pe) {
                        pe.disabled(false);
                        pe.focus();
                    }
                }
            },
            execute: function (func, propValue, propName) {
                func(this.page, propValue, propName);
            }
        };
        return EditorPageController;
    }(lang.CoreClass));
    EditorPageController.mixin({
        behaviors: EditorPageController.behaviors
    });
    return EditorPageController;
});
//# sourceMappingURL=EditorPageController.js.map