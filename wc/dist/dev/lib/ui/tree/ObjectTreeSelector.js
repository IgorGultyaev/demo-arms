/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/tree/ObjectTree", "lib/ui/menu/Menu", "i18n!lib/nls/resources"], function (require, exports, core, ObjectTree, Menu, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectTreeSelector = /** @class */ (function (_super) {
        __extends(ObjectTreeSelector, _super);
        /**
         * @constructs ObjectTreeSelector
         * @extends ObjectTree
         * @param {Application} app
         * @param {Object} options
         */
        function ObjectTreeSelector(app, options) {
            var _this = this;
            options = ObjectTreeSelector.mixOptions(options, ObjectTreeSelector.defaultOptions);
            _this = _super.call(this, app, options) || this;
            if (!_this.title && _this.options.entityType) {
                var entityMeta = _this.app.model.meta.entities[_this.options.entityType];
                if (entityMeta) {
                    _this.title = lang.stringFormat(resources["objectSelector.title"], entityMeta.descr);
                }
            }
            return _this;
        }
        ObjectTreeSelector.prototype.applyHostContext = function (opt) {
            var navOpt = _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, ObjectTreeSelector.hostDefaultOptions);
            return navOpt;
        };
        ObjectTreeSelector.prototype.createNodeMenuDefaults = function (node) {
            var identity = this.getNodeIdentity(node);
            return Menu.defaultsFor(ObjectTreeSelector.defaultMenus.TreeNode, "ObjectTreeSelectorNode", identity.type);
        };
        ObjectTreeSelector.prototype.createCommands = function () {
            var that = this;
            return lang.append(_super.prototype.createCommands.call(this), {
                Select: new core.commands.BoundCommand(that.doSelect, that.canSelect, that),
                Close: new core.commands.BoundCommand(that.doClose, that)
            });
        };
        ObjectTreeSelector.prototype._isNodeSelectable = function (node) {
            if (!_super.prototype._isNodeSelectable.call(this, node)) {
                return false;
            }
            var that = this, entityType = that.options.entityType, excludeIds = that.options.excludeIds, identity;
            if (entityType) {
                identity = that.getNodeIdentity(node);
                if (identity && identity.type !== entityType) {
                    return false;
                }
            }
            if (excludeIds && excludeIds.length) {
                identity = identity || that.getNodeIdentity(node);
                if (identity && excludeIds.indexOf(identity.id) >= 0) {
                    return false;
                }
            }
            return true;
        };
        ObjectTreeSelector.prototype.doSelect = function () {
            var selectionData = this.currentNodes().map(function (node) { return node.data(); });
            // NOTE: different nodes may have the same data, make unique
            selectionData = lang.unique(selectionData);
            this.close({
                result: { selection: selectionData }
            });
        };
        ObjectTreeSelector.prototype.canSelect = function () {
            return !!this.currentNodes().length;
        };
        ObjectTreeSelector.prototype.doClose = function () {
            this.close();
        };
        ObjectTreeSelector.prototype.close = function (args) {
            var nav = this.navigationService;
            if (nav) {
                nav.close(args && args.result);
            }
        };
        ObjectTreeSelector.defaultOptions = {
            autoLoad: true,
            navigateOptions: {
                activateOptions: {
                    freezeUrl: true
                }
            },
            presenterOptions: {
                hideMenuNode: false
            }
        };
        ObjectTreeSelector.defaultMenus = {
            TreeNode: { items: [
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
        ObjectTreeSelector.hostDefaultOptions = {};
        __decorate([
            lang.decorators.constant(lang.append(ObjectTreeSelector.defaultMenus, ObjectTree.prototype.defaultMenus))
        ], ObjectTreeSelector.prototype, "defaultMenus");
        return ObjectTreeSelector;
    }(ObjectTree));
    ObjectTreeSelector.mixin(/** @lends ObjectTreeSelector.prototype */ {
        defaultOptions: ObjectTreeSelector.defaultOptions,
        contextDefaultOptions: ObjectTreeSelector.hostDefaultOptions
    });
    core.ui.ObjectTreeSelector = ObjectTreeSelector;
    return ObjectTreeSelector;
});
//# sourceMappingURL=ObjectTreeSelector.js.map