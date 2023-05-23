/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang"], function (require, exports, lang) {
    "use strict";
    exports.__esModule = true;
    var timezoneRegex = /(Z|[+-]\d{2}:\d{2})$/;
    function getTimezoneOffsetMilliseconds(date) {
        return date.getTimezoneOffset() * 60000;
    }
    function parseAbstract(s) {
        // отбрасываем зону, добавляем Z
        var inputUtc = s.replace(timezoneRegex, "").concat("Z");
        var ms = Date.parse(inputUtc);
        if (ms) {
            ms = ms + getTimezoneOffsetMilliseconds(new Date(ms));
        }
        return new Date(ms || Date.parse(s));
    }
    function parseGlobal(s) {
        var inputUtc = timezoneRegex.test(s) ? s : s + "Z";
        var ms = Date.parse(inputUtc) || Date.parse(s);
        return new Date(ms);
    }
    /**
     * "Thu Jan 24 2013 12:30:14 GMT+0400 (MSK)" станет "2013-01-24T12:30:14.596"
     * @param {Date} date
     * @return {String} дата с асболютными значениями даты/времени как в переданной дате date,
     *                  но в фомате ISO и без "Z" на конце
     */
    function toISOAbstract(date) {
        // вычитаем смещение
        var s = new Date(date.getTime() - getTimezoneOffsetMilliseconds(date)).toISOString();
        // убираем Z в конце
        return s.replace(timezoneRegex, "");
    }
    /**
     * Парсит строку в формате ISO 8601 в Date
     * @param {string} s Входная строка в формате ISO 8601
     * @param {boolean} isGlobalTime Признак "глобального" времени:
     *  - если true, то время рассматривается как глобальное (учитывается временная зона);
     *  - если false, то время рассматривается как абстрактное (временная зона отбрасывается);
     *  - если второй аргумент не задан, то признак глобальность определяется исходя из строки (указана временная
     *  зона - время глобальное, нет - время абстрактное).
     * @return {Date}
     */
    function parseISOString(s, isGlobalTime) {
        if (!lang.isString(s)) {
            throw new TypeError("parseISOString: argument must be a string");
        }
        if (arguments.length <= 1) {
            isGlobalTime = timezoneRegex.test(s);
        }
        return isGlobalTime ? parseGlobal(s) : parseAbstract(s);
    }
    exports.parseISOString = parseISOString;
    /**
     * Преобразует значение типа Date в строку формата ISO 8601
     * @param {Date} date Входная дата
     * @param {boolean} isGlobalTime Признак "глобального" времени:
     *  - если true, то выходная строка содержит время в UTC и заканчивается на Z
     *  - если false или не задан, то текущая временная зона отбрасывается и выходная строка не содержит данных
     *  о временной зоне).
     * @return {string}
     */
    function toISOString(date, isGlobalTime) {
        if (!lang.isDate(date)) {
            throw new TypeError("toISOString: argument must be a Date");
        }
        return isGlobalTime ? date.toISOString() : toISOAbstract(date);
    }
    exports.toISOString = toISOString;
});
//# sourceMappingURL=datetimes.js.map