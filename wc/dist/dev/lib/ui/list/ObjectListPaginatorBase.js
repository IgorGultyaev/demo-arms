/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "lib/ui/list/List", "lib/ui/menu/Menu", "i18n!lib/nls/resources", "lib/ui/list/.list.types"], function (require, exports, core, View, List, Menu, resources, _list_types_1) {
    "use strict";
    var lang = core.lang;
    var ObjectListPaginatorBase = /** @class */ (function (_super) {
        __extends(ObjectListPaginatorBase, _super);
        /**
         * Base class for ObjectList's paginators
         * @constructs ObjectListPaginatorBase
         * @extends View
         * @param options
         */
        function ObjectListPaginatorBase(options) {
            return _super.call(this, options) || this;
        }
        /**
         * Parent list
         * @observable-property {ObjectList}
         */
        ObjectListPaginatorBase.prototype.list = function (v) {
            if (!arguments.length) {
                return ObjectListPaginatorBase._get(this, "list");
            }
            var changeArgs = ObjectListPaginatorBase._set(this, "list", v);
            if (changeArgs) {
                this._onListChanged(v, changeArgs.oldValue);
            }
        };
        /**
         * @protected
         * @virtual
         * @returns {Menu}
         */
        ObjectListPaginatorBase.prototype.createMenu = function () {
            return new Menu(this.options.menu);
        };
        ObjectListPaginatorBase.prototype._onListChanged = function (list, old) {
            this._uninit(old);
            this._init(list);
        };
        ObjectListPaginatorBase.prototype._init = function (list) {
            if (!list) {
                return;
            }
            var that = this;
            that.pageSize = that.options.pageSize || 0;
            that.commands = that.createCommands();
            that.menu = that.createMenu();
            that.menu.bindToPart(that, { list: list, paginator: that });
            list.bind(List.events.DATA_LOADING, that._onDataLoading, that);
            list.bind(List.events.DATA_LOADED, that._onDataLoaded, that);
            list.bind("change:state", that._onListStateChanged, that);
        };
        ObjectListPaginatorBase.prototype._uninit = function (list) {
            if (!list) {
                return;
            }
            var that = this;
            list.unbind(List.events.DATA_LOADING, null, that);
            list.unbind(List.events.DATA_LOADED, null, that);
            list.unbind("change:state", null, that);
        };
        ObjectListPaginatorBase.prototype._onListStateChanged = function (list, state) {
            if (state === _list_types_1.ObjectListState.initial) {
                this.hasMoreItems(false);
            }
        };
        ObjectListPaginatorBase.prototype._onDataLoading = function (list, args) {
            if (args === void 0) { args = {}; }
            var that = this, params;
            if (that.pageSize) {
                params = args.params || (args.params = {});
                params.$top = params.$top || that.pageSize;
            }
        };
        ObjectListPaginatorBase.prototype._onDataLoaded = function (list, args) {
            if (args === void 0) { args = {}; }
            var that = this, params = args.params || {}, hints = args.hints || {}, items = args.items || [], hasNext = hints.hasNext;
            if (hasNext == null && params.$top > 0) {
                hasNext = items.length === params.$top;
            }
            that._hasNext = hasNext;
            if (hints.paging || that.options.force) {
                that._loadParams = params;
                that._top = Math.min(hints.maxObjects || 1 / 0, that.pageSize || params.$top || items.length);
                that.message(undefined);
            }
            else {
                that._loadParams = undefined;
                that._top = undefined;
                that.message(hasNext ? lang.stringFormat(resources["objectList.maxRowsExceeded"], items.length) : undefined);
            }
        };
        ObjectListPaginatorBase.prototype.dispose = function (options) {
            var list = this.list();
            this._uninit(list);
            _super.prototype.dispose.call(this, options);
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPaginatorBase.prototype, "skippedItems");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ObjectListPaginatorBase.prototype, "hasMoreItems");
        __decorate([
            lang.decorators.observableAccessor()
        ], ObjectListPaginatorBase.prototype, "message");
        return ObjectListPaginatorBase;
    }(View));
    core.ui.ObjectListPaginatorBase = ObjectListPaginatorBase;
    return ObjectListPaginatorBase;
});
//# sourceMappingURL=ObjectListPaginatorBase.js.map