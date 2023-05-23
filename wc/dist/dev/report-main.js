require([
	"core",
	"xconfig",
	"lib/interop/DataFacade",
	"lib/interop/BackendInterop",
	"modules/reporting/module-reporting-app",
	"app/default-menus",
	"modules/security/module-security",
	"modules/notifications/module-notifications",
	"modules/affix/module-affix",
	"xcss!lib/ui/styles/appToolbar.css"
], function (core, xconfig, DataFacade, BackendInterop, reporting) {

	"use strict";
	/* global xconfig */
	/* global xmodel */

	var app = new reporting.Application(xconfig, xmodel);
	app.dataFacade = new DataFacade(new BackendInterop(xconfig), app.eventPublisher);

	app.run();
});