/// <reference types="slickgrid"/>

// NOTE: additional definitions for SlickGrid (see typings/slickgrid)
// TODO: complete definition and contribute to DefinitelyTyped repo
declare namespace Slick {
	export class CellSelectionModel<E> extends SelectionModel<SlickData, E> {
		constructor(options?: { selectActiveRow: boolean; });

		setSelectedRanges(ranges: Range[]);
		getSelectedRanges(): Range[];
	}

	export class EnhancedCellSelectionModel<T extends SlickData> extends CellSelectionModel<T> {

	}

	export class EnhancedCheckboxSelectColumn<T extends SlickData>  extends Plugin<T> {

	}

	export class RowMoveManager<T extends SlickData> extends Plugin<T> {

	}

	export class EnhancedCellCopyManager<T extends SlickData> extends Plugin<T> {
		onCopyCells: Slick.Event<OnCopyCellsEventArgs<T>>;
	}

	export interface OnCopyCellsEventArgs<T extends SlickData> extends GridEventArgs<T> {
		ranges: Range[];
	}
}

declare module "lib/ui/slick/SlickAggregators" {
	import Aggregator = Slick.Data.Aggregators.Aggregator;

	export class Avg extends Slick.Data.Aggregators.Aggregator<any> {
		constructor(field: string);
	}

	export class Min extends Slick.Data.Aggregators.Aggregator<any> {
		constructor(field: string);
	}

	export class Max extends Slick.Data.Aggregators.Aggregator<any> {
		constructor(field: string);
	}

	export class Sum extends Slick.Data.Aggregators.Aggregator<any> {
		constructor(field: string);
	}

	export class Count extends Slick.Data.Aggregators.Aggregator<any> {
	}

	export class CountNotNull extends Slick.Data.Aggregators.Aggregator<any> {
		constructor(field: string);
	}
}
