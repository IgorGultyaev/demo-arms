/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import lang = core.lang;
import { Menu } from "core.ui";
declare class EventLogView extends View {
    static defaultOptions: EventLogView.Options;
    private events;
    commands: lang.Map<core.commands.ICommand>;
    menu: Menu.Options;
    /**
     * @class EventLogView
     * @extends View
     * @param {ObservableCollection} eventLog
     * @param {Object} [options]
     */
    constructor(eventLog?: lang.ObservableCollection<core.SystemEvent>, options?: EventLogView.Options);
    /**
     * @observable-property {SystemEvent}
     */
    activeItem: core.lang.ObservableProperty<core.SystemEvent>;
    createCommands(): lang.Map<core.commands.ICommand>;
    protected _removeEvent(item: core.SystemEvent): void;
    protected _removeAllEvents(): void;
    protected _archiveAllEvents(): void;
}
declare namespace EventLogView {
    interface Options extends View.Options {
    }
}
export = EventLogView;
