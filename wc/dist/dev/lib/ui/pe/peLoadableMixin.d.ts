/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import DataLoadEventArgs = peLoadableMixin.DataLoadEventArgs;
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import { LoadQuerySpec, LoadOptions } from "lib/interop/.interop";
interface peLoadableMixin extends PropertyEditor {
}
declare abstract class peLoadableMixin {
    /**
     * isEmpty.
     * @observable-property {peObjectRadio#state}
     */
    state: lang.ObservableProperty<peLoadableMixin.State>;
    isDataLoaded: boolean;
    lastError: any;
    protected _onDataLoading(args: DataLoadEventArgs): void;
    protected _renderBeginLoading(): void;
    protected abstract onDataLoading(args: DataLoadEventArgs): void;
    protected _onDataLoaded(args: DataLoadEventArgs): void;
    protected _renderEndLoading(): void;
    protected abstract _setItems(items: any[]): void;
    protected abstract onDataLoaded(args: DataLoadEventArgs): void;
    protected abstract onLoaded(): void;
    protected _onFailed(error: Error): void;
}
declare namespace peLoadableMixin {
    const State: {
        initial: "initial";
        loading: "loading";
        loaded: "loaded";
        failed: "failed";
        disposed: "disposed";
    };
    type State = (typeof State)[keyof typeof State];
    interface DataLoadEventArgs {
        query: LoadQuerySpec;
        options: LoadOptions;
        items?: any[];
    }
}
export = peLoadableMixin;
