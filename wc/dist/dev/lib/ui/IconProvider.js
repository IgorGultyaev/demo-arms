/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/utils", "lib/ui/handlebars/View"], function (require, exports, core, utils, View) {
    "use strict";
    var IconProvider = /** @class */ (function () {
        /**
         * @constructs IconProvider
         */
        function IconProvider() {
            // NOTE: vector font is being used, see icons.css
            this.iconCss = {
                "close": "x-icon-close",
                "key": "x-icon-key",
                "home": "x-icon-home",
                "add": "x-icon-add",
                "select": "x-icon-select",
                "unlink": "x-icon-unlink",
                "clear": "x-icon-clear",
                "ok": "x-icon-ok",
                "cancel": "x-icon-cancel",
                "stop": "x-icon-stop",
                "save": "x-icon-save",
                "upload": "x-icon-upload",
                "download": "x-icon-download",
                "arrow-left": "x-icon-arrow-left",
                "arrow-right": "x-icon-arrow-right",
                "camera": "x-icon-camera",
                "arrow-up": "x-icon-arrow-up",
                "arrow-down": "x-icon-arrow-down",
                "undo": "x-icon-undo",
                "redo": "x-icon-redo",
                "detachDraft": "x-icon-detach-draft",
                "saveLocally": "x-icon-detach-draft",
                "file": "x-icon-file",
                "folder": "x-icon-folder",
                "create": "x-icon-create",
                "edit": "x-icon-edit",
                "view": "x-icon-view",
                "drafts": "x-icon-drafts",
                "remove": "x-icon-remove",
                "delete": "x-icon-remove",
                "search": "x-icon-search",
                "refresh": "x-icon-refresh",
                "print": "x-icon-print",
                "list": "x-icon-list",
                "export": "x-icon-export",
                "login": "x-icon-login",
                "logout": "x-icon-logout",
                "settings": "x-icon-settings",
                "info": "x-icon-info",
                "help": "x-icon-help",
                "warning": "x-icon-warning-triangle",
                "error": "x-icon-warning",
                "comment": "x-icon-comment",
                "comments": "x-icon-comments",
                "notifications": "x-icon-notifications",
                "user": "x-icon-user",
                "report": "x-icon-report",
                "sync": "x-icon-sync",
                //"loading": "x-icon-loading",
                "loading": core.ui.getWaitingIconClass(),
                "circle": "x-icon-circle",
                // backward compatibility:
                "context-menu": "x-icon-context-menu",
                "menu": "x-icon-menu3",
                "copy": "x-icon-copy",
                "angle-bracket-bottom": "x-icon-angle-bracket-bottom",
                "angle-bracket-right": "x-icon-angle-bracket-right",
                "picture": "x-icon-picture",
                "app-navigation": "x-icon-app-nav",
                "offline": "x-icon-plug",
                "retry": "x-icon-repeat",
                "selectAll": "x-icon-select-all",
                "selectNone": "x-icon-select-none",
                "archive": "x-icon-box-add",
                "filter": "x-icon-filter"
            };
        }
        /**
         * Return html markup for icon
         * @param {String} icoName Icon name or icon css class. Icon name is mapped onto css class via this.iconCss map.
         * @param {Object} [options] Addition options
         * @param {String} [options.title] title text
         * @param {Boolean} [options.alone] alone icon (add x-icon-alone class)
         * @returns {String} html string
         */
        IconProvider.prototype.getIcon = function (icoName, options) {
            if (!icoName) {
                return "";
            }
            // NOTE: we support the first capital letter as well, e.g. 'edit' or 'Edit'
            var extra = "", cssClass = this.getIconCssClass(icoName, options);
            if (!cssClass) {
                return "";
            }
            if (options && options.title) {
                extra = " title='" + options.title + "'";
            }
            if (options && options.addCssClass) {
                cssClass += " " + options.addCssClass;
            }
            return "<span class='" + cssClass + "' aria-hidden='true'" + extra + "></span>";
        };
        /**
         * Return CSS class for icon
         * @param {String} icoName Icon name or icon css class. Icon name is mapped onto css class via this.iconCss map.
         * @param {Object} [options] Addition options
         * @param {Boolean} [options.alone] alone icon (add x-icon-alone class)
         * @returns {String}
         */
        IconProvider.prototype.getIconCssClass = function (icoName, options) {
            if (!icoName) {
                return "";
            }
            // NOTE: we support the first capital letter as well, e.g. 'edit' or 'Edit'
            var cssClass = this.iconCss[icoName] || this.iconCss[utils.toLowerCamel(icoName)];
            if (!cssClass) {
                if (icoName.indexOf("x-icon") > -1) {
                    cssClass = icoName;
                }
                else {
                    return "";
                }
            }
            if (options && options.alone) {
                cssClass = cssClass + " x-icon-alone";
            }
            return "x-icon " + cssClass;
        };
        /**
         * Returns the name of the icon to graphically represent the specified object. The result can be used in methods 'getIcon' or 'getIconCssClass'.
         * @virtual
         * @param obj
         * @returns {String}
         */
        IconProvider.prototype.getObjectIconName = function (obj) {
            return (obj && obj.meta && obj.meta.name) || null;
        };
        return IconProvider;
    }());
    /**
     * Register HB helper 'icon'.
     * @example
     * {{icon name="my-icon-name"}}
     */
    View.Handlebars.registerHelper("icon", function (options) {
        var iconProvider = core.ui.iconProvider, iconHtml = iconProvider
            ? iconProvider.getIcon(options.hash.name, options.hash.title || options.hash.addCssClass ?
                { title: options.hash.title, addCssClass: options.hash.addCssClass } : null)
            : "";
        return new View.Handlebars.SafeString(iconHtml);
    });
    core.ui.IconProvider = IconProvider;
    return IconProvider;
});
//# sourceMappingURL=IconProvider.js.map