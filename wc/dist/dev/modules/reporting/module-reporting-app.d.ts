/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import moduleBreadcrumbs = require("modules/breadcrumbs/module-breadcrumbs");
import * as composition from "lib/core.composition";
export declare class Application extends core.Application {
    static breadcrumbsConfig: moduleBreadcrumbs.BreadcrumbsOptions;
    pageModel: Application.ReportModel;
    /**
     * constructs Application
     * @extends Application
     * @article [App-Module](docs:app-module)
     * @param {XConfig} xconfig
     * @param {Object} reportModel
     */
    constructor(xconfig: XConfig, reportModel: Application.ReportModel);
    initialize(): void;
    onUnknownArea(areaName: string): composition.Area;
}
export declare namespace Application {
    interface ReportModel {
        reportName: string;
        reports: [{
            name: string;
            title?: string;
        }];
    }
}
