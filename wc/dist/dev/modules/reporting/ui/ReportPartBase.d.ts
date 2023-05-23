/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import Menu = require("lib/ui/menu/Menu");
import "lib/ui/menu/MenuButtonsPresenter";
import lang = core.lang;
import Application = core.Application;
import Command = core.commands.Command;
import UriCommand = ReportPartBase.UriCommand;
declare class ReportPartBase extends Component {
    static defaultOptions: ReportPartBase.Options;
    /**
     * @observable-property {ReportPartBase.State}
     */
    state: lang.ObservableProperty<ReportPartBase.State>;
    /**
     * @observable-property {String}
     */
    reportContent: lang.ObservableProperty<string>;
    /**
     * @observable-property {any}
     */
    lastError: lang.ObservableProperty<any>;
    /**
     * @observable-property {String}
     */
    hintMessage: lang.ObservableProperty<string>;
    /**
     * @observable-property {String}
     */
    stateMessage: lang.ObservableProperty<string>;
    /**
     * @observable-property {String}
     */
    title: lang.ObservableProperty<string>;
    options: ReportPartBase.Options;
    app: Application;
    commands: ReportPartBase.KnownCommands;
    menu: Menu;
    protected _commandsAvailable: boolean;
    private _needRefresh;
    /**
     * @constructs ReportPartBase
     * @extends Component
     * @param {Application} app
     * @param {Object} options
     */
    constructor(app: Application, options: ReportPartBase.Options);
    tweakOptions(options: any): void;
    isGenerating(): boolean;
    isInitial(): boolean;
    protected _initializeProps(): void;
    protected _initializeMenus(): void;
    protected _createMenuDefaults(): Menu.Options;
    protected _createMenu(): Menu;
    /**
     * Create commands
     * @protected
     * @returns {{Build: BoundCommand, Export: BoundCommand, OpenReport: BoundCommand}}
     */
    protected createCommands(): ReportPartBase.KnownCommands;
    protected _stateChanged(state: any): void;
    protected invalidateCommands(): void;
    /**
     * Override base getState to add current params into URL.
     */
    getState(): any;
    /**
     * Returns merge result of external params (passed via options) and current params.
     * @return {Object}
     * @protected
     */
    protected getParams(): any;
    protected _doBuild(): lang.Promise<void>;
    protected _doOpen(cmdOptions: any): void;
    protected _downloadReport(url: string, params: ReportPartBase.Params): lang.Promise<void>;
    protected _onError(e: Error): void;
    protected _doGoBack(): void;
    /**
     * Open a nested report
     * @param {Object} cmdOptions
     * @private
     */
    protected _doOpenReport(cmdOptions: any): void;
    protected _getReportPartName(): string;
    processLink(uri: string): boolean;
    /**
     * Parse internal link determining:
     * action name (command name), action spec (some name for command), action params (json object params for command)
     * @param {string} uri
     * @return {{cmdName, cmdSpec, cmdParams}}
     * @protected
     */
    protected _parseUri(uri: string): UriCommand;
    /**
     * Returns params for command determined on parsed uri.
     * @param {Object} parsedUri a result of _parseUri method
     * @returns {Object}
     * @protected
     */
    protected _getCmdParamsFromParsedUri(parsedUri: UriCommand): any;
}
declare namespace ReportPartBase {
    interface Options extends Component.Options {
        urlSuffix?: string;
        reportName?: string;
        menu?: Menu.Options;
        commands?: lang.Map<Command>;
        refresh?: boolean;
        dontCacheXslFo?: boolean;
        params?: any;
        template?: HandlebarsTemplateDelegate;
        bound?: boolean;
        affixTableHeader?: boolean;
        cssClass?: string;
        showTitle?: true;
        title?: string;
    }
    interface KnownCommands extends lang.Map<Command> {
        Build?: Command;
        Export?: Command;
        OpenReport?: Command;
    }
    interface UriCommand {
        cmdName: string;
        cmdSpec: string;
        cmdParams: Object;
    }
    interface Params {
        refresh?: boolean;
        dontCacheXslFo?: boolean;
        format?: string;
        [key: string]: any;
    }
    const State: {
        initial: "initial";
        generating: "generating";
        generated: "generated";
        failed: "failed";
    };
    type State = (typeof State)[keyof typeof State];
}
export = ReportPartBase;
