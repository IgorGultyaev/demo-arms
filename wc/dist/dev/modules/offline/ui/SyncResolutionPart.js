/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "lib/ui/handlebars/View", "lib/ui/Carousel", "lib/ui/list/List", "lib/ui/menu/Menu", "lib/domain/DomainObjectMap", "lib/ui/ObjectResolutionPart", "xhtmpl!./templates/SyncResolution.hbs", "i18n!../nls/resources", "i18n!lib/nls/resources", "lib/interop/.interop.types", "lib/ui/ConfirmDialog"], function (require, exports, core, utils, View, Carousel, List, Menu, DomainObjectMap, ObjectResolutionPart, defaultTemplate, resources, resourcesCommon, _interop_types_1) {
    "use strict";
    var lang = core.lang;
    function getIcon(icoName) {
        return (core.ui && core.ui.iconProvider && core.ui.iconProvider.getIcon(icoName)) || "";
    }
    var SyncResolutionPart = /** @class */ (function (_super) {
        __extends(SyncResolutionPart, _super);
        /**
         * @class SyncResolutionPart
         * @extends View
         * @param {Object} options
         */
        function SyncResolutionPart(options) {
            var _this = this;
            options = SyncResolutionPart.mixOptions(options, SyncResolutionPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.app = _this.options.app;
            _this.commands = lang.extend(_this.createCommands(), _this.options.commands);
            _this.menu = new Menu(SyncResolutionPart.defaultMenu, _this.options.menu);
            _this.menu.bindToPart(_this);
            _this.list = _this._createList();
            _this.carousel = new Carousel({
                formatter: function (failure) {
                    if (failure && failure.error) {
                        // TODO: надо иконочку выводить getIcon("error"), но formatter доддерживает только текст :(
                        return failure.error.message;
                    }
                }
            });
            _this.carousel.items().bind("change", _this._initListItems, _this);
            _this.carousel.bind("change:position", _this._initListItems, _this);
            return _this;
        }
        SyncResolutionPart.prototype.setViewModel = function (syncResult) {
            var that = this;
            if (that.syncResult === syncResult) {
                return;
            }
            that.syncResult = syncResult;
            if (that.uow) {
                that.uow.dispose();
            }
            if (that.syncResult && that.syncResult.failures) {
                that.hasErrors(true);
                that.uow = that.app.createUnitOfWork();
                that.resolved = new DomainObjectMap(that.uow.model);
                that.carousel.items().reset(that.syncResult.failures);
                that.carousel.position(0);
                //				that.appStateRestore = that.app.stateManager.getCurrentState();
                //				if (that.appStateRestore.area === "offline") {
                //					// if we're already in offline Area then return to the app root
                //					that.appStateRestore = {};
                //				}
            }
            else {
                that.hasErrors(false);
                that.carousel.items().reset([]);
                that.uow = undefined;
                that.resolved = undefined;
            }
        };
        SyncResolutionPart.prototype.dispose = function (options) {
            var that = this;
            _super.prototype.dispose.call(this, options);
            that.carousel.dispose();
            that.list.dispose();
            if (that.uow) {
                that.uow.dispose();
            }
            that.uow = undefined;
            that.resolved = undefined;
        };
        /**
         * @protected
         * @returns {{Retry: (Command), CancelAll: (Command), Cancel: (Command), Next: (Command), Close: (Command), GoOffline: (Command)}}
         */
        SyncResolutionPart.prototype.createCommands = function () {
            var that = this;
            return {
                "Retry": core.createCommand({
                    execute: function () {
                        that.retrySync();
                    }
                }),
                "UndoAll": core.createCommand({
                    execute: function () {
                        core.ui.ConfirmDialog.create({
                            header: resources["sync.title"],
                            text: resources["sync.menu.undo_all.confirm"]
                        }).open().then(function (result) {
                            if (result !== "yes") {
                                return;
                            }
                            that.app.eventPublisher.publish("interop.sync.cancel", that.syncResult || {});
                            that.close();
                        });
                    }
                }),
                "Undo": core.createCommand({
                    execute: function () {
                        core.ui.ConfirmDialog.create({
                            header: resources["sync.title"],
                            text: resources["sync.menu.undo.confirm"]
                        }).open().then(function (result) {
                            if (result !== "yes") {
                                return;
                            }
                            var args = { failures: [that.carousel.current()] };
                            that.app.eventPublisher.publish("interop.sync.cancel", args);
                            that.removeCurrent();
                        });
                    }
                }),
                "Next": core.createCommand({
                    execute: function () {
                        that.removeCurrent();
                    }
                }),
                "Close": core.createCommand({
                    execute: function () {
                        that.close();
                    }
                }),
                "GoOffline": core.createCommand({
                    execute: function () {
                        that.app.dataFacade.manuallyDisconnected(true);
                        that.retrySync();
                    }
                })
            };
        };
        SyncResolutionPart.prototype.removeCurrent = function () {
            var that = this;
            that.carousel.removeCurrent();
            if (!that.carousel.count()) {
                that.retrySync();
            }
        };
        /**
         * Return title for "Next" command (remove the current error and retry on the last one).
         * It's used in template.
         * @returns {String}
         */
        SyncResolutionPart.prototype.getCmdNextTitle = function () {
            return this.get("carousel").count() === 1 ? resources["sync.menu.finish"] : resources["sync.menu.next"];
        };
        /**
         * Count of errors originally in server's response. It's used in template.
         * @returns {integer}
         */
        SyncResolutionPart.prototype.errorCountOriginal = function () {
            if (this.hasErrors()) {
                return this.syncResult.failures.length;
            }
            return 0;
        };
        /**
         * Count of errors currently in courusel. It's used in template.
         * @returns {integer}
         */
        SyncResolutionPart.prototype.errorCountCurrent = function () {
            return this.get("carousel").count();
        };
        SyncResolutionPart.prototype.retrySync = function () {
            var that = this;
            that.app.eventPublisher.publish("interop.sync.retry", that.syncResult || {});
            that.close();
        };
        SyncResolutionPart.prototype.close = function () {
            var that = this;
            that.app.stateManager.switchState(that.appStateRestore);
            that.setViewModel(null);
        };
        SyncResolutionPart.prototype._createList = function () {
            var that = this;
            return new List(that.app, {
                menuList: { items: [] },
                menuSelection: { items: [] },
                menuRow: { items: [] },
                columns: [
                    {
                        name: "status",
                        prop: "statusInfo",
                        title: resources["sync.column.status"],
                        width: 20,
                        formatterHtml: function (info) {
                            if (!info) {
                                return "";
                            }
                            return "<span class=\"" + info.cssClass + "\">" + getIcon(info.icon) + lang.encodeHtml(info.text) + "</span>";
                        }
                    }, {
                        name: "cmd",
                        prop: "command",
                        title: "*",
                        width: 30,
                        formatterHtml: function (name) {
                            if (!name) {
                                return "";
                            }
                            var menuItem = {
                                name: name,
                                title: resources["sync.menu." + utils.toLowerCamel(name)] || name
                            };
                            return "<a href='#' class='x-cmd-link' data-cmd-name='" + name + "'>" + Menu.getItemHtml(menuItem) + "</a>";
                        }
                    }, {
                        name: "type",
                        title: resources["sync.column.type"],
                        width: 30
                    }, {
                        name: "id",
                        title: resources["sync.column.id"],
                        width: 50
                    }, {
                        name: "object",
                        title: resources["sync.column.object"],
                        width: 100
                    }
                ],
                commands: {
                    "Edit": core.createCommand({
                        execute: function (args) {
                            var item = args.object, obj = item.object(), uow = that.app.createUnitOfWork(), policy = {
                                loadFirst: "local",
                                allowRemote: true,
                                allowLocal: true,
                                shouldCache: false
                            }, deferredViewModel = uow.load(obj.meta.name, obj.id, { policy: policy }); // load locally
                            that.navigationService.navigate({
                                part: args.partName || "ObjectEditor:" + obj.meta.name,
                                partOptions: { viewModel: deferredViewModel },
                                onReturn: function () {
                                    uow.dispose();
                                }
                            });
                        }
                    }),
                    "Resolve": core.createCommand({
                        execute: function (args) {
                            var item = args.object, obj = item.object(), failure = that.carousel.current(), local = lang.find(failure.objects, function (o) {
                                // TODO: inheritance
                                return o.id === obj.id && o.__metadata.type === obj.meta.name;
                            }), original = lang.find(failure.result && failure.result.originalObjects, function (o) {
                                // TODO: inheritance
                                return o.id === obj.id && o.__metadata.type === obj.meta.name;
                            }), part = new ObjectResolutionPart({
                                local: local,
                                original: original
                            });
                            that.navigationService.navigate({
                                part: part,
                                onReturn: function (result) {
                                    if (!result || !result.resolved) {
                                        return;
                                    }
                                    // put changes to UoW to show them in UI
                                    that.uow.fromJson(result.changes, { partial: true });
                                    var removed = obj.isLoaded && (obj.isRemoved() || obj.isInvalid()), defer = result.changes ?
                                        that.app.dataFacade.save(result.changes, { suppressEventOnSuccess: true }) :
                                        null;
                                    lang.async.done(defer, function () {
                                        var status = removed ?
                                            SyncResolutionPart.ObjectListItem.Status.removed :
                                            SyncResolutionPart.ObjectListItem.Status.resolved;
                                        that.resolved.add(obj, status);
                                        item.status(status);
                                    });
                                }
                            });
                        }
                    })
                }
            });
        };
        SyncResolutionPart.prototype._initListItems = function () {
            var that = this, failure = that.carousel.current(), objects = (failure && failure.objects) || [], items = objects.map(function (json) {
                var obj = that.uow.get(json.__metadata.type, json.id);
                return that._createListItem(obj, failure);
            });
            that.list.setData(items);
        };
        SyncResolutionPart.prototype._createListItem = function (obj, failure) {
            var that = this, item = new SyncResolutionPart.ObjectListItem(obj), status = that.resolved.find(obj.meta.name, obj.id), serverError;
            if (!status) {
                serverError = failure && failure.error && failure.error.serverError;
                status = that._getListItemStatusFromError(obj, serverError);
            }
            item.status(status);
            return item;
        };
        SyncResolutionPart.prototype._getListItemStatusFromError = function (obj, serverError) {
            if (!serverError || !serverError.$className) {
                return undefined;
            }
            var that = this;
            switch (serverError.$className) {
                case "XOptimisticConcurrencyException":
                    if (that._findIdentity(serverError.obsoleteObjects, obj)) {
                        return SyncResolutionPart.ObjectListItem.Status.obsolete;
                    }
                    if (that._findIdentity(serverError.deletedObjects, obj)) {
                        return SyncResolutionPart.ObjectListItem.Status.notFound;
                    }
                    break;
                case "XIntegrityViolationException":
                    // TODO:
                    return SyncResolutionPart.ObjectListItem.Status.violation;
            }
            return undefined;
        };
        SyncResolutionPart.prototype._findIdentity = function (identities, obj) {
            if (!identities) {
                return undefined;
            }
            return lang.find(identities, function (id) {
                return id.id === obj.id && id.type === obj.meta.name;
            });
        };
        SyncResolutionPart.defaultOptions = {
            template: defaultTemplate,
            unbound: false
        };
        SyncResolutionPart.defaultMenu = {
            items: [
                // TODO: change title dynamically
                {
                    name: "Next",
                    html: "<span class='x-icon x-icon-ok'></span><span id='x-sync-resolution-cmd-next'></span>",
                    icon: "ok",
                    hint: resources["sync.menu.next.hint"]
                },
                { name: "Undo", title: resources["sync.menu.undo"], icon: "undo", hint: resources["sync.menu.undo.hint"] },
                {
                    name: "More", title: resources["sync.menu.ext"], items: [
                        { name: "Retry", title: resources["sync.menu.retry"] },
                        { name: "UndoAll", title: resources["sync.menu.undo_all"], icon: "undo" },
                        { name: "GoOffline", title: resourcesCommon["interop.go_offline"], icon: "offline" }
                    ]
                }
            ]
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], SyncResolutionPart.prototype, "hasErrors");
        return SyncResolutionPart;
    }(View));
    (function (SyncResolutionPart) {
        var ObjectListItem = /** @class */ (function (_super) {
            __extends(ObjectListItem, _super);
            /**
             * @constructs ObjectListItem
             * @extends Observable
             * @param object
             */
            function ObjectListItem(object) {
                var _this = _super.call(this) || this;
                _this.object(object);
                _this.isLoaded = object.isLoaded;
                return _this;
            }
            ObjectListItem.prototype.statusInfo = function () {
                var that = this;
                switch (that.status()) {
                    case ObjectListItem.Status.violation:
                        return { text: resources["sync.object_status.violation"], icon: "error", cssClass: "text-danger" };
                    case ObjectListItem.Status.obsolete:
                        return { text: resources["sync.object_status.obsolete"], icon: "error", cssClass: "text-danger" };
                    case ObjectListItem.Status.notFound:
                        return { text: resources["sync.object_status.not_found"], icon: "error", cssClass: "text-danger" };
                    case ObjectListItem.Status.removed:
                        return { text: resources["sync.object_status.removed"], icon: "ok", cssClass: "text-success" };
                    case ObjectListItem.Status.resolved:
                        return { text: resources["sync.object_status.resolved"], icon: "ok", cssClass: "text-success" };
                }
                return null;
            };
            ObjectListItem.prototype.command = function () {
                var that = this;
                switch (that.status()) {
                    case ObjectListItem.Status.obsolete:
                        return "Resolve";
                    case ObjectListItem.Status.notFound:
                    case ObjectListItem.Status.removed:
                        return ""; // no command for deleted objects
                    default:
                        return "Edit";
                }
            };
            ObjectListItem.prototype.type = function () {
                return this.object().meta.descr;
            };
            ObjectListItem.prototype.id = function () {
                return this.object().id;
            };
            ObjectListItem.prototype.load = function () {
                var _this = this;
                return this.object().load({ policy: _interop_types_1.LoadRule.localOnly }).then(function (loaded) {
                    _this.isLoaded = loaded.isLoaded;
                    _this.object(loaded);
                    return _this;
                });
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], ObjectListItem.prototype, "object");
            __decorate([
                lang.decorators.observableAccessor()
            ], ObjectListItem.prototype, "status");
            return ObjectListItem;
        }(lang.Observable));
        SyncResolutionPart.ObjectListItem = ObjectListItem;
        (function (ObjectListItem) {
            ObjectListItem.Status = {
                violation: "violation",
                obsolete: "obsolete",
                notFound: "notFound",
                removed: "removed",
                resolved: "resolved"
            };
        })(ObjectListItem = SyncResolutionPart.ObjectListItem || (SyncResolutionPart.ObjectListItem = {}));
    })(SyncResolutionPart || (SyncResolutionPart = {}));
    // backward compatibility:
    SyncResolutionPart.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: SyncResolutionPart.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: SyncResolutionPart.defaultMenu
    });
    SyncResolutionPart.ObjectListItem.mixin({
        statuses: SyncResolutionPart.ObjectListItem.Status
    });
    core.ui.SyncResolutionPart = SyncResolutionPart;
    return SyncResolutionPart;
});
//# sourceMappingURL=SyncResolutionPart.js.map