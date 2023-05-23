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
	"xhtmpl!./templates/SettingsEditor.hbs"
], function (core, View, template) {
	"use strict";

	var SettingsEditor = core.lang.Class(View, {
		defaultOptions: {
			template: template,
			unbound: false
		},

		hasChanges: core.lang.Observable.accessor("hasChanges"),
		props: core.lang.Observable.accessor("props"),
		newPropName: core.lang.Observable.accessor("newPropName"),

		constructor: function (options) {
			var that = this;
			that.options = that.mixOptions(options, SettingsEditor.prototype.defaultOptions);
			View.call(that);

			that.props(new core.lang.ObservableCollection());
			that.initProps();
			that.props().bind("change", function () { that.hasChanges(true); });
			that.props().bind("itemChange", function () { that.hasChanges(true); });

			that.cmdAddNew = new core.commands.BoundCommand(that.addProperty, that.newPropName, that);
			that.cmdSave = new core.commands.BoundCommand(that.saveAll, that.hasChanges, that);
			that.cmdCancel = new core.commands.BoundCommand(that.cancel, that.hasChanges, that);
			that.cmdReload = core.createCommand({
				execute: function (args) {
					that.reload();
				}
			});
			that.cmdRemoveProp = core.createCommand({
				execute: function (args) {
					that.removeProperty(args.prop);
				}
			});
		},

		initProps: function () {
			var that = this,
				bundleNames = core.settings.getBundleNames();
			core.lang.forEach(bundleNames, function (bundleName) {
				var bundle = core.settings.getBundle(bundleName);
				if (core.lang.isPlainObject(bundle)) {
					core.lang.traverseObject(bundle, function (name, value, path) {
						var fullName = bundleName + (path.length > 0 ? "." + path.join(".") : "") + "." + name;
						that.addPropertyObject(fullName, value);
					});
				} else {
					that.addPropertyObject(bundleName, bundle);
				}
			});
		},
		
		addPropertyObject: function (fullName, value) {
			var propObj = core.lang.observe({
				name: fullName,
				value: value
			});
			this.props().add(propObj);
		},
		
		addProperty: function () {
			var that = this,
				propName = that.newPropName();
			if (propName) {
				that.addPropertyObject(propName, "");
				that.newPropName("");
			}
		},

		removeProperty: function (propName) {
			if (!propName) { throw new Error("Property name was not specified"); }

			var that = this,
				toRemove = core.lang.find(that.props().all(), function (propObj) {
					return propObj.name() === propName;
				});
			if (toRemove) {
				that.props().remove([toRemove]);
			}
		},


		saveAll: function () {
			core.settings.clear();
			this.props().all().forEach(function (propObj) {
				var value = propObj.value();
				if (value === "" || value === null || value === "null" || value === "undefined") {
					value = undefined;
				} else if (value) {
					if (!isNaN(parseFloat(value))) {
						value = parseFloat(value);
					} else if (core.lang.isString(value)) {
						// normalize stringified booleans
						var lowerCase = value.toLowerCase();
						if (lowerCase === "true") {
							value = true;
						} else if (lowerCase === "false") {
							value = false;
						}
					}
				}
				core.settings.setItem(propObj.name(), value);
			});
			this.hasChanges(false);
			core.Application.current.eventPublisher.publish(
				"debug.settings.saved",
				core.SystemEvent.create({ message: "Settings were saved" })
			);
		},

		cancel: function () {
			var that = this;
			that.props().clear();
			that.initProps();
			that.hasChanges(false);
			that.newPropName("");
		},

		reload: function () {
			this.props().clear();
			this.initProps();
			this.hasChanges(false);
		}
	});

	return SettingsEditor;
});