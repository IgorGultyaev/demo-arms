/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define(
[
	"jquery",
	"core",
	"lib/ui/Part",
	"lib/formatters",
	"i18n!lib/nls/resources",
	"lib/ui/menu/MenuNavPresenter",
	"lib/ui/menu/AreaStatesMenu",
	"./ui/OnlineMonitor",
	"./ui/ConfigEditor",
	"./ui/DiagnosticsEditor",
	"./ui/SettingsEditor",
	"./ui/ModelBrowser",
	"lib/ui/tree/ObjectTree",
	"lib/ui/tree/FancytreePresenter"
], function ($, core, Part, formatters, resources,
             MenuPresenter, AreaStatesMenu,
             OnlineMonitor, ConfigEditor, DiagnosticsEditor, SettingsEditor, ModelBrowser) {
	"use strict";


	var ListAllParts = core.lang.Class(Part, {
		constructor: function (app) {
			this.app = app;
		},
		render: function(domElement) {
			var that = this,
				ul, onclick;

			onclick = function(e) {
				e.preventDefault();
				var partName = $(this).attr("href");
				that.navigationService.navigate({ part: partName, partOptions: {} });
			};

			$("<h3>All parts</h3>").appendTo(domElement);
			ul = $("<ul></ul>").appendTo(domElement);

			core.lang.forEach(that.app.getAllPartNames(), function (name) {
				var li = $("<li></li>").appendTo(ul),
					anchor = $("<a href='" + name + "'>" + name + "</a>").appendTo(li);
				anchor.click(onclick);
			});
		}
	});


	function Evaluator(app) {
		this.app = app;
	}
	Evaluator.prototype.evaluate = function (code) {
		try{
			var app = this.app,
				core = core,
				cache = [];
			return JSON.stringify(eval(code), function(key, value){
				if (typeof value === 'object' && value !== null) {
					if (cache.indexOf(value) !== -1) {
						// Circular reference found, discard key
						return;
					}
					// Store value in our collection
					cache.push(value);
				}
				return value;
			}, 2);
			cache = null;
		}
		catch (e) {
			return e.toString();
		}
	};

	var Console = core.lang.Class({
		constructor: function (app) {
			this.app = app;
			this.evaluator = new Evaluator(app);
			this._history = [];
		},
/*
		_autoGrow: function () {

			function handler(e) {
				var newHeight = this.scrollHeight;
				var currentHeight = this.clientHeight;
				if (newHeight > currentHeight) {
					this.style.height = newHeight + 3 * textLineHeight + 'px';
				}
			}

			var ta = this.ta[0];
			var setLineHeight = 12;

			var textLineHeight = core.html.findEffectiveStyle(ta).lineHeight;

			textLineHeight = (textLineHeight.indexOf('px') == -1) ? setLineHeight : parseInt(textLineHeight, 10);
			ta.addEventListener ? ta.addEventListener('input', handler, false) : ta.attachEvent('onpropertychange', handler);
		},
*/

		render: function (domElement) {
			var that = this,
				input,
				keyCode = core.html.keyCode,
				btnPing = $("<button class='btn btn-default' type='button'>Ping</button>").appendTo(domElement);
			$("<div class='alert-info alert' style='margin-top:5px;padding:5px;'>You can use 'core' and 'app' variables</div>").appendTo(domElement);
			input = $("<input type='text' class='form-control'>").appendTo(domElement);
			that.ta = $("<textarea rows='10' class='form-control'></textarea>").appendTo(domElement);

			btnPing.click(function () {
				//that.app.dataFacade
				$.ajax(xconfig.apiroot + 'api/ping').then(function () {
					that.append("Ping succeeded");
				}, function (err) {
					that.append(err);
					that.append(JSON.stringify(err));
				});
			});
			$(input).keyup(function (e) {
				if (e.which === keyCode.ENTER) {
					var $this = $(this),
						$ta = $(that.ta),
						result,
						code = $this.val();
					$this.val("");
					that.append("> " + code);
					result = that.evaluator.evaluate(code);
					that.append(result);
					that._history.push(code);

					$ta.scrollTop(
						$ta[0].scrollHeight - $ta.height()
					);
				} else if (e.which === keyCode.UP) {
					input.val(that._history.pop());
				}
			});
		},
		append: function (text) {
			this.ta.val(this.ta.val() + "\n" + text);
		}
	});

	var module = {};

	core.createModule("debug", function (app) {
		var title = "Debug",
			iconProvider = core.ui.iconProvider;
		if (iconProvider) {
			title = formatters.safeHtml(iconProvider.getIcon("settings"), title);
		}

		module.areaDebug = app.areaManager.createArea("debug", null, {
			title: title,
			hidden: !app.config.isDebug
		});

		core.$document.keyup(function (e) {
			if (e.shiftKey && e.ctrlKey && e.altKey && e.which === core.html.keyCode.D) {
				// Ctrl-Alt-Shift-D pressed
				module.areaDebug.hidden(!module.areaDebug.hidden());
			}
		});

		app.registerPart("ObjectTree:model-browser", function(){
			var loader = {
					loadChildren: function(tree, node){
						var identity = tree.getNodeIdentity(node),
							data = node.data(),
							current = identity.type == tree.ROOT_NODE_NAME ? app.model.meta : data.obj;

						return ModelBrowser.getObjectProps(current, { skipProps: [ "model", "entity", "parent" ] }).map(function(p){
							var obj = { data: { title: p.key, obj: p.value } };
							if (p.isValue || p.isFunction){
								obj.data.title += ": " + p.value;
								obj.children = [];
							}
							else if (p.isObject){
								if (p.isEmptyObject){
									obj.data.title += ": { }";
									obj.children = [];
								}
								else if (p.value.descr){
									var descrLen = 100,
										title = p.value.descr.length <= descrLen ? p.value.descr : p.value.descr.substring(0, descrLen).trim() + "...";
									obj.data.title += " [ " + title + " ] ";
								}
							}

							return obj;
						});
					}
				};

			return new core.ui.ObjectTree(app, {
				loader: loader,
				autoLoad: true,
				hasNumbering: false,
				hasCheckboxes: false,
				menuTree: {
					remove: [ "ReloadRoot" ]
				},
				menuNode: {
					remove: [ "Reload", "Edit" ]
				}
			});
		});

		app.registerPart("ObjectBrowser", function (options) {
			var loader = {
				root: options.root,

				loadChildren: function(tree, node){
					var identity = tree.getNodeIdentity(node),
						data = node.data(),
						current = identity.type === tree.ROOT_NODE_NAME ? this.root : data.obj,
						props,
						proto;

					props = ModelBrowser.getObjectProps(current).map(function(p){
						var obj = { data: { title: p.key, obj: p.value, details: p.details } };
						if (p.isValue || p.isFunction){
							obj.data.title += ": " + p.value;
							obj.children = [];
						}
						else if (p.isObject){
							if (p.isEmptyObject){
								obj.data.title += ": { }";
								obj.children = [];
							}
						}

						return obj;
					});

					// add __proto__ node
					proto = Object.getPrototypeOf(current);
					if (current && !core.lang.isEmptyObject(proto)) {
						props.push({
							data: {
								title: "__proto__",
								obj: proto
							}
						});
					}

					return props;
				}
			};

			return new core.ui.ObjectTree(app, {
				loader: loader,
				autoLoad: true,
				hasNumbering: false,
				hasCheckboxes: false,
				menuTree: {
					items: []
				},
				menuNode: {
					items: []
				},
				presenterOptions: {
					hideMenuNode: true
				}
			});
		});
	});

	core.createAreaModule("debug", function (app, areaDebug) {
		var areaEl = areaDebug.domElement,
			regionEl,
			region,
			regionMenu,
			menu,
			menuPresenter;

		// states:
		areaDebug.addState({ name: "settings", title: "Settings" }, { "main": new SettingsEditor() });
		areaDebug.addState({ name: "parts", title: "Parts" }, { "main": new ListAllParts(app) });
		areaDebug.addState({ name: "offline", title: "Offline" }, { "main": new OnlineMonitor(app) });
		areaDebug.addState({ name: "config", title: "Config" }, { "main": new ConfigEditor(app.config) });
		areaDebug.addState({ name: "diagnostics", title: "Diagnostics" }, { "main": new DiagnosticsEditor(app) });
		areaDebug.addState({ name: "console", title: "Console" }, { "main": new Console(app) });
		areaDebug.addState({ name: "model-browser", title: "Model" }, { "main": new ModelBrowser() });
		areaDebug.setDefaultState("settings");

		// menu region:
		regionEl = $("<div class='x-region'></div>").appendTo(areaEl);
		regionMenu = new core.composition.Region("menu");
		regionMenu.render(regionEl);
		areaDebug.regionManager.addRegion(regionMenu);
		var menuAddon = {
			update: [{
				name: "settings", hint: "Settings editor"
			}, {
				name: "parts", hint: "List of all registered parts"
			}, {
				name: "offline", hint: "Offline settings"
			}, {
				name: "config", hint: "Config editor"
			}, {
				name: "diagnostics", hint: "Diagnostics settings"
			}, {
				name: "console", hint: "REPL console"
			}, {
				name: "model-browser", hint: "Domain model browser"
			}]
		};
		if (xconfig.modules && xconfig.modules["admin"]) {
			menuAddon.update.push({
				name: "Log", title: "Server Log", url: xconfig.root + "admin/logs"
			});
		}
		menu = new AreaStatesMenu(areaDebug, menuAddon);
		menuPresenter = MenuPresenter.create({ viewModel: menu, radio: true, orientation: "horizontal" /*css: { width: "200px" }*/ });
		regionMenu.activatePart(menuPresenter);

		// main region:
		var rowEl = $("<div class='row'></div>").appendTo(areaEl);
		var colEl = $("<div class='col-md-12'></div>").appendTo(rowEl);
		regionEl = $("<div class='x-region x-region-content'></div>").appendTo(colEl);
		region = new core.composition.Region("main");
		region.render(regionEl);
		region.navigable = true;
		areaDebug.regionManager.addRegion(region);
	});

	core.composition.regionBehaviors["debug"] = {
		attach: function (region, domElement, options) {
			$("<span class='x-region-debug x-icon x-icon-settings'></span>").appendTo(region.domElement)
				.on("click", function () {
					var obj = region.getDebugInfo(),
						part = core.createPart(
							"ObjectBrowser",
							{ root: obj }
						),
						dialog = core.ui.Dialog.create({
							header: "Debug region browser",
							body: part,
							menu: {
								remove: "cancel",
								update: [{
									name: "Rerender", command: core.createCommand(function() { region.rerender();})
								}, {
									name: "Details",
									command: function(dlg) {
										return core.commands.createBoundCommand({
											execute: function (args) {
												var tree = this.body();
												var node = tree.activeNode();
												if (node) {
													var text = node.data() && node.data().details;
													if (text) {
														text = text.toString();
													}
													return core.ui.Dialog.create({
														header: node.data().title,
														html: "<pre>" + text + "</pre>",
														menu: {
															items: [{name: "ok", title: "Ok"}]
														}
													}).open();
												}
											},
											canExecute: function () {
												return !!this.body().activeNode() && this.body().activeNode().data().details;
											}
										}, dlg);
									}
								}]
							}
						});
					dialog.open();
				});
		}
	};

return module;
});
