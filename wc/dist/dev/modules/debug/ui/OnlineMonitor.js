/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"core",
	"lib/binding",
	"lib/ui/handlebars/View",
	"xhtmpl!./templates/OnlineMonitor.hbs"
], function (core, binding, View, template) {
	"use strict";

	var OnlineMonitor = core.lang.Class(View, {
		defaultOptions: {
			template: template,
			unbound: true
		},
		constructor: function(app, options) {
			var that = this;
			that.app = app;
			that.options = that.mixOptions(options, OnlineMonitor.prototype.defaultOptions);
			that.commands = that.createCommands();
			that.dataFacade = app.dataFacade;
			View.call(that, options);			
		},

		/**
		 * Create commands
		 * @protected
		 * @returns {{RecreateDataStore: (Command)}}
		 */
		createCommands: function () {
			var that = this;
			var commands = {
/*
				Install: core.createCommand({
					execute: function() {
						that.installApp();
					}
				}),
				InstallPackaged: core.createCommand({
					execute: function() {
						that.installPackagedApp();
					}
				}),
*/
				RecreateDataStore: core.createCommand({
					title: "Recreate DB",
					execute: function() {
						that.recreateDataStore();
					}						
				})
			};
			return commands;
		},
		
		recreateDataStore: function  () {
			var that = this,
				store = that.dataFacade && that.dataFacade._store;
			if (!store) { return; }

			if (!confirm("Are you sure to recreate Database?")) return;
			
			store.recreate().done(function () {
				that.app.eventPublisher.publish("data.dataStore.recreated", core.SystemEvent.create({
					kind: core.SystemEvent.prototype.kinds.notification,
					priority: "low",
					message: "DataStore was successfully recreated"
				}));
			}).fail(function (error) {
				that.app.eventPublisher.publish("data.dataStore.recreated", core.SystemEvent.create({
					kind: core.SystemEvent.prototype.kinds.notification,
					priority: "high",
					message: "Error during the recreation of DataStore: " + (error && error.message || error),
					severity: "error"
				}));
			});
		}
/*
		normalizeUrl: function (fileName) {
			var baseUrl = History.getRootUrl();
			baseUrl = baseUrl.slice(0, baseUrl.length -1);
			var url = baseUrl + app.config.root + fileName;
			return url;
		},

		installApp: function () {
			if (!navigator.mozApps) {
				alert("Installing as Open Web App  is only supported in Mozilla Firefox");
				return;
			}

			var manifestURL = normalizeUrl ("manifest.webapp");
			console.log("Using manifest from " + manifestURL);
			var request = navigator.mozApps.install(manifestURL);

			// Successful install
			request.onsuccess = function(data) {
				console.log("Success, app installed!");
			};

			// Install failed
			request.onerror = function() {
				console.log("Install failed\n\n:" + request.error.name);
			};
		},

		installPackagedApp: function () {
			if (!navigator.mozApps) {
				alert("Installing as Open Web App is only supported in Mozilla Firefox");
				return;
			}
			var manifestURL = normalizeUrl ("package.webapp");
			console.log("Using manifest from " + manifestURL);

			var request = navigator.mozApps.installPackage(manifestURL);

			// Successful install
			request.onsuccess = function(data) {
				console.log("Success, app installed!");
			};

			// Install failed
			request.onerror = function() {
				console.log("Install failed\n\n:" + request.error.name);
			};
		}
*/
	});
	return OnlineMonitor;
});