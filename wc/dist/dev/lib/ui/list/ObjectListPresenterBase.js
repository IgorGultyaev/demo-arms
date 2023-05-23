/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "jquery", "lib/ui/list/ObjectListPaginator", "lib/ui/list/ObjectListPager", "xhtmpl!lib/ui/templates/ObjectListPresenter.hbs", "xhtmpl!lib/ui/templates/ObjectList.title.hbs", "xhtmpl!lib/ui/templates/ObjectList.data.hbs", "xhtmpl!lib/ui/templates/ObjectList.filter.hbs", "xhtmpl!lib/ui/templates/ObjectList.hint.hbs", "xhtmpl!lib/ui/templates/ObjectList.menuList.hbs", "xhtmpl!lib/ui/templates/ObjectList.menuRow.hbs", "xhtmpl!lib/ui/templates/ObjectList.paging.hbs", "xhtmpl!lib/ui/templates/ObjectList.contextParts.hbs", "lib/ui/ExpandablePanel", "xcss!lib/ui/styles/objectList"], function (require, exports, core, $, ObjectListPaginator, ObjectListPager, tmplMain, tmplTitle, tmplData, tmplFilter, tmplHint, tmplMenuList, tmplMenuRow, tmplPaging, tmplContextParts) {
    "use strict";
    var lang = core.lang;
    var ObjectListPresenterBase = /** @class */ (function (_super) {
        __extends(ObjectListPresenterBase, _super);
        /**
         * @constructs ObjectListPresenterBase
         * @extends View
         */
        function ObjectListPresenterBase(options) {
            var _this = this;
            options = ObjectListPresenterBase.mixOptions(options, ObjectListPresenterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.eventPublisher = core.Application.current.eventPublisher;
            return _this;
        }
        ObjectListPresenterBase.prototype.applyHostContext = function (opt) {
            _super.prototype.applyHostContext.call(this, opt);
            if (this.dataPresenter.applyHostContext) {
                this.dataPresenter.applyHostContext(opt);
            }
            this.mixHostOptions(opt.host, ObjectListPresenterBase.hostDefaultOptions);
            return null;
        };
        /**
         * @param {ObjectList} list
         */
        ObjectListPresenterBase.prototype.setViewModel = function (list) {
            var _this = this;
            var that = this, presenterModel = that.viewModel;
            if (presenterModel) {
                presenterModel.dispose();
            }
            that._uninitChild(that.dataPresenter);
            that._initDataPresenter(list);
            that._throwIfNoDataPresenter();
            that._uninitChild(that.paginator);
            that._initPaginator(list);
            // NOTE: paginator may be not set
            presenterModel = new ObjectListPresenterBase.ViewModel(list);
            presenterModel.dataPresenter = that.dataPresenter;
            presenterModel.paginator = that.paginator;
            presenterModel.options = that.options;
            var templates = [];
            this.options.templates.forEach(function (name) {
                var tmpl = _this.options.partialTemplates[name];
                if (tmpl) {
                    templates.push(tmpl);
                }
            });
            presenterModel.templates = templates;
            _super.prototype.setViewModel.call(this, presenterModel);
        };
        ObjectListPresenterBase.prototype.unload = function () {
            var that = this;
            if (that.options.affixMenu && !that.options.hideMenuRow && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.remove_element", {
                    element: $("> .x-list > .x-list-menu-row-container", that.domElement)
                });
            }
            _super.prototype.unload.call(this);
        };
        ObjectListPresenterBase.prototype.dispose = function (options) {
            // NOTE: viewModel is a custom object created in setViewModel, which must be disposed
            if (this.viewModel) {
                this.viewModel.dispose();
            }
            _super.prototype.dispose.call(this, options);
        };
        ObjectListPresenterBase.prototype.doRender = function (domElement) {
            var that = this;
            if (!that.viewModel) {
                return;
            }
            var list = that.viewModel.list();
            // NOTE: если мы установим hideMenuList/hideMenuRow, то это будет навсегда, до следующего rerender,
            // изменение меню не повлияет на его появление,
            // но обычно меню списка не пустое, даже если заблокированы все пункты
            // Если кому-то потребуется динамически менять меню, изначально не заданное,
            // то следует задать опции hideMenuRow/hideMenuList как false (по умолчанию undefined)
            if (that.options.hideMenuList === undefined) {
                that.options.hideMenuList = (!list.menuList || list.menuList.isEmpty()) &&
                    (!list.menuListAux || list.menuListAux.isEmpty());
            }
            if (that.options.hideMenuRow === undefined) {
                that.options.hideMenuRow = (!list.menuRow || list.menuRow.isEmpty()) &&
                    (!list.menuSelection || list.menuSelection.isEmpty());
            }
            _super.prototype.doRender.call(this, domElement);
            if (that.options.affixMenu && !that.options.hideMenuRow && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.add_element", {
                    element: $("> .x-list > .x-list-menu-row-container", that.domElement),
                    controlledBy: $("> .x-list > .x-list-data-container", that.domElement),
                    affixTo: "bottom"
                });
            }
            /*
             $(domElement).on("click", ".x-list-data-container .x-cmd-link", function () {
             // TODO: выполнять команды из menuRow как в SlickObjectListDataPresenter (реально нужно только для SimpleObjectListPresenter)
             });
             */
            var $domElement = that.$domElement;
            $domElement.on("click", ".x-cmd-link", function () {
                var $this = $(this), list = that.viewModel.list(), cmdName = core.commands.dataCommandName($this), cmdParams, cmd, menu = list.menuList, menuItem;
                if (cmdName) {
                    cmdParams = lang.extend({}, core.commands.dataCommandParams($this), { list: list });
                    menuItem = menu.getItem(cmdName);
                    if (menuItem && menuItem.command) {
                        menu.executeItem(menuItem, cmdParams);
                        return false;
                    }
                    cmd = list.commands && list.commands[cmdName];
                    if (cmd) {
                        cmd.execute(cmdParams);
                        return false;
                    }
                }
            });
            // row menu hotkey handler
            $domElement.on("keyup", ".x-list-data-container", function (e) {
                // skip navigation keyboard
                if (core.html.keyCode.isNavigationKey(e)) {
                    return;
                }
                var list = that.viewModel.list();
                if (list.menuRow && list.menuRow.executeHotkey(e)) {
                    return false;
                }
            });
            // list menu hotkey handler
            $domElement.on("keyup", function (e) {
                if (core.html.keyCode.isNavigationKey(e)) {
                    return;
                }
                var list = that.viewModel.list();
                // NOTE: ignore press inside paging panel
                if ($(e.target).parents(".x-list-paging").length) {
                    return;
                }
                if (list.menuList && list.menuList.executeHotkey(e)) {
                    return false;
                }
            });
        };
        ObjectListPresenterBase.prototype._initDataPresenter = function (list) {
            var that = this, dataPresenter = that.options.dataPresenter ||
                (that.options.DataPresenter && new that.options.DataPresenter(that._dataPresenterOptions()));
            if (dataPresenter) {
                dataPresenter.setViewModel(list);
                that.registerChild(dataPresenter, { disposeOnUnload: false, keepOnUnload: true, trackStatus: true });
            }
            that.dataPresenter = dataPresenter;
        };
        ObjectListPresenterBase.prototype._dataPresenterOptions = function () {
            var that = this, dataOptions = {};
            lang.forEach(that.options, function (v, name) {
                if (!ObjectListPresenterBase.defaultOptions.hasOwnProperty(name)) {
                    dataOptions[name] = v;
                }
            });
            return dataOptions;
        };
        ObjectListPresenterBase.prototype._throwIfNoDataPresenter = function () {
            if (!this.dataPresenter) {
                throw new Error("DataPresenter was not specified");
            }
        };
        ObjectListPresenterBase.prototype._initPaginator = function (list) {
            var that = this, paging = list.options.paging, paginator, paginatorOptions, Paginator;
            // NOTE: don't show a paginator when paging is explicitly turned off
            if (paging !== false) {
                paginator = that.options.paginator;
                if (!paginator) {
                    paginatorOptions = that._createPaginatorOptions(paging);
                    Paginator = paginatorOptions.mode ?
                        ObjectListPresenterBase.defaultPaginators[paginatorOptions.mode] :
                        that.options.Paginator;
                    if (Paginator) {
                        paginator = new Paginator(paginatorOptions);
                    }
                    else if (paginatorOptions.mode) {
                        console.warn("No paginator implementation found for mode " + paginatorOptions.mode);
                    }
                }
                if (paginator) {
                    paginator.list(list);
                    that.registerChild(paginator, { disposeOnUnload: false, keepOnUnload: true, trackStatus: false });
                    // NOTE: the paginator will be auto-disposed with the presenter itself, so there is no need to unbind explicitly
                    paginator.bind("change:skippedItems", that._onSkippedItemsChange, that);
                    // set normalized paging options back into our list
                    var opt = list.options || {};
                    opt.paging = paginator.options;
                }
            }
            that.paginator = paginator;
        };
        ObjectListPresenterBase.prototype._createPaginatorOptions = function (paging) {
            if (!paging) {
                return { pageSize: 0 };
            }
            if (lang.isNumber(paging)) {
                return { pageSize: paging };
            }
            if (lang.isObject(paging)) {
                return paging;
            }
            return {};
        };
        ObjectListPresenterBase.prototype._onSkippedItemsChange = function (sender, value) {
            var dataPresenter = this.dataPresenter;
            if (dataPresenter && dataPresenter.setNumbering) {
                dataPresenter.setNumbering(value);
            }
        };
        ObjectListPresenterBase.prototype._uninitChild = function (part) {
            if (part) {
                this.unregisterChild(part);
                part.dispose();
            }
        };
        ObjectListPresenterBase.defaultOptions = {
            template: tmplMain,
            unbound: true,
            Paginator: ObjectListPaginator,
            cssClass: "",
            affixMenu: true,
            //hideMenuRow: false,
            //hideMenuList: false,
            showTitle: true,
            menuRowCssClass: "x-menu-bar x-menu--contrast",
            menuListCssClass: "x-menu-bar",
            partialTemplates: {
                title: tmplTitle,
                data: tmplData,
                filter: tmplFilter,
                hint: tmplHint,
                menuList: tmplMenuList,
                menuRow: tmplMenuRow,
                paging: tmplPaging,
                contextParts: tmplContextParts
            },
            templates: ["title", "filter", "menuList", "hint", "data", "paging", "contextParts", "menuRow"]
        };
        ObjectListPresenterBase.hostDefaultOptions = {
            dialog: {
                affixMenu: false
            }
        };
        /**
         * Dictionary: string => ObjectListPaginatorBase class.
         * You may extend this dictionary with your own values.
         */
        ObjectListPresenterBase.defaultPaginators = {
            pages: ObjectListPager,
            throttle: ObjectListPaginator
        };
        return ObjectListPresenterBase;
    }(core.ui.View));
    (function (ObjectListPresenterBase) {
        var ViewModel = /** @class */ (function (_super) {
            __extends(ViewModel, _super);
            function ViewModel(list) {
                var _this = _super.call(this) || this;
                var that = _this;
                that.list(list);
                // Data-bind properties which depend on state().
                // NOTE: we use observable properties and binding instead of methods in presenterModel
                // to prevent redundant rerendering (see WC-996)
                that._addBinding(that.isLoading, function (list) { return list.state() === list.states.reloading ||
                    list.state() === list.states.loadingMore; });
                that._addBinding(that.isReloading, function (list) { return list.state() === list.states.reloading; });
                that._addBinding(that.isLoadingMore, function (list) { return list.state() === list.states.loadingMore; });
                return _this;
            }
            ViewModel.prototype.dispose = function () {
                var that = this;
                if (that._disposables) {
                    that._disposables.forEach(function (disposable) {
                        disposable.dispose();
                    });
                    that._disposables = undefined;
                }
                _super.prototype.dispose.call(this);
            };
            ViewModel.prototype.stateSeverity = function () {
                var state = this.list().state();
                if (state === "failed") {
                    return "error";
                }
                if (state === "loaded") {
                    return "success";
                }
                return "info";
            };
            ViewModel.prototype.pendingItemsCount = function () {
                return this.list().getChangedItems().length;
            };
            ViewModel.prototype._addBinding = function (target, source) {
                var that = this, disposable = core.binding.databind(core.binding.expr(that, target), core.binding.expr(that.list(), function () { return source(this); }), { oneway: true });
                that._disposables = that._disposables || [];
                that._disposables.push(disposable);
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], ViewModel.prototype, "list");
            __decorate([
                lang.decorators.observableAccessor({ init: false })
            ], ViewModel.prototype, "isLoading");
            __decorate([
                lang.decorators.observableAccessor({ init: false })
            ], ViewModel.prototype, "isReloading");
            __decorate([
                lang.decorators.observableAccessor({ init: false })
            ], ViewModel.prototype, "isLoadingMore");
            return ViewModel;
        }(lang.Observable));
        ObjectListPresenterBase.ViewModel = ViewModel;
    })(ObjectListPresenterBase || (ObjectListPresenterBase = {}));
    // backward compatibility:
    ObjectListPresenterBase.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: ObjectListPresenterBase.defaultOptions,
        /** @obsolete use static defaultPaginators */
        defaultPaginators: ObjectListPresenterBase.defaultPaginators,
        /** @obsolete use static hostDefaultOptions */
        contextDefaultOptions: ObjectListPresenterBase.hostDefaultOptions
    });
    core.ui.ObjectListPresenterBase = ObjectListPresenterBase;
    return ObjectListPresenterBase;
});
//# sourceMappingURL=ObjectListPresenterBase.js.map