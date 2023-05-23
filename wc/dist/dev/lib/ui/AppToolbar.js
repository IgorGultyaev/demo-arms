/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/AppToolbar.hbs", "lib/ui/menu/Menu", "lib/ui/menu/AppNavMenuPresenter", "lib/ui/menu/LanguageMenu", "lib/ui/menu/SystemMenu", "lib/ui/OnlineBeacon", "lib/ui/PopupView", "lib/ui/menu/MenuNavGridPresenter", "i18n!lib/nls/resources", "xcss!lib/ui/styles/appToolbar"], function (require, exports, core, View, template, Menu, AppNavMenuPresenter, LanguageMenu, SystemMenu, OnlineBeacon, PopupView, MenuNavGridPresenter, resources) {
    "use strict";
    var AppToolbar = /** @class */ (function (_super) {
        __extends(AppToolbar, _super);
        /**
         * @constructs View
         * @extends StatefulPart
         * @param {Application} app
         * @param {View.defaultOptions} options View options
         */
        function AppToolbar(app, options) {
            var _this = this;
            options = AppToolbar.mixOptions(options, AppToolbar.prototype.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.eventPublisher = app.eventPublisher;
            _this.initComponents(app);
            return _this;
        }
        AppToolbar.prototype.initComponents = function (app) {
            var that = this;
            that.initSystemMenu(app);
            that.initNavToolbar(app);
            that.initLanguageMenu(app);
            that.initAuthMenu(app);
            that.initOnlineBeacon(app);
        };
        AppToolbar.prototype.initSystemMenu = function (app) {
            var that = this, menuItem, opt;
            if (that.options.sysMenu) {
                that.sysMenu = app.sysMenu;
                if (!that.sysMenu) {
                    opt = core.lang.isObject(that.options.sysMenu) ? that.options.sysMenu : {};
                    that.sysMenu = new SystemMenu(opt);
                    // Field `Application.sysMenu` is used by modules
                    app.sysMenu = that.sysMenu;
                    menuItem = that.sysMenu.getRootItem("app-navigation");
                    if (menuItem && !menuItem.getPart) {
                        menuItem.getPart = function () {
                            var viewOptions = {
                                viewModel: that.appNavMenu(),
                                body: new MenuNavGridPresenter(that.options.navGridPresenter),
                                title: resources["app-navigation"],
                                disposeOnClose: true,
                                showCross: true,
                                height: undefined,
                                width: undefined // auto-width
                            };
                            return new PopupView(viewOptions);
                        };
                    }
                }
            }
        };
        AppToolbar.prototype.initNavToolbar = function (app /*: core.Application*/) {
            var that = this, navMenu, opt;
            // top navigation menu (switching areas)
            if (that.options.navToolbar) {
                that.navMenuPresenter = app.navMenuPresenter;
                if (!that.navMenuPresenter) {
                    navMenu = that.appNavMenu();
                    if (!navMenu) {
                        // create a fake empty menu so AppNavMenuPresenter can render
                        navMenu = Menu.create({ items: [] });
                    }
                    opt = core.lang.isObject(that.options.navToolbar) ? that.options.navToolbar : {};
                    opt.viewModel = navMenu;
                    that.navMenuPresenter = new AppNavMenuPresenter(opt);
                }
                that.bind("change:appNavMenu", function (sender, value) {
                    that.navMenuPresenter.setViewModel(value);
                    window.setTimeout(function () {
                        that.navMenuPresenter.rerender();
                    }, 50);
                });
            }
        };
        AppToolbar.prototype.initLanguageMenu = function (app /*: core.Application*/) {
            var that = this;
            if (that.options.langMenu) {
                var opt = core.lang.isObject(that.options.langMenu) ? that.options.langMenu : {};
                that.langMenu = app.langMenu || new LanguageMenu(app.config, opt);
            }
        };
        AppToolbar.prototype.initOnlineBeacon = function (app /*: core.Application*/) {
            var that = this;
            if (that.options.onlineBeacon) {
                var opt = core.lang.isObject(that.options.onlineBeacon) ? that.options.onlineBeacon : {};
                that.onlineBeacon = app.onlineBeacon || new OnlineBeacon(app, opt);
            }
        };
        AppToolbar.prototype.initAuthMenu = function (app /*: core.Application*/) {
            var that = this, menuClass = core.ui["AuthMenu"];
            // authentication menu (login/logout)
            if (that.options.authMenu && app.config.security && menuClass) {
                // NOTE: AuthMenu can be absent if Windows-auth is enabled for the whole site
                var opt = core.lang.isObject(that.options.authMenu) ? that.options.authMenu : {};
                that.authMenu = app.authMenu || new menuClass(app.dataFacade, that.eventPublisher, opt);
            }
        };
        AppToolbar.prototype.afterRender = function () {
            var that = this, $domElement = that.$domElement, $navbar = $domElement.find(".x-app-navbar"), theme = that.options.theme;
            if (theme) {
                var cssClass = void 0;
                if (theme === "dark") {
                    cssClass = "x-app-navbar--dark";
                }
                else if (theme === "light") {
                    cssClass = "x-app-navbar--light";
                }
                $navbar.addClass(cssClass);
            }
            if (that.options.cssClass) {
                $navbar.addClass(that.options.cssClass);
            }
            if (that.navMenuPresenter) {
                $navbar.bind("domChanged", function () {
                    that.navMenuPresenter.reflow();
                });
            }
            if (that.options.affix) {
                var opt = that.options.affix;
                if (!core.lang.isObject(opt)) {
                    opt = {};
                }
                opt.element = $navbar;
                that.eventPublisher.publish("ui.affix.add_element", opt);
            }
            _super.prototype.afterRender.call(this);
        };
        AppToolbar.prototype.onReady = function () {
            var navMenuPresenter = this.navMenuPresenter;
            if (navMenuPresenter) {
                navMenuPresenter.reflow();
            }
        };
        __decorate([
            core.lang.decorators.observableAccessor()
        ], AppToolbar.prototype, "appNavMenu");
        return AppToolbar;
    }(View));
    AppToolbar.mixin({
        defaultOptions: {
            template: template,
            sysMenu: {
                items: [{
                        name: "app-navigation",
                        title: resources["app-navigation"],
                        order: -1
                    }]
            },
            navToolbar: true,
            navGridPresenter: {
                itemCssClass: "x-navigation"
            },
            langMenu: true,
            onlineBeacon: true,
            authMenu: true,
            affix: {
                suspendByScreenWidth: 600,
                stuckBehaviors: [] // reset default behaviors
            },
            theme: undefined,
            cssClass: undefined,
            unbound: true
        }
    });
    core.ui.AppToolbar = AppToolbar;
    return AppToolbar;
});
//# sourceMappingURL=AppToolbar.js.map