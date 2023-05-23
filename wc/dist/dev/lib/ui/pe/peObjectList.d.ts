/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import NavigationPropertyEditor = require("lib/ui/pe/NavigationPropertyEditor");
import ListCommonMixin from "lib/ui/list/ListCommonMixin";
import ObjectListMixin = require("lib/ui/list/ObjectListMixin");
import Menu = require("lib/ui/menu/Menu");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import "xcss!lib/ui/styles/peObjectList";
import list = require("lib/ui/list/.list");
import domain = require("lib/domain/.domain");
import { Violation } from "lib/validation";
import { EditorCommandOptions, EditorCommandResult, SelectorCommandResult } from "lib/ui/PartCommandMixin";
import lang = core.lang;
import Promise = lang.Promise;
import Promisable = lang.Promisable;
import ICommand = core.commands.ICommand;
import ObjectListColumn = list.ObjectListColumn;
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
import INavigationPropSet = domain.INavigationPropSet;
import ValidationOptions = PropertyEditor.ValidationOptions;
import AggregatedViolation = peObjectList.AggregatedViolation;
declare class peObjectList extends NavigationPropertyEditor implements list.IDomainObjectList, ObjectListMixin {
    static defaultOptions: peObjectList.Options;
    static defaultMenus: lang.Map<Menu.Options>;
    defaultMenus: {
        peObjectListRow?: Menu.Options;
        peObjectListSelection?: Menu.Options;
    };
    /**
     * @enum {String}
     */
    events: {
        DATA_LOADED: string;
    };
    options: peObjectList.Options;
    commands: lang.Map<core.commands.ICommand>;
    menuList: Menu;
    menuRow: Menu;
    menuSelection: Menu;
    /**
     * @constructs peObjectList
     * @extends NavigationPropertyEditor
     * @mixes ListCommonMixin
     * @param {Object} options
     */
    constructor(options?: peObjectList.Options);
    protected tweakOptions<T extends peObjectList.Options>(options: T): void;
    protected createCommands(): lang.Map<ICommand>;
    protected doDeleteSelection(): void;
    protected canDeleteSelection(): boolean;
    protected doUnlinkSelection(): Promisable<void>;
    protected canUnlinkSelection(): boolean;
    protected createRowMenuDefaults(): Menu.Options;
    protected createSelectionMenuDefaults(): Menu.Options;
    protected createRowMenu(): Menu;
    protected createSelectionMenu(): Menu;
    setViewModel(viewModel: DomainObject): void;
    protected _initializeColumns(): void;
    protected _ensurePropLoaded(): Promisable<void>;
    protected _onPropChanged(sender: any, value: any): void;
    private _onDataLoaded(data?);
    protected onDataLoaded(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected _onViolationsChange(): void;
    runValidation(options?: ValidationOptions): Violation;
    protected _errorToHtml(error: AggregatedViolation | Error | string): string;
    currentValue(): DomainObject;
    findDomainProp(column: ObjectListColumn): PropertyMeta;
    focus(): void;
    scrollToSelf(): void;
    protected onBeforeEdit(editOptions: EditorCommandOptions): void;
    protected onAfterEdit(result: EditorCommandResult, editOptions: EditorCommandOptions): void;
    protected onAfterCreate(result: EditorCommandResult, createOptions: EditorCommandOptions): void;
    protected onSiblingsNavigated(result: EditorCommandResult, options: EditorCommandOptions): void;
    protected _onSelectedValues(result: SelectorCommandResult): void;
    protected _addObject(obj: DomainObject): void;
    protected _valueIds(): string[];
    protected onColumnsChanged(): void;
    protected shouldValidateItem(item: DomainObject): boolean;
    protected canUnlink(): boolean;
    protected doUnlink(): void | Promise<void>;
    protected _unlinkObjects(objects?: DomainObject[]): void;
    doUnlinkObjects(objects: DomainObject[]): Promisable<void>;
    protected executeUnlink(objects: DomainObject[]): void;
    protected shouldValidateItems(options?: ValidationOptions): boolean;
    protected doDelete(): void;
    protected executeDelete(objects?: DomainObject[]): void;
    protected getMessage(resources: lang.Map<string>, op: string, mod: string): string;
    getChangedItems(): Array<any>;
}
interface peObjectList extends ListCommonMixin<DomainObject>, ObjectListMixin {
    value(v: INavigationPropSet): void;
    value(): INavigationPropSet;
}
declare namespace peObjectList {
    interface Options extends NavigationPropertyEditor.Options, ListCommonMixin.Options, ObjectListMixin.Options {
        preloads?: string | string[];
        menuRow?: Menu.Options;
        menuSelection?: Menu.Options;
        indexed?: boolean;
        /**
         * Data loaded event handler
         * @type {Function}
         */
        onDataLoaded?: (sender: peObjectList) => void;
    }
    interface AggregatedViolation extends Violation {
        aggregated?: boolean;
    }
}
export = peObjectList;
