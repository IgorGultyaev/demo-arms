/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Carousel = require("lib/ui/Carousel");
import lang = core.lang;
declare class NotificationBar extends Carousel<core.SystemEvent> {
    static defaultOptions: NotificationBar.Options;
    options: NotificationBar.Options;
    /**
     * Obtrusive notification.
     * @class NotificationBar
     * @extends View
     */
    constructor(options?: NotificationBar.Options);
    add(sysEvent: core.SystemEvent): void;
    protected _onEventsChanged(sender: any, ea: lang.ObservableCollectionChangeArgs<core.SystemEvent>): void;
    render(): void;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    unload(): void;
}
declare namespace NotificationBar {
    interface Options extends Carousel.Options {
    }
}
export = NotificationBar;
