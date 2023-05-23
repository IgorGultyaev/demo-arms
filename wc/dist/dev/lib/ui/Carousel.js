/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xhtmpl!lib/ui/templates/Carousel.hbs", "xhtmpl!lib/ui/templates/Carousel.controls.hbs", "xcss!lib/ui/styles/carousel"], function (require, exports, core, View, defaultTemplate, controlsTemplate) {
    "use strict";
    var lang = core.lang;
    var Carousel = /** @class */ (function (_super) {
        __extends(Carousel, _super);
        /**
         * @constructs Carousel
         * @extends View
         * @param {Object} [options]
         * */
        function Carousel(options) {
            var _this = this;
            options = Carousel.mixOptions(options, Carousel.defaultOptions);
            _this = _super.call(this, options) || this;
            var items = _this.options.items || [];
            if (lang.ObservableCollection.isObservableCollection(items)) {
                _this._items = items;
            }
            else {
                //that._items = new lang.ObservableCollection(<any[]>items);
                _this._items = _this.createItemsCollection(items);
                _this._itemsOwner = true;
            }
            _this.position(0);
            if (!lang.isFunction(_this.options.formatter)) {
                _this.options.formatter = function () { return ""; };
            }
            _this.commands = lang.extend(_this.createCommands(), _this.options.commands || {});
            return _this;
        }
        Carousel.prototype.dispose = function (options) {
            if (this._itemsOwner) {
                var items = this.items();
                if (lang.isDisposable(items)) {
                    items.dispose();
                }
            }
            _super.prototype.dispose.call(this, options);
        };
        Carousel.prototype.setViewModel = function () {
            // NOTE: viewModel для шаблона (т.е. this) является сам объект Carousel, поэтому задавать viewModel нельзя
        };
        Carousel.prototype.current = function () {
            return this.items().get(this.position());
        };
        Carousel.prototype.count = function () {
            return this.items().count();
        };
        Carousel.prototype.text = function () {
            var that = this;
            return that.options.formatter.call(that, that.current());
        };
        Carousel.prototype.counterText = function () {
            var that = this;
            return (that.position() + 1) + " / " + that.items().count();
        };
        /**
         * Removes current item
         * @returns {*} removed item
         */
        Carousel.prototype.removeCurrent = function () {
            var that = this, items = that.items(), pos = that.position(), item = items.get(pos);
            // TODO: need removeAt method
            items.remove(item);
            if (pos >= items.count()) {
                that.position(pos - 1);
            }
            return item;
        };
        /**
         * @protected
         * @returns {{Backward: (Command), Forward: (Command)}}
         */
        Carousel.prototype.createCommands = function () {
            var cmdBackward = core.createCommand({
                execute: function (args) {
                    args.part._moveBackward();
                }
            }), cmdForward = core.createCommand({
                execute: function (args) {
                    args.part._moveForward();
                }
            });
            return {
                Backward: cmdBackward,
                Forward: cmdForward
            };
        };
        Carousel.prototype.createItemsCollection = function (items) {
            return new lang.ObservableCollection(items);
        };
        Carousel.prototype._moveBackward = function () {
            var that = this, len = that.count(), posFrom = that.position(), posTo = (posFrom + len - 1) % len;
            that._move(posFrom, posTo);
        };
        Carousel.prototype._moveForward = function () {
            var that = this, len = that.count(), posFrom = that.position(), posTo = (posFrom + 1) % len;
            that._move(posFrom, posTo);
        };
        Carousel.prototype._move = function (posFrom, posTo) {
            var that = this, args = { from: posFrom, to: posTo, total: that.count(), cancel: false };
            that.trigger("moving", that, args);
            if (!args.cancel) {
                that.position(posTo);
                that.trigger("moved", that, args);
            }
        };
        Carousel.defaultOptions = {
            template: defaultTemplate,
            unbound: true,
            /**
             * @type Array|ObservableCollection
             */
            items: undefined,
            formatter: function (item) {
                return item == null ? "" : item.toString();
            },
            commands: undefined
        };
        __decorate([
            lang.decorators.observableAccessor({ field: "_items" })
        ], Carousel.prototype, "items");
        __decorate([
            lang.decorators.observableAccessor()
        ], Carousel.prototype, "position");
        return Carousel;
    }(View));
    View.Handlebars.registerPartial("carousel-controls", controlsTemplate);
    core.ui.Carousel = Carousel;
    return Carousel;
});
//# sourceMappingURL=Carousel.js.map