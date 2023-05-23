/**
 * @fileOverview Generated by @croc/generator-webclient:client-classes Yeoman-generator, v1.39.0.
 */
import lang = require("lib/core.lang");
import support = require("lib/domain/support");
import _DomainObject = require("lib/domain/DomainObject");
import _UnitOfWork = require("lib/domain/UnitOfWork");
import ComplexValue = require("lib/domain/ComplexValue");
import Big = require("big");
import LobPropValue = support.LobPropValue;

import { metadata, IDomainCollection, INavigationPropSet } from "lib/domain/.domain";
import { IDataFacade } from "lib/interop/.interop";

export const factory: any;

export class UnitOfWork extends _UnitOfWork {
	constructor(dataFacade: IDataFacade, options: _UnitOfWork.Options);
	createGroup(props?: lang.Map<any>): Group;
	createUser(props?: lang.Map<any>): User;

}

export class DomainObject extends _DomainObject {
	uow: UnitOfWork;
}


export interface UserRoleMeta extends metadata.EnumMeta {
	members: {
		"Admin": metadata.EnumMember;
		"User": metadata.EnumMember;
	};
}

export enum UserRole {
	Admin = 2,
	User = 4,
}
export namespace UserRole {
	export const meta: UserRoleMeta;
}

export interface GroupMeta extends metadata.EntityMeta {
	props: {
		"name": metadata.PropertyMeta;
		"users": metadata.PropertyMeta;
		"roles": metadata.PropertyMeta;
	};
}
export type GroupNames = {
	readonly [P in keyof GroupMeta["props"] | keyof GroupMeta["complex"]]: string;
};

export class Group extends DomainObject {
	static meta: GroupMeta;
	static NAMES: GroupNames;
	meta: GroupMeta;
	init(): void;
	"name": lang.ObservableProperty<string>;
	"users": lang.ObservableGetter<IDomainCollection<User>>;
	"roles": lang.ObservableProperty<UserRole>;
}

export interface UserMeta extends metadata.EntityMeta {
	props: {
		"firstName": metadata.PropertyMeta;
		"lastName": metadata.PropertyMeta;
		"login": metadata.PropertyMeta;
		"role": metadata.PropertyMeta;
		"avatar": metadata.PropertyMeta;
		"password": metadata.PropertyMeta;
		"created": metadata.PropertyMeta;
		"lastLogin": metadata.PropertyMeta;
		"groups": metadata.PropertyMeta;
	};
}
export type UserNames = {
	readonly [P in keyof UserMeta["props"] | keyof UserMeta["complex"]]: string;
};

export class User extends DomainObject {
	static meta: UserMeta;
	static NAMES: UserNames;
	meta: UserMeta;
	init(): void;
	"firstName": lang.ObservableProperty<string>;
	"lastName": lang.ObservableProperty<string>;
	"login": lang.ObservableProperty<string>;
	"role": lang.ObservableProperty<UserRole>;
	"avatar": lang.ObservableProperty<LobPropValue>;
	"password": lang.ObservableProperty<string>;
	"created": lang.ObservableProperty<Date>;
	"lastLogin": lang.ObservableProperty<Date>;
	"groups": lang.ObservableGetter<IDomainCollection<Group>>;
}

export interface ModelMeta extends metadata.ModelMeta {
	enums: {
		UserRole: UserRoleMeta;
	};
	complex: {
	};
	entities: {
		Group: GroupMeta;
		User: UserMeta;
	};
}
export const meta: ModelMeta;