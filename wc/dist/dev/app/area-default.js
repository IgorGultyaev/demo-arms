define([
	"core", 
	"i18n!app/nls/resources"
], function (core, resources) {
	"use strict";

	core.createAreaModule(function (app, area) {
		area.title = resources["area.main"];

		// Create 'dashboard' state for default area and
		// associate 'Dashboard' part with this state:
		area.addState({ name: "dashboard", title: "Dashboard" }, "Dashboard");

		// Auto-create an areaState for each persistent entity in the domain model
		core.lang.forEach(app.model.meta.entities, function (entity) {
			if (entity.temp || entity.abstract) { return; } // ignore temporary and abstract
			area.addState({ name: entity.name, title: entity.descr }, "ObjectList:" + entity.name);
		});
		// You can manually create areaStates instead of auto-creating, e.g.:
		//area.addState({ name: "User", title: "User" }, "ObjectList:User");

		area.setDefaultState("dashboard");
	});
});