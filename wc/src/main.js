function parseCookies() {
	var cookieObject = {},
		cookiesArray = document.cookie ? document.cookie.split('; ') : [],
		i, group, idx, key;

	for (i = 0; i < cookiesArray.length; i=i+1) {
		group = cookiesArray[i];
		idx = group.indexOf('=');
		key = decodeURIComponent(group.substr(0, idx));
		cookieObject[key] || (cookieObject[key] = decodeURIComponent(group.substr(idx + 1)));
	}
	return cookieObject;
}
var lang = parseCookies()["X-Lang"];
if (lang) {
	requirejs.config({locale: lang});
}

require([
	"jquery",
	"core",
	"app/app",
	"bootstrap",
	// modules:
	"modules/affix/module-affix",
	"modules/debug/module-debug",
	"modules/drafts/module-drafts",
	"modules/breadcrumbs/module-breadcrumbs",
	"modules/compatibility/module-ie-compatibility",
	"modules/files/module-files",
	"modules/notifications/module-notifications",
	"modules/offline/module-offline",
	"modules/reporting/module-reporting",
	"modules/scroll-accelerators/module-scroll-accelerators",
	"modules/security/module-security",
	//"modules/transfer/module-transfer",
	"modules/clipboard/module-clipboard",
	// presenters:
	"lib/ui/slick/SlickObjectListPresenter",
	"lib/ui/menu/MenuPresenter",
	"lib/ui/editor/ObjectEditorPresenter",
	"lib/ui/editor/ObjectWizardPresenter",
	"lib/ui/editor/EditorPagePresenter",
	"lib/ui/tree/FancytreePresenter",
	// slick addons:
	//"lib/ui/slick/SlickInlineEditAddon",
	//"lib/ui/slick/SlickColumnFiltersAddon",
	// PEs
	"lib/ui/pe/peString",
	"lib/ui/pe/peNumber",
	"lib/ui/pe/peBoolean",
	"lib/ui/pe/peBooleanSwitch",
	"lib/ui/pe/peObjectList",
	"lib/ui/pe/peDateTime",
	"lib/ui/pe/peEnumRadio",
	"lib/ui/pe/peEnumCheckbox",
	"lib/ui/pe/peEnumDropDownSelect",
	"lib/ui/pe/peEnumDropDownChosen",
	"lib/ui/pe/peEnumDropDownSelect2",
	"lib/ui/pe/peObject",
	"lib/ui/pe/peObjectDropDownLookup",
	"lib/ui/pe/peReadOnly",
	"lib/ui/pe/peViewOnly",
	"lib/ui/pe/peBinary",
	"lib/ui/pe/peObjectRadio",
	"lib/ui/pe/peTimeSpan",
	"vendor/jquery.animate-enhanced"
], function ($, core, Application) {
	"use strict";

	var app = new Application();

	$(function () {
		setTimeout(function () {
			app.run();
		}, 0);
	});
});
