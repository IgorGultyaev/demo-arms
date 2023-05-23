/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import SlickObjectListDataPresenter = require("lib/ui/slick/SlickObjectListDataPresenter");
import ObjectListPresenterBase = require("lib/ui/list/ObjectListPresenterBase");
import ContextPartCarousel = require("lib/ui/validation/ContextPartCarousel");
import lang = core.lang;
import { IPart } from "lib/ui/.ui";
import { IList } from "ui/list/.list";
import { Violation } from "lib/validation";
import { ContextPartComponentMixin } from "lib/ui/validation/ContextPartMixin";
/**
 * Base presenter for ObjectList based on SlickGrid.
 */
export declare class SlickObjectListPresenterBase extends ObjectListPresenterBase {
    static defaultOptions: SlickObjectListPresenterBase.Options;
    options: SlickObjectListPresenterBase.Options;
    dataPresenter: SlickObjectListDataPresenter;
    /**
     * @constructs SlickObjectListPresenterBase
     * @extends ObjectListPresenterBase
     * @param {Object} options
     */
    constructor(options?: SlickObjectListPresenterBase.Options);
    /**
     *
     * @method
     * @async-debounce throttle=100
     */
    focus: () => void;
    focusSync(): void;
    scrollToSelf(): void;
    /**
     * Refresh specified items
     * @param items Items ot refresh. If not specified, then all items will be refreshed.
     */
    refreshItems(items?: any[] | any): void;
}
export declare namespace SlickObjectListPresenterBase {
    interface Options extends ObjectListPresenterBase.Options {
        hasCheckboxes?: boolean;
        affixParts?: boolean;
        affixHeader?: boolean;
        gridCssClass?: string;
        gridOptions?: {
            autoHeight?: boolean;
            smartHeight?: boolean;
            gridHeight?: number;
            [key: string]: any;
        };
    }
}
export declare class SlickObjectListPresenter extends SlickObjectListPresenterBase {
    static defaultOptions: SlickObjectListPresenter.Options;
    partsCarousel: ContextPartCarousel;
    protected contextParts: lang.ObservableCollection<IPart>;
    /**
     * @constructs SlickObjectListPresenter
     * @extends ObjectListPresenterBase
     * @param {Object} options
     */
    constructor(options?: SlickObjectListPresenter.Options);
    setViewModel(list: IList & ContextPartComponentMixin): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected afterRender(): void;
    activateContextParts(): void;
    protected _activateViolation(violation: Violation): void;
}
export declare namespace SlickObjectListPresenter {
    interface Options extends SlickObjectListPresenterBase.Options {
    }
}
export declare class peSlickObjectListPresenter extends SlickObjectListPresenterBase {
    static defaultOptions: peSlickObjectListPresenter.Options;
    /**
     * @constructs peSlickObjectListPresenter
     * @extends SlickObjectListPresenter
     * @param options
     */
    constructor(options?: peSlickObjectListPresenter.Options);
    protected _initPaginator(list: IList): void;
}
export declare namespace peSlickObjectListPresenter {
    interface Options extends SlickObjectListPresenterBase.Options {
    }
}
