/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import MasterDetailPartBase = require("./MasterDetailPartBase");
import "xcss!lib/ui/styles/masterDetailPart";
import "vendor/splitter/jquery.splitter";
import "xcss!vendor/splitter/css/jquery.splitter";
import ObjectList = require("lib/ui/list/ObjectList");
import Options = MasterDetailPartList.Options;
import { PartCloseOptions } from ".ui";
import Application = core.Application;
declare class MasterDetailPartList extends MasterDetailPartBase<ObjectList, ObjectList> {
    static defaultOptions: Options;
    options: Options;
    constructor(app: Application, options?: Options);
    protected initMaster(): void;
    protected initDetail(): void;
    protected renderSplitter(domElement: JQuery | HTMLElement): void;
    protected onSplitterDrag(): void;
    _affixPaging(domElement: JQuery | HTMLElement): void;
    _removeAffixPaging(): void;
    unload(options?: PartCloseOptions): void;
}
declare namespace MasterDetailPartList {
    interface Options extends MasterDetailPartBase.Options<ObjectList, ObjectList> {
        affixMenu?: boolean;
        affixPaging?: boolean;
        bottomPaging?: boolean;
        hideMenuList?: boolean;
        hideMenuRow?: boolean;
        hideRowsStats?: boolean;
        menuListCssClass: string;
        menuRowCssClass: string;
        masterOptions?: ObjectList.Options;
        detailOptions?: ObjectList.Options;
    }
}
export = MasterDetailPartList;
