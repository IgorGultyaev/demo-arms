/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import peDropDownLookup = require("lib/ui/pe/peDropDownLookup");
import PropertyEditorLookup = require("lib/ui/pe/PropertyEditorLookup");
import formatters = require("lib/formatters");
import "xcss!lib/ui/styles/peObjectDropDownLookup";
import * as domain from "lib/domain/.domain";
import DomainObject = domain.DomainObject;
import IDataProvider = peDropDownLookup.IDataProvider;
declare class peObjectDropDownLookup extends peDropDownLookup {
    static defaultOptions: peObjectDropDownLookup.Options;
    options: peObjectDropDownLookup.Options;
    viewModel: DomainObject;
    dataProvider: IDataProvider<DomainObject, any>;
    /**
     * @constructs peObjectDropDownLookup
     * @extends peDropDownLookup
     * @param options
     */
    constructor(options?: peObjectDropDownLookup.Options);
    protected createDataProvider(): IDataProvider<DomainObject, any>;
}
interface peObjectDropDownLookup {
    value(v: DomainObject): void;
    value(): DomainObject;
}
declare namespace peObjectDropDownLookup {
    interface JsonAdapter {
        getPresentation(jsonItem: any): string | formatters.SafeHtml;
        getId(jsonItem: any): string;
    }
    interface Options extends peDropDownLookup.Options, PropertyEditorLookup.AdapterOptions {
    }
}
export = peObjectDropDownLookup;
