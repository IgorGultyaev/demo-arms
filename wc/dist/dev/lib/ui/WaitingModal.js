/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/ui/handlebars/View", "i18n!lib/nls/resources", "xhtmpl!lib/ui/templates/WaitingModal.hbs", "bootstrap"], function (require, exports, $, lang, View, resources, defaultTemplate) {
    "use strict";
    var g_rootDialog;
    var g_waitingInstance;
    var g_tasksCount = 0;
    var WaitingModal = /** @class */ (function (_super) {
        __extends(WaitingModal, _super);
        /**
         * @class WaitingModal
         * @extends View
         * @param {Object} options
         */
        function WaitingModal(options) {
            var _this = this;
            options = WaitingModal.mixOptions(options, WaitingModal.defaultOptions);
            _this = _super.call(this, options) || this;
            if (_this.options.text) {
                _this.text(_this.options.text);
            }
            return _this;
        }
        WaitingModal.prototype.render = function (domElement) {
            _super.prototype.render.call(this, domElement);
        };
        WaitingModal.prototype.doRender = function (domElement) {
            var that = this;
            if (that.options.inplace) {
                _super.prototype.doRender.call(this, domElement);
                return;
            }
            if (!domElement) {
                // preventing several root dialogs (it makes Chrome to crash!)
                if (g_rootDialog) {
                    return g_rootDialog;
                }
                this._isRoot = true;
            }
            var modalRoot = $("<div class='modal' tabIndex='-1' />");
            var modalContent = $("<div class='modal-content' />");
            modalRoot.appendTo(domElement || document.body);
            if (!domElement) {
                g_rootDialog = modalRoot;
            }
            $("<div class='modal-dialog'></div>").appendTo(modalRoot).append(modalContent);
            _super.prototype.doRender.call(this, modalContent);
            that.modalRoot = modalRoot;
            modalRoot.on("hidden.bs.modal", function () {
                that.modalRoot.remove();
                if (that._isRoot) {
                    g_rootDialog = null;
                }
            });
            modalRoot.modal({
                backdrop: "static",
                keyboard: false
            });
        };
        WaitingModal.prototype.unload = function (options) {
            if (this.modalRoot) {
                this.modalRoot.modal("hide");
            }
            _super.prototype.unload.call(this, options);
        };
        WaitingModal.executeTask = function (task, domElement, options) {
            if (!task) {
                throw "task cannot be null";
            }
            options = options || {};
            var waiting;
            var blockUI = function () {
                if (task.state() !== "pending") {
                    return;
                }
                waiting = (!options.inplace && g_waitingInstance) || new WaitingModal(options);
                if (!waiting.domElement) {
                    waiting.render(domElement);
                }
            };
            if (!options.inplace) {
                g_tasksCount++;
            }
            if (options.blockTimeout) {
                window.setTimeout(function () {
                    blockUI();
                }, options.blockTimeout);
            }
            else {
                blockUI();
            }
            task.always(function () {
                if (!options.inplace) {
                    --g_tasksCount;
                    if (!g_tasksCount && waiting && waiting.domElement) {
                        waiting.dispose();
                        g_waitingInstance = null;
                    }
                }
                else if (waiting) {
                    waiting.dispose();
                }
            });
            return task;
        };
        WaitingModal.defaultOptions = {
            text: resources["wait"],
            template: defaultTemplate,
            unbound: true,
            inplace: false // don't create modal dialog and show "waiting" inside the specified DOM element
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], WaitingModal.prototype, "text");
        return WaitingModal;
    }(View));
    // backward compatibility: access to static fields via prototype
    WaitingModal.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: WaitingModal.defaultOptions
    });
    return WaitingModal;
});
//# sourceMappingURL=WaitingModal.js.map