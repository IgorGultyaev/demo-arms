/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import * as ObjectListPresenterBase from "lib/ui/list/ObjectListPresenterBase";
import View = core.ui.View;
import Options = SimpleObjectListPresenter.Options;
declare class SimpleObjectListPresenter extends ObjectListPresenterBase {
    static defaultOptions: Options;
    options: Options;
    /**
     * @class SimpleObjectListPresenter
     * @extends ObjectListPresenterBase
     * @param {Object} options
     */
    constructor(options?: Options);
    protected _dataPresenterOptions(): View.Options;
}
declare namespace SimpleObjectListPresenter {
    interface Options extends ObjectListPresenterBase.Options {
        dataTemplate?: HandlebarsTemplateDelegate;
    }
}
export = SimpleObjectListPresenter;
