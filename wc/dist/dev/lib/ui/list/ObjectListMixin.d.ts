/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Menu = require("lib/ui/menu/Menu");
import ListCommonMixin from "lib/ui/list/ListCommonMixin";
import lang = core.lang;
import { DomainObject } from "lib/domain/.domain";
declare abstract class ObjectListMixin extends ListCommonMixin<DomainObject> {
    options: ObjectListMixin.Options;
    protected _isObjectOperable(obj: DomainObject): boolean;
    protected _deleteObjects(objects?: DomainObject[]): void;
    doDeleteObjects(objects?: DomainObject[]): void;
    protected getOperationConfirmation(op: "delete" | "unlink", objects: DomainObject[], selection: DomainObject[], activeObj: DomainObject): lang.Promisable<ObjectListMixin.ConfirmationRequest>;
    protected abstract getMessage(resources: lang.Map<string>, op: string, mod: string): string;
    protected abstract executeDelete(objects?: DomainObject[]): void;
}
declare namespace ObjectListMixin {
    interface Options extends ListCommonMixin.Options {
        confirmDelete?: <T>(confirmation: ConfirmationRequest, objects: DomainObject[], selection: DomainObject[], activeObj: DomainObject) => lang.Promisable<ConfirmationRequest>;
        confirmUnlink?: <T>(confirmation: ConfirmationRequest, objects: DomainObject[], selection: DomainObject[], activeObj: DomainObject) => lang.Promisable<ConfirmationRequest>;
    }
    interface ConfirmationRequest {
        /**
         * Header for ConfirmDialog
         */
        header?: string;
        /**
         * Text for ConfirmDialog, if empty no dialog will be shown
         */
        text?: string;
        /**
         * Optional menu for ConfirmDialog, be default (Yes/No)
         */
        menu?: Menu.Options;
        /**
         * Can contain an array of objects to delete silently (if text is empty)
         */
        objects?: DomainObject[];
    }
}
export = ObjectListMixin;
