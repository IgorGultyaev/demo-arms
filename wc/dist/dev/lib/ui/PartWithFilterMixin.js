/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core"], function (require, exports, core) {
    "use strict";
    var lang = core.lang;
    /**
     * @exports PartWithFilterMixin
     */
    var PartWithFilterMixin = /** @class */ (function () {
        function PartWithFilterMixin() {
        }
        PartWithFilterMixin.prototype.getFilterPart = function () {
            return this.filter;
        };
        PartWithFilterMixin.prototype.initFilter = function (options, userSettings) {
            var that = this;
            var filterOption = options.filter;
            if (filterOption) {
                if (filterOption.getRestrictions) {
                    that.filter = filterOption;
                }
                else {
                    if (typeof filterOption === "string") {
                        // part name with optional part's options
                        that.filter = core.createPart(filterOption, options.filterOptions);
                    }
                    else if (lang.isFunction(filterOption)) {
                        // factory
                        that.filter = filterOption(that);
                    }
                    else {
                        that.filter = new core.ui.ObjectFilter(filterOption);
                    }
                    that._filterOwned = true;
                    if (!that.filter.getRestrictions) {
                        console.error("Supplied filter has no mandatory method getRestrictions");
                        that.filter = null;
                    }
                }
                if (that.filter) {
                    that.filterExpanded(!!options.filterExpanded);
                    if (userSettings) {
                        userSettings.bindToProp(that, "filterExpanded");
                        if (that.filter.userSettings) {
                            userSettings.attach("filter", that.filter.userSettings);
                        }
                    }
                }
            }
        };
        PartWithFilterMixin.prototype.notifyFilterApplied = function (restrictions) {
            var that = this, filterApplied;
            if (!that.filter)
                return;
            if (that.filter.isEmpty) {
                filterApplied = !that.filter.isEmpty();
            }
            else {
                filterApplied = !lang.isEmptyObject(restrictions);
            }
            var menu = that[that._fieldWithFilterMenu];
            if (menu) {
                var menuItem = menu.getItem("ClearFilter");
                if (menuItem) {
                    menuItem.cssClass = filterApplied ? "x-menu-item-badge-warning" : "";
                    // notify that property with menu was changed
                    that.changed(that._fieldWithFilterMenu);
                }
            }
        };
        /**
         * Collect restrictions from filter
         * @returns {Object|null} Result of this.filter.getRestrictions() or null to cancel loading
         * @protected
         */
        PartWithFilterMixin.prototype.getFilterRestrictions = function () {
            var that = this, params, errMsg;
            try {
                params = (that.filter && that.filter.getRestrictions()) || {};
                that.notifyFilterApplied(params);
                return params;
            }
            catch (e) {
                // can filter show violations?
                if (that.filter.canDisplayViolations) {
                    that.filterExpanded(true);
                }
                else {
                    errMsg = e.message;
                    if (e.violations && e.violations.length) {
                        errMsg = "<ul>" +
                            e.violations.map(function (v) { return "<li>" + v.error + "</li>"; }).join("") +
                            "</ul>";
                    }
                    // show all errors by a hint
                    that.showFilterError(errMsg);
                    //that.hintMessage(resources["objectList.getRestrictionsError"] + errMsg);
                }
            }
            return null; // cancel loading
        };
        PartWithFilterMixin.prototype.disposeFilter = function () {
            var filter = this.filter;
            if (this._filterOwned && filter && filter.dispose) {
                filter.dispose();
            }
        };
        __decorate([
            lang.decorators.observableAccessor({ init: false })
        ], PartWithFilterMixin.prototype, "filterExpanded");
        return PartWithFilterMixin;
    }());
    return PartWithFilterMixin;
});
//# sourceMappingURL=PartWithFilterMixin.js.map