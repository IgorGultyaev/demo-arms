/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import "xcss!lib/ui/styles/expandablePanel";
import lang = core.lang;
import { IPart } from "lib/ui/.ui";
declare class ExpandablePanel extends View {
    static defaultOptions: ExpandablePanel.Options;
    private _body;
    private _bodyOwned;
    private _expandedProp;
    private _expanding;
    private _bodyViewModel;
    private _disposable;
    private container;
    options: ExpandablePanel.Options;
    commands: core.lang.Map<core.commands.ICommand>;
    /**
     * @class ExpandablePanel
     * @extends View
     * @param {Object} options
     */
    constructor(options: ExpandablePanel.Options);
    /**
     * @observable-property {Boolean}
     */
    expanded: lang.ObservableProperty<boolean>;
    createCommands(): core.lang.Map<core.commands.ICommand>;
    expand(): void;
    collapse(): void;
    toggle(): void;
    body(): IPart;
    setViewModel(viewModel: any): void;
    /**
     * Привязывает свойство expanded к _bodyViewModel и возвращает значение expanded.
     * Используется в шаблоне.
     */
    boundExpanded(): boolean;
    isParentExpandable(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected _refresh(): void;
}
declare namespace ExpandablePanel {
    interface Options extends View.Options {
        body?: IPart;
        expandedProp?: string;
        expandTitle?: string;
        collapseTitle?: string;
        expanded?: boolean;
    }
}
export = ExpandablePanel;
