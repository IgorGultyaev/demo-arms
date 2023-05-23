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
    var TreeDataSource = /** @class */ (function (_super) {
        __extends(TreeDataSource, _super);
        /**
         * @constructs TreeDataSource
         * @param {Application} app
         * @param {Object} options
         */
        function TreeDataSource(app, options) {
            var _this = _super.call(this) || this;
            _this.app = app;
            options = options || {};
            _this.name = options.name;
            _this.params = options.params;
            return _this;
        }
        TreeDataSource.prototype.loadChildren = function (nodePath, params, options) {
            var that = this;
            if (!that.name) {
                throw new Error("TreeDataSource: name was not specified");
            }
            var url = "api/_tree/" + that.name;
            // skip ROOT node
            var urlPath = nodePath.slice(1)
                .map(function (identity) {
                var s = identity.type;
                return identity.id ? s + "(" + identity.id + ")" : s;
            }).join("/");
            if (urlPath.length) {
                url += "?node=" + urlPath;
            }
            // params
            var data = that.preprocessParams(lang.extend({}, that.params, params));
            if (options && options.opId) {
                data.$opId = options.opId;
            }
            return that.app.dataFacade.ajax({
                url: url,
                data: data
            }, {
                supportsGetPost: true
            });
        };
        TreeDataSource.prototype.preprocessParams = function (json) {
            return json;
        };
        /**
         * Initialize cancellation of load via DataFacade.cancel.
         * @param {String} opId Identified (guid) of operation to cancel
         * @returns {Promise}
         */
        TreeDataSource.prototype.cancel = function (opId) {
            return this.app.dataFacade.cancel(opId);
        };
        return TreeDataSource;
    }(lang.CoreClass));
    core.data = core.data || {};
    core.data.TreeDataSource = TreeDataSource;
    return TreeDataSource;
});
//# sourceMappingURL=TreeDataSource.js.map