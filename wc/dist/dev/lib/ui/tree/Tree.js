/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "core", "lib/ui/Component", "lib/ui/menu/Menu", "lib/formatters", "i18n!lib/nls/resources"], function (require, exports, core, Component, Menu, formatters, resources) {
    "use strict";
    var lang = core.lang;
    var Tree = /** @class */ (function (_super) {
        __extends(Tree, _super);
        /**
         * @constructs Tree
         * @extends Component
         */
        function Tree(app, options) {
            var _this = this;
            if (!app) {
                throw new Error("ArgumentException: app can't be null");
            }
            options = Tree.mixOptions(options, Tree.defaultOptions);
            _this = _super.call(this, options) || this;
            _this.app = app;
            _this.userSettings = core.UserSettings.create(_this.options.userSettings);
            _this._initializeProps();
            _this._initializeMenus();
            _this.initPresenter();
            _this.bind("change:activeNode", _this._onActiveNodeChanged, _this);
            return _this;
        }
        Tree.prototype.dispose = function (options) {
            var that = this;
            that.removeNode(that.root());
            _super.prototype.dispose.call(this, options);
        };
        Tree.prototype.tweakOptions = function (options) {
            lang.appendEx(options, {
                presenterOptions: {
                    hasCheckboxes: options.hasCheckboxes,
                    hasNumbering: options.hasNumbering,
                    search: options.search,
                    columns: options.columns,
                    dnd: (options.dnd && options.dnd.dragStart && options.dnd.dragDrop) ? true : false
                }
            }, { deep: true });
            _super.prototype.tweakOptions.call(this, options);
        };
        /**
         * Returns an array of selected nodes (if any) or an array with single activeNode (if any).
         * If there are no selected and active nodes, returns an empty array;
         * @returns {Array}
         */
        Tree.prototype.currentNodes = function () {
            var that = this, selection, activeNode;
            selection = that.selection();
            if (selection.count()) {
                return selection.all().filter(that.isNodeSelectable, that);
            }
            activeNode = that.activeNode();
            if (activeNode && that.isNodeSelectable(activeNode)) {
                return [activeNode];
            }
            return [];
        };
        /**
         *
         * @virtual
         * @param {Tree.Node} node
         * @returns {{type: string, id: string}}
         */
        Tree.prototype.getNodeIdentity = function (node) {
            var that = this, identifier = that.options.identifier;
            return (identifier && identifier(that, node)) || that.defaultIdentifier(that, node) || {};
        };
        Tree.prototype.defaultIdentifier = function (tree, node) {
            var data = node && node.data();
            if (!data) {
                return {};
            }
            return {
                id: data.id,
                type: data.type || data.toString()
            };
        };
        /**
         *
         * @virtual
         * @param {Tree.Node} node
         * @returns {string}
         */
        Tree.prototype.getNodeTitle = function (node) {
            var that = this, formatter = that.options.formatter;
            return (formatter && formatter(that, node)) || that.defaultFormatter(that, node) || "";
        };
        Tree.prototype.defaultFormatter = function (tree, node) {
            var data = node && node.data(), title = !data ? "" : (lang.isPlainObject(data) && data.title) || data.toString();
            return lang.encodeHtml(title);
        };
        /**
         *
         * @virtual
         * @param {Tree.Node} node
         * @returns {String}
         */
        Tree.prototype.getNodeIcon = function (node) {
            var that = this, iconizer = that.options.iconizer;
            return node.icon() ||
                (iconizer && iconizer(that, node)) ||
                (that.defaultIconizer(that, node));
        };
        Tree.prototype.defaultIconizer = function (tree, node) {
            var data = node && node.data(), iconProvider = core.ui.iconProvider;
            return (data && iconProvider && iconProvider.getObjectIconName(data)) || null;
        };
        /**
         *
         * @virtual
         * @param {Tree.Node} node
         * @param {Object} column
         * @returns {String}
         */
        Tree.prototype.getNodeColumnValue = function (node, column) {
            var res;
            if (column.getter) {
                res = column.getter(node);
            }
            else {
                res = core.lang.get(node.data(), column.name);
            }
            if (column.html) {
                return formatters.safeHtml(res);
            }
            return res;
        };
        /**
         *
         * @method
         * @virtual
         * @param {Tree.Node} node
         * @param {*} params
         * @param {*} options
         * @returns {Deferred}
         */
        Tree.prototype.getNodeChildren = function (node, params, options) {
            var that = this, loader = that.options.loader;
            //that.traceSource.debug("getNodeChildren of '" + that.getNodeTitle(node) + "'");
            return (loader && loader.loadChildren(that, node, params, options)) ||
                (that.defaultLoader && that.defaultLoader.loadChildren(that, node, params)) ||
                null;
        };
        /**
         *
         * @virtual
         * @param node
         * @returns {*}
         */
        Tree.prototype.getNodeLoadParams = function (node) {
            return {};
        };
        Tree.prototype.getNodeParent = function (node) {
            return node.parent();
        };
        Tree.prototype.getNodePath = function (node) {
            var that = this, path = [that.getNodeIdentity(node)];
            while (node = that.getNodeParent(node)) {
                path.push(that.getNodeIdentity(node));
            }
            return path.reverse();
        };
        /**
         * Checks if the node can be selected
         * @param node
         * @returns {boolean}
         */
        Tree.prototype.isNodeSelectable = function (node) {
            var that = this, filter = that.options.selectionFilter;
            return !!lang.coalesce(filter && filter(that, node), that._isNodeSelectable(node));
        };
        /**
         * Checks if the node can be selected by default (w/o option selectionFilter)
         * @param node
         * @returns {boolean}
         */
        Tree.prototype._isNodeSelectable = function (node) {
            return true;
        };
        Tree.prototype.addNode = function (node, targetNode, suppressEvent) {
            var that = this, parentNode = targetNode || that.root();
            node.parent(parentNode);
            parentNode.children().add(node);
            // TOTHINK: нужно ли?
            //parentNode.state(parentNode.states.loaded);
            node.bind("change", that._onNodeChange, that);
            if (!suppressEvent) {
                that.trigger("change:nodes", that, { added: [node] });
            }
        };
        Tree.prototype.createNodeFromJson = function (json) {
            var node = new this.Node(json.data, (json.children && !json.children.length) || !!json.isLeaf);
            if (json.icon) {
                node.icon(json.icon);
            }
            if (json.transientChildren) {
                // remove children on collapse (it makes loader loads them again)
                node.transientChildren = true;
            }
            return node;
        };
        Tree.prototype.addJson = function (json, targetNode) {
            var that = this, node = that.createNodeFromJson(json);
            that.addNode(node, targetNode);
            if (json.children) {
                json.children.forEach(function (childJson) {
                    that.addJson(childJson, node);
                });
            }
            return node;
        };
        Tree.prototype.addJsons = function (childrenData, targetNode) {
            var that = this;
            var children = [];
            var grandChildren = [];
            for (var i = 0; i < childrenData.length; i++) {
                var json = childrenData[i];
                var child = that.createNodeFromJson(json);
                // NOTE: we need the created node only for creating its children below
                children.push(child);
                if (json.children && json.children.length) {
                    grandChildren.push(i);
                }
                that.addNode(child, targetNode, /*suppressEvent: */ true);
            }
            that.traceSource.time("trigger change:nodes");
            that.trigger("change:nodes", that, { added: children });
            that.traceSource.timeEnd("trigger change:nodes");
            // recursively process sub-children
            for (var _i = 0, grandChildren_1 = grandChildren; _i < grandChildren_1.length; _i++) {
                var idx = grandChildren_1[_i];
                that.addJsons(childrenData[idx].children, children[idx]);
            }
        };
        Tree.prototype.removeNode = function (node) {
            var that = this, parent = node.parent(), activeChildIndex = -1;
            // NOTE: dispose 'loader' observable expression, which can be cached by loadNodeChildren
            if (node._loader) {
                node._loader.dispose();
                node._loader = undefined;
            }
            if (parent) {
                // memorize active child node
                var activeNode = that.activeNode();
                if (node === activeNode || that.isDescendantNode(activeNode, node)) {
                    activeChildIndex = parent.children().indexOf(node);
                }
                parent.children().remove(node);
                node.parent(null);
            }
            that.removeNodeChildren(node); // recursive
            node.unbind("change", null, that);
            // restore active child node
            if (activeChildIndex >= 0) {
                that._activateChild(parent, activeChildIndex);
            }
            that.selection().remove(node);
            that.trigger("change:nodes", that, { removed: [node] });
            node.dispose();
        };
        Tree.prototype.removeNodeChildren = function (node) {
            var _this = this;
            node.children().all().slice().forEach(function (childNode) {
                _this.removeNode(childNode);
            });
        };
        Tree.prototype.loadNodeChildren = function (node, options) {
            var that = this;
            // TODO: cancellation
            if (node._loadingDeferred) {
                return node._loadingDeferred;
            }
            var params = that.getNodeLoadParams(node);
            // NOTE: null params mean there was an error during getting params
            if (params == null) {
                return;
            }
            var deferred = lang.deferred();
            deferred.always(function () {
                node._loadingDeferred = undefined;
            });
            node._loadingDeferred = deferred;
            if (node._loader) {
                node._loader.dispose();
            }
            // TODO: allow disabling OE creation at all
            if (that.options.loaderObsExp === "disabled" || that.options.loaderObsExp === false) {
                node._loader = {
                    evaluate: function (tree, args) {
                        //[node, params, options]
                        //node: Tree.Node, params?: any, options?: any): TreeNodeData[]|Promise<TreeNodeData[]> {
                        return tree.getNodeChildren.apply(tree, args);
                    },
                    dispose: lang.noop,
                    suppress: lang.noop,
                    resume: lang.noop
                };
            }
            else {
                // NOTE: observe execution of 'getNodeChildren' method to refill children when something will change,
                // It can be auto-load of some observed not loaded objects, so it's important to signal to the same deferred
                node._loader = lang.support.ObservableExpression.create(that.getNodeChildren, {
                    onchange: lang.debounce(function () {
                        that._fillNodeChildren(node, params, deferred, lang.append({ reason: "change" }, options));
                    }),
                    autoLoad: "onerror"
                });
            }
            that._fillNodeChildren(node, params, deferred, lang.extend({ reason: "load" }, options));
            return deferred;
        };
        Tree.prototype._fillNodeChildren = function (node, params, deferred, options) {
            var that = this;
            try {
                if (node.state() === Tree.NodeState.disposed) {
                    return;
                }
                node.state(Tree.NodeState.loading);
                that.hintMessage(undefined);
                that.traceSource.time("Node children load");
                var ret = node._loader.evaluate(that, [node, params, options]);
                if (ret === lang.support.loadingValue) {
                    // Метод загрузки детей в лоадере упал, т.к. встретились незагруженные объекты.
                    return;
                }
                // loader's expression returns a value (not failure), suppress OE's tracking till all children loaded
                node._loader.suppress();
                // memorize the active child node to restore it after loading
                var activeNode_1 = that.activeNode(), activeNodeData_1, activeChildIndex_1 = -1;
                if (activeNode_1) {
                    activeNodeData_1 = activeNode_1.data();
                    activeChildIndex_1 = lang.findIndex(node.children().all(), function (childNode) { return childNode === activeNode_1 || that.isDescendantNode(activeNode_1, childNode); });
                    if (activeChildIndex_1 >= 0) {
                        // reset activeNode to skip activating any node while removing
                        that.activeNode(null);
                    }
                    activeNode_1 = null;
                }
                that.removeNodeChildren(node);
                lang.when(ret).then(function (childrenData) {
                    try {
                        if (childrenData) {
                            that.addJsons(childrenData, node);
                            if (activeChildIndex_1 >= 0) {
                                for (var _i = 0, _a = node.children().all(); _i < _a.length; _i++) {
                                    var child = _a[_i];
                                    if (activeNodeData_1 === child.data()) {
                                        that.activeNode(child);
                                        break;
                                    }
                                }
                                // we could't find memorized node - activate child node with same index as before
                                if (!that.activeNode()) {
                                    that._activateChild(node, activeChildIndex_1);
                                }
                            }
                        }
                        node.state(Tree.NodeState.loaded);
                        that.traceSource.timeEnd("Node children load");
                        if (that._resumeLoader(node))
                            deferred.resolve();
                        else
                            deferred.reject("Loader has been disposed");
                    }
                    catch (ex) {
                        that._failNode(node, ex);
                        deferred.reject(ex);
                    }
                }).fail(function (ex) {
                    that._resumeLoader(node);
                    that._failNode(node, ex);
                    deferred.reject(ex);
                });
            }
            catch (ex) {
                that._resumeLoader(node);
                that._failNode(node, ex);
                deferred.reject(ex);
            }
        };
        Tree.prototype._resumeLoader = function (node) {
            // sometimes it happens that _loader is destroyed at the moment
            if (node && node._loader) {
                node._loader.resume();
                return true;
            }
            return false;
        };
        Tree.prototype._activateChild = function (node, index) {
            var children = node.children(), n = children.count(), activeNode;
            if (n === 0) {
                activeNode = node;
            }
            else if (index < n) {
                activeNode = children.get(index);
            }
            else {
                activeNode = children.get(n - 1);
            }
            this.activeNode(activeNode);
        };
        Tree.prototype._failNode = function (node, ex) {
            this.traceSource.error(ex);
            node.message(ex.message);
            node.state(Tree.NodeState.failed);
        };
        Tree.prototype.visit = function (node, iterator, context) {
            var that = this;
            node = node || that.root();
            iterator.call(context, node);
            node.children().all().forEach(function (child) {
                if (child) {
                    that.visit(child, iterator, context);
                }
            });
        };
        Tree.prototype.isDescendantNode = function (node, ancestor) {
            while (node = node && node.parent()) {
                if (node === ancestor) {
                    return true;
                }
            }
            return false;
        };
        /**
         * @protected
         * @returns {Object.<string, Command>}
         */
        Tree.prototype.createCommands = function () {
            return this.options.commands || {};
        };
        Tree.prototype.createTreeMenuDefaults = function () {
            return null;
        };
        Tree.prototype.createTreeMenu = function () {
            var menu = lang.unlazy(this.options.menuTree, this);
            return new Menu(this.createTreeMenuDefaults(), menu);
        };
        Tree.prototype.createNodeMenuDefaults = function (node) {
            return null;
        };
        Tree.prototype.createNodeMenu = function (node) {
            var menu = lang.unlazy(this.options.menuNode, this, node);
            return new Menu(this.createNodeMenuDefaults(node), menu);
        };
        Tree.prototype.createSelectionMenuDefaults = function () {
            return null;
        };
        Tree.prototype.createSelectionMenu = function () {
            var menu = lang.unlazy(this.options.menuSelection, this);
            return new Menu(this.createSelectionMenuDefaults(), menu);
        };
        Tree.prototype._onNodeChange = function (sender, ea) {
            this.trigger("itemChange", this, lang.extend({ changed: sender }, ea));
        };
        Tree.prototype._initializeProps = function () {
            var that = this;
            that.traceSource = new core.diagnostics.TraceSource("ui.Tree", that.options.traceSourceName || that.name);
            that._root = new that.Node({ type: that.ROOT_NODE_NAME });
            that._selection = new lang.ObservableCollection();
        };
        Tree.prototype._initializeMenus = function () {
            var that = this;
            var commands = that.createCommands();
            that.commands = core.commands.unlazyCommands(commands, that);
            that.menuTree = that.createTreeMenu();
            that._initMenu(that.menuTree);
            that.menuNode = that.createNodeMenu();
            that._initMenu(that.menuNode);
            if (that.options.hasCheckboxes) {
                that.menuSelection = that.createSelectionMenu();
                that._initMenu(that.menuSelection);
            }
        };
        Tree.prototype._initMenu = function (menu) {
            if (menu) {
                menu.bindToPart(this, { tree: this });
            }
        };
        Tree.prototype.beforeRender = function (domElement) {
            var that = this;
            // auto-load data before first render
            // NOTE: don't do this in the constructor (see WC-1521)
            var root = that.root();
            if (that.options.autoLoad && root.state() === Tree.NodeState.initial) {
                that.loadNodeChildren(root);
            }
            _super.prototype.beforeRender.call(this, domElement);
        };
        Tree.prototype._onActiveNodeChanged = function (sender, node) {
            var menuNode = this.createNodeMenu(node);
            this._initMenu(menuNode);
            this.set("menuNode", menuNode);
        };
        Tree.prototype.appendToSelection = function (nodes) {
            var that = this, selection = that.selection(), added;
            added = nodes.filter(that.isNodeSelectable, that);
            if (selection.count() > 0) {
                added = added.filter(function (node) {
                    return selection.indexOf(node) < 0;
                });
            }
            if (added.length) {
                selection.add(added);
            }
        };
        Tree.prototype.doSelectChildren = function () {
            var activeNode = this.activeNode() || this.root(), selection = activeNode.children().all();
            this.appendToSelection(selection);
        };
        Tree.prototype.canSelectChildren = function () {
            var activeNode = this.activeNode() || this.root();
            return activeNode && activeNode.children().count() > 0;
        };
        Tree.prototype.doSelectSiblings = function () {
            var activeNode = this.activeNode(), parent = activeNode && activeNode.parent(), selection;
            if (parent) {
                selection = parent.children().all();
                this.appendToSelection(selection);
            }
        };
        Tree.prototype.canSelectSiblings = function () {
            var activeNode = this.activeNode(), parent = activeNode && activeNode.parent();
            return parent && parent.children().count() > 1;
        };
        Tree.prototype.doSelectNone = function () {
            this.selection().clear();
        };
        Tree.prototype.canSelectNone = function () {
            return this.selection().count() > 0;
        };
        Tree.prototype.doReloadActive = function () {
            var node = this.activeNode();
            if (node) {
                return this.loadNodeChildren(node, { reason: "reload" });
            }
        };
        Tree.prototype.canReloadActive = function () {
            return !!this.activeNode();
        };
        Tree.prototype.doReloadRoot = function () {
            var that = this;
            return this.loadNodeChildren(this.root(), { reason: "reload" })
                .always(function () {
                if (that._isSearchEnabled && that.searchText())
                    that.searchText(undefined);
            });
        };
        Tree.prototype.canReloadRoot = function () {
            return this.root().state() !== Tree.NodeState.loading;
        };
        Tree.prototype.dragStart = function (node) {
            return this.options.dnd && this.options.dnd.dragStart && this.options.dnd.dragStart(node);
        };
        Tree.prototype.dragEnter = function (node, otherNode) {
            return this.options.dnd && this.options.dnd.dragEnter && this.options.dnd.dragEnter(node, otherNode);
        };
        Tree.prototype.dragDrop = function (node, otherNode) {
            return this.options.dnd && this.options.dnd.dragDrop && this.options.dnd.dragDrop(node, otherNode);
        };
        Tree.prototype._isSearchEnabled = function () {
            return this.options.search === true || (this.options.search && this.options.search.enable);
        };
        /**
         * Marks nodes in the model as "filtered" according to the text filter.
         * @param {string} matchRegexp - Escaped search string.
         * @param startNode - Node to start search from.
         */
        Tree.prototype.filterTreeNodes = function (matchRegexp, startNode) {
            var that = this;
            var re = new RegExp(".*" + matchRegexp + ".*", "i");
            // Обход родителей узла. Если `iterator` вернет `false`, то обход прекращается.
            function visitParents(node, iterator) {
                var p = node.parent();
                while (p) {
                    if (iterator(p) === false) {
                        return false;
                    }
                    p = p.parent();
                }
                return true;
            }
            function markMatch(node) {
                node.searchTextMatched = false;
                node["__sub_text_matched"] = false;
                if (!matchRegexp) {
                    node.searchTextMatched = true;
                    node["__sub_text_matched"] = true;
                }
                else if (that._isNodeMatched(node, re)) {
                    node.searchTextMatched = true;
                    visitParents(node, function (parent) {
                        if (parent["__sub_text_matched"])
                            return false; // не будем дальше идти вверх по дереву
                        parent["__sub_text_matched"] = true;
                    });
                }
            }
            if (startNode !== that.root())
                markMatch(startNode);
            that.visit(startNode, markMatch);
            // для установки значение filtered придется просмотреть все узлы
            that.visit(startNode, function (node) {
                if (node.searchTextMatched === undefined)
                    return;
                node.filtered(!(node.searchTextMatched || node["__sub_text_matched"]));
                delete node["__sub_text_matched"];
            });
        };
        /**
         * Checks whether the node's text data matches a regular expression.
         * @param {Tree.Node} node - Tree node to check.
         * @param {RegExp} match - Regular expression.
         * @returns {boolean} - `true` if the node's text data matches the regular expression, otherwise`false`.
         */
        Tree.prototype._isNodeMatched = function (node, match) {
            var that = this;
            var text = lang.decodeHtml(that.getNodeTitle(node));
            var columns = that.options.columns;
            if (match.test(text))
                return true;
            if (that._isColumnsSearchEnabled() && columns && columns.length) {
                var auxColCount = columns.length;
                for (var i = 0; i < auxColCount; i++) {
                    var column = columns[i];
                    // проверим, не скрывается ли колонка через colspan
                    var colSpan = 1;
                    if (column.colspan) {
                        colSpan = column.colspan(node);
                    }
                    if (colSpan > 1)
                        return false;
                    var text_1 = that.getNodeColumnValue(node, column);
                    if (text_1) {
                        // разрешим поиск по содержимому html
                        if (formatters.isHtml(text_1)) {
                            if (match.test(text_1.toHTML()))
                                return true;
                        }
                        else {
                            if (match.test(text_1))
                                return true;
                        }
                    }
                }
            }
            return false;
        };
        /**
         * Is local search in columns enabled.
         * @returns {boolean} - true` if local search in columns is enabled, otherwise`false`.
         * @private
         */
        Tree.prototype._isColumnsSearchEnabled = function () {
            if (!this.options.search)
                return false;
            var searchOptions = this.options.search;
            return typeof searchOptions === "object"
                && searchOptions.enable
                && searchOptions.searchInColumns;
        };
        /**
         * Refresh info about the count of found nodes.
         */
        Tree.prototype.refreshSearchStat = function () {
            var that = this;
            // для простой настройки options.search === true статистика будет отображаться
            if (typeof that.options.search === "object" && !that.options.search.showStat) {
                return;
            }
            var statMessage = resources["objectTree.searchStat"];
            if (!statMessage)
                return;
            var hintMessage = that.hintMessage() || "";
            var statMessageRegexp = new RegExp("<p>"
                + statMessage
                    .replace("{0}", "\\d+")
                    .replace("{1}", "\\d+")
                    .replace(".", "\\.")
                + "</p>", "g");
            // удалим всю прошлую статистику
            hintMessage = hintMessage.replace(statMessageRegexp, "");
            if (that.searchText()) {
                var totalNodes_1 = 0;
                var foundNodes_1 = 0;
                var rootNode_1 = that.root();
                that.visit(rootNode_1, function (node) {
                    // не берем в счет корневой невидимый узел
                    if (node === rootNode_1)
                        return;
                    if (node.searchTextMatched)
                        foundNodes_1++;
                    totalNodes_1++;
                });
                hintMessage += "<p>" + lang.stringFormat(statMessage, foundNodes_1, totalNodes_1) + "</p>";
            }
            that.hintMessage(hintMessage);
        };
        Tree.defaultOptions = {
            presenter: undefined,
            Presenter: undefined,
            presenterOptions: {},
            navigateOptions: {
                dialogOptions: {
                    menu: false
                }
            },
            /**
             * @type Boolean
             */
            hasCheckboxes: false,
            /**
             * @type Boolean
             */
            hasNumbering: true,
            commands: undefined,
            /**
             * @type {Object|Function}
             */
            menuTree: undefined,
            /**
             * @type {Object|Function}
             */
            menuNode: undefined,
            /**
             * @type {TreeNodeIdentifierCallback}
             */
            identifier: undefined,
            /**
             * @type {TreeNodeFormatterCallback}
             */
            formatter: undefined,
            /**
             * @type {TreeNodeIconizerCallback}
             */
            iconizer: undefined,
            /**
             * @type {TreeLoader}
             */
            loader: undefined,
            /**
             * @type Boolean
             */
            autoLoad: true,
            search: true,
            strings: {
                not_loaded: resources["objectTree.state.not_loaded"],
                load_failed: resources["objectTree.state.load_failed"],
                no_data: resources["objectTree.state.no_data"]
            }
        };
        __decorate([
            lang.decorators.constant("ROOT")
        ], Tree.prototype, "ROOT_NODE_NAME");
        __decorate([
            lang.decorators.observableGetter()
        ], Tree.prototype, "root");
        __decorate([
            lang.decorators.observableAccessor()
        ], Tree.prototype, "activeNode");
        __decorate([
            lang.decorators.observableGetter()
        ], Tree.prototype, "selection");
        __decorate([
            lang.decorators.observableAccessor()
        ], Tree.prototype, "hintMessage");
        __decorate([
            lang.decorators.observableAccessor()
        ], Tree.prototype, "searchText");
        __decorate([
            lang.decorators.constant(null)
        ], Tree.prototype, "defaultLoader");
        return Tree;
    }(Component));
    Tree.mixin(/** @lends Tree.prototype */ {
        defaultOptions: Tree.defaultOptions
    });
    (function (Tree) {
        var Node = /** @class */ (function (_super) {
            __extends(Node, _super);
            /**
             * @constructs Tree.Node
             * @extends Observable
             */
            function Node(data, isLeaf) {
                var _this = _super.call(this) || this;
                _this._state = isLeaf ? Tree.NodeState.loaded : Tree.NodeState.initial;
                _this._children = new lang.ObservableCollection([]);
                _this._data = data || {};
                _this.bind("change:state", _this._onStateChange, _this);
                if (data.load && !data.isLoaded) {
                    lang.when(data.load()).done(function (loaded) {
                        _this.data(loaded);
                    });
                }
                return _this;
            }
            Node.prototype.dispose = function () {
                var that = this;
                that._children.dispose();
                that.state(Tree.NodeState.disposed);
                _super.prototype.dispose.call(this);
            };
            Node.prototype._onStateChange = function (sender, v) {
                if (v !== Tree.NodeState.failed) {
                    this.message(null);
                }
            };
            __decorate([
                lang.decorators.observableAccessor()
            ], Node.prototype, "data");
            __decorate([
                lang.decorators.observableAccessor()
            ], Node.prototype, "icon");
            __decorate([
                lang.decorators.observableAccessor()
            ], Node.prototype, "state");
            __decorate([
                lang.decorators.observableAccessor()
            ], Node.prototype, "message");
            __decorate([
                lang.decorators.observableAccessor()
            ], Node.prototype, "parent");
            __decorate([
                lang.decorators.observableGetter()
            ], Node.prototype, "children");
            __decorate([
                lang.decorators.observableAccessor({ init: false })
            ], Node.prototype, "filtered");
            return Node;
        }(lang.Observable));
        Tree.Node = Node;
        Tree.NodeState = {
            initial: "initial",
            loading: "loading",
            loaded: "loaded",
            failed: "failed",
            disposed: "disposed"
        };
    })(Tree || (Tree = {}));
    Tree.prototype.Node = Tree.Node;
    // backward compatibility
    Tree.Node.States = Tree.NodeState;
    // backward compatibility
    Tree.Node.mixin({
        /**
         * @deprecated Use Tree.NodeState
         */
        states: Tree.NodeState
    });
    core.ui.Tree = Tree;
    core.ui.TreeNode = Tree.Node;
    return Tree;
});
//# sourceMappingURL=Tree.js.map