/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import "xcss!lib/ui/styles/masterDetailPart";
import "vendor/splitter/jquery.splitter";
import "xcss!vendor/splitter/css/jquery.splitter";
import Options = MasterDetailPartBase.Options;
import lang = core.lang;
import { IPart, PartCloseOptions } from ".ui";
import Application = core.Application;
declare abstract class MasterDetailPartBase<TMaster extends IPart, TDetail extends IPart> extends View {
    static defaultOptions: Options<IPart, IPart>;
    options: Options<TMaster, TDetail>;
    eventPublisher: core.IEventPublisher;
    app: Application;
    masterPart: TMaster;
    detailPart: TDetail;
    _splitterObject: any;
    splitPosition: lang.ObservableProperty<string>;
    constructor(app: Application, options?: Options<TMaster, TDetail>);
    protected initUserSettings(): void;
    protected initMaster(): void;
    protected initDetail(): void;
    protected initBinding(): void;
    protected onSplitterDrag(): void;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected renderSplitter(domElement: JQuery | HTMLElement): void;
    unload(options?: PartCloseOptions): void;
}
declare namespace MasterDetailPartBase {
    interface SplitOptions<TMaster extends IPart, TDetail extends IPart> {
        orientation?: "vertical" | "horizontal";
        /**
         * Limit minimum size of blocks
         * ex: number 200, or object {leftUpper: 150, rightBottom: 150}
         */
        limit?: number | object;
        /**
         * splitter position, e.g. '50%'
         */
        position?: string;
        /**
         * called when splitter has been dragged
         */
        onDragged?: (this: MasterDetailPartBase<TMaster, TDetail>) => void;
    }
    interface Options<TMaster extends IPart, TDetail extends IPart> extends View.Options {
        height?: number | string;
        /**
         * true to store position in user settings
         */
        storeSplitPosition?: boolean;
        disableResize?: boolean;
        splitOptions?: SplitOptions<TMaster, TDetail>;
        bindParts?: (this: MasterDetailPartBase<TMaster, TDetail>) => void;
        masterPart?: TMaster | ((this: MasterDetailPartBase<TMaster, TDetail>) => TMaster);
        detailPart?: TDetail | ((this: MasterDetailPartBase<TMaster, TDetail>) => TDetail);
    }
}
export = MasterDetailPartBase;
