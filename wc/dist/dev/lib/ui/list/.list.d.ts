import * as lang from "lib/core.lang";
import * as domain from "lib/domain/.domain";
import * as validation from "lib/validation";
import * as Menu from "lib/ui/menu/Menu";
import * as ObservableCollectionView from "lib/utils/ObservableCollectionView";

import { IPart } from "lib/ui/.ui";
import { ICommand, ICommandLazyMap } from "lib/core.commands";
import { LoadQueryParams } from "lib/interop/.interop";
import { PropertyEditor } from "core.ui";
import { SafeHtml } from "lib/formatters";
import { ObjectListState } from "./.list.types";

import ValueType = domain.metadata.ValueType;
import PropertyMeta = domain.metadata.PropertyMeta;
import DomainObject = domain.DomainObject;
import Violation = validation.Violation;
import OrderBy = lang.collections.OrderBy;
import OrderByData = lang.collections.OrderByData;

/**
 * @this {Object} List item
 * @param {ObjectListColumn} col Metadata of a column
 * @returns {*} Typed value of a column
 */
export interface ObjectListColumnGetter {
	(col: ObjectListColumn): any;
}

/**
 * @this {Object} List item
 * @param {*} v Typed value of a column (returned by 'getter' callback or 'prop' value)
 * @param {ObjectListColumn} col Metadata of a column
 * @returns {String} Formatted value of a column
 */
export interface ObjectListColumnFormatter {
	(v: any, col: ObjectListColumn): string | SafeHtml;
}

/**
 * @param {*} v1 Typed value of a column for first comparing item (returned by 'getter' callback or 'prop' value)
 * @param {*} v2 Typed value of a column for second comparing item (returned by 'getter' callback or 'prop' value)
 * @returns {Number} -1 if v1 less than v2, 1 if v1 greater than v2 and 0 if the values are equal
 */
export interface ObjectListColumnComparer {
	(v1: any, v2: any): number;
}

export interface ObjectListColumn {
	name?: string;
	prop?: string;
	title?: string;
	vt?: ValueType;
	role?: string;
	getter?: ObjectListColumnGetter;
	formatter?: ObjectListColumnFormatter;
	formatterHtml?:  (v: any, col?: ObjectListColumn) => string;
	html?: boolean;
	comparer?: ObjectListColumnComparer;
	orderByProp?: string;
	/**
	 * Disable sorting for column. Useful for  non-sortable properties like navigation set.
	 */
	disableSort?: boolean;
	command?: ICommand|string;
	width?: number;
	hidden?: boolean;
	order?: number;
	whitespaces?: boolean;
	loadingHtml?: string;
	errorHtml?: string;

	/**
	 * Option for SlickInlineEditAddon
	 */
	editor?: PropertyEditor.Options & lang.Map<any> | ((this: IList, obj: any, propMeta: PropertyEditor.Options & lang.Map<any>, column: ObjectListColumn) => PropertyEditor.Options & lang.Map<any>);

	[key: string]: any;
}

export interface PagingOptions {
	/**
	 * Number of rows on page. Set to 0 to use server restrictions only.
	 */
	pageSize?: number;
	/**
	 * Support paging even if no hint `paging` in the server response
	 */
	force?: boolean;
	/**
	 * "pages"|"throttle"
	 */
	mode?: string;
}

/**
 * Base interface for all lists including List, ObjectList and peObjectList.
 */
export interface IList extends lang.Observable {
	states: typeof ObjectListState;
	state: lang.ObservableProperty<ObjectListState>;
	stateMessage: lang.ObservableProperty<string>;
	columns: ObjectListColumn[];
	commands: ICommandLazyMap;
	menuList?: Menu;
	menuListAux?: Menu;
	menuRow?: Menu;
	menuSelection?: Menu;
	options: {
		paging?: boolean|number|PagingOptions;
		[propName: string]: any;
	};

	items: ObservableCollectionView<any>;
	selection: lang.ObservableCollection<any>;
	activeItem: lang.ObservableProperty<any>;
	violations?: lang.ObservableCollection<Violation>;

	/**
	 * Returns HTML of the cell
	 * @param {*} item
	 * @param {ObjectListColumn} col
	 * @returns {any}
	 */
	getCellHtml(item: any, col: ObjectListColumn): string;
	orderedBy(): OrderByData[];
	orderBy(columns: string|string[]|OrderByData|OrderByData[]): void;
	updateColumns?(columns: ObjectListColumn[], options?: { onlyExisting?: boolean }): void;
	isColumnSortable(column: string|ObjectListColumn): boolean;
	isItemSelectable(item: any): boolean;
	activate(): void;
	getChangedItems(): Array<any>;
}

export interface IObjectList<T> extends IList {
	items: ObservableCollectionView<T>;
	selection: lang.ObservableCollection<T>;
	activeItem: lang.ObservableProperty<T>;

	/**
	 * Returns HTML of the cell
	 * @param {*} item
	 * @param {ObjectListColumn} col
	 * @returns {any}
	 */
	getCellHtml(item: T, col: ObjectListColumn): string;
	isItemSelectable(item: T): boolean;
}

export interface IDomainObjectList extends IObjectList<DomainObject> {
	findDomainProp(column: ObjectListColumn): PropertyMeta;
	getChangedItems(): Array<DomainObject>;
}

export interface ObjectListLoaderResult<T> {
	items: T[];
	hints?: any;
}

export interface IObjectListLoader<T> {
	load(list: IObjectList<T>, params?: LoadQueryParams): lang.Promise<ObjectListLoaderResult<T>>;
	cancel?(): void;
}

export interface IObjectListPresenter extends IPart {
	focus?(): void;
	scrollToSelf?(): void;
	/**
	 * Refresh specified items (i.e. update rows in grid for specified objects)
	 * @param items Items ot refresh. If not specified, then all items will be refreshed.
	 */
	refreshItems?(items?: any[]|any): void;
}

export interface IObjectListPaginator extends IPart, lang.IEventful {
	list: lang.ObservableProperty<IList>;
	skippedItems: lang.ObservableGetter<number>;
	options: PagingOptions;
}

export interface IObjectListDataPresenter extends IPart {
	viewModel: IList;
	setViewModel(viewModel: IList): void;
	setNumbering?(startIndex: number): void;
	/**
	 * Refresh specified items
	 * @param items Items ot refresh. If not specified, then all items will be refreshed.
	 */
	refreshItems?(items?: any[]|any): void;
}
