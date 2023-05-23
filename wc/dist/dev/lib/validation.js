/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/utils", "lib/formatters", "lib/utils/datetimes", "moment", "big", "i18n!lib/nls/resources"], function (require, exports, lang, utils, formatters, datetimes, moment, Big, resources) {
    "use strict";
    exports.__esModule = true;
    function checkNumberRange(v, minValue, maxValue) {
        if (minValue !== undefined && v < minValue) {
            return {
                errorMsg: formatters.safeHtml(resources["validation.minValue"] + "<nobr>" + utils.formatNumber(minValue) + "</nobr>")
            };
        }
        if (maxValue !== undefined && v > maxValue) {
            return {
                errorMsg: formatters.safeHtml(resources["validation.maxValue"] + "<nobr>" + utils.formatNumber(maxValue) + "</nobr>")
            };
        }
    }
    function checkBigNumberRange(v, minValue, maxValue) {
        if (minValue !== undefined && v.lt(minValue)) {
            return {
                errorMsg: formatters.safeHtml(resources["validation.minValue"] + "<nobr>" + utils.formatNumber(minValue.toString()) + "</nobr>")
            };
        }
        if (maxValue !== undefined && v.gt(maxValue)) {
            return {
                errorMsg: formatters.safeHtml(resources["validation.maxValue"] + "<nobr>" + utils.formatNumber(maxValue.toString()) + "</nobr>")
            };
        }
    }
    /**
     * Number comparer supporting Number and Big.
     */
    exports.NumberComparer = {
        lt: function (l, r) {
            if (lang.isNumber(l) && lang.isNumber(r)) {
                return l < r;
            }
            else if (l instanceof Big && r instanceof Big) {
                return l.lt(r);
            }
            // strings? parse them
            return new Big(l).lt(r);
        },
        lte: function (l, r) {
            if (lang.isNumber(l) && lang.isNumber(r)) {
                return l <= r;
            }
            else if (l instanceof Big && r instanceof Big) {
                return l.lte(r);
            }
            // strings? parse them
            return new Big(l).lte(r);
        },
        gt: function (l, r) {
            if (lang.isNumber(l) && lang.isNumber(r)) {
                return l > r;
            }
            else if (l instanceof Big && r instanceof Big) {
                return l.gt(r);
            }
            // strings? parse them
            return new Big(l).gt(r);
        },
        gte: function (l, r) {
            if (lang.isNumber(l) && lang.isNumber(r)) {
                return l >= r;
            }
            else if (l instanceof Big && r instanceof Big) {
                return l.gte(r);
            }
            // strings? parse them
            return new Big(l).gte(r);
        }
    };
    function tryParseFloat(v, minValue, maxValue, skipValidation) {
        var parsed = v === "" ? null : parseFloat(v);
        if (isNaN(parsed)) {
            return { errorMsg: resources["validation.number"] };
        }
        var res = { parsedValue: parsed };
        if (res.parsedValue && !skipValidation) {
            // it's an integer, check its range
            res = checkNumberRange(res.parsedValue, minValue, maxValue) || res;
        }
        return res;
    }
    function tryParseInteger(v, minValue, maxValue, skipValidation) {
        // NOTE parseInt can change value: "1.2" => 1, "1A" => 1, "A" => NaN,
        var parsed = v === "" ? null : parseInt(v, 10);
        if (!isFinite(parsed)) {
            // i.e. if Nan, Infinity, -Infinity
            return { errorMsg: resources["validation.integer"] };
        }
        var res = { parsedValue: parsed };
        if (res.parsedValue && !skipValidation) {
            // it's an integer, check its range
            res = checkNumberRange(res.parsedValue, minValue, maxValue) || res;
        }
        return res;
    }
    function tryParseBigInteger(v, minValue, maxValue, skipValidation) {
        var parsed;
        if (v instanceof Big) {
            parsed = v;
        }
        else {
            try {
                // TODO: получается, мы для i8 всегда создаем Big,
                // возможно нужна опция, которая бы говорила "создавать Big только для больших значений"
                parsed = new Big(v);
            }
            catch (ex) {
                return { errorMsg: resources["validation.number"] };
            }
        }
        var res;
        if (!skipValidation) {
            res = checkBigNumberRange(parsed, minValue, maxValue);
        }
        return res || { parsedValue: parsed };
    }
    function tryParseDecimal(v, minValue, maxValue, skipValidation) {
        var parsed;
        if (v instanceof Big) {
            parsed = v;
        }
        else {
            try {
                // TODO: получается, мы для i8 всегда создаем Big,
                // возможно нужна опция, которая бы говорила "создавать Big только для больших значений"
                parsed = new Big(v);
            }
            catch (ex) {
                return { errorMsg: resources["validation.number"] };
            }
        }
        var res;
        if (!skipValidation) {
            res = checkBigNumberRange(parsed, minValue, maxValue);
        }
        return res || { parsedValue: parsed };
    }
    var parserDateTime = {
        tryParse: function (propMeta, v) {
            var vt = propMeta.vt;
            try {
                var parsed = void 0;
                if (lang.isDate(v) && isFinite(v.valueOf())) {
                    parsed = v;
                }
                else if (lang.isString(v)) {
                    parsed = datetimes.parseISOString(v, /*isGlobalTime*/ vt === "timeTz" || vt === "dateTimeTz");
                }
                else if (lang.isNumber(v)) {
                    parsed = new Date(v);
                }
                if (parsed && isFinite(parsed.valueOf())) {
                    if (vt === "time") {
                        parsed = new Date(1970, 0, 1, parsed.getHours(), parsed.getMinutes(), parsed.getSeconds(), parsed.getMilliseconds());
                    }
                    else if (vt === "timeTz") {
                        // при отбрасывании даты меняется зона, скорректируем время на эту разницу
                        var offsetDelta = (parsed.getTimezoneOffset() - new Date(1970, 0, 1).getTimezoneOffset());
                        if (offsetDelta !== 0) {
                            var hours = parsed.getHours(), minutes = parsed.getMinutes();
                            minutes = minutes + (offsetDelta % 60);
                            hours = hours + (offsetDelta - offsetDelta % 60) / 60;
                            parsed = new Date(1970, 0, 1, hours, minutes, parsed.getSeconds(), parsed.getMilliseconds());
                        }
                        else {
                            parsed = new Date(1970, 0, 1, parsed.getHours(), parsed.getMinutes(), parsed.getSeconds(), parsed.getMilliseconds());
                        }
                    }
                    else if (vt === "date") {
                        parsed = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
                    }
                    return {
                        parsedValue: parsed
                    };
                }
                return { errorMsg: resources["validation.dateTime"] };
            }
            catch (e) {
                // TODO
                return { errorMsg: resources["validation.dateTimeFormat"] };
            }
        }
    };
    var parserEnum = {
        tryParse: function (propMeta, v, skipValidation) {
            var result = {}, enumMeta = propMeta["ref"], valueParser = getParser(enumMeta.vt || "i4"), 
            // TODO: TS2345: Argument of type 'EnumMeta' is not assignable to parameter of type 'PropertyMeta'.
            parsedVal = valueParser.tryParse(enumMeta, v, skipValidation);
            if (!parsedVal.errorMsg) {
                result.parsedValue = parsedVal.parsedValue;
            }
            else {
                var flags = lang.coalesce(propMeta["flags"], enumMeta.flags);
                result = EnumHelper.tryParse(flags, enumMeta.members, v);
            }
            return result;
        }
    };
    var parserString = {
        tryParse: function (propMeta, v) {
            if (v == null) {
                // null|undefined - return undefined (or any other falsy value) to use original value
                return;
            }
            if (!lang.isString(v)) {
                v = v.toString();
            }
            return {
                parsedValue: v ? v.trim() : ""
            };
        }
    };
    var parserTimespan = {
        tryParse: function (propMeta, v) {
            // TimeSpan value can be in the following formats:
            // * number (double) - milliseconds
            // * .NET System.TimeSpan:  "[ws][-]{ d | [d.]hh:mm[:ss[.ff]] }[ws]"
            // * ISO_8601 (XSD duration): "PnYnMnDTnHnMnS" (https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)
            // NOTE: .NET-сервер возвращает number.
            var duration;
            //duration = moment.duration(v);
            if (lang.isNumber(v)) {
                // NOTE: we need Number parsing (not Big) but without min/max
                return tryParseInteger(v, undefined, undefined);
                // if Big support needed: return parsers.i8.tryParse(propMeta, v);
            }
            else if (lang.isString(v)) {
                duration = moment.duration(v);
                // TODO: нет признак о том, что значение было распаршено (типа moment.isValid)
            }
            else if (moment.isDuration(v)) {
                duration = v;
            }
            else {
                return { errorMsg: resources["validation.timeSpan"] };
            }
            // Now we have a Duration object, normalize it as milliseconds from "zero date" (1970-01-01)
            // NOTE: moment add mutates the object, so we have to construct base dates ("zero") every time
            v = moment("1970-01-01").add(duration).diff(moment("1970-01-01"));
            return {
                parsedValue: v
            };
        }
    };
    /**
     * Property value parsers.
     */
    exports.parsers = {
        ui1: {
            minValue: 0,
            maxValue: 255,
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseInteger(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        i2: {
            minValue: -32768,
            maxValue: 32767,
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseInteger(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        i4: {
            minValue: -2147483648,
            maxValue: 2147483647,
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseInteger(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        i8: {
            minValue: new Big("-9223372036854775808"),
            maxValue: new Big("9223372036854775807"),
            minValueUnsafe: -9223372036854775808,
            maxValueUnsafe: 9223372036854775807,
            tryParse: function (propMeta, v, skipValidation) {
                if (propMeta.useNumber) {
                    // отключена поддержка Big - всегда Number, может быть потеря точности
                    return tryParseInteger(v, this.minValueUnsafe, this.maxValueUnsafe, skipValidation);
                }
                return tryParseBigInteger(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        float: {
            minValue: -3.40282347E+38,
            maxValue: 3.40282347E+38,
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseFloat(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        double: {
            minValue: -1.7976931348623157E+308,
            maxValue: 1.7976931348623157E+308,
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseFloat(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        decimal: {
            minValue: new Big("-79228162514264337593543950335"),
            maxValue: new Big("79228162514264337593543950335"),
            minValueUnsafe: -79228162514264337593543950335,
            maxValueUnsafe: 79228162514264337593543950335,
            tryParse: function (propMeta, v, skipValidation) {
                if (propMeta.useNumber) {
                    // отключена поддержка Big - всегда Number, может быть потеря точности
                    return tryParseFloat(v, this.minValueUnsafe, this.maxValueUnsafe, skipValidation);
                }
                return tryParseDecimal(v, this.minValue, this.maxValue, skipValidation);
            }
        },
        /**
         * @deprecated
         */
        integer: {
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseInteger(v, this.minValue, this.maxValue, skipValidation);
            },
            message: resources["validation.integer"]
        },
        /**
         * @deprecated
         */
        number: {
            tryParse: function (propMeta, v, skipValidation) {
                return tryParseFloat(v, this.minValue, this.maxValue, skipValidation);
            },
            message: resources["validation.number"]
        },
        date: parserDateTime,
        time: parserDateTime,
        dateTime: parserDateTime,
        timeTz: parserDateTime,
        dateTimeTz: parserDateTime,
        "enum": parserEnum,
        /**
         * @deprecated Use 'enum' member
         */
        enumeration: parserEnum,
        string: parserString,
        text: parserString,
        boolean: {
            tryParse: function (propMeta, v) {
                if (v === false || v === 0 || v === "0" || v === "false") {
                    // false, 0, "0", "false"
                    return { parsedValue: false };
                }
                else if (!v) {
                    // "", null, undefined, NaN etc.
                    return { parsedValue: null };
                }
                // everything else (including " ")
                return { parsedValue: true };
            }
        },
        uuid: {
            tryParse: function (propMeta, v) {
                if (utils.isGuid(v)) {
                    return { parsedValue: v };
                }
            }
        },
        timeSpan: parserTimespan
    };
    /**
     * Returns parser for VarType
     * @param {String} vt Primitive property type
     */
    function getParser(vt) {
        return exports.parsers[vt];
    }
    exports.getParser = getParser;
    var EnumHelper = /** @class */ (function () {
        function EnumHelper() {
        }
        EnumHelper.tryParse = function (flags, members, v) {
            var result = {};
            if (flags) {
                var parsed_1 = 0;
                var canParse = (typeof v === "string") && v.trim().split(",").every(function (vName) {
                    vName = vName.trim();
                    var member = members[vName];
                    if (!member) {
                        member = lang.find(members, function (m) { return m.descr === vName; });
                    }
                    if (member) {
                        parsed_1 = parsed_1 | member.value;
                        return true;
                    }
                    return false;
                });
                if (canParse) {
                    result.parsedValue = parsed_1;
                }
                else {
                    result.errorMsg = "Can't parse value '" + v + "' for flags";
                }
            }
            else {
                if (typeof v === "string") {
                    var member = members[v];
                    if (!member) {
                        member = lang.find(members, function (m) { return m.descr === v; });
                    }
                    if (member) {
                        result.parsedValue = member.value;
                    }
                }
                if (!result.hasOwnProperty("parsedValue")) {
                    result.errorMsg = "Can't parse value '" + v + "' for enum";
                }
            }
            return result;
        };
        return EnumHelper;
    }());
    exports.EnumHelper = EnumHelper;
    // backward compatibility
    exports.parsers["getParser"] = getParser;
    function parseDateFacet(propMeta, facetName) {
        var val = propMeta[facetName], parseResult = getParser(propMeta.vt).tryParse(propMeta, val, false);
        if (parseResult) {
            if (parseResult.errorMsg) {
                throw new Error("Incorrect '" + facetName + "' facet definition for prop '" + propMeta.name + "'. " + parseResult.errorMsg);
            }
            if (parseResult.parsedValue !== undefined) {
                val = parseResult.parsedValue;
            }
        }
        return val;
    }
    function formatDateTime(date, propMeta) {
        return formatters.formatPropValue(propMeta, new Date(date)).toString();
    }
    function format(message, propMeta) {
        return (propMeta.descr || propMeta.name) + ": " + message;
    }
    /**
     * Property facets
     */
    exports.facets = {
        maxLen: {
            validate: function (v, propMeta) {
                if (v && v.length > propMeta.maxLen) {
                    var message = resources["validation.maxLen"] + propMeta.maxLen;
                    return this.format(message, propMeta);
                }
            }
        },
        minLen: {
            validate: function (v, propMeta) {
                if (v && v.length < propMeta.minLen) {
                    var message = resources["validation.minLen"] + propMeta.minLen;
                    return this.format(message, propMeta);
                }
            }
        },
        minValue: {
            validate: function (v, propMeta) {
                if (v != null && propMeta.minValue != null) {
                    // v < propMeta.minValue
                    if (exports.NumberComparer.lt(v, propMeta.minValue)) {
                        var message = resources["validation.minValue"] + propMeta.minValue;
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        maxValue: {
            validate: function (v, propMeta) {
                if (v != null && propMeta.maxValue != null) {
                    // v > propMeta.maxValue
                    if (exports.NumberComparer.gt(v, propMeta.maxValue)) {
                        var message = resources["validation.maxValue"] + propMeta.maxValue;
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        range: {
            validate: function (v, propMeta) {
                var range = propMeta.range;
                if (range && v != null) {
                    if (!lang.isArray(range) || range.length !== 2) {
                        throw new Error("Incorrect 'range' facet definition for prop " + propMeta.name + ": expected two-value array");
                    }
                    var minValue = range[0], maxValue = range[1];
                    // if (v < minValue || v > maxValue)
                    if (exports.NumberComparer.lt(v, minValue) || exports.NumberComparer.gt(v, maxValue)) {
                        var message = resources["validation.range"] + "[" + minValue + "; " + maxValue + "] " +
                            resources["validation.inclusive"];
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        pattern: {
            validate: function (v, propMeta) {
                if (propMeta.pattern) {
                    var pattern = /^\/(.*)\/(.*)/.exec(propMeta.pattern);
                    if (!pattern) {
                        throw new Error("Incorrect 'pattern' facet definition for prop " + propMeta.name + ": expected /pattern/modifiers");
                    }
                    var regexp = RegExp.apply(undefined, pattern.slice(1));
                    if (v && !regexp.test(v)) {
                        var message = propMeta.patternMsg || resources["validation.pattern"] + "'" + propMeta.pattern + "'";
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        minInclusive: {
            validate: function (v, propMeta) {
                if (propMeta.minInclusive) {
                    var minInclusive = parseDateFacet(propMeta, "minInclusive");
                    if (v && v < minInclusive) {
                        var message = resources["validation.minInclusive"] +
                            formatDateTime(minInclusive, propMeta) + resources["validation.inclusive"];
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        maxInclusive: {
            validate: function (v, propMeta) {
                if (propMeta.maxInclusive) {
                    var maxInclusive = parseDateFacet(propMeta, "maxInclusive");
                    if (v && v > maxInclusive) {
                        var message = resources["validation.maxInclusive"] +
                            formatDateTime(maxInclusive, propMeta) + resources["validation.inclusive"];
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        minExclusive: {
            validate: function (v, propMeta) {
                if (propMeta.minExclusive) {
                    var minExclusive = parseDateFacet(propMeta, "minExclusive");
                    if (v && v <= minExclusive) {
                        var message = resources["validation.minExclusive"] + formatDateTime(minExclusive, propMeta);
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        maxExclusive: {
            validate: function (v, propMeta) {
                if (propMeta.maxExclusive) {
                    var maxExclusive = parseDateFacet(propMeta, "maxExclusive");
                    if (v && v >= maxExclusive) {
                        var message = resources["validation.maxExclusive"] + formatDateTime(maxExclusive, propMeta);
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        totalDigits: {
            validate: function (v, propMeta) {
                if (v && propMeta.totalDigits != null) {
                    if (v.toString().replace(/[,.\s]/g, "").length > propMeta.totalDigits) {
                        var message = resources["validation.totalDigits"] + propMeta.totalDigits;
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        fractionDigits: {
            validate: function (v, propMeta) {
                if (v && propMeta.fractionDigits != null) {
                    var fractionDigits = propMeta.fractionDigits, parts = v.toString().split(".");
                    if (parts.length > 1 && parts[1].length > fractionDigits) {
                        var message = resources["validation.fractionDigits"] + propMeta.fractionDigits;
                        return this.format(message, propMeta);
                    }
                }
            }
        },
        "enum": {
            validate: function (v, propMeta) {
                if (v === null || v === undefined) {
                    return;
                }
                var enumMeta = propMeta.ref, members = enumMeta.members, flags = lang.coalesce(propMeta["flags"], enumMeta.flags);
                if (flags) {
                    var fullMask_1 = enumMeta.fullMask;
                    if (!fullMask_1) {
                        // flags was set for prop not enum, we have to evaluate fullMask
                        fullMask_1 = 0;
                        lang.forEach(members, function (member) {
                            fullMask_1 = fullMask_1 | member.value;
                        });
                    }
                    if (typeof v === "number" && ((v & fullMask_1) === v)) {
                        return;
                    }
                }
                else {
                    if ((typeof v === "number" || typeof v === "string") &&
                        lang.some(members, function (member) {
                            return member.value === v;
                        })) {
                        return;
                    }
                    else if (typeof v === "string" && members.hasOwnProperty(v)) {
                        return;
                    }
                }
                var message = resources["validation.enum"] + "'" + enumMeta.descr + "'";
                return this.format(message, propMeta);
            }
        },
        nullable: {
            validate: function (v, propMeta) {
                if (!propMeta.nullable && (v === null || v === undefined || v === "")) {
                    return this.format(resources["validation.nullable"], propMeta);
                }
            }
        }
    };
    // Post-initialize facets implementations - add names & format method
    lang.forEach(exports.facets, function (facet, name) {
        facet.name = name;
        facet.format = format;
        // NOTE: emit 'format' method in every rule to be able to override it later.
    });
    function shouldValidateProp(viewModel, propMeta) {
        return propMeta.rules && propMeta.rules.length || !propMeta.nullable ||
            viewModel["validate" + utils.toUpperCamel(propMeta.name)];
    }
    exports.shouldValidateProp = shouldValidateProp;
    /**
     * Validate an object property
     * @param {Object} viewModel Owner of the property
     * @param {String|Object} prop Property metadata or name
     */
    function validateProp(viewModel, prop) {
        var propMeta = lang.isString(prop) && viewModel.meta ? viewModel.meta.props[prop] : prop;
        if (!propMeta.name) {
            return null;
        }
        if (!shouldValidateProp(viewModel, propMeta)) {
            return null;
        }
        var propValue = lang.get(viewModel, propMeta.name);
        // facets' rules & custom rules:
        var rules = {};
        //	1. combine
        if (propMeta.rules && propMeta.rules.length) {
            for (var i = 0; i < propMeta.rules.length; i++) {
                var rule = propMeta.rules[i];
                rules[rule.name || ("custom-rule" + i)] = rule;
            }
        }
        if (propMeta.nullable) {
            rules.nullable = undefined;
        }
        else if (!rules.nullable) {
            rules.nullable = exports.facets.nullable;
        }
        // 	2. execute rules
        //  execute not-null rule first
        if (rules.nullable) {
            var violation = executeRule(rules.nullable, viewModel, propValue, propMeta);
            if (violation) {
                return violation;
            }
        }
        var ruleNames = Object.keys(rules);
        for (var i = 0; i < ruleNames.length; i++) {
            if (ruleNames[i] !== "nullable") {
                var rule = rules[ruleNames[i]];
                var violation = executeRule(rule, viewModel, propValue, propMeta);
                if (violation) {
                    return violation;
                }
            }
        }
        // custom validateProp methods:
        var validateFn = "validate" + utils.toUpperCamel(propMeta.name);
        if (viewModel[validateFn]) {
            var error = viewModel[validateFn](propValue, propMeta);
            if (error) {
                return createViolation(error, viewModel, propMeta);
            }
        }
    }
    exports.validateProp = validateProp;
    function executeRule(rule, viewModel, propValue, propMeta) {
        if (rule) {
            var error = rule.validate(propValue, propMeta);
            if (error) {
                var violation = createViolation(error, viewModel, propMeta);
                if (rule.name) {
                    violation.rule = rule.name;
                }
                return violation;
            }
        }
    }
    function createViolation(error, object, prop) {
        if (!error) {
            return;
        }
        var violation = (lang.isString(error) || formatters.isHtml(error)) ? { error: error } : error;
        if (object) {
            violation.object = object;
        }
        if (prop) {
            var propName = lang.isString(prop) ? prop : prop.name;
            if (propName && (!violation.props || violation.props.length === 0)) {
                violation.props = [propName];
            }
            var readOnly = !lang.isString(prop) && prop.readOnly;
            if (readOnly) {
                violation.severity = "warning";
            }
        }
        return violation;
    }
    exports.createViolation = createViolation;
    function validateObjectProps(viewModel) {
        var props = viewModel.meta && viewModel.meta.props;
        if (!props) {
            return;
        }
        var violations;
        lang.forEach(props, function (propMeta) {
            var violation = validateProp(viewModel, propMeta);
            if (violation) {
                violations = violations || [];
                violations.push(violation);
            }
        });
        return violations;
    }
    exports.validateObjectProps = validateObjectProps;
    /**
     * Join several violations descriptions.
     * @param {Array|Object|String} appendix Array of violation, single violation object or just error message
     * @param {Array} [violations] Optional array of violations to join with
     * @return {Array} Array of violations (or undefined if objViol and violations both are undefined)
     */
    function appendViolation(appendix, violations) {
        if (appendix) {
            violations = violations || [];
            var appendixArray = lang.array(appendix);
            for (var _i = 0, appendixArray_1 = appendixArray; _i < appendixArray_1.length; _i++) {
                var obj = appendixArray_1[_i];
                var viol = lang.isString(obj) ? { error: obj } : obj;
                violations.push(viol);
            }
        }
        return violations;
    }
    exports.appendViolation = appendViolation;
    /**
     * Validate object: execute type's and object's rules and validate method.
     * @param {Object} viewModel
     */
    function validateObject(viewModel) {
        var rules, violations;
        if (viewModel.meta && (rules = viewModel.meta.rules)) {
            for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                var rule = rules_1[_i];
                var viol = rule.validate(viewModel);
                if (viol) {
                    violations = appendViolation(viol, violations);
                }
            }
        }
        if (viewModel.validate) {
            var viol = viewModel.validate();
            if (viol) {
                violations = appendViolation(viol, violations);
            }
        }
        // set up the current object into every violation (if it has no object)
        if (violations && violations.length > 0) {
            for (var _a = 0, violations_1 = violations; _a < violations_1.length; _a++) {
                var viol = violations_1[_a];
                if (!viol.object) {
                    viol.object = viewModel;
                }
            }
        }
        return violations;
    }
    exports.validateObject = validateObject;
    function validateObjectWithProps(object) {
        var violations1 = validateObjectProps(object), violations2 = validateObject(object);
        return appendViolation(violations2, violations1);
    }
    exports.validateObjectWithProps = validateObjectWithProps;
});
//# sourceMappingURL=validation.js.map