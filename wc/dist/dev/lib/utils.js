/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "moment", "vendor/uuid", "i18n!lib/nls/resources"], function (require, exports, lang, moment, uuid, resources) {
    "use strict";
    /**
     * @exports utils
     */
    var utils = {
        reGuid: /\{?[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}\}?/,
        /**
         * Generate a new GUID in accordance with RFC4122 (http://www.ietf.org/rfc/rfc4122.txt) v1 (time-based)
         * @returns {String}
         */
        generateGuid: function () {
            return uuid();
        },
        /**
         * Generate a new GUID with simple algorithm (not actually globally unique).
         * @returns {String}
         */
        generateGuidSilly: function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        isGuid: function (v) {
            return this.reGuid.test(v);
        },
        toLowerCamel: function (s) {
            if (!s)
                return s;
            return s.charAt(0).toLowerCase() + s.slice(1);
        },
        toUpperCamel: function (s) {
            if (!s)
                return s;
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        Deferred: lang.Deferred,
        clear: function (obj) {
            for (var propName in obj) {
                if (obj.hasOwnProperty(propName)) {
                    delete obj[propName];
                }
            }
        },
        combinePaths: function (path1, path2) {
            if (!path1)
                return path2;
            if (!path2)
                return path1;
            var lastChar1 = path1.charAt(path1.length - 1), firstChar2 = path2.charAt(0);
            if (lastChar1 === "/" && firstChar2 === "/")
                return path1 + path2.slice(1);
            if (lastChar1 !== "/" && firstChar2 !== "/")
                return path1 + "/" + path2;
            return path1 + path2;
        },
        parseObject: function (anObj) {
            var vmField, vmFieldValue;
            for (vmField in anObj) {
                if (anObj.hasOwnProperty(vmField)) {
                    vmFieldValue = anObj[vmField];
                    if (typeof vmFieldValue === "string" &&
                        vmFieldValue.length > 0 &&
                        vmFieldValue.charAt(0) === "{" &&
                        vmFieldValue.charAt(vmFieldValue.length - 1) === "}") {
                        anObj[vmField] = lang.parseJsonString(vmFieldValue);
                    }
                }
            }
        },
        /**
         * @deprecated Use Part.mixOptions instead
         * @param staticOptions
         * @param options
         * @returns {*}
         */
        mergeOptions: function (staticOptions, options) {
            var ret = {}, field, copy, isArray, isPlainObj, clone;
            if (!staticOptions)
                return options ? options : ret;
            if (!options)
                return staticOptions ? staticOptions : ret;
            for (field in staticOptions) {
                if (options[field] !== undefined) {
                    // todo: deep copy or it's enough?
                    ret[field] = options[field];
                }
                else {
                    copy = staticOptions[field];
                    if (copy && ((isPlainObj = jQuery.isPlainObject(copy)) || (isArray = jQuery.isArray(copy)))) {
                        if (isPlainObj)
                            clone = {};
                        if (isArray)
                            clone = [];
                        ret[field] = $.extend(true, clone, copy);
                    }
                    else {
                        ret[field] = copy;
                    }
                }
            }
            return ret;
        },
        /**
         * Subscribe methods in options on all events of owner by convention:
         * If options has a method 'onXyz' then it will be subscribed on event 'xyz' of the owner.
         * @param {Observable} owner
         * @param {Object} options A plain object with fields like 'onXyz' which contain function
         * @param {Array|Object} events Array of event names or plain object whose values are event names
         */
        subscribeOnEvents: function (owner, options, events) {
            lang.forEach(events, function (name) {
                var method = options["on" + name];
                if (method && lang.isFunction(method)) {
                    owner.bind(name, method, owner);
                }
                // для событий, начинающих с маленькой буквы, имя обработчика может начинаться с большой
                // (т.е. для события xyz, могут быть обработчики onxyz и onXyz)
                var firstChar = name.charAt(0);
                if (firstChar.toUpperCase() !== firstChar) {
                    method = options["on" + utils.toUpperCamel(name)];
                    if (method && lang.isFunction(method)) {
                        owner.bind(name, method, owner);
                    }
                }
            });
        },
        /**
         * Format a number splitting position digits: 1234 => "1 234", "-12.2452"
         * @param {Number|string} val
         * @param {string} [separator] separator symbol for thousands (space by default)
         * @returns {string}
         */
        formatNumber: function (val, separator) {
            separator = separator || " ";
            var parts = val.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
            return parts.join(".");
        },
        /**
         *
         * @param {Number} v An integer value
         * @param {Array} forms Array with forms: 0 - форма "одно яблоко"; 1 - форма "два яблока"; 2 - форма "5 яблок"
         * @returns {String}
         */
        formatNumeral: function (v, forms) {
            var idx = (v % 10 == 1 && v % 100 != 11
                ? 0
                : v % 10 >= 2 && v % 10 <= 4 && (v % 100 < 10 || v % 100 >= 20)
                    ? 1 : 2);
            return forms[idx];
        },
        kilobyte: 1024,
        megabyte: 1024 * 1024,
        gigabyte: 1024 * 1024 * 1024,
        terabyte: 1024 * 1024 * 1024 * 1024,
        /**
         * Format size value as string with KBytes/MBytes/GBytes etc
         * @param {Number} size
         * @returns {string}
         */
        formatSize: function (size) {
            if (!lang.isNumber(size)) {
                return "";
            }
            var forms;
            // TBytes?
            if (size >= this.terabyte) {
                size = Math.round(size / this.terabyte);
                forms = resources.tbytesForms;
            }
            else if (size >= this.gigabyte) {
                size = Math.round(size / this.gigabyte);
                forms = resources.gbytesForms;
            }
            else if (size >= this.megabyte) {
                size = Math.round(size / this.megabyte);
                forms = resources.mbytesForms;
            }
            else if (size >= this.kilobyte) {
                size = Math.round(size / this.kilobyte);
                forms = resources.kbytesForms;
            }
            else {
                forms = resources.bytesForms;
            }
            return size + " " + utils.formatNumeral(size, forms);
        },
        formatDatetimeAgo: function (v) {
            var forms = resources["dayForms"];
            var MillisecondsPerDay = 86400000;
            var now = new Date();
            var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var dt;
            if (v instanceof Date) {
                dt = v;
            }
            else {
                var ticks = Date.parse(v);
                dt = new Date(ticks);
            }
            var dtMidnight = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()), days = (dtMidnight.valueOf() - todayMidnight.valueOf()) / MillisecondsPerDay, daysAbs = Math.abs(days), result;
            if (days >= 0 && days < 1) {
                result = resources["today"];
            }
            else if (days >= 1 && days < 2) {
                result = resources["tomorrow"];
            }
            else if (days < 0 && days >= -1) {
                result = resources["yesterday"];
            }
            else if (days < -1) {
                result = moment(v).format("DD.MM.YYYY") +
                    " (" + daysAbs + " " + utils.formatNumeral(daysAbs, forms) + " " + resources["ago"] + ")";
            }
            else {
                // future
                result = moment(v).format("DD.MM.YYYY") +
                    " (" + resources["time.in"] + " " + daysAbs + " " + utils.formatNumeral(daysAbs, forms) + ")";
            }
            return result + " " + resources["time.at"] + " " + moment(v).format("HH:mm:ss");
        },
        /**
         * Convert milliseconds value (number) into object with timespan parts (years, months, days, etc)
         * @param {Number} milliseconds
         * @param {String|String[]} format
         * @returns {Object}
         */
        splitDuration: function (milliseconds, format) {
            var supported = "yMdhms", duration, unit, result = {};
            if (typeof milliseconds !== "number")
                return;
            format = format || supported;
            // remove unsupported
            var formatParts = supported.split("").filter(function (a) {
                return format.indexOf(a) > -1;
            });
            duration = moment.duration(milliseconds);
            for (var i = 0; i < formatParts.length; i++) {
                var part = formatParts[i];
                unit = Math.floor(duration.as(part));
                duration.subtract(unit, part);
                result[part] = unit;
            }
            return result;
        },
        /**
         * Convert an object (key/value params) into query string (without leading "?")
         * @param {Object} params
         * @returns {string}
         */
        paramsToQueryString: function (params) {
            var urlParams = [];
            if (params) {
                Object.keys(params).forEach(function (key) {
                    var v = params[key];
                    if (v !== undefined) {
                        if (lang.isPlainObject(v)) {
                            v = JSON.stringify(v);
                        }
                        urlParams.push(key + "=" + v);
                    }
                });
            }
            return (urlParams.length) ? urlParams.join("&") : "";
        },
        /**
         * Extends object with supplied callback handling unloaded object
         * @param {Object} viewModel
         * @param {Function} extender
         * @returns {Object|jQuery.Deferred}
         */
        extendViewModel: function (viewModel, extender) {
            if (!viewModel) {
                throw new Error("extendViewModel: viewModel wasn't specified");
            }
            if (lang.support.isNotLoaded(viewModel)) {
                viewModel = viewModel.load();
            }
            return lang.async.then(viewModel, function (obj) {
                return extender(obj) || obj;
            });
        },
        /**
         * Parses key/value pairs string (like "key=value&key2=value2") into a json.
         * Value of guids are lower-cased.
         * @example
         * param1=val1&obj1.param1=val11&obj1.param2=val12&obj2.param1=val21
         * will become:
         * @code
         * {
         * 	 param1: val1,
         * 	 obj1: {
         *     param1: val11,
         * 	   param2: val12
         * 	 },
         * 	 obj2: {
         *     param1: val21
         *   }
         * }
         * @param {string} uriParams params as key=value pairs (keys can contain ".")
         * @return {Object} json representation of key/values
         */
        parseUriParams: function (uriParams) {
            var obj = {}, pairParts, propName, propValue, uuidRegexp = new RegExp("^[A-Z0-9]{8}-([A-Z0-9]{4}-){3}[A-Z0-9]{12}$", "i");
            uriParams.split("&").forEach(function (pair) {
                pairParts = pair.split("=");
                if (pairParts.length !== 2) {
                    return;
                }
                propName = pairParts[0];
                propValue = decodeURIComponent(pairParts[1]);
                if (uuidRegexp.test(propValue)) {
                    propValue = propValue.toLowerCase();
                }
                if (propName.indexOf(".") > 0) {
                    var nameParts_1 = propName.split("."), cnt_1 = 0, valueObj_1 = obj;
                    nameParts_1.forEach(function (namePart) {
                        if (cnt_1 === nameParts_1.length - 1) {
                            valueObj_1[namePart] = propValue;
                        }
                        else {
                            if (!valueObj_1.hasOwnProperty(namePart)) {
                                valueObj_1 = valueObj_1[namePart] = {};
                            }
                            else {
                                valueObj_1 = valueObj_1[namePart];
                            }
                        }
                        cnt_1++;
                    });
                }
                else {
                    obj[propName] = propValue;
                }
            });
            return obj;
        },
        /**
         * Build string representation for the params object.
         * @example
         * Object
         * @code
         * {
         * 	 param1: val1,
         * 	 obj1: {
         *     param1: val11,
         * 	   param2: val12
         * 	 },
         * 	 obj2: {
         *     param1: val21
         *   }
         * }
         * becomes "param1=val1&obj1.param1=val11&obj1.param2=val12&obj2.param1=val21"
         * @param {Object} paramsObj input object
         * @param {String} [prefix] string to prefix all param names
         * @return {String} string representation of the input object in the format that can be used in url
         */
        buildUriParams: function (paramsObj, prefix) {
            var str = "";
            prefix = prefix || "";
            if (!paramsObj) {
                return str;
            }
            for (var key in paramsObj) {
                if (Object.prototype.hasOwnProperty.call(paramsObj, key)) {
                    var val = paramsObj[key];
                    if (val != null && val !== undefined) {
                        var fullKey = prefix ? (prefix + "." + key) : key;
                        if (lang.isObject(val)) {
                            if (lang.isPlainObject(val)) {
                                str = str + "&" + utils.buildUriParams(val, fullKey);
                            }
                        }
                        else {
                            if (val === null || val === undefined) {
                                val = "";
                            }
                            str = str + "&" + fullKey + "=" + val;
                        }
                    }
                }
            }
            return str.slice(1);
        }
    };
    return utils;
});
//export default utils;
//# sourceMappingURL=utils.js.map