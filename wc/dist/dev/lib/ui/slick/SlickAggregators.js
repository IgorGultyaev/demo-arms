/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define([
	"core"
	], function () {
		"use strict";
		
		var aggregators = {
			Avg: AvgAggregator,
			Min: MinAggregator,
			Max: MaxAggregator,
			Sum: SumAggregator,
			Count: CountAggregator,
			CountNotNull: CountNotNullAggregator
		};

		function CountAggregator() {

			this.init = function () {
				this.count_ = 0;
			};

			this.accumulate = function (items) {
				this.count_ += items.length;
			};

			this.storeResult = function (groupTotals) {
				groupTotals.count = this.count_;
			};
		}

		function CountNotNullAggregator(field) {
			this.field_ = field;

			this.init = function () {
				this.nonNullCount_ = 0;
			};

			this.accumulate = function (items) {
				var i, item, val,
					itemsLength = items.length;

				for(i = 0; i < itemsLength; i++) {
					item = items[i];
					val = typeof(item[this.field_])=="function"?item[this.field_]():item[this.field_];
					if (val != null && val !== "" && val !== NaN) {
						this.nonNullCount_++;
					}
				}
			};

			this.storeResult = function (groupTotals) {
				if (!groupTotals.countNotNull) {
					groupTotals.countNotNull = {};
				}

				groupTotals.countNotNull[this.field_] = this.nonNullCount_;
			};
		}

		function AvgAggregator(field) {
			this.field_ = field;

			this.init = function () {
				this.count_ = 0;
				this.nonNullCount_ = 0;
				this.sum_ = 0;
			};

			this.accumulate = function (items) {
				var i, item, val,
					itemsLength = items.length;

				for(i = 0; i < itemsLength; i++) {
					item = items[i];
					val = typeof(item[this.field_])=="function"?item[this.field_]():item[this.field_];
					if (val != null && val !== "" && val !== NaN) {
						this.nonNullCount_++;
						this.sum_ += parseFloat(val);
					}
				}
			};

			this.storeResult = function (groupTotals) {
				if (!groupTotals.avg) {
					groupTotals.avg = {};
				}
				if (this.nonNullCount_ != 0) {
					groupTotals.avg[this.field_] = this.sum_ / this.nonNullCount_;
				} else {
					groupTotals.avg[this.field_] = null;
				}
			};
		}

		function MinAggregator(field) {
			this.field_ = field;

			this.init = function () {
				this.min_ = null;
			};

			this.accumulate = function (items) {
				var i, item, val,
					itemsLength = items.length;

				for(i = 0; i < itemsLength; i++) {
					item = items[i];
					val = typeof(item[this.field_])=="function"?item[this.field_]():item[this.field_];
					if (val != null && val !== "" && val !== NaN) {
						if (this.min_ == null || val < this.min_) {
							this.min_ = val;
						}
					}
				}
			};

			this.storeResult = function (groupTotals) {
				if (!groupTotals.min) {
					groupTotals.min = {};
				}
				groupTotals.min[this.field_] = this.min_;
			}
		}

		function MaxAggregator(field) {
			this.field_ = field;

			this.init = function () {
				this.max_ = null;
			};

			this.accumulate = function (items) {
				var i, item, val,
					itemsLength = items.length;

				for(i = 0; i < itemsLength; i++) {
					item = items[i];
					val = typeof(item[this.field_])=="function"?item[this.field_]():item[this.field_];
					if (val != null && val !== "" && val !== NaN) {
						if (this.max_ == null || val > this.max_) {
							this.max_ = val;
						}
					}
				}
			};

			this.storeResult = function (groupTotals) {
				if (!groupTotals.max) {
					groupTotals.max = {};
				}
				groupTotals.max[this.field_] = this.max_;
			}
		}

		function SumAggregator(field) {
			this.field_ = field;

			this.init = function () {
				this.sum_ = null;
			};


			this.accumulate = function (items) {
				var i, item, val,
					itemsLength = items.length;

				for(i = 0; i < itemsLength; i++) {
					item = items[i];
					val = typeof(item[this.field_])=="function"?item[this.field_]():item[this.field_];
					if (val != null && val !== "" && val !== NaN) {
						this.sum_ += parseFloat(val);
					}
				}
			};

			this.storeResult = function (groupTotals) {
				if (!groupTotals.sum) {
					groupTotals.sum = {};
				}
				groupTotals.sum[this.field_] = this.sum_;
			}
		}

	return aggregators;
});