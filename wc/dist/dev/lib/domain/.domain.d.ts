import * as lang from "lib/core.lang";
import * as interop from "lib/interop/.interop";
import * as validation from "lib/validation";
import * as Big from "big";
import { SafeHtml, FormatOptions } from "lib/formatters";

export interface IDomainObject extends lang.Observable, lang.ILoadable<IDomainObject> {
	meta: metadata.EntityMeta;
	isGhost: boolean;
	isLoaded: boolean;
	id: string;
	uow: UnitOfWork;
	ts?: number;

	load(options?: LoadOptions): lang.Promise<DomainObject>;
}

export interface IDomainCollection<T extends DomainObject> extends lang.IObservableCollection<T>, lang.ILoadable<IDomainCollection<T>> {
	ids?(): string[];
	isGhost: boolean;
}

export interface INavigationPropSet extends IDomainCollection<DomainObject> /*extends lang.IObservableCollection<DomainObject>, lang.ILoadable<INavigationPropSet>*/ {
	ids?(): string[];
}

export interface IDomainObjectFactory {
	/**
	 * Creates a typed instance of domain object
	 * @param {Object} model Domain model
	 * @param {String} typeName name of type
	 * @param {String} [id] identifier
	 * @returns {Object}
	 */
	createObject(model: IDomainModel, typeName: string, id?: string): DomainObject;
	/**
	 * Creates a stub for an empty domain object
	 * @param {Object} model Domain model
	 * @param {String} typeName name of type
	 * @param {String} id identifier
	 * @returns {Object}
	 */
	createGhost(model: IDomainModel, typeName: string, id: string): IDomainObject;
	/**
	 * Creates a stub for not authorized domain object
	 * @param {Object} model Domain model
	 * @param {String} typeName name of type
	 * @param {String} id identifier
	 * @returns {Object}
	 */
	createNotAuthorized(model: IDomainModel, typeName: string, id: string): IDomainObject;
	/**
	 * Creates a typed instance of complex property's value
	 * @param model
	 * @param obj
	 * @param propMeta
	 */
	createComplex(model: IDomainModel, obj: DomainObject, propMeta: metadata.ComplexPropertyMeta): ComplexValue;
}

export interface IDomainModel {
	meta: metadata.ModelMeta;
	factory: IDomainObjectFactory;

	DomainObject: DomainObjectConstructor;
	UnitOfWork: UnitOfWorkConstructor;

	// NOTE: ModelGenerator.generate injects support.values.* into model
	NotAuthorizedPropValue?: any;
	LobPropValue?: any;
}

/* NOTE: `export type` doesn't allow creating instances of a class, but `export import` does.
   So don't use `export import` here, like:
   export import DomainObject = require("lib/domain/DomainObject");
*/

import _DomainObject = require("./DomainObject");
export interface DomainObject extends _DomainObject {
}
export namespace DomainObject {
	export import LocalState = _DomainObject.LocalState;
	export import UndoState = _DomainObject.UndoState;
}

export interface DomainObjectConstructor {
	new(id?: string): _DomainObject;
}

import _UnitOfWork = require("./UnitOfWork");
export interface UnitOfWork extends _UnitOfWork {
}
export namespace UnitOfWork {
	export import Options = _UnitOfWork.Options;
}

export interface UnitOfWorkConstructor {
	new(dataFacade: interop.IDataFacade, options?: _UnitOfWork.Options): _UnitOfWork;
}

import _ComplexValue = require("./ComplexValue");
export interface ComplexValue extends _ComplexValue {
}

export interface NotifyOptions {
	suppressEvents?: boolean;
}

export interface ChangeOptions {
	/**
	 * Changes can not be undone.
	 */
	norollback?: boolean;
}

export interface GetPropOptions extends NotifyOptions {
	/**
	 * Get original value of the property
	 */
	original?: boolean;
}

export interface SetPropOptions extends NotifyOptions, ChangeOptions {
	/**
	 * Set original value of the property. If the property was not changed, set current value with option 'norollback'.
	 */
	original?: boolean;
	/**
	 * Do NOT copy current value of the property to the collection of original values. Should be true if options 'original' is true.
	 */
	norollback?: boolean;
}

export interface ClearPropOptions extends SetPropOptions {
	propFilter?: (propMeta: metadata.PropertyMeta, obj: DomainObject) => any;
}

export interface ToJsonOptions {
	/**
	 * Include a prop only if it has changes
	 */
	onlyChanged?: boolean;
	/**
	 * Include a prop only if it has changes or initial value
	 */
	onlyChangedOrInitial?: boolean;
	/**
	 * Include only persistent properties
	 */
	onlyPersistent?: boolean;
	/**
	 * Return null instead of empty object (w/o any props)
	 */
	nullIfEmpty?: boolean;
	/**
	 * Include original values in array properties
	 */
	originalArrays?: boolean;
	/**
	 * Exclude metadata (__metadata and id)
	 */
	nometa?: boolean;
	/**
	 * Include AUX values (auxiliary values in aux field)
	 */
	aux?: boolean;
	/**
	 * Include props for removed objects (like for changed objects)
	 */
	propsForRemoved?: boolean;
}

export interface FromJsonOptions {
	dirty?: boolean;
	partial?: boolean;
}

export interface LoadOptions {
	reload?: boolean;
	preloads?: string[]|string;
	params?: interop.LoadQueryParams;
	/**
	 * Advanced options for DataFacade.load
	 */
	interop?: interop.LoadOptions;
	/**
	 * @deprecated Use interop.policy
	 */
	policy?: any;
}

export type EntityNameTerm = string|lang.Constructor<DomainObject>|{ name: string };

export type TypedNameTerm<T extends DomainObject> = string|lang.Constructor<T>|{ name: string };

export interface ReferenceToObject {
	object: DomainObject;
	prop: metadata.PropertyMeta;
}

export import DomainObjectData = interop.DomainObjectData;
export import SavedObjectData = interop.SavedObjectData;

export namespace metadata {
	export type ValueType =
		"ui1" | "i2" | "i4" | "i8" | "float" | "double" | "decimal" |
		"dateTime" | "date" | "time" | "dateTimeTz" | "timeTz" |
		"timeSpan" |
		"string" | "text" |
		"boolean" |
		"binary" | "smallBin" |
		"uuid" |
		"enum" | "object" | "complex";

	// region PropertyMeta

	export interface PropertyMetaBase extends FormatOptions {
		/**
		 * Property type (for navigation properties - use "object")
		 */
		vt?: ValueType;
		/**
		 * Description of the property for UI
		 */
		descr?: string;
		/**
		 * Specifies nullability for property
		 */
		nullable?: boolean;
		temp?: boolean;
		readOnly?: boolean;
		lazyLoad?: boolean;
		/**
		 * Flag of navigation array (set) property
		 */
		many?: boolean;
		/**
		 * Bahavior on deletion of value object
		 */
		onDelete?: "cascade" | "removeRelation" | "restrict";
		/**
		 * Indexed prop (navigation only) (order of objects in prop is persisted) (navigation-many only)
		 */
		indexed?: boolean;
		init?: string|((meta: PropertyMeta) => any)|any;
		tryParse?: (v: any, skipValidation?: boolean) => { errorMsg?: string|SafeHtml; parsedValue?: any; };
		// validation facets:
		rules?: validation.Rule[];
		maxLen?: number;
		minLen?: number;
		pattern?: string;
		patternMsg?: string;
		/**
		 * for decimal: number of total digits allowed
		 */
		totalDigits?: number;
		/**
		 * for decimal: number of fractional digits allowed
		 */
		fractionDigits?: number;
		/**
		 * for binary: "image", "video", "audio"
		 */
		contentType?: string;
		/**
		 * for i8/decimal disable usage of Big, instead Number used (can lead to precision loosing):
		 */
		useNumber?: boolean;
		[key: string]: any;
	}

	export interface PropertyMetaSpec extends PropertyMetaBase {
		/**
		 * Name of reference entity (entity of value object in the prop) (navigation only)
		 */
		ref?: string;
		/**
		 * Name of opposite property in value entity (reverse) (navigation only)
		 */
		opposite?: string;
		/**
		 * Name of a prop in value entity to use for sorting objects in the prop (navigation-many only)
		 */
		orderBy?: string;
		// facets
		/**
		 * max value for all numbers, for big numbers can be string (in runtime - Big)
		 */
		minValue?: number | string;
		/**
		 * min value for all numbers, for big numbers can be string (in runtime - Big)
		 */
		maxValue?: number | string;
		range?: number[] | string[];
		// Date/Time:
		minInclusive?: string;
		maxInclusive?: string;
		minExclusive?: string;
		maxExclusive?: string;
	}

	export interface PropertyMetaRuntime extends PropertyMetaBase {
		name: string;
		vt: ValueType;

		// facets (runtime value may differ from metadata)
		/**
		 * max value for all numbers, for big numbers can be string (in runtime - Big)
		 */
		minValue?: number | Big;
		/**
		 * min value for all numbers, for big numbers can be string (in runtime - Big)
		 */
		maxValue?: number | Big;
		range?: number[] | Big[];

		minInclusive?: Date;
		maxInclusive?: Date;
		minExclusive?: Date;
		maxExclusive?: Date;
	}

	// runtime meta prop of Entity
	export interface PropertyMeta extends PropertyMetaRuntime {
		entity: EntityMeta;
		parent: EntityMeta|ComplexTypeMeta;
		ref?: EntityMeta|EnumMeta|ComplexTypeMeta;
		opposite?: PropertyMeta;
		/**
		 * Reference to parent complex property, if any
		 */
		complex?: ComplexPropertyMeta;
	}

	export interface EnumPropertyMeta extends PropertyMeta {
		vt: "enum";
		ref: EnumMeta;
	}

	export interface ObjectPropertyMeta extends PropertyMeta {
		vt: "object";
		ref: EntityMeta;
	}

	// endregion

	// region ComplexProperty

	export interface ComplexPropertyMetaBase {
		vt: "complex";
		descr?: string;
		nullable?: boolean;
		[key: string]: any;
	}

	export interface ComplexPropertyMetaSpec extends ComplexPropertyMetaBase {
		ref: string;
	}

	// runtime meta prop of ComplexType
	export interface ComplexPropertyMeta extends ComplexPropertyMetaBase {
		name: string;
		parent: EntityMeta|ComplexTypeMeta;
		entity?: EntityMeta;
		ref: ComplexTypeMeta;
		/**
		 * Reference to parent complex property, if any
		 */
		complex?: ComplexPropertyMeta;
	}

	// endregion

	// region ComplexType

	export interface ComplexTypeMetaBase {
		descr?: string;
		[key: string]: any;
	}

	export interface ComplexTypeMetaSpec extends ComplexTypeMetaBase {
		props?: lang.Map<PropertyMetaSpec|ComplexPropertyMetaSpec>;
	}

	export interface ComplexTypeMeta extends ComplexTypeMetaBase {
		name: string;
		model: ModelMeta;
		props: lang.Map<PropertyMeta|ComplexPropertyMeta>;
		kind: "complexType";
	}

	// endregion

	// region EnumMeta

	export interface EnumMetaSpec {
		members?: lang.Map<EnumMemberSpec>;
		descr?: string;
		vt?: ValueType;
		flags?: boolean;
		fullMask?: number;
		[key: string]: any;
	}

	export interface EnumMeta extends EnumMetaSpec {
		name: string;
		model: ModelMeta;
		members: lang.Map<EnumMember>;
		kind: 'enum';

		formatValue(v: any): string;
		getMembers(v: any): EnumMember[];
		getMember(v: any): EnumMember;
		parse(v: any): any;
	}

	// endregion

	// region EnumMember

	export interface EnumMemberSpec {
		value: any;
		descr?: string;
		[key: string]: any;
	}

	export interface EnumMember extends EnumMemberSpec {
		value: any;
		name: string;
		parent: EnumMeta;
	}

	// endregion

	// region EntityMeta

	interface EntityMetaBase {
		descr?: string;
		temp?: boolean;
		formatters?: lang.Map<() => string>;
		rules?: validation.ObjectRule[];
		[key: string]: any;
	}

	export interface EntityMetaSpec extends EntityMetaBase {
		base?: string;
		// NOTE: raw props can contain complex prop also
		props?: lang.Map<PropertyMetaSpec|ComplexPropertyMetaSpec>;
	}

	export interface EntityMeta extends EntityMetaBase {
		model: ModelMeta;
		name: string;
		base: EntityMeta;
		/**
		 * All valuable properties, including inherited from the base class (if any)
		 */
		props: lang.Map<PropertyMeta>;
		/**
		 * Valuable properties declared directly in the current entity (not including inherited from the base class)
		 */
		declared: lang.Map<PropertyMeta>;
		/**
		 * All complex properties, including inherited from the base class (if any)
		 */
		complex: lang.Map<ComplexPropertyMeta>;
		/**
		 * Child entities (if any). Contains direct children only.
		 */
		derived: lang.Map<EntityMeta>;
		kind: 'entity';
	}

	// endregion

	// region ModelMeta

	interface ModelMetaBase {
		// ???
		[key: string]: any;
	}

	export interface ModelMetaSpec extends ModelMetaBase {
		enums?: lang.Map<EnumMetaSpec>;
		complex?: lang.Map<ComplexTypeMetaSpec>;
		entities?: lang.Map<EntityMetaSpec>;
	}

	export interface ModelMeta extends ModelMetaBase {
		enums: lang.Map<EnumMeta>;
		complex: lang.Map<ComplexTypeMeta>;
		entities: lang.Map<EntityMeta>;
	}

	// endregion
}
