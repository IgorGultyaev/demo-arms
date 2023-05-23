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
	"lib/binding",
	"xcss!lib/ui/styles/menuNav"
], function ($, core, binding) {
	"use strict";
	core.ui = core.ui || {};

	var NavMenu = core.lang.Class(core.lang.Observable,/** @lends NavMenu.prototype */ {
		/**
		 * @class NavMenu
		 * @extends Observable
		 * @deprecated - use AppNavMenuPresenter & AppNavMenu
		 * @param {AreaManager} areaManager
		 */
		constructor: function (areaManager) {
			this.areaManager = areaManager;
		},

		/**
		 * Render menu
		 * @param {HTMLElement} navEl Any element with 'nav' class
		 * @param {Boolean} dontTouchHtml If true then  NavMenu won't generate menu items (li) for areas, by default it does generate.
		 */
		render: function (domElement, dontTouchHtml) {
			var that = this,
				areas = that.areaManager.getAreas(),
				stateManager = that.areaManager.app.stateManager,
				area,
				url,
				i, li, $anchor,
				$nav = $(domElement);

			$nav.addClass("x-menu-app-nav");

			if (!dontTouchHtml) {
				for(i = 0; i < areas.length; i += 1) {
					area = areas[i];

					li = $("<li></li>").appendTo($nav);
					url = stateManager.getAreaUrl(area.name);
					$anchor = $("<a href='" + url + "' data-area='" + area.name + "'>" + area.title  + "</a>").appendTo(li);
					$anchor.addClass("x-menu-item x-menu-item-action");
					binding.databind(
						binding.html(li, "hidden"),
						binding.expr(area, area.hidden)
					);
				}
			}

			$("a", $nav).each(function() {
				var anchorSel = $(this),
					href = anchorSel.attr("href"),
					parts,
					area = anchorSel.attr("data-area"),
					liSel;
				if (area === undefined) {
					// area name isn't specified in data-area attribute
					if (!href || href === '/') {
						area = '';
					} else {
						// parse href
						if (href[0] === "/") {
							href = href.slice(1);
						}
						parts = href.split("/");
						area = parts[0];
					}
				}
				liSel = that._getFirstParentByTag(this, "li");
				$(liSel).data("area", area);

				anchorSel.buttonClick(function(e) {
					if (core.html.isExternalClick(e)) {
						// if user clicks a link with ctrl/shift/alt/wheel then let the browser to process the click
						return;
					}
					e.preventDefault();
					if (that.areaManager.getActiveArea().name === area) {
						that.areaManager.activateState(area, "");
					} else {
						that.areaManager.activateArea(area);
					}
				});
			});

			//menu can be initialized before or after activating first area
			var activeArea = that.areaManager.getActiveArea();
			if (!!activeArea) {
				that._setActiveArea($nav, activeArea.name);
			}
			that.areaManager.bind("changeArea", function (areaName) {
				that._setActiveArea($nav, areaName);
			});
		},

		_setActiveArea: function (navEl, areaName) {
			$("li.active", navEl).removeClass("active");
			$("li", navEl).each(function () {
				var sel = $(this);
				if (sel.data("area") === areaName) {
					sel.addClass("active");
				}
			});
		},

		_getFirstParentByTag: function (element, tagName) {
			tagName = tagName.toLowerCase();
			do {
				if (element.tagName.toLowerCase() === tagName) {
					return element;
				}
				element = element.parentNode;
			} while(element);
		}
	});

	core.ui.NavMenu = NavMenu ;

	return NavMenu ;
});
