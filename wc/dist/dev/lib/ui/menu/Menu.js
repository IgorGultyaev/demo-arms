/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "underscore", "lib/ui/handlebars/View"], function (require, exports, core, _) {
    "use strict";
    var lang = core.lang;
    var keyCode = core.html.keyCode;
    var Menu = /** @class */ (function (_super) {
        __extends(Menu, _super);
        /**
         * @constructs Menu
         * @extends Observable
         * @param {...Object} options One or more options. If two or more arguments then options will be merged.
         * @param {Array} options.items Array of menu item specifications. When merging target items will be replaced.
         * @param {String} options.items.name
         * @param {String} [options.items.title]
         * @param {String} [options.items.commandName] Name of command
         * @param {Command} [options.items.command]
         * @param {String} [options.items.html]
         * @param {String} [options.items.icon]
         * @param {Number} [options.items.order]
         * @param {Boolean} [options.items.isDefaultAction]
         * @param {Boolean} [options.items.disabled]
         * @param {Boolean} [options.items.hideIfDisabled]
         * @param {Boolean} [options.items.hidden]
         * @param {Boolean} [options.items.disableIfEmpty] For items with sub-items only. Disable the parent item if sub-menu is empty or all its items are disabled.
         * @param {Array} options.remove Array of menu item names to remove when merge.
         * @param {Array} options.off Deprecated alias for options.remove
         * @param {Array} options.update Array of menu item specifications. When merging target items will be merged.
         * @param {Boolean} [options.radio]
         * @example
         * {
         *     items: [
         *         { name: "Edit", title: "Edit", command: core.createCommand({execute: function() {}}) }
         *     ]
         * }
         */
        function Menu(options) {
            var _this = _super.call(this) || this;
            var that = _this;
            // more than one options should be merged
            if (arguments.length > 1) {
                options = Menu.merge.apply(Menu, arguments);
                /*
                        } else if (arguments.length === 1 && lang.isArray(arguments[0])) {
                            options = Menu.merge.apply(Menu, arguments[0]);
                */
            }
            //that.options = lang.appendEx(that.options || options || {}, Menu.prototype.defaultOptions, {deep: true});
            that.options = options || {};
            // NOTE: различные экземпляры меню могут создаваться с одними и теми же опциями (например,
            // из Menu.Defaults). Однако, каждый экземпляр меню привязывается к различным экземплярам команд.
            // Поэтому необходимо клонировать элементы (items), чтобы привязка команд происходила корректно.
            that.items = lang.cloneEx(that.options.items, { deep: true });
            that.radio = that.options.radio;
            that._updateItems();
            return _this;
        }
        Menu.prototype.mergeWith = function (other) {
            var that = this;
            // TODO: support hierarchical menu (itemSpec.items)
            // WARN: производительность O(that.items.length * other.items.length). Можно that.items сначала загнать
            // в словарь и сделать производительность O(that.items.length + other.items.length).
            if (other.items) {
                for (var _i = 0, _a = other.items; _i < _a.length; _i++) {
                    var otherItem = _a[_i];
                    var item = that.getItem(otherItem.name);
                    if (item) {
                        lang.extend(item, otherItem);
                    }
                    else {
                        that.items.push(lang.clone(otherItem));
                    }
                }
            }
            that._updateItems();
        };
        /**
         * Get a menu item by predicate.
         * @param predicate A callback accepting a menu item
         * @return {Object}
         */
        Menu.prototype.findItem = function (predicate) {
            var resultItem;
            this._traverseItems(this.items, function (item) {
                if (predicate(item)) {
                    resultItem = item;
                    return true;
                }
            });
            return resultItem;
        };
        /**
         * Get a menu item by its name.
         * @param name name of menu item
         * @return {Object}
         */
        Menu.prototype.getItem = function (name) {
            return this.findItem(function (item) { return item.name === name; });
        };
        /**
         * Get command of menu item with the specified name.
         * @param {String} name
         * @return {Command}
         */
        Menu.prototype.getCommand = function (name) {
            var item = this.getItem(name);
            return item ? item.command : undefined;
        };
        /**
         * Remove item with specified name
         * @param {String} name
         */
        Menu.prototype.removeItem = function (name) {
            var that = this;
            for (var i = that.items.length - 1; i >= 0; i--) {
                var item = that.items[i];
                if (item.name === name) {
                    that.items.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        /**
         * Execute command of item with specified name.
         * @param {String} name Name of menu item
         * @param {Object} args Arguments for item's command
         */
        Menu.prototype.execute = function (name, args) {
            if (!name) {
                throw new Error("Menu.execute: name of a menu item is expected");
            }
            var item = this.getItem(name);
            if (!item) {
                throw new Error("Menu.execute: a menu item with name '" + name + "' was not found");
            }
            return this.executeItem(item, args);
        };
        /**
         * Execute command of specified item
         * @param {Object} item Menu item
         * @param {Object} args Arguments for item's command
         * @static
         */
        Menu.prototype.executeItem = function (item, args) {
            // WAS: if (!Menu.canExecuteItem(item)) return; (see WC-1637)
            if (!item.command) {
                return;
            }
            args = lang.extend({}, item.params, args, { name: item.name });
            return item.command.execute(args);
        };
        /**
         * Traverses all menu items recursively and call specified callback.
         * @param {Function} visitor A callback accepting a menu item
         * @returns {Boolean} true if visitor broke iteration (i.e. returned true)
         */
        Menu.prototype.acceptVisitor = function (visitor) {
            return this._traverseItems(this.items, visitor);
        };
        Menu.prototype._traverseItems = function (items, visitor) {
            if (!items) {
                return false;
            }
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                if (visitor(item)) {
                    return true;
                }
                if (this._traverseItems(item.items, visitor)) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Subscribe the specified callback on execution of any menu item.
         * Once the callback executed it's unsubscribed (i.e. it's executed only once).
         * @param {Function} callback If callback returns 'false' then it won't be unsubscribed
         */
        Menu.prototype.onceExecuted = function (callback) {
            var that = this, disposables = [];
            // subscribe on 'executed' event for each item's command
            that.acceptVisitor(function (item) {
                var disposable, command = item.command;
                if (command) {
                    disposable = command.subscribe("executed", function (args) {
                        var res = callback(args);
                        if (res !== false) {
                            for (var _i = 0, disposables_1 = disposables; _i < disposables_1.length; _i++) {
                                var disposable_1 = disposables_1[_i];
                                disposable_1.dispose();
                            }
                        }
                    });
                    disposables.push(disposable);
                }
            });
        };
        /**
         * Bind menu items to supplied commands.
         * @param {Object} commands A map where keys are command names, values are command instances.
         * @param {*} [ctx] A context used to call command factories (if item's `command` field is a function).
         * @param {Object} [params] Additional parameters for all menu items, they will be merged with items' own params.
         */
        Menu.prototype.bindToCommands = function (commands, ctx, params) {
            var that = this;
            var commandInstances = [];
            that.acceptVisitor(function (item) {
                // merge params
                if (params) {
                    item.params = lang.extend(item.params || {}, params);
                }
                // if menuitem doesn't have a command then try to substitute it from commands by name
                var commandLazy = item.command;
                if (commandLazy === undefined && commands) {
                    if (item.commandName) {
                        commandLazy = commands[item.commandName];
                    }
                    if (!commandLazy && item.name) {
                        commandLazy = commands[item.name];
                    }
                }
                // command may be a factory
                var command = lang.unlazy(commandLazy, ctx);
                // copy command's name/title into menuitem
                if (command && (!item.name || !item.title)) {
                    if (!item.name && command.name) {
                        item.name = command.name;
                    }
                    if (!item.title && command["title"]) {
                        item.title = command["title"];
                    }
                }
                if (item.getMenu && ctx) {
                    // item with dynamic submenu, bind getMenu to the context
                    item.getMenu = _.partial(item.getMenu, ctx);
                }
                if (that.radio && command) {
                    if (commandInstances.indexOf(command) < 0) {
                        // команда ранее не встречалась
                        commandInstances.push(command);
                    }
                }
                item.command = command;
            });
            if (commandInstances.length) {
                for (var _i = 0, commandInstances_1 = commandInstances; _i < commandInstances_1.length; _i++) {
                    var command = commandInstances_1[_i];
                    command.bind("executed", function (args) {
                        // Если команду выполняют явно, не через меню, то name может и не быть, но тогда мы не знаем к чему она относится
                        args = args || {};
                        var name = args.name;
                        if (name) {
                            if (args.result && lang.isPromise(args.result)) {
                                args.result.done(function () {
                                    that._toggleRadio(name);
                                });
                            }
                            else {
                                that._toggleRadio(name);
                            }
                        }
                    });
                }
            }
        };
        Menu.prototype.removeItemsWithoutCommand = function () {
            var that = this;
            if (!that.items) {
                return;
            }
            for (var i = that.items.length; i--;) {
                var item = that.items[i];
                // call recursively for the item
                Menu.prototype.removeItemsWithoutCommand.call(item);
                // keep the item with command or sub-items
                if (item.command || item.getMenu || item.items && item.items.length) {
                    continue;
                }
                // keep the divider only if it is not the first, not the last and not before another divider
                if (item.name === "divider" && i > 0 && i < that.items.length - 1 && that.items[i + 1].name !== "divider") {
                    continue;
                }
                // otherwise remove the item
                that.items.splice(i, 1);
            }
        };
        Menu.prototype.bindToPart = function (part, params) {
            var that = this;
            that.bindToCommands(part.commands, part, params);
            that.removeItemsWithoutCommand();
        };
        /**
         * Execute menu item with hotkey by given keyboard event
         * @param {jQuery.Event} event - keyboard event
         * @return {boolean} true if a menuItem executed
         */
        Menu.prototype.executeHotkey = function (event) {
            if (!event) {
                throw new Error("Menu.executeHotkey: there is no event was specified.");
            }
            var that = this, hotkeyItem = that.getHotkeyItem(event);
            if (hotkeyItem) {
                var $target = $(event.target);
                if ($target.is(":focus")) {
                    // force losing focus to update binding
                    $target.trigger("blur");
                    that.executeItem(hotkeyItem, {});
                    $target.trigger("focus");
                }
                else {
                    that.executeItem(hotkeyItem, {});
                }
                return true;
            }
            return false;
        };
        /**
         * Returns the menuitem with hotkey corresponding to the event
         * @param {jQuery.Event} event
         * @return {Object} menuItem
         */
        Menu.prototype.getHotkeyItem = function (event) {
            var that = this, 
            // get special keys if any
            special = Menu.specialKeys[event.which], 
            // get char if any
            character = (special === undefined) && String.fromCharCode(event.which).toLowerCase(), eventKeys = [];
            // process default action
            if (event.which === core.html.keyCode.ENTER && !event.ctrlKey && !event.altKey && !event.shiftKey) {
                return that.getDefaultItem();
            }
            // check control keys
            if (event.ctrlKey) {
                eventKeys.push("ctrl");
            }
            if (event.metaKey) {
                eventKeys.push("meta");
            }
            if (event.altKey) {
                eventKeys.push("alt");
            }
            if (event.shiftKey) {
                eventKeys.push("shift");
            }
            // build keys combination
            if (special) {
                eventKeys.push(special);
            }
            if (character) {
                eventKeys.push(character);
            }
            return that.findItem(function (item) {
                if (!item.hotKey)
                    return false;
                var menuItemKeys = item.hotKey.split("+");
                if (menuItemKeys.length !== eventKeys.length)
                    return false;
                return lang.every(eventKeys, function (ek) { return menuItemKeys.indexOf(ek) !== -1; }) && Menu.canExecuteItem(item);
            });
        };
        /**
         * Returns the item that should be executed by default
         * @returns {Item}
         */
        Menu.prototype.getDefaultItem = function () {
            return this.findItem(function (item) { return item.isDefaultAction && Menu.canExecuteItem(item); });
        };
        Menu.prototype.isEmpty = function () {
            return lang.isEmpty(this.items);
        };
        /**
         * Returns true if and only if the menu contains items for the specified commands
         * @param {Array} commands Array of commands
         * @returns {Boolean}
         */
        Menu.prototype.hasOnly = function (commands) {
            var found = 0;
            this.acceptVisitor(function (item) {
                if (!item.command) {
                    return true;
                }
                var idx = commands.indexOf(item.command);
                if (idx < 0) {
                    return true;
                }
                found++;
            });
            return commands.length === found;
        };
        Menu.prototype._updateItems = function () {
            var that = this;
            // sort items by order
            that.items = lang.sortBy(that.items, function (item) { return item.order || 0; });
            // copy params of items with submenu to their subitems
            that.acceptVisitor(function (item) {
                if (item.items && item.items.length && item.params) {
                    for (var _i = 0, _a = item.items; _i < _a.length; _i++) {
                        var subitem = _a[_i];
                        subitem.params = lang.extend({}, item.params, subitem.params);
                    }
                }
            });
        };
        Menu.prototype._toggleRadio = function (itemName) {
            var that = this;
            // NOTE: executed item is already selected, it can mean "unselected"
            if (that.options.radioToggle && that.selectedItem() === itemName) {
                that.selectedItem(undefined);
            }
            else {
                that.selectedItem(itemName);
            }
        };
        // NOTE: очень мутная реализация, а выигрыш в скорости весьма сомнителен
        //static merge(...sources: Options[]): Options {
        //	// TODO: support hierarchy (item.items)
        //
        //	// filter non-empty sources
        //	sources = sources.filter(source => !!source);
        //	// if only one arg is not empty, than return it
        //	if (sources.length === 1) {
        //		return sources[0];
        //	}
        //
        //	let options: Options = {}, // result options
        //		result: Item[] = [], // result items
        //		resultIndexMap: lang.Map<number[]> = {}; // mapping: name => array of indexes in result items
        //
        //	for (let source of sources) {
        //		// добавляем новые свойства
        //		options = lang.extend(options, source);
        //
        //		// отдельно обрабатываем свойства items, replace, remove/off, update
        //		let items = source.items,
        //			replace = source.replace,
        //			remove = source.remove || source.off,
        //			update = source.update;
        //		if (items) {
        //			result = [];
        //			resultIndexMap = {};
        //			for (let item of items) {
        //				let indices = resultIndexMap[item.name];
        //				if (!indices) {
        //					resultIndexMap[item.name] = [result.length];
        //				} else {
        //					indices.push(result.length);
        //				}
        //				result.push(lang.clone(item));
        //			}
        //		}
        //		if (replace) {
        //			let oldResult = result,
        //				oldResultIndexMap = resultIndexMap;
        //			result = [];
        //			resultIndexMap = {};
        //			for (let itemOrName of replace) {
        //				let item: Item = lang.isString(itemOrName) ? { name: itemOrName } : lang.clone(itemOrName),
        //					indices = resultIndexMap[item.name];
        //				if (!indices) {
        //					resultIndexMap[item.name] = [result.length];
        //				} else {
        //					indices.push(result.length);
        //				}
        //
        //				// find old item with the same name
        //				// NOTE: use only first found item
        //				let oldIndices = oldResultIndexMap[item.name],
        //					oldItem = oldIndices && oldIndices.length && oldResult[oldIndices[0]];
        //				if (oldItem) {
        //					item = lang.append(item, oldItem);
        //				}
        //
        //				result.push(item);
        //			}
        //		}
        //		if (remove) {
        //			for (let name of remove) {
        //				let indices = resultIndexMap[name];
        //				if (indices) {
        //					for (let i of indices) {
        //						delete result[i];
        //					}
        //					delete resultIndexMap[name];
        //				}
        //			}
        //		}
        //		if (update) {
        //			for (let item of update) {
        //				var indices: number[] = resultIndexMap[item.name];
        //				if (indices) {
        //					for (let i of indices) {
        //						lang.extend(result[i], item);
        //					}
        //				} else {
        //					resultIndexMap[item.name] = [result.length];
        //					result.push(lang.clone(item));
        //				}
        //			}
        //		}
        //	}
        //
        //	// delete items modifying props
        //	delete options.replace;
        //	delete options.remove;
        //	delete options.off;
        //	delete options.update;
        //
        //	// set non-empty items in result options
        //	options.items = result.filter(item => !!item);
        //
        //	return options;
        //}
        /**
         * Merge menu options
         * @static
         * @param {...Object} sources One or more options. If two or more arguments then options will be merged.
         * @param {Array} [sources.items] Array of menu item specifications. When merging target items will be ignored and totally replaced.
         * @param {Array} [sources.replace] Array of menu item specifications or names. When merging target items will be replaced, but items with the same names will be merged.
         * @param {Array} [sources.remove] Array of menu item names to remove when merge.
         * @param {Array} [sources.update] Array of menu item specifications. When merging target items will be merged.
         */
        Menu.merge = function () {
            // TODO: support hierarchy (item.items)
            var sources = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sources[_i] = arguments[_i];
            }
            // filter non-empty sources
            sources = sources.filter(function (source) { return !!source; });
            // if only one arg is not empty, than return it
            if (sources.length === 1) {
                return sources[0];
            }
            var options = {}, // result options
            result = []; // result items
            for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
                var source = sources_1[_a];
                // добавляем новые свойства
                options = lang.extend(options, source);
                // отдельно обрабатываем свойства items, replace, remove/off, update
                result = mergeItems(result, source);
            }
            // delete items modifying props
            delete options.replace;
            delete options.remove;
            delete options.off;
            delete options.update;
            options.items = result;
            return options;
        };
        /**
         * Returns default menu options for component with overrides in Menu.Defaults and Menu.Object
         * @static
         * @param defaultOptions
         * @param [componentName]
         * @param [objectName]
         * @return {*}
         */
        Menu.defaultsFor = function (defaultOptions, componentName, objectName) {
            var objectMenus = objectName && Menu.Object[objectName];
            return Menu.merge(defaultOptions, componentName && Menu.Defaults[componentName], objectMenus && objectMenus[componentName]);
        };
        /**
         * Returns HTML for the icon of menuItem
         * @static
         * @param menuItem
         * @return {String}
         */
        Menu.getIconHtml = function (menuItem) {
            var iconProvider = core.ui.iconProvider;
            return iconProvider && iconProvider.getIcon(menuItem.icon || menuItem.name) || "";
        };
        /**
         * Returns the encoded title for menuItem
         * @static
         * @param menuItem
         * @return {String}
         */
        Menu.getItemTitle = function (menuItem) {
            return lang.encodeHtml(menuItem.title || menuItem.name);
        };
        /**
         * Returns HTML for menuItem
         * @static
         * @param {Object} menuItem
         * @param {"both"|"icon"|"text"} [presentation]
         * @return {String}
         */
        Menu.getItemHtml = function (menuItem, presentation) {
            var html = menuItem.html, iconHtml, titleHtml;
            presentation = presentation || menuItem.presentation;
            if (html) {
                return lang.isFunction(html) ? html.call(menuItem) : html;
            }
            if (!presentation || presentation === "both") {
                iconHtml = Menu.getIconHtml(menuItem);
                var breakpoint = menuItem.labelHiddenBreakpoint;
                breakpoint = (breakpoint === false || breakpoint === "none") ? false : (breakpoint || "xs");
                if (breakpoint === true) {
                    breakpoint = "xs";
                }
                if (!iconHtml) {
                    breakpoint = false;
                }
                var className = void 0;
                if (breakpoint) {
                    // hidden-md means element is hidden ONLY at [992; 1200), this is useless
                    switch (breakpoint) {
                        case "xs":
                            className = "hidden-xs";
                            break;
                        case "sm":
                            className = "hidden-xs hidden-sm";
                            break;
                        case "md":
                            className = "hidden-xs hidden-sm hidden-md";
                            break;
                    }
                }
                titleHtml = "<span" + (className ? " class='" + className + "'" : "") + ">" + Menu.getItemTitle(menuItem) + "</span>";
                return iconHtml + titleHtml;
            }
            else if (presentation === "icon") {
                iconHtml = Menu.getIconHtml(menuItem);
                if (iconHtml) {
                    return iconHtml;
                }
            }
            return Menu.getItemTitle(menuItem);
        };
        /**
         * Return true if menu item can be executed
         * @static
         * @param {Object} menuItem
         * @returns {Boolean} true if menu item can be executed
         */
        Menu.canExecuteItem = function (menuItem) {
            if (!menuItem) {
                return false;
            }
            var command = menuItem.command;
            return command && command.execute && (!command.canExecute || command.canExecute());
        };
        Menu.isItemEnabled = function (item) {
            if (item.name === "divider" && !item.hidden) {
                return true;
            }
            if (item.hidden || item.disabled) {
                return false;
            }
            if (item.command)
                return item.command.canExecute();
            return item.items && item.items.length > 0;
        };
        Menu.isItemVisible = function (item) {
            if (item.name === "divider" && !item.hidden) {
                return true;
            }
            if (item.hidden || (item.disabled && item.hideIfDisabled)) {
                return false;
            }
            if (item.hideIfDisabled) {
                if (item.command) {
                    return item.command.canExecute();
                }
                return false;
            }
            return true;
        };
        Menu.create = function (options) {
            var menu = options;
            if (menu && menu.bind && menu.trigger && menu.selectedItem) {
                menu._updateItems();
                return menu;
            }
            return new Menu(options);
        };
        Menu.isEmpty = function (menu) {
            return !menu || menu.isEmpty();
        };
        /**
         * Описания меню компонентов по умолчанию
         * @type {Object}
         */
        Menu.Defaults = {};
        /**
         * Описания меню компонентов для отдельных типов
         * @type {Object}
         */
        Menu.Object = {};
        /**
         * Special key codes for executeHotKey method
         */
        Menu.specialKeys = (_a = {},
            _a[10] = "enter",
            _a[keyCode.ENTER] = "enter",
            _a[keyCode.ESCAPE] = "esc",
            _a[keyCode.SPACE] = "space",
            _a[keyCode.INSERT] = "ins",
            _a[keyCode.DELETE] = "del",
            _a[keyCode.BACKSPACE] = "backspace",
            _a[keyCode.TAB] = "tab",
            _a[keyCode.PAGE_UP] = "pageup",
            _a[keyCode.PAGE_DOWN] = "pagedown",
            _a[keyCode.END] = "end",
            _a[keyCode.HOME] = "home",
            _a[keyCode.LEFT] = "left",
            _a[keyCode.UP] = "up",
            _a[keyCode.RIGHT] = "right",
            _a[keyCode.DOWN] = "down",
            _a[keyCode.F1] = "f1",
            _a[keyCode.F2] = "f2",
            _a[keyCode.F3] = "f3",
            _a[keyCode.F4] = "f4",
            _a[keyCode.F5] = "f5",
            _a[keyCode.F6] = "f6",
            _a[keyCode.F7] = "f7",
            _a[keyCode.F8] = "f8",
            _a[keyCode.F9] = "f9",
            _a[keyCode.F10] = "f10",
            _a[keyCode.F11] = "f11",
            _a[keyCode.F12] = "f12",
            _a);
        __decorate([
            lang.decorators.observableAccessor()
        ], Menu.prototype, "selectedItem");
        return Menu;
    }(lang.Observable));
    function mergeItems(result, source) {
        var items = source.items, replace = source.replace, remove = source.remove || source.off, update = source.update;
        if (items) {
            result = items.map(function (item) { return lang.clone(item); });
        }
        if (replace) {
            result = replace.map(function (itemOrName) {
                var item = lang.isString(itemOrName) ? { name: itemOrName } : lang.clone(itemOrName), oldItem = lang.find(result, function (i) { return i.name === item.name; });
                return oldItem ? lang.append(item, oldItem) : item;
            });
        }
        if (remove) {
            result = result.filter(function (item) { return remove.indexOf(item.name) < 0; });
        }
        if (update) {
            for (var _i = 0, update_1 = update; _i < update_1.length; _i++) {
                var item = update_1[_i];
                var found = false;
                for (var _a = 0, result_1 = result; _a < result_1.length; _a++) {
                    var oldItem = result_1[_a];
                    if (oldItem.name === item.name) {
                        lang.extend(oldItem, item);
                        found = true;
                    }
                }
                if (!found) {
                    result.push(lang.clone(item));
                }
            }
        }
        return result;
    }
    /**
     * Register HB helper 'if-menu'.
     * @example
     * {{#if-menu myMenu}}...{{/if-menu}}
     */
    core.ui.View.Handlebars.registerHelper("if-menu", function (menu, options) {
        if (menu && !menu.isEmpty()) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    core.ui.Menu = Menu;
    var _a;
    return Menu;
});
//# sourceMappingURL=Menu.js.map