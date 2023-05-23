/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/domain/support", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/ObjectComparePart.hbs", "i18n!lib/nls/resources"], function (require, exports, core, support, View, defaultTemplate, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectComparePart = /** @class */ (function (_super) {
        __extends(ObjectComparePart, _super);
        /**
         * @constructs ObjectComparePart
         * @extends View
         * @param options
         */
        function ObjectComparePart(options) {
            var _this = this;
            options = ObjectComparePart.mixOptions(options, ObjectComparePart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.title = _this.options.title;
            _this.hint = _this.options.hint;
            _this.hintSeverity = _this.options.hintSeverity || "info";
            _this.targetColumnTitle = _this.options.targetColumnTitle;
            _this.sourceColumnTitle = _this.options.sourceColumnTitle;
            _this.setViewModel();
            return _this;
        }
        ObjectComparePart.prototype.setViewModel = function () {
            var that = this;
            that._initLocal(that.options.local);
            that._initOriginal(that.options.original);
            that._initPropsModels();
        };
        ObjectComparePart.prototype._initLocal = function (data) {
            var that = this, localUow, local;
            // create local object
            if (data) {
                localUow = core.Application.current.createUnitOfWork();
                local = localUow.fromJson(data);
                that.local(local);
                return local;
            }
        };
        ObjectComparePart.prototype._initOriginal = function (data, id) {
            var that = this, originalUow, original;
            // create original object
            originalUow = core.Application.current.createUnitOfWork();
            if (id && data) {
                original = originalUow.get(data, id);
            }
            else if (data) {
                original = originalUow.fromJson(data);
            }
            that.original(original);
            return original;
        };
        ObjectComparePart.prototype.propHtml = function (obj, propMeta) {
            if (!obj || !obj.isLoaded || support.getPropRaw(obj, propMeta) === undefined) {
                return "";
            }
            if (!propMeta.many) {
                return lang.encodeHtml(obj.getFormatted(propMeta.name));
            }
            return obj.get(propMeta.name).all().map(function (o) {
                return lang.encodeHtml(o);
            }).join("<br/>");
        };
        ObjectComparePart.prototype._initPropsModels = function () {
            var that = this, local = that.local(), original = that.original(), props = [];
            // type and id
            if (that.options.showMetadata) {
                props.push(new ObjectComparePart.PropViewModelSimple(function (obj) { return obj.meta.name; }, "{type}"));
                props.push(new ObjectComparePart.PropViewModelSimple(function (obj) { return obj.id; }, "{id}"));
            }
            // domain props
            lang.forEach(local.meta.props, function (propMeta) {
                // ignore not loaded properties in original object
                if (support.getPropRaw(original, propMeta) === undefined) {
                    return;
                }
                props.push(new ObjectComparePart.PropViewModel(propMeta));
            });
            // set part for all props
            props.forEach(function (prop) {
                prop.part(that);
            });
            // sort
            props = lang.sort(props, function (propA, propB) {
                var isPropAEqual = propA.isPropEqual() ? 1 : 0, isPropBEqual = propB.isPropEqual() ? 1 : 0;
                return isPropAEqual - isPropBEqual;
            });
            that.props(new lang.ObservableCollection(props));
        };
        ObjectComparePart.defaultOptions = {
            template: defaultTemplate,
            hint: resources["objectResolution.info"],
            targetColumnTitle: resources["objectResolution.column.server_value"],
            sourceColumnTitle: resources["objectResolution.column.local_value"],
            hintSeverity: "info",
            showMetadata: false
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectComparePart.prototype, "local");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectComparePart.prototype, "original");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectComparePart.prototype, "props");
        return ObjectComparePart;
    }(View));
    ObjectComparePart.mixin(/** @lends ObjectComparePart.prototype */ {
        defaultOptions: ObjectComparePart.defaultOptions
    });
    (function (ObjectComparePart) {
        var PropViewModel = /** @class */ (function (_super) {
            __extends(PropViewModel, _super);
            /**
             * @constructs PropViewModel
             * @extends Observable
             * @param propMeta
             */
            function PropViewModel(propMeta) {
                var _this = _super.call(this) || this;
                if (propMeta) {
                    _this.meta = propMeta;
                    _this.title(propMeta.descr);
                }
                return _this;
            }
            PropViewModel.prototype.isPropEqual = function () {
                var part = this.part(), propMeta = this.meta, localRaw = support.getPropRaw(part.local(), propMeta), originalRaw = support.getPropRaw(part.original(), propMeta);
                return localRaw === undefined || originalRaw === undefined || lang.isEqual(localRaw, originalRaw);
            };
            PropViewModel.prototype.localHtml = function () {
                return this.getHtml(this.part().local());
            };
            PropViewModel.prototype.originalHtml = function () {
                return this.getHtml(this.part().original());
            };
            PropViewModel.prototype.getHtml = function (obj) {
                return this.part().propHtml(obj, this.meta);
            };
            return PropViewModel;
        }(lang.Observable));
        ObjectComparePart.PropViewModel = PropViewModel;
        var PropViewModelSimple = /** @class */ (function (_super) {
            __extends(PropViewModelSimple, _super);
            function PropViewModelSimple(getter, title) {
                var _this = _super.call(this) || this;
                _this.getter = getter;
                _this.title(title);
                return _this;
            }
            PropViewModelSimple.prototype.isPropEqual = function () {
                var part = this.part();
                return this.getter(part.local()) === this.getter(part.original());
            };
            PropViewModelSimple.prototype.getHtml = function (obj) {
                return this.getter(obj);
            };
            return PropViewModelSimple;
        }(PropViewModel));
        ObjectComparePart.PropViewModelSimple = PropViewModelSimple;
    })(ObjectComparePart || (ObjectComparePart = {}));
    ObjectComparePart.PropViewModel.mixin(/** @lends PropViewModel.prototype */ {
        /**
         * @observable-property {Part}
         */
        part: lang.Observable.accessor("part"),
        /**
         * @observable-property {String}
         */
        title: lang.Observable.accessor("title"),
        /**
         * @observable-property {Boolean}
         */
        checked: lang.Observable.accessor("checked")
    });
    core.ui.ObjectComparePart = ObjectComparePart;
    return ObjectComparePart;
});
//# sourceMappingURL=ObjectComparePart.js.map