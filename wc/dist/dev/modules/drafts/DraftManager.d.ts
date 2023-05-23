/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
declare class DraftManager extends core.lang.Observable {
    static Event_CreateDraft: string;
    app: core.Application;
    private _stack;
    private _subscription;
    /**
     * @constructs DraftManager
     * @extends Observable
     * @param {Application} app
     */
    constructor(app: core.Application);
    /**
     * Count of active events.
     * @observable-property {Number}
     */
    count: core.lang.ObservableProperty<number>;
    getDrafts(): DraftManager.Draft[];
    addDraft(draft: DraftManager.Draft): void;
    removeDraft(draft: any): void;
    removeAllDrafts(): void;
    updateDraft(draft: any): void;
    restoreDraft(draft: DraftManager.Draft): void;
    protected _loadData(): DraftManager.Draft[];
    protected _saveData(): void;
    protected _notify(): void;
    dispose(): void;
}
declare namespace DraftManager {
    interface Draft {
        created: Date;
        title: string;
        appState: core.AppState;
        autoRecovery?: boolean;
        description?: string;
    }
}
export = DraftManager;
