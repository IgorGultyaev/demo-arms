/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Component", "lib/ui/menu/DropDownMenuPresenter"], function (require, exports, $, core, Component) {
    "use strict";
    var ButtonDropDownPresenter = /** @class */ (function (_super) {
        __extends(ButtonDropDownPresenter, _super);
        /**
         * Menu presenter as a button with a dropdown
         * @class ButtonDropDownPresenter
         * @extends Component
         */
        function ButtonDropDownPresenter(options) {
            var _this = this;
            options = ButtonDropDownPresenter.mixOptions(options, ButtonDropDownPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            if (options && options.viewModel) {
                _this.setViewModel(options.viewModel);
            }
            return _this;
        }
        ButtonDropDownPresenter.prototype.setViewModel = function (model) {
            var that = this;
            if (that.viewModel && that.viewModel.unbind) {
                that.viewModel.unbind("change", null, that);
            }
            _super.prototype.setViewModel.call(this, model);
            if (that.viewModel && that.viewModel.bind) {
                that.viewModel.bind("change", that.rerender, that);
            }
            if (that.domElement) {
                that.rerender();
            }
        };
        ButtonDropDownPresenter.prototype.doRender = function (domElement) {
            var that = this, sel = $(domElement), title, anchor;
            title = that.options.anchorHtml || that.viewModel.title || "";
            anchor = $("<a href='#' class='dropdown-toggle'>" +
                title +
                "<span class='caret' style='margin-left: 5px'></span></a>").appendTo(sel);
            if (!that.options.isLink) {
                sel.addClass("btn-group x-menu-btn");
                anchor.addClass("btn btn-default");
            }
            that.presenter = core.ui.DropDownMenuPresenter.create(that.viewModel);
            _super.prototype.doRender.call(this, domElement);
        };
        /**
         * @deprecated use rerender instead
         */
        ButtonDropDownPresenter.prototype.refresh = function () {
            this.rerender();
        };
        ButtonDropDownPresenter.prototype.dispose = function (options) {
            var that = this;
            if (that.viewModel && that.viewModel.unbind) {
                that.viewModel.unbind("change", null, that);
                that.viewModel = undefined;
            }
            _super.prototype.dispose.call(this, options);
        };
        ButtonDropDownPresenter.defaultOptions = {
            isLink: false,
            anchorHtml: undefined
        };
        return ButtonDropDownPresenter;
    }(Component));
    ButtonDropDownPresenter.mixin({
        defaultOptions: ButtonDropDownPresenter.defaultOptions
    });
    core.ui.ButtonDropDownPresenter = ButtonDropDownPresenter;
    return ButtonDropDownPresenter;
});
//# sourceMappingURL=ButtonDropDownPresenter.js.map