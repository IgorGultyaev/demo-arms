/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import "lib/ui/handlebars/View";
import lang = core.lang;
import Lazy = lang.Lazy;
import ICommand = core.commands.ICommand;
import ICommandLazyMap = core.commands.ICommandLazyMap;
import Item = Menu.Item;
import Options = Menu.Options;
import PresentationItem = Menu.PresentationItem;
declare class Menu extends lang.Observable {
    /**
     * Описания меню компонентов по умолчанию
     * @type {Object}
     */
    static Defaults: lang.Map<Options>;
    /**
     * Описания меню компонентов для отдельных типов
     * @type {Object}
     */
    static Object: lang.Map<lang.Map<Options>>;
    options: Options;
    items: Item[];
    radio: boolean;
    constructor(...options: Options[]);
    /**
     * Name of last executed item if Menu was created with 'radio' option.
     * @observable-property {String}
     */
    selectedItem: lang.ObservableProperty<string>;
    mergeWith(other: Menu | Options): void;
    /**
     * Get a menu item by predicate.
     * @param predicate A callback accepting a menu item
     * @return {Object}
     */
    findItem(predicate: (item: Item) => boolean): Item;
    /**
     * Get a menu item by its name.
     * @param name name of menu item
     * @return {Object}
     */
    getItem(name: string): Item;
    /**
     * Get command of menu item with the specified name.
     * @param {String} name
     * @return {Command}
     */
    getCommand(name: string): ICommand;
    /**
     * Remove item with specified name
     * @param {String} name
     */
    removeItem(name: string): boolean;
    /**
     * Callback to call before executing item's command. Should be supported by a presenter
     */
    onItemExecuting: (args: any) => void;
    /**
     * Execute command of item with specified name.
     * @param {String} name Name of menu item
     * @param {Object} args Arguments for item's command
     */
    execute(name: string, args?: any): any;
    /**
     * Execute command of specified item
     * @param {Object} item Menu item
     * @param {Object} args Arguments for item's command
     * @static
     */
    executeItem(item: Item, args?: any): any;
    /**
     * Traverses all menu items recursively and call specified callback.
     * @param {Function} visitor A callback accepting a menu item
     * @returns {Boolean} true if visitor broke iteration (i.e. returned true)
     */
    acceptVisitor(visitor: (item: Item) => any): boolean;
    private _traverseItems(items, visitor);
    /**
     * Subscribe the specified callback on execution of any menu item.
     * Once the callback executed it's unsubscribed (i.e. it's executed only once).
     * @param {Function} callback If callback returns 'false' then it won't be unsubscribed
     */
    onceExecuted(callback: (args: any) => any): void;
    /**
     * Bind menu items to supplied commands.
     * @param {Object} commands A map where keys are command names, values are command instances.
     * @param {*} [ctx] A context used to call command factories (if item's `command` field is a function).
     * @param {Object} [params] Additional parameters for all menu items, they will be merged with items' own params.
     */
    bindToCommands(commands?: ICommandLazyMap, ctx?: any, params?: any): void;
    removeItemsWithoutCommand(): void;
    bindToPart(part: {
        commands: ICommandLazyMap;
    }, params?: any): void;
    /**
     * Execute menu item with hotkey by given keyboard event
     * @param {jQuery.Event} event - keyboard event
     * @return {boolean} true if a menuItem executed
     */
    executeHotkey(event: JQueryKeyEventObject): boolean;
    /**
     * Returns the menuitem with hotkey corresponding to the event
     * @param {jQuery.Event} event
     * @return {Object} menuItem
     */
    getHotkeyItem(event: JQueryKeyEventObject): Item;
    /**
     * Returns the item that should be executed by default
     * @returns {Item}
     */
    getDefaultItem(): Item;
    isEmpty(): boolean;
    /**
     * Returns true if and only if the menu contains items for the specified commands
     * @param {Array} commands Array of commands
     * @returns {Boolean}
     */
    hasOnly(commands: ICommand[]): boolean;
    protected _updateItems(): void;
    protected _toggleRadio(itemName: string): void;
    /**
     * Merge menu options
     * @static
     * @param {...Object} sources One or more options. If two or more arguments then options will be merged.
     * @param {Array} [sources.items] Array of menu item specifications. When merging target items will be ignored and totally replaced.
     * @param {Array} [sources.replace] Array of menu item specifications or names. When merging target items will be replaced, but items with the same names will be merged.
     * @param {Array} [sources.remove] Array of menu item names to remove when merge.
     * @param {Array} [sources.update] Array of menu item specifications. When merging target items will be merged.
     */
    static merge(...sources: Options[]): Options;
    /**
     * Returns default menu options for component with overrides in Menu.Defaults and Menu.Object
     * @static
     * @param defaultOptions
     * @param [componentName]
     * @param [objectName]
     * @return {*}
     */
    static defaultsFor(defaultOptions: Options, componentName?: string, objectName?: string): Options;
    /**
     * Returns HTML for the icon of menuItem
     * @static
     * @param menuItem
     * @return {String}
     */
    static getIconHtml(menuItem: PresentationItem): string;
    /**
     * Returns the encoded title for menuItem
     * @static
     * @param menuItem
     * @return {String}
     */
    static getItemTitle(menuItem: PresentationItem): string;
    /**
     * Returns HTML for menuItem
     * @static
     * @param {Object} menuItem
     * @param {"both"|"icon"|"text"} [presentation]
     * @return {String}
     */
    static getItemHtml(menuItem: PresentationItem, presentation?: Menu.ItemPresentation): string;
    /**
     * Return true if menu item can be executed
     * @static
     * @param {Object} menuItem
     * @returns {Boolean} true if menu item can be executed
     */
    static canExecuteItem(menuItem: Item): boolean;
    static isItemEnabled(item: Item): boolean;
    static isItemVisible(item: Item): boolean;
    static create(options?: Options | Menu): Menu;
    static isEmpty(menu: Menu): boolean;
    /**
     * Special key codes for executeHotKey method
     */
    static specialKeys: {
        [key: number]: string;
    };
}
declare namespace Menu {
    interface Options {
        items?: Item[];
        replace?: (Item | string)[];
        remove?: string[];
        update?: Item[];
        /**
         * Radio menu: name of last executed item set into selectedItem property
         */
        radio?: boolean;
        /**
         * Mode of radio menu: selected item can be unselected (by executing one more time)
         */
        radioToggle?: boolean;
        [key: string]: any;
    }
    interface PresentationItem {
        name?: string;
        title?: string;
        badge?: string;
        cssClass?: string;
        html?: string | (() => string);
        icon?: string;
        hint?: string;
        /**
         * alias for hint
         */
        tooltip?: string;
        presentation?: Menu.ItemPresentation;
        /**
         * For item with icon and title, label for title will have 'hidden-xs' class by default,
         * this option allow to override hidden breakpoint or disable it.
         */
        labelHiddenBreakpoint?: "xs" | "sm" | "md" | "lg" | "none" | boolean;
    }
    interface Item extends Menu.PresentationItem {
        command?: Lazy<ICommand>;
        commandName?: string;
        params?: lang.Map<any>;
        order?: number;
        disabled?: boolean;
        disableIfEmpty?: boolean;
        hidden?: boolean;
        hideIfDisabled?: boolean;
        isDefaultAction?: boolean;
        hotKey?: string;
        items?: Item[];
        url?: string;
        /**
         * Options for DropDownMenuPresenter (for item-submenu with items) or
         * additional presentation options for ordinary item.
         */
        presenterOptions?: any;
        getMenu?: (ctx?: any) => {
            items?: Item[];
        };
        getPart?: () => core.ui.IPart;
        html?: string;
        [key: string]: any;
    }
    type ItemPresentation = "both" | "icon" | "text";
}
export = Menu;
