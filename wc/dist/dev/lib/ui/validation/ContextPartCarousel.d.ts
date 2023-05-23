/// <reference path="../../../modules/affix/core.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Carousel = require("lib/ui/Carousel");
import ObservableCollectionView = require("lib/utils/ObservableCollectionView");
import { IPart, PartCloseOptions } from "lib/ui/.ui";
import { ICommand } from "lib/core.commands";
import { Violation } from "lib/validation";
import { IContextPart } from "./ContextPartMixin";
import lang = core.lang;
declare class ContextPartCarousel extends Carousel<IContextPart> {
    static defaultOptions: ContextPartCarousel.Options;
    options: ContextPartCarousel.Options;
    items: lang.ObservableGetter<ObservableCollectionView<IContextPart>>;
    eventPublisher: core.IEventPublisher;
    protected $controlledBy: JQuery;
    private _countOld;
    private _affixed;
    private _affixParent;
    private _affixSelector;
    /**
     * @constructs ContextPartCarousel
     * @extends Carousel
     * @param {Object} options
     **/
    constructor(options?: ContextPartCarousel.Options);
    protected createItemsCollection(): ObservableCollectionView<IContextPart>;
    activate(): void;
    blink(): void;
    createCommands(): ContextPartCarousel.KnownCommands;
    currentViolation(): Violation;
    /**
     * Used in templates
     * @returns {string} css class for parts badge
     */
    badgeCssClass(): string;
    isPinned(v: boolean): void;
    isPinned(): boolean;
    isUnpinned(): boolean;
    togglePinned(): void;
    canPin(): boolean;
    /**
     * Initializes affixing. Should be called before render.
     * @param {JQuery|HTMLElement} $parent
     * @param {string} [selector]
     */
    initAffix($parent: JQuery | HTMLElement, selector?: string): void;
    protected beforeRender(domElement?: JQuery | HTMLElement): void;
    protected afterRender(): void;
    unload(options?: PartCloseOptions): void;
    protected affix(pinned?: boolean): void;
    protected unaffix(): void;
    protected affixParts(affixed: boolean): void;
    protected affixBadge(affixed: boolean): void;
    protected affixElement(selector: string, affixed: boolean, resizable?: boolean): void;
    protected _onItemsChanged(sender: ObservableCollectionView<IPart>, args: lang.ObservableCollectionChangeArgs<IPart>): void;
}
declare namespace ContextPartCarousel {
    interface Options extends Carousel.Options {
    }
    interface KnownCommands extends Carousel.KnownCommands {
        CloseContextPart?: ICommand;
        PinContextParts?: ICommand;
    }
    enum Severities {
        critical = 1,
        error = 2,
        warning = 3,
        info = 4,
    }
}
export = ContextPartCarousel;
