/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import ReportPresenterBase = require("./ReportPresenterBase");
import "lib/ui/ExpandablePanel";
declare class ReportPartPresenter extends ReportPresenterBase {
    static defaultOptions: ReportPartPresenter.Options;
    /**
     * @constructs ReportPartPresenter
     * @extends ReportPresenterBase
     */
    constructor(options: ReportPartPresenter.Options);
}
declare namespace ReportPartPresenter {
    interface Options extends ReportPresenterBase.Options {
    }
}
export = ReportPartPresenter;
