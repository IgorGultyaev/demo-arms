/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as $ from "jquery";
import "xcss!lib/ui/styles/core.jquery";
declare global  {
    interface JQuery {
        smartresize(fn?: (e: JQueryEventObject) => any): JQuery;
        buttonClick(handler: (e: JQueryEventObject) => any): JQuery;
        blocked(blocked?: boolean): JQuery;
        within(container: JQuery | HTMLElement, position?: {
            top: number;
            left: number;
        }): JQuery;
        textOverflow(): JQuery;
        stopBubbling(): JQuery;
        stopKeyboardBubbling(): JQuery;
    }
}
export = $;
