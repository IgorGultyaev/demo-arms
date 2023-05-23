/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/utils", "lib/ui/Dialog", "lib/ui/handlebars/View", "moment", "xhtmpl!./templates/LoginDialog.hbs", "xhtmpl!./templates/WindowsAuth.hbs", "xhtmpl!./templates/FormsAuth.hbs", "xhtmpl!./templates/OpenAuth.hbs", "xhtmpl!./templates/2f.hbs", "i18n!./../nls/resources", "i18n!lib/nls/resources", "vendor/moment/moment-duration-format", "xcss!./styles/loginDialog"], function (require, exports, $, core, utils, Dialog, View, moment, dialogTemplate, templateWindowAuth, templateFormsAuth, templateOpenAuth, template2f, resources, globalResources) {
    "use strict";
    var lang = core.lang;
    /**
     * @enum {String}
     * @memberOf LoginDialog
     */
    var statusMessages = {
        loginInProgress: resources["security.logging_in"] + "...",
        loginSuccess: resources["loginDialog.loginSuccess"],
        loginFailed: resources["loginDialog.loginFailed"],
        authNotSupported: resources["loginDialog.authNotSupported"],
        dialogTitle: resources["security.authentication"],
        dialog2fTitle: resources["loginDialog.2f.title"],
        dialog2fPrompt: resources["loginDialog.2f.prompt"],
        dialog2fPromptTimeout: resources["loginDialog.2f.prompt_timeout"],
        dialog2fTimedout: resources["loginDialog.2f.timedout"]
    };
    /*
            TODO: to add password hashing, add here:
        define(["cryptojs.md5", "cryptojs.base64"], function (CryptoJS, CryptoJSbase64)
            also add reguire.config.json:
        "paths": {
            "cryptojs.core": "vendor/cryptojs/components/core",
            "cryptojs.md5": "vendor/cryptojs/components/md5",
            "cryptojs.base64": "vendor/cryptojs/components/enc-base64"
        },
        "shim": {
            "cryptojs.core": {
                "exports": "CryptoJS"
            },
            "cryptojs.md5": {
                "deps": ["cryptojs.core"], "exports": "CryptoJS"
            },
            "cryptojs.base64": {
                "deps": ["cryptojs.core"], "exports": "CryptoJS"
            }
        }
         */
    var LoginDialog = /** @class */ (function (_super) {
        __extends(LoginDialog, _super);
        /**
         * @constructs LoginDialog
         * @extends Dialog
         * @param {DataFacadeBase} dataFacade
         * @param {Object} security
         * @param {Object} [security.windowsAuth]
         * @param {String} security.windowsAuth.loginUrl
         * @param {Object} [security.formsAuth]
         * @param {String} security.formsAuth.loginUrl
         * @param {Object} [security.openAuth]
         * @param {String} security.openAuth.loginUrl
         * @param {Array} security.openAuth.providers
         * @param {Object} [options]
         */
        function LoginDialog(dataFacade, security, options) {
            var _this = this;
            if (!dataFacade) {
                throw new Error("dataFacade should be specified");
            }
            if (!security) {
                throw new Error("Security configuration should be specified");
            }
            options = LoginDialog.mixOptions(options, LoginDialog.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.dataFacade = dataFacade;
            _this.security = security;
            _this.providers = {};
            _this.initAuthTypes(security);
            if (_this.authTypes().count() === 0) {
                _this.status(statusMessages.authNotSupported);
            }
            return _this;
        }
        LoginDialog.prototype.initAuthTypes = function (secCfg) {
            var that = this, authTypes = new lang.ObservableCollection();
            if (secCfg.windowsAuth) {
                authTypes.add({
                    name: "windows",
                    title: secCfg.windowsAuth.title || resources["loginDialog.account_type_windows"],
                    isDefault: secCfg.windowsAuth.isDefault
                });
                that._createProvider("windows", secCfg.windowsAuth);
            }
            if (secCfg.formsAuth) {
                authTypes.add({
                    name: "forms",
                    title: secCfg.formsAuth.title || resources["loginDialog.account_type_forms"],
                    isDefault: secCfg.formsAuth.isDefault
                });
                that._createProvider("forms", secCfg.formsAuth);
            }
            if (secCfg.openAuth) {
                authTypes.add({
                    name: "openAuth",
                    title: secCfg.openAuth.title || resources["loginDialog.account_type_oauth"],
                    isDefault: secCfg.openAuth.isDefault
                });
                that._createProvider("openAuth", secCfg.openAuth);
            }
            that.authTypes(authTypes);
            var def = lang.find(authTypes.all(), function (v) { return v.isDefault; });
            if (def) {
                // make the default provider the first in the lest
                authTypes.move(authTypes.indexOf(def), 0);
            }
            else {
                def = authTypes.get(0);
            }
            that.bind("change:currentAuthType", function (sender, value) {
                that.currentAuthProvider(that.providers[value]);
            });
            if (def) {
                that.currentAuthType(def.name);
            }
        };
        LoginDialog.prototype._createProvider = function (name, options) {
            var providerInfo = this.options.providers[name];
            if (providerInfo) {
                this.providers[name] = new providerInfo(this, options);
            }
        };
        LoginDialog.prototype.afterRender = function () {
            var $rememberMe = $(".x-login-dialog-rememberMe");
            if ($rememberMe.length) {
                $rememberMe.find(".x-icon-help").tooltip({ trigger: "click hover" });
            }
            _super.prototype.afterRender.call(this);
        };
        LoginDialog.prototype._enable = function (bEnabled) {
            if (this.$domElement) {
                this.$domElement.find(".modal-body").blocked(!bEnabled);
            }
            this._disabled = !bEnabled;
        };
        LoginDialog.prototype.executeAuth = function (ajaxSettings) {
            var that = this;
            if (this._disabled) {
                return;
            }
            that._enable(false);
            that.status(statusMessages.loginInProgress);
            //ajaxSettings.contentType = "application/x-www-form-urlencoded";
            ajaxSettings.type = "POST";
            if (that.rememberMe()) {
                ajaxSettings.data = ajaxSettings.data || {};
                ajaxSettings.data.persistentCookie = true;
            }
            /*
                TODO: here there could be passwords hashing, see http://track.rnd.croc.ru/issue/WC-950
                if (that.options.hashPasswords && CryptoJS && CryptoJS.MD5) {
                    pwd = CryptoJS.MD5(pwd).toString(CryptoJS.enc.Base64);
                }
             * */
            that.dataFacade.executeLogin(ajaxSettings, { suppressEventOnError: true, suppressEventOnSuccess: true })
                .done(function (response) {
                if (response && response["2f"]) {
                    that.on2fAuthStep2(response["2f"]);
                }
                else {
                    that.onAuthSuccess(response.result);
                }
            })
                .fail(function (error) {
                that.onAuthError(error);
            });
        };
        LoginDialog.prototype.on2fAuthStep2 = function (result) {
            var that = this;
            var twoFactorAuth = that.security.twoFactorAuth;
            var url = result.url || (twoFactorAuth ? twoFactorAuth.url : "") || "api/_security/login_confirm";
            if (result.type === "wait") {
                throw new Error("Not implemented");
            }
            this.promptFor2fSecret(result).always(function (secret) {
                if (!secret) {
                    return that.onAuthError({ message: statusMessages.dialog2fTimedout });
                }
                var ajaxSettings = {
                    url: url,
                    data: {
                        token: result.token,
                        secret: secret,
                        persistentCookie: that.rememberMe()
                    },
                    type: "POST"
                };
                that.dataFacade.executeLogin(ajaxSettings, { suppressEventOnError: true, suppressEventOnSuccess: true })
                    .done(function (response) {
                    that.onAuthSuccess(response.result);
                })
                    .fail(function (error) {
                    that.onAuthError(error);
                });
            });
        };
        LoginDialog.prototype.promptFor2fSecret = function (result) {
            var dlgViewModel = lang.observe({
                hint: result.hint,
                secret: "",
                left: "",
                prompt: statusMessages.dialog2fPrompt
            });
            var timer;
            if (result.timeout) {
                var left_1 = moment.duration(result.timeout);
                dlgViewModel.left(left_1.format("mm:ss"));
                timer = setInterval(function () {
                    left_1.subtract(1, "s");
                    dlgViewModel.left(left_1.format("mm:ss"));
                    if (left_1.valueOf() <= 0) {
                        // time is over
                        clearInterval(timer);
                        dlg.close();
                    }
                }, 1000);
                dlgViewModel.prompt(statusMessages.dialog2fPrompt + " " + statusMessages.dialog2fPromptTimeout + " ");
            }
            var expectedLength = result.length;
            var dlg = new Dialog({
                rootCssClass: "x-login-2f-dialog",
                body: new View({
                    template: template2f,
                    viewModel: dlgViewModel
                }),
                header: statusMessages.dialog2fTitle,
                menu: expectedLength > 0
                    ? null
                    : { items: [
                            { name: "ok", title: "OK", command: core.createCommand(function () {
                                    clearInterval(timer);
                                    dlg.close(dlgViewModel.secret());
                                }) }
                        ]
                    },
                overlay: true,
                noCloseButton: true
            });
            if (expectedLength) {
                dlgViewModel.bind("change:secret", function (sender, val) {
                    if (val && val.length === expectedLength) {
                        clearInterval(timer);
                        dlg.close(val);
                    }
                    else if (val && val.length > expectedLength) {
                        dlg.$dialog.find(".password-group").addClass("has-error");
                    }
                    else if (val) {
                        dlg.$dialog.find(".password-group").removeClass("has-error");
                    }
                });
            }
            return dlg.open();
        };
        LoginDialog.prototype.onAuthSuccess = function (result) {
            var that = this;
            if (!that.$dialog) {
                return;
            }
            that.status(statusMessages.loginSuccess);
            var dlgResult = { success: true, result: result };
            // TODO: Зачем timeout и 1s?
            window.setTimeout(function () {
                //that._enable(true);
                that.close(dlgResult);
            }, 1000);
        };
        LoginDialog.prototype.onAuthError = function (error) {
            var that = this;
            if (!that.$dialog) {
                return;
            }
            that.status(statusMessages.loginFailed + (error ? ": " + error.message : undefined));
            that._enable(true);
            that.result = { success: false, error: error };
        };
        LoginDialog.prototype.executeAuthExternal = function (ajaxSettings) {
            var that = this, width = window.screen.width / 2, height = window.screen.height / 2, uri, data = ajaxSettings.data || {};
            that._enable(false);
            that.status(statusMessages.loginInProgress);
            uri = that.dataFacade._interop.normalizeUrl(ajaxSettings.url);
            if (that.rememberMe()) {
                data.persistentCookie = true;
            }
            uri = uri + "?" + utils.buildUriParams(data);
            var popup = window.open(uri, "_blank", ["toolbar=no", "location=" + (window["opera"] ? "no" : "yes"), "directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no",
                "width=" + width, "height=" + height, "top=" + (window.screen.height - height) / 2, "left=" + (window.screen.width - width) / 2].join());
            var interval = window.setInterval(function () {
                if (popup.closed !== false) {
                    that._enable(true);
                    that.status("");
                    window.clearInterval(interval);
                    that._onPopupClosed();
                }
            }, 100);
        };
        LoginDialog.prototype._onPopupClosed = function () {
            var that = this;
            that.dataFacade.getCurrentUser({ refreshStatus: true })
                .then(function (userJson) {
                if (userJson) {
                    that.status(statusMessages.loginSuccess);
                    that.close({ success: true, result: userJson });
                }
                else {
                    that.status(statusMessages.loginFailed);
                }
            }, function (error) {
                that.status(error);
            });
        };
        LoginDialog.statusMessages = statusMessages;
        LoginDialog.defaultOptions = {
            template: dialogTemplate,
            header: statusMessages.dialogTitle,
            rootCssClass: "x-login-dialog",
            providers: {},
            menu: { items: [
                    {
                        name: "close",
                        presentation: "text",
                        title: globalResources.cancel
                    }
                ] }
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], LoginDialog.prototype, "authTypes");
        __decorate([
            lang.decorators.observableAccessor()
        ], LoginDialog.prototype, "currentAuthType");
        __decorate([
            lang.decorators.observableAccessor()
        ], LoginDialog.prototype, "currentAuthProvider");
        __decorate([
            lang.decorators.observableAccessor()
        ], LoginDialog.prototype, "hasOpenAuth");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], LoginDialog.prototype, "rememberMe");
        __decorate([
            lang.decorators.observableAccessor()
        ], LoginDialog.prototype, "status");
        return LoginDialog;
    }(Dialog));
    (function (LoginDialog) {
        var AuthView = /** @class */ (function (_super) {
            __extends(AuthView, _super);
            /**
             * @class AppNavMenu
             * @extends Menu
             */
            function AuthView(host, options) {
                var _this = this;
                options = AuthView.mixOptions(options, AuthView.defaultOptions);
                _this = _super.call(this, options) || this;
                _this.host = host;
                _this.cmdLogin = core.createCommand({
                    execute: function (args) {
                        if (!_this.beforeLogin()) {
                            return;
                        }
                        _this._doLogin(args);
                    }
                });
                return _this;
            }
            AuthView.prototype.beforeLogin = function () {
                return true;
            };
            AuthView.prototype._doLogin = function (args) { };
            AuthView.defaultOptions = {};
            __decorate([
                lang.decorators.observableAccessor()
            ], AuthView.prototype, "status");
            return AuthView;
        }(View));
        LoginDialog.AuthView = AuthView;
        var WindowsAuthView = /** @class */ (function (_super) {
            __extends(WindowsAuthView, _super);
            function WindowsAuthView(host, options) {
                var _this = this;
                options = WindowsAuthView.mixOptions(options, WindowsAuthView.defaultOptions);
                _this = _super.call(this, host, options) || this;
                return _this;
            }
            WindowsAuthView.prototype._doLogin = function () {
                this.host.executeAuth({
                    url: this.options.loginUrl
                });
            };
            WindowsAuthView.defaultOptions = {
                template: templateWindowAuth,
                loginUrl: undefined
            };
            return WindowsAuthView;
        }(AuthView));
        LoginDialog.WindowsAuthView = WindowsAuthView;
        var FormsAuthView = /** @class */ (function (_super) {
            __extends(FormsAuthView, _super);
            function FormsAuthView(host, options) {
                var _this = this;
                options = FormsAuthView.mixOptions(options, FormsAuthView.defaultOptions);
                _this = _super.call(this, host, options) || this;
                _this.userName("");
                _this.password("");
                _this.bind("change:userName", function () { _this._validate("userName"); });
                _this.bind("change:password", function () { _this._validate("password"); });
                return _this;
            }
            FormsAuthView.prototype.beforeLogin = function () {
                return this._validate();
            };
            FormsAuthView.prototype._validate = function (propName) {
                var that = this, result = true;
                if (propName === "userName" || !propName) {
                    if (!that.userName()) {
                        that.trigger("error:userName", resources["loginDialog.userName_missing"]);
                        result = false;
                    }
                    else {
                        that.trigger("error:userName", null);
                    }
                }
                if (propName === "password" || !propName) {
                    if (!that.password()) {
                        that.trigger("error:password", resources["loginDialog.password_missing"]);
                        result = false;
                    }
                    else {
                        that.trigger("error:password", null);
                    }
                }
                return result;
            };
            FormsAuthView.prototype._doLogin = function () {
                this.host.executeAuth({
                    url: this.options.loginUrl,
                    data: {
                        userName: this.userName(),
                        password: this.password()
                    }
                });
            };
            FormsAuthView.prototype.afterRender = function () {
                var _this = this;
                this.$domElement.on("keyup", function (e) {
                    if (e.which === core.html.keyCode.ENTER) {
                        _this.cmdLogin.execute();
                        return false;
                    }
                });
            };
            FormsAuthView.defaultOptions = {
                template: templateFormsAuth,
                loginUrl: undefined
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], FormsAuthView.prototype, "userName");
            __decorate([
                lang.decorators.observableAccessor()
            ], FormsAuthView.prototype, "password");
            return FormsAuthView;
        }(AuthView));
        LoginDialog.FormsAuthView = FormsAuthView;
        var OpenAuthView = /** @class */ (function (_super) {
            __extends(OpenAuthView, _super);
            function OpenAuthView(host, options) {
                var _this = this;
                options = OpenAuthView.mixOptions(options, OpenAuthView.defaultOptions);
                _this = _super.call(this, host, options) || this;
                _this.openAuthProviders(new lang.ObservableCollection(options.providers));
                return _this;
            }
            OpenAuthView.prototype._doLogin = function (args) {
                this.host.executeAuthExternal({
                    url: this.options.loginUrl,
                    data: {
                        provider: args.provider
                    }
                });
            };
            OpenAuthView.defaultOptions = {
                template: templateOpenAuth,
                loginUrl: undefined
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], OpenAuthView.prototype, "openAuthProviders");
            return OpenAuthView;
        }(AuthView));
        LoginDialog.OpenAuthView = OpenAuthView;
    })(LoginDialog || (LoginDialog = {}));
    LoginDialog.defaultOptions.providers = {
        windows: LoginDialog.WindowsAuthView,
        forms: LoginDialog.FormsAuthView,
        openAuth: LoginDialog.OpenAuthView
    };
    // backward compatibility:
    LoginDialog.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: LoginDialog.defaultOptions,
        /** @obsolete use static statusMessages */
        statusMessages: LoginDialog.statusMessages
    });
    core.ui.LoginDialog = LoginDialog;
    return LoginDialog;
});
//# sourceMappingURL=LoginDialog.js.map