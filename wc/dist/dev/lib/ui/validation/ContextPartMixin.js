/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/ConfirmDialog", "./ViolationInfoPart", "i18n!lib/nls/resources"], function (require, exports, core, ConfirmDialog, ViolationInfoPart, resources) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    var ContextPartComponentMixin = /** @class */ (function () {
        function ContextPartComponentMixin() {
        }
        ContextPartComponentMixin.prototype._onViolationsChanged = function () {
            var that = this, parts = that.contextParts.all().slice();
            // remove violation parts
            parts = parts.filter(function (part) {
                var partVio = part;
                // remove (and dispose) part of local violation
                if (!!partVio.violation && !partVio.persistent) {
                    part.dispose();
                    return false;
                }
                return true;
            });
            that.violations.forEach(function (violation) {
                if (!violation) {
                    return;
                }
                var message = violation.error;
                if (message) {
                    var violationPart_1 = new ViolationInfoPart({
                        message: message,
                        severity: violation.severity,
                        menu: violation.menu
                    });
                    if (violation.menu) {
                        // при выполнении любой команды из меню (if any), надо закрыть парт
                        violation.menu.onceExecuted(function () {
                            that.closeContextPart(violationPart_1);
                        });
                    }
                    violationPart_1.violation = violation;
                    parts.push(violationPart_1);
                }
            });
            that.contextParts.reset(parts);
        };
        ContextPartComponentMixin.prototype._disposeParts = function () {
            this.contextParts.forEach(function (part) {
                if (part.dispose) {
                    part.dispose();
                }
            });
            this.contextParts.clear();
        };
        ContextPartComponentMixin.prototype._hasValidationErrors = function (violations) {
            return violations && violations.length && violations.filter(function (v) { return !v.severity || v.severity === "error"; }).length > 0;
        };
        ContextPartComponentMixin.prototype._canIgnoreViolations = function (violations) {
            if (!violations || !violations.length) {
                return lang.resolved();
            }
            var errors = violations.filter(function (v) { return !v.severity || v.severity === "error"; });
            if (errors.length > 0) {
                return lang.rejected();
            }
            // NOTE: there are only ignorable violations (warnings and infos). Ask user about them.
            var dialog = new ConfirmDialog({
                header: this.title,
                text: resources["validation.ui.ignore_warnings_prompt"]
            });
            return dialog.open().then(function (result) {
                if (result !== "yes") {
                    return lang.rejected();
                }
            });
        };
        ContextPartComponentMixin.prototype._validateBeforeSave = function () {
            var _this = this;
            var violations = this.runValidation();
            return this._canIgnoreViolations(violations)
                .done(function () {
                _this.violations.clear();
            })
                .fail(function () {
                if (_this.presenter.activateContextParts) {
                    _this.presenter.activateContextParts();
                }
            });
        };
        /**
         * Remove context part from editor and dispose it
         * @param {ViolationInfoPart} part - part to close
         */
        ContextPartComponentMixin.prototype.closeContextPart = function (part) {
            if (!part) {
                throw new Error("No part were defined for 'closeContextPart' method");
            }
            this.contextParts.remove(part);
            if (part.dispose) {
                part.dispose();
            }
        };
        return ContextPartComponentMixin;
    }());
    exports.ContextPartComponentMixin = ContextPartComponentMixin;
});
//# sourceMappingURL=ContextPartMixin.js.map