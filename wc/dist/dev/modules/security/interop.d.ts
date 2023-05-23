/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

import { IDataFacade } from "lib/interop/.interop";
import { Promise } from "lib/core.lang";
import LoginDialog = require("modules/security/ui/LoginDialog");

declare module "lib/interop/.interop" {
	export interface IDataFacade {
		createLoginDialog?(): LoginDialog;
		executeLogin?(ajaxSettings, options): Promise<any>;
		getCurrentUser?(options?: {refreshStatus?: boolean}): Promise<any>;

		logout?(): Promise<any>;
		login?(): Promise<Object>;
	}

	export interface IBackendInterop {
		authenticationScheme?: string;
		_executeAjax?(ajaxSettings, defer, repeating);
	}

	export interface LoginConfirm2f {
		/**
		 * Token to send back to identify authentication session
		 */
		token: string;
		/**
		 * Type of expected response: number or string with secret or just wait
		 * - user should approve login via completely different channel (i.e. mobile app)
		 */
		type?: "number" | "string" | "wait";
		/**
		 * Number of symbols in secret (if type != "wait")
		 */
		length?: number;
		/**
		 * Timeout while the token is valid
		 */
		timeout?: number;
		/**
		 * Additional hint for UI.
		 */
		hint?: string;
		/**
		 * Url to call to complete authentication
		 */
		url?: string;
	}
	export type LoginResponse = {
		/**
		 * Result for 2nd step of 2F-authentication
		 */
		"2f": LoginConfirm2f;
	} & {
		/**
		 * Normal response - user json object
		 */
		result: any;
	};
}

export interface SecurityConfig {
	loginOnStart?: boolean;
	onLogout?: "suspend";
	windowsAuth?: AuthProvider;
	formsAuth?: FormsAuthProvider;
	openAuth?: AuthProvider;
	logoutUrl?: string;
	persistentCookie?: boolean;
	twoFactorAuth?: {
		url: string;
		enabled: boolean;
	};
}
export interface AuthProvider {
	title?: string;
	isDefault?: boolean;
}
export interface FormsAuthProvider extends AuthProvider {
	authenticationScheme?: string;
}

// TODO: how to augment classes DataFacade/DataFacadeSmart?

/* not working:
import DataFacade = require("lib/interop/DataFacade");
export interface DataFacade {
	createLoginDialog(): LoginDialog;
	executeLogin(ajaxSettings, options): Promise<any>;
	getCurrentUser(options): Promise<any>;
	logout(): Promise<any>;
}
*/

/* not working:
declare module "lib/interop/DataFacadeBase" {
	export interface DataFacade {
		createLoginDialog(): LoginDialog;
		executeLogin(ajaxSettings, options): Promise<any>;
		getCurrentUser(options): Promise<any>;
		logout(): Promise<any>;
	}
}
*/

//import { DataFacadeBase } from "lib/interop/DataFacadeBase";
//import DataFacadeBase = require("lib/interop/DataFacadeBase");
