/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
/**
 * @exports utils
 */
declare let utils: {
    reGuid: RegExp;
    generateGuid: () => string;
    generateGuidSilly: () => string;
    isGuid(v: string): boolean;
    toLowerCamel(s: string): string;
    toUpperCamel(s: string): string;
    Deferred: <T>(beforeStart?: (deferred: JQueryDeferred<T>) => any) => JQueryDeferred<T>;
    clear: (obj: Object) => void;
    combinePaths(path1: string, path2: string): string;
    parseObject(anObj: Object): void;
    mergeOptions(staticOptions: Object, options: Object): Object;
    subscribeOnEvents(owner: lang.IEventful, options: Object, events: Object | any[]): void;
    formatNumber(val: string | number, separator?: string): string;
    formatNumeral(v: number, forms: string[]): string;
    kilobyte: number;
    megabyte: number;
    gigabyte: number;
    terabyte: number;
    formatSize(size: number): string;
    formatDatetimeAgo(v: string | Date): string;
    splitDuration(milliseconds: number, format: string | string[]): Object;
    paramsToQueryString(params: Object): string;
    extendViewModel: (viewModel: any, extender: any) => any;
    parseUriParams(uriParams: string): Object;
    buildUriParams(paramsObj: Object, prefix?: string): string;
};
export = utils;
