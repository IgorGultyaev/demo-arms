/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

import { UnitOfWork, DomainObject } from "lib/domain/.domain";
import { Promise } from "lib/core.lang";

declare module "lib/domain/.domain" {
	export interface UnitOfWork  {
		getCurrentUser?(): Promise<DomainObject>;
		getCurrentUserId?(): string;
		currentUser?(): DomainObject;
	}
}
