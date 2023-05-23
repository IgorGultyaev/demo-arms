/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import ObjectWizardPresenterBase = require("lib/ui/editor/ObjectWizardPresenterBase");
import "xcss!lib/ui/styles/objectWizard";
import { Part } from "core.ui";
declare class ObjectWizardPresenter extends ObjectWizardPresenterBase {
    static defaultOptions: ObjectWizardPresenterBase.Options;
    private breadcrumbs;
    private $topnav;
    /**
     * @constructs ObjectWizardPresenter
     * @extends ObjectWizardPresenterBase
     * @param {Object} [options]
     */
    constructor(options?: ObjectWizardPresenterBase.Options);
    protected doRender(domElement: JQuery | HTMLElement): void;
    protected onReady(): void;
    unload(options?: Part.CloseOptions): void;
}
export = ObjectWizardPresenter;
