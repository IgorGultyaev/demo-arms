/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core"], function (require, exports, $, core) {
    "use strict";
    exports.__esModule = true;
    function appendState(items, item) {
        if (items.length > 0) {
            var prev = items[items.length - 1];
            if (prev.title === item.title) {
                return false;
            }
        }
        if (item && item.title) {
            items.push(item);
            return true;
        }
        return false;
    }
    core.createModule("breadcrumbs", 
    /**
     * @param {Application} app
     * @param {BreadcrumbsOptions} options
     * @returns {Object}
     */
    function (app, options) {
        options = options || {};
        function onAppStateChange(ev) {
            var $breadcrumb = $(options.containerSelector || ".x-breadcrumb"), appState = ev.args.state, area, items = [], regionStateAdded = false, navRegion, parts;
            if ($breadcrumb.length === 0) {
                return;
            }
            $breadcrumb.off();
            $breadcrumb.empty();
            if (!appState || core.lang.isEmptyObject(appState)) {
                return;
            }
            area = app.areaManager.getArea(appState.area);
            if (!area) {
                return;
            }
            var extOpts = area.extensions && area.extensions["breadcrumbs"];
            if (extOpts && extOpts.hidden) {
                return;
            }
            // Step 1: collect all items to display
            if (!options.excludeArea && !(extOpts && extOpts.excludeArea)) {
                items.push({
                    title: area.title || area.name,
                    url: app.stateManager.getAreaUrl(area.name)
                });
            }
            if (!options.excludeAreaState && !(extOpts && extOpts.excludeAreaState) && appState.areaState) {
                if (!appState.areaState.title) {
                    // if there's no AreaState's title in AppState then pick it up from AreaState object
                    var areaState = area.getState(appState.areaState.name);
                    if (areaState) {
                        appState.areaState.title = areaState.title;
                    }
                }
                appendState(items, {
                    title: appState.areaState.title || appState.areaState.name,
                    areaState: appState.areaState.name,
                    url: app.stateManager.getStateUrl({
                        area: area.name,
                        areaState: { name: appState.areaState.name, isDefault: appState.areaState.isDefault }
                    })
                });
            }
            navRegion = area.regionManager.getNavigableRegion();
            if (navRegion && navRegion.getPartsHistory) {
                parts = navRegion.getPartsHistory(/*includeSource*/ true);
                if (parts && parts.length) {
                    parts.forEach(function (part, i) {
                        if ((options.excludeLastPart || (extOpts && extOpts.excludeLastPart))
                            && (i === parts.length - 1)) {
                            // NOTE: append a fake item without any title - so previous part will not be active
                            items.push({});
                            return;
                        }
                        var partTitle;
                        if (part.extensions && part.extensions["breadcrumbs"]) {
                            partTitle = part.extensions["breadcrumbs"];
                        }
                        if (!partTitle) {
                            partTitle = core.lang.get(part, "title");
                        }
                        if (partTitle) {
                            regionStateAdded = appendState(items, {
                                title: partTitle,
                                areaState: {
                                    name: appState.areaState.name,
                                    regionState: {
                                        part: part
                                    }
                                },
                                url: app.stateManager.getStateUrl({
                                    area: area.name,
                                    areaState: {
                                        name: appState.areaState.name,
                                        isDefault: appState.areaState.isDefault
                                    },
                                    regionState: {
                                        part: part.name,
                                        partOptions: part.getState ? part.getState() : {}
                                    }
                                })
                            });
                        }
                    });
                }
            }
            if (!regionStateAdded && !options.excludeRegionState && !(extOpts && extOpts.excludeRegionState)) {
                if (options.excludeLastPart || (extOpts && extOpts.excludeLastPart)) {
                    items.push({});
                }
                else if (appState.regionState) {
                    appendState(items, {
                        title: appState.regionState.title
                    });
                }
            }
            // Step 2: create DOM elements for collected items
            items.forEach(function (item, i) {
                if (!item.title) {
                    return;
                }
                var $li = $("<li></li>"), isLast = i === items.length - 1;
                if (options.disableLinks || (extOpts && extOpts.disableLinks) || isLast) {
                    $li.text(item.title.toString());
                }
                else {
                    var url = item.url || "#";
                    $("<a href='" + url + "'></a>").text(item.title.toString()).appendTo($li).click(function (e) {
                        if (core.html.isExternalClick(e)) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        app.areaManager.activateState(area.name, item.areaState);
                    });
                }
                if (isLast) {
                    $li.addClass("active");
                }
                $li.appendTo($breadcrumb);
            });
        }
        return {
            handlers: {
                "app.statechange": function (ev) {
                    onAppStateChange(ev);
                }
            }
        };
    });
});
//# sourceMappingURL=module-breadcrumbs.js.map