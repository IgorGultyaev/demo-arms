import * as lang from "lib/core.lang";
import * as domain from ".domain";
import * as interop from "lib/interop/.interop";
import DomainObject = require("DomainObject");
import DomainObjectRegistry = require("DomainObjectRegistry");
import UnitOfWork = require("UnitOfWork");

declare class _DomainObjectInternal extends DomainObject {
	_propValues: lang.Map<any>;
	_propWrappers: lang.Map<any>;
	_localState: DomainObject.LocalState;
	_undostack: DomainObject.UndoState[];
	_sender: DomainObject;
	_deferredLoad: lang.Promise<this>;

	__removing: boolean;

	createState(stateName?: string): DomainObject.UndoState;
	purge(): void;
	replaceRefId(propMeta: domain.metadata.PropertyMeta, oldId: string, newId: string): void;
}
export declare type DomainObjectInternal = _DomainObjectInternal;

declare class _UnitOfWorkInternal extends UnitOfWork {
	_objects: DomainObjectRegistry;
	_dataFacade: interop.IDataFacade;
}
export declare type UnitOfWorkInternal = _UnitOfWorkInternal;
