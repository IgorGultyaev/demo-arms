/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Part"], function (require, exports, $, core, Part) {
    "use strict";
    exports.__esModule = true;
    function getElement(locator) {
        var $element = $("*[data-part-name='" + locator + "']");
        if ($element.length === 0) {
            $element = $(locator);
        }
        return $element;
    }
    exports.automation = {
        setValue: function (partName, expr, value) {
            var $element = getElement(partName);
            $element.trigger("automation", { cmd: "setValue", expr: expr, part: partName, data: value });
        },
        getValue: function (partName, expr) {
            var $element = getElement(partName);
            var args = { cmd: "getValue", expr: expr, part: partName, result: undefined };
            $element.trigger("automation", args);
            return args.result;
        },
        exec: function (partName, expr, data) {
            var $element = getElement(partName);
            var args = { cmd: "exec", expr: expr, part: partName, data: data, result: undefined };
            $element.trigger("automation", args);
            return args.result;
        },
        execAsync: function (partName, expr, done, data) {
            var $element = getElement(partName);
            $element.trigger("automation", { cmd: "exec", expr: expr, part: partName, done: done, data: data });
        }
    };
    // TODO: how to augment Part:
    /* not working:
    interface Part {
     executeAutomation(args: AutomationEventArgs): void;
    }
    **/
    Part.prototype["executeAutomation"] = function executeAutomation(args) {
        var that = this;
        if (args.expr) {
            console.log("AUTOMATION: executing '" + args.cmd + "' command for part '" + args.part + "' with expression: " + args.expr);
            var func = void 0;
            var params = [];
            var result = void 0;
            if (core.lang.isFunction(args.expr)) {
                func = args.expr;
                if (args.data !== undefined) {
                    params = [that, args.data, core];
                }
                else {
                    params = [that, core];
                }
            }
            else if (core.lang.isString(args.expr)) {
                var expr = "var core = arguments[0], part = arguments[1], viewModel = arguments[2], data = arguments[3];\n";
                if (args.cmd === "setValue") {
                    // expr = expr + "core.lang.set(part, '" + args.expr + "', data)";
                    expr = expr + "part." + args.expr + "(data);";
                }
                else if (args.cmd === "exec" || args.cmd === "getValue") {
                    expr = expr + " return (" + args.expr + ");";
                }
                func = new Function(expr);
                params = [core, that, that.viewModel, args.data];
            }
            else {
                throw new Error("AUTOMATION: unexpected expressions type: " + args.expr);
            }
            try {
                result = func.apply(that, params);
            }
            catch (ex) {
                console.log("AUTOMATION: command failed");
                console.error(ex);
                throw ex;
            }
            if (args.done && result && core.lang.isPromise(result)) {
                // async execution
                return result.then(function (res) {
                    console.log("AUTOMATION: calling done callback asynchronously");
                    // вернуть результат можно только если он сериализуемый
                    if (args.cmd === "getValue") {
                        args.done(res);
                    }
                    else {
                        args.done();
                    }
                }, function (err) {
                    console.log("AUTOMATION: command failed");
                    console.error(err);
                    // как передать ошибку?
                    args.done();
                });
            }
            console.log("AUTOMATION: successfully executed, result: " + result);
            args.result = result;
            if (args.done) {
                console.log("AUTOMATION: calling done callback");
                args.done(result);
            }
        }
    };
    core.lang.override(Part.prototype, {
        doRender: function (base, domElement) {
            var that = this;
            base.call(that, domElement);
            // Automation API
            var $domElement = $(domElement);
            if (that.name) {
                $domElement.attr("data-part-name", that.name);
            }
            else if (that.constructor && that.constructor.name) {
                $domElement.attr("data-part-name", that.constructor.name);
            }
            //$domElement.data("part", that);
            $domElement.on("automation", function (event, args) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
                that.executeAutomation(args);
                return false;
            });
        }
    });
    window.automation = exports.automation;
});
//# sourceMappingURL=automation.js.map