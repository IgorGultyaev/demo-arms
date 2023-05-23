define(["lib/domain", "./model-meta-ext"], function (domain, metadata) {
	"use strict";

	var model = domain.buildModel(metadata);

	return model;
});