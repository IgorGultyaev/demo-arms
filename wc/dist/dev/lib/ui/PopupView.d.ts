/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Popup = require("lib/ui/Popup");
import "xcss!lib/ui/styles/popupView";
import Menu = require("lib/ui/menu/Menu");
import Command = core.commands.Command;
import lang = core.lang;
declare class PopupView extends Popup {
    /** @type {Object} */
    static defaultOptions: PopupView.Options;
    options: PopupView.Options;
    commands: PopupView.KnownCommands;
    menu: Menu;
    title: string;
    /**
     * @constructs PopupView
     * @extends Popup
     * @description PopupView consists of a scaffolding frame (specified by template option)
     * and an inner part (specified by body or bodyTemplate options).
     * @param {PopupView.defaultOptions} options
     */
    constructor(options: PopupView.Options);
    getDefaultMenuMetadata(): Menu.Options;
    /**
     * Create commands
     * @protected
     * @returns {{Close: (Command)}}
     */
    createCommands(): PopupView.KnownCommands;
}
declare namespace PopupView {
    interface Options extends Popup.Options {
        title?: string;
        showCross?: boolean;
        height?: number;
        width?: number;
        /**
         * Object with menu commands
         */
        commands?: lang.Map<Command>;
        /**
         * Menu metadata (by default Dialog creates menu with 'Ok' and 'Cancel' items).
         * `false` or `null` for disabling menu. `true` for default menu.
         */
        menu?: Menu.Options;
    }
    interface KnownCommands extends lang.Map<Command> {
        Close?: Command;
    }
}
export = PopupView;
