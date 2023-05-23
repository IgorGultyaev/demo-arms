/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectEditor = require("lib/ui/editor/ObjectEditor");
import Menu = require("lib/ui/menu/Menu");
import "xcss!lib/ui/styles/objectFilter";
import domain = require("lib/domain/.domain");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import lang = core.lang;
import Promisable = lang.Promisable;
import ICommand = core.commands.ICommand;
import Command = core.commands.Command;
import DomainObject = domain.DomainObject;
import PropertyData = ObjectFilter.PropertyData;
import FilterData = ObjectFilter.FilterData;
import RestrictionsData = ObjectFilter.RestrictionsData;
import SavedRestrictions = ObjectFilter.SavedRestrictions;
import { Model } from "lib/ui/editor/ObjectEditor";
declare class ObjectFilter extends ObjectEditor implements core.ui.IFilterPart {
    /**
     * context name for property editors
     * @constant {String}
     */
    contextName: string;
    /**
     * Filter is able display violations by itself
     * @constant {Boolean}
     */
    canDisplayViolations: boolean;
    /** Implementation class of "Save filter" editor */
    SaveFilterEditor: typeof ObjectFilter.SaveFilterEditor;
    /**
     * @type {Object}
     * @property {Object} comparers
     * @property {Object} presenterOptions
     * @property {Boolean} savedFilters
     */
    static defaultOptions: ObjectFilter.Options;
    /**
     * @type {Object}
     */
    static defaultMenu: Menu.Options;
    defaultMenu: Menu.Options;
    options: ObjectFilter.Options;
    viewModel: DomainObject;
    commands: ObjectFilter.KnownCommands;
    comparers: ObjectFilter.PropertyComparerMap;
    /**
     * Restrictions object corresponding to "empty" state (after Clear command executed)
     */
    private _emptyRestrictions;
    private _applyingRestrictions;
    /**
     * @constructs ObjectFilter
     * @extends ObjectEditor
     * @param {Object} options
     */
    constructor(options?: ObjectFilter.Options);
    /**
     * @observable-property {Object}
     * Restrictions JSON extracted from viewModel.
     * Latest restrictions created in getRestrictions.
     * DO NOT USE it directly, it's observable property for saving/restoring from UserSettings.
     * NOTE: it's NOT  the same object as was returned from getRestrictions method.
     */
    restrictions: lang.ObservableProperty<FilterData>;
    /**
     * @observable-property {Array}
     * Saved filters.
     */
    savedRestrictions: lang.ObservableProperty<SavedRestrictions[]>;
    protected createMenuDefaults(): Menu.Options;
    /**
     * @protected
     * @override
     * @returns {{ClearFilter: (Command), SaveFilter: (Command)}}
     */
    protected createCommands(): ObjectFilter.KnownCommands;
    protected _getManageFilterMenu(): Menu.Options;
    protected _createFilterMenuItem(restrictionItem: SavedRestrictions, isRuntime: boolean): Menu.Item;
    protected _saveFilter(filterData: FilterData, filterDesc: PropertyEditor.Summary[]): void;
    saveFilter(): void;
    protected _fromJson(viewModel: ObjectEditor.Model, data: FilterData): void;
    protected _toJson(viewModel: ObjectEditor.Model): FilterData;
    setViewModel(viewModel: ObjectEditor.Model): void;
    protected _setViewModelComplete(viewModel: Model): void;
    isEmpty(): boolean;
    clearRestrictions(): void;
    /**
     * Applying new restrictions - set them as viewModel.
     * @param {Object|Promise|Function} restrictions New restrictions as JSON, or Promise of JSON, or function returning JSON or Promise of JSON
     * @param {string} [source]
     */
    applyRestrictions(restrictions: lang.Lazy<Promisable<FilterData>>, source?: string): void;
    _applyRestrictions(restrictions: lang.Lazy<Promisable<FilterData>>, source?: string): void;
    protected onApplyRestriction(restrictions: FilterData, source: string): void;
    protected onRestrictionsRestored(restrictions: FilterData): boolean;
    protected onSaveRestrictions(restrictions: FilterData): FilterData;
    getRestrictions(): RestrictionsData;
    protected _onRestrictionsChange(sender: ObjectFilter, value: FilterData): void;
    protected _createRestrictions(json: FilterData): RestrictionsData;
    protected _createEmptyRestrictions(): FilterData;
    protected _addRestriction(restrictions: RestrictionsData, key: string, v: PropertyData): void;
    protected _mergeRestrictions(objTo: RestrictionsData, objFrom: RestrictionsData): void;
    static formatFilterDesc(desc: PropertyEditor.Summary[]): string;
}
declare namespace ObjectFilter {
    interface Options extends ObjectEditor.Options {
        comparers?: PropertyComparerMap;
        savedFilters?: boolean;
        filters?: SavedRestrictions[];
        onRestrictionsRestored?: (restrictions: {}) => boolean;
        emptyRestrictions?: FilterData;
    }
    type PropertyData = string | number | boolean | string[] | number[] | boolean[];
    interface PropertyComparison {
        [op: string]: PropertyData;
    }
    /**
     * Json представление фильтра без подстановки comparers
     */
    interface FilterData {
        [propName: string]: PropertyData;
    }
    /**
     * Итоговые органичения фильтра после подстановки comparers
     */
    interface RestrictionsData {
        [propName: string]: PropertyData | PropertyComparison;
    }
    type PropertyComparer = string | RestrictionsData | ((v: any) => RestrictionsData);
    interface PropertyComparerMap {
        [propName: string]: PropertyComparer;
    }
    interface SavedRestrictions {
        title?: string;
        descr?: PropertyEditor.Summary[];
        restrictions?: lang.Lazy<Promisable<FilterData>>;
        created?: Date;
        updated?: Date;
    }
    interface KnownCommands extends lang.Map<ICommand> {
        ClearFilter?: Command;
        SaveFilter?: Command;
        RestoreFilter?: Command;
        MergeFilter?: Command;
        DeleteFilter?: Command;
        DeleteFilters?: Command;
    }
    interface RestoreSavedFilterEventArgs {
        restrictions: lang.Lazy<Promisable<FilterData>>;
    }
    interface DeleteSavedFilterEventArgs {
        index: number;
    }
    class SaveFilterEditor extends ObjectEditor {
        static defaultMenu: Menu.Options;
        restrictions: SavedRestrictions[];
        filterData: FilterData;
        filterDesc: PropertyEditor.Summary[];
        viewModel: SaveFilterEditor.Model;
        /**
         * @constructs SaveFilterEditor
         * @extends ObjectEditor
         * @param restrictions
         * @param filterData
         * @param filterDesc
         */
        constructor(restrictions: SavedRestrictions[], filterData: FilterData, filterDesc: PropertyEditor.Summary[]);
        protected static createDefaultOptions(restrictions: SavedRestrictions[], filterDesc: PropertyEditor.Summary[]): ObjectEditor.Options;
        protected static createViewModel(restrictions: SavedRestrictions[], filterDesc: PropertyEditor.Summary[]): SaveFilterEditor.Model;
        protected onSetViewModel(viewModel: SaveFilterEditor.Model): SaveFilterEditor.Model;
        protected createMenu(): Menu;
        protected createCommands(): lang.Map<ICommand>;
        protected updateRestrictions(): SavedRestrictions[];
    }
    namespace SaveFilterEditor {
        interface Model extends lang.Observable {
            filterDesc: lang.ObservableProperty<string>;
            isNew: lang.ObservableProperty<boolean>;
            name: lang.ObservableProperty<string>;
            existingFilter: lang.ObservableProperty<string>;
            existingFilterDesc: lang.ObservableProperty<string>;
            validate(): ObjectEditor.Violation | string;
        }
    }
}
export = ObjectFilter;
