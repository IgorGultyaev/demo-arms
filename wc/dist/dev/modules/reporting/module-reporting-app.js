/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./module-reporting"], function (require, exports, core, reporting) {
    "use strict";
    exports.__esModule = true;
    var Application = /** @class */ (function (_super) {
        __extends(Application, _super);
        /**
         * constructs Application
         * @extends Application
         * @article [App-Module](docs:app-module)
         * @param {XConfig} xconfig
         * @param {Object} reportModel
         */
        function Application(xconfig, reportModel) {
            var _this = this;
            // change options for breadcrumbs module
            xconfig = core.lang.appendEx(xconfig, { modules: { breadcrumbs: Application.breadcrumbsConfig } }, { deep: true });
            // TODO: use root instead?
            xconfig.startPath = document.location.pathname;
            //xconfig.root = document.location.pathname;
            _this = _super.call(this, xconfig) || this;
            _this.pageModel = reportModel;
            return _this;
        }
        Application.prototype.initialize = function () {
            var that = this, reportName = that.pageModel.reportName, states = {};
            that.registerPart("ReportPagePart", function (options) {
                return new reporting.ReportPagePart(that, options);
            });
            // NOTE: we're using report's name as Area's state name,
            // it's important as the state is already in the page url (/display/report/{reportName})
            var areaReport = that.areaManager.getArea("");
            var region = areaReport.regionManager.getNavigableRegion();
            var regionName = region ? region.name : "mainRegion";
            states[regionName] = "ReportPagePart:" + reportName;
            areaReport.addState({ name: reportName }, states);
        };
        Application.prototype.onUnknownArea = function (areaName) {
            return _super.prototype.onUnknownArea.call(this, "report");
        };
        Application.breadcrumbsConfig = {
            excludeArea: true,
            excludeAreaState: true,
            excludeLastPart: true,
            excludeRegionState: true
        };
        return Application;
    }(core.Application));
    exports.Application = Application;
    reporting.Application = Application;
});
//# sourceMappingURL=module-reporting-app.js.map