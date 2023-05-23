/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

/**
 * Slick plugin which allows to define a column with checkboxes.
 * Now this is a fork of Slick.CheckboxSelectColumn, which just adds tabIndex='-1' to all checkboxes.
 */
(function ($) {
	"use strict";
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"EnhancedCheckboxSelectColumn": EnhancedCheckboxSelectColumn
		}
	});

	function EnhancedCheckboxSelectColumn(options) {
		var _grid;
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _selectedRowsLookup = {};
		var _defaults = {
			columnId: "_checkbox_selector",
			cssClass: null,
			toolTip: "Select/Deselect All",
			width: 30
		};

		var _options = $.extend(true, {}, _defaults, options);
		var _partialSelection;

		function init(grid) {
			_grid = grid;
			_handler
				.subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
				.subscribe(_grid.onClick, handleClick)
				.subscribe(_grid.onHeaderClick, handleHeaderClick)
				.subscribe(_grid.onKeyDown, handleKeyDown)
				.subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered);
		}

		function destroy() {
			_handler.unsubscribeAll();
		}

		function getSelectableLength() {
			var data = _grid.getData();
			if (!data.isItemSelectable) {
				return _grid.getDataLength();
			}

			var count = 0,
				i, l;
			for (i = 0, l = data.getLength(); i < l; i++) {
				if (data.isItemSelectable(i)) {
					count++;
				}
			}
			return count;
		}

		function updateColumnCheched(checked) {
			var col = _grid.getColumns()[_grid.getColumnIndex(_options.columnId)],
				html = checked ?
					"<input type='checkbox' checked='checked' tabIndex='-1'>" :
					"<input type='checkbox' tabIndex='-1'>";
			_grid.updateColumnHeader(_options.columnId, html, col.toolTip);
		}

		function handleHeaderCellRendered(e, args) {
			if (args.column.id === _options.columnId && _partialSelection) {
				// NOTE: there is no 'indeterminate' attribute, we have to set it via JavaScript only
				$("input[type='checkbox']", args.node).prop("indeterminate", true);
			}
		}

		function handleSelectedRowsChanged(e, args) {
			var selectedRows = args.rows,
				lookup = {},
				row,
				i;

			for (i = 0; i < selectedRows.length; i++) {
				row = selectedRows[i];
				lookup[row] = true;
				if (!_selectedRowsLookup[row]) {
					_grid.invalidateRow(row);
				}
			}
			Object.keys(_selectedRowsLookup).forEach(function (row) {
				if (!lookup[row]) {
					_grid.invalidateRow(row);
				}
			});

			_selectedRowsLookup = lookup;
			_grid.render();

			// note: changed original behavior to not use toolTip from options as it can be overridden in runtime
			var selectableCount = getSelectableLength();
			if (selectableCount === 0) {
				_partialSelection = false;
				updateColumnCheched(false);
			} else if (selectedRows.length && selectedRows.length == selectableCount) {
				_partialSelection = false;
				updateColumnCheched(true);
			} else {
				_partialSelection = !!selectedRows.length;
				updateColumnCheched(false);
			}
		}

		function handleKeyDown(e, args) {
			if (e.which == 32) {
				// if editing, try to commit
				if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
					toggleRowSelection(args.row);
				}
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		}

		function handleClick(e, args) {
			// clicking on a row select checkbox
			if (_grid.getColumns()[args.cell].id === _options.columnId/* && $(e.target).is(":checkbox")*/) {
				// if editing, try to commit
				if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return;
				}

				if (!_grid.getActiveCell()) {
					_grid.setActiveCell(args.row, args.cell);
				}
				_grid.focus();

				if (!_grid.getDataItem(args.row).__nonDataRow) {
					toggleRowSelection(args.row);
					e.stopPropagation();
					e.stopImmediatePropagation();
				}
			}
		}

		function toggleRowSelection(row) {
			// ignore nonselectable row:
			var data = _grid.getData();
			if (data.getItemMetadata && data.getItemMetadata(row).selectable === false) { return; }

			if (_selectedRowsLookup[row]) {
				_grid.setSelectedRows($.grep(_grid.getSelectedRows(), function (n) {
					return n !== row;
				}));
			} else {
				_grid.setSelectedRows(_grid.getSelectedRows().concat(row));
			}
		}

		function handleHeaderClick(e, args) {
			if (args.column.id == _options.columnId/* && $(e.target).is(":checkbox")*/) {
				// if editing, try to commit
				if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return;
				}

				var $target = $(e.target);
				// NOTE: click on checkbox itself make it checked first, but click on the cell doesn't check it.
				// Therefore use :not(:checked) selector when finding descendants
				if ($target.is(":checkbox:checked") || $target.find(":checkbox:not(:checked)").length) {
					var rows = [],
						data = _grid.getData(),
						i,
						len = _grid.getDataLength();
					for (i = 0; i < len; i++) {
						// NOTE: do NOT use getItemMetadata here, because item can be not-loaded yet:
						// if (!data.getItemMetadata || data.getItemMetadata(i).selectable !== false) {
						//     rows.push(i);
						// }
						// See https://track.rnd.croc.ru/issue/WC-1379#comment=82-3024
						if (data.isItemSelectable && data.isItemSelectable(i)) {
							rows.push(i);
						}
					}
					if (rows.length === 0) {
						// setSelectedRows([]) won't generate SelectedRowsChanges, but we need to update header
						updateColumnCheched(false);
					}
					_grid.setSelectedRows(rows);
				} else if ($target.is(":checkbox") || $target.find(":checkbox").length) {
					_grid.setSelectedRows([]);
				}
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		}

		function getColumnDefinition() {
			return {
				id: _options.columnId,
				name: "<input type='checkbox' tabIndex='-1'>",
				toolTip: _options.toolTip,
				field: "sel",
				width: _options.width,
				resizable: false,
				sortable: false,
				cssClass: _options.cssClass,
				formatter: checkboxSelectionFormatter
			};
		}

		function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
			if (dataContext) {
				var data = _grid.getData(),
					itemMeta = data && data.getItemMetadata && data.getItemMetadata(row);
				if (itemMeta && itemMeta.selectable === false) {
					return "<input type='checkbox' tabIndex='-1' disabled>";
				}
				return _selectedRowsLookup[row]
					? "<input type='checkbox' checked='checked' tabIndex='-1'>"
					: "<input type='checkbox' tabIndex='-1'>";
			}
			return null;
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"getColumnDefinition": getColumnDefinition
		});
	}
})(jQuery);
