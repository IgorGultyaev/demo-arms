/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "lib/ui/editor/ObjectWizardPresenterBase", "xhtmpl!lib/ui/templates/WizardStacked.hbs", "i18n!lib/nls/resources", "lib/ui/editor/ObjectWizard", "xcss!lib/ui/styles/objectWizardStacked"], function (require, exports, $, core, View, ObjectWizardPresenterBase, wizardStackedTemplate, resources, ObjectWizard) {
    "use strict";
    View.Handlebars.registerHelper("page-summary-brief", function (options) {
        var page = options.hash.page, presenter = options.hash.presenter, summary, summaryHtml = "";
        if (!page) {
            throw new Error("handlebars 'page-summary' helper: page is null");
        }
        if (!presenter) {
            throw new Error("handlebars 'page-summary' helper: presenter is null");
        }
        summary = presenter.viewModel.getPageSummary(page);
        if (presenter.formatPageSummaryBrief) {
            summaryHtml = presenter.formatPageSummaryBrief(summary);
        }
        return new View.Handlebars.SafeString(summaryHtml);
    });
    var ObjectWizardStackedPresenter = /** @class */ (function (_super) {
        __extends(ObjectWizardStackedPresenter, _super);
        /**
         * @constructs ObjectWizardStackedPresenter
         * @extends ObjectWizardPresenterBase
         * @param {Object} [options]
         */
        function ObjectWizardStackedPresenter(options) {
            var _this = this;
            options = ObjectWizardStackedPresenter.mixOptions(options, ObjectWizardStackedPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.topNavPages = new core.lang.ObservableCollection();
            _this.bottomNavPages = new core.lang.ObservableCollection();
            return _this;
        }
        ObjectWizardStackedPresenter.prototype.setViewModel = function (viewModel) {
            var that = this;
            _super.prototype.setViewModel.call(this, viewModel);
            if (viewModel) {
                that.hideTopNav = viewModel.pages.count() === 1 && viewModel.isLinear();
                viewModel.pages.bind("change", that._onNavChanged, that);
                viewModel.bind("change:currentPage", that._onNavChanged, that);
                that._onNavChanged();
            }
        };
        ObjectWizardStackedPresenter.prototype.formatPageSummaryBrief = function (summary) {
            var that = this, ret = "", options = that.options, strVal;
            if (options.formatPageSummaryBrief) {
                ret = options.formatPageSummaryBrief.call(this, summary);
            }
            else {
                summary.forEach(function (sv) {
                    ret && (ret += ",&nbsp;");
                    strVal = sv.value;
                    (strVal.length > options.summaryBriefValueMaxLen) &&
                        (strVal = strVal.slice(0, options.summaryBriefValueMaxLen) + "...");
                    ret += ("<span class='text-muted'>" + sv.title + ":&nbsp;</span><span>" + strVal + "</span>");
                });
            }
            return ret;
        };
        ObjectWizardStackedPresenter.prototype.formatPageSummary = function (summary) {
            var that = this, ret = "";
            if (that.options.formatPageSummary) {
                ret = that.options.formatPageSummary.call(this, summary);
            }
            else {
                if (summary.length) {
                    summary.forEach(function (sv) {
                        ret += "<div>";
                        ret += ("<span class='text-muted'>" + sv.title + ": </span>");
                        ret += sv.value;
                        ret += "</div>";
                    });
                }
                else {
                    ret += "<div class='row'><div class='col-md-12'>" + resources["objectWizard.pageSummary.noData"] + "</div></div>";
                }
            }
            return ret;
        };
        ObjectWizardStackedPresenter.prototype._initSummaryPopups = function () {
            var that = this;
            if (that.options.showPageSummaryPopup) {
                that.$domElement.find(".x-wizard-top-nav .list-group-item").not(".active").popover({
                    placement: "auto",
                    trigger: "hover",
                    html: true,
                    title: function () {
                        var pageName = $(this).attr("data-page"), page;
                        if (!pageName) {
                            return undefined;
                        }
                        page = that.viewModel.getPageByName(pageName);
                        return page.title;
                    },
                    content: function () {
                        var pageName = $(this).attr("data-page"), page;
                        if (!pageName) {
                            return "";
                        }
                        page = that.viewModel.getPageByName(pageName);
                        return that.formatPageSummary(that.viewModel.getPageSummary(page));
                    }
                });
            }
        };
        ObjectWizardStackedPresenter.prototype._onNavChanged = function () {
            var that = this, allPages = that.viewModel.pages.all(), currentPageIdx = allPages.indexOf(that.viewModel.currentPage());
            that.topNavPages.reset(allPages.slice(0, currentPageIdx));
            that.bottomNavPages.reset(allPages.slice(currentPageIdx + 1, allPages.length));
        };
        ObjectWizardStackedPresenter.prototype.activatePage = function (page) {
            var that = this, index, pages = that.viewModel.pages, 
            // there is no page in non linear wizard on first visit - create this
            pageSel = that.ensurePageContainer(page);
            page.render(pageSel);
            if (that.options.animatePageActivation) {
                pageSel.slideDown("fast");
            }
            else {
                pageSel.show();
            }
            return pageSel.promise().done(function () {
                index = pages.indexOf(page);
                if (index === -1) {
                    throw new Error("ObjectWizardStackedPresenter.activatePage: unknown page " + page.name || page.title);
                }
                that._initSummaryPopups();
                //that.renderSections(index);
                // restore hided errors container
                that.container.find(".x-editor-parts-container").show();
                that.notifyDOMChanged();
            });
        };
        ObjectWizardStackedPresenter.prototype.deactivatePage = function (page) {
            var that = this, pageContainer = that._getPageByName(page.name);
            // temporary hide errors container during animation
            that.container.find(".x-editor-parts-container").hide();
            if (that.options.animatePageActivation) {
                pageContainer.slideUp("fast");
            }
            else {
                pageContainer.hide();
            }
            return pageContainer.promise();
        };
        ObjectWizardStackedPresenter.prototype.dispose = function (options) {
            var that = this;
            that.viewModel.pages.unbind("change", null, that);
            that.viewModel.unbind("change:currentPage", null, that);
            that.topNavPages.dispose();
            that.bottomNavPages.dispose();
            _super.prototype.dispose.call(this, options);
        };
        ObjectWizardStackedPresenter.defaultOptions = {
            template: wizardStackedTemplate,
            /* maximum len of string value presentation in brief summary */
            summaryBriefValueMaxLen: 50,
            showPageSummaryPopup: true
        };
        return ObjectWizardStackedPresenter;
    }(ObjectWizardPresenterBase));
    ObjectWizardStackedPresenter.mixin({
        defaultOptions: ObjectWizardStackedPresenter.defaultOptions
    });
    ObjectWizard.defaultOptions.Presenter = ObjectWizardStackedPresenter;
    core.ui.ObjectWizardStackedPresenter = ObjectWizardStackedPresenter;
    return ObjectWizardStackedPresenter;
});
//# sourceMappingURL=ObjectWizardStackedPresenter.js.map