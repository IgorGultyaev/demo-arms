/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"lib/core.lang"
], function (lang) {
	"use strict";

	var DomainObjectIterator = lang.Class(/** @lends DomainObjectIterator.prototype */ {
		/**
		 * @class DomainObjectIterator
		 * @param {DomainObject} obj Root object to start preload path from
		 */
		constructor: function (obj) {
			this.root = obj;
		},

		_next: function (obj, parts, i, callback) {
			var that = this,
				propName = parts[i],
				path,
				propInfo,
				propValue,
				needStop;

			needStop = callback(obj, null);
			if (needStop)
				return needStop;
			if (obj.isLoaded === false)
				return false;
			if (i === parts.length)
				return false;

			propInfo = obj.meta.props[propName];
			path = parts.slice(0, i).join(".");
			if (!propInfo)
				throw new Error("Property path '" + path + "' contains unknown property name: " + propName);
			if (propInfo.vt !== "object") {
				if (i === parts.length - 1) return false;
				throw new Error("Property path '" + path + "' contains non-navigation property: " + propName);
			}
			propValue = obj[propName]();
			needStop = callback(obj, propName, propValue, path);
			if (needStop)
				return needStop;
			if (!propValue || propValue.isGhost) {
				// null or not-loaded prop - break iteration
				return false;
			}

			if (propInfo.many) {
				// propName is a array prop, it may contain not-loaded objects
				needStop = propValue.all().some(function (objValue) {
					return that._next(objValue, parts, i+1, callback);
				});
				if (needStop)
					return needStop;
			} else if (i <= parts.length - 1) {
				return that._next(propValue, parts, i+1, callback);
			}
			return false;
		},

		/**
		 * Traverse object graph and call the callback for each object and navigation property.
		 * @param {String} path A property chain path like "prop1.prop2.prop3"
		 * @param {Function} callback A callback to be called for each object and navigation property.
		 * @returns {Boolean} true if the callback returns true
		 */
		visit: function (path, callback) {
			var that = this,
				parts = path.split(".");

			return that._next(that.root, parts, 0, callback);
		}
	});

	return DomainObjectIterator;
});