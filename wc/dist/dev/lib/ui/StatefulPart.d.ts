/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Part = require("lib/ui/Part");
import ui = require("lib/ui/.ui");
declare class StatefulPart extends Part implements ui.IStatefulPart {
    /**
     * @constructs StatefulPart
     * @extends Part
     */
    constructor(options?: Part.Options);
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
    changeState(partOptions: any, options?: StatefulPart.ChangeStateOptions): boolean;
    /**
     * Method SHOULD be called by Part to report the fact that its state is changed.
     * @param {Boolean} [replaceState=false]
     * @fires StatefulPart#statechange
     */
    reportState(replaceState?: boolean): void;
    /**
     * Returns part current state (if `partOptions` is not specified).
     * Or extract part's state from part's options (if `partOptions` is specified).
     * @param {*} [partOptions] part's options to extract part's state
     * @returns {*}
     */
    getState(partOptions?: Part.Options): any;
    /**
     * Compares the current part's state and the new one.
     * @param {Object} newState A new part state
     * @returns {Boolean} true if states are equal
     */
    compareStates(newState: any): boolean;
    /**
    This method SHOULD be implemented by derived classes:
     @return {boolean} true if the state was applied and the part changed its state.
    */
    protected onStateChanged?(state?: any): boolean;
}
declare namespace StatefulPart {
    export import ChangeStateOptions = ui.PartChangeStateOptions;
}
export = StatefulPart;
