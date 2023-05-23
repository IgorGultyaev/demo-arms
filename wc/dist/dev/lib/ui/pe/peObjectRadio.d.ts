/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import peObjectBase = require("lib/ui/pe/peObjectBase");
import DataSource = require("lib/data/DataSource");
import ObservableCollectionView = require("lib/utils/ObservableCollectionView");
import formatters = require("lib/formatters");
import peLoadableMixin = require("lib/ui/pe/peLoadableMixin");
import "xcss!lib/ui/styles/peObjectRadio";
import { UnitOfWork, metadata } from "lib/domain/.domain";
import lang = core.lang;
import DataLoadEventArgs = peLoadableMixin.DataLoadEventArgs;
declare class peObjectRadio extends peObjectBase {
    static defaultOptions: peObjectRadio.Options;
    /**
     * @enum {String}
     */
    static Events: {
        DATA_LOADING: string;
        DATA_LOADED: string;
        LOADED: string;
    };
    options: peObjectRadio.Options;
    items: ObservableCollectionView<any>;
    entityType: string;
    dataSource: DataSource;
    showNullValue: boolean;
    jsonAdapter: peObjectRadio.JsonAdapter;
    private _uow;
    private _ownUow;
    private _domainDataSource;
    private _rerenderScheduled;
    /**
     * @class peObjectRadio
     * @extends peObjectBase
     * @param options
     */
    constructor(options: peObjectRadio.Options);
    reload(): lang.Promise<void>;
    protected _ensureJsonAdapter(): void;
    protected _setItems(items: any[]): void;
    protected onDataLoading(args: DataLoadEventArgs): void;
    protected onDataLoaded(args: DataLoadEventArgs): void;
    protected onLoaded(): void;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected afterRender(): void;
    protected _renderLoaded(domElement: JQuery | HTMLElement): void;
    protected _renderLoading(domElement: JQuery | HTMLElement): void;
    protected _getOptionTitle(obj: any): string | formatters.SafeHtml;
    protected _getOptionId(obj: any): string;
    focus(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
interface peObjectRadio extends peLoadableMixin {
}
declare namespace peObjectRadio {
    interface Options extends peObjectBase.Options {
        ref?: metadata.EntityMeta;
        /**
         * @type {DataSource}
         */
        dataSource?: DataSource;
        /**
         * @type {Array}
         */
        valueOptions?: any[];
        /**
         * @type Array|String
         */
        orderBy?: string | string[];
        orientation?: "vertical" | "horizontal";
        changeTrigger?: "keyPressed" | "lostFocus";
        nullValueText?: string;
        showNullValue?: boolean;
        entityType?: string;
        urlSuffix?: string;
        uow?: UnitOfWork;
        onDataLoading?: (sender: peObjectRadio, args: DataLoadEventArgs) => void;
        /**
         * data loaded event handler
         * @type {Function}
         */
        onDataLoaded?: (sender: peObjectRadio, args: DataLoadEventArgs) => void;
        onLoaded?: (sender: peObjectRadio) => void;
        /**
         * Json Adapter - an object with two methods: getId and getPresentation, which accept an json object from DataSource result
         * It's only used with plain DataSource (DataSource returns json, not domain objects)
         * @type {Object}
         */
        jsonAdapter?: JsonAdapter;
        displayField?: string;
        idField?: string;
    }
    interface JsonAdapter {
        getPresentation(jsonItem: any): string | formatters.SafeHtml;
        getId(jsonItem: any): string;
    }
}
export = peObjectRadio;
