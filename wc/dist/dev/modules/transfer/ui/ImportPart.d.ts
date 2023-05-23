/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import * as View from "lib/ui/handlebars/View";
import * as transfer from "modules/transfer/Transfer";
import * as Menu from "lib/ui/menu/Menu";
import "xcss!./styles/transferPart";
import IPart = core.ui.IPart;
import ICommand = core.commands.ICommand;
import DomainObjectData = core.interop.DomainObjectData;
import MenuOptions = Menu.Options;
import { Part } from "core.ui";
declare class ImportPart extends View {
    static defaultOptions: ImportPart.Options;
    title: string;
    app: core.Application;
    options: ImportPart.Options;
    client: transfer.ImportClient;
    isClosing: boolean;
    element: JQuery;
    inputElement: JQuery;
    inputButton: JQuery;
    resourceId: string;
    files: core.files.Module;
    messages: Array<string>;
    menu: Menu;
    suspendMenu: Menu;
    commands: core.lang.Map<ICommand>;
    private _uploadToken;
    private $menuContainer;
    /**
     * @observable-property {String}
     */
    stateTitle: core.lang.ObservableProperty<string>;
    /**
     * @observable-property {String}
     */
    stateSeverity: core.lang.ObservableProperty<string>;
    /**
     * @observable-property {String}
     */
    errorMessage: core.lang.ObservableProperty<string>;
    /**
     * @constructs ImportPart
     * @extends View
     * @param app
     * @param options
     */
    constructor(app: core.Application, options: ImportPart.Options);
    state(): ImportPart.State;
    state(v: ImportPart.State): void;
    protected onStateChange(v: ImportPart.State): void;
    detailPart(): IPart;
    detailPart(v: IPart): void;
    progress(): number;
    progress(v: number): void;
    protected onProgressChange(progress: number): void;
    protected _initClient(): void;
    protected createCommands(): core.lang.Map<ICommand>;
    protected createMenu(): Menu;
    isRunning(): boolean;
    isProgress(): boolean;
    protected onReady(): void;
    protected _removeSuspendedMenu(): void;
    resume(action: any): void;
    close(): void;
    abort(): void;
    protected _upload(data: any): void;
    protected _onUploadProgress(data: any): void;
    protected _onUploadSuccess(data: any): void;
    protected _onUploadFail(data: any): void;
    protected _uploadCancel(): void;
    startImport(): void;
    protected onImportStarted(): void;
    protected onHistoryUpdated(sender: any, args: {
        history: Array<transfer.TransferOperationState>;
    }): void;
    protected onRunning(): void;
    protected onAborting(): void;
    protected onVersionConflict(sender: any, args: {
        state: transfer.TransferOperationState;
    }): void;
    protected onUnresolvedObjects(sender: any, args: {
        state: transfer.TransferOperationState;
    }): void;
    protected _openViewer(objData: DomainObjectData): void;
    protected onErrorOnProcessObject(sender: any, args: {
        state: transfer.TransferOperationState;
    }): void;
    protected _updateMenu(metadata: MenuOptions): void;
    protected onImportCompleted(): void;
    protected onImportFailed(sender: any, args: any): void;
    protected onImportAborted(): void;
    unload(options?: Part.CloseOptions): void;
    dispose(options?: Part.CloseOptions): void;
}
declare namespace ImportPart {
    interface Options extends View.Options {
        title?: string;
        scenario?: string;
        client?: transfer.ImportClient;
        commands?: core.lang.Map<ICommand>;
        menu?: MenuOptions;
        menus?: {
            versionConflict: MenuOptions;
            unresolvedObjects: MenuOptions;
            errorOnProcessObject: MenuOptions;
        };
    }
    enum State {
        connecting = 0,
        initial = 1,
        uploading = 2,
        startingUp = 3,
        importing = 4,
        aborting = 5,
        aborted = 6,
        failed = 7,
        suspended = 8,
        completed = 9,
    }
}
export = ImportPart;
