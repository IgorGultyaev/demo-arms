/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectWizardPresenterBase = require("lib/ui/editor/ObjectWizardPresenterBase");
import "xcss!lib/ui/styles/objectWizardStacked";
import ObjectWizard = require("lib/ui/editor/ObjectWizard");
import EditorPage = require("lib/ui/editor/EditorPage");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
declare class ObjectWizardStackedPresenter extends ObjectWizardPresenterBase {
    static defaultOptions: ObjectWizardStackedPresenter.Options;
    options: ObjectWizardStackedPresenter.Options;
    topNavPages: core.lang.ObservableCollection<EditorPage>;
    bottomNavPages: core.lang.ObservableCollection<EditorPage>;
    hideTopNav: boolean;
    /**
     * @constructs ObjectWizardStackedPresenter
     * @extends ObjectWizardPresenterBase
     * @param {Object} [options]
     */
    constructor(options?: ObjectWizardStackedPresenter.Options);
    setViewModel(viewModel: ObjectWizard): void;
    formatPageSummaryBrief(summary: PropertyEditor.Summary[]): string;
    formatPageSummary(summary: PropertyEditor.Summary[]): string;
    private _initSummaryPopups();
    private _onNavChanged();
    activatePage(page: EditorPage): core.lang.Promisable<void>;
    deactivatePage(page: EditorPage): core.lang.Promisable<void>;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
declare namespace ObjectWizardStackedPresenter {
    interface Options extends ObjectWizardPresenterBase.Options {
        formatPageSummary?: () => string;
        formatPageSummaryBrief?: () => string;
        summaryBriefValueMaxLen?: number;
        showPageSummaryPopup?: boolean;
    }
}
export = ObjectWizardStackedPresenter;
