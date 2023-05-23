/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

/**
 * Plugin based on slick.cellselectionmodel.
 * Replaced removeInvalidRanges method. Originally it checked only two cells (r.fromRow, r.fromCell) and (r.toRow, r.toCell)
 * whether they can be selected. Which is wrong as ranges can contains nonselectable rows.
 */
(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "EnhancedCellSelectionModel": EnhancedCellSelectionModel
    }
  });


  function EnhancedCellSelectionModel(options) {
    var _grid;
    var _canvas;
    var _ranges = [];
    var _self = this;
    var _selectorDefaults = {
		"selectionCss": {
			"border": "2px solid black"
		}
	};
    var _selector = new Slick.CellRangeSelector(_selectorDefaults);
    //var _selector = new Slick.CellRangeSelector($.extend(true, {}, _selectorDefaults, options.rangeSelector));
    var _options;
    var _defaults = {
      selectActiveCell: true
    };


    function init(grid) {
      _options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _canvas = _grid.getCanvasNode();
      _grid.onActiveCellChanged.subscribe(handleActiveCellChange);
      _grid.onKeyDown.subscribe(handleKeyDown);
      grid.registerPlugin(_selector);
      _selector.onCellRangeSelected.subscribe(handleCellRangeSelected);
      _selector.onBeforeCellRangeSelected.subscribe(handleBeforeCellRangeSelected);
    }

    function destroy() {
      _grid.onActiveCellChanged.unsubscribe(handleActiveCellChange);
      _grid.onKeyDown.unsubscribe(handleKeyDown);
      _selector.onCellRangeSelected.unsubscribe(handleCellRangeSelected);
      _selector.onBeforeCellRangeSelected.unsubscribe(handleBeforeCellRangeSelected);
      _grid.unregisterPlugin(_selector);
    }

    function removeInvalidRanges(ranges) {
      var result = [];

      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        var rangeSplitted = false;
        var fromRow, toRow;
        for (var row = r.fromRow; row <= r.toRow; row++ ) {
			var rowSelectable = true;
        	for (var col = r.fromCell; col <= r.toCell; col++) {
        		if (!_grid.canCellBeSelected(row, col)) {
        			rowSelectable = false;
        			break;
				}
			}
			if (!rowSelectable) {
        		if (fromRow !== undefined && toRow !== undefined) {
					rangeSplitted = true;
					result.push({
						fromRow: fromRow,
						toRow: toRow,
						fromCell: r.fromCell,
						toCell: r.toCell
					});
					fromRow = undefined;
					toRow = undefined;
				}
			} else {
        		// строка выбираемая
				if (fromRow === undefined) {
					fromRow = row;
				}
				toRow = row;
			}
		}
		if (!rangeSplitted) {
			result.push(r);
		} else {
			result.push({
				fromRow: fromRow,
				toRow: toRow,
				fromCell: r.fromCell,
				toCell: r.toCell
			});
		}
        /* в оригинале было так:
        if (_grid.canCellBeSelected(r.fromRow, r.fromCell) && _grid.canCellBeSelected(r.toRow, r.toCell)) {
          result.push(r);
        }*/
      }

      return result;
    }

    function setSelectedRanges(ranges) {
      // simle check for: empty selection didn't change, prevent firing onSelectedRangesChanged
      if ((!_ranges || _ranges.length === 0) && (!ranges || ranges.length === 0)) { return; }

      _ranges = removeInvalidRanges(ranges);
      _self.onSelectedRangesChanged.notify(_ranges);
    }

    function getSelectedRanges() {
      return _ranges;
    }

    function handleBeforeCellRangeSelected(e, args) {
      if (_grid.getEditorLock().isActive()) {
        e.stopPropagation();
        return false;
      }
    }

    function handleCellRangeSelected(e, args) {
      setSelectedRanges([args.range]);
    }

    function handleActiveCellChange(e, args) {
      if (_options.selectActiveCell && args.row != null && args.cell != null) {
        setSelectedRanges([new Slick.Range(args.row, args.cell)]);
      }
    }

    function handleKeyDown(e) {
      /***
       * Кey codes
       * 37 left
       * 38 up
       * 39 right
       * 40 down
       */
      var ranges, last;
      var active = _grid.getActiveCell();

      if ( active && e.shiftKey && !e.ctrlKey && !e.altKey &&
          (e.which == 37 || e.which == 39 || e.which == 38 || e.which == 40) ) {

        ranges = getSelectedRanges();
        if (!ranges.length)
         ranges.push(new Slick.Range(active.row, active.cell));

        // keyboard can work with last range only
        last = ranges.pop();

        // can't handle selection out of active cell
        if (!last.contains(active.row, active.cell))
          last = new Slick.Range(active.row, active.cell);

        var dRow = last.toRow - last.fromRow,
            dCell = last.toCell - last.fromCell,
            // walking direction
            dirRow = active.row == last.fromRow ? 1 : -1,
            dirCell = active.cell == last.fromCell ? 1 : -1;

        if (e.which == 37) {
          dCell -= dirCell;
        } else if (e.which == 39) {
          dCell += dirCell ;
        } else if (e.which == 38) {
          dRow -= dirRow;
        } else if (e.which == 40) {
          dRow += dirRow;
        }

        // define new selection range
        var new_last = new Slick.Range(active.row, active.cell, active.row + dirRow*dRow, active.cell + dirCell*dCell);
        if (removeInvalidRanges([new_last]).length) {
          ranges.push(new_last);
          var viewRow = dirRow > 0 ? new_last.toRow : new_last.fromRow;
          var viewCell = dirCell > 0 ? new_last.toCell : new_last.fromCell;
         _grid.scrollRowIntoView(viewRow);
         _grid.scrollCellIntoView(viewRow, viewCell);
        }
        else
          ranges.push(last);

        setSelectedRanges(ranges);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    $.extend(this, {
      "getSelectedRanges": getSelectedRanges,
      "setSelectedRanges": setSelectedRanges,

      "init": init,
      "destroy": destroy,

      "onSelectedRangesChanged": new Slick.Event()
    });
  }
})(jQuery);
