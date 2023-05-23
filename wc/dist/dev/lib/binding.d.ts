/// <reference path=".stubs.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import { IDisposable } from "lib/core.lang";
import { ICommand } from "lib/core.commands";
/**
 * Bindable object.
 * @typedef {Object} Bindable
 * @property {Function} get
 * @property {Function} set
 * @property {Function} onchange
 * @property {Function} ondispose
 * @property {Function} setError
 */
export interface IBindable {
    get?(): any;
    set?(v: any): void;
    onchange?(handler: (e) => void): IDisposable;
    setError?(error: any): void;
    ondispose?(disposable: IDisposable): void;
}
/**
 * Bind two bindable objects to each other.
 * @param {Bindable} target
 * @param {Bindable} source
 * @param {object} [options]
 * @param {boolean} [options.oneway] if true that bind target to source only, otherwise bind source to target as well
 * @returns {{dispose:function}} disposable to break the binding
 */
export declare function databind(target: IBindable, source: IBindable, options?: databind.Options): IDisposable;
export declare namespace databind {
    interface Options {
        /**
         * Create only one way binding (from source to target)
         */
        oneway?: boolean;
        /**
         * A delay in milliseconds for calling source.set(v)
         */
        debounceSource?: number;
        /**
         * A delay in milliseconds for calling target.set(v)
         */
        debounceTarget?: number;
    }
}
/**
 * @deprecated Use lang.support.loadingValue instead
 */
export declare const loading: {
    toString: () => string;
};
export declare const htmlBindingOptions: {
    text: {
        accessor: {
            (): string;
            (text: string | number | boolean): JQuery;
            (func: (index: number, text: string) => string): JQuery;
        };
        parse: (v: any) => string;
    };
    html: {
        accessor: {
            (): string;
            (htmlString: string): JQuery;
            (func: (index: number, oldhtml: string) => string): JQuery;
        };
        parse: (v: any) => string;
    };
    value: {
        event: string;
        accessor: {
            (): any;
            (value: string | number | string[]): JQuery;
            (func: (index: number, value: string) => string): JQuery;
        };
        parse: (v: any) => string;
    };
    valueLive: {
        event: string;
        accessor: {
            (): any;
            (value: string | number | string[]): JQuery;
            (func: (index: number, value: string) => string): JQuery;
        };
        parse: (v: any) => string;
        eventHandler: (e: any) => void;
    };
    disabled: {
        accessor: (v: any) => any;
        parse: (v: any) => boolean;
    };
    enabled: {
        accessor: (v: any) => boolean;
        parse: (v: any) => boolean;
    };
    readonly: {
        accessor: (v: any) => any;
        parse: (v: any) => boolean;
    };
    visibility: {
        accessor: (v: any) => boolean;
        parse: (v: any) => boolean;
    };
    hidden: {
        accessor: (v: any) => boolean;
        parse: (v: any) => boolean;
    };
    transparent: {
        accessor: (v: any) => boolean;
        parse: (v: any) => boolean;
    };
    checked: {
        getSpecific: ($element: any) => {
            eventHandler: (e: any) => void;
        };
        event: string;
        accessor: (v: any) => boolean;
        parse: (v: any) => boolean;
    };
    radioGroup: {
        event: string;
        group: any;
        getSpecific: () => {
            accessor: (v: any) => any;
        };
    };
    checkedNull: {
        event: string;
        accessor: (v: any) => boolean;
    };
    select: {
        event: string;
        accessor: {
            (): any;
            (value: string | number | string[]): JQuery;
            (func: (index: number, value: string) => string): JQuery;
        };
        parse: (v: any) => string;
    };
    optionsSource: {
        accessor: (source: any) => void;
    };
    cssClass: {
        accessor: (value: any) => any;
    };
    cssClassToggle: {
        cssClass: any;
        getSpecific: ($element: any) => {
            accessor: (value: any) => void;
        };
    };
};
export declare function setupNodeDisposables($element: JQuery): IDisposable[];
export declare const html: (el: JQuery | HTMLElement, options?: string | html.Options) => IBindable;
export declare namespace html {
    /**
     * Binding options (specification)
     */
    interface Options {
        /**
         * Binding name
         */
        name?: string;
        /**
         * callback returning an object for bindable - can be used for runtime customization
         * (e.g. using of arguments in accessor function).
         */
        getSpecific?: (selector: JQuery) => html.Options;
        /**
         * function-accessor for setting and getting value to/from html-element
         */
        accessor?: Function;
        parse?: Function;
        event?: string;
        /**
         * An additional handler bound to the event
         */
        eventHandler?: Function;
        [key: string]: any;
    }
}
export declare const expr: (source: any, expr: Function | string) => IBindable;
export declare const domain: (source: any, expr: Function | string) => IBindable;
export declare function commandBind(element: JQuery | HTMLElement, cmd: ICommand, args?: any): IDisposable;
