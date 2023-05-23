/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "i18n!./nls/resources"], function (require, exports, core, resources) {
    "use strict";
    exports.__esModule = true;
    core.createModule("ie-compatibility", function (app) {
        var minIeVersion = 8, msieVer, msgTemplate;
        // признак MSIE присуствует во всех версиях userAgent для IE вплоть до версии 10 включительно.
        // В IE11 строки MSIE нет, вместо нее добавили rv:11.0, однако в режиме
        // совместимости IE11 по-прежнему генерирует признак MSIE 7.0.
        // При желании IE11 можно опознать по наличию "Trident/X.Y" и "rv:11.0", если это вдруг надо.
        if (core.platform.browser && core.platform.browser.ie) {
            msieVer = core.platform.browser.ie.version;
            if ((msieVer && msieVer < minIeVersion) || !document["documentMode"] || document["documentMode"] < minIeVersion) {
                msgTemplate = resources["compatibility.ie.warning"];
                if (navigator && core.lang.stringStartsWith(core.platform.language(), "ru")) {
                    msgTemplate = msgTemplate.replace("{0}", "Сервис / Параметры просмотра в режиме совместимости");
                }
                else {
                    msgTemplate = msgTemplate.replace("{0}", "Tools / Compatibility View settings");
                }
                app.eventPublisher.publish("app.compatibility", new core.SystemEvent({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "high",
                    message: msgTemplate,
                    severity: "warning"
                }));
            }
        }
    });
});
//# sourceMappingURL=module-ie-compatibility.js.map