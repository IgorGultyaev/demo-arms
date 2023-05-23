/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/pe/peObjectBase", "lib/ui/PartCommandMixin"], function (require, exports, core, peObjectBase, PartCommandMixin) {
    "use strict";
    var NavigationPropertyEditor = /** @class */ (function (_super) {
        __extends(NavigationPropertyEditor, _super); /*implements PartCommandMixin*/
        /**
         * @description Base class for navigation property editors.
         * @constructs NavigationPropertyEditor
         * @extends peObjectBase
         */
        function NavigationPropertyEditor(options) {
            var _this = this;
            options = NavigationPropertyEditor.mixContextOptions(options, NavigationPropertyEditor.defaultOptions, NavigationPropertyEditor.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            // операции unlink не может быть у свойства, для которых обратное свойство - скалярное ненулабельное
            var opposite = _this.options.opposite;
            _this._oppositeCanUnlink = !(opposite && !opposite.many && !opposite.nullable);
            _this.subscribeOnNavigation();
            return _this;
        }
        NavigationPropertyEditor.prototype.setViewModel = function (viewModel) {
            _super.prototype.setViewModel.call(this, viewModel);
            var that = this;
            if (that.viewModel) {
                var ref = that.options.ref;
                if (!ref && that.viewModel.meta) {
                    var propMeta = that.viewModel.meta.props[that.viewModelProp];
                    ref = propMeta && propMeta.ref;
                }
                if (core.lang.isString(ref)) {
                    if (!that.viewModel.meta) {
                        // TODO: get real class name instead of NavigationPropertyEditor
                        throw new Error("NavigationPropertyEditor.setViewModel: ref ('" + ref + "') is string but viewModel has no meta");
                    }
                    that.valueObjectEntityType = that.viewModel.meta.model.entities[ref];
                }
                else {
                    that.valueObjectEntityType = ref;
                }
            }
        };
        /**
         * Create commands
         * @protected
         * @returns {Object.<string, BoundCommand>}
         */
        NavigationPropertyEditor.prototype.createCommands = function () {
            var that = this, commands = {};
            // readOnly PE has View operation only
            if (that.options.readOnly) {
                commands.View = new core.commands.BoundCommand(that.doView, that.canView, that);
                return commands;
            }
            if (that.options.flavor !== "reference") {
                commands.Create = new core.commands.BoundCommand(that.doCreate, that.canCreate, that);
                commands.Edit = new core.commands.BoundCommand(that.doEdit, that.canEdit, that);
                commands.Delete = new core.commands.BoundCommand(that.doDelete, that.canDelete, that);
            }
            if (that.options.flavor !== "aggregation") {
                commands.Select = new core.commands.BoundCommand(that.doSelect, that.canSelect, that);
                commands.Unlink = new core.commands.BoundCommand(that.doUnlink, that.canUnlink, that);
            }
            return commands;
        };
        NavigationPropertyEditor.prototype._createNestedEditorContext = function () {
            return {
                parentObject: this.viewModel,
                // NOTE: for non-domain properties we use `options` as metadata
                parentProp: this.viewModel.meta.props[this.viewModelProp] || this.options,
                nested: true
            };
        };
        NavigationPropertyEditor.prototype.doEdit = function (args) {
            var that = this, obj = that.currentValue();
            return that.executePartCommand({
                part: "ObjectEditor:" + obj.meta.name,
                partOptions: {
                    viewModel: obj,
                    editorContext: that._createNestedEditorContext()
                }
            }, args, "Edit").closed;
        };
        NavigationPropertyEditor.prototype.canEdit = function () {
            return !this.disabled() && !!this.currentValue();
        };
        NavigationPropertyEditor.prototype.onBeforeEdit = function (editOptions) {
        };
        NavigationPropertyEditor.prototype.onAfterEdit = function (result, editOptions) {
            if (result && result.success) {
                this.runValidationAsync({ reason: "auto" });
            }
        };
        NavigationPropertyEditor.prototype.doView = function (args) {
            var that = this, obj = that.currentValue();
            return that.executePartCommand({
                part: "ObjectViewer:" + obj.meta.name,
                partOptions: {
                    viewModel: obj,
                    editorContext: that._createNestedEditorContext()
                }
            }, args, "View").closed;
        };
        NavigationPropertyEditor.prototype.canView = function () {
            return !this.disabled() && !!this.currentValue();
        };
        NavigationPropertyEditor.prototype.onBeforeView = function (viewOptions) {
        };
        NavigationPropertyEditor.prototype.onAfterView = function (result, viewOptions) {
        };
        NavigationPropertyEditor.prototype.doCreate = function (args) {
            var that = this;
            return that.executePartCommand({
                part: "ObjectEditor:" + that.valueObjectEntityType.name,
                partOptions: {
                    uow: that.viewModel.uow,
                    type: that.valueObjectEntityType.name,
                    editorContext: that._createNestedEditorContext(),
                    onInitializing: function (editor) {
                        // add created object to the property
                        that._addObject(editor.viewModel);
                    }
                }
            }, args, "Create").closed;
        };
        NavigationPropertyEditor.prototype.canCreate = function () {
            return !this.disabled();
        };
        NavigationPropertyEditor.prototype.onBeforeCreate = function (createOptions) {
        };
        NavigationPropertyEditor.prototype.onAfterCreate = function (result, createOptions) {
            if (result && result.success) {
                this.runValidationAsync({ reason: "auto" });
            }
        };
        /**
         * Handles Select command's result.
         * @param {Object} result
         * @param {Array} result.selection
         * @protected
         */
        NavigationPropertyEditor.prototype._onSelectedValues = function (result) {
            var that = this, uow = that.viewModel.uow;
            if (result && result.selection && result.selection.length) {
                result.selection = result.selection.map(function (obj) {
                    if (obj.uow !== uow) {
                        // если возвращенный объект из другой uow, то добавим его в текущую UoW только в том
                        // случае, если там нет такого объекта. Иначе могут возникнуть конфликты.
                        // TODO: эту проверку можно будет убрать, когда будет реализовано полноценное разрешение
                        // подобных конфликтов.
                        var localObj = uow.find(obj.meta.name, obj.id);
                        if (!localObj) {
                            uow.attach(obj, { norollback: true });
                        }
                        else {
                            obj = localObj;
                        }
                    }
                    that._addObject(obj);
                    return obj;
                });
                // NOTE: result.selection contains objects in local UoW now
            }
        };
        /**
         * Returns array of ids of objects which should not be visible to user.
         * @returns {Array|*}
         * @private
         */
        NavigationPropertyEditor.prototype._getExcludeIds = function () {
            var that = this, ids = that._valueIds(), deletedIds;
            // filter out deleted unsaved objects
            deletedIds = that.viewModel.uow.all()
                .filter(function (obj) {
                return !obj.isGhost && obj.isRemoved() &&
                    ((obj.meta.derived ? !!obj.meta.derived[that.valueObjectEntityType.name] : true) ||
                        obj.meta.name === that.valueObjectEntityType.name);
            })
                .map(function (obj) { return obj.id; });
            return deletedIds.concat(ids);
        };
        /**
         * Open ObjectSelector
         * @param {Object} [args]
         * @param {String} [args.partName] objectSelector part name
         * @param {Object} [args.partOptions] Options for objectSelector (will override options.selectorOptions.partOptions)
         * @returns {Promise}
         */
        NavigationPropertyEditor.prototype.doSelect = function (args) {
            var that = this;
            return that.executePartCommand({
                part: "ObjectSelector:" + that.valueObjectEntityType.name,
                partOptions: {
                    limits: !that.options.many ? { max: 1 } : {},
                    entityType: that.valueObjectEntityType.name,
                    excludeIds: that._getExcludeIds()
                }
            }, args, "Select").closed;
        };
        NavigationPropertyEditor.prototype.canSelect = function () {
            return !this.disabled();
        };
        NavigationPropertyEditor.prototype.onBeforeSelect = function (selectOptions) {
        };
        NavigationPropertyEditor.prototype.onAfterSelect = function (result, selectOptions) {
            this._onSelectedValues(result);
            if (result && result.selection && result.selection.length) {
                this.runValidationAsync({ reason: "auto" });
            }
        };
        NavigationPropertyEditor.prototype.canUnlink = function () {
            return !this.disabled() && !!this.currentValue();
        };
        NavigationPropertyEditor.prototype._isOrphan = function (obj) {
            var oppositeMeta = this.options.opposite, hasChanges = oppositeMeta ? obj.hasChangesExcept(oppositeMeta.name) : obj.hasChanges();
            if (hasChanges) {
                var objectRefs = this.viewModel.uow.findRefsTo(obj);
                if (objectRefs.length === 1 && objectRefs[0].object.id === this.viewModel.id) {
                    // there're no other references except one from the current object
                    return true;
                }
            }
            return false;
        };
        NavigationPropertyEditor.prototype.canDelete = function () {
            return !this.disabled() && !!this.currentValue();
        };
        NavigationPropertyEditor.defaultOptions = {
            commandsOptions: {
                /**
                 * Options for 'Select' command - select object(s) into current property
                 * @type {Object|Function}
                 */
                Select: {
                    /**
                     * Part name of selector (by default "ObjectSelector:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of selector (see `ObjectSelector.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {
                        entityType: undefined,
                        hasCheckboxes: undefined,
                        filter: undefined,
                        loadParams: undefined,
                        presenterOptions: {}
                    },
                    /**
                     * true - opening ObjectSelector in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     */
                    openInDialog: undefined
                },
                /**
                 * Options for 'Create' command
                 * @type {Object|Function}
                 */
                Create: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    name: undefined,
                    /**
                     * Part options of editor (see `ObjectEditor.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     */
                    openInDialog: undefined
                },
                /**
                 * Options for 'Edit' command
                 * @type {Object|Function}
                 */
                Edit: {
                    /**
                     * Part name of editor (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of editor (see `ObjectSEditor.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening editor in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     */
                    openInDialog: undefined,
                    navigateSiblings: true
                },
                /**
                 * Options for 'View' command
                 * @type {Object|Function}
                 */
                View: {
                    /**
                     * Part name of viewer (by default "ObjectEditor:Type") or a callback to create it
                     * @type {String|Function}
                     */
                    part: undefined,
                    /**
                     * Part options of viewer (see `ObjectViewer.defaultOptions`)
                     * @type {Object|Function}
                     */
                    partOptions: {},
                    /**
                     * true - opening viewer in Dialog, false - opening via NavigationService
                     * @type {Boolean}
                     * */
                    openInDialog: undefined
                }
            }
        };
        /**
         * Default options by context
         */
        NavigationPropertyEditor.contextDefaultOptions = {
            filter: {
                commandsOptions: {
                    Select: {
                        openInDialog: true
                    }
                }
            },
            inline: {
                commandsOptions: {
                    Select: {
                        openInDialog: true
                    },
                    Edit: {
                        openInDialog: true
                    },
                    View: {
                        openInDialog: true
                    },
                    Create: {
                        openInDialog: true
                    }
                }
            }
        };
        return NavigationPropertyEditor;
    }(peObjectBase /*implements PartCommandMixin*/));
    // mix methods from PartCommandMixin
    PartCommandMixin.mixinTo(NavigationPropertyEditor);
    // override some methods from PartCommandMixin
    NavigationPropertyEditor.mixin({
        _createCommandPart: function (cmdOptions, cmdName) {
            var that = this;
            // nested part can change the value of current PE, prevent auto-validating
            // NOTE: we must do this before part creation
            that.autoValidate(false);
            return PartCommandMixin.prototype["_createCommandPart"].apply(that, arguments);
        },
        onNavigated: function (args) {
            var that = this;
            // restore auto-validation
            that.autoValidate(that.options.autoValidate);
            that.activate();
            PartCommandMixin.prototype["onNavigated"].apply(that, arguments);
        }
    });
    NavigationPropertyEditor.mixin({
        defaultOptions: NavigationPropertyEditor.defaultOptions,
        contextDefaultOptions: NavigationPropertyEditor.contextDefaultOptions
    });
    core.ui.NavigationPropertyEditor = NavigationPropertyEditor;
    return NavigationPropertyEditor;
});
//# sourceMappingURL=NavigationPropertyEditor.js.map