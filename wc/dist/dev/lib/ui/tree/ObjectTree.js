/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/tree/Tree", "lib/ui/PartCommandMixin", "lib/ui/menu/Menu", "lib/ui/ConfirmDialog", "lib/ui/PartWithFilterMixin", "i18n!lib/nls/resources"], function (require, exports, core, Tree, PartCommandMixin, Menu, ConfirmDialog, PartWithFilterMixin, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectTreeLoader = /** @class */ (function () {
        function ObjectTreeLoader() {
        }
        ObjectTreeLoader.prototype.loadChildren = function (tree, node, params, options) {
            if (!tree.options.dataSource) {
                return null;
            }
            var path = tree.getNodePath(node);
            return tree.options.dataSource.loadChildren(path, params, options).then(function (response) {
                return response.result.map(function (json) {
                    var data = json.data, obj = (data.id && data.__metadata && data.__metadata.type) ? tree.uow.fromJson(data) : data;
                    return { data: obj, isLeaf: json.isLeaf };
                });
            });
        };
        return ObjectTreeLoader;
    }());
    var ObjectTree = /** @class */ (function (_super) {
        __extends(ObjectTree, _super); /* implements PartCommandMixin */
        /**
         * @constructs ObjectTree
         * @extends Tree
         * @param {Application} app
         * @param {Object} options
         */
        function ObjectTree(app, options) {
            var _this = this;
            options = ObjectTree.mixOptions(options, ObjectTree.defaultOptions);
            _this = _super.call(this, app, options) || this;
            _this.title = _this.options.title;
            _this.subscribeOnNavigation();
            return _this;
        }
        ObjectTree.prototype._initializeProps = function () {
            _super.prototype._initializeProps.call(this);
            var that = this;
            that.uow = that.options.uow || that.app.createUnitOfWork({ connected: true });
            that.uow.bind("detach", that.onObjectDetached, that);
            if (!that.options.editable && that.options.dnd) {
                that.traceSource.error("Incompatible Tree options: specified d-n-d but not editable");
                that.options.dnd = null;
            }
            that.initFilter(that.options, that.userSettings);
        };
        ObjectTree.prototype.getNodeLoadParams = function (node) {
            return this.getFilterRestrictions();
        };
        ObjectTree.prototype.showFilterError = function (error) {
            this.hintMessage(resources["objectTree.getRestrictionsError"] + error);
        };
        ObjectTree.prototype.defaultIdentifier = function (tree, node) {
            var data = node && node.data();
            if (!data) {
                return {};
            }
            return {
                id: data.id,
                type: (data.meta && data.meta.name) || data.type || data.toString()
            };
        };
        ObjectTree.prototype._isNodeSelectable = function (node) {
            return this.isDomainNode(node);
        };
        /**
         * @protected
         * @returns {{Edit: BoundCommand, Create: BoundCommand, Delete: BoundCommand, Reload: BoundCommand, ReloadRoot: BoundCommand, Save: ?BoundCommand, Cancel: ?BoundCommand, DeleteSelection: BoundCommand, SelectChildren: BoundCommand, SelectSiblings: BoundCommand,SelectNone: BoundCommand }}
         */
        ObjectTree.prototype.createCommands = function () {
            var that = this, 
            /** @type {BoundCommand} */
            BoundCommand = core.commands.BoundCommand, commands = {
                Edit: new BoundCommand(that.doEdit, that.canEdit, that),
                Create: new BoundCommand(that.doCreate, that.canCreate, that),
                Delete: new BoundCommand(that.doDelete, that.canDelete, that),
                Reload: new BoundCommand(that.doReloadActive, that.canReloadActive, that),
                ReloadRoot: new BoundCommand(that.doReloadRoot, that.canReloadRoot, that),
                DeleteSelection: new BoundCommand(that.doDeleteSelection, that.canDeleteSelection, that),
                SelectChildren: new BoundCommand(that.doSelectChildren, that.canSelectChildren, that),
                SelectSiblings: new BoundCommand(that.doSelectSiblings, that.canSelectSiblings, that),
                SelectNone: new BoundCommand(that.doSelectNone, that.canSelectNone, that)
            };
            if (that.options.editable) {
                commands.Save = new BoundCommand(that.doSave, that.canSave, that);
                commands.Cancel = new BoundCommand(that.doCancel, that.canCancel, that);
            }
            core.lang.extend(commands, that.options.commands);
            return commands;
        };
        ObjectTree.prototype.createTreeMenuDefaults = function () {
            var key = this.options.editable ? "EditableTree" : "Tree";
            return Menu.defaultsFor(this.defaultMenus[key], key);
        };
        ObjectTree.prototype.createTreeMenu = function () {
            var menu = _super.prototype.createTreeMenu.call(this), filter = this.filter;
            if (filter && filter.menu) {
                menu.mergeWith(filter.menu);
                this._fieldWithFilterMenu = "menuTree";
            }
            return menu;
        };
        ObjectTree.prototype.createNodeMenuDefaults = function (node) {
            var identity = this.getNodeIdentity(node);
            return Menu.defaultsFor(this.defaultMenus.TreeNode, "TreeNode", identity.type);
        };
        ObjectTree.prototype.createSelectionMenuDefaults = function () {
            return Menu.defaultsFor(this.defaultMenus.TreeSelection, "TreeSelection");
        };
        ObjectTree.prototype.isDomainNode = function (node) {
            if (!node) {
                return false;
            }
            var that = this, identity = that.getNodeIdentity(node);
            return !!(identity.id && identity.type && that.uow.model.meta.entities[identity.type]);
        };
        ObjectTree.prototype.isOperableNode = function (node) {
            if (!this.isDomainNode(node)) {
                return false;
            }
            var obj = node.data();
            return obj && !core.lang.get(obj, "isRemoved") && !core.lang.get(obj, "isInvalid");
        };
        ObjectTree.prototype.doCreate = function (args) {
            var that = this, type = args.type;
            return that.executePartCommand({
                part: "ObjectEditor:" + type,
                partOptions: that.options.editable ?
                    { type: type, uow: that.uow } :
                    { type: type }
            }, args, "Create").closed;
        };
        ObjectTree.prototype.canCreate = function () {
            return this.navigationService && !!this.navigationService.navigate;
        };
        ObjectTree.prototype.onBeforeCreate = function (createOptions) { };
        ObjectTree.prototype.onAfterCreate = function (result, createOptions) {
            var that = this, type = createOptions.type;
            if (!result.success || !result.object) {
                that.activate();
                return;
            }
            core.lang.when(result.success).then(function () {
                that.uow
                    .get(type, result.object.id) // get create object's stub
                    .load({
                    policy: {
                        loadFirst: "local",
                        allowRemote: true,
                        allowLocal: true,
                        shouldCache: false
                    }
                })
                    .done(function (obj) {
                    var parentNode = createOptions.parentNode, node;
                    if (parentNode && parentNode.state() === Tree.NodeState.loaded && obj) {
                        // TODO: load first if state() === "initial"
                        node = new that.Node(obj, createOptions.isLeaf);
                        that.addNode(node, parentNode);
                        that.activeNode(node);
                    }
                    that.activate();
                });
            });
        };
        ObjectTree.prototype.doEdit = function (args) {
            var that = this, node = that.activeNode(), basicOptions = that._createEditBasicOptions(node);
            return that.executePartCommand(basicOptions, args, "Edit").closed;
        };
        ObjectTree.prototype.canEdit = function () {
            var that = this;
            return that.navigationService && that.navigationService.navigate && that.isOperableNode(that.activeNode());
        };
        ObjectTree.prototype.onBeforeEdit = function (editOptions) {
            if (!editOptions.navigateSiblings) {
                return;
            }
            var that = this, activeNode = that.activeNode(), parentNode = activeNode && activeNode.parent();
            if (parentNode) {
                var children = parentNode.children().all(), activeType_1 = that._getNodeType(activeNode);
                if (children.every(function (node) { return activeType_1 === that._getNodeType(node); })) {
                    var partOptions_1 = editOptions.partOptions = editOptions.partOptions || {};
                    partOptions_1.navigateSiblings = children
                        .map(function (node) {
                        var siblingOptions = that._createEditBasicOptions(node).partOptions;
                        return core.lang.append(siblingOptions, partOptions_1);
                    });
                    editOptions.parentNode = parentNode;
                }
            }
        };
        ObjectTree.prototype.onAfterEdit = function (result, editOptions) {
            if (editOptions.navigateSiblings && result && result.selectedId) {
                var activeNode = this.activeNode(), parentNode = activeNode && activeNode.parent();
                // NOTE: activeNode (and its parent) may be changed while editing; check it
                if (parentNode && parentNode === editOptions.parentNode) {
                    var selectedNode = parentNode.children().find(function (node) { return node.data().id === result.selectedId; });
                    if (selectedNode) {
                        this.activeNode(selectedNode);
                    }
                }
            }
            this.activate();
        };
        ObjectTree.prototype._getNodeType = function (node) {
            var identity = this.getNodeIdentity(node);
            return identity.type;
        };
        ObjectTree.prototype._createEditBasicOptions = function (node) {
            var that = this, obj = node.data(), type, partOptions, identity;
            if (lang.isPlainObject(obj)) {
                identity = that.getNodeIdentity(node);
                type = identity.type;
                partOptions = that.options.editable ?
                    { viewModel: that.uow.get(type, identity.id) } :
                    { type: type, id: identity.id };
            }
            else {
                type = obj.meta.name;
                partOptions = that.options.editable ?
                    { viewModel: obj } :
                    { type: type, id: obj.id };
            }
            return {
                part: "ObjectEditor:" + type,
                partOptions: partOptions
            };
        };
        ObjectTree.prototype.doDelete = function () {
            var node = this.activeNode(), obj;
            if (node) {
                obj = node.data();
                this._deleteObjects([obj]);
            }
        };
        ObjectTree.prototype.canDelete = function () {
            var that = this;
            if (!that.options.editable && that.saving()) {
                return false;
            }
            return that.isOperableNode(that.activeNode());
        };
        ObjectTree.prototype.doDeleteSelection = function () {
            var that = this, nodes = that.selection(), objects = [];
            nodes.forEach(function (node) {
                var obj = node.data();
                if (obj) {
                    objects.push(obj);
                }
            });
            that._deleteObjects(objects);
        };
        ObjectTree.prototype.canDeleteSelection = function () {
            var that = this;
            if (!that.options.editable && that.saving()) {
                return false;
            }
            var nodes = that.selection().all();
            return nodes.length && nodes.every(that.isOperableNode, that);
        };
        ObjectTree.prototype._deleteObjects = function (objects) {
            var that = this, textKey = "objectTree." +
                (that.options.editable ? "editableDelete" : "delete") +
                (objects.length === 1 ? ".one" : ".many");
            if (objects && objects.length > 0) {
                ConfirmDialog.create({
                    header: resources["objectTree.name"],
                    text: resources[textKey]
                }).open().done(function (result) {
                    if (result === "yes") {
                        objects.forEach(function (obj) {
                            that.uow.remove(obj);
                        });
                        // NOTE: a node will be deleted in onObjectDetached handler
                        if (!that.options.editable) {
                            that.doSave().fail(function () {
                                that.uow.rollbackState();
                            });
                        }
                    }
                });
            }
        };
        ObjectTree.prototype.doSave = function () {
            return this._saveChanges();
        };
        ObjectTree.prototype.canSave = function () {
            return !this.saving() && this.get("uow").hasChanges();
        };
        ObjectTree.prototype._saveChanges = function () {
            var that = this;
            var args = {
                cancel: undefined
            };
            that.onSaving(args);
            if (args.cancel) {
                return lang.rejected();
            }
            that.saving(true);
            var tx = (this.options.transactionName || this.name);
            var saveOptions = {
                onError: that._onSaveError.bind(that),
                interop: {
                    tx: tx
                }
            };
            if (args.interop) {
                saveOptions.interop = args.interop;
            }
            if (that.options.getSaveOptions) {
                saveOptions = that.options.getSaveOptions(saveOptions, this);
            }
            return that.uow.save(saveOptions).always(function () {
                that.saving(false);
                that.onSaved({});
            });
        };
        ObjectTree.prototype._onSaveError = function (args) {
            // TODO: надо объединить логику с редактором и список
            // TODO: почему здесь нет такой же обработки как в списке?
            this.onSaveError(args);
        };
        ObjectTree.prototype.onSaving = function (args) {
            this.trigger(ObjectTree.Events.SAVING, this, args);
        };
        ObjectTree.prototype.onSaved = function (args) {
            this.trigger(ObjectTree.Events.SAVED, this, args);
        };
        ObjectTree.prototype.onSaveError = function (args) {
            this.trigger(ObjectTree.Events.SAVE_ERROR, this, args);
        };
        ObjectTree.prototype.doCancel = function () {
            var that = this;
            that.uow.rollbackState();
        };
        ObjectTree.prototype.canCancel = function () {
            return !this.saving() && this.get("uow").hasChanges();
        };
        ObjectTree.prototype.onObjectDetached = function (sender, obj) {
            var that = this;
            that.visit(null, function (node) {
                if (node.data() === obj) {
                    that.removeNode(node);
                }
            });
        };
        ObjectTree.prototype.activate = function () {
            var presenter = this.presenter;
            if (!presenter) {
                return;
            }
            if (presenter.focus) {
                presenter.focus();
            }
            if (presenter.scrollToSelf) {
                presenter.scrollToSelf();
            }
        };
        ObjectTree.prototype.dispose = function (options) {
            var that = this;
            that.disposeFilter();
            that.uow.unbind("detach", null, that);
            if (!that.options.uow) {
                that.uow.dispose();
            }
            _super.prototype.dispose.call(this, options);
        };
        ObjectTree.defaultOptions = {
            /**
             * @type TreeDataSource
             */
            dataSource: undefined,
            /**
             * @type UnitOfWork
             */
            uow: undefined,
            /**
             * @type boolean
             */
            editable: false,
            /**
             * @type {Part|string}
             */
            filter: undefined,
            /**
             * @type boolean
             */
            filterExpanded: false,
            /**
             * @type boolean
             */
            filterCollapsable: true,
            /**
             * @type string
             */
            expandFilterTitle: resources["objectFilter.show"],
            /**
             * @type string
             */
            collapseFilterTitle: resources["objectFilter.hide"],
            commandsOptions: {
                /**
                 * Options for 'Create' command
                 * @type {object|Function}
                 */
                Create: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {string|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of editor (see `ObjectEditor.defaultOptions`)
                     * @type {object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {boolean}
                     */
                    openInDialog: undefined
                },
                /**
                 * Options for 'Edit' command
                 * @type {object|Function}
                 */
                Edit: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {string|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of editor or a callback to create it (see `ObjectEditor.defaultOptions`)
                     * @type {object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {boolean}
                     * */
                    openInDialog: undefined,
                    /**
                     * Show carousel in editor for navigating sibling objects in list
                     * @type {boolean}
                     */
                    navigateSiblings: true
                }
            },
            userSettings: {
                props: {
                    "filterExpanded": true,
                    "filter": true
                }
            }
        };
        ObjectTree.defaultMenus = {
            TreeNode: { items: [
                    { name: "Reload", title: resources.reload, icon: "refresh" },
                    { name: "Edit", title: resources.edit, icon: "edit", isDefaultAction: true }
                ] },
            Tree: { items: [
                    { name: "ReloadRoot", title: resources.reload, icon: "refresh", order: 10, isDefaultAction: true }
                ] },
            EditableTree: { items: [
                    { name: "ReloadRoot", title: resources.reload, icon: "refresh", order: 10, isDefaultAction: true },
                    { name: "Save", title: resources.save, icon: "save", order: 20 },
                    { name: "Cancel", title: resources.cancel, icon: "cancel", order: 30 }
                ] },
            TreeSelection: { items: [
                    {
                        name: "Selection",
                        title: resources["selection"],
                        html: "<span class='x-icon x-icon-select-all visible-xs'></span><span class='hidden-xs'>" + resources.selected + "</span>" +
                            " <span class='x-tree-menu-selection-counter'></span>",
                        items: [
                            { name: "SelectChildren", title: resources["objectTree.selectChildren"], icon: "selectAll" },
                            { name: "SelectSiblings", title: resources["objectTree.selectSiblings"], icon: "selectAll" },
                            { name: "SelectNone", title: resources["selectNone"] },
                            { name: "divider" },
                            { name: "DeleteSelection", title: resources["delete"], icon: "delete" }
                        ]
                    }
                ] }
        };
        __decorate([
            lang.decorators.constant(ObjectTree.defaultMenus)
        ], ObjectTree.prototype, "defaultMenus");
        __decorate([
            lang.decorators.constant(new ObjectTreeLoader())
        ], ObjectTree.prototype, "defaultLoader");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ObjectTree.prototype, "saving");
        return ObjectTree;
    }(Tree /* implements PartCommandMixin */));
    // mix methods from PartCommandMixin
    PartCommandMixin.mixinTo(ObjectTree);
    ObjectTree.mixin(/** @lends ObjectTree.prototype */ {
        defaultOptions: ObjectTree.defaultOptions
    });
    ObjectTree.mixin(PartWithFilterMixin);
    (function (ObjectTree) {
        ObjectTree.Events = {
            SAVING: "saving",
            SAVED: "saved",
            SAVE_ERROR: "saveError"
        };
    })(ObjectTree || (ObjectTree = {}));
    core.ui.ObjectTree = ObjectTree;
    core.ui.ObjectTreeLoader = ObjectTreeLoader;
    return ObjectTree;
});
//# sourceMappingURL=ObjectTree.js.map