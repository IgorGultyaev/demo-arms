/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Part"], function (require, exports, core, Part) {
    "use strict";
    var StackPanel = /** @class */ (function (_super) {
        __extends(StackPanel, _super);
        /**
         * @constructs StackPanel
         * @extends Component
         * @param options
         */
        function StackPanel(options) {
            var _this = _super.call(this, options) || this;
            options || (options = {});
            _this.items = [];
            if (options.items) {
                if (core.lang.isArray(options.items)) {
                    for (var i = 0; i < options.items.length; i += 1) {
                        _this._add(options.items[i], "part" + i);
                    }
                }
                else {
                    for (var name_1 in options.items) {
                        var item = options.items[name_1];
                        _this._add(item, name_1);
                    }
                }
            }
            return _this;
        }
        StackPanel.prototype._add = function (itemOpt, name) {
            if (itemOpt) {
                var item = void 0;
                if (typeof itemOpt === "string") {
                    item = { partName: itemOpt };
                }
                else if (itemOpt["part"]) {
                    item = { part: itemOpt["part"] };
                }
                else if (itemOpt["render"]) {
                    item = { part: itemOpt };
                }
                if (item) {
                    item.name = name;
                    this.items.push(item);
                }
            }
        };
        StackPanel.prototype.render = function (domElement) {
            var container = $(domElement);
            container.empty();
            var table = $("<table style='width:100%'></table>").appendTo(container);
            // phase 1: create table with a row for each item
            for (var i = 0; i < this.items.length; i += 1) {
                var item = this.items[i];
                var tr = $("<tr></tr>").appendTo(table);
                var td = $("<td></td>").appendTo(tr);
                td.attr("id", i);
                if (item.height) {
                    tr.css({ height: item.height });
                }
                if (!item.part && item.partName)
                    item.part = core.createPart(item.partName);
                if (!item.part)
                    throw new Error("StackPanel.render: cannot render item '" + item.name + "' as it doesn't have connected part");
                if (item.part.setNavigationService)
                    item.part.setNavigationService(this.navigationService);
                item.part.render(td);
            }
        };
        return StackPanel;
    }(Part));
    core.ui.StackPanel = StackPanel;
    return StackPanel;
});
//# sourceMappingURL=StackPanel.js.map