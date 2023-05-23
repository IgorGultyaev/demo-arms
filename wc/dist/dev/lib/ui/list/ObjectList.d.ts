/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import List = require("lib/ui/list/List");
import PartCommandMixin = require("lib/ui/PartCommandMixin");
import ObjectListLoader = require("lib/ui/list/ObjectListLoader");
import Menu = require("lib/ui/menu/Menu");
import { ContextPartComponentMixin, IContextPart } from "lib/ui/validation/ContextPartMixin";
import UnitOfWork = require("lib/domain/UnitOfWork");
import ObjectListMixin = require("lib/ui/list/ObjectListMixin");
import lang = core.lang;
import domain = require("lib/domain/.domain");
import list = require("lib/ui/list/.list");
import { LoadQueryParams, DomainObjectData } from "lib/interop/.interop";
import ObservableCollection = lang.ObservableCollection;
import ICommand = core.commands.ICommand;
import Promise = lang.Promise;
import Application = core.Application;
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
import EditorCommandOptions = PartCommandMixin.EditorCommandOptions;
import EditorCommandResult = PartCommandMixin.EditorCommandResult;
import ObjectListColumn = list.ObjectListColumn;
import IObjectListLoader = ObjectListLoader.IObjectListLoader;
import IObjectListPresenter = list.IObjectListPresenter;
import DataLoadEventArgs = ObjectList.DataLoadEventArgs;
import LoadOptions = ObjectList.LoadOptions;
import { ICommandFactory } from "lib/core.commands";
import { SaveOptions } from "../../interop/.interop";
declare class ObjectList extends List<DomainObject> implements list.IDomainObjectList, ObjectListMixin {
    static defaultOptions: ObjectList.Options;
    static defaultMenus: ObjectList.KnownMenus;
    defaultMenus: ObjectList.KnownMenus;
    options: ObjectList.Options;
    presenter: IObjectListPresenter;
    entityType: string;
    uow: UnitOfWork;
    contextParts: ObservableCollection<IContextPart>;
    protected loader: IObjectListLoader;
    protected keepChangesOnReload: boolean;
    protected _entityType: domain.metadata.EntityMeta;
    protected _lastLoadParams: LoadQueryParams;
    protected _orderByServer: boolean;
    private _ownUow;
    protected _suppressOnObjectDetached: boolean;
    /**
     * @constructs ObjectList
     * @extends List
     * @param {Application} app
     * @param {Object} options
     * @param {Array} options.columns Array of column descriptors
     * @param {String} options.columns.name
     * @param {String} options.columns.prop
     * @param {String} options.columns.title
     * @param {Function} [options.columns.formatter]
     * @param {Object} options.stateMessages Overwrite state messages (key - name of state, value - message text)
     */
    constructor(app: Application, options?: ObjectList.Options);
    protected tweakOptions(options: ObjectList.Options): void;
    /**
     * @observable-property {Boolean}
     */
    saving: lang.ObservableProperty<boolean>;
    findDomainProp(column: ObjectListColumn): PropertyMeta;
    protected _preinitialize(): void;
    protected _initOrderBy(): void;
    protected createLoader(): IObjectListLoader;
    protected createListMenuDefaults(): Menu.Options;
    protected createRowMenuDefaults(): Menu.Options;
    protected createSelectionMenuDefaults(): Menu.Options;
    protected _initializeColumn(col: ObjectListColumn | string, initFromLoader?: boolean, initFromType?: boolean): ObjectListColumn;
    private _generateColumnFromType();
    protected _initializeColumns(): void;
    /**
     * @protected
     */
    protected onColumnsChanged(): void;
    /**
     * @protected
     * @override
     * @returns {{Reload: BoundCommand, Edit: BoundCommand, Delete: BoundCommand, Create: BoundCommand, Save: BoundCommand, Cancel: BoundCommand}}
     */
    protected createCommands(): core.commands.ICommandLazyMap;
    protected doCreate(args: any): Promise<EditorCommandResult>;
    protected canCreate(): boolean;
    protected onBeforeCreate(createOptions: EditorCommandOptions): void;
    protected onAfterCreate(result: EditorCommandResult, createOptions: EditorCommandOptions): void;
    /**
     * Object creation handler.
     * @param {String} type Type of object
     * @param {DomainObject} obj Object (viewModel) was returned from editor
     */
    protected onObjectCreated(type: string, obj: DomainObject): void;
    protected doEdit(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected canEdit(): boolean;
    protected onBeforeEdit(editOptions: EditorCommandOptions): void;
    protected onAfterEdit(result: EditorCommandResult, editOptions: EditorCommandOptions): void;
    protected doView(args: EditorCommandOptions): Promise<EditorCommandResult>;
    protected canView(): boolean;
    protected onBeforeView(viewOptions: EditorCommandOptions): void;
    protected onAfterView(result: EditorCommandResult, viewOptions: EditorCommandOptions): void;
    protected onSiblingsNavigated(result: EditorCommandResult, options: EditorCommandOptions): void;
    protected doDelete(): void;
    protected canDelete(): boolean;
    protected doDeleteSelection(): void;
    protected canDeleteSelection(): boolean;
    protected executeDelete(objects?: DomainObject[]): void;
    protected doSave(): Promise<void>;
    protected canSave(): boolean;
    protected _saveChanges(): Promise<any>;
    protected _onSaveError(args: UnitOfWork.SaveErrorArgs): void;
    protected onSaving(args: ObjectList.SavingEventArgs): void;
    protected onSaved(args: ObjectList.SavedEventArgs): void;
    protected onSaveError(args: {
        objects: DomainObjectData[];
        error: Error;
    }): void;
    protected doCancel(): void;
    protected canCancel(): boolean;
    protected canSelectAll(): boolean;
    protected shouldValidateItem(item: DomainObject): boolean;
    protected getCommand(cmdName: string): ICommand | ICommandFactory;
    dispose(options?: core.ui.Part.CloseOptions): void;
    /**
     * @override
     * @param args
     * @param {Object} args.params Loader parameters. If not specified, parameters from the filter are used.
     * @returns {Promise.<DomainObject[]>}
     */
    reload(args?: LoadOptions): lang.Promise<DomainObject[]>;
    /**
     * @override
     */
    protected _load(params?: LoadQueryParams): lang.Promise<DataLoadEventArgs>;
    protected _applyServerSort(params?: LoadQueryParams): LoadQueryParams;
    /**
     * Set list's data
     * @override
     * @param {Array} items An array of items (domain objects)
     * @param {Object} [hints]
     * @param {String} [hints.message]
     * @param {String} [hints.source]
     * @returns {Array} An array of added items. May differ from input items if they are changed in onDataPreparing
     */
    setData(items: DomainObject[], hints?: any): DomainObject[];
    orderBy(columns: string | string[]): void;
    isColumnSortable(column: string | ObjectListColumn): boolean;
    /**
     * @protected
     * @override
     * @param {DataLoadEventArgs} args
     */
    protected onDataLoaded(args: DataLoadEventArgs): void;
    private onObjectDetached(sender, obj);
    /**
     * Add an object to list
     * @protected
     * @param obj
     */
    protected addObject(obj: DomainObject): void;
    protected getMessage(resources: lang.Map<string>, op: string, mod: string): string;
    /**
     * Return all objects in current UnitOfWork with changes.
     * @return {Array<DomainObject>}
     */
    getChangedItems(): Array<DomainObject>;
}
interface ObjectList extends ContextPartComponentMixin, ObjectListMixin {
}
declare namespace ObjectList {
    interface Options extends List.Options, ObjectListMixin.Options {
        entityType?: string;
        urlSuffix?: string;
        /**
         * DataFacade's load policy. It can be rule name ("remoteFirst", "localFirst", "localIfOffline", "cached") or policy object (see CacheManager)
         */
        loadPolicy?: string | any;
        loader?: IObjectListLoader | ((list: ObjectList) => IObjectListLoader);
        Loader?: lang.Constructor<IObjectListLoader>;
        preloads?: string | string[];
        orderByServer?: boolean | string | string[] | ObjectList.OrderByServer;
        uow?: UnitOfWork;
        editable?: boolean;
        keepChangesOnReload?: boolean;
        readOnly?: boolean;
        hideExportMenu?: boolean;
        /**
         * Prevent objects from detaching on reloads (if they are not in new result)
         */
        keepAllObjects?: boolean;
        stateMessages?: StateMessages;
        transactionName?: string;
        getSaveOptions?: (saveOptions: UnitOfWork.SaveOptions, list: ObjectList) => UnitOfWork.SaveOptions;
    }
    interface OrderByServer {
        mode: "auto" | "always" | "never" | "reloadOnly";
        initial?: string | string[];
    }
    interface KnownMenus extends lang.Map<Menu.Options> {
        ListRow?: Menu.Options;
        ReadOnlyRow?: Menu.Options;
        Selection?: Menu.Options;
        List?: Menu.Options;
        EditableList?: Menu.Options;
    }
    interface StateMessages extends List.StateMessages {
        noLocalData?: string;
    }
    export import PagingOptions = list.PagingOptions;
    export import LoadOptions = List.LoadOptions;
    interface DataLoadEventArgs extends List.DataLoadEventArgs<DomainObject> {
    }
    const Events: {
        SAVING: string;
        SAVED: string;
        SAVE_ERROR: string;
    };
    interface SavingEventArgs {
        cancel?: boolean;
        interop?: SaveOptions;
    }
    interface SavedEventArgs {
    }
}
export = ObjectList;
