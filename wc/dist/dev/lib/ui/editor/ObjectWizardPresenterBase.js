/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/ui/editor/ObjectEditorPresenterBase", "xcss!lib/ui/styles/objectWizardCommon"], function (require, exports, $, ObjectEditorPresenterBase) {
    "use strict";
    var ObjectWizardPresenterBase = /** @class */ (function (_super) {
        __extends(ObjectWizardPresenterBase, _super);
        //secContainer: JQuery;
        /**
         * @constructs ObjectWizardPresenterBase
         * @extends ObjectEditorPresenterBase
         * @param {Object} [options]
         */
        function ObjectWizardPresenterBase(options) {
            var _this = this;
            options = ObjectWizardPresenterBase.mixOptions(options, ObjectWizardPresenterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ObjectWizardPresenterBase.prototype.doRender = function (domElement) {
            var that = this, menuPage = that.viewModel.menuPage;
            _super.prototype.doRender.call(this, domElement);
            that.container = $(domElement).find(".x-editor-wizard");
            //that.renderSections(0);
            if (menuPage) {
                $(domElement).on("keyup", function (e) {
                    return !menuPage.executeHotkey(e);
                });
            }
        };
        ObjectWizardPresenterBase.prototype.activatePage = function (page) {
            var that = this, index, pages = that.viewModel.pages, 
            // страница нелинейного мастера когда на неё заходят первый раз не имеет контейнера. нужно создать.
            pageSel = that.ensurePageContainer(page);
            page.render(pageSel);
            pageSel.show();
            index = pages.indexOf(page);
            if (index === -1) {
                throw new Error("ObjectWizardPresenterBase.activatePage: unknown page " + page.name || page.title);
            }
            //that.renderSections(index);
            that.notifyDOMChanged();
        };
        /**
         * Return page number. Function is used by template
         * @param {Object} page - wizard page
         * @returns {number} page number
         */
        ObjectWizardPresenterBase.prototype.pageNumber = function (page) {
            var that = this;
            return that.viewModel.pages.all().indexOf(page) + 1;
        };
        ObjectWizardPresenterBase.prototype.ensurePageContainer = function (page) {
            var that = this, pageSel = that._getPageByName(page.name);
            if (!pageSel.length) {
                pageSel = $("<div class='x-editor-page' style='display:none;'></div>").
                    insertAfter(that.container.find(".x-editor-page").last());
                pageSel.attr("data-page", page.name);
            }
            return pageSel;
        };
        ObjectWizardPresenterBase.defaultOptions = {
            unbound: true
        };
        return ObjectWizardPresenterBase;
    }(ObjectEditorPresenterBase));
    return ObjectWizardPresenterBase;
});
//# sourceMappingURL=ObjectWizardPresenterBase.js.map