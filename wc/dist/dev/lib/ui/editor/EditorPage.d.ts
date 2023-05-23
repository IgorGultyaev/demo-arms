/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import EditorPageController = require("lib/ui/editor/EditorPageController");
import validation = require("lib/validation");
import Menu = require("lib/ui/menu/Menu");
import lang = core.lang;
import ObjectEditor = core.ui.ObjectEditor;
import Model = ObjectEditor.Model;
import Violation = ObjectEditor.Violation;
import PropertyEditor = core.ui.PropertyEditor;
import IPart = core.ui.IPart;
import PartCloseOptions = core.ui.PartCloseOptions;
import Options = EditorPage.Options;
import IPresenter = EditorPage.IPresenter;
import IController = EditorPage.IController;
import { SafeHtml } from "lib/formatters";
declare class EditorPage extends Component {
    static defaultOptions: Options;
    static contextDefaultOptions: lang.Map<Options>;
    options: Options;
    viewModel: Model;
    presenter: IPresenter;
    editor: ObjectEditor;
    editors: lang.Map<PropertyEditor>;
    name: string;
    title: string;
    tab: EditorPage.TabOptions;
    rules: validation.ObjectRule[];
    labelColumnRatio: number;
    peColumnRatio: number;
    controller: IController;
    sections: EditorPage.Section[];
    /**
     * @observable-property {Boolean}
     */
    hidden: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    hasViolations: lang.ObservableProperty<boolean>;
    /**
     * @constructs EditorPage
     * @extends Component
     * @param options
     * @param viewModel
     */
    constructor(options: Options, viewModel: Model);
    protected initTab(): void;
    protected initLayout(): void;
    protected initController(): void;
    protected tweakOptions(options: Options): void;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /**
     * Called by ObjectEditor before page is activated
     * Optional
     */
    onStarting?(): void;
    /**
     * Called by ObjectEditor after page is activated
     */
    onStarted(): void;
    /**
     * Called by ObjectEditor before page is unloaded
     * Optional
     */
    onUnloading?(): void;
    /**
     * Called by ObjectEditor after page is unloaded
     * Optional
     */
    onUnloaded?(): void;
    /**
     * Set focus on first property editor
     * @param {boolean} force if true - skip check for already focused DOM element
     */
    focusFirstPE(force?: boolean): void;
    setNavigationService(navigationService: core.INavigationService): void;
    setObjectEditor(editor: ObjectEditor): void;
    protected _onViolationsChanged(): void;
    queryUnload(options?: PartCloseOptions): lang.Promisable<string>;
    unload(options?: PartCloseOptions): void;
    dispose(options?: PartCloseOptions): void;
    getPropertyEditor(propName: string, viewModel?: any): PropertyEditor;
    getPropertyEditorByPath(propPath: string): PropertyEditor;
    getPrevPropertyEditor(pe: PropertyEditor): PropertyEditor;
    getNextPropertyEditor(pe: PropertyEditor): PropertyEditor;
    /**
    * Run validation for all property editors (pe) on the page.
    * It also updates hasViolations property.
    * @return {Array|null} array of violation objects or undefined if there was no errors.
    */
    runValidation(): Violation[];
    shouldValidate(): boolean;
    getTextPresentation(): string;
}
declare namespace EditorPage {
    interface Options extends Component.Options {
        Class?: new (options: Options, viewModel: any) => EditorPage;
        properties?: ((PropertyEditor.Options & lang.Map<any>) | string)[];
        template?: HandlebarsTemplateDelegate;
        name?: string;
        title?: string | EditorPage.TabOptions;
        rules?: validation.ObjectRule[];
        labelColumnRatio?: number;
        cssColumnPrefix?: string;
        cssClass?: string;
        hidden?: boolean;
        bound?: boolean;
        /**
         * see EditorParePresenter.Options.highlightFocused
         */
        highlightFocused?: boolean;
        /**
         * see EditorParePresenter.Options.peFocusOnClickContainer
         */
        peFocusOnClickContainer?: boolean;
        controller?: IController | EditorPageController.Options[] | EditorPageController.Options;
        sections?: SectionOptions[];
    }
    interface TabOptions extends Menu.PresentationItem {
    }
    interface SectionOptions {
        /**
         * Mandatory name of section
         */
        name?: string;
        /**
         * Title for html
         */
        title?: string | SafeHtml;
        /**
         * Template
         */
        template?: HandlebarsTemplateDelegate;
        /**
         * Section is hidden (even if title is specified)
         */
        hidden?: boolean;
        /**
         * Array of properties names for this section (these names are the same as in `properties` option in page)
         */
        properties?: string[];
        /**
         * Hide section when all its editors are hidden
         */
        autoHide?: boolean;
    }
    class Section extends lang.Observable {
        static defaultOptions: SectionOptions;
        name: string;
        page: EditorPage;
        title: lang.ObservableProperty<string | SafeHtml>;
        hidden: lang.ObservableProperty<boolean>;
        template: HandlebarsTemplateDelegate;
        editors: lang.Map<PropertyEditor>;
        constructor(options?: SectionOptions);
        recalculateHidden(): void;
    }
    interface IPresenter extends IPart {
        focusFirstPE?(force?: boolean): void;
    }
    interface IController {
        prepare?(page: EditorPage): void;
        start(page: EditorPage): void;
        stop(): void;
    }
}
export = EditorPage;
