/// <reference path="core.all.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import ReportPartBase = require("./ui/ReportPartBase");
import ReportPagePart = require("./ui/ReportPagePart");
import ReportPagePartPresenter = require("./ui/ReportPagePartPresenter");
import ReportPart = require("./ui/ReportPart");
import ReportPartPresenter = require("./ui/ReportPartPresenter");
import ReportPresenterBase = require("./ui/ReportPresenterBase");
declare let reporting: {
    Application: any;
    ReportPartBase: typeof ReportPartBase;
    ReportPart: typeof ReportPart;
    ReportPagePart: typeof ReportPagePart;
    ReportPresenterBase: typeof ReportPresenterBase;
    ReportPagePartPresenter: typeof ReportPagePartPresenter;
    ReportPartPresenter: typeof ReportPartPresenter;
};
export = reporting;
