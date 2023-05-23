/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/Popup.hbs", "xcss!lib/ui/styles/popupView"], function (require, exports, core, View, defaultTemplate) {
    "use strict";
    var lang = core.lang;
    var Popup = /** @class */ (function (_super) {
        __extends(Popup, _super);
        /**
         * @constructs Popup
         * @extends View
         * @description Popup consists of a scaffolding frame (specified by template option)
         * and an inner part (specified by body or bodyTemplate options).
         * @param {Popup.defaultOptions} options
         */
        function Popup(options) {
            var _this = this;
            options = Popup.mixOptions(options, Popup.defaultOptions);
            _this = _super.call(this, options) || this;
            var body = _this.options.body;
            if (typeof body === "string") {
                body = core.createPart(body);
                _this._bodyOwned = true;
            }
            else if (!body && _this.options.bodyTemplate) {
                body = new View({ template: _this.options.bodyTemplate });
                _this._bodyOwned = true;
            }
            _this.body = body;
            if (_this.options.viewModel) {
                _this.setViewModel(_this.options.viewModel);
            }
            return _this;
        }
        Popup.prototype.setViewModel = function (viewModel) {
            var that = this;
            if (that.body && lang.isFunction(that.body.setViewModel)) {
                that.body.setViewModel(viewModel);
            }
        };
        Popup.prototype.doRender = function (domElement) {
            var that = this, $container = $(domElement), $dropdown = $("<div class='popup'></div>"), $parent, deferred;
            $container.click(); // force closing other popups & dropdowns
            $dropdown
                .hide()
                .addClass(that.options.rootCssClass)
                .on("domChanged", function (e) {
                e.stopPropagation();
            })
                .on("click", ".x-navigation, a[href]:not([href='#'])", function (e) {
                if (!core.html.isExternalClick(e)) {
                    that.close();
                }
            })
                .appendTo($container);
            _super.prototype.doRender.call(this, $dropdown);
            // NOTE: we passed dropdown into View.render -> Part.render so now this.domElement === dropdown
            if (that.options.animation) {
                deferred = core.lang.deferred();
                $dropdown.slideDown(that.options.animation, function () {
                    deferred.resolve();
                });
            }
            else {
                $dropdown.show();
            }
            // NOTE: offset should be set when DOM element is visible (after show)
            if (that.options.offset) {
                $dropdown.offset(that.options.offset);
            }
            // try to find parent popup
            $parent = $container.closest(".popup");
            //$parent = $container.closest(core.html.overlay.targets.join(','));
            if (!$parent.length) {
                $parent = core.$document;
            }
            that.$parent = $parent;
            $dropdown.on(that.options.closeOn, function (e) {
                // prevent bubbling inside the popup
                e.stopPropagation();
                // but re-trigger an event on the parent to close other popups/BS dropdowns
                // and handle keyboard navigation in BS dropdowns also
                var e2 = $.Event(e.originalEvent, { popupTarget: this });
                core.lang.append(e2, e);
                $parent.trigger(e2);
            });
            that._closeHandler = function (e) {
                // close popup (except if it triggered an event itself)
                if (!$dropdown.is(e.popupTarget)) {
                    that.close();
                }
            };
            $parent.on(that.options.closeOn, that._closeHandler);
            that._keyupHandler = function (e) {
                if (e.which === core.html.keyCode.ESCAPE) {
                    that.close();
                }
            };
            $parent.on("keyup", that._keyupHandler);
            return deferred && deferred.promise();
        };
        Popup.prototype._isFocusOutside = function () {
            var focused = core.html.focused();
            return focused && !$(focused).closest(this.$domElement).length;
        };
        Popup.prototype.close = function () {
            var that = this;
            var $dropdown = that.$domElement;
            if ($dropdown && that.options.animation) {
                $dropdown.slideUp(that.options.animation, function () {
                    that.doClose();
                });
            }
            else {
                that.doClose();
            }
        };
        Popup.prototype.doClose = function () {
            if (this.options.disposeOnClose) {
                this.dispose();
            }
            else {
                this.unload();
            }
        };
        Popup.prototype.unload = function (options) {
            var that = this;
            var $dropdown = that.$domElement;
            if (that.$parent) {
                if (that._closeHandler) {
                    that.$parent.off(that.options.closeOn, that._closeHandler);
                    that._closeHandler = undefined;
                }
                if (that._keyupHandler) {
                    that.$parent.off("keyup", that._keyupHandler);
                    that._keyupHandler = undefined;
                }
                that.$parent = undefined;
            }
            _super.prototype.unload.call(this, options);
            if ($dropdown) {
                // NOTE: View.unload->Part.unload do domElement.empty() but domElement is our own element which should be removed (see render)
                $dropdown.remove();
            }
        };
        Popup.prototype.dispose = function (options) {
            var that = this;
            // NOTE: Part.dispose will call our unload method
            _super.prototype.dispose.call(this, options);
            if (!that.options.preserveBody && that.body && that.body.dispose) {
                that.body.dispose(options);
            }
            that.body = undefined;
        };
        /** @type {Object} */
        Popup.defaultOptions = {
            template: defaultTemplate,
            /**
             * keep body alive; don't dispose body while disposing Popup
             * @type {Boolean}
             */
            preserveBody: false,
            /**
             * 'closing' part (by method or command) will dispose it
             */
            disposeOnClose: true,
            /**
             * Events on parent element that close popup.
             * NOTE: Don't include 'click' here. In fact 'click' is a paired event (mousedown + mouseup).
             * But the popup can change its size because of 'mousedown' and the next 'mouseup' will be raised
             * outside of the popup. In this case click in the popup will close it.
             * (see http://track.rnd.croc.ru/issue/WC-853)
             */
            closeOn: "mousedown keyup show.bs.dropdown show.bs.modal",
            /**
             * Options for jQuery.fn.show method
             * @type {Number|String|Object}
             */
            animation: 100
        };
        return Popup;
    }(View));
    Popup.mixin({
        defaultOptions: Popup.defaultOptions
    });
    // popup element can host other overlayers
    //core.html.overlay.targets.push(".popup");
    core.ui.Popup = Popup;
    return Popup;
});
//# sourceMappingURL=Popup.js.map