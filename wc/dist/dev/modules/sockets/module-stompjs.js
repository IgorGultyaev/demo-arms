/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/interop/StompSockets"], function (require, exports, core, StompSockets) {
    "use strict";
    exports.__esModule = true;
    core.createModule("stompjs", function (application, options) {
        options = options || {};
        /**
         * Проверка, настроена ли аутентификация в прложении.
         * @param app экземпляр Application
         * @returns true - настроена, иначе - false
         */
        function _isSecurity(app) {
            var configSecurity = app.config["security"];
            if (configSecurity) {
                return !!(configSecurity.formsAuth || configSecurity.openAuth);
            }
            return false;
        }
        return {
            initialize: function (app) {
                app.dataFacade.sockets = new StompSockets(options, app);
                // по умолчанию тоже переподклюяаемся
                if (typeof options.autoConnect === "undefined" || options.autoConnect) {
                    var _doConnect = function () { return app.dataFacade.sockets.connect(); };
                    var _onLogoutDoDisconnect = function () { return app.dataFacade.sockets.disconnect(); };
                    //при наличии аутентификации в приложении, подключаемся по событию логина пользователя
                    if (_isSecurity(app)) {
                        app.eventPublisher.subscribe("security.login", _doConnect);
                        app.eventPublisher.subscribe("security.logout", _onLogoutDoDisconnect);
                    }
                    else {
                        //при анонимном доступе, подключаемся по событию "app.start"
                        app.eventPublisher.subscribe("app.start", _doConnect);
                    }
                }
            }
        };
    });
});
//# sourceMappingURL=module-stompjs.js.map