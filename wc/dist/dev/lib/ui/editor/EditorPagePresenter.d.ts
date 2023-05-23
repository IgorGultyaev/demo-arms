/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import EditorPage = require("lib/ui/editor/EditorPage");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import "xcss!lib/ui/styles/objectEditor";
declare class EditorPagePresenter extends View {
    static defaultOptions: EditorPagePresenter.Options;
    options: EditorPagePresenter.Options;
    viewModel: EditorPage;
    /**
     * @constructs EditorPagePresenter
     * @extends View
     * @param {Object} options
     */
    constructor(options: EditorPagePresenter.Options);
    protected doRender(domElement: JQuery | HTMLElement): core.lang.Promisable<void>;
    /**
     * Set focus on first property editor
     * @param {boolean} force if true - skip check for already focused DOM element
     */
    focusFirstPE(force: boolean): void;
    findContainerPE($container: JQuery): PropertyEditor | undefined;
    /**
     * Checks if a jQuery event was triggered inside the current page (not nested)
     * @param {JQueryEventObject} e
     * @returns {boolean}
     * @private
     */
    protected _isEventOwn(e: JQueryEventObject): boolean;
    static makeColumnsRatioHelperData(options: View.HelperOptions): any;
}
declare namespace EditorPagePresenter {
    interface Options extends View.Options {
        /**
         * Highligh PE container (label + PE) while PE is focused
         */
        highlightFocused?: boolean;
        /**
         * Focus inside PE when user click on PE container
         */
        peFocusOnClickContainer?: boolean;
        bound?: boolean;
        cssClass?: string;
        sectionHeadings?: boolean;
    }
}
export = EditorPagePresenter;
