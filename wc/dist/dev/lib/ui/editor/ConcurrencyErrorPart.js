/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "xhtmpl!lib/ui/templates/ConcurrencyErrorPart.hbs"], function (require, exports, core, View, Menu, resources, defaultTemplate) {
    "use strict";
    var lang = core.lang;
    var ConcurrencyErrorPart = /** @class */ (function (_super) {
        __extends(ConcurrencyErrorPart, _super);
        /**
         * Object editor concurrency error resolver part
         * @class ConcurrencyErrorPart
         * @extends View
         */
        function ConcurrencyErrorPart(options) {
            var _this = this;
            options = ConcurrencyErrorPart.mixOptions(options, ConcurrencyErrorPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.error = options.error;
            _this.severity = options.severity;
            _this.editor = options.editor;
            _this._defer = core.lang.deferred();
            _this.promise = _this._defer.promise();
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            _this.menu.bindToPart(_this);
            _this.bind("change:isBusy", _this._onBusyChanged, _this);
            _this.isBusy(false);
            return _this;
        }
        /**
         * @protected
         * @returns {{KeepLocal: (Command), KeepServer: (Command), Resolve: (Command)}}
         */
        ConcurrencyErrorPart.prototype.createCommands = function () {
            var that = this;
            return {
                KeepLocal: core.createCommand({
                    execute: function () {
                        that._onExecute(ConcurrencyErrorPart.actions.keepLocal);
                    }
                }),
                KeepServer: core.createCommand({
                    execute: function () {
                        that._onExecute(ConcurrencyErrorPart.actions.keepServer);
                    }
                }),
                Resolve: core.createCommand({
                    execute: function () {
                        that._onExecute(ConcurrencyErrorPart.actions.resolve);
                    }
                })
            };
        };
        ConcurrencyErrorPart.prototype.createMenu = function () {
            return Menu.create({
                items: [
                    {
                        name: "KeepLocal",
                        title: resources["concurrencyErrorPart.keepLocal"],
                        hint: resources["concurrencyErrorPart.keepLocal.hint"],
                        icon: "save"
                    }, {
                        name: "KeepServer",
                        title: resources["concurrencyErrorPart.keepServer"],
                        hint: resources["concurrencyErrorPart.keepServer.hint"],
                        icon: "download"
                    }, {
                        name: "Resolve",
                        title: resources["concurrencyErrorPart.resolve"],
                        hint: resources["concurrencyErrorPart.resolve.hint"],
                        icon: "settings"
                    }
                ]
            });
        };
        ConcurrencyErrorPart.prototype._onBusyChanged = function (sender, value) {
            var that = this;
            that.commands.KeepLocal.canExecute(!value);
            that.commands.KeepServer.canExecute(!value);
            that.commands.Resolve.canExecute(!value);
        };
        ConcurrencyErrorPart.prototype.findOriginalObject = function (originalObjects, obsoleteObject) {
            return core.lang.find(originalObjects, function (obj) {
                // todo: remove objectID , left or backward compatibility
                return obj.__metadata.type === obsoleteObject.type &&
                    (obj.id === obsoleteObject.id || obj.id === obsoleteObject.objectID);
            });
        };
        /**
         * @param {ConcurrencyErrorPart#actions} action
         * @private
         */
        ConcurrencyErrorPart.prototype._onExecute = function (action) {
            var that = this, local, originalObject, uow = that.editor.viewModel.uow, obsoleteObjects = that.error.serverError.obsoleteObjects, originalObjects = that.error.originalObjects, deferred = [];
            that.isBusy(true);
            switch (action) {
                case ConcurrencyErrorPart.actions.keepServer:
                    uow.rollbackState();
                    obsoleteObjects.forEach(function (obsoleteObject) {
                        // todo: remove objectID , left or backward compatibility
                        deferred.push(uow.reload(obsoleteObject.type, obsoleteObject.id || obsoleteObject.objectID));
                    });
                    core.lang.whenAll(deferred)
                        .done(function () {
                        that._defer.resolve();
                    })
                        .always(function () {
                        that.isBusy(false);
                    });
                    break;
                case ConcurrencyErrorPart.actions.keepLocal:
                    obsoleteObjects.forEach(function (obsoleteObject) {
                        originalObject = that.findOriginalObject(originalObjects, obsoleteObject);
                        if (originalObject) {
                            var objToUpdate = uow.find(originalObject.__metadata.type, originalObject.id);
                            if (objToUpdate) {
                                objToUpdate.setTs(originalObject.__metadata.ts);
                            }
                        }
                    });
                    that._defer.resolve();
                    break;
                case ConcurrencyErrorPart.actions.resolve:
                    core.lang.async.forEach(obsoleteObjects, function (obsoleteObject) {
                        var resolveTask = core.lang.deferred(), part;
                        // todo: remove objectID , left or backward compatibility
                        local = uow.find(obsoleteObject.type, obsoleteObject.id || obsoleteObject.objectID);
                        originalObject = that.findOriginalObject(originalObjects, obsoleteObject);
                        if (local) {
                            part = new core.ui.ObjectResolutionPart({
                                title: that.editor.title,
                                local: local.toJson({ onlyChanged: true }),
                                original: originalObject
                            });
                            that.navigationService.navigate({
                                part: part,
                                activateOptions: {
                                    freezeUrl: true
                                },
                                onReturn: function (result) {
                                    part.dispose();
                                    if (result && result.resolved) {
                                        if (result.changes) {
                                            local = uow.fromJson(result.changes, { dirty: true });
                                        }
                                        resolveTask.resolve();
                                    }
                                    else {
                                        resolveTask.reject();
                                    }
                                }
                            });
                            return resolveTask;
                        }
                    })
                        .done(function () {
                        that._defer.resolve();
                    })
                        .always(function () {
                        that.isBusy(false);
                    });
                    break;
            }
        };
        ConcurrencyErrorPart.defaultOptions = {
            template: defaultTemplate,
            severity: "critical",
            unbound: false
        };
        /**
         * @enum {String}
         */
        ConcurrencyErrorPart.actions = {
            keepServer: "keepServer",
            keepLocal: "keepLocal",
            resolve: "resolve"
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ConcurrencyErrorPart.prototype, "isBusy");
        return ConcurrencyErrorPart;
    }(View));
    ConcurrencyErrorPart.mixin({
        defaultOptions: ConcurrencyErrorPart.defaultOptions,
        actions: ConcurrencyErrorPart.actions
    });
    return ConcurrencyErrorPart;
});
//# sourceMappingURL=ConcurrencyErrorPart.js.map