/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import Component = require("lib/ui/Component");
import "xcss!lib/ui/styles/languageMenu";
declare class LanguageMenu extends Component {
    static defaultOptions: LanguageMenu.Options;
    options: LanguageMenu.Options;
    /**
     * @class LanguageMenu
     * @extends Component
     * @param {XConfig} config
     * @param {Object} options
     */
    constructor(config: any, options: LanguageMenu.Options);
    protected _getItemHtml(lang: any, context: "item" | "root"): string;
}
declare namespace LanguageMenu {
    interface Options extends Component.Options {
        /**
         * Any combination of: "code" | "icon" | "title"
         */
        rootPresentation?: string;
        rootIconCssClass?: string;
        /**
         * any co,bination of: "code" | "icon" | "title"
         */
        itemPresentation?: string;
        itemIconCssClass?: string;
    }
}
export = LanguageMenu;
