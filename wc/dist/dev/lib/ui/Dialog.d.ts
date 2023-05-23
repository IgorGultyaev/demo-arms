/// <reference types="jquery" />
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
import "lib/ui/menu/MenuPresenter";
import "xcss!lib/ui/styles/dialog";
import "bootstrap";
import "jquery-ui/core";
import lang = core.lang;
import IPart = core.ui.IPart;
import IDialog = core.ui.IDialog;
import ICommand = core.commands.ICommand;
import Options = Dialog.Options;
import { IUserSettings } from "lib/.core";
declare class Dialog extends View implements IDialog {
    /**
     * @enum {String}
     * Names of events raised by Dialog
     */
    static events: {
        LOAD: string;
        CLOSING: string;
        CLOSED: string;
        DISPOSED: string;
    };
    /**
     * Default options for Dialog.
     */
    static defaultOptions: Dialog.Options;
    /**
     * Default menu metadata
     */
    static defaultMenu: Menu.Options;
    /**
     * @enum {String}
     * Names of events raised by Dialog (for backward compatibility)
     */
    events: typeof Dialog.events;
    /**
     * @observable-property {Part}
     */
    body: lang.ObservableProperty<IPart>;
    options: Options;
    header: string;
    commands: lang.Map<ICommand>;
    menu: Menu;
    result: any;
    $dialog: JQuery;
    private _closeSignal;
    private _hideSignal;
    private _lastFocus;
    private _keepAlive;
    private _suspending;
    private _closing;
    private _dialogParent;
    private _unloadOptions;
    _shownSignal: lang.Deferred<any>;
    /**
     * @constructs Dialog
     * @extends View
     * @param {Object} options
     * @param {String} [options.header] Dialog header text
     * @param {Part} [options.body] A part for dialog content
     * @param {String} [options.html] html markup for dialog content (if `body` is empty)
     * @param {String} [options.text] plain text for dialog content (if `body` and `html` are empty)
     * @param {String} [options.rootCssClass] CSS class for root element (with class `.modal`)
     * @param {String} [options.dialogCssClass] CSS class for dialog element (with class `.modal-dialog`)
     * @param {boolean} [options.flexHeight=true] Auto-change the height of dialog
     * @param {Object} [options.commands] Object with menu commands
     * @param {Object} [options.menu] Menu metadata (by default Dialog creates menu with 'Ok' and 'Cancel' items)
     * @param {Function} [options.template] Template
     * @param {Boolean} [options.unbound]
     * @param {boolean} [options.autoDispose=true] Whether dialog should dispose part in `body`
     * @param {Function} [options.onLoad] Callback executed on 'load' event (sender: Dialog) => void;
     * @param {Function} [options.onClosing] Callback executed on 'closing' event (sender: Dialog, args: { result: any; cancel: boolean }) => void;
     * @param {Function} [options.onClosed] Callback executed on 'closed' event (sender: Dialog, args: { result: any; }) => void;
     */
    constructor(options: Options);
    protected _initBody(): void;
    protected onPartUserSettingsChanged(userSettings: IUserSettings, bundle: any): void;
    /**
     * Создает команду закрытия диалога.
     * Такая команда используется по умолчанию, если для пункта меню не задана другая команда.
     */
    protected createCloseCommand(): ICommand;
    protected createMenu(): Menu;
    protected createMenuDefaults(): Menu.Options;
    updateMenu(menu: Menu.Options): void;
    protected doRender(domElement: JQuery | HTMLElement): void;
    /**
     * Shows dialog. NOTE: before 1.35 method used to return a promise of closing dialog, now it's promise of opening.
     * For opening and getting a result use `open` method.
     * @param domElement
     * @returns {Promise}
     */
    render(domElement?: JQuery | HTMLElement): lang.Promise<void>;
    getHeader(): string;
    /**
     * Shows the dialog and wait when it will be closed
     * @param {JQuery|HTMLElement} [domElement]
     * @returns {lang.Promise<any>} Promise will be resolved when the dialog is closed (actually hidden)
     */
    open(domElement?: JQuery | HTMLElement): lang.Promise<any>;
    /**
     * Hides and destroys the dialog
     * @param [result] An result to return as resolved value of open's promise
     * @returns {lang.Promise<any>} Promise will be resolved when the dialog is hidden
     */
    close(result?: any): lang.Promise<any>;
    /**
     * Hides and destroys the dialog, but doesn't resolve Promise returned from `open`. Then opens another dialog,
     * which uses Promise from current dialog.
     * @param {Dialog} dialog
     * @returns {lang.Promise<void>}
     */
    closeAndReplace(dialog: Dialog): lang.Promise<void>;
    /**
     * Hides the dialog, but doesn't destroy it. So the dialog can be reopened later.
     * @param result
     * @returns {lang.Promise<any>} Promise will be resolved when the dialog is hidden
     */
    hide(result?: any): lang.Promise<any>;
    suspend(): lang.Promise<void>;
    resume(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
    protected _hideModal(): void;
    protected _closeExternally(): void;
    protected _onModalShown(e: JQueryEventObject): void;
    protected _onModalHide(e: JQueryEventObject): boolean;
    protected _onModalHidden(e: JQueryEventObject): void;
    /**
     * Opens a nested dialog with part.
     * @param {object} opt
     * @param {string|IPart} opt.part Part name or instance to activate
     * @param {object} [opt.partOptions] Part's options if `part` is string. The object will be passed into part's constructor.
     * @return {Promise<any>}
     */
    static openPart(opt: {
        part: string | IPart;
        partOptions?: any;
    }): lang.Promise<any>;
}
declare namespace Dialog {
    interface Options extends View.Options {
        /**
         * Dialog header text
         */
        header?: string;
        /**
         * A part for dialog content
         */
        body?: IPart | lang.Factory<IPart>;
        /**
         * html markup for dialog content (if `body` is empty)
         */
        html?: string;
        /**
         * plain text for dialog content (if `body` and `html` are empty)
         */
        text?: string;
        /**
         * CSS class for root element (with class `.modal`)
         */
        rootCssClass?: string;
        /**
         * CSS class for dialog element (with class `.modal-dialog`)
         */
        dialogCssClass?: string;
        /**
         * Use wide dialog width instead of normal width (add `model-lg` class)
         */
        wide?: boolean;
        /**
         * Auto-change the height of dialog
         */
        flexHeight?: boolean;
        /**
         * Object with menu commands
         */
        commands?: lang.Map<ICommand>;
        /**
         * Menu metadata (by default Dialog creates menu with 'Ok' and 'Cancel' items).
         * `false` or `null` for disabling menu. `true` for default menu.
         */
        menu?: Menu.Options | boolean;
        /**
         * Disables menu showing.
         */
        hideMenu?: boolean;
        /**
         * Whether dialog should dispose part in `body`
         */
        autoDispose?: boolean;
        /**
         * Show nested dialog over parent dialog
         */
        overlay?: boolean;
        /**
         * Do not show "close" button (cross in the upper right corner)
         */
        noCloseButton?: boolean;
        onLoad?: (sender: Dialog) => void;
        onClosing?: (sender: Dialog, args: {
            result: any;
            cancel: boolean;
        }) => void;
        onClosed?: (sender: Dialog, args: {
            result: any;
        }) => void;
    }
}
export = Dialog;
