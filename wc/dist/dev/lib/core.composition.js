/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/core.html", "lib/core.diagnostics", "lib/utils", "lib/ui/Part", "lib/ui/.ui.types", "vendor/history", "lib/ui/WaitingModal"], function (require, exports, $, lang, html, diagnostics, utils, Part, _ui_types_1) {
    "use strict";
    exports.__esModule = true;
    var Historyjs = History;
    var traceSource = new diagnostics.TraceSource("core.composition");
    exports.regionBehaviors = {};
    /**
     * @typedef {Object} RegionBehavior
     * @property {RegionBehaviorMethod} attach
     */
    /**
     * @callback RegionBehaviorMethod
     * @param {Region} region
     * @param {HTMLElement} domElement
     * @param {*} options
     */
    /** */
    function dumpState(state) {
        if (state && state.regionState && state.regionState.part && !lang.isString(state.regionState.part)) {
            state = lang.cloneEx(state, { deep: true });
            var part = state.regionState.part;
            state.regionState.part = {
                __uid: part.__uid,
                name: part.name
            };
        }
        return JSON.stringify(state);
    }
    var AreaState = /** @class */ (function (_super) {
        __extends(AreaState, _super);
        /**
         * @constructs AreaState
         * @extends Observable
         * @memberOf module:"core.composition"
         * @param {Application} app
         * @param {object} stateSpec json object with AreaState specification
         * @param {string} stateSpec.name
         * @param {string} [stateSpec.title]
         * @param {boolean} [stateSpec.hidden]
         * @param map
         * @param {RegionManager} regionManager
         */
        function AreaState(app, stateSpec, map, regionManager) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.app = app;
            that.name = stateSpec.name;
            that.title = stateSpec.title;
            that.transient = stateSpec.transient;
            that.hidden(!!stateSpec.hidden);
            that.map = map;
            that.regionManager = regionManager;
            return _this;
        }
        /**
         * Activate this state.
         * @param {RegionState} regionState
         * @param {object} [options]
         * @param {boolean} options.disablePushState
         * @param {AppState} options.state
         * @returns {Promise}
         */
        AreaState.prototype.activate = function (regionState, options) {
            var that = this, task;
            options = options || {};
            try {
                task = this._doActivate(regionState, options);
            }
            catch (e) {
                traceSource.error(e);
                return lang.rejected(e);
            }
            if (task) {
                return task.then(function () {
                    that._onActivated(options);
                });
            }
            that._onActivated(options);
            return lang.resolved();
        };
        AreaState.prototype._getPartName = function (part) {
            if (typeof part === "string") {
                return part;
            }
            return part ? part.name : undefined;
        };
        /**
         * Implementation of state activation.
         * @param {RegionState} regionState
         * @param {object} [options]
         * @param {boolean} options.disablePushState
         * @param {AppState} options.state
         * @returns {Promise}
         */
        AreaState.prototype._doActivate = function (regionState, options) {
            var that = this, regionName, region, isNavigableRegion, part, partName, tasks = [], task, isStateDefaultPart, partStateToApply, toChangeState, statePushed;
            options = options || {};
            if (traceSource.enabled("debug")) {
                traceSource.debug(function () { return "[AreaState] _doActivate: activating '" + that.name + "'."; });
            }
            // TODO: should be covered by tests first
            /*
                    if (lang.isFunction(that.map)) {
                        traceSource.debug("AreaState dynamic activation");
                        if (!options.disablePushState && !options.doNotTouchAppState) {
                            that._pushAreaState();
                        }
                        return that.map(that.name, that.regionManager, options);
                    }
            */
            if (that.activateOptions) {
                options = lang.extendEx({}, that.activateOptions, options, { deep: true });
            }
            var _loop_1 = function () {
                region = that.regionManager.getRegion(regionName);
                if (!region) {
                    throw new Error("[AreaState] _doActivate: can't activate state " + that.name + " as it refers to unknown region " + regionName);
                }
                isNavigableRegion = !!region.navigable;
                part = that.map[regionName];
                isStateDefaultPart = true;
                // NOTE: state.regionState  is default region's state
                partStateToApply = undefined;
                if (regionState && isNavigableRegion) {
                    if (regionState.part && (!part || that._getPartName(part) !== regionState.part)) {
                        // app state (which is being activated) contains non default part (we'll take it instead of default part of the AreaState)
                        traceSource.debug("[AreaState] _doActivate: activating '" + that.name + "' using non-default part from regionState - " + regionState.part);
                        part = regionState.part;
                        isStateDefaultPart = false;
                    }
                    if (regionState.partOptions) {
                        partStateToApply = lang.cloneEx(regionState.partOptions, { deep: true });
                    }
                }
                if (part) {
                    toChangeState = false;
                    if (typeof part === "string") {
                        partName = part;
                        part = undefined;
                        if (regionState && regionState._partUid) {
                            part = region.getPartByUid(regionState._partUid);
                        }
                        if (part) {
                            // we won't create part instance and we have a state to apply and the part supports changeState method
                            toChangeState = partStateToApply && !!part.changeState;
                        }
                        else {
                            // part is a string (name) and it's default state's part - then we'll reuse existing instance
                            if (isStateDefaultPart) {
                                part = region.getPart(partName);
                                if (part) {
                                    // is case of the part inactive, we should apply its state (after activate)
                                    toChangeState = partStateToApply && !!part.changeState;
                                }
                            }
                            if (!part) {
                                part = that.app.createPart(partName, partStateToApply);
                            }
                        }
                    }
                    else {
                        // part is an instance, it's the same case as when it's a string but exists in region
                        toChangeState = partStateToApply && !!part.changeState;
                    }
                    // NOTE: now 'part' is an instance
                    if (region.isPartActive(part)) {
                        // as part is active that mean it was not unloaded in deactivate, i.e. it's a 'switchable' part
                        traceSource.debug("[AreaState] _doActivate: part '" + part.name + "' is active already");
                        // NOTE: даже если нет состояния (partStateToApply) всё равно надо звать changeState/reportState,
                        // иначе будет pushState состояния арии, который может удалить текущий стейт парта из url
                        if (part.changeState) {
                            traceSource.debug(function () { return "[AreaState] _doActivate: call changeState for part '" + part.name + "' with: " + JSON.stringify(partStateToApply); });
                            // NOTE: парт уже активен, в переданном AppState есть partOptions, и парт поддерживает changeState.
                            // Вызовем changeState у парта с переданными опциями, из них парт может получить свое состояние (getState),
                            // и применить его, если оно отличается от его текущего состояния.
                            // Но, если состояние не отличается, то последующий pushState (см. вызов _pushAreaState в конце)
                            // удалит состояние из url'a. Этому надо воспрепятствовать.
                            // Совсем не делать pushState мы не можем, что состояние в url может не соответствовать текущему (this),
                            // Поэтому, если состояние не изменило, то просто явно вызывем reportState, чтобы пройти цепочку парт-регион-ария.
                            if (part.changeState(partStateToApply, { disablePushState: options.disablePushState })) {
                                // NOTE: part triggers 'statechange' if state has changed and then region triggers 'statechange' if it's navigable
                                if (isNavigableRegion) {
                                    statePushed = true;
                                }
                            }
                            else if (part.reportState) {
                                part.reportState(true);
                                if (isNavigableRegion) {
                                    statePushed = true;
                                }
                            }
                        }
                        return "continue";
                    }
                    if (isStateDefaultPart && options.keepAlive !== false) {
                        options.keepAlive = true;
                    }
                    // NOTE: after navigable region renders a part it'll trigger 'statechange' event and Area'll do pushState
                    statePushed = isNavigableRegion && !options.disablePushState;
                    traceSource.debug("[AreaState] _doActivate: activating part '" + part.name + "'");
                    var disablePushStateOrg_1;
                    if (toChangeState) {
                        // NOTE: есть состояние для применения через changeState, т.к. оно может вызывать pushState,
                        // то запретим pushState во время активации, и сделаем ее явно после (see continuation)
                        disablePushStateOrg_1 = options.disablePushState;
                        options.disablePushState = true;
                        options.doNotTouchAppState = true;
                    }
                    task = region.activatePart(part, options);
                    /* TODO: issue here: if part rejected its unload (in queryUnload), then we shouldn't change other regions, but we do
                    if (task && lang.isString(task)) {
                        throw new Error(task);
                    }
                    */
                    if (toChangeState) {
                        // reactivating part, we didn't create it, only rendered, so we should tell it to apply its state
                        var continuation = function () {
                            // NOTE: после активации применим состояние, а если оно не изменилось, то явно вызовем reportState,
                            // чтобы произошел pushState (важно не использовать options.disablePushState, т.к. мы его изменили)
                            var pushed = part.changeState(partStateToApply, { disablePushState: disablePushStateOrg_1 });
                            if (!pushed && isNavigableRegion) {
                                if (part.reportState) {
                                    part.reportState();
                                }
                                else {
                                    // NOTE: остается ненормальный вариант: у парта есть метод `changeState`, но нет `reportState`
                                    traceSource.warn("[AreaState] _doActivate: part " + part.name + " has changeState but not reportState");
                                    that._pushAreaState();
                                }
                            }
                        };
                        //WAS: continuation = part.changeState.bind(part, partStateToApply, {disablePushState: options.disablePushState});
                        task = task.then(continuation);
                    }
                    if (task) {
                        tasks.push(task);
                    }
                }
            };
            for (regionName in that.map) {
                _loop_1();
            }
            // NOTE: usually we change app's state (call AppStateManager.pushState) in Region.activatePart,
            // (after part rendered). But it only takes place for navigable regions.
            // So if the area has no navigable regions, we have to simulate pushState via firing event
            task = lang.whenAll(tasks);
            if (!statePushed && !options.disablePushState && !options.doNotTouchAppState) {
                //
                return task.done(function () {
                    that._pushAreaState();
                });
            }
            return task;
        };
        AreaState.prototype._pushAreaState = function () {
            traceSource.debug("[AreaState] '" + this.name + "' state is triggering 'pushstate' event");
            // ask our Area to pushState via AppStateManager with current state (default part for the state)
            this.trigger("pushState");
        };
        AreaState.prototype._onActivated = function (options) {
            options = options || {};
            this.trigger("activated", options);
            traceSource.debug("[AreaState] '" + this.name + "' state triggered 'activated' event");
        };
        /**
         * Deactivate current state. That means unloading all parts except specified in switchableParts.
         * @param {Object} switchableParts "Region to part" map with parts which should not be unloaded
         * @returns {Promise}
         */
        AreaState.prototype.deactivate = function (switchableParts) {
            var that = this;
            var task = this._doDeactivate(switchableParts);
            if (task) {
                return task.then(function () {
                    that._onDeactivated();
                });
            }
            that._onDeactivated();
            return lang.resolved();
        };
        AreaState.prototype._doDeactivate = function (switchableParts) {
            var that = this, options = { reason: "unload", activityContext: {} }, items = [], tasks;
            lang.forEach(that.map, function (part, regionName) {
                var region = that.regionManager.getRegion(regionName), task;
                if (!region) {
                    return;
                }
                if (part) {
                    if (switchableParts && switchableParts[regionName] === part) {
                        return;
                    }
                    task = region.queryUnloadActivePart(options);
                    if (task) {
                        items.push({ task: task, region: region });
                    }
                }
            });
            tasks = items.map(function (i) { return i.task; });
            return lang.whenAll(tasks).then(function () {
                tasks = items.map(function (item) {
                    // TODO: здесь мы не просто выгружаем текущий парт,
                    // мы выгружаем все живые парты в той же активности, что текущий парт.
                    // Это задается с помощью {reason: "unload"}
                    return item.region.unloadActivePart(options);
                });
                return lang.whenAll(tasks);
            });
        };
        AreaState.prototype._onDeactivated = function () {
            this.trigger("deactivated");
            traceSource.debug("[AreaState] '" + this.name + "' state triggered 'deactivated' event");
        };
        AreaState.prototype.resetRegion = function (regionName) {
            var that = this, region, statePushed, part, task;
            traceSource.debug("[AreaState] resetRegion '" + regionName + "'");
            // TODO:
            /*
                    if (lang.isFunction(that.map)) {
                        return that.map(that.name, that.regionManager, {});
                    }
            */
            region = that.regionManager.getRegion(regionName);
            part = that.map[regionName];
            statePushed = region.navigable;
            if (part) {
                if (region.isPartActive(part)) {
                    if (part.changeState) {
                        // reset part's state
                        statePushed = part.changeState({});
                    }
                    else {
                        statePushed = false;
                    }
                }
                else {
                    if (typeof part === "string") {
                        part = region.getPart(part) || that.app.createPart(part);
                    }
                    // TODO: это почему мы тут активируем с опцией keepAlive=true
                    task = region.activatePart(part, { keepAlive: true });
                }
                if (task) {
                    return task.then(function () {
                        if (!statePushed) {
                            that._pushAreaState();
                        }
                        that._onActivated();
                    });
                }
                if (!statePushed) {
                    that._pushAreaState();
                }
                that._onActivated();
            }
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], AreaState.prototype, "hidden");
        return AreaState;
    }(lang.Observable));
    exports.AreaState = AreaState;
    /**
     *
     * @param {Array} regions Array of regions names (of an AreaState)
     * @param {Object} stateSrc Region to part map for source AreaState
     * @param {Object} stateDst Region to part map for destination AreaState
     * @returns {Object} Region to part map for parts which should not be unload when Area switching between specified states.
     * @private
     */
    function _findSwitchableParts(regions, stateSrc, stateDst) {
        if (!stateSrc.map || !stateDst.map) {
            return;
        }
        var res = {};
        regions.forEach(function (region) {
            var src = stateSrc.map[region], dst = stateDst.map[region];
            if (src && dst && lang.isObject(src) && lang.isObject(dst) && src === dst) {
                // The region in both states contains the same part instance, we should not reload it when switching states
                res[region] = src;
            }
        });
        return res;
    }
    var Area = /** @class */ (function (_super) {
        __extends(Area, _super);
        /**
         * @constructs Area
         * @extends Observable
         * @param {Application} app
         * @param {string} name
         * @param {object} options
         * @param {string} [options.title]
         * @param {boolean} [options.hidden]
         */
        function Area(app, name, options) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.name = name;
            that.app = app;
            that.options = options || {};
            that.title = that.options.title || that.name;
            that.hidden(!!that.options.hidden);
            that._isActive = false;
            that.states = {};
            that.currentState = null;
            that.regionManager = new RegionManager(that.app, { debug: that.options.debug });
            that.regionManager.area = that;
            that.areaManager = null; // will be set later by AreaManager.createArea
            that.extensions = {};
            that.regionManager.bind("region.statechange", function (sender, args) {
                /**
                 * @param {Region} sender
                 * @param {object} args
                 * @param {string} args.regionName
                 * @param {Region} args.region
                 * @param {object} args.regionState
                 * @param {Part}   args.regionState.part
                 * @param {string} args.regionState._partUid part's id
                 * @param {object} [args.regionState.partOptions] part's state
                 * @param {string} [args.regionState.title] part's title
                 * @param {object} args.options
                 * @param {boolean} [args.options.replaceState]
                 * @param {object} args.appState
                 */
                var appState;
                if (args.regionState) {
                    appState = that.getAppState(args.regionState, args.regionName);
                }
                else {
                    // region reports already constructed AppState - this happens on resuming a suspended part (NavigationService.close)
                    appState = args.appState;
                }
                traceSource.debug(function () {
                    return "[Area] caught RegionManager's 'region.statechange' event with regionName='" + args.regionName +
                        "'. state=" + JSON.stringify(appState) +
                        (args.options ? ", options=" + JSON.stringify(args.options) : "");
                });
                if (!appState) {
                    traceSource.warn("[Area] RegionManager fired 'region.statechange' event without regionState nor appState");
                    return;
                }
                if (that.isActive()) {
                    that.app.stateManager.pushState(appState, args.options);
                }
                else {
                    that._pendingState = appState;
                }
            });
            that.regionManager.bind("region.resetstate", function (regionName) {
                // region asks to reset its state (i.e. apply activeState logic particularly for him)
                traceSource.debug("[Area] caught RegionManager's 'region.resetstate' event with regionName='" + regionName + "'");
                if (that.transient) {
                    // close area
                    that.close();
                }
                else if (that.currentState) {
                    if (that.currentState.transient) {
                        var defState = that.states[that.getDefaultState()];
                        if (!defState || defState === that.currentState || defState.transient) {
                            // close area
                            that.close();
                        }
                        else {
                            // close current state and activate default state of the current area
                            that.activateState(defState.name);
                        }
                    }
                    else {
                        that.currentState.resetRegion(regionName);
                    }
                }
            });
            if (that.app.userSettingsStore) {
                that.regionManager.bind("region.usersettings.change", function (sender, args) {
                    args.area = that.name;
                    that.app.userSettingsStore.save(args);
                });
                that.regionManager.bind("region.usersettings.request", function (sender, args) {
                    args.area = that.name;
                    args.bundle = that.app.userSettingsStore.load(args);
                });
            }
            return _this;
        }
        Area.prototype.getAppState = function (regionState, regionName) {
            var that = this, currentState = that.currentState, state = {
                area: that.name,
                areaState: {
                    name: currentState ? currentState.name : undefined,
                    title: currentState ? currentState.title : undefined,
                    isDefault: currentState ? currentState.name === that._defaultStateName : true
                },
                regionState: regionState,
                isDefaultPart: currentState && regionName && regionState
                    ? currentState.map[regionName] === regionState.part
                    : false
            };
            if (currentState && !regionState) {
                state.isDefaultPart = true;
            }
            return state;
        };
        /**
         * Initialize area. Search for regions in supplied domElement and add them into regionManager.
         * @param {JQuery|HTMLElement} domElement
         */
        Area.prototype.initialize = function (domElement) {
            var that = this, region;
            if (!domElement) {
                throw new Error("Area.initialize: domElement should be specified");
            }
            that.$domElement = $(domElement);
            that.domElement = that.$domElement[0];
            that.$domElement.filter(".x-region").add(".x-region", that.domElement).each(function () {
                var regionName = $(this).attr("data-region") || this.id, options = lang.parseJsonString($(this).attr("data-region-options")) || {}, region, behavior = options.behavior;
                region = new Region(regionName, options);
                region.render(this);
                that.regionManager.addRegion(region);
                if (behavior) {
                    region.addBehavior(behavior);
                }
            });
            if (Object.keys(that.regionManager.regions).length === 1) {
                // mark single region in the area as navigable
                region = that.regionManager.regions[Object.keys(that.regionManager.regions)[0]];
                if (!region.navigable) {
                    region.navigable = true;
                    // in case if we'll add another explicit navigate region later set special flag.
                    region._navigableAutoSet = true;
                }
            }
        };
        /**
         * Add a new state into the area.
         * @param {object|String} stateSpec - name of the state or json object with its specification
         * @param {string} stateSpec.name
         * @param {string} stateSpec.title
         * @param {boolean} stateSpec.isDefault
         * @param {object|string} map An object which keys are regions names and values are parts (names or instances), or part name for navigable region
         * @param {object} [activateOptions]
         * @returns {Area}
         */
        Area.prototype.addState = function (stateSpec, map, activateOptions) {
            var that = this, spec, stateName, state;
            if (typeof stateSpec === "string" || !stateSpec) {
                stateName = stateSpec;
                spec = { name: stateName };
            }
            else {
                stateName = stateSpec.name;
                spec = stateSpec;
            }
            // NOTE: before 1.29 we threw an error
            state = that.states[stateName];
            if (state) {
                // that could be a auto-created default state, unbind it
                state.unbind();
            }
            if (typeof map === "string") {
                // the region-part map is a string, treat it as part name for our navigable region:
                var navRegion = that.regionManager.getNavigableRegion();
                if (navRegion) {
                    map = (_a = {}, _a[navRegion.name] = map, _a);
                }
            }
            state = new AreaState(that.app, spec, map, that.regionManager);
            state.activateOptions = activateOptions;
            if (spec.isDefault) {
                that._defaultStateName = stateName;
            }
            // AreaState сообщает о желании применить себя к AppState:
            state.bind("pushState", function () {
                traceSource.debug("[Area] AreaState.'pushState' for state '" + state.name + "' raised.");
                var appState = {
                    area: that.name,
                    areaState: {
                        name: state.name,
                        title: state.title,
                        isDefault: state.name === that._defaultStateName
                    },
                    isDefaultPart: true
                };
                var appStateCur = that.app.stateManager.getCurrentState();
                // check if we're currently in the same state then we won't push it again
                if (appStateCur.area === that.name &&
                    appStateCur.areaState.name === state.name &&
                    appStateCur.isDefaultPart &&
                    (!appStateCur.regionState || !appStateCur.regionState.partOptions)) {
                    return;
                }
                that.app.stateManager.pushState(appState);
            });
            that.states[stateName] = state;
            return that;
            var _a;
        };
        /*
            // TODO: another way to initialize states (using addState)
            setRegionStates: function(regionName, map) {
            },
        */
        Area.prototype.getState = function (stateName) {
            return this.states[stateName];
        };
        /**
         * Activates specified state. That means activating part for each region
         * which were set up before with addState/setRegionStates methods.
         * @param {string} state
         * @param {object} [options]
         * @param {AppState} [options.state] AppState object
         * @param {boolean} [options.disablePushState] True if state activating is happening in context of applying App state (i.e. AppStateManager.pushState method should not be called)
         * @param {boolean} [options.fullSwitch=false] If true current areaState will be deactivated even if it's specified in stateName
         * @return {Promise}
         */
        Area.prototype.activateState = function (state, options) {
            var that = this, task, stateName, regionState = {}, stateObj;
            if (!state) {
                stateName = that.getDefaultState();
            }
            else if (typeof state === "string") {
                stateName = state;
            }
            else {
                stateName = state.name;
                regionState = state.regionState;
            }
            if (state && !stateName) {
                // ""/null/undefined mean default state, get its name
                stateName = that.getDefaultState();
            }
            stateObj = that.states[stateName];
            /*if (!stateObj && !stateName) {
                // NOTE: активация к пустому состоянию при отсутствии такового в арии (т.е. ария без состояний)
                return lang.resolved();
            }*/
            if (!stateObj) {
                // The specified state doesn't exist. But it can be gotten from url or from cache on page reload. So it makes no sense to throw.
                traceSource.warn("[Area] activateState: a try to activate unknown state '" + stateName + "'. Falling back to default state");
                // As there's no the specified state then fallback to default state
                stateName = that.getDefaultState();
                stateObj = that.states[stateName];
                if (!stateObj) {
                    // NOTE: либо в арии вообще не состояний, либо нет дефолтного и их >1,
                    // создадим пустое дефолтное состояние, если есть что активировать
                    if (regionState)
                        stateObj = that._createDefaultState();
                    if (!stateObj)
                        return lang.resolved(); // no navigable region in the area
                }
            }
            if (that._activeActivation) {
                // previous activation hasn't completed (it's kind a queue), put this call into the queue.
                return that._activeActivation.then(function () {
                    return that.activateState(state, options);
                });
            }
            that._activeActivation = lang.Deferred();
            options = options || {};
            if (that.currentState && that.currentState === stateObj && !options.fullSwitch) {
                return that.currentState.activate(regionState, options)
                    .always(function () {
                    that._tearDownActivation();
                });
            }
            // Handle a special case: switching states which have the same part instance in the same region
            if (that.currentState) {
                var switchableParts = _findSwitchableParts(Object.keys(that.regionManager.regions), that.currentState, stateObj);
                task = that.currentState.deactivate(switchableParts);
            }
            if (task) {
                return task.then(function () {
                    that.currentState = stateObj;
                    that.trigger("change:currentState", that, stateObj.name);
                    return stateObj.activate(regionState, options);
                }).always(function () {
                    that._tearDownActivation();
                });
            }
            // TODO: convert to observable?
            that.currentState = stateObj;
            try {
                that.trigger("change:currentState", that, stateObj.name);
                return stateObj.activate(regionState, options)
                    .always(function () {
                    that._tearDownActivation();
                });
            }
            catch (e) {
                that._tearDownActivation(true);
                throw e;
            }
        };
        Area.prototype._tearDownActivation = function (fail) {
            var t = this._activeActivation;
            if (t) {
                this._activeActivation = undefined;
                if (fail) {
                    t.reject();
                }
                else {
                    t.resolve();
                }
            }
            if (!fail) {
                html.notifyDOMChanged();
            }
        };
        Area.prototype.setDefaultState = function (stateName) {
            this._defaultStateName = stateName;
        };
        /**
         * Returns name of area default state. It could be a state explicitly specified via `setDefaultState` or the only state of the area.
         * @return {String} Name of the area state
         */
        Area.prototype.getDefaultState = function () {
            var state = this._defaultStateName;
            if (state === undefined) {
                var names = Object.keys(this.states);
                if (names.length === 1) {
                    return names[0];
                }
            }
            return state;
        };
        Area.prototype._createDefaultState = function () {
            var that = this;
            var navRegion = that.regionManager.getNavigableRegion();
            if (navRegion) {
                var map = (_a = {}, _a[navRegion.name] = "", _a);
                that.addState({ name: "", isDefault: true }, map);
                return that.states[""];
            }
            var _a;
        };
        Area.prototype.suspend = function () {
            this._hide();
            lang.forEach(this.regionManager.regions, function (region) {
                region.suspend();
            });
        };
        Area.prototype.resume = function () {
            var that = this;
            that.ensureInitialized();
            var promisable = that._onActivating();
            return lang.async.then(promisable, function () {
                that.$domElement.show();
                that.isActive(true);
                lang.forEach(that.regionManager.regions, function (region) {
                    region.resume();
                });
                that._onShown();
            });
        };
        /**
         * Shows current area.
         * @deprecated use areaManager.activateState/activateArea
         */
        Area.prototype.show = function () {
            var that = this;
            that.ensureInitialized();
            var promisable = that._onActivating();
            return lang.async.then(promisable, function () {
                that.$domElement.show();
                that.isActive(true);
                that._onShown();
            });
        };
        Area.prototype.close = function () {
            this.trigger("request_close", this);
        };
        Area.prototype._onActivating = function () {
            var args = { promise: undefined };
            this.trigger("activating", this, args);
            return args.promise;
        };
        Area.prototype._onShown = function () {
            var that = this;
            //that.isActive(true);
            //that.ensureInitialized();
            that.trigger("activated", that);
        };
        Area.prototype._hide = function () {
            var that = this;
            that.$domElement.hide();
            that.isActive(false);
            that.trigger("deactivated", that);
        };
        /**
         * @deprecated use areaManager.activateState/activateArea
         */
        Area.prototype.hide = function () {
            this._hide();
        };
        Area.prototype.applyCurrentState = function () {
            var that = this, appState;
            if (that._pendingState) {
                // there'a a pending state while area was inactive
                appState = that._pendingState;
                that._pendingState = undefined;
                that.app.stateManager.pushState(appState);
            }
            else if (!that.currentState && that.getDefaultState() !== undefined) {
                // activate area with no active state but with a default state, so we're activating this default state
                that.activateState(that._defaultStateName /*, {disablePushState:true}*/);
                return;
            }
            else if (that._lastAppState) {
                // restore state of suspended area
                that.app.stateManager.pushState(that._lastAppState);
            }
            /* // NOTE: removed in WC-1266:
            else if (that.currentState) {
                appstate = that.getAppState();
                that.app.stateManager.pushState(appstate);
            }*/
            that._lastAppState = undefined;
        };
        Area.prototype.ensureInitialized = function () {
            if (!this.initialized) {
                this.initialized = true;
                this.trigger("initialized");
            }
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], Area.prototype, "hidden");
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], Area.prototype, "isActive");
        return Area;
    }(lang.Observable));
    exports.Area = Area;
    var AreaManager = /** @class */ (function (_super) {
        __extends(AreaManager, _super);
        /**
         * @constructs AreaManager
         * @extends Observable
         * @memberOf module:"core.composition"
         * @param {Application} app
         * @param {Object} options
         */
        function AreaManager(app, options) {
            var _this = _super.call(this) || this;
            _this._areas = [];
            _this.app = app;
            _this.options = options || {};
            return _this;
        }
        /**
         * Returns area instance with the specified name.
         * @param {String} name Area name
         * @returns {Area}
         */
        AreaManager.prototype.getArea = function (name) {
            var that = this, i, len, area;
            if (!name) {
                name = "";
            }
            for (i = 0, len = that._areas.length; i < len; i += 1) {
                area = that._areas[i];
                if (area.name === name) {
                    return area;
                }
            }
            if (name === "" && that._defaultArea) {
                return that.getArea(that._defaultArea);
            }
        };
        /**
         * Returns all areas
         * @returns {Array<Area>}
         */
        AreaManager.prototype.getAreas = function () {
            return this._areas.slice();
        };
        /**
         * Create and initialize a new Area.
         * @param {String} name Area name. It should be unique.
         * @param {JQuery|HTMLElement} [domElement] Root HTML element for the area. If not specified, it will be created (as div) under application root element.
         * @param {Object} [options] Area parameters, see Area.constructor.
         * @return {Area}
         */
        AreaManager.prototype.createArea = function (name, domElement, options) {
            var that = this;
            name = name || "";
            options = that.getAreaOptions(options);
            var area = new Area(that.app, name, options);
            if (!domElement && that.areasContainer) {
                var $domElement = $("<div class='x-area' style='display: none'></div>").appendTo(that.areasContainer);
                if (that.areaCssClass) {
                    $domElement.addClass(that.areaCssClass);
                }
                domElement = $domElement[0];
            }
            if (!domElement) {
                throw new Error("AreaManager.createArea: Area's domElement wasn't specified and can't be auto-created");
            }
            area.areaManager = that;
            area.initialize(domElement);
            that._areas.push(area);
            area.bind("activated", that._onAreaActivated, that);
            area.bind("request_activate", that._onAreaRequestActivation, that);
            area.bind("request_close", that._onAreaRequestClose, that);
            return area;
        };
        AreaManager.prototype.getAreaOptions = function (options) {
            var that = this;
            if (that.options.debug) {
                options = lang.extendEx({ debug: that.options.debug }, options, { deep: true });
            }
            return options;
        };
        AreaManager.prototype._onAreaActivated = function (area) {
            this.trigger("changeArea", area.name);
        };
        AreaManager.prototype._onAreaRequestActivation = function (sender) {
            this.activateArea(sender.name);
        };
        AreaManager.prototype._onAreaRequestClose = function (area) {
            //area.regionManager.unloadAll({suppressUI: true});
            var that = this, _area = area, state = _area._rollbackAppState;
            _area._rollbackAppState = undefined;
            traceSource.debug("[AreaManager] _onAreaRequestClose: area '" + area.name + "' is self closing");
            area.suspend();
            if (state) {
                that.app.stateManager.applyState(state);
            }
            else {
                that.activateState(null, null);
            }
        };
        /**
         * Remove specified area. This will unloads all its regions with their parts.
         * @param {String|Area} area An area instance or name
         */
        AreaManager.prototype.removeArea = function (area) {
            var that = this, area2 = !area || lang.isString(area) ? that.getArea(area) : area;
            if (area2) {
                area2.areaManager = null;
                area2.unbind("activated", null, that);
                area2.unbind("request_activate", null, that);
                area2.unbind("request_close", null, that);
                lang.arrayRemove(that._areas, area);
                if (that._currentArea === area) {
                    // removing active area
                    area2.regionManager.unloadAll();
                }
                else {
                    // removing inactive area
                    area2.regionManager.unloadAll({ suppressUI: true });
                }
            }
        };
        /**
         * Set an area as default. Default area is an area to switch application root ("/") is mapped.
         * @param {String|Area} area
         */
        AreaManager.prototype.setDefaultArea = function (area) {
            var name = "";
            if (area) {
                name = lang.isString(area) ? area : area.name;
            }
            this._defaultArea = name;
        };
        /**
         * Returns currently active area.
         * @returns {Area|null}
         */
        AreaManager.prototype.getActiveArea = function () {
            return this._currentArea;
        };
        /**
         * Hide currently active area and show specified one.
         * For the new area the method restores previous area state or activates a default one.
         * @param {string} areaName Area name to show
         * @returns {boolean} true if Area activated, or false - Area is unknown
         */
        AreaManager.prototype.activateArea = function (areaName) {
            var that = this, newArea = that.getArea(areaName);
            if (!newArea) {
                // Not existing area specified, fallback to default area
                if (areaName !== "" && (that._defaultArea || that._defaultArea === "")) {
                    newArea = that.getArea(that._defaultArea);
                    traceSource.warn("[AreaManager] activateArea: a try to activate unknown area '" + areaName + "'. Falling back to default area");
                }
                else {
                    // there's no default area
                    traceSource.error("[AreaManager] activateArea: a try to activate unknown area '" + areaName + "'.");
                    return false;
                }
            }
            var promisable = that._doActivateArea(newArea);
            return lang.async.then(promisable, function () {
                newArea.applyCurrentState();
                html.notifyDOMChanged();
                return true;
            });
        };
        /**
         * Hide currently active area and show specified one.
         * @param {String} areaName Area name to show
         * @param {String|AreaStateActivateOptions} areaState Area's state name to activate
         * @param {ActivateOptions} [options]
         */
        AreaManager.prototype.activateState = function (areaName, areaState, options) {
            var that = this, newArea = that.getArea(areaName);
            if (!newArea) {
                // Not existing area is specified, fallback to default area
                if (areaName !== "" && (that._defaultArea || that._defaultArea === "")) {
                    newArea = that.getArea(that._defaultArea);
                    // we're redirecting to another area than specified, so we can't use state in options, clear it
                    areaState = "";
                    traceSource.warn("[AreaManager] activateState: a try to activate unknown area '" + areaName + "'. Falling back to default area");
                }
                else {
                    // there's no default area
                    traceSource.error("[AreaManager] activateState: a try to activate unknown area '" + areaName + "'.");
                    return lang.rejected();
                }
            }
            if (!areaState) {
                areaState = newArea.getDefaultState();
            }
            var applyingState = options && options.doNotTouchAppState && options.disablePushState;
            var promisable = that._doActivateArea(newArea, applyingState);
            return lang.async.then(promisable, function () {
                return newArea.activateState(areaState, options);
            });
        };
        AreaManager.prototype._doActivateArea = function (newArea, applyingState) {
            var that = this, currentArea = that._currentArea, appState;
            if (newArea !== currentArea) {
                // we need to activate the new area first as it's not active
                // but before we should unload currently active area
                if (currentArea) {
                    if (applyingState) {
                        appState = that.app.stateManager.getPreviousState();
                    }
                    else {
                        appState = that.app.stateManager.getCurrentState();
                    }
                    currentArea.suspend();
                    currentArea._lastAppState = appState;
                    if (newArea.transient) {
                        // new area is transient, i.e. it can be "closed",
                        // on closing we'll need to activate the previous area (i.e. currentArea)
                        newArea._rollbackAppState = appState;
                    }
                } // else: there's no active area
                that._currentArea = newArea;
                return newArea.resume();
            } // else: the newArea is already active
        };
        return AreaManager;
    }(lang.Observable));
    exports.AreaManager = AreaManager;
    /**
     * @typedef {Object} AreaManagerOptions
     * @property {CompositionDebugOptions} debug
     */
    /**
     * @event RegionManager#"region.statechange"
     * @property {RegionManager} sender
     * @property {object} args
     * @property {string} args.regionName
     * @property {Region} args.region
     * @property {object} args.regionState
     * @property {Part} args.regionState.part
     * @property {string} args.regionState._partUid part's id
     * @property {object} [args.regionState.partOptions] part's state
     * @property {string} [args.regionState.title] part's title
     * @property {object} args.options
     * @property {boolean} [args.options.replaceState]
     */
    var RegionManager = /** @class */ (function (_super) {
        __extends(RegionManager, _super);
        /**
         * @constructs RegionManager
         * @extends Observable
         * @memberOf module:"core.composition"
         * @param partRegistry
         * @param {Object} [options]
         * @param {CompositionDebugOptions} [options.debug]
         */
        function RegionManager(partRegistry, options) {
            var _this = _super.call(this) || this;
            _this.regions = {}; // all root regions
            _this.partRegistry = partRegistry;
            _this.options = options || {};
            return _this;
        }
        /**
         * Return a region by its name.
         * @param {String} name
         * @returns {Region}
         */
        RegionManager.prototype.getRegion = function (name) {
            // todo: check existence
            return this.regions[name];
        };
        /**
         * Add region
         * @param {Region} region
         * @returns {Region}
         */
        RegionManager.prototype.addRegion = function (region) {
            var that = this, name = region.name || "";
            if (region.navigable) {
                // check that there's only one navigable region,
                // NOTE: there could be navigable region if it was the only region in Area.initialize
                lang.forEach(that.regions, function (regIns, regName) {
                    if (regIns.navigable) {
                        if (regIns._navigableAutoSet) {
                            regIns._navigableAutoSet = undefined;
                            regIns.navigable = false;
                        }
                        else {
                            throw new Error("RegionManager.addRegion: cannot add another navigable region into Area, there is one already - " + regName);
                        }
                    }
                });
            }
            that.regions[name] = region;
            region.setNavigationService(new NavigationService(region, that.partRegistry));
            region.bind("statechange", function (sender, args) {
                args.regionName = sender.name;
                args.region = sender;
                that.trigger("region.statechange", that, args);
            });
            region.bind("resetstate", function () {
                that.trigger("region.resetstate", name);
            });
            region.bind("usersettings.change", function (sender, args) {
                args.region = sender.name;
                that.trigger("region.usersettings.change", that, args);
            });
            region.bind("usersettings.request", function (sender, args) {
                args.region = sender.name;
                that.trigger("region.usersettings.request", that, args);
            });
            if (that.area) {
                region.bind("request_activate", function () {
                    that.area.trigger("request_activate", that.area);
                });
            }
            if (that.area) {
                // NOTE: if later we want to remove region from the manager, it won't be GC'ed as this handler will hold reference to it
                that.area.bind("change:isActive", function (sender, value) {
                    region.isInBackground = !value;
                });
                region.isInBackground = !that.area.isActive();
            }
            if (that.options.debug && that.options.debug.regionMenu) {
                region.addBehavior("debug", that.options.debug.regionMenu);
            }
            return region;
        };
        /**
         * Unload all regions.
         * @param {Object} [options]
         */
        RegionManager.prototype.unloadAll = function (options) {
            lang.forEach(this.regions, function (region) {
                if (region) {
                    region.unload(options);
                }
            });
        };
        /**
         * Create a new Region
         * @param {String} name
         * @param {RegionOptions} options
         * @returns {Region}
         */
        RegionManager.prototype.createRegion = function (name, options) {
            var that = this;
            if (!that.area || !that.area.domElement.ownerDocument) {
                return;
            }
            var domElement = that.area.domElement.ownerDocument.createElement("div");
            $(domElement).addClass("x-region");
            that.area.domElement.appendChild(domElement);
            var region = new Region(name, options);
            region.render(domElement);
            that.addRegion(region);
            return region;
        };
        /**
         * Find and return a navigable Region.
         * @returns {Region}
         */
        RegionManager.prototype.getNavigableRegion = function () {
            return lang.find(this.regions, function (region) {
                return region.navigable;
            });
        };
        /**
         * Remove region.
         * @param {string|Region} region
         */
        RegionManager.prototype.removeRegion = function (region) {
            var that = this, reg;
            if (lang.isString(region)) {
                reg = that.getRegion(region);
            }
            else {
                reg = region;
            }
            if (reg) {
                reg.unbind(null, null, that);
                delete that.regions[reg.name];
                return true;
            }
            return false;
        };
        return RegionManager;
    }(lang.Observable));
    exports.RegionManager = RegionManager;
    var PartHelper = /** @class */ (function () {
        /**
         * @constructs PartHelper
         * @description "Part inside region" wrapper class. For internal use only.
         * @param {Part} part
         * @param {object} options
         * @param {TraceSource} options.traceSource
         * @param {object} options.effects
         * @param {object} options.overrides
         * @param {boolean} options.isNested
         * @param {boolean} options.keepAlive
         * @param {boolean} options.freezeUrl
         */
        function PartHelper(part, options) {
            var that = this;
            if (!part) {
                throw new Error("PartHelper: part cannot be null");
            }
            that.part = part;
            that.rendered = false;
            that.activity = null;
            that.region = null;
            that.isNested = options.isNested;
            that.hiddenInitially = options.hiddenInitially;
            that.keepAlive = options.keepAlive;
            that.freezeUrl = options.freezeUrl;
            that.keepStandalone = undefined;
            that.effects = options.effects;
            that.overrides = options.overrides || {};
            that.traceSource = options.traceSource;
        }
        PartHelper.prototype._initializeContainer = function (regionDomElement) {
            var that = this;
            if (!regionDomElement) {
                throw new Error("PartHelper: regionDomElement cannot be null");
            }
            that.partDomSelector = $("<div></div>").appendTo(regionDomElement);
            that.partDomElement = that.partDomSelector.get(0);
            if (that.hiddenInitially) {
                that.partDomSelector.hide();
            }
        };
        PartHelper.prototype.render = function (regionDomElement) {
            var that = this, task, part = that.part;
            this._throwIfDisposed();
            if (that.rendered) {
                throw new Error("PartHelper: Part '" + that.part.name + "' is activated already and can't be activated");
            }
            that.traceSource.debug("[PartHelper] rendering part '" + that.part.name + "'.");
            if (!part.render) {
                throw new Error("Part object " + part.name + " doesn't contain render method");
            }
            that._initializeContainer(regionDomElement);
            task = part.render(that.partDomElement);
            if (task && lang.isPromise(task)) {
                return task.always(function () {
                    return that._show();
                });
            }
            return that._show();
        };
        /**
         *
         * @param options
         * @param {String} options.reason
         * @param {Object} options.activityContext
         * @return {Object|jQuery.Deferred}
         */
        PartHelper.prototype.canUnload = function (options) {
            var that = this, part = that.part, queryUnload, reasonToStayOrDefer;
            options = lang.extend({ reason: "unload" }, options);
            queryUnload = that.overrides.queryUnload || part.queryUnload;
            if (queryUnload) {
                // TODO: pass UiService into queryUnload (for showing ConfirmDialog)
                reasonToStayOrDefer = queryUnload.call(part, options);
                if (lang.isPromise(reasonToStayOrDefer)) {
                    return lang.async.then(reasonToStayOrDefer, function (reasonToStay) {
                        return that._canUnloadResult(reasonToStay);
                    }, function (res) {
                        return res || { canUnload: false };
                    });
                }
            }
            return that._canUnloadResult(reasonToStayOrDefer);
        };
        PartHelper.prototype._canUnloadResult = function (reasonToStay) {
            if (reasonToStay) {
                if (lang.isString(reasonToStay)) {
                    return { reasonToStay: reasonToStay, canUnload: false };
                }
                /* WAS: непонятно откуда может взяться структура, если queryUnload возвращает Promisable<string>:
                if (reasonToStay.reasonToStay) {
                    return { reasonToStay: reasonToStay.reasonToStay, canUnload: false };
                }*/
            }
            return { canUnload: true };
        };
        PartHelper.prototype.unload = function (options) {
            var that = this, task;
            if (!that.rendered) {
                return;
            }
            options = lang.extend({ reason: "unload" }, options);
            this._throwIfDisposed();
            task = !options.suppressUI ? that._hide() : undefined;
            if (task) {
                return task.then(function () {
                    return that._unload2(options);
                });
            }
            return that._unload2(options);
        };
        PartHelper.prototype._unload2 = function (options) {
            var that = this, part = that.part, unload = that.overrides.unload || part.unload, task;
            that.rendered = false;
            that.traceSource.debug("[PartHelper] unloaded part '" + that.part.name + "'. ");
            if (unload) {
                task = unload.call(part, options);
                if (task && lang.isPromise(task)) {
                    return task.done(function () {
                        that.partDomSelector.remove();
                    });
                }
            }
            that.partDomSelector.remove();
        };
        PartHelper.prototype._show = function () {
            var that = this;
            that.rendered = true;
            that.traceSource.debug("[PartHelper] rendered part '" + that.part.name + "'. ");
            if (that.hiddenInitially) {
                if (that.part.show) {
                    return that.part.show();
                }
                if (that.effects && that.effects.show) {
                    return that.effects.show(that.partDomElement);
                }
                that.partDomSelector.show();
            }
        };
        PartHelper.prototype._hide = function () {
            var that = this;
            // Plugin 'jquery.animate-enhanced' doesn't fire complete callback for elements with 'display:none'
            // or for detached elements: https://github.com/benbarnett/jQuery-Animate-Enhanced/issues/128
            // So we never signal about finishing of the animation for those elements. Return immediately in this case.
            // NOTE: ':hidden' selector is true for elements with 'display:none' as well as for detached elements.
            if (that.partDomSelector.is(":hidden")) {
                return;
            }
            if (that.part.hide) {
                return that.part.hide();
            }
            if (that.effects && that.effects.hide) {
                return that.effects.hide(that.partDomElement);
            }
            /* FAST METHOD (it's also much safer as doesn't produce asynchronicity):
            this.partDomSelector.hide();
             */
            var deferred = lang.Deferred();
            that.partDomSelector.fadeOut(200, function () {
                deferred.resolve();
            });
            return deferred.promise();
        };
        PartHelper.prototype.dispose = function (options) {
            var that = this;
            that.rendered = false;
            that.disposed = true;
            if (that.part.dispose) {
                that.part.dispose.apply(that.part, arguments);
            }
        };
        PartHelper.prototype.subscribeOnStateChange = function (callback) {
            var that = this, part = that.part;
            that.partStateChangeCallback = callback;
            if (part.bind) {
                part.bind("statechange", that.onPartStateChanged, that);
            }
        };
        PartHelper.prototype.unsubscribeOnStateChange = function () {
            var that = this, part = that.part;
            that.partStateChangeCallback = undefined;
            if (part.unbind) {
                part.unbind("statechange", null, that);
            }
        };
        PartHelper.prototype.onPartStateChanged = function (state, options) {
            this.partStateChangeCallback(this, state, options);
        };
        PartHelper.prototype.subscribeOnUserSettingsChange = function (callback, context) {
            var that = this, name;
            if (that.part.userSettings && that.part.userSettings.bind) {
                name = (that.part.userSettings.name || that.part.name);
                // NOTE: we're subscribing on part's UserSettings if and only if settings have name (either part's name or its own name)
                if (name) {
                    that.partUserSettingsChangeCallback = callback.bind(context);
                    that.part.userSettings.bind("change", that.onPartUserSettingsChanged, that);
                    return name;
                }
            }
        };
        PartHelper.prototype.unsubscribeOnUserSettingsChange = function () {
            var that = this;
            if (that.partUserSettingsChangeCallback) {
                that.partUserSettingsChangeCallback = undefined;
                that.part.userSettings.unbind("change", null, that);
            }
        };
        PartHelper.prototype.onPartUserSettingsChanged = function (sender, bundle) {
            var that = this;
            if (that.partUserSettingsChangeCallback) {
                that.partUserSettingsChangeCallback(that.part, bundle);
            }
        };
        PartHelper.prototype._throwIfDisposed = function () {
            if (this.disposed) {
                throw new Error("PartHelper was disposed");
            }
        };
        return PartHelper;
    }());
    exports.PartHelper = PartHelper;
    var Activity = /** @class */ (function (_super) {
        __extends(Activity, _super);
        /**
         * @constructs Activity
         * @extends Observable
         * @memberOf module:"core.composition"
         * @param {Region} region
         */
        function Activity(region) {
            var _this = _super.call(this) || this;
            _this._transitions = [];
            _this._region = region;
            return _this;
        }
        /**
         * Suspend active part and activate the specified part in context of the activity.
         * @param {Part} part A part to activate
         * @param {Object} options
         * @param {Function} [options.onReturn] Callback to be called on return
         * @param {String} [options.sourceStateId]
         * @param {Part} [options.sourcePart]
         * @param {Object} [options.activateOptions] options for Region.activatePart
         * @returns {Promise}
         */
        Activity.prototype.forward = function (part, options) {
            var that = this, task, tran, activateOption;
            options = options || {};
            that._region.traceSource.debug("Activity.forward to part '" + part.name + "'");
            tran = {
                // TODO: где взять History ???
                // current AppState's id (to rollback later)
                sourceStateId: options.sourceStateId || Historyjs.getStateId(Historyjs.getState(false)),
                sourcePart: options.sourcePart || that._region.getActivePart(),
                target: part,
                callback: options.onReturn || lang.noop
            };
            that._transitions.push(tran);
            activateOption = lang.extend({ isNested: true, activity: that }, options.activateOptions);
            // Inheritance of freezeUrl:
            if (!activateOption.freezeUrl && that._transitions.length > 1) {
                // if the current part was opened with freezeUrl option then subsequent parts will be opened with that option as well
                activateOption.freezeUrl = that._transitions[that._transitions.length - 2].freezeUrl;
            }
            tran.freezeUrl = activateOption.freezeUrl;
            task = that._region.suspendActivePart(that)
                .then(function () { return that._region.activatePart(part, activateOption); });
            return task;
        };
        /**
         * Close active part and activate previous one
         * @param {*} result
         * @param {object} [options]
         * @param {boolean} options.keepAlive Do to destroy current part (will be passed to `Region.closeActivePart`)
         * @param {boolean} options.disableResume Do to resume previous part (only unload current part)
         * @returns {Promise}
         */
        Activity.prototype.backward = function (result, options) {
            var that = this, task, tran = that._transitions.pop();
            that._region.traceSource.debug("Activity.backward (keepAlive=" + (options && options.keepAlive) + ")");
            task = that._region.closeActivePart(options);
            if (!options || !options.disableResume) {
                task = task.then(function () {
                    var state;
                    if (tran && tran.sourcePart) {
                        if (tran.sourceStateId) {
                            // TODO: где взять History ???
                            state = Historyjs.getStateById(tran.sourceStateId).data;
                        }
                        return that._region.resumePreviousPart(tran.sourcePart, state);
                    }
                    that._region.resetState();
                });
            }
            if (tran && tran.callback) {
                return task.then(function () {
                    tran.callback(result || {});
                });
            }
            return task;
        };
        Activity.prototype.onPartRemoved = function (removedPart) {
            if (!this._transitions) {
                return;
            }
            var that = this, length = that._transitions.length, tran;
            if (!length) {
                return;
            }
            if (that._transitions[length - 1].target === removedPart) {
                that._transitions.pop();
                return;
            }
            for (var i = length - 1; i >= 0; i--) {
                tran = that._transitions[i];
                if (removedPart === tran.target) {
                    lang.arrayRemove(that._transitions, tran);
                    return;
                }
            }
        };
        Activity.prototype.dispose = function () {
            this._region = undefined;
            this._transitions = undefined;
            this.trigger("dispose");
            _super.prototype.dispose.call(this);
        };
        return Activity;
    }(lang.Observable));
    exports.Activity = Activity;
    var NavigationService = /** @class */ (function (_super) {
        __extends(NavigationService, _super);
        /**
         * @constructs NavigationService
         * @extends Observable
         * @memberOf module:"core.composition"
         * @param {Region} region Host region
         * @param {Object} partRegistry
         */
        function NavigationService(region, partRegistry) {
            var _this = _super.call(this) || this;
            _this.region = region;
            _this.partRegistry = partRegistry;
            return _this;
        }
        /**
         * Suspend active part and switch to another.
         * @param options - JSON-object:
         * @param {Object|String} options.part Part instance or part name
         * @param {Object} [options.partOptions] Options that will be passed into part's constructor (if part is Stirng)
         * @param {Function} [options.onReturn] Callback to be called on return
         * @param {Object} [options.activateOptions] options for Region.activatePart
         * @return {Promise} Promise of Part
         */
        NavigationService.prototype.navigate = function (options) {
            var that = this, part = that._getPartInstance(options);
            // Let part change its activateOptions
            options = that._applyHostContext(part, options, "region");
            // part can ask to open it in Dialog
            if (options.openInDialog) {
                return that.doOpenModal(part, options);
            }
            if (!that._currentActivity) {
                that._currentActivity = new Activity(that.region);
                that._currentActivity.bind("dispose", function () {
                    that._currentActivity = null;
                });
            }
            if (that.region.isInBackground) {
                // Region's area is inactive, so we should activate it first.
                // NOTE: currently area activation is synchronous
                that.region.trigger("request_activate", that.region);
            }
            return that._currentActivity
                .forward(part, options)
                .then(function () { return part; });
        };
        /**
         * Opens a dialog and renders the part inside it.
         * @param {Object} options
         * @param {Part|String} options.part Part instance or part name
         * @param {Object} [options.partOptions] Options that will be passed into part's constructor (if part is Stirng)
         * @param {Function} [options.onReturn] Callback to be called on return
         * @param {Object} [options.dialogOptions] options for `Dialog` constructor.
         * @return {Promise} Deferred of Part
         */
        NavigationService.prototype.openModal = function (options) {
            var that = this, part = that._getPartInstance(options);
            // Let part change its activateOptions
            options = that._applyHostContext(part, options, "dialog");
            return that.doOpenModal(part, options);
        };
        NavigationService.prototype.doOpenModal = function (part, options) {
            var that = this, defer = lang.Deferred();
            var dialogOptions = lang.extend({ body: part }, options.dialogOptions);
            that.createDialog(dialogOptions)
                .bind("ready", function () {
                defer.resolve(part);
            })
                .open()
                .always(function (result) {
                if (options.onReturn) {
                    options.onReturn(result);
                }
            });
            return defer.promise();
        };
        NavigationService.prototype._getPartInstance = function (options) {
            var that = this, optionPart = options && options.part, part;
            if (!optionPart) {
                throw new Error("NavigationService: cannot navigate as options.part wasn't specified");
            }
            if (typeof optionPart === "string") {
                if (!that.partRegistry) {
                    throw new Error("NavigationService: cannot navigate as partRegistry wasn't set");
                }
                part = that.partRegistry.createPart(optionPart, options.partOptions);
                options.partOptions = undefined;
            }
            else {
                part = optionPart;
            }
            return part;
        };
        NavigationService.prototype._applyHostContext = function (part, options, host) {
            if (part.applyHostContext) {
                if (options.openInDialog) {
                    host = "dialog";
                }
                var partNavOpts = part.applyHostContext({ host: host });
                if (partNavOpts) {
                    options = lang.appendEx(options, partNavOpts, { deep: true });
                }
            }
            return options;
        };
        /**
         * Creates a dialog
         * @param {Object} [options] Options to pass to dialog's constructor
         * @returns {Dialog}
         */
        NavigationService.prototype.createDialog = function (options) {
            return this.partRegistry.createDialog(options);
        };
        /**
         * Close and destroy current part and return to previous suspended part.
         * @param {*} [result] Any object which will be passed into the callback specified in `onReturn` option of `navigate` method.
         * @param {object} [options]
         * @param {boolean} [options.keepAlive] if `true` then it's equivalent to `leave`
         */
        NavigationService.prototype.close = function (result, options) {
            return this._back(result, options);
        };
        /**
         * Unload current part (but not destroy) and return to previous suspended part.
         * @param {*} [result] Any object which will be passed into the callback specified in `onReturn` option of `navigate` method.
         */
        NavigationService.prototype.leave = function (result) {
            return this._back(result, { keepAlive: true });
        };
        NavigationService.prototype._back = function (result, options) {
            var that = this;
            if (!that._currentActivity) {
                // closing the last part in region - go to default part for current state
                return that.region.closeActivePart(options)
                    .then(function () {
                    that.region.resetState();
                });
                // WAS: throw new Error("NavigationService.close method was called without related calling navigate method");
            }
            return that._currentActivity.backward(result, options);
        };
        /**
         * Close (and optionally destroy) current part and navigate to the new one.
         * @param {NavigationService.NavigateOptions} options See `navigate` method
         * @param {object} [closeOptions]
         * @param {boolean} [closeOptions.keepAlive]
         * @returns {Promise<IPart>}
         */
        NavigationService.prototype.replace = function (options, closeOptions) {
            var that = this, tran;
            if (!options || !options.part) {
                throw new Error("NavigationService.replace: options.part wasn't specified");
            }
            var keepAlive = closeOptions && closeOptions.keepAlive;
            options.activateOptions = lang.extend({ replaceState: true }, options.activateOptions);
            if (!that._currentActivity) {
                // closing the last part in region - go to default part for current state
                return that.region.closeActivePart({ keepAlive: keepAlive })
                    .then(function () {
                    return that.navigate(options);
                });
            }
            // NOTE: 'backward' will remove last transition and in the following 'navigate' region's currentPart will be null
            // so we backup reference to previous part
            if (that._currentActivity._transitions.length > 0) {
                tran = that._currentActivity._transitions[that._currentActivity._transitions.length - 1];
                options.sourceStateId = tran.sourceStateId;
                options.sourcePart = tran.sourcePart;
                options.onReturn = tran.callback;
            }
            return that._currentActivity.backward(null, { keepAlive: keepAlive, disableResume: true })
                .then(function () {
                return that.navigate(options);
            });
        };
        return NavigationService;
    }(lang.Observable));
    exports.NavigationService = NavigationService;
    /**
     * @typedef {object} UnloadOptions
     * @property {string} reason
     */
    var Region = /** @class */ (function (_super) {
        __extends(Region, _super);
        /**
         * @constructs Region
         * @extends Part
         * @memberOf module:"core.composition"
         * @fires Region#statechange
         * @param {string} name
         * @param {object} options
         */
        function Region(name, options) {
            var _this = this;
            options = Region.mixOptions(options, Region.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.name = name;
            that.navigable = that.options.navigable;
            that.traceSource = new diagnostics.TraceSource(that.options.traceSourceName, "Region:" + name);
            that.isInBackground = false;
            that._parts = [];
            return _this;
        }
        /**
         * Render region, i.e. render current part if it exists.
         * In spite of Part.render Region.render allow several sequential calls (without unload).
         * @param {JQuery|HTMLElement} domElement
         */
        Region.prototype.render = function (domElement) {
            var that = this, promise;
            if (!that.domElement) {
                // NOTE: super.render will fail if this.domElement already set
                _super.prototype.render.call(this, domElement || that._domElement);
            }
            if (that._activePartHelper) {
                promise = that._activatePart3(that._activePartHelper);
            }
            that.traceSource.debug("region '" + that.name + "' rendered");
            return promise;
        };
        Region.prototype.rerender = function () {
            var that = this, domElement = that.domElement;
            if (!domElement) {
                throw new Error("Region.rerender was called without render");
            }
            var activePart = that._activePartHelper;
            that.renderStatus(_ui_types_1.RenderStatus.rendering);
            that.unload({ reason: "rerender", keepAlive: true });
            that._activePartHelper = activePart;
            return that.render(domElement);
        };
        /**
         * Unload Region with active part
         * @param {UnloadOptions} options
         * @returns {JQueryPromise<void>|void}
         */
        Region.prototype.unload = function (options) {
            var that = this;
            that._domElement = that.domElement;
            that.traceSource.debug("unloading region '" + that.name + "'");
            options = lang.extend({ reason: "unload", suppressUI: true }, options);
            if (that._activePartHelper) {
                that._unloadPart(that._activePartHelper, options);
            }
            _super.prototype.unload.call(this, options);
        };
        /**
         * Unload active part while the region is going to background (as part of inactive area).
         */
        Region.prototype.suspend = function () {
            if (this._activePartHelper) {
                // TODO: почему мы не используем _unloadPart (с опцией keepAlive)?
                this._activePartHelper.unload({ reason: "suspend" /*"regionSuspend"*/, suppressUI: true });
                this.onPartUnloaded(this._activePartHelper);
            }
        };
        /**
         * Restore (render) the part which was active when suspend was called.
         */
        Region.prototype.resume = function () {
            if (this._activePartHelper) {
                this._activePartHelper.render(this.domElement);
                this.onPartRendered(this._activePartHelper);
            }
        };
        Region.prototype._lookupHelper = function (part) {
            return lang.find(this._parts, function (partHelper) {
                return partHelper.part === part;
            });
        };
        Region.prototype._arrangeHelper = function (part, options) {
            var that = this, i, partHelper, length = that._parts.length;
            options = options || {};
            for (i = 0; i < length; ++i) {
                partHelper = that._parts[i];
                if (part === partHelper.part) {
                    if (i !== length - 1) {
                        // если это не последний элемент, то передвинем его в конец
                        // для этого удалим и добавим заново
                        lang.arrayRemove(that._parts, partHelper);
                        that._parts.push(partHelper);
                    }
                    if (options) {
                        // allow override options with new activation
                        partHelper.overrides = lang.coalesce(options.overrides, partHelper.overrides);
                        partHelper.isNested = lang.coalesce(options.isNested, partHelper.isNested); // subject to change
                        partHelper.keepAlive = lang.coalesce(options.keepAlive, partHelper.keepAlive);
                        partHelper.freezeUrl = lang.coalesce(options.freezeUrl, partHelper.freezeUrl);
                    }
                    return partHelper;
                }
            }
            if (!part.__uid) {
                part.__uid = utils.generateGuid();
            }
            partHelper = new PartHelper(part, {
                traceSource: that.traceSource,
                effects: that.effects,
                overrides: options.overrides,
                isNested: options.isNested,
                keepAlive: options.keepAlive,
                freezeUrl: options.freezeUrl,
                hiddenInitially: that.options.hiddenInitially
            });
            partHelper.region = that;
            partHelper.activity = options.activity;
            if (!partHelper.part.navigationService && partHelper.part.setNavigationService) {
                partHelper.part.setNavigationService(that.navigationService);
            }
            that._parts.push(partHelper);
            that._onPartAdded(partHelper);
            return partHelper;
        };
        /**
         * Try ti unload part with a reason ("unload" by default). Calls part's 'queryUnload' then ''unload
         * @param {PartHelper} partHelper
         * @param {string} [reason]  A reason for unload: "unload", "suspend", "close", "leave".
         * @return {Promise}
         * @private
         */
        Region.prototype._tryToUnloadPart = function (partHelper, reason) {
            var that = this, options = { reason: reason || "unload", activityContext: {} };
            return lang.when(partHelper.canUnload(options)).then(function (result) {
                if (result.canUnload) {
                    return that._unloadPart(partHelper, options);
                }
                return result;
            });
        };
        /**
         * Unload specified part and optionally remove and dispose it.
         * @param {PartHelper} partHelper
         * @param {object} options
         * @param {string} [options.reason]  A reason for unload: "unload", "suspend", "close", "leave".
         * @param {boolean} [options.keepAlive=false]  Only unload part and do not remove and dispose it
         * @param {boolean} [options.keepStandalone] Only unload part and remove it, but do not dispose (deferred dispose)
         * @returns {Promise}
         * @private
         */
        Region.prototype._unloadPart = function (partHelper, options) {
            var that = this, task, reason = options ? options.reason : undefined;
            options = options || {};
            if (that.traceSource.enabled("debug")) {
                that.traceSource.debug(function () { return "unloading part '" + partHelper.part.name + "'. options: " + JSON.stringify(options); });
            }
            task = lang.when(partHelper.unload(options));
            task = task.then(function () {
                that.onPartUnloaded(partHelper);
            });
            //console.log("[Region] unloaded '" + partHelper + ", _activePartHelper=" + that._activePartHelper);
            if (that._activePartHelper === partHelper) {
                that._activePartHelper = null;
            }
            // if the part is part of activity (sequence of transitions), then we should unload all parts in this activity
            if (partHelper.activity && reason !== "suspend" && reason !== "close" && reason !== "leave") {
                that._disposeActivity(partHelper, options);
            }
            if (partHelper.keepAlive && options.keepAlive !== false || options.keepAlive) {
                // nothing to do
            }
            else if (partHelper.keepStandalone || options.keepStandalone) {
                task = task.then(function () {
                    that._removePart(partHelper);
                });
            }
            else {
                task = task.then(function () {
                    that._removePart(partHelper);
                    that.traceSource.debug("disposing part '" + partHelper.part.name + "'");
                    partHelper.dispose(options);
                });
            }
            return task;
        };
        Region.prototype._disposeActivity = function (partHelper, disposeOptions) {
            var that = this, i, length = that._parts.length, item;
            that.traceSource.debug("disposing activity");
            for (i = 0; i < length; ++i) {
                item = that._parts[i];
                if (item && item !== partHelper && item.activity === partHelper.activity) {
                    if (item.keepAlive) {
                        item.activity = undefined;
                    }
                    else {
                        item.dispose(disposeOptions);
                        that._removePart(item);
                        i -= 1;
                        length = that._parts.length;
                    }
                }
            }
            partHelper.activity.dispose();
            partHelper.activity = undefined;
        };
        Region.prototype._removePart = function (partHelper) {
            lang.arrayRemove(this._parts, partHelper);
            if (partHelper.activity) {
                partHelper.activity.onPartRemoved(partHelper.part);
            }
            this._onPartRemoved(partHelper);
        };
        /**
         * Part's 'statechange' event handler. Also called directly on a part rendering completion.
         * @param {PartHelper} partHelper
         * @param {object} partState Part's state - an arbitrary object
         * @param {object} options
         * @param {boolean} [options.replaceState] replace current AppState with the new one
         * @param {boolean} [options.freezeUrl] do not change URL while pushing the new AppState
         * @private
         */
        Region.prototype._onPartStateChanged = function (partHelper, partState, options) {
            var that = this, part = partHelper.part, state = {
                part: part.name,
                _partUid: part.__uid,
                partOptions: undefined,
                title: undefined
            };
            options = options || {};
            if (partState && !lang.isEmptyObject(partState)) {
                state.partOptions = partState;
            }
            if (part.title) {
                state.title = lang.get(part, "title");
            }
            if (partHelper.freezeUrl) {
                options.freezeUrl = true;
            }
            if (that.traceSource.enabled("debug")) {
                that.traceSource.debug(function () { return "onPartStateChanged: raising 'statechange'. partState=" + JSON.stringify(state) + ",options=" + JSON.stringify(options); });
            }
            /**
             * @event Region#statechange
             * @property {Region} sender
             * @property {object} args
             * @property {object} args.regionState
             * @property {Part} args.regionState.part
             * @property {string} args.regionState._partUid part's id
             * @property {object} [args.regionState.partOptions] part's state
             * @property {string} [args.regionState.title] part's title
             * @property {object} args.options
             * @property {boolean} [args.options.replaceState]
             */
            that.trigger("statechange", that, { regionState: state, options: options });
        };
        /**
         * Handler to be called when part's userSettings changed.
         * @param {string} part part
         * @param {Object} bundle settings' values
         * @private
         */
        Region.prototype._onPartUserSettingsChanged = function (part, bundle) {
            var that = this;
            var name = part.userSettings.name || part.name;
            var args = { part: name, bundle: bundle, scope: part.userSettings.scope };
            that.trigger("usersettings.change", that, args);
        };
        Region.prototype._onPartAdded = function (partHelper) {
            var that = this;
            if (that.navigable) {
                partHelper.subscribeOnStateChange(that._onPartStateChanged.bind(that));
            }
            var name = partHelper.subscribeOnUserSettingsChange(that._onPartUserSettingsChanged, that);
            if (name) {
                // the part has named userSettings, let's initialize them
                var args = { part: name, scope: partHelper.part.userSettings.scope };
                that.trigger("usersettings.request", that, args);
                partHelper.part.userSettings.initialize(args.bundle);
            }
            that.onPartAdded(partHelper);
        };
        Region.prototype._onPartRemoved = function (partHelper) {
            partHelper.unsubscribeOnStateChange();
            partHelper.unsubscribeOnUserSettingsChange();
            this.onPartRemoved(partHelper);
        };
        Region.prototype.onPartAdded = function (partHelper) {
            this._triggerPartEvent("partAdded", partHelper);
        };
        Region.prototype.onPartRemoved = function (partHelper) {
            this._triggerPartEvent("partRemoved", partHelper);
        };
        Region.prototype.onPartRendered = function (partHelper) {
            this._triggerPartEvent("partRendered", partHelper);
        };
        Region.prototype.onPartUnloaded = function (partHelper) {
            this._triggerPartEvent("partUnloaded", partHelper);
        };
        Region.prototype._triggerPartEvent = function (eventName, partHelper) {
            this.trigger(eventName, this, {
                part: partHelper.part,
                $element: partHelper.partDomSelector
            });
        };
        /**
         * Activate part which was suspended earlier.
         * @param {Part} part Part to activate
         * @param {AppState} appState restored AppState on the moment when the part was suspended
         * @returns {Promise}
         */
        Region.prototype.resumePreviousPart = function (part, appState) {
            var that = this;
            if (!part) {
                throw new Error("Region.resumePreviousPart: part should be specified");
            }
            if (that._activePartHelper) {
                throw new Error("Region.resumePreviousPart: can't activate a part as there's an active part in the region (you should unload it first)");
            }
            that.traceSource.debug("[Region] resuming previous part '" + part.name + "'");
            return that.activatePart(part, { replaceState: true, doNotTouchAppState: true })
                .then(function () {
                var args = { appState: appState, options: { replaceState: true, removePrevious: true } };
                that.trigger("statechange", that, args);
            });
        };
        Region.prototype.suspendActivePart = function (activity) {
            var that = this;
            that.traceSource.debug("suspending active part");
            if (that._activePartHelper) {
                if (!that._activePartHelper.activity) {
                    that._activePartHelper.activity = activity;
                }
                return that._unloadPart(that._activePartHelper, { keepAlive: true, reason: "suspend" });
            }
            return lang.resolved();
        };
        /**
         * Unload and destroy (optionally) currently active part.
         * @param {object} [options]
         * @param {boolean} options.keepAlive Do not destroy active part (only unload)
         * @returns {Promise}
         */
        Region.prototype.closeActivePart = function (options) {
            var that = this, keepAlive;
            if (that._activePartHelper) {
                if (options && options.keepAlive) {
                    return that._unloadPart(that._activePartHelper, { keepStandalone: true, reason: "leave" });
                }
                else {
                    if (options) {
                        keepAlive = options.keepAlive;
                    }
                    // NOTE: it's important to distinguish keepAlive=undefined and keepAlive=false
                    return that._unloadPart(that._activePartHelper, { keepAlive: keepAlive, reason: "close" });
                }
            }
            return lang.resolved();
        };
        Region.prototype.queryUnloadActivePart = function (options) {
            var that = this, activePartHelper = that._activePartHelper;
            if (!activePartHelper) {
                return;
            }
            lang.append(options, { reason: "unload", activityContext: {} });
            return lang.when(activePartHelper.canUnload(options)).then(function (result) {
                if (result && result.reasonToStay) {
                    return lang.rejected(result.reasonToStay);
                }
                return lang.resolved();
            });
        };
        Region.prototype.unloadActivePart = function (options) {
            var that = this, activePartHelper = that._activePartHelper;
            lang.append(options, { reason: "unload", activityContext: {} });
            return that._unloadPart(activePartHelper, options);
        };
        Region.prototype._throwIfWasNotRendered = function () {
            if (!this.domElement) {
                throw new Error("Region: region '" + this.name + "' wasn't rendered");
            }
        };
        Region.prototype._tearDownActivation = function () {
            var t = this._activeActivation;
            if (t) {
                this._activeActivation = undefined;
                t.resolve();
            }
        };
        /**
         * Accept part and make it active in the region.
         * Currently active part will be unloaded, if it allows that.
         * A part can reject unloading by returning a message (string) or rejected promise of message from its 'unload' method.
         * In this case the method returns that message and doesn't change the active part.
         *
         * @param {Part} part Part instance to activate (the part can either exist or not exist in the region)
         * @param {object} [options] Options for the part being activated
         * @param {object} [options.overrides] Json-object with methods: queryUnload, unload (Part API). They will be used instead of part's ones
         * @param {boolean} [options.keepAlive] Keep part's instance alive after it's unloaded
         * @param {AppState} [options.state] AppState state object to pass into Part.changeState if the part is activated already
         * @param {boolean} [options.disablePushState]
         * @param {boolean} [options.freezeUrl=false] do not change URL while pushing the new AppState
         * @param {boolean} [options.doNotTouchAppState=false] do not touch (push or change) AppState
         * @param {Activity} [options.activity]
         * @param {boolean} [options.isNested]
         */
        Region.prototype.activatePart = function (part, options) {
            var that = this, activePartHelper = that._activePartHelper, partHelper;
            that.traceSource.debug("[Region] activatePart: activating part '" + part.name + "'");
            that._throwIfWasNotRendered();
            if (that._activeActivation) {
                // previous activation hasn't completed (it's kind a queue), put this call into the queue.
                return that._activeActivation.then(function () {
                    return that.activatePart(part, options);
                });
            }
            that._activeActivation = lang.Deferred();
            //options = options || {};
            if (activePartHelper) {
                if (activePartHelper.part === part) {
                    // required part is already active. But its state can be changed
                    /*
                                    that.traceSource.debug("[Region] activatePart: exiting as part is already active");
                                    if (lang.isFunction(part.changeState)) {
                                        that.traceSource.debug("[Region] activatePart '" + part.name + "': changing state via Part.changeState");
                                        // NOTE: кажется disablePushState=true тут не может быть
                                        var partState = options.state && options.state.regionState ? options.state.regionState.partOptions : {};
                                        part.changeState(partState, {disablePushState: options.disablePushState});
                                    }
                    */
                    that._tearDownActivation();
                    return lang.resolved();
                }
                // there's an active part - we have to unload it first
                partHelper = that._lookupHelper(part);
                if (partHelper) {
                    // the passed-in part is alive (we have its instance in this._parts)
                    var partsToUnload_1 = that._parts.slice(that._parts.indexOf(partHelper) + 1).reverse(), deferredUnload = void 0, unloadOptions_1 = { reason: "close", activityContext: {} };
                    if (partsToUnload_1.length === 1 && that.navigationService && partsToUnload_1[0].activity) {
                        // we're activating a previous part and the current part was activated in an Activity,
                        // so in fact it's just closing the current one via NavigationService
                        return lang.when(partsToUnload_1[0].canUnload(unloadOptions_1)).then(function (result) {
                            if (result.canUnload) {
                                that._tearDownActivation();
                                return that.navigationService.close();
                            }
                            else {
                                that._tearDownActivation();
                                return lang.rejected(result.reasonToStay);
                            }
                        }, function () {
                            that._tearDownActivation();
                            return lang.rejected();
                        });
                    }
                    else {
                        // TODO: тут есть проблема - после выгрузки цепочки партов они остаются в истории переходов браузера
                        // unloading more than 1 parts - use "two-phase commit":
                        // - first step: ask the current part to unload (call its queryUnload)
                        deferredUnload = lang.when(partsToUnload_1[0].canUnload(unloadOptions_1)).then(function (result) {
                            if (!result.canUnload) {
                                that._tearDownActivation();
                                return lang.rejected(result.reasonToStay);
                            }
                        }).then(function () {
                            // - second step: if current part agreed to unload then unload all suspended parts
                            return lang.async.forEach(partsToUnload_1, function (partToUnload) {
                                return that._unloadPart(partToUnload, unloadOptions_1);
                            });
                        });
                        return deferredUnload.then(function () {
                            return that._activatePart2(part, options);
                        }, function (reasonToStay) {
                            that._tearDownActivation();
                            return reasonToStay;
                        });
                    }
                }
                else {
                    return lang.when(that._tryToUnloadPart(activePartHelper)).then(function (unloadResult) {
                        if (unloadResult && unloadResult.reasonToStay) {
                            that._tearDownActivation();
                            return lang.rejected(unloadResult.reasonToStay);
                        }
                        return that._activatePart2(part, options);
                    }, function (reasonToStay) {
                        // unload rejected by part.queryUnload
                        that._tearDownActivation();
                        return reasonToStay;
                    });
                }
            }
            return that._activatePart2(part, options);
        };
        Region.prototype._activatePart2 = function (part, options) {
            var that = this, partHelper;
            // TODO: check if part is string, then try to find existing part and if no one exists then create a new one
            partHelper = that._arrangeHelper(part, options);
            that._activePartHelper = partHelper;
            return that._activatePart3(partHelper, options);
        };
        Region.prototype._activatePart3 = function (partHelper, options) {
            var that = this;
            if (that.isInBackground) {
                // NOTE: added in WC-1266: we should report to area about new state even in background, it allows area to save AppState and restore it when it becomes active
                that._reportInitialPartState(partHelper, options);
                that._tearDownActivation();
                return lang.resolved();
            }
            // NOTE: report to AppStateManager about new state with the part before rendering
            // as inside part.render it can see the correct app state
            that._reportInitialPartState(partHelper, options);
            var task;
            try {
                task = partHelper.render(that.domElement);
            }
            catch (ex) {
                // TODO: может that._activePartHelper очистить?
                that._tearDownActivation();
                that.traceSource.error("[Region] activatePart: part failed during render: " + ex.message);
                that.traceSource.error(ex);
                return lang.rejected();
            }
            return lang.async.then(task, function () {
                that.onPartRendered(partHelper);
                that._tearDownActivation();
                that.traceSource.debug("[Region] activatePart: part activated");
                return lang.resolved();
            }, function (error) {
                // TODO: может that._activePartHelper очистить?
                that._tearDownActivation();
                that.traceSource.error("[Region] activatePart: part failed during render (see next error): " + error.message);
                that.traceSource.error(error);
                return lang.rejected();
            });
        };
        Region.prototype._reportInitialPartState = function (partHelper, options) {
            var that = this, state, part = partHelper.part;
            if (that.navigable) {
                options = options || {};
                if (part.getState) {
                    state = part.getState();
                }
                // WAS: options.state && options.state.regionState ? options.state.regionState.partOptions : {};
                if (!options.doNotTouchAppState) {
                    var statechangeOpt = {
                        replaceState: false,
                        freezeUrl: false
                    };
                    if (options.disablePushState || options.replaceState) {
                        statechangeOpt.replaceState = true;
                    }
                    if (options.freezeUrl) {
                        statechangeOpt.freezeUrl = true;
                    }
                    that._onPartStateChanged(partHelper, state, statechangeOpt);
                }
            }
        };
        /**
         * Return existing (but not always active) part by its name.
         * @param {string} partName
         * @returns {object}
         */
        Region.prototype.getPart = function (partName) {
            var that = this, i, item;
            for (i = 0; i < that._parts.length; i += 1) {
                item = that._parts[i];
                if (item.part.name === partName) {
                    return item.part;
                }
            }
            return null;
        };
        /**
         * Return existing (but not always active) part by its id.
         * @param {string} partUid Part's unique identifier.
         * @returns {*}
         */
        Region.prototype.getPartByUid = function (partUid) {
            var that = this, i, len, item;
            if (!partUid) {
                return null;
            }
            for (i = 0, len = that._parts.length; i < len; i += 1) {
                item = that._parts[i];
                if (item && item.part.__uid === partUid) {
                    return item.part;
                }
            }
            return null;
        };
        /**
         * Returns currently active part in the region.
         * @returns {Part}
         */
        Region.prototype.getActivePart = function () {
            return this._activePartHelper ? this._activePartHelper.part : null;
        };
        /**
         * Check if part exists inside the region.
         * @param {string|object} part Part instance or part name to check
         * @return {boolean}
         */
        Region.prototype.isPartActive = function (part) {
            if (!this._activePartHelper) {
                return false;
            }
            if (typeof part === "string") {
                // TODO: для идентификации экземпляра парта наименования может быть недостаточно..
                return this._activePartHelper.part.name === part;
            }
            return this._activePartHelper.part === part;
        };
        Region.prototype.resetState = function () {
            this.traceSource.debug("resetting state");
            this.trigger("resetstate", this);
        };
        /**
         * Attach a behavior to current Region.
         * Behavior can be an object with `attach` method or
         * a string with name of global behavior from `"module:core.composition".regionBehaviors` map.
         * @param {string|RegionBehavior} behavior
         * @param {*} options Any options to behavior
         */
        Region.prototype.addBehavior = function (behavior, options) {
            var that = this, behavior2;
            if (behavior) {
                if (typeof behavior === "string") {
                    behavior2 = exports.regionBehaviors[behavior];
                }
                else {
                    behavior2 = behavior;
                }
                if (behavior2 && behavior2.attach) {
                    behavior2.attach(that, that.domElement, options);
                }
            }
        };
        Region.prototype.getPartsHistory = function (includeSource) {
            var that = this, trans, i, result = [];
            if (!that.navigationService || !that.navigationService._currentActivity) {
                return;
            }
            trans = that.navigationService._currentActivity._transitions;
            for (i = 0; i < trans.length; i++) {
                var tran = trans[i];
                if (includeSource && result.length === 0 && tran.sourcePart) {
                    result.push(tran.sourcePart);
                }
                result.push(tran.target);
            }
            return result;
        };
        Region.prototype.getDebugInfo = function () {
            var that = this, result = {
                regionName: that.name,
                navigable: that.navigable,
                totalParts: that._parts.length,
                activePart: undefined
            }, partHelper = that._activePartHelper;
            if (partHelper) {
                result.activePart = {
                    name: partHelper.part.name,
                    uid: partHelper.part.__uid,
                    activateOptions: {
                        keepAlive: partHelper.keepAlive,
                        keepStandalone: partHelper.keepStandalone
                    },
                    part: partHelper.part
                };
            }
            return result;
        };
        Region.defaultOptions = {
            hiddenInitially: false,
            traceSourceName: "core.composition"
        };
        return Region;
    }(Part));
    exports.Region = Region;
    Region.mixin({
        defaultOptions: Region.defaultOptions
    });
});
/**
 * @typedef {object} RegionOptions
 * @property {boolean} navigable
 * @property {boolean} hiddenInitially
 * @property {string} traceSourceName
 */
//# sourceMappingURL=core.composition.js.map