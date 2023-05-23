/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import ReportPartBase = require("./ReportPartBase");
import Menu = require("lib/ui/menu/Menu");
import reporting = require("modules/reporting/module-reporting-app");
import Command = core.commands.Command;
import KnownCommands = ReportPagePart.KnownCommands;
declare class ReportPagePart extends ReportPartBase {
    static defaultOptions: ReportPagePart.Options;
    static defaultMenu: Menu.Options;
    options: ReportPagePart.Options;
    commands: ReportPagePart.KnownCommands;
    /**
     * @constructs ReportPagePart
     * @extends ReportPartBase
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: reporting.Application, options: ReportPagePart.Options);
    /**
     * Create commands
     * @protected
     * @override
     * @returns {Object.<string, Command>}
     */
    protected createCommands(): KnownCommands;
    protected _createMenuDefaults(): Menu.Options;
    protected invalidateCommands(): void;
    protected _doPrint(): void;
    protected _getReportPartName(): string;
}
declare namespace ReportPagePart {
    interface Options extends ReportPartBase.Options {
    }
    interface KnownCommands extends ReportPartBase.KnownCommands {
        Print?: Command;
        GoBack?: Command;
    }
}
export = ReportPagePart;
