/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/editor/ObjectEditor", "lib/ui/menu/Menu", "i18n!lib/nls/resources"], function (require, exports, core, ObjectEditor, Menu, resources) {
    "use strict";
    var lang = core.lang;
    var ObjectWizard = /** @class */ (function (_super) {
        __extends(ObjectWizard, _super);
        /**
         * @constructs ObjectWizard
         * @extends ObjectEditor
         * @param {Object} options
         */
        function ObjectWizard(options) {
            var _this = this;
            options = ObjectWizard.mixOptions(options, ObjectWizard.defaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        /**
         * Returns flag indicating whether current wizard is linear (true) and non-linear (false).
         * @returns {boolean}
         */
        ObjectWizard.prototype.isLinear = function () {
            return !lang.isFunction(this.options.getNextStep);
        };
        /**
         * Returns a metadata for next page in non-linear wizard.
         * @param {EditorPage} [fromPage] Can be null for the first page
         * @param {Number} [nextIndex] Index of the next page (a page to return)
         * @returns {Object} Page metadata (supplied to ObjectEditor._createPage)
         */
        ObjectWizard.prototype.getNextStep = function (fromPage, nextIndex) {
            return this.options.getNextStep.call(this, fromPage, nextIndex);
        };
        /**
         * Create a default page in case when editor's options have no pages metadata.
         * @protected
         */
        ObjectWizard.prototype._createDefaultPage = function () {
            var that = this, pageInfo;
            if (that.isLinear()) {
                pageInfo = { name: "", title: "" };
            }
            else {
                pageInfo = that.getNextStep(undefined, 0);
            }
            return that._createPage(pageInfo);
        };
        ObjectWizard.prototype._initializeMenu = function () {
            var that = this;
            // initialize editor menu & commands
            that.commands = lang.extend(that.createCommands(), that.options.commands || {});
            that.menu = that.createWizardMenu();
            if (that.menu) {
                that.menu.bindToPart(that);
            }
            that.menuPage = that.createPageMenu();
            if (that.menuPage) {
                that.menuPage.bindToPart(that);
            }
        };
        ObjectWizard.prototype.createWizardMenu = function () {
            return new Menu(this.createWizardMenuDefaults(), this.options.menu);
        };
        ObjectWizard.prototype.createWizardMenuDefaults = function () {
            return Menu.defaultsFor(this.defaultMenus.Wizard, "Wizard", this._getType());
        };
        ObjectWizard.prototype.createPageMenu = function () {
            return new Menu(this.createPageMenuDefaults(), this.options.menuPage);
        };
        ObjectWizard.prototype.createPageMenuDefaults = function () {
            return Menu.defaultsFor(this.defaultMenus.Page, "WizardPage", this._getType());
        };
        /**
         * @protected
         * @override
         * @returns {Object.<string, Command>}
         */
        ObjectWizard.prototype.createCommands = function () {
            var that = this, commands = _super.prototype.createCommands.call(this);
            commands.Backward = core.createCommand({
                execute: function () { that.back(); },
                name: "Backward"
            });
            commands.Forward = core.createCommand({
                execute: function () { that.forward(); },
                name: "Forward"
            });
            return commands;
        };
        /**
         * Create an url query for initialization via navigating to a url
         */
        ObjectWizard.prototype.getState = function (partOptions) {
            if (partOptions) {
                return {
                    type: partOptions.type,
                    id: partOptions.id,
                    page: partOptions.page
                };
            }
            var state = this._getViewModelState();
            if (state) {
                this._state = state;
            }
            return this._state;
        };
        ObjectWizard.prototype.onPageStarted = function (args) {
            this.updateWizardCommands(args.page);
            _super.prototype.onPageStarted.call(this, args);
        };
        ObjectWizard.prototype._activatePage = function (page) {
            var that = this;
            if (!that.isLinear()) {
                // for non-linear wizard we should remove all pages which are to the right from newPage
                var newPageIdx = that.pages.indexOf(page);
                if (newPageIdx < that.pages.count() - 1) {
                    var remItems = that.pages.all().slice(newPageIdx + 1);
                    remItems.forEach(function (page) {
                        if (lang.isFunction(page.dispose)) {
                            page.dispose();
                        }
                    });
                    that.pages.remove(remItems);
                    // also remove pages' violations
                    that._removePageViolations(remItems);
                }
            }
            return _super.prototype._activatePage.call(this, page);
        };
        /**
         * Move wizard to a next page
         * @returns {Boolean} true if wizard changed current page, otherwise - false
         */
        ObjectWizard.prototype.forward = function () {
            var that = this, curIdx = that.pages.indexOf(that.currentPage()), page;
            if (that.isLinear()) {
                if (curIdx < that.pages.count() - 1) {
                    page = that.pages.get(curIdx + 1);
                }
            }
            else {
                var pageInfo_1 = that.getNextStep(that.currentPage(), curIdx + 1);
                if (!pageInfo_1) {
                    return lang.rejected();
                }
                page = lang.find(that.pages.all(), function (page) { return page.name === pageInfo_1.name; });
                page = page || that._createPage(pageInfo_1);
            }
            if (!page) {
                return lang.rejected();
            }
            return that.setCurrentPage(page, /*skipValidation=*/ false).then(function () {
                // focus first pe after forward command is done
                page.focusFirstPE(true /*force*/);
            }, function () {
                // switching was cancelled (probably due to violation checks), remove created page for non-linear wizard
                if (!that.isLinear()) {
                    if (lang.isFunction(page.dispose)) {
                        page.dispose();
                    }
                    that.pages.remove(page);
                }
            });
        };
        ObjectWizard.prototype.back = function () {
            var that = this, curIdx = that.pages.indexOf(that.currentPage());
            if (curIdx > 0) {
                return that.setCurrentPage(that.pages.get(curIdx - 1), /* skipValidation=*/ true);
            }
            return lang.rejected();
        };
        ObjectWizard.prototype.updateWizardCommands = function (page) {
            var that = this;
            page = page || that.currentPage();
            var index = that.pages.indexOf(page), isLast = that.isLinear() ?
                index === that.pages.count() - 1 :
                !(that.getNextStep(page, index + 1));
            that.canSaveAndClose(isLast); // canExecute for BoundCommand `SaveAndClose`
            that.commands.Forward.canExecute(!isLast);
            that.commands.Backward.canExecute(index > 0);
        };
        /**
         * Override base method canSaveAndClose to make it an observable property
         * @observable-property {boolean}
         */
        ObjectWizard.prototype.canSaveAndClose = function (v) {
            if (!arguments.length) {
                return ObjectWizard._get(this, "canSaveAndClose") && _super.prototype.canSaveAndClose.call(this);
            }
            ObjectWizard._set(this, "canSaveAndClose", v);
        };
        ObjectWizard.defaultOptions = {
            pageValidation: "loose",
            getNextStep: undefined,
            menuPage: undefined,
            cssRootClass: "x-editor-base x-editor-wizard"
        };
        ObjectWizard.defaultMenus = {
            Page: {
                items: [
                    {
                        name: "Forward",
                        title: resources["wizard.Forward"],
                        hotKey: "ctrl+enter",
                        hideIfDisabled: true,
                        isDefaultAction: true,
                        icon: "arrow-right"
                    }
                ]
            },
            Wizard: {
                items: [
                    {
                        name: "SaveAndClose",
                        title: resources["save"],
                        icon: "save",
                        hotKey: "ctrl+enter",
                        hideIfDisabled: true
                    },
                    {
                        name: "CancelAndClose",
                        title: resources["cancel"],
                        icon: "cancel"
                    }
                ]
            }
        };
        __decorate([
            lang.decorators.constant(ObjectWizard.defaultMenus)
        ], ObjectWizard.prototype, "defaultMenus");
        return ObjectWizard;
    }(ObjectEditor));
    ObjectWizard.mixin({
        defaultOptions: ObjectWizard.defaultOptions
    });
    core.ui.ObjectWizard = ObjectWizard;
    return ObjectWizard;
});
//# sourceMappingURL=ObjectWizard.js.map