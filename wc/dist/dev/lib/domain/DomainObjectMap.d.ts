/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import domain = require(".domain");
import IDomainObject = domain.IDomainObject;
import IDomainModel = domain.IDomainModel;
import EntityNameTerm = domain.EntityNameTerm;
declare class DomainObjectMap<T> {
    private _model;
    private _map;
    /**
     * Словарь, отображающий доменные объекты на значения произвольного типа
     * @constructs DomainObjectMap
     */
    constructor(model: IDomainModel);
    add(obj: IDomainObject, value: T): void;
    remove(obj: IDomainObject): boolean;
    find(entityType: EntityNameTerm, id: string): T;
    findObj(obj: IDomainObject): T;
    get(entityType: EntityNameTerm, id: string, defaultValue?: T): T;
    select(entityType: EntityNameTerm): T[];
    forEach(callback: (v: T, type: string, id: string) => void, context?: any): void;
    some(callback: (v: T, type: string, id: string) => boolean, context?: any): boolean;
    all(): T[];
    private _getKey(obj);
    private _getTypeKey(entityType);
    private _getRoot(entityMeta);
}
export = DomainObjectMap;
