/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import * as lang from "lib/core.lang";
declare class PanelResizer extends core.ui.Part {
    divider: JQuery;
    topPanel: JQuery;
    bottomPanel: JQuery;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    divideView(fromTop: any, win: any): void;
    unload(): void;
}
export = PanelResizer;
