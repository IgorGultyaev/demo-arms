/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import domain = require(".domain");
import IDomainObject = domain.IDomainObject;
import DomainObject = domain.DomainObject;
import UnitOfWork = domain.UnitOfWork;
import LoadOptions = domain.LoadOptions;
import EntityMeta = domain.metadata.EntityMeta;
declare class NotLoadedObject extends lang.Observable implements IDomainObject {
    /**
     * @constant {Boolean}
     */
    isGhost: boolean;
    /**
     * @constant {Boolean}
     */
    isLoaded: boolean;
    meta: EntityMeta;
    id: string;
    uow: UnitOfWork;
    private _deferredLoad;
    /**
     * Representation of a not-loaded domain object with known identity.
     * @constructs NotLoadedObject
     * @extends Observable
     * @param meta
     * @param id
     */
    constructor(meta: EntityMeta, id: string);
    load(options?: LoadOptions): lang.Promise<DomainObject>;
    protected _doLoad(options?: LoadOptions): lang.Promise<DomainObject>;
    toString(): string;
}
export = NotLoadedObject;
