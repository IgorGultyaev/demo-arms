/// <reference path="../../../modules/files/core.d.ts" />
/// <reference types="jquery.fileupload" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import Menu = require("lib/ui/menu/Menu");
import "bootstrap";
import "vendor/jquery.fileupload";
import "vendor/jquery.iframe-transport";
import "vendor/colorbox/jquery.colorbox";
import "xcss!vendor/colorbox/colorbox";
import "xcss!lib/ui/styles/peBinary";
import lang = core.lang;
import Command = core.commands.Command;
import { TraceSource } from "lib/core.diagnostics";
import { IDataFacade } from "lib/interop/.interop";
import { LobPropValue } from "lib/domain/support";
import { Part } from "core.ui";
declare class peBinary extends PropertyEditor {
    /**
     * @constant {Object}
     */
    static defaultOptions: peBinary.Options;
    /**
     * @constant {Object}
     */
    static defaultMenu: Menu.Options;
    /**
     * @observable-property {peBinary.State}
     */
    state: lang.ObservableProperty<peBinary.State>;
    /**
     * @observable-property {String}
     */
    lastError: lang.ObservableProperty<string>;
    options: peBinary.Options;
    isImage: boolean;
    traceSource: TraceSource;
    files: core.files.Module;
    dataFacade: IDataFacade;
    uploadUrl: string;
    uploadChunkSize: number;
    placeholder: string;
    readOnlyEmptyText: string;
    commands: peBinary.KnownCommands;
    menu: Menu;
    private _uploadToken;
    private _dragCounter;
    private inputElement;
    private inputButton;
    private imgThumbnail;
    /**
     * @class peBinary
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peBinary.Options);
    showPlaceholder(): boolean;
    isEmpty(): boolean;
    isUploading(): boolean;
    isServer(): boolean;
    isFail(): boolean;
    isPropLoading(): boolean;
    isReadOnly(): boolean;
    tweakOptions(options: peBinary.Options): void;
    setViewModel(viewModel: any): void;
    protected _onPropChanged(sender: any, value: any): void;
    protected _ensurePropLoaded(): void;
    protected _setStateByValue(propVal: LobPropValue): void;
    protected _onStateChanged(sender: any, state: any): void;
    protected _invalidateCommands(): void;
    onReady(): void;
    protected _reportFileTypeNotSupported(fileName: string): void;
    protected _validateFile(file: any): boolean;
    protected _getUrl(params?: {
        width?: number;
        height?: number;
    }): string;
    protected _openPreview(): void;
    protected _createMenuDefaults(): Menu.Options;
    protected _createMenu(): Menu;
    /**
     * Create commands
     * @protected
     */
    protected createCommands(): peBinary.KnownCommands;
    protected _uploadCancel(): void;
    protected _doRemove(): void;
    protected _doExport(): void;
    protected _doOpen(): void;
    protected _onAdd(data: JQueryFileInputOptions): boolean;
    protected createPropValue(file: any): LobPropValue;
    protected _updateThumbnailImage(): void;
    protected _purgeUploadedFile(resourceId: string): void;
    protected _onUploadSuccess(data: JQueryFileUploadDone): void;
    protected _onUploadFail(data: JQueryFileUploadDone): void;
    protected _onUploadProgress(data: JQueryFileUploadProgressAllObject): void;
    protected _onDisabledChange(disabled: boolean): void;
    protected _disableUploadInput(disabled: boolean): void;
    queryUnload(options?: Part.CloseOptions): string;
    unload(options?: Part.CloseOptions): void;
}
declare namespace peBinary {
    interface Options extends PropertyEditor.Options {
        template?: HandlebarsTemplateDelegate;
        contentType?: string;
        uploadChunkSize?: number;
        uploadUrl?: string;
        thumbnailWidth?: number;
        thumbnailHeight?: number;
        menu?: Menu.Options;
        commands?: lang.Map<core.commands.ICommand | core.commands.ICommandFactory>;
        imgPreviewSettings?: {
            imgError?: string;
        };
        /**
         * file extensions list (e.g. ".jpg,.png,.doc"), A valid MIME type with no extensions, "audio/*", "video/*", "image/*"
         * */
        acceptFileTypes?: string;
        /**
         * Text for empty readonly field
         */
        readOnlyEmptyText?: string;
        /**
         * Text for placeholder, by default resource "peBinary.placeholder" is used
         */
        placeholder?: string;
        /**
         * true - show always / false - show never / "empty" - show for empty
         */
        showPlaceholder?: boolean | "empty";
        /**
         * Module options, usually they are taken from `core.files`.
         */
        files?: core.files.Module;
    }
    interface KnownCommands extends lang.Map<Command> {
        Remove?: Command;
        Export?: Command;
        Open?: Command;
        UploadCancel?: Command;
    }
    const State: {
        Unknown: "unknown";
        Empty: "empty";
        PropLoading: "propLoading";
        Uploading: "uploading";
        Server: "server";
        Fail: "fail";
    };
    type State = (typeof State)[keyof typeof State];
}
export = peBinary;
