/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import "vendor/jquery.scrollTo";
/**
 * @exports "core.html"
 */
export declare const $document: JQuery;
export declare const $window: JQuery;
export declare const $body: JQuery;
export declare let platform: {
    isMobileDevice: any;
};
declare global  {
    interface Window {
        preventWindowUnload(): void;
    }
}
export declare function isVisible(element: HTMLElement | JQuery): boolean;
export declare function findEffectiveStyleProperty(element: HTMLElement, property: string): any;
export declare function findEffectiveStyle(element: HTMLElement): CSSStyleDeclaration;
/**
 * Concatenates string and className using space as separator. Doesn't check for duplicates.
 * @param s
 * @param className
 * @returns {string}
 */
export declare function appendCssClass(s: string, className: string): string;
/**
 * Concatenates string and className using space as separator. Doesn't modify input string if it already contains className.
 * @param s
 * @param className
 * @returns {string}
 */
export declare function addCssClass(s: string, className: string): string;
export declare function removeCssClass(s: string, className: string): string;
/**
 * Return display viewport (display viewport defers from layout viewport on mobile device)
 * @returns {{height: Number, width: Number}}
 */
export declare function getDisplayViewport(): {
    height: number;
    width: number;
};
/**
 * Scroll document to element
 * @param {Object|HTMLElement|jQuery} options an options or HTMLElement (see. options.element)
 * @param {HTMLElement|jQuery} options.element An element to scroll to
 * @param {String} [options.align="top"] align mode: "top", "bottom", "center"
 * @param {Number} [options.margin=0] margin for top/bottom align
 * @param {{top:Number,height:Number}} [options.viewport]
 * @param {Function} [options.onAfter] Function to be called after the scrolling ends
 */
export declare function scrollToElement(options: HTMLElement | JQuery | scrollToElement.Options): void;
export declare namespace scrollToElement {
    interface Options {
        element?: HTMLElement | JQuery;
        align?: "top" | "bottom" | "center";
        onAfter?: () => void;
        /**
         * Scroll even if the element is visible in viewport
         */
        force?: boolean;
    }
}
/**
 * Check whether document's root is wider than browser screen, i.e. there should be horizontal scrollbar (if "overflow-x:auto")
 * @returns {boolean}
 */
export declare function isDocumentHScrollable(): boolean;
/**
 * Find focused DOM element
 * @returns {HTMLElement} focused DOM element or null
 */
export declare function focused(): Element;
/**
 * Collection of keyboard constants with some support functions
 */
export declare const keyCode: {
    BACKSPACE: number;
    TAB: number;
    ENTER: number;
    ESCAPE: number;
    SPACE: number;
    PAGE_UP: number;
    PAGE_DOWN: number;
    END: number;
    HOME: number;
    LEFT: number;
    UP: number;
    RIGHT: number;
    DOWN: number;
    INSERT: number;
    DELETE: number;
    NUM_0: number;
    NUM_1: number;
    NUM_2: number;
    NUM_3: number;
    NUM_4: number;
    NUM_5: number;
    NUM_6: number;
    NUM_7: number;
    NUM_8: number;
    NUM_9: number;
    C: number;
    D: number;
    F: number;
    NUMPAD_MULTIPLY: number;
    NUMPAD_ADD: number;
    NUMPAD_ENTER: number;
    NUMPAD_SUBTRACT: number;
    NUMPAD_DECIMAL: number;
    NUMPAD_DIVIDE: number;
    COMMA: number;
    PERIOD: number;
    F1: number;
    F2: number;
    F3: number;
    F4: number;
    F5: number;
    F6: number;
    F7: number;
    F8: number;
    F9: number;
    F10: number;
    F11: number;
    F12: number;
    isNavigationKey: (keyEvent: JQueryKeyEventObject) => boolean;
    isDigit: (keyEvent: JQueryKeyEventObject) => boolean;
    isF: (keyEvent: JQueryKeyEventObject) => boolean;
};
/**
 * Appends overlayer element (popup, dropdown ect.) to DOM in order to show it over other elements
 * @param {HTMLElement|jQuery} overlayer an element to overlay
 * @param {HTMLElement|jQuery} [owner] an element in main markup, which owns the overlayer (e.g. input element for dropdown)
 * @returns {jQuery} a target element where the 'overlayer' is appended to (if any) or an empty jQuery set.
 */
export declare function overlay(overlayer: JQuery | HTMLElement, owner?: JQuery | HTMLElement): JQuery;
export declare namespace overlay {
    let targets: string[];
}
export declare function notifyDOMChanged(element?: JQuery | HTMLElement): void;
export interface DOMChangedEventData {
    binding?: boolean;
}
export declare class WindowResizeEvent extends lang.Event {
    private _onResizeDebounced;
    constructor();
    onResize(e: any): void;
    onFirstBind(): void;
    onLastUnbind(): void;
}
/**
 * Global debounced event 'window.resize'
 */
export declare const windowResize: WindowResizeEvent;
export declare function isExternalClick(e: JQueryEventObject): boolean;
