/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"core",
	"lib/ui/handlebars/View",
	"xhtmpl!./templates/ConfigEditor.hbs"
], function (core, View, defaultTemplate) {
	"use strict";

	var ConfigEditor = core.lang.Class(View, {

		constructor: function (config, options) {
			var that = this;
			that.options = that.mixOptions(options, ConfigEditor.prototype.defaultOptions);
			View.call(that);

			that.config = config;
			that.root(that.config.root);
			that.apiroot(that.config.apiroot);
			that.isDebug(that.config.isDebug);
			that.bind("change:root", function (sender, value) {
				that.config.root = value;
			});
			that.bind("change:apiroot", function (sender, value) {
				that.config.apiroot = value;
			});
			that.bind("change:isDebug", function (sender, value) {
				that.config.isDebug = !!value;
			});
		},

		defaultOptions: {
			template: defaultTemplate
		},

		root: core.lang.Observable.accessor("root"),
		apiroot: core.lang.Observable.accessor("apiroot"),
		isDebug: core.lang.Observable.accessor("isDebug")
	});

	return ConfigEditor ;
});