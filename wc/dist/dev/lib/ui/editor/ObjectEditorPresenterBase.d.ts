/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import ObjectEditor = require("lib/ui/editor/ObjectEditor");
import ContextPartCarousel = require("lib/ui/validation/ContextPartCarousel");
import "lib/ui/menu/MenuPresenter";
import "xcss!lib/ui/styles/objectEditor";
import "xcss!lib/ui/styles/contextParts";
import { HostContextOptions, PartCloseOptions } from "lib/ui/.ui";
import EditorPage = require("lib/ui/editor/EditorPage");
import Violation = ObjectEditor.Violation;
import lang = core.lang;
declare abstract class ObjectEditorPresenterBase extends View implements ObjectEditor.IPresenter {
    static defaultOptions: ObjectEditorPresenterBase.Options;
    static hostDefaultOptions: lang.Map<ObjectEditorPresenterBase.Options>;
    partsCarousel: ContextPartCarousel;
    viewModel: ObjectEditor;
    eventPublisher: core.IEventPublisher;
    options: ObjectEditorPresenterBase.Options;
    protected container: JQuery;
    private _busyElement;
    private _clipboardBtn;
    private $menuContainer;
    /**
     * @constructs ObjectEditorPresenterBase
     * @extends View
     * @param {Object} options
     */
    constructor(options?: ObjectEditorPresenterBase.Options);
    applyHostContext(opt: HostContextOptions): core.INavigationService.NavigateOptions;
    setViewModel(viewModel: ObjectEditor): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected canRenderInitialization(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): void;
    /**
     * Called by ObjectEditor in its render method.
     */
    protected afterRender(): void;
    /**
     * Called by ObjectEditor to show activated page.
     * @param {EditorPage} page
     */
    abstract activatePage(page: EditorPage): lang.Promisable<void>;
    /**
     * Called by ObjectEditor to hide deactivated page.
     * @param {EditorPage} page
     */
    deactivatePage(page: EditorPage): lang.Promisable<void>;
    activateContextParts(): void;
    /**
     * Called by ObjectEditor after current page is shown.
     */
    protected onReady(): void;
    protected _initHintTooltips($container: JQuery): void;
    protected _getPageByName(name: string): JQuery;
    unload(options?: PartCloseOptions): void;
    dispose(options?: PartCloseOptions): void;
    protected _onBusyChanged(sender: ObjectEditor, value: boolean): void;
    protected _activateViolation(violation: Violation): void;
}
declare namespace ObjectEditorPresenterBase {
    interface Options extends View.Options {
        /**
         * allow pages switching animation
         * @type {Boolean}
         */
        animatePageActivation?: boolean;
        /**
         * Affix tabs
         * @type {Boolean}
         */
        affixNavigation?: boolean;
        /**
         * Affix menu
         *@type {Boolean}
         */
        affixMenu?: boolean;
        /**
         * Affix context parts area
         *@type {Boolean}
         */
        affixParts?: boolean;
        /**
         * Render editor.title
         * @type {Boolean}
         */
        showTitle?: boolean;
        /**
         * Hide editor menu
         * @type {Boolean}
         */
        hideMenu?: boolean;
        /**
         * Additional CSS class for editor menu
         * @type {String}
         */
        menuCssClass?: string;
        /**
         * Add "copy to clipboard" popup-button near title
         * @type {Boolean}
         */
        showCopy?: boolean;
        /**
         * Tabs position: above ("top") or left ("left")
         * @type {"left"|"top"}
         */
        tabsPosition?: "left" | "top";
        /**
         * Tabs width for tabsPosition='left' mode
         */
        tabsWidth?: number;
        /**
         * Show content help tooltips for PEs (with hint option)
         */
        showHelpTooltips?: boolean;
        /**
         * Presenter's custom template can handle initialization state of Editor
         */
        canRenderInitialization?: boolean;
        /**
         * Text for WaitingModal on initialization
         */
        loadingText?: string;
        /**
         * Text for WaitingModal on saving (sync)
         */
        savingText?: string;
    }
}
export = ObjectEditorPresenterBase;
