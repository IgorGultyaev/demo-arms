/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import View = require("lib/ui/handlebars/View");
import "bootstrap";
import { CloseOptions } from "lib/ui/Part";
declare class WaitingModal extends View {
    static defaultOptions: WaitingModal.Options;
    /**
     * @observable-property {String}
     */
    text: lang.ObservableProperty<string>;
    private _isRoot;
    options: WaitingModal.Options;
    modalRoot: JQuery;
    /**
     * @class WaitingModal
     * @extends View
     * @param {Object} options
     */
    constructor(options: WaitingModal.Options);
    render(domElement?: JQuery | HTMLElement): lang.Promisable<void>;
    protected doRender(domElement?: JQuery | HTMLElement): lang.Promisable<void>;
    unload(options?: CloseOptions): void;
    static executeTask(task: lang.Promise<any>, domElement: any, options: WaitingModal.Options): lang.Promise<void>;
}
declare namespace WaitingModal {
    interface Options extends View.Options {
        text?: string;
        blockTimeout?: number;
        inplace?: boolean;
    }
}
export = WaitingModal;
