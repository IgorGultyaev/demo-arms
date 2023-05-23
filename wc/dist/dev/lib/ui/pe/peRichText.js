/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/pe/PropertyEditor", "vendor/quill/quill", "xcss!vendor/quill/quill.snow", "xcss!lib/ui/styles/peRichText"], function (require, exports, $, core, binding, PropertyEditor, Quill) {
    "use strict";
    var lang = core.lang;
    var peRichText = /** @class */ (function (_super) {
        __extends(peRichText, _super);
        /**
         * @class peRichText
         * @extends PropertyEditor
         * @param options
         */
        function peRichText(options) {
            var _this = this;
            options = peRichText.mixContextOptions(options, peRichText.defaultOptions, peRichText.contextDefaultOptions);
            _this = _super.call(this, options) || this;
            return _this;
        }
        peRichText.prototype._ensurePropLoaded = function () {
            var that = this;
            if (!that.viewModel) {
                return;
            }
            var curValue = lang.get(that.viewModel, that.viewModelProp);
            if (curValue === undefined) {
                that.state(peRichText.State.Loading);
                that.viewModel.uow.loadProp(that.viewModel.meta.name, that.viewModel.id, that.viewModelProp).fail(function () {
                    that.state(peRichText.State.Fail);
                }).done(function () {
                    that.state(peRichText.State.Loaded);
                    that.rerender();
                });
                return false;
            }
            return true;
        };
        peRichText.prototype.doRender = function (domElement) {
            var that = this, options = that.options;
            that._ensurePropLoaded();
            var state = that.state();
            if (state === peRichText.State.Loading) {
                that._renderLoading(domElement);
            }
            else if (state === peRichText.State.Fail) {
                that._renderFailed(domElement);
            }
            else {
                that.element = $("<div class='x-pe-richtext-quill'></div>").appendTo(domElement);
                that.element.attr("name", options.name);
                var quiltEl = $("<div></div>").appendTo(that.element);
                this.quill = new Quill(quiltEl[0], lang.extendEx({
                    modules: {},
                    placeholder: options.placeholder
                }, options.quill, { deep: true }));
                that._createDisabledBinding();
                that._createBinding();
            }
            _super.prototype.doRender.call(this, domElement);
        };
        peRichText.prototype.afterRender = function () {
            var that = this;
            if (that.state() === peRichText.State.Loading) {
                that.renderStatus("waiting");
            }
            else {
                _super.prototype.afterRender.call(this);
            }
        };
        peRichText.prototype._renderLoading = function (domElement) {
            $("<div class='x-pe-richtext-quill'><div class='" + core.ui.getWaitingIconClass(32) + "'></div></div>").appendTo(domElement);
        };
        peRichText.prototype._renderFailed = function (domElement) {
            $("<div class='x-pe-richtext-quill'>").appendTo(domElement);
        };
        peRichText.prototype._createDisabledBinding = function () {
            var that = this;
            binding.databind(binding.html(that.element, {
                accessor: function (v) {
                    if (arguments.length > 0) {
                        // set:
                        that.quill.enable(!v);
                    }
                    else {
                        // get:
                        return $(that.quill.container).hasClass("ql-disabled");
                    }
                },
                parse: function (v) { return !!v; }
            }), binding.domain(that, "disabled"));
        };
        peRichText.prototype._createBinding = function () {
            var that = this;
            var bindable = {};
            bindable.get = function () {
                // model:
                return {
                    $value: "RichTextQuill",
                    quill: that.quill.getContents(),
                    html: that.quill.root.innerHTML
                };
            };
            bindable.set = function (v) {
                if (v === lang.support.loadingValue) {
                    v = null;
                }
                // model:
                var delta;
                if (!v) {
                    that.quill.setText("");
                }
                else if (v.quill) {
                    delta = v.quill;
                    var curText = that.quill.root.innerHTML;
                    var newText = v && v.html ? v.html /*that._getText(delta)*/ : "";
                    if (curText == newText)
                        return;
                    that.quill.setContents(delta, "silent");
                }
                else if (typeof v === "string") {
                    if (v == that.quill.root.innerHTML)
                        return;
                    var wasFocus = that.quill.hasFocus();
                    // NOTE: это выглядит катастрофически опасно, но в реальности внутри Quill происходит обработка,
                    // которая не позволяет вставить, например, <script>. См.  makeBlot/Registry.create.
                    that.onMaterialize(v);
                    if (wasFocus) {
                        that.quill.setSelection(0);
                    }
                }
            };
            bindable.onchange = function (handler) {
                var changeTrigger = that.options.changeTrigger;
                if (changeTrigger === "keyPressed") {
                    var handlerOut = function (e) {
                        // finalize value, converting it to html
                        //if (that.element.has(e.target).length) return;
                        that.value(that.onDematerialize());
                    };
                    that.quill.on("text-change", handler);
                    that.element.on("focusout", handlerOut);
                }
                else {
                    handler = function (e) {
                        //if (that.element.has(e.target).length) return;
                        // finalize value, converting it to html
                        that.value(that.onDematerialize());
                    };
                    that.element.on("focusout", handler);
                }
                return {
                    dispose: function () {
                        if (changeTrigger === "keyPressed") {
                            that.quill.off("text-change", handler);
                            that.element.off("focusout");
                        }
                        else {
                            that.element.off("focusout");
                        }
                    }
                };
            };
            that.databind(bindable);
        };
        /**
         * Initialize editor (Quill) with html string value from property.
         * @param {string} val Property value (html string)
         */
        peRichText.prototype.onMaterialize = function (val) {
            var that = this;
            if (that.options.onMaterialize) {
                that.options.onMaterialize.call(that, val);
            }
            else {
                this.quill.root.innerHTML = val;
                this.quill.update();
            }
        };
        /**
         * Prepare value for setting into property as html string.
         * That happens on focucsout and that value will be sent to the server.
         * Please note the method is called on any focusout it includes moments when user click on quill's toolbar.
         * @return {string} html string for setting into property
         */
        peRichText.prototype.onDematerialize = function () {
            return this.quill.root.innerHTML;
        };
        /*protected _getText(delta): string {
            return delta.filter(function (op) {
                return typeof op.insert === "string";
            }).map(function (op) {
                return op.insert;
            }).join("");
        }*/
        peRichText.prototype.unload = function (options) {
            var val = this._getRawValue();
            if (val && val.$value) {
                this.value(this.onDematerialize());
            }
            _super.prototype.unload.call(this, options);
        };
        peRichText.prototype.focus = function () {
            if (this.quill.hasFocus()) {
                return;
            }
            this.quill.focus();
        };
        peRichText.defaultOptions = {
            quill: {
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        [{ size: ["small", false, "large", "huge"] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        ["blockquote", "code-block"],
                        [{ script: "sub" }, { script: "super" }],
                        [{ align: [] }],
                        ["clean"],
                        ["link",]
                    ]
                },
                theme: "snow"
            }
        };
        /**
         * Default options by context
         */
        peRichText.contextDefaultOptions = {
            filter: {},
            inline: {}
        };
        __decorate([
            lang.decorators.observableAccessor()
        ], peRichText.prototype, "state");
        return peRichText;
    }(PropertyEditor));
    (function (peRichText) {
        peRichText.State = {
            Loaded: "loaded",
            Loading: "loading",
            Fail: "fail"
        };
    })(peRichText || (peRichText = {}));
    core.ui.peRichText = peRichText;
    core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
        return propMd.contentType === "html" || propMd.presentation === "quill" ? core.ui.peRichText : null;
    }, { vt: "text" });
    return peRichText;
});
//# sourceMappingURL=peRichText.js.map