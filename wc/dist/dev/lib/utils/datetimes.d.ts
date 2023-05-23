/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
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
export declare function parseISOString(s: string, isGlobalTime?: boolean): Date;
/**
 * Преобразует значение типа Date в строку формата ISO 8601
 * @param {Date} date Входная дата
 * @param {boolean} isGlobalTime Признак "глобального" времени:
 *  - если true, то выходная строка содержит время в UTC и заканчивается на Z
 *  - если false или не задан, то текущая временная зона отбрасывается и выходная строка не содержит данных
 *  о временной зоне).
 * @return {string}
 */
export declare function toISOString(date: Date, isGlobalTime?: boolean): string;
