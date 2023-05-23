/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "jquery"], function (require, exports, core, $) {
    "use strict";
    var PanelResizer = /** @class */ (function (_super) {
        __extends(PanelResizer, _super);
        function PanelResizer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PanelResizer.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            // inspired by http://plugins.jquery.com/misc/textarea.js
            this.divider = $("<div class='divider'></div></div>")
                .appendTo(that.$domElement);
            this.topPanel = $("#top-panel");
            this.bottomPanel = $("#bottom-panel");
            var $win = $(window), resizing = false;
            var performDrag = function (e) {
                if (!resizing) {
                    return;
                }
                that.divideView(e.clientY, $win);
            };
            var endDrag = function () {
                $("#overlay").remove();
                resizing = false;
                core.settings.setItem("admin.logs.divider", that.divider.css("bottom"));
                $(document)
                    .unbind('mousemove', performDrag)
                    .unbind('mouseup', endDrag);
            };
            that.divider.on("mousedown", function () {
                $("<div id='overlay'></div>").appendTo($("body"));
                resizing = true;
                $(document)
                    .mousemove(core.lang.debounce(performDrag, 1))
                    .mouseup(endDrag);
            }).append("<div class='line-1'></div><div class='line-2'></div><div class='line-3'></div>");
            var fromTop = core.settings.getItem("admin.logs.divider");
            if (fromTop) {
                fromTop = $win.height() - parseInt(fromTop);
                that.divideView(fromTop, $win);
            }
        };
        PanelResizer.prototype.divideView = function (fromTop, win) {
            var $win = win || $(window);
            var height = $win.height();
            var fromBottom = $win.height() - fromTop;
            if (fromTop < 100 || fromTop + 100 > height) {
                return;
            }
            this.topPanel.css("bottom", fromBottom + 5);
            this.bottomPanel.css("height", fromBottom - 5);
            this.divider.css("bottom", fromBottom - 5);
        };
        PanelResizer.prototype.unload = function () {
            $(".divider").off("mousedown");
        };
        return PanelResizer;
    }(core.ui.Part));
    return PanelResizer;
});
//# sourceMappingURL=PanelResizer.js.map