/// <reference path="core.all.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import DraftManager = require("./DraftManager");
import "lib/ui/editor/ObjectEditor";
import "lib/ui/editor/ObjectWizard";
import "lib/ui/editor/ObjectViewer";
import "lib/ui/editor/ObjectFilter";
declare module "lib/ui/editor/ObjectEditor" {
    interface Options {
        skipDraftCreation?: boolean;
    }
}
declare module "lib/.core" {
    interface UnloadOptions {
        skipDraftCreation?: boolean;
    }
}
declare module "lib/core" {
    interface Application {
        draftManager?: DraftManager;
    }
}
