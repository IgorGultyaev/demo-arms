/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peEnumDropDownBase = require("lib/ui/pe/peEnumDropDownBase");
import Select2 = require("vendor/select2/select2");
import "xcss!vendor/select2/content/select2";
import "xcss!lib/ui/styles/peEnum";
import "xcss!lib/ui/styles/peEnumDropDownSelect2";
import lang = core.lang;
import { Part } from "core.ui";
declare class peEnumDropDownSelect2 extends peEnumDropDownBase {
    static defaultOptions: peEnumDropDownSelect2.Options;
    static contextDefaultOptions: lang.Map<peEnumDropDownSelect2.Options>;
    options: peEnumDropDownSelect2.Options;
    select2: Select2;
    /**
     * @constructs peEnumDropDownSelect2
     * @extends peEnumDropDownBase
     * @param options
     */
    constructor(options: peEnumDropDownSelect2.Options);
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    getSelectOptions(modalParent: JQuery): Select2.Options;
    protected addDropdownAdapter(options: Select2.Options): Select2.Options;
    focus(): void;
    protected _setWidth(): void;
    protected _onDisabledChange(disabled: boolean): void;
    protected _renderError(error: any, element: any): void;
    unload(options?: Part.CloseOptions): void;
}
declare namespace peEnumDropDownSelect2 {
    interface Options extends peEnumDropDownBase.Options {
        dropdownAutoWidth?: boolean;
        hideSearch?: boolean;
        minimumResultsForSearch?: number;
        dropdownPosition?: "inplace" | "absolute";
        closeOnSelect?: boolean;
        select2?: Select2.Options;
    }
}
export = peEnumDropDownSelect2;
