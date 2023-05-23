/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/menu/AppNavMenu"], function (require, exports, core, AppNavMenu) {
    "use strict";
    exports.__esModule = true;
    var lang = core.lang;
    // NOTE: при HMR всегда перегружаются все app-модули, созданные через createModule() и createAreaModule()
    exports.hot = function (sourceModule) {
        var app; // HotApp
        if (sourceModule && sourceModule.hot) {
            if (!sourceModule.id) {
                // this is fatal
                throw new Error("hot-loader: `hot` could not find the `id` property in the `module` you have provided");
            }
            var moduleId = sourceModule.id;
            sourceModule.hot.dispose(function (data) {
                // при dispose передадим в новую версию модуля ссылку на приложение
                data.app = app;
            });
            if (sourceModule.hot.data) {
                app = sourceModule.hot.data.app;
                // вызовем "горячую" перезагрузку приложения
                app.hotReload();
                /*
                let appState = app.stateManager.getCurrentState();
                appState.regionState._partUid = undefined;
                app.stateManager.switchState(appState);
                */
                var area = app.areaManager.getActiveArea();
                if (!area.initialized) {
                    var state = area.currentState.name;
                    area.suspend();
                    area.states = {};
                    area.resume();
                    if (!area.states[state]) {
                        area.currentState = undefined;
                        area.applyCurrentState();
                    }
                    // TODO: т.к. в core.Application нет определенного поля с appToolbar,
                    // то нужно будет искать его по типу AppToolbar среди всех полей
                    var appToolBar = app.appToolbar;
                    if (appToolBar) {
                        var appNavMenu = appToolBar.appNavMenu();
                        appNavMenu.mergeWith(new AppNavMenu(app.areaManager));
                        appToolBar.appNavMenu(appNavMenu);
                        appToolBar.navMenuPresenter.rerender();
                    }
                }
                var regions = area.regionManager.regions;
                lang.forEach(regions, function (region) {
                    var part = region.getActivePart();
                    if (part) {
                        var vm_1 = part.viewModel;
                        /*
                        let changes;
                        if (vm && vm.uow)
                            changes = vm.uow.getChanges();
                        */
                        // TODO: не всегда есть имя парта, например MenuNavPresenter
                        if (part.name) {
                            // не будем создавать черновик
                            part.options["skipDraftCreation"] = true;
                            var newPartState = void 0;
                            if (part.getState)
                                newPartState = part.getState();
                            var newPart_1 = app.createPart(part.name, newPartState);
                            var partHelper = region._activePartHelper;
                            var origQueryUnload = partHelper.overrides.queryUnload;
                            // перегружаем queryUnload, чтобы без вопросов выгрузить парт
                            partHelper.overrides.queryUnload = function () { return true; };
                            region.activatePart(newPart_1, {
                                overrides: partHelper.overrides,
                                isNested: partHelper.isNested,
                                keepAlive: partHelper.keepAlive,
                                freezeUrl: partHelper.freezeUrl,
                                activity: partHelper.activity
                            }).then(function () {
                                // будем подставлять в представление прошлую вью-модель,
                                // только если ничего не поменялось в классе этой вью-модели
                                if (!newPart_1.viewModel || vm_1.constructor === newPart_1.viewModel.constructor)
                                    newPart_1.setViewModel(vm_1);
                            });
                            partHelper.overrides.queryUnload = origQueryUnload;
                        }
                    }
                });
            }
            sourceModule.hot.accept();
        }
        return function (App) {
            if (!sourceModule)
                return App;
            var HotApp = /** @class */ (function (_super) {
                __extends(HotApp, _super);
                function HotApp() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                HotApp.prototype.preinitialize = function () {
                    _super.prototype.preinitialize.call(this);
                    // захолдируем приложение в переменную app
                    app = this;
                };
                HotApp.prototype.hotReload = function () {
                    this._initModules(Object.keys(this["_hotModules"] || {}));
                };
                return HotApp;
            }(App));
            return HotApp;
        };
    };
});
//# sourceMappingURL=hot-loader.js.map