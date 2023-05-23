/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./ui/ImportPart", "./ui/ExportPart", "./Transfer"], function (require, exports, core, ImportPart, ExportPart, Transfer_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.__esModule = true;
    core.createModule("transfer", function (app, moduleOptions) {
        moduleOptions = moduleOptions || {};
        moduleOptions.apiRoute = moduleOptions.apiRoute || "api/_transfer";
        app.registerPart("ImportPart", function (options) {
            return new ImportPart(app, options);
        });
        app.registerPart("ExportPart", function (options) {
            return new ExportPart(app, options);
        });
    });
    __export(Transfer_1);
    function initializeArea(area) {
        area.title = "Transfer";
        area.transient = true;
        area.hidden(true);
        area.addState("import", "ImportPart" /*, {keepAlive: false}*/);
        area.addState("export", "ExportPart" /*, {keepAlive: false}*/);
    }
    exports.initializeArea = initializeArea;
});
//# sourceMappingURL=module-transfer.js.map