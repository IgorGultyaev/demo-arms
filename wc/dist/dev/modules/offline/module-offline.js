/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "i18n!./nls/resources", "i18n!lib/nls/resources", "./ui/SyncResolutionPart", "lib/ui/slick/SlickObjectListDataPresenter", "xcss!./ui/styles/module-offline"], function (require, exports, $, core, resources, resourcesCommon, SyncResolutionPart, SlickObjectListDataPresenter) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    // extend common resources
    core.lang.forEach(resources, function (value, key) {
        resourcesCommon["offline." + key] = value;
    });
    core.createModule("offline", function (app, options) {
        options = options || {};
        var area = app.areaManager.getArea("offline");
        if (!area) {
            area = app.areaManager.createArea("offline", null, { title: resources["sync.title"], hidden: true });
        }
        var element = $("<div class='row'></div>").appendTo(area.domElement);
        element = $("<div class='col-md-12'></div>").appendTo(element);
        element = $("<div class='x-region'></div>").appendTo(element);
        var region = new core.composition.Region("main");
        region.render(element);
        //region.navigable = true;
        area.regionManager.addRegion(region);
        var part = SyncResolutionPart.create({ app: app });
        part.bind("change:hasErrors", function (sender, value) {
            area.hidden(!value);
        });
        area.addState({ name: "", isDefault: true }, { main: part });
        lang.override(app.dataFacade, {
            createSyncErrorEvent: function (base, syncResult) {
                var event = base.call(this, syncResult);
                event.menu.items.push({
                    name: "Resolve",
                    title: resourcesCommon["interop.sync.resolve"],
                    command: core.createCommand({
                        execute: function () {
                            var appStateToReturn = app.stateManager.getCurrentState();
                            if (appStateToReturn.area === "offline") {
                                // if we're already in offline Area then return to the app root
                                appStateToReturn = {};
                            }
                            part.appStateRestore = appStateToReturn;
                            part.setViewModel(syncResult);
                            app.stateManager.applyState({ area: "offline" });
                        }
                    })
                });
                return event;
            }
        });
        // NOTE: add the functionality: 'unsynchronized objects in list'
        if (app.dataFacade["options"]) {
            app.dataFacade.options.forceLoadUnsync = true;
        }
        if (!options.disableTrackUnsyncState) {
            if (app.model) {
                app.model.DomainObject.prototype.hasUnsyncChanges = core.lang.Observable.accessor("hasUnsyncChanges");
                lang.override(app.model.DomainObject.prototype, {
                    fromJson: function (base, json, options, propOptions) {
                        if (json.__metadata) {
                            this.hasUnsyncChanges(json.__metadata.hasUnsyncChanges);
                        }
                        return base.call(this, json, options, propOptions);
                    }
                });
            }
            lang.override(SlickObjectListDataPresenter.prototype, {
                getItemMetadata: function (base, item) {
                    var itemMeta = base.call(this, item) || {};
                    if (core.lang.get(item, "hasUnsyncChanges")) {
                        itemMeta.cssClasses = core.html.appendCssClass(itemMeta.cssClasses, "-unsync-item");
                    }
                    return itemMeta;
                }
            });
        }
        //		app.eventPublisher.subscribe("interop.sync.error", function (ev) {
        //			var syncResult = ev.args.data;
        //			part.setViewModel(syncResult);
        //			//region.resetState();
        //			//area.activateState("", { disablePushState: true });
        //		});
        //
        //		["interop.sync.retry", "interop.sync.cancel"].forEach(function (eventName) {
        //			app.eventPublisher.subscribe(eventName, function () {
        //				part.setViewModel(null);
        //				//region.resetState();
        //				//area.activateState("", { disablePushState: true });
        //			});
        //		});
    });
});
//# sourceMappingURL=module-offline.js.map