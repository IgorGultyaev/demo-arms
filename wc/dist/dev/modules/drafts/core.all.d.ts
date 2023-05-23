/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

/*
declare module "core.drafts" {
	export import DraftManager = require("modules/drafts/DraftManager");
}
*/

declare module "core" {
	export let drafts: drafts.Module;

	import DraftManager = require("modules/drafts/DraftManager");
	export namespace drafts {
		export interface Module {
			DraftManager: typeof DraftManager;
		}
	}
}
