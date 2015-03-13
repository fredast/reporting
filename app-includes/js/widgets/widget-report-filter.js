
var widgetParams = {name: "ReportFilter", id:"reportFilter", sizes: ["medium", "large", "extra-large", "full-width"]};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;

widgetry.reportFilter.displaySettings = function(widget){
};

widgetry.reportFilter.editWidget = function(widget){
};

widgetry.reportFilter.showWidget = function(widget, element){
	var container = $('<p>No configuration</p>');
	$(element).find('.widget-content').append(container);
};

var getAvailableColumns = function(reportListTypes) {
	var columns = [];
	var columnsIndex = {};

	var code,
			name,
			columnIndex,
			currentColumn;
	for(var i in reportListTypes) {
		code = reportListTypes[i].code;
		name = reportListTypes[i].name;
		for(var j in reportListTypes[i].columns) {
			currentColumn = reportListTypes[i].columns[j];
			columnIndex = columnsIndex[currentColumn.data];
			if(!columnIndex) {
				columnIndex = columns.length;
				columnsIndex[currentColumn.data] = columnIndex;

				columns[columnIndex] = Object.create(currentColumn);
				columns[columnIndex].header = reportListTypes[i].columnsHeader[j];
				columns[columnIndex].availableIn = [];
			}

			columns[columnIndex].availableIn.push({
				code: code,
				name: name
			});
		}
	}

	return columns;
};

var createTextFilter = function(title, field) {
	var formGroup = $('<div class="form-group">\
		<label for="field-' + field + '" class="col-xs-4 control-label">' + title + '</label>\
		<div class="col-xs-8">\
			<input class="form-control input-sm" id="field-' + field + '" placeholder="Search Term 1, Search Term 2, &hellip;" />\
		</div>\
	</div>');

	var input = $('.form-control', formGroup);

	var filterCondition = function(value, searchTerms) {
		return searchTerms.some(function(searchTerm) {
			return searchTerm.test(value);
		});
	}

	var filterFunction = function(entry) {
		var inputVal = input.val(),
				searchTerms = inputVal.split(",");

		if(inputVal.trim() == "") {
			return true;
		}

		var searchTerms = [],
				splittedInput = inputVal.split(",");
		for(var i in splittedInput) {
			if(splittedInput[i].trim() != "") {
				searchTerms.push(new RegExp(splittedInput[i].trim(), 'i'));
			}
		}

		if(field == "*") {
			for(var i in entry) {
				if(filterCondition(entry[i], searchTerms)) {
					return true;
				}
			}
			return false;
		}
		else {
			return entry[field] ? filterCondition(entry[field], searchTerms) : true;
		}
	};

	return {
		formGroup: formGroup,
		inputs: input,
		filterFunction: filterFunction
	};
};

var createNumberFilter = function(title, field) {
	var formGroup = $('<div class="form-group">\
		<label for="field-' + field + '-min" class="col-xs-4 control-label">' + title + '</label>\
		<div class="col-xs-4">\
			<input class="form-control input-sm" id="field-' + field + '-min" placeholder="Min" />\
		</div>\
		<div class="col-xs-4">\
			<input class="form-control input-sm" id="field-' + field + '-max" placeholder="Max" />\
		</div>\
	</div>');

	var inputMin = $('#field-' + field + '-min', formGroup),
			inputMax = $('#field-' + field + '-max', formGroup);

	var filterFunction = function(entry) {
		if(entry[field] === undefined) {
			return true;
		}

		var inputMinVal = inputMin.val().trim(),
				inputMaxVal = inputMax.val().trim(),
				entryVal = parseFloat(entry[field]);

		var ret = true;

		if(inputMinVal != "") {
			ret &= entryVal >= parseFloat(inputMinVal);
		}
		if(inputMaxVal != "") {
			ret &= entryVal <= parseFloat(inputMaxVal);
		}

		return ret;
	};

	return {
		formGroup: formGroup,
		inputs: $(".form-control", formGroup),
		filterFunction: filterFunction
	};
};

var createDateFilter = function(title, field) {
	var formGroup = $('<div class="form-group">\
		<label for="field-' + field + '-min" class="col-xs-4 control-label">' + title + '</label>\
		<div class="col-xs-4 has-feedback">\
			<input class="form-control input-sm" id="field-' + field + '-min" placeholder="Min (DD/MM/YYYY)" />\
			<span class="glyphicon glyphicon-flash form-control-feedback hidden" id="field-' + field + '-min-feedback" aria-hidden="true"></span>\
		</div>\
		<div class="col-xs-4 has-feedback">\
			<input class="form-control input-sm" id="field-' + field + '-max" placeholder="Max (DD/MM/YYYY)" />\
			<span class="glyphicon glyphicon-flash form-control-feedback hidden" id="field-' + field + '-max-feedback" aria-hidden="true"></span>\
		</div>\
	</div>');

	var dateFormat = ["DD/MM/YY", "DD/MM/YYYY", "DD/MM", "MM"];

	var context = {
		min : {
			input: $('#field-' + field + '-min', formGroup),
			feedback: $('#field-' + field + '-min-feedback', formGroup),
			rawVal: undefined,
			oldRawVal: undefined,
			val: undefined
		},
		max : {
			input: $('#field-' + field + '-max', formGroup),
			feedback: $('#field-' + field + '-max-feedback', formGroup),
			rawVal: undefined,
			oldRawVal: undefined,
			val: undefined
		}
	};

	var prepareFunction = function() {
		context.min.rawVal = context.min.input.val().trim();
		context.min.val = moment(context.min.rawVal, dateFormat);
		context.min.rawVal = context.min.input.val().trim();
		context.max.val = moment(context.max.input.val().trim(), dateFormat);

		var boundaries = [context.min, context.max];
		boundaries.forEach(function(boundary) {
			boundary.rawVal = boundary.input.val().trim();
			boundary.val = moment(boundary.rawVal, dateFormat);

			var reformatted = boundary.val.format("DD/MM/YYYY");
			if(!boundary.val.isValid() || boundary.rawVal == reformatted) {
				boundary.input.popover("destroy");
				boundary.feedback.addClass("hidden");
			}
			else if(boundary.rawVal != boundary.oldRawVal){
				boundary.input.popover("destroy");
				boundary.input.popover({
					animation: false,
					trigger: "hover",
					container: "body",
					placement: "bottom",
					content: reformatted
				});
				boundary.feedback.removeClass("hidden");
			}

			boundary.oldRawVal = boundary.rawVal;
		});
	};

	var filterFunction = function(entry) {
		if(entry[field] === undefined) {
			return true;
		}

		var entryVal = moment(entry[field], dateFormat);

		var ret = entryVal.isValid();

		if(ret && context.min.val.isValid()) {
			ret &= context.min.val.isBefore(entryVal) || context.min.val.isSame(entryVal);
		}
		if(ret && context.max.val.isValid()) {
			ret &= context.max.val.isAfter(entryVal) || context.max.val.isSame(entryVal);
		}

		return ret;
	};

	return {
		formGroup: formGroup,
		inputs: $(".form-control", formGroup),
		prepareFunction: prepareFunction,
		filterFunction: filterFunction
	};
};

widgetry.reportFilter.displayWidget = function(widget, dashdisp, element){
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];

	var timer,
			delay = 500;
	var refreshDataSource = function() {
		if(timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(dashdisp.datasource.refresh.bind(dashdisp.datasource), delay);
	};

	var creationFunction = {
		"numeric": createNumberFilter,
		"date": createDateFilter
	};

	// Title
	var heading = $('.panel-heading', element);
	$('.title', element).remove();
	$('<span class="glyphicon glyphicon-filter"></span>').prependTo(heading);

	var form = $('<form class="form-horizontal"></form>'),
			body = $('<div class="panel-body hidden"></div>').append(form);

	var filters = [];

	dashdisp.datasource.addFilter(function(entry) {
		filters.forEach(function(filter) {
			filter.prepareFunction && filter.prepareFunction();
		});
		return filters.every(function(filter) {
			return filter.filterFunction(entry);
		});
	});

	var quickSearch = createTextFilter("Quick Search", "*");
	filters.push(quickSearch);
	var titleWrapper = $('<form class="form-horizontal col-xs-10"></form>').append(quickSearch.formGroup);
	titleWrapper.appendTo(heading);
	quickSearch.inputs.keyup(refreshDataSource);


	var addFilter = function(creationFunction, label, field) {
		var filter = creationFunction.call(null, label, field);
		filters.push(filter);
		form.append(filter.formGroup);
		filter.inputs.keyup(refreshDataSource);
		return filter;
	};

	var newFilter = $('<input class="form-control input-sm" placeholder="Enter field name" autocomplete="off"></input>');
	heading.append($('<div class="pull-right input-group" style="width: 270px;">\
		<span class="input-group-addon"><span class="glyphicon glyphicon-plus"></span></span>\
		</div>').append(newFilter));

	var availableColumns = getAvailableColumns(widgetry.thisD.reportTypeList);
	newFilter.typeahead({
		minLength: 0,
		showHintOnFocus: true,
		autoSelect: false,
		items: 'all',
		displayText: function(column) {
			var types = column.availableIn.map(function(type) { return type.name; });
			return column.header + " \u2014 " + types.join(", ");
		},
		source: function (q, cb) {
			var r = RegExp(q, 'i');
			var matches = availableColumns.filter(function(column) {
				return r.test(column.data);
			});
			cb(matches);
		},
		afterSelect: function(column) {
			newFilter.val('');
			var filter = addFilter(creationFunction[column.type] || createTextFilter, column.header, column.data);
			body.removeClass('hidden');
			filter.inputs.first().focus();
			$('#dashContainer').packery();
		}
	});

	element
		.append(body);
};
