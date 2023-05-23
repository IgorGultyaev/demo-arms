/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import Part = require("lib/ui/Part");
import StatefulPart = require("lib/ui/StatefulPart");
import { IPart, HostContextOptions } from "lib/ui/.ui";
import { INavigationService } from ".core";
declare class Component extends StatefulPart implements IPart {
    static defaultOptions: Component.Options;
    options: Component.Options;
    presenter: IPart;
    name: string;
    /**
     * Part with a presenter. Presenter is a component which the part delegates rendering to.
     * The presenter is registered as a child part of the current part.
     * @constructs Component
     * @extends StatefulPart
     * @param {Component#defaultOptions} options
     */
    constructor(options?: Component.Options);
    /**
     * Create and initialize presenter
     * @protected
     * @param {Object} [options]
     * @param {*} [options.viewModel=this] viewModel to set to presenter. Specify null to skip setting viewModel.
     */
    protected initPresenter(options?: {
        viewModel?: any;
    }): void;
    /** @inheritDoc */
    protected doRender(domElement: JQuery | HTMLElement): lang.Promisable<void>;
    /** @inheritDoc */
    queryUnload(options?: Part.CloseOptions): lang.Promisable<string>;
    /** @inheritDoc */
    dispose(options?: Part.CloseOptions): void;
    protected disposePresenter(options?: Part.CloseOptions): void;
    applyHostContext(options: HostContextOptions): INavigationService.NavigateOptions;
}
declare namespace Component {
    interface Options extends Part.ContextOptions {
        presenter?: IPart;
        Presenter?: lang.Constructor<IPart> | string;
        presenterOptions?: any;
    }
}
export = Component;
