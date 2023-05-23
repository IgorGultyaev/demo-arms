/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
declare class IconProvider {
    iconCss: {};
    /**
     * @constructs IconProvider
     */
    constructor();
    /**
     * Return html markup for icon
     * @param {String} icoName Icon name or icon css class. Icon name is mapped onto css class via this.iconCss map.
     * @param {Object} [options] Addition options
     * @param {String} [options.title] title text
     * @param {Boolean} [options.alone] alone icon (add x-icon-alone class)
     * @returns {String} html string
     */
    getIcon(icoName: string, options?: IconProvider.GetIconOptions): string;
    /**
     * Return CSS class for icon
     * @param {String} icoName Icon name or icon css class. Icon name is mapped onto css class via this.iconCss map.
     * @param {Object} [options] Addition options
     * @param {Boolean} [options.alone] alone icon (add x-icon-alone class)
     * @returns {String}
     */
    getIconCssClass(icoName: string, options?: IconProvider.GetIconOptions): string;
    /**
     * Returns the name of the icon to graphically represent the specified object. The result can be used in methods 'getIcon' or 'getIconCssClass'.
     * @virtual
     * @param obj
     * @returns {String}
     */
    getObjectIconName(obj: any): string;
}
declare namespace IconProvider {
    interface GetIconOptions {
        title?: string;
        alone?: boolean;
        /**
         * Additional css class for icon element (span)
         */
        addCssClass?: string;
    }
}
export = IconProvider;
