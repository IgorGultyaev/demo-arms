/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/formatters", "lib/ui/pe/PropertyEditor", "lib/ui/PartCommandMixin", "xhtmpl!lib/ui/templates/peViewOnly.hbs", "xhtmpl!lib/ui/templates/peViewOnly.data.hbs", "xhtmpl!lib/ui/templates/peViewOnly.empty.hbs", "xcss!lib/ui/styles/peViewOnly"], function (require, exports, core, formatters, PropertyEditor, PartCommandMixin, htmplMain, htmplData, htmplEmpty) {
    "use strict";
    var lang = core.lang;
    var peViewOnly = /** @class */ (function (_super) {
        __extends(peViewOnly, _super);
        /**
         * @constructs peViewOnly
         * @extends PropertyEditor
         * @param {Object} options
         */
        function peViewOnly(options) {
            var _this = this;
            options = peViewOnly.mixContextOptions(options, peViewOnly.defaultOptions, peViewOnly.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            if (!core.ui.clipboard || !core.ui.clipboard.isSupported) {
                _this.options.showCopy = false;
            }
            _this.commands = lang.extend(_this.createCommands(), _this.options.commands);
            _this.urlFormatter = _this.options.urlFormatter || _this.getViewUrl.bind(_this);
            _this.initPresenter();
            _this.subscribeOnNavigation();
            return _this;
        }
        peViewOnly.prototype.tweakOptions = function (options) {
            lang.appendEx(options, {
                presenterOptions: {
                    template: options.template
                },
                showCopy: core.ui.clipboard && core.ui.clipboard.isSupported
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        /**
         * Return formatted (as text) prop value presentation.
         * Used in template with additional html-encoding.
         * @returns {string}
         */
        peViewOnly.prototype.formattedValue = function () {
            return formatters.formatPropValue(this.options, this.value()).toString();
        };
        /**
         * Return html-formatted prop value presentation.
         * Used in template without additional html-encoding.
         * @returns {string} html/text
         */
        peViewOnly.prototype.formattedHtml = function () {
            return formatters.formatPropHtml(this.options, this.value());
        };
        peViewOnly.prototype.isEmpty = function () {
            var that = this, v = that.value();
            // NOTE: тут раньше (до 0.21) была проверка на isLoaded(v), но она мешает использованию PE для незагруженных свойств
            // теоретически, если св-во не загружено, то isEmpty должны быть true, чтобы шаблон не пытался раскатывать незагруженное значение
            // Но в реальности, если функция шаблона натыкается на незагруженное значение, то возвращается объект loading, и результат шаблона игнорируется
            if (v == null || v === "") {
                return true;
            }
            return that.options.many && (v.isGhost || (lang.isFunction(v.count) && v.count() === 0));
        };
        peViewOnly.prototype.onReady = function () {
            var that = this, $container = that.$domElement;
            that.element = $container.find(".x-pe-viewonly");
            _super.prototype.onReady.call(this);
            if (that.options.showCopy) {
                var $btnCopy = $container.find(".btn-copy");
                if ($btnCopy.length) {
                    if (that._clipboardBtn) {
                        that._clipboardBtn.dispose();
                    }
                    that._clipboardBtn = new core.ui.clipboard.CopyButton($btnCopy[0], {
                        text: function () { return that.title() + ": " + that.formattedValue(); },
                        tooltip: { placement: "top" }
                    });
                }
            }
        };
        peViewOnly.prototype.unload = function (options) {
            if (this._clipboardBtn) {
                this._clipboardBtn.dispose();
            }
            _super.prototype.unload.call(this, options);
        };
        peViewOnly.prototype.createCommands = function () {
            var that = this, commands = {};
            if (that.options.vt === "object" && that.options.navigable) {
                commands["View"] = new core.commands.BoundCommand(that.doView, that.canView, that);
            }
            return commands;
        };
        peViewOnly.prototype.getViewUrl = function (obj) {
            if (!obj) {
                return "#";
            }
            var partName = "ObjectViewer:" + obj.meta.name, cmdOptions = this._createCommandOptions({
                part: partName,
                partOptions: {
                    type: obj.meta.name,
                    id: obj.id
                }
            }, { object: obj }, "View"), stateManager = core.Application.current.stateManager, appState = stateManager.getCurrentState();
            if (!cmdOptions.activateOptions.freezeUrl) {
                var part = cmdOptions.part, 
                // NOTE: cmdOptions.partOptions is full options for the part, but it can contain redundant info,
                // which should not be included in URL. So we must use only known options
                partOptions = {
                    type: cmdOptions.partOptions.type,
                    id: cmdOptions.partOptions.id
                }, regionState = void 0;
                if (lang.isString(part)) {
                    regionState = {
                        part: part,
                        partOptions: partOptions
                    };
                }
                else if (lang.isFunction(part)) {
                    // part is IPartFactory
                    // TOTHINK: Создавать парт - слишком накладно, используем имя парта. Однако, это не совсем корректно,
                    // так как фабрика может вернуть парт с другим именем.
                    regionState = {
                        part: partName,
                        partOptions: partOptions
                    };
                }
                else {
                    // part is IPart
                    regionState = {
                        part: part,
                        partOptions: part.getState ?
                            part.getState(cmdOptions.partOptions) :
                            partOptions
                    };
                }
                appState.regionState = regionState;
            }
            return stateManager.getStateUrl(appState);
        };
        /**
         * Open a viewer for the object
         * @param {Object} args Command arguments
         * @param {Object} args.object Object ot view
         * @returns {*|jQuery.Deferred|$.Promise}
         */
        peViewOnly.prototype.doView = function (args) {
            var that = this, obj = args.object;
            if (!obj) {
                throw new Error("args.object must be specified");
            }
            return that.executePartCommand({
                part: "ObjectViewer:" + obj.meta.name,
                partOptions: {
                    viewModel: obj,
                    editorContext: that._createNestedEditorContext()
                }
            }, args, "View").closed;
        };
        peViewOnly.prototype.canView = function () {
            return !this.disabled();
        };
        peViewOnly.prototype._createNestedEditorContext = function () {
            return {
                parentObject: this.viewModel,
                parentProp: this.viewModel.meta.props[this.viewModelProp],
                nested: true
            };
        };
        peViewOnly.defaultOptions = {
            Presenter: core.ui.View,
            template: htmplMain,
            partialTemplates: {
                data: htmplData,
                empty: htmplEmpty
            },
            /**
             * formatter for items of navigation set property:
             * name of formatter in value type or formatter function accepting value DomainObject
             * It's used if formatter option (for the whole property) is not specified.
             * @type {String|Function}
             */
            itemFormatter: undefined,
            nullable: true,
            hideEmpty: false,
            emptyValue: undefined,
            navigable: false,
            commandsOptions: {},
            showCopy: undefined,
            html: true,
            focusable: true,
            focusableLink: false
        };
        peViewOnly.contextDefaultOptions = {
            viewer: {
                navigable: true
            }
        };
        return peViewOnly;
    }(PropertyEditor));
    // mix methods from PartCommandMixin
    PartCommandMixin.mixinTo(peViewOnly);
    // Override to take into account the 'hideEmpty' option
    peViewOnly.prototype.hidden = function () {
        var that = this, v = PropertyEditor.prototype.hidden.apply(that, arguments);
        if (arguments.length) {
            // set:
            return v;
        }
        // get:
        return !!v || !!(that.options.hideEmpty && that.isEmpty());
    };
    // backward compatibility: access to static fields via prototype
    peViewOnly.mixin(/** @lends peViewOnly.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peViewOnly.defaultOptions,
        /** @obsolete use static contextDefaultOptions */
        contextDefaultOptions: peViewOnly.contextDefaultOptions
    });
    core.ui.peViewOnly = peViewOnly;
    // NOTE: peViewOnly should be created for read-only properties by default
    // except some PEs that specifically support read-only mode (peBinary and peObjectList - all they have priority == 20)
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.readOnly ? core.ui.peViewOnly : null;
    }, { priority: 10 });
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.contextName === "viewer" ? core.ui.peViewOnly : null;
    }, { priority: 20 });
    return peViewOnly;
});
//# sourceMappingURL=peViewOnly.js.map