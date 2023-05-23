/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import View = require("lib/ui/handlebars/View");
import "xcss!lib/ui/styles/carousel";
import lang = core.lang;
declare class Carousel<T> extends View {
    static defaultOptions: Carousel.Options;
    /**
     * @observable-getter {Array}
     */
    items: core.lang.ObservableGetter<lang.IObservableCollection<T>>;
    private _items;
    /**
     * @observable-property {Number}
     */
    position: lang.ObservableProperty<number>;
    options: Carousel.Options;
    commands: Carousel.KnownCommands;
    private _itemsOwner;
    /**
     * @constructs Carousel
     * @extends View
     * @param {Object} [options]
     * */
    constructor(options?: Carousel.Options);
    dispose(options?: core.ui.Part.CloseOptions): void;
    setViewModel(): void;
    current(): T;
    count(): number;
    text(): string;
    counterText(): string;
    /**
     * Removes current item
     * @returns {*} removed item
     */
    removeCurrent(): T;
    /**
     * @protected
     * @returns {{Backward: (Command), Forward: (Command)}}
     */
    createCommands(): Carousel.KnownCommands;
    protected createItemsCollection(items?: T[]): lang.IObservableCollection<T>;
    protected _moveBackward(): void;
    protected _moveForward(): void;
    protected _move(posFrom: number, posTo: number): void;
}
declare namespace Carousel {
    interface Options extends View.Options {
        items?: Array<any> | lang.IObservableCollection<any>;
        formatter?: (item: any) => string;
        commands?: KnownCommands;
    }
    interface KnownCommands {
        Backward?: core.commands.Command;
        Forward?: core.commands.Command;
    }
    interface MovingEventArgs {
        from: number;
        to: number;
        total: number;
        cancel: boolean;
    }
}
export = Carousel;
