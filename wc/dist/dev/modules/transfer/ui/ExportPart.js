/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!modules/transfer/ui/templates/ExportPart.hbs", "modules/transfer/Transfer", "i18n!modules/transfer/nls/resources"], function (require, exports, core, View, template, transfer, resourcesModule) {
    "use strict";
    var ExportPart = /** @class */ (function (_super) {
        __extends(ExportPart, _super);
        function ExportPart(app, options) {
            var _this = this;
            options = ExportPart.mixOptions(options, ExportPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.app = app;
            _this.title = options.title || resourcesModule["transfer.export"];
            _this.client = _this.options.client || new transfer.ExportClient(app);
            return _this;
        }
        ExportPart.defaultOptions = {
            template: template,
            scenario: undefined,
            client: undefined,
            commands: undefined,
            menu: { items: [
                    { name: "Abort", title: resourcesModule["transfer.cmd.abort"], order: 50 },
                    { name: "Close", title: resourcesModule["transfer.cmd.close"], order: 100 }
                ] }
        };
        return ExportPart;
    }(View));
    ExportPart.mixin(/** @lends ImportPart.prototype */ {
        defaultOptions: ExportPart.defaultOptions,
        /**
         * @observable-property {ImportPart#states}
         */
        state: core.lang.Observable.accessor("state"),
        /**
         * @observable-property {number}
         */
        progress: core.lang.Observable.accessor("progress")
    });
    (function (ExportPart) {
        var State;
        (function (State) {
            State[State["connecting"] = 0] = "connecting";
            State[State["initial"] = 1] = "initial";
            State[State["uploading"] = 2] = "uploading";
            State[State["startingUp"] = 3] = "startingUp";
            State[State["importing"] = 4] = "importing";
            State[State["aborting"] = 5] = "aborting";
            State[State["aborted"] = 6] = "aborted";
            State[State["failed"] = 7] = "failed";
            State[State["suspended"] = 8] = "suspended";
            State[State["completed"] = 9] = "completed";
            State[State["disposed"] = 10] = "disposed";
        })(State = ExportPart.State || (ExportPart.State = {}));
    })(ExportPart || (ExportPart = {}));
    return ExportPart;
});
//# sourceMappingURL=ExportPart.js.map