/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import ObjectEditorPresenterBase = require("lib/ui/editor/ObjectEditorPresenterBase");
import "xcss!lib/ui/styles/objectWizardCommon";
import EditorPage = require("lib/ui/editor/EditorPage");
import ObjectWizard = require("./ObjectWizard");
declare class ObjectWizardPresenterBase extends ObjectEditorPresenterBase {
    static defaultOptions: ObjectWizardPresenterBase.Options;
    viewModel: ObjectWizard;
    /**
     * @constructs ObjectWizardPresenterBase
     * @extends ObjectEditorPresenterBase
     * @param {Object} [options]
     */
    constructor(options?: ObjectEditorPresenterBase.Options);
    protected doRender(domElement: JQuery | HTMLElement): void;
    activatePage(page: EditorPage): void;
    /**
     * Return page number. Function is used by template
     * @param {Object} page - wizard page
     * @returns {number} page number
     */
    pageNumber(page: EditorPage): number;
    protected ensurePageContainer(page: EditorPage): JQuery;
}
declare namespace ObjectWizardPresenterBase {
    interface Options extends ObjectEditorPresenterBase.Options {
    }
}
export = ObjectWizardPresenterBase;
