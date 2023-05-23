/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import binding = require("lib/binding");
import formatters = require("lib/formatters");
import validation = require("lib/validation");
import "bootstrap";
import "jquery-ui/core";
import { metadata } from "lib/domain/.domain";
import lang = core.lang;
import IDisposable = lang.IDisposable;
import IBindable = binding.IBindable;
import ValueType = metadata.ValueType;
import Violation = validation.Violation;
import SafeHtml = formatters.SafeHtml;
import FormatOptions = formatters.FormatOptions;
import PropertyEditorConstructor = PropertyEditor.DefaultMapping.PropertyEditorConstructor;
import PropertyEditorFactory = PropertyEditor.DefaultMapping.PropertyEditorFactory;
import PropertyEditorMap = PropertyEditor.DefaultMapping.PropertyEditorMap;
import ValidationOptions = PropertyEditor.ValidationOptions;
import { Part, EditorPage } from "core.ui";
declare class PropertyEditor extends Component {
    static DefaultMapping: PropertyEditorMap;
    static defaultOptions: PropertyEditor.Options;
    /**
     * Default options by context
     */
    static contextDefaultOptions: lang.Map<PropertyEditor.Options>;
    options: PropertyEditor.Options;
    id: string;
    /**
     * name of viewModel, passed via Options.name
     */
    viewModelProp: string;
    /**
     * original name, usually the same as viewModelProp/options.name but differs for prop-chains (viewModelProp/options.name change fullName does not)
     */
    fullName: string;
    element: JQuery;
    /**
     * Editor page where this PE is located. May be undefined if PE does not belong to any page
     */
    protected editorPage?: EditorPage;
    protected _chainPropName: string;
    protected layout: PropertyEditor.LayoutOptions;
    private _nullable;
    private _disposes;
    private _disposesPersisted;
    private _notAuthorized;
    private _domElement;
    /**
     * @constructs PropertyEditor
     * @extends Component
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.descr
     * @param {String} options.vt
     * @param {String} [options.hint]
     * @param {boolean} [options.nullable]
     * @param {boolean} [options.readOnly=false]
     * @param {Object} [options.formatter]
     * @param {String} [options.formatterName]
     * @param {Array} [options.rules]
     * @param {Object} [options.layout]
     * @param {boolean} [options.hidden=false]
     * @param {boolean} [options.disabled=false]
     */
    constructor(options?: PropertyEditor.Options);
    /**
     * Title. By default it's description of the property
     * @observable-property {String}
     */
    title: lang.ObservableProperty<string>;
    notnull(): boolean;
    notnull(v: boolean): void;
    useNotNullStyle(): boolean;
    protected onNotnullChange(v: boolean): void;
    /**
     * @observable-property {Boolean}
     */
    hidden: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    disabled: lang.ObservableProperty<boolean>;
    /**
     * @observable-property {Boolean}
     */
    autoValidate: lang.ObservableProperty<boolean>;
    bindingError(): any;
    bindingError(v: any): void;
    violation(): any;
    violation(v: any): void;
    createId(viewModel: any, prop: string): string;
    setEditorPage(page: EditorPage): void;
    setViewModel(viewModel: any): void;
    protected _unsubscribeViewModel(): void;
    protected onSetViewModel(viewModel: any): any;
    protected _observePropChain(vmRoot: any, chain: {
        props: any[];
    }): void;
    /**
     * @deprecated Use Part.mixOptions instead
     * @param staticOptions
     * @param options
     * @returns {*}
     */
    protected mergeOptions(staticOptions: PropertyEditor.Options, options: PropertyEditor.Options): PropertyEditor.Options;
    protected _validateRequiredOptions(options: PropertyEditor.Options): void;
    protected createBindableProp(): IBindable;
    protected databind(element: HTMLElement | JQuery | IBindable): void;
    protected _onDisabledChange?(v: boolean): void;
    protected _bindToDisabled(): void;
    /**
     * Creates binding between disabled prop and html:
     * if the current part contains _onDisabledChange method then binding will call it,
     * otherwise simple html "disabled" binding will be created.
     * @protected
     */
    protected _bindElementToDisabled(): void;
    /**
     * Creates binding between disabled prop and nullable options:
     * for disabled PE set nullable=true, for enabled PE restores previous value.
     * @private
     */
    protected _bindNullableToDisabled(): void;
    protected validate?(): string | Violation;
    protected createViolation(error: string | SafeHtml | Violation): Violation;
    /**
     * Run validation for the current property editor - validate viewModel's property with PE's metadata
     * @return {Object} violation object or undefined if there was no errors
     */
    runValidation(options?: ValidationOptions): Violation;
    /**
     * Validate property current value using rules in options.
     * @returns {Violation}
     */
    protected validateProp(): Violation;
    /**
     * Run validation for the current property editor - validate viewModel's property with PE's metadata
     * @method
     * @async-debounce throttle=100
     * @return {Object} violation object or undefined if there was no errors
     */
    runValidationAsync: (options?: ValidationOptions) => void;
    protected shouldValidate(options?: ValidationOptions): boolean;
    protected _onPropChanged(sender: any, value: any): void;
    protected onNotAuthorized(rollback?: boolean): void;
    protected _onPropErrorChanged(error: Violation): void;
    /**
     * Handler for changing "bindingError"
     * @param {*} newVal
     * @private
     */
    protected _onBindingErrorChanged(newVal: string): void;
    /**
     * Handler for changin "violation".
     * It's also called directly if violation already exists during render.
     * @param {*} [newVal]
     * @private
     */
    protected _onViolationChanged(newVal?: Violation): void;
    /**
     * Add a "disposable" - an object holding some subscription to destroy on unload.
     * Usually disposables are created with binding.databind or Observable.subscribe.
     * @param disposable
     * @param [name] optional name of subscription to guarantee its uniqueness (dispose existing).
     * @param [persisted] true to dispose the disposable on dispose instead of unload
     */
    addDisposable(disposable: IDisposable, name?: string, persisted?: boolean): void;
    protected _getRawValue(viewModel?: any): any;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected afterRender(): void;
    protected onReady(): void;
    protected onUnready(): void;
    unload(options?: Part.CloseOptions): void;
    dispose(options?: Part.CloseOptions): void;
    protected _setWidth(): void;
    protected _bindHotkeys(): void;
    protected _bindToEsc(): void;
    protected renderError(error: Violation | Error | string): void;
    protected _renderError(error: Violation | Error | string, $element: JQuery): void;
    protected _errorToHtml(error: Violation | Error | string): string;
    protected renderNotAuthorize(domElement: JQuery | HTMLElement): void;
    /**
     * Returns true if the editor should fill entire row.
     * The method is used in templates.
     * @return {boolean}
     */
    isFullWidth(): boolean;
    focus(): void;
    scrollToSelf(): void;
    activate(): void;
    value(v: any): void;
    value(): any;
}
declare namespace PropertyEditor {
    interface Options extends Component.Options, FormatOptions {
        /**
         * Name of the property
         */
        name?: string;
        /**
         * Description of the property for UI
         */
        descr?: string;
        /**
         * Property type (for navigation properties - use "object")
         */
        vt?: ValueType;
        /**
         * Flag of navigation array (set) property
         */
        many?: boolean;
        /**
         * Specifies or overrides nullability for property
         */
        nullable?: boolean;
        /**
         * directly switch 'not-null' style
         * e.g. for NOT nullable property show label as if it is not nullable (don't show red asterisk) and vice versa
         */
        useNotNullStyle?: boolean;
        readOnly?: boolean;
        rules?: validation.Rule[];
        tryParse?: (v: any, skipValidation?: boolean) => {
            errorMsg?: string | SafeHtml;
            parsedValue?: any;
        };
        /**
         * Popup tooltip (hint) for context help
         */
        hint?: string;
        /**
         * Switch off of showing tooltip for hint (i.e. even if hint specified there will be no help icon with tooltip)
         */
        hideHelp?: boolean;
        layout?: LayoutOptions;
        hidden?: boolean;
        disabled?: boolean;
        width?: string | number;
        cssClass?: string;
        onSetViewModel?: (viewModel: any) => any;
        blurOnEsc?: boolean;
        autoValidate?: boolean;
        contextName?: string;
        PropertyEditor?: PropertyEditorConstructor | PropertyEditorFactory;
        presentation?: string;
        chain?: {
            props: any[];
        };
        debounce?: number;
    }
    interface LayoutOptions {
        position?: string;
        noLabel?: boolean;
    }
    interface ValidationOptions {
        reason?: string;
    }
    namespace DefaultMapping {
        interface PropertyEditorConstructor {
            new (options: Options): PropertyEditor;
        }
        interface PropertyEditorFactory {
            create(options: Options): PropertyEditor;
        }
        interface PropertyEditorResolver {
            (propMeta: any): PropertyEditorConstructor | PropertyEditorFactory;
        }
        interface PropertyEditorRegisterOptions {
            vt?: string;
            priority?: number;
        }
        interface PropertyEditorMap {
            register(resolver: PropertyEditorResolver, options?: PropertyEditorRegisterOptions): void;
            getImpl(propMeta: PropertyEditor.Options): PropertyEditorConstructor | PropertyEditorFactory;
            create(propMeta: PropertyEditor.Options, viewModel?: any): PropertyEditor;
            peNotAuthorized: PropertyEditorConstructor;
            peNotImplemented: PropertyEditorConstructor;
            [key: string]: PropertyEditorConstructor | any;
        }
    }
    interface Summary {
        title: string;
        value: any;
    }
}
export = PropertyEditor;
