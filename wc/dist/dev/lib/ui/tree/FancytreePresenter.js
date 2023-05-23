/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/binding", "lib/ui/handlebars/View", "lib/ui/tree/Tree", "lib/formatters", "xhtmpl!lib/ui/templates/TreePresenter.hbs", "xhtmpl!lib/ui/templates/Tree.title.hbs", "xhtmpl!lib/ui/templates/Tree.data.hbs", "xhtmpl!lib/ui/templates/Tree.filter.hbs", "xhtmpl!lib/ui/templates/Tree.hint.hbs", "xhtmpl!lib/ui/templates/Tree.menuTree.hbs", "xhtmpl!lib/ui/templates/Tree.menuNode.hbs", "i18n!lib/nls/resources", "lib/ui/ExpandablePanel", "vendor/fancytree/jquery.fancytree", "vendor/fancytree/jquery.fancytree.table", "vendor/fancytree/jquery.fancytree.glyph", "xcss!lib/ui/styles/tree", "xcss!lib/ui/styles/FancytreePresenter"], function (require, exports, $, core, binding, View, Tree, formatters, tmplMain, tmplTitle, tmplData, tmplFilter, tmplHint, tmplMenuTree, tmplMenuNode, resources) {
    "use strict";
    var lang = core.lang;
    /**
     * CSS-class for table row which should be hided
     */
    var TR_HIDE_CLASS = "fancytree-hide";
    /**
     * Escape regular expression spec symbols.
     * @param {string} str - Source string.
     * @returns {string} - Escaped string.
     */
    function escapeRegex(str) {
        if (!str)
            return "";
        return (str + "").replace(/([.?*+\^\$\[\]\\(){}|-])/g, "\\$1");
    }
    /*
     * Extension for Fancytree to strip rows
     */
    function doStripe(tree) {
        var even = false;
        tree.visit(function (node) {
            if (!node.tr) {
                return "skip";
            }
            // пропускаем строчки, которые спрятаны
            if (node.tr.classList.contains(TR_HIDE_CLASS)) {
                return "skip";
            }
            if (even && node["_parity"] !== "even") {
                node["_parity"] = "even";
                $(node.tr).addClass("-even").removeClass("-odd");
            }
            else if (!even && node["_parity"] !== "odd") {
                node["_parity"] = "odd";
                $(node.tr).addClass("-odd").removeClass("-even");
            }
            even = !even;
            return !node.expanded ? "skip" : true;
        });
    }
    function stripeTree(tree, async) {
        if (!async) {
            window.clearTimeout(tree["__stripeTimeout"]);
            delete tree["__stripeTimeout"];
            doStripe(tree);
        }
        else if (!tree["__stripeTimeout"]) {
            tree["__stripeTimeout"] = window.setTimeout(function () {
                delete tree["__stripeTimeout"];
                doStripe(tree);
            });
        }
    }
    $.ui.fancytree.registerExtension({
        name: "table-stripped",
        version: "0.2.0",
        nodeRenderStatus: function (ctx) {
            this._super(ctx);
            var node = ctx.node;
            var parity = node["_parity"];
            if (parity === "odd") {
                $(node.tr).addClass("-odd");
            }
            else if (parity === "even") {
                $(node.tr).addClass("-even");
            }
            else {
                // NOTE: if several nodes are added or removed at the same time, we want recalculate
                // the parity of nodes only once. So call 'stripeTree' asynchronously (via setTimeout).
                stripeTree(ctx.tree, /*async*/ true);
            }
        },
        nodeSetExpanded: function (ctx, flag, opts) {
            var expanded = !!ctx.node.expanded;
            var children = ctx.node.children;
            return this._super(ctx, flag, opts).always(function () {
                if (expanded === !!ctx.node.expanded) {
                    return;
                } // expanded state wasn't changed
                var childrenAfter = ctx.node.children;
                if ((!children || !children.length) && (!childrenAfter || !childrenAfter.length)) {
                    return;
                }
                stripeTree(ctx.tree);
            });
        }
    });
    function isNodeFiltered(treeNode) {
        if (treeNode && treeNode.data && treeNode.data.model && treeNode.data.model.filtered) {
            if (treeNode.data.model.filtered()) {
                return true;
            }
        }
        return false;
    }
    $.ui.fancytree.registerExtension({
        name: "table-local-search",
        version: "0.1.0",
        nodeSetFocus: function (ctx, flag) {
            // переопределим поведение установки фокуса, когда узлы скрыты,
            // иначе, может отобразиться какой-нибудь узел, хотя он отфильтрован
            if (!ctx.node || isNodeFiltered(ctx.tree.getRootNode())) {
                return;
            }
            if (isNodeFiltered(ctx.node)) {
                return;
            }
            this._super(ctx, flag);
        },
        nodeSetExpanded: function (ctx, flag, opts) {
            var expanded = !!ctx.node.expanded;
            var children = ctx.node.children;
            return this._super(ctx, flag, opts).always(function () {
                if (expanded === !!ctx.node.expanded) {
                    return; // expanded state wasn't changed
                }
                var childrenAfter = ctx.node.children;
                if ((!children || !children.length) && (!childrenAfter || !childrenAfter.length)) {
                    return;
                }
                // иногда, Fancytree может вызвать команду подгрузки дочерних узлов
                // на узле, который скрыт, при этом он отобразится - скроем его обратно
                ctx.tree.visit(function (node) {
                    FancytreePresenter.hideFilteredNode(node);
                });
                stripeTree(ctx.tree, true);
            });
        },
        nodeKeydown: function (ctx) {
            // переопределим обработку нажатия клавиш на скрытых узлах,
            // иначе, возникают ошибки
            if (!ctx.node || isNodeFiltered(ctx.tree.getRootNode()))
                return;
            if (isNodeFiltered(ctx.node)) {
                return;
            }
            this._super(ctx);
        }
    });
    var FancytreePresenter = /** @class */ (function (_super) {
        __extends(FancytreePresenter, _super);
        /**
         * @constructs FancytreePresenter
         * @extends View
         */
        function FancytreePresenter(options) {
            var _this = this;
            options = FancytreePresenter.mixOptions(options, FancytreePresenter.defaultOptions);
            _this = _super.call(this, options) || this;
            // NOTE: если нет extension-а "table", то по умолчанию будет использоваться эффекты jq-ui (toggle("blind"),
            // которые не подключены.
            if (!_this.options.treeOptions.extensions || _this.options.treeOptions.extensions.indexOf("table") < 0) {
                _this.options.treeOptions.toggleEffect = null;
            }
            _this.eventPublisher = core.Application.current.eventPublisher;
            _this._selecting = undefined;
            _this._activating = undefined;
            var templates = [];
            _this.options.templates.forEach(function (name) {
                var tmpl = _this.options.partialTemplates[name];
                if (tmpl) {
                    templates.push(tmpl);
                }
            });
            _this.templates = templates;
            return _this;
        }
        FancytreePresenter.prototype.applyHostContext = function (opt) {
            _super.prototype.applyHostContext.call(this, opt);
            this.mixHostOptions(opt.host, FancytreePresenter.hostDefaultOptions);
            return null;
        };
        FancytreePresenter.prototype.doRender = function (domElement) {
            var that = this;
            if (that.options.hideMenuTree === undefined) {
                that.options.hideMenuTree = !that.viewModel.menuTree || that.viewModel.menuTree.isEmpty();
            }
            if (that.options.hideMenuNode === undefined) {
                // NOTE: изначально обычно меню узла пустое, т.к. узел не выбран, если menuSelection нет,
                // то мы рискуем скрыть строку меню навсегда.
                // Поэтому, скроем строку меню только в случае, если оба меню заданы пустыми в опциях
                var optMenuSelection = that.viewModel.options.menuSelection;
                var optMenuNode = that.viewModel.options.menuNode;
                that.options.hideMenuNode =
                    (!optMenuNode ||
                        (lang.isEmpty(optMenuNode.items) && !lang.isFunction(optMenuNode))) &&
                        (!optMenuSelection ||
                            (lang.isEmpty(optMenuSelection.items) && !lang.isFunction(optMenuSelection)));
            }
            _super.prototype.doRender.call(this, domElement);
            var $tree = $(domElement).find(".x-tree-data-table");
            if (!$tree.length) {
                return;
            }
            that.uiTree = that.createUiTree($tree);
            var uiRoot = that.uiTree.rootNode;
            var root = that.viewModel.root();
            uiRoot.data.model = root;
            if (root.children()) {
                that.uiTree.enableUpdate(false);
                root.children().all().forEach(function (node) {
                    uiRoot.addChildren(that.createUiNodeData(node));
                });
                that.uiTree.enableUpdate(true);
            }
            that.selectNodes(that.viewModel.selection().all(), true);
            that.activateNode(that.viewModel.activeNode(), { expand: true });
            that.viewModel.bind("change:nodes", that._onTreeNodesChange, that);
            that.viewModel.bind("itemChange", that._onTreeNodeChange, that);
            that.viewModel.bind("change:activeNode", that._onActiveNodeChange, that);
            that.viewModel.selection().bind("change", that._onSelectionChange, that);
            // activate first node when focusing by TAB
            that.jqOn($tree, "keyup", function (e) {
                if (e.which !== core.html.keyCode.TAB)
                    return;
                that._onExternalFocus();
                that.scrollToSelf();
            });
            // tree menu hotkey handler
            that.jqOn(that.$domElement, "keyup", function (e) {
                if (core.html.keyCode.isNavigationKey(e))
                    return;
                if (that.isSearchEnabled()) {
                    // отдельная обработка нажатия ENTER на поле с текстовым фильтром
                    if (e.which === core.html.keyCode.ENTER) {
                        if (e.target["name"] === "searchText" && $(e.target).is("input")) {
                            that._applySearch();
                            return false;
                        }
                    }
                }
                var tree = that.viewModel;
                if (tree.menuTree && tree.menuTree.executeHotkey(e)) {
                    return false;
                }
            });
            if (that.options.affixMenu && !that.options.hideMenuNode && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.add_element", {
                    element: $(".x-tree-menu-node", that.domElement),
                    controlledBy: $(".x-tree-body", that.domElement),
                    affixTo: "bottom"
                });
            }
            if (!that.options.autoHeight && that.options.treeHeight > 0) {
                $(".x-tree-body, .x-tree-data", that.domElement)
                    .css("min-height", that.options.treeHeight)
                    .css("max-height", that.options.treeHeight)
                    .css("overflow", "auto");
            }
        };
        FancytreePresenter.prototype.createUiTree = function ($tree) {
            var that = this, treeOptions = lang.extendEx(that._buildDefaultTreeOptions($tree), that.options.treeOptions, { deep: true });
            if (that.options.dnd) {
                that._enableDragAndDrop(treeOptions);
            }
            if (that.options.columns) {
                this._enableMultiColum($tree);
            }
            if (that.isSearchEnabled()) {
                this._enableLocalSearch($tree, treeOptions);
            }
            $tree.fancytree(treeOptions);
            return $tree.fancytree("getTree");
        };
        /**
         * Fancytree Default Options builder.
         * @param {JQuery} $tree - JQuery tree element.
         * @returns Default Fancytree options.
         */
        FancytreePresenter.prototype._buildDefaultTreeOptions = function ($tree) {
            var that = this;
            return {
                //extensions: [ "table", "table-stripped" ],
                source: [],
                checkbox: that.options.hasCheckboxes,
                // NOTE: autoScroll runs when node get focus. But we have own handlers of `focus` and `focusTree`
                // events, which can change an active node and conflict with autoScroll therefore.
                // So turn autoScroll off and scroll the tree manually - see `_scrollToUiNode` method.
                //autoScroll: !that.options.autoHeight,
                autoScroll: false,
                titlesTabbable: true,
                scrollParent: $tree.parent(),
                scrollOfs: { top: 7, bottom: 7 },
                selectMode: 2,
                strings: {
                    loading: resources.loading + "&#8230;",
                    //loadError: //(core.ui.iconProvider && core.ui.iconProvider.getIcon("error")) + resources["objectTree.error.node_load"]
                    loadError: resources["objectTree.error.node_load"]
                },
                debugLevel: 1,
                table: {
                    checkboxColumnIdx: 0,
                    nodeColumnIdx: (that.options.hasCheckboxes ? 1 : 0) + (that.options.hasNumbering ? 1 : 0)
                },
                lazyLoad: that._onUiLazyLoad.bind(that),
                activate: that._onUiActivate.bind(that),
                deactivate: that._onUiDeactivate.bind(that),
                //focus: that._onUiFocus.bind(that),
                focusTree: that._onUiFocusTree.bind(that),
                blurTree: that._onUiBlurTree.bind(that),
                expand: that._onUiExpandCollapse.bind(that),
                collapse: that._onUiExpandCollapse.bind(that),
                createNode: that._onUiCreateNode.bind(that),
                renderColumns: that._onUiRenderColumns.bind(that),
                dblclick: that._onUiDblClick.bind(that),
                keydown: that._onUiKeyDown.bind(that),
                select: that._onUiSelect.bind(that)
            };
        };
        /**
         * Enable Drag'n'Drop support.
         * @param treeOptions - Fancytree options.
         */
        FancytreePresenter.prototype._enableDragAndDrop = function (treeOptions) {
            var that = this;
            treeOptions.extensions.push("dnd");
            // NOTE: позволим переопределить опции dnd через treeOptions
            treeOptions["dnd"] = lang.extendEx({
                autoExpandMS: 400,
                //focusOnClick: true,
                preventRecursiveMoves: true,
                preventVoidMoves: true,
                // NOTE: ВАЖНО задать smartRevert=false,
                // это заставляет dnd-плагин не устанавливать опцию revert=true для jQ draggable,
                // т.к. при revert!==false включается анимация ("возврата узла") - см. draggable._mouseStop,
                // которая переопределяется плагином jquery.animate-enhanced (и выполняетя через CSS-трансформацию),
                // но если анимация выполняется для невидимого узла, то колбэк не срабатывает.
                // В итоге "draggable" плагин залипает в состоянии "dragging" и узлы перестают перетаскиваться.
                smartRevert: false,
                dropMarkerOffsetX: -48,
                initHelper: function (sourceNode, ctx) {
                    var $helper = ctx.ui.helper;
                    var $nodeTag = $(sourceNode.span);
                    $nodeTag.find(".fancytree-icon").clone().insertBefore($helper.find(".fancytree-title"));
                },
                dragStart: function (uiNode, ctx) {
                    var node = uiNode.data.model;
                    if (!node) {
                        return false;
                    }
                    return that.viewModel.dragStart(node) ? true : false;
                },
                dragEnter: function (uiNode, ctx) {
                    // return ["before", "over", "after"];
                    if (!ctx.otherNode || !uiNode.data.model) {
                        // NOTE: data.otherNode may be null for non-fancytree droppables
                        // NOTE: uiNode.data.model is null for non-data nodes (statusNodeType)
                        return false;
                    }
                    return that.viewModel.dragEnter(ctx.otherNode.data.model, uiNode.data.model) ? "over" : false;
                },
                dragDrop: function (uiNode, ctx) {
                    uiNode.setExpanded(true).always(function () {
                        // Wait until expand finished, then add the additional child
                        var promise = that.viewModel.dragDrop(ctx.otherNode.data.model, uiNode.data.model);
                        lang.async.then(promise, function (res) {
                            if (res) {
                                // handler asks us to move the node,
                                // otherwise it'll be moved by binding
                                ctx.otherNode.moveTo(uiNode, ctx.hitMode);
                            }
                        });
                    });
                }
                /* не надо?
                 dragExpand: null,     // Callback(targetNode, data), return false to prevent autoExpand
                 dragLeave: null       // Callback(targetNode, data)
                */
            }, that.options.treeOptions["dnd"], { deep: true });
        };
        /**
         * Enable table mode with multiple columns.
         * @param {JQuery} $tree - JQuery tree element.
         */
        FancytreePresenter.prototype._enableMultiColum = function ($tree) {
            var that = this;
            var $table = that.$domElement.find(".x-tree-data-table");
            // change last column width from default "100%" to "0*":
            $table.find(">colgroup >col:last").attr("width", "0*");
            // set width for columns w/o widths (numbering/checkbox)
            $table.find(">colgroup >col:not([width])").attr("width", "10px");
            // add additional columns
            for (var i = 0; i < that.options.columns.length; i++) {
                $("<col width='0*'/>").appendTo($table.children("colgroup").get(0));
                $("<th></th>").appendTo($tree.find("thead>tr").get(0));
            }
            that._columnCount = $table.find("thead >tr:last >th").length;
        };
        /**
         * Enable local search.
         * @param {JQuery} $tree - JQuery tree element.
         * @param treeOptions - Fancytree options.
         */
        FancytreePresenter.prototype._enableLocalSearch = function ($tree, treeOptions) {
            var that = this;
            treeOptions.extensions.push("table-local-search");
            $tree.addClass("fancytree-ext-filter");
            $tree.addClass("fancytree-ext-filter-hide");
            that.viewModel.bind("change:searchText", that._searchTextChanged, that);
        };
        /**
         * Search text change handler.
         */
        FancytreePresenter.prototype._searchTextChanged = function () {
            this._applySearch();
        };
        /**
         * Applies current search text filter.
         * @param {Tree.Node} startNode - Node to start search from. Default - ROOT node.
         */
        FancytreePresenter.prototype._applySearch = function (startNode) {
            var that = this;
            var searchText = that.viewModel.searchText();
            var root = that.viewModel.root();
            if (!startNode)
                startNode = root;
            that.viewModel.filterTreeNodes(escapeRegex(searchText), startNode);
            if (that._isColumnsSearchEnabled()) {
                that.uiTree.visit(function (node) {
                    that._renderColumns(node);
                });
            }
            // иногда, Fancytree может вызвать команду подгрузки дочерних узлов
            // на узле, который скрыт, при этом он отобразится - скроем его обратно
            FancytreePresenter.hideFilteredNode(that.findUiNode(startNode));
            stripeTree(that.uiTree, /*async*/ true);
            this.viewModel.refreshSearchStat();
        };
        /**
         * HTML-highlight the specified text in the source.
         * @param {string} source - Source text.
         * @param {string} textToHighlight - Text to highlight.
         * @param {boolean} isHtmlEncoded - Is source text html-markup.
         * @returns {string} Formatted text (HTML).
         */
        FancytreePresenter.prototype._highlight = function (source, textToHighlight, isHtmlEncoded) {
            if (!textToHighlight || !source) {
                return source;
            }
            var reHighlight = new RegExp(escapeRegex(textToHighlight), "gi");
            var highlighted;
            if (!isHtmlEncoded) {
                highlighted = source.replace(reHighlight, function (s) { return "<span class=\"highlight\">" + s + "</span>"; });
            }
            else {
                // #740: we must not apply the marks to escaped entity names, e.g. `&quot;`
                // Use some exotic characters to mark matches:
                var temp = lang.decodeHtml(source).replace(reHighlight, function (s) { return "\uFFF7" + s + "\uFFF8"; });
                // now we can escape text
                return lang.encodeHtml(temp)
                    .replace(/\uFFF7/g, "<span class=\"highlight\">")
                    .replace(/\uFFF8/g, "</span>");
            }
            return highlighted;
        };
        /**
         * Hide node from UI if it not matched to search text.
         * @param {Fancytree.FancytreeNode} uiNode - Fancytree node.
         */
        FancytreePresenter.hideFilteredNode = function (uiNode) {
            var that = this;
            if (!uiNode)
                return;
            var treeNode = uiNode.data.model;
            if (treeNode && treeNode.filtered()) {
                that._deselectUiNode(uiNode);
                if (uiNode.tr && !uiNode.tr.classList.contains(TR_HIDE_CLASS))
                    uiNode.tr.classList.add(TR_HIDE_CLASS);
            }
        };
        /**
         * Is local search enabled.
         * @returns {boolean} - `true` if local search is enabled, otherwise`false`.
         */
        FancytreePresenter.prototype.isSearchEnabled = function () {
            var searchOptions = this.options.search;
            return searchOptions === true || (typeof searchOptions === "object" && searchOptions.enable);
        };
        /**
         * Is local search in columns enabled.
         * @returns {boolean} - true` if local search in columns is enabled, otherwise`false`.
         * @private
         */
        FancytreePresenter.prototype._isColumnsSearchEnabled = function () {
            var searchOptions = this.options.search;
            return typeof searchOptions === "object"
                && searchOptions.enable
                && searchOptions.searchInColumns;
        };
        /**
         * Correctly deactivates and deselect tree node in UI.
         * @param {Fancytree.FancytreeNode} uiNode - Fancytree node.
         */
        FancytreePresenter._deselectUiNode = function (uiNode) {
            if (uiNode.isActive()) {
                uiNode.setActive(false);
            }
            if (uiNode === uiNode.tree.focusNode) {
                uiNode.setFocus(false);
            }
            if (uiNode.isSelected()) {
                uiNode.setSelected(false);
            }
        };
        FancytreePresenter.prototype.unload = function () {
            var that = this;
            that.viewModel.unbind("change:nodes", null, that);
            that.viewModel.unbind("itemChange", null, that);
            that.viewModel.unbind("change:activeNode", null, that);
            that.viewModel.unbind("change:searchText", null, that);
            that.viewModel.selection().unbind("change", null, that);
            if (that.options.affixMenu && !that.options.hideMenuNode && that.eventPublisher) {
                that.eventPublisher.publish("ui.affix.remove_element", {
                    element: $(".x-tree-menu-node", that.domElement)
                });
            }
            if (that.uiTree) {
                that.uiTree.widget.destroy();
                that.uiTree = undefined;
            }
            _super.prototype.unload.call(this);
        };
        FancytreePresenter.prototype.focus = function () {
            var that = this;
            if (!that.uiTree) {
                return;
            }
            if (!that.uiTree.$container.find(":focus").length) {
                that._onExternalFocus();
                that.uiTree.$container.focus();
            }
        };
        FancytreePresenter.prototype.scrollToSelf = function () {
            var that = this;
            if (!that.uiTree) {
                return;
            }
            var uiNode = that.uiTree.getFocusNode();
            if (!uiNode)
                return;
            core.html.scrollToElement({
                element: (uiNode && uiNode.tr) || that.domElement,
                align: "center"
            });
        };
        FancytreePresenter.prototype.findUiNode = function (node) {
            if (!node) {
                return null;
            }
            var that = this;
            var result = null;
            var rootNode = that.uiTree.rootNode;
            rootNode.visit(function (uiNode) {
                if (uiNode.data.model === node) {
                    result = uiNode;
                    return false; // stop iteration
                }
            }, /*includeSelf*/ true);
            return result;
        };
        FancytreePresenter.prototype.createUiNodeData = function (node) {
            var that = this, state = node.state(), isLazy = state === Tree.NodeState.initial || state === Tree.NodeState.loading;
            return {
                // TODO: обновлять title в FancytreeNode значением that.viewModel.getNodeTitle(node)
                title: "",
                lazy: isLazy,
                unselectable: !that.viewModel.isNodeSelectable(node),
                data: { model: node },
                children: isLazy ? null :
                    node.children().all().map(function (childNode) {
                        return that.createUiNodeData(childNode);
                    })
            };
        };
        FancytreePresenter.prototype.activateNode = function (node, options) {
            var that = this;
            if (that._activating) {
                return;
            }
            try {
                that._activating = true;
                var uiNode_1 = that.findUiNode(node);
                if (uiNode_1) {
                    uiNode_1.makeVisible({ scrollIntoView: false }).done(function () {
                        uiNode_1.setActive();
                        if (options && options.expand && node.state() === Tree.NodeState.loaded) {
                            uiNode_1.setExpanded(true);
                        }
                        // scroll to active node
                        if (that.options.scrollToActiveNode) {
                            that._scrollToUiNode(uiNode_1);
                        }
                    });
                }
                else {
                    that.uiTree.activateKey(false); // reset active node
                }
            }
            finally {
                that._activating = undefined;
            }
        };
        /**
         * Select or deselect tree nodes
         * @param {TreeNode|Array} nodes A single tree node or an array of nodes.
         * @param {Boolean} [select=true] Should be nodes selected (by default) or deselected.
         * @returns {jQuery.Promise}
         * NOTE: This method doesn't modify viewModel.selection()
         */
        FancytreePresenter.prototype.selectNodes = function (nodes, select) {
            var that = this;
            if (that._selecting) {
                return;
            }
            that._selecting = true;
            nodes = lang.isArray(nodes) ? nodes : [nodes];
            var promises = nodes.map(function (node) {
                var uiNode = that.findUiNode(node);
                return uiNode && uiNode.makeVisible({ scrollIntoView: false }).done(function () {
                    uiNode.setSelected(select);
                });
            });
            return lang.whenAll(promises).always(function () {
                that._selecting = undefined;
            });
        };
        FancytreePresenter.prototype._scrollToUiNode = function (uiNode) {
            if (uiNode && uiNode.tr) {
                // scroll viewPort if it has a fixed height
                if (!this.options.autoHeight) {
                    uiNode.scrollIntoView();
                }
                core.html.scrollToElement({ element: uiNode.tr, align: "center" });
            }
        };
        FancytreePresenter.prototype._onUiActivate = function (e, ctx) {
            var that = this;
            if (that._activating) {
                return;
            }
            try {
                that._activating = true;
                that.viewModel.activeNode(ctx.node.data.model);
                // scroll to active node
                if (that.options.scrollToActiveNode) {
                    that._scrollToUiNode(ctx.node);
                }
            }
            finally {
                that._activating = undefined;
            }
        };
        FancytreePresenter.prototype._onUiDeactivate = function (e, ctx) {
            var that = this;
            if (that._activating) {
                return;
            }
            try {
                that._activating = true;
                that.viewModel.activeNode(null);
            }
            finally {
                that._activating = undefined;
            }
        };
        // удалено для лечения WC-1703 ObjectTree: в диалоге при клике на любой узел всегда фокусируется текущий выделенный узел
        // На вид поведение не изменилось, кроме того, что разворачивании узла не активируется первый узел. но так даже лучше
        // Смысл логики не очень понятен: при установке фокуса на узел мы берем текущий активный и устанавливаем фокус на него.
        /*
            _onUiFocus(e: JQueryEventObject, ctx: Fancytree.EventData): void {
                let uiActiveNode = ctx.tree.getActiveNode();
                if (uiActiveNode) {
                    if (ctx.node !== uiActiveNode) {
                        uiActiveNode.setFocus();
                    }
                } else {
                    ctx.node.setActive();
                }
            }
        */
        FancytreePresenter.prototype._onUiFocusTree = function (e, ctx) {
            var uiActiveNode = ctx.tree.getActiveNode();
            if (uiActiveNode) {
                uiActiveNode.setFocus();
            }
        };
        FancytreePresenter.prototype._onUiBlurTree = function (e, ctx) {
            var uiFocusedNode = ctx.tree.getFocusNode();
            if (uiFocusedNode) {
                uiFocusedNode.setFocus(false);
            }
        };
        FancytreePresenter.prototype._onUiExpandCollapse = function (e, ctx) {
            var that = this;
            var uiNode = ctx.node;
            var node = uiNode.data.model;
            if (e.type === "fancytreecollapse") {
                // remove selected, active and focus flags for the nodes which became invisible after collapsing
                uiNode.visit(function (childNode) {
                    FancytreePresenter._deselectUiNode(childNode);
                });
                if (node.transientChildren) {
                    // remove all children on collapsing, they will be reloaded again on expanding
                    uiNode.children = null;
                    node.state("initial");
                    node.children().clear();
                }
            }
            if (e.type === "fancytreeexpand") {
                if (that.isSearchEnabled()) {
                    // при разворачивании узла, fancytree сбрасывает все css-классы элемента <tr>
                    // восстановим спец. класс для отфильтрованных элементов
                    uiNode.visit(function (childNode) {
                        FancytreePresenter.hideFilteredNode(childNode);
                    });
                }
            }
            if (ctx.targetType === "expander") {
                var uiFocusedNode = ctx.tree.getFocusNode();
                if (!uiFocusedNode) {
                    if (!(that.isSearchEnabled() && node.filtered()))
                        uiNode.setFocus();
                }
            }
            this._refreshAffixAsync(ctx.tree.options.toggleEffect ? ctx.tree.options.toggleEffect.duration : 0);
        };
        FancytreePresenter.prototype._onUiLazyLoad = function (e, ctx) {
            var that = this;
            ctx.result = false; // control loading manually
            this.viewModel.loadNodeChildren(ctx.node.data.model);
        };
        FancytreePresenter.prototype._onUiCreateNode = function (e, ctx) {
            var that = this;
            if (!ctx.node.data.model) {
                return;
            } // it may be status node
            if (!ctx.node.span) {
                return;
            } // it may be not rendered node
            var $node = $(ctx.node.span);
            var $tr = $(ctx.node.tr);
            var $title = $node.find(".fancytree-title");
            var $icon = $node.find(".fancytree-icon");
            var treeNode = ctx.node.data.model;
            if (that.isSearchEnabled()) {
                var nodeFilteredChangeCallback_1 = function () {
                    var uiNode = this.node;
                    var treeNode = this.node.data.model;
                    if (treeNode.filtered()) {
                        FancytreePresenter._deselectUiNode(uiNode);
                        $tr.addClass(TR_HIDE_CLASS);
                    }
                    else {
                        $tr.removeClass(TR_HIDE_CLASS);
                    }
                };
                var searchTextChangeCallback_1 = function () {
                    var title = that.viewModel.getNodeTitle(treeNode);
                    if (that.isSearchEnabled()) {
                        var searchText = that.viewModel.searchText();
                        title = that._highlight(title, searchText, true);
                    }
                    $title.html(title);
                };
                treeNode.bind("change:filtered", nodeFilteredChangeCallback_1, ctx);
                that.viewModel.bind("change:searchText", searchTextChangeCallback_1, ctx);
                var disposables = binding.setupNodeDisposables($title);
                disposables.push({
                    dispose: function () {
                        treeNode.unbind("change:filtered", nodeFilteredChangeCallback_1, ctx);
                    }
                });
                disposables.push({
                    dispose: function () {
                        that.viewModel.unbind("change:searchText", searchTextChangeCallback_1, ctx);
                    }
                });
            }
            binding.databind(binding.html($title, "html"), binding.expr(ctx.node.data.model, function () {
                var treeNode = this;
                var title = that.viewModel.getNodeTitle(treeNode);
                /*
                // TODO: как-то коряво тут обновлять title у FancytreeNode
                ctx.node.title = title;
                */
                if (that.isSearchEnabled()) {
                    var searchText = that.viewModel.searchText();
                    return that._highlight(title, searchText, true);
                }
                return title;
            }));
            binding.databind(binding.html($node, "cssClass"), binding.expr(ctx.node.data.model, function () {
                var obj = this.data();
                return {
                    "-new-item": lang.get(obj, "isNew"),
                    "-modified-item": lang.get(obj, "isModified"),
                    "-removed-item": lang.get(obj, "isRemoved")
                };
            }));
            binding.databind(binding.html($icon, "cssClass"), binding.expr(ctx.node.data.model, function () {
                var iconName = that.viewModel.getNodeIcon(this), iconProvider = core.ui.iconProvider, iconClass = iconName && iconProvider && iconProvider.getIconCssClass(iconName);
                return iconClass ? "fancytree-icon " + iconClass : "fancytree-icon";
            }));
            // NOTE: bindings will be auto-disposed when somebody clear a markup via jQuery
            // (it will be done when the node is removed or the tree is unloaded)
        };
        FancytreePresenter.prototype._renderColumns = function (node) {
            var that = this;
            var columns = that.options.columns;
            if (!(columns && columns.length)) {
                return;
            }
            var $tr = $(node.tr);
            var $tdList;
            if (!$tr.data("x-td-list")) {
                $tdList = $(node.tr).find(">td");
                $tr.data("x-td-list", $tdList);
            }
            else {
                $tdList = $tr.data("x-td-list");
            }
            // TODO: ввести роли как в списке, то можно будет настраивать последовательность стандартных колонок
            // (role: "number"[?], "check"[?], "title"[1], "aux"[*])
            if (that.options.hasNumbering) {
                // number column is always after checkbox column
                $tdList.eq(that.options.hasCheckboxes ? 1 : 0).text(node.getIndexHier());
            }
            var auxColCount = columns.length;
            var offset = that._columnCount - auxColCount;
            for (var i = 0; i < auxColCount; i++) {
                var column = columns[i];
                var text = that.viewModel.getNodeColumnValue(node.data.model, column);
                var $td = $tdList.eq(offset + i);
                if (text) {
                    if (formatters.isHtml(text)) {
                        $td.html(text.toHTML());
                    }
                    else {
                        $td.text(lang.encodeHtml(text));
                        if (that._isColumnsSearchEnabled()) {
                            var searchText = that.viewModel.searchText();
                            var html = $td.html();
                            html = this._highlight(html, searchText, false);
                            $td.html(html);
                        }
                    }
                }
                if (column.colspan) {
                    var colspan = column.colspan(node.data.model);
                    if (colspan > 1) {
                        // current column should be merged with next ones
                        // NOTE: colspan==2 means join with the next column
                        $td.attr("colspan", colspan);
                        for (var n = offset + i + 1; n < offset + i + colspan; n++) {
                            $tdList.eq(n).remove();
                        }
                        i = i + colspan - 1; // skip merged columns
                    }
                }
            }
        };
        FancytreePresenter.prototype._onUiRenderColumns = function (e, ctx) {
            this._renderColumns(ctx.node);
        };
        FancytreePresenter.prototype._onUiDblClick = function (e, ctx) {
            if (e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            if (ctx.targetType === "checkbox" || ctx.targetType === "expander") {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            this._executeDefaultMenuItem();
        };
        FancytreePresenter.prototype._onUiKeyDown = function (e) {
            var that = this, menuNode = that.viewModel.menuNode, menuTree = that.viewModel.menuTree;
            if ((menuNode && menuNode.executeHotkey(e)) || (menuTree && menuTree.executeHotkey(e))) {
                // menu hotkeys
                e.preventDefault();
                e.stopPropagation();
            }
            else if (!e.ctrlKey && !e.shiftKey && !e.metaKey && e.which === core.html.keyCode.ENTER) {
                // Enter
                e.preventDefault();
                e.stopPropagation();
                that._executeDefaultMenuItem();
            }
            else if (e.ctrlKey && !e.shiftKey && (e.which === core.html.keyCode.C || e.which === core.html.keyCode.INSERT)) {
                // Ctrl+C or Ctrl+Ins
                that._copyToClipboad();
            }
        };
        FancytreePresenter.prototype._onUiSelect = function (e, ctx) {
            var that = this, node = ctx.node.data.model;
            if (!node) {
                return;
            }
            if (that._selecting) {
                return;
            }
            try {
                that._selecting = true;
                if (ctx.node.isSelected()) {
                    that.viewModel.selection().add(node);
                }
                else {
                    that.viewModel.selection().remove(node);
                }
            }
            finally {
                that._selecting = undefined;
            }
        };
        FancytreePresenter.prototype._executeDefaultMenuItem = function () {
            var that = this, menu = that.viewModel.menuNode, menuItem = menu && menu.getDefaultItem();
            if (menuItem) {
                menu.executeItem(menuItem, { tree: that.viewModel });
            }
        };
        FancytreePresenter.prototype._onExternalFocus = function () {
            var that = this;
            if (!that.uiTree)
                return;
            var uiFocusedNode = that.uiTree.getFocusNode();
            if (!uiFocusedNode) {
                uiFocusedNode = that.uiTree.getFirstChild();
                if (uiFocusedNode) {
                    if (!(that.isSearchEnabled() && uiFocusedNode.data.model.filtered()))
                        uiFocusedNode.setFocus();
                }
            }
        };
        FancytreePresenter.prototype._addNewNodes = function (nodes) {
            var that = this;
            if (!nodes || !nodes.length) {
                return;
            }
            var uiParent;
            var curParent = nodes[0].parent();
            var children = [that.createUiNodeData(nodes[0])];
            for (var i = 1; i < nodes.length; i++) {
                var node = nodes[i];
                var parent_1 = node.parent();
                if (curParent !== parent_1) {
                    // parent has changed, add all accumulated nodes to the previous parent,
                    // and start accumulating children of the new parent
                    uiParent = that.findUiNode(curParent);
                    if (uiParent) {
                        uiParent.addChildren(children);
                    }
                    children = [];
                    curParent = parent_1;
                }
                // the same parent as before,
                children.push(that.createUiNodeData(node));
            }
            uiParent = that.findUiNode(curParent);
            if (uiParent) {
                uiParent.addChildren(children);
            }
            /*
             WAS: before 1.30 we added every child at once:
             nodes.forEach(function (node) {
             var uiParent = that.findUiNode(node.parent());
             if (uiParent) {
             uiParent.addChildren(that.createUiNodeData(node));
             }
             });
             */
        };
        FancytreePresenter.prototype._onTreeNodesChange = function (tree, ea) {
            var that = this;
            var scheduleAffixRefresh;
            if (!that.uiTree) {
                return;
            }
            // NOTE: возможность оптимизации через выключение/включение enableUpdate, но кажется это не нужно
            /*
             // if Tree "changed" was produced by adding or removing big number of nodes then we'll use batch mode
             var batch = ea.added && ea.added.length > that.options.batchThreshold || ea.added && ea.added.length > that.options.batchThreshold;
             if (batch) {
             that.uiTree.enableUpdate(false);
             }
             */
            if (ea.added) {
                // NOTE: мы не знаем наверняка, являются ли все добавленные узлы (ea.added) братьями,
                // но скорее всего это так (разворачивают их родителя). Поэтому намного оптимальней добавить их всех сразу
                that._addNewNodes(ea.added);
                scheduleAffixRefresh = true;
            }
            if (ea.removed) {
                ea.removed.forEach(function (node) {
                    var uiNode = that.findUiNode(node);
                    if (uiNode && uiNode !== that.uiTree.rootNode) {
                        uiNode.remove();
                    }
                });
                scheduleAffixRefresh = true;
            }
            /*
             if (batch) {
             that.uiTree.enableUpdate(true);
             }
             */
            if (scheduleAffixRefresh) {
                that._refreshAffixAsync();
            }
        };
        FancytreePresenter.prototype._onTreeNodeChange = function (tree, ea) {
            var that = this, node = ea.changed, uiNode;
            if (!node || !that.uiTree) {
                return;
            }
            if (ea.prop !== "state") {
                return;
            }
            uiNode = that.findUiNode(node);
            if (!uiNode) {
                return;
            }
            switch (ea.value) {
                case "loading":
                    // remember that node was expanded
                    if (uiNode.isExpanded() && uiNode.children) {
                        uiNode.data.expand = true;
                    }
                    uiNode.setStatus("loading");
                    if (uiNode.isLazy()) {
                        uiNode.resetLazy(); // this also reset expanded state
                    }
                    break;
                case "loaded":
                    // empty lazy node became loaded, but without children
                    if (!uiNode.children) {
                        uiNode.children = [];
                    }
                    uiNode.setStatus("ok");
                    // restore expanded state
                    if (uiNode.data.expand) {
                        uiNode.setExpanded();
                        delete uiNode.data.expand;
                    }
                    // применим текстовый фильтр
                    if (that.isSearchEnabled()) {
                        that._applySearch(node);
                    }
                    break;
                case "failed":
                    uiNode.setStatus("error", node.message());
                    break;
            }
            // WAS: before 1.30 was (see WC-1428)
            // uiNode.render();
        };
        FancytreePresenter.prototype._onActiveNodeChange = function (tree, node) {
            this.activateNode(node);
        };
        FancytreePresenter.prototype._onSelectionChange = function (sender, ea) {
            var that = this;
            if (that._selecting) {
                return;
            }
            // NOTE: _selecting flag will be set in the method 'selectNodes'
            // NOTE: the same node can be in removed and in added collections
            lang.async.done(ea.removed && that.selectNodes(ea.removed, false), function () {
                return ea.added && that.selectNodes(ea.added, true);
            });
        };
        FancytreePresenter.prototype._refreshAffixAsync = function (delay) {
            var that = this;
            if (that._timeoutAffix) {
                window.clearTimeout(that._timeoutAffix);
            }
            that._timeoutAffix = window.setTimeout(function () {
                that._timeoutAffix = undefined;
                that.notifyDOMChanged();
            }, delay);
        };
        FancytreePresenter.prototype._copyToClipboad = function () {
            var clipboard = core.ui.clipboard;
            if (!clipboard || !clipboard.isSupported) {
                return;
            }
            // NOTE: we can handle viewModel.selection() instead of uiTree.getSelectedNodes(),
            // but it's harder to get hierarchical index of nodes in this case.
            var that = this;
            var uiNodes = that.uiTree.getSelectedNodes();
            var text = "";
            if (!uiNodes.length) {
                var uiActiveNode = that.uiTree.getActiveNode();
                if (!uiActiveNode) {
                    return;
                }
                uiNodes = [uiActiveNode];
            }
            // If there're selected text inside tree - do nothing (i.e. allow browser to copy the selected text)
            if (window.getSelection) {
                var sel = window.getSelection();
                if (sel && sel.toString() && sel.anchorNode && sel.anchorNode.parentNode) {
                    if ($.contains(that.domElement, sel.anchorNode.parentElement)) {
                        return;
                    }
                }
            }
            lang.forEach(uiNodes, function (uiNode) {
                var node = uiNode.data.model, title;
                if (!node) {
                    return;
                }
                if (that.options.hasNumbering) {
                    text += uiNode.getIndexHier() + "\t";
                }
                title = that.viewModel.getNodeTitle(node);
                // NOTE: title is HTML by default. Support SafeHtml?
                text += lang.htmlText(title) + "\r\n";
            });
            clipboard.copy(text);
        };
        FancytreePresenter.defaultOptions = {
            template: tmplMain,
            unbound: true,
            autoHeight: true,
            treeHeight: 200,
            affixMenu: true,
            hasCheckboxes: true,
            hasNumbering: true,
            //hideMenuNode: false,
            //hideMenuTree: false,
            showTitle: true,
            menuNodeCssClass: "x-menu-bar x-menu--contrast",
            menuTreeCssClass: "x-menu-bar",
            treeOptions: {
                // в зависимости от настроек, может быть добавлен "dnd"
                extensions: ["table", "table-stripped", "glyph"],
                glyph: {
                    map: {
                        checkbox: "",
                        checkboxSelected: "",
                        checkboxUnknown: "",
                        expanderClosed: "x-icon x-icon-angle-bracket-right",
                        expanderLazy: "x-icon x-icon-angle-bracket-right",
                        expanderOpen: "x-icon x-icon-angle-bracket-bottom",
                        loading: "x-icon x-icon-loading x-icon-anim-rotating",
                        error: "x-icon x-icon-warning-triangle",
                        nodata: "",
                        doc: "",
                        docOpen: "",
                        folder: "",
                        folderOpen: "",
                        //dragHelper: "x-icon x-icon-warning-triangle",
                        dropMarker: "x-icon x-icon-add"
                    }
                }
            },
            scrollToActiveNode: true,
            partialTemplates: {
                title: tmplTitle,
                filter: tmplFilter,
                hint: tmplHint,
                data: tmplData,
                menuTree: tmplMenuTree,
                menuNode: tmplMenuNode
            },
            templates: ["title", "filter", "menuTree", "hint", "data", "menuNode"]
        };
        FancytreePresenter.hostDefaultOptions = {
            dialog: {
                autoHeight: false,
                affixMenu: false
                //hideMenuNode: true,
                //showTitle: false
            }
        };
        return FancytreePresenter;
    }(View));
    FancytreePresenter.mixin({
        /**
         * @deprecated
         */
        defaultOptions: FancytreePresenter.defaultOptions,
        /**
         * @deprecated
         */
        hostDefaultOptions: FancytreePresenter.hostDefaultOptions,
        /**
         * @deprecated
         */
        contextDefaultOptions: FancytreePresenter.hostDefaultOptions
    });
    core.ui.FancytreePresenter = FancytreePresenter;
    Tree.defaultOptions.Presenter = FancytreePresenter;
    return FancytreePresenter;
});
//# sourceMappingURL=FancytreePresenter.js.map