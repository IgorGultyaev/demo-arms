/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "./DraftManager", "lib/ui/ConfirmDialog", "lib/ui/PopupView", "xhtmpl!./ui/templates/DraftsView.hbs", "i18n!./nls/resources", "lib/ui/editor/ObjectEditor", "lib/ui/editor/ObjectWizard", "lib/ui/editor/ObjectViewer", "lib/ui/editor/ObjectFilter"], function (require, exports, core, utils, DraftManager, ConfirmDialog, PopupView, draftsTemplate, resourcesDrafts) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    // extend common resources
    var resources = core.nls.merge(resourcesDrafts);
    // patch ObjectEditor prototype
    var ObjectEditor = core.ui.ObjectEditor;
    // Extend ObjectEditor prototype
    lang.override(ObjectEditor.prototype, {
        createCommands: function (base) {
            var _this = this;
            var commands = base.call(this);
            if (this.options.skipDraftCreation) {
                return commands;
            }
            commands.DetachDraft = core.createCommand({
                execute: function () {
                    _this.detachDraft();
                },
                name: "DetachDraft"
            });
            return commands;
        },
        onDisposed: function (base, options) {
            var that = this;
            base.call(that, options);
            if ((!that.editorContext || !that.editorContext.nested) && // it's a root editor
                options.reason !== "close" && // we're being closed from outside (it isn't a call of finish/cancel) - create a draft
                !that.options.skipDraftCreation &&
                (!options.activityContext || !options.activityContext.skipDraftCreation)) {
                var detachOptions = (options.reason === "windowUnload") ? { autoRecovery: true } : {};
                that._detachChanges(detachOptions);
            }
        },
        onQueryUnloadWithChanges: function (base, options) {
            if (options.reason === "close" ||
                lang.coalesce(options.skipDraftCreation, this.options.skipDraftCreation) ||
                (this.editorContext.nested && options.reason !== "unload")) {
                if (options.activityContext) {
                    options.activityContext.skipDraftCreation = true;
                }
                return base.call(this, options);
            }
            var msg = resources["drafts.editor_query_unload_prompt"];
            var menu = { items: [
                    { name: "yes", title: resources["yes"], isDefaultAction: true },
                    { name: "no", title: resources["no"] },
                    { name: "cancel", title: resources["cancel"] }
                ] };
            var dialog = ConfirmDialog.create({ header: resources["editor"], text: msg, menu: menu });
            return dialog.open().then(function (result) {
                if (result === "cancel") {
                    return resources["closing_canceled"];
                }
                if (result === "no") {
                    if (options && options.activityContext) {
                        // передадим в корневой редактор, что не надо создавать черновик
                        options.activityContext.skipDraftCreation = true;
                    }
                }
            });
        },
        createAsyncSaveErrorEvent: function (base, args) {
            var event = base.call(this, args);
            if (this.options.skipDraftCreation) {
                return event;
            }
            var menu = {
                items: [
                    {
                        name: "DetachDraft",
                        title: resources["drafts.put_off"],
                        icon: "detachDraft",
                        command: this.commands.DetachDraft,
                        order: -10
                    }
                ]
            };
            if (core.eth.isUnrecoverableError(event.error)) {
                event.menu.removeItem("SaveLocally");
                event.menu.mergeWith(menu);
            }
            else if (!event.menu.getItem("SaveLocally")) {
                event.menu.mergeWith(menu);
            }
            return event;
        }
    });
    lang.extend(ObjectEditor.prototype, /** @lends ObjectEditor.prototype */ {
        /**
         *
         * @param {Object} options
         * @param {String} [options.title] draft's title, if not specified "type:toString()" will be used
         * @param {String} [options.description] additional description for draft (like "auto-recovery")
         * @param {Boolean} [options.autoRecovery] flag says "the draft is being created by auto-recovery process"
         * @param {Object} [options.toJsonOptions] Options for `UnitOfWork.getChanges`
         * @private
         */
        _detachChanges: function (options) {
            if (!this.viewModel || !this.viewModel.uow)
                return;
            options = options || {};
            var that = this;
            var title = options.title || (that.viewModel.meta.descr + ": " + that.viewModel.toString()), 
            // NOTE: don't call uow.detachChanges() - it will cause rollback and updating bindings
            changes = that.viewModel.uow.getChanges(options.toJsonOptions);
            if (that._hasMeaningfulChanges(changes) && that.app && that.app.eventPublisher) {
                var appState = that._appState || that.app.stateManager.getCurrentState();
                if (appState) {
                    appState.isDefaultPart = false;
                    appState.regionState = {
                        part: that.name,
                        partOptions: {
                            initialJson: changes,
                            type: that.viewModel.meta.name,
                            id: that.viewModel.id
                        }
                    };
                    that.app.eventPublisher.publish(DraftManager.Event_CreateDraft, {
                        title: title,
                        description: options.description,
                        autoRecovery: options.autoRecovery,
                        appState: appState
                    });
                }
                else {
                    that.traceSource.warn("Application.stateManager.getCurrentState returns empty state");
                }
            }
        },
        detachDraft: function (options) {
            this._detachChanges(options);
            return this.navigationService.close({ success: false });
        }
    });
    // extend default menus in ObjectEditor-based components
    core.ui.ObjectEditor.prototype.defaultMenus.RootEditor.items.push({
        name: "DetachDraft",
        title: resources["drafts.put_off"],
        icon: "detachDraft"
    });
    core.ui.ObjectWizard.prototype.defaultMenus.Wizard.items.push({
        name: "DetachDraft",
        title: resources["drafts.put_off"],
        icon: "detachDraft"
    });
    // extend default options in ObjectEditor-based components
    core.ui.ObjectEditor.defaultOptions.skipDraftCreation = false;
    core.ui.ObjectViewer.defaultOptions.skipDraftCreation = true;
    core.ui.ObjectFilter.defaultOptions.skipDraftCreation = true;
    var DraftsViewModel = /** @class */ (function (_super) {
        __extends(DraftsViewModel, _super);
        /**
         * @constructs DraftsViewModel
         * @extends Observable
         * @param {DraftManager} draftManager
         */
        function DraftsViewModel(draftManager) {
            var _this = _super.call(this) || this;
            if (!draftManager) {
                throw new Error("DraftsViewModel.ctor was called without draftManager param");
            }
            _this._draftManager = draftManager;
            _this._draftManager.bind("draftsChange", _this._initDrafts, _this);
            _this._initDrafts();
            _this.commands = _this.createCommands();
            return _this;
        }
        DraftsViewModel.prototype._initDrafts = function () {
            var that = this;
            that.drafts = that._draftManager.getDrafts().map(function (draft) {
                var item = {
                    draft: draft,
                    createdFormatted: function () {
                        return utils.formatDatetimeAgo(this.draft.created);
                    },
                    description: undefined
                };
                if (draft.autoRecovery) {
                    item.description = "(" + resources["drafts.auto_recovery"] + ")";
                }
                else if (draft.description) {
                    item.description = "(" + draft.description + ")";
                }
                return item;
            });
            that.trigger("change", that);
        };
        /**
         * Create commands
         * @protected
         * @returns {{Restore: (Command), Remove: (Command), RemoveAll: (Command)}}
         */
        DraftsViewModel.prototype.createCommands = function () {
            var that = this, cmdRestore = core.createCommand({
                name: "Restore",
                execute: function (args) {
                    that._draftManager.restoreDraft(args.draft);
                }
            }), cmdRemove = core.createCommand({
                name: "Remove",
                execute: function (args) {
                    that._draftManager.removeDraft(args.draft);
                }
            }), cmdRemoveAll = core.createCommand({
                name: "RemoveAll",
                execute: function () {
                    that._draftManager.removeAllDrafts();
                }
            });
            return {
                Restore: cmdRestore,
                Remove: cmdRemove,
                RemoveAll: cmdRemoveAll
            };
        };
        DraftsViewModel.prototype.dispose = function () {
            this._draftManager.unbind("draftsChange", null, this);
            _super.prototype.dispose.call(this);
        };
        return DraftsViewModel;
    }(lang.Observable));
    core.createModule("drafts", function (app) {
        return {
            initialize: function (app) {
                this.draftManager = app.draftManager = new DraftManager(app);
                if (app.sysMenu) {
                    var menuItem_1 = app.sysMenu.getRootItem("drafts");
                    if (!menuItem_1) {
                        var count = app.draftManager.count();
                        menuItem_1 = app.sysMenu.addRootItem({
                            name: "drafts",
                            title: resources["drafts.moduleName"],
                            badge: count ? count.toString() : "",
                            order: 5,
                            getPart: function () {
                                var viewModel = new DraftsViewModel(app.draftManager);
                                var viewOptions = {
                                    bodyTemplate: draftsTemplate,
                                    title: resources["drafts.moduleName"],
                                    viewModel: viewModel,
                                    disposeOnClose: true,
                                    menu: {
                                        items: [{
                                                name: "RemoveAll",
                                                title: resources["delete_all"],
                                                icon: "remove",
                                                command: viewModel.commands.RemoveAll
                                            }]
                                    }
                                };
                                return new PopupView(viewOptions);
                            }
                        });
                        // TODO: уведомление об изменении кол-ва черновиков
                        this.draftManager.bind("change:count", function (sender, count) {
                            if (count > 0) {
                                menuItem_1.badge(count);
                            }
                            else {
                                menuItem_1.badge("");
                            }
                        });
                    }
                }
                app.eventPublisher.subscribe("app.start", function () {
                    lang.some(app.draftManager.getDrafts(), function (draft) {
                        if (draft.autoRecovery) {
                            draft.autoRecovery = false;
                            window.setTimeout(function () {
                                ConfirmDialog.create({
                                    header: "Auto recovery",
                                    text: resources["drafts.restore_autorecovery_prompt"]
                                }).open()
                                    .done(function (result) {
                                    if (result === "yes") {
                                        app.draftManager.restoreDraft(draft);
                                    }
                                    else {
                                        draft.autoRecovery = false;
                                        app.draftManager.updateDraft(draft);
                                    }
                                });
                            }, 0);
                            return true; // stop iteration
                        }
                    });
                });
            }
        };
    });
});
//# sourceMappingURL=module-drafts.js.map