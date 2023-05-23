/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"core",
	"lib/ui/Part",
	"lib/binding"
], function (core, Part, binding) {
	"use strict";

	var DiagnosticsEditor = core.lang.Class(Part, {
		constructor: function () {
			var that = this;

			that.bind("change:level", function (sender, value) {
				core.diagnostics.defaultLevel = parseInt(value, 10);
				core.settings.setItem(core.diagnostics.defaultLevelKey, core.diagnostics.defaultLevel);
			});
		},
		level: core.lang.Observable.accessor("level"),

		render: function (domElement) {
			var that = this,
				select;

			$("<label>Default trace level:</label>").appendTo(domElement);
			select = $("<select class='form-control'></select>").appendTo(domElement);
			core.lang.forEach(core.diagnostics.levels, function (value, name) {
				var option = $($("<option></option>").appendTo(select));
				option.val(value);
				option.text(name);
			});
			that.level(core.diagnostics.defaultLevel);
			binding.databind(binding.html(select), binding.domain(that, "level"));
		}
	});

	return DiagnosticsEditor;
});
