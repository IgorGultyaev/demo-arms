/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import ReportPresenterBase = require("./ReportPresenterBase");
import "lib/ui/menu/MenuPresenter";
import { PartCloseOptions } from "lib/ui/.ui";
declare class ReportPagePartPresenter extends ReportPresenterBase {
    static defaultOptions: ReportPagePartPresenter.Options;
    private $navbar;
    /**
     * @constructs ReportPagePartPresenter
     * @extends ReportPresenterBase
     */
    constructor(options: ReportPagePartPresenter.Options);
    protected onReady(): void;
    unload(options?: PartCloseOptions): void;
}
declare namespace ReportPagePartPresenter {
    interface Options extends ReportPresenterBase.Options {
    }
}
export = ReportPagePartPresenter;
