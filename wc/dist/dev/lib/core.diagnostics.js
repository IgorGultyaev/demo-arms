/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    exports.__esModule = true;
    /**
     * @exports "core.diagnostics"
     */
    var levels;
    (function (levels) {
        levels[levels["off"] = 0] = "off";
        levels[levels["error"] = 1] = "error";
        levels[levels["warn"] = 2] = "warn";
        levels[levels["info"] = 3] = "info";
        levels[levels["trace"] = 4] = "trace";
        levels[levels["debug"] = 5] = "debug";
    })(levels = exports.levels || (exports.levels = {}));
    /**
     * Global registry of class->level mappings
     * @private
     */
    var _traceSources = {};
    exports.defaultLevel = levels.trace;
    exports.defaultLevelKey = "diagnostics.tracing.defaultLevel";
    function setSourceLevel(className, level) {
        if (lang.isString(level)) {
            level = levels[level];
        }
        _traceSources[className] = level;
    }
    exports.setSourceLevel = setSourceLevel;
    function setDefaultLevel(level) {
        var lv;
        if (level !== undefined) {
            lv = lang.isString(level) ? levels[level] : level;
            exports.defaultLevel = lv;
        }
    }
    exports.setDefaultLevel = setDefaultLevel;
    function getSourceLevel(className) {
        return lang.coalesce(_traceSources[className], exports.defaultLevel);
    }
    exports.getSourceLevel = getSourceLevel;
    var TraceSource = /** @class */ (function () {
        /**
         * @constructs TraceSource
         * @param {String} [className] class/category name of the source
         * @param {String} [name] name of the instance (to distinguish several sources of the same class)
         */
        function TraceSource(className, name) {
            var that = this;
            that.className = className || "";
            that.name = name;
            _traceSources[className] || (_traceSources[className] = undefined);
        }
        TraceSource.prototype.enabled = function (level) {
            // debug (5) -> trace (4) -> info (3) -> warn (2) -> error (1) -> off (0)
            var that = this;
            if (lang.isString(level)) {
                level = levels[level];
            }
            if (that._level !== undefined) {
                return (level <= that._level);
            }
            if (!that.className) {
                return false;
            }
            // lookup in the global registry
            return (level <= getSourceLevel(that.className));
        };
        TraceSource.prototype._writeIf = function (level, methodName, originalArgs) {
            var that = this, console = window.console, args, method;
            if (console && that.enabled(level)) {
                method = console[methodName] || console.log;
                if (method) {
                    if (originalArgs.length === 1 && lang.isFunction(originalArgs[0])) {
                        args = [originalArgs[0]()];
                    }
                    else {
                        args = originalArgs;
                    }
                    if (args.length > 0 && lang.isString(args[0])) {
                        args[0] = that.className + (that.name ? "[" + that.name + "]" : "") + ": " + args[0];
                    }
                    else {
                        console.log(methodName + ": " + that.className + (that.name ? "[" + that.name + "]" : "") + " - see the following message:");
                    }
                    method.apply(console, args);
                }
            }
        };
        TraceSource.prototype.setLevel = function (level) {
            this._level = level;
        };
        TraceSource.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.trace, "log", args);
        };
        TraceSource.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.debug, "debug", args);
        };
        TraceSource.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.info, "info", args);
        };
        TraceSource.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.warn, "warn", args);
        };
        TraceSource.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.error, "error", args);
        };
        TraceSource.prototype.time = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.debug, "time", args);
        };
        TraceSource.prototype.timeEnd = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._writeIf(levels.debug, "timeEnd", args);
        };
        return TraceSource;
    }());
    exports.TraceSource = TraceSource;
});
//# sourceMappingURL=core.diagnostics.js.map