/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "./ReportPresenterBase", "./ReportPagePart", "xhtmpl!modules/reporting/ui/templates/ReportPagePartPresenter.hbs", "lib/ui/menu/MenuPresenter"], function (require, exports, $, core, ReportPresenterBase, ReportPagePart, defaultTemplate) {
    "use strict";
    var ReportPagePartPresenter = /** @class */ (function (_super) {
        __extends(ReportPagePartPresenter, _super);
        /**
         * @constructs ReportPagePartPresenter
         * @extends ReportPresenterBase
         */
        function ReportPagePartPresenter(options) {
            var _this = this;
            options = ReportPagePartPresenter.mixOptions(options, ReportPagePartPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ReportPagePartPresenter.prototype.onReady = function () {
            var eventPublisher = core.Application.current.eventPublisher;
            if (this.$navbar) {
                eventPublisher.publish("ui.affix.remove_element", {
                    element: this.$navbar
                });
            }
            this.$navbar = $(".x-app-navbar");
            eventPublisher.publish("ui.affix.add_element", {
                element: this.$navbar,
                suspendByScreenWidth: 600,
                stuckBehaviors: [] // reset default behaviors
            });
            _super.prototype.onReady.call(this);
        };
        ReportPagePartPresenter.prototype.unload = function (options) {
            var that = this;
            _super.prototype.unload.call(this);
            if (that.$navbar) {
                core.Application.current.eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$navbar
                });
            }
        };
        ReportPagePartPresenter.defaultOptions = {
            template: defaultTemplate
        };
        return ReportPagePartPresenter;
    }(ReportPresenterBase));
    ReportPagePartPresenter.mixin({
        defaultOptions: ReportPagePartPresenter.defaultOptions
    });
    ///core.reporting.ReportPagePartPresenter = ReportPagePartPresenter;
    ReportPagePart.defaultOptions.Presenter = ReportPagePartPresenter;
    return ReportPagePartPresenter;
});
//# sourceMappingURL=ReportPagePartPresenter.js.map