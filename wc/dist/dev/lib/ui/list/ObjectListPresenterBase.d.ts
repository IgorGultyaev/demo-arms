/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import "lib/ui/ExpandablePanel";
import "xcss!lib/ui/styles/objectList";
import lang = core.lang;
import { IPart } from "lib/ui/.ui";
import { IList, IObjectListPresenter, IObjectListPaginator, IObjectListDataPresenter, PagingOptions } from ".list";
import Options = ObjectListPresenterBase.Options;
declare class ObjectListPresenterBase extends core.ui.View implements IObjectListPresenter {
    static defaultOptions: Options;
    static hostDefaultOptions: lang.Map<Options>;
    /**
     * Dictionary: string => ObjectListPaginatorBase class.
     * You may extend this dictionary with your own values.
     */
    static defaultPaginators: lang.Map<lang.Constructor<IObjectListPaginator>>;
    options: Options;
    viewModel: ObjectListPresenterBase.ViewModel;
    dataPresenter: IObjectListDataPresenter;
    paginator: IObjectListPaginator;
    eventPublisher: core.IEventPublisher;
    /**
     * @constructs ObjectListPresenterBase
     * @extends View
     */
    constructor(options?: Options);
    applyHostContext(opt?: {
        host: string;
    }): core.INavigationService.NavigateOptions;
    /**
     * @param {ObjectList} list
     */
    setViewModel(list: IList): void;
    unload(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected _initDataPresenter(list: IList): void;
    protected _dataPresenterOptions(): {};
    protected _throwIfNoDataPresenter(): void;
    protected _initPaginator(list: IList): void;
    protected _createPaginatorOptions(paging: boolean | number | PagingOptions): PagingOptions;
    protected _onSkippedItemsChange(sender: IObjectListPaginator, value: number): void;
    protected _uninitChild(part: IPart): void;
}
declare namespace ObjectListPresenterBase {
    interface Options extends core.ui.View.Options {
        dataPresenter?: IObjectListDataPresenter;
        DataPresenter?: lang.Constructor<IObjectListDataPresenter>;
        paginator?: IObjectListPaginator;
        Paginator?: lang.Constructor<IObjectListPaginator>;
        affixMenu?: boolean;
        hideMenuRow?: boolean;
        hideMenuList?: boolean;
        hideRowsStats?: boolean;
        showTitle?: boolean;
        cssClass?: string;
        menuRowCssClass?: string;
        menuListCssClass?: string;
        partialTemplates?: lang.Map<HandlebarsTemplateDelegate>;
        templates?: string[];
    }
    class ViewModel extends lang.Observable {
        options: Options;
        dataPresenter: IObjectListDataPresenter;
        paginator: IObjectListPaginator;
        templates: HandlebarsTemplateDelegate[];
        private _disposables;
        constructor(list: IList);
        dispose(): void;
        /**
         * @observable-property {*}
         */
        list: lang.ObservableProperty<IList>;
        /**
         * @observable-property {Boolean}
         */
        isLoading: lang.ObservableProperty<boolean>;
        /**
         * @observable-property {Boolean}
         */
        isReloading: lang.ObservableProperty<boolean>;
        /**
         * @observable-property {Boolean}
         */
        isLoadingMore: lang.ObservableProperty<boolean>;
        /**
         * Фиксированная высота списка, в пикселях
         */
        fixedHeight?: number;
        stateSeverity(): string;
        pendingItemsCount(): number;
        protected _addBinding<T>(target: lang.ObservableProperty<T>, source: (list: IList) => T): void;
    }
}
export = ObjectListPresenterBase;
