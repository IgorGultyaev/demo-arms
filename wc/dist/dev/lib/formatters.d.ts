/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import { metadata } from "lib/domain/.domain";
import PropertyMeta = metadata.PropertyMeta;
import ValueType = metadata.ValueType;
export interface SafeHtml {
    toHTML(): string;
}
export interface Format {
    /**
     * Decimal separator for number properties
     */
    decimalSeparator?: string;
}
export interface FormatOptions {
    /**
     * Property type (for navigation properties - use "object")
     */
    vt?: ValueType;
    /**
     * A function returning string or html, used by `formatters.formatPropValue` method
     * @param v
     */
    formatter?: (v: any, opts?: FormatOptions) => string | SafeHtml;
    /**
     * A function returning html, used by `formatters.formatPropHtml` method
     * @param v
     */
    formatterHtml?: (v: any, opts?: FormatOptions) => string;
    /**
     * A format string for properties which supports it, currently it's date/time and timeSpan.
     * A format object for number properties.
     */
    format?: string | Format;
    /**
     * Formatter name for object property, its name passed to toString method of value objects.
     */
    formatterName?: string;
    /**
     * Disable html-formatting (false) or enable (true) default html-formatting if no other formatters were specified.
     */
    html?: boolean;
}
export declare type IPropFormatter = (propMeta: FormatOptions, value: any) => string;
/**
 * Returns default function-formatter for prop metadata.
 * @param {Object} propMeta a property metadata
 * @return {Function} A function that accepts two arguments (propMeta,value) and return a formatted string (`fn(propMeta, value):string`)
 */
export declare function getDefaultFormatter(propMeta: FormatOptions): IPropFormatter;
export declare function getDefaultFormatterHtml(propMeta: FormatOptions): IPropFormatter;
export declare function wrapMultilineText(propMeta: PropertyMeta, val: any): string;
export declare function binaryAsHtmlImage(propMeta: PropertyMeta, value: any): string;
export declare function enumeration(propMeta: PropertyMeta, value: any): string;
export declare class EnumHelper {
    static getMember(members: lang.Map<metadata.EnumMember>, v: any): metadata.EnumMember;
    static getMembers(members: lang.Map<metadata.EnumMember>, v: any): metadata.EnumMember[];
    static formatValue(flags: boolean, members: lang.Map<metadata.EnumMember>, v: any): any;
}
export declare let defaultFormats: {
    "date": string;
    "time": string;
    "dateTime": string;
    "timeTz": string;
    "dateTimeTz": string;
    "timeSpan": string;
};
export declare function dateTime(propMeta: PropertyMeta, value: any): string;
export declare function boolean(propMeta: PropertyMeta, value: any): string;
export declare function timeSpan(propMeta: PropertyMeta, value: any): string;
export declare function number(propMeta: PropertyMeta, value: any): string;
/**
 * Format arbitrary object's property value.
 * @param {Object} propMeta metadata of the prop
 * @param {*} propValue property value to format
 * @return {String} formatted property value
 */
export declare function formatPropValue(propMeta: FormatOptions, propValue: any): string | SafeHtml;
/**
 * Format prop value as HTML using html-formatters (from propMeta or default for vartype).
 * Important: you can use this function without additional html encoding (e.g. {{{formatPropHtml}}} in template)
 * as it encode all prop values if there's no html-formatter specified.
 * If there's a html-formatter then there will be no html-encoding - it's totally up to the formatter.
 * @param {Object} propMeta
 * @param {any} propValue
 * @returns {string}
 */
export declare function formatPropHtml(propMeta: FormatOptions, propValue: any): string;
export declare function isHtml(str: any): str is SafeHtml;
export declare function safeHtml(html: string, text?: string): SafeHtml;
/**
 * Format a string for displaying as html. This includes encoding all special symbols ('<', '>') and
 * converting some symbols into html entities (space - &nbps, '&' - &amp;).
 * @param {String} text
 * @param {Boolean} whitespaces - encode spaces as &nbsp;
 * @returns {string}
 */
export declare function textAsHtml(text: string, whitespaces?: boolean): string;
