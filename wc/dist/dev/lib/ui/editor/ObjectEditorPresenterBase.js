/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "lib/ui/WaitingModal", "lib/ui/validation/ContextPartCarousel", "i18n!lib/nls/resources", "lib/ui/menu/MenuPresenter", "xcss!lib/ui/styles/objectEditor", "xcss!lib/ui/styles/contextParts"], function (require, exports, $, core, View, WaitingModal, ContextPartCarousel, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectEditorPresenterBase = /** @class */ (function (_super) {
        __extends(ObjectEditorPresenterBase, _super);
        /**
         * @constructs ObjectEditorPresenterBase
         * @extends View
         * @param {Object} options
         */
        function ObjectEditorPresenterBase(options) {
            var _this = this;
            options = ObjectEditorPresenterBase.mixOptions(options, ObjectEditorPresenterBase.defaultOptions);
            // NOTE: core.ui.clipboard may be not initialized yet when defaultOptions are initializing.
            // Therefore we should initialize `showCopy` here.
            options.showCopy = lang.coalesce(options.showCopy, core.ui.clipboard && core.ui.clipboard.isSupported);
            _this = _super.call(this, options) || this;
            _this.partsCarousel = new ContextPartCarousel();
            _this.partsCarousel.bind("moved", function () {
                _this._activateViolation(_this.partsCarousel.currentViolation());
            });
            _this.container = null; // it's editor root DOMElement
            if (_this.options.hideMenu) {
                _this.options.affixMenu = false;
            }
            return _this;
        }
        ObjectEditorPresenterBase.prototype.applyHostContext = function (opt) {
            _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, ObjectEditorPresenterBase.hostDefaultOptions);
            return null;
        };
        ObjectEditorPresenterBase.prototype.setViewModel = function (viewModel) {
            _super.prototype.setViewModel.call(this, viewModel);
            if (viewModel) {
                var that = this;
                that.eventPublisher = viewModel.app.eventPublisher;
                that.partsCarousel.items().source(viewModel.contextParts);
                if (that.viewModel.userSettings) {
                    that.viewModel.userSettings.attach("contextParts", that.partsCarousel.userSettings);
                }
            }
        };
        ObjectEditorPresenterBase.prototype.beforeRender = function (domElement) {
            if (this.options.affixParts) {
                this.partsCarousel.initAffix(domElement, ".x-editor-pages");
            }
            _super.prototype.beforeRender.call(this, domElement);
        };
        ObjectEditorPresenterBase.prototype.canRenderInitialization = function () {
            return this.options.canRenderInitialization !== undefined ? this.options.canRenderInitialization : false;
        };
        ObjectEditorPresenterBase.prototype.doRender = function (domElement) {
            var that = this;
            var promise = that.viewModel.initializationTask;
            if (promise && promise.state() === "pending") {
                if (that.canRenderInitialization()) {
                    _super.prototype.doRender.call(this, domElement);
                }
                else {
                    that.$domElement = $(domElement);
                    that.domElement = that.$domElement[0];
                    var markup = that.options.waitingTemplate({ text: that.options.loadingText });
                    $(domElement).html(markup.toString());
                }
            }
            else {
                _super.prototype.doRender.call(this, domElement);
            }
        };
        /**
         * Called by ObjectEditor in its render method.
         */
        ObjectEditorPresenterBase.prototype.afterRender = function () {
            var that = this, $container = that.container, // must be set by child classes in `doRender`
            menu = that.viewModel.menu;
            _super.prototype.afterRender.call(this);
            that.viewModel.bind("change:isBusy", that._onBusyChanged, that);
            var $carousel = that.partsCarousel.$domElement;
            if ($carousel) {
                $carousel.on("click", ".x-context-part", function (e) {
                    e.preventDefault();
                    that._activateViolation(that.partsCarousel.currentViolation());
                });
            }
            $container.on("focusin", ".x-pe-container.-invalid", function (e) {
                var $container = $(e.currentTarget), page = that.viewModel.currentPage(), presenter = page.presenter, pe = presenter && presenter.findContainerPE && presenter.findContainerPE($container);
                if (!pe) {
                    return;
                }
                lang.some(that.partsCarousel.items().all(), function (part, i) {
                    var v = part.violation;
                    if (v && v.pageName === page.name &&
                        v.object &&
                        v.props && v.props.length && v.props.indexOf(pe.viewModelProp) >= 0) {
                        that.partsCarousel.position(i);
                        return true;
                    }
                });
            });
            if (menu) {
                $container.on("keyup", function (e) {
                    return !menu.executeHotkey(e);
                });
            }
            if (that.options.showCopy) {
                var $btnCopy = $container.find(".btn-copy");
                if ($btnCopy.length) {
                    that._clipboardBtn = new core.ui.clipboard.CopyButton($btnCopy[0], {
                        text: function () {
                            if (that.viewModel.getTextPresentation) {
                                return that.viewModel.getTextPresentation();
                            }
                            return that.viewModel.title;
                        },
                        tooltip: { placement: "right" }
                    });
                }
            }
        };
        /**
         * Called by ObjectEditor to hide deactivated page.
         * @param {EditorPage} page
         */
        ObjectEditorPresenterBase.prototype.deactivatePage = function (page) {
            var that = this, pageContainer = that._getPageByName(page.name);
            if (that.options.animatePageActivation) {
                var task_1 = lang.deferred();
                pageContainer.fadeOut(100, function () {
                    task_1.resolve();
                });
                return task_1.promise();
            }
            else {
                pageContainer.hide();
            }
        };
        ObjectEditorPresenterBase.prototype.activateContextParts = function () {
            this.partsCarousel.activate();
        };
        /**
         * Called by ObjectEditor after current page is shown.
         */
        ObjectEditorPresenterBase.prototype.onReady = function () {
            var that = this, eventPublisher = that.eventPublisher, $container = $(that.container);
            if (eventPublisher && that.options.affixMenu) {
                if (that.$menuContainer) {
                    eventPublisher.publish("ui.affix.remove_element", {
                        element: that.$menuContainer
                    });
                }
                that.$menuContainer = $container.find(".x-editor-menu-container");
                eventPublisher.publish("ui.affix.add_element", {
                    element: that.$menuContainer,
                    controlledBy: $container.find(".x-editor-pages"),
                    affixTo: "bottom"
                });
            }
            if (that.options.showHelpTooltips) {
                that._initHintTooltips($container);
            }
        };
        ObjectEditorPresenterBase.prototype._initHintTooltips = function ($container) {
            var that = this;
            $container.tooltip({
                selector: ".x-pe-help",
                title: function () {
                    // NOTE: 'this' is the element that the tooltip is attached to
                    var propName = $(this).parents(".x-pe-container").prop("id");
                    if (propName) {
                        var pe = that.viewModel.currentPage().editors[propName];
                        if (pe && pe.options) {
                            return pe.options.hint;
                        }
                    }
                },
                html: true,
                placement: "auto",
                delay: { show: 500 },
                trigger: "hover"
            });
        };
        ObjectEditorPresenterBase.prototype._getPageByName = function (name) {
            return this.container.find(".x-editor-page[data-page='" + name + "']").first();
        };
        ObjectEditorPresenterBase.prototype.unload = function (options) {
            var that = this, eventPublisher = that.eventPublisher;
            if (that._clipboardBtn) {
                that._clipboardBtn.dispose();
            }
            if (eventPublisher && that.options.affixMenu && that.$menuContainer) {
                eventPublisher.publish("ui.affix.remove_element", {
                    element: that.$menuContainer
                });
            }
            that.container = undefined;
            that.viewModel.unbind("change:isBusy", null, that);
            _super.prototype.unload.call(this, options);
        };
        ObjectEditorPresenterBase.prototype.dispose = function (options) {
            this.partsCarousel.dispose();
            _super.prototype.dispose.call(this, options);
        };
        ObjectEditorPresenterBase.prototype._onBusyChanged = function (sender, value) {
            var that = this;
            if (value) {
                that._busyElement = new WaitingModal({ text: that.options.savingText });
                that._busyElement.render();
            }
            else if (that._busyElement) {
                that._busyElement.dispose();
                delete that._busyElement;
            }
        };
        ObjectEditorPresenterBase.prototype._activateViolation = function (violation) {
            // focus PE for violation from part, if any
            if (violation && violation.pageName) {
                var page_1 = this.viewModel.getPageByName(violation.pageName);
                if (page_1 && !page_1.hidden()) {
                    lang.when(this.viewModel.setCurrentPage(page_1, true /*skipValidation*/))
                        .always(function () {
                        if (violation.props && violation.props.length) {
                            // activate first PE that can be found
                            lang.some(violation.props, function (prop) {
                                var pe = page_1.getPropertyEditor(prop, violation.object);
                                if (pe) {
                                    pe.activate();
                                    return true;
                                }
                            });
                        }
                    });
                }
            }
        };
        ObjectEditorPresenterBase.defaultOptions = {
            /**
             * allow pages switching animation
             * @type {Boolean}
             */
            animatePageActivation: true,
            /**
             * Affix tabs
             * @type {Boolean}
             */
            affixNavigation: undefined,
            /**
             * Affix menu
             *@type {Boolean}
             */
            affixMenu: undefined,
            /**
             * Affix context parts area
             *@type {Boolean}
             */
            affixParts: undefined,
            /**
             * Render editor.title
             * @type {Boolean}
             */
            showTitle: true,
            hideMenu: undefined,
            menuCssClass: "x-menu-bar x-menu--contrast",
            /**
             * Add "copy to clipboard" popup-button near title
             * @type {Boolean}
             */
            showCopy: undefined,
            showHelpTooltips: true,
            loadingText: resources.wait,
            savingText: resources.saving
        };
        ObjectEditorPresenterBase.hostDefaultOptions = {
            dialog: {
                affixMenu: false,
                affixNavigation: false,
                affixParts: false
            }
        };
        return ObjectEditorPresenterBase;
    }(View));
    ObjectEditorPresenterBase.mixin({
        defaultOptions: ObjectEditorPresenterBase.defaultOptions,
        hostDefaultOptions: ObjectEditorPresenterBase.hostDefaultOptions,
        /**
         * @deprecated use hostDefaultOptions
         */
        contextDefaultOptions: ObjectEditorPresenterBase.hostDefaultOptions
    });
    core.ui.ObjectEditorPresenterBase = ObjectEditorPresenterBase;
    return ObjectEditorPresenterBase;
});
//# sourceMappingURL=ObjectEditorPresenterBase.js.map