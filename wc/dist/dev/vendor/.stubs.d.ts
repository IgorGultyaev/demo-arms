declare module "vendor/cookies" {
	const m;
	export = m;
}

interface JQueryEventConstructor {
	(src: Event, eventProperties?: any): JQueryEventObject;
}

// vendor/splitter/jquery.splitter
interface JQuery {
	split(options: Object): JQuery;
}

// vendor/jquery.lazyload
interface JQuery {
	lazyload (options): JQuery;
}

// vendor/jquery.numeric
interface JQuery {
	numeric (): JQuery;
	numeric (separator: string): JQuery;
	numeric (separator: {decimal?: string|boolean, negative?: boolean}): JQuery;
}

// vendor/bootstrap-colorpicker
interface JQuery {
	colorpicker (opts?: BootstrapColorpickerOptions): JQuery;
}
interface BootstrapColorpickerOptions {
	
}

interface JQueryStatic {
	cleanData (elems);
}

// NOTE: this is important as module is imported via RequireJS as "big" (has alias in require.config.json)
// Alternatively we can define an alias in tsconfig
declare module "big" {
	// NOTE: ts-typing is inside @types/big.js
	import { Big } from "big.js";

	//var m: Big;
	export = Big;
}


// NOTE: this is important as module is imported via RequireJS as "moment" (has alias in require.config.json)
// Alternatively we can define an alias in tsconfig
declare module "moment" {
	// NOTE: ts-typing (moment.d.ts) is located besides moment.js, so using full path here
	import moment = require("vendor/moment/moment");
	export = moment;
}
