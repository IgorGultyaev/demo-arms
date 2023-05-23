/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/list/ObjectListPresenterBase"], function (require, exports, core, ObjectListPresenterBase) {
    "use strict";
    var View = core.ui.View;
    var SimpleObjectListPresenter = /** @class */ (function (_super) {
        __extends(SimpleObjectListPresenter, _super);
        /**
         * @class SimpleObjectListPresenter
         * @extends ObjectListPresenterBase
         * @param {Object} options
         */
        function SimpleObjectListPresenter(options) {
            var _this = this;
            options = SimpleObjectListPresenter.mixOptions(options, SimpleObjectListPresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        SimpleObjectListPresenter.prototype._dataPresenterOptions = function () {
            var that = this, dataOptions = _super.prototype._dataPresenterOptions.call(this);
            // dataTemplate --> template
            dataOptions.template = that.options.dataTemplate;
            delete dataOptions["dataTemplate"];
            return dataOptions;
        };
        SimpleObjectListPresenter.defaultOptions = {
            DataPresenter: View,
            dataTemplate: undefined,
            cssClass: ""
        };
        return SimpleObjectListPresenter;
    }(ObjectListPresenterBase));
    // Backward compatibility
    SimpleObjectListPresenter.mixin({
        defaultOptions: SimpleObjectListPresenter.defaultOptions
    });
    core.ui.SimpleObjectListPresenter = SimpleObjectListPresenter;
    return SimpleObjectListPresenter;
});
//# sourceMappingURL=SimpleObjectListPresenter.js.map