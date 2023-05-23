/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "jquery", "lib/ui/slick/SlickObjectListDataPresenter", "i18n!lib/nls/resources", "lib/ui/list/ObjectList", "lib/ui/pe/peObjectList"], function (require, exports, core, $, SlickObjectListDataPresenter, resources) {
    "use strict";
    exports.__esModule = true;
    var SlickCellEditor = /** @class */ (function () {
        /**
         * @constructs SlickCellEditor
         * @param options
         */
        function SlickCellEditor(options) {
            var that = this, obj = options.item.item, col = options.column.source, $grid = $(options.grid.getContainerNode()), $cell = $(options.container);
            that.options = options;
            that.grid = that.options.grid;
            // we injected SlickObjectListDataPresenter into Grid instance, see onGridInitializing below
            that.parentPresenter = that.grid.parentPresenter;
            // create PE
            var propMeta = that._getColumnPropMeta(obj, col), isSmartHeight = that.grid.getOptions().smartHeight, isPeString = propMeta.vt === "string";
            //Для режима smartHeight всегда должен быть большой редактор
            //Количество строк не важно, т.к. далее будет задана высота контрола
            if (isSmartHeight && isPeString) {
                propMeta.isMultiline = true;
            }
            //Зададим rows = 1, если это не было явно определено в метаданных
            if (propMeta.isMultiline && !propMeta.rows) {
                propMeta.rows = 1;
            }
            that.pe = core.ui.PropertyEditor.DefaultMapping.create(propMeta, obj);
            // set navigation service
            var navigationService = that.parentPresenter && that.parentPresenter.navigationService;
            if (navigationService) {
                // override parent navigationService to catch a navigation
                navigationService = core.lang.override(Object.create(navigationService), {
                    navigate: function (base, options) {
                        that._onNavigating(options);
                        return base.call(this, options);
                    },
                    openModal: function (base, options) {
                        that._onNavigating(options);
                        return base.call(this, options);
                    }
                });
                that.pe.setNavigationService(navigationService);
            }
            that.popup = new core.ui.Popup({
                body: that.pe,
                rootCssClass: "x-pe-inline-container",
                animation: false,
                //offset: that.options.position // doesn't work correctly in Dialog
                offset: $cell.offset()
            });
            // closing popup should close Slick editor
            that.popup.bind("unload", function () {
                that.options.commitChanges();
            });
            that.popup.render($grid);
            var $popup = that.popup.$domElement;
            $popup.children()
                .addClass("x-pe-inline") // add specific css class
                .css("width", that.options.position.width + "px"); // default width is equal to the width of column
            $popup
                .bind("keydown", that._onPopupKeydown.bind(that))
                .bind("keyup", that._onPopupKeyup.bind(that))
                .within($grid); // ensure that popup is fully visible inside grid
            if (isSmartHeight && isPeString) {
                var editorHeight = options.container.__outerHeightForEditor;
                $popup.children()
                    .css("height", "inherit")
                    .css("min-height", editorHeight)
                    .css("padding", "2px");
                $popup
                    .css("height", editorHeight);
            }
            // NOTE: we can bind to 'ready' before rendering and do not check renderStatus, but in that case
            // _activate may be called before setting width and css for child DOM elements (see above)
            if (that.popup.renderStatus() === "ready") {
                that._activate();
            }
            else {
                that.popup.bind("ready", function () {
                    // ensure that popup is fully visible inside grid
                    $popup.within($grid);
                    that._activate();
                });
            }
        }
        SlickCellEditor.prototype.destroy = function () {
            var that = this;
            if (that.pe) {
                // runItemsValidation is from ListCommonMixin
                that.parentPresenter.viewModel.runItemsValidation(that.pe.viewModel);
                // NOTE: кажется логичным тут взять ошиибку валидации из PE (см. WC-1551),
                // как в закоментированном коде:
                /*let violation = that.pe.violation();
                if (violation) {
                    that.parentPresenter.viewModel.violations.add(violation);
                }*/
                // однако, эта ошибка хотя и будет отображена, не помешает сохранению,
                // т.к. при сохранении валидация запустится заново, и при новой валидации ошибки из PE уже не будет
            }
            if (that.popup) {
                // NOTE: unload handler call 'destroy' again (via cancelChanges()), so prevent recursion
                that.popup.unbind("unload");
                that.popup.close();
                that.popup = undefined;
            }
        };
        SlickCellEditor.prototype.focus = function () {
            if (this.pe) {
                this.pe.focus();
            }
        };
        SlickCellEditor.prototype.isValueChanged = function () {
            return true;
        };
        SlickCellEditor.prototype.serializeValue = function () {
            return null;
        };
        SlickCellEditor.prototype.loadValue = function () { };
        SlickCellEditor.prototype.applyValue = function () {
            // NOTE: clear focus to update binding
            var popup = this.popup;
            if (popup && popup.$domElement) {
                popup.$domElement.find(":focus").trigger("blur");
            }
        };
        SlickCellEditor.prototype.validate = function () {
            // NOTE: кажется логичным тут выполнять валидацию или хотя бы проверять violation (см. WC-1551),
            // однако закрыть pe можно также с помощью ESC и в этом случае валидация не будет выполнена,
            // поэтому смысл препятствовать закрытию (а именно это делает возврат ошибки) здесь нет
            /*
            let violation = this.pe && this.pe.violation();
            // violation = this.pe && this.pe.runValidation();
            return {
                valid: !violation,
                validationResults: violation
            };*/
            return SlickCellEditor._validateResult;
        };
        SlickCellEditor.prototype._onNavigating = function (options) {
            var that = this, onReturn;
            if (!that._navigated && that.popup) {
                // keep PE alive
                that.popup.options.preserveBody = true;
                // overwrite onReturn callback to dispose PE when come back
                options = options || {};
                onReturn = options.onReturn || core.lang.noop;
                options.onReturn = function () {
                    var result = onReturn.apply(this, arguments), // use this (navigationService), not that (SlickCellEditor)
                    list = that.parentPresenter.viewModel;
                    that.pe.dispose();
                    if (list && core.lang.isFunction(list.activate)) {
                        list.activate();
                    }
                    return result;
                };
                that._navigated = true;
            }
        };
        SlickCellEditor.prototype._activate = function () {
            var that = this, $popup = that.popup && that.popup.$domElement;
            if ($popup) {
                // focus
                that.pe.focus();
                // scroll to PE
                core.html.scrollToElement({ element: $popup, align: "center" });
            }
        };
        SlickCellEditor.prototype._onPopupKeydown = function (e) {
            var that = this, keyCode = core.html.keyCode;
            that._handleKeys = true;
            switch (e.which) {
                case keyCode.TAB:
                    e.preventDefault();
                    break;
                case keyCode.ESCAPE:
                    that.options.cancelChanges();
                    break;
            }
        };
        SlickCellEditor.prototype._onPopupKeyup = function (e) {
            var that = this, keyCode = core.html.keyCode;
            // NOTE: we should process 'keyup' if 'keydown' was already triggered on popup.
            // Otherwise pressing ENTER in grid opens and immediately closes a popup.
            if (!that._handleKeys) {
                return;
            }
            // NOTE: commitChanges() will close popup. So commitChanges() should be called in 'keyup' handler
            // (not 'keydown'), because some PEs bind to 'keyup' and they should handle it before closing.
            switch (e.which) {
                case keyCode.ENTER:
                    // isMultiline is peString's property
                    if (!that.pe.isMultiline) {
                        that.options.commitChanges();
                    }
                    break;
                case keyCode.TAB:
                    that.options.commitChanges();
                    // NOTE: Items can be reordered after commitChanges() and therefore active row can be changed.
                    // But active row depends on the active item and is recalculated while rendering.
                    // So we must call `navigate` only after rendering and so call it via `setTimeout`.
                    window.setTimeout(function () {
                        that.grid.navigateNext();
                    });
                    break;
            }
        };
        SlickCellEditor.prototype._getColumnPropMeta = function (obj, column) {
            // hack: we injected additional methods into parentPresenter, see below
            var presenter = this.parentPresenter;
            var propMeta = presenter.getColumnPropMeta(obj, column);
            if (!propMeta) {
                return null;
            }
            propMeta = core.lang.clone(propMeta);
            propMeta = presenter.onCreatePropEditor(propMeta, obj) || propMeta;
            var editorEx = column.editor;
            if (core.lang.isFunction(editorEx)) {
                editorEx = editorEx.call(this.parentPresenter.viewModel, obj, propMeta, column);
            }
            return core.lang.extend(propMeta, { contextName: "inline" }, editorEx);
        };
        SlickCellEditor._validateResult = { valid: true };
        return SlickCellEditor;
    }());
    // Extend SlickObjectListDataPresenter prototype
    core.lang.override(SlickObjectListDataPresenter.prototype, {
        tweakOptions: function (base, options) {
            var that = this;
            if (options.inlineEdit) {
                options = that.mixOptions(options, SlickObjectListDataPresenter.prototype.defaultInlineOptions);
                if (!options.gridOptions.editorFactory) {
                    options.gridOptions.editorFactory = {
                        getEditor: function (col) {
                            if (col.role !== "data" || !col.prop) {
                                return null;
                            }
                            // if source 'editor' option is falsy, we shouldn't edit a cell
                            if (col.source.editor !== undefined && !col.source.editor) {
                                return null;
                            }
                            return that.options.InlineEditor;
                        }
                    };
                }
                if (!options.gridOptions.editorLock) {
                    // NOTE: specify the separated editorLock for editable grids. This allows to use other (non-editable)
                    // grids in inline editors (e.g. the selection dialog in peObject).
                    options.gridOptions.editorLock = new Slick.EditorLock();
                }
            }
            base.call(that, options);
        },
        onGridInitializing: function (base, args) {
            var that = this, $grid, pendingRows; // rows that have been changed	while an editor was opened
            if (!that.options.inlineEdit) {
                base.call(that, args);
                return;
            }
            // set this object into grid to send it to SlickCellEditor
            that.grid.parentPresenter = that;
            $grid = $(that.gridElement);
            // NOTE: no onKeyUp event in SlickGrid
            $grid.bind("keyup", function (e) {
                // ENTER should open an inline editor
                if (e.which === core.html.keyCode.ENTER) {
                    e.stopPropagation();
                }
                // prevent command execution on keyup when an inline editor is active
                if (that.grid && that.grid.getEditorLock().isActive()) {
                    e.stopPropagation();
                }
            });
            that.dataProvider.bind("rows.change", function (sender, args) {
                if (!args.rows || !that.grid) {
                    return;
                }
                // для режима переменной высоты строк нужно каждый раз рисовать строки заново.
                // Эта опция вызовет invalidateAll на этапе render
                args.rows.all = args.rows.all || that.grid.getOptions().smartHeight;
                var editor = that.grid.getCellEditor();
                if (!editor)
                    return;
                // NOTE: We don't update rows here because of two reasons:
                // 1) rerendering active row can kill current editor
                // 2) if `orderBy` option is specified, items can be reordered (and current editor will also be killed)
                // So store the rows and update them later in onBeforeCellEditorDestroy
                pendingRows = core.lang.extend(pendingRows || {}, args.rows);
                delete args.rows;
            });
            that.grid.onBeforeEditCell.subscribe(function (e, args) {
                // clear pending rows
                pendingRows = undefined;
                // don't create an inline editor if the part is unloaded
                if (!that.domElement) {
                    return false;
                }
                var propMeta = that.getColumnPropMeta(args.item.item, args.column.source);
                // ignore readOnly props (there will peReadOnly for them which is useless)
                return !(!propMeta || propMeta.readOnly);
            });
            that.grid.onBeforeCellEditorDestroy.subscribe(function (e, args) {
                var options = {};
                // rerender pending rows
                if (pendingRows) {
                    //pendingRows.all = that.grid.getOptions().smartHeight;
                    options.rows = pendingRows;
                    pendingRows = undefined;
                }
                // if there aren't any focused element, focus the grid and scroll to active cell
                if (!core.html.focused()) {
                    args.grid.focus();
                    options.scroll = true;
                }
                //that.renderGrid(options);
                that.renderGridAsync(options);
            });
            that.grid.onKeyDown.subscribe(function (e, args) {
                if (e.which === core.html.keyCode.F2) {
                    if (!args.grid.getEditorLock().isActive()) {
                        args.grid.editActiveCell();
                    }
                }
            });
            that.grid.onClick.subscribe(function (e, args) {
                args.grid.scrollCellIntoView(args.row, args.cell);
            });
            that.grid.onDblClick.subscribe(function (e) {
                e.stopImmediatePropagation();
                args.grid.editActiveCell();
            });
            that.grid.onScroll.subscribe(function (e, args) {
                args.grid.getEditController().cancelCurrentEdit();
            });
            base.call(that, args);
        }
    });
    /*
    interface SlickObjectListDataPresenterIE extends SlickObjectListDataPresenter {
        defaultInlineOptions: any;
        getColumnPropMeta: (obj, column) => void;
        onCreatePropEditor: (propMeta, obj) => void;
        isInlineEditing: () => boolean;
    }
    */
    core.lang.extend(SlickObjectListDataPresenter.prototype, {
        defaultInlineOptions: {
            InlineEditor: SlickCellEditor,
            gridOptions: {
                editable: true,
                autoEdit: false
            }
        },
        /**
         * Returns metadata of the domain property for specified column
         * @protected
         * @param obj
         * @param column viewModel column
         * @returns {*}
         */
        getColumnPropMeta: function (obj, column) {
            if (column.editor !== undefined && !column.editor) {
                return null;
            }
            return obj && column.prop && obj.meta && obj.meta.props && obj.meta.props[column.prop];
        },
        /**
         * Modify the metadata of property inline editor
         * @protected
         * @virtual
         * @param {Object} propMeta Source PE metadata
         * @param {Object} obj An object to edit
         * @returns {Object} Changed PE metadata
         */
        onCreatePropEditor: function (propMeta, obj) {
            switch (propMeta.vt) {
                case "string":
                    propMeta.hideLetterCounter = true;
                    break;
                case "object":
                    if (!propMeta.many) {
                        propMeta.presentation = "dropdown";
                    }
                    break;
            }
            return propMeta;
        },
        isInlineEditing: function () {
            return this.domElement && this.grid && this.grid.getEditorLock().isActive();
        }
    });
    // common overrides for ObjectList and peObjectList
    var commonListOverrides = {
        tweakOptions: function (base, options) {
            if (options.inlineEdit && !options.readOnly && !options.disabled) {
                core.lang.extendEx(options, {
                    editable: true,
                    presenterOptions: {
                        inlineEdit: true
                    }
                }, { deep: true });
                // NOTE: 'editor' is reserved option of SlickGrid column, but we also has this option.
                // set 'editor' to null in gridOptions for every column to prevent using our metadata as SlickGrid option
                core.lang.forEach(options.columns, function (col) {
                    if (core.lang.isPlainObject(col)) {
                        core.lang.append(col, {
                            gridOptions: { editor: null }
                        });
                    }
                });
            }
            base.call(this, options);
        },
        createRowMenuDefaults: function (base) {
            var that = this, menu = base.call(that);
            if (that.options.inlineEdit && !that.options.readOnly && !that.options.disabled) {
                menu = core.ui.Menu.merge(menu, {
                    update: [
                        {
                            name: "Add",
                            title: resources["add"],
                            hotKey: "ins",
                            order: -1,
                            items: [
                                // NOTE: set standard Create menu item as nested
                                core.lang.find(menu.items, function (item) { return item.name === "Create"; })
                            ]
                        }
                    ],
                    remove: ["Create"]
                });
            }
            return menu;
        },
        createCommands: function (base) {
            var that = this, commands = base.call(that);
            if (that.options.inlineEdit && !that.options.readOnly && !that.options.disabled) {
                commands.Add = new core.commands.BoundCommand(that.doAdd, that.canAdd, that);
            }
            return commands;
        }
    };
    // Extend ObjectList prototype
    core.lang.override(core.ui.ObjectList.prototype, commonListOverrides);
    core.lang.extend(core.ui.ObjectList.prototype, {
        doAdd: function (args) {
            var that = this, type = args.type || that.entityType, uow = that.uow, obj = uow.create(type);
            that.addObject(obj);
        },
        canAdd: function () {
            return true;
        }
    });
    // Extend peObjectList prototype
    core.lang.override(core.ui.peObjectList.prototype, commonListOverrides);
    core.lang.extend(core.ui.peObjectList.prototype, {
        doAdd: function (args) {
            var that = this, type = args.type || that.valueObjectEntityType.name, uow = that.viewModel.uow, obj = uow.create(type);
            that.value().add(obj);
            that.activeItem(obj);
            window.setTimeout(function () {
                that.activate();
            });
        },
        canAdd: function () {
            return true;
        },
        _bindToEsc: function () {
            var that = this, $element = that.element || that.$domElement;
            $element.keydown(function (e) {
                if (e.which !== core.html.keyCode.ESCAPE || e.ctrlKey || e.shiftKey || e.metaKey) {
                    return;
                }
                if (that.presenter && that.presenter.dataPresenter &&
                    core.lang.get(that.presenter.dataPresenter, "isInlineEditing")) {
                    return;
                }
                $(e.target).blur();
            });
        }
    });
});
//# sourceMappingURL=SlickInlineEditAddon.js.map