/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import { Part } from "core.ui";
import "xcss!vendor/quill/quill.snow";
import "xcss!lib/ui/styles/peRichText";
import lang = core.lang;
declare class peRichText extends PropertyEditor {
    static defaultOptions: peRichText.Options;
    /**
     * Default options by context
     */
    static contextDefaultOptions: lang.Map<peRichText.Options>;
    /**
     * @observable-property {peRichText.State}
     */
    state: lang.ObservableProperty<peRichText.State>;
    options: peRichText.Options;
    quill: any;
    /**
     * @class peRichText
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peRichText.Options);
    protected _ensurePropLoaded(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected afterRender(): void;
    protected _renderLoading(domElement: JQuery | HTMLElement): void;
    protected _renderFailed(domElement: JQuery | HTMLElement): void;
    protected _createDisabledBinding(): void;
    protected _createBinding(): void;
    /**
     * Initialize editor (Quill) with html string value from property.
     * @param {string} val Property value (html string)
     */
    protected onMaterialize(val: string): void;
    /**
     * Prepare value for setting into property as html string.
     * That happens on focucsout and that value will be sent to the server.
     * Please note the method is called on any focusout it includes moments when user click on quill's toolbar.
     * @return {string} html string for setting into property
     */
    protected onDematerialize(): string;
    unload(options?: Part.CloseOptions): void;
    focus(): void;
}
declare namespace peRichText {
    interface Options extends PropertyEditor.Options {
        changeTrigger?: "keyPressed" | "lostFocus";
        placeholder?: string;
        height?: string;
        quill?: any;
        /**
         * Initialize editor (Quill) with value from property.
         * @param {string} val Property value
         */
        onMaterialize?: (val: string) => void;
        /**
         * Get value from editor (Quill) for setting into property.
         * @return {string} html string for setting into property
         */
        onDematerialize?: () => string;
    }
    const State: {
        Loaded: "loaded";
        Loading: "loading";
        Fail: "fail";
    };
    type State = (typeof State)[keyof typeof State];
}
export = peRichText;
