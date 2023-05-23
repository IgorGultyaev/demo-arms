/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./affix"], function (require, exports, core, affix_1) {
    "use strict";
    exports.__esModule = true;
    core.createModule("affix", function (app, options) {
        if (options && options.disabled)
            return;
        var affixManager = new affix_1.AffixManager(options);
        app.affixManager = affixManager;
        app.eventPublisher.subscribe("ui.affix.add_element", function (eventData) {
            if (eventData.args)
                affixManager.addElement(eventData.args);
        });
        app.eventPublisher.subscribe("ui.affix.remove_element", function (eventData) {
            if (eventData.args)
                affixManager.removeElement(eventData.args);
        });
        app.eventPublisher.subscribe("ui.affix.refresh", function (eventData) {
            affixManager.refresh(eventData.args);
        });
        app.eventPublisher.subscribe("ui.affix.suspend", function (eventData) {
            affixManager.suspend(eventData.args);
        });
        core.platform.bind("change:printing", function (sender, value) {
            affixManager.suspend({ suspend: value });
        });
        core.composition.regionBehaviors["affix"] = {
            attach: function (region, regionDomEl, options) {
                region.bind("partRendered", function () {
                    affixManager.addElement(core.lang.extend({}, options, {
                        element: regionDomEl,
                        suspendByHScroll: true
                    }));
                });
                region.bind("partUnloaded", function () {
                    affixManager.removeElement({
                        element: regionDomEl
                    });
                });
            }
        };
        core.$window.on("scroll", function () {
            // NOTE: on scrolling refresh synchronously to prevent lags
            affixManager.refreshSync({ mode: -1 /* scroll */ });
        });
        core.html.windowResize.bind(function () {
            // Changes if window width may also change width of affixed elements. This is not supported in general.
            // So specify `force` flag to detach all elements first.
            affixManager.refresh({ mode: 1 /* forced */ });
        });
        // handle BS event of closing alerts for refreshing affixed elements
        core.$document.on("close.bs.alert", function () {
            // NOTE: 'closed.bs.alert' fires after alert is removed but it's not bubbled so we can't handle it on document,
            // So we handle 'close.bs.alert', but as it fires before alert is removed we use window.setTimeout.
            window.setTimeout(function () {
                affixManager.refresh();
            }, 300);
        });
        core.$document.on("domChanged", function (ev, args) {
            // TODO: add some trace/profile console.log("domChanged");
            if (!args || !args.binding) {
                affixManager.refresh();
            }
        });
        // Overwrite core.html.scrollToElement to support affixed elements
        core.html.scrollToElement = function (options) {
            if (!options) {
                return;
            }
            var opts;
            if (options instanceof $ || options["nodeType"] !== undefined) {
                opts = { element: options };
            }
            else {
                opts = options;
            }
            if (!opts.element) {
                return;
            }
            // refresh affixed items if necessary
            affixManager.refreshIfScheduled();
            var align = opts.align || "top";
            if (opts.force || !affixManager.isInViewport(opts.element, align)) {
                var scrollTo_1 = affixManager.getScrollTop(opts.element, align);
                $.scrollTo(scrollTo_1, 100, { easing: "swing", onAfter: opts.onAfter });
            }
            else if (opts.onAfter) {
                opts.onAfter();
            }
        };
        // Handle anchor links to support affixed elements
        core.html.$document.on("click", "a.anchor-link", function (e) {
            if (core.html.isExternalClick(e)) {
                return;
            }
            var href = e.target.getAttribute("href");
            if (href && href[0] === "#") {
                var id = href.slice(1);
                var element = document.getElementById(id);
                if (element) {
                    e.preventDefault();
                    core.html.scrollToElement({
                        element: element,
                        align: "top",
                        force: true
                    });
                }
            }
        });
    });
});
//# sourceMappingURL=module-affix.js.map