/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Menu = require("lib/ui/menu/Menu");
import View = require("lib/ui/handlebars/View");
import lang = core.lang;
declare class SystemMenu extends View {
    /** Default options
     * @type {Object}
     * @property {Function|String} template Template
     * @property {String} openItemCssClass CSS-class for currently opened item's element
     * @property {Array} items Array of menu items descriptions
     */
    static defaultOptions: SystemMenu.Options;
    rootItems: lang.ObservableCollection<SystemMenu.RootItem>;
    options: SystemMenu.Options;
    /**
     * @class SystemMenu
     * @extends View
     */
    constructor(options: SystemMenu.Options);
    /**
     * Add (or update) a new (existing) item.
     * @param {Object} itemMd
     * @param {String} itemMd.name
     * @param {Number} [itemMd.order]
     * @param {String} [itemMd.title]
     * @param {String} [itemMd.html]
     * @param {String} [itemMd.badge]
     * @param {String} [itemMd.icon]
     * @param {Command} [itemMd.command]
     * @param {Function} [itemMd.getMenu]
     * @param {Array} [itemMd.items]
     * @param {Function} [itemMd.getPart]
     * @return {Observable} Observable-object created from json metadata
     */
    addRootItem(itemMd: Menu.Item): SystemMenu.RootItem;
    /**
     * Return item by name
     * @param {String} name
     * @returns {Observable} Root item descriptor
     */
    getRootItem(name: string): SystemMenu.RootItem;
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    protected _onShow(link: JQuery, rootItem: SystemMenu.RootItem, itemContainer: JQuery): void;
}
declare namespace SystemMenu {
    interface Options extends View.Options {
        template?: HandlebarsTemplateDelegate;
        openItemCssClass?: string;
        items?: Menu.Item[];
    }
    class RootItem extends lang.Observable {
        name: string;
        getMenu: Function;
        getPart: Function;
        items: Menu.Item[];
        _part: any;
        /**
         * @observable-property {String}
         */
        title: lang.ObservableProperty<string>;
        /**
         * @observable-property {String}
         */
        html: lang.ObservableProperty<string | (() => string)>;
        /**
         * @observable-property {String}
         */
        badge: lang.ObservableProperty<string>;
        /**
         * @observable-property {String}
         */
        icon: lang.ObservableProperty<string>;
        /**
         * @observable-property {Number}
         */
        order: lang.ObservableProperty<number>;
        /**
         * @observable-property {Boolean}
         */
        hidden: lang.ObservableProperty<boolean>;
        /**
         * @observable-property {Command}
         */
        command: lang.ObservableProperty<lang.Lazy<core.commands.ICommand>>;
        /**
         * @class RootItem
         * @param itemMd
         * @param {String} itemMd.name
         * @param {Number} [itemMd.order]
         * @param {Boolean} [itemMd.hidden]
         * @param {String} itemMd.title
         * @param {String} [itemMd.html]
         * @param {String} [itemMd.badge]
         * @param {String} [itemMd.icon]
         * @param {Command} [itemMd.command]
         * @param {Function} [itemMd.getMenu]
         * @param {Array} [itemMd.items]
         * @param {Function} [itemMd.getPart]
         */
        constructor(itemMd: Menu.Item);
        getHtml(): string | (() => string);
    }
}
export = SystemMenu;
