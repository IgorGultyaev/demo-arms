/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

// augment core.Application class
import { AffixManager } from "./affix";
declare module "lib/core" {
	export interface Application {
		affixManager?: AffixManager;
	}
}
