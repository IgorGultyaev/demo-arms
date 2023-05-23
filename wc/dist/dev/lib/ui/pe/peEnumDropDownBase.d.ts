/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peEnumBase = require("lib/ui/pe/peEnumBase");
import lang = core.lang;
declare class peEnumDropDownBase extends peEnumBase {
    static defaultOptions: peEnumDropDownBase.Options;
    options: peEnumDropDownBase.Options;
    select: JQuery;
    protected _tabIndex: number;
    /**
     * @constructs peEnumDropDownBase
     * @extends peEnumBase
     * @param options
     */
    constructor(options: peEnumDropDownBase.Options);
    protected tweakOptions(options: peEnumDropDownBase.Options): void;
    protected _renderSelect(domElement: JQuery): JQuery;
    protected _renderOptions(select: any): void;
    render(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _getFlagsValue(): number;
    protected _setFlagsValue(v: number): void;
    protected _setWidth(): void;
    protected _onDisabledChange(disabled: boolean): void;
    tabIndex(index: any): void;
    protected _setTabIndex(index: any): void;
}
declare namespace peEnumDropDownBase {
    interface Options extends peEnumBase.Options {
        noResultsText?: string;
        placeholder?: string;
        dropDownCssClass?: string;
    }
}
export = peEnumDropDownBase;
