/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Carousel", "lib/utils/ObservableCollectionView", "xhtmpl!lib/ui/templates/ContextPartCarousel.hbs"], function (require, exports, core, Carousel, ObservableCollectionView, PartCarouselTemplate) {
    "use strict";
    var ContextPartCarousel = /** @class */ (function (_super) {
        __extends(ContextPartCarousel, _super);
        /**
         * @constructs ContextPartCarousel
         * @extends Carousel
         * @param {Object} options
         **/
        function ContextPartCarousel(options) {
            var _this = this;
            options = ContextPartCarousel.mixOptions(options, ContextPartCarousel.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.userSettings = core.UserSettings.create(that.options.userSettings);
            if (that.userSettings) {
                that.userSettings.bindToProp(that, "isPinned");
            }
            that.items().bind("change", that._onItemsChanged, that);
            return _this;
        }
        ContextPartCarousel.prototype.createItemsCollection = function () {
            // NOTE: create ObservableCollectionView sorted by severity
            var items = new ObservableCollectionView();
            items.orderBy({
                getter: function () {
                    var part = this;
                    return (part.severity && ContextPartCarousel.Severities[part.severity]) || ContextPartCarousel.Severities.info;
                },
                comparer: function (s1, s2) {
                    return s1 - s2;
                }
            });
            return items;
        };
        ContextPartCarousel.prototype.activate = function () {
            var that = this;
            if (!that.domElement) {
                return;
            }
            if (that.isPinned()) {
                that.blink();
            }
            else {
                core.html.scrollToElement({
                    element: that.domElement,
                    align: "bottom",
                    onAfter: function () {
                        that.blink();
                    }
                });
            }
        };
        ContextPartCarousel.prototype.blink = function () {
            if (this.$domElement) {
                var $carousel_1 = this.$domElement.find(".x-context-parts-carousel");
                // add css class and remove it asynchronously to start background-color transition
                $carousel_1.addClass("active");
                window.setTimeout(function () {
                    $carousel_1.removeClass("active");
                }, 50);
            }
        };
        ContextPartCarousel.prototype.createCommands = function () {
            var that = this, commands = _super.prototype.createCommands.call(this);
            commands.CloseContextPart = core.commands.createCommand({
                execute: function () {
                    var part = that.removeCurrent();
                    if (part && part.dispose) {
                        part.dispose();
                    }
                },
                name: "CloseContextPart"
            });
            // NOTE: add PinContextParts command if and only if affixing is supported
            if (core.Application.current && core.Application.current.affixManager) {
                commands.PinContextParts = core.commands.createCommand({
                    execute: function () {
                        that.togglePinned();
                    },
                    canExecute: function () {
                        return that.canPin();
                    },
                    name: "PinContextParts"
                });
            }
            return commands;
        };
        ContextPartCarousel.prototype.currentViolation = function () {
            var part = this.current();
            return part && part.violation || undefined;
        };
        /**
         * Used in templates
         * @returns {string} css class for parts badge
         */
        ContextPartCarousel.prototype.badgeCssClass = function () {
            var part = this.current(), cssClass = "x-context-parts-badge";
            if (part) {
                cssClass += " x-context-parts-badge--" + (part.severity || "info");
            }
            return cssClass;
        };
        ContextPartCarousel.prototype.isPinned = function (v) {
            if (!arguments.length) {
                return ContextPartCarousel._get(this, "isPinned");
            }
            if (ContextPartCarousel._set(this, "isPinned", v)) {
                this.affix(v);
            }
        };
        ContextPartCarousel.prototype.isUnpinned = function () {
            return !this.isPinned();
        };
        ContextPartCarousel.prototype.togglePinned = function () {
            if (this.canPin()) {
                this.isPinned(!this.isPinned());
            }
        };
        ContextPartCarousel.prototype.canPin = function () {
            return !!this.$controlledBy;
        };
        /**
         * Initializes affixing. Should be called before render.
         * @param {JQuery|HTMLElement} $parent
         * @param {string} [selector]
         */
        ContextPartCarousel.prototype.initAffix = function ($parent, selector) {
            // NOTE: child element may not be created yet, we must find it later in beforeRender
            this._affixParent = $parent;
            this._affixSelector = selector;
        };
        ContextPartCarousel.prototype.beforeRender = function (domElement) {
            var parent = this._affixParent, selector = this._affixSelector, $controlledBy = parent && (selector ? $(selector, parent) : $(parent));
            this.$controlledBy = $controlledBy && $controlledBy.length ? $controlledBy : undefined;
            _super.prototype.beforeRender.call(this, domElement);
        };
        ContextPartCarousel.prototype.afterRender = function () {
            _super.prototype.afterRender.call(this);
            this.affix();
        };
        ContextPartCarousel.prototype.unload = function (options) {
            this.unaffix();
            _super.prototype.unload.call(this, options);
        };
        ContextPartCarousel.prototype.affix = function (pinned) {
            if (pinned === void 0) { pinned = !!this.isPinned(); }
            this.affixParts(pinned);
            this.affixBadge(!pinned);
        };
        ContextPartCarousel.prototype.unaffix = function () {
            this.affixParts(false);
            this.affixBadge(false);
        };
        ContextPartCarousel.prototype.affixParts = function (affixed) {
            this.affixElement(".x-context-parts-carousel", affixed, true /*resizable*/);
        };
        ContextPartCarousel.prototype.affixBadge = function (affixed) {
            this.affixElement(".x-context-parts-badge", affixed);
        };
        ContextPartCarousel.prototype.affixElement = function (selector, affixed, resizable) {
            if (resizable === void 0) { resizable = false; }
            var that = this;
            if (!that.domElement) {
                return;
            }
            var $controlledBy = that.$controlledBy;
            if (!$controlledBy || !$controlledBy.length) {
                return;
            }
            var $element = $(selector, that.domElement);
            if (!$element.length) {
                return;
            }
            var eventPublisher = that.eventPublisher || core.Application.current.eventPublisher;
            if (!eventPublisher) {
                return;
            }
            var affixedSelectors = that._affixed = that._affixed || {};
            if (!affixedSelectors[selector] === !affixed) {
                return;
            }
            if (affixed) {
                eventPublisher.publish("ui.affix.add_element", {
                    element: $element,
                    controlledBy: $controlledBy,
                    affixTo: "bottom",
                    // NOTE: Обычно прилепленные элементы не меняют размеры и, чтобы не было лишнего обновления affix-а,
                    // событие domChanged на них давится. Подробнее см. в AffixManager.addElement.
                    // Область с contextParts может менять высоту, если парты разного размера.
                    // Чтобы отключить подавление domChanged, задаем опцию resizable.
                    resizable: resizable
                });
            }
            else {
                eventPublisher.publish("ui.affix.remove_element", {
                    element: $element
                });
            }
            affixedSelectors[selector] = !!affixed;
        };
        ContextPartCarousel.prototype._onItemsChanged = function (sender, args) {
            var that = this;
            that.position(0);
            // rerender when `items().count()` changes from 0 to 1 and vice versa
            var count = that.items().count(), countOld = that._countOld || 0;
            if (!count !== !countOld && that.domElement) {
                that.rerender();
            }
            that._countOld = count;
            if (!count) {
                window.setTimeout(function () {
                    // if there is no context parts, and carousel control (prev|next part buttons) has focus
                    // we need move focus to next focusable element, because carousel will be removed by rerender
                    var currentFocus = $(document.activeElement), focusable;
                    if (currentFocus.length && currentFocus.hasClass("x-carousel-control")) {
                        // WARNING! :focusable selector is part of jquery UI
                        // in other case we can use this approach
                        // http://stackoverflow.com/a/7668761
                        focusable = $(":focusable");
                        focusable.slice(focusable.index(currentFocus))
                            .not(".x-carousel-control")
                            .first()
                            .focus();
                    }
                    //that.notifyDOMChanged();
                });
            }
            else if (args) {
                // blink if new contextPart was added
                // NOTE: contextParts are usually updated in the batch via `reset`, so checking only `added` is not enough.
                // Ideally, we should find difference between `added` and `removed`, but comparing lengths is good enough.
                var added = args.added && args.added.length || 0, removed = args.removed && args.removed.length || 0;
                if (added > removed) {
                    that.blink();
                }
            }
        };
        ContextPartCarousel.defaultOptions = {
            template: PartCarouselTemplate,
            unbound: true
        };
        return ContextPartCarousel;
    }(Carousel));
    (function (ContextPartCarousel) {
        var Severities;
        (function (Severities) {
            Severities[Severities["critical"] = 1] = "critical";
            Severities[Severities["error"] = 2] = "error";
            Severities[Severities["warning"] = 3] = "warning";
            Severities[Severities["info"] = 4] = "info";
        })(Severities = ContextPartCarousel.Severities || (ContextPartCarousel.Severities = {}));
    })(ContextPartCarousel || (ContextPartCarousel = {}));
    return ContextPartCarousel;
});
//# sourceMappingURL=ContextPartCarousel.js.map