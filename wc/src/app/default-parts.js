define([
	"core",
	"lib/ui/editor/ObjectEditor",
	"lib/ui/editor/ObjectViewer",
	"lib/ui/list/ObjectSelector",
	"lib/ui/list/ObjectList"
], function (core) {
	"use strict";
	core.ui = core.ui || {};

	core.createModule("default-parts", function (app) {

		app.registerPart("ObjectViewer", function (options) {
			return core.ui.ObjectViewer.create(options);
		});

		app.registerPart("ObjectEditor", function (options) {
			return core.ui.ObjectEditor.create(options);
		});

		app.registerPart("ObjectSelector", function (options) {
			return core.ui.ObjectSelector.create(app, options);
		});

		app.registerPart("ObjectList", function (options) {
			return core.ui.ObjectList.create(app, options);
		});

	});
});
