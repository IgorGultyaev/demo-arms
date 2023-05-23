/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Menu = require("lib/ui/menu/Menu");
import "lib/ui/menu/MenuButtonsPresenter";
import { ICommand } from "lib/core.commands";
import lang = core.lang;
declare class LogPart extends View {
    items: lang.ObservableCollection<LogPart.LogItem>;
    /**
     * @observable-property {Boolean}
     */
    autoScroll: lang.ObservableProperty<boolean>;
    _doScroll: () => {};
    menu: Menu;
    commands: core.lang.Map<core.commands.ICommand>;
    constructor(app: core.IApplication, logItems: any);
    createRowModel(item: LogPart.LogItem, now: Date): LogPart.LogItem;
    createMenu(): Menu;
    protected createCommands(): lang.Map<ICommand>;
    protected doClear(): void;
    protected canClear(): boolean;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    onItemSelected(item: any): void;
    addItems(items: any): void;
    doScroll(): void;
}
declare namespace LogPart {
    interface LogItem {
        id?: number;
        category?: string;
        eventName?: string;
        eventData?: string;
        message?: string;
        timestamp?: any;
        timestampFormatted?: string;
        details?: any;
    }
}
export = LogPart;
