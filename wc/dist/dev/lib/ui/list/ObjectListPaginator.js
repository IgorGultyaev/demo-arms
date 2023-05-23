/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/list/ObjectListPaginatorBase", "xhtmpl!lib/ui/templates/ObjectListPaginator.hbs", "i18n!lib/nls/resources"], function (require, exports, core, ObjectListPaginatorBase, template, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectListPaginator = /** @class */ (function (_super) {
        __extends(ObjectListPaginator, _super);
        /**
         * Paginator for ObjectList for mode 'throttle' (with command 'LoadMore')
         * @constructs ObjectListPaginator
         * @extends ObjectListPaginatorBase
         * @param options
         */
        function ObjectListPaginator(options) {
            var _this = this;
            options = ObjectListPaginator.mixOptions(options, ObjectListPaginator.prototype.defaultOptions);
            options.mode = "throttle";
            _this = _super.call(this, options) || this;
            return _this;
        }
        /**
         * @protected
         * @virtual
         * @returns {Object.<String,ICommand>}
         */
        ObjectListPaginator.prototype.createCommands = function () {
            var that = this;
            return {
                LoadMore: new core.commands.BoundCommand(that.doLoadMore, that.canLoadMore, that)
            };
        };
        ObjectListPaginator.prototype.doLoadMore = function (args) {
            if (args === void 0) { args = {}; }
            var that = this, pageParams = {
                $skip: (that._loadParams.$skip || 0) + that._top,
                $top: that._top
            };
            args.params = lang.append(args.params || {}, pageParams, that._loadParams);
            return that.list().loadMore(args);
        };
        ObjectListPaginator.prototype.canLoadMore = function () {
            var that = this;
            return !that.list().isLoading() && that._hasNext && that._loadParams && that._top > 0;
        };
        ObjectListPaginator.prototype._onDataLoaded = function (list, args) {
            _super.prototype._onDataLoaded.call(this, list, args);
            this.hasMoreItems(!!this._hasNext);
        };
        return ObjectListPaginator;
    }(ObjectListPaginatorBase));
    ObjectListPaginator.mixin({
        defaultOptions: {
            template: template,
            pageSize: 100,
            menu: { items: [
                    {
                        name: "LoadMore",
                        html: function () {
                            var that = this.params.paginator, // the parameter `paginator` is specified while initialization of the menu
                            title = that.pageSize > 0 ? lang.stringFormat(resources.loadNMore, that.pageSize) : resources.loadMore;
                            return lang.encodeHtml(title);
                        },
                        isDefaultAction: true,
                        hideIfDisabled: true
                        //}, {
                        //	name: "LoadAll",
                        //	title: resources.loadAll,
                        //	hideIfDisabled: true,
                        //	commandName: "LoadMore",
                        //	params: { // command params
                        //		params: { $top: -1 } // load params
                        //	}
                    }
                ] }
        }
    });
    core.ui.ObjectListPaginator = ObjectListPaginator;
    return ObjectListPaginator;
});
//# sourceMappingURL=ObjectListPaginator.js.map