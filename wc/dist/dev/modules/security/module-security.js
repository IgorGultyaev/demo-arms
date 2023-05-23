/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./ui/LoginDialog", "lib/interop/DataFacadeBase", "xhtmpl!./ui/templates/LoggedOut.hbs", "i18n!lib/nls/resources", "i18n!./nls/resources", "./ui/AuthMenu"], function (require, exports, core, LoginDialog, DataFacadeBase, templateLoggedOut, resources, moduleResources) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    // extend common resources
    lang.forEach(moduleResources, function (value, key) {
        resources[key] = value;
    });
    core.createModule("security", function (app) {
        if (!app.dataFacade || !app.model) {
            return;
        }
        var dataFacade = app.dataFacade;
        var backendInterop = dataFacade._interop;
        var configSecurity = app.config["security"];
        // Extend BackendInterop instance
        if (configSecurity && (configSecurity.formsAuth || configSecurity.openAuth)) {
            if (configSecurity.formsAuth && configSecurity.formsAuth.authenticationScheme) {
                backendInterop.authenticationScheme = configSecurity.formsAuth.authenticationScheme;
            }
            else {
                backendInterop.authenticationScheme = "*";
            }
            backendInterop._executeAjax = function (ajaxSettings, defer, repeating) {
                var that = this;
                that._executeAjaxSuccess(ajaxSettings, defer, repeating)
                    .fail(function (jqXhr, textStatus, errorText) {
                    var deferAuth;
                    // if the current operation is already cancel then we'll skip auto-login
                    if (defer && defer.state() === "rejected") {
                        return;
                    }
                    if (jqXhr.status === 401 && !repeating && that.authenticationScheme &&
                        (that.authenticationScheme === "*" || that.authenticationScheme === jqXhr.getResponseHeader("WWW-Authenticate"))) {
                        if (that._deferAuth) {
                            // уже кто-то вызвал 401 и диалог логина открыт
                            deferAuth = that._deferAuth;
                        }
                        else {
                            that._deferAuth = deferAuth = core.lang.Deferred();
                            that.trigger("authentication_required", jqXhr, deferAuth);
                        }
                        // schedule repeating of the original operation after user logged in
                        deferAuth.then(function () {
                            delete that._deferAuth;
                            // we're authenticated, now let's repeat the request
                            that._executeAjax(ajaxSettings, defer, true);
                        }, function (error) {
                            delete that._deferAuth;
                            if (defer) {
                                defer.reject(error);
                            }
                        });
                    }
                    else {
                        var error = that.handleError(jqXhr, textStatus);
                        that.traceSource.info("Ajax request to " + ajaxSettings.url + " failed: " + JSON.stringify(error));
                        if (defer) {
                            defer.reject(error);
                        }
                    }
                });
            };
        }
        // Extend DataFacade prototype
        lang.extend(DataFacadeBase.prototype, /** @lends DataFacadeBase */ {
            /**
             * Call the server for logging in.
             * @memberOf DataFacadeBase
             * @returns {Promise} Deferred object which will be signalled after login completes, get user json in arguments
             */
            login: function () {
                var defer = lang.Deferred();
                var task = defer.then(function (userDto) {
                    if (!userDto) {
                        throw new Error("Application does not support authentication");
                    }
                    return userDto;
                });
                this._login(defer);
                return task;
            },
            /**
             * Call the server for logging in.
             * @memberOf DataFacadeBase
             * @param {JQuery.Deferred} [defer] Deferred object which will be signalled after login completes, get user json in arguments
             */
            _login: function (defer) {
                var that = this;
                if (!configSecurity) {
                    if (defer) {
                        defer.resolve();
                    }
                    return;
                }
                if (that._waitLogin) {
                    // if LoginDialog is active already
                    that._setupLoginWaitCallbacks(defer);
                    return;
                }
                if (that._currentUser) {
                    that._doLogout(/*relogin:*/ true);
                }
                // if it's DataFacadeSmart (yeah,it's an ugly type check) and we're "offline" (as server is down or manually disconnected)
                // then return user from cache
                if (that.serverOnline && (!that.serverOnline() || that.manuallyDisconnected())) {
                    var dto = that._currentUser || core.localStorage.getObject("security/currentUser");
                    if (dto) {
                        that._doCompleteLogin(that._onLogin(dto), defer);
                        return;
                    }
                }
                that._waitLogin = that._openLoginDialog();
                that._setupLoginWaitCallbacks(defer);
                that._waitLogin.always(function () {
                    that._waitLogin = undefined;
                });
            },
            createLoginDialog: function () {
                return new LoginDialog(this, configSecurity);
            },
            executeLogin: function (ajaxSettings, options) {
                options = options || {};
                options.suppressAutoLogin = true;
                options.processEvent = { message: resources["security.authentication"] };
                return this.ajax(ajaxSettings, options);
            },
            _openLoginDialog: function () {
                var that = this;
                return that.createLoginDialog().open().then(function (result) {
                    if (result.success) {
                        return that._onLogin(result.result);
                    }
                    return lang.rejected();
                });
            },
            _setupLoginWaitCallbacks: function (defer) {
                var that = this;
                if (defer) {
                    that._waitLogin
                        .done(function (result) {
                        if (result.success) {
                            defer.resolve(result.result);
                        }
                        else if (result.error) {
                            defer.reject(result.error);
                        }
                        else {
                            // NOTE: we can get here from _openLoginDialog's continuation (see onLogin call in 'then'),
                            // and in such a case 'result' will be userJson or Deferred of it.
                            that._doCompleteLogin(result, defer);
                        }
                    })
                        .fail(function () {
                        // dialog was canceled
                        defer.reject(core.eth.canceled());
                    });
                }
            },
            _onLogin: function (userDto) {
                var _this = this;
                if (!userDto) {
                    throw new Error("security: user object is null, probably incorrect server response");
                }
                var args = { user: userDto, defer: undefined };
                this._publishEvent("security.login", args);
                if (args.defer) {
                    // app login asks us to wait for something
                    return args.defer.then(function () {
                        return _this._onLoginImpl(userDto);
                    });
                }
                return this._onLoginImpl(userDto);
            },
            _onLoginImpl: function (userDto) {
                this._authStatusKnown = true;
                this._currentUser = userDto;
                core.localStorage.setObject("security/currentUser", userDto);
                return userDto;
            },
            _doCompleteLogin: function (taskOrDto, deferToSignal) {
                if (core.lang.isPromise(taskOrDto)) {
                    taskOrDto.then(function (result) {
                        deferToSignal.resolve(result);
                    }, function (error) {
                        deferToSignal.reject(error);
                    });
                }
                else {
                    deferToSignal.resolve(taskOrDto);
                }
            },
            /**
             * Call server for Logging out (as auth-cookie is http-only and we don't have access to it on the client).
             * @memberOf DataFacadeBase
             * @returns {Promise}
             */
            logout: function () {
                var _this = this;
                if (configSecurity) {
                    return this.ajax({
                        url: configSecurity.logoutUrl,
                        type: "POST"
                    }, {
                        processEvent: { message: resources["security.logging_out"] }
                    }).done(function () {
                        _this._doLogout();
                    }).fail(function (error) {
                        _this.traceSource.error("DataFacade.logout error: " + error);
                    });
                }
                return lang.resolved();
            },
            _doLogout: function (relogin) {
                this._currentUser = null;
                this._authStatusKnown = true;
                if (!relogin) {
                    this._publishEvent("security.logout");
                }
            },
            /**
             * @memberOf DataFacadeBase
             * @param {Object} [options]
             * @param {Boolean} [options.refreshStatus]
             * @returns {Promise}
             */
            getCurrentUser: function (options) {
                var that = this;
                if (that._currentUser) {
                    return that._currentUser;
                }
                if (that._waitGetCurrentUser) {
                    return that._waitGetCurrentUser;
                }
                if (options && options.refreshStatus) {
                    that._authStatusKnown = false;
                }
                if (that._authStatusKnown) {
                    return undefined;
                }
                var defer = lang.Deferred();
                that._waitGetCurrentUser = defer;
                var ajaxOptions = {
                    // server SHOULD NOT return 401 for currentUser, but just in case
                    suppressAutoLogin: true,
                    suppressEventOnError: true,
                    processEvent: { message: resources["security.identification"] }
                };
                that.ajax({ url: "api/_security/currentUser" }, ajaxOptions).then(function (response) {
                    // response is null for anonymous (not authenticated yet) user
                    var userDto;
                    that._authStatusKnown = true;
                    if (response) {
                        userDto = response.result;
                        // NOTE: we have to wait till login completes before signal to _waitGetCurrentUser
                        core.lang.async.then(that._onLogin(userDto), function (userDto) {
                            var defer = that._waitGetCurrentUser;
                            that._waitGetCurrentUser = undefined;
                            defer.resolve(userDto);
                        }, function (error) {
                            var defer = that._waitGetCurrentUser;
                            that._waitGetCurrentUser = undefined;
                            defer.reject(error);
                        });
                    }
                    else {
                        that._waitGetCurrentUser = undefined;
                        defer.resolve(null);
                    }
                }, function (error) {
                    // TODO: remove this when general caching in dataFacade.load will be implemented
                    var userDto = core.localStorage.getObject("security/currentUser");
                    if (userDto) {
                        core.lang.async.then(that._onLogin(userDto), function (userDto) {
                            var defer = that._waitGetCurrentUser;
                            that._waitGetCurrentUser = undefined;
                            defer.resolve(userDto);
                        }, function (error) {
                            var defer = that._waitGetCurrentUser;
                            that._waitGetCurrentUser = undefined;
                            defer.reject(error);
                        });
                    }
                    else {
                        that._waitGetCurrentUser = undefined;
                        defer.reject(error);
                    }
                });
                return defer.promise();
            }
        });
        //dataFacade._authStatusKnown = false;
        dataFacade._interop.bind("authentication_required", function (jqXhr, defer) {
            dataFacade._login(defer);
        });
        function materializeUser(uow, userDto) {
            if (!userDto.__metadata || !userDto.id) {
                // it's not a domain object
                // TODO: надо ли событие? app.eventPublisher.publish("security.error", new core.SystemEvent({}));
                console.error("UnitOfWork.getCurrentUser was called but the server return a json which is not domain object");
                return null;
            }
            return uow.fromJson(userDto);
        }
        // Extend UnitOfWork prototype
        if (app.model.UnitOfWork) {
            /**
             * @memberOf UnitOfWork
             * @returns {Promise}
             */
            app.model.UnitOfWork.prototype.getCurrentUser = function () {
                var that = this, jsonOrDefer = app.dataFacade.getCurrentUser();
                if (lang.isPromise(jsonOrDefer)) {
                    return jsonOrDefer.then(function (userDto) {
                        if (userDto) {
                            return materializeUser(that, userDto);
                        }
                        // userDto is null for anonymous (not authenticated yet) user
                        return app.dataFacade.login().then(function (userDto) {
                            // in contrast with dataFacade.getCurrentUser dataFacade.login SHOULD do login
                            return materializeUser(that, userDto);
                        });
                    });
                }
                if (!jsonOrDefer) {
                    // authentication state was checked before but the user wasn't logged in
                    return app.dataFacade.login().then(function (userDto) {
                        // in contrast to `dataFacade.getCurrentUser` `dataFacade.login` SHOULD do login
                        return materializeUser(that, userDto);
                    });
                }
                // otherwise jsonOrDefer is json with user object
                var user = jsonOrDefer ? materializeUser(that, jsonOrDefer) : null;
                return lang.resolved(user);
            };
            app.model.UnitOfWork.prototype.currentUser = function () {
                var jsonOrDefer = app.dataFacade.getCurrentUser();
                if (!jsonOrDefer || lang.isPromise(jsonOrDefer)) {
                    return undefined;
                }
                return materializeUser(this, jsonOrDefer);
            };
            app.model.UnitOfWork.prototype.getCurrentUserId = function () {
                var jsonOrDefer = app.dataFacade.getCurrentUser();
                if (jsonOrDefer && jsonOrDefer.id) {
                    return jsonOrDefer.id;
                }
            };
        }
        function executeLogin(app) {
            var uow = app.createUnitOfWork();
            return uow.getCurrentUser().then(null, function (err) {
                // NOTE: повторим в случае ошибки. Фактически ошибка тут может быть только, если юзер нажал отмена (Cancelled)
                return executeLogin(app);
            }).always(function () {
                uow.dispose();
            });
        }
        // Extend Application to support `security.loginOnStart` option
        if (configSecurity && configSecurity.loginOnStart) {
            core.lang.override(app, {
                initialize: function (base) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var that = this;
                    return core.lang.async.then(executeLogin(app), function () {
                        return base.apply(that, args);
                    });
                }
            });
        }
        if (configSecurity && configSecurity.onLogout === "suspend") {
            app.eventPublisher.subscribe("security.logout", function () {
                // При логауте активируем специальную арию "security"
                app.areaManager.activateState("security", "logout");
            });
            app.eventPublisher.subscribe("security.login", function () {
                // При логине уходим из арии "security"
                var areaCurrent = app.areaManager.getActiveArea();
                if (areaCurrent && areaCurrent.name === "security") {
                    if (areaCurrent.currentState && areaCurrent.currentState.name === "logout") {
                        areaCurrent.close();
                    }
                }
            });
        }
    });
    function initializeArea(app, area) {
        area.transient = true;
        area.hidden(true);
        area.extensions["breadcrumbs"] = { hidden: true };
        area.addState({ name: "logout", transient: true }, "LoggedOut", null);
        app.registerPart("LoggedOut", function () {
            return new core.ui.View({
                template: templateLoggedOut,
                viewModel: {
                    cmdClose: core.createCommand(function (args) {
                        args.owner.navigationService.close();
                    })
                }
            });
        });
    }
    core.createAreaModule("security", function (app, area) {
        initializeArea(app, area);
    });
});
//# sourceMappingURL=module-security.js.map