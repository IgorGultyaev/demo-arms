/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/list/ObjectListPaginatorBase", "lib/ui/pe/peEnumDropDownSelect", "lib/ui/menu/Menu", "xhtmpl!lib/ui/templates/ObjectListPager.hbs", "i18n!lib/nls/resources"], function (require, exports, core, ObjectListPaginatorBase, peDropdown, Menu, template, resources) {
    "use strict";
    var lang = core.lang;
    var DataSource = core.data.DataSource;
    var ObjectListPager = /** @class */ (function (_super) {
        __extends(ObjectListPager, _super);
        /**
         * Paginator for ObjectList for mode 'pages' (with commands LoadPrev/LoadNext)
         * @constructs ObjectListPager
         * @extends ObjectListPaginatorBase
         * @param options
         */
        function ObjectListPager(options) {
            var _this = this;
            options = ObjectListPager.mixOptions(options, ObjectListPager.defaultOptions);
            options.mode = "pages";
            _this = _super.call(this, options) || this;
            _this.bind("change:currentPage", function (s, currentPage) {
                if (currentPage > 0 && currentPage <= Math.ceil(_this._total / _this._top)) {
                    currentPage = Math.ceil(currentPage);
                    _this.doLoadNext({ params: { $skip: _this._top * (currentPage - 1) } });
                }
            });
            return _this;
        }
        ObjectListPager.prototype.doRender = function (domElement) {
            _super.prototype.doRender.call(this, domElement);
            if (!this.options.showPageSize || this.options.pageSizeMenu)
                return;
            // Перезагрузка по enter. Просто подвязаться на изменение свойства нельзя, т.к. перегрузка списка будет происходить при
            // инкременте/декременте значения с помощью спиннера.
            var that = this;
            $(domElement).on("keyup", ".x-list-paginator_page_size-input", function (e) {
                if (e.which === core.html.keyCode.ENTER) {
                    e.stopImmediatePropagation();
                    that.list().reload();
                    return false;
                }
                return true;
            });
        };
        ObjectListPager.prototype._init = function (list) {
            _super.prototype._init.call(this, list);
            var that = this;
            this._initPageSizeInput(this.options);
            if (list && !this.options.hidePageStat) {
                list.items.bind("change", this._onListItemsChanges, this);
                // Пользовательские настройки количества строк на странице
                if (list.userSettings && this.options.storePageSize && this.options.showPageSize) {
                    list.userSettings.bindToProp(this, "pageRowCount");
                    if (this.options.pageSizeMenu && this.options.pageSizeMenu.length) {
                        list.userSettings.bind("init:pageRowCount", function (val) {
                            // дополнительная проверка на допустимый диапазон
                            // prevent events
                            var pageRowCount = that._validatePageSize(val), rowCountMenu = that.pageSizeMenu && that.pageSizeMenu.value();
                            // из настроек пользователя (userSettings) могло быть загружено значение, которого нет в списке доступных количеств.
                            if (rowCountMenu && pageRowCount !== rowCountMenu) {
                                var fittingVal = that.findFittingMenuItem(pageRowCount);
                                pageRowCount = fittingVal;
                                // prevent raising event
                                that.setPageSizeMenuValueSilent(pageRowCount);
                                that.pageRowCount(pageRowCount);
                            }
                        });
                    }
                }
            }
        };
        ObjectListPager.prototype._uninit = function (list) {
            _super.prototype._uninit.call(this, list);
            if (list && !this.options.hidePageStat) {
                list.items.unbind("change", null, this);
            }
        };
        //region page size calculations
        ObjectListPager.prototype._initPageSizeMenu = function (options) {
            if (!this.options.pageSizeMenu || !this.options.pageSizeMenu.length)
                return;
            var that = this, members = {}, enumInt = {
                name: "pagerSizeItems",
                vt: "i4",
                members: members
            }, opts = {
                name: "prop",
                vt: "enum",
                nullable: false,
                ref: enumInt
            }, vm = (core.lang.Class(core.lang.Observable, {
                prop: core.lang.Observable.accessor("prop")
            })).create();
            var fitVal = this.findFittingMenuItem(this.pageSize, members);
            this.pageSize = fitVal;
            vm.prop(fitVal);
            this.pageSizeMenu = new peDropdown(opts);
            this.pageSizeMenu.setViewModel(vm);
            vm.bind("change", function (sender, args) {
                that.pageRowCount(args.value);
                that.list().reload();
            });
        };
        ObjectListPager.prototype.setPageSizeMenuValueSilent = function (pageSize) {
            if (this.pageSizeMenu && this.pageSizeMenu.viewModel) {
                this.pageSizeMenu.viewModel._prop = pageSize;
            }
        };
        ObjectListPager.prototype.findFittingMenuItem = function (pageSize, members) {
            var minMod = Math.abs(this.options.pageSizeMenu[0] - pageSize), fitVal = this.options.pageSizeMenu[0];
            core.lang.forEach(this.options.pageSizeMenu, function (item) {
                if (members)
                    members["member" + item] = { value: item };
                var mod = Math.abs(item - pageSize);
                if (mod < minMod) {
                    minMod = mod;
                    fitVal = item;
                }
            });
            return fitVal;
        };
        ObjectListPager.prototype._initPageSizeInput = function (options) {
            if (!this.options.showPageSize)
                return;
            this.pageSize = this._validatePageSize(this.pageSize);
            this._initPageSizeMenu(options);
            this.pageRowCount(this.pageSize);
            this.pageSizeTitle(options.pageSizeLabel || resources["objectList.pager.pageSize"]);
        };
        ObjectListPager.prototype._validatePageSize = function (pageSize) {
            var pageRowCount = Math.ceil(pageSize || 0);
            if (!pageRowCount) {
                pageRowCount = ObjectListPager.defaultOptions.pageSize;
            }
            else if (pageRowCount < 1) {
                pageRowCount = 1;
            }
            return pageRowCount;
        };
        ObjectListPager.prototype._recalculatePageSizeBeforeLoad = function (params) {
            if (!this.options.showPageSize)
                return;
            // дополнительная проверка на допустимый диапазон
            // prevent events
            var pageRowCount = this._validatePageSize(this["_pageRowCount"]), rowCountMenu = this.pageSizeMenu && this.pageSizeMenu.value();
            // из настроек пользователя (userSettings) могло быть загружено значение, которого нет в списке доступных количеств.
            if (rowCountMenu && pageRowCount !== rowCountMenu) {
                var fittingVal = this.findFittingMenuItem(pageRowCount);
                pageRowCount = fittingVal;
                // prevent raising event
                this.setPageSizeMenuValueSilent(pageRowCount);
                this.pageRowCount(pageRowCount);
            }
            // юзер мог ввести невалидное значение в режиме ручного ввода
            if (pageRowCount != this["_pageRowCount"]) {
                this.pageRowCount(pageRowCount);
            }
            //пересчитаем $top и $skip в соответствии с актуальным значением pageSize
            if (params && params.$top) {
                var factor = (params.$skip || 0) / params.$top;
                this.pageSize = pageRowCount;
                params.$top = pageRowCount;
                params.$skip = params.$top * factor;
            }
        };
        //endregion page size calculations
        ObjectListPager.prototype._onListItemsChanges = function (items, args) {
            var that = this;
            // exclude reset/add of collection from load/loadMore (they happen in "loading" state):
            if (that.list().state() === "loaded") {
                //  NOTE: items.count is items count on the current page (not total)
                var total = that._total || 0;
                if (args.added)
                    total += args.added.length;
                if (args.removed)
                    total -= args.removed.length;
                that._total = total;
                that._updatePageStat((that.skippedItems() || 0) + 1, items.count(), total);
                // TODO: в принципе раз мы знаем о новом total, то и количество страниц в меню можно скорректировать (видимо _total надо сделать observable)
            }
        };
        ObjectListPager.prototype._updatePageStat = function (first, pageSize, total) {
            var last = first + pageSize - 1;
            if (pageSize === 0) {
                // current page has no more items
                this.pageStat("");
            }
            else {
                this.pageStat(lang.stringFormat(resources["objectList.pager.stat"], first, last, total));
            }
        };
        /**
         * @protected
         * @virtual
         * @returns {Object.<String,ICommand>}
         */
        ObjectListPager.prototype.createCommands = function () {
            var that = this;
            return {
                LoadPrev: new core.commands.BoundCommand(that.doLoadPrev, that.canLoadPrev, that),
                LoadNext: new core.commands.BoundCommand(that.doLoadNext, that.canLoadNext, that),
                LoadPage: new core.commands.BoundCommand(that.doLoadPage, that.canLoadPage, that)
            };
        };
        ObjectListPager.prototype.doLoadPrev = function (args) {
            if (args === void 0) { args = {}; }
            var that = this, pageParams = {
                $skip: Math.max((that._loadParams.$skip || 0) - that._top, 0),
                $top: that._top,
                $fetchTotal: false
            };
            args.params = lang.append(args.params || {}, pageParams, that._loadParams);
            return that.list().reload(args);
        };
        ObjectListPager.prototype.canLoadPrev = function () {
            var that = this;
            return !that.list().isLoading() && that._loadParams && that._loadParams.$skip > 0 && that._top >= 0;
        };
        ObjectListPager.prototype.doLoadNext = function (args) {
            var that = this, pageParams = {
                $skip: (that._loadParams.$skip || 0) + that._top,
                $top: that._top,
                $fetchTotal: false
            };
            args.params = lang.append(args.params || {}, pageParams, that._loadParams);
            return that.list().reload(args);
        };
        ObjectListPager.prototype.canLoadNext = function () {
            var that = this;
            return !that.list().isLoading() && that._hasNext && that._loadParams && that._top >= 0 &&
                (that._total == null || that._total > (that._loadParams.$skip || 0) + that._top);
        };
        ObjectListPager.prototype.doLoadPage = function (args) {
            var that = this, pageParams = {
                // $skip should be set in args.params
                $top: that._top,
                $fetchTotal: false
            };
            args.params = lang.append(args.params || {}, pageParams, that._loadParams);
            return that.list().reload(args);
        };
        ObjectListPager.prototype.canLoadPage = function () {
            return !this.list().isLoading();
        };
        /** Prepare data source for async count call */
        ObjectListPager.prototype._asyncCountPrepare = function (list) {
            // no async count wanted or data source is executing now or it has been already created
            if (!this.options.asyncCountDataSource || this.isAsyncCounting() || this.asyncCountDataSource)
                return;
            this.asyncCountDataSource = (typeof this.options.asyncCountDataSource === "string")
                ? new DataSource(list.app, {
                    name: this.options.asyncCountDataSource,
                    isDomain: false
                })
                : this.options.asyncCountDataSource;
        };
        /** start async count call*/
        ObjectListPager.prototype._asyncCountStart = function (args) {
            if (args === void 0) { args = {}; }
            // data source is executing now or it has NOT been created yet
            if (this.isAsyncCounting() || !this.asyncCountDataSource)
                return;
            this.isAsyncCounting(true);
            try {
                var that_1 = this, query = {
                    params: args.params || {}
                };
                // old values are obsolete as we are counting
                that_1._total = undefined;
                that_1.skippedItems(undefined);
                that_1.asyncCountDataSource.load(query).then(function (response) {
                    try {
                        var result = response.result.length ? response.result[0] : { "c": 0 }, keys = Object.keys(result), count = keys.length ? result[keys[0]] : 0;
                        args.hints = args.hints || {};
                        args.hints.total = count;
                        that_1._processTotalValue(args);
                    }
                    catch (error) {
                        console.error(error);
                        return lang.rejected(error);
                    }
                }).always(function () {
                    that_1.isAsyncCounting(false);
                    that_1.asyncCountDataSource = undefined;
                });
            }
            catch (e) {
                this.isAsyncCounting(false);
                this.asyncCountDataSource = undefined;
                throw e;
            }
        };
        ObjectListPager.prototype._onDataLoading = function (list, args) {
            if (args === void 0) { args = {}; }
            _super.prototype._onDataLoading.call(this, list, args);
            var params = args.params || (args.params = {});
            this._recalculatePageSizeBeforeLoad(params);
            if (params.$fetchTotal === undefined && !params.$skip) {
                // reloading is inited by an external command, request total count from server
                // NOTE: all commands of the paginator itself explicitly set the parameter `$fetchTotal`
                if (this.options.asyncCountDataSource) {
                    // если требуется асинхронный запрос количества, то здесь убираем (а точнее, не добавляем) параметр $fetchTotal, чтобы не делать стандартный синхронный
                    this._asyncCountPrepare(list);
                }
                else {
                    params.$fetchTotal = true;
                }
            }
            if (!params.$fetchTotal) {
                // false is default value of `$fetchTotal`, remove it to make the request shorter
                params.$fetchTotal = undefined;
            }
        };
        ObjectListPager.prototype._onDataLoaded = function (list, args) {
            if (args === void 0) { args = {}; }
            _super.prototype._onDataLoaded.call(this, list, args);
            var that = this, params = args.params || {}, hints = args.hints || {}, total, skip;
            that.hasMoreItems(that._hasNext || params.$skip > 0);
            if (hints.paging || that.options.force) {
                if (this.asyncCountDataSource) {
                    that._asyncCountStart(args);
                }
                else {
                    that._processTotalValue(args);
                }
            }
            else {
                // update the number of skipped items
                that.skippedItems(undefined);
            }
        };
        ObjectListPager.prototype._processTotalValue = function (args) {
            if (args === void 0) { args = {}; }
            var that = this, params = args.params || {}, hints = args.hints || {}, total, skip;
            if (hints.total >= 0) {
                total = hints.total; // we got args.hints.total from the server (it's loading of the first page)
            }
            else if (params.$fetchTotal) {
                total = 0; // we requested args.hints.total from the server, but server didn't return it
            }
            else {
                total = that._total || 0;
            }
            skip = params.$skip || 0;
            total = Math.max(total, skip + that._top + 1);
            if (!that._hasNext) {
                // we have reached the last page, but `total` points outside the current range, correct it
                total = Math.min(total, skip + args.items.length);
            }
            that._total = total;
            // update the number of skipped items
            that.skippedItems(skip);
            // reinit menu
            that.menu = that.createMenu();
            that.menu.bindToPart(that);
            that.changed("menu");
            if (!that.options.hidePageStat) {
                that._updatePageStat(skip + 1, Math.min(that._top, args.items.length), total);
            }
        };
        ObjectListPager.prototype.createMenu = function () {
            var that = this, menu = this.options.menu, pages = that.createPages(), pageItems;
            if (pages) {
                pageItems = pages.map(function (page, i) {
                    return {
                        name: "LoadPage" + i,
                        title: page.text,
                        commandName: "LoadPage",
                        params: {
                            params: page.loadParams
                        },
                        // NOTE: `radio` option isn't supported by standard menu presenter, use `isDefaultAction` to simulate it
                        isDefaultAction: page.isCurrent,
                        disabled: !page.loadParams
                    };
                });
                menu = Menu.merge(menu, { update: pageItems });
            }
            return new Menu(menu);
        };
        ObjectListPager.prototype.createPages = function () {
            var that = this;
            if (!that._total || !that._loadParams || !that._top) {
                return null;
            }
            var pages = [], pagesCount = Math.ceil(that._total / that._top), lastPage = pagesCount - 1, activePage = Math.floor((that._loadParams.$skip || 0) / that._top), N = 3, // number of visible pages to left and to right from an active page
            minPage = Math.min(lastPage - N, activePage) - N, maxPage = Math.max(N, activePage) + N;
            that["lastPage"] = pagesCount;
            // prevent events
            that["_currentPage"] = activePage + 1;
            // remove the ellipsis which replaces single page: 1 ... 3 4 5 => 1 2 3 4 5
            if (minPage < 3) {
                minPage = 0;
            }
            // remove the ellipsis which replaces single page: 96 97 98 ... 100 => 96 97 98 99 100
            if (maxPage > lastPage - 3) {
                maxPage = lastPage;
            }
            // fill pages
            if (minPage > 0) {
                pages.push({
                    text: "1",
                    loadParams: { $skip: 0 }
                }, {
                    text: "..."
                });
            }
            for (var i = minPage; i <= maxPage; i++) {
                pages.push({
                    text: "" + (i + 1),
                    isCurrent: i === activePage,
                    loadParams: { $skip: that._top * i }
                });
            }
            if (maxPage < lastPage) {
                pages.push({
                    text: "..."
                }, {
                    text: "" + (lastPage + 1),
                    loadParams: { $skip: that._top * lastPage }
                });
            }
            return pages;
        };
        ObjectListPager.defaultOptions = {
            template: template,
            pageSize: 100,
            showPageSize: false,
            storePageSize: true,
            pageSizeMenu: undefined,
            userSettings: {
                props: {
                    "pageRowCount": true
                }
            },
            menu: {
                items: [
                    {
                        name: "LoadPrev",
                        html: "&larr;",
                        title: resources["loadPrev"],
                        order: 0
                    }, {
                        name: "LoadNext",
                        html: "&rarr;",
                        title: resources["loadNext"],
                        order: 1000
                    }
                ]
            }
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPager.prototype, "pageStat");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPager.prototype, "currentPage");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPager.prototype, "pageRowCount");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPager.prototype, "pageSizeTitle");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPager.prototype, "isAsyncCounting");
        return ObjectListPager;
    }(ObjectListPaginatorBase));
    // backward compatibility:
    ObjectListPager.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: ObjectListPager.defaultOptions
    });
    core.ui.ObjectListPager = ObjectListPager;
    return ObjectListPager;
});
//# sourceMappingURL=ObjectListPager.js.map