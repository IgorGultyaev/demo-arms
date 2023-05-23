/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import ReportPartBase = require("./ReportPartBase");
import "xcss!./styles/reportPart";
import "xcss!./styles/reportStyles";
import lang = core.lang;
import { PartCloseOptions } from "lib/ui/.ui";
declare class ReportPresenterBase extends View {
    static defaultOptions: ReportPresenterBase.Options;
    options: ReportPresenterBase.Options;
    viewModel: ReportPartBase;
    private $thead;
    private _onDocKeyup;
    /**
     * @constructs ReportPresenterBase
     * @extends View
     * @param {Object} options
     */
    constructor(options: ReportPresenterBase.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected onReady(): void;
    stateSeverity(): string;
    unload(options?: PartCloseOptions): void;
}
declare namespace ReportPresenterBase {
    interface Options extends View.Options {
        affixTableHeader?: boolean;
        bound?: boolean;
    }
}
export = ReportPresenterBase;
