/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import lang = core.lang;
import domain = require("lib/domain/.domain");
import DomainObject = domain.DomainObject;
import DomainObjectData = domain.DomainObjectData;
import PropertyMeta = domain.metadata.PropertyMeta;
import Options = ObjectComparePart.Options;
declare class ObjectComparePart extends View {
    static defaultOptions: Options;
    options: Options;
    /**
     * @observable-property {*}
     */
    local: lang.ObservableProperty<DomainObject>;
    /**
     * @observable-property {*}
     */
    original: lang.ObservableProperty<DomainObject>;
    /**
     * @observable-property {ObservableCollection}
     */
    props: lang.ObservableProperty<lang.ObservableCollection<ObjectComparePart.PropViewModel>>;
    title: string;
    hint: string;
    hintSeverity: string;
    targetColumnTitle: string;
    sourceColumnTitle: string;
    /**
     * @constructs ObjectComparePart
     * @extends View
     * @param options
     */
    constructor(options?: Options);
    setViewModel(): void;
    protected _initLocal(data: DomainObjectData): DomainObject;
    protected _initOriginal(data: DomainObjectData): DomainObject;
    protected _initOriginal(data: string, id: string): DomainObject;
    propHtml(obj: DomainObject, propMeta: any): string;
    protected _initPropsModels(): void;
}
declare namespace ObjectComparePart {
    interface Options extends View.Options {
        title?: string;
        local?: DomainObjectData;
        original?: DomainObjectData;
        hint?: string;
        targetColumnTitle?: string;
        sourceColumnTitle?: string;
        hintSeverity?: string;
        showMetadata?: boolean;
    }
    class PropViewModel extends lang.Observable {
        /**
         * @constructs PropViewModel
         * @extends Observable
         * @param propMeta
         */
        constructor(propMeta?: PropertyMeta);
        /**
         * @observable-property {Part}
         */
        part: lang.ObservableProperty<ObjectComparePart>;
        /**
         * @observable-property {String}
         */
        title: lang.ObservableProperty<string>;
        /**
         * @observable-property {Boolean}
         */
        checked: lang.ObservableProperty<boolean>;
        meta: PropertyMeta;
        isPropEqual(): boolean;
        localHtml(): string;
        originalHtml(): string;
        protected getHtml(obj: DomainObject): string;
    }
    class PropViewModelSimple extends PropViewModel {
        protected getter: (obj: DomainObject) => string;
        constructor(getter: (obj: DomainObject) => string, title: string);
        isPropEqual(): boolean;
        protected getHtml(obj: DomainObject): string;
    }
}
export = ObjectComparePart;
