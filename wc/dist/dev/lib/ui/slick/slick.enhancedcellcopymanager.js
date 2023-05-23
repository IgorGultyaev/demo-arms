/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

/**
 * Plugin based on slick.cellcopymanager.
 * If no rows are selected original plugin do nothing. This plugin copies an active row (if any).
 */
(function ($) {
	"use strict";
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"EnhancedCellCopyManager": CellCopyManager
		}
	});

	function CellCopyManager() {
		var _grid;
		var _self = this;
		var _copiedRanges;

		function init(grid) {
			_grid = grid;
			_grid.onKeyDown.subscribe(handleKeyDown);
		}

		function destroy() {
			_grid.onKeyDown.unsubscribe(handleKeyDown);
		}

		function handleKeyDown(e, args) {
			var ranges, cell;
			if (!_grid.getEditorLock().isActive()) {
				if (e.which === $.ui.keyCode.ESCAPE) {
					if (_copiedRanges) {
						e.preventDefault();
						clearCopySelection();
						_self.onCopyCancelled.notify({ranges: _copiedRanges});
						_copiedRanges = null;
					}
				}

				// Ctrl+C or Ctrl+Ins
				if ((e.which === 67 || e.which === 45) && (e.ctrlKey || e.metaKey)) {
					// If there're selected text inside list - do nothing (i.e. allow browser to copy the selected text)
					if (window.getSelection) {
						var sel = window.getSelection();
						if (sel && sel.toString() && sel.anchorNode && sel.anchorNode.parentNode) {
							if ($.contains(_grid.getCanvasNode(), sel.anchorNode.parentElement)) {
								return;
							}
						}
					}

					ranges = _grid.getSelectionModel().getSelectedRanges();
					if (!ranges.length && (cell = _grid.getActiveCell())) {
						// no selection, copy active row
						ranges = [ new Slick.Range(cell.row, 0, cell.row, _grid.getColumns().length - 1) ];
					}
					if (ranges.length) {
						e.preventDefault();
						_copiedRanges = ranges;
						markCopySelection(ranges);
						_self.onCopyCells.notify({ranges: ranges});
					}
				}

				// Ctrl+V
				// if (e.which === 86 && (e.ctrlKey || e.metaKey)) {
				// 	if (_copiedRanges) {
				// 		e.preventDefault();
				// 		clearCopySelection();
				// 		ranges = _grid.getSelectionModel().getSelectedRanges();
				// 		_self.onPasteCells.notify({from: _copiedRanges, to: ranges});
				// 		_copiedRanges = null;
				// 	}
				// }
			}
		}

		function markCopySelection(ranges) {
			var columns = _grid.getColumns();
			var hash = {};
			for (var i = 0; i < ranges.length; i++) {
				for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
					hash[j] = {};
					for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
						hash[j][columns[k].id] = "copied";
					}
				}
			}
			_grid.setCellCssStyles("copy-manager", hash);
		}

		function clearCopySelection() {
			_grid.removeCellCssStyles("copy-manager");
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"clearCopySelection": clearCopySelection,

			"onCopyCells": new Slick.Event(),
			"onCopyCancelled": new Slick.Event()
			//"onPasteCells": new Slick.Event()
		});
	}
})(jQuery);