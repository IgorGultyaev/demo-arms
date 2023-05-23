/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"jquery",
	"core",
	"lib/ui/handlebars/View",
	"xhtmpl!./templates/ModelBrowser.hbs",
	"xcss!./styles/ModelBrowser"
], function($, core, View, template){
	"use strict";

	var ModelBrowserDetails = core.lang.Class(View, {

		currentObject: core.lang.Observable.accessor("currentObject"),

		currentProps: new core.lang.ObservableCollection(),

		constructor: function(options){
			var that = this;
			View.call(that, options);

			that.bind("change:currentObject", function(source, newVal){
				that.currentProps.clear();

				if (!newVal){
					return;
				}

				var props = ModelBrowser.getObjectProps(newVal);
				for(var i = 0; i < props.length; i++){
					that.currentProps.add(props[i]);
				}
			});
		}
	});

	var ModelBrowser = core.lang.Class(View, {
		defaultOptions: {
			template: template
		},
		constructor: function(options){
			var that = this;
			that.options = that.mixOptions(options, ModelBrowser.prototype.defaultOptions);
			View.call(that, options);
			that.treePart = core.createPart("ObjectTree:model-browser");
			that.detailsPart = new ModelBrowserDetails();
			that.treePart.bind("change:activeNode", function(source, newVal){
				that.detailsPart.currentObject((newVal && newVal.data()) ? newVal.data().obj : null);
			});
		}
	});

	ModelBrowser.shared( /** @lends ModelBrowser */{
		/**
		 * Returns array of the object properties with values.
		 * @param {Object} obj The object whose properties will be returned.
		 * @param {Array} options.skipProps Array of property names that should be skipped.
		 * @returns {Array} Array of property descriptors
		 * @example
		 * <pre>
		 * {
		 * 	key: "propName",
		 * 	value: "propValue",
		 *	isFunction: false,
		 *	isObject: false,
		 *	isEmptyObject: false,
		 *	isValue: true
		 * }
		 * </pre>
		 */
		getObjectProps: function(obj, options){
			var props = [];

			if (obj && core.lang.isObject(obj)){
				if (!options)
					options = {};

				if (!options.skipProps)
					options.skipProps = [];

				if (!(options.skipProps instanceof Array))
					options.skipProps = [options.skipProps];

				for(var key in obj){
					if (obj.hasOwnProperty(key) && options.skipProps.indexOf(key) < 0){
						var isFunction = core.lang.isFunction(obj[key]),
							isObject = core.lang.isObject(obj[key]),
							isEmptyObject = core.lang.isEmptyObject(obj[key]),
							value = isFunction ? "function" : core.lang.get(obj, key);
						props.push({
							key: key,
							value: value,
							isFunction: isFunction,
							isObject: isObject,
							isEmptyObject: isEmptyObject,
							isValue: !isObject,
							details: isFunction ? obj[key] : ""
						});
					}
				}
				props = core.lang.sort(props, function(left, right) { return core.lang.compare(left.key, right.key); });
			}

			return props;
		}
	});

	return ModelBrowser;
});
