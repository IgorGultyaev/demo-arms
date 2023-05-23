export declare const LoadRule: {
    remoteFirst: "remoteFirst";
    localFirst: "localFirst";
    localIfOffline: "localIfOffline";
    cached: "cached";
    remoteOnly: "remoteOnly";
    localOnly: "localOnly";
};
export declare type LoadRule = (typeof LoadRule)[keyof typeof LoadRule];
export declare const SaveTarget: {
    remoteFirst: "remoteFirst";
    remoteOnly: "remoteOnly";
    local: "local";
};
export declare type SaveTarget = (typeof SaveTarget)[keyof typeof SaveTarget];
export declare const SaveMode: {
    smart: "smart";
    offline: "offline";
    remoteOnly: "remoteOnly";
};
export declare type SaveMode = (typeof SaveMode)[keyof typeof SaveMode];
export declare const AppCacheState: {
    uncached: "uncached";
    error: "error";
    cached: "cached";
    noupdate: "noupdate";
    obsolete: "obsolete";
    updateready: "updateready";
};
export declare type AppCacheState = (typeof AppCacheState)[keyof typeof AppCacheState];
