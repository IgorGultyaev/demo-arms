/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "./DataStoreIndexedDB", "./DataStoreLocalStorage"], function (require, exports, lang, DataStoreIndexedDB, DataStoreLocalStorage) {
    "use strict";
    exports.__esModule = true;
    if (!DataStoreIndexedDB.prototype.isSupported && !DataStoreLocalStorage.prototype.isSupported) {
        throw new Error("Your browser doesn't support any implementation of DataStore");
    }
    function create(name, version, domainModelMeta, options) {
        var store;
        if (!DataStoreIndexedDB.prototype.isSupported) {
            store = new DataStoreLocalStorage(name, version, domainModelMeta, options);
            return lang.resolved(store);
        }
        store = new DataStoreIndexedDB(name, version, domainModelMeta, options);
        return store.test().then(function () { return store; }, function (e) {
            // NOTE: Firefox with disabled history fails on opening connection to IndexedDB,
            // all other errors will be handled inside another call DataStoreIndexedDB.test from within DataFacade
            // NOTE: this hardcoded message doesn't depend on locale (tested)
            if (e && e.message && e.message.indexOf("A mutation operation was attempted on a database that did not allow mutations") >= 0) {
                // IndexedDB isn't supported, falling back to localStore impl
                var store_1 = new DataStoreLocalStorage(name, version, domainModelMeta, options);
                return lang.resolved(store_1);
            }
            return lang.resolved(store);
        });
    }
    exports.create = create;
});
//# sourceMappingURL=DataStoreFactory.js.map