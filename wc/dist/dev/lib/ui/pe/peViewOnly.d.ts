/// <reference path="../../../modules/clipboard/core.ui.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import "xcss!lib/ui/styles/peViewOnly";
import { Part } from "core.ui";
import { DomainObject } from "lib/domain/.domain";
import { EditorContext } from "lib/ui/editor/ObjectEditor";
import lang = core.lang;
import Promise = lang.Promise;
import ICommand = core.commands.ICommand;
import ViewOptions = peViewOnly.ViewOptions;
import Options = peViewOnly.Options;
declare class peViewOnly extends PropertyEditor {
    static defaultOptions: Options;
    static contextDefaultOptions: lang.Map<Options>;
    options: Options;
    commands: lang.Map<ICommand>;
    protected urlFormatter: (v: DomainObject) => string;
    private _clipboardBtn;
    /**
     * @constructs peViewOnly
     * @extends PropertyEditor
     * @param {Object} options
     */
    constructor(options?: Options);
    tweakOptions(options: Options): void;
    /**
     * Return formatted (as text) prop value presentation.
     * Used in template with additional html-encoding.
     * @returns {string}
     */
    formattedValue(): string;
    /**
     * Return html-formatted prop value presentation.
     * Used in template without additional html-encoding.
     * @returns {string} html/text
     */
    formattedHtml(): string;
    isEmpty(): boolean;
    protected onReady(): void;
    unload(options?: Part.CloseOptions): void;
    protected createCommands(): lang.Map<ICommand>;
    getViewUrl(obj: DomainObject): string;
    /**
     * Open a viewer for the object
     * @param {Object} args Command arguments
     * @param {Object} args.object Object ot view
     * @returns {*|jQuery.Deferred|$.Promise}
     */
    protected doView(args: ViewOptions): Promise<PartCommandMixin.EditorCommandResult>;
    protected canView(): boolean;
    protected _createNestedEditorContext(): EditorContext;
}
interface peViewOnly extends PartCommandMixin {
}
declare namespace peViewOnly {
    interface Options extends PropertyEditor.Options, PartCommandMixin.Options {
        template?: HandlebarsTemplateDelegate;
        itemFormatter?: string | ((v: DomainObject) => string);
        urlFormatter?: (v: DomainObject) => string;
        hideEmpty?: boolean;
        emptyValue?: any;
        navigable?: boolean;
        showCopy?: boolean;
        partialTemplates?: PartialTemplates;
        html?: boolean;
        /**
         * root element with x-pe-viewonly class focusable
         */
        focusable?: boolean;
        /**
         * links (a) for values of navigation prop focusable
         */
        focusableLink?: boolean;
    }
    interface PartialTemplates {
        data?: HandlebarsTemplateDelegate;
        empty?: HandlebarsTemplateDelegate;
        [name: string]: HandlebarsTemplateDelegate;
    }
    interface ViewOptions extends PartCommandMixin.EditorCommandOptions {
        object?: DomainObject;
    }
}
export = peViewOnly;
