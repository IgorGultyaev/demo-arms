/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "./ReportPresenterBase", "./ReportPart", "xhtmpl!modules/reporting/ui/templates/ReportPartPresenter.hbs", "lib/ui/ExpandablePanel"], function (require, exports, ReportPresenterBase, ReportPart, defaultTemplate) {
    "use strict";
    var ReportPartPresenter = /** @class */ (function (_super) {
        __extends(ReportPartPresenter, _super);
        /**
         * @constructs ReportPartPresenter
         * @extends ReportPresenterBase
         */
        function ReportPartPresenter(options) {
            var _this = this;
            options = ReportPartPresenter.mixOptions(options, ReportPartPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ReportPartPresenter.defaultOptions = {
            template: defaultTemplate
        };
        return ReportPartPresenter;
    }(ReportPresenterBase));
    ReportPartPresenter.mixin({
        defaultOptions: ReportPartPresenter.defaultOptions
    });
    //core.reporting.ReportPartPresenter = ReportPartPresenter;
    ReportPart.defaultOptions.Presenter = ReportPartPresenter;
    return ReportPartPresenter;
});
//# sourceMappingURL=ReportPartPresenter.js.map