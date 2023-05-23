/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"jquery",
	"core",
	"lib/ui/pe/peEnumDropDownBase",
	"vendor/chosen/chosen.jquery",
	"xcss!vendor/chosen/content/chosen",
	"xcss!lib/ui/styles/peEnum",
	"xcss!lib/ui/styles/peEnumDropDownChosen"
], function ($, core, peEnumDropDownBase) {
	"use strict";

	core.ui = core.ui || {};

	var peEnumDropDownChosen = core.lang.Class(peEnumDropDownBase, /** @lends peEnumDropDownChosen.prototype */ {
		/**
		 * @class peEnumDropDownChosen
		 * @deprecated Use peEnumDropDownSelect2 instead
		 * @extends peEnumDropDownBase
		 * @param options
		 */
		constructor: function (options) {
			options = peEnumDropDownChosen.mixContextOptions(options, peEnumDropDownChosen.defaultOptions, peEnumDropDownChosen.contextDefaultOptions);
			peEnumDropDownBase.call(this, options);

			console.warn("peEnumDropDownChosen is deprecated, use peEnumDropDownSelect2 instead");
		},

		defaultOptions: {
			search_contains : true
		},

		doRender: function (domElement) {

			var that = this,
				options = that.options,
				flags = options.ref.flags,
				bindable,
				select;

			peEnumDropDownChosen.Super.prototype.doRender.call(this, domElement);
			that.element.addClass("x-pe-enum-dropdown-chosen");

			select = that.select;

			if (!flags){

				bindable = {
					get: function () {
						var v = select.val();
						if (!that.isDomain) {
							return that.parseValue(v);
						}
						return v;
					},
					set: function (v) {
						select.val(v != null ? v.toString() : v).trigger("chosen:updated.chosen");
					}
				};
			} else {

				bindable = {
					get: function () {
						return that._getFlagsValue();
					},
					set: function (v) {
						that._setFlagsValue(v);
						select.trigger("chosen:updated.chosen");
					}
				};
			}
			bindable.onchange = function (handler) {
				select.bind("change", handler);
				return {
					dispose: function() {
						select.unbind("change", handler);
					}
				};
			};

			that.databind(bindable);

			// Создаем контрол Chosen (именно после байндинга. иначе не устанавливается начальное значение)
			select.chosen({
				allow_single_deselect : that.options.nullable,
				width: that.options.width,
				search_contains : that.options.search_contains,
				no_results_text: that.options.noResultsText
			});

			// NOTE: Chosen при отображении вычисляет ширину контейнера. Если элемент еще не отображен, то ширина
			// вычисляется некорректно и контрол нужно обновить, когда он станет видимым. Как правило, PE рендерятся
			// внутри скрытой EditorPage, которая затем показывается (когда все PE отрендерены). Поэтому запустим
			// асинхронное обновление контрола.
			if (!select.is(":visible")) {
				// Стандартный ObjectEditorPresenter показывает страницу синхронно сразу после рендеринга,
				// так что 100мс - это с запасом.
				window.setTimeout(function () {
					// генерим событие для обновления Chosen
					select.trigger("chosen:updated");

					// Здесь можно опять проверять is(":visible") и повторять процесс при необходимости.
					// Но это уже кажется перебором.
				}, 100);
			}

			if (that._tabIndex) {
				that._setTabIndex(that._tabIndex);
			}
		},

		_setWidth: function () {
			// ничего не делаем - ширина установлена в render
		},

		_onDisabledChange: function (disabled) {
			var that = this;
			peEnumDropDownBase.prototype._onDisabledChange.apply(that, arguments);
			that.select.trigger("chosen:updated");
		}
	});

	core.ui.peEnumDropDownChosen = peEnumDropDownChosen;

	core.ui.PropertyEditor.DefaultMapping.register(function (propMd) {
		// NOTE: since 1.26 it's not default PE for enum/flags anymore
		if (propMd.ref && !core.platform.isMobileDevice && propMd.presentation === "chosen") {
			return core.ui.peEnumDropDownChosen;
		}
/*
		if (propMd.ref && !core.platform.isMobileDevice &&
			(
				(propMd.ref.flags && propMd.presentation === "dropdown") ||
				(!propMd.ref.flags && (!propMd.presentation || propMd.presentation === "dropdown"))
			)) {
			return core.ui.peEnumDropDownChosen;
		}
*/
	}, { vt: "enum" });

	return peEnumDropDownChosen;
});
