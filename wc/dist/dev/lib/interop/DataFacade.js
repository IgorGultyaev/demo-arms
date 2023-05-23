/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/interop/DataFacadeBase", "i18n!lib/nls/resources"], function (require, exports, core, DataFacadeBase, resources) {
    "use strict";
    var DataFacade = /** @class */ (function (_super) {
        __extends(DataFacade, _super);
        /**
         * @constructs DataFacade
         * @extends DataFacadeBase
         * @param {BackendInterop} interop
         * @param {EventPublisher} [eventPublisher]
         */
        function DataFacade(interop, eventPublisher) {
            return _super.call(this, interop, eventPublisher) || this;
        }
        DataFacade.prototype.load = function (query, options) {
            var that = this;
            options = options || {};
            query = that._normalizeQuery(query);
            return that._load(query, options)
                .done(function (response) {
                if (!response) {
                    return;
                }
                // уведомляем об обновлении данных
                var objects = that._objectsFromResponse(response, query);
                if (objects && objects.length) {
                    that._triggerUpdate(objects, options, "load");
                }
            })
                .fail(function (error) {
                that._handleInteropError("load", error, options);
            });
        };
        /**
         * Save objects.
         * @param {Array} objects domain objects in json-form (dto)
         * @param {Object} options Options
         * @param {*} [options.caller]
         * @param {String|Array} [options.hints] hints for passing to the server
         * @param {Boolean} [options.suppressEventOnError=false] Suppress event publishing on an error
         * @param {Boolean} [options.suppressEventOnSuccess=false] Suppress event publishing on success
         * @param {Boolean} [options.suppressProcessEvent=false] Suppress progress event publishing
         * @return {Promise} object for async operation of saving
         */
        DataFacade.prototype.save = function (objects, options) {
            var that = this, deferredOut = core.lang.Deferred();
            options = options || {};
            var promise = that._interop.save(objects, options)
                .done(function (response) {
                that._onSaveDone(objects, options, response);
                deferredOut.resolve(objects);
            })
                .fail(function (error) {
                that._onRemoteSaveError(objects, error, options, deferredOut);
            });
            if (!options.suppressProcessEvent) {
                that._publishEvent("interop.save", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.process,
                    priority: "normal",
                    message: resources.saving,
                    promise: promise
                }));
            }
            return deferredOut.promise();
        };
        DataFacade.prototype._onSaveDone = function (objects, options, response) {
            var that = this;
            that._updateSaved(objects, response);
            that._updateFromNewValues(objects);
            // уведомляем об изменении данных
            that._triggerUpdate(objects, options);
            if (!options.suppressEventOnSuccess) {
                that._publishEvent("interop.save.success", that.createSaveSuccessEvent(response));
            }
        };
        return DataFacade;
    }(DataFacadeBase));
    core.interop = core.interop || {};
    core.interop.DataFacade = DataFacade;
    return DataFacade;
});
//# sourceMappingURL=DataFacade.js.map