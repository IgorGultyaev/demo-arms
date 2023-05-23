/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import lang = core.lang;
import IFilterPart = core.ui.IFilterPart;
import { IUserSettings } from "lib/.core";
interface PartWithFilterMixin extends lang.Observable {
}
/**
 * @exports PartWithFilterMixin
 */
declare abstract class PartWithFilterMixin {
    protected filter: IFilterPart;
    protected _fieldWithFilterMenu: string;
    protected _filterOwned: boolean;
    getFilterPart(): IFilterPart;
    /**
     * @observable-property {Boolean}
     */
    filterExpanded: lang.ObservableProperty<boolean>;
    protected initFilter(options: PartWithFilterMixin.Options, userSettings: IUserSettings): void;
    protected notifyFilterApplied(restrictions: any): void;
    /**
     * Collect restrictions from filter
     * @returns {Object|null} Result of this.filter.getRestrictions() or null to cancel loading
     * @protected
     */
    protected getFilterRestrictions(): any;
    protected abstract showFilterError(error: string): void;
    protected disposeFilter(): void;
}
declare namespace PartWithFilterMixin {
    interface Options {
        filter?: IFilterPart | string | lang.Map<any> | ((parent: any) => IFilterPart);
        filterOptions?: lang.Map<any>;
        filterExpanded?: boolean;
        filterCollapsable?: boolean;
        expandFilterTitle?: string;
        collapseFilterTitle?: string;
    }
}
export = PartWithFilterMixin;
