/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ObjectEditor = require("lib/ui/editor/ObjectEditor");
import EditorPage = require("lib/ui/editor/EditorPage");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import lang = core.lang;
import PartCloseOptions = core.ui.PartCloseOptions;
import Options = ObjectViewer.Options;
import Model = ObjectEditor.Model;
import KnownMenus = ObjectEditor.KnownMenus;
declare class ObjectViewer extends ObjectEditor {
    static defaultOptions: Options;
    static defaultMenus: KnownMenus;
    defaultMenus: KnownMenus;
    /**
     * context name for property editors
     */
    contextName: string;
    options: Options;
    /**
     * @constructs ObjectViewer
     * @extends ObjectEditor
     * @param {Object} options
     */
    constructor(options?: Options);
    protected _onCreatePropEditor(page: EditorPage, propMd: PropertyEditor.Options, viewModel: Model): PropertyEditor.Options;
    protected onQueryUnload(options: PartCloseOptions): lang.Promisable<string>;
    protected onQueryUnloadWithChanges(options: PartCloseOptions): lang.Promise<string>;
    protected queryNavigateSibling(): lang.Promisable<string>;
}
declare namespace ObjectViewer {
    interface Options extends ObjectEditor.Options {
        disableValuesNavigation?: boolean;
    }
}
export = ObjectViewer;
