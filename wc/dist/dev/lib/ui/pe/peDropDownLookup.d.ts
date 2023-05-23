/// <reference path="../../../vendor/rx/rx.lite.d.ts" />
/// <reference types="jquery" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditorLookup = require("lib/ui/pe/PropertyEditorLookup");
import binding = require("lib/binding");
import "lib/ui/menu/MenuButtonsPresenter";
import "xcss!lib/ui/styles/peObjectDropDownLookup";
import lang = core.lang;
import Part = core.ui.Part;
import IBindable = binding.IBindable;
declare class peDropDownLookup extends PropertyEditorLookup {
    static defaultOptions: peDropDownLookup.Options;
    options: peDropDownLookup.Options;
    private _inputId;
    private _dropId;
    private _inputInitialVal;
    private _onDomChange;
    private _input;
    private _presentation;
    private _loading;
    private _dropContainer;
    private _dropScroll;
    private _dropdown;
    /**
     * @constructs peDropDownLookup
     * @extends PropertyEditor
     * @param options
     */
    constructor(options?: peDropDownLookup.Options);
    render(domElement: JQuery | HTMLElement): lang.Promise<any> | any;
    unload(options?: Part.CloseOptions): void;
    protected _onDisabledChange(disabled: boolean): void;
    protected createBindableProp(): IBindable;
    protected createBindableElement(): IBindable;
    /**
     * Select item with specified index
     * @param {Number} index index to select
     */
    selectIndex(index: number): void;
    /**
     * Select first item
     */
    selectFirst(): void;
    /**
     * Select item if single
     */
    selectSingle(): void;
    /**
     * Disable property editor if only one item exists
     */
    disableIfSingle(): void;
    protected _disableInput(disabled: boolean): void;
    protected _readonlyInput(readonly: boolean): void;
    /**
     * @override
     * @protected
     */
    protected _renderBeginLoading(): void;
    /**
     * @override
     * @protected
     */
    protected _renderEndLoading(): void;
    protected _setupLookup(valueContainer: JQuery): void;
    protected _getInputValuePresentation(): string;
    protected doToggleDrop(): void;
    protected _doReload(): void;
    protected _selectInsteadExecute(): boolean;
    protected _selectCurrentDropDownValue(): boolean;
    protected _selectValue(item: any): void;
    protected _hasActive(): boolean;
    protected _resetInput(): void;
    protected _keyup(e: JQueryEventObject): boolean;
    protected _keypress(e: JQueryEventObject): boolean;
    protected _next(): void;
    protected _prev(): void;
    protected _ensureItemInView(view: JQuery, item: JQuery): void;
    protected _mouseEnter(e: JQueryEventObject): void;
    protected _renderViewItems(): void;
    toggle(): void;
    protected _open(): void;
    /**
     * Corrects the position of dropContainer
     * @param {JQuery} $overlayContainer Parent "overlay" element for dropContainer (if any).
     * @private
     */
    protected _layoutDropContainer($overlayContainer: JQuery): void;
    protected _open2(): void;
    protected onOpened(): void;
    protected _close(): void;
    protected onClosed(): void;
    focus(): void;
    protected _isFocusInside(): boolean;
}
declare namespace peDropDownLookup {
    interface Options extends PropertyEditorLookup.Options {
        dropDownCssClass?: string;
    }
    /**
     * @obsolete Use base PropertyEditorLookup.IDataProvider<TValue, TItem>
     */
    interface IDataProvider<TValue, TItem> extends PropertyEditorLookup.IDataProvider<TValue, TItem> {
    }
    /**
     * @obsolete Use base PropertyEditorLookup.DataProviderBase<TValue, TItem>
     */
    abstract class DataProviderBase<TValue, TItem> extends PropertyEditorLookup.DataProviderBase<TValue, TItem> {
    }
    /**
     * @obsolete Use base PropertyEditorLookup.PlainDataProvider<TItem>
     */
    class PlainDataProvider<TItem> extends PropertyEditorLookup.PlainDataProvider<TItem> {
    }
    /**
     * @obsolete Use base PropertyEditorLookup.PlainDataProvider<TItem>
     */
    class DomainDataProvider extends PropertyEditorLookup.DomainDataProvider {
    }
}
export = peDropDownLookup;
