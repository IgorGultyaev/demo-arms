import $ = require("jquery");
import core = require("core");
import xconfig = require("xconfig");
import model = require("app/domain/model-ext");
import DataFacadeSmart = require("lib/interop/DataFacadeSmart");
import BackendInterop = require("lib/interop/BackendInterop");
import DataStoreFactory = require("lib/data/DataStoreFactory");
import AppNavMenu = require("lib/ui/menu/AppNavMenu");
import AppToolbar = require("lib/ui/AppToolbar");
import templateApp = require("xhtmpl!app/ui/templates/app.hbs");
import resources = require("i18n!app/nls/resources");

import "app/iconProvider";
import "app/default-menus";
import "app/default-parts";
import "app/parts";
import "app/area-default";

import lang = core.lang;
import Area = core.composition.Area;

if (!xconfig) {
	let err = "No xconfig global object found. Unable to proceed.";
	alert(err);
	throw new Error(err);
}

class Application extends core.Application {
	appToolbar: AppToolbar;
	navMenu: core.ui.AppNavMenu;
	model: typeof model;

	constructor() {
		super(xconfig, {template: templateApp});
		this.model = model;
	}

	createDataFacade() {
		return DataStoreFactory
			.create(xconfig.appName, /*db version:*/ 1, model.meta)
			.then(function (store) {
				return new DataFacadeSmart(
					new BackendInterop(xconfig),
					null, // eventPublisher, Application will initialize it while running
					store,
					{
						// TODO: cacheManager: new CacheManager()
					}
				);
			});
	}

	preinitialize() {
		let that = this;
		that.appToolbar = new AppToolbar(that, {
			//affix: false
		});
	}

	initialize() {
		let that = this;

		// top navigation menu (switching areas):
		// NOTE: AppNavToolbar cannot be created in preinitialize and rendered in template as it depends on AreaManager which is initialized after template rendered
		that.navMenu = new AppNavMenu(that.areaManager);
		that.appToolbar.appNavMenu(that.navMenu);
	}
}

export = Application;
