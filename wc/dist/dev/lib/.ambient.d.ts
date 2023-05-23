/**
 * Declares ambient modules that can not be written in TypeScript
 */

// Resources:
declare module "i18n!*" {
	//const m: { [key: string]: string };
	const m;
	export = m;
}

// CSS:
declare module "xcss!*" {
}

// Templates:
declare module "xhtmpl!*" {
	const m: HandlebarsTemplateDelegate;
	export = m;
}
