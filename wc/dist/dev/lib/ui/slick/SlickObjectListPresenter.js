/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/slick/SlickObjectListDataPresenter", "lib/ui/list/ObjectListPresenterBase", "lib/ui/validation/ContextPartCarousel", "lib/ui/list/List", "lib/ui/pe/peObjectList", "xhtmpl!lib/ui/templates/peObjectList.hbs"], function (require, exports, core, SlickObjectListDataPresenter, ObjectListPresenterBase, ContextPartCarousel, List, peObjectList, peObjectListTemplate) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    /**
     * Base presenter for ObjectList based on SlickGrid.
     */
    var SlickObjectListPresenterBase = /** @class */ (function (_super) {
        __extends(SlickObjectListPresenterBase, _super);
        /**
         * @constructs SlickObjectListPresenterBase
         * @extends ObjectListPresenterBase
         * @param {Object} options
         */
        function SlickObjectListPresenterBase(options) {
            var _this = this;
            options = SlickObjectListPresenterBase.mixOptions(options, SlickObjectListPresenterBase.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        SlickObjectListPresenterBase.prototype.focusSync = function () {
            var that = this;
            if (!that.dataPresenter) {
                return;
            }
            var grid = that.dataPresenter.grid, gridElement = that.dataPresenter.gridElement;
            if (grid && gridElement && gridElement.is(":visible")) {
                grid.focus();
                // focus on the active cell if there are any rows in the grid
                if (!grid.getActiveCell()) {
                    if (grid.getSelectionModel()) {
                        // w/o selection model getSelectedRows throws
                        grid.setActiveCell(lang.last(grid.getSelectedRows()) || 0, 0);
                    }
                    else {
                        grid.setActiveCell(0, 0);
                    }
                }
            }
            else if (that.domElement) {
                // no rows - focus on the first button in menuRow
                that.$domElement.find(".x-list-menu-row-container :input:not(:disabled):visible:first").focus();
            }
        };
        SlickObjectListPresenterBase.prototype.scrollToSelf = function () {
            if (!this.dataPresenter) {
                return;
            }
            var grid = this.dataPresenter.grid;
            if (grid && grid.getDataLength()) {
                this.dataPresenter.scrollToSelf();
            }
            else {
                core.html.scrollToElement({ element: this.domElement, align: "center" });
            }
        };
        /**
         * Refresh specified items
         * @param items Items ot refresh. If not specified, then all items will be refreshed.
         */
        SlickObjectListPresenterBase.prototype.refreshItems = function (items) {
            this.dataPresenter.refreshItems(items);
        };
        SlickObjectListPresenterBase.defaultOptions = {
            DataPresenter: SlickObjectListDataPresenter,
            hasCheckboxes: true,
            cssClass: "x-list-slick"
        };
        __decorate([
            lang.decorators.constant(lang.debounce("focusSync", 100))
        ], SlickObjectListPresenterBase.prototype, "focus");
        return SlickObjectListPresenterBase;
    }(ObjectListPresenterBase));
    exports.SlickObjectListPresenterBase = SlickObjectListPresenterBase;
    // SlickObjectListPresenter: begin
    var SlickObjectListPresenter = /** @class */ (function (_super) {
        __extends(SlickObjectListPresenter, _super);
        /**
         * @constructs SlickObjectListPresenter
         * @extends ObjectListPresenterBase
         * @param {Object} options
         */
        function SlickObjectListPresenter(options) {
            var _this = this;
            options = SlickObjectListPresenter.mixOptions(options, SlickObjectListPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.partsCarousel = new ContextPartCarousel();
            _this.partsCarousel.bind("moved", function () {
                _this._activateViolation(_this.partsCarousel.currentViolation());
            });
            return _this;
        }
        SlickObjectListPresenter.prototype.setViewModel = function (list) {
            _super.prototype.setViewModel.call(this, list);
            var that = this;
            if (list.contextParts) {
                that.partsCarousel.items().source(list.contextParts);
                if (list.userSettings) {
                    list.userSettings.attach("contextParts", that.partsCarousel.userSettings);
                }
            }
            if (that.dataPresenter && that.dataPresenter.userSettings) {
                list.userSettings.attach("dataPresenter", that.dataPresenter.userSettings);
            }
            var gridOptions = that.options.gridOptions;
            if (gridOptions && !gridOptions.autoHeight && gridOptions.gridHeight)
                that.viewModel.fixedHeight = gridOptions.gridHeight;
        };
        SlickObjectListPresenter.prototype.dispose = function (options) {
            this.partsCarousel.dispose();
            _super.prototype.dispose.call(this, options);
        };
        SlickObjectListPresenter.prototype.beforeRender = function (domElement) {
            if (this.options.affixParts) {
                this.partsCarousel.initAffix(domElement, ".x-list-data-container");
            }
            _super.prototype.beforeRender.call(this, domElement);
        };
        SlickObjectListPresenter.prototype.afterRender = function () {
            var _this = this;
            _super.prototype.afterRender.call(this);
            var $element = this.$domElement;
            $element.on("click", ".x-context-part", function (e) {
                e.preventDefault();
                _this._activateViolation(_this.partsCarousel.currentViolation());
            });
        };
        SlickObjectListPresenter.prototype.activateContextParts = function () {
            this.partsCarousel.activate();
        };
        SlickObjectListPresenter.prototype._activateViolation = function (violation) {
            var that = this, list = that.viewModel.list();
            if (violation && violation.object) {
                list.activeItem(violation.object);
                // set active column in dataPresenter
                if (violation.props) {
                    var column = lang.find(list.columns, function (col) { return !col.hidden && col.prop && violation.props.indexOf(col.prop) >= 0; });
                    if (column) {
                        that.dataPresenter.setActiveColumn(column);
                    }
                }
                that.focus();
                that.scrollToSelf();
            }
        };
        SlickObjectListPresenter.defaultOptions = {
            affixHeader: true,
            affixParts: true
        };
        return SlickObjectListPresenter;
    }(SlickObjectListPresenterBase));
    exports.SlickObjectListPresenter = SlickObjectListPresenter;
    // Backward compatibility:
    SlickObjectListPresenter.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: SlickObjectListPresenter.defaultOptions
    });
    // SlickObjectListPresenter: end
    // peSlickObjectListPresenter: begin
    var peSlickObjectListPresenter = /** @class */ (function (_super) {
        __extends(peSlickObjectListPresenter, _super);
        /**
         * @constructs peSlickObjectListPresenter
         * @extends SlickObjectListPresenter
         * @param options
         */
        function peSlickObjectListPresenter(options) {
            var _this = this;
            options = peSlickObjectListPresenter.mixOptions(options, peSlickObjectListPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peSlickObjectListPresenter.prototype._initPaginator = function (list) {
            // do nothing, skip creation of paginator
        };
        peSlickObjectListPresenter.defaultOptions = {
            template: peObjectListTemplate,
            affixHeader: false,
            affixMenu: false,
            menuRowCssClass: "x-menu-bar",
            gridCssClass: "x-pe-object-list-grid",
            gridOptions: {
                autoHeight: false,
                gridHeight: 160
            },
            showTitle: false,
            templates: ["hint", "data", "menuRow"]
        };
        return peSlickObjectListPresenter;
    }(SlickObjectListPresenterBase));
    exports.peSlickObjectListPresenter = peSlickObjectListPresenter;
    // Backward compatibility:
    peSlickObjectListPresenter.mixin({
        /** @obsolete use static defaultOptions */
        defaultOptions: peSlickObjectListPresenter.defaultOptions
    });
    // peSlickObjectListPresenter: end
    core.ui.SlickObjectListPresenter = SlickObjectListPresenter;
    List.defaultOptions.Presenter = SlickObjectListPresenter;
    core.ui.peSlickObjectListPresenter = peSlickObjectListPresenter;
    peObjectList.defaultOptions.Presenter = peSlickObjectListPresenter;
});
//# sourceMappingURL=SlickObjectListPresenter.js.map