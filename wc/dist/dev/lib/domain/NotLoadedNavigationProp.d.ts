/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import NavigationPropBase = require("./NavigationPropBase");
import domain = require(".domain");
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
import LoadOptions = domain.LoadOptions;
import IDomainObject = domain.IDomainObject;
import INavigationPropSet = domain.INavigationPropSet;
declare class NotLoadedNavigationProp extends NavigationPropBase {
    private _deferredLoad;
    isLoaded: boolean;
    isGhost: boolean;
    /**
     * Результат обращения к незагруженному скалярному навигируемому свойству.
     * @constructs NotLoadedNavigationProp
     * @extends NavigationPropBase
     * @param {DomainObject} parent
     * @param propMeta
     */
    constructor(parent: DomainObject, propMeta: PropertyMeta);
    /**
     *
     * @param {Object} [options]
     * @param {Boolean} [options.idsOnly] do not load all value objects (by default they are loaded)
     * @param {Boolean} [options.reload] force loading even if all data is already loaded
     * @param {String} [options.preloads] Preloads (will be passed to server controller)
     * @param {Object} [options.params] Params (will be passed to server controller)
     * @param {Object} [options.interop] Advanced options for DataFacade.load
     * @returns {Promise} DomainObject (for scalar) or NavigationPropSet (for set)
     */
    load(options?: LoadOptions): lang.Promise<INavigationPropSet | IDomainObject>;
    protected _doLoad(options?: LoadOptions): lang.Promise<INavigationPropSet | IDomainObject>;
    /**
     * @deprecated Use `load` method instead
     */
    loadItems(options?: LoadOptions): lang.Promise<INavigationPropSet | IDomainObject>;
    toString(): string;
}
export = NotLoadedNavigationProp;
