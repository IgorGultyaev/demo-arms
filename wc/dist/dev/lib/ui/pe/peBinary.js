/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/pe/PropertyEditor", "lib/ui/menu/Menu", "lib/binding", "xhtmpl!lib/ui/templates/peBinary.hbs", "i18n!lib/nls/resources", "lib/domain/support", "bootstrap", "vendor/jquery.fileupload", "vendor/jquery.iframe-transport", "vendor/colorbox/jquery.colorbox", "xcss!vendor/colorbox/colorbox", "xcss!lib/ui/styles/peBinary"], function (require, exports, $, core, PropertyEditor, Menu, binding, template, resources, support_1) {
    "use strict";
    var lang = core.lang;
    var peBinary = /** @class */ (function (_super) {
        __extends(peBinary, _super);
        /**
         * @class peBinary
         * @extends PropertyEditor
         * @param options
         */
        function peBinary(options) {
            var _this = this;
            options = peBinary.mixOptions(options, peBinary.defaultOptions);
            _this = _super.call(this, options) || this;
            var that = _this;
            that.traceSource = new core.diagnostics.TraceSource("ui.peBinary");
            that.isImage = that.options.contentType === "image";
            that.files = core.files || options.files;
            //that.files = core.Application.current.files;	// TODO: to think
            that.dataFacade = core.Application.current.dataFacade;
            that.uploadUrl = core.lang.coalesce(that.options.uploadUrl, that.files.uploadUrl);
            if (!that.uploadUrl) {
                that.options.readOnly = true;
            }
            that.uploadChunkSize = core.lang.coalesce(that.options.uploadChunkSize, that.files.uploadChunkSize);
            if (that.uploadChunkSize <= 0) {
                that.uploadChunkSize = undefined;
            }
            that.placeholder = that.options.placeholder || resources["peBinary.placeholder"];
            that.readOnlyEmptyText = that.options.readOnlyEmptyText;
            that.commands = core.lang.extend(that.createCommands(), that.options.commands || {});
            that.menu = that._createMenu();
            if (that.menu) {
                that.menu.bindToPart(that);
            }
            that.bind("change:state", that._onStateChanged);
            that.state(peBinary.State.Unknown);
            that.initPresenter();
            return _this;
        }
        peBinary.prototype.showPlaceholder = function () {
            return this.options.showPlaceholder === "empty" && this.isEmpty() || this.options.showPlaceholder === true;
        };
        peBinary.prototype.isEmpty = function () {
            return this.state() === peBinary.State.Empty;
        };
        peBinary.prototype.isUploading = function () {
            return this.state() === peBinary.State.Uploading;
        };
        peBinary.prototype.isServer = function () {
            return this.state() === peBinary.State.Server;
        };
        peBinary.prototype.isFail = function () {
            return this.state() === peBinary.State.Fail;
        };
        peBinary.prototype.isPropLoading = function () {
            return this.state() === peBinary.State.PropLoading;
        };
        peBinary.prototype.isReadOnly = function () {
            return this.disabled() || this.options.readOnly;
        };
        peBinary.prototype.tweakOptions = function (options) {
            core.lang.appendEx(options, {
                presenterOptions: {
                    template: options.template
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        peBinary.prototype.setViewModel = function (viewModel) {
            var that = this;
            _super.prototype.setViewModel.call(this, viewModel);
            if (viewModel) {
                if (that.hidden()) {
                    var disposable_1 = that.subscribe("change:hidden", function (sender, val) {
                        disposable_1.dispose();
                        if (that.viewModel && !val) {
                            that._ensurePropLoaded();
                        }
                    });
                    that.addDisposable(disposable_1, null, true);
                }
                else {
                    that._ensurePropLoaded();
                }
            }
        };
        peBinary.prototype._onPropChanged = function (sender, value) {
            var that = this;
            that._setStateByValue(value);
            _super.prototype._onPropChanged.call(this, sender, value);
        };
        peBinary.prototype._ensurePropLoaded = function () {
            var that = this;
            if (!that.viewModel) {
                return;
            }
            var curValue = lang.get(that.viewModel, that.viewModelProp);
            if (curValue !== undefined) {
                // already loaded
                that._setStateByValue(curValue);
                return;
            }
            // the prop isn't loaded yet
            that.state(peBinary.State.PropLoading);
            that.viewModel.uow.loadProp(that.viewModel.meta.name, that.viewModel.id, that.viewModelProp).fail(function () {
                that.state(peBinary.State.Fail);
                that.lastError(resources["data_load_error"]);
            });
        };
        peBinary.prototype._setStateByValue = function (propVal) {
            var that = this;
            if (!propVal) {
                that.state(peBinary.State.Empty);
            }
            else if (propVal.pendingUpload) {
                that.state(peBinary.State.Uploading);
            }
            else {
                that.state(peBinary.State.Server);
            }
            //that.state(propVal ? State.server : State.empty);
        };
        peBinary.prototype._onStateChanged = function (sender, state) {
            var that = this;
            if (state !== peBinary.State.Fail) {
                that.lastError(null);
            }
            that._invalidateCommands();
            that._disableUploadInput(that.isPropLoading());
        };
        peBinary.prototype._invalidateCommands = function () {
            var that = this;
            if (!that.commands) {
                return;
            }
            var value = that.viewModel ? lang.get(that.viewModel, that.viewModelProp) : null;
            var canRead = that.isServer() && !!value, disabled = that.disabled();
            if (that.commands.Remove) {
                that.commands.Remove.canExecute(canRead && !disabled && !that.isReadOnly());
            }
            if (that.commands.Export) {
                that.commands.Export.canExecute(canRead && !disabled && !value.resourceId);
            }
            if (that.commands.Open) {
                that.commands.Open.canExecute(canRead && !disabled && !value.resourceId);
            }
            if (that.commands.UploadCancel) {
                that.commands.UploadCancel.canExecute(that.isUploading());
            }
        };
        peBinary.prototype.onReady = function () {
            var that = this;
            var $element = that.$domElement.find(".x-pe-binary");
            $element.attr("name", that.options.name);
            var bindable = binding.html($element.find(".x-pe-binary-fileinfo"));
            that.databind(bindable);
            var $inputElement = $element.find("input[name=file]");
            if (that.options.acceptFileTypes) {
                $inputElement.attr("accept", that.options.acceptFileTypes);
            }
            else if (that.isImage) {
                $inputElement.attr("accept", "image/*");
            }
            else if (that.options.contentType === "video") {
                $inputElement.attr("accept", "video/*");
            }
            else if (that.options.contentType === "audio") {
                $inputElement.attr("accept", "audio/*");
            }
            var chainId;
            if (!that.isReadOnly()) {
                $element.addClass("x-pe-binary-editable");
                $inputElement.fileupload({
                    url: that.uploadUrl,
                    replaceFileInput: false,
                    maxChunkSize: that.uploadChunkSize,
                    dropZone: $element,
                    // NOTE: pasteZone doesn't work with any elements except document, so we'll filter our events in `paste` handler
                    pasteZone: core.html.$document,
                    dataType: "json",
                    formData: [
                        {
                            name: "X-EntityType",
                            value: that.viewModel.meta.name
                        }, {
                            name: "X-ObjectId",
                            value: that.viewModel.id
                        }, {
                            name: "X-PropName",
                            value: that.viewModelProp
                        }, {
                            name: "X-StorageType",
                            value: "domain"
                        }
                    ],
                    add: function (e, data) {
                        return that._onAdd(data);
                    },
                    done: function (e, data) {
                        that._onUploadSuccess(data);
                    },
                    fail: function (e, data) {
                        that._onUploadFail(data);
                    },
                    progress: function (e, data) {
                        that._onUploadProgress(data);
                    },
                    chunksend: function (e, data) {
                        if (chainId) {
                            data.headers["X-ChunkChain"] = chainId;
                        }
                    },
                    chunkdone: function (e, data) {
                        if (data.result) {
                            chainId = data.result.resourceId;
                        }
                    },
                    paste: function (e, data) {
                        var focusedEl = core.html.focused();
                        if (!$.contains($element[0], focusedEl)) {
                            // it's not our element
                            e.preventDefault();
                        }
                    },
                    drop: function (e, data) {
                        if (data && data.files) {
                            if (data.files.length > 1) {
                                // multiple files are not supported
                                core.Application.current.eventPublisher.publish("ui.peBinary.error", core.SystemEvent.create({
                                    kind: core.SystemEvent.Kind.notification,
                                    priority: "low",
                                    severity: "info",
                                    message: resources["peBinary.multiple_files_not_supported"]
                                }));
                                return false;
                            }
                            var file = data.files[0];
                            var res = that._validateFile(file);
                            if (!res) {
                                that.traceSource.warn("peBinary: ignored dropped file due to filters: " + file.name);
                                that._reportFileTypeNotSupported(file.name);
                            }
                            return res;
                        }
                    }
                });
                that._dragCounter = 0;
                $element.on("dragenter", function () {
                    if (that._dragCounter === 0) {
                        $element.addClass("dragover");
                    }
                    that._dragCounter++;
                });
                $element.on("dragleave", function () {
                    that._dragCounter--;
                    if (that._dragCounter === 0) {
                        $element.removeClass("dragover");
                    }
                });
                $element.on("drop", function () {
                    that._dragCounter = 0;
                    $element.removeClass("dragover");
                });
            }
            else {
                // for readonly PE set tabIndex to allow focus (as it won't have input, only div/img which are not focusable by default)
                $element.attr("tabindex", "0");
            }
            that.inputElement = $inputElement;
            that.inputButton = $element.find(".x-pe-binary-uploadbutton");
            that.element = $element;
            if (that.isImage) {
                that._updateThumbnailImage();
            }
            _super.prototype.onReady.call(this);
        };
        peBinary.prototype._reportFileTypeNotSupported = function (fileName) {
            core.Application.current.eventPublisher.publish("ui.peBinary.error", core.SystemEvent.create({
                kind: core.SystemEvent.Kind.notification,
                priority: "low",
                severity: "info",
                message: resources["peBinary.filetype_not_supported"]
            }));
        };
        peBinary.prototype._validateFile = function (file) {
            var that = this, fileTypes, contentType;
            if (fileTypes = that.options.acceptFileTypes) {
                if (!file.name) {
                    return true;
                }
                // split by ","
                var exts = fileTypes.toLowerCase().split(",");
                return exts.some(function (ext) {
                    return core.lang.stringEndsWith(file.name.toLowerCase(), ext);
                });
            }
            else if (that.isImage) {
                return !!(file.type && file.type.indexOf("image/") === 0);
            }
            else if (contentType = that.options.contentType) {
                return !!(file.type && file.type.indexOf(contentType + "/") === 0);
            }
            return true;
        };
        peBinary.prototype._getUrl = function (params) {
            return this.files.getBinaryPropLoadUrl(this.viewModel, this.viewModelProp, params);
        };
        peBinary.prototype._openPreview = function () {
            var url = this._getUrl();
            if (url) {
                $.colorbox({
                    title: this.options.descr || "",
                    href: url,
                    photo: true,
                    scrolling: false,
                    maxWidth: "90%",
                    maxHeight: "90%",
                    initialWidth: 300,
                    initialHeight: 183,
                    imgError: this.options.imgPreviewSettings.imgError,
                    onComplete: function () {
                        // fix for colorBox+jquery.animate-enhanced+webview issue
                        // https://github.com/jackmoore/colorbox/issues/378
                        $("#cboxLoadingOverlay").hide();
                    }
                });
            }
        };
        peBinary.prototype._createMenuDefaults = function () {
            return Menu.defaultsFor(peBinary.defaultMenu, "peBinary");
        };
        peBinary.prototype._createMenu = function () {
            return new Menu(this._createMenuDefaults(), this.options.menu);
        };
        /**
         * Create commands
         * @protected
         */
        peBinary.prototype.createCommands = function () {
            var that = this, cmdRemove = core.createCommand({
                name: "Remove",
                execute: that._doRemove.bind(that)
            }), cmdExport = core.createCommand({
                name: "Export",
                execute: that._doExport.bind(that)
            }), cmdOpen = core.createCommand({
                name: "Open",
                execute: that._doOpen.bind(that)
            }), cmdUploadCancel = core.createCommand({
                name: "UploadCancel",
                execute: that._uploadCancel.bind(that)
            });
            return {
                Remove: cmdRemove,
                Export: cmdExport,
                Open: cmdOpen,
                UploadCancel: cmdUploadCancel
            };
        };
        peBinary.prototype._uploadCancel = function () {
            var that = this;
            if (that._uploadToken) {
                that._uploadToken.abort();
            }
            that.state(peBinary.State.Empty);
        };
        peBinary.prototype._doRemove = function () {
            var that = this, value = that.viewModel[that.viewModelProp]();
            if (value && value.resourceId) {
                that._purgeUploadedFile(value.resourceId);
            }
            that.viewModel[that.viewModelProp](null);
        };
        peBinary.prototype._doExport = function () {
            var that = this, url = that._getUrl();
            core.Application.current.dataFacade.ajax(url, {
                fileDownload: true,
                suppressEventOnError: true,
                processEvent: { message: resources["interop.downloading_file"] }
            }).fail(function (error) {
                core.Application.current.eventPublisher.publish("interop.error", core.SystemEvent.create({
                    kind: core.SystemEvent.Kind.notification,
                    priority: "normal",
                    severity: "error",
                    message: resources["interop.download_error"] + (error.message ? ": " + error.message : ""),
                    error: error
                }));
            });
        };
        peBinary.prototype._doOpen = function () {
            window.open(this._getUrl());
        };
        peBinary.prototype._onAdd = function (data) {
            var that = this;
            if (data.files && data.files.length) {
                // disable auto-validate to prevent validation of intermediate value (pendingUpload)
                that.autoValidate(false);
                // clear uploaded but unused anymore file on server
                var value = that.viewModel[that.viewModelProp]();
                if (value && value.resourceId) {
                    that._purgeUploadedFile(value.resourceId);
                }
                var file = data.files[0];
                var res = that._validateFile(file);
                if (!res) {
                    that.traceSource.warn("peBinary: ignored chosen file due to filters: " + file.name);
                    that._reportFileTypeNotSupported(file.name);
                    return false;
                }
                value = that.createPropValue(file);
                that.viewModel[that.viewModelProp](value);
                that._uploadToken = data.submit();
            }
            return true;
        };
        peBinary.prototype.createPropValue = function (file) {
            var fileName = file.name;
            if (!file.name && file.type) {
                // generate a name if it's absent (it can be when file was pasted from clipboard)
                var separator = file.type.indexOf("/");
                if (separator > 0 && separator < file.type.length - 1) {
                    fileName = this.viewModelProp + "." + file.type.substring(separator + 1);
                }
            }
            return new support_1.LobPropValue({
                size: file.size,
                fileName: fileName,
                pendingUpload: true,
                mimeType: file.type
            });
        };
        peBinary.prototype._updateThumbnailImage = function () {
            var that = this, options = that.options;
            that.imgThumbnail = that.element.find(".x-pe-binary-thumbnail");
            if (that.imgThumbnail.length === 0) {
                return;
            }
            var url = that._getUrl({ width: options.thumbnailWidth, height: options.thumbnailHeight });
            if (options.thumbnailWidth || options.thumbnailHeight) {
                var styleMap = {};
                options.thumbnailWidth && (styleMap.maxWidth = options.thumbnailWidth + "px");
                options.thumbnailHeight && (styleMap.maxHeight = options.thumbnailHeight + "px");
                that.imgThumbnail.css(styleMap);
            }
            // TODO waiting-анимация
            that.imgThumbnail.attr("src", url);
            that.imgThumbnail.on("load", function (e) {
                // thumbnail loaded, setup a click handler to open preview dialog
                that.traceSource.debug("peBinary: thumbnail loaded");
                that.imgThumbnail.off();
                that.imgThumbnail.click(function (e) {
                    e.preventDefault();
                    that._openPreview();
                });
                that.notifyDOMChanged();
            });
            that.imgThumbnail.on("error", function (e) {
                that.traceSource.warn("peBinary: thumbnail load error");
                that.imgThumbnail.off();
                // replace thumbnail IMG onto "warning" icon
                if (core.ui.iconProvider) {
                    var ico = core.ui.iconProvider.getIcon("warning", { title: resources["peBinary.previewNotAvailable"] });
                    that.imgThumbnail.replaceWith(ico);
                    that.imgThumbnail = that.element.find(".x-pe-binary-thumbnail-container .x-icon");
                    $(that.imgThumbnail).addClass("x-icon-48 x-pe-binary-thumbnail");
                }
                that.notifyDOMChanged();
            });
        };
        peBinary.prototype._purgeUploadedFile = function (resourceId) {
            var url = this.files.getResourceDeleteUrl(resourceId);
            core.Application.current.dataFacade.ajax({ url: url, type: "POST" }, { suppressProcessEvent: true });
        };
        peBinary.prototype._onUploadSuccess = function (data) {
            var that = this;
            var result = data.result;
            if (that._uploadToken) {
                that._uploadToken = undefined;
            }
            // NOTE: state will be changed to 'State.Server' as reaction on changing viewModel's prop (see _onPropChanged)
            if (result && result.resourceId) {
                var value = that.viewModel[that.viewModelProp]();
                value.resourceId = result.resourceId;
                delete value.pendingUpload;
                that.viewModel[that.viewModelProp](value);
            }
            that.autoValidate(that.options.autoValidate);
            // NOTE: as we've changed VM's prop, it'll change the PE's state which in turn will cause rerender,
            // in onReady we'll update thumbnail's url (_updateThumbnailImageUrl), it makes no sense to do it here
        };
        peBinary.prototype._onUploadFail = function (data) {
            var that = this, error = that.files.handleUploadError(data.jqXHR, data.textStatus, data.errorThrown);
            if (that._uploadToken) {
                that._uploadToken = undefined;
            }
            that.autoValidate(that.options.autoValidate);
            that.state(peBinary.State.Fail);
            that.lastError(error.message);
            that.viewModel[that.viewModelProp](null);
        };
        peBinary.prototype._onUploadProgress = function (data) {
            var that = this, progress = Math.round(data.loaded / data.total * 100), $bar = that.element.find(".progress-bar");
            $bar.css("width", progress + "%");
            if (progress >= 100) {
                $bar.text(resources["peBinary.processing"]);
            }
            else {
                $bar.text(resources["peBinary.uploading"] + " - " + progress + "%");
            }
        };
        peBinary.prototype._onDisabledChange = function (disabled) {
            this._invalidateCommands();
        };
        peBinary.prototype._disableUploadInput = function (disabled) {
            var that = this;
            // чтобы было видно
            if (that.inputButton) {
                that.inputButton.toggleClass("disabled", disabled);
            }
            // чтобы не реагировало
            if (that.inputElement) {
                that.inputElement.prop("disabled", disabled);
            }
        };
        peBinary.prototype.queryUnload = function (options) {
            if (this.isUploading()) {
                return "Uploading is in progress";
            }
        };
        peBinary.prototype.unload = function (options) {
            if (this.isUploading()) {
                this._uploadCancel();
            }
            _super.prototype.unload.call(this, options);
        };
        /**
         * @constant {Object}
         */
        peBinary.defaultOptions = {
            Presenter: core.ui.View,
            template: template,
            contentType: undefined,
            uploadChunkSize: undefined,
            uploadUrl: undefined,
            thumbnailWidth: 256,
            thumbnailHeight: undefined,
            menu: undefined,
            commands: undefined,
            imgPreviewSettings: {
                imgError: resources["peBinary.previewLoadingError"]
            },
            /**
             * file extensions list (e.g. ".jpg,.png,.doc"), A valid MIME type with no extensions, "audio/*", "video/*", "image/*"
             * */
            acceptFileTypes: undefined,
            showPlaceholder: "empty" // true - show always / false - show never / "empty" - show for empty
        };
        /**
         * @constant {Object}
         */
        peBinary.defaultMenu = {
            items: [
                {
                    name: "Remove",
                    title: resources["peBinary.clear"],
                    icon: "clear",
                    hideIfDisabled: true
                }, {
                    name: "Export",
                    title: resources["peBinary.save"],
                    icon: "download",
                    hideIfDisabled: true
                }, {
                    name: "Open",
                    title: resources["peBinary.open"],
                    icon: "export",
                    hideIfDisabled: true
                }
            ]
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], peBinary.prototype, "state");
        __decorate([
            lang.decorators.observableAccessor()
        ], peBinary.prototype, "lastError");
        return peBinary;
    }(PropertyEditor));
    (function (peBinary) {
        peBinary.State = {
            Unknown: "unknown",
            Empty: "empty",
            PropLoading: "propLoading",
            Uploading: "uploading",
            Server: "server",
            Fail: "fail"
        };
    })(peBinary || (peBinary = {}));
    // backward compatibility: access to static fields via prototype
    peBinary.mixin(/** @lends peNumber.prototype */ {
        /** @obsolete use static defaultOptions */
        defaultOptions: peBinary.defaultOptions
    });
    core.ui.peBinary = peBinary;
    core.ui.PropertyEditor.DefaultMapping.register(function () {
        return core.ui.peBinary;
    }, { vt: "binary", priority: 20 });
    return peBinary;
});
//# sourceMappingURL=peBinary.js.map