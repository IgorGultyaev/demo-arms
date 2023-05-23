// Файл содержит описания заглушек для модулей, которые еще не переведены на TypeScript, но импортируются из других модулей.
// TODO: удалить этот файл, когда все модули будут переведены на TypeScript.
/// <reference path="../vendor/handlebars/handlebars.d.ts" />

declare module "lib/ui/handlebars/handlebars-ext" {
	import * as Handlebars from "handlebars";
	export = Handlebars;
}

declare module "handlebars-ext" {
	import * as Handlebars from "lib/ui/handlebars/handlebars-ext";
	export = Handlebars;
}
