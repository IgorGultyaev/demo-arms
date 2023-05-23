/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Big = require("big");
import "vendor/jquery.mousewheel";
declare class InputSpinner extends core.lang.CoreClass {
    static defaultOptions: InputSpinner.Options;
    options: InputSpinner.Options;
    $input: JQuery;
    $btnUp: JQuery;
    $btnDown: JQuery;
    private _mouseTimeout;
    private _mouseInterval;
    private min;
    private max;
    constructor(options: InputSpinner.Options);
    attach(input: Element | JQuery, btnUp?: Element | JQuery, btnDown?: Element | JQuery): void;
    detach(): void;
    increase(): void;
    decrease(): void;
    /**
     * Normalize value (val) to allowed range (min/max).
     * @param val
     * @param autoCorrect
     * @returns {any}
     * @private
     */
    protected _normalizeValue(val: any, autoCorrect: boolean): number | Big;
    protected _parseValue(s: string): number;
    protected _formatValue(v: any): string;
    protected _incValue(increment: number): void;
    protected _onInputKeydown(e: JQueryEventObject): void;
    protected _onInputMousewheel(e: any): void;
    protected _onInputBlur(): void;
    protected _onBtnUpMouseDown(): void;
    protected _onBtnDownMouseDown(): void;
    protected _onButtonsMouseDown(isUp: boolean): void;
    protected _onButtonsMouseUp(): void;
}
declare namespace InputSpinner {
    interface Options {
        min?: number | Big | string;
        max?: number | Big | string;
        step?: number;
        initial?: number;
        formatter?: (v: number) => string;
        parser?: (text: string) => number;
        /**
         * Auto correct value on blur and increase/decrease to nearest boundary
         */
        autoCorrect?: boolean;
    }
}
export = InputSpinner;
