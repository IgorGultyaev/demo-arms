/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/domain/support", "lib/ui/ObjectComparePart", "lib/ui/menu/Menu", "xhtmpl!lib/ui/templates/ObjectResolutionPart.hbs", "i18n!lib/nls/resources", "lib/interop/.interop.types"], function (require, exports, core, support, ObjectComparePart, Menu, defaultTemplate, resources, _interop_types_1) {
    "use strict";
    var lang = core.lang;
    var ObjectResolutionPart = /** @class */ (function (_super) {
        __extends(ObjectResolutionPart, _super);
        /**
         * @class ObjectResolutionPart
         * @extends ObjectComparePart
         * @param {Object} options
         * @param {} options.local
         */
        function ObjectResolutionPart(options) {
            var _this = this;
            options = ObjectResolutionPart.mixOptions(options, ObjectResolutionPart.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.commands = _this.createCommands();
            _this.menu = _this.createMenu();
            if (_this.menu) {
                _this.menu.bindToPart(_this);
            }
            return _this;
        }
        ObjectResolutionPart.prototype.createMenu = function () {
            return new Menu(ObjectResolutionPart.defaultMenu, this.options.menu);
        };
        /**
         * @protected
         * @returns {{Resolve: (Command), ConfirmDeletion: {Command}, Cancel: (Command)}}
         */
        ObjectResolutionPart.prototype.createCommands = function () {
            var that = this, commands = {};
            if (that.isLocalRemoved()) {
                commands.ConfirmDeletion = core.createCommand({
                    execute: that.doConfirmDeletion.bind(that)
                });
            }
            else {
                commands.Resolve = core.createCommand({
                    execute: that.doResolve.bind(that)
                });
            }
            commands.Cancel = core.createCommand({
                execute: that.doCancel.bind(that)
            });
            commands = core.lang.extend(commands, that.options.commands);
            return commands;
        };
        ObjectResolutionPart.prototype.setViewModel = function () {
            var that = this, local, original, isLocalRemoved, preloads, deferreds = [];
            that.isLoading(true);
            // init local
            if (!that.options.local) {
                throw new Error("You must specify 'local' option");
            }
            local = that._initLocal(that.options.local);
            isLocalRemoved = local.isRemoved() || local.isInvalid();
            if (isLocalRemoved) {
                that.hint = resources["objectResolution.info.removed"];
                that.hintSeverity = "warning";
            }
            that.isLocalRemoved(isLocalRemoved);
            // init original
            if (that.options.original) {
                original = that._initOriginal(that.options.original);
            }
            else {
                that._initOriginal(local.meta.name, local.id);
            }
            // load properties of server object, which are specified in local object
            preloads = Object.keys(that.options.local)
                .filter(function (prop) { return local.meta.props[prop]; });
            deferreds.push(original.load({
                reload: true,
                preloads: preloads,
                policy: _interop_types_1.LoadRule.remoteOnly
            }).done(function (loaded) {
                that.original(loaded);
            }));
            // load all value objects of navigated properties for local object
            // NOTE: we shouldn't load navigation properties themselves, because it may overwrite
            // their current local values
            if (!that.isLocalRemoved()) {
                lang.forEach(local.meta.props, function (propMeta, propName) {
                    var v = local.get(propName), failFilter = function () {
                        // ignore any error while loading value objects (they may be new or already deleted)
                        return lang.resolved();
                    };
                    if (v && !v.isLoaded && !v.isGhost) {
                        if (!propMeta.many) {
                            deferreds.push(local.uow.ensurePropLoaded(local, propName)
                                .then(null, failFilter));
                        }
                        else {
                            v.all().forEach(function (item) {
                                deferreds.push(local.uow.ensureLoaded(item)
                                    .then(null, failFilter));
                            });
                        }
                    }
                });
            }
            lang.when.apply(lang, deferreds).done(function () {
                // everything is loaded here. Init properties.
                that._initPropsModels();
                // changing 'checkedAll' must change 'checked' for every prop and vice versa
                that.bind("change:checkedAll", that._onCheckedAllChanged, that);
                that.props().all().forEach(function (prop) {
                    prop.bind("change:checked", that._onCheckedPropChanged, that);
                });
            }).fail(function (error) {
                // TODO: use core.diagnostics
                console.error(error);
            }).always(function () {
                that.isLoading(false);
            });
        };
        ObjectResolutionPart.prototype._onCheckedAllChanged = function () {
            var that = this;
            if (that._checking) {
                return;
            }
            that._checking = true;
            try {
                var checkedAll_1 = that.checkedAll();
                that.props().all().forEach(function (prop) {
                    if (!prop.isPropEqual()) {
                        prop.checked(checkedAll_1);
                    }
                });
            }
            finally {
                that._checking = undefined;
            }
        };
        ObjectResolutionPart.prototype._onCheckedPropChanged = function () {
            var that = this, checkedAll;
            if (that._checking) {
                return;
            }
            that._checking = true;
            try {
                checkedAll = that.props().all().every(function (prop) {
                    return prop.checked() || prop.isPropEqual();
                });
                that.checkedAll(checkedAll);
            }
            finally {
                that._checking = undefined;
            }
        };
        ObjectResolutionPart.prototype.doResolve = function () {
            var that = this, local = that.local(), original = that.original(), json = original.createJsonStub();
            that.props().all().forEach(function (prop) {
                var propMeta = prop.meta, propName, v;
                if (!propMeta || prop.isPropEqual()) {
                    return;
                }
                propName = propMeta.name;
                v = support.getPropRaw(prop.checked() ? local : original, propMeta);
                json[propName] = support.json.dematerializeProp(v, propMeta);
            });
            json.__metadata.ts = original.ts;
            that.navigationService.close({ changes: [json], resolved: true });
        };
        ObjectResolutionPart.prototype.doConfirmDeletion = function () {
            var that = this, original = that.original(), json = original.createJsonStub();
            json.__metadata.isRemoved = true;
            json.__metadata.ts = original.ts;
            that.navigationService.close({ changes: [json], resolved: true });
        };
        ObjectResolutionPart.prototype.doCancel = function () {
            this.navigationService.close();
        };
        ObjectResolutionPart.defaultOptions = {
            template: defaultTemplate
        };
        ObjectResolutionPart.defaultMenu = {
            items: [
                { name: "Resolve", title: resources["objectResolution.menu.save"], icon: "ok" },
                { name: "ConfirmDeletion", title: resources["objectResolution.menu.confirmDeletion"], icon: "ok" },
                { name: "Cancel", title: resources["objectResolution.menu.cancel"], icon: "cancel" }
            ]
        };
        return ObjectResolutionPart;
    }(ObjectComparePart));
    ObjectResolutionPart.mixin({
        // backward compatibility
        defaultOptions: ObjectResolutionPart.defaultOptions,
        defaultMenu: ObjectResolutionPart.defaultMenu,
        /**
         * @observable-property {Boolean}
         */
        checkedAll: lang.Observable.accessor("checkedAll"),
        /**
         * @observable-property {Boolean}
         */
        isLocalRemoved: lang.Observable.accessor("isLocalRemoved")
    });
    core.ui.ObjectResolutionPart = ObjectResolutionPart;
    return ObjectResolutionPart;
});
//# sourceMappingURL=ObjectResolutionPart.js.map