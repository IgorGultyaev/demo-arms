/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "xcss!./styles/reportPart", "xcss!./styles/reportStyles"], function (require, exports, $, core, View) {
    "use strict";
    /**
     * Кастомный behavior прилипания заголовка таблицы. Полностью обрабатывает процесс прилипания:
     *  - явно устанавливает ширину столбцов в заголовке таблицы
     *  - клонирует строчку (TR) заголовка таблицы
     *  - добавляет клонированную строчку в заголовок таблицы, чтобы сохранилась ширина столбцов и высота всей таблицы
     * @param {AffixItem} item - элемент affix менеджера
     */
    var stuckBehavior = {
        attach: function (item) {
            // Set the width of TH elements explicitly
            // NOTE: setting the width of an element may change current width of next elements,
            // therefore we should calculate all widths at first
            var widths = [];
            item.$element.find("th").each(function (i, th) {
                widths[i] = $(th).css("width");
            });
            item.$element.find("th").each(function (i, th) {
                // NOTE: setting width is not enough, see WC-1414
                var width = widths[i];
                $(th).css({
                    "min-width": width,
                    "max-width": width
                });
            });
            item.$placeholder = item.$element.clone()
                .addClass("noprint")
                .insertBefore(item.$element);
        },
        detach: function (item) {
            // reset the width of TH elements
            item.$element.find("th").css({
                "min-width": "",
                "max-width": ""
            });
            if (item.$placeholder) {
                item.$placeholder.remove();
                item.$placeholder = undefined;
            }
        }
    };
    var ReportPresenterBase = /** @class */ (function (_super) {
        __extends(ReportPresenterBase, _super);
        /**
         * @constructs ReportPresenterBase
         * @extends View
         * @param {Object} options
         */
        function ReportPresenterBase(options) {
            var _this = this;
            options = ReportPresenterBase.mixOptions(options, ReportPresenterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.options.unbound = !_this.options.bound;
            return _this;
        }
        ReportPresenterBase.prototype.doRender = function (domElement) {
            var that = this;
            var menu = that.viewModel.menu;
            if (menu) {
                that._onDocKeyup = function (e) {
                    return !menu.executeHotkey(e);
                };
                core.$document.on("keyup", that._onDocKeyup);
            }
            _super.prototype.doRender.call(this, domElement);
            that.$domElement.on("click.reportLink", ".x-report-content-container", function (event) {
                var target = $(event.target);
                var uri = target.attr("href");
                // not link
                if (!uri) {
                    return;
                }
                if (that.viewModel.processLink(uri)) {
                    return false;
                }
            });
            that.$domElement.on("click", ".x-report-content-container .x-cmd-link", function () {
                var cmd, $this = $(this), commands = that.viewModel.commands, cmdName = core.commands.dataCommandName($this);
                if (commands && cmdName) {
                    cmd = commands[cmdName];
                    if (cmd) {
                        cmd.execute(core.commands.dataCommandParams($this));
                        return false;
                    }
                }
            });
        };
        ReportPresenterBase.prototype.onReady = function () {
            var that = this, eventPublisher = core.Application.current.eventPublisher;
            if (that.options.affixTableHeader) {
                if (that.$thead) {
                    eventPublisher.publish("ui.affix.remove_element", {
                        element: that.$thead
                    });
                }
                // NOTE: filter out a fake table for affixed header - :not(.sticky-stub)
                var $table = $(".x-report-table:not(.sticky-stub)", that.domElement);
                that.$thead = $table.find("thead");
                eventPublisher.publish("ui.affix.add_element", {
                    element: that.$thead,
                    controlledBy: $table,
                    stuckBehaviors: [stuckBehavior, "default", "hscroll"]
                });
            }
            var $title = that.$domElement.find(".x-report-appname");
            if ($title.length) {
                // report from server comes with a title, replace current part title
                if (that.viewModel.options.showTitle) {
                    var title = $title.text();
                    if (title) {
                        that.viewModel.title(title);
                        $title.remove();
                    }
                }
            }
            _super.prototype.onReady.call(this);
        };
        ReportPresenterBase.prototype.stateSeverity = function () {
            var that = this, model = that.viewModel, severity = "info";
            if (model) {
                if (model.state() === "failed")
                    severity = "error";
                if (model.state() === "generated")
                    severity = "success";
            }
            return severity;
        };
        ReportPresenterBase.prototype.unload = function (options) {
            var that = this;
            if (that.options.affixTableHeader) {
                var eventPublisher = core.Application.current.eventPublisher;
                if (that.$thead) {
                    eventPublisher.publish("ui.affix.remove_element", {
                        element: that.$thead
                    });
                }
            }
            if (that._onDocKeyup) {
                core.$document.off("keyup", that._onDocKeyup);
                that._onDocKeyup = undefined;
            }
            _super.prototype.unload.call(this);
        };
        ReportPresenterBase.defaultOptions = {
            bound: false,
            affixTableHeader: true
        };
        return ReportPresenterBase;
    }(View));
    ReportPresenterBase.mixin({
        defaultOptions: ReportPresenterBase.defaultOptions
    });
    return ReportPresenterBase;
});
//# sourceMappingURL=ReportPresenterBase.js.map