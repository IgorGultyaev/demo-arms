/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import EditorPage = require("lib/ui/editor/EditorPage");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import lang = core.lang;
declare class EditorPageController extends lang.CoreClass implements EditorPage.IController {
    page: EditorPage;
    options: EditorPageController.Options[];
    viewModel: lang.Observable;
    private _dispoables;
    static is(value: any): value is EditorPage.IController;
    /**
     * @constructs EditorPageController
     * @example
     *  controller: [
     *      {
     *          onchange: "prop1",
     *          apply: [
     *              {
     *                  condition: {"equal": false},
     *                  disable: "prop2",
     *                  enable: "prop3",
     *                  else: {
     *                    enable: "prop2",
     *                    disable: "prop3",
     *                  }
     *              },
     *              {
     *                  condition: function(v) {return !v},
     *                  goto: "prop3.prop31.prop312"
     *              }
     *          ]
     *      }
     *  ]
     * @param {EditorPage} page EditorPage object
     * @param {Object} options
     */
    constructor(page: EditorPage, options: EditorPageController.Options[]);
    static behaviors: EditorPageController.KnownBehaviors;
    getPropertyEditor(value: string): PropertyEditor;
    start(page: EditorPage): void;
    /**
     *
     * @param beh behavior options
     * @param propValue Prop value
     * @param propName Prop name only for the case of "*" subscription
     * @private
     */
    protected _executeBehavior(beh: EditorPageController.Behavior, propValue: any, propName?: string): void;
    protected _executeCondition(condition: EditorPageController.Condition, propValue: any): boolean;
    protected _applyBehavior(beh: EditorPageController.Behavior, propValue: any, propName?: string): void;
    protected _callHandlerWithLoaded(handler: (val: any) => void, val: any, prop?: string): void;
    protected subscribe(onchangeExpr: string, handler: (val: any) => void, onchangeReason?: EditorPageController.OnChangeReasonFilter): any;
    protected checkReason(reason: lang.ObservableNotifyReason, reasonSpec: EditorPageController.OnChangeReasonFilter): boolean;
    stop(): void;
}
declare namespace EditorPageController {
    interface Options {
        /**
         * name or expression for a property, or "*" (execute apply for all props)
         */
        onchange: string;
        onchangeReason?: OnChangeReasonFilter;
        /**
         * execute apply on page start
         */
        onstart?: boolean;
        /**
         * Array of behaviors - what to do when onchange expression/prop is changed (on just on start if onstart=true)
         */
        apply: Behavior[];
    }
    type OnChangeReasonFilter = "*" | lang.ObservableNotifyReason | lang.ObservableNotifyReason[];
    interface Behavior {
        /**
         * Condition (object or callback) to check for executing the behavior
         */
        condition?: Condition | Function;
        /**
         * Contrary behavior to execute when condition was not satisfied (this nested behavior cannot contain condition/else)
         */
        "else"?: Behavior;
        /**
         * Any known behaviors to execute when condition was satisfied, see KnownBehaviors
         */
        [key: string]: any;
    }
    interface Condition {
        "equal"?: any;
        "equal-strict"?: any;
        "not-equal"?: any;
        "not-equal-strict"?: any;
    }
    interface KnownBehaviors extends lang.Map<Function> {
        disable?: Function;
        enable?: Function;
        hide?: Function;
        show?: Function;
        notnull?: Function;
        nullable?: Function;
        goto?: Function;
        goToNext?: Function;
        execute?: Function;
    }
}
export = EditorPageController;
