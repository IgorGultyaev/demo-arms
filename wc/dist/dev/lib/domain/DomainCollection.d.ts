/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import * as domain from ".domain";
import * as interop from "lib/interop/.interop";
import DomainObject = domain.DomainObject;
import UnitOfWork = domain.UnitOfWork;
import LoadOptions = domain.LoadOptions;
import INavigationPropSet = domain.INavigationPropSet;
/**
 * Loadable collection of DomainObjects. Can be used in peObjectList as a value of calculated property.
 */
declare class DomainCollection extends lang.ObservableCollection<DomainObject> implements INavigationPropSet {
    uow: UnitOfWork;
    options: DomainCollection.Options;
    entityType: string;
    isGhost: boolean;
    constructor(uow: UnitOfWork, options: DomainCollection.Options);
    isLoaded: boolean;
    load(options?: LoadOptions): lang.Promise<this>;
}
declare namespace DomainCollection {
    interface Options {
        entityType: string;
        params?: interop.LoadQueryParams;
    }
}
export = DomainCollection;
