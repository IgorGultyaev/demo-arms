/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "vendor/select2/select2", "i18n!lib/nls/resources", "lib/data/DataSource", "lib/utils/ObservableCollectionView", "lib/ui/pe/PropertyEditorLookup", "lib/utils", "lib/formatters", "xcss!vendor/select2/content/select2", "xcss!lib/ui/styles/peObjectMultiSelect"], function (require, exports, $, core, Select2, resources, DataSource, ObservableCollectionView, PropertyEditorLookup, utils, formatters) {
    "use strict";
    var lang = core.lang;
    // TODO: Cannot read property 'defaultsFor' of undefined
    /*
    core.diagnostics.ts:96 TypeError: Cannot read property 'defaultsFor' of undefined
        at peObjectMultiSelect.PropertyEditorLookup._createMenuDefaults (PropertyEditorLookup.ts:248)
        at peObjectMultiSelect.PropertyEditorLookup._createMenu (PropertyEditorLookup.ts:252)
        at peObjectMultiSelect.PropertyEditorLookup [as constructor] (PropertyEditorLookup.ts:190)
        at peObjectMultiSelect [as constructor] (peObjectMultiSelect.ts:123)
        at Function.CoreClass.create (core.lang.ts:916)
        at Object.create (PropertyEditor.ts:109)
        at ObjectEditor._createEditorForProp (ObjectEditor.ts:916)
        at ObjectEditor._createPage (ObjectEditor.ts:778)
        at ObjectEditor._initialize (ObjectEditor.ts:448)
        at ObjectEditor._setViewModelComplete (ObjectEditor.ts:406)
     */
    // TODO var AttachContainer = $.fn.select2.amd.require("select2/dropdown/attachContainer");
    function AttachContainer(decorated, $element, options) {
        decorated.call(this, $element, options);
    }
    AttachContainer.prototype.position = function (decorated, $dropdown, $container) {
        var $dropdownContainer = $container.find(".dropdown-wrapper");
        $dropdownContainer.append($dropdown);
        $dropdown.addClass("select2-dropdown--below").addClass("select2-dropdown-inplace");
        $container.addClass("select2-container--below");
    };
    var peObjectMultiSelect = /** @class */ (function (_super) {
        __extends(peObjectMultiSelect, _super);
        /**
         * @constructs peEnumDropDownSelect2
         * @extends peEnumDropDownBase
         * @param options
         */
        function peObjectMultiSelect(options) {
            var _this = this;
            options = peObjectMultiSelect.mixContextOptions(options, peObjectMultiSelect.defaultOptions, peObjectMultiSelect.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.propItems = new ObservableCollectionView();
            that.lookupParams = { skip: 0, searchTerm: "" };
            utils.subscribeOnEvents(that, that.options, peObjectMultiSelect.Events);
            return _this;
        }
        /**
         * Wrap provider.getItems method to handle hasNext hint from LoadResponse
         * @param provider
         * @private
         */
        peObjectMultiSelect.prototype._wrapDataProvider = function (provider) {
            var that = this;
            var origGetItems = provider["getItems"];
            if (origGetItems)
                provider["getItems"] = function (response) {
                    // for JSON datasource hints does not exists
                    if (response.hints)
                        that.lookupParams.hasNext = response.hints.hasNext;
                    return origGetItems.apply(provider, arguments);
                };
            return provider;
        };
        peObjectMultiSelect.prototype.createDataProvider = function () {
            var baseProvider = _super.prototype.createDataProvider.call(this);
            if (baseProvider) {
                return this._wrapDataProvider(baseProvider);
            }
            var that = this, options = that.options, dataSource = options.dataSource;
            if (!dataSource) {
                var entityType = options.entityType || options.urlSuffix || (options.ref && options.ref.name);
                dataSource = new DataSource(that.app, { entityType: entityType });
            }
            if (!dataSource.isDomain)
                throw new Error("peObjectMultiSelect: Only domain DataSource supported");
            var dataProvider = dataSource.isDomain
                ? new PropertyEditorLookup.DomainDataProvider(that)
                : null; // TODO: new PropertyEditorLookup.JsonDataProvider(that);
            dataProvider.dataSource = dataSource;
            return this._wrapDataProvider(dataProvider);
        };
        /**
         * Render <select> element.
         * @param domElement Parent element.
         */
        peObjectMultiSelect.prototype._renderSelect = function (domElement) {
            var that = this, options = that.options;
            var select = $("<select />").appendTo(domElement);
            select.addClass("form-control");
            select.attr("data-placeholder", options.placeholder);
            // приходится здесь сразу выставлять multiple,
            // иначе, после загрузи, выбранным оказывается лишь одно значение
            select.attr("multiple", "multiple");
            return select;
        };
        /**
         * Render <option> elements for preselected values.
         */
        peObjectMultiSelect.prototype._renderOptions = function () {
            var that = this;
            that.select.find("option").remove();
            // render members as <options>
            core.lang.forEach(that.propItems, function (value) {
                var title = that.formatSelectValueTitle(value);
                var dataValue = { data: value, id: value.id, title: title };
                // NOTE: select2 вплотную работает с полем "data"
                // NOTE: если хотим, чтобы при нажатии на Backspace в строку подставлялся некоторый текст,
                // то этот текст нужно передат в поле dataValue.text
                var $opt = $("<option />", { value: value.id, selected: true })
                    .data("data", dataValue);
                $opt.appendTo(that.select);
            });
        };
        peObjectMultiSelect.prototype.formatSelectValueTitle = function (value) {
            return formatters.formatPropValue(this.options, value).toString();
        };
        peObjectMultiSelect.prototype.formatResultItemTitle = function (item) {
            var value = this.dataProvider.getValue(item);
            return this.formatSelectValueTitle(value);
        };
        peObjectMultiSelect.prototype.formatSelectValue = function (value) {
            var that = this;
            var text = that.dataProvider.getValuePresentation(value);
            if (formatters.isHtml(text)) {
                return $(text.toHTML());
            }
            else {
                return text.toString();
            }
        };
        peObjectMultiSelect.prototype.formatResultItem = function (item) {
            var that = this;
            var text = that.dataProvider.getItemPresentation(item);
            if (formatters.isHtml(text)) {
                return $(text.toHTML());
            }
            else {
                return text.toString();
            }
        };
        peObjectMultiSelect.prototype._isElementInside = function (element) {
            return element.parents("#" + this.id).length > 0;
        };
        peObjectMultiSelect.prototype.doRender = function (domElement) {
            var _this = this;
            var that = this, bindable, select;
            var $rootElement = $("<div class='x-pe-object-dropdown x-pe-object-multiple input-group'></div>").appendTo(domElement);
            var $selectContainer = $("<div></div>").appendTo($rootElement);
            $selectContainer.addClass("x-pe-object-multiselect");
            that.element = $rootElement;
            that.select = that._renderSelect($selectContainer);
            // buttons:
            that.renderMenu($rootElement);
            _super.prototype.doRender.call(this, domElement);
            $selectContainer.addClass("x-pe-dropdown-select2");
            select = that.select;
            select.removeClass("form-control");
            select.attr("data-disabled", 0);
            var modalParent = that.select.parents(".modal");
            var selectOptions = that.getSelectOptions(modalParent);
            if (that.options.dropdownPosition === "inplace") {
                selectOptions = that.addDropdownAdapter(selectOptions);
            }
            selectOptions.dataAdapter = that._createSelect2DataAdapter(selectOptions);
            if (selectOptions.multiple) {
                // workaround for https://github.com/select2/select2/issues/4417
                // create ResultAdapter without highlightFirstItem behavior
                selectOptions.resultsAdapter = that._createSelect2ResultAdapter(selectOptions);
            }
            that.select2 = new Select2(select, selectOptions);
            // HACK: переопределяем базовый обработчик закрытия выпадающего списка:
            // по умолчанию Select2 закрывает список на mousedown вне элемента,
            // т.о. при нажатии кнопки toggle (лупа), всегда происходит закрытие списка
            // добавим проверку _isElementInside, чтобы этого избежать
            that.select2.selection._attachCloseHandler = function (container) {
                var self = this;
                $(document.body).on("mousedown.select2." + container.id, function (e) {
                    var $target = $(e.target);
                    if (that._isElementInside($target))
                        return;
                    var $select = $target.closest(".select2");
                    var $all = $(".select2.select2-container--open");
                    $all.each(function () {
                        var $this = $(this);
                        if (this === $select[0]) {
                            return;
                        }
                        var $element = $this.data("element");
                        $element.select2("close");
                    });
                });
            };
            if (that.options.dropdownPosition === "inplace") {
                // notify Affix about changes in dom
                select.bind("select2:opening", function () {
                    that.notifyDOMChanged();
                });
                select.bind("select2:close", function () {
                    that.notifyDOMChanged();
                });
            }
            select.bind("select2:open", function () {
                that._ensureItemsAvailable();
                that._isOpen = true;
                that.trigger(_this.events.OPENED, _this, {});
            });
            select.bind("select2:close", function () {
                that._isOpen = false;
                that.trigger(_this.events.CLOSED, _this, {});
            });
            // HACK: при отмене выбора элемента будем закрывать выпадающий список
            // так как Select2 всегда сам делает toggle списка,
            // т.о. отмена по крестику на кнопке не будет работать как toggle
            select.bind("select2:unselect", function (e) {
                if (!that.options.closeOnSelect) {
                    if (e && e.params && e.params.originalEvent && e.params.originalEvent.target) {
                        var target = $(e.params.originalEvent.target);
                        // если сделали отмену выбора кликом по элементу списка - ничего не делаем
                        if (target.is("li")) {
                            return;
                        }
                    }
                }
                that._close();
                //that.select2.close();
            });
            // workaround: for multi-select selecting a value should clear search field (by default it doesn't)
            if (that.select2.options.options.multiple && that.select2.selection) {
                that.select2.on("select", function () {
                    that.select2.selection.$search.val("");
                });
            }
            // обновляем модель при выборе элемента в select2
            that.select2.on("select", function (e) {
                var obj = e.data.data;
                obj = that._attachToUow(obj);
                /*
                let ids = lang.clone(that._valueIds());
                ids.push(obj.id);
                that.viewModel.set(that.viewModelProp, ids);
                */
                that._addObject(obj);
                that.propItems.source(that.value());
            });
            // обновляем модель при отмене выбора элемента в select2
            that.select2.on("unselect", function (e) {
                var obj = e.data.data;
                var itemToRemove = that.value().find(function (item) { return item.id === obj.id; });
                if (itemToRemove) {
                    that.value().remove(itemToRemove);
                    that.propItems.source(that.value());
                }
            });
            // workaround: по умолчанию Select2 не гасит keyup, в диалоге оно доходят до меню,
            // и, например, Enter/ESC закрывают диалог.
            // Попытка починить Select2 пока не удалась, см. https://github.com/select2/select2/issues/4495
            // Поэтому просто блокируем все события (элемент $dropdown находится не под $container)
            // Ес-но, это ломает нормальное поведение PE, когда по ESC мы делаем blur
            that.select2.$container.stopKeyboardBubbling();
            that.select2.$dropdown.stopKeyboardBubbling();
            // workaround: multi-select отображаемый в диалоге будет иметь placeholder обрезанный width:100px
            // (https://github.com/select2/select2/issues/4513)
            if (!select.is(":visible")) {
                if (modalParent.length && !modalParent.is(":visible")) {
                    // dialog is hidden, postpone resize when it's shown
                    modalParent.on("shown.bs.modal.select2", function () {
                        that.select2.selection.resizeSearch();
                        modalParent.off("shown.bs.modal.select2");
                    });
                }
                else {
                    // dialog is visible, but control is invisible, make resize with timer
                    // NOTE: Стандартный ObjectEditorPresenter показывает страницу синхронно сразу после рендеринга
                    window.setTimeout(function () {
                        that.select2.selection.resizeSearch();
                    });
                }
            }
        };
        peObjectMultiSelect.prototype.createBindableElement = function () {
            var that = this;
            var bindable = {
                // instead of creating "get-binding" we subscribe on two events: "select" and "unselect"
                set: function (v) {
                    that.propItems.source(v);
                    that._renderOptions();
                },
                setError: function (error) {
                    var message = null;
                    if (error) {
                        if (core.eth.isObjectNotFound(error)) {
                            // the value object was deleted, reset value to null
                            that.value(null);
                        }
                        else if (error.httpStatus) {
                            message = resources["peDropDownLookup.loadingError"] + error.message;
                        }
                    }
                    that.renderError(message);
                }
            };
            return bindable;
        };
        peObjectMultiSelect.prototype._attachToUow = function (obj) {
            var that = this;
            var uow = that.viewModel.uow;
            // прикрепляем к UOW как в NavigationPropertyEditor
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
            return obj;
        };
        peObjectMultiSelect.prototype._renderViewItems = function () {
            // not used for Select2
        };
        peObjectMultiSelect.prototype._doReload = function () {
            var that = this;
            that._close();
            _super.prototype._doReload.call(this);
        };
        /*
        protected _getLoadParams(params: LoadQueryParams): LoadQueryParams {
            let that = this;
            let options = that.options;
    
            params = super._getLoadParams(params);
    
            if (options.mode === that.modes.live && !params[options.lookupParam]) {
                // NOTE: в базовой реализации присваивается пустое значение: params[options.lookupParam] = "";
                // но не понятно зачем? если значение фильтра пустое, вообще не будем заполнять параметр запроса
                delete params[options.lookupParam];
            }
    
            return params;
        }
        */
        peObjectMultiSelect.prototype.getSelectOptions = function (modalParent) {
            var that = this;
            var options = that.options;
            // NOTE: Можно загрузкить языковой файл (добавить в начало: import "vendor/select2/i18n/ru"),
            // но он падает, т.к. ожидает jQuery.fn.select2, поэтому определим объект Translation:
            var Language = {
                noResults: function () {
                    return that.options.noResultsText;
                },
                searching: function () {
                    return that.options.searchingText;
                },
                maximumSelected: function () {
                    return "";
                },
                loadingMore: function () {
                    return that.options.loadingText;
                },
                inputTooShort: function (args) {
                    var remainingChars = args.minimum - args.input.length;
                    return core.lang.stringFormat(that.options.inputTooShort, remainingChars);
                }
            };
            var selectOpts = {
                allowClear: options.nullable && false,
                width: options.width,
                dropdownAutoWidth: options.dropdownAutoWidth,
                minimumResultsForSearch: options.hideSearch ? Infinity : options.minimumResultsForSearch,
                // by default dropdown will be under body, but in dialog we move it under modal root
                dropdownParent: modalParent.length ? modalParent : undefined,
                closeOnSelect: !!options.closeOnSelect,
                language: Language,
                multiple: true,
                minimumInputLength: options.lookupMinChars,
                templateSelection: function (selection) {
                    return that.formatSelectValue(selection["data"]);
                },
                templateResult: function (result) {
                    var data = result["data"];
                    if (!data)
                        return result.text;
                    return that.formatResultItem(data);
                }
            };
            return lang.extendEx(selectOpts, options.select2, { deep: true });
        };
        peObjectMultiSelect.prototype.addDropdownAdapter = function (s2options) {
            // NOTE: Код взять из Select2 (Defaults.prototype.apply),
            //  по умолчаню Select2 использует AttachBody в качестве dropdownAdapter,
            //  dropdownAdapter можно переопределить через опцию,
            //  но вместе с этим приходится повторять настройку всей цепочики декораторов
            // NOTE: важно: в отличии от кода в select2 здесь в опции еще не подставлены defaults
            var Utils = $.fn.select2.amd.require("select2/utils");
            var Dropdown = $.fn.select2.amd.require("select2/dropdown");
            var DropdownSearch = $.fn.select2.amd.require("select2/dropdown/search");
            var CloseOnSelect = $.fn.select2.amd.require("select2/dropdown/closeOnSelect");
            var MinimumResultsForSearch = $.fn.select2.amd.require("select2/dropdown/minimumResultsForSearch");
            if (s2options.dropdownAdapter == null) {
                s2options.dropdownAdapter = Dropdown;
                if (s2options.minimumResultsForSearch !== 0) {
                    s2options.dropdownAdapter = Utils.Decorate(s2options.dropdownAdapter, MinimumResultsForSearch);
                }
                if (s2options.closeOnSelect) {
                    s2options.dropdownAdapter = Utils.Decorate(s2options.dropdownAdapter, CloseOnSelect);
                }
                s2options.dropdownAdapter = Utils.Decorate(s2options.dropdownAdapter, AttachContainer);
            }
            return s2options;
        };
        /**
         * Создать адаптер данных для выпадающего списка.
         * @param s2options
         */
        peObjectMultiSelect.prototype._createSelect2DataAdapter = function (s2options) {
            var that = this;
            var pe = this;
            var Utils = $.fn.select2.amd.require("select2/utils");
            var ArrayData = $.fn.select2.amd.require("select2/data/array");
            function CustomData($element, options) {
                CustomData.__super__.constructor.call(this, $element, options);
            }
            function toResult(items, dataProvider, hasMore) {
                var resp = { results: [], pagination: { more: true } };
                items.forEach(function (item) {
                    var value = dataProvider.getValue(item);
                    var id = value.id;
                    var title = pe.formatResultItemTitle(item);
                    resp.results.push({ id: id, title: title, data: value });
                });
                resp.pagination.more = hasMore;
                return resp;
            }
            // получение данных, в том числе постраничное и со строкой поиска
            function customQuery(params, callback) {
                var searchTerm = params.term || "";
                var page = params.page || 1;
                var queryParams = {};
                // в live режиме при смене строки поиска будем запрашивать данные с начала
                if (pe.options.mode === pe.modes.live && pe.lookupParams.searchTerm !== searchTerm) {
                    pe.isDataLoaded = false;
                    pe.lookupParams.skip = 0;
                    page = 1;
                }
                if (page === 1)
                    pe.lookupParams.skip = 0;
                if (pe.lookupParams.skip)
                    queryParams.$skip = pe.lookupParams.skip;
                if (pe.options.lookupParam && pe.options.mode === pe.modes.live) {
                    queryParams[pe.options.lookupParam] = searchTerm;
                }
                if (!pe.isDataLoaded) {
                    if (page === 1)
                        pe.select2.results.customShowLoading(params);
                    pe.reload(queryParams).done(function () {
                        // lastLoadedItems is set in onDataLoaded method
                        pe.lookupParams.skip += pe.lookupParams.lastLoadedItems.length;
                        var resultedItems = pe.lookupParams.lastLoadedItems;
                        // в не-live режиме будем грузить все данные до конца, рекурсивно вызывая customQuery
                        if (pe.options.mode !== pe.modes.live) {
                            params.page = page + 1;
                            customQuery(params, callback);
                        }
                        else {
                            callback(toResult(resultedItems, pe.dataProvider, pe.lookupParams.hasNext));
                        }
                    });
                }
                else {
                    if (pe.options.mode !== pe.modes.live && pe.lookupParams.searchTerm !== searchTerm) {
                        var itemsToFilter = new lang.ObservableCollection(pe.items.all());
                        var filteredItems = pe._filterItems(itemsToFilter, searchTerm);
                        pe.viewItems.reset(filteredItems);
                    }
                    callback(toResult(pe.viewItems.all(), pe.dataProvider, false));
                }
                pe.lookupParams.searchTerm = searchTerm;
            }
            // NOTE: есть цель - при пустом фильтре отображать выпадающий список сразу, без debounce задержки
            // но нельзя при пустом фильтре просто вызывать customQuery, т.к. до этого мог быть вызов debouncedCustomQuery
            // и получится, что вызывали вначале debouncedCustomQuery, а потом customQuery,
            // но результат выйдет в обратном порядке: вначале от customQuery, а потом от debouncedCustomQuery
            // чтобы этого избежать, будем всегда вызвать debounced-версию customQuery,
            // причем в обоих случаях будем хранить внутренний тамер в одном и том же поле
            var queryTimerField = "__query";
            var debouncedCustomQuery = lang.debounce(customQuery, that.options.lookupDelay, queryTimerField);
            var debouncedCustomQueryNoWait = lang.debounce(customQuery, 0, queryTimerField);
            Utils.Extend(CustomData, ArrayData);
            // по спецификации Select2: метод query отвечает за построение результата асинхронного запроса данных
            CustomData.prototype.query = function (params, callback) {
                // for empty search string call query immediate
                if ((params.term || "") === "")
                    debouncedCustomQueryNoWait.call(that, params, callback);
                else
                    debouncedCustomQuery.call(that, params, callback);
            };
            var cd = CustomData;
            // декорируем адаптер как в оригинале Select2
            if (s2options.minimumInputLength > 0) {
                var MinimumInputLength = $.fn.select2.amd.require("select2/data/minimumInputLength");
                cd = Utils.Decorate(cd, MinimumInputLength);
            }
            if (s2options.maximumSelectionLength > 0) {
                var MaximumSelectionLength = $.fn.select2.amd.require("select2/data/maximumSelectionLength");
                cd = Utils.Decorate(cd, MaximumSelectionLength);
            }
            // NOTE: s2options.tags ignored and "Tags" decoration not included
            return cd;
        };
        peObjectMultiSelect.prototype._createSelect2ResultAdapter = function (s2options) {
            var pe = this;
            var ResultsList = $.fn.select2.amd.require("select2/results");
            var Utils = $.fn.select2.amd.require("select2/utils");
            var InfiniteScroll = $.fn.select2.amd.require("select2/dropdown/infiniteScroll");
            ResultsList.prototype.highlightFirstItem = function () {
                // do nothing for prevent scrolling
            };
            var originalShowLoading = ResultsList.prototype.showLoading;
            ResultsList.prototype.showLoading = function (params) {
                // здесь ничего не делаем
                // будем самостоятельно вызывать customShowLoading перед загрузкой данных
            };
            // определим customShowLoading как оригинальную версию showLoading
            ResultsList.prototype.customShowLoading = originalShowLoading;
            var rl = ResultsList;
            // всегда задействуем InfiniteScroll
            rl = Utils.Decorate(rl, InfiniteScroll);
            if (s2options.placeholder != null) {
                var HidePlaceholder = $.fn.select2.amd.require("select2/dropdown/hidePlaceholder");
                rl = Utils.Decorate(rl, HidePlaceholder);
            }
            if (s2options.selectOnClose) {
                var SelectOnClose = $.fn.select2.amd.require("select2/dropdown/selectOnClose");
                rl = Utils.Decorate(rl, SelectOnClose);
            }
            return rl;
        };
        peObjectMultiSelect.prototype.onDataLoaded = function (args) {
            var that = this;
            that.lookupParams.lastLoadedItems = args.items;
            _super.prototype.onDataLoaded.call(this, args);
        };
        peObjectMultiSelect.prototype._setItems = function (items) {
            var _this = this;
            var that = this;
            that.isDataLoaded = !that.lookupParams.hasNext;
            if ((that.lookupParams.skip || 0) === 0) {
                that.items.reset(items);
            }
            else {
                if (items.length === 0 || !that.lookupParams.hasNext) {
                    that.isDataLoaded = true;
                    that.lookupParams.skip = 0;
                    that.lookupParams.hasNext = false;
                }
                lang.forEach(items, function (item) {
                    _this.items.add(item);
                });
            }
            that.viewItems.reset(that.items.all());
        };
        peObjectMultiSelect.prototype.focus = function () {
            var that = this;
            if (that.select2) {
                that.select2.focus();
            }
            else if (that._btnContainer) {
                that._btnContainer.find(".btn:last").focus();
            }
        };
        peObjectMultiSelect.prototype._setWidth = function () {
            // ничего не делаем - ширина установлена в render
        };
        peObjectMultiSelect.prototype._onDisabledChange = function (disabled) {
            this.select.prop("disabled", disabled);
            // IE8-IE10 hack: несмотря на поддержку mutation events (и onpropertychanged в IE8) для disabled-элементов они не работают!
            if (core.platform.browser.ie && core.platform.browser.ie.version < 11) {
                // simulate setting disabled - see select2._syncAttributes
                var select2 = this.select2;
                select2.options.set("disabled", disabled);
                disabled ? select2.trigger("disable", {}) : select2.trigger("enable", {});
            }
        };
        peObjectMultiSelect.prototype._renderError = function (error, $element) {
            var that = this;
            _super.prototype._renderError.call(this, error, $element);
            // TODO: renderError
            if (that.select && that.select) {
                that.select.toggleClass("-invalid", !!error);
                //that.select.select2("dropdown").toggleClass("-invalid", !!error);
            }
        };
        peObjectMultiSelect.prototype.unload = function (options) {
            var that = this;
            if (that.select2) {
                that.select2.destroy();
                that.select2 = undefined; // prevent repeated dispose
            }
            _super.prototype.unload.call(this, options);
        };
        peObjectMultiSelect.prototype.setViewModel = function (viewModel) {
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
                        throw new Error("peObjectMultiSelect.setViewModel: ref ('" + ref + "') is string but viewModel has no meta");
                    }
                    that.valueObjectEntityType = that.viewModel.meta.model.entities[ref];
                }
                else {
                    that.valueObjectEntityType = ref;
                }
            }
            // NOTE: viewModel can be null, viewModel can be a not-loaded object
            if (that.viewModel && that.viewModel[that.viewModelProp]) {
                var value = that.value();
                if (value && !lang.support.isNotLoaded(value)) {
                    that.propItems.source(value);
                }
                // NOTE: if the property isn't loaded here, it will be loaded in render method
                // TODO: what if value is null?
                if (that.presenter && that.presenter.setViewModel) {
                    that.presenter.setViewModel(that);
                }
            }
        };
        peObjectMultiSelect.prototype._ensurePropLoaded = function () {
            var that = this;
            if (that.viewModel[that.viewModelProp]) {
                var value = that.value(), propLoadOptions = {
                    preloads: that.options.preloads
                };
                if (lang.support.isNotLoaded(value)) {
                    return value.load(propLoadOptions).then(function () {
                        that._onPropertyLoaded();
                    }, function () {
                        that.state(that.states.failed);
                    });
                }
                else if (value !== that.propItems.source()) {
                    that._onPropertyLoaded(value);
                }
            }
        };
        peObjectMultiSelect.prototype._onPropChanged = function (sender, value) {
            _super.prototype._onPropChanged.call(this, sender, value);
            this._ensurePropLoaded();
        };
        peObjectMultiSelect.prototype._onPropertyLoaded = function (data) {
            var that = this;
            if (that.isDisposed) {
                return;
            }
            that.propItems.source(data || that.value());
            that.onPropertyLoaded();
        };
        peObjectMultiSelect.prototype.onPropertyLoaded = function () {
            var that = this;
            that.trigger(peObjectMultiSelect.Events.PROPERTY_LOADED, that);
        };
        peObjectMultiSelect.prototype.dispose = function (options) {
            _super.prototype.dispose.call(this, options);
            this.propItems.dispose();
        };
        peObjectMultiSelect.prototype.beforeRender = function (domElement) {
            _super.prototype.beforeRender.call(this, domElement);
            this._ensurePropLoaded();
        };
        peObjectMultiSelect.prototype._addObject = function (obj) {
            var propValue = this.value();
            if (propValue.indexOf(obj) < 0) {
                propValue.add(obj);
            }
        };
        peObjectMultiSelect.prototype._valueIds = function () {
            var value = this.value();
            // NOTE: `ids()` is optional method
            return value.ids ? value.ids() : value.all().map(function (o) { return o.id; });
        };
        peObjectMultiSelect.prototype._ensureItemsAvailable = function () {
            if (this.isDataLoaded && !this._isLookupStarted &&
                this.items.count() !== this.viewItems.count()) {
                this.viewItems.reset(this.items.all());
            }
        };
        peObjectMultiSelect.prototype._open = function () {
            var that = this;
            that._ensureItemsAvailable();
            if (that.select2) {
                that.select2.open();
                that._isOpen = true;
            }
        };
        peObjectMultiSelect.prototype._close = function () {
            var that = this;
            if (that.select2) {
                that.select2.close();
                that._isOpen = false;
            }
        };
        peObjectMultiSelect.defaultOptions = {
            dropdownAutoWidth: false,
            hideSearch: false,
            minimumResultsForSearch: 4,
            //dropdownPosition: "inplace",
            closeOnSelect: false,
            width: "100%",
            noResultsText: resources["no_matches"],
            searchingText: resources["searching"],
            inputTooShort: resources["peObjectMultiSelect.inputTooShort"],
            placeholder: resources["select_values_prompt"]
        };
        peObjectMultiSelect.contextDefaultOptions = {
            filter: {
                dropdownPosition: "absolute"
            },
            editor: {
                dropdownPosition: "inplace"
            },
            inline: {
                dropdownPosition: "inplace"
            }
        };
        peObjectMultiSelect.Events = {
            OPENED: PropertyEditorLookup.Events.OPENED,
            CLOSED: PropertyEditorLookup.Events.CLOSED,
            DATA_LOADED: PropertyEditorLookup.Events.DATA_LOADED,
            DATA_LOADING: PropertyEditorLookup.Events.DATA_LOADING,
            LOADED: PropertyEditorLookup.Events.LOADED,
            RESTRICTIONS_CHANGED: PropertyEditorLookup.Events.RESTRICTIONS_CHANGED,
            PROPERTY_LOADING: "propertyLoading",
            PROPERTY_LOADED: "propertyLoaded"
        };
        return peObjectMultiSelect;
    }(PropertyEditorLookup));
    peObjectMultiSelect.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: peObjectMultiSelect.defaultOptions,
        /** @obsolete use static Events */
        events: peObjectMultiSelect.Events
    });
    core.ui.peObjectMultiSelect = peObjectMultiSelect;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        if (propMd.many) {
            if (propMd.presentation === "select2" || propMd.presentation === "dropdown")
                return core.ui.peObjectMultiSelect;
        }
        return null;
    }, { vt: "object", priority: 30 });
    return peObjectMultiSelect;
});
//# sourceMappingURL=peObjectMultiSelect.js.map