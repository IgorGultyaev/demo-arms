/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "i18n!lib/nls/resources"], function (require, exports, resources) {
    "use strict";
    exports.__esModule = true;
    /**
     * Creates "Operation was canceled" error.
     * @returns {Error}
     */
    function canceled() {
        var e = new Error(resources["operation_was_canceled"]);
        e.isCanceled = true;
        return e;
    }
    exports.canceled = canceled;
    /**
     * Checks error whether it's a "canceled" error.
     * @param {Error} error
     * @returns {boolean}
     */
    function isCanceled(error) {
        return error && error.isCanceled;
    }
    exports.isCanceled = isCanceled;
    /**
     * Checks if an error isn't an infrastructure failure.
     * @param {Error} error
     * @returns {boolean}
     */
    function isUnrecoverableError(error) {
        // Bad Data: повторять нельзя:
        // 400 - Bad Request
        // 403 - Forbidden
        // 409 - Conflict
        if (error) {
            var type = error.$className;
            return error.httpStatus === 400 || error.httpStatus === 403 || error.httpStatus === 409 ||
                isCanceled(error) ||
                type === "XSecurityException" ||
                type === "XInvalidDataException" ||
                type === "XBusinessLogicException" ||
                type === "XObjectNotFoundException" ||
                type === "XOptimisticConcurrencyException" ||
                type === "XIntegrityViolationException" ||
                type === "XReferenceIntegrityViolationException";
        }
        return false;
    }
    exports.isUnrecoverableError = isUnrecoverableError;
    function isObjectNotFound(error) {
        return error.serverError && error.$className === "XObjectNotFoundException";
    }
    exports.isObjectNotFound = isObjectNotFound;
    function isOptimisticConcurrency(error) {
        return error.serverError && error.$className === "XOptimisticConcurrencyException";
    }
    exports.isOptimisticConcurrency = isOptimisticConcurrency;
    function unknownPart(partName) {
        var e = new Error("Cannot find a part with name '" + partName + "'");
        e.isUnknownPart = true;
        return e;
    }
    exports.unknownPart = unknownPart;
    function isUnknownPart(error) {
        return error && error.isUnknownPart;
    }
    exports.isUnknownPart = isUnknownPart;
});
//# sourceMappingURL=core.eth.js.map