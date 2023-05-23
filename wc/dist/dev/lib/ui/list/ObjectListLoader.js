/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils"], function (require, exports, core, utils) {
    "use strict";
    var ObjectListLoader = /** @class */ (function () {
        /**
         * @constructs ObjectListLoader
         * @param {Application} app
         * @param {Object} options
         * @param {DataSource} options.dataSource
         * @param {String} [options.entityType]
         * @param {Object} [options.loadPolicy]
         * @param {Boolean} [options.cancellable]
         * @param {UnitOfWork} [options.uow]
         * @param {Function} [options.onMaterialize]
         */
        function ObjectListLoader(app, options) {
            var that = this;
            that.app = app;
            that.options = options;
            that.dataSource = that.options.dataSource;
            if (!that.dataSource) {
                throw new Error("ObjectListLoader: option dataSource must be specified.");
            }
            that.entityType = that.options.entityType || that.dataSource.entityType;
            that.columns = that.dataSource.columns;
            that.uow = that.options.uow || that.app.createUnitOfWork();
        }
        ObjectListLoader.prototype.buildQuery = function (list, params) {
            var ds = this.dataSource;
            if (!ds.buildQuery) {
                throw new Error("DataSource does not implement buildQuery method");
            }
            return ds.buildQuery({ params: params });
        };
        ObjectListLoader.prototype.load = function (list, params) {
            var that = this, query = {
                params: params
            }, options = {
                opId: that.options.cancellable ? utils.generateGuid() : undefined,
                policy: that.options.loadPolicy
            };
            if (!that.dataSource) {
                return null;
            }
            that._reloadOpId = options.opId;
            that.onLoading(query, options);
            var task = that.dataSource.load(query, options);
            return task.then(function (dsResult) {
                that._reloadOpId = undefined;
                var items = that.onMaterialize(dsResult);
                return { items: items, hints: dsResult.hints };
            }, function (error) {
                that._reloadOpId = undefined;
                return that.onError(error);
            });
        };
        ObjectListLoader.prototype.cancel = function () {
            var that = this, opId = that._reloadOpId, ds = that.dataSource;
            if (opId && ds.cancel) {
                ds.cancel(opId);
                that._reloadOpId = undefined;
            }
        };
        ObjectListLoader.prototype.onLoading = function (query, options) {
            // TODO:
        };
        ObjectListLoader.prototype.onMaterialize = function (dsResult) {
            var that = this, items = that.uow.fromServerResponse(dsResult);
            if (that.options.onMaterialize) {
                var args = { items: items, dsResult: dsResult };
                that.options.onMaterialize.call(that, args);
                items = args.items;
            }
            return items;
        };
        ObjectListLoader.prototype.onError = function (error) {
            return error;
        };
        return ObjectListLoader;
    }());
    core.ui.ObjectListLoader = ObjectListLoader;
    return ObjectListLoader;
});
//# sourceMappingURL=ObjectListLoader.js.map