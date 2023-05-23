/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import View = require("lib/ui/handlebars/View");
import EditorPage = require("lib/ui/editor/EditorPage");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import validation = require("lib/validation");
import Menu = require("lib/ui/menu/Menu");
import Carousel = require("lib/ui/Carousel");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import { ContextPartComponentMixin, IContextPart } from "lib/ui/validation/ContextPartMixin";
import domain = require("lib/domain/.domain");
import UnitOfWork = require("lib/domain/UnitOfWork");
import lang = core.lang;
import ObservableCollection = lang.ObservableCollection;
import ObservableProperty = lang.ObservableProperty;
import Promise = lang.Promise;
import Promisable = lang.Promisable;
import SystemEvent = core.SystemEvent;
import DomainObject = domain.DomainObject;
import DomainObjectData = domain.DomainObjectData;
import PropertyMeta = domain.metadata.PropertyMeta;
import EntityMeta = domain.metadata.EntityMeta;
import IPart = core.ui.IPart;
import PartCloseOptions = core.ui.PartCloseOptions;
import HostContextOptions = core.ui.HostContextOptions;
import ICommand = core.commands.ICommand;
import ICommandLazyMap = core.commands.ICommandLazyMap;
import Options = ObjectEditor.Options;
import KnownMenus = ObjectEditor.KnownMenus;
import KnownCommands = ObjectEditor.KnownCommands;
import Model = ObjectEditor.Model;
import Result = ObjectEditor.Result;
import PartState = ObjectEditor.PartState;
import EditorContext = ObjectEditor.EditorContext;
import Violation = ObjectEditor.Violation;
import PageCreatedEventArgs = ObjectEditor.PageCreatedEventArgs;
import ValidatingEventArgs = ObjectEditor.ValidatingEventArgs;
import ValidatedEventArgs = ObjectEditor.ValidatedEventArgs;
import PageSwitchingEventArgs = ObjectEditor.PageSwitchingEventArgs;
import PageEventArgs = ObjectEditor.PageEventArgs;
import SavingEventArgs = ObjectEditor.SavingEventArgs;
import SavedEventArgs = ObjectEditor.SavedEventArgs;
import FinishingEventArgs = ObjectEditor.FinishingEventArgs;
import AcceptingEventArgs = ObjectEditor.AcceptingEventArgs;
import FinishedEventArgs = ObjectEditor.FinishedEventArgs;
import FinishCommandArgs = ObjectEditor.FinishCommandArgs;
import ApplyCommandArgs = ObjectEditor.ApplyCommandArgs;
import { OptimisticConcurrencyException } from "lib/interop/.interop";
import { SaveOptions } from "../../interop/.interop";
import { SafeHtml } from "../../formatters";
declare class ObjectEditor extends Component {
    static defaultOptions: Options;
    static hostDefaultOptions: lang.Map<Options>;
    static defaultMenus: KnownMenus;
    defaultMenus: KnownMenus;
    /**
     * Currently active page of the editor.
     * @observable-property {EditorPage}
     */
    currentPage: ObservableProperty<EditorPage>;
    /**
     * @observable-property {Boolean}
     */
    saving: ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    isBusy: ObservableProperty<boolean>;
    /**
     * context name for property editors
     */
    contextName: string;
    options: Options;
    app: core.Application;
    viewModel: Model;
    presenter: ObjectEditor.IPresenter;
    traceSource: core.diagnostics.TraceSource;
    title: string;
    subtitle: string;
    rules: validation.ObjectRule[];
    pages: ObservableCollection<EditorPage>;
    violations: ObservableCollection<Violation>;
    editorContext: EditorContext;
    contextParts: ObservableCollection<IContextPart>;
    initializationTask: Promise<void>;
    error: string;
    menu: Menu;
    commands: KnownCommands;
    protected siblingsCarousel: Carousel<Options>;
    protected _isIsolated: boolean;
    protected _isClosing: boolean;
    protected _state: PartState;
    protected _uowStateName: string;
    protected _appState: core.AppState;
    protected _errorView: View;
    private _ownUow;
    private _originalOptions;
    /**
     * @constructs ObjectEditor
     * @extends Component
     * @param {Object} options
     */
    constructor(options?: Options);
    applyHostContext(opt: HostContextOptions): core.INavigationService.NavigateOptions;
    protected tweakOptions(options: Options): void;
    protected _initState(viewModel: Model): void;
    setViewModel(viewModel: Model): void;
    protected onSetViewModel(viewModel: Model): Promisable<Model>;
    protected _setViewModelComplete(viewModel: Model): void;
    protected _initialize(): void;
    protected _onObjectDetached(sender: UnitOfWork, obj: DomainObject): void;
    protected onInitializing(): void;
    protected onInitialized(): void;
    /**
     * Create an url query for initialization via navigating to a url
     */
    getState(partOptions?: Options): PartState;
    protected _getViewModelState(): PartState;
    protected _getViewModelId(viewModel: Model): string;
    protected onStateChanged(state?: PartState): boolean;
    protected _initializeMenu(): void;
    protected _onSiblingNavigate(sender: Carousel<Options>, args: Carousel.MovingEventArgs): void;
    protected queryNavigateSibling(): Promisable<string>;
    protected _doNavigateSibling(partOptions: Options): Promise<IPart>;
    protected _getObjectIndex(siblings: Options[]): number;
    protected getCloseResult(result: Result): Result;
    protected createMenuDefaults(): Menu.Options;
    protected createMenu(): Menu;
    protected _getType(): string;
    protected _getPropertyEditorMd(viewModel: Model, prop: PropertyEditor.Options | string): PropertyEditor.Options;
    protected _mergePropMd(...propMds: PropertyEditor.Options[]): PropertyEditor.Options;
    protected _createPage(pageInfo: EditorPage.Options): EditorPage | undefined;
    protected initSections(page: EditorPage, pageInfo: EditorPage.Options): void;
    private _onCreatePage(pageInfo);
    protected onCreatePage(pageInfo: EditorPage.Options): EditorPage | undefined;
    protected _doAddPage(page: EditorPage): void;
    /**
     * Create a default page in case when editor's options have no pages metadata.
     * @protected
     */
    protected _createDefaultPage(): EditorPage;
    protected onPageCreated(args: PageCreatedEventArgs): void;
    protected _generateAllEditors(page: EditorPage): void;
    protected _createEditorForProp(page: EditorPage, propMd: PropertyEditor.Options, viewModel: Model): PropertyEditor;
    protected _onCreatePropEditor(page: EditorPage, propMd: PropertyEditor.Options, viewModel: Model): PropertyEditor.Options;
    protected onCreatePropEditor(page: EditorPage, propMeta: PropertyEditor.Options, viewModel: Model): PropertyEditor.Options;
    /**
     * @protected
     * @returns {{SaveAndClose: (Command), Apply: (Command), CancelAndClose: (Command), SwitchToPage: (Command)}}
     */
    protected createCommands(): lang.Map<ICommand>;
    findPropertyEditor(viewModel: Model, propName: string): ObjectEditor.FindPropertyEditorResult;
    findPropertyEditorPage(propertyEditor: PropertyEditor): EditorPage;
    /**
     * Executes 'iterator' function for each property editor of each page
     * @param {Function} iterator
     * @param {*} [context] this arguments for iterator
     */
    forEachPE(iterator: (pe: PropertyEditor) => void, context?: any): void;
    /**
     * Return array of descriptions of editor page.
     * @param {EditorPage} page
     * @returns {Array}
     */
    getPageSummary(page: EditorPage): PropertyEditor.Summary[];
    protected doSaveAndClose(args: FinishCommandArgs): Promisable<void>;
    protected canSaveAndClose(): boolean;
    /**
     * Run validation for object and all pages, then commit all changes (if it's root editor), then close.
     * @param {Object} [cmdArgs] command arguments
     * @param {boolean} [cmdArgs.createNext] if specified than an editor for creating a next new object will be opened
     * @returns {Promise}
     */
    finish(cmdArgs?: FinishCommandArgs): Promise<void>;
    protected _finish2(cmdArgs: FinishCommandArgs): Promise<void>;
    protected _finish3(cmdArgs: FinishCommandArgs): boolean | Promise<void>;
    protected doApply(args: ApplyCommandArgs): Promise<void>;
    protected canApply(): boolean;
    protected canSave(): boolean;
    /**
     * Save changes ("Apply")
     * @param {Boolean} [isAsync=false] 'true' for non blocking save
     * @returns {JQuery.Promise}
     */
    save(isAsync?: boolean): Promise<void>;
    protected _save2(isAsync: boolean): Promise<void>;
    protected onAccepting(args: AcceptingEventArgs): void;
    protected onFinishing(args: FinishingEventArgs): void;
    protected onFinished(args: FinishedEventArgs): void;
    protected onSaving(args: SavingEventArgs): void;
    protected onSaved(args: SavedEventArgs): void;
    protected onSaveError(args: {
        objects: DomainObjectData[];
        error: Error;
    }): void;
    protected _close(cmdArgs: FinishCommandArgs): Promisable<any>;
    protected _leave(success: boolean | Promise<void>, cmdArgs: FinishCommandArgs): Promise<void>;
    protected _saveChanges(cmdArgs?: FinishCommandArgs): Promise<void>;
    protected doSave(saveOptions?: UnitOfWork.SaveOptions): Promise<UnitOfWork.SaveResult>;
    protected _onConcurrencyError(error: OptimisticConcurrencyException): void;
    protected _onSyncSaveError(args: UnitOfWork.SaveErrorArgs): void;
    protected getSaveErrorMessage(event: core.SystemEvent, violation?: Violation): string | SafeHtml;
    protected createSaveErrorInfoPart(args: UnitOfWork.SaveErrorArgs, event: core.SystemEvent): void;
    protected _onAsyncSaveError(args: UnitOfWork.SaveErrorArgs): void;
    /**
     * Create an event object for publishing via EventPublisher.
     * @param {Object} args
     * @param {Object} args.error
     * @param {Object} args.options
     * @param {Object} args.objects Json object which were passed in dataFacade.save from UnitOfWork.save
     * @param {Object} args.states
     * @param {Object} args.deferred
     * @param {Function} args.complete Function to call for completion of save operation. This will signal (resolve/reject) on promise returned by UnitOfWork.save
     * @param {Function} args.resolve UnitOfWork's success handler
     * @param {Function} args.reject UnitOfWork's error handler
     * @returns {Object} Event object
     */
    createAsyncSaveErrorEvent(args: UnitOfWork.SaveErrorArgs): SystemEvent;
    cancel(): void;
    protected onSaveState(uow: UnitOfWork): void;
    protected onRollbackState(): void;
    protected onAcceptState(): void;
    protected _renderError(domElement: JQuery | HTMLElement, msg: string): void;
    protected _setError(domElement: JQuery | HTMLElement, error: string): void;
    protected doRender(domElement: JQuery | HTMLElement): Promisable<void>;
    protected _render(domElement: JQuery | HTMLElement): Promisable<void>;
    getPageByName(name: string): EditorPage;
    /**
     * удаляет из текущего набора нарушений, нарушения связанные с указанной страницей
     * @param {Array|EditorPage|Object} pages - массив экземпляров EditorPage или метаданных страниц
     * @protected
     */
    protected _removePageViolations(pages: EditorPage | EditorPage[]): void;
    /**
     * Run validation.
     * @param {EditorPage} [page] a page to validate, can be empty when validating on closing (that means we're validating all pages)
     * @return {Array} An array with violations
     */
    runValidation(page?: EditorPage): Violation[];
    protected _validate(page?: EditorPage): Violation[];
    protected _validatePage(page: EditorPage, violations?: Violation[]): Violation[];
    /**
     * Handles PropertyEditor.violation changes.
     * @param {PropertyEditor} pe
     * @param {Violation} newVal
     * @param {Violation} oldVal
     * @private
     */
    protected _onPEViolationChanged(pe: PropertyEditor, newVal: Violation, oldVal: Violation): void;
    protected _sortViolations(violations: Violation[]): Violation[];
    protected onValidating(args: ValidatingEventArgs): void;
    protected onValidated(args: ValidatedEventArgs): void;
    protected _normalizeViolationArray(violations: (Violation | string)[]): void;
    /**
     * Фильтрует переданынй массив нарушений и возвращает массив нарушений страниц, т.е. нарушения,
     * у которых указано имя страницы (pageName), либо в редакторе объекта
     * для нарушения в свойстве объекта можно найти редактор свойства.
     * @param {Array} violations - массив объектов нарушений
     * с нарушениями (для того, что бы их можно было отнести к нарушениям страницы)
     * @param {String} [pageName]
     */
    protected _filterPagesViolations(violations: Violation[], pageName?: string): Violation[];
    protected _tryFindViolationPageName(violation: Violation): string;
    protected _bindPropEditorViolationChanged(page: EditorPage): void;
    protected _unbindPropEditorViolationChanged(page: EditorPage): void;
    /**
     * Сгенерировать в доменных объектах при наличии нарушений у свойств события "error:{propName}"
     * На данные события подписываются редакторы свойств (см. PropertyEditor) для отображения статуса "ошибка".
     * @param {Array} violations - array of violations
     * @param {EditorPage} [page] - события генерируются только для нарушений на указанной странице
     * @private
     */
    protected _triggerPropsViolationEvents(violations: Violation[], page?: EditorPage): void;
    /**
     * Change current page onto a new one
     * @param {EditorPage} page New page to go to
     * @param {Boolean} [skipValidation=false] if true then there will be no validation for the current page
     * @returns {$.Deferred.promise} resolved - page was changed, otherwise - rejected
     */
    setCurrentPage(page: EditorPage, skipValidation?: boolean): Promise<void>;
    protected _activatePage(page: EditorPage): Promise<void>;
    protected _deactivatePage(page: EditorPage): Promise<void>;
    private _pageSwitching(oldPage, newPage);
    protected onPageSwitching(args: PageSwitchingEventArgs): void;
    private _pageUnloading(oldPage);
    protected onPageUnloading(args: PageEventArgs): void;
    private _pageUnloaded(page);
    protected onPageUnloaded(args: PageEventArgs): void;
    private _pageStarting(page);
    protected onPageStarting(args: PageEventArgs): void;
    private _pageStarted(page);
    protected onPageStarted(args: PageEventArgs): void;
    /**
     * Switch to a page with specified name
     * @param {string} name a page name
     * @returns {JQueryPromise}
     */
    switchToPage(name: string): Promise<void>;
    queryUnload(options?: PartCloseOptions): Promisable<string>;
    protected onQueryUnload(options: PartCloseOptions): Promisable<string>;
    protected _checkForChangesLost(options: PartCloseOptions): Promisable<string>;
    protected _hasMeaningfulChanges(changes: DomainObjectData[]): boolean;
    protected onQueryUnloadWithChanges(options: PartCloseOptions): Promise<string>;
    unload(options?: PartCloseOptions): void;
    protected onUnloaded(options?: PartCloseOptions): void;
    protected _disposeInner(): void;
    protected _disposeUow(uow: UnitOfWork): void;
    dispose(options?: PartCloseOptions): void;
    protected onDisposed(options: PartCloseOptions): void;
    getTextPresentation(): string;
}
interface ObjectEditor extends PartCommandMixin, ContextPartComponentMixin {
}
declare namespace ObjectEditor {
    interface Options extends Component.Options, PartCommandMixin.Options {
        traceSourceName?: string;
        title?: string;
        subtitle?: string;
        pages?: EditorPage.Options[];
        /**
         * Array of validation rules. Will be merged with rules of the object.
         */
        rules?: validation.ObjectRule[];
        editorContext?: EditorContext;
        navigationService?: core.INavigationService;
        /**
         * Type name of viewModel (EntityType)
         * @type {String}
         */
        type?: string;
        /**
         * Url suffix is a partName's part after ":".
         * For example, for "ObjectEditor:User", "User" is suffix. In editor suffix will be used as type if it's not provided.
         * It's recommended to use `type` option explicitly always.
         * Suffix is set by `core.createPart`.
         * @deprecated Use type
         */
        urlSuffix?: string;
        /**
         * Object identifier
         * @type {String}
         */
        id?: string;
        viewModel?: Model | null;
        uow?: UnitOfWork;
        uowStateName?: string;
        /**
         * The flag to explicitly mark or unmark the editor as isolated (root).
         * If unspecified then the editor is considered as isolated if nor `uow` neither `viewModel.uow` is specified.
         */
        isIsolated?: boolean;
        preloads?: string | string[];
        /**
         * Prevent auto load unloaded objects in observable expressions.
         * It's option for presenter's View. Can be passed via `presenterOptions` as well.
         */
        suppressAutoLoad?: boolean;
        /**
         * JSON objects to fill created UnifOfWork with (uow.attachChanges will be used).
         */
        initialJson?: DomainObjectData[] | lang.Map<DomainObjectData>;
        menu?: Menu.Options;
        commands?: ICommandLazyMap;
        page?: string;
        pageValidation?: "none" | "loose" | "strict";
        skipSaveState?: boolean;
        blockingSave?: boolean;
        cssRootClass?: string;
        navigateSiblings?: Options[];
        presenter?: IPresenter;
        Presenter?: new (editor: ObjectEditor, options?: any) => IPresenter;
        onSetViewModel?: (viewModel: Model) => Promisable<Model>;
        onCreatePage?: (pageInfo: EditorPage.Options, viewModel: Model) => EditorPage | false;
        onCreatePropEditor?: (page: EditorPage, propMeta: PropertyEditor.Options, viewModel: Model) => PropertyEditor.Options;
        onInitializing?: (sender: ObjectEditor) => void;
        onInitialized?: (sender: ObjectEditor) => void;
        onPageCreated?: (sender: ObjectEditor, args: PageCreatedEventArgs) => void;
        onPageStarting?: (sender: ObjectEditor, args: PageEventArgs) => void;
        onPageStarted?: (sender: ObjectEditor, args: PageEventArgs) => void;
        onPageUnloading?: (sender: ObjectEditor, args: PageEventArgs) => void;
        onPageUnloaded?: (sender: ObjectEditor, args: PageEventArgs) => void;
        onPageSwitching?: (sender: ObjectEditor, args: PageSwitchingEventArgs) => void;
        onValidating?: (sender: ObjectEditor, args: ValidatingEventArgs) => void;
        onValidated?: (sender: ObjectEditor, args: ValidatedEventArgs) => void;
        onAccepting?: (sender: ObjectEditor, args: AcceptingEventArgs) => void;
        onFinishing?: (sender: ObjectEditor, args: FinishingEventArgs) => void;
        onFinished?: (sender: ObjectEditor, args: FinishedEventArgs) => void;
        onSaving?: (sender: ObjectEditor, args: SavingEventArgs) => void;
        onSaved?: (sender: ObjectEditor, args: SavedEventArgs) => void;
        onSaveError?: (sender: ObjectEditor, args: UnitOfWork.SaveErrorArgs) => void;
        onQueryUnload?: (sender: ObjectEditor, args: QueryUnloadEventArgs) => void;
        onUnloaded?: (sender: ObjectEditor, args: PartCloseOptions) => void;
        onDisposed?: (sender: ObjectEditor, args: PartCloseOptions) => void;
        transactionName?: string;
        getSaveOptions?: (saveOptions: UnitOfWork.SaveOptions, editor: ObjectEditor) => UnitOfWork.SaveOptions;
    }
    interface KnownMenus extends lang.Map<Menu.Options> {
        Editor?: Menu.Options;
        RootEditor?: Menu.Options;
    }
    interface KnownCommands extends lang.Map<ICommand> {
        SaveAndClose?: ICommand;
        Apply?: ICommand;
        CancelAndClose?: ICommand;
        SwitchToPage?: ICommand;
        CloseContextPart?: ICommand;
    }
    type Model = DomainObject | {
        uow?: UnitOfWork;
        id?: string;
        meta?: EntityMeta;
        isLoaded?: boolean;
        load?(options?: domain.LoadOptions): lang.Promise<Model>;
        isNew?(): boolean;
        fromJson?(json: DomainObjectData, options?: domain.FromJsonOptions, propOptions?: domain.SetPropOptions): Model;
        toJson?(options?: domain.ToJsonOptions): DomainObjectData;
    };
    const Events: {
        INITIALIZING: string;
        INITIALIZED: string;
        PAGE_CREATED: string;
        PAGE_STARTING: string;
        PAGE_STARTED: string;
        PAGE_UNLOADING: string;
        PAGE_UNLOADED: string;
        PAGE_SWITCHING: string;
        VALIDATING: string;
        VALIDATED: string;
        ACCEPTING: string;
        FINISHING: string;
        FINISHED: string;
        SAVING: string;
        SAVED: string;
        SAVE_ERROR: string;
        QUERY_UNLOAD: string;
        UNLOADED: string;
        DISPOSED: string;
    };
    interface Result {
        success?: boolean | Promise<void>;
        object?: Model;
        selectedId?: string;
    }
    interface PartState {
        type?: string;
        id?: string;
        page?: string;
    }
    interface EditorContext {
        nested?: boolean;
        parentProp?: PropertyMeta;
        parentObject?: DomainObject;
        [key: string]: any;
    }
    interface Violation extends validation.Violation {
        pageName?: string;
    }
    interface FindPropertyEditorResult {
        pe: PropertyEditor;
        pageName: string;
    }
    interface IPresenter extends IPart {
        activatePage?(page: EditorPage): Promisable<void>;
        deactivatePage?(page: EditorPage): Promisable<void>;
        activateContextParts?(): void;
    }
    interface PageCreatedEventArgs {
        page: EditorPage;
    }
    interface ValidatingEventArgs {
        page: EditorPage;
    }
    interface ValidatedEventArgs {
        page: EditorPage;
        result: Violation[];
    }
    interface PageSwitchingEventArgs {
        pageFrom: EditorPage;
        pageTo: EditorPage;
        cancel: boolean;
        defer?: Promise<void>;
    }
    interface PageEventArgs {
        page: EditorPage;
        index: number;
    }
    interface SavingEventArgs {
        cancel?: boolean;
        blockingSave?: boolean;
        onAsyncError?: (args: UnitOfWork.SaveErrorArgs) => void;
        onSyncError?: (args: UnitOfWork.SaveErrorArgs) => void;
        interop?: SaveOptions;
    }
    interface SavedEventArgs {
    }
    interface FinishingEventArgs {
        cancel?: boolean;
        cmdArgs?: FinishCommandArgs;
        promise?: Promise<boolean>;
    }
    interface AcceptingEventArgs {
        reason: "save" | "close" | "saveAndClose";
        cancel?: boolean;
        cmdArgs?: FinishCommandArgs;
        promise?: Promise<boolean>;
    }
    interface FinishedEventArgs {
        result?: boolean | Promise<void>;
    }
    interface QueryUnloadEventArgs {
        editor: ObjectEditor;
        preventingReason?: string;
    }
    interface FinishCommandArgs {
        blockingSave?: boolean;
        createNext?: boolean;
        /**
         * do not call navigationService close/leave/replace
         */
        skipClose?: boolean;
    }
    interface ApplyCommandArgs {
        async?: boolean;
    }
    interface PageCommandArgs {
        pageName: string;
    }
}
export = ObjectEditor;
