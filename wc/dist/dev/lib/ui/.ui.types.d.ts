export declare const RenderStatus: {
    unloaded: "unloaded";
    rendering: "rendering";
    waiting: "waiting";
    ready: "ready";
};
export declare type RenderStatus = (typeof RenderStatus)[keyof typeof RenderStatus];
