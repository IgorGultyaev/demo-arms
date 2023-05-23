/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Component = require("lib/ui/Component");
import "lib/ui/menu/DropDownMenuPresenter";
declare class ButtonDropDownPresenter extends Component {
    static defaultOptions: ButtonDropDownPresenter.Options;
    options: ButtonDropDownPresenter.Options;
    /**
     * Menu presenter as a button with a dropdown
     * @class ButtonDropDownPresenter
     * @extends Component
     */
    constructor(options?: ButtonDropDownPresenter.Options);
    setViewModel(model: any): void;
    protected doRender(domElement: JQuery | HTMLElement): core.lang.Promisable<void>;
    /**
     * @deprecated use rerender instead
     */
    refresh(): void;
    dispose(options?: core.ui.Part.CloseOptions): void;
}
declare namespace ButtonDropDownPresenter {
    interface Options extends Component.Options {
        isLink?: boolean;
        anchorHtml?: string;
        viewModel?: any;
    }
}
export = ButtonDropDownPresenter;
