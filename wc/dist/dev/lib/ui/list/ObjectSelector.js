/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/list/ObjectList", "lib/ui/menu/Menu", "i18n!lib/nls/resources"], function (require, exports, core, ObjectList, Menu, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectSelector = /** @class */ (function (_super) {
        __extends(ObjectSelector, _super);
        /**
         * @constructs ObjectSelector
         * @extends ObjectList
         * @param {Application} app
         * @param {Object} options
         */
        function ObjectSelector(app, options) {
            var _this = this;
            options = ObjectSelector.mixOptions(options, ObjectSelector.defaultOptions);
            if (options.limits && options.limits.max === 1) {
                // единичный выбор (из peObject):
                options.selectionMode = "single";
            }
            _this = _super.call(this, app, options) || this;
            if (!_this.title && _this._entityType) {
                // TODO: в идеале заголовок должен быть "Выбор 'Типа'" (в родительном падеже)
                _this.title = lang.stringFormat(resources["objectSelector.title"], _this._entityType.descr);
            }
            return _this;
        }
        ObjectSelector.prototype.applyHostContext = function (opt) {
            var navOpt = _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, ObjectSelector.hostDefaultOptions);
            return navOpt;
        };
        /**
         * Checks if the node can be selected by default (w/o option selectionFilter)
         * @param item
         * @override
         * @returns {boolean}
         */
        ObjectSelector.prototype._isItemSelectable = function (item) {
            var excludeIds = this.options.excludeIds;
            if (excludeIds && excludeIds.length) {
                // object is selectable if it's not contained in excludeIds
                return (excludeIds.indexOf(item.id) < 0);
            }
            return true;
        };
        ObjectSelector.prototype.createListMenuDefaults = function () {
            return Menu.defaultsFor(ObjectSelector.defaultMenus.Selector, "Selector", this.entityType);
        };
        ObjectSelector.prototype.createRowMenuDefaults = function () {
            return Menu.defaultsFor(ObjectSelector.defaultMenus.SelectorRow, "SelectorRow", this.entityType);
        };
        /**
         * @protected
         * @override
         * @returns {{Reload: BoundCommand, Select: BoundCommand, Close: BoundCommand}}
         */
        ObjectSelector.prototype.createCommands = function () {
            var that = this;
            return lang.append(_super.prototype.createCommands.call(this), {
                Select: new core.commands.BoundCommand({
                    execute: that.select,
                    canExecute: that.canSelect,
                    debounce: that.options.commandsDebounce
                }, that),
                Close: new core.commands.BoundCommand({
                    execute: that.close,
                    debounce: that.options.commandsDebounce
                }, that)
            });
        };
        ObjectSelector.prototype.canSelect = function () {
            var limits = this.options.limits;
            if (!limits || !limits.min) {
                return true;
            }
            var length = this.currentItems().length;
            var can = length >= limits.min;
            if (can && limits && limits.max) {
                can = length <= limits.max;
            }
            return can;
        };
        ObjectSelector.prototype.select = function () {
            var that = this;
            that.close({
                result: { selection: that.currentItems() }
            });
        };
        ObjectSelector.prototype.close = function (args) {
            var nav = this.navigationService;
            if (nav) {
                nav.close(args && args.result);
            }
        };
        ObjectSelector.defaultOptions = {
            autoLoad: true,
            readOnly: true,
            hideExportMenu: true,
            presenterOptions: {},
            navigateOptions: {
                activateOptions: {
                    freezeUrl: true
                }
            },
            persistentSelection: true,
            /**
             * Array of ids of objects to exclude from selector
             * @type Array
             */
            excludeIds: undefined,
            limits: { min: 1 },
            commandsDebounce: 250
        };
        ObjectSelector.defaultMenus = {
            Selector: { items: [
                    {
                        name: "Reload",
                        title: resources["reload"],
                        icon: "refresh",
                        isDefaultAction: true,
                        order: 10
                    }
                ] },
            SelectorRow: { items: [
                    {
                        name: "Select",
                        title: resources["ok"],
                        icon: "ok",
                        isDefaultAction: true
                    }, {
                        name: "Close",
                        title: resources["cancel"],
                        icon: "cancel",
                        params: { result: false }
                    }
                ] }
        };
        ObjectSelector.hostDefaultOptions = {};
        __decorate([
            lang.decorators.constant(lang.append(ObjectSelector.defaultMenus, ObjectList.defaultMenus))
        ], ObjectSelector.prototype, "defaultMenus");
        return ObjectSelector;
    }(ObjectList));
    // backward compatibility: access to static fields via prototype
    ObjectSelector.mixin(/** @lends ObjectSelector.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: ObjectSelector.defaultOptions,
        /** @obsolete use static hostDefaultOptions */
        contextDefaultOptions: ObjectSelector.hostDefaultOptions
    });
    core.ui.ObjectSelector = ObjectSelector;
    return ObjectSelector;
});
//# sourceMappingURL=ObjectSelector.js.map