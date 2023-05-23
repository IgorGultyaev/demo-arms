/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import BackendInterop = require("lib/interop/BackendInteropReal");
import "vendor/jquery.mockjax";
import { IBackendInterop, CheckConnectionResult, DomainObjectData, AjaxSettings, AjaxOptions, LoadQuery, SaveOptions } from ".interop";
import lang = core.lang;
import Deferred = lang.Deferred;
import { IDomainModel, metadata } from "lib/domain/.domain";
declare class BackendInteropMock extends BackendInterop implements IBackendInterop {
    model: IDomainModel;
    db: lang.Map<any>;
    constructor(xconfig: XConfig, model: IDomainModel);
    getObjects(type: string, options?: any): any[];
    getObject(type: string, id: any, options?: any): any;
    getRandomObject(type: any, id: any): core.interop.DomainObjectData;
    getPlainData(source: string, params: any): any[];
    getTreeData(treeName: string, data: any): any[];
    save(objects: DomainObjectData[], options?: SaveOptions): lang.Promise<any>;
    checkConnection(httpMethod?: string): lang.Promise<CheckConnectionResult>;
    getCurrentUser(): {
        "__metadata": {
            "type": string;
            "ts": number;
        };
        "id": string;
    };
    createAjaxSettings(query: LoadQuery): AjaxSettings;
    mockServer(model: metadata.ModelMeta): void;
    protected _downloadFile(ajaxSettings: AjaxSettings, options: AjaxOptions, deferred: Deferred<void>): void;
}
export = BackendInteropMock;
