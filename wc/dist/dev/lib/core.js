/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "lib/core.lang", "lib/binding", "lib/core.events", "lib/core.composition", "lib/core.diagnostics", "lib/core.commands", "lib/core.html", "lib/core.eth", "lib/utils", "lib/ui/Part", "lib/ui/StatefulPart", "lib/ui/Component", "lib/ui/handlebars/View", "vendor/cookies", "i18n!lib/nls/resources", "moment", "lib/formatters", "vendor/modernizr", "vendor/history", "vendor/moment/locale/ru"], function (require, exports, $, lang, binding, events, composition, diagnostics, commands, html, eth, utils, Part, StatefulPart, Component, View, Cookies, resources, moment, formatters_1) {
    "use strict";
    exports.__esModule = true;
    exports.lang = lang;
    exports.binding = binding;
    exports.events = events;
    exports.composition = composition;
    exports.diagnostics = diagnostics;
    exports.commands = commands;
    exports.html = html;
    exports.eth = eth;
    var Historyjs = History;
    /**
     * Global cached JQuery object for `document`.
     * @type {JQuery}
     */
    exports.$document = html.$document;
    /**
     * Global cached JQuery object for `window`.
     * @type {JQuery}
     */
    exports.$window = html.$window;
    exports.nls = {
        resources: resources,
        merge: function (resourcesModule, prefix) {
            lang.forEach(resourcesModule, function (value, key) {
                if (prefix) {
                    key = prefix + key;
                }
                resources[key] = value;
            });
            return resources;
        }
    };
    // init namespace `ui`
    /**
     * Virtual `ui` namespace where all ui components add themselves to.
     * @type {any}
     */
    exports.ui = {
        Part: Part,
        StatefulPart: StatefulPart,
        Component: Component,
        View: View
    };
    //var core = this;
    lang.Class.rootNamespace = this; // core
    exports.createCommand = commands.createCommand;
    exports.isHtml = formatters_1.isHtml;
    exports.safeHtml = formatters_1.safeHtml;
    var traceSource = new diagnostics.TraceSource("core");
    /*
    (function (namespace, nsName) {
        var typeName,
            type,
            firstLetter;
        for (typeName in namespace) {
            firstLetter = typeName.charAt(0);
            if (firstLetter.toUpperCase() === firstLetter) {
                type = core.composition[typeName];
                type.prototype.traceSource = new core.diagnostics.TraceSource(nsName + "." + typeName);
            }
        }
    }) (core.composition, "core.composition");
    */
    /**
     * @typedef {object} XConfig
     * @global
     * @property {string} apiroot Api root path ("/" or "/myapp/")
     * @property {string} root Presentation root path ("/" or "/myapp/")
     * @property {string} appName name of the application
     * @property {string} clientBase path from `root` to
     * @property {boolean} isDebug debug mode
     * @property {String} defaultLanguage name of default language
     * @property {object} supportedLanguages An object which fields as language names and values are language description - an object with fields `title`, `short`
     * @property {object} modules An object with modules configurations - every field corresponds to a module and its value is a config object of the module
     * @property {object} software An object with software description
     * @property {string} software.clientLibVersion client lib (WebClient) version
     * @property {string} software.serverLibVersion server lib (WebClient) version
     * @property {string} software.appVersion application version
     * @property {object} security An object with security configuration
     * @property {string} security.logoutUrl An url relative to `apiroot` to log out
     */
    var SystemEvent = /** @class */ (function (_super) {
        __extends(SystemEvent, _super);
        /**
         * System event. An object to represent an application-wide event. Usually it's published via `EventPublisher`.
         * @constructs SystemEvent
         * @memberOf module:core
         * @extends Observable
         * @param {Object} data
         * @param {String} data.type
         * @param {SystemEvent#kinds} data.kind A kind of notification: notification, process, actionRequest
         * @param {"high"|"normal"|"low"} data.priority A priority: high, normal, low
         * @param {String} data.message Title of notification
         * @param {String} [data.html] Html code to use instead of plain text in message
         * @param {"error"|"warning"|"success"|"info"} [data.severity] A severity of the notification: 'error', 'warning', 'success', 'info'
         * @param {Promise} [data.promise] A process' promise which will resolved when the process finishes
         * @param {Object} [data.error] Event is being created for an interop error
         * @param {*} [data.data] Any event specific data
         * @param {Function} [data.defaultAction]
         * @param {Object} [data.menu]
         */
        function SystemEvent(data) {
            var _this = _super.call(this) || this;
            data = data || {};
            _this.type = data.type;
            _this.kind = data.kind;
            _this.uid = data.uid;
            _this.priority = data.priority;
            if (formatters_1.isHtml(data.message)) {
                _this.html = data.message.toHTML();
                _this.message = data.message.toString();
            }
            else {
                _this.message = data.message;
                _this.html = data.html;
            }
            _this.severity = data.severity;
            _this.promise = data.promise;
            _this.error = data.error;
            _this.data = data.data;
            _this.timestamp = new Date();
            _this.state(SystemEvent.State.pending);
            // specifics for Notification:
            if (_this.priority === undefined && (_this.severity === "warning" || _this.severity === "error")) {
                _this.priority = "high";
            }
            // Subject to kill:
            _this.defaultAction = data.defaultAction;
            /**
             * Event menu
             * @type {Menu}
             */
            _this.menu = null;
            if (data.menu) {
                _this.menu = exports.ui.Menu.create(data.menu);
            }
            else {
                _this.menu = new exports.ui.Menu();
            }
            return _this;
        }
        SystemEvent.prototype.initialize = function () { };
        /**
         * Return formatted timestamp of the event.
         * @return {String}
         */
        SystemEvent.prototype.createdFormatted = function () {
            return utils.formatDatetimeAgo(this.timestamp);
        };
        /**
         * Return flag whether the event has a menu.
         * @return {Boolean}
         */
        SystemEvent.prototype.hasMenu = function () {
            return this.menu && !this.menu.hidden && this.menu.items.length > 0;
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], SystemEvent.prototype, "state");
        __decorate([
            lang.decorators.constant(true)
        ], SystemEvent.prototype, "isSystemEvent");
        return SystemEvent;
    }(lang.Observable));
    exports.SystemEvent = SystemEvent;
    (function (SystemEvent) {
        SystemEvent.State = {
            /**
             * Event was created.
             */
            pending: "pending",
            /**
             * Event was shown to the user.
             */
            active: "active",
            /**
             * Event was archived.
             */
            archived: "archived"
        };
        SystemEvent.Kind = {
            notification: "notification",
            process: "process",
            actionRequest: "actionRequest"
        };
        SystemEvent.Priority = {
            high: "high",
            normal: "normal",
            low: "low"
        };
        SystemEvent.Severity = {
            error: "error",
            warning: "warning",
            success: "success",
            info: "info"
        };
    })(SystemEvent = exports.SystemEvent || (exports.SystemEvent = {}));
    exports.SystemEvent = SystemEvent;
    SystemEvent.mixin({
        states: SystemEvent.State,
        kinds: SystemEvent.Kind
    });
    SystemEvent.States = SystemEvent.State;
    SystemEvent.Kinds = SystemEvent.Kind;
    var Platform = /** @class */ (function (_super) {
        __extends(Platform, _super);
        /**
         * @constructs Platform
         * @extends Observable
         * @memberOf! module:core
         * @param {XConfig} config
         */
        function Platform(config) {
            var _this = _super.call(this) || this;
            var that = _this;
            Cookies.defaults.path = config.root;
            that.modernizr = Modernizr;
            // Установим текущий язык
            var language = Cookies.get("X-Lang") || (config.require && config.require.locale);
            // NOTE: navigator.language - это язык интерфейса браузера, использовать его неочень правильно
            // navigator.userLanguage есть только в IE, зависит от текущих региональных настроек ("en-us", "ru")
            that.defaultLanguage = navigator ? (navigator["userLanguage"] || navigator.language) : "en";
            // для "en-us" оставим только "en":
            var re = /(\w+)-\w+/i;
            if (re.test(that.defaultLanguage)) {
                that.defaultLanguage = re.exec(that.defaultLanguage)[1];
            }
            if (!language) {
                language = that.defaultLanguage || "en";
            }
            that.language(language);
            traceSource.info("current language: " + language);
            moment.locale(language);
            window["_i18n"] = window["_i18n"] || {};
            window["_i18n"].locale = language;
            that.bind("change:language", function (sender, value) {
                Cookies.set("X-Lang", value, { path: config.root });
                window.location.reload();
            });
            that.animation(true);
            that.bind("change:animation", function (sender, value) {
                $.fx.off = !value;
            });
            // TODO: Нам надо знать не просто мобильное ли устройство, а:
            // 		основной метод ввода: физическая клава или тач (чтобы выбирать контролы соответствующие)
            //		(NOTE: в Win8 может быть и тач и мышь одновременно!)
            //		быстродействие: тормозное или нормальное (чтобы отключать что-нибудь лишнее)
            //		скорость сети: нормальная или GPRS-like (чтобы оптимизировать что-нибудь)
            that.supportTouch = that.isTouchDevice();
            that.isMobileDevice = screen.width <= 480;
            if (navigator && !that.isMobileDevice) {
                that.isMobileDevice = navigator.userAgent.match(/Android|iPad|iPhone|iPod|Mobile|iemobile|windows (ce|phone)|blackberry|BB10|kindle|bada|psp|palm|phone|opera m(ob|in)i|maemo|meego.+mobile|symbian|xda/i) != null;
                if (!that.isMobileDevice)
                    // that's bad idea: MS Surface is ARMS-based but it's mostly 'desktop' than 'mobile'
                    that.isMobileDevice = navigator.platform.match(/armv\d*/i) != null;
            }
            traceSource.debug("isMobileDevice: " + that.isMobileDevice);
            // if mobile device doesn't support CSS3 Transitions then disable all jQ-animations
            // NOTE: we're using jQuery.animate-enhanced which extends jQuery.animate() to automatically use CSS3 transformations
            if (that.isMobileDevice && !that.modernizr.csstransitions) {
                traceSource.warn("csstransitions isn't supported, disabling jQ-animations");
                that.animation(false);
            }
            that.limits = {
                queryStringMaxLen: 2048 // default limit of IIS
            };
            that.browser = {};
            that.os = {};
            if (navigator) {
                // detect browser
                var uaMatch = void 0;
                var userAgent = navigator.userAgent;
                if (userAgent.indexOf("MSIE") > -1) {
                    if (uaMatch = /IEMobile\/([\d.]+)/.exec(userAgent)) {
                        // "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)"
                        // "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; SAMSUNG; SGH-i917)"
                        // "Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; LG; GW910)"
                        that.browser.iemobile = { version: parseFloat(uaMatch[1]) };
                    }
                    else if (uaMatch = /MSIE ([0-9]+[.0-9]*)/.exec(userAgent)) {
                        // NOTE: признак MSIE присуствует во всех версиях userAgent для IE вплоть до версии 10 включительно.
                        that.browser.ie = { version: parseFloat(uaMatch[1]) };
                    }
                }
                else if (uaMatch = /AppleWebKit\/([\d.]+)/.exec(userAgent)) {
                    // Chrome: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.72 Safari/537.36"
                    // Edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586"
                    that.browser.webkit = {
                        version: parseFloat(uaMatch[1])
                    };
                }
                else if (uaMatch = /Firefox\/([\d.]+)/.exec(userAgent)) {
                    // "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0"
                    that.browser.firefox = {
                        version: parseFloat(uaMatch[1])
                    };
                }
                // detect os/platform/device
                if (userAgent.indexOf("Android") > -1) {
                    uaMatch = /Android\s([\d.]{3})/i.exec(userAgent);
                    that.os.android = {};
                    // NOTE: Firefox for Android doesn't report Android version
                    if (uaMatch) {
                        that.os.android.version = parseFloat(uaMatch[1]);
                    }
                }
                else if (userAgent.indexOf("Mac OS") > -1) {
                    that.os.mac = {};
                }
            }
            // print events handlers
            var beforePrint = function () {
                that.printing(true);
            };
            var afterPrint = function () {
                // ugly hack: In Chrome there will be no beforePrint ever,
                // so we're simulating changing property for 'change' event to fire
                that._printing = true;
                that.printing(false);
            };
            // detect printing
            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia("print");
                mediaQueryList.addListener(function (mql) {
                    if (mql.matches) {
                        beforePrint();
                    }
                    else {
                        afterPrint();
                    }
                });
            }
            else {
                // TODO: падает в 2.8, должен быть исправлено в 2.8.2
                window.onbeforeprint = beforePrint;
                window.onafterprint = afterPrint;
            }
            that.$metaViewport = $("meta[name=viewport]");
            that._userscalableRegex = /user-scalable\s*=\s*[0,no]/i;
            that._maxscaleRegex = /maximum-scale=1.0/i;
            that._initFeatures();
            return _this;
        }
        Platform.prototype._initFeatures = function () {
            var that = this, resizeOnZoom;
            if (that.isMobileDevice) {
                if (that.browser.webkit) {
                    // 537 - webkit version with guaranteed working 'resize on zoom' feature
                    resizeOnZoom = that.browser.webkit.version >= 537;
                }
                else if (that.browser.iemobile) {
                    resizeOnZoom = that.browser.iemobile.version >= 10;
                }
                else {
                    resizeOnZoom = false;
                }
            }
            else {
                resizeOnZoom = true;
            }
            that.features = { resizeOnZoom: resizeOnZoom };
        };
        Platform.prototype.isTouchDevice = function () {
            return !!("ontouchstart" in window) // works on most browsers
                || (window["navigator"] && window["navigator"].msMaxTouchPoints > 0); // IE10
            // NOTE: `window["navigator"]` is because of TS2339 error for `window.navigator` (see https://github.com/Microsoft/TypeScript/issues/21517)
        };
        Platform.prototype.getUserScalable = function () {
            var that = this;
            if (!that.isMobileDevice) {
                return true;
            }
            if (that.os.android && that.os.android.version) {
                // Android 2.2: viewport meta tag does not seem to be supported at all.
                // http://stackoverflow.com/questions/11345896/full-webpage-and-disabled-zoom-viewport-meta-tag-for-all-mobile-browsers/12270403#12270403
                if (that.os.android.version <= 2.2) {
                    return true;
                }
            }
            var viewportContent = that.$metaViewport.attr("content");
            if (viewportContent.indexOf("user-scalable") > -1) {
                return !that._userscalableRegex.test(viewportContent);
            }
            return !(that._maxscaleRegex.test(viewportContent));
        };
        /**
         * Set meta tag 'viewport' values minimum-scale/maximum-scale. Setting them to "1.0" disables user zooming in mobile browsers.
         * @param {String} [minScale="1.0"]
         * @param {String} [maxScale="1.0"]
         */
        Platform.prototype.setUserScalable = function (minScale, maxScale) {
            if (!minScale || !maxScale) {
                minScale = "1.0";
                maxScale = "1.0";
            }
            var content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
            if (minScale === maxScale) {
                content = content + ", user-scalable=0";
            }
            this.$metaViewport.attr("content", content);
        };
        Platform.prototype.localize = function (resource) {
            if (!resource) {
                return resource;
            }
            if (lang.isString(resource)) {
                return resource;
            }
            if (lang.isObject(resource)) {
                var language = this.language();
                if (resource.hasOwnProperty(language)) {
                    return resource[language];
                }
                return resource[this.defaultLanguage];
            }
            return resource;
        };
        Platform.prototype.measureScrollbar = function () {
            if (this.scrollbarWidth == null) {
                var scrollDiv = document.createElement("div");
                scrollDiv.className = "modal-scrollbar-measure";
                html.$body.append(scrollDiv);
                this.scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                html.$body[0].removeChild(scrollDiv);
            }
            return this.scrollbarWidth;
        };
        return Platform;
    }(lang.Observable));
    exports.Platform = Platform;
    Platform.mixin({
        /**
         * @observable-property {Boolean}
         */
        printing: lang.Observable.accessor("printing"),
        /**
         * @observable-property {String}
         */
        language: lang.Observable.accessor("language"),
        /**
         * @observable-property {Boolean}
         */
        animation: lang.Observable.accessor("animation")
    });
    /**
     * Global instance of {Platform}. Available as `core.platform`.
     * @type {Platform}
     */
    exports.platform = new Platform(xconfig);
    // NOTE: functions inside core.html need to know isMobileDevice value
    html.platform.isMobileDevice = exports.platform.isMobileDevice;
    /**
     * Global wrapper for `window.localStorage` available as `core.localStorage`.
     * @type {Object}
     */
    exports.localStorage = {
        prefix: "",
        impl: window.localStorage,
        setItem: function (key, value) {
            this.impl.setItem(this.prefix + key, value);
        },
        getItem: function (key) {
            return this.impl.getItem(this.prefix + key);
        },
        removeItem: function (key) {
            this.impl.removeItem(this.prefix + key);
        },
        // TODO: clear, length, key (with prefix)
        setObject: function (key, value) {
            this.impl.setItem(this.prefix + key, JSON.stringify(value));
        },
        getObject: function (key) {
            var value = this.impl.getItem(this.prefix + key);
            if (value) {
                try {
                    value = JSON.parse(value);
                }
                catch (e) { }
                return value;
            }
            return null;
        },
        // NOTE: iterator should not add or remove keys in storage
        forEach: function (iterator, thisArg) {
            var that = this, func = function () {
                iterator.apply(this, arguments);
                return false;
            };
            return that.some(func, thisArg);
        },
        some: function (iterator, thisArg) {
            var that = this, l = this.impl.length, i, key, value;
            for (i = 0; i < l; i++) {
                key = this.impl.key(i);
                if (key && (!that.prefix || lang.stringStartsWith(key, that.prefix))) {
                    value = this.impl.getItem(key);
                    if (value) {
                        try {
                            value = JSON.parse(value);
                        }
                        catch (e) { }
                    }
                    if (that.prefix) {
                        key = key.slice(that.prefix.length);
                    } // remove key prefix
                    if (iterator.call(thisArg, value, key, that)) {
                        return true;
                    }
                }
            }
            return false;
        },
        setupPrefix: function (prefix) {
            if (prefix && prefix.charAt(prefix.length - 1) !== "/") {
                prefix += "/";
            }
            this.prefix = prefix;
        }
    };
    /**
     * Global wrapper for `core.localStorage` for working with application settings. It implements hierarchy of settings (bundle -> value).
     * @type {Object}
     */
    exports.settings = {
        store: exports.localStorage,
        prefix: "settings",
        _getStoreKey: function (key) {
            return this.prefix + "." + key;
        },
        getItem: function (fqname) {
            var that = this, idx = fqname.indexOf("."), bundleName, bundle;
            if (idx > 0) {
                bundleName = fqname.slice(0, idx);
                bundle = that.getBundle(bundleName);
                if (bundle) {
                    fqname = fqname.slice(idx + 1);
                    return lang.nested(bundle, fqname);
                }
                return undefined;
            }
            return that.store.getItem(that._getStoreKey(fqname));
        },
        setItem: function (fqname, value) {
            var that = this, idx = fqname.indexOf("."), bundleName, bundle, lastIdx, propName;
            if (idx > 0) {
                bundleName = fqname.slice(0, idx);
                bundle = that.getBundle(bundleName);
                if (!bundle) {
                    bundle = {};
                }
                fqname = fqname.slice(idx + 1);
                lastIdx = fqname.lastIndexOf(".");
                if (lastIdx < 0) {
                    // only one "." (e.g. "MyPart.SomeParam")
                    bundle[fqname] = value;
                }
                else {
                    // e.g. if fqname="MyPart.SomeGroup1.SubGroup2.SomeParam"
                    propName = fqname.slice(lastIdx + 1); // propName = "SomeParam"
                    fqname = fqname.slice(0, lastIdx); // fqname = "SomeGroup1.SubGroup2"
                    var objValue_1 = bundle;
                    lang.forEach(fqname.split("."), function (propName) {
                        if (!objValue_1.hasOwnProperty(propName))
                            objValue_1 = objValue_1[propName] = {};
                        else
                            objValue_1 = objValue_1[propName];
                    });
                    objValue_1[propName] = value;
                }
                that.setBundle(bundleName, bundle);
            }
            else {
                value === undefined || value === null
                    ? that.store.removeItem(that._getStoreKey(fqname))
                    : that.store.setItem(that._getStoreKey(fqname), value);
            }
        },
        /**
         * @param {String} name
         * @return {Object}
         */
        getBundle: function (name) {
            return this.store.getObject(this._getStoreKey(name));
        },
        /**
         * @param {String} name
         * @param {Object} bundle
         */
        setBundle: function (name, bundle) {
            var that = this;
            if (!bundle) {
                that.store.removeItem(that._getStoreKey(name));
            }
            else {
                lang.traverseObject(bundle, function (name, value, path, owner, isObject) {
                    if (!isObject) {
                        // remove empty primitive value
                        if (value === "" || value === null || value === undefined) {
                            delete owner[name];
                        }
                    }
                    else {
                        // remove empty object value
                        if (lang.isEmptyObject(value)) {
                            delete owner[name];
                        }
                    }
                }, { visitObjects: true, visitValues: true });
                if (lang.isEmptyObject(bundle)) {
                    that.store.removeItem(that._getStoreKey(name));
                }
                else {
                    that.store.setObject(that._getStoreKey(name), bundle);
                }
            }
        },
        clear: function (bundleName) {
            var that = this, test = bundleName ? that._getStoreKey(bundleName) : that.prefix, toDelete = [];
            that.store.forEach(function (value, key) {
                if (lang.stringStartsWith(key, test)) {
                    toDelete.push(key);
                }
            }, that);
            lang.forEach(toDelete, function (key) {
                that.store.removeItem(key);
            });
        },
        getBundleNames: function () {
            var that = this, names = [];
            that.store.forEach(function (value, key) {
                var idx = key.indexOf(that.prefix);
                if (idx === 0) {
                    names.push(key.slice(that.prefix.length + 1));
                }
            }, that);
            return names;
        }
    };
    /**
     *
     */
    var UserSettings = /** @class */ (function (_super) {
        __extends(UserSettings, _super);
        /**
         * @constructs UserSettings
         * @extends Observable
         * @memberOf! module:core
         * @params {Object} [options] map with prop names and booleans where`false` means to ignore the property in bindToProp/attach
         */
        function UserSettings(options) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.__values = {};
            if (options) {
                that._propsOverrides = options.props;
                that.name = options.name;
                that.scope = options.scope;
            }
            return _this;
        }
        /**
         * Change a property. Triggers "change" event with all values.
         * @param {String} name
         * @param value
         */
        UserSettings.prototype.set = function (name, value) {
            this.__values[name] = value;
            this.trigger("change", this, this.__values);
        };
        UserSettings.prototype.initialize = function (json) {
            var that = this, initVals = json || {};
            this.trigger(UserSettings.Events.INITIALIZING, this, initVals);
            that.__values = initVals;
            that._initialized = true;
            if (json) {
                that.suppressEvents = true;
                try {
                    lang.forEach(json, function (value, name) {
                        if (that._propsOverrides && that._propsOverrides[name] === false) {
                            return;
                        }
                        that.trigger("init:" + name, value);
                    });
                }
                finally {
                    that.suppressEvents = false;
                }
            }
            this.trigger(UserSettings.Events.INITIALIZED, this);
        };
        /**
         * Bind the instance to a property of an Observable object.
         * On the property change we'll fire "change" event with all values.
         * @param {Observable} owner
         * @param {String} propName
         */
        UserSettings.prototype.bindToProp = function (owner, propName) {
            var that = this;
            if (that._propsOverrides && that._propsOverrides[propName] === false) {
                return;
            }
            // prop -> settings (saving)
            owner.bind("change:" + propName, function (sender, value) {
                if (!that.suppressEvents) {
                    that.set(propName, value);
                }
            });
            // settings -> prop (loading)
            that.bind("init:" + propName, function (value) {
                try {
                    lang.set(owner, propName, value);
                }
                catch (e) {
                    traceSource.warn("UserSettings: failed init for '" + propName + "': " + e + ". See the next error");
                    console.error(e);
                    lang.set(owner, propName, undefined);
                }
            });
            // binding after initialization
            if (that._initialized) {
                var value = that.__values[propName];
                if (value !== undefined) {
                    try {
                        lang.set(owner, propName, value);
                    }
                    catch (e) {
                        traceSource.warn("UserSettings: failed init for '" + propName + "': " + e + ". See the next error");
                        console.error(e);
                        lang.set(owner, propName, undefined);
                    }
                }
            }
        };
        /**
         * Attach a nested part settings.
         * @param {String} name name of nested part, will be used as setting name
         * @param {UserSettings} nested
         */
        UserSettings.prototype.attach = function (name, nested) {
            if (!nested) {
                return;
            }
            var that = this;
            var propOverride = that._propsOverrides && that._propsOverrides[name];
            if (propOverride === false) {
                return;
            }
            else if (lang.isObject(propOverride)) {
                nested.applyOverrides(propOverride);
            }
            nested.bind("change", function (sender, values) {
                that.set(name, values);
            });
            that.bind("init:" + name, function (values) {
                nested.initialize(values);
            });
            // attaching after initialization
            if (that._initialized) {
                var values = that.__values[name];
                if (values) {
                    nested.initialize(values);
                }
            }
        };
        UserSettings.prototype.applyOverrides = function (props) {
            this._propsOverrides = lang.extendEx(this._propsOverrides || {}, props, { exact: true });
        };
        /**
         * Attach settings store to the nested region.
         * @param {String} name name of nested region, will be used as setting name
         * @param {Region} region
         */
        UserSettings.prototype.attachToRegion = function (name, region) {
            var that = this;
            region.bind("usersettings.change", function (sender, args) {
                var regionValues = that.__values[name] || {};
                regionValues[args.part] = args.bundle;
                that.set(name, regionValues);
            });
            region.bind("usersettings.request", function (sender, args) {
                var regionValues = that.__values[name];
                if (regionValues) {
                    args.bundle = regionValues[args.part];
                }
            });
        };
        UserSettings.prototype.getValues = function () {
            return this.__values;
        };
        UserSettings.prototype.get = function (name) {
            return this.__values[name];
        };
        /*bindAll(owner: lang.Observable): void {
            if (this._propsOverrides) {
                lang.forEach(this._propsOverrides, (enabled, propName) => {
                    let field = this[propName];
                    if (field && field.userSettings) {
                        this.attach(propName, field.userSettings);
                    } else {
                        this.bindToProp(owner, propName);
                    }
                });
            }
        }*/
        UserSettings.create = function (options) {
            if (options === false)
                return null;
            return new UserSettings(options);
        };
        return UserSettings;
    }(lang.Observable));
    exports.UserSettings = UserSettings;
    (function (UserSettings) {
        UserSettings.Events = {
            INITIALIZING: "initializing",
            INITIALIZED: "initialized"
        };
    })(UserSettings = exports.UserSettings || (exports.UserSettings = {}));
    exports.UserSettings = UserSettings;
    var UserSettingsStore = /** @class */ (function (_super) {
        __extends(UserSettingsStore, _super);
        /**
         * @constructs UserSettingsStore
         * @extends Observable
         * @memberOf! module:core
         */
        function UserSettingsStore(settings) {
            var _this = _super.call(this) || this;
            _this.bundleName = "ui.userSettings";
            _this.settings = settings;
            return _this;
        }
        /**
         * Save part's user settings.
         * @param {Object} args
         * @param {String} args.area
         * @param {String} args.region
         * @param {String} args.part
         * @param {Object} args.bundle
         */
        UserSettingsStore.prototype._save = function (args) {
            var bundle = this.settings.getBundle(this.bundleName) || {};
            bundle[this._getKey(args.area, args.region, args.part, args.scope)] = args.bundle;
            this.settings.setBundle(this.bundleName, bundle);
        };
        /**
         * Return user settings for part-in-region-in-area
         * @param {Object} args
         * @param {String} args.area Area name
         * @param {String} args.region Region name
         * @param {String} args.part Part name
         * @returns {*}
         */
        UserSettingsStore.prototype.load = function (args) {
            var bundle = this.settings.getBundle(this.bundleName);
            if (bundle) {
                return bundle[this._getKey(args.area, args.region, args.part, args.scope)];
            }
        };
        UserSettingsStore.prototype._getKey = function (area, region, part, scope) {
            if (scope === "global")
                return part;
            return (area || "index") + "." + region + "." + part;
        };
        /**
         * Remove user settings of all parts.
         */
        UserSettingsStore.prototype.clearAll = function () {
            this.settings.clear("ui.userSettings");
        };
        __decorate([
            lang.decorators.constant(lang.debounce("_save", 100, "_saveTimer"))
        ], UserSettingsStore.prototype, "save");
        return UserSettingsStore;
    }(lang.Observable));
    exports.UserSettingsStore = UserSettingsStore;
    /*
    core.di = {
        importResolver: function (obj) {
            if (obj.imports) {
                lang.forEach(obj.imports, function (value, contract) {
                    var impl = core.di.contracts[contract],
                        accessor;
                    if (impl) {
                        impl = core.di._getInstance(impl);
                        if (lang.isString(value)) {
                            accessor = obj[value];
                            if (lang.isString(accessor)) {
                                obj[accessor] = impl;
                            } else if (lang.isFunction(accessor)) {
                                obj[accessor].call(obj, impl);
                            }
                        } else if (lang.isFunction(value)) {
                            value.call(obj, impl);
                        }
                    }
                });
    
            }
        },
        defineContract: function (contract, impl) {
            core.di.contracts[contract] = impl;
        },
        _getInstance: function (impl) {
            return impl;
        },
        contracts: {}
    };
    lang.Class.importResolver = core.di.importResolver;
    */
    var _moduleFactories = {};
    /**
     * Register a callback to be called on Application initialization.
     * Callback MAY return an object. If so then the object will be treated as a module.
     * The module MAY contain `initialize` method (which will be called immediately) and `handlers` field.
     * An object in `handlers` field is treated as map: field name is a Pub/Sub event name, its value is a callback.
     * @param {String} [moduleName] Optional module name.
     * @param {ModuleInitializer} factoryFn
     * @param {Object} [options]
     * @param {Object} [options.registry] Modules registry to use instead of global one (used by default)
     */
    function createModule() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var moduleName, callback, options, module, registry = _moduleFactories, fnIdx = 0;
        if (lang.isString(arguments[0])) {
            moduleName = arguments[0];
            fnIdx = 1;
        }
        callback = arguments[fnIdx];
        if (!callback) {
            throw "core.createModule: module callback function wasn't specified";
        }
        options = arguments[fnIdx + 1];
        if (options && options.modulesRegistry) {
            registry = options.modulesRegistry;
        }
        else {
            module = options;
        }
        if (module && module.hot) {
            moduleName = (moduleName || "") + "@" + module.id;
        }
        else {
            if (!moduleName) {
                moduleName = "module-" + Object.keys(registry).length;
            }
            else if (registry[moduleName]) {
                moduleName = "module-" + moduleName + "-" + Object.keys(registry).length;
            }
        }
        // запишем идентификаторы модулей в спец массив для поддержки HMR
        if (module && module.hot) {
            registry[moduleName] = function (app, options) {
                app["_hotModules"] = app["_hotModules"] || {};
                app["_hotModules"][moduleName] = true;
                return callback(app, options);
            };
        }
        else {
            registry[moduleName] = function (app, options) {
                return callback(app, options);
            };
        }
    }
    exports.createModule = createModule;
    /**
     * Registers callback to be called on Application initialization.
     * Callback MAY return an object. If so then the object will be treated as a module.
     * @param {String} [areaName] Area name. If you need to register callback for a default area just omit this parameter
     * @param {AreaModuleInitializer} factoryFn A callback to be called on `initialized` event fired of the specified area
     * @param {Object} [options]
     * @param {Object} [options.registry] Modules registry to use instead of global one (used by default)
     */
    function createAreaModule() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var areaName = "", callback, moduleName, module, options, registry = _moduleFactories, fnIdx = 0;
        if (lang.isString(arguments[0])) {
            areaName = arguments[0];
            fnIdx = 1;
        }
        callback = arguments[fnIdx];
        if (!callback) {
            throw "core.createAreaModule: module callback function wasn't specified";
        }
        options = arguments[fnIdx + 1];
        if (options && options.modulesRegistry) {
            registry = options.modulesRegistry;
        }
        else {
            module = options;
        }
        moduleName = areaName || "area-default";
        if (module && module.hot) {
            moduleName = (moduleName || "") + "@" + module.id;
        }
        else {
            if (registry[moduleName]) {
                if (areaName) {
                    moduleName = "area-" + areaName;
                    if (registry[moduleName]) {
                        moduleName = "module-" + areaName + "-" + Object.keys(registry).length;
                    }
                }
                else {
                    moduleName = "module-area-default-" + Object.keys(registry).length;
                }
            }
        }
        registry[moduleName] = function (module) {
            return function (app, options) {
                if (module && module.hot) {
                    app["_hotModules"] = app["_hotModules"] || {};
                    app["_hotModules"][moduleName] = true;
                }
                var area = app.areaManager.getArea(areaName);
                if (!area) {
                    // if the area doesn't exists allow Application to create it ad hoc
                    area = app.onUnknownArea(areaName);
                }
                if (!area) {
                    throw new Error("core.createAreaModule: area with name'" + areaName + "' doesn't exist");
                }
                // TODO: нехорошо все unbind'ить
                area.unbind("initialized");
                area.bind("initialized", function () {
                    // TODO: here we don't support module-objects
                    callback(app, area, options);
                });
                area.initialized = false;
            };
        }(module);
    }
    exports.createAreaModule = createAreaModule;
    var AppStateManager = /** @class */ (function (_super) {
        __extends(AppStateManager, _super);
        /**
         * @constructs AppStateManager
         * @extends Observable
         * @memberOf module:core
         * @article [Navigation](docs:navigation)
         * @param {Application} app
         * @param {Object} [options]
         */
        function AppStateManager(app, options) {
            var _this = _super.call(this) || this;
            var that = _this;
            that.options = lang.appendEx(options || {}, AppStateManager.defaultOptions, { deep: true });
            that.app = app;
            that._pushing = false; // this is ugly hack to prevent reacting on 'statechange' event on pushstate call
            that.started = false;
            that.traceSource = new diagnostics.TraceSource("core.AppStateManager");
            that.root = app.config.root || "/";
            that._reRoutePattern = new RegExp("^" + utils.combinePaths(that.root, "/(" + that.options.displayRoot + "|" + that.options.goRoot + "|" + that.options.execRoot + ")")
                .replace("/", "\/") + "\/([^/?]*)(?:\/([^/?]*)(?:\/([^?]*))?)?");
            that.baseTitle(Historyjs.options.initialTitle || document.title);
            that.bind("change:baseTitle", function () {
                var state = Historyjs.getState(/*friendly=*/ true, /*create=*/ true);
                state.title = that.getPageTitle(state.data);
                Historyjs.setTitle(state);
            });
            if (!app.config.disableHistory) {
                Historyjs.Adapter.bind(window, "statechange", function () {
                    var starting = !that.started, state, task;
                    if (that._startTimer) {
                        window.clearTimeout(that._startTimer);
                        that._startTimer = undefined;
                    }
                    that.started = true;
                    if (!that._pushing) {
                        // NOTE: фактически событие "statechange" генерируется когда юзер жмет back/forward в браузере
                        // и если кто-то сделает History.pushState (минуя наш метод pushState)
                        // Также событие генерируется при старте приложения в HTML4 браузерах, если url содержит хеш (см. метод start)
                        that.traceSource.debug("window.statechange raised");
                        state = Historyjs.getState(/*friendly=*/ true, /*create=*/ true);
                        // NOTE: on back/forward the browser already changed url by itself,
                        // so it makes no sense to ask components to compose an AppState and push it via pushState (as it'd do by default)
                        // So here we're specifically disabling pushing state (doNotTouchAppState=true)
                        // It also prevents replacing current url with an url restored
                        task = that._applyState(state, { disablePushState: true, start: starting, doNotTouchAppState: true });
                        if (task) {
                            task.then(function () {
                                var appState = state.data, url = appState && appState.url ? appState.url : that._getClientUrl(state);
                                that.app.eventPublisher.publish("app.statechange", { state: appState, url: url });
                            }, function () {
                                // applying state was rejected, return previous state
                                var idx = Historyjs.getCurrentIndex();
                                if (idx > 0) {
                                    state = Historyjs.getStateByIndex(idx - 1);
                                    that.pushState(state.data);
                                }
                            });
                        }
                    }
                });
            }
            return _this;
        }
        AppStateManager.prototype._getClientUrl = function (state) {
            // NOTE: getRootUrl return "/" ending, but we don't need it
            // WAS: ранее использовался hashedUrl
            return state.cleanUrl
                ? state.cleanUrl.slice(Historyjs.getRootUrl().length - 1)
                : "/";
        };
        AppStateManager.prototype._parseRoute = function (route, ignoreUnknown) {
            var that = this, 
            //pattern_query = /^([^?\[]*)(?:\[([^\[]*)\])?(?:\?(.*))?$/,
            pattern_query = /\?([^#]*)/, result = that._reRoutePattern.exec(route), data, area, areaState, part;
            if (result) {
                // NOTE: result[0] - full url, result[1] - first part (display/go)
                if (result[1] === that.options.displayRoot) {
                    // url like: display/
                    area = result[2] || "";
                    areaState = result[3] || "";
                    part = result[4] || "";
                }
                else if (result[1] === that.options.goRoot) {
                    // url like: go/
                    area = "";
                    areaState = "";
                    part = result[2] || "";
                }
                else if (!ignoreUnknown && result[1] === that.options.execRoot) {
                    // url like: exec/
                    data = {
                        command: {
                            name: result[2]
                        },
                        route: that.removeRootFromUrl(route) || ""
                    };
                    // query string (parameters):
                    result = pattern_query.exec(route);
                    if (result) {
                        if (result[1]) {
                            data.command.args = utils.parseUriParams(result[1]);
                        }
                    }
                    return data;
                }
                data = {
                    area: area,
                    areaState: { name: areaState },
                    regionState: {
                        part: part,
                        title: "",
                        partOptions: {}
                    },
                    route: that.removeRootFromUrl(route) || ""
                };
                if (data.route[data.route.length - 1] === "?") {
                    data.route = data.route.slice(0, data.route.length - 1);
                }
                if (data.area === that.options.defaultArea) {
                    data.area = "";
                }
                if (data.areaState.name === that.options.defaultState) {
                    data.areaState.name = "";
                }
                // query string (parameters):
                result = pattern_query.exec(route);
                if (result) {
                    if (result[1]) {
                        data.regionState.partOptions = utils.parseUriParams(result[1]);
                    }
                }
            }
            else {
                // check for root url ("", "/", "/app/", "/app"), optionally with query
                route = that.removeRootFromUrl(route);
                if (!route)
                    return {};
                result = pattern_query.exec(route);
                if (result && result[1]) {
                    // default app state but with query params
                    data = {
                        area: "",
                        areaState: { name: "" },
                        regionState: {
                            part: "",
                            title: "",
                            partOptions: utils.parseUriParams(result[1])
                        },
                        route: route
                    };
                }
                else if (!ignoreUnknown) {
                    return that.onUnknownRoute(route);
                }
            }
            return data || {};
        };
        AppStateManager.prototype.removeRootFromUrl = function (url) {
            if (this.root === "/" && url && url[0] === "/") {
                return url.substring(1);
            }
            if (this.root && this.root.length > 1) {
                // not server root, but folder ("/app")
                if (url.indexOf(this.root) === 0) {
                    return url.substring(this.root.length);
                }
                // NOTE: this.root has "/" at the end, but route could be without "/"
                var rootNoSlash = this.root.substring(0, this.root.length - 1);
                if (url.indexOf(rootNoSlash) === 0) {
                    return url.substring(rootNoSlash.length);
                }
            }
            return url;
        };
        /**
         * This method can be overridden for processing url custom commands.
         * A custom command is a term in url "/term"..
         * The method can return:
         * 	- a `AppState` object to push (the simplest case is `{}` - go to app root).
         *  - a Promise of `AppState` object
         *  - empty (null/undefined) - do nothing, implementation should make pushState on its own
         * @param {String} cmdName
         * @param {String} route
         * @param {Object} [cmdArgs]
         * @returns {AppState}
         */
        AppStateManager.prototype.onCommand = function (cmdName, route, cmdArgs) {
            // For implementers:
            // 	Here you can process custom command (cmdName) and return a new AppState where to go
            // 	or return null to stop processing the route (you should change App state on your own)
            return {};
        };
        /**
         * This method can be overridden for processing custom url.
         * Returning an empty object means "go to root".
         * Custom app logic can override and process any custom url. In this case it should return null.
         * @param {String} route
         * @returns {AppState}
         */
        AppStateManager.prototype.onUnknownRoute = function (route) {
            // For implementers:
            // 	empty object means "go to root".
            // 	Custom app logic can override and process any custom url. In this case it should return null
            return {};
        };
        AppStateManager.prototype.start = function () {
            //if (this.app.config.disableHistory) { return; }
            var that = this, state = Historyjs.getState(true, true), isHistoryApiSupported = !Historyjs.emulated.pushState;
            if (that.started) {
                return;
            }
            if (that.traceSource.enabled("debug")) {
                that.traceSource.debug("[AppStateManager] start with state=" + JSON.stringify(state));
            }
            var extraPath = document.location.pathname.slice(that.app.config.root.length);
            // NOTE: "/ajax" and "/ajax/" are the same paths
            if (!isHistoryApiSupported && extraPath.length > 1 && !lang.stringStartsWith(extraPath, that.options.displayRoot + "/report/")) {
                // in HTML4 browser if path doesn't equal app root that means that the current url went from a HTML5 browser.
                // So we need to cut off this extra path as otherwise it'll stay forever.
                // e.g. "http://localhost/xfw3-ajax/display/index/groups" should become "http://localhost/xfw3-ajax/#display/index/groups"
                Historyjs.clearQueue();
                Historyjs.clearAllIntervals();
                document.location.href = utils.combinePaths(Historyjs.getRootUrl(), that.app.config.root) + "#" + extraPath + document.location.search;
                return;
            }
            else if (isHistoryApiSupported && lang.stringStartsWith(document.location.hash, "#" + that.options.displayRoot)) {
                // in HTML5 browser if path contains hash (#display) that means that the current url went from a HTML4 browser.
                // e.g. "http://localhost/xfw3-ajax/#display/index/groups" should become "http://localhost/xfw3-ajax/display/index/groups"
                Historyjs.clearQueue();
                Historyjs.clearAllIntervals();
                document.location.href = utils.combinePaths(Historyjs.getRootUrl(), that.app.config.root) + document.location.hash.slice(1);
                return;
            }
            // NOTE: in HTML4 browsers here we have "hashed" state (not normalized),
            // so it shouldn't be used. But in HTML4 browsers there will be 'statechange' event later (if url has hash)
            // And in its handler we'll get normalized state.
            // So we're ignoring state for HTML4 browsers if it's not empty (has some hash):
            // i.e.: if (HTML5 or not-hashed-url)
            // Unfortunately detecting "empty" state isn't easy. History.js can return "hashed" for root url -
            // e.g. cleanUrl="http://example.org/myapp/", but hashedUrl="http://example.org/myapp/?&_suid=13..95"
            // Also as state here isn't normalized so any hashed url will be cleanUrl ("http://localhost/ajax/#display/index/groups")
            if (isHistoryApiSupported || (state.hashedUrl === state.cleanUrl && state.cleanUrl.indexOf("#") < 0)) {
                that.started = true;
                Historyjs.setTitle(state);
                that._applyState(state, { disablePushState: true, start: true });
            }
            else {
                // Here we hope that 'statechange' will fire shortly
                // but we can be wrong (History.js is buggy), so schedule a timer to guarantee the app started
                that._startTimer = window.setTimeout(function () {
                    that._startTimer = undefined;
                    if (that.started) {
                        return;
                    }
                    var state = Historyjs.getState(true, true);
                    that.traceSource.warn("[AppStateManager] start: state was treated as non-empty but 'statechange' event hasn't fired, url=" + state.url);
                    that.started = true;
                    Historyjs.setTitle(state);
                    that._applyState(state, { disablePushState: true, start: true });
                }, 2000);
            }
        };
        AppStateManager.prototype.getStateTitle = function (state) {
            return (state.regionState ? state.regionState.title : null) || (state.areaState ? state.areaState.title : null) || null;
        };
        AppStateManager.prototype.getPageTitle = function (state) {
            var title = this.getStateTitle(state);
            title = (title ? title + " - " : "") + this.baseTitle();
            return title;
        };
        /**
         * Update current browser url, serializing specified state into the url
         * @param {AppState} state Current application state
         * @param {Object} options
         * @param {Boolean} [options.replaceState] Pass true if you want to replace the current url with the new one without adding record into browser history.
         * @param {Boolean} [options.freezeUrl] do not change URL while pushing the new AppState
         */
        AppStateManager.prototype.pushState = function (state, options) {
            if (this.app.config.disableHistory) {
                return;
            }
            if (!this.started) {
                return;
            }
            if (!state) {
                throw new Error("AppStateManager.pushState: state should not be null");
            }
            var that = this, title = that.getPageTitle(state), url;
            options = options || {};
            if (options.freezeUrl) {
                var curState = Historyjs.getState(/*friendly*/ true, /*create*/ true);
                // NOTE: a trick: put current state into special field which is analyzed in 'start' method
                // i.e. on page reload AppStateManager will use state from _reloadState, but on 'backward' in browser
                // new ('state') state will be used.
                if (curState.data) {
                    state._reloadState = curState.data._reloadState || curState.data;
                }
                url = that._getClientUrl(curState);
            }
            else if (state.url) {
                url = state.url;
            }
            else {
                url = that.getStateUrl(state);
            }
            state.url = url;
            if (that.traceSource.enabled("debug")) {
                that.traceSource.debug("pushState: mode=" +
                    (options.freezeUrl ? "pushWithFreeze" :
                        options.replaceState ? "replaceState" : "pushState") +
                    ", url=" + url + ", state=" + JSON.stringify(state) + ", title=" + title);
            }
            // NOTE: History.pushState/replaceState manually fires 'statechange' event
            // but we don't want it when pushing state - that's because we're setting the _pushing flag.
            that._pushing = true;
            try {
                //				if (options.removePrevious) {
                //					TODO: так не работает, т.к. back асинхронный
                //					Historyjs.back(false);
                //					Historyjs.replaceState(state, title, url, /*queue*/true)
                //				} else {
                //				}
                options.replaceState
                    ? Historyjs.replaceState(state, title, url, /*queue*/ false)
                    : Historyjs.pushState(state, title, url, /*queue*/ false);
            }
            catch (e) {
                console.log(e);
            }
            finally {
                that._pushing = false;
            }
            that.app.eventPublisher.publish("app.statechange", { state: state, url: url });
        };
        /**
         * Replace current browser url, serializing specified state into the url
         * @param {AppState} state Current application state
         */
        AppStateManager.prototype.replaceState = function (state) {
            this.pushState(state, { replaceState: true });
        };
        /**
         * Switch current state of application without deactivating current area state if it's same as the new one.
         * @param {AppState} state A new application state
         * @returns {Promise}
         */
        AppStateManager.prototype.applyState = function (state) {
            return this._applyState({ data: state }, { disablePushState: false });
        };
        /**
         * Switch current state of application. Also change the browser URL.
         * It makes 'full switch', i.e. deactivate current area state even if it's the same in the new state.
         * @param {AppState} state A new application state
         * @returns {Promise}
         */
        AppStateManager.prototype.switchState = function (state) {
            return this._applyState({ data: state }, { fullSwitch: true, disablePushState: false });
        };
        /**
         * @param state
         * @param options
         * @returns {JQueryPromise}
         * @private
         */
        AppStateManager.prototype._applyState = function (state, options) {
            var that = this, appState, route;
            if (that.traceSource.enabled("debug")) {
                that.traceSource.debug("[AppStateManager] _applyState: enter with state: " + JSON.stringify(state));
            }
            if (!state.data || lang.isEmptyObject(state.data)) {
                route = that._getClientUrl(state);
                that.traceSource.debug("[AppStateManager] _applyState: parsed route from state: " + route);
                appState = that._parseRoute(route, false);
                // state restored from Url will not contain title - we need to get them
            }
            else {
                appState = state.data || {};
                // NOTE: the state from state.data could be loaded from cache (as result of page refresh),
                // and it may not relate to current url (in route). If this happens it will be processed in Area.activateState
                if (appState._reloadState && options && options.start) {
                    appState = appState._reloadState;
                }
            }
            that.traceSource.debug(function () { return "[AppStateManager] _applyState: applying appState: " + JSON.stringify(state); });
            if (appState === null) {
                // NOTE: appState === null means that it was not parsed in parseRoute,
                // but it was processed in onUnknownRoute (otherwise it'd be equal {})
                return null;
            }
            if (appState.command) {
                return that._execUrlCommand(appState, options);
            }
            return that._applyAppState(appState, options);
        };
        AppStateManager.prototype._execUrlCommand = function (appState, options) {
            var that = this;
            var res = that.onCommand(appState.command.name, appState.route, appState.command.args);
            if (lang.isPromise(res)) {
                return res.then(function (res) {
                    if (res) {
                        //that.pushState(res, {replaceState: true});
                        return that._applyAppState(res, options);
                    }
                });
            }
            else {
                if (res) {
                    //that.pushState(res, {replaceState: true});
                    return that._applyAppState(res, options);
                }
                return lang.resolved();
            }
        };
        AppStateManager.prototype._applyAppState = function (state, options) {
            var that = this, areaManager = that.app.areaManager, stateName = "", area, areaName = "", areaState;
            if (state) {
                areaName = state.area;
                stateName = (state.areaState ? state.areaState.name : "");
                areaState = {
                    name: stateName,
                    regionState: state.regionState
                };
            }
            // options.state = state;
            if (that.app.config.isDebug) {
                return areaManager.activateState(areaName, areaState, options);
            }
            else {
                try {
                    return areaManager.activateState(areaName, areaState, options);
                }
                catch (e) {
                    // if something bad happened fallback to root state
                    that.traceSource.log(e.message);
                    // TODO: why "start"?
                    that.app.eventPublisher.publish("app.start.fail", SystemEvent.create({
                        kind: SystemEvent.Kind.notification,
                        message: "Application navigation error: " + e.message,
                        severity: "warning",
                        priority: "high"
                    }));
                    // we failed to activate a state or part in some area (we're sure that the area exists),
                    // fallback to its default state (and cut off part)
                    // TODO: NOTE: we could keep part name for the case if it's correct but only state is incorrect
                    area = areaManager.getArea(areaName);
                    if (area) {
                        stateName = area.getDefaultState();
                    }
                    else {
                        areaName = "";
                        stateName = "";
                    }
                    return areaManager.activateState(areaName, stateName);
                }
            }
        };
        AppStateManager.prototype.getAreaUrl = function (areaName) {
            return this.getAreaStateUrl(areaName, null);
        };
        AppStateManager.prototype.getAreaStateUrl = function (areaName, stateName) {
            var that = this, url;
            areaName = areaName || that.options.defaultArea;
            stateName = stateName || that.options.defaultState;
            if (stateName !== that.options.defaultState) {
                url = "/" + that.options.displayRoot + "/" + areaName + "/" + encodeURIComponent(stateName);
            }
            else if (areaName !== that.options.defaultArea) {
                url = "/" + that.options.displayRoot + "/" + areaName;
            }
            else {
                url = "/";
            }
            if (that.root.charAt(that.root.length - 1) === "/") {
                url = url.slice(1);
            }
            url = that.root + url;
            return url;
        };
        AppStateManager.prototype.getStateUrl = function (state) {
            var that = this, url = "", regionUrl = "", query = "", areaName, stateName;
            /*
                /
                /display/index/
                /display/index/state1
                /display/index/default/mypart1
                /display/area1
                /display/area1/default/mypart1
                /display/area1/state1/mypart1
                /display/area1/state1/mypart1?partArg1=value1
                /display/area1/state1?partArg1=value1
                /?partArg1=value1
             */
            if (state.regionState) {
                if (!state.isDefaultPart && state.regionState.part) {
                    if (typeof state.regionState.part === "string") {
                        regionUrl = state.regionState.part;
                    }
                    else {
                        regionUrl = state.regionState.part.name;
                    }
                }
                // TODO: allow part to customize its options presentation in url
                if (state.regionState.partOptions) {
                    query = utils.buildUriParams(state.regionState.partOptions);
                    if (query) {
                        query = "?" + query;
                    }
                }
                if (regionUrl) {
                    url = "/" + regionUrl;
                }
                if (query) {
                    url += query;
                }
            }
            areaName = state.area || that.options.defaultArea || null;
            stateName = (state.areaState ? (state.areaState.isDefault ? null : state.areaState.name) : null)
                || that.options.defaultState;
            if (url || (stateName !== that.options.defaultState)) {
                url = "/display/" + areaName + "/" + encodeURIComponent(stateName) + url;
            }
            else if (areaName !== that.options.defaultArea) {
                url = "/display/" + areaName;
            }
            else {
                url = "/";
            }
            if (that.root.charAt(that.root.length - 1) === "/") {
                url = url.slice(1);
            }
            return that.root + url;
        };
        /**
         * Return current application state
         * @returns {AppState}
         */
        AppStateManager.prototype.getCurrentState = function () {
            var state = Historyjs.getState(/*friendly*/ true, /*create*/ false), appState;
            if (!state || !state.data || lang.isEmptyObject(state.data)) {
                var route = this._getClientUrl(Historyjs.getState(/*friendly*/ true, /*create*/ true));
                appState = this._parseRoute(route, true);
            }
            else {
                appState = state.data;
            }
            return appState;
            /* БЫЛО ТАК (почему?):
            var route = this._getClientUrl(Historyjs.getState(true, true));
            return this._parseRoute(route);
            */
        };
        AppStateManager.prototype.getPreviousState = function () {
            var idx = Historyjs.getCurrentIndex(), state;
            if (idx > 0) {
                state = Historyjs.getStateByIndex(idx - 1);
                if (state) {
                    return state.data;
                }
            }
        };
        /**
         * Defaults for AppStateManager
         * @type {Object}
         * @property {String} defaultArea - name of default area in url ("index")
         * @property {String} defaultState - name of default state in url ("default")
         * @property {String} displayRoot - name of UI root url segment ("display")
         * @property {String} goRoot - name of "go" url segment ("go")
         */
        AppStateManager.defaultOptions = {
            defaultArea: "index",
            defaultState: "default",
            displayRoot: "display",
            goRoot: "go",
            execRoot: "exec"
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], AppStateManager.prototype, "baseTitle");
        return AppStateManager;
    }(lang.Observable));
    exports.AppStateManager = AppStateManager;
    AppStateManager.mixin({
        defaultOptions: AppStateManager.defaultOptions
    });
    var Application = /** @class */ (function () {
        /**
         * @constructs Application
         * @memberOf module:core
         * @param {XConfig} config XConfig object placed on the page on the server
         * @param {Object} [options]
         * @param {String|Function} [options.template] Template of the application page for client-side rendering
         * @param {Boolean} options.ignoreModules If specified then Application won't use modules registry on its initialization
         * @param {Object} options.modulesRegistry
         */
        function Application(config, options) {
            var that = this;
            that.options = lang.appendEx(options || {}, Application.defaultOptions, { deep: true });
            // set up global static singleton instance
            Application.current = that;
            that.config = config || { root: "/" };
            that.config.root = that.config.root || "/";
            that.config.apiroot = that.config.apiroot || that.config.root;
            if (that.config.root === "/" && location.hostname === "localhost") {
                // it's a local dev app, like "localhost:21267/"
                exports.localStorage.setupPrefix(that.config.appName);
            }
            else {
                exports.localStorage.setupPrefix(that.config.root);
            }
            var diagLevel = exports.settings.getItem(diagnostics.defaultLevelKey);
            if (diagLevel !== undefined) {
                diagnostics.setDefaultLevel(diagLevel);
            }
            that.createComponents();
            var dataFacade = that.options.dataFacade;
            if (!lang.isPromise(dataFacade)) {
                that.dataFacade = dataFacade;
            }
        }
        Application.prototype.createComponents = function () {
            var that = this;
            // events.EventPublisher)();
            that.eventPublisher = new that.options.EventPublisher();
            var compositionSettings = exports.settings.getBundle("composition");
            //new composition.AreaManager(that, compositionSettings && compositionSettings.debug ? { debug: compositionSettings.debug } : null);
            that.areaManager = new that.options.AreaManager(that, compositionSettings && compositionSettings.debug ? { debug: compositionSettings.debug } : null);
            //new AppStateManager(that);
            that.stateManager = new that.options.StateManager(that);
            // new UserSettingsStore
            that.userSettingsStore = new that.options.UserSettingsStore(exports.settings);
        };
        Application.prototype.preinitialize = function () { };
        /**
         * Initialization state. It happens after all modules initialized.
         * @return {Promise} If implementation returns a promise then next stage (post-initialization) will be postponed till it resolved.
         */
        Application.prototype.initialize = function () { };
        /**
         * Post-initialization stage (latest). It happens after AppStateManager applied current state from url.
         * Publishes pub/sub "app.start" event.
         */
        Application.prototype.postinitialize = function () {
            this.stateManager.start();
            this.eventPublisher.start();
        };
        /**
         * @param {Object} [options]
         * @param {boolean} [options.connected] Subscribe on DataFacade's 'update' event
         * @returns {UnitOfWork}
         */
        Application.prototype.createUnitOfWork = function (options) {
            var model = this.model;
            return new model.UnitOfWork(this.dataFacade, options);
        };
        /**
         * Initialize the application: initialize areas and its regions from markup, initialize modules, start AppStateManager
         * @param {jQuery|HTMLElement} rootElement
         */
        Application.prototype.run = function (rootElement) {
            var _this = this;
            return this._run(rootElement).fail(function (e) {
                _this._onStateChanged(Application.States.failed, e);
            });
        };
        Application.prototype._run = function (rootElement) {
            var that = this;
            if (!that.dataFacade) {
                return lang.async.then(that.createDataFacade(), function (dataFacade) {
                    that.dataFacade = dataFacade;
                    return that._run1(rootElement);
                });
            }
            return that._run1(rootElement);
        };
        Application.prototype._run1 = function (rootElement) {
            var that = this;
            that.eventPublisher.subscribe("interop.server_version_changed", function (ev) {
                if (ev.args && ev.args.newVersion) {
                    that.updateAppVersion(ev.args.newVersion);
                }
            });
            // Initialize root element
            if (!rootElement) {
                rootElement = $(".x-app-root");
                if (rootElement.length === 0) {
                    rootElement = document.body;
                }
            }
            else if (rootElement.length === 0) {
                throw new Error("Application.run: rootElement cannot be an empty array");
            }
            if (rootElement.length) {
                rootElement = rootElement[0];
            }
            that.rootElement = rootElement;
            that.$rootElement = $(rootElement);
            that.appendGridHeightTester();
            // Initialize container for app state reporting
            that.initContainerElement = that.$rootElement.find(".x-app-init-container");
            if (that.initContainerElement.length) {
                that.initContainerElement = that.initContainerElement.clone();
            }
            // Initialize dataFacade
            var dataFacade = that.dataFacade;
            if (dataFacade && !dataFacade.eventPublisher) {
                dataFacade.setEventPublisher(that.eventPublisher);
            }
            that.preinitialize();
            if (that.options.template) {
                new View({ template: that.options.template, viewModel: that }).render(that.rootElement);
            }
            // Initialize Areas
            that._initAreas();
            // Initialize app modules
            that._initModules();
            var initTask = that.initialize();
            exports.$window.bind("beforeunload", function () {
                if ($("body").hasClass("modal-open")) {
                    $(".modal").remove();
                    $(".modal-backdrop").remove();
                }
                lang.forEach(that.areaManager.getAreas(), function (area) {
                    area.regionManager.unloadAll({ suppressUI: true, reason: "windowUnload" });
                    that._onStateChanged("unloading");
                });
            });
            return lang.async.then(initTask, lang.async.wrap(function () {
                that._onStateChanged("initialized");
                that.postinitialize();
                that._onStateChanged("started");
            }));
        };
        Application.prototype.appendGridHeightTester = function () {
            var $wrapper = $("<div class='grid-height-tester-wrapper slick-viewport ui-widget-content slick-row' />").insertBefore(this.$rootElement);
            $("<div id='grid-height-tester' class='slick-cell x-slick-cell-data' style='white-space:normal;display:none'/>").appendTo($wrapper);
        };
        Application.prototype.createDataFacade = function () {
            var that = this, dataFacade = that.options.dataFacade;
            if (dataFacade) {
                // option `dataFacade` is specified - return it
                return dataFacade;
            }
            if (exports.interop) {
                var DataFacade = exports.interop.DataFacade;
                var BackendInterop = exports.interop.BackendInterop;
                if (DataFacade && BackendInterop) {
                    return DataFacade.create(BackendInterop.create(that.config), that.eventPublisher);
                }
            }
        };
        /**
         * @param {String} state
         * @param {Error} [error]
         * @private
         */
        Application.prototype._onStateChanged = function (state, error) {
            var that = this, args = { state: state, error: undefined };
            if (state === "failed") {
                args.error = error;
                if (error) {
                    console.error(error);
                    if (error.stack) {
                        console.debug(error.stack);
                    }
                }
                else {
                    console.error("Application initialization error");
                }
            }
            that.onAppStateChanged(args);
        };
        /**
         * Create Area objects from DOM markup and add them to the areaManager.
         * @private
         */
        Application.prototype._initAreas = function () {
            var that = this, areasContainer = that.$rootElement.find(".x-areas-container"), defaultAreaName, $areas;
            areasContainer = areasContainer.length ? areasContainer : that.$rootElement;
            // set up parent element for all areas
            that.areaManager.areasContainer = areasContainer;
            $areas = areasContainer.filter(".x-area").add(".x-area", areasContainer.get(0));
            if ($areas.length > 0) {
                $areas.each(function () {
                    var areaName = $(this).attr("data-area") || this.id, options = lang.parseJsonString($(this).attr("data-area-options")) || {}, area = that.areaManager.createArea(areaName, this, options);
                    if (!areaName || options.isDefault) {
                        if (defaultAreaName !== undefined) {
                            throw new Error("core.Application.run: found several unnamed areas but only one is permitted");
                        }
                        defaultAreaName = areaName || "";
                    }
                });
                if (defaultAreaName === undefined) {
                    defaultAreaName = that.areaManager.getAreas()[0].name || "";
                }
            }
            else {
                // no areas found in markup, let's create a default area
                var area = that.onUnknownArea("");
                defaultAreaName = area.name || "";
            }
            that.areaManager.setDefaultArea(defaultAreaName);
        };
        /**
         * Initialize app modules registered via `core.createAppModule` and `core.createAreaModule` methods.
         * @private
         * @param modules - List of modules
         */
        Application.prototype._initModules = function (modules) {
            var that = this;
            if (that.options.ignoreModules) {
                return; // !!!
            }
            var registry = that.options.modulesRegistry || _moduleFactories;
            lang.forEach(registry, function (moduleFactory, name) {
                var moduleOptions;
                if (that.config && that.config.modules) {
                    moduleOptions = that.config.modules[name];
                }
                if (modules && !lang.contains(modules, name))
                    return;
                var moduleVar = moduleFactory(that, moduleOptions);
                // NOTE: `module` can be a callback or an object with `initialize` method
                if (moduleVar) {
                    var module_1 = moduleVar;
                    if (module_1.initialize) {
                        module_1.initialize(that);
                    }
                    // Events Auto-Wiring
                    if (module_1.handlers) {
                        lang.forEach(module_1.handlers, function (handler, eventName) {
                            if (lang.isString(handler)) {
                                if (!module_1.hasOwnProperty(handler)) {
                                    throw new Error("Application.run: can't find handler '" + handler + "' of event '" + eventName + "'");
                                }
                                handler = module_1[handler];
                            }
                            that.eventPublisher.subscribe(eventName, handler.bind(module_1));
                        });
                    }
                }
            });
        };
        /**
         * Register part factory.
         * @param {String} partName Name of the part. It will be used to create part via createPart method.
         * @param {Function} creator
         */
        Application.prototype.registerPart = function (partName, creator) {
            registerPart(partName, creator);
        };
        /**
     * Create a part instance.
     * @param {String} partName Name of the part
     * @param {Object} [options] Options to pass to part's constructor
     * @returns {Part}
     */
        Application.prototype.createPart = function (partName, options) {
            return createPart(partName, options);
        };
        /**
         * Creates a dialog
         * @param {Object} [options] Options to pass to dialog's constructor
         * @returns {Dialog}
         */
        Application.prototype.createDialog = function (options) {
            return exports.ui.Dialog.create(options);
        };
        /**
         * Return all registered parts names.
         * @returns {String[]}
         */
        Application.prototype.getAllPartNames = function () {
            return Object.keys(_partFactories);
        };
        /**
         * Check whather the specified part was registered.
         * @param {string} partName Name of the part
         * @return {boolean}
         */
        Application.prototype.isPartRegistered = function (partName) {
            return !!_partFactories[partName];
        };
        Application.prototype.updateAppVersion = function (ver) {
            this.config.software = this.config.software || { appVersion: undefined };
            this.config.software.appVersion = ver;
        };
        Application.prototype.onAppStateChanged = function (args) {
            var that = this;
            switch (args.state) {
                case "loading":
                    that.onLoading();
                    break;
                case "failed":
                    that.onFailed(args.error);
                    break;
                case "initialized":
                    that.onInitialized();
                    break;
                case "started":
                    that.onStarted();
                    break;
                case "unloading":
                    that.onUnloading();
                    break;
            }
        };
        Application.prototype.onLoading = function () {
            var that = this;
            $(that.rootElement).empty();
            if (that.initContainerElement) {
                that.initContainerElement.appendTo(that.rootElement);
            }
        };
        Application.prototype.onUnloading = function () {
            $(".x-app-init-container").remove();
            $(this.rootElement).empty();
            this.eventPublisher.publish("app.unload");
        };
        Application.prototype.onInitialized = function () {
            $(".x-app-init-container").remove();
            $(this.rootElement).show();
        };
        Application.prototype.onStarted = function () { };
        Application.prototype.onFailed = function (error) {
            var that = this, $root = $(that.rootElement || ".x-app-root"), message = resources["application_init_failed"] + "...";
            if ($root.length === 0) {
                $root = $("body");
            }
            $root.empty().show().addClass("x-app-root--failed");
            var $container = $("<div class='x-app-init-container'></div>").appendTo($root);
            $("<h2 class='x-app-init-message'><div class='x-app-init-message-smile'>:(</div>" + message + "</h2>").appendTo($container);
            // if (that.config.isDebug) { // show the error somewhere }
            console.warn(error);
        };
        Application.prototype.onUnknownArea = function (areaName) {
            var that = this, area = that.areaManager.createArea(areaName);
            area.regionManager.createRegion("main", { navigable: true });
            return area;
        };
        Application.defaultOptions = {
            EventPublisher: events.EventPublisher,
            AreaManager: composition.AreaManager,
            StateManager: AppStateManager,
            UserSettingsStore: UserSettingsStore
        };
        __decorate([
            lang.decorators.asyncSafe
        ], Application.prototype, "_run");
        __decorate([
            lang.decorators.asyncSafe
        ], Application.prototype, "_run1");
        return Application;
    }());
    exports.Application = Application;
    (function (Application) {
        Application.State = {
            loading: "loading",
            initialized: "initialized",
            started: "started",
            failed: "failed",
            unloading: "unloading"
        };
    })(Application = exports.Application || (exports.Application = {}));
    exports.Application = Application;
    // backward compatibility:
    Application.prototype.states = Application.State;
    Application.States = Application.State;
    var _partFactories = {};
    /**
     * Register a part factory.
     * @param {String} partName Part name
     * @param {Function} creator Function to be called when part creation requested (see core.createPart)
     */
    function registerPart(partName, creator) {
        if (!creator) {
            throw new Error("core.registerPart: part '" + partName + "' has no factory method");
        }
        _partFactories[partName] = creator;
    }
    exports.registerPart = registerPart;
    /**
     * Create an instance of part
     * @param {String} partName name of the part
     * @param {Object} [options] parameters of part's constructor
     * @returns {Part}
     */
    function createPart(partName, options) {
        var i = 1, ctor = _partFactories[partName], names, name;
        if (!ctor) {
            names = partName.split(":");
            for (; i < names.length; i++) {
                name = names.slice(0, names.length - i).join(":");
                ctor = _partFactories[name];
                if (ctor) {
                    (options || (options = {})).urlSuffix = names.slice(-i).join(":");
                    break;
                }
            }
        }
        else {
            // there's a factory for {partName} name, but to keep things consistent add urlSuffix as well
            var idx = partName.indexOf(":");
            if (idx > 0) {
                (options || (options = {})).urlSuffix = partName.substring(idx + 1);
            }
        }
        if (!ctor) {
            throw eth.unknownPart(partName);
        }
        var part = ctor(options);
        if (!part) {
            throw new Error("core.createPart: factory method of part '" + partName + "' didn't return a part instance");
        }
        part.name = partName;
        return part;
    }
    exports.createPart = createPart;
    /**
     * Remove part registration (created with `registerPart`.
     * @param {string} partName Part name
     * @return {boolean} true if a part factory was really removed
     */
    function removePart(partName) {
        var exists = _partFactories[partName];
        delete _partFactories[partName];
        return !!exists;
    }
    exports.removePart = removePart;
    View.Handlebars.registerHelper("part", function () {
        var options = arguments[arguments.length - 1], markup = new View.ChildViewMarkup(options), hash = options.hash, partName = hash.name, className = hash["class"], viewModel = hash.hasOwnProperty("viewModel") ? hash.viewModel : this, partArgs, partOptions, partFactory;
        if (arguments.length > 1) {
            // pass all args except the last one (which is options) into part's ctor
            partArgs = lang.concatExceptLast.apply(null, arguments);
        }
        else {
            // Old style: take part's arguments from helper's hash
            partOptions = markup.getHash();
            // But we have some reserved properties which cannot be used as part's arguments (name, class, viewModel):
            delete partOptions.name;
            delete partOptions["class"];
            delete partOptions.viewModel;
            utils.parseObject(partOptions);
            partArgs = [partOptions];
        }
        partFactory = function () {
            var part;
            if (className) {
                partArgs.unshift(null, className); // `core` is used as `rootNamespace` by default
                part = lang.Class.create.apply(null, partArgs);
                part.name = partName || part.name;
            }
            else if (partName) {
                partArgs.unshift(partName);
                part = createPart.apply(null, partArgs);
            }
            if (!part) {
                throw new Error("Can't create part. You should specify option 'class' or 'name'.");
            }
            if (viewModel && part.setViewModel) {
                part.setViewModel(viewModel);
            }
            return part;
        };
        markup.registerPendingChild(partFactory);
        return markup.getHtml();
    });
    /**
     * @deprecated Use 'part' helper
     */
    View.Handlebars.registerHelper("view", View.Handlebars.helpers["part"]);
    View.Handlebars.registerHelper("xconfig", function (name) {
        var value = Application.current.config[name] || "";
        return new View.Handlebars.SafeString(lang.encodeHtml(value));
    });
    View.Handlebars.registerHelper("res", function (name) {
        var value = resources[name];
        return new View.Handlebars.SafeString(value);
    });
    View.Handlebars.registerHelper("if-feature", function (name, options) {
        // TODO add core.platform.features?
        if (exports.platform.modernizr[name]) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    exports.ui.getWaitingIconClass = function (size) {
        var cssClass = "x-icon x-icon-waiting x-icon-anim-rotating";
        if (size) {
            cssClass += " x-icon-" + size;
        }
        return cssClass;
    };
    if (!exports.platform.modernizr.cssanimations) {
        // if css3 animations isn't supported (i.e. IE <= 9),
        // then there should be classes 'x-img-waiting-*' available from common.ie.css
        exports.ui.getWaitingIconClass = function (size) {
            return "x-img-waiting-" + (size || 16);
        };
    }
    View.Handlebars.registerHelper("waiting-icon", function (options) {
        var size = options.hash.size || 48, cssClass = options.hash.cssClass, html = "<div class='" + exports.ui.getWaitingIconClass(size) + (cssClass ? (" " + cssClass) : "") + "'></div>";
        return new View.Handlebars.SafeString(html);
    });
    /**
     * Handlebars-helper "waiting-large".
     */
    View.Handlebars.registerHelper("waiting-large", function (options) {
        var hash = options && options.hash, text = hash && (hash.res && resources[hash.res] || hash.text) || resources["loading"], html = "<div class='x-waiting-container x-waiting-container-large'>" +
            "<div class='" + exports.ui.getWaitingIconClass(48) + "'></div>" +
            "<h4>" + lang.encodeHtml(text) + "</h4>" +
            "</div>";
        return new View.Handlebars.SafeString(html);
    });
    View.Handlebars.registerHelper("bootstrap-severity-class", function (severity, options) {
        var bsSeverity = severity || "info";
        // change our "error" to bootstrap "danger"
        bsSeverity === "error" && (bsSeverity = "danger");
        return new View.Handlebars.SafeString((options.hash.prefix || "label") + "-" + bsSeverity);
    });
    //severity-icon
    View.Handlebars.registerHelper("severity-icon", function (severity) {
        var icoClass;
        var color;
        switch (severity) {
            case "critical":
            case "error":
                icoClass = "x-icon-warning-triangle2";
                color = "#d9534f";
                break;
            case "warning":
                icoClass = "x-icon-warning";
                color = "#f0ad4e";
                break;
            case "success":
                icoClass = "x-icon-ok";
                color = "#5cb85c";
                break;
            default:
                icoClass = "x-icon-info2";
                color = "#5bc0de";
                break;
        }
        return new View.Handlebars.SafeString("<span class='x-icon " + icoClass + "' style='color: " + color + "'></span>");
    });
    View.Handlebars.registerHelper("notification-icon", function () {
        var that = this, icoClass, color = "grey";
        if (!that.kind || that.kind === SystemEvent.Kind.notification) {
            /*
            NOTE: colors was got from bootstrap variables:
                @brand-primary:         #428bca;
                @brand-success:         #5cb85c;
                @brand-info:            #5bc0de;
                @brand-warning:         #f0ad4e;
                @brand-danger:          #d9534f;
             */
            switch (that.severity) {
                case "error":
                    icoClass = "x-icon-warning-triangle2";
                    color = "#d9534f";
                    break;
                case "warning":
                    icoClass = "x-icon-warning";
                    color = "#f0ad4e";
                    break;
                case "success":
                    icoClass = "x-icon-ok";
                    color = "#5cb85c";
                    break;
                default:
                    icoClass = "x-icon-info2";
                    color = "#5bc0de";
                    break;
            }
            if (that.state() === "archived") {
                color = "grey";
            }
        }
        else if (that.kind === "process") {
            icoClass = "x-icon-lightning";
            color = "#428bca";
        }
        return new View.Handlebars.SafeString("<span class='x-icon " + icoClass + "' style='color: " + color + "'></span>");
    });
    View.Handlebars.registerHelper("mailto", function (address) {
        /* USAGE: {{mailto "address@example.com"}} */
        return new View.Handlebars.SafeString("<a href='mailto:" + address + "' onclick='window.preventWindowUnload()'>" + address + "</a>");
    });
    function clientLinkBind(target, appState, $root) {
        var app = Application.current;
        if (!app) {
            console.warn("clientLinkBind: no Application found");
            return;
        }
        var $element = View.findElement(target, $root);
        if ($element.is("a")) {
            $element.attr("href", app.stateManager.getStateUrl(appState));
        }
        var cmd = commands.createCommand({
            execute: function (args) {
                app.stateManager.applyState(args.appState);
            }
        });
        binding.commandBind($element, cmd, { appState: appState });
    }
    View.Handlebars.registerHelper("link", function (context, options) {
        if (arguments.length === 1) {
            options = context;
            context = null;
        }
        var markup = new View.HelperMarkup(options);
        /*
         USAGE:
         <a {{link part="UserInfo" area="admin" areaState="users" partOptions=(object type="User")}}>Go to</a>
         * */
        var hash = markup.getHash();
        var appState = {
            area: hash.area,
            areaState: {
                name: hash.areaState
            },
            regionState: {
                part: hash.part,
                partOptions: hash.partOptions
            }
        };
        View.addCallback(options.data, clientLinkBind, [markup.target, appState]);
        if (arguments.length === 1) {
            return markup.getHtml();
        }
        return new View.Handlebars.SafeString("<a " + markup.getHtml().toString() + ">" + context + "</a>");
    });
});
//# sourceMappingURL=core.js.map