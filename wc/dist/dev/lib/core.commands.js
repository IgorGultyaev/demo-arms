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
    var Command = /** @class */ (function (_super) {
        __extends(Command, _super);
        /**
         * @constructs Command
         * @extends Observable
         */
        function Command() {
            return _super.call(this) || this;
        }
        // canExecute(): boolean;
        // canExecute(v: boolean): void;
        // execute(...args);
        // canExecute: lang.ObservableProperty<boolean>;
        // execute: (...args: any[]) => any;
        Command.prototype._prepareExecuteArgs = function (args) {
            var params = lang.extend({ name: this.name }, this.params);
            if (args.length > 0) {
                args[0] = lang.extend(params, args[0]);
            }
            else if (this.params) {
                args = [params];
            }
            return args;
        };
        Command.prototype._enrichWithResult = function (args, result) {
            if (result === undefined) {
                return args;
            }
            if (args.length > 0) {
                args[0].result = result;
            }
            else {
                args = [{ result: result }];
            }
            return args;
        };
        return Command;
    }(lang.Observable));
    exports.Command = Command;
    /**
     * Creates a new command.
     * @param {object|Function} spec A command specification (object with execute/canExecute) or `execute` method (then 2nd arg can be `canExecute`)
     * @param {Function|boolean} spec.canExecute
     * @param {Function} spec.execute
     * @param {Function} [canExecute]
     * @returns {Command}
     */
    function createCommand(spec, canExecute) {
        var cmd = new Command(), cmdSpec;
        if (lang.isFunction(spec)) {
            cmdSpec = { execute: spec };
            if (arguments.length === 2) {
                cmdSpec.canExecute = canExecute;
            }
        }
        else {
            cmdSpec = spec;
        }
        lang.extend(cmd, cmdSpec);
        if (!cmdSpec.hasOwnProperty("canExecute")) {
            cmd.declareProp("canExecute", true);
        }
        else if (typeof cmdSpec.canExecute !== "function") {
            cmd.declareProp("canExecute", cmdSpec.canExecute);
        }
        // NOTE: else cmd.canExecute is a function taken from cmdSpec
        if (!cmd.execute) {
            // cmdSpec didn't contain 'execute' method
            cmd.execute = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                args = this._prepareExecuteArgs(args);
                this.trigger.apply(this, ["executed"].concat(args));
            };
        }
        else {
            var executeMethod_1 = cmd.execute;
            // replace execute method with binded to command instance function and our additional logic:
            //  - inject additional command' params (from params field) into execute arguments (
            cmd.execute = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var that = this, res;
                if (!that.canExecute()) {
                    return;
                }
                args = that._prepareExecuteArgs(args);
                res = executeMethod_1.apply(that, args);
                args = that._enrichWithResult(args, res);
                that.trigger.apply(that, ["executed"].concat(args));
                return res;
            };
        }
        if (cmd.execute && cmdSpec.debounce) {
            var execMethod = cmd.execute;
            cmd.execute = lang.debounce(execMethod, cmdSpec.debounce);
        }
        return cmd;
    }
    exports.createCommand = createCommand;
    function canExecuteTrue() {
        return true;
    }
    var BoundCommand = /** @class */ (function (_super) {
        __extends(BoundCommand, _super);
        /**
         * @constructs BoundCommand
         * @extends Command
         * @param {Object} spec
         * @param {*} ctx
         */
        function BoundCommand(spec, ctx) {
            var _this = _super.call(this) || this;
            var that = _this, cmdSpec;
            if (lang.isFunction(spec)) {
                cmdSpec = { execute: spec };
                if (arguments.length >= 3) {
                    cmdSpec.canExecute = ctx;
                    ctx = arguments[2];
                }
            }
            else {
                cmdSpec = spec;
            }
            cmdSpec = cmdSpec || {};
            that._canExecute = cmdSpec.canExecute || canExecuteTrue;
            that._execute = cmdSpec.execute && cmdSpec.debounce
                ? lang.debounce(cmdSpec.execute, cmdSpec.debounce)
                : (cmdSpec.execute || lang.noop);
            lang.append(that, cmdSpec);
            that.context(ctx || that);
            return _this;
        }
        /**
         * @override
         * @returns {boolean}
         */
        BoundCommand.prototype.canExecute = function () {
            var that = this, ret = !!that._canExecute.apply(that.context(), arguments);
            // trick: if somebody wants to explicitly notify about changing 'canExecute', he can call:
            //   cmd.trigger("change", cmd, { prop: "canExecute" });
            //that.trigger("get", that, { prop: "canExecute", value: ret});
            return ret;
        };
        /**
         * @override
         * @returns {*}
         */
        BoundCommand.prototype.execute = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var that = this, ret;
            // NOTE: use that._context instead of that.context() to prevent observers notification
            if (!that._canExecute.call(that._context)) {
                return;
            }
            args = that._prepareExecuteArgs(args);
            ret = that._execute.apply(that.context(), args);
            args = that._enrichWithResult(args, ret);
            that.trigger.apply(that, ["executed"].concat(args));
            return ret;
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], BoundCommand.prototype, "context");
        return BoundCommand;
    }(Command));
    exports.BoundCommand = BoundCommand;
    /**
     * Creates a new bound command.
     * @param {Object} cmdSpec
     * @param {Function|Boolean} cmdSpec.canExecute
     * @param {Function} cmdSpec.execute
     * @param {Observable} [ctx]
     * @returns {Command}
     */
    function createBoundCommand() {
        return BoundCommand.create.apply(BoundCommand, arguments);
    }
    exports.createBoundCommand = createBoundCommand;
    /**
     * Gets name of a command from the attribute 'data-command-name' (or 'data-cmd-name')
     * @param $element jQuery set
     * @returns {String}
     * @static
     */
    function dataCommandName($element) {
        return $element.attr("data-command-name") || $element.attr("data-cmd-name");
    }
    exports.dataCommandName = dataCommandName;
    /**
     * Gets parameters for a command from the attribute 'data-command-params' (or 'data-cmd-params')
     * @param $element jQuery set
     * @returns {Object}
     * @static
     */
    function dataCommandParams($element) {
        var cmdParamsHtml = $element.attr("data-command-params") || $element.attr("data-cmd-params"), cmdParams;
        if (cmdParamsHtml && lang.isString(cmdParamsHtml)) {
            cmdParams = lang.parseJsonString(cmdParamsHtml);
        }
        return cmdParams || {};
    }
    exports.dataCommandParams = dataCommandParams;
    /**
     * Extracts command name/params from HTMLElement and executes menu item for the command.
     * @param $element
     * @param {Menu} menu
     * @param {Object} [args]
     * @return {boolean} true if a command was executed
     */
    function tryToExecuteHtmlCommand($element, menu, args) {
        var cmdName = dataCommandName($element), cmdParams, menuItem;
        if (cmdName) {
            cmdParams = lang.extend({}, dataCommandParams($element), args);
            menuItem = menu.getItem(cmdName);
            if (menuItem && menuItem.command) {
                menu.executeItem(menuItem, cmdParams);
                return true;
            }
            return false;
        }
    }
    exports.tryToExecuteHtmlCommand = tryToExecuteHtmlCommand;
    /**
     * Creates commands instances if they are specified as factory functions.
     * @param {ICommandLazyMap} commands
     * @param ctx
     * @returns {ICommandMap}
     */
    function unlazyCommands(commands, ctx) {
        lang.forEach(commands, function (command, name) {
            commands[name] = lang.unlazy(command, ctx);
        });
        return commands;
    }
    exports.unlazyCommands = unlazyCommands;
});
//# sourceMappingURL=core.commands.js.map