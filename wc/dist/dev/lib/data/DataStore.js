/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"lib/core.lang", "./DataStoreIndexedDB", "./DataStoreLocalStorage"
], function (lang, DataStoreIndexedDB, DataStoreLocalStorage) {
	"use strict";

	var DataStore = lang.find([ DataStoreIndexedDB, DataStoreLocalStorage ], function (store) {
		return store.prototype.isSupported;
	});

	if (!DataStore) {
		throw new Error("Your browser doesn't support any implementation of DataStore");
	}

	return DataStore;
});