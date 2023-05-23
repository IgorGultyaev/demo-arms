/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/ui/handlebars/View", "lib/ui/editor/EditorPage", "lib/utils", "xhtmpl!lib/ui/templates/EditorPagePresenter.hbs", "xhtmpl!lib/ui/templates/EditorPage.peContainer.hbs", "xhtmpl!lib/ui/templates/EditorPage.sectionTitle.hbs", "handlebars-ext", "xcss!lib/ui/styles/objectEditor"], function (require, exports, $, core, View, EditorPage, utils, templateDef, templatePeContainer, templateSectionTitle, Handlebars) {
    "use strict";
    var EditorPagePresenter = /** @class */ (function (_super) {
        __extends(EditorPagePresenter, _super);
        /**
         * @constructs EditorPagePresenter
         * @extends View
         * @param {Object} options
         */
        function EditorPagePresenter(options) {
            var _this = this;
            options = EditorPagePresenter.mixOptions(options, EditorPagePresenter.defaultOptions);
            options.unbound = !options.bound;
            _this = _super.call(this, options) || this;
            return _this;
        }
        EditorPagePresenter.prototype.doRender = function (domElement) {
            var that = this, $element = $(domElement);
            // до рендеринга, т.к. рендерящиеся pe могут сигнализировать о наличии нарушений
            // NOTE: "pe.invalid" is our custom DOM event - see PropertyEditor._renderError
            that.jqOn($element, "pe.invalid", ".x-pe-container", function (e, error) {
                if (!that._isEventOwn(e)) {
                    return;
                }
                var $current = $(e.currentTarget);
                // toggle -invalid on container element:
                $current.toggleClass("-invalid", !!error);
                // toggle -invalid on label and PE's element:
                $current
                    .find(".x-pe-label")
                    .not($current.find(".x-pe-container .x-pe-label")) // exclude labels in nested x-pe-container
                    .toggleClass("-invalid", !!error);
            });
            var renderCtx = that.renderContext();
            renderCtx.editorPage = that.viewModel;
            //renderCtx.sections = {}; - для хелпера peSection (удалено в 1.34)
            _super.prototype.doRender.call(this, domElement);
            // add CSS class to container element
            $element.addClass(that.options.cssClass);
            if (that.options.peFocusOnClickContainer) {
                // NOTE: Don't use $(".x-pe-container", domElement) for binding to events - the set of .x-pe-container
                // may change in the future, if page content is dynamic. So we should use the jQuery method 'on'
                // with additional selector ".x-pe-container".
                that.jqOn($element, "click", ".x-pe-container", function (e) {
                    if (!that._isEventOwn(e)) {
                        return;
                    }
                    var $current = $(e.currentTarget);
                    //if ($current.find(":focus").length) { return; }
                    // NOTE: previous check isn't correct in IE, where focused element can be the parent DIV here.
                    // We need more advanced check:
                    if ($current.has(":input:focus, a:focus").length) {
                        return;
                    }
                    var pe = that.findContainerPE($current);
                    if (pe && !pe.disabled()) {
                        pe.focus();
                    }
                });
            }
            that.jqOn($element, "focusin", ".x-pe-container", function (e) {
                if (that._isEventOwn(e)) {
                    $(e.currentTarget).addClass("x-pe-container--active");
                    if (that.options.highlightFocused) {
                        $(e.currentTarget).addClass("x-pe-container--focused");
                    }
                }
            });
            that.jqOn($element, "focusout", ".x-pe-container", function (e) {
                $(e.currentTarget).removeClass("x-pe-container--active");
                if (that.options.highlightFocused)
                    $(e.currentTarget).removeClass("x-pe-container--focused");
            });
            // we need to match DOM elements to PE;
            // so add class .x-pe and data 'pe-key' to DOM elements of all PE
            core.lang.forEach(that.viewModel.editors, function (pe, key) {
                if (!pe.domElement) {
                    return;
                }
                var $pe = pe.$domElement;
                $pe.data("pe-key", key);
                $pe.addClass("x-pe");
            });
        };
        /**
         * Set focus on first property editor
         * @param {boolean} force if true - skip check for already focused DOM element
         */
        EditorPagePresenter.prototype.focusFirstPE = function (force) {
            var that = this;
            // focus on the first PE except mobile devices where it's useless
            if (!core.platform.isMobileDevice) {
                window.setTimeout(function () {
                    if (!that.domElement) {
                        return;
                    }
                    // the document can already have a focused element (inside or outside of the current part)
                    if (!force && core.html.focused()) {
                        return;
                    }
                    // find first enable PE - use class '.x-pe' and data 'pe-key' added earlier
                    that.$domElement.find(".x-pe").each(function () {
                        var $pe = $(this), peKey = $pe.data("pe-key"), pe = that.viewModel.editors[peKey];
                        if (pe && !pe.disabled()) {
                            pe.focus();
                            return false;
                        }
                    });
                });
            }
        };
        EditorPagePresenter.prototype.findContainerPE = function ($container) {
            var page = this.viewModel, peKey = $container.data("pe-key");
            if (peKey) {
                return page.editors[peKey];
            }
            // find the PE rendered in the target container (slow method!)
            //page.editor.traceSource.warn("Set 'data-pe-key' attribute on elements with '.x-pe-container' for better performance");
            return core.lang.find(page.editors, function (pe, key) {
                if (!pe || !pe.domElement) {
                    return false;
                }
                // find parent container for the PE
                var $current = pe.$domElement.closest(".x-pe-container");
                if (!$current.length) {
                    return false;
                }
                // cache the PE key in the data attached to the container DOM-element
                if (!$current.data("pe-key")) {
                    $current.data("pe-key", key);
                }
                return $current[0] === $container[0];
            });
        };
        /**
         * Checks if a jQuery event was triggered inside the current page (not nested)
         * @param {JQueryEventObject} e
         * @returns {boolean}
         * @private
         */
        EditorPagePresenter.prototype._isEventOwn = function (e) {
            // NOTE: Событие может произойти во вложенном редакторе/фильтре. Чтобы различить свой pe-container
            // и чужой, найдем ближайший элемент EditorPage к элементу сгенерировавшем событие, и сравним со своим
            // элементом $domElement.
            var $pageEl = $(e.target).closest(".x-editor-page");
            return this.$domElement[0] === $pageEl[0];
        };
        EditorPagePresenter.makeColumnsRatioHelperData = function (options) {
            var data = Handlebars.createFrame(options.data), peLayout = data.peLayout ? core.lang.clone(data.peLayout) : {}, editorPage = data.context && data.context.editorPage, ratio = options.hash.columnsRatio, //e.g. "4:8"
            colonIndex;
            if (ratio) {
                colonIndex = ratio.indexOf(":");
                if (colonIndex > 0) {
                    peLayout.labelColumnRatio = ratio.slice(0, colonIndex);
                    peLayout.peColumnRatio = ratio.slice(colonIndex + 1);
                }
            }
            if (options.hash.noLabel !== undefined) {
                peLayout.noLabel = !!options.hash.noLabel;
            }
            if (editorPage) {
                peLayout.labelColumnRatio = peLayout.labelColumnRatio || editorPage.labelColumnRatio;
                peLayout.peColumnRatio = peLayout.peColumnRatio || editorPage.peColumnRatio;
            }
            data.peLayout = peLayout;
            return data;
        };
        EditorPagePresenter.defaultOptions = {
            template: templateDef,
            bound: undefined,
            cssClass: "has-bs-grid",
            sectionHeadings: true,
            peFocusOnClickContainer: true
        };
        return EditorPagePresenter;
    }(View));
    var makeColumnsRatioHelperData = EditorPagePresenter.makeColumnsRatioHelperData;
    /**
     * Register HB helper 'peLayout'. The helper sets a ratio of label width to PE width for all nested PEs.
     * @example
     * {{peLayout columnsRatio="4:8"}}
     */
    Handlebars.registerHelper("peLayout", function (options) {
        var data = makeColumnsRatioHelperData(options);
        return options.fn.call(this, this, { data: data });
    });
    /**
     * Register partial HB template 'peContainer'
     * @example
     * {{> peContainer editors.title}}
     */
    Handlebars.registerPartial("peContainer", templatePeContainer);
    Handlebars.registerPartial("sectionTitle", templateSectionTitle);
    /**
     * Register HB helper 'peContainer'.
     * @example
     * {{peContainer editors.title columnsRatio="4:8"}}
     * In fact it's the same as
     * {{#peLayout columnsRatio="4:8"}}
     *   {> peContainer editors.title}}
     * {{/peLayout}}
     */
    Handlebars.registerHelper("peContainer", function (context, options) {
        if (core.lang.isString(context)) {
            var page = options.data.context.editorPage;
            if (page) {
                context = page.editors[context];
            }
        }
        if (!context) {
            throw new Error("peContainer: no context was specified (no property editor instance)");
        }
        var data = makeColumnsRatioHelperData(options), html = Handlebars.partials["peContainer"].call(this, context, { data: data });
        return new Handlebars.SafeString(html);
    });
    /**
     * Register HB helper 'pe'
     * @example
     * {{pe name='propName'}}
     */
    Handlebars.registerHelper("pe", function (options) {
        if (!options || !options.hash) {
            throw new Error("Incorrect 'pe' HB-helper using: no hash object specified (make sure it's used as: {{pe name='prop'}})");
        }
        var markup = new View.ChildViewMarkup(options), propName = options.hash.name, viewModel = options.hash.viewModel || this, 
        // NOTE: запомним индекс для использования в peFactory. Там нельзя использовать options.data.index,
        // так как это всегда будет последний индекс в коллекции
        index = options.data.index, peMd = markup.getHash(), // все свойства хелпера, кроме известных, считаем свойствами объекта метаданнных
        // get parent view (it can be EditorPagePresenter or nested view, e.g. added via {{observe}})
        view = options.data.view, editorPage = view.renderContext().editorPage, registerOptions = { disposeOnUnload: false }; // PE не нужно dispose-ить при unload-е
        // if helper is being used inside a section template, this will be EditorPage.Section
        if (viewModel instanceof core.ui.EditorPage.Section) {
            viewModel = editorPage.viewModel;
        }
        if (!editorPage) {
            throw new Error("handlebars 'pe' helper: cannot find EditorPage object");
        }
        if (!editorPage.editor || !editorPage.editors) {
            throw new Error("handlebars 'pe' helper: there was EditorPage expected in current view's renderContext");
        }
        if (!propName) {
            throw new Error("handlebars 'pe' helper: 'name' attribute should be specified");
        }
        delete peMd.viewModel;
        // функция-фабрика, возвращающая экземпляр PE
        function peFactory() {
            var pe, peKey;
            // поищем PE среди уже созданных на странице
            core.lang.some(editorPage.editors, function (editor, key) {
                if (editor.viewModel === viewModel && editor.viewModelProp === propName) {
                    pe = editor;
                    peKey = key;
                    return true;
                }
            });
            if (!pe) {
                // создаем сам PE
                utils.parseObject(peMd);
                peMd = editorPage.editor._getPropertyEditorMd(viewModel, peMd);
                if (!peMd.vt) {
                    throw new Error("handlebars 'pe' helper: unknown property '" + propName + "' and no 'vt' attribute specified");
                }
                pe = editorPage.editor._createEditorForProp(editorPage, peMd, viewModel);
                // вычисляем ключ, под которым будет зарегистрирован PE
                if (peMd.keyPrefix) {
                    peKey = index !== undefined ?
                        peMd.keyPrefix + "." + index + "." + propName :
                        peMd.keyPrefix + "." + propName;
                    delete peMd.keyPrefix;
                }
                else {
                    peKey = editorPage.viewModel === viewModel ?
                        peMd.name :
                        pe.createId(viewModel, propName);
                }
                editorPage.editors[peKey] = pe;
            }
            // NOTE: Эта функция-фабрика будет вызвана перед регистрацией PE как дочернего парта. При этом для
            // регистрации будет использован объект опций registerOptions (передаваемый по ссылке). Поэтому здесь
            // мы можем поменять свойства этого объекта и эти измененения будут подхвачены при регистрации.
            registerOptions.name = peKey;
            return pe;
        }
        markup.registerPendingChild(peFactory, registerOptions);
        return markup.getHtml();
    });
    EditorPage.defaultOptions.Presenter = EditorPagePresenter;
    return EditorPagePresenter;
});
//# sourceMappingURL=EditorPagePresenter.js.map