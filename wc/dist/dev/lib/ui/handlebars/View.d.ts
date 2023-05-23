/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import diagnostics = require("lib/core.diagnostics");
import Part = require("lib/ui/Part");
import StatefulPart = require("lib/ui/StatefulPart");
import * as Handlebars from "handlebars-ext";
import { IPart, PartCloseOptions } from "lib/ui/.ui";
import RegisterChildOptions = Part.RegisterChildOptions;
import HelperTarget = View.HelperTarget;
declare class View extends StatefulPart {
    static defaultOptions: View.Options;
    traceSource: diagnostics.TraceSource;
    loadingValue: any;
    options: View.Options;
    unbound: boolean;
    suppressAutoLoad: boolean;
    template: View.ViewTemplate;
    private _isLoading;
    private _renderContext;
    /**
     * @constructs View
     * @extends StatefulPart
     * @param {View.defaultOptions} options View options
     */
    constructor(options?: View.Options);
    /**
     * Indicates that something is loading at the moment.
     * If the method is invoked without any arguments, it returns true if the internal loading counter is greater than zero.
     * If the method is invoked with an argument, it increase (an argument is true) or decrease (an argument is false)
     * the internal loading counter.
     * @param {boolean} [v]
     * @returns {boolean}
     */
    isLoading(v?: boolean): boolean;
    setViewModel(viewModel: any): void;
    setTemplate(template: HandlebarsTemplateDelegate | string): void;
    /**
     *
     * @param {Function|string} template
     * @returns {Function}
     */
    private prepareTemplate(template);
    /**
     * Called when the observable template is changed.
     */
    private onTemplateChange();
    /**
     * Called when the observable template returns.
     * @param {*} result
     */
    private onTemplateReturn(result);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected afterRender(): void;
    unload(options?: PartCloseOptions): void;
    protected onReady(): void;
    renderContext(v?: any): any;
    dispose(options?: PartCloseOptions): void;
    /**
     * @deprecated Do not compile templates in runtime, use xhtmpl plugin to import templates instead
     */
    static compileTemplate(template: HandlebarsTemplateDelegate | string): HandlebarsTemplateDelegate;
    static newId(): string;
    static addCallback(data: View.HelperData, callback: Function, callbackArgs: any[]): void;
    static applyCallbacks(data: View.HelperData, selector: JQuery): void;
    /**
     * Finds the specified DOM element.
     * @param {object} target Specifies target element.
     * @param {string} target.id The ID of the target element
     * @param {string} target.selector The jQuery selector of the target element
     * @param {JQuery} $root Root element that contains target element.
     * @param {boolean} [ignoreMissing] Ignore missing target
     * @returns {JQuery}
     */
    static findElement(target: HelperTarget | string, $root: JQuery, ignoreMissing?: boolean): JQuery;
    /**
     * @this {View}
     */
    static renderChild(target: HelperTarget, part: IPart | (() => IPart), context: any, registerOptions: RegisterChildOptions, $root: JQuery): lang.Promisable<void>;
    static Handlebars: typeof Handlebars;
}
declare namespace View {
    interface Options extends Part.Options {
        /**
         * Handlebars template to render the view. Usually you should load template via xhtml RequireJS-plugin
         */
        template?: HandlebarsTemplateDelegate | string;
        /**
         * Handlebars template to render an error. Usually you should load template via xhtml RequireJS-plugin
         */
        errorTemplate?: HandlebarsTemplateDelegate;
        waitingTemplate?: HandlebarsTemplateDelegate;
        showWaitingAnimation?: boolean;
        /**
         * Whether View should be bound to its viewModel changes or not. By default it's bound.
         * That means that View will rerender on every viewModel change.
         */
        unbound?: boolean;
        /**
         * ViewModel.
         */
        viewModel?: any;
        /**
         * Option for ObservableExpression - `true` to disable auto loading of unloaded object observed during template's function execution
         */
        suppressAutoLoad?: boolean;
    }
    interface HelperOptions extends Handlebars.HelperOptions {
        data?: HelperData;
    }
    type HelperTarget = {
        id?: string;
        selector?: string;
    };
    class HelperMarkup {
        protected _hash: any;
        data: HelperData;
        ignoreMissingTarget: boolean;
        /**
         * Specified target DOM element
         * @type {Object}
         * @property {String} [target.id] The ID of the target element
         * @property {String} [target.selector] The jQuery selector of the target element
         * Use View.HelperMarkup.findElement method to find DOM-element by this target.
         */
        target: HelperTarget;
        /**
         * Helper must be rendered in-place (because of the target isn't specified)
         * @type {Boolean}
         */
        inplace: boolean;
        /**
         * Provides some methods and properties for rendering Handlebars helpers
         * @constructs HelperMarkup
         * @param {Object} helperOptions
         * @param {Object} helperOptions.data
         * @param {Object} helperOptions.hash
         * @param {String} helperOptions.hash.target
         * @article (Helper "target")[docs:helper-target]
         */
        constructor(helperOptions: HelperOptions);
        /**
         * Returns a clone of the helper hash without service attributes
         * @returns {Object}
         */
        getHash(): any;
        /**
         * Returns helper HTML for using in Handlebars
         * @returns {Handlebars.SafeString}
         */
        getHtml(): Handlebars.SafeString;
    }
    /**
     * @constructs ChildViewMarkup
     * @extends HelperMarkup
     */
    class ChildViewMarkup extends HelperMarkup {
        getHash(): any;
        getHtml(): Handlebars.SafeString;
        getRegisterOptions(options?: RegisterChildOptions): RegisterChildOptions;
        /**
         * Add a callback that registers the child part and renders it
         * @param {Part|Function} part An instance of part of a factory that creates part
         * @param {Object} [options] default options for Part.registerChild method
         */
        registerPendingChild(part: IPart | (() => IPart), options?: RegisterChildOptions): void;
    }
    interface ViewTemplate extends HandlebarsTemplateDelegate {
        isLoading?: boolean;
        dispose?(): void;
    }
    interface HelperData {
        view: View;
        callbacks: {
            func: Function;
            args: any[];
        }[];
        context: any;
        index?: number;
    }
}
export = View;
