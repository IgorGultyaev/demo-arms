/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "./ui/ReportPartBase", "./ui/ReportPagePart", "./ui/ReportPagePartPresenter", "./ui/ReportPart", "./ui/ReportPartPresenter", "./ui/ReportPresenterBase", "./ui/ObjectListExportable", "i18n!lib/nls/resources", "i18n!modules/reporting/nls/resources"], function (require, exports, core, ReportPartBase, ReportPagePart, ReportPagePartPresenter, ReportPart, ReportPartPresenter, ReportPresenterBase, ObjectList, resources, moduleResources) {
    "use strict";
    // extend common resources
    core.lang.forEach(moduleResources, function (value, key) {
        resources[key] = value;
    });
    core.createModule("reporting", function (app, moduleOptions) {
        moduleOptions = moduleOptions || {};
        var formatsConfig = moduleOptions.formats, menuItem, exportMenuItems, exportMenuItemsWOHtml;
        // NOTE: если нет apiVersion, то это v.1 - per 1.36, там эндпоин назывался api/reports
        moduleOptions.apiRoute = moduleOptions.apiRoute || (!app.config.apiVersion ? "api/reports" : "api/_reports");
        if (formatsConfig && formatsConfig.length > 0) {
            exportMenuItems = formatsConfig.map(function (format) {
                return {
                    name: "Export-" + format.name,
                    title: format.name,
                    commandName: "Export",
                    params: { format: format.name, mime: format.mime }
                };
            });
            exportMenuItemsWOHtml = exportMenuItems
                .filter(function (item) { return item.params.format !== "HTML"; });
            // ObjectList menu:
            menuItem = {
                name: "Export",
                title: resources["objectList.exportTo"],
                icon: "export",
                order: 40,
                items: exportMenuItemsWOHtml,
                command: null
            };
            ObjectList.defaultMenus.List.items.push(menuItem);
            ObjectList.defaultMenus.EditableList.items.push(menuItem);
            // ReportPart menu:
            menuItem = {
                name: "Export",
                title: resources["reportPart.openWith"],
                icon: "export",
                order: 30,
                items: exportMenuItems,
                command: null
            };
            ReportPart.defaultMenu.items.push(menuItem);
            // ReportPagePart menu:
            menuItem = core.lang.append({
                items: exportMenuItemsWOHtml
            }, menuItem);
            ReportPagePart.defaultMenu.items.push(menuItem);
        }
        core.registerPart("ReportPart", function (options) {
            return new ReportPart(app, options);
        });
    });
    var reporting = {
        Application: null,
        ReportPartBase: ReportPartBase,
        ReportPart: ReportPart,
        ReportPagePart: ReportPagePart,
        ReportPresenterBase: ReportPresenterBase,
        ReportPagePartPresenter: ReportPagePartPresenter,
        ReportPartPresenter: ReportPartPresenter
    };
    core.reporting = reporting;
    return reporting;
});
//# sourceMappingURL=module-reporting.js.map