/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/editor/ObjectEditor"], function (require, exports, core, ObjectEditor) {
    "use strict";
    var lang = core.lang;
    var ObjectViewer = /** @class */ (function (_super) {
        __extends(ObjectViewer, _super);
        /**
         * @constructs ObjectViewer
         * @extends ObjectEditor
         * @param {Object} options
         */
        function ObjectViewer(options) {
            var _this = this;
            options = ObjectViewer.mixOptions(options, ObjectViewer.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        ObjectViewer.prototype._onCreatePropEditor = function (page, propMd, viewModel) {
            var mixedPropMd = _super.prototype._onCreatePropEditor.call(this, page, propMd, viewModel);
            mixedPropMd.readOnly = true;
            if (this.options.disableValuesNavigation) {
                mixedPropMd.disabled = true;
                mixedPropMd.navigable = false;
            }
            return mixedPropMd;
        };
        ObjectViewer.prototype.onQueryUnload = function (options) {
            // do nothing
            return undefined;
        };
        ObjectViewer.prototype.onQueryUnloadWithChanges = function (options) {
            // do nothing
            return undefined;
        };
        ObjectViewer.prototype.queryNavigateSibling = function () {
            // do nothing
            return undefined;
        };
        ObjectViewer.defaultOptions = {
            disableValuesNavigation: undefined,
            cssRootClass: "x-editor-base x-editor-viewer"
        };
        ObjectViewer.defaultMenus = {
            Editor: { items: [
                    { name: "CancelAndClose", title: core.nls.resources.close, icon: "close" }
                ] },
            RootEditor: { items: [
                    { name: "CancelAndClose", title: core.nls.resources.close, icon: "close" }
                ] }
        };
        __decorate([
            lang.decorators.constant(ObjectViewer.defaultMenus)
        ], ObjectViewer.prototype, "defaultMenus");
        __decorate([
            lang.decorators.constant("viewer")
        ], ObjectViewer.prototype, "contextName");
        return ObjectViewer;
    }(ObjectEditor));
    ObjectViewer.mixin({
        defaultOptions: ObjectViewer.defaultOptions
    });
    core.ui.ObjectViewer = ObjectViewer;
    return ObjectViewer;
});
//# sourceMappingURL=ObjectViewer.js.map