/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

interface XConfig {
	/**
	 * Application name.
	 */
	appName?: string;
	/**
	 * Backend application root ('/' for site or '/app/ for virtual folder).
	 */
	root: string;
	/**
	 * Backend API root (usually the same as root).
	 */
	apiroot?: string;
	/**
	 * Server API version.
	 */
	apiVersion?: number;
	/**
	 * Base server folder for client assets (usually "client").
	 */
	clientBase?: string;
	software?: {
		appVersion?: string;
		clientLibVersion?: string;
		serverLibVersion?: string;
	};
	/**
	 * Additional configuration for RequireJS.
	 */
	require?: {
		locale?: string;
	};
	supportedLanguages?: {
		[key: string]: {
			title?: string;
			short?: string;
			code?: string;
			codeText?: string;
		}
	};
	modules?: {};
	isDebug?: boolean;
	disableHistory?: boolean;
}

declare const xconfig: XConfig;

declare module "xconfig" {
	export = xconfig;
}

// Declare namespace "core" as an ambient module:
declare module "core" {
	export * from "lib/.core";
	export * from "lib/core";

	export import ui = require("core.ui");
	export import data = require("core.data");
	export import interop = require("core.interop");
}

declare module "core.ui" {
	export * from "ui/.ui";

	// ui
	export import AppToolbar = require("lib/ui/AppToolbar");
	export import Carousel = require("lib/ui/Carousel");
	export import Part = require("lib/ui/Part");
	export import StatefulPart = require("lib/ui/StatefulPart");
	export import Component = require("lib/ui/Component");
	export import Dialog = require("lib/ui/Dialog");
	export import ConfirmDialog = require("lib/ui/ConfirmDialog");
	export import IconProvider = require("lib/ui/IconProvider");
	export import ObjectComparePart = require("lib/ui/ObjectComparePart");
	export import ObjectResolutionPart = require("lib/ui/ObjectResolutionPart");
	export import MasterDetailPartBase = require("lib/ui/MasterDetailPartBase");
	export import MasterDetailPartList = require("lib/ui/MasterDetailPartList");
	export import View = require("lib/ui/handlebars/View");
	export import Popup = require("lib/ui/Popup");
	export import PopupView = require("lib/ui/PopupView");
	export import OnlineBeacon = require("lib/ui/OnlineBeacon");
	export import ExpandablePanel = require("lib/ui/ExpandablePanel");
	export import WaitingModal = require("lib/ui/WaitingModal");
	export import StackPanel = require("lib/ui/StackPanel");
	export import ObjectDetails = require("lib/ui/ObjectDetails");

	// menu
	export import Menu = require("lib/ui/menu/Menu");
	export import AppNavMenu = require("lib/ui/menu/AppNavMenu");
	export import AppNavMenuPresenter = require("lib/ui/menu/AppNavMenuPresenter");
	export import AreaStatesMenu = require("lib/ui/menu/AreaStatesMenu");
	export import ButtonDropDownPresenter = require("lib/ui/menu/ButtonDropDownPresenter");
	export import DropDownMenuPresenter = require("lib/ui/menu/DropDownMenuPresenter");
	export import MenuPresenter = require("lib/ui/menu/MenuPresenter");
	export import MenuPresenterBase = require("lib/ui/menu/MenuPresenterBase");
	export import LanguageMenu = require("lib/ui/menu/LanguageMenu");
	export import MenuButtonsPresenter = require("lib/ui/menu/MenuButtonsPresenter");
	export import MenuNavGridPresenter = require("lib/ui/menu/MenuNavGridPresenter");
	export import MenuNavPresenter = require("lib/ui/menu/MenuNavPresenter");
	export import SystemMenu = require("lib/ui/menu/SystemMenu");

	export var iconProvider: IconProvider;
	export function getWaitingIconClass(size?: number): string;

	// list
	export import List = require("lib/ui/list/List");
	export import ObjectListSimple = List;
	export import ObjectList = require("lib/ui/list/ObjectList");
	export import ObjectListLoader = require("lib/ui/list/ObjectListLoader");
	export import ObjectListPager = require("lib/ui/list/ObjectListPager");
	export import ObjectListPaginator = require("lib/ui/list/ObjectListPaginator");
	export import ObjectListPaginatorBase = require("lib/ui/list/ObjectListPaginatorBase");
	export import ObjectSelector = require("lib/ui/list/ObjectSelector");
	export import ObjectListPresenterBase = require("lib/ui/list/ObjectListPresenterBase");
	export import SimpleObjectListPresenter = require("lib/ui/list/SimpleObjectListPresenter");

	// slick
	//export import SlickObjectListPresenter = require("lib/ui/slick/SlickObjectListPresenter");
	//export import peSlickObjectListPresenter = SlickObjectListPresenter;
	export import SlickObjectListPresenter = ObjectListPresenterBase;
	export import peSlickObjectListPresenter = ObjectListPresenterBase;

	// tree
	export import Tree = require("lib/ui/tree/Tree");
	export import TreeNode = Tree.Node;
	export import ObjectTree = require("lib/ui/tree/ObjectTree");
	export import ObjectTreeSelector = require("lib/ui/tree/ObjectTreeSelector");
	export class ObjectTreeLoader implements Tree.ITreeLoader {
		loadChildren: Tree.TreeNodeLoadCallback;
	}
	export import FancytreePresenter = require("lib/ui/tree/FancytreePresenter");

	// editor:
	export import ObjectEditor = require("lib/ui/editor/ObjectEditor");
	export import ObjectFilter = require("lib/ui/editor/ObjectFilter");
	export import ObjectViewer = require("lib/ui/editor/ObjectViewer");
	export import ObjectWizard = require("lib/ui/editor/ObjectWizard");
	export import EditorPage = require("lib/ui/editor/EditorPage");
	export import ObjectEditorPresenterBase = require("lib/ui/editor/ObjectEditorPresenterBase");
	export import ObjectEditorPresenter = require("lib/ui/editor/ObjectEditorPresenter");
	export import ObjectFilterPresenter = ObjectEditorPresenter;
	export import ObjectWizardStackedPresenter = require("lib/ui/editor/ObjectWizardStackedPresenter");
	export import ObjectWizardPresenter = require("lib/ui/editor/ObjectWizardPresenter");

	// PE
	export import PropertyEditor = require("lib/ui/pe/PropertyEditor");
	export import PropertyEditorLookup = require("lib/ui/pe/PropertyEditorLookup");
	export import peNotImplemented = PropertyEditor;
	export import peNotAuthorized = PropertyEditor;
	export import NavigationPropertyEditor = require("lib/ui/pe/NavigationPropertyEditor");
	export import peBoolean = require("lib/ui/pe/peBoolean");
	export import peBooleanCheckbox = require("lib/ui/pe/peBoolean");
	export import peBooleanSwitch = require("lib/ui/pe/peBooleanSwitch");
	export import peDateTime = require("lib/ui/pe/peDateTime");
	export import peObject = require("lib/ui/pe/peObject");
	export import peObjectList = require("lib/ui/pe/peObjectList");
	export import peObjectMultiSelect = require("lib/ui/pe/peObjectMultiSelect");
	export import peDropDownLookup = require("lib/ui/pe/peDropDownLookup");
	export import peObjectDropDownLookup = require("lib/ui/pe/peObjectDropDownLookup");
	export import peViewOnly = require("lib/ui/pe/peViewOnly");
	export import peEnumBase = require("lib/ui/pe/peEnumBase");
	export import peEnumDropDownBase = require("lib/ui/pe/peEnumDropDownBase");
	export import peEnumDropDownSelect2 = require("lib/ui/pe/peEnumDropDownSelect2");
	export import peEnumRadio = require("lib/ui/pe/peEnumRadio");
	export import peEnumCheckbox = require("lib/ui/pe/peEnumCheckbox");
	export import peEnumDropDownSelect = require("lib/ui/pe/peEnumDropDownSelect");
	export import peEnumSwitch = require("lib/ui/pe/peEnumSwitch");

	export import peObjectRadio = require("lib/ui/pe/peObjectRadio");
	export import peReadOnly = require("lib/ui/pe/peReadOnly");
	export import peTimeSpan = require("lib/ui/pe/peTimeSpan");
	export import peNumber = require("lib/ui/pe/peNumber");
	export import peColorPicker = require("lib/ui/pe/peColorPicker");
	export import peBinary = require("lib/ui/pe/peBinary");
	export import peString = require("lib/ui/pe/peString");
	export import peRichText = require("lib/ui/pe/peRichText");
}

declare module "core.data" {
	export import DataSource = require("data/DataSource");
	export import TreeDataSource = require("data/TreeDataSource");
}

declare module "core.interop" {
	export * from "interop/.interop";

	export import BackendInterop = require("lib/interop/BackendInterop");
	export import DataFacade = require("lib/interop/DataFacade");
	// TODO
	export import DataFacadeSmart = require("lib/interop/DataFacadeSmart");
}
declare module "lib/interop/BackendInteropReal" {
	import BackendInterop = require("lib/interop/BackendInterop");
	export = BackendInterop;
}
