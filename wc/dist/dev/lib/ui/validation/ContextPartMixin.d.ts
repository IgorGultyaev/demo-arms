/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import core = require("core");
import Menu = require("lib/ui/menu/Menu");
import { IPart } from ".ui";
import { Violation, ViolationSeverity } from "lib/validation";
import lang = core.lang;
declare module "lib/validation" {
    interface Violation {
        menu?: Menu;
    }
}
export interface IContextPart extends IPart {
    severity?: ViolationSeverity;
}
export interface IContextPartsPresenter extends IPart {
    activateContextParts?(): void;
}
export declare abstract class ContextPartComponentMixin {
    title: string;
    violations: lang.ObservableCollection<Violation>;
    contextParts: lang.ObservableCollection<IContextPart>;
    userSettings: core.IUserSettings;
    presenter: IContextPartsPresenter;
    abstract runValidation(): Violation[];
    protected _onViolationsChanged(): void;
    protected _disposeParts(): void;
    protected _hasValidationErrors(violations: Violation[]): boolean;
    protected _canIgnoreViolations(violations: Violation[]): lang.Promise<void>;
    protected _validateBeforeSave(): lang.Promise<void>;
    /**
     * Remove context part from editor and dispose it
     * @param {ViolationInfoPart} part - part to close
     */
    protected closeContextPart(part: IContextPart): void;
}
