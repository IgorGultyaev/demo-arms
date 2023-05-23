/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import View = require("lib/ui/handlebars/View");
import "xcss!lib/ui/styles/popupView";
import Options = Popup.Options;
import { IPart, PartCloseOptions } from "lib/ui/.ui";
declare class Popup extends View {
    /** @type {Object} */
    static defaultOptions: Options;
    options: Options;
    body: IPart;
    $parent: JQuery;
    private _bodyOwned;
    private _closeHandler;
    private _keyupHandler;
    /**
     * @constructs Popup
     * @extends View
     * @description Popup consists of a scaffolding frame (specified by template option)
     * and an inner part (specified by body or bodyTemplate options).
     * @param {Popup.defaultOptions} options
     */
    constructor(options: Options);
    setViewModel(viewModel: any): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected _isFocusOutside(): boolean;
    close(): void;
    protected doClose(): void;
    unload(options?: PartCloseOptions): void;
    dispose(options?: PartCloseOptions): void;
}
declare namespace Popup {
    interface Options extends View.Options {
        /**
         * inner part or its name
         * @type {String|Part}
         */
        body?: string | IPart;
        /**
         * inner part template (View will created)
         * @type {Function}
         */
        bodyTemplate?: HandlebarsTemplateDelegate;
        /**
         * keep body alive; don't dispose body while disposing Popup
         * @type {Boolean}
         */
        preserveBody?: boolean;
        /**
         * 'closing' part (by method or command) will dispose it
         */
        disposeOnClose?: boolean;
        /**
         * Events on parent element that close popup.
         * NOTE: Don't include 'click' here. In fact 'click' is a paired event (mousedown + mouseup).
         * But the popup can change its size because of 'mousedown' and the next 'mouseup' will be raised
         * outside of the popup. In this case click in the popup will close it.
         * (see http://track.rnd.croc.ru/issue/WC-853)
         */
        closeOn?: string;
        /**
         * CSS class for popup DOM element
         * @type {String}
         */
        rootCssClass?: string;
        viewModel?: any;
        /**
         * Options for jQuery.fn.show method
         * @type {Number|String|Object}
         */
        animation?: number | false;
        /**
         * Options for jQuery.fn.offset method (an object containing the properties 'top' and 'left')
         * @type {Object}
         */
        offset?: JQueryCoordinates;
    }
}
export = Popup;
