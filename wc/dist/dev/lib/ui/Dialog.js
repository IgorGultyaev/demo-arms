/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "lib/ui/menu/Menu", "lib/utils", "xhtmpl!lib/ui/templates/Dialog.hbs", "i18n!lib/nls/resources", "lib/ui/menu/MenuPresenter", "xcss!lib/ui/styles/dialog", "bootstrap", "jquery-ui/core"], function (require, exports, $, core, View, Menu, utils, defaultTemplate, resources) {
    "use strict";
    var lang = core.lang;
    var Dialog = /** @class */ (function (_super) {
        __extends(Dialog, _super);
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
        function Dialog(options) {
            var _this = this;
            options = Dialog.mixOptions(options, Dialog.defaultOptions);
            _this = _super.call(this, options) || this;
            _this._initBody();
            _this.setNavigationService(new DialogNavigationService(_this, Dialog));
            _this.commands = lang.extend(_this.commands || {}, _this.options.commands);
            _this.menu = _this.createMenu();
            if (_this.menu) {
                // NOTE: we do not use bindToPart here as we'll assign close command for all items below
                _this.menu.bindToCommands(_this.commands, _this);
                _this.menu.acceptVisitor(function (item) {
                    if (!item.command) {
                        // NOTE: нельзя шарить один экземпляр команды между разными пунктами меню,
                        // так как их доступность (canExecute) может быть различна
                        item.command = _this.createCloseCommand();
                    }
                    // добавляем сам диалог в параметры команд меню
                    item.params = lang.extend(item.params || {}, { dialog: _this });
                });
            }
            if (options) {
                utils.subscribeOnEvents(_this, options, _this.events);
            }
            return _this;
        }
        Dialog.prototype._initBody = function () {
            var that = this, bodyPart = that.options.body;
            if (!bodyPart && that.options.html) {
                bodyPart = {
                    render: function (domElement) {
                        $(domElement).html(that.options.html);
                    }
                };
            }
            if (!bodyPart && that.options.text) {
                bodyPart = {
                    render: function (domElement) {
                        $(domElement)
                            .text(that.options.text)
                            .addClass("modal-body-text");
                    }
                };
            }
            if (bodyPart) {
                if (bodyPart && core.lang.isFunction(bodyPart)) {
                    bodyPart = bodyPart.call(that);
                }
                that.body(bodyPart);
                // initialize part' userSettings
                var app = core.Application.current, userSettingsStore = app && app.userSettingsStore, userSettings = bodyPart.userSettings;
                if (userSettingsStore && userSettings && userSettings.bind) {
                    var name_1 = userSettings.name || bodyPart.name;
                    // NOTE: we're subscribing on part's UserSettings if and only if settings have name (either part's name or its own name)
                    if (name_1) {
                        userSettings.name = name_1;
                        userSettings.bind("change", that.onPartUserSettingsChanged, that);
                        // the part has named userSettings, let's initialize them
                        var args = { part: name_1, scope: userSettings.scope, region: "dialog" };
                        args.bundle = userSettingsStore.load(args);
                        userSettings.initialize(args.bundle);
                    }
                }
                // TODO: that.registerChild(bodyPart, {disposeOnUnload: false, keepOnUnload: true});
                //that.registerChild(bodyPart);
            }
        };
        Dialog.prototype.onPartUserSettingsChanged = function (userSettings, bundle) {
            var args = {
                part: userSettings.name,
                bundle: bundle,
                region: "dialog",
                scope: userSettings.scope
            };
            core.Application.current.userSettingsStore.save(args);
        };
        /**
         * Создает команду закрытия диалога.
         * Такая команда используется по умолчанию, если для пункта меню не задана другая команда.
         */
        Dialog.prototype.createCloseCommand = function () {
            return core.createCommand({
                execute: function (args) {
                    args.dialog.close(args.name);
                }
            });
        };
        Dialog.prototype.createMenu = function () {
            var that = this, menu = that.options.menu;
            if (menu === false || menu === null)
                return null;
            if (menu === true)
                menu = undefined; // will be ignored while merging
            return new Menu(that.createMenuDefaults(), menu);
        };
        Dialog.prototype.createMenuDefaults = function () {
            return Menu.defaultsFor(Dialog.defaultMenu, "Dialog");
        };
        Dialog.prototype.updateMenu = function (menu) {
            var that = this;
            if (that.menu) {
                that.menu.dispose();
            }
            that.options.menu = menu;
            that.menu = that.createMenu();
            if (that.menu) {
                // NOTE: we do not use bindToPart here as we'll assign close command for all items below
                that.menu.bindToCommands(that.commands, that);
            }
        };
        Dialog.prototype.doRender = function (domElement) {
            var that = this;
            that._lastFocus = document.activeElement;
            // simulate click on document to close other opened popups
            //core.$document.click();
            // NOTE: Bootstrap modal dialog:
            //	.modal-open      - body class for killing the scroll
            // 	.modal           - container to scroll within
            // 	.modal-dialog    - positioning shell for the actual modal
            // 	.modal-content   - actual modal w/ bg and corners and shit
            that.$dialog = $("<div class='modal fade' role='dialog' tabindex='-1' aria-hidden='true'>" +
                "<div class='modal-dialog'><div class='modal-content x-dialog' /></div></div>")
                .attr("aria-labelledby", that.header);
            //.stopBubbling(); // prevent bubbling of mouse and keyboard events outside of the element
            var $dialogShell = that.$dialog.find(".modal-dialog");
            var $dialogContent = $dialogShell.find(".modal-content");
            if (that.options.rootCssClass) {
                that.$dialog.addClass(that.options.rootCssClass);
            }
            if (that.options.dialogCssClass) {
                $dialogShell.addClass(that.options.dialogCssClass);
            }
            if (that.options.wide) {
                $dialogShell.addClass("modal-lg");
            }
            if (that.options.flexHeight) {
                $dialogContent.addClass("x-dialog--flex-height");
            }
            // NOTE: it's important to append _dialog to DOM before rendering.
            // Otherwise child parts can't determine they are inside dialog or not.
            that.$dialog.appendTo(domElement || document.body);
            _super.prototype.doRender.call(this, $dialogContent);
            if (!core.platform.isMobileDevice) {
                that.$dialog.focus();
            }
            that.$dialog.on("hide.bs.modal", function (e) { return that._onModalHide(e); });
            // при закрытии возвращаем результат
            that.$dialog.on("hidden.bs.modal", function (e) { return that._onModalHidden(e); });
            // после показа
            that.$dialog.on("shown.bs.modal", function (e) { return that._onModalShown(e); });
            that.$dialog.modal({
                backdrop: "static",
                keyboard: false
            });
        };
        /**
         * Shows dialog. NOTE: before 1.35 method used to return a promise of closing dialog, now it's promise of opening.
         * For opening and getting a result use `open` method.
         * @param domElement
         * @returns {Promise}
         */
        Dialog.prototype.render = function (domElement) {
            var that = this;
            that._throwIfDisposed();
            if (that._closeSignal) {
                return that._closeSignal;
            }
            this.header = this.getHeader();
            that.beforeRender(domElement);
            that._shownSignal = lang.deferred();
            that._closeSignal = lang.deferred();
            that.doRender(domElement);
            // NOTE: afterRender will be called in 'shown.bs.modal' event handler
            // returning a Promise of 'shown.bs.modal' event
            return that._shownSignal.promise();
        };
        Dialog.prototype.getHeader = function () {
            return this.header || this.options.header;
        };
        /**
         * Shows the dialog and wait when it will be closed
         * @param {JQuery|HTMLElement} [domElement]
         * @returns {lang.Promise<any>} Promise will be resolved when the dialog is closed (actually hidden)
         */
        Dialog.prototype.open = function (domElement) {
            this.render(domElement);
            return this._closeSignal.promise();
        };
        /**
         * Hides and destroys the dialog
         * @param [result] An result to return as resolved value of open's promise
         * @returns {lang.Promise<any>} Promise will be resolved when the dialog is hidden
         */
        Dialog.prototype.close = function (result) {
            this.result = result;
            this._unloadOptions = { reason: "close", activityContext: {} };
            // NOTE: In old browsers Modal is closed synchronously (because of animation is not supported).
            // Therefore handler _onModalHidden executes synchronously too. And this handler resets _closeSignal to
            // undefined. So we must cache _closeSignal first.
            var signal = this._closeSignal.promise();
            this._hideModal();
            return signal;
        };
        /**
         * Hides and destroys the dialog, but doesn't resolve Promise returned from `open`. Then opens another dialog,
         * which uses Promise from current dialog.
         * @param {Dialog} dialog
         * @returns {lang.Promise<void>}
         */
        Dialog.prototype.closeAndReplace = function (dialog) {
            var that = this, closeTask = that._closeSignal;
            // substitute original _closeSignal
            that._closeSignal = lang.deferred();
            return that.close({}) // pass any not undefined result, otherwise returned promise will be rejected
                .always(function () {
                // Теперь текущий диалог закрыт, но promise, возвращенный его open не разрешен, т.о. вызвавший его код
                // все еще ждет. Мы же откроем новый диалог и передадим в него этот deferred (closeTask), чтобы
                // разрешить при его закрытии. Код, открывший исходный диалог, ничего не заметит.
                dialog.open();
                dialog._closeSignal = closeTask;
                // TODO: wait for ready/shown event
            });
        };
        /**
         * Hides the dialog, but doesn't destroy it. So the dialog can be reopened later.
         * @param result
         * @returns {lang.Promise<any>} Promise will be resolved when the dialog is hidden
         */
        Dialog.prototype.hide = function (result) {
            this._keepAlive = true;
            return this.close(result);
        };
        Dialog.prototype.suspend = function () {
            var that = this;
            that._keepAlive = true;
            that._suspending = true;
            that._hideSignal = lang.deferred();
            that._hideModal();
            return that._hideSignal.promise();
        };
        Dialog.prototype.resume = function () {
            var that = this;
            var closeSignal = that._closeSignal;
            that._closeSignal = undefined;
            that.open(that._dialogParent);
            that._closeSignal = closeSignal;
            // TODO: здесь надо вернуть Promise от события shown (диалог показан)
        };
        Dialog.prototype.dispose = function (options) {
            this._hideModal();
            _super.prototype.dispose.call(this, options);
            this.trigger(this.events.DISPOSED, this);
        };
        Dialog.prototype._hideModal = function () {
            this._shownSignal = null;
            var $dialog = this.$dialog;
            if ($dialog) {
                $dialog.modal("hide");
            }
        };
        Dialog.prototype._closeExternally = function () {
            var that = this;
            if (that._closing) {
                return;
            }
            that._closing = true;
            var body = that.body();
            if (body && body.queryUnload) {
                that._unloadOptions = { reason: "close", activityContext: {} };
                var reasonToStayOrDefer = body.queryUnload(that._unloadOptions);
                core.lang.async.then(reasonToStayOrDefer, function (reasonToStay) {
                    if (!reasonToStay) {
                        that._hideModal();
                    }
                    that._closing = undefined;
                }, function () {
                    that._closing = undefined;
                });
            }
            else {
                that._hideModal();
                that._closing = undefined;
            }
        };
        Dialog.prototype._onModalShown = function (e) {
            var that = this, $dialog = that.$dialog;
            that.afterRender();
            that.trigger(that.events.LOAD, that);
            // устанавливаем фокус на первый элемент ввода
            if (!core.platform.isMobileDevice) {
                var $focusable = that.$dialog.find(":input:tabbable:first");
                if ($focusable.length) {
                    $focusable.focus();
                }
            }
            // необработанные нажатия клавиш перенаправляем в меню
            $dialog.keyup(function (e) {
                if (that.menu && that.menu.executeHotkey(e)) {
                    return false;
                }
            });
            // NOTE: Диалог может потерять фокус (например, из-за явного вызова blur) и тогда клавиатурные события внутри
            // диалога перестанут обрабатываться. Поэтому для обработки ESC подписываемся на document, а не на $dialog,
            // и фильтруем по активному диалогу.
            that.jqOn(core.html.$document, "keydown", function (e) {
                if (e.which !== core.html.keyCode.ESCAPE || $dialog[0] !== ModalManager.instance.activeModal) {
                    return;
                }
                if ($dialog.find(".modal-body").has(e.target).length) {
                    // фокус был внутри .modal-body - снимаем фокус, следующее нажатие ESC закроет диалог
                    // NOTE: Важно оставить фокус внутри диалога, иначе клавиатурные события внутри диалога
                    // перестанут обрабатываться. Поэтому фокусируем сам элемент диалога.
                    $dialog.focus();
                }
                else {
                    // фокус был за пределами .modal-body - закрываем диалог
                    that._closeExternally();
                }
            });
            if (that._shownSignal) {
                that._shownSignal.resolve();
                that._shownSignal = null;
            }
        };
        Dialog.prototype._onModalHide = function (e) {
            var that = this, args = { result: that.result, cancel: false };
            that.trigger(that.events.CLOSING, that, args);
            if (args.cancel) {
                e.preventDefault();
                return false;
            }
            that.result = args.result;
            that.trigger(that.events.CLOSED, that, args);
            that.jqOff(core.html.$document, "keydown");
            return true;
        };
        Dialog.prototype._onModalHidden = function (e) {
            var that = this;
            _super.prototype.unload.call(this);
            if (that.options.autoDispose && !that._keepAlive) {
                var bodyPart = that.body();
                if (bodyPart && bodyPart.dispose) {
                    bodyPart.dispose(this._unloadOptions);
                }
                _super.prototype.dispose.call(this);
            }
            that._keepAlive = undefined;
            if (that._suspending) {
                // suspending - we're going forward, backup dialog's parent to use to in 'resume' later
                that._dialogParent = that.$dialog.parent();
            }
            that.$dialog.remove();
            that.$dialog = undefined;
            var hideSignal = that._hideSignal;
            if (hideSignal) {
                hideSignal.resolve();
                that._hideSignal = undefined;
            }
            if (!that._suspending) {
                // close/hide (close w/o dispose) - we're going backward
                if (that._lastFocus && !core.platform.isMobileDevice) {
                    //that._lastFocus.focus(); - doesn't work in IE8 if the element '_lastFocus' became invisible
                    $(that._lastFocus).focus();
                }
                var signal = that._closeSignal;
                if (signal) {
                    that._closeSignal = undefined;
                    if (that.result !== undefined) {
                        signal.resolve(that.result);
                    }
                    else {
                        signal.reject();
                    }
                }
            }
            that._suspending = undefined;
            if (core.html.$body.find(".modal:visible").length) {
                // there are other opened modals - restore class .modal-open on body
                core.html.$body.addClass("modal-open");
            }
            // NOTE: BS modal hides window scroll-bars on opening and restore them on closing,
            // so viewport size may be changed. We must notify about these changes.
            core.html.notifyDOMChanged();
        };
        /**
         * Opens a nested dialog with part.
         * @param {object} opt
         * @param {string|IPart} opt.part Part name or instance to activate
         * @param {object} [opt.partOptions] Part's options if `part` is string. The object will be passed into part's constructor.
         * @return {Promise<any>}
         */
        Dialog.openPart = function (opt) {
            var dialog = getDialogInstance(opt);
            return dialog.open();
        };
        /**
         * @enum {String}
         * Names of events raised by Dialog
         */
        Dialog.events = {
            LOAD: "load",
            CLOSING: "closing",
            CLOSED: "closed",
            DISPOSED: "disposed"
        };
        /**
         * Default options for Dialog.
         */
        Dialog.defaultOptions = {
            flexHeight: true,
            template: defaultTemplate,
            unbound: true,
            autoDispose: true
        };
        /**
         * Default menu metadata
         */
        Dialog.defaultMenu = {
            items: [
                { name: "ok", title: resources.ok, isDefaultAction: true },
                { name: "cancel", title: resources.cancel }
            ]
        };
        __decorate([
            lang.decorators.constant(Dialog.events)
        ], Dialog.prototype, "events");
        __decorate([
            lang.decorators.observableAccessor()
        ], Dialog.prototype, "body");
        return Dialog;
    }(View));
    Dialog.mixin({
        defaultOptions: Dialog.defaultOptions,
        defaultMenu: Dialog.defaultMenu
    });
    function getDialogInstance(options, dialogClass) {
        var part = getPartInstance(options);
        if (part.applyHostContext) {
            var partNavOpts = part.applyHostContext({ host: "dialog" });
            if (partNavOpts) {
                options = lang.appendEx(options, partNavOpts, { deep: true });
            }
        }
        var dialogOptions = lang.extend({ body: part }, options.dialogOptions);
        var cls = dialogClass || Dialog;
        return new cls(dialogOptions);
    }
    function getPartInstance(options) {
        var partOption = options.part, part;
        if (typeof partOption === "string") {
            part = core.createPart(partOption, options.partOptions);
        }
        else {
            part = partOption;
        }
        return part;
    }
    var DialogNavigationService = /** @class */ (function () {
        function DialogNavigationService(dialog, dialogClass) {
            var _this = this;
            this.dialog = dialog;
            this.dialogClass = dialogClass;
            this._transitions = [];
            dialog.bind(Dialog.events.DISPOSED, function () {
                _this.dialog = null;
            });
        }
        DialogNavigationService.prototype.navigate = function (options) {
            var _this = this;
            if (!this.dialog) {
                return this._openPart(options);
            }
            if (options.part !== this.dialog.body()) {
                return this._openNested(options);
            }
            this.dialog.open();
            //return lang.resolved(this.dialog.body());
            // wait for 'shown.bs.modal' event
            return this.dialog._shownSignal.promise().then(function () { return _this.dialog.body(); });
        };
        DialogNavigationService.prototype.openModal = function (options) {
            return this.navigate(options);
        };
        /**
         * Suspend active part and activate the specified part in context of the activity.
         * @param {Object} options
         * @returns {Promise}
         */
        DialogNavigationService.prototype._openNested = function (options) {
            if (!options || !options.part) {
                throw new Error("NavigationService.navigate: options.part wasn't specified");
            }
            var that = this;
            that._transitions.push({
                sourceDialog: that.dialog,
                callback: options.onReturn || lang.noop
            });
            var dialog = that._getDialogInstance(options);
            if (dialog.options.overlay) {
                return dialog.open()
                    .always(function (result) {
                    // NOTE: open's promise will be resolved when that dialog is closed (i.e. user went back)
                    var tran = that._transitions.pop();
                    tran.callback(result || {});
                });
            }
            else {
                return that.dialog.suspend()
                    .then(function () { return dialog.open(); })
                    .always(function (result) {
                    // NOTE: open's promise will be resolved when that dialog is closed (i.e. user went back)
                    var tran = that._transitions.pop();
                    tran.callback(result || {});
                    tran.sourceDialog.resume();
                });
            }
        };
        DialogNavigationService.prototype._openPart = function (options) {
            var dialog = this._getDialogInstance(options);
            return dialog.open();
        };
        DialogNavigationService.prototype.close = function (result) {
            return this.dialog.close(result);
        };
        DialogNavigationService.prototype.leave = function (result) {
            return this.dialog.hide(result);
        };
        DialogNavigationService.prototype.replace = function (options) {
            var that = this, dialog = that._getDialogInstance(options);
            return that.dialog.closeAndReplace(dialog).then(function () {
                // Теперь this.dialog закрыт, но promise, возвращенный его open не разрешен. Т.о. вызвавший его код все
                // еще ждет (см. _openNested). Этот promise будет разрешен при закрытии нового диалога.
                that.dialog = dialog;
                return dialog.body();
            });
            /*	WAS: старая реализация по замене body: проблемы с меню и опциями
                    let dialog = this.dialog,
                        body = dialog.body();
                    if (body) {
                        dialog.unregisterChild(body);
                    }
                    body = this._getPartInstance(options);
                    dialog.body(body);
                    dialog.registerChild(body, !(options.activateOptions && options.activateOptions.keepAlive));
                    body.render(dialog.$dialog.find(".modal-body"));
            
                    return lang.resolved(body);
            */
        };
        DialogNavigationService.prototype._getDialogInstance = function (options) {
            return getDialogInstance(options, this.dialogClass);
        };
        return DialogNavigationService;
    }());
    // modal element can host other overlays
    core.html.overlay.targets.push(".modal");
    // a service component to focus the modal with the highest z-index
    var ModalManager = /** @class */ (function () {
        function ModalManager() {
            this.items = [];
        }
        ModalManager.prototype.add = function (element) {
            var $element = $(element);
            this.items.push({
                $element: $element,
                zIndex: $element.zIndex()
            });
        };
        ModalManager.prototype.remove = function (element) {
            var idx = lang.findIndex(this.items, function (item) { return item.$element[0] === element; });
            if (idx >= 0) {
                this.items.splice(idx, 1);
            }
        };
        ModalManager.prototype.enforceFocus = function () {
            var that = this, item, modal; // Bootstrap Modal
            if (!that.items.length) {
                that.activeModal = undefined;
                return;
            }
            // find item with the highest zIndex
            that.items = lang.sortBy(that.items, "zIndex");
            item = lang.last(that.items);
            // get Bootstrap modal
            modal = item.$element.data("bs.modal");
            if (modal) {
                modal.enforceFocus();
            }
            that.activeModal = item.$element[0];
        };
        ModalManager.instance = new ModalManager();
        return ModalManager;
    }());
    // track events from BS modals
    var modalManager = ModalManager.instance;
    core.html.$document
        .on("show.bs.modal", function (e) {
        modalManager.add(e.target);
    })
        .on("shown.bs.modal", function () {
        modalManager.enforceFocus();
    })
        .on("hide.bs.modal", function (e) {
        modalManager.remove(e.target);
    })
        .on("hidden.bs.modal", function () {
        modalManager.enforceFocus();
    });
    core.ui.Dialog = Dialog;
    return Dialog;
});
//# sourceMappingURL=Dialog.js.map