define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.RenderStatus = {
        /** Part was not renderer or was unloaded */
        unloaded: "unloaded",
        /** Part in process of rendering. */
        rendering: "rendering",
        /** Part was rendered in 'waiting' state - rendering finished but the part is waiting for something */
        waiting: "waiting",
        /** Part was rendered in normal state */
        ready: "ready"
    };
});
//# sourceMappingURL=.ui.types.js.map