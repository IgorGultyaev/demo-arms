/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Menu = require("lib/ui/menu/Menu");
import ObjectEditor = require("lib/ui/editor/ObjectEditor");
import { SafeHtml } from "lib/formatters";
import { ViolationSeverity } from "lib/validation";
declare class ViolationInfoPart extends View {
    static defaultOptions: ViolationInfoPart.Options;
    /**
     * @observable-property {String}
     */
    message: core.lang.ObservableProperty<string | SafeHtml>;
    severity: ViolationSeverity;
    menu: Menu;
    violation: ObjectEditor.Violation;
    persistent?: boolean;
    /**
     * class for object editor info
     * @constructs ViolationInfoPart
     * @extends View
     * @param {Object} options
     * @param {String|SafeHtml} options.message
     * @param {Number} options.severity
     * @param {String} options.menu
     */
    constructor(options: ViolationInfoPart.Options);
    protected doRender(domElement: JQuery): void;
}
declare namespace ViolationInfoPart {
    interface Options extends View.Options {
        message?: string | SafeHtml;
        severity?: ViolationSeverity;
        /**
         * true means do not remove part on violations collection rebuild
         */
        persistent?: boolean;
        menu?: Menu;
    }
}
export = ViolationInfoPart;
