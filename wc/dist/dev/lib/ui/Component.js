/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/ui/StatefulPart"], function (require, exports, lang, StatefulPart) {
    "use strict";
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        /**
         * Part with a presenter. Presenter is a component which the part delegates rendering to.
         * The presenter is registered as a child part of the current part.
         * @constructs Component
         * @extends StatefulPart
         * @param {Component#defaultOptions} options
         */
        function Component(options) {
            var _this = this;
            options = Component.mixOptions(options, Component.defaultOptions);
            // pass 'contextName' to the presenter
            if (options.contextName) {
                options.presenterOptions = options.presenterOptions || {};
                options.presenterOptions.contextName = options.contextName;
            }
            _this = _super.call(this, options) || this;
            return _this;
        }
        /**
         * Create and initialize presenter
         * @protected
         * @param {Object} [options]
         * @param {*} [options.viewModel=this] viewModel to set to presenter. Specify null to skip setting viewModel.
         */
        Component.prototype.initPresenter = function (options) {
            var that = this, opts = that.options, presenter, viewModel;
            // create presenter from component options
            if (opts.presenter) {
                presenter = opts.presenter;
            }
            else {
                var Presenter = opts.Presenter;
                if (lang.isFunction(Presenter)) {
                    presenter = new Presenter(opts.presenterOptions);
                }
                else if (lang.isString(Presenter)) {
                    presenter = lang.Class.create(null /*rootNamespace, use default*/, Presenter, opts.presenterOptions);
                }
            }
            if (!presenter) {
                // todo: some identification is needed:
                throw new Error("Can't initialize presenter for component " + (that.name || ""));
            }
            if (presenter.setViewModel) {
                viewModel = (options && options.viewModel !== undefined) ? options.viewModel : that;
                if (viewModel) {
                    presenter.setViewModel(viewModel);
                }
            }
            that.presenter = presenter;
        };
        /** @inheritDoc */
        Component.prototype.doRender = function (domElement) {
            _super.prototype.doRender.call(this, domElement);
            var that = this, presenter = that.presenter;
            if (presenter) {
                that.registerChild(presenter, { disposeOnUnload: false, keepOnUnload: false, trackStatus: true });
                // NOTE: тут проблема - в doRender мы зовем render презентера,
                // а это значит, что у презентера также вызовется afterRender, в котором может быть установлен renderStatus=ready
                // (если все его дочерние парты read). Но текущий парт мог еще не завершить рендеринг.
                // Например, редактор в своем doRender зовет базовый doRender, потом activatePage.
                return presenter.render(domElement);
            }
        };
        /** @inheritDoc */
        Component.prototype.queryUnload = function (options) {
            var presenter = this.presenter;
            if (presenter && typeof presenter.queryUnload === "function") {
                return presenter.queryUnload(options);
            }
        };
        /** @inheritDoc */
        Component.prototype.dispose = function (options) {
            // NOTE: Part.dispose calls `unload` which is virtual.
            // Part's overridden unload can access dom/viewmodel and so on. So we must call base `dispose` first.
            _super.prototype.dispose.call(this, options);
            this.disposePresenter(options);
        };
        Component.prototype.disposePresenter = function (options) {
            var presenter = this.presenter;
            if (presenter && presenter.dispose) {
                presenter.dispose(options);
                this.presenter = undefined;
            }
        };
        Component.prototype.applyHostContext = function (options) {
            // NOTE: super can change options.host
            var navOpts = _super.prototype.applyHostContext.call(this, options);
            var presenter = this.presenter;
            if (presenter && presenter.applyHostContext) {
                presenter.applyHostContext(options);
            }
            return navOpts;
        };
        return Component;
    }(StatefulPart));
    /**
     * @typedef {Object} ComponentOptions
     * @property {IPart} presenter
     * @property {Class} Presenter
     * @property {Object} presenterOptions options for passing to presenter's ctor
     */
    Component.mixin(/** @lends Component.prototype */ {
        defaultOptions: Component.defaultOptions
    });
    return Component;
});
//# sourceMappingURL=Component.js.map