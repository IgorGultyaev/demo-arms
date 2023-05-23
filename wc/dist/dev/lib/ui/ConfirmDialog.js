/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/menu/Menu", "lib/ui/Dialog", "i18n!lib/nls/resources"], function (require, exports, core, Menu, Dialog, resources) {
    "use strict";
    var ConfirmDialog = /** @class */ (function (_super) {
        __extends(ConfirmDialog, _super);
        /**
         * Dialog with default menu consisting of two items: "yes" and "no".
         * @constructs ConfirmDialog
         * @extends Dialog
         * @param {Object} options
         */
        function ConfirmDialog(options) {
            var _this = this;
            options = ConfirmDialog.mixOptions(options, ConfirmDialog.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ConfirmDialog.prototype.getHeader = function () {
            return _super.prototype.getHeader.call(this) || document.title;
        };
        ConfirmDialog.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(ConfirmDialog.defaultMenu, "ConfirmDialog");
        };
        ConfirmDialog.defaultMenu = {
            items: [
                { name: "yes", title: resources["yes"], isDefaultAction: true },
                { name: "no", title: resources["no"] }
            ]
        };
        return ConfirmDialog;
    }(Dialog));
    ConfirmDialog.mixin({
        defaultMenu: ConfirmDialog.defaultMenu
    });
    core.ui.ConfirmDialog = ConfirmDialog;
    return ConfirmDialog;
});
//# sourceMappingURL=ConfirmDialog.js.map