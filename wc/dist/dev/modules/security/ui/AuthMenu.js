/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Component", "lib/ui/menu/Menu", "i18n!./../nls/resources"], function (require, exports, $, core, Component, Menu, resources) {
    "use strict";
    var lang = core.lang;
    var AuthMenu = /** @class */ (function (_super) {
        __extends(AuthMenu, _super); /** @lends AuthMenu.prototype */
        /**
         * @constructs AuthMenu
         * @extends Component
         * @param {DataFacadeBase} dataFacade
         * @param {EventPublisher} eventPublisher
         * @param {AuthMenu#defaultOptions} [options]
         */
        function AuthMenu(dataFacade, eventPublisher, options) {
            var _this = this;
            if (!dataFacade) {
                throw new Error("AuthMenu.ctor: dataFacade wasn't specified");
            }
            options = AuthMenu.mixOptions(options, AuthMenu.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.dataFacade = dataFacade;
            that.commands = core.lang.extend(that.createCommands(), that.options.commands || {});
            that.menu = that.createMenu();
            if (that.menu) {
                that.menu.bindToPart(that);
            }
            that.presenter = that.options.presenter;
            if (eventPublisher) {
                eventPublisher.subscribe("security.login", function (ev) {
                    that.activateAuthorizedMenu(ev.args.user);
                });
                eventPublisher.subscribe("security.logout", function (ev) {
                    that.activateUnauthorizedMenu();
                });
                eventPublisher.subscribe("app.start", function () {
                    var jsonOrDefer = dataFacade.getCurrentUser();
                    if (jsonOrDefer) {
                        core.lang.when(jsonOrDefer).then(function (userDto) {
                            if (userDto) {
                                that.activateAuthorizedMenu(userDto);
                            }
                            else {
                                that.activateUnauthorizedMenu();
                            }
                        });
                    }
                });
            }
            that.activateUnauthorizedMenu();
            return _this;
        }
        /**
         * Create commands
         * @protected
         * @returns {{Login: (Command), Logout: (Command)}}
         */
        AuthMenu.prototype.createCommands = function () {
            var that = this, cmdLogin = core.createCommand({
                name: "login",
                execute: function () {
                    that.dataFacade.login();
                }
            }), cmdLogout = core.createCommand({
                name: "logout",
                execute: function () {
                    that.dataFacade.logout();
                }
            });
            return {
                Login: cmdLogin,
                Logout: cmdLogout
            };
        };
        /**
         * Create menu.
         * @protected
         * @return {Menu}
         */
        AuthMenu.prototype.createMenu = function () {
            return new Menu(this.createDefaultMenu(), this.options.menu);
        };
        /**
         * Get default menu metadata.
         * @protected
         * @return {Object}
         */
        AuthMenu.prototype.createDefaultMenu = function () {
            return Menu.defaultsFor(AuthMenu.defaultMenu, "AuthMenu");
        };
        AuthMenu.prototype.dispose = function (options) {
            var that = this;
            _super.prototype.dispose.call(this, options);
            if (that._disposes) {
                that._disposes.forEach(function (d) {
                    if (d && typeof d.dispose === "function") {
                        d.dispose();
                    }
                });
                delete that._disposes;
            }
        };
        /**
         * Update menu for "unauthorized" state (no user logged in)
         * @protected
         */
        AuthMenu.prototype.activateUnauthorizedMenu = function () {
            var that = this;
            that.onSetRootTitle();
            var item = that.menu.getItem("Login");
            if (item) {
                item.hidden = false;
            }
            item = that.menu.getItem("Logout");
            if (item) {
                item.hidden = true;
            }
            that.menu.trigger("change", that);
        };
        /**
         * Update menu for "authorized" state (a user logged in)
         * @protected
         * @param {Object} [user]
         */
        AuthMenu.prototype.activateAuthorizedMenu = function (user) {
            var that = this;
            that.onSetRootTitle(user);
            var item = that.menu.getItem("Login");
            if (item) {
                item.hidden = true;
            }
            item = that.menu.getItem("Logout");
            if (item) {
                item.hidden = false;
            }
            that.menu.trigger("change", that);
        };
        /**
         * @protected
         * @param {Object} [user]
         */
        AuthMenu.prototype.onSetRootTitle = function (user) {
            var that = this, title;
            if (user) {
                title = user[that.options.userDisplayField] || resources["security.unable_get_username"];
            }
            else {
                title = core.platform.localize(that.options.defaultTitle);
            }
            that.rootTitle(title);
        };
        /**
         * @inheritDoc
         */
        AuthMenu.prototype.doRender = function (domElement) {
            var that = this, sel, anchor, rootTitlePresentation, disposable;
            if (that.presenter) {
                that.registerChild(that.presenter, { disposeOnUnload: false, keepOnUnload: false, trackStatus: true });
                return that.presenter.render(domElement);
            }
            sel = $(domElement);
            sel.addClass("dropdown");
            anchor = $("<a href='#' class='dropdown-toggle' role='button'>" +
                "<span class='x-icon x-icon-user'></span>" +
                "<span class='hidden-xs'></span>" +
                "<b class='caret'></b></a>").appendTo(sel);
            that.presenter = core.ui.DropDownMenuPresenter.create({ viewModel: that.menu });
            that.presenter.render(domElement);
            rootTitlePresentation = anchor.find("span").not(".x-icon-user");
            disposable = core.binding.databind(core.binding.html(rootTitlePresentation, "text"), core.binding.expr(that, that.rootTitle));
            that._disposes = that._disposes || [];
            that._disposes.push(disposable);
        };
        /**
         * @type {Object}
         * @property {String} defaultTitle
         * @property {Object} commands
         * @property {Object} menu
         * @property {String} userDisplayField Name of field of user json object to display
         */
        AuthMenu.defaultOptions = {
            defaultTitle: resources["security.not_logged_in"],
            userDisplayField: "login"
        };
        /**
         * Static (used by all instances) default menu metadata.
         * @type {Object}
         */
        AuthMenu.defaultMenu = {
            items: [
                {
                    name: "Login",
                    title: resources["security.login"],
                    hidden: true
                }, {
                    name: "Logout",
                    title: resources["security.logout"],
                    hidden: true
                }
            ]
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], AuthMenu.prototype, "rootTitle");
        return AuthMenu;
    }(Component /** @lends AuthMenu.prototype */));
    // backward compatibility:
    AuthMenu.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: AuthMenu.defaultOptions,
        /** @obsolete use static defaultMenu */
        defaultMenu: AuthMenu.defaultMenu
    });
    core.ui.AuthMenu = AuthMenu;
    return AuthMenu;
});
//# sourceMappingURL=AuthMenu.js.map