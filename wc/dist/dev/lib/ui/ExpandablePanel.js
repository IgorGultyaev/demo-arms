/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/ExpandablePanel.hbs", "i18n!lib/nls/resources", "xcss!lib/ui/styles/expandablePanel"], function (require, exports, $, core, binding, View, template, resources) {
    "use strict";
    var lang = core.lang;
    var ExpandablePanel = /** @class */ (function (_super) {
        __extends(ExpandablePanel, _super);
        /**
         * @class ExpandablePanel
         * @extends View
         * @param {Object} options
         */
        function ExpandablePanel(options) {
            var _this = this;
            options = ExpandablePanel.mixOptions(options, ExpandablePanel.defaultOptions);
            _this = _super.call(this, options) || this;
            _this._body = _this.options.body;
            _this._expandedProp = _this.options.expandedProp;
            _this.expanded(!!_this.options.expanded);
            _this.commands = _this.createCommands();
            return _this;
        }
        ExpandablePanel.prototype.createCommands = function () {
            return {
                Toggle: core.createCommand({
                    execute: function (args) {
                        args.part.toggle();
                    }
                }),
                Expand: core.createCommand({
                    execute: function (args) {
                        args.part.expand();
                    }
                }),
                Collapse: core.createCommand({
                    execute: function (args) {
                        args.part.collapse();
                    }
                })
            };
        };
        ExpandablePanel.prototype.expand = function () {
            this._expanding = true;
            this.expanded(true);
        };
        ExpandablePanel.prototype.collapse = function () {
            var _this = this;
            // hide body with animation
            this.container.find(".x-expandable-body").slideUp("fast", function () {
                _this.expanded(false);
                _this._refresh();
            });
        };
        ExpandablePanel.prototype.toggle = function () {
            if (this.expanded()) {
                this.collapse();
            }
            else {
                this.expand();
            }
        };
        ExpandablePanel.prototype.body = function () {
            var that = this, part = that._body;
            if (typeof part === "string") {
                part = core.createPart(part);
                if (that.navigationService && typeof part.setNavigationService === "function") {
                    part.setNavigationService(that.navigationService);
                }
                if (that._bodyViewModel && typeof part.setViewModel === "function") {
                    part.setViewModel(that._bodyViewModel);
                }
                that._body = part;
                that._bodyOwned = true;
            }
            return part;
        };
        ExpandablePanel.prototype.setViewModel = function (viewModel) {
            this._bodyViewModel = viewModel;
        };
        /**
         * Привязывает свойство expanded к _bodyViewModel и возвращает значение expanded.
         * Используется в шаблоне.
         */
        ExpandablePanel.prototype.boundExpanded = function () {
            var that = this;
            if (!that._disposable && that._expandedProp && that._bodyViewModel) {
                that._disposable = binding.databind(binding.expr(that, that.expanded), binding.expr(that._bodyViewModel, that._expandedProp));
            }
            return that.expanded();
        };
        ExpandablePanel.prototype.isParentExpandable = function () {
            return this.$domElement.hasClass("x-expandable");
        };
        ExpandablePanel.prototype.doRender = function (domElement) {
            var _this = this;
            var container = $(domElement);
            _super.prototype.doRender.call(this, domElement);
            if (!container.hasClass("x-expandable")) {
                container = container.children(".x-expandable");
            }
            if (this.expanded()) {
                container.removeClass("x-collapsed").addClass("x-expanded");
            }
            else {
                container.removeClass("x-expanded").addClass("x-collapsed");
            }
            // в процессе разворачивания "тело" изначально скрыто, покажем его с анимацией
            if (this._expanding) {
                this._expanding = false;
                container.find(".x-expandable-body").slideDown("fast", function () {
                    _this._refresh();
                });
            }
            this.container = container;
        };
        ExpandablePanel.prototype.dispose = function (options) {
            var that = this;
            _super.prototype.dispose.call(this, options);
            if (that._disposable) {
                that._disposable.dispose();
            }
            if (that._bodyOwned) {
                that._body.dispose();
            }
            that.container = undefined;
        };
        ExpandablePanel.prototype._refresh = function () {
            this.notifyDOMChanged();
        };
        ExpandablePanel.defaultOptions = {
            template: template,
            body: undefined,
            expandedProp: undefined,
            expandTitle: resources["expandablePanel.expand"],
            collapseTitle: resources["expandablePanel.collapse"],
            expanded: false
            //TODO: collapsible: true
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], ExpandablePanel.prototype, "expanded");
        return ExpandablePanel;
    }(View));
    // backward compatibility: access to static fields via prototype
    ExpandablePanel.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: ExpandablePanel.defaultOptions
    });
    core.ui.ExpandablePanel = ExpandablePanel;
    return ExpandablePanel;
});
//# sourceMappingURL=ExpandablePanel.js.map