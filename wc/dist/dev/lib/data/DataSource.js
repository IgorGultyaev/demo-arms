/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core"], function (require, exports, core) {
    "use strict";
    var lang = core.lang;
    var DataSource = /** @class */ (function (_super) {
        __extends(DataSource, _super);
        /**
         * @constructs DataSource
         * @article [DataSource](docs:datasource)
         * @param {Application} app
         * @param {Object} options
         * @param {String} options.name DataSource's name, it is also used as entityType's name if it isn't specified
         * @param {String} options.entityType EntityType's name
         * @param {String|Array} [options.preloads]
         * @param {String|Array} [options.orderBy] Requests objects in specific order. Each element of array is a property name with optional ' asc' or ' desc'.
         * E.g. ["created desc", "title"] or "created desc, title".
         * @param {Boolean} [options.supportQuery] server controller supports querying (uses UnitOfWork.QueryObjects facilities)
         * @param {Boolean} [options.isDomain] Indicates that DataSource returns domain objects data. This options is ignored if 'supportQuery' or 'entityType' options are specified.
         * @param {Array} [options.columns] Array of columns descriptions
         * @param {Object} [options.params] static parameters for DataFacade.load
         */
        function DataSource(app, options) {
            var _this = _super.call(this) || this;
            var that = _this, orderBy, entityType;
            options = options || {};
            that.app = app;
            that.name = options.name || options.entityType;
            that.supportQuery = options.supportQuery;
            that.preloads = options.preloads;
            that.columns = options.columns || [];
            that.params = options.params || {};
            orderBy = options.orderBy;
            if (orderBy) {
                that.params.$orderby = lang.isArray(orderBy) ? orderBy.join(",") : orderBy;
            }
            entityType = (options.entityType && app.model.meta.entities[options.entityType]) ||
                (options.name && app.model.meta.entities[options.name]);
            if (entityType) {
                that.entityType = entityType.name;
                if (options.supportQuery !== false) {
                    // by default, a DS with name equals to entityType or unnamed is treated as 'domain ds' (i.e. supports querying)
                    if (!options.name || options.name === that.entityType) {
                        that.supportQuery = true;
                    }
                }
            }
            // by default isDomain = true
            that.isDomain = !!lang.coalesce(options.isDomain, true);
            if (options.columns) {
                if (!Array.isArray(options.columns)) {
                    throw new Error("DataSource: options.columns should be Array");
                }
                // enrich columns with props attributes
                if (entityType) {
                    lang.forEach(that.columns, function (column) {
                        var prop;
                        if (column.name) {
                            prop = entityType.props[column.name];
                            if (prop) {
                                if (!column.title) {
                                    column.title = prop.descr;
                                }
                                if (!column.vt) {
                                    column.vt = prop.vt;
                                }
                            }
                        }
                    });
                }
            }
            else if (that.supportQuery && entityType) {
                // no columns, but domain ds
                lang.forEach(entityType.props, function (prop) {
                    // dy default we'll skip binary and array props
                    if (prop.vt !== "binary" && !prop.many) {
                        that.columns.push({
                            name: prop.name,
                            title: prop.descr,
                            vt: prop.vt
                        });
                    }
                });
            }
            return _this;
        }
        DataSource.prototype._prepareParams = function (json) {
            if (!this.supportQuery || !json) {
                return json;
            }
            var params = {}, filter = json.$filter || {};
            lang.forEach(json, function (v, name) {
                // service params starts with $, don't wrap them in $filter
                if (lang.stringStartsWith(name, "$")) {
                    params[name] = v;
                }
                else {
                    filter[name] = v;
                }
            });
            if (!lang.isEmpty(filter)) {
                params.$filter = filter;
            }
            return params;
        };
        DataSource.prototype.buildQuery = function (querySpec) {
            var that = this, query = lang.extend({
                source: that.name,
                type: that.entityType,
                preloads: that.preloads
            }, querySpec);
            if (!that.isDomain && !query.route) {
                query.route = "_plain";
            }
            query.params = that._prepareParams(lang.extendEx({}, that.params, querySpec.params, { deep: true }));
            return query;
        };
        /**
         * Load data via DataFacade.
         * @param {Object} [query] see `DataFacade.load` (query.params will be combined with current DataSource's restrictions in 'params' field)
         * @param {Object} [options] options for DataFacade.load method.
         * @returns {Promise} An object with result field
         */
        DataSource.prototype.load = function (query, options) {
            var that = this;
            query = query || {};
            if (arguments.length === 3 || lang.isString(arguments[1])) {
                // old API: ([object]params, [string]opId, [object]options)
                return that._loadOld.apply(that, arguments);
            }
            else if (query.hasOwnProperty("params") || query.hasOwnProperty("preloads")) {
                // new API (since 0.11): ([object]query, [object]options)
                return that._load(query, options);
            }
            else if (arguments.length === 2 && lang.isObject(options)) {
                // new API (since 0.11): ([object]query, [object]options), but query is empty
                return that._load(query, options);
            }
            else {
                // old API: (params, opId, options)
                return that._loadOld.apply(that, arguments);
            }
        };
        DataSource.prototype._load = function (querySpec, options) {
            var that = this, query = that.buildQuery(querySpec);
            return that.app.dataFacade.load(query, options);
        };
        DataSource.prototype._loadOld = function (params, opId, options) {
            // TODO: remove in future versions
            var that = this, querySpec = { params: params }, query = that.buildQuery(querySpec);
            options = lang.extend({ opId: opId }, options);
            return that.app.dataFacade.load(query, options);
        };
        /**
         * Initialize cancellation of load via DataFacade.cancel.
         * @param {String} opId Identified (guid) of operation to cancel
         * @returns {Promise}
         */
        DataSource.prototype.cancel = function (opId) {
            return this.app.dataFacade.cancel(opId);
        };
        return DataSource;
    }(lang.CoreClass));
    core.data = core.data || {};
    core.data.DataSource = DataSource;
    return DataSource;
});
//# sourceMappingURL=DataSource.js.map