/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "xhtmpl!modules/admin/ui/templates/logs.hbs", "moment", "lib/ui/handlebars/View", "./PanelResizer", "lib/ui/menu/Menu", "lib/ui/menu/MenuButtonsPresenter"], function (require, exports, $, core, template, moment, View, PanelResizer, Menu) {
    "use strict";
    var lang = core.lang;
    core.ui.PanelResizer = PanelResizer;
    var LogPart = /** @class */ (function (_super) {
        __extends(LogPart, _super);
        function LogPart(app, logItems) {
            var _this = _super.call(this, {
                template: template
            }) || this;
            _this.items = new lang.ObservableCollection();
            _this.autoScroll(true);
            app.eventPublisher.subscribe("admin.log", function (evn) { _this.addItems(evn.args.items); });
            _this._doScroll = lang.debounce(_this.doScroll.bind(_this), 100);
            _this.menu = _this.createMenu();
            _this.commands = _this.createCommands();
            _this.menu.bindToCommands(_this.commands);
            if (logItems) {
                _this.addItems(logItems);
            }
            return _this;
        }
        LogPart.prototype.createRowModel = function (item, now) {
            // init formatted timestamp
            var ts = item.timestamp;
            if (ts) {
                ts = new Date(ts);
                item.timestamp = ts;
                var ts2 = moment(ts);
                var formatted = void 0;
                if (ts2.isBefore(now)) {
                    formatted = ts2.format("HH:mm:ss DD/MM");
                }
                else {
                    formatted = ts2.format("HH:mm:ss");
                }
                item.timestampFormatted = formatted;
            }
            // init message
            var message = item.eventName;
            if (item.eventData) {
                message += " : " + item.eventData;
            }
            item.message = message;
            return item;
        };
        LogPart.prototype.createMenu = function () {
            return new Menu({
                items: [{
                        name: "Clear",
                        icon: "clear",
                        presentation: "both"
                    }]
            });
        };
        LogPart.prototype.createCommands = function () {
            var that = this, 
            /** @type {BoundCommand} */
            BoundCommand = core.commands.BoundCommand, commands = {
                Clear: new BoundCommand(that.doClear, that.canClear, that)
            };
            return commands;
        };
        LogPart.prototype.doClear = function () {
            this.items.clear();
        };
        LogPart.prototype.canClear = function () {
            return true;
        };
        LogPart.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            that.jqOn(that.$domElement, "click", function (e) {
                var $selected = $(e.target).parents("[data-id]");
                if ($selected.length) {
                    that.$domElement.find(".message-row.selected").removeClass("selected");
                    $selected.addClass("selected");
                    var id_1 = parseInt($selected.attr("data-id"));
                    var item = that.items.find(function (item) {
                        return item.id === id_1;
                    });
                    if (item) {
                        that.onItemSelected(item);
                    }
                }
                //console.log($row.text());
            });
            that.jqOn(this.$domElement.find(".tabs li a"), "click", function () {
                var $this = $(this);
                var isActive = $this.hasClass("active");
                if (isActive) {
                    return false;
                }
                that.$domElement.find(".tabs li a.active").removeClass("active");
                $this.addClass("active");
                var tabName = $this.data("tab-name");
                that.$domElement.find(".message-info > .content.active").removeClass("active");
                that.$domElement.find(".message-info > .content[data-tab-content='" + tabName + "']").addClass("active");
                return false;
            });
        };
        LogPart.prototype.onItemSelected = function (item) {
            var html = "<dl>";
            html += "<dd>" + lang.encodeHtml(item.message) + "</dd>";
            html += "<dt>Timestamp:</dt><dd>" + item.timestamp + "</dd>";
            if (item.eventName) {
                html += "<dt>EventName:</dt><dd>" + item.eventName + "</dd>";
            }
            var stack = "";
            var keys = lang.sort(Object.keys(item.details), lang.compare);
            keys.forEach(function (name) {
                var value = item.details[name];
                var nameLo = name.toLowerCase();
                if (lang.isPlainObject(value)) {
                    value = JSON.stringify(value, function (key, val) {
                        if (val && key.toLowerCase() === "stacktrace") {
                            val = val.replace(/\\/gi, "\\");
                        }
                        return val;
                        //return val && typeof val === "string" ? val.replace(/\r\n/gi, "<br>") : val;
                    }, "  ");
                }
                else if (nameLo === "stacktrace") {
                    stack = value;
                    value = "";
                }
                if (value) {
                    html += "<dt>" + lang.encodeHtml(name) + ":</dt>";
                    // NOTE: строки с переносами после JSON.stringify становятся с \r\n (не экспейп, а именно "\" + "r"..)
                    html += "<dd>" + lang.encodeHtml(value).replace(/\r\n/gi, "<br>").replace(/\\r\\n/gi, "<br>") + "</dd>";
                }
            });
            html += "</dl>";
            // info
            $(".message-info .content[data-tab-content='info'] pre").html(html);
            // stack
            if (stack) {
                html = "<dl><dt>StackTrace:</dt><dd>" + lang.encodeHtml(stack) + "</dd></dl>";
            }
            else {
                html = "";
            }
            $(".message-info .content[data-tab-content='stack'] pre").html(html);
            // env
            html = "<dl>";
            lang.forEach(item.env, function (value, name) {
                html += "<dt>" + lang.encodeHtml(name) + ":</dt>";
                html += "<dd>" + lang.encodeHtml(value) + "</dd>";
            });
            html += "</dl>";
            $(".message-info .content[data-tab-content='env'] pre").html(html);
        };
        LogPart.prototype.addItems = function (items) {
            if (!items || !items.length) {
                return;
            }
            var now = new Date();
            now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var id = this.items.count();
            for (var i = 0; i < items.length; i++) {
                var item = this.createRowModel(items[i], now);
                item.id = id++;
                this.items.add(item);
            }
            if (this.autoScroll()) {
                this._doScroll();
            }
        };
        LogPart.prototype.doScroll = function () {
            var $panel = $("#top-panel");
            $panel.animate({ scrollTop: $panel[0].scrollHeight }, 100, null);
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], LogPart.prototype, "autoScroll");
        return LogPart;
    }(View));
    return LogPart;
});
//# sourceMappingURL=LogPart.js.map