/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"handlebars"
], function (Handlebars) {
	"use strict";
	/*
	 * Extending Handlebars compiler for adding support of functions inside templates.
	 * Generated code depends on Handlebars.CrocExtensions which is added inside View.js.
	 *
	 * This code is required at development-runtime and build-time (only on prepare stage).
	 * Also it MAY be required at production-runtime if an application uses dynamic templates compilation.
	 * Because of this the compiler extensions is kept (not stripped out during building) but checks JavaScriptCompiler.
	 * If an app currently uses handlebars.runtime then JavaScriptCompiler will be undefined.
	 */
	if (Handlebars.JavaScriptCompiler) {
		Handlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name, type) {
			var isSimple = parent === "helpers" || parent === "partials";
			// NOTE: to prevent calling HBX.get() the following syntax may be used in template:
			//   parent.["field"] (or parent.['field'])
			if (!isSimple && ((name[0] === '"' && name[name.length - 1] === '"') ||
			                  (name[0] === "'" && name[name.length - 1] === "'"))) {
				isSimple = true;
				name = name.slice(1, name.length - 1);
			}
			if (isSimple) {
				if (Handlebars.JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
					return parent + "." + name;
				} else {
					return parent + "['" + name + "']";
				}
			}

			if (/^[0-9]+$/.test(name)) {
				return "HBX.get(" + parent + ", " + name + ")";
			} else {
				return "HBX.get(" + parent + ", '" + name + "')";
			}
		};
	}

	/*
	 * Patch Handlebars to remove unnecessary whitespace in HTML (at compile time)
	 */
	var compile = Handlebars.compile,
		precompile = Handlebars.precompile,
		removeWhitespace;
	if (compile || precompile) {
		removeWhitespace = function (input) {
			// 1) We should not change markup inside the special helper {{pre}}.
			// So find the text outside '{{#pre}}...{{/pre}}' first
			return input.replace(/(?:^|{{\/pre}})([\s\S]*?)(?:$|{{#pre}})/g, function (match, text) {
				// 2) Remove line-breaking whitespace between the end of tag ('>') or helper ('}}') and
				// the beginning of another tag ('<') or helper ('{{') in found groups.
				return text.replace(/(>|\}\}|^)\s*[\r\n]\s*(<|\{\{|$)/g, "$1$2");
			});
		};

		if (compile) {
			Handlebars.compile = function (input, options) {
				return compile.call(this, removeWhitespace(input), options);
			};
		}
		if (precompile) {
			Handlebars.precompile = function (input, options) {
				return precompile.call(this, removeWhitespace(input), options);
			};
		}
	}

	return Handlebars;
});
