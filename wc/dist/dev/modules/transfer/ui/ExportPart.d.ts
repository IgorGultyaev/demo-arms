/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as core from "core";
import * as View from "lib/ui/handlebars/View";
import * as Menu from "lib/ui/menu/Menu";
import transfer = require("modules/transfer/Transfer");
import ICommand = core.commands.ICommand;
import MenuOptions = Menu.Options;
declare class ExportPart extends View {
    static defaultOptions: ExportPart.Options;
    title: string;
    app: core.Application;
    options: ExportPart.Options;
    client: transfer.ExportClient;
    state: core.lang.ObservableProperty<ExportPart.State>;
    progress: core.lang.ObservableProperty<number>;
    menu: Menu;
    constructor(app: core.Application, options: ExportPart.Options);
}
declare namespace ExportPart {
    interface Options extends View.Options {
        title?: string;
        scenario?: string;
        client?: transfer.ExportClient;
        commands?: core.lang.Map<ICommand>;
        menu?: MenuOptions;
    }
    enum State {
        connecting = 0,
        initial = 1,
        uploading = 2,
        startingUp = 3,
        importing = 4,
        aborting = 5,
        aborted = 6,
        failed = 7,
        suspended = 8,
        completed = 9,
        disposed = 10,
    }
}
export = ExportPart;
