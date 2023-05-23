/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "underscore", "big"], function (require, exports, $, _, Big) {
    "use strict";
    exports.__esModule = true;
    // Set defaultFieldProxying depending on whether the browser supports ES5 properties
    var supportsES5props;
    if (typeof Object.defineProperty === "function") {
        try {
            var obj = {};
            Object.defineProperty(obj, "a", {
                get: function () { return 1; }
            });
            supportsES5props = (obj.a === 1);
        }
        catch (ex) {
            // supportsES5props = false;
        }
    }
    function traverseObjectImpl(object, visitor, options, path) {
        path = path || [];
        return exports.some(object, function (value, name) {
            var needBreak;
            if (isPlainObject(value)) {
                path.push(name);
                needBreak = traverseObjectImpl(value, visitor, options, path);
                path.pop();
                if (needBreak) {
                    return true;
                }
                if (options.visitObjects &&
                    visitor(name, value, path, object, /*isObject=*/ true)) {
                    return true;
                }
            }
            else if (value === null || value === undefined || exports.isString(value) || exports.isNumber(value) || exports.isBoolean(value)) {
                if (options.visitValues &&
                    visitor(name, value, path, object, /*isObject=*/ false)) {
                    return true;
                }
            }
        });
    }
    function noop() { }
    exports.noop = noop;
    function forEach(obj, iterator, context) {
        if (obj == null) {
            return;
        }
        return obj.forEach ? obj.forEach(iterator, context) : _.forEach(obj, iterator, context);
    }
    exports.forEach = forEach;
    exports.every = _.every;
    exports.some = _.some;
    exports.clone = _.clone;
    exports.first = _.first;
    exports.last = _.last;
    exports.unique = _.unique;
    function contains(obj, val) { return _.contains(obj, val); }
    exports.contains = contains;
    // Firefox has native implementation, but it is experimental
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    exports.find = _.find;
    // Firefox has native implementation, but it is experimental
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    function findIndex(obj, predicate, context) {
        var index = -1;
        exports.some(obj, function (item, i, list) {
            if (predicate.call(context, item, i, list)) {
                index = i;
                return true;
            }
        });
        return index;
    }
    exports.findIndex = findIndex;
    /**
     * Traverse all object value calling supplied iterator for each value.
     * @param {object} object A simple object to traverse
     * @param {Function} visitor Iterator with signature: function ({String} name, {*} value, {Array} path)
     * @param {object} [options]
     * @param {boolean} [options.visitObjects=false]
     * @param {boolean} [options.visitValues=true]
     */
    function traverseObject(object, visitor, options) {
        options = options || { visitObjects: false, visitValues: true };
        return traverseObjectImpl(object, visitor, options);
    }
    exports.traverseObject = traverseObject;
    /**
     * Create a copy of an object or an array
     * @param {object} obj
     * @param {object} [options]
     * @param {boolean} [options.deep] Clone nested values
     * @param {boolean} [options.exact] Copy undefined values
     * @returns {object} New object or array
     */
    function cloneEx(obj, options) {
        if (!isClonable(obj)) {
            return obj;
        }
        return extendEx(exports.isArray(obj) ? [] : {}, obj, options);
    }
    exports.cloneEx = cloneEx;
    /**
     * Extend an object with all values from one or more source
     * @param {object} obj
     * @param {...object} sources
     * @returns {object} obj
     */
    function extend(obj) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            forEach(source, function (v, name) {
                if (v !== undefined) {
                    obj[name] = v;
                }
            });
        });
        return obj;
    }
    exports.extend = extend;
    /**
     * Extend an object with all values from one or more source
     * @param {object} obj
     * @param {...object} sources
     * @param {object} options
     * @param {boolean} [options.deep] Process nested values
     * @param {boolean} [options.exact] Copy undefined values
     * @returns {object} obj
     */
    function extendEx(obj) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        var options = sources[sources.length - 1] || {}; // last argument is options
        for (var i = 0; i < sources.length - 1; i++) {
            var source = sources[i];
            if (exports.isArray(source) && exports.isArray(obj)) {
                obj.length = 0; // overwrite arrays
            }
            // if the object provides its own clone method then delegate to it
            if (source && source.clone && exports.isFunction(source.clone)) {
                source = source.clone();
                forEach(source, function (v, name) {
                    obj[name] = v;
                });
                continue;
            }
            forEach(source, function (v, name) {
                if (v === undefined && !options.exact) {
                    return;
                }
                if (options.except && options.except.indexOf(name) >= 0) {
                    return;
                }
                if (!options.deep || !isClonable(v)) {
                    obj[name] = v;
                }
                else {
                    // NOTE: merge objects, but overwrite arrays
                    var o = exports.isArray(v) ? [] : (obj[name] || {});
                    obj[name] = extendEx(o, v, options);
                }
            });
        }
        return obj;
    }
    exports.extendEx = extendEx;
    /**
     * @deprecated Use extendEx method
     */
    function deepExtend() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.push({ deep: true });
        return extendEx.apply(this, args);
    }
    exports.deepExtend = deepExtend;
    /**
     * @deprecated Use extendEx method
     */
    function exactExtend() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.push({ deep: true, exact: true });
        return extendEx.apply(this, args);
    }
    exports.exactExtend = exactExtend;
    function append(obj) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            forEach(source, function (v, name) {
                if (v !== undefined && obj[name] === undefined) {
                    obj[name] = v;
                }
            });
        });
        return obj;
    }
    exports.append = append;
    /**
     * Append values from one or more source to an object
     * @param {object} obj
     * @param {...object} sources
     * @param {object} [options]
     * @param {boolean} [options.deep] Process nested values
     * @param {boolean} [options.exact] Append undefined values
     * @returns {object} obj
     */
    function appendEx(obj) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        var options = sources[sources.length - 1] || {}; // last argument is options
        for (var i = 0; i < sources.length - 1; i++) {
            var source = sources[i];
            if (exports.isArray(source) && exports.isArray(obj)) {
                continue;
            } // do not merge arrays
            forEach(source, function (v, name) {
                if (v === undefined && !options.exact) {
                    return;
                }
                if (options.except && options.except.indexOf(name) >= 0) {
                    return;
                }
                var o = obj[name];
                if (o === undefined) {
                    if (!options.deep || !isClonable(v)) {
                        obj[name] = v;
                    }
                    else {
                        obj[name] = cloneEx(v, options);
                    }
                }
                else if (options.deep && isPlainObject(o)) {
                    appendEx(o, v, options);
                }
            });
        }
        return obj;
    }
    exports.appendEx = appendEx;
    /**
     * @deprecated Use appendEx method
     */
    function deepAppend() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.push({ deep: true });
        return this.appendEx.apply(this, args);
    }
    exports.deepAppend = deepAppend;
    /**
     * Assign specified field in obj or a new object.
     * @param {object} obj
     * @param {string} propName
     * @param {*} propValue
     * @returns {object} enriched obj or new object with assigned value
     */
    function setValue(obj, propName, propValue) {
        obj = obj || {};
        obj[propName] = propValue;
        return obj;
    }
    exports.setValue = setValue;
    /**
     * Overrides some methods of the object.
     * @param {object} obj
     * @param {object} overrides
     * @returns {object} obj
     * @example
     * var obj = {
     *     sayHello: function (name) { console.log("Hello, " + name + "!"); }
     * };
     * lang.override(obj, {
     *     sayHello: function (base, name) {
     *         // first argument is the original method
     *         // others are the arguments passed to the function by a caller
     *         base.call(this, "dear " + name);
     *     }
     * });
     * obj.sayHello("user"); // prints "Hello, dear user!"
     */
    function override(obj, overrides) {
        forEach(overrides, function (wrapper, name) {
            var base = obj[name];
            obj[name] = function () {
                var args = [base];
                args.push.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        });
        return obj;
    }
    exports.override = override;
    exports.difference = _.difference;
    exports.groupBy = _.groupBy;
    /**
     * Return the results of applying the iterator to the object or each item of array.
     * @param {Array|object} obj
     * @param {Function} iterator
     * @param {object} context
     */
    function select(obj, iterator, context) {
        return exports.isArray(obj) ? obj.map(iterator, context) : iterator.call(context, obj);
    }
    exports.select = select;
    // String
    /**
     * Checks whether value in 'source' argument starts with value in 'search' argument.
     * @param {string} source Source string to search in
     * @param {string} search Substring to search for
     * @return {boolean} true if source's value starts with search value.
     */
    function stringStartsWith(source, search) {
        if (!source || !search)
            return false;
        return source.slice(0, search.length) === search;
    }
    exports.stringStartsWith = stringStartsWith;
    function stringEndsWith(source, search) {
        if (!source || !search)
            return false;
        return source.slice(-search.length) === search;
    }
    exports.stringEndsWith = stringEndsWith;
    function encodeHtml(str, whitespaces) {
        if (str == null) {
            return "";
        }
        // str = _.escape(str);
        str = str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;");
        if (whitespaces) {
            str = str.replace(/ /g, "&nbsp;").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        }
        return str;
    }
    exports.encodeHtml = encodeHtml;
    function decodeHtml(str) {
        if (str == null) {
            return "";
        }
        // return _.unescape(str);
        return str.toString()
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&nbsp;/g, " ");
    }
    exports.decodeHtml = decodeHtml;
    /**
     * Extracts text from html
     * @param html
     * @returns {any}
     */
    function htmlText(html) {
        if (!html) {
            return "";
        }
        var text = html.replace(/<(?:.|\n)*?>/gm, "");
        return decodeHtml(text);
    }
    exports.htmlText = htmlText;
    function stringFormat(format) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return format.replace(/\{\{|\}\}|\{(\d+)\}/g, function (curlyBrack, index) {
            return ((curlyBrack === "{{") ? "{" : ((curlyBrack === "}}") ? "}" : args[index]));
        });
    }
    exports.stringFormat = stringFormat;
    // Arrays and Collections
    /**
     * Returns an array of its arguments.
     * Unlike Array#concat this method appends array items whole.
     * Use this method via apply to make an array from arguments object for better performance:
     * @example
     * function foo() {
     *     var args = lang.concat.apply(null, arguments);
     * }
     * @param {...*} args
     * @returns {Array}
     */
    function concat() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args;
    }
    exports.concat = concat;
    /**
     * Returns an array of its arguments except the last one.
     * Unlike Array#concat this method appends array items whole.
     * Use this method via apply to make an array from arguments object for better performance:
     * @example
     * function foo() {
     *     var args = lang.concatExceptLast.apply(null, arguments);
     * }
     * @param {...*} args
     * @returns {Array}
     */
    function concatExceptLast() {
        var l = arguments.length - 1, i, args = [];
        for (i = 0; i < l; i++) {
            args[i] = arguments[i];
        }
        return args;
    }
    exports.concatExceptLast = concatExceptLast;
    /**
     * Append one array to another. Not using Array.prototype.push.apply, as it may cause stack overflow
     * @param arrTarget - array to be expanded
     * @param arrSource - source array or single element to append to target array
     */
    function arrayAppend(arrTarget, arrSource) {
        var initLength = arrTarget.length, srcLen = arrSource.length;
        arrTarget.length += srcLen;
        for (var i = 0; i < srcLen; i++) {
            arrTarget[i + initLength] = arrSource[i];
        }
        return arrTarget;
    }
    exports.arrayAppend = arrayAppend;
    function array(value) {
        return exports.isArray(value) ? value : [value];
    }
    exports.array = array;
    function arrayRemove(array, item) {
        var idx = array.indexOf(item); // Find the index
        if (idx !== -1) {
            array.splice(idx, 1);
            return true;
        }
        return false;
    }
    exports.arrayRemove = arrayRemove;
    /**
     * @deprecated Use 'find' method instead
     * @param array
     * @param finder
     * @returns {*}
     */
    function arrayFindFirst(array, finder) {
        var i, length = array.length, item;
        for (i = 0; i < length; i += 1) {
            item = array[i];
            if (finder(item)) {
                return item;
            }
        }
    }
    exports.arrayFindFirst = arrayFindFirst;
    /**
     * @deprecated Use 'last' method instead
     * @param stack
     * @returns {*}
     */
    function stackTop(stack) {
        return stack && stack.length ? stack[stack.length - 1] : undefined;
    }
    exports.stackTop = stackTop;
    /**
     * Returns the first non-undefined value among arguments.
     * @param {...*} args
     */
    function coalesce() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return exports.find(args, function (v) {
            return v !== undefined;
        });
    }
    exports.coalesce = coalesce;
    // Functions
    exports.uuid = _.uniqueId;
    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered.
     * The function will be called after it stops being called for N milliseconds.
     * @param {Function|string} func - The original function or the name of original method
     * @param {number} wait - Timeout in milliseconds
     * @param {string|boolean} field - If specified the result function will behave like a method of a caller
     * and will be called after it stops being called by the same caller for N milliseconds. In that case
     * a timer will be stored in the field of a caller. If 'field' is a string it specifies* the name of the field
     * to keep a timer; otherwise the name will be generated automatically.
     * If 'field' argument isn't specified the result function will be 'static' and will be called after it stops
     * being called by any caller for N milliseconds.
     * @returns {Function}
     */
    function debounce(func, wait, field) {
        var timeout;
        if (!field) {
            return function () {
                var that = this, args = arguments;
                var throttler = function () {
                    timeout = null;
                    var method = exports.isFunction(func) ? func : that[func];
                    method.apply(that, args);
                };
                window.clearTimeout(timeout);
                timeout = window.setTimeout(throttler, wait);
            };
        }
        else {
            if (!exports.isString(field)) {
                field = "_timeout_" + (exports.isString(func) ? func : exports.uuid("debounced"));
            }
            return function () {
                var that = this, args = arguments;
                var throttler = function () {
                    that[field] = null;
                    var method = exports.isFunction(func) ? func : that[func];
                    method.apply(that, args);
                };
                window.clearTimeout(that[field]);
                that[field] = window.setTimeout(throttler, wait);
            };
        }
    }
    exports.debounce = debounce;
    // Type checking
    exports.isArray = Array.isArray;
    exports.isObject = _.isObject;
    exports.isFunction = _.isFunction;
    exports.isString = _.isString;
    exports.isNumber = _.isNumber;
    exports.isBoolean = _.isBoolean;
    exports.isDate = _.isDate;
    exports.isRegExp = _.isRegExp;
    exports.isEmpty = _.isEmpty;
    exports.isEmptyObject = $.isEmptyObject;
    function isNullOrEmpty(v) {
        return v == null || v === "";
    }
    exports.isNullOrEmpty = isNullOrEmpty;
    function isInteger(v) {
        return this.isNumber(v) && (v % 1 == 0);
    }
    exports.isInteger = isInteger;
    function isPlainObject(obj) {
        // NOTE: IE8 (and earlier) don't have native Object.getPrototypeOf method,
        // but the 'es5-sham' provides good implementation of it
        return exports.isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    }
    exports.isPlainObject = isPlainObject;
    function isClonable(obj) {
        return isPlainObject(obj) || exports.isArray(obj);
    }
    exports.isClonable = isClonable;
    function isDisposable(obj) {
        return obj && exports.isFunction(obj.dispose);
    }
    exports.isDisposable = isDisposable;
    function isError(obj) {
        if (!exports.isObject(obj)) {
            return false;
        }
        var tag = Object.prototype.toString.call(obj);
        return tag === "[object Error]" || tag === "[object DOMException]" ||
            (typeof obj.message === "string" && typeof obj.name === "string" && !isPlainObject(obj));
    }
    exports.isError = isError;
    // Perform a deep comparison to check if two objects are equal.
    exports.isEqual = _.isEqual;
    /**
     * Compare two values for sorting. You can pass this method as an argument of Array.prototype.sort().
     * @param x
     * @param y
     * @returns {number}
     */
    function compare(x, y) {
        if (x === y) {
            return 0;
        }
        // null and undefined are always less than any other value
        if (x === undefined) {
            return -1;
        }
        if (y === undefined) {
            return 1;
        }
        if (x === null) {
            return -1;
        }
        if (y === null) {
            return 1;
        }
        if (x instanceof Big || y instanceof Big) {
            x = x instanceof Big ? x : new Big(x);
            y = y instanceof Big ? y : new Big(y);
            return x.cmp(y);
        }
        // compare different types as strings
        if (typeof x !== typeof y) {
            x = x.toString();
            y = y.toString();
        }
        if (x < y) {
            return -1;
        }
        if (y < x) {
            return 1;
        }
        return 0;
    }
    exports.compare = compare;
    /**
     * Sorts an array's element. Unlike Array.prototype.sort(), doesn't modify an original array.
     * Uses stable sorting (unlike Array.prototype.sort()).
     * @param {Array} array an array to sort
     * @param {Function} [comparer] comparison function a-la Array.prototype.sort()
     * @returns {Array} new array
     */
    function sort(array, comparer) {
        comparer = comparer || compare;
        return array.map(function (value, index) {
            return { value: value, index: index };
        }).sort(function (x, y) {
            // NOTE: 0 mean x and y are equal, if so order will be determined by their indexes
            return comparer(x.value, y.value) || (x.index - y.index);
        }).map(function (item) {
            return item.value;
        });
    }
    exports.sort = sort;
    /**
     * Sorts an array's element by a criterion produced by an iterator.
     * Uses stable sorting.
     * @param {Array} array an array to sort
     * @param {Function} iterator function that returns the value to compare
     * @param {*} [context] 'this' argument for calling iterator
     * @returns {Array} new array
     */
    exports.sortBy = _.sortBy;
    // Conversions
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    function toInteger(n) {
        n = +n;
        if (n !== n) {
            n = 0;
        }
        else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 ? 1 : -1) * Math.floor(Math.abs(n));
        }
        return n;
    }
    exports.toInteger = toInteger;
    // Deferred
    //
    exports.Deferred = $.Deferred;
    exports.deferred = $.Deferred;
    /**
     * jQuery Promise
     * @typedef {Deferred|jQuery.Deferred} Promise
     * @global
     */
    /**
     * jQuery Promise
     * @typedef {Deferred|jQuery.Deferred} jQuery.Promise
     * @global
     */
    exports.when = $.when;
    function whenAll() {
        // NOTE: roll out arrays in arguments
        return $.when.apply($, Array.prototype.concat.apply([], arguments));
    }
    exports.whenAll = whenAll;
    function resolved() {
        var d = exports.deferred();
        d.resolve.apply(d, arguments);
        return d.promise();
    }
    exports.resolved = resolved;
    function rejected() {
        var d = exports.deferred();
        d.reject.apply(d, arguments);
        return d.promise();
    }
    exports.rejected = rejected;
    /**
     * Is obj a JQuery 1.x Promise/Deferred object?
     * IMPORTANT: it will return false for native promises.
     * @param {any} obj object to test
     * @return {boolean}
     */
    function isPromise(obj) {
        // native Promise or JQuery promise
        // TODO: все равно не будет работать, т.к. для промисов ожидаются методы fail, done, которых нет в Promise/A+
        // TODO: return Object.prototype.toString.call(obj) === "[object Promise]" ||
        return obj && obj.done && obj.then && obj.fail && obj.promise;
    }
    exports.isPromise = isPromise;
    /**
     * If the Deferred is already resolved, this method returns the value passed as the first argument of
     * Deferred.resolve(). Otherwise it returns undefined.
     * @param deferred
     * @return {*}
     */
    function resolvedValue(deferred) {
        if (!isPromise(deferred)) {
            return deferred;
        }
        var v;
        if (deferred.state() === "resolved") {
            deferred.done(function (r) { v = r; });
        }
        return v;
    }
    exports.resolvedValue = resolvedValue;
    function parseJsonString(str) {
        if (!str || typeof str !== "string") {
            return null;
        }
        str = str.trim();
        if (!str) {
            return null;
        }
        var normalized = str;
        // replace 'text' => "text" (NOTE: JSON specification supports only double quotes)
        normalized = normalized.replace(/'([^']*)'\s*:/g, "\"$1\":");
        // wrap key names into double quotes
        normalized = normalized.replace(/([^"{\s,:]+)\s*:/g, '"$1":');
        // replace 'text' => "text" (NOTE: JSON specification supports only double quotes)
        normalized = normalized.replace(/:\s*'([^']*)'/g, ": \"$1\"");
        // wrap into {}: "prop": "value" => {"prop": "value"}
        normalized = normalized.replace(/^([^{][^:]*:.*[^}])$/g, "{$1}");
        return normalized ? JSON.parse(normalized) : {};
    }
    exports.parseJsonString = parseJsonString;
    function observe(obj) {
        if (Observable.isObservable(obj)) {
            return obj;
        }
        if (exports.isArray(obj)) {
            return new ObservableCollection(obj);
        }
        if (exports.isObject(obj)) {
            var observable_1 = new Observable();
            forEach(obj, function (value, key) {
                if (!exports.isFunction(value)) {
                    observable_1.declareProp(key, value);
                }
                else {
                    observable_1[key] = value;
                }
            });
            return observable_1;
        }
        return obj;
    }
    exports.observe = observe;
    /**
     * Возвращает значение свойства name у объекта obj. Если у объекта obj есть метод с именем name,
     * то вернется результат вызова этого метода; иначе вернется поле с именем name.
     * @param obj
     * @param name
     * @return {*}
     */
    function get(obj, name) {
        var v = obj[name];
        return typeof v === "function" ? v.call(obj) : v;
    }
    exports.get = get;
    function set(obj, name, value) {
        var v = obj[name];
        if (typeof v === "function") {
            v.call(obj, value);
        }
        else {
            obj[name] = value;
        }
    }
    exports.set = set;
    /**
     * Возвращает функцию доступа к свойству с наименованием name. Если у объекта this есть метод с именем name,
     * то будет использоваться этот метод; иначе будет использоваться поле с именем name.
     * @param name
     * @return {Function}
     */
    function property(name) {
        return function () {
            var v = this[name];
            if (typeof v === "function") {
                return v.apply(this, arguments);
            }
            else if (arguments.length) {
                this[name] = arguments[0];
            }
            else {
                return v;
            }
        };
    }
    exports.property = property;
    /**
     * Получает вложенное значение по пути от корневого объекта/пространства имен.
     * @param root {object}
     * @param path {string}
     */
    function nested(root, path) {
        forEach(path.split("."), function (propName) {
            root = root[propName];
        });
        return root;
    }
    exports.nested = nested;
    function unlazy(v) {
        if (!exports.isFunction(v)) {
            return v;
        }
        else if (arguments.length === 1) {
            return v();
        }
        else {
            var factoryArgs = [];
            for (var i = 1; i < arguments.length; i++) {
                factoryArgs[i - 1] = arguments[i];
            }
            return v.apply(undefined, factoryArgs);
        }
    }
    exports.unlazy = unlazy;
    function __prototypeOf(obj) {
        return obj && exports.isFunction(obj) ? obj.prototype : obj;
    }
    function __mixin(obj, extension, override) {
        // NOTE: Don't use for-in operator (or lang.extend, _.append etc. based on for-in)
        // because of "DontEnum" bug in IE<9. Object.keys implementation in es5-shim.js has a workaround
        // for this bug, so we should use Object.keys method.
        Object.keys(extension).forEach(function (prop) {
            var ignore = override === "never" ? prop in obj :
                override === "inherited" ? obj.hasOwnProperty(prop) :
                    false;
            if (!ignore) {
                obj[prop] = extension[prop];
            }
        });
    }
    /**
     * Базовый класс для обеспечения обратной совместимости с lang.Class
     */
    var CoreClass = /** @class */ (function () {
        function CoreClass() {
        }
        // Такая декларация правильней, но не работает для абстрактных миксинов:
        // Cannot assign an abstract constructor type to a non-abstract constructor type.
        // static mixin<T>(extension: T|Constructor<T>) {
        /**
         * Добавляет члены в текущий класс
         */
        CoreClass.mixin = function (extension, override) {
            __mixin(this.prototype, __prototypeOf(extension), override);
            return this;
        };
        /**
         * Создает наследника от класса
         */
        CoreClass.extend = function (body) {
            return exports.Class(this, body);
        };
        /**
         * Добавляет статические методы к классу
         */
        CoreClass.shared = function (body) {
            __mixin(this, body, "always");
            return this;
        };
        /**
         * Создает экземпляр класса
         */
        CoreClass.create = function () {
            // !ugly hack! for more information see:
            // http://www.bennadel.com/blog/2291-Invoking-A-Native-JavaScript-Constructor-Using-Call-Or-Apply-.htm
            var ctor = this, obj = Object.create(ctor.prototype);
            return ctor.apply(obj, arguments) || obj;
        };
        return CoreClass;
    }());
    exports.CoreClass = CoreClass;
    /**
     * @type Function
     */
    exports.Class = function () {
        var 
        // базовый тип
        parent = arguments.length > 1 ? arguments[0] : null, 
        // объект, описывающий свойства класса
        body = arguments[arguments.length - 1] || {}, ctor = body.constructor;
        if (ctor === Object) {
            ctor = body.constructor = function () { };
        }
        if (!parent) {
            // если базовый класс не задан, то прототипом будет сам объект, описывающий свойства класса
            ctor.prototype = body;
        }
        else {
            // если задан базовый класс, то создадим наследника прототипа...
            ctor.prototype = Object.create(__prototypeOf(parent));
            // ... и скопируем туда все свойства
            __mixin(ctor.prototype, body, "always");
            // добавляем статическое свойство Super для доступа к базовому классу
            ctor.Super = parent;
            // добавляем статические члены из базового класса
            __mixin(ctor, parent, "never");
        }
        // добавляем члены других классов
        if (arguments.length > 2) {
            for (var i = 1; i < arguments.length - 1; i++) {
                __mixin(ctor.prototype, __prototypeOf(arguments[i]), "never");
            }
        }
        // добавляем статические методы
        __mixin(ctor, CoreClass, "never");
        return ctor;
    };
    /**
     * Creates an instance of the class by name.
     * @param {object} [rootNamespace=lang.Class.rootNamespace] A 'namespace' object.
     * If null lang.Class.rootNamespace will be used by default.
     * @param {string} fullClassName
     * @param {...*} args arguments for constructor
     * @returns {*}
     */
    exports.Class.create = function (rootNamespace, fullClassName) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (arguments.length < 2) {
            throw new Error("lang.Class.create: expects at least two parameters: root namespace and class name");
        }
        var target = nested(rootNamespace || exports.Class.rootNamespace, fullClassName);
        if (!target) {
            throw new Error("lang.Class.create: cannot find class '" + fullClassName + "'");
        }
        if (!target.create) {
            throw new Error("lang.Class.create: found " + fullClassName + " but it doesn't look like a Class");
        }
        return target.create.apply(target, args);
    };
    // Common classes
    //
    // Concurrency
    var CountdownEvent = /** @class */ (function (_super) {
        __extends(CountdownEvent, _super);
        /**
         * @constructs CountdownEvent
         * @param left
         * @param onComplete
         */
        function CountdownEvent(left, onComplete) {
            var _this = _super.call(this) || this;
            _this.left = left;
            _this.onComplete = onComplete;
            return _this;
        }
        CountdownEvent.prototype.signal = function () {
            var that = this;
            if (that.left === 0) {
                throw new Error("CountdownEvent.signal: countdown object has been already signaled");
            }
            that.left -= 1;
            if (that.left === 0 && that.onComplete) {
                that.onComplete();
            }
        };
        CountdownEvent.prototype.dispose = function () {
            this.left = -1;
            this.onComplete = undefined;
        };
        return CountdownEvent;
    }(CoreClass));
    exports.CountdownEvent = CountdownEvent;
    /**
     * Don't copy this method to lang.Observable.prototype, or lang.proxy will break.
     * @static
     * @param {Observable} obj
     * @param {string} name
     * @param {*} v
     * @param field
     * @return {boolean} true if current value was changed (that also means that "change" events were fired)
     */
    function __set(obj, name, v, field) {
        var old = obj[field], args = { prop: name, value: v, oldValue: old, reason: "change" }, changed = !exports.isEqual(v, old);
        if (changed) {
            obj[field] = v;
            obj.trigger("change:" + name, obj, v, old);
            obj.trigger("change", obj, args);
        }
        obj.trigger("set", obj, args);
        return changed ? args : undefined;
    }
    /**
     * Don't copy this method to lang.Observable.prototype, or lang.proxy will break.
     * @static
     * @param {Observable} obj
     * @param {string} name
     * @param {*} v
     * @returns {*} Value of v
     */
    function __get(obj, name, v) {
        obj.trigger("get", obj, { prop: name, value: v });
        return v;
    }
    var Observable = /** @class */ (function (_super) {
        __extends(Observable, _super);
        /**
         * Объект, от которого наследуют компоненты для поддержки событий
         * @constructs Observable
         */
        function Observable() {
            var _this = _super.call(this) || this;
            _this._callbacks = {};
            var observables = _this["__observableProps"];
            if (observables) {
                forEach(observables, function (init, field) {
                    _this[field] = init;
                });
            }
            return _this;
        }
        /**
         * Подписывает обработчик callback на событие eventName. Если задан параметр context, то обработчик
         * будет вызван в контексте этого объекта (т.е. context будет выступать в качестве this). Если context
         * не задан, то обрабочик будет вызываться в контексте текущего observable-объекта.
         * @param {string} eventName
         * @param {Function} callback
         * @param {object} [context]
         * @return {*}
         */
        Observable.prototype.bind = function (eventName, callback, context) {
            var calls = this._callbacks || (this._callbacks = {}), list = calls[eventName] || (calls[eventName] = []);
            list.push({ callback: callback, ctx: context });
            return this;
        };
        /**
         * Отписывает обработчик callback от события eventName. Обработчик отписывается, только если он был подписан
         * с тем же значением параметра context.
         * Если задано только eventName, то от события eventName отписываются все подписанные обработчики.
         * Если не заданы eventName, callback и context, то все подписанные обработчики отписываются от всех событий.
         * Если заданы eventName и context, то от события eventName отписываются все обработчики контекста.
         * Если задан только context, то отписываются все обработчики контекста от всех событий.
         * @param {string} [eventName]
         * @param {Function} [callback]
         * @param {object} [context]
         * @return {*}
         */
        Observable.prototype.unbind = function (eventName, callback, context) {
            var that = this, calls, list, i, l, item;
            if (!eventName && !callback && !context) {
                this._callbacks = {};
            }
            else if (calls = this._callbacks) {
                if (!callback && !context) {
                    delete calls[eventName];
                }
                else if (!eventName) {
                    // unbind callback/context from all events
                    forEach(Object.keys(calls), function (eventName) {
                        that.unbind(eventName, callback, context);
                    });
                }
                else if (list = calls[eventName]) {
                    for (i = 0, l = list.length; i < l; i++) {
                        item = list[i];
                        if (item.ctx === context &&
                            (callback && item.callback === callback || !callback)) {
                            if (--l) {
                                list.splice(i, 1);
                                i--;
                            }
                            else {
                                delete calls[eventName];
                            }
                            if (callback)
                                break;
                        }
                    }
                }
            }
            return this;
        };
        /**
         * Подписывает обработчик callback на событие eventName и возвращает disposable объект, который
         * отписывает этот обработчик в методе dispose.
         * Метод аналогичен методу bind, но возвращает disposable объект, который выполняет unbind.
         * @param {string} eventName
         * @param {Function} callback
         * @param {object} [context]
         * @return {object} Disposable объект, в методе dispose которого выполняется отписка
         * обработчика (unbind).
         */
        Observable.prototype.subscribe = function (eventName, callback, context) {
            var that = this;
            that.bind(eventName, callback, context);
            return {
                dispose: function () {
                    that.unbind(eventName, callback, context);
                }
            };
        };
        /**
         * Возбуждает событие eventName, вызывая все подписанные на него обработчики.
         * Все аргументы метода, кроме первого (eventName), передаются в обработчики.
         * @param {string} eventName
         * @param {...object} args
         * @return {*}
         */
        Observable.prototype.trigger = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var calls, list, i, l, item;
            if (calls = this._callbacks) {
                if (list = calls[eventName]) {
                    // NOTE: Вызываемые обработчики могут подписать или отписать что-нибудь, при этом список list
                    // изменится. Чтобы избежать конфликтов, клонируем список.
                    list = list.slice();
                    for (i = 0, l = list.length; i < l; i++) {
                        item = list[i];
                        item.callback.apply(item.ctx || this, args);
                    }
                }
            }
            return this;
        };
        /**
         * Проверяет, что на событие eventName подписан хотя бы один обработчик.
         * Если имя события не задано, то проверяет, что хотя бы один обработчик подписан на любое событие.
         * @param {string} eventName
         * @return {boolean}
         */
        Observable.prototype.bound = function (eventName) {
            var calls = this._callbacks;
            if (calls) {
                return eventName ? !!calls[eventName] : !exports.isEmptyObject(calls);
            }
            return false;
        };
        Observable.prototype.get = function (name) {
            var that = this, v = that[name];
            if (typeof v === "function") {
                return v.call(that);
            }
            return __get(that, name, v);
        };
        /**
         * Getter for implementing ObservableProperty manually.
         * Should be called `this._get(this, "name_of_prop");`
         * @param {Observable} that Current object
         * @param {string} name Name of property
         * @param {string} [field] Optional field name (if not specifed than "_$name" will be used
         * @returns {*}
         * @protected
         */
        Observable._get = function (that, name, field) {
            // NOTE: DO NOT USE `this` inside!
            var v = that[field || ("_" + name)];
            return __get(that, name, v);
        };
        Observable.prototype.set = function (name, v) {
            var that = this, old = that[name];
            if (typeof old === "function") {
                return old.call(that, v);
            }
            __set(that, name, v, name);
        };
        /**
         * Setter for implementing ObservableProperty manually.
         * Should be called `this._set(this, "name_of_prop", v);`
         * @param {Observable} that Current object
         * @param {string} name Name of property
         * @param v Prop value to be set
         * @param {string} [field] Optional field name (if not specifed than "_$name" will be used
         * @protected
         */
        Observable._set = function (that, name, v, field) {
            // NOTE: DO NOT USE `this` inside!
            return __set(that, name, v, field || ("_" + name));
        };
        /**
         * Trigger 'change' and 'change:prop' events to notify that the property was previously changed
         * @param {string} name the name of the changed property
         */
        Observable.prototype.changed = function (name) {
            var that = this, v = that[name];
            if (typeof v === "function") {
                v = v.call(that);
            }
            that.trigger("change:" + name, that, v, v);
            that.trigger("change", that, { prop: name, value: v, oldValue: v, reason: "change" });
        };
        Observable.prototype.dispose = function () {
            this.unbind();
        };
        Observable.prototype.declareProp = function (name, initial) {
            var field = "_" + name;
            this[field] = initial;
            this[name] = Observable.accessor(name, field);
        };
        Observable.isObservable = function (obj) {
            return obj && obj.bind && obj.unbind && obj.trigger;
        };
        /**
         * Get a value of `name` property whatever it is field, function-property or ObserableProperty.
         * If `name` is field/ObserableProperty when fires "get" Observable's event.
         * @param {*} obj Any object with `name` field
         * @param {string} name Name of property to get
         * @returns {*}
         */
        Observable.get = function (obj, name) {
            var v = obj[name];
            if (typeof v === "function") {
                return v.call(obj);
            }
            if (Observable.isObservable(obj)) {
                return __get(obj, name, v);
            }
            return v;
        };
        Observable.accessor = function (name, field) {
            field = field || "_" + name;
            return function (v) {
                var that = this;
                if (arguments.length) {
                    return __set(that, name, v, field);
                }
                else {
                    return __get(that, name, that[field]);
                }
            };
        };
        Observable.getter = function (name, field) {
            field = field || "_" + name;
            return function () {
                var that = this, v = that[field];
                return __get(that, name, v);
            };
        };
        Observable.setter = function (name, field) {
            field = field || "_" + name;
            return function (v) {
                if (arguments.length) {
                    __set(this, name, v, field);
                }
            };
        };
        /**
         * Create a new instance of {Observable} and
         * add observable properties for every field in supplied json-object into the new object.
         * @param {object} json key-value map for declaring and initializing the new object
         * @returns {Observable}
         */
        Observable.construct = function (json) {
            return observe(json);
        };
        return Observable;
    }(CoreClass));
    exports.Observable = Observable;
    // HACK: make Observable's static method non-enumerable to prevent copying for derived class (TS __extend helper does this)
    if (supportsES5props) {
        for (var _i = 0, _a = ["isObservable", "get", "accessor", "getter", "setter", "construct"]; _i < _a.length; _i++) {
            var method = _a[_i];
            Object.defineProperty(Observable, method, { enumerable: false });
        }
    }
    var ObservableCollection = /** @class */ (function (_super) {
        __extends(ObservableCollection, _super);
        /**
         * @constructs ObservableCollection
         * @extends Observable
         * @param {Array} items
         */
        function ObservableCollection(items) {
            var _this = this;
            if (items && !exports.isArray(items)) {
                throw new Error("Argument of ObservableCollection constructor should be an array");
            }
            _this = _super.call(this) || this;
            var that = _this;
            if (!items) {
                that._items = [];
            }
            else {
                that._items = items;
                items.forEach(that._initItem, that);
            }
            return _this;
        }
        ObservableCollection.prototype.dispose = function () {
            var that = this;
            that._items.forEach(that._cleanupItem, that);
            _super.prototype.dispose.call(this);
        };
        ObservableCollection.prototype.all = function () {
            var that = this, ret = that._items;
            ret.forEach(function (item, i) {
                that._triggerGet({ prop: i.toString(), value: item });
            });
            that._triggerGet({ prop: "all", value: ret });
            return ret;
        };
        ObservableCollection.prototype.get = function (i) {
            var ret = this._items[i];
            this._triggerGet({ prop: i.toString(), value: ret });
            return ret;
        };
        ObservableCollection.prototype.count = function () {
            var ret = this._items.length;
            this._triggerGet({ prop: "count", value: ret });
            return ret;
        };
        ObservableCollection.prototype.isEmpty = function () {
            return this._items.length === 0;
        };
        ObservableCollection.prototype.indexOf = function (item) {
            return this._items.indexOf(item);
        };
        ObservableCollection.prototype.add = function (item) {
            var that = this, items = array(item);
            if (items.length) {
                arrayAppend(that._items, items);
                that._triggerChange({ added: items });
            }
        };
        ObservableCollection.prototype.remove = function (item) {
            if (!this._items.length) {
                return undefined;
            }
            var that = this, removed = [], items = array(item);
            if (items.length) {
                items.forEach(function (item) {
                    var i = that._items.indexOf(item);
                    if (i >= 0) {
                        that._items.splice(i, 1);
                        removed.push(item);
                    }
                });
                if (removed.length) {
                    that._triggerChange({ removed: removed });
                }
            }
        };
        ObservableCollection.prototype.move = function (indexFrom, indexTo) {
            var that = this, item;
            if (indexFrom !== indexTo) {
                item = that._items[indexFrom];
                that._items.splice(indexFrom, 1);
                that._items.splice(indexTo, 0, item);
                that._triggerChange({});
            }
        };
        ObservableCollection.prototype.clear = function () {
            var that = this, oldItems;
            if (that._items.length) {
                oldItems = that._items.slice();
                that._items.length = 0;
                that._triggerChange({ removed: oldItems });
            }
        };
        /**
         * Replace current items with new one(s).
         * @param item New item or array of items
         */
        ObservableCollection.prototype.reset = function (item) {
            var that = this, items = array(item), oldItems = that._items.slice();
            if (items.length === oldItems.length) {
                // check for actual changing (i.e. `obj.items.reset(that.items)` is not a actual change)
                var len = items.length, changed = false;
                for (var i = 0; i < len; ++i) {
                    if (items[i] !== oldItems[i]) {
                        changed = true;
                        break;
                    }
                }
                if (!changed) {
                    return;
                }
            }
            that._items.length = 0;
            arrayAppend(that._items, items);
            that._triggerChange({ added: items, removed: oldItems });
        };
        ObservableCollection.prototype.forEach = function (iterator, context) {
            this._items.forEach(iterator, context);
        };
        /**
         * Returns the first element that satisfies the provided testing function.
         * Analogue of `Array.prototype.find`.
         * @param predicate
         * @param context
         * @returns {any}
         */
        ObservableCollection.prototype.find = function (predicate, context) {
            return exports.find(this._items, predicate, context);
        };
        ObservableCollection.prototype.some = function (iterator, context) {
            return this._items.some(iterator, context);
        };
        ObservableCollection.prototype.filter = function (iterator, context) {
            return this._items.filter(iterator, context);
        };
        ObservableCollection.prototype.toggle = function (item) {
            var that = this, idx = that._items.indexOf(item);
            if (idx > -1) {
                that._items.splice(idx, 1);
                that._triggerChange({ removed: [item] });
            }
            else {
                that._items.push(item);
                that._triggerChange({ added: [item] });
            }
        };
        ObservableCollection.prototype.insert = function (item, targetIdx) {
            var that = this, items = array(item);
            if (items.length) {
                if (targetIdx >= 0) {
                    var temp = that._items.slice(0, targetIdx);
                    arrayAppend(temp, items);
                    arrayAppend(temp, that._items.slice(targetIdx));
                    that._items = temp;
                    that._triggerChange({ added: items, addedIndices: [targetIdx] });
                }
                else {
                    that.add(items);
                }
            }
        };
        ObservableCollection.prototype._triggerGet = function (args) {
            this.trigger("get", this, args);
        };
        ObservableCollection.prototype._triggerChange = function (args) {
            var that = this;
            if (args.added && args.added.length) {
                args.added.forEach(that._initItem, that);
            }
            if (args.removed && args.removed.length) {
                args.removed.forEach(that._cleanupItem, that);
            }
            that.trigger("change", that, args);
        };
        ObservableCollection.prototype._onItemChange = function (item) {
            this.trigger("itemChange", this, { changed: [item] });
        };
        ObservableCollection.prototype._initItem = function (item) {
            if (Observable.isObservable(item)) {
                item.bind("change", this._onItemChange, this);
            }
        };
        ObservableCollection.prototype._cleanupItem = function (item) {
            if (Observable.isObservable(item)) {
                item.unbind("change", this._onItemChange, this);
            }
        };
        ObservableCollection.isObservableCollection = function (obj) {
            return Observable.isObservable(obj) && obj.all && obj.count && obj.indexOf;
        };
        return ObservableCollection;
    }(Observable));
    exports.ObservableCollection = ObservableCollection;
    var ObservableDictionary = /** @class */ (function (_super) {
        __extends(ObservableDictionary, _super);
        /**
         * @constructs ObservableDictionary
         * @extends Observable
         * @param map
         */
        function ObservableDictionary(map) {
            var _this = _super.call(this) || this;
            _this._keys = [];
            var that = _this;
            that.bind("change", that._onItemChange, that);
            if (map) {
                that.addRange(map);
            }
            return _this;
        }
        ObservableDictionary.prototype.add = function (key, value, ignoreRaise) {
            var that = this;
            if (key === undefined || key === null || key === "")
                throw new Error("Ключ в словаре не может быть пустым");
            if (that._keys.indexOf(key) >= 0)
                throw new Error("Словарь уже содержит ключ: " + key);
            that._keys.push(key);
            that.declareProp(key, value);
            var added = {};
            added[key] = value;
            if (!ignoreRaise) {
                that._triggerChange({ added: added });
            }
            return that;
        };
        ObservableDictionary.prototype.remove = function (key) {
            var that = this;
            var idx = that._keys.indexOf(key);
            if (idx >= 0) {
                var removed = {};
                removed[key] = that[key]();
                that._keys.splice(idx, 1);
                that._removeProp(key);
                that._triggerChange({ removed: removed });
            }
            return that;
        };
        ObservableDictionary.prototype.addRange = function (map, ignoreRaise) {
            var that = this;
            forEach(map, function (value, key) {
                that.add(key, value);
            });
            ignoreRaise && that._triggerChange({ added: map });
            return that;
        };
        ObservableDictionary.prototype.clear = function () {
            var that = this;
            var old = that._removeAll();
            that._triggerChange({ removed: old });
            return that;
        };
        ObservableDictionary.prototype.reset = function (map) {
            var that = this;
            var old = that._removeAll();
            that.addRange(map, true);
            that._triggerChange({ removed: old, added: map });
            return that;
        };
        ObservableDictionary.prototype.keys = function () {
            return this._keys.slice();
        };
        ObservableDictionary.prototype.values = function () {
            var _this = this;
            return this._keys.map(function (key) {
                return _this[key]();
            });
        };
        ObservableDictionary.prototype.all = function () {
            var _this = this;
            var dict = {};
            forEach(this._keys, function (key) {
                dict[key] = _this[key]();
            });
            return dict;
        };
        ObservableDictionary.prototype.count = function () {
            return this._keys.length;
        };
        ObservableDictionary.prototype.contains = function (key) {
            return this._keys.indexOf(key) >= 0;
        };
        ObservableDictionary.prototype._triggerChange = function (args) {
            this.trigger("itemsChange", this, args);
        };
        ObservableDictionary.prototype._triggerItemChange = function (args) {
            this.trigger("itemChange", this, args);
        };
        ObservableDictionary.prototype._onItemChange = function (s, item) {
            this._triggerItemChange({ changed: item });
        };
        ObservableDictionary.prototype._removeAll = function () {
            var that = this, oldItems = {};
            if (that._keys.length) {
                forEach(that._keys, function (key) {
                    oldItems[key] = that[key]();
                    that._removeProp(key);
                });
                that._keys = [];
            }
            return oldItems;
        };
        ObservableDictionary.prototype._removeProp = function (name) {
            var field = "_" + name;
            delete this[field];
            delete this[name];
        };
        return ObservableDictionary;
    }(Observable));
    exports.ObservableDictionary = ObservableDictionary;
    var collections;
    (function (collections) {
        function createComparer(orderBy) {
            if (!orderBy || !orderBy.length) {
                return undefined;
            }
            return function (obj1, obj2) {
                for (var _i = 0, orderBy_1 = orderBy; _i < orderBy_1.length; _i++) {
                    var orderItem = orderBy_1[_i];
                    var v1 = void 0, v2 = void 0;
                    if (orderItem.getter) {
                        v1 = orderItem.getter.call(obj1);
                        v2 = orderItem.getter.call(obj2);
                    }
                    else {
                        v1 = get(obj1, orderItem.prop);
                        v2 = get(obj2, orderItem.prop);
                    }
                    var comp = orderItem.comparer ? orderItem.comparer(v1, v2) : compare(v1, v2);
                    if (comp !== 0) {
                        return orderItem.desc ? -comp : comp;
                    }
                }
                return 0;
            };
        }
        collections.createComparer = createComparer;
        function parseOrderBy(orderBy, oldOrderBy) {
            var items = array(orderBy);
            return items.map(function (item, i) {
                if (exports.isString(item)) {
                    var prop = item;
                    var desc = void 0;
                    if (prop[0] === "+") {
                        prop = prop.slice(1);
                    }
                    else if (prop[0] === "-") {
                        prop = prop.slice(1);
                        desc = true;
                    }
                    else if (prop[0] === "*") {
                        prop = prop.slice(1);
                        if (oldOrderBy) {
                            var old = oldOrderBy[i];
                            if (old && old.prop === prop) {
                                desc = !old.desc;
                            }
                        }
                    }
                    else if (prop.slice(-4).toLowerCase() === " asc") {
                        prop = prop.slice(0, -4);
                    }
                    else if (prop.slice(-5).toLowerCase() === " desc") {
                        prop = prop.slice(0, -5);
                        desc = true;
                    }
                    return {
                        prop: prop,
                        desc: desc
                    };
                }
                return item;
            });
        }
        collections.parseOrderBy = parseOrderBy;
    })(collections = exports.collections || (exports.collections = {}));
    var EventBinder = /** @class */ (function (_super) {
        __extends(EventBinder, _super);
        /**
         * @constructs EventBinder
         * @param owner
         */
        function EventBinder(owner) {
            var _this = _super.call(this) || this;
            _this._disposes = [];
            _this._owner = owner;
            return _this;
        }
        EventBinder.prototype.bind = function (target, event, callback) {
            var that = this, handler = that._owner ? callback.bind(that._owner) : callback, dispose = function () {
                target.unbind(event, handler);
            };
            target.bind(event, handler);
            that._disposes.push(dispose);
        };
        EventBinder.prototype.unbind = function () {
            var that = this;
            that._disposes.forEach(function (dispose) {
                dispose();
            });
            that._disposes.length = 0;
        };
        EventBinder.prototype.dispose = function () {
            this.unbind();
        };
        return EventBinder;
    }(CoreClass));
    exports.EventBinder = EventBinder;
    var Event = /** @class */ (function (_super) {
        __extends(Event, _super);
        /**
         * @constructs Event
         * @param {*} [owner] An object which will be passed in `sender` field of event's handler
         */
        function Event(owner) {
            var _this = _super.call(this) || this;
            _this._eventName = "exec";
            _this._bound = false;
            _this._innerEvent = new Observable();
            _this._owner = owner;
            return _this;
        }
        /**
         * Subscribe the callback to the event
         * @param {Function} callback
         * @param {*} [context] A context (`this`) in which the callback will be called
         */
        Event.prototype.bind = function (callback, context) {
            var that = this;
            that._innerEvent.bind(that._eventName, callback, context);
            if (!that._bound) {
                that._bound = true;
                if (that.onFirstBind) {
                    that.onFirstBind();
                }
            }
        };
        /**
         * Unsubscribe the callback from the event
         * @param {Function} callback
         * @param {*} [context]
         */
        Event.prototype.unbind = function (callback, context) {
            var that = this;
            that._innerEvent.unbind(that._eventName, callback, context);
            if (!that._innerEvent.bound(that._eventName)) {
                that._bound = false;
                if (that.onLastUnbind) {
                    that.onLastUnbind();
                }
            }
        };
        /**
         * Trigger the event, i.e. execute all its callback.
         * @param {Object} [data]
         */
        Event.prototype.trigger = function (data) {
            var that = this, args = that._owner ? extend(data || {}, { sender: that._owner }) : data;
            that._innerEvent.trigger(that._eventName, args);
        };
        return Event;
    }(CoreClass));
    exports.Event = Event;
    /**
     * Создает объект-обертку, инкапсулирующий внутри себя исходный объект.
     * @param source Исходный объект
     * @param {object} [options]
     * @param {number} [options.proxyFields] Определяет, каким образовать проксировать исходные свойства, чтобы их изменения отразились в исходном объекте:
     *  1 - для каждого собственного свойства из исходного объекта в прокси-объекте создается одноименное свойство с get/set, которое перенаправляет обращения к свойству в поле исходного объекта;
     *  2 - все методы созданной обертки (включая все унаследованные) перенаправляются в исходные методы, вызываемые в контексте исходного объекта (this === source);
     *  3 - изменения исходных полей через прокси-объект не отражается на исходном объекте;
     *  0 - если браузер поддерживает свойства ES5, то выбирается режим 1; иначе - 2.
     * @return {*}
     * @see {@link http://wiki.rnd.croc.ru/pages/viewpage.action?pageId=37617859}
     */
    function proxy(source, options) {
        // NOTE: <any> нужно для совместимости с TS 2.3.
        // Можно также изменить <T> на <T extends object>, но тогда код перестанет компилироваться в TS 2.1
        // Это надо сделать, но позже.
        var ext = Object.create(source), proxying = options && options.fieldProxying || proxy.defaultFieldProxying;
        if (proxying === 1 /* redirectProps */) {
            // NOTE: use Object.keys to enumerate own properties only
            Object.keys(source).forEach(function (name) {
                Object.defineProperty(ext, name, {
                    get: function () { return source[name]; },
                    set: function (v) { source[name] = v; },
                    enumerable: true,
                    configurable: true
                });
            });
        }
        else if (proxying === 2 /* bindMethods */) {
            // NOTE: use for..in to enumerate all properties, including prototypes
            for (var name_1 in source) {
                var method = source[name_1];
                if (typeof method === "function") {
                    ext[name_1] = method.bind(source);
                }
            }
        }
        return ext;
    }
    exports.proxy = proxy;
    proxy.defaultFieldProxying = supportsES5props ? 1 /* redirectProps */ : 2 /* bindMethods */;
    var ViewModelExtender = /** @class */ (function (_super) {
        __extends(ViewModelExtender, _super);
        /**
         * @constructs ViewModelExtender
         * @param originalViewModel
         * @param options
         */
        function ViewModelExtender(originalViewModel, options) {
            var _this = _super.call(this) || this;
            _this.eventBinder = new EventBinder(_this);
            //this.viewModel = Object.create(originalViewModel);
            _this.viewModel = proxy(originalViewModel, options);
            return _this;
        }
        ViewModelExtender.prototype.declareProp = function (name, initial, onChange) {
            this.viewModel.declareProp(name, initial);
            if (onChange)
                this.eventBinder.bind(this.viewModel, "change:" + name, onChange.bind(this.viewModel));
        };
        ViewModelExtender.prototype.dispose = function () {
            this.eventBinder.unbind();
        };
        return ViewModelExtender;
    }(CoreClass));
    exports.ViewModelExtender = ViewModelExtender;
    var decorators;
    (function (decorators) {
        /**
         * Property decorator. Initializes the property with a constant in the class prototype.
         * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
         * @param {*} value Tthe value of the property.
         */
        function constant(value) {
            return function (proto, propName) {
                proto[propName] = value;
            };
        }
        decorators.constant = constant;
        /**
         * Property decorator. Initializes the property with an 'Observable.accessor'.
         * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
         * @param {Object} [spec]
         */
        function observableAccessor(spec) {
            var field = spec && spec.field;
            var init;
            if (spec && spec.init !== undefined) {
                init = spec.init;
            }
            return function (proto, propName) {
                proto[propName] = Observable.accessor(propName, field);
                var observables = proto["__observableProps"] || (proto["__observableProps"] = {});
                observables[field || ("_" + propName)] = init;
            };
        }
        decorators.observableAccessor = observableAccessor;
        /**
         * Property decorator. Initializes the property with an 'Observable.getter'.
         * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
         * @param {string} [field]
         */
        function observableGetter(field) {
            return function (proto, propName) {
                proto[propName] = Observable.getter(propName, field);
            };
        }
        decorators.observableGetter = observableGetter;
        /**
         * Property decorator. Initializes the property with an 'Observable.setter'.
         * @see {@link http://www.typescriptlang.org/docs/handbook/decorators.html}
         * @param {string} [field]
         */
        function observableSetter(field) {
            return function (proto, propName) {
                proto[propName] = Observable.setter(propName, field);
            };
        }
        decorators.observableSetter = observableSetter;
        /**
         * Method decorator. Wraps the method so that it returns a rejected Promise object if an error occurs.
         * If the original function executes successfully the wrapped method will just return the result.
         * But if the original method throws as error it will return a rejected Promise.
         */
        function asyncSafe(proto, methodName, descriptor) {
            // see WC-1761
            var safeMethod = async.safe(proto[methodName]);
            if (descriptor) {
                descriptor.value = safeMethod; // ES5
            }
            else {
                proto[methodName] = safeMethod; // ES3
            }
        }
        decorators.asyncSafe = asyncSafe;
    })(decorators = exports.decorators || (exports.decorators = {}));
    var support;
    (function (support) {
        var DependencyTracker = /** @class */ (function () {
            function DependencyTracker() {
                this._observed = [];
                this._tracked = [];
            }
            DependencyTracker.prototype.observe = function (obj, prop) {
                var that = this, found, props;
                prop = prop || "";
                if (Observable.isObservable(obj)) {
                    found = that._observed.some(function (o) {
                        if (o.obj === obj) {
                            o.props[prop] = true;
                            return true;
                        }
                    });
                    if (!found) {
                        props = {};
                        props[prop] = true;
                        that._observed.push({ obj: obj, props: props });
                    }
                }
            };
            DependencyTracker.prototype.track = function (obj) {
                var that = this;
                if (that._tracked.indexOf(obj) < 0) {
                    that._tracked.push(obj);
                    if (Observable.isObservable(obj)) {
                        obj.bind("get", that._onGetSet, that);
                        obj.bind("set", that._onGetSet, that);
                    }
                }
            };
            DependencyTracker.prototype.stop = function () {
                var that = this;
                that._tracked.forEach(function (obj) {
                    if (Observable.isObservable(obj)) {
                        obj.unbind("get", that._onGetSet, that);
                        obj.unbind("set", that._onGetSet, that);
                    }
                });
                return {
                    observed: that._observed,
                    tracked: that._tracked
                };
            };
            DependencyTracker.prototype._onGetSet = function (sender, args) {
                if (args) {
                    this.track(args.value);
                }
                if (sender) {
                    this.observe(sender, args ? args.prop : undefined);
                }
            };
            return DependencyTracker;
        }());
        support.DependencyTracker = DependencyTracker;
        support.ExpressionFactory = {
            _map: {},
            get: function (text) {
                var expr = this._map[text];
                if (!expr) {
                    // частный случай - задано просто имя свойства (поля или метода)
                    if (/^[_A-Za-z]\w*$/.test(text)) {
                        expr = property(text);
                    }
                    else if (text.indexOf("this") >= 0) {
                        expr = new Function("return (" + text + ");");
                    }
                    else {
                        expr = new Function("with (this) { return (" + text + "); }");
                    }
                    this._map[text] = expr;
                }
                return expr;
            }
        };
        function isNotLoaded(obj) {
            // isLoaded flag must be set (true of false)
            return obj && obj.isLoaded !== undefined && !obj.isLoaded && typeof obj.load === "function";
        }
        support.isNotLoaded = isNotLoaded;
        /**
         * Special object that represent a value which is currently loading
         */
        support.loadingValue = {
            toString: function () {
                // NOTE: 'lang' module shouldn't depend on resources, therefore return not-localized string
                return "Loading...";
            }
        };
        var ObservableExpressionBase = /** @class */ (function () {
            /**
             * @constructs ObservableExpressionBase
             * Basic observable expression.
             * @param {string|Function} expr
             * @param {object} [options]
             * @param {Function} [options.onchange] callback to be called on any change of objects observed while `expr` function execution
             */
            function ObservableExpressionBase(expr, options) {
                if (typeof expr !== "function" && typeof expr !== "string") {
                    throw new TypeError("Expression must be function or string");
                }
                //				var config = window.xconfig;
                //				if (config && config.isDebug) {
                //					this._exprDebug = expr.toString();
                //				}
                if (typeof expr === "string") {
                    expr = support.ExpressionFactory.get(expr);
                }
                var that = this;
                that._expr = expr;
                that._options = options || {};
            }
            ObservableExpressionBase.prototype.dispose = function () {
                this._reset();
            };
            ObservableExpressionBase.prototype.suppress = function () {
                this._suppress = true;
            };
            ObservableExpressionBase.prototype.resume = function () {
                this._suppress = false;
            };
            ObservableExpressionBase.prototype.evaluate = function (thisObj, argsArray) {
                var that = this, ret;
                if (!that._dependencies) {
                    ret = that._init(thisObj, argsArray);
                }
                else {
                    ret = that._expr.apply(thisObj, argsArray || []);
                }
                return ret;
            };
            ObservableExpressionBase.prototype._notify = function (reason) {
                var that = this;
                if (that._suppress) {
                    return;
                }
                if (that._dependencies) {
                    that._reset();
                    that._callback(reason);
                }
            };
            ObservableExpressionBase.prototype._callback = function (reason) {
                var onchange = this._options.onchange;
                if (onchange) {
                    onchange(reason);
                }
            };
            ObservableExpressionBase.prototype._observe = function () {
                var that = this;
                that._dependencies.observed.forEach(function (d) {
                    d.callback = function (sender, ea) {
                        var prop = (ea && ea.prop);
                        if (!prop || d.props[prop]) {
                            that._notify(ea && ea.reason || "change");
                        }
                    };
                    d.obj.bind("change", d.callback);
                });
            };
            ObservableExpressionBase.prototype._reset = function () {
                var that = this;
                if (that._dependencies) {
                    that._dependencies.observed.forEach(function (d) {
                        // NOTE: callback may be not set when something was loaded synchronously
                        if (d.callback) {
                            d.obj.unbind("change", d.callback);
                        }
                    });
                    that._dependencies = undefined;
                }
            };
            ObservableExpressionBase.prototype._track = function (source, args) {
                // WARN: метод может выкинуть исключение, если оно выбрасывается при вычислении выражения
                var tracker, i;
                tracker = new DependencyTracker();
                tracker.track(source);
                if (args) {
                    for (i = 0; i < args.length; i++) {
                        tracker.track(args[i]);
                    }
                }
                return tracker;
            };
            ObservableExpressionBase.prototype._init = function (source, args) {
                // WARN: метод может выкинуть исключение, если оно выбрасывается при вычислении выражения
                var that = this, tracker;
                try {
                    that._reset();
                    // start tracking dependencies before calling the expression
                    tracker = that._track(source, args);
                    return that._expr.apply(source, args || []);
                }
                finally {
                    // stop tracking dependencies
                    that._dependencies = tracker.stop();
                    that._observe();
                }
            };
            return ObservableExpressionBase;
        }());
        support.ObservableExpressionBase = ObservableExpressionBase;
        var ObservableExpression = /** @class */ (function (_super) {
            __extends(ObservableExpression, _super);
            /**
             * @constructs ObservableExpression
             * @param {string|Function} expr
             * @param {object} [options]
             * @param {Function} [options.onchange] callback, который будет вызван при изменении объектов, задействованных при вызове функции
             * @param {*} [options.loadingValue] значение, возвращаемое функцией, если есть незагруженные объекты
             * @param {*} [options.errorValue] значение, возвращаемое функцией в случае ошибки
             * @param {boolean} [options.suppressAutoLoad] отключить автоматическую загрузку незагруженных объектов
             */
            function ObservableExpression(expr, options) {
                var _this = _super.call(this, expr, options) || this;
                if (!options || options.autoLoad === undefined) {
                    _this._options.autoLoad = "always";
                }
                return _this;
            }
            ObservableExpression.prototype.evaluate = function (thisObj, argsArray) {
                var that = this, ret, error;
                //callCtx: ObservableExpression.CallContext;
                try {
                    if (!that._dependencies) {
                        ret = that._init(thisObj, argsArray);
                    }
                    else if (that._dependencies.loadingError) {
                        error = that._dependencies.loadingError;
                    }
                    else if (!that._dependencies.isLoading) {
                        ret = that._expr.apply(thisObj, argsArray || []);
                    }
                }
                catch (ex) {
                    error = ex;
                }
                if (that._dependencies && that._dependencies.isLoading) {
                    // если есть зависимые незагруженные объекты, то вернем специальное значение
                    if (!error && that._options.autoLoad === "onerror" && isPromise(ret)) {
                        // выражение вычислилось без ошибок, вернуло Promise и задана опция, отключившая autoLoad,
                        // вернем результат as is
                        return ret;
                    }
                    ret = that._options.loadingValue || support.loadingValue;
                }
                else if (error) {
                    if (that._options.errorValue) {
                        ret = that._options.errorValue;
                    }
                    else {
                        throw error;
                    }
                }
                return ret;
            };
            ObservableExpression.prototype._init = function (source, args) {
                // WARN: метод может выкинуть исключение, если оно выбрасывается при вычислении выражения
                var that = this, runToEnd, tracker, syncLoaded;
                try {
                    that._reset();
                    // start tracking dependencies before calling the expression
                    tracker = that._track(source, args);
                    var res = that._expr.apply(source, args || []);
                    runToEnd = true;
                    return res;
                }
                finally {
                    // stop tracking dependencies
                    that._dependencies = tracker.stop();
                    if (runToEnd && that._options.autoLoad === "onerror") {
                        // expression execution finishes w/o an error and auto-load should happen only on error
                    }
                    else {
                        // an error occured or autoLoad == "always":
                        // загружаем все незагруженные объекты
                        that._dependencies.tracked.forEach(function (obj) {
                            var deferredLoad;
                            if (support.isNotLoaded(obj)) {
                                that._dependencies.isLoading = true;
                                deferredLoad = obj.load();
                                if (isPromise(deferredLoad)) {
                                    if (deferredLoad.state() === "resolved") {
                                        syncLoaded = true; // object was loaded synchronously
                                    }
                                    else {
                                        deferredLoad.done(function (loaded) {
                                            //if (loaded !== undefined && !lang.support.isNotLoaded(loaded)) {
                                            //	that._notify();
                                            //}
                                            that._notify("autoLoad");
                                        }).fail(function (err) {
                                            if (that._dependencies) {
                                                that._dependencies.isLoading = false;
                                                that._dependencies.loadingError = err;
                                                that._callback("loadError");
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        if (syncLoaded) {
                            // something was loaded synchronously, so we should reinitialize - repeat recursively
                            // TODO: max attempts
                            return that._init(source, args);
                        }
                    }
                    that._observe();
                }
            };
            ObservableExpression.create = function (expr, options) {
                var ctor = options && (options.suppressAutoLoad || options.autoLoad === "disabled" || options.autoLoad === false) ?
                    ObservableExpressionBase :
                    ObservableExpression;
                return new ctor(expr, options);
            };
            return ObservableExpression;
        }(ObservableExpressionBase));
        support.ObservableExpression = ObservableExpression;
        var AsyncIterator = /** @class */ (function () {
            /**
             * @constructs AsyncIterator
             * @param {Array} items
             * @param {Function} iterator
             * @param {*} [context]
             */
            function AsyncIterator(items, iterator, context) {
                this._idx = 0;
                this._defer = exports.deferred();
                this.items = items;
                this.iterator = iterator;
                this.context = context;
            }
            AsyncIterator.prototype.execute = function () {
                this._moveNext();
                return this._defer;
            };
            AsyncIterator.prototype._moveNext = function () {
                var that = this;
                if (that._idx >= that.items.length) {
                    that._defer.resolve();
                    return;
                }
                exports.when(that.iterator.call(that.context, that.items[that._idx], that._idx++, that.items))
                    .done(function () {
                    that._moveNext();
                })
                    .fail(function (error) {
                    that._defer.reject(error);
                });
            };
            return AsyncIterator;
        }());
        support.AsyncIterator = AsyncIterator;
    })(support = exports.support || (exports.support = {}));
    var ObservableExpression = support.ObservableExpression;
    /**
     * Создает функцию, оборачивая expr.
     * При первом вызове созданной функции анализируются все затронутые observable объекты. При изменении
     * любого из них вызывается callback, заданный в options.onchange. После этого изменения в затронутых объектах
     * перестают отслеживаться, для продолжения отслеживания нужно повторно вызвать функцию-результат.
     * @param {string|Function} expr
     * @param {object} [options]
     * @param {Function} [options.onchange] callback, который будет вызван при изменении объектов, задействованных при вызове функции
     * @param {*} [options.loadingValue] значение, возвращаемое функцией, если есть незагруженные объекты
     * @param {*} [options.errorValue] значение, возвращаемое функцией в случае ошибки
     * @param {boolean} [options.suppressAutoLoad] отключить автоматическую загрузку незагруженных объектов
     * @returns {function} Javascript функция, которая может вызываться как обычно. Однако, функция содержит метод dispose, который обязательно должен быть вызван, когда созданная функция перестанет быть нужной.
     */
    function observableExpression(expr, options) {
        // prevent re-wrapping: expr is already ObservableExpression
        if (typeof expr === "function" && expr.dispose) {
            return expr;
        }
        var obs = ObservableExpression.create(expr, options), ret = function () {
            return obs.evaluate(this, arguments);
        };
        ret.dispose = function () {
            obs.dispose();
        };
        return ret;
    }
    exports.observableExpression = observableExpression;
    /**
     * Tries to evaluates the expression and loads all unloaded objects, which are used in the expression.
     * @param {string|Function} expr
     * @param {*} ctx this object for evaluating the expression
     * @param {...*} exprArgs arguments for evaluating the expression
     * @returns {Deferred} Deferred with result of evaluating the expression when all used objects are loaded.
     */
    function loadExpression(expr, ctx) {
        var exprArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            exprArgs[_i - 2] = arguments[_i];
        }
        var defer = exports.deferred(), options = {
            loadingValue: support.loadingValue,
            onchange: function () {
                try {
                    var r = obs.evaluate(ctx, exprArgs);
                    if (r !== options.loadingValue) {
                        obs.dispose();
                        defer.resolve(r);
                    }
                }
                catch (ex) {
                    obs.dispose();
                    defer.reject(ex);
                }
            }
        }, obs = new support.ObservableExpression(expr, options);
        options.onchange();
        return defer;
    }
    exports.loadExpression = loadExpression;
    /**
     * Contains some methods for working with Deferred
     */
    var async;
    (function (async) {
        function attempt(func, context) {
            try {
                var r = func.call(context);
                return exports.when(r);
            }
            catch (ex) {
                return rejected(ex);
            }
        }
        async.attempt = attempt;
        /**
         * Calls iterator for every item in array.
         * Iterator may returns Deferred. In this case next item will be processed when Deferred will be resolved.
         * @param {Array} items
         * @param {Function} iterator
         * @param {*} context This object for calling iterator
         */
        function forEach(items, iterator, context) {
            return new support.AsyncIterator(items, iterator, context).execute();
        }
        async.forEach = forEach;
        /**
         * Wraps the function so that it always returns a Promise object. If the result of the original function
         * is not a Deferred (or a Promise) the wrapped function will return a resolved Promise object.
         * If the original function throws as error it will return a rejected Promise.
         * @param {Function} func
         * @returns {Function}
         */
        function wrap(func) {
            return func && function () {
                try {
                    var r = func.apply(this, arguments);
                    return exports.when(r);
                }
                catch (ex) {
                    return rejected(ex);
                }
            };
        }
        async.wrap = wrap;
        /**
         * Wraps the function so that it returns a rejected Promise object if an error occurs.
         * If the original function executes successfully the wrapped function will just return the result.
         * But if the original function throws as error it will return a rejected Promise.
         * @param {Function} func
         * @returns {Function}
         */
        function safe(func) {
            return func && function () {
                try {
                    return func.apply(this, arguments);
                }
                catch (ex) {
                    return rejected(ex);
                }
            };
        }
        async.safe = safe;
        /**
         * Executes callback for the object and returns a result.
         * If the object is a Deferred, adds callbacks to be called when the Deferred is completed via 'then' method
         * and returns its result (a new Deferred).
         * Despite 'then' method this method executes the callback in try..catch
         * @param {Promise|*} obj
         * @param {Function} [doneFilter]
         * @param {Function} [failFilter]
         * @returns {Promise|*}
         */
        function then(obj, doneFilter, failFilter) {
            var doneFilterSafe = async.safe(doneFilter);
            if (isPromise(obj)) {
                return obj.then(doneFilterSafe, async.safe(failFilter));
            }
            return doneFilterSafe(obj);
        }
        async.then = then;
        /**
         *
         * @param {Promise|*} obj
         * @param {Function} callback
         * @returns {Promise|*}
         */
        function done(obj, callback) {
            var callbackSafe = async.safe(callback);
            if (isPromise(obj)) {
                return obj.done(callbackSafe);
            }
            callbackSafe(obj);
            return obj;
        }
        async.done = done;
        /**
         *
         * @param {Promise|*} obj
         * @param {Function} callback
         * @returns {Promise|*}
         */
        function fail(obj, callback) {
            if (isPromise(obj)) {
                return obj.fail(async.safe(callback));
            }
            return obj;
        }
        async.fail = fail;
        /**
         *
         * @param {Promise|*} obj
         * @param {Function} callback
         * @returns {Promise|*}
         */
        function always(obj, callback) {
            var callbackSafe = async.safe(callback);
            if (isPromise(obj)) {
                return obj.always(callbackSafe);
            }
            callbackSafe(obj);
            return obj;
        }
        async.always = always;
        /**
         *
         * @param {Promise|*} obj
         * @param {Function} callback
         * @returns {Promise|*}
         */
        function progress(obj, callback) {
            if (isPromise(obj)) {
                return obj.progress(async.safe(callback));
            }
            return obj;
        }
        async.progress = progress;
        /**
         * Creates a wrapper around a Promise or any other value, which behaves like a Promise.
         * It allows to safely add callbacks via 'then', 'done', 'fail', 'always' and 'progress' methods,
         * redirecting them to the same methods in 'lang.async' namespace.
         * Call 'value' method to get a result.
         * @param {Promise|*} v
         * @returns {DeferredChain}
         */
        function chain(v) {
            return new DeferredChain(v);
        }
        async.chain = chain;
        var DeferredChain = /** @class */ (function () {
            /**
             * @constructs DeferredChain
             * @param {Promise|*} v
             */
            function DeferredChain(v) {
                this._v = v;
            }
            DeferredChain.prototype.value = function () {
                return this._v;
            };
            DeferredChain.prototype.then = function (doneFilter, failFilter) {
                this._v = async.then(this._v, doneFilter, failFilter);
                return this;
            };
            return DeferredChain;
        }());
        // extend DeferredChain class
        ["done", "fail", "always", "progress"].forEach(function (name) {
            DeferredChain.prototype[name] = function (callback) {
                this._v = async[name].call(null, this._v, callback);
                return this;
            };
        });
    })(async = exports.async || (exports.async = {}));
});
//# sourceMappingURL=core.lang.js.map