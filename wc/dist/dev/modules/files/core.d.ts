/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

// Extend module `core`
declare module "core" {
	export let files: files.Module;

	import { InteropError } from "lib/interop/.interop";
	export namespace files {
		export interface Module {
			apiRoute: string;
			baseUrl: string;
			uploadUrl: string;
			uploadChunkSize: number;
			getBinaryPropLoadUrl (obj, propName: string, params?: {width?: number, height?: number}): string;
			getResourceDeleteUrl (resourceId: string): string;
			handleUploadError (jqXhr: JQueryXHR, textStatus: string, errorThrown?: string): InteropError|any;
		}
	}

	import { IApplication as IApplicationCore } from "lib/.core";
	export interface IApplication extends IApplicationCore {
		files?: files.Module;
	}
}
