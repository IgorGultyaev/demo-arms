/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import PropertyEditor = require("lib/ui/pe/PropertyEditor");
import { metadata } from "lib/domain/.domain";
import EnumMeta = metadata.EnumMeta;
import EnumMember = metadata.EnumMember;
import lang = core.lang;
import { SafeHtml } from "lib/formatters";
declare class peEnumBase extends PropertyEditor {
    static defaultOptions: peEnumBase.Options;
    protected isDomain: boolean;
    options: peEnumBase.Options;
    flags: boolean;
    /**
     * @constructs peEnumBase
     * @extends PropertyEditor
     * @param options
     */
    constructor(options: peEnumBase.Options);
    setViewModel(viewModel: any): void;
    members(): lang.Map<EnumMember>;
    parseValue(v: any): any;
    protected _onDisabledChange(disabled: boolean): void;
}
declare namespace peEnumBase {
    interface Options extends PropertyEditor.Options {
        /**
         * Enum description
         */
        ref?: EnumMeta;
        /**
         * To overwrite flags property in enum description (ref.flags)
         */
        flags?: boolean;
        /**
         * @deprecated Use includeMembers instead
         */
        members?: string[] | lang.Map<string>;
        /**
         * Names of enum members to show
         */
        includeMembers?: string[] | lang.Map<string>;
        /**
         * Exclude specified members (by name) from list
         */
        excludeMembers?: string[] | lang.Map<string>;
        /**
         * Names of enum members to show disabled (not available for choosing)
         */
        disabledMembers?: string[] | lang.Map<string>;
        itemFormatter?: (member: EnumMember) => SafeHtml | string;
    }
}
export = peEnumBase;
