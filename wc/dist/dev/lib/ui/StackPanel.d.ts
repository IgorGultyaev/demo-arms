/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Part = require("lib/ui/Part");
import { IPart } from "lib/ui/.ui";
declare class StackPanel extends Part {
    items: StackPanel.Item[];
    options: StackPanel.Options;
    /**
     * @constructs StackPanel
     * @extends Component
     * @param options
     */
    constructor(options: StackPanel.Options);
    protected _add(itemOpt: StackPanel.ItemOption, name?: string): void;
    render(domElement: JQuery | HTMLElement): core.lang.Promisable<void>;
}
declare namespace StackPanel {
    interface Options extends Part.Options {
        items?: StackPanel.ItemOption[] | core.lang.Map<StackPanel.ItemOption>;
    }
    type ItemOption = string | IPart | {
        part: IPart;
    };
    interface Item {
        part?: IPart;
        partName?: string;
        name?: string;
        height?: string | number;
    }
}
export = StackPanel;
