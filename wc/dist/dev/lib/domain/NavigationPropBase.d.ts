/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import domain = require(".domain");
import DomainObject = domain.DomainObject;
import PropertyMeta = domain.metadata.PropertyMeta;
declare class NavigationPropBase extends lang.Observable {
    protected _parent: DomainObject;
    protected _propMeta: PropertyMeta;
    /**
     * @constructs NavigationPropBase
     * @extends Observable
     */
    constructor(parent: DomainObject, propMeta: PropertyMeta);
}
export = NavigationPropBase;
