/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/Part"], function (require, exports, $, core, Part) {
    "use strict";
    var ObjectDetails = /** @class */ (function (_super) {
        __extends(ObjectDetails, _super);
        /**
         * @deprecated
         * @constructs ObjectDetails
         * @param options
         */
        function ObjectDetails(options) {
            var _this = _super.call(this) || this;
            options = options || {};
            _this.viewModel = options.viewModel;
            return _this;
        }
        ObjectDetails.prototype.doRender = function (domElement) {
            _super.prototype.doRender.call(this, domElement);
            var that = this, html = "", obj = that.viewModel, propName, prop, propValue;
            if (!obj) {
                html = "<span class='label label-default'>You need to select object</span>";
            }
            else {
                html += "<dl>";
                for (propName in obj.meta.props) {
                    prop = obj.meta.props[propName];
                    if (prop.vt === "object") {
                        if (prop.many) {
                            propValue = "<button id='btnLoad' data-prop='" + prop.name + "'>load</button>";
                        }
                        else {
                            propValue = obj.get(prop.name);
                            propValue = propValue ? propValue.toString() : "";
                        }
                    }
                    else {
                        propValue = obj.get(prop.name);
                    }
                    html += "<dt>" + prop.descr + " </dt>";
                    html += "<dd>" + propValue + "</dd>";
                }
                html += "</dl>";
            }
            that.$domElement.empty();
            $(html).appendTo(that.$domElement);
            $("#btnLoad").on("click", function (e) {
                e.preventDefault();
                var source = this, propName = $(this).attr("data-prop");
                obj.get(propName).load().then(function (propValue) {
                    source.disabled = true;
                    try {
                        $(source).replaceWith("<dd>Count: " + propValue.count() + "</dd>");
                    }
                    catch (ex) {
                        $(source).replaceWith("<dd>Error on prop loading: " + ex.message + "</dd>");
                    }
                });
            });
        };
        ObjectDetails.prototype.setViewModel = function (viewModel) {
            this.viewModel = viewModel;
            if (this.domElement) {
                this.rerender();
            }
        };
        return ObjectDetails;
    }(Part));
    core.ui.ObjectDetails = ObjectDetails;
    return ObjectDetails;
});
//# sourceMappingURL=ObjectDetails.js.map