const path = require("path");
const webpack = require("webpack");

const multi = require("multi-loader");

exports.getConfig = ({cwd}) => ({
	resolve: {
		alias: {
			"underscore": "vendor/underscore",
			"jquery": "vendor/jquery/jquery",
			"jquery-ui": "vendor/jquery-ui",
			"bootstrap": "vendor/bootstrap/bootstrap",
			"handlebars": path.resolve(cwd, "node_modules/handlebars/runtime"),
			"handlebars-ext": "lib/ui/handlebars/handlebars-ext",
			"text": "vendor/text",
			"rx": "vendor/rx/rx.lite.compat",
			"moment": "vendor/moment/moment",
			"big": "vendor/big/big",
			"core": "lib/core",
			"xconfig": "lib/xconfig",
			"waypoints": "vendor/waypoints",
			"splitter": path.resolve(cwd, "node_modules/jquery.splitter/js/jquery.splitter")
		}
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jquery: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"_": "underscore"
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/) // via https://webpack.js.org/plugins/ignore-plugin/#ignore-moment-locales
	],
	resolveLoader: {
		modules: [path.resolve(cwd, "node_modules"), "node_modules"],
		alias: {
			"i18n": "amdi18n-loader",
			// игнорируем плагины от requirejs, которые воспринимаются webpack'ом как загрузчики
			"xcss": multi(""),
			"xhtmpl": multi("")
		}
	},
	module: {
		rules: [
			// по аналогии с require.config.json
			{
				test: /[\\/]vendor[\\/]moment[\\/]moment-duration-format/,
				use: "imports-loader?moment"
			}, {
				test: /[\\/]vendor[\\/]bootstrap-datetimepicker[\\/]bootstrap-datetimepicker/,
				use: "imports-loader?bootstrap,moment"
			}, {
				test: /vendor[\\/]notify[\\/]jquery\.notify/,
				use: "imports-loader?$=jquery,jqCore=jquery-ui/core,jqWidget=jquery-ui/widget"
			}, {
				test: /vendor[\\/]slick[\\/]slick\.core/,
				use: "imports-loader?$=jquery,jqCore=jquery-ui/core,jqSortable=jquery-ui/sortable,jqEventDrag=vendor/jquery.event.drag"
			}, {
				test: /vendor[\\/]slick[\\/]slick\.grid/,
				use: "imports-loader?$=jquery,slickCore=vendor/slick/slick.core"
			}, {
				test: /vendor[\\/]slick[\\/]plugins[\\/]slick\.[^\\/]+/,
				use: "imports-loader?slickGrid=vendor/slick/slick.grid"
			}, {
				test: /vendor[\\/]fancytree[\\/]jquery\.fancytree/,
				use: "imports-loader?$=jquery,jqCore=jquery-ui/core,jqWidget=jquery-ui/widget"
			}, {
				test: /vendor[\\/]fancytree[\\/]jquery\.fancytree\.table/,
				use: "imports-loader?fancyTree=vendor/fancytree/jquery.fancytree"
			}, {
				test: /vendor[\\/]fancytree[\\/]jquery\.fancytree\.glyph/,
				use: "imports-loader?fancyTree=vendor/fancytree/jquery.fancytree"
			}, {
				test: /vendor[\\/]fancytree[\\/]jquery\.fancytree\.dnd/,
				use: "imports-loader?fancyTree=vendor/fancytree/jquery.fancytree,jqDraggable=jquery-ui/draggable,jqDroppable=jquery-ui/droppable,jqPosition=jquery-ui/position"
			}, {
				test: /xcss!lib[\\/]ui[\\/]styles[\\/]peEnumDropDownChosen.css/,
				use: "imports-loader?chosenCss='vendor/chosen/content/chosen.css'"
			}, {
				test: /[\\/]vendor[\\/]stomp/,
				use: "exports-loader?Stomp"
			},
			// собственные
			{
				test: /vendor[\\/]modernizr/,
				use: "imports-loader?this=>window"
			}, {
				test: /vendor[\\/]flotr2/,
				use: "imports-loader?this=>window"
			}, {
				test: /vendor[\\/]moment[\\/]nls[\\/]locale[\\/].+[\\/].+\.js/,
				use: "imports-loader?this=>window,moment=moment"
			}, {
				test: /lib[\\/]ui[\\/]handlebars[\\/]handlebars-ext/,
				use: ["imports-loader?this=>window,Handlebars=handlebars"]
			}
		]
	}
});



