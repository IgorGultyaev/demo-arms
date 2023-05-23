/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "xcss!lib/ui/styles/masterDetailPart", "vendor/splitter/jquery.splitter", "xcss!vendor/splitter/css/jquery.splitter"], function (require, exports, core, View) {
    "use strict";
    var lang = core.lang;
    var MasterDetailPartBase = /** @class */ (function (_super) {
        __extends(MasterDetailPartBase, _super);
        function MasterDetailPartBase(app, options) {
            var _this = this;
            options = MasterDetailPartBase.mixOptions(options, MasterDetailPartBase.defaultOptions);
            if (options.disableResize) {
                options.splitOptions.limit = "disable";
            }
            _this = _super.call(this, options) || this;
            _this.app = app;
            _this.eventPublisher = app.eventPublisher;
            _this.initMaster();
            _this.initDetail();
            _this.initBinding();
            _this.initUserSettings();
            return _this;
        }
        MasterDetailPartBase.prototype.initUserSettings = function () {
            this.userSettings = core.UserSettings.create(this.options.userSettings);
            if (this.options.storeSplitPosition) {
                this.userSettings.bindToProp(this, "splitPosition");
            }
            if (this.masterPart.userSettings) {
                this.userSettings.attach("masterPart", this.masterPart.userSettings);
            }
            if (this.detailPart.userSettings) {
                this.userSettings.attach("detailPart", this.detailPart.userSettings);
            }
        };
        MasterDetailPartBase.prototype.initMaster = function () {
            this.masterPart = lang.isFunction(this.options.masterPart) ? this.options.masterPart.call(this) : this.options.masterPart;
            if (!!this.masterPart)
                this.registerChild(this.masterPart, { keepOnUnload: true, trackStatus: true });
        };
        MasterDetailPartBase.prototype.initDetail = function () {
            this.detailPart = lang.isFunction(this.options.detailPart) ? this.options.detailPart.call(this) : this.options.detailPart;
            if (!!this.detailPart)
                this.registerChild(this.detailPart, { keepOnUnload: true, trackStatus: true });
        };
        MasterDetailPartBase.prototype.initBinding = function () {
            if (this.options.bindParts) {
                this.options.bindParts.call(this);
            }
        };
        MasterDetailPartBase.prototype.onSplitterDrag = function () {
            var that = this;
            that.splitPosition(that._splitterObject.position());
            if (that.options.splitOptions && that.options.splitOptions.onDragged) {
                that.options.splitOptions.onDragged.call(that);
            }
        };
        MasterDetailPartBase.prototype.doRender = function (domElement) {
            var that = this;
            _super.prototype.doRender.call(this, domElement);
            that.renderSplitter(domElement);
            if (!that.options.disableResize && that.options.storeSplitPosition && that.splitPosition()) {
                that._splitterObject.position(that.splitPosition());
                that.onSplitterDrag();
            }
        };
        MasterDetailPartBase.prototype.renderSplitter = function (domElement) {
            var that = this, opts = core.lang.extend(that.options.disableResize ? {} : {
                onDragEnd: function (e) {
                    that.onSplitterDrag();
                }
            }, that.options.splitOptions);
            that._splitterObject = $(domElement).find(".x-split").height(that.options.height).split(opts);
        };
        MasterDetailPartBase.prototype.unload = function (options) {
            var that = this;
            if (that._splitterObject) {
                that._splitterObject.destroy();
                delete that._splitterObject;
            }
            _super.prototype.unload.call(this, options);
        };
        MasterDetailPartBase.defaultOptions = {
            template: undefined,
            height: 500,
            storeSplitPosition: true,
            disableResize: false,
            splitOptions: {
                orientation: "vertical",
                limit: 200,
                position: "50%",
                onDragged: undefined
            },
            bindParts: undefined,
            masterPart: undefined,
            detailPart: undefined,
            userSettings: {
                props: {
                    "splitPosition": true
                }
            }
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], MasterDetailPartBase.prototype, "splitPosition");
        return MasterDetailPartBase;
    }(View));
    MasterDetailPartBase.mixin(/** @lends MasterDetailPartBase.prototype */ {
        defaultOptions: MasterDetailPartBase.defaultOptions
    });
    core.ui.MasterDetailPartBase = MasterDetailPartBase;
    return MasterDetailPartBase;
});
//# sourceMappingURL=MasterDetailPartBase.js.map