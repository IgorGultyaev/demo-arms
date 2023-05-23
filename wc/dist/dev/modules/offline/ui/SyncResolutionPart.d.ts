/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import Carousel = require("lib/ui/Carousel");
import List = require("lib/ui/list/List");
import Menu = require("lib/ui/menu/Menu");
import DomainObjectMap = require("lib/domain/DomainObjectMap");
import "lib/ui/ConfirmDialog";
import DataSynchronizer = require("lib/interop/DataSynchronizer");
import lang = core.lang;
import { IDomainObject, UnitOfWork } from "lib/domain/.domain";
import { ICommand } from "lib/core.commands";
import { PartCloseOptions } from "lib/ui/.ui";
import { InteropError, ObjectIdentity } from "lib/interop/.interop";
declare class SyncResolutionPart extends View {
    static defaultOptions: SyncResolutionPart.Options;
    static defaultMenu: Menu.Options;
    appStateRestore: core.AppState;
    menu: Menu;
    commands: lang.Map<ICommand>;
    options: SyncResolutionPart.Options;
    app: core.Application;
    list: List<SyncResolutionPart.ObjectListItem>;
    carousel: Carousel<DataSynchronizer.SyncFailture>;
    syncResult: DataSynchronizer.SyncFailtureEventArgs;
    uow: UnitOfWork;
    resolved: DomainObjectMap<SyncResolutionPart.ObjectListItem.Status>;
    /**
     * @class SyncResolutionPart
     * @extends View
     * @param {Object} options
     */
    constructor(options: SyncResolutionPart.Options);
    /**
     * @observable-property {Boolean}
     */
    hasErrors: lang.ObservableProperty<boolean>;
    setViewModel(syncResult: DataSynchronizer.SyncFailtureEventArgs): void;
    dispose(options?: PartCloseOptions): void;
    /**
     * @protected
     * @returns {{Retry: (Command), CancelAll: (Command), Cancel: (Command), Next: (Command), Close: (Command), GoOffline: (Command)}}
     */
    createCommands(): lang.Map<ICommand>;
    removeCurrent(): void;
    /**
     * Return title for "Next" command (remove the current error and retry on the last one).
     * It's used in template.
     * @returns {String}
     */
    getCmdNextTitle(): string;
    /**
     * Count of errors originally in server's response. It's used in template.
     * @returns {integer}
     */
    errorCountOriginal(): number;
    /**
     * Count of errors currently in courusel. It's used in template.
     * @returns {integer}
     */
    errorCountCurrent(): number;
    retrySync(): void;
    close(): void;
    protected _createList(): List<SyncResolutionPart.ObjectListItem>;
    protected _initListItems(): void;
    protected _createListItem(obj: IDomainObject, failure: DataSynchronizer.SyncFailture): SyncResolutionPart.ObjectListItem;
    protected _getListItemStatusFromError(obj: IDomainObject, serverError: InteropError): SyncResolutionPart.ObjectListItem.Status;
    protected _findIdentity(identities: ObjectIdentity[], obj: IDomainObject): ObjectIdentity;
}
declare namespace SyncResolutionPart {
    interface Options extends View.Options {
        app?: core.Application;
        menu?: Menu.Options;
        commands?: lang.Map<ICommand>;
    }
    class ObjectListItem extends lang.Observable {
        isLoaded: boolean;
        /**
         * @constructs ObjectListItem
         * @extends Observable
         * @param object
         */
        constructor(object: IDomainObject);
        /**
         * @observable-property {DomainObject}
         */
        object: lang.ObservableProperty<IDomainObject>;
        /**
         * @observable-property {ObjectListItem.statuses}
         */
        status: lang.ObservableProperty<ObjectListItem.Status>;
        statusInfo(): ObjectListItem.StatusInfo;
        command(): string;
        type(): string;
        id(): string;
        load(): lang.Promise<ObjectListItem>;
    }
    namespace ObjectListItem {
        const Status: {
            violation: "violation";
            obsolete: "obsolete";
            notFound: "notFound";
            removed: "removed";
            resolved: "resolved";
        };
        type Status = (typeof Status)[keyof typeof Status];
        interface StatusInfo {
            text: string;
            icon: string;
            cssClass: string;
        }
    }
}
export = SyncResolutionPart;
