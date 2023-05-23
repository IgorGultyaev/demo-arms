/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./MasterDetailPartBase", "xhtmpl!lib/ui/templates/MasterDetailPart.hbs", "xcss!lib/ui/styles/masterDetailPart", "vendor/splitter/jquery.splitter", "xcss!vendor/splitter/css/jquery.splitter"], function (require, exports, core, MasterDetailPartBase, defaultTemplate) {
    "use strict";
    var MasterDetailPartList = /** @class */ (function (_super) {
        __extends(MasterDetailPartList, _super);
        function MasterDetailPartList(app, options) {
            var _this = this;
            options = MasterDetailPartList.mixOptions(options, MasterDetailPartList.defaultOptions);
            _this = _super.call(this, app, options) || this;
            return _this;
        }
        MasterDetailPartList.prototype.initMaster = function () {
            _super.prototype.initMaster.call(this);
            var that = this;
            if (that.masterPart)
                return;
            that.masterPart = core.ui.ObjectList.create(that.app, that.options.masterOptions || {});
            that.registerChild(that.masterPart, { keepOnUnload: true, trackStatus: true });
        };
        MasterDetailPartList.prototype.initDetail = function () {
            _super.prototype.initDetail.call(this);
            var that = this;
            if (that.detailPart)
                return;
            that.detailPart = core.ui.ObjectList.create(that.app, that.options.detailOptions || {});
            that.registerChild(that.detailPart, { keepOnUnload: true, trackStatus: true });
        };
        MasterDetailPartList.prototype.renderSplitter = function (domElement) {
            var that = this;
            if (that.options.affixMenu && !that.options.hideMenuRow && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.add_element", {
                    element: $(".x-list-master-detail > .x-list-menu-row-container", domElement),
                    controlledBy: $(".x-list-master-detail > .x-split", domElement),
                    affixTo: "bottom"
                });
            }
            _super.prototype.renderSplitter.call(this, domElement);
            that._affixPaging(domElement);
        };
        MasterDetailPartList.prototype.onSplitterDrag = function () {
            if (!!this.masterPart)
                this.masterPart.trigger("containerResize");
            if (!!this.detailPart)
                this.detailPart.trigger("containerResize");
            _super.prototype.onSplitterDrag.call(this);
        };
        MasterDetailPartList.prototype._affixPaging = function (domElement) {
            var _this = this;
            if (!this.options.affixPaging && !this.options.bottomPaging)
                return;
            var that = this;
            ["x-split-one", "x-split-two"].forEach(function (paneClass) {
                var $panel = $(".x-list-master-detail .x-split ." + paneClass, domElement), $pager = $(".x-list-paging", $panel), $pagerDiv = $(".x-split-pager", $panel), $content = $(".x-split-data", $panel), pagerHeight = $pager.outerHeight();
                if (!pagerHeight)
                    return;
                if (_this.options.bottomPaging) {
                    $pager.appendTo($pagerDiv);
                    $content.css("height", "calc(100% - " + pagerHeight + "px)");
                    $pager.addClass("x-split-paging-bottom");
                }
                if (_this.options.affixPaging) {
                    that.eventPublisher.publish("ui.affix.add_element", {
                        element: $pager,
                        controlledBy: $panel,
                        affixTo: "bottom"
                    });
                }
            });
        };
        MasterDetailPartList.prototype._removeAffixPaging = function () {
            var _this = this;
            if (!this.options.affixPaging && !this.options.bottomPaging)
                return;
            var that = this;
            ["x-split-one", "x-split-two"].forEach(function (paneClass) {
                var $pager = $(".x-list-master-detail .x-split ." + paneClass + " .x-list-paging", that.domElement);
                if (_this.options.affixPaging) {
                    that.eventPublisher.publish("ui.affix.remove_element", {
                        element: $pager
                    });
                }
                if (_this.options.bottomPaging) {
                    $pager.removeClass("x-split-paging-bottom");
                }
            });
        };
        MasterDetailPartList.prototype.unload = function (options) {
            var that = this;
            if (that.options.affixMenu && !that.options.hideMenuRow && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.remove_element", {
                    element: $(".x-list-master-detail > .x-list-menu-row-container", that.domElement)
                });
            }
            that._removeAffixPaging();
            _super.prototype.unload.call(this, options);
        };
        MasterDetailPartList.defaultOptions = {
            template: defaultTemplate,
            affixMenu: true,
            affixPaging: true,
            bottomPaging: true,
            hideMenuList: false,
            hideMenuRow: false,
            hideRowsStats: false,
            menuRowCssClass: "x-menu-bar x-menu--contrast",
            menuListCssClass: "x-menu-bar",
            masterOptions: {
                autoLoad: true,
                presenterOptions: {
                    templates: ["title", /*"menuList",*/ "hint", "data", "paging", "contextParts" /*, "menuRow"*/]
                }
            },
            detailOptions: {
                autoLoad: true,
                presenterOptions: {
                    templates: ["title", /*"menuList",*/ "hint", "data", "paging", "contextParts" /*, "menuRow"*/]
                }
            }
        };
        return MasterDetailPartList;
    }(MasterDetailPartBase));
    MasterDetailPartList.mixin(/** @lends MasterDetailPart.prototype */ {
        defaultOptions: MasterDetailPartList.defaultOptions
    });
    core.ui.MasterDetailPartList = MasterDetailPartList;
    return MasterDetailPartList;
});
//# sourceMappingURL=MasterDetailPartList.js.map