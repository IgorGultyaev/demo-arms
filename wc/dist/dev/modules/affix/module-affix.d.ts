/// <reference path="core.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import { AffixManager, AffixItemOptions, AffixRefreshOptions, AffixSuspendOptions } from "./affix";
export interface AffixModuleOptions extends AffixManager.Options {
    disabled?: boolean;
}
export interface AffixItemEvent extends core.AppEvent {
    args: AffixItemOptions | JQuery | HTMLElement;
}
export interface AffixRefreshEvent extends core.AppEvent {
    args: AffixRefreshOptions;
}
export interface AffixSuspendEvent extends core.AppEvent {
    args: AffixSuspendOptions;
}
