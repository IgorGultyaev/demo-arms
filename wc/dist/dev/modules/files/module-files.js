/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/handlebars/View", "i18n!lib/nls/resources", "vendor/jquery.lazyload"], function (require, exports, core, View, resources) {
    "use strict";
    exports.__esModule = true;
    function initLazyImage(target, options, root) {
        var $element = View.findElement(target, root);
        // at the moment view's DOM can be hidden and lazyload won't show images
        var disp = this.subscribe("render", function () {
            disp.dispose();
            $element.lazyload(options);
        });
    }
    core.createModule("files", function (app, options) {
        options = options || {};
        options.apiRoute = options.apiRoute || "api/_file";
        var baseUrl = app.dataFacade._interop.normalizeUrl(options.apiRoute);
        // TODO: core.files присваивается при каждой инициализации приложения. А приложений может быть несколько
        // (например, в тестах), и теоритически значения core.files для разных приложений может отличаться.
        // Надо что-то придумать.
        core.files = app.files = {
            apiRoute: options.apiRoute,
            baseUrl: baseUrl,
            uploadUrl: baseUrl + "/Upload",
            uploadChunkSize: options.uploadChunkSize,
            /**
             * @param {DomainObject} obj
             * @param {String} propName
             * @param {Object} params
             * @param {String|Number} [params.width]
             * @param {String|Number} [params.height]
             * @returns {String}
             */
            getBinaryPropLoadUrl: function (obj, propName, params) {
                var url, value = obj[propName]();
                if (value && value.resourceId) {
                    url = baseUrl + "/resource?resourceId=" + value.resourceId;
                }
                else if (value && value.copyFrom) {
                    // ref to another object/prop (since 1.35)
                    url = baseUrl +
                        "/binaryPropValue?type=" + value.copyFrom.type +
                        "&id=" + value.copyFrom.id +
                        "&prop=" + value.copyFrom.prop;
                }
                else if ((value && !value.pendingUpload) || value === undefined) {
                    url = baseUrl +
                        "/binaryPropValue?type=" + obj.meta.name +
                        "&id=" + obj.id +
                        "&prop=" + propName;
                    if (obj.ts) {
                        // NOTE: for breaking through the browser cache
                        url = url + "&ts=" + obj.ts;
                    }
                }
                if (url && value && value.fileName) {
                    url += "&fileName=" + encodeURIComponent(value.fileName);
                }
                if (url && params) {
                    if (params.width) {
                        url = url + "&width=" + params.width;
                    }
                    if (params.height) {
                        url = url + "&height=" + params.height;
                    }
                }
                return url;
            },
            getResourceDeleteUrl: function (resourceId) {
                return baseUrl + "/resource/delete?resourceId=" + resourceId;
            },
            /**
             * Handles an error during file uploading:
             * parses ajax error (uses BackendInterop) and publishes "interop.error" pub/sub event.
             * Arguments correspond to jQuery.ajax error callback (see http://api.jquery.com/jQuery.Ajax/).
             * @param {JQueryXHR} jqXhr
             * @param {String} textStatus
             * @param {String} errorThrown
             * @returns {InteropError|any}
             */
            handleUploadError: function (jqXhr, textStatus, errorThrown) {
                var error = app.dataFacade._interop.handleError(jqXhr, textStatus);
                var isAbort = textStatus === "abort", errorMessage = error.message;
                error.isAbort = isAbort;
                core.Application.current.eventPublisher.publish("interop.error", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: isAbort ? "normal" : "high",
                    severity: isAbort ? "warning" : "error",
                    message: isAbort
                        ? resources["interop.upload_cancelled"]
                        : resources["interop.upload_error"] + (errorMessage ? ": " + errorMessage : "")
                }));
                return error;
            }
        };
    });
    View.Handlebars.registerHelper("propImage", function (propName, options) {
        var viewModel = this, width = options.hash ? options.hash.width : undefined, height = options.hash ? options.hash.height : undefined, cssClass = options.hash ? options.hash.cssClass : undefined, url = "", attr = "", style = "", elementId, html, 
        // TODO: it's copy-paste from lazyload
        placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC", value = viewModel[propName]();
        if (width) {
            style += "max-width: " + width + "px;";
        }
        if (height) {
            style += "max-height: " + height + "px;";
        }
        // TODO: использовать код из peBinary для получения url картинки (see WC-337)
        if (value === null) {
            // prop is loaded but empty - show placeholder image
            if (width) {
                attr += " width=" + width;
            }
            if (height) {
                attr += " height=" + height;
            }
            html = "<img src='" + placeholder + "'" + attr + (style ? " style='" + style + "'" : "") + (cssClass ? " class='" + cssClass + "'" : "") + ">";
        }
        else {
            // prop is not empty or not loaded - show server url
            url = core.files.getBinaryPropLoadUrl(viewModel, propName, { width: width, height: height });
            if (options.hash && options.hash.lazy) {
                elementId = View.newId();
                View.addCallback(options.data, initLazyImage, [elementId, {
                        effect: "fadeIn",
                        threshold: 100,
                        placeholder: options.hash.placeholder,
                        load: function () {
                            core.html.notifyDOMChanged(this);
                        }
                    }]);
                html = "<img id='" + elementId + "' class='lazy " + (cssClass || "") + "' data-original='" + url + "'" + attr + (style ? " style='" + style + "'" : "") + ">";
            }
            else {
                html = "<img src='" + url + "'" + attr + (style ? " style='" + style + "'" : "") + (cssClass ? " class='" + cssClass + "'" : "") + ">";
            }
        }
        return new View.Handlebars.SafeString(html);
    });
    View.Handlebars.registerHelper("propImageUrl", function (propName, options) {
        var viewModel = this, width = options && options.hash ? options.hash.width : undefined, height = options && options.hash ? options.hash.height : undefined;
        return core.files.getBinaryPropLoadUrl(viewModel, propName, { width: width, height: height });
    });
});
//# sourceMappingURL=module-files.js.map