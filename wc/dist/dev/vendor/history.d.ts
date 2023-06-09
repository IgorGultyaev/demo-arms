// Type definitions for History.js 1.8.0
// Project: https://github.com/browserstate/history.js
// Definitions by: Boris Yankov <https://github.com/borisyankov/>, Gidon Junge <https://github.com/gjunge/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


interface HistoryAdapter {
    bind(element: any, event: string, callback: () => void);
    trigger(element: any, event: string);
    onDomLoad(callback: () => void);
}

// Since History is defined in lib.d.ts as well
// the name for our interfaces was chosen to be Historyjs
// However at runtime you would need to do
// https://github.com/borisyankov/DefinitelyTyped/issues/277
// var Historyjs: Historyjs = <any>History;

interface Historyjs {

    enabled: boolean;

    pushState(data: any, title: string, url: string, queue?: boolean);
    replaceState(data: any, title: string, url: string, queue?: boolean);
    getState(friendly?: boolean, create?: boolean): HistoryState;
	getStateId (passedState: HistoryState): string;
	getStateById (id: string): HistoryState;
    getStateByIndex(index: number): HistoryState;
    getCurrentIndex(): number;
    getHash(): string;

    Adapter: HistoryAdapter;

    back(): void;
    forward(): void;
    go(x: Number): void;

    log(...messages: any[]): void;
    debug(...messages: any[]): void;

    options: HistoryOptions;

	/**
	 * History.setTitle(title)
	 * Applies the title to the document
	 * @param {HistoryState} newState
	 * @return {Boolean}
	 */
	setTitle (newState: HistoryState): boolean
	clearQueue();
	clearAllIntervals();
	getRootUrl(): string;

	emulated: {
		hashChange?;
		pushState?;
	}
}

interface HistoryState {
    data?: any;
    title?: string;
    url: string;
	hashedUrl?: string;
	cleanUrl?: string;
}

interface HistoryOptions {
    hashChangeInterval?: number;
    safariPollInterval?: number;
    doubleCheckInterval?: number;
    disableSuid?: boolean;
    storeInterval?: number;
    busyDelay?: number;
    debug?: boolean;
    initialTitle?: string;
    html4Mode?: boolean;
    delayInit?: number;


}
//declare var History: Historyjs;
