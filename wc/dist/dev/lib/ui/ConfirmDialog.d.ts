/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Menu = require("lib/ui/menu/Menu");
import Dialog = require("lib/ui/Dialog");
import Options = Dialog.Options;
declare class ConfirmDialog extends Dialog {
    static defaultMenu: Menu.Options;
    /**
     * Dialog with default menu consisting of two items: "yes" and "no".
     * @constructs ConfirmDialog
     * @extends Dialog
     * @param {Object} options
     */
    constructor(options: Options);
    getHeader(): string;
    protected createMenuDefaults(): Menu.Options;
}
export = ConfirmDialog;
