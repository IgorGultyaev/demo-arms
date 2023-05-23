define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.LoadRule = {
        remoteFirst: "remoteFirst",
        localFirst: "localFirst",
        localIfOffline: "localIfOffline",
        cached: "cached",
        remoteOnly: "remoteOnly",
        localOnly: "localOnly"
    };
    exports.SaveTarget = {
        remoteFirst: "remoteFirst",
        remoteOnly: "remoteOnly",
        local: "local"
    };
    exports.SaveMode = {
        smart: "smart",
        offline: "offline",
        remoteOnly: "remoteOnly"
    };
    exports.AppCacheState = {
        uncached: "uncached",
        error: "error",
        cached: "cached",
        noupdate: "noupdate",
        obsolete: "obsolete",
        updateready: "updateready"
    };
});
//# sourceMappingURL=.interop.types.js.map