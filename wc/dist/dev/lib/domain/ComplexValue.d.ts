/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as DomainObject from "lib/domain/DomainObject";
import { GetPropOptions, metadata, SetPropOptions } from "lib/domain/.domain";
import ComplexPropertyMeta = metadata.ComplexPropertyMeta;
/**
 * The value of the complex property
 */
declare class ComplexValue {
    readonly parent: DomainObject;
    readonly propMeta: ComplexPropertyMeta;
    constructor(parent: DomainObject, propMeta: ComplexPropertyMeta);
    get(propName: string, options?: GetPropOptions): any;
    set(propName: string, propValue: any, options?: SetPropOptions): void;
    protected getParentPropName(propName: string): string;
}
export = ComplexValue;
