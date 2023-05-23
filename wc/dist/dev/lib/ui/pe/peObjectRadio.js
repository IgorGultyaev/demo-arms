/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/peObjectBase", "lib/data/DataSource", "lib/utils/ObservableCollectionView", "lib/utils", "lib/formatters", "i18n!lib/nls/resources", "lib/ui/pe/peLoadableMixin", "xcss!lib/ui/styles/peObjectRadio"], function (require, exports, $, core, peObjectBase, DataSource, ObservableCollectionView, utils, formatters, resources, peLoadableMixin) {
    "use strict";
    var lang = core.lang;
    var State = peLoadableMixin.State;
    var peObjectRadio = /** @class */ (function (_super) {
        __extends(peObjectRadio, _super);
        /**
         * @class peObjectRadio
         * @extends peObjectBase
         * @param options
         */
        function peObjectRadio(options) {
            var _this = this;
            options = peObjectRadio.mixOptions(options, peObjectRadio.defaultOptions);
            _this = _super.call(this, options) || this;
            var app = core.Application.current;
            _this.state(State.initial);
            _this._uow = options.uow;
            if (!_this._uow) {
                _this._uow = app.createUnitOfWork({ connected: true });
                _this._ownUow = true;
            }
            _this.items = new ObservableCollectionView();
            if (_this.options.orderBy) {
                _this.items.orderBy(_this.options.orderBy);
            }
            utils.subscribeOnEvents(_this, options, peObjectRadio.Events);
            if (_this.options.valueOptions) {
                _this.isDataLoaded = true;
                _this.items.reset(_this.options.valueOptions);
                _this._ensureJsonAdapter();
            }
            else {
                _this.isDataLoaded = false;
                _this.entityType = options.entityType || options.urlSuffix || _this.options.ref.name;
                if (!_this.entityType) {
                    throw new Error("peObjectRadio.ctor: nor options.entityType, options.urlSuffix or options.ref were specified.");
                }
                _this.dataSource = options.dataSource || DataSource.create(app, { entityType: _this.entityType });
                _this._domainDataSource = _this.dataSource.isDomain;
                if (!_this._domainDataSource) {
                    _this._ensureJsonAdapter();
                }
                // TODO: loading in ctor, really?
                _this.reload();
            }
            return _this;
        }
        peObjectRadio.prototype.reload = function () {
            var _this = this;
            var that = this, args = {};
            this.state(State.loading);
            return lang.async.chain().then(function () {
                that._onDataLoading(args);
                return _this.dataSource.load();
            })
                .then(function (dsResult) {
                if (_this.state() === State.disposed) {
                    return;
                }
                args.items = _this._domainDataSource ?
                    _this._uow.fromServerResponse(dsResult) :
                    dsResult.result;
                _this._onDataLoaded(args);
                if (that._rerenderScheduled) {
                    that._rerenderScheduled = false;
                    that.rerender();
                }
                _this.onLoaded();
            }).then(null, function (error) {
                if (core.eth.isCanceled(error)) {
                    // load was cancel - it's ok and not an error
                    return lang.resolved();
                }
                that._onFailed(error);
                return error;
            }).value();
        };
        peObjectRadio.prototype._ensureJsonAdapter = function () {
            var that = this;
            that.jsonAdapter = that.options.jsonAdapter;
            if (!that.options.jsonAdapter && (!that.options.displayField || !that.options.idField)) {
                throw new Error("peObjectRadio.ctor: plain(json) DataSource was specified but none of required options: jsonAdapter or displayField/idField");
            }
            if (!that.jsonAdapter) {
                that.jsonAdapter = {
                    getPresentation: function (value) {
                        return value ? value[that.options.displayField] : "";
                    },
                    getId: function (value) {
                        return value ? value[that.options.idField] : null;
                    }
                };
            }
            else {
                if (!core.lang.isFunction(that.jsonAdapter.getPresentation))
                    throw new Error("peObjectRadio.ctor: jsonAdapter should have getPresentation method");
                if (!core.lang.isFunction(that.jsonAdapter.getId))
                    throw new Error("peObjectRadio.ctor: jsonAdapter should have getId method");
            }
        };
        peObjectRadio.prototype._setItems = function (items) {
            this.items.reset(items);
        };
        peObjectRadio.prototype.onDataLoading = function (args) {
            this.trigger(peObjectRadio.Events.DATA_LOADING, this, args);
        };
        peObjectRadio.prototype.onDataLoaded = function (args) {
            this.trigger(peObjectRadio.Events.DATA_LOADED, this, args);
        };
        peObjectRadio.prototype.onLoaded = function () {
            this.trigger(peObjectRadio.Events.LOADED, this);
        };
        peObjectRadio.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            if (that.isDataLoaded) {
                that._renderLoaded(domElement);
            }
            else {
                that._renderLoading(domElement);
                that._rerenderScheduled = true;
            }
        };
        peObjectRadio.prototype.afterRender = function () {
            var that = this;
            if (!that.isDataLoaded) {
                that.renderStatus("waiting");
            }
            else {
                _super.prototype.afterRender.call(this);
            }
        };
        peObjectRadio.prototype._renderLoaded = function (domElement) {
            var that = this;
            var element = $("<div class='x-pe-object-radio'/>").appendTo(domElement);
            var groupName = that.options.name + "_" + (that.viewModel.id || utils.generateGuid());
            var isHorizontal = that.options.orientation === "horizontal";
            that.showNullValue = that.options.nullable && that.options.showNullValue;
            if (that.showNullValue) {
                $("<div></div>")
                    .addClass(isHorizontal ? "radio-inline" : "radio")
                    .append($("<label />")
                    .append($("<input />", { type: "radio", value: "", name: groupName }))
                    .append(that.options.nullValueText))
                    .appendTo(element);
            }
            that.items.forEach(function (opt) {
                $("<div></div>")
                    .addClass(isHorizontal ? "radio-inline" : "radio")
                    .append($("<label />")
                    .append($("<input />", { type: "radio", value: that._getOptionId(opt), name: groupName }))
                    .append(that._getOptionTitle(opt).toString()))
                    .appendTo(element);
            });
            // принудительное фокусирование батона при клике мышкой
            element.bind("click", function (e) {
                if (e.target.tagName === "INPUT") {
                    $(e.target).focus();
                }
            });
            var bindable = {
                get: function () {
                    var v = element.find("input:checked").val();
                    return v !== undefined ? v : null;
                },
                set: function (v) {
                    if (v != null) {
                        element.find("input[value='" + v.id + "']").prop("checked", true);
                    }
                    else if (that.showNullValue) {
                        element.find("input[value='']").prop("checked", true);
                    }
                    else {
                        element.find("input:checked").prop("checked", false);
                    }
                },
                onchange: function (handler) {
                    // когда обновляется значение
                    if (that.options.changeTrigger === "keyPressed") {
                        // перемещение по группе (ползаем стрелками и перемещаем фокус)
                        element.find("input").bind("change", handler);
                    }
                    else {
                        // уходим из группы радиобатонов
                        that.element.focusout(function () {
                            window.setTimeout(function () {
                                $("[id*='" + that.id + "']").is($(document.activeElement)) || handler();
                            }, 200);
                        });
                    }
                    return {
                        dispose: function () {
                            element.find("input").unbind("change", handler);
                        }
                    };
                }
            };
            that.element = element;
            that.databind(bindable);
        };
        peObjectRadio.prototype._renderLoading = function (domElement) {
            $("<div class='x-pe-object-radio'><div class='" + core.ui.getWaitingIconClass(32) + "'></div></div>").appendTo(domElement);
        };
        peObjectRadio.prototype._getOptionTitle = function (obj) {
            var that = this;
            return that._domainDataSource ?
                formatters.formatPropValue(that.options, obj) :
                that.jsonAdapter.getPresentation(obj);
        };
        peObjectRadio.prototype._getOptionId = function (obj) {
            return this._domainDataSource ? obj.id : this.jsonAdapter.getId(obj);
        };
        peObjectRadio.prototype.focus = function () {
            if (this.element) {
                var input = this.element.find("input");
                var checked = input.filter(":checked");
                var target = checked[0] || input[0];
                if (target) {
                    $(target).focus();
                }
            }
        };
        peObjectRadio.prototype.dispose = function (options) {
            var that = this;
            that.items.dispose();
            if (that._ownUow && that._uow) {
                that._uow.dispose();
            }
            _super.prototype.dispose.call(this, options);
            that.state(State.disposed);
        };
        peObjectRadio.defaultOptions = {
            orientation: "vertical",
            changeTrigger: "keyPressed",
            nullValueText: resources["not_specified"],
            showNullValue: true
        };
        /**
         * @enum {String}
         */
        peObjectRadio.Events = {
            DATA_LOADING: "dataLoading",
            DATA_LOADED: "dataLoaded",
            LOADED: "loaded"
        };
        return peObjectRadio;
    }(peObjectBase));
    peObjectRadio.mixin(peLoadableMixin);
    // backward compatibility: access to static fields via prototype
    peObjectRadio.mixin(/** @lends peObjectRadio.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peObjectRadio.defaultOptions,
        /** @obsolete use static State */
        states: State,
        /** @obsolete use static Events */
        events: peObjectRadio.Events
    });
    core.ui.peObjectRadio = peObjectRadio;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.presentation === "radio" ? core.ui.peObjectRadio : null;
    }, { vt: "object" });
    return peObjectRadio;
});
//# sourceMappingURL=peObjectRadio.js.map