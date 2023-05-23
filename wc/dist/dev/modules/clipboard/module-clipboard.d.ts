/// <reference path="core.ui.d.ts" />
/// <reference types="bootstrap" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import "xcss!modules/clipboard/styles/copy-button";
export declare let isSupported: boolean;
/**
 * Copies text data to clipboard
 * @param {string} data
 * @returns {boolean}
 */
export declare function copy(data: string): boolean;
export declare class CopyButton {
    $element: JQuery;
    options: CopyButton.Options;
    private _click;
    private _tooltipTitle;
    constructor(target: HTMLElement, options: CopyButton.Options);
    protected onClick(): void;
    dispose(): void;
}
export declare namespace CopyButton {
    interface Options {
        text: () => string;
        tooltip?: TooltipOptions;
        [key: string]: any;
    }
}
