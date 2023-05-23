/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "i18n!lib/nls/resources", "moment", "lib/utils"], function (require, exports, lang, resources, moment, utils) {
    "use strict";
    exports.__esModule = true;
    var SafeHtmlImpl = /** @class */ (function () {
        /**
         * @constructs SafeHtml
         * @param {String} html
         * @param {String} text
         * @constructor
         */
        function SafeHtmlImpl(html, text) {
            this.text = text;
            this.html = html;
        }
        /**
         * Get html text.
         * Handlebars also checks method `toHTML` to detect SafeString object.
         * So class `SafeHtml` can be used in Handlebars templates to present HTML.
         * @returns {string}
         */
        SafeHtmlImpl.prototype.toHTML = function () {
            return "" + this.html;
        };
        /**
         * Get text with stripped out html.
         * @returns {string}
         */
        SafeHtmlImpl.prototype.toString = function () {
            return "" + (this.text !== undefined ? this.text : lang.htmlText(this.html));
        };
        return SafeHtmlImpl;
    }());
    /**
     * Returns default function-formatter for prop metadata.
     * @param {Object} propMeta a property metadata
     * @return {Function} A function that accepts two arguments (propMeta,value) and return a formatted string (`fn(propMeta, value):string`)
     */
    function getDefaultFormatter(propMeta) {
        switch (propMeta.vt) {
            case "ui1":
            case "i2":
            case "i4":
            case "i8":
            case "float":
            case "double":
            case "decimal":
                return number;
            case "date":
            case "time":
            case "dateTime":
            case "timeTz":
            case "dateTimeTz":
                return dateTime;
            case "boolean":
                return boolean;
            case "enum":
                return enumeration;
            case "timeSpan":
                return timeSpan;
        }
    }
    exports.getDefaultFormatter = getDefaultFormatter;
    function getDefaultFormatterHtml(propMeta) {
        if (propMeta.vt === "smallBin") {
            return binaryAsHtmlImage;
        }
        if (propMeta.vt === "text" && propMeta["contentType"] === "html") {
            return textHtmlAsHtml;
        }
        if (propMeta["readOnly"])
            if ((propMeta.vt === "text") || (propMeta.vt === "string" && propMeta["isMultiline"])) {
                return wrapMultilineText;
            }
    }
    exports.getDefaultFormatterHtml = getDefaultFormatterHtml;
    function wrapMultilineText(propMeta, val) {
        var textValue = "";
        if (val == null) {
            textValue = "";
        }
        else if (isHtml(val)) {
            textValue = val.toHTML();
        }
        else {
            textValue = textAsHtml(val.toString());
        }
        return "<div class=\"multiline-text\">" + textValue + "</div>";
    }
    exports.wrapMultilineText = wrapMultilineText;
    function binaryAsHtmlImage(propMeta, value) {
        if (propMeta["contentType"] === "image") {
            var dataUrl = "data:image;base64," + value;
            return "<img src='" + dataUrl + "'>";
        }
    }
    exports.binaryAsHtmlImage = binaryAsHtmlImage;
    function textHtmlAsHtml(propMeta, value) {
        return value;
    }
    function enumeration(propMeta, value) {
        var enumMeta = propMeta.ref;
        // NOTE: propMeta["flags"] for TS 2.1 compatibility
        var flags = lang.coalesce(propMeta["flags"], enumMeta.flags);
        return EnumHelper.formatValue(flags, enumMeta.members, value);
        // NOTE: до 1.35 мы вызывали instance-метод enum'a, поэтому теряли flags для свойства:
        // return (<EnumMeta>propMeta.ref).formatValue(value);
    }
    exports.enumeration = enumeration;
    var EnumHelper = /** @class */ (function () {
        function EnumHelper() {
        }
        EnumHelper.getMember = function (members, v) {
            for (var memberName in members) {
                var member = members[memberName];
                if (member.value === v) {
                    return member;
                }
                if (typeof v === "object" && v && v.toString() === member.value.toString()) {
                    return member;
                }
            }
            return null;
        };
        EnumHelper.getMembers = function (members, v) {
            var res = [];
            for (var memberName in members) {
                var member = members[memberName];
                if (v === 0 && member.value === 0) {
                    return [member];
                }
                if (v !== 0 && member.value !== 0 && (v & member.value) === member.value) {
                    res.push(member);
                }
            }
            return res;
        };
        EnumHelper.formatValue = function (flags, members, v) {
            var result = v;
            if (!flags) {
                if (typeof v === "number") {
                    var member = EnumHelper.getMember(members, v);
                    if (member) {
                        result = (member.descr || member.name);
                    }
                }
            }
            else {
                if (typeof v === "number") {
                    result = "";
                    for (var _i = 0, _a = EnumHelper.getMembers(members, v); _i < _a.length; _i++) {
                        var member = _a[_i];
                        if (result)
                            result += ", ";
                        result += (member.descr || member.name);
                    }
                }
            }
            return result;
        };
        return EnumHelper;
    }());
    exports.EnumHelper = EnumHelper;
    exports.defaultFormats = {
        // localized moment's formats, see http://momentjs.com/docs/#/displaying/format/
        "date": "L",
        "time": "LT",
        "dateTime": "L LT",
        "timeTz": "LT Z",
        "dateTimeTz": "L LT Z",
        "timeSpan": "dhm"
    };
    function dateTime(propMeta, value) {
        if (value) {
            var format = propMeta.format || exports.defaultFormats[propMeta.vt];
            value = moment(value).format(format);
        }
        return value;
    }
    exports.dateTime = dateTime;
    function boolean(propMeta, value) {
        if (value == null) {
            return "";
        }
        return value ? resources.yes : resources.no;
    }
    exports.boolean = boolean;
    function timeSpan(propMeta, value) {
        var formatted = value, parsed, unit;
        parsed = utils.splitDuration(value, propMeta.format || exports.defaultFormats[propMeta.vt]);
        if (parsed) {
            formatted = "";
            for (unit in parsed) {
                if (parsed.hasOwnProperty(unit)) {
                    formatted += parsed[unit] + resources["timeSpan." + unit] + " ";
                }
            }
        }
        return formatted;
    }
    exports.timeSpan = timeSpan;
    function number(propMeta, value) {
        // NOTE: у Number.toString есть параметр radix, поэтому явно вызываем toString без параметра,
        // чтобы случайно не передать значение formatterName в toString в методе formatPropValue,
        // кроме того вызов Number.toString.call(2, "") сломается в IE8
        var text = value ? value.toString() : value;
        if (propMeta && propMeta.format && propMeta.format.decimalSeparator)
            text = text.replace(".", propMeta.format.decimalSeparator);
        return text;
    }
    exports.number = number;
    /**
     * Format arbitrary object's property value.
     * @param {Object} propMeta metadata of the prop
     * @param {*} propValue property value to format
     * @return {String} formatted property value
     */
    function formatPropValue(propMeta, propValue) {
        if (propValue == null) {
            return "";
        }
        if (!propMeta) {
            return "" + propValue;
        }
        // NOTE: during model initialization default formatters were set for all properties (see domain.js:postprocessEntity)
        var formatter = propMeta.formatter;
        if (lang.isFunction(formatter)) {
            return formatter(propValue, propMeta);
        }
        // NOTE: в propMeta.formatter должно быть тоже самое, что возвращает  getDefaultFormatter
        // 	(только обернутое в функцию для подставления метаданных свойства),
        //	но на случай, если нас вызывают не для метасвойства типа, а, например, для редактора кастомного свойства,
        // 	получим форматтер еще раз (по типу свойства vt)
        var metaFormatter = getDefaultFormatter(propMeta);
        if (lang.isFunction(metaFormatter)) {
            return metaFormatter(propMeta, propValue);
        }
        if (propMeta.html) {
            metaFormatter = getDefaultFormatterHtml(propMeta);
            if (lang.isFunction(metaFormatter)) {
                // явно заданна опция html - используем дефолтный html-форматтер для свойства,
                // html-форматтер возвратает html-текст, но результате метода formatPropValue воспринимается как текст,
                // который надо энкодить (unsafe), поэтому обернем его в safeHtml.
                return safeHtml(metaFormatter(propMeta, propValue));
            }
        }
        return propValue.toString(propMeta.formatterName || propMeta.formatter);
    }
    exports.formatPropValue = formatPropValue;
    /**
     * Format prop value as HTML using html-formatters (from propMeta or default for vartype).
     * Important: you can use this function without additional html encoding (e.g. {{{formatPropHtml}}} in template)
     * as it encode all prop values if there's no html-formatter specified.
     * If there's a html-formatter then there will be no html-encoding - it's totally up to the formatter.
     * @param {Object} propMeta
     * @param {any} propValue
     * @returns {string}
     */
    function formatPropHtml(propMeta, propValue) {
        if (!propMeta || propValue == null) {
            return "";
        }
        if (propMeta.html === false) {
            // html-форматирование явно отключено
            return lang.encodeHtml(formatPropValue(propMeta, propValue).toString());
        }
        var formatterHtml = propMeta.formatterHtml;
        if (lang.isFunction(formatterHtml)) {
            // явно заданный html-форматтер для свойства
            return formatterHtml(propValue, propMeta);
        }
        var metaFormatter = getDefaultFormatterHtml(propMeta);
        if (lang.isFunction(metaFormatter)) {
            // явно заданный html-форматтер для свойства
            return metaFormatter(propMeta, propValue);
        }
        // иначе используем текстовое представление
        // Т.к. данная функция возвращает html, то логично, что она может использоваться
        // в шаблоне без дополнительно html-энкодинга: {{{formatPropHtml}}}
        // Но, если мы выводим значение string/text свойств, то это очень опасно,
        // т.к. содержимое может быть html-кодом - имеем XSS.
        // Поэтому, при отсутствии явного html-форматтера, содержимое свойства мы явно энкодим.
        // Исключение составляет случай, если текст-форматтер вернул SafeHtml
        var val = formatPropValue(propMeta, propValue);
        if (val == null) {
            return "";
        }
        if (isHtml(val)) {
            return val.toHTML();
        }
        return textAsHtml(val.toString());
    }
    exports.formatPropHtml = formatPropHtml;
    function isHtml(str) {
        return !!(str && str.toHTML);
    }
    exports.isHtml = isHtml;
    function safeHtml(html, text) {
        return new SafeHtmlImpl(html, text);
    }
    exports.safeHtml = safeHtml;
    /**
     * Format a string for displaying as html. This includes encoding all special symbols ('<', '>') and
     * converting some symbols into html entities (space - &nbps, '&' - &amp;).
     * @param {String} text
     * @param {Boolean} whitespaces - encode spaces as &nbsp;
     * @returns {string}
     */
    function textAsHtml(text, whitespaces) {
        text = lang.encodeHtml(text, whitespaces);
        // TODO: iconize emoji (or something else)
        //if (col.iconizeEmoji)
        //	return twemoji.parse(text, {size: 16});
        return text;
    }
    exports.textAsHtml = textAsHtml;
});
//# sourceMappingURL=formatters.js.map