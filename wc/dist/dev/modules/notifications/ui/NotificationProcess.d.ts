/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import View = require("lib/ui/handlebars/View");
declare class NotificationProcess extends View {
    static defaultOptions: NotificationProcess.Options;
    options: NotificationProcess.Options;
    _timeout: number;
    _rendering: boolean;
    /**
     * @constructs NotificationProcess
     * @extends View
     */
    constructor(options?: NotificationProcess.Options);
    render(): void;
    protected _doRender(): void;
    /**
     * Animated closing notification.
     * NOTE: If notification wasn't rendered (as timer hasn't fired yet) it clears the timer.
     * NOTE: It removes UI from DOM on animation completes .
     */
    close(): void;
    unload(): void;
}
declare namespace NotificationProcess {
    interface Options extends View.Options {
        speed?: number;
        timeout?: number;
        container?: JQuery | HTMLElement;
    }
}
export = NotificationProcess;
