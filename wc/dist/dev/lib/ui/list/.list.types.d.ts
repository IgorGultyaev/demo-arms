export declare const ObjectListState: {
    initial: "initial";
    reloading: "reloading";
    loadingMore: "loadingMore";
    loaded: "loaded";
    failed: "failed";
    disposed: "disposed";
};
export declare type ObjectListState = (typeof ObjectListState)[keyof typeof ObjectListState];
export declare const ListSelectionMode: {
    single: "single";
    multiple: "multiple";
    custom: "custom";
};
export declare type ListSelectionMode = (typeof ListSelectionMode)[keyof typeof ListSelectionMode];
