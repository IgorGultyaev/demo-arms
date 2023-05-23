/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/editor/ObjectEditorPresenterBase", "xhtmpl!lib/ui/templates/Editor.hbs", "xhtmpl!lib/ui/templates/Editor.tabs.hbs", "lib/ui/editor/ObjectEditor", "lib/ui/editor/ObjectFilter"], function (require, exports, $, core, ObjectEditorPresenterBase, tmplEditor, tmplTabs, ObjectEditor, ObjectFilter) {
    "use strict";
    var ObjectEditorPresenter = /** @class */ (function (_super) {
        __extends(ObjectEditorPresenter, _super);
        /**
         * @constructs ObjectEditorPresenter
         * @extends ObjectEditorPresenterBase
         * @param {Object} [options]
         */
        function ObjectEditorPresenter(options) {
            var _this = this;
            options = ObjectEditorPresenter.mixOptions(options, ObjectEditorPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ObjectEditorPresenter.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            that.container = $(domElement).children().first();
            if (that.viewModel.pages.count() > 1) {
                that._renderTabs();
            }
        };
        /**
         * Called by ObjectEditor after current page is shown.
         */
        ObjectEditorPresenter.prototype.onReady = function () {
            var that = this, editor = this.viewModel, app = editor.app;
            if (app && that.options.affixNavigation) {
                if (that.$tabs) {
                    app.eventPublisher.publish("ui.affix.remove_element", {
                        element: that.$tabs
                    });
                }
                that.$tabs = that.container.find(".x-editor-tabs");
                app.eventPublisher.publish("ui.affix.add_element", {
                    element: that.$tabs,
                    controlledBy: that.container.find(".x-editor-pages"),
                    affixTo: "top"
                });
            }
            _super.prototype.onReady.call(this);
        };
        ObjectEditorPresenter.prototype._renderTabs = function () {
            var that = this, $tabs = that.container.find(".x-editor-tabs");
            // Bootstrap's Tabs plugin needs tab links' 'data-target' attribute to contain jq-selector of the tab's content
            var onlyIconic = true;
            $tabs.find("li").each(function () {
                var $this = $(this), $anchor = $this.find("a"), pageName = $this.attr("data-page"), id;
                // bind tab with its content
                var pageContentSel = that.container.find(".x-editor-page[data-page='" + pageName + "']");
                if (pageContentSel.length) {
                    id = that._generatePageId(pageName);
                    pageContentSel[0].id = id;
                    $anchor.attr("data-target", "#" + id);
                }
                var page = that.viewModel.getPageByName(pageName);
                if (page) {
                    if (page.tab.presentation !== "icon") {
                        onlyIconic = false;
                    }
                    if ((page.tab.hint || page.tab.tooltip ||
                        (page.tab.presentation === "icon" && page.tab.title))) {
                        $this.tooltip({
                            title: page.tab.hint || page.tab.tooltip || page.tab.title,
                            html: true,
                            placement: "auto",
                            delay: { show: 500 },
                            trigger: "hover",
                            viewport: that.container
                        });
                    }
                    if (page.tab.cssClass) {
                        $this.addClass(page.tab.cssClass);
                    }
                    if (page.tab.badge) {
                        $("<span class='badge' style='display: inline;'>" + page.tab.badge + "</span>").appendTo($anchor);
                    }
                }
            });
            $tabs.on("click", "a", function (e) {
                e.preventDefault();
                var pageName = $(this).closest("li").attr("data-page");
                that.viewModel.switchToPage(pageName);
            });
            if (that.options.tabsPosition === "left") {
                //that.options.affixNavigation = false;
                var $pages = that.container.find(".x-editor-pages");
                var $content = that.container.find(".x-editor-tab-content");
                $pages.addClass("x-editor-pages--left-tabs");
                if (onlyIconic) {
                    $pages.addClass("x-editor-pages--left-tabs-narrow");
                }
                else if (that.options.tabsWidth) {
                    $tabs.css("width", that.options.tabsWidth + "px");
                    $content.css("margin-left", that.options.tabsWidth + "px");
                } // else if (that.options.autoWidth) {}
                // NOTE: если presentation=="both", то текст по умолчанию имеет responsive breakpoint hidden-xs (может быть переопределен)
                // Для hidden-xs лейбл скроется на ширине 767px, надо адаптировать ширины закладок соответствующим образом
                // Но делать это надо только, если breakpoint используется для всех табов.
                // Если хотя бы одна из закладок просто тест, то уменьшать ширину нельзя.
                // А раз ширину мы не уменьшаем, то и брейкоинты для других закладок бессмысленны - их надо удалить.
                var countXs_1 = 0;
                var countSm_1 = 0;
                var countMd_1 = 0;
                var countEmpty_1 = 0;
                var $labels = $tabs.find("> li > a > span:not(.x-icon)");
                $labels.each(function () {
                    var $this = $(this);
                    if ($this.hasClass("hidden-md")) {
                        countMd_1++;
                    }
                    else if ($this.hasClass("hidden-sm")) {
                        countSm_1++;
                    }
                    else if ($this.hasClass("hidden-xs")) {
                        countXs_1++;
                    }
                    else {
                        countEmpty_1++;
                    }
                });
                if (countEmpty_1 > 0) {
                    // если хотя бы одна закладка без брейкпоинта, удалим их для остальных
                    $labels.removeClass("hidden-xs hidden-sm hidden-md");
                }
                else if (countXs_1 > 0) {
                    $pages.addClass("x-editor-pages--left-tabs-narrow-xs");
                }
                else if (countSm_1 > 0) {
                    $pages.addClass("x-editor-pages--left-tabs-narrow-sm");
                }
                else if (countMd_1 > 0) {
                    $pages.addClass("x-editor-pages--left-tabs-narrow-md");
                }
                // make tab-content (page) to have min-height equals to height of tabs
                $content.css("min-height", $tabs.height() + "px");
            }
        };
        ObjectEditorPresenter.prototype._generatePageId = function (pageName) {
            return core.lang.uuid("page_" + pageName + "_");
        };
        ObjectEditorPresenter.prototype._getTabByName = function (name) {
            return this.container.find(".x-editor-tabs li[data-page='" + name + "']").first();
        };
        ObjectEditorPresenter.prototype.activatePage = function (page) {
            var that = this, app = that.viewModel.app, pageSel = that._getPageByName(page.name), tabSel = that._getTabByName(page.name);
            if (!pageSel.length) {
                throw new Error("ObjectEditorPresenter: page container was not found");
            }
            if (tabSel) {
                tabSel.addClass("active");
            }
            page.render(pageSel);
            pageSel.show();
            if (app) {
                that.notifyDOMChanged();
            }
        };
        ObjectEditorPresenter.prototype.deactivatePage = function (page) {
            var that = this, tabSel = that._getTabByName(page.name);
            tabSel.removeClass("active");
            return _super.prototype.deactivatePage.call(this, page);
        };
        ObjectEditorPresenter.prototype.unload = function (options) {
            var that = this, vm = that.viewModel;
            if (vm.app && that.options.affixNavigation && that.$tabs) {
                vm.app.eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$tabs
                });
            }
            _super.prototype.unload.call(this, options);
        };
        ObjectEditorPresenter.defaultOptions = {
            template: tmplEditor,
            unbound: true,
            hideMenu: false,
            affixNavigation: true,
            affixMenu: true,
            affixParts: true,
            menuCssClass: "x-menu-bar x-menu--contrast",
            tabsPosition: "top",
            partialTemplates: {
                tabs: tmplTabs
            }
        };
        return ObjectEditorPresenter;
    }(ObjectEditorPresenterBase));
    ObjectEditorPresenter.mixin({
        defaultOptions: ObjectEditorPresenter.defaultOptions
    });
    var ObjectFilterPresenter = /** @class */ (function (_super) {
        __extends(ObjectFilterPresenter, _super);
        /**
         * @constructs ObjectFilterPresenter
         * @extends ObjectEditorPresenter
         * @param {Object} options
         */
        function ObjectFilterPresenter(options) {
            var _this = this;
            options = ObjectFilterPresenter.mixOptions(options, ObjectFilterPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ObjectFilterPresenter.defaultOptions = {
            hideMenu: true,
            showTitle: false,
            affixNavigation: false,
            affixMenu: false,
            affixParts: false
        };
        return ObjectFilterPresenter;
    }(ObjectEditorPresenter));
    ObjectFilterPresenter.mixin({
        defaultOptions: ObjectFilterPresenter.defaultOptions
    });
    ObjectEditor.defaultOptions.Presenter = ObjectEditorPresenter;
    core.ui.ObjectEditorPresenter = ObjectEditorPresenter;
    ObjectFilter.defaultOptions.Presenter = ObjectFilterPresenter;
    core.ui.ObjectFilterPresenter = ObjectFilterPresenter;
    return ObjectEditorPresenter;
});
//# sourceMappingURL=ObjectEditorPresenter.js.map