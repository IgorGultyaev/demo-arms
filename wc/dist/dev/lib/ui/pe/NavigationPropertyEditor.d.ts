/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peObjectBase = require("lib/ui/pe/peObjectBase");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import lang = core.lang;
import domain = require("lib/domain/.domain");
import DomainObject = domain.DomainObject;
import ICommand = core.commands.ICommand;
import PropertyMeta = domain.metadata.PropertyMeta;
import EntityMeta = domain.metadata.EntityMeta;
import Promise = core.lang.Promise;
import EditorCommandOptions = PartCommandMixin.EditorCommandOptions;
import EditorCommandResult = PartCommandMixin.EditorCommandResult;
import SelectorCommandOptions = PartCommandMixin.SelectorCommandOptions;
import SelectorCommandResult = PartCommandMixin.SelectorCommandResult;
declare abstract class NavigationPropertyEditor extends peObjectBase {
    static defaultOptions: NavigationPropertyEditor.Options;
    /**
     * Default options by context
     */
    static contextDefaultOptions: lang.Map<NavigationPropertyEditor.Options>;
    options: NavigationPropertyEditor.Options;
    viewModel: DomainObject;
    valueObjectEntityType: EntityMeta;
    private _oppositeCanUnlink;
    /**
     * @description Base class for navigation property editors.
     * @constructs NavigationPropertyEditor
     * @extends peObjectBase
     */
    constructor(options?: NavigationPropertyEditor.Options);
    setViewModel(viewModel: DomainObject): void;
    /**
     * Create commands
     * @protected
     * @returns {Object.<string, BoundCommand>}
     */
    protected createCommands(): lang.Map<ICommand>;
    private _createNestedEditorContext();
    protected doEdit(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected canEdit(): boolean;
    protected onBeforeEdit(editOptions: EditorCommandOptions): void;
    protected onAfterEdit(result: EditorCommandResult, editOptions: EditorCommandOptions): void;
    protected doView(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected canView(): boolean;
    protected onBeforeView(viewOptions: EditorCommandOptions): void;
    protected onAfterView(result: EditorCommandResult, viewOptions: EditorCommandOptions): void;
    protected doCreate(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected canCreate(): boolean;
    protected onBeforeCreate(createOptions: EditorCommandOptions): void;
    protected onAfterCreate(result: EditorCommandResult, createOptions: EditorCommandOptions): void;
    /**
     * @abstract
     */
    protected abstract _addObject(obj: DomainObject): void;
    /**
     * Handles Select command's result.
     * @param {Object} result
     * @param {Array} result.selection
     * @protected
     */
    protected _onSelectedValues(result: SelectorCommandResult): void;
    /**
     * @abstract
     */
    protected abstract _valueIds(): string[];
    /**
     * Returns array of ids of objects which should not be visible to user.
     * @returns {Array|*}
     * @private
     */
    private _getExcludeIds();
    /**
     * Open ObjectSelector
     * @param {Object} [args]
     * @param {String} [args.partName] objectSelector part name
     * @param {Object} [args.partOptions] Options for objectSelector (will override options.selectorOptions.partOptions)
     * @returns {Promise}
     */
    protected doSelect(args: SelectorCommandOptions): Promise<SelectorCommandResult>;
    protected canSelect(): boolean;
    protected onBeforeSelect(selectOptions: SelectorCommandOptions): void;
    protected onAfterSelect(result: SelectorCommandResult, selectOptions: SelectorCommandOptions): void;
    /**
     * Unlink command implementation method - unlink currently selected object.
     */
    protected abstract doUnlink(): void | Promise<void>;
    protected canUnlink(): boolean;
    protected _isOrphan(obj: DomainObject): boolean;
    protected abstract doDelete(): void;
    protected canDelete(): boolean;
    /**
     * Returns currently active object.
     * Must be an observable expression.
     * @abstract
     * @returns {DomainObject}
     */
    abstract currentValue(): DomainObject;
}
interface NavigationPropertyEditor extends PartCommandMixin {
}
declare namespace NavigationPropertyEditor {
    interface Options extends peObjectBase.Options, PartCommandMixin.Options {
        opposite?: PropertyMeta;
    }
}
export = NavigationPropertyEditor;
