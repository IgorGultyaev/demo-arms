/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "i18n!lib/nls/resources", "lib/utils", "lib/ui/ConfirmDialog", "lib/ui/list/ListCommonMixin"], function (require, exports, core, resources, utils, ConfirmDialog, ListCommonMixin_1) {
    "use strict";
    //import DomainObject = require("lib/domain/DomainObject");
    var lang = core.lang;
    /*
    interface ObjectListMixin extends lang.Observable {
    }
    */
    // Following methods are common for ObjectList and peObjectList and added to them as mixin
    var ObjectListMixin = /** @class */ (function (_super) {
        __extends(ObjectListMixin, _super);
        function ObjectListMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ObjectListMixin.prototype._isObjectOperable = function (obj) {
            return obj && !lang.get(obj, "isRemoved") && !lang.get(obj, "isInvalid");
        };
        ObjectListMixin.prototype._deleteObjects = function (objects) {
            var that = this, activeObj = that.activeItem(), selection;
            // #1: detect what should we delete
            if (!objects) {
                if (that.options.selectionMode === "single") {
                    if (!activeObj) {
                        return;
                    }
                    objects = [activeObj];
                }
                else {
                    selection = that.selection.all();
                    // NOTE: `editable` only exists in ObjectList
                    if (that.options["editable"]) {
                        // in editableList selection can contains deleted objects, fitler them out
                        selection = selection.filter(that._isObjectOperable);
                        // active item can be deleted as well.
                        if (!that._isObjectOperable(activeObj)) {
                            activeObj = null;
                        }
                    }
                    var selectionCount = selection.length;
                    if (selectionCount === 0 && activeObj) {
                        objects = [activeObj];
                    }
                    else if (selectionCount > 0 && activeObj) {
                        // there are selected objects AND active - it's the most subtle case for UX
                        if (selection.indexOf(activeObj) > -1) {
                            // selection includes the active
                            objects = selection;
                        }
                        else {
                            // we couldn't determine what to delete
                            objects = null;
                        }
                    }
                    else if (selectionCount > 0 && !activeObj) {
                        // there are only selected objects
                        objects = selection;
                    }
                    else {
                        // nothing to delete
                        return;
                    }
                }
            }
            // now we have a set of objects to delete - `objects` (or may be not if it's unclear what to delete),
            // #2: construct a confirmation for user
            var confirmation = that.getOperationConfirmation("delete", objects, selection, activeObj);
            if (!confirmation) {
                return;
            }
            // #3: ask user
            lang.async.then(confirmation, function (confirmation) {
                if (confirmation.text) {
                    ConfirmDialog.create({
                        header: confirmation.header,
                        text: confirmation.text,
                        menu: confirmation.menu
                    }).open().done(function (result) {
                        if (result === "Selected") {
                            objects = selection;
                            result = "yes";
                        }
                        else if (result === "Active") {
                            objects = [activeObj];
                            result = "yes";
                        }
                        if (result === "yes") {
                            that.doDeleteObjects(objects);
                        }
                    });
                }
                else if (confirmation.objects) {
                    // no text, delete silently
                    that.doDeleteObjects(confirmation.objects);
                }
            });
        };
        ObjectListMixin.prototype.doDeleteObjects = function (objects) {
            objects = [].concat.apply([], objects);
            this.executeDelete(objects);
        };
        ObjectListMixin.prototype.getOperationConfirmation = function (op, objects, selection, activeObj) {
            // NOTE: `editable` only exists in ObjectList
            var selectionCount = selection && selection.length || 0;
            var confirmationText;
            var menu;
            if (!objects) {
                // we couldn't determine what to delete, we have to ask
                if (selectionCount === 1) {
                    confirmationText = this.getMessage(resources, op, "selected_or_active_one.prompt");
                }
                else {
                    confirmationText = lang.stringFormat(this.getMessage(resources, op, "selected_or_active_many.prompt_format"), selectionCount);
                }
                menu = { items: [
                        { name: "Selected",
                            title: (selectionCount === 1)
                                ? this.getMessage(resources, op, "selected_or_active_one.confirm_selected_one")
                                : this.getMessage(resources, op, "selected_or_active_one.confirm_selected_many") + " (" + selectionCount + ")"
                        },
                        { name: "Active", title: this.getMessage(resources, op, "selected_or_active_one.confirm_active") },
                        { name: "cancel", title: resources.cancel }
                    ] };
            }
            else {
                // we determined what to delete, construct a msg depending on objects count
                if (objects.length === 1) {
                    confirmationText = this.getMessage(resources, op, "one.prompt");
                }
                else {
                    confirmationText = lang.stringFormat(this.getMessage(resources, op, "many.prompt_format"), objects.length + " " + utils.formatNumeral(objects.length, resources.words_forms.objects));
                }
            }
            var confirmation = {
                header: resources["objectList.name"],
                text: confirmationText,
                menu: menu
            };
            var optConfirm = this.options["confirm" + utils.toUpperCamel(op)];
            if (optConfirm) {
                // some people want to customize confirmation message, let them
                return optConfirm.call(this, confirmation, objects, selection, activeObj);
            }
            return confirmation;
        };
        return ObjectListMixin;
    }(ListCommonMixin_1["default"]));
    return ObjectListMixin;
});
//# sourceMappingURL=ObjectListMixin.js.map