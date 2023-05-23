import {INavigationService, IUserSettings, UnloadReason} from "lib/.core";
import { Promise, Promisable, ObservableProperty, IEventful, Map } from "lib/core.lang";
import Menu = require("lib/ui/menu/Menu");
import { Violation } from "lib/validation";
import { RenderStatus } from "./.ui.types";

export interface IPart {
	name?: string;
	__uid?: string;
	title?: string|ObservableProperty<string>;
	/**
	 * Arbitrary data associated with the part.
	 * e.g. extensions["breadcrumbs"] - data for breadcrumbs module, e.g. title
	 */
	extensions?: Map<any>;

	render(domElement: JQuery|HTMLElement): Promisable<void>;
	unload?(options?: PartCloseOptions): void;
	queryUnload?(options?: PartCloseOptions): Promisable<string>;
	dispose?(options?: PartCloseOptions): void;
	renderStatus?: ObservableProperty<RenderStatus>;
	viewModel?: any;
	setViewModel?(viewModel: any): void;
	navigationService?: INavigationService;
	setNavigationService?(navigationService: INavigationService): void;
	userSettings?: IUserSettings;

	show?(): Promisable<any>;
	hide?(): Promisable<any>;

	applyHostContext?(options: HostContextOptions): INavigationService.NavigateOptions;
}

export interface HostContextOptions {
	host: string;
}

export interface PartCloseOptions {
	reason?: UnloadReason;
}

export interface IStatefulPart extends IPart {
	changeState(state: any, options?: PartChangeStateOptions): boolean;
	reportState(replaceState?: boolean): void;
	getState(partOptions?: any): any;
}

export interface PartChangeStateOptions {
	disablePushState?: boolean;
}

export interface IFilterPart extends IPart {
	getRestrictions(): any;
	isEmpty?(): boolean;
	menu?: Menu;
	canDisplayViolations?: boolean;
}
export namespace IFilterPart {
	export interface GetRestrictionsError extends Error {
		violations?: Violation[];
	}
}

export interface IDialog extends IEventful {
	open(): Promise<any>;
}
