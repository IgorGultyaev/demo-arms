/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "i18n!./nls/resources"], function (require, exports, core, resources) {
    "use strict";
    var traceSource = new core.diagnostics.TraceSource("app.drafts");
    var DraftManager = /** @class */ (function (_super) {
        __extends(DraftManager, _super);
        /**
         * @constructs DraftManager
         * @extends Observable
         * @param {Application} app
         */
        function DraftManager(app) {
            var _this = _super.call(this) || this;
            _this.app = app;
            try {
                _this._stack = _this._loadData() || [];
            }
            catch (e) {
                // не удалось восстановить, убъем
                traceSource.error("Error during restoring drafts from localStorage: " + e.message);
                traceSource.error(e);
                _this._stack = [];
                _this._saveData();
            }
            _this.count(_this._stack.length);
            _this._subscription = app.eventPublisher.subscribe(DraftManager.Event_CreateDraft, function (ev) {
                if (!ev.args) {
                    return;
                }
                var draft = core.lang.extend({}, ev.args);
                _this.addDraft(draft);
            });
            return _this;
        }
        DraftManager.prototype.getDrafts = function () {
            return this._stack;
        };
        DraftManager.prototype.addDraft = function (draft) {
            var that = this;
            if (!draft || !draft.title) {
                throw new Error("DraftManager.createDraft: expected draft object with action and title fields");
            }
            draft.created = new Date();
            that._stack.push(draft);
            that.count(that._stack.length);
            that._saveData();
            that.app.eventPublisher.publish("app.draftCreated", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.notification,
                priority: "normal",
                message: resources["drafts.draft_created"]
            }));
        };
        DraftManager.prototype.removeDraft = function (draft) {
            var that = this;
            core.lang.arrayRemove(that._stack, draft);
            that.count(that._stack.length);
            that._saveData();
            that._notify();
        };
        DraftManager.prototype.removeAllDrafts = function () {
            var that = this;
            that._stack = [];
            that.count(0);
            that._saveData();
            that._notify();
        };
        DraftManager.prototype.updateDraft = function (draft) {
            this._saveData();
            this._notify();
        };
        DraftManager.prototype.restoreDraft = function (draft) {
            var _this = this;
            var defer = this.app.stateManager.switchState(draft.appState);
            core.lang.when(defer).done(function () {
                _this.removeDraft(draft);
            });
        };
        DraftManager.prototype._loadData = function () {
            return core.localStorage.getObject("drafts") || [];
        };
        DraftManager.prototype._saveData = function () {
            core.localStorage.setObject("drafts", this._stack);
        };
        DraftManager.prototype._notify = function () {
            this.trigger("draftsChange", this);
        };
        DraftManager.prototype.dispose = function () {
            var that = this;
            if (that._subscription) {
                that._subscription.dispose();
                that._subscription = undefined;
            }
        };
        DraftManager.Event_CreateDraft = "app.createDraft";
        __decorate([
            core.lang.decorators.observableAccessor()
        ], DraftManager.prototype, "count");
        return DraftManager;
    }(core.lang.Observable));
    DraftManager.mixin({
        draftAppEvent: DraftManager.Event_CreateDraft
    });
    /**
     * @namespace core.drafts
     */
    core.drafts = core.drafts || { DraftManager: DraftManager };
    core.drafts.DraftManager = DraftManager;
    return DraftManager;
});
//# sourceMappingURL=DraftManager.js.map