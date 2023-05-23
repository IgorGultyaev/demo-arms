/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import * as formatters from "lib/formatters";
import * as Big from "big";
import { IDomainObject, metadata } from "lib/domain/.domain";
import ValueType = metadata.ValueType;
import PropertyMetaRuntime = metadata.PropertyMetaRuntime;
import PropertyMetaBase = metadata.PropertyMetaBase;
import SafeHtml = formatters.SafeHtml;
export interface ParseResult {
    parsedValue?: any;
    errorMsg?: any;
}
export interface Parser {
    tryParse(propMeta: PropertyMetaBase, v: any, skipValidation?: boolean): ParseResult;
}
export interface NumberParser extends Parser {
    minValue: number;
    maxValue: number;
}
export interface BigNumberParser extends Parser {
    minValue: Big;
    maxValue: Big;
    minValueUnsafe?: Number;
    maxValueUnsafe?: Number;
}
export interface AnyParser extends Parser {
    [key: string]: any;
}
/**
 * Number comparer supporting Number and Big.
 */
export declare let NumberComparer: {
    lt: (l: string | number | Big, r: string | number | Big) => boolean;
    lte: (l: string | number | Big, r: string | number | Big) => boolean;
    gt: (l: string | number | Big, r: string | number | Big) => boolean;
    gte: (l: string | number | Big, r: string | number | Big) => boolean;
};
export interface ParserMap {
    [vt: string]: AnyParser;
    ui1?: NumberParser;
    i2?: NumberParser;
    i4?: NumberParser;
    i8?: BigNumberParser;
    float?: NumberParser;
    double?: NumberParser;
    decimal?: BigNumberParser;
    date?: Parser;
    time?: Parser;
    dateTime?: Parser;
    timeTz?: Parser;
    dateTimeTz?: Parser;
    string?: Parser;
    text?: Parser;
    boolean?: Parser;
    uuid?: Parser;
    timeSpan?: Parser;
    "enum"?: Parser;
}
/**
 * Property value parsers.
 */
export declare const parsers: ParserMap;
/**
 * Returns parser for VarType
 * @param {String} vt Primitive property type
 */
export declare function getParser(vt: ValueType): Parser;
export declare class EnumHelper {
    static tryParse(flags: boolean, members: lang.Map<metadata.EnumMember>, v: any): ParseResult;
}
export interface Violation {
    error?: string | SafeHtml;
    props?: string[];
    object?: any;
    severity?: ViolationSeverity;
    description?: string;
    /**
     * Name of rule which generates this violation
     */
    rule?: string;
}
export declare type ViolationSeverity = "critical" | "error" | "warning" | "info";
export interface Rule {
    name?: string;
    validate(v: any, propMeta: PropertyMetaRuntime): Violation | string;
}
export interface RuleFormatting extends Rule {
    /**
     * Formats an error message. Can be used in 'validate" method.
     * @param message
     * @param propMeta
     */
    format(message: string, propMeta: PropertyMetaRuntime): string;
}
export interface RuleMap extends lang.Map<Rule> {
    nullable?: Rule;
}
export interface ObjectRule {
    validate(v: any): Violation | string;
}
/**
 * Property facets
 */
export declare const facets: RuleMap;
export declare function shouldValidateProp(viewModel: any, propMeta: PropertyMetaRuntime): boolean;
/**
 * Validate an object property
 * @param {Object} viewModel Owner of the property
 * @param {String|Object} prop Property metadata or name
 */
export declare function validateProp(viewModel: any, prop: PropertyMetaRuntime | string): Violation;
export declare function createViolation(error: string | SafeHtml | Violation, object?: any, prop?: PropertyMetaRuntime | string): Violation;
export declare function validateObjectProps(viewModel: IDomainObject | any): Violation[];
/**
 * Join several violations descriptions.
 * @param {Array|Object|String} appendix Array of violation, single violation object or just error message
 * @param {Array} [violations] Optional array of violations to join with
 * @return {Array} Array of violations (or undefined if objViol and violations both are undefined)
 */
export declare function appendViolation(appendix: Violation[] | Violation | string, violations?: Violation[]): Violation[];
/**
 * Validate object: execute type's and object's rules and validate method.
 * @param {Object} viewModel
 */
export declare function validateObject(viewModel: IDomainObject | any): Violation[];
export declare function validateObjectWithProps(object: any): Violation[];
