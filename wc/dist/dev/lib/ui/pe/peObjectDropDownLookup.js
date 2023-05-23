/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/pe/peDropDownLookup", "lib/data/DataSource", "xcss!lib/ui/styles/peObjectDropDownLookup"], function (require, exports, core, peDropDownLookup, DataSource) {
    "use strict";
    var peObjectDropDownLookup = /** @class */ (function (_super) {
        __extends(peObjectDropDownLookup, _super);
        /**
         * @constructs peObjectDropDownLookup
         * @extends peDropDownLookup
         * @param options
         */
        function peObjectDropDownLookup(options) {
            var _this = this;
            options = peObjectDropDownLookup.mixOptions(options, peObjectDropDownLookup.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peObjectDropDownLookup.prototype.createDataProvider = function () {
            var baseProvider = _super.prototype.createDataProvider.call(this);
            if (baseProvider) {
                return baseProvider;
            }
            var that = this, options = that.options, dataSource = options.dataSource;
            if (!dataSource) {
                var entityType = options.entityType || options.urlSuffix || (options.ref && options.ref.name);
                dataSource = new DataSource(that.app, { entityType: entityType });
            }
            var dataProvider = dataSource.isDomain ?
                new peObjectDropDownLookup.DomainDataProvider(that) :
                new peObjectDropDownLookup.JsonDataProvider(that);
            dataProvider.dataSource = dataSource;
            return dataProvider;
        };
        peObjectDropDownLookup.defaultOptions = {};
        return peObjectDropDownLookup;
    }(peDropDownLookup));
    peObjectDropDownLookup.mixin({
        defaultOptions: peObjectDropDownLookup.defaultOptions
    });
    core.ui.peObjectDropDownLookup = peObjectDropDownLookup;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.presentation === "dropdown" ? core.ui.peObjectDropDownLookup : null;
    }, { vt: "object" });
    return peObjectDropDownLookup;
});
//# sourceMappingURL=peObjectDropDownLookup.js.map