/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectEditorPresenterBase = require("lib/ui/editor/ObjectEditorPresenterBase");
import EditorPage = require("lib/ui/editor/EditorPage");
import { Part } from "core.ui";
declare class ObjectEditorPresenter extends ObjectEditorPresenterBase {
    static defaultOptions: ObjectEditorPresenter.Options;
    options: ObjectEditorPresenter.Options;
    private $tabs;
    /**
     * @constructs ObjectEditorPresenter
     * @extends ObjectEditorPresenterBase
     * @param {Object} [options]
     */
    constructor(options?: ObjectEditorPresenter.Options);
    protected doRender(domElement: JQuery | HTMLElement): void;
    /**
     * Called by ObjectEditor after current page is shown.
     */
    protected onReady(): void;
    protected _renderTabs(): void;
    protected _generatePageId(pageName: string): string;
    protected _getTabByName(name: string): JQuery;
    activatePage(page: EditorPage): void;
    deactivatePage(page: EditorPage): core.lang.Promisable<void>;
    unload(options?: Part.CloseOptions): void;
}
declare namespace ObjectEditorPresenter {
    interface Options extends ObjectEditorPresenterBase.Options {
        partialTemplates?: core.lang.Map<HandlebarsTemplateDelegate>;
    }
}
export = ObjectEditorPresenter;
