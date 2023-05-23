define([
	"core",
	"xhtmpl!./ui/templates/dashboard.hbs",
	"lib/ui/handlebars/View",
	"lib/ui/list/ObjectList"
], function (core, dashboardTemplate, View) {
	"use strict";

	core.createModule(function (app) {

		app.registerPart("Dashboard", function () {
			return View.create({
				template: dashboardTemplate
			});
		});

		app.registerPart("ObjectList:User", function () {
			return core.ui.ObjectList.create(app, {
                entityType: "User",
				title: "Пользователи",
				columns: [
					{ name: "firstName" },
					{ name: "lastName" }
				]
			});
		});

	});
});
