/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Part", "lib/utils"], function (require, exports, core, Part, utils) {
    "use strict";
    var lang = core.lang;
    /**
     * @exports PartCommandMixin
     */
    var PartCommandMixin = /** @class */ (function () {
        function PartCommandMixin() {
        }
        PartCommandMixin.prototype._createCommandOptions = function (basicOptions, args, cmdName) {
            var cmdOptions = this.getCommandOptions(args, cmdName);
            // mix with basicOptions
            cmdOptions = lang.extendEx(basicOptions, cmdOptions, { deep: true });
            // set other options
            cmdOptions.activateOptions = cmdOptions.activateOptions || {};
            cmdOptions.activateOptions.freezeUrl = lang.coalesce(cmdOptions.activateOptions.freezeUrl, cmdOptions.freezeUrl, this.options.freezeUrl);
            return cmdOptions;
        };
        PartCommandMixin.prototype._createCommandPart = function (cmdOptions, cmdName) {
            var partFactory = cmdOptions.part, part;
            // set part options
            cmdOptions.partOptions = cmdOptions.partOptions || {};
            if (lang.isString(partFactory) || lang.isFunction(partFactory)) {
                // partOptions can be a factory
                var partOptionsHandler = this._commandsOptHandlers && this._commandsOptHandlers[cmdName + "PartOptions"];
                if (partOptionsHandler) {
                    var partOptions = partOptionsHandler.call(this, cmdOptions);
                    // merge it with property restrictions and runtime options from args
                    lang.extendEx(cmdOptions.partOptions, partOptions, { deep: true });
                }
            }
            // execute callback
            var onBeforeCallback = this["onBefore" + cmdName];
            if (onBeforeCallback) {
                onBeforeCallback.call(this, cmdOptions);
            }
            partFactory = cmdOptions.part || partFactory;
            // create part
            if (lang.isString(partFactory)) {
                // option `part` can specify a name of the part ...
                part = core.createPart(partFactory, cmdOptions.partOptions);
            }
            else if (lang.isFunction(partFactory)) {
                // ... or a factory function ...
                part = partFactory.call(this, cmdOptions.partOptions, cmdOptions);
            }
            else {
                // ... or an instance of the part
                part = partFactory;
            }
            if (!part.navigationService && part.setNavigationService && this.navigationService) {
                part.setNavigationService(this.navigationService);
            }
            return part;
        };
        PartCommandMixin.prototype._openCommandPart = function (part, cmdOptions, cmdName) {
            var _this = this;
            cmdName = cmdName || cmdOptions.name;
            this.onNavigating({
                part: part,
                commandOptions: cmdOptions,
                commandName: cmdName
            });
            var originalOnReturn = cmdOptions.onReturn;
            var resultDeferred = core.lang.Deferred(), onAfterCallback = this["onAfter" + cmdName], onReturn = function (result) {
                if (onAfterCallback) {
                    onAfterCallback.call(_this, result, cmdOptions);
                }
                var args = {
                    result: result,
                    commandOptions: cmdOptions,
                    commandName: cmdName
                };
                _this.onNavigated(args);
                resultDeferred.resolve(result);
                if (originalOnReturn) {
                    return originalOnReturn(result);
                }
            };
            var navigatePromise;
            cmdOptions.part = part;
            cmdOptions.onReturn = onReturn;
            navigatePromise = this.navigationService.navigate(cmdOptions);
            return {
                part: part,
                opened: navigatePromise,
                closed: resultDeferred.promise()
            };
        };
        PartCommandMixin.prototype.getCommandOptions = function (args, cmdName) {
            args = args || {};
            cmdName = cmdName || args.name;
            var that = this, handler = cmdName && that._commandsOptHandlers && that._commandsOptHandlers[cmdName], cmdOptions;
            // 1. if options.commandsOptions[cmdName] - function then call it, else use it.
            if (handler) {
                cmdOptions = handler.call(that, args);
            }
            // 2. mix with default
            cmdOptions = lang.appendEx(args, cmdOptions, { deep: true });
            // NOTE: args.partOptions может быть функцией
            if (that.options && that.options.commandsOptions && cmdName) {
                cmdOptions = lang.appendEx(cmdOptions, that.options.commandsOptions[cmdName], { deep: true });
            }
            return cmdOptions;
        };
        /**
         * Create full command arguments, create a part for it and navigate to the part.
         * @param {Object} basicOptions Default arguments for the command.
         * @param {Object} args Runtime command arguments.
         * @param {String} cmdName Command name ("Create", "Edit", so on).
         * @returns {*}
         */
        PartCommandMixin.prototype.executePartCommand = function (basicOptions, args, cmdName) {
            cmdName = cmdName || (args && args.name);
            var cmdOptions = this._createCommandOptions(basicOptions, args, cmdName), // runtime options
            // we can have options for part creation or whole part factory
            part = this._createCommandPart(cmdOptions, cmdName);
            return this._openCommandPart(part, cmdOptions, cmdName);
        };
        PartCommandMixin.mixOptions = function (options, defaultOptions) {
            options = Part.mixOptions(options, defaultOptions);
            // save factory functions for commandOptions and partOptions in special field _commandsHandlers inside options object
            // NOTE: we'll remove it later in tweakOptions
            if (defaultOptions && defaultOptions.commandsOptions) {
                // the part supports commands with options
                var commandsHandlers_1 = options._commandsHandlers = options._commandsHandlers || {};
                lang.forEach(options.commandsOptions, function (cmdOptions, cmdName) {
                    if (!cmdOptions) {
                        return;
                    }
                    if (lang.isFunction(cmdOptions)) {
                        // The first factory function has higher priority
                        commandsHandlers_1[cmdName] = commandsHandlers_1[cmdName] || cmdOptions;
                        // If defaultOptions also has options for the command, we should mix them
                        var defaultCmdOptions = defaultOptions.commandsOptions[cmdName];
                        options.commandsOptions[cmdName] = lang.isPlainObject(defaultCmdOptions)
                            ? lang.appendEx({}, defaultCmdOptions, { deep: true })
                            : undefined;
                    }
                    else if (lang.isFunction(cmdOptions.partOptions)) {
                        var partOptionsName = cmdName + "PartOptions";
                        // The first factory function has higher priority
                        commandsHandlers_1[partOptionsName] = commandsHandlers_1[partOptionsName] || cmdOptions.partOptions;
                        // If defaultOptions also has partOptions for the command, we should mix them
                        var defaultCmdOptions = defaultOptions.commandsOptions[cmdName];
                        var defaultPartOptions = defaultCmdOptions && defaultCmdOptions.partOptions;
                        cmdOptions.partOptions = lang.isPlainObject(defaultPartOptions)
                            ? lang.appendEx({}, defaultPartOptions, { deep: true })
                            : undefined;
                    }
                });
            }
            return options;
        };
        /**
         * Called before opening a nested part
         */
        PartCommandMixin.prototype.onNavigating = function (args) {
            this.trigger("navigating", this, args);
        };
        /**
         * Called after closing a nested part
         */
        PartCommandMixin.prototype.onNavigated = function (args) {
            this.trigger("navigated", this, args);
        };
        /**
         * Subscribes methods `onNavigating/onNavigated` in options on events `navigating/navigated`
         */
        PartCommandMixin.prototype.subscribeOnNavigation = function () {
            utils.subscribeOnEvents(this, this.options, ["navigating", "navigated"]);
        };
        /**
         * Mixins all required methods from PartCommandMixin to target class
         * @param targetClass
         */
        PartCommandMixin.mixinTo = function (targetClass) {
            // mixin all instance members
            targetClass.mixin(PartCommandMixin);
            // mixin static method `mixOptions`
            targetClass.mixOptions = PartCommandMixin.mixOptions;
            // override `tweakOptions`
            // NOTE: Should NOT declare `tweakOptions` inside `PartCommandMixin.prototype`.
            // It calls `super` method, but inside prototype `super` is a `Part`. But it should call a method of base class
            // for `targetClass`. So override `tweakOptions` here.
            lang.override(targetClass.prototype, {
                tweakOptions: function (base, options) {
                    if (options._commandsHandlers) {
                        // clear options after executing mixOptions: move options._commandsHandlers to this._commandsOptHandlers
                        this._commandsOptHandlers = options._commandsHandlers;
                        delete options._commandsHandlers;
                    }
                    base.call(this, options);
                }
            });
        };
        return PartCommandMixin;
    }());
    return PartCommandMixin;
});
//# sourceMappingURL=PartCommandMixin.js.map