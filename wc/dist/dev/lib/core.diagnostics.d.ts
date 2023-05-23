/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
/**
 * @exports "core.diagnostics"
 */
export declare enum levels {
    off = 0,
    error = 1,
    warn = 2,
    info = 3,
    trace = 4,
    debug = 5,
}
export declare let defaultLevel: levels;
export declare const defaultLevelKey = "diagnostics.tracing.defaultLevel";
export declare function setSourceLevel(className: string, level: string | levels): void;
export declare function setDefaultLevel(level: levels | string | number): void;
export declare function getSourceLevel(className: string): levels;
export declare class TraceSource {
    className: string;
    name: string;
    private _level;
    /**
     * @constructs TraceSource
     * @param {String} [className] class/category name of the source
     * @param {String} [name] name of the instance (to distinguish several sources of the same class)
     */
    constructor(className: string, name?: string);
    enabled(level: string | levels): boolean;
    protected _writeIf(level: levels, methodName: string, originalArgs: any): void;
    setLevel(level: levels): void;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    time(...args: any[]): void;
    timeEnd(...args: any[]): void;
}
