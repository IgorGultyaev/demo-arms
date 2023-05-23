define(["core", "lib/ui/IconProvider"
], function (core, IconProvider) {
	"use strict";
	core.ui = core.ui || {};

	core.ui.iconProvider = new IconProvider();

	return core.ui.iconProvider ;
});