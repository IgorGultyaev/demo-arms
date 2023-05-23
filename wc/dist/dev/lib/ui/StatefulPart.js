/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "lib/core.lang", "lib/ui/Part"], function (require, exports, lang, Part) {
    "use strict";
    var StatefulPart = /** @class */ (function (_super) {
        __extends(StatefulPart, _super);
        /**
         * @constructs StatefulPart
         * @extends Part
         */
        function StatefulPart(options) {
            return _super.call(this, options) || this;
        }
        /**
         * Change part's state.
         * If part supports states this method SHOULD be called in response of user interaction (e.g in commands).
         * Also it's called by hosting Region/Area to apply a new state (as result of user navigation request) if the part is already activated.
         * Implementations SHOULD NOT replace this method, instead they SHOULD implement onStateChanged.
         * @param partOptions Part's state to be applied. State object can have arbitrary structure.
         * @param {Object} [options]
         * @param {Boolean} [options.disablePushState] If true there will be no "statechange" event generated,
         * i.e. no 'pushstate' done (in terms of AppStateManager). It's being used when AppStateManager applies a new state.
         * @returns {Boolean} true if the state was applied (event "statechange" was triggered unless disablePushState was specified), otherwise false
         */
        StatefulPart.prototype.changeState = function (partOptions /*Part.Options*/, options) {
            var that = this;
            if (!that.onStateChanged) {
                return;
            }
            var newState = that.getState(partOptions), statesEqual = that.compareStates(newState);
            if (!statesEqual) {
                options = options || {};
                if (that.onStateChanged(newState)) {
                    if (!options.disablePushState) {
                        that.reportState();
                    }
                    return true;
                }
            }
            return false;
        };
        /**
         * Method SHOULD be called by Part to report the fact that its state is changed.
         * @param {Boolean} [replaceState=false]
         * @fires StatefulPart#statechange
         */
        StatefulPart.prototype.reportState = function (replaceState) {
            var state = this.getState();
            /**
             * @event StatefulPart#statechange
             * @type {{Object, Object}}
             * @property {Part} state.part
             * @property {String} state._partUid part's id
             * @property {String} [state.title] part's title
             * @property {Object} [state.partOptions] part's state
             * @property {Boolean} [options.replaceState]
             */
            this.trigger("statechange", state, { replaceState: replaceState });
        };
        /**
         * Returns part current state (if `partOptions` is not specified).
         * Or extract part's state from part's options (if `partOptions` is specified).
         * @param {*} [partOptions] part's options to extract part's state
         * @returns {*}
         */
        StatefulPart.prototype.getState = function (partOptions) {
        };
        /**
         * Compares the current part's state and the new one.
         * @param {Object} newState A new part state
         * @returns {Boolean} true if states are equal
         */
        StatefulPart.prototype.compareStates = function (newState) {
            var oldState = this.getState();
            if (!oldState && !newState) {
                return true;
            }
            if ((oldState && !newState) || (!oldState && newState)) {
                return false;
            }
            return lang.isEqual(oldState, newState);
        };
        return StatefulPart;
    }(Part));
    (function (StatefulPart) {
    })(StatefulPart || (StatefulPart = {}));
    return StatefulPart;
});
//# sourceMappingURL=StatefulPart.js.map