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
import PartWithFilterMixin = require("lib/ui/PartWithFilterMixin");
import Application = core.Application;
import Command = core.commands.Command;
import KnownCommands = ReportPart.KnownCommands;
import IFilterPart = core.ui.IFilterPart;
declare class ReportPart extends ReportPartBase {
    static defaultOptions: ReportPart.Options;
    static defaultMenu: Menu.Options;
    options: ReportPart.Options;
    commands: ReportPart.KnownCommands;
    filter: IFilterPart;
    protected _fieldWithFilterMenu: string;
    /**
     * @constructs ReportPart
     * @extends ReportPartBase
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: Application, options: ReportPart.Options);
    protected _initializeProps(): void;
    protected _createMenuDefaults(): Menu.Options;
    protected _createMenu(): Menu;
    /**
     * Create commands
     * @protected
     * @override
     * @returns {Object.<string, Command>}
     */
    protected createCommands(): KnownCommands;
    protected _doNavigate(cmdOptions: any): void;
    protected getParams(): any;
    protected showFilterError(error: string): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
interface ReportPart extends PartWithFilterMixin {
}
declare namespace ReportPart {
    interface Options extends ReportPartBase.Options, PartWithFilterMixin.Options {
        autoGenerate?: boolean;
        isNested?: boolean;
    }
    interface KnownCommands extends ReportPartBase.KnownCommands {
        Navigate?: Command;
        GoBack?: Command;
    }
}
export = ReportPart;
