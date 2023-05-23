/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/menu/Menu", "lib/ui/Component", "lib/ui/menu/ButtonDropDownPresenter", "xcss!lib/ui/styles/languageMenu"], function (require, exports, core, Menu, Component, ButtonDropDownPresenter) {
    "use strict";
    var LanguageMenu = /** @class */ (function (_super) {
        __extends(LanguageMenu, _super);
        /**
         * @class LanguageMenu
         * @extends Component
         * @param {XConfig} config
         * @param {Object} options
         */
        function LanguageMenu(config, options) {
            var _this = this;
            options = LanguageMenu.mixOptions(options, LanguageMenu.defaultOptions);
            _this = _super.call(this, options) || this;
            var cmd = core.createCommand({
                execute: function (args) {
                    core.platform.language(args.name);
                }
            }), items = [], curLangCode = core.platform.language(), curLang;
            if (!config.supportedLanguages || !curLangCode || !config.supportedLanguages[curLangCode]) {
                _this.presenter = {
                    render: function () { }
                };
            }
            else {
                core.lang.forEach(config.supportedLanguages, function (lang, name) {
                    lang.code = name;
                    lang.codeText = lang.short || lang.code;
                    items.push({
                        name: name,
                        html: _this._getItemHtml(lang, "item"),
                        title: lang.title,
                        command: cmd
                    });
                });
                curLang = config.supportedLanguages[curLangCode];
                _this.presenter = new ButtonDropDownPresenter({
                    isLink: true,
                    anchorHtml: _this._getItemHtml(curLang, "root"),
                    viewModel: Menu.create({ items: items })
                });
            }
            return _this;
        }
        LanguageMenu.prototype._getItemHtml = function (lang, context) {
            var that = this, presentation = context === "item" ? that.options.itemPresentation : that.options.rootPresentation, icoClass = context === "item" ? that.options.itemIconCssClass : that.options.rootIconCssClass, html = "", opts = presentation.split("+");
            opts.forEach(function (opt) {
                if (html) {
                    html += "&nbsp;&nbsp;";
                }
                switch (opt) {
                    case "icon":
                        html += "<i class='" + icoClass + " " + icoClass + "-" + lang.code + "'/>";
                        break;
                    case "code":
                        html += lang.codeText.toUpperCase();
                        break;
                    case "title":
                        html += lang.title;
                        break;
                }
            });
            if (!html) {
                html = lang.title;
            }
            return html;
        };
        LanguageMenu.defaultOptions = {
            rootPresentation: "code",
            rootIconCssClass: "flags-24",
            itemPresentation: "icon+title",
            itemIconCssClass: "flags-24" // see standards styles in languageMenu.css
        };
        return LanguageMenu;
    }(Component));
    LanguageMenu.mixin({
        defaultOptions: LanguageMenu.defaultOptions
    });
    core.ui.LanguageMenu = LanguageMenu;
    return LanguageMenu;
});
//# sourceMappingURL=LanguageMenu.js.map