/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import { INavigationService, IUserSettings } from "lib/.core";
import { IPart, PartCloseOptions, HostContextOptions } from "lib/ui/.ui";
import * as types from "./.ui.types";
import RegisterChildOptions = Part.RegisterChildOptions;
declare class Part extends lang.Observable implements IPart {
    name: string;
    options: Part.Options;
    viewModel: any;
    navigationService: INavigationService;
    userSettings: IUserSettings;
    domElement: HTMLElement;
    $domElement: JQuery;
    isDisposed: boolean;
    private _children;
    private _jqEventNs;
    /** @obsolete use Part.RenderStatus */
    renderStatuses: typeof Part.RenderStatus;
    /**
     * Common base class for a part implementation. A part should implement at least one method - `render`.
     * But this class also support some common practice for part.
     * @article [Part](docs:part)
     * @constructs Part
     * @extends Observable
     */
    constructor(options?: Part.Options);
    renderStatus(v: Part.RenderStatus): void;
    renderStatus(): Part.RenderStatus;
    protected onRenderStatusChange(value: Part.RenderStatus, oldValue: Part.RenderStatus): void;
    /**
     * @deprecated Use static method Part.mixOptions
     */
    protected mixOptions<T extends Part.Options>(options: T, defaultOptions: T): T;
    /**
     * Формирует опции парта, задавая значения по умолчанию.
     * Вызывать в конструкторе парта ДО вызова родительского конструктора. Не переопределяйте этот метод.
     * Если вы используете этот метод, не определяйте поле options в прототипе класса.
     * Вычисление runtime опций, зависящих от других опций, рекомендуется выполнять непосредственно в конструкторе
     * перед вызовом базового конструктора. Также можно переопределить метод `tweakOptions` (но не вызывать его).
     * @static
     * @param {Object} options Опции, переданные в конструктор
     * @param {Object} defaultOptions Опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя `this` (иначе возможно некорректное поведение при наследовании).
     * @returns {*}
     * @example
     * constructor: function (options) {
     *     options = MyPart.mixOptions(options, MyPart.prototype.defaultOptions);
     *     options.superOption = options.myOption; // fill runtime options (you can override `tweakOptions` also)
     *     MyPart.Super.call(this, options);
     *     // some code
     * },
     * defaultOptions: {
     *     // some options
     * }
     */
    static mixOptions<T extends Part.Options>(options: T, defaultOptions: T): T;
    /**
     * @deprecated Use static method Part.mixContextOptions
     */
    protected mixContextOptions<T extends Part.ContextOptions>(options: T, defaultOptions: T, contextDefaultOptions: lang.Map<T>): T;
    /**
     * Формирует опции парта с учетом контекста. Фактически данный метод формирует defaultOptions с учетом контекста,
     * а затем вызывает `mixOptions`.
     * Вызывать в конструкторе парта ДО вызова родительского конструктора. Не переопределяйте этот метод.
     * Вычисление runtime опций, зависящих от других опций, рекомендуется выполнять непосредственно в конструкторе
     * перед вызовом базового конструктора. Также можно переопределить метод `tweakOptions` (но не вызывать его).
     * @static
     * @param {Object} options Опции, переданные в конструктор
     * @param {Object} defaultOptions Опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя this (иначе возможно некорректное поведение при наследовании).
     * @param {Object} [contextDefaultOptions] Контекстные опции по умолчанию. Если определены в прототипе, то передавать как поле прототипа, не используя this (иначе возможно некорректное поведение при наследовании).
     * @returns {*}
     * @example
     * constructor: function (options) {
     *     options = MyPart.mixContextOptions(options, MyPart.prototype.defaultOptions, MyPart.prototype.contextDefaultOptions);
     *     options.superOption = options.myOption; // fill runtime options (you can override `tweakOptions` also)
     *     MyPart.Super.call(this, options);
     *     // some code
     * },
     * defaultOptions: {
     *     // some options
     * }
     * contextDefaultOptions: {
     *     filter: {
     *	       commandsOptions: {
     *             Select: {
     *                 openInDialog: true
     *             }
     *         }
     *     }
     * }
     */
    static mixContextOptions<T extends Part.ContextOptions>(options: T, defaultOptions: T, contextDefaultOptions: lang.Map<T>): T;
    /**
     * Корректирует опции парта, вычисляя их значения в runtime.
     * Переопределите этот метод, если необходимо вычислить значения опций в зависимости от некоторых runtime условий.
     * Типичное использование - задать значение одной опции в зависимости от другой опции (например, в зависимости
     * от опции текущего класса нужно задать значение для опции базового класса). Подобную инициализацию также можно
     * выполнять непосредственно в конструкторе перед вызовом базового конструктора.
     * Если необходимо просто задать значения опций по умолчанию и они известны в design time, то удобней использовать
     * методы `mixOptions` и `mixContextOptions`.
     * Не вызывайте данный метод из наследников, он должен вызываться только в базовом конструкторе класса Part.
     * @param {Object} options Опции парта (после задания значений по умолчанию). Всегда заданы.
     * @virtual
     * @example
     * constructor: function (options) {
     *     options = MyPart.mixOptions(options, MyPart.prototype.defaultOptions);
     *     MyPart.Super.call(this, options);
     *     // some code
     * },
     * defaultOptions: {
     *     // some options
     * },
     * tweakOptions: function (options) {
     *     options.superOption = options.myOption;
     *     MyPart.Super.prototype.tweakOptions.call(this, options);
     * }
     */
    protected tweakOptions(options: Part.Options): void;
    applyHostContext(opt: HostContextOptions): INavigationService.NavigateOptions;
    protected mixHostOptions<T extends Part.Options>(host: string, hostDefaultOptions: lang.Map<T>): void;
    /**
     * Bind the part with a view model.
     * @param {Object} viewModel
     */
    setViewModel(viewModel: any): void;
    /**
     * Bind the part with NavigationService.
     * @param {NavigationService} navigationService
     */
    setNavigationService(navigationService: INavigationService): void;
    /**
     * Render the part into DOM element. Core method of presentation model.
     * @param {JQuery|HTMLElement} domElement Part's container element
     */
    render(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /**
     * It's called in the begging of Part.render.
     * By default the method does nothing (extension point).
     * @param {HTMLElement|JQuery} domElement Part's container element
     */
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    /**
     * Does all heavy lifting of rendering.
     * Default implementation just sets renderStatus to `RenderStatuses.rendering` and assigns `domElement` field.
     * It's the method it's recommended to override (instead of `render`).
     * @param {HTMLElement|JQuery} domElement Part's container element
     */
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /**
     * It's called at the end of part's rendering.
     * By default the method updates `renderStatus` taking into account children's states.
     */
    protected afterRender(): void;
    private _updateRenderStatus(afterRender);
    /**
     * The method is called on "ready" event which is fired when `renderStatues` changes to `rendered`.
     * By default the method does nothing (extension point).
     * Please note that the method is subscribed on the event in `Part.constructor`. So a descendant class should not forget to call the base constructor.
     * @since 0.17
     */
    protected onReady(): void;
    /**
     * The method is called on "unload" and "waiting" events which are fired when `renderStatues` changes to `unloaded` and `waiting`.
     * By default the method does nothing (extension point).
     * Please note that the method is subscribed on the event in `Part.constructor`. So a descendant class should not forget to call the base constructor.
     * @since 0.17
     */
    protected onUnready(): void;
    /**
     * Helper method for generating DOM event `domChanged` on part's element.
     * Actually it uses html.notifyDOMChanged method.
     */
    protected notifyDOMChanged(): void;
    /**
     * Unload the part and render it again in the same DOM element.
     */
    rerender(): void;
    /**
     * Unload the part and its children.
     */
    unload(options?: Part.CloseOptions): void;
    /**
     * Dispose the part and its children. If it's needed unload first.
     * The instance should not be used after call of dispose.
     */
    dispose(options?: Part.CloseOptions): void;
    protected _throwIfDisposed(): void;
    /**
     * Register a child part
     * @param {Part} part
     * @param {Object|Boolean} [options]
     * @param {Boolean} [options.disposeOnUnload] dispose the child part on current part unload
     * @param {Boolean} [options.keepOnUnload] reuse the child part on unload, i.e. unload it but keep the reference
     * @param {Boolean} [options.trackStatus] create dependent binding for renderStatus of the current part on child's renderStatus
     * @param {Boolean} [options.name] name of the child part, can be used in `getChild`
     * @since 0.17
     */
    registerChild(part: IPart, options?: RegisterChildOptions | boolean): void;
    /**
     * Return a registered child part by name or by index.
     * @param {String|Number} name Name or index of child part
     * @return {Part}
     * @since 0.17
     */
    getChild(name: string | number): IPart;
    /**
     * Opposite method to resiterChild. Unload and remove child part.
     * @param {Part} part
     * @since 0.17
     */
    unregisterChild(part: IPart): void;
    private _unloadChild(child, options?);
    protected jqOn(event: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
    protected jqOn(event: string, filter: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
    protected jqOn($element: JQuery | HTMLElement, event: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
    protected jqOn($element: JQuery | HTMLElement, event: string, filter: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
    protected jqOff(event?: string): JQuery;
    protected jqOff($element: JQuery | HTMLElement, event?: string): JQuery;
    /**
     * Helper method to open specified part via current navigationService (in the region of the current part).
     * @param {String|Object} part Part instance or part name
     * @param {Object} [partOptions] Options that will be passed into part's constructor (if part is String) (see NavigationService.navigate)
     * @param {Function} [onReturn] Callback to be called when user returns from opened part (see NavigationService.navigate)
     * @returns {*}
     */
    openPart(part: IPart | string, partOptions?: any, onReturn?: (v: any) => void): lang.Promise<IPart>;
    /**
     * Method can return dialog options, which will be used in applyHostContext, also they can be specified in `navigationOptions` option.
     * NOTE: Subject to kill. Prefer using navigationOptions option.
     */
    getDialogOptions?(): any;
}
declare namespace Part {
    interface Options {
        navigateOptions?: INavigationService.NavigateOptions;
        userSettings?: false | IUserSettings.Options;
    }
    interface ContextOptions extends Options {
        contextName?: string;
    }
    interface RegisterChildOptions {
        /**
         * Dispose the child part on current part unload
         */
        disposeOnUnload?: boolean;
        /**
         * Reuse the child part on unload, i.e. unload it but keep the reference
         */
        keepOnUnload?: boolean;
        /**
         * Create dependent binding for renderStatus of the current part on child's renderStatus
         */
        trackStatus?: boolean;
        /**
         * Name of the child part, can be used in `getChild`
         */
        name?: string;
    }
    interface CloseOptions extends PartCloseOptions {
    }
    type RenderStatus = types.RenderStatus;
    const RenderStatus: {
        unloaded: "unloaded";
        rendering: "rendering";
        waiting: "waiting";
        ready: "ready";
    };
}
export = Part;
