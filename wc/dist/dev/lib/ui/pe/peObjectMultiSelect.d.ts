/// <reference types="select2" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Select2 = require("vendor/select2/select2");
import ObservableCollectionView = require("lib/utils/ObservableCollectionView");
import PropertyEditorLookup = require("lib/ui/pe/PropertyEditorLookup");
import domain = require("lib/domain/.domain");
import DomainObject = domain.DomainObject;
import EntityMeta = domain.metadata.EntityMeta;
import INavigationPropSet = domain.INavigationPropSet;
import validation = require("lib/validation");
import Violation = validation.Violation;
import "xcss!vendor/select2/content/select2";
import "xcss!lib/ui/styles/peObjectMultiSelect";
import lang = core.lang;
import Promisable = lang.Promisable;
import { Part } from "core.ui";
import { ObjectListState } from "lib/ui/list/.list.types";
import { IBindable } from "lib/binding";
import IDataProvider = PropertyEditorLookup.IDataProvider;
import peLoadableMixin = require("lib/ui/pe/peLoadableMixin");
import DataLoadEventArgs = peLoadableMixin.DataLoadEventArgs;
declare class peObjectMultiSelect extends PropertyEditorLookup {
    static defaultOptions: peObjectMultiSelect.Options;
    static contextDefaultOptions: lang.Map<peObjectMultiSelect.Options>;
    static Events: typeof PropertyEditorLookup.Events & {
        PROPERTY_LOADING: string;
        PROPERTY_LOADED: string;
    };
    propItems: ObservableCollectionView<DomainObject>;
    options: peObjectMultiSelect.Options;
    select2: Select2;
    viewModel: DomainObject;
    valueObjectEntityType: EntityMeta;
    lookupParams: {
        searchTerm: string;
        skip: number;
        lastLoadedItems?: any[];
        hasNext?: boolean;
    };
    select: JQuery;
    states: typeof ObjectListState;
    /**
     * @constructs peEnumDropDownSelect2
     * @extends peEnumDropDownBase
     * @param options
     */
    constructor(options: peObjectMultiSelect.Options);
    /**
     * Wrap provider.getItems method to handle hasNext hint from LoadResponse
     * @param provider
     * @private
     */
    private _wrapDataProvider<T, U>(provider);
    protected createDataProvider(): IDataProvider<DomainObject, any>;
    /**
     * Render <select> element.
     * @param domElement Parent element.
     */
    protected _renderSelect(domElement: JQuery): JQuery;
    /**
     * Render <option> elements for preselected values.
     */
    protected _renderOptions(): void;
    protected formatSelectValueTitle(value: DomainObject): string;
    protected formatResultItemTitle(item: DomainObject): string;
    private formatSelectValue(value);
    private formatResultItem(item);
    private _isElementInside(element);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected createBindableElement(): IBindable;
    private _attachToUow(obj);
    protected _renderViewItems(): void;
    protected _doReload(): void;
    protected getSelectOptions(modalParent: JQuery): Select2Options;
    protected addDropdownAdapter(s2options: Select2.Options): Select2.Options;
    /**
     * Создать адаптер данных для выпадающего списка.
     * @param s2options
     */
    private _createSelect2DataAdapter(s2options);
    private _createSelect2ResultAdapter(s2options);
    protected onDataLoaded(args: DataLoadEventArgs): void;
    protected _setItems(items: any[]): void;
    focus(): void;
    protected _setWidth(): void;
    protected _onDisabledChange(disabled: boolean): void;
    protected _renderError(error: Violation | Error | string, $element: JQuery): void;
    unload(options?: Part.CloseOptions): void;
    setViewModel(viewModel: DomainObject): void;
    protected _ensurePropLoaded(): Promisable<void>;
    protected _onPropChanged(sender: any, value: any): void;
    private _onPropertyLoaded(data?);
    protected onPropertyLoaded(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected _addObject(obj: DomainObject): void;
    protected _valueIds(): string[];
    protected _ensureItemsAvailable(): void;
    protected _open(): void;
    protected _close(): void;
}
interface peObjectMultiSelect {
    value(v: INavigationPropSet): void;
    value(): INavigationPropSet;
}
declare namespace peObjectMultiSelect {
    interface Options extends PropertyEditorLookup.Options, PropertyEditorLookup.AdapterOptions {
        dropdownAutoWidth?: boolean;
        hideSearch?: boolean;
        minimumResultsForSearch?: number;
        dropdownPosition?: "inplace" | "absolute";
        closeOnSelect?: boolean;
        select2?: Select2.Options;
        noResultsText?: string;
        searchingText?: string;
        inputTooShort?: string;
        placeholder?: string;
        preloads?: string | string[];
        onPropertyLoaded?: (sender: peObjectMultiSelect) => void;
    }
}
export = peObjectMultiSelect;
