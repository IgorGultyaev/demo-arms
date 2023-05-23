/// <reference types="jquery.notify" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import "vendor/notify/jquery.notify";
import "xcss!./styles/module-notifications";
import lang = core.lang;
declare class Notification extends View {
    static defaultOptions: Notification.Options;
    private _isClosed;
    private _notification;
    _container: JQueryNotifyWidget;
    persist: boolean;
    options: Notification.Options;
    /**
     * @constructs Notification
     * @extends View
     */
    constructor(options?: Notification.Options);
    render(): void;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /**
     *
     * @param {SystemEvent} sysEvent
     */
    setViewModel(sysEvent: core.SystemEvent): void;
    protected _onShown(): void;
    protected _onCmdExecuted(args: any): void;
    close(archive?: boolean): void;
    dispose(): void;
}
declare namespace Notification {
    interface Options extends View.Options {
        timeout?: number;
        speed?: number;
    }
}
export = Notification;
