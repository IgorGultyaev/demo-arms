/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/editor/ObjectWizardPresenterBase", "xhtmpl!lib/ui/templates/Wizard.hbs", "xcss!lib/ui/styles/objectWizard"], function (require, exports, core, ObjectWizardPresenterBase, wizardTemplate) {
    "use strict";
    var ObjectWizardPresenter = /** @class */ (function (_super) {
        __extends(ObjectWizardPresenter, _super);
        /**
         * @constructs ObjectWizardPresenter
         * @extends ObjectWizardPresenterBase
         * @param {Object} [options]
         */
        function ObjectWizardPresenter(options) {
            var _this = this;
            options = ObjectWizardPresenter.mixOptions(options, ObjectWizardPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ObjectWizardPresenter.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            that.breadcrumbs = that.container.find(".x-wizard-top-nav > .breadcrumb");
        };
        ObjectWizardPresenter.prototype.onReady = function () {
            var that = this, eventPublisher = that.viewModel && that.viewModel.app && that.viewModel.app.eventPublisher;
            if (eventPublisher && that.options.affixNavigation) {
                if (that.$topnav) {
                    eventPublisher.publish("ui.affix.remove_element", {
                        element: that.$topnav
                    });
                }
                that.$topnav = that.container.find(".x-wizard-top-nav");
                eventPublisher.publish("ui.affix.add_element", {
                    element: that.container.find(".x-wizard-top-nav"),
                    controlledBy: that.container.find(".x-editor-pages"),
                    affixTo: "top"
                });
            }
            _super.prototype.onReady.call(this);
        };
        ObjectWizardPresenter.prototype.unload = function (options) {
            var that = this, vm = that.viewModel;
            if (that.$topnav) {
                vm.app.eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$topnav
                });
            }
            _super.prototype.unload.call(this, options);
        };
        ObjectWizardPresenter.defaultOptions = {
            template: wizardTemplate
        };
        return ObjectWizardPresenter;
    }(ObjectWizardPresenterBase));
    core.ui.ObjectWizardPresenter = ObjectWizardPresenter;
    return ObjectWizardPresenter;
});
//# sourceMappingURL=ObjectWizardPresenter.js.map