/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

// Extend module `core`
declare module "core" {
	export import reporting = require("modules/reporting/module-reporting");
}

// Нужно ли это?
// declare module "core.reporting" {
// 	export import ReportPartBase  	= require("modules/reporting/ui/ReportPartBase");
// 	export import ReportPart  		= require("modules/reporting/ui/ReportPart");
// 	export import ReportPagePart 	= require("modules/reporting/ui/ReportPagePart");
// 	export import ReportPresenterBase		= require("modules/reporting/ui/ReportPresenterBase");
// 	export import ReportPartPresenter		= require("modules/reporting/ui/ReportPartPresenter");
// 	export import ReportPagePartPresenter	= require("modules/reporting/ui/ReportPagePartPresenter");
// }
