/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import "xcss!./styles/affix";
export declare type Direction = "top" | "bottom";
export declare type VerticalAlign = "top" | "bottom" | "center";
export interface AffixItemOptions {
    element: JQuery | HTMLElement;
    controlledBy?: JQuery | HTMLElement;
    affixTo?: Direction;
    stuckBehaviors?: (string | StuckBehavior)[];
    suspendByScreenWidth?: number;
    /**
     * Size of the element can be changed. In this case rendering inside the element causes `refresh`.
     */
    resizable?: boolean;
    /**
     * Для элементов, которые расположены по всей ширине родителького элемента ширина должна меняться при изменении размера окна.
     * Если элемент занимает часть ширины, то при ресайзе его ширина должна восстанавливаться.
     */
    fixedWidth?: boolean;
    [key: string]: any;
}
export interface AffixItem {
    /**
     * @readonly
     */
    options: AffixItemOptions;
    /**
     * @readonly
     */
    $element: JQuery;
    /**
     * @readonly
     */
    dir: Direction;
    /**
     * Position of the element relative to the document
     */
    pos?: Position;
    /**
     * An optional element inserted into DOM when the real element is attached.
     * It usually has the same size as the original element.
     */
    $placeholder?: JQuery;
    moved?: boolean;
    affixedOffset?: number;
}
export declare const enum AffixRefreshMode {
    scroll = -1,
    normal = 0,
    forced = 1,
}
export interface AffixRefreshOptions {
    mode?: AffixRefreshMode;
}
export interface AffixSuspendOptions {
    suspend?: boolean;
}
/**
 * Position of the element relative to the document
 */
export interface Position {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height: number;
    width: number;
}
export interface Viewport extends Position {
    /**
     * Top fixed offset relative to the window
     */
    offsetTop: number;
    /**
     * Bottom fixed offset relative to the window
     */
    offsetBottom: number;
}
export interface StuckBehavior {
    /**
     * Calculates and caches item data for using in other methods (e.g. 'pos')
     * @param item
     */
    recalc?(item: AffixItem): void;
    /**
     * Detects whether the element should be attached.
     * @param item
     * @param viewport
     */
    shouldAttach?(item: AffixItem, viewport: Viewport): boolean;
    /**
     * Attaches detached element first time. This method is NOT called if the element is already attached.
     * @param item
     * @param viewport
     */
    attach?(item: AffixItem, viewport: Viewport): void;
    /**
     * Updates attached element. This method is called on every refreshing for every attached element.
     * @param item
     * @param viewport
     */
    reflow?(item: AffixItem, viewport: Viewport): void;
    /**
     * Detaches attached element. This method is NOT called if the element is not attached.
     * @param item
     */
    detach?(item: AffixItem): void;
}
export interface ViewportProvider {
    getItemViewport(item: AffixItem): Viewport;
}
export declare namespace utils {
    function toElement(element: JQuery | HTMLElement): HTMLElement;
    function invalidate(): void;
    /**
     * Get the position of the element relative to the document
     * @param element
     * @returns {Position}
     */
    function pos(element: JQuery | HTMLElement): Position;
    /**
     * Get the position of the window relative to the document
     * @returns {Position}
     */
    function windowPos(): Position;
    function intersectedHorz(pos1: Position, pos2: Position): boolean;
}
export declare class AffixManager implements ViewportProvider {
    static knownStuckBehaviors: lang.Map<StuckBehavior>;
    static defaultOptions: AffixManager.Options;
    options: AffixManager.Options;
    /**
     * @readonly
     */
    private _items;
    private _offset;
    private _suspended;
    private _scheduledTimeout;
    private _scheduledMode;
    constructor(options: AffixManager.Options);
    init(): void;
    addElement(options: AffixItemOptions | JQuery | HTMLElement): void;
    removeElement(options: AffixItemOptions | JQuery | HTMLElement): void;
    suspend(options?: AffixSuspendOptions): void;
    /**
     * Asynchronously refreshes affixing state for all items
     * @params {Object} [options]
     * @param {number} [options.mode]
     */
    refresh(options?: AffixRefreshOptions): void;
    /**
     * Synchronously refreshes affixing state for all items, if asynchronous refreshing was scheduling
     */
    refreshIfScheduled(): void;
    /**
     * Synchronously refreshes affixing state for all items
     * @params {Object} [options]
     * @param {number} [options.mode]
     */
    refreshSync(options?: AffixRefreshOptions): void;
    protected getRefreshMode(options?: AffixRefreshOptions): AffixRefreshMode;
    protected clearScheduled(): void;
    protected runRefresh(mode: AffixRefreshMode): void;
    protected invalidate(): void;
    getItemViewport(item: AffixItem): Viewport;
    getElementViewport(pos: Position): Viewport;
    isInViewport(element: JQuery | HTMLElement, align: VerticalAlign): boolean;
    getScrollTop(element: JQuery | HTMLElement, align: VerticalAlign): number;
    protected validateElement(element: JQuery | HTMLElement): boolean;
    protected calcDirOffset(dir: Direction): number;
    protected isInside(pos: Position, rect: Position, align: VerticalAlign): boolean;
    protected createViewport(offsetTop: number, offsetBottom: number, top?: number): Viewport;
}
export declare namespace AffixManager {
    interface Options {
        topOffset?: number;
        bottomOffset?: number;
    }
}
export declare class AffixStack {
    readonly items: AffixItemImpl[];
    readonly dir: Direction;
    readonly comparer: (x: AffixItem, y: AffixItem) => number;
    constructor(dir: Direction);
    add(item: AffixItemImpl): void;
    remove(i: number): void;
    restore(): void;
    recalc(): void;
    refresh(manager: ViewportProvider): void;
    protected affixItem(item: AffixItemImpl, manager: ViewportProvider): void;
    protected shadowItem(target: AffixItemImpl, index: number): void;
    calcItemOffset(target: AffixItem): number;
    calcElementOffset(pos: Position): number;
    protected _calcIntersectingHeight(intersecting: AffixItem[]): number;
}
export declare class AffixItemImpl implements AffixItem {
    static defaultOptions: AffixItemOptions;
    /**
     * @readonly
     */
    options: AffixItemOptions;
    /**
     * @readonly
     */
    $element: JQuery;
    /**
     * @readonly
     */
    dir: Direction;
    /**
     * @readonly
     */
    stuckBehaviors: StuckBehavior[];
    /**
     * Position of the element relative to the document
     */
    pos: Position;
    /**
     * An optional element inserted into DOM when the real element is attached.
     * It usually has the same size as the original element.
     */
    $placeholder: JQuery;
    moved: boolean;
    /**
     * Offset that was set on attaching
     */
    affixedOffset: number;
    attached: boolean;
    constructor(options: AffixItemOptions);
    private _addKnownBehavior(name, toBeginning?);
    adjustSize(): void;
    recalc(): void;
    shouldAttach(viewport: Viewport): boolean;
    attach(viewport: Viewport): void;
    reflow(viewport: Viewport): void;
    detach(): void;
}
