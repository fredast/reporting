
var widgetParams = {name: "Report Chart", id:"reportChart", maximizable : true};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;

widgetry.reportChart.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');

	var buildOptionsForColumns = function(reportType) {
		return reportType.columns.reduce(
			function (prev, obj) {
				return prev + '<option value="' + obj.data + '">' + obj.data + '</option>';
			}, "");
	};


	container.append('<h4>General</h4>');

	// __Report type
	container.append('<label for="dash-wg-in-reportType">Report type</label><select class="form-control" id="dash-wg-in-reportType"></select>');
	widgetry.thisDA.reportTypeList.forEach(function (reportType) {
		$('#dash-wg-in-reportType').append($('<option></option>').attr('value',reportType.code).text(reportType.name));
	});
	$('#dash-wg-in-reportType').prop("selectedIndex", -1);

	container.append('<label for="dash-wg-in-charttype">Chart type</label>');
	$('<select class="form-control" name="dash-wg-in-charttype" id="dash-wg-in-charttype">\
			<option value="area">Areas</option>\
			<option value="line">Lines</option>\
			<option value="column">Vertical bars</option>\
			<option value="bar">Horizontal bars</option>\
			<option value="pie">Pie</option>\
		</select>')
		.appendTo(container);

	container.append('<label for="dash-wg-in-cumulative">Cumulative</label>');
	$('<div id="dash-wg-in-cumulative">\
		<label class="radio-inline"><input type="radio" name="dash-wg-in-cumulative" value="true">Yes</label>\
		<label class="radio-inline"><input type="radio" name="dash-wg-in-cumulative" value="false">No</label>\
		</div>')
		.appendTo(container);

	container.append('<label for="dash-wg-in-stacked">Stacked</label>');
	$('<div id="dash-wg-in-stacked">\
		<label class="radio-inline"><input type="radio" name="dash-wg-in-stacked" value="true">Yes</label>\
		<label class="radio-inline"><input type="radio" name="dash-wg-in-stacked" value="false">No</label>\
		</div>')
		.appendTo(container);

	// _*_ Dynamic
	$('#dash-wg-in-reportType').off().change(function(){
		$('#dash-wg-in-stacked').nextAll().remove();

		var reportType = widgetry.thisDA.reportTypeList.filter(function(obj){return obj.code == $('#dash-wg-in-reportType').val();})[0];

		container.append('<h4>Axes</h4>');

		container.append('<label for="dash-wg-in-xaxis">X-axis</label>');
		$('<select class="form-control" name="dash-wg-in-xaxis" id="dash-wg-in-xaxis"></select>')
			.append(buildOptionsForColumns(reportType))
			.appendTo(container);

		container.append('<label for="dash-wg-in-yaxis">Y-axis</label>');
		$('<select class="form-control" nale="dash-wg-in-yaxis" id="dash-wg-in-yaxis"></select>')
			.append(buildOptionsForColumns(reportType))
			.appendTo(container);

		container.append('<h4>Custom formats</h4>\
		<p class="help-block">\
			Overrides the column format. For numeric columns, syntax is provided by <a href="http://numeraljs.com">numeral.js</a>, \
			for date ones, <a href="http://momentjs.com/docs/#/displaying/format/">moment.js</a>.\
		</p>');

		container.append('<label for="dash-wg-in-xaxis-format">X-axis</label>');
		$('<input class="form-control" name="dash-wg-in-xaxis-format" id="dash-wg-in-xaxis-format" />')
			.appendTo(container);

		container.append('<label for="dash-wg-in-yaxis-format">Y-axis</label>');
		$('<input class="form-control" nale="dash-wg-in-yaxis-format" id="dash-wg-in-yaxis-format" />')
			.appendTo(container);

		container.append('<h4>Data</h4>');

		container.append('<label for="dash-wg-in-aggregation">Aggregation function</label>');
		$('<select class="form-control" name="dash-wg-in-aggregation" id="dash-wg-in-aggregation">\
				<option value="count">Count</option>\
				<option value="sum">Sum</option>\
				<option value="avg">Average</option>\
			</select>')
			.appendTo(container);

		container.append('<label for="dash-wg-in-series">Series</label>');
		container.append('<select multiple id="dash-wg-in-series"></select>');
		$('#dash-wg-in-series').tagsinput({
			trimValue: true,
			confirmKeys: [13, 188, 190, 32, 186],
			tagClass: 'label label-default',
			typeahead: {source: reportType.columns.map(function(obj){return obj.data;})},
			freeInput: false
		});
		$('#dash-wg-in-series').off().on('itemAdded itemRemoved', function(){
			var placeholder = $('#dash-wg-in-series').tagsinput('items').length > 0 ? '' : 'Tags...';
			$('#dash-wg-in-series').next().find('input').attr({'placeholder':placeholder});
		});

		// __Filter
		widgetry.displayFilterSettings(container, reportType);
	});

	if(edit){
		$('#dash-wg-in-reportType').val(widget.reportType).trigger('change');
		$('#dash-wg-in-charttype').val(widget.charttype).trigger('change');
		if(widget.cumulative) {
			$('#dash-wg-in-cumulative input[value=' + widget.cumulative + ']').attr('checked', true);
		}
		if(widget.stacked) {
			$('#dash-wg-in-stacked input[value=' + widget.cumulative + ']').attr('checked', true);
		}
		$('#dash-wg-in-xaxis').val(widget.xaxis).trigger('change');
		$('#dash-wg-in-xaxis-format').val(widget.xaxisFormat).trigger('change');
		$('#dash-wg-in-yaxis').val(widget.yaxis).trigger('change');
		$('#dash-wg-in-yaxis-format').val(widget.yaxisFormat).trigger('change');
		$('#dash-wg-in-aggregation').val(widget.aggregation).trigger('change');
		if(typeof widget.series == 'object'){
			widget.series.forEach(function(col){
				$('#dash-wg-in-series').tagsinput('add', col);
			});
		}
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportChart.editWidget = function(widget){
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.charttype = $('#dash-wg-in-charttype').val();
	widget.cumulative = $('input[name=dash-wg-in-cumulative]:checked').val();
	widget.stacked = $('input[name=dash-wg-in-stacked]:checked').val();
	widget.xaxis = $('#dash-wg-in-xaxis').val();
	widget.xaxisFormat = $('#dash-wg-in-xaxis-format').val();
	widget.yaxis = $('#dash-wg-in-yaxis').val();
	widget.yaxisFormat = $('#dash-wg-in-yaxis-format').val();
	widget.aggregation = $('#dash-wg-in-aggregation').val();
	widget.series = $('#dash-wg-in-series').tagsinput('items').slice();
};

widgetry.reportChart.showWidget = function(widget, element){
	var container = $('<dl class="dl-horizontal"></dl>');

	container
		.append('<dt>Report type</dt>')
		.append('<dd>' + widget.reportType + '</dd>');

	container
		.append('<dt>Chart type</dt>')
		.append('<dd>' + widget.charttype + '</dd>');

	container
		.append('<dt>Axes</dt>')
		.append('<dd>' + widget.xaxis + " / " + widget.yaxis + '</dd>');

	if(widget.series && widget.series.length > 0) {
		container
			.append('<dt>Series</dt>')
			.append('<dd>' + widget.series.join(", ") + '</dd>');
	}

	$(element).find('.widget-content').append(container);
};

widgetry.reportChart.displayWidget = function(widget, dashdisp, element, maximized){
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];

	var highChartsContainer = $('<div class="highcharts"></div>');
	element.append(highChartsContainer);

	// Fetch a column description from its name.
	var columnByName = function(name) {
		var column = {},
				currentColumn;
		for(var i in reportType.columns) {
			currentColumn = reportType.columns[i];
			if(currentColumn.data == name) {
				column = currentColumn;
				break;
			}
		}
		return column;
	};

	// Columns descriptions for axes
	var xColumn = columnByName(widget.xaxis);
	var yColumn = columnByName(widget.yaxis);

	// For a data point, set the X
	var setX = function(obj, key) {
		if(xColumn.type == "numeric") {
			obj.x = parseFloat(key);
		}
		else if (xColumn.type == "date") {
			obj.x = moment(key, "DD/MM/YYYY").unix() * 1000;
		}
		else {
			obj.name = key;
		}
	};

	// For a data point, set the Y
	var setY = {
		"count" : function(obj, indexedElement) {
			obj.y = indexedElement.count;
		},
		"sum" : function(obj, indexedElement) {
			obj.y = indexedElement.sum;
		},
		"avg" : function(obj, indexedElement) {
			obj.y = indexedElement.sum / indexedElement.count;
		}
	};

	// Map a column type to its axis type counterpart
	var axisTypeMapping = {
		"date": "datetime",
		"numeric": "linear",
		"string": "category"
	};

	// Return a formatter function for a column
	var formatter = function(column, customFormat) {
		if(column.type == "numeric") {
			return function() {
				return numeraljs(this.value || this.y).format(customFormat || column.format);
			};
		}
		else if(column.type == "date") {
			return function() {
				var dateFormat = column.dateFormat.toUpperCase() || "DD/MM/YY";
				// DATE FORMATS ARE ALL WRONG, SETTING IT TO UPPERCASE
				return moment(this.value || this.y).format(customFormat || dateFormat);
			}
		}
		else {
			return function() {
				return this.value || this.y;
			}
		}
	};

	// Sort functions for a type
	var sortFunctions = {
		"numeric": function(a, b) {
			return a.x - b.x;
		},
		"date": function (a, b) {
			return a.x - b.x;
		},
		"string": function(a, b) {
			return b.name.localeCompare(a.name);
		}
	};

	// Chart definition (minus the data)
	var highchartsData = {
		chart: {
			zoomType: maximized ? "x" : undefined,
			panning: maximized,
      panKey: 'shift'
		},
		exporting: {
			// We're using custom buttons
			enabled: false
		},
		title: {
			animation: false,
			text: ""
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: maximized && (widget.series && widget.series.length > 0)
		},
		xAxis: {
			type: axisTypeMapping[xColumn.type] || "category",
			labels: {
				formatter: formatter(xColumn, widget.xaxisFormat),
				style: {
					fontSize: (maximized ? '14' : '10') + 'px'
				}
			},
			minRange: 1
		},
		yAxis: {
			type: axisTypeMapping[yColumn.type],
			title: "",
			labels: {
				formatter: formatter(yColumn, widget.yaxisFormat),
				style: {
					fontSize: (maximized ? '14' : '10') + 'px'
				}
			}
		},
		tooltip: {
			enabled: maximized ? true : false,
			formatter: formatter(yColumn, widget.yaxisFormat)
		},
		plotOptions: {
	    series: {
	        animation: false,
					stacking: widget.stacked ? "normal": undefined,
					states: {
						hover: {
							enabled: maximized ? true : false
						}
					}
	    },
			pie: {
				dataLabels: {
					formatter: function() {
						if(maximized) {
							return this.point.name + " (" +  numeraljs(this.percentage / 100).format('0[.]00%') + ')';
						}
						else {
							return this.point.name;
						}
					},
					distance: maximized ? 30 : 3,
					style: {
						fontSize: (maximized ? '14' : '10') + 'px',
						fontWeight: maximized ? 'bold' : 'normal'
					}
				}
			}
		}
	};

	// Adding custom export buttons when maximized
	if(maximized) {
		var exportButtons = $('<div class="btn-group pull-right"></div>');

		var safeFilename = widget.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

		var formats = [ "PNG", "JPEG", "SVG", "PDF" ];
		var exportButton;
		formats.forEach(function(format) {
			exportButton = $('<button class="btn btn-default"></button>').text(format);
			exportButton.click(function() {
				$(highChartsContainer).highcharts().exportChart({
					scale: 1,
					type: Highcharts.export.MIME_TYPES[format],
					filename: "export_" + safeFilename
				});
			});
			exportButtons.append(exportButton);
		});

		exportButtons.insertBefore(highChartsContainer);
	}

	// Request data
	dashdisp.datasource.registerStreamListener(
		{
			dataType: widget.reportType,
			all: true
		},
		function (result) {
			// Filter the data
			var reportData = result.data.filter(function(entry){
				if(entry.deleted){ return false; }
				return widgetry.filter(widget, entry);
			});

			var indexedData = {},
					indexedKeys = {}; // contains all keys ac
			var currentSerie = widget.series && widget.series[0];

			reportData.forEach(function(reportRow) {
				var x, y, serie;
				serie = currentSerie && reportRow[currentSerie] || "no-serie";
				x = reportRow[widget.xaxis];
				y = reportRow[widget.yaxis];

				if(!serie || !x || !y || x == "Invalid date" || y == "Invalid date") {
					return;
				}

				if(indexedData[serie] === undefined) {
					indexedData[serie] = {};
				}

				if(indexedData[serie][x] === undefined) {
					indexedData[serie][x] = {
						sum: 0,
						count: 0
					};
				}

				if(indexedKeys[x] === undefined) {
					indexedKeys[x] = true;
				}

				indexedData[serie][x].sum += parseFloat(y) || 0;
				indexedData[serie][x].count += 1;
			});

			var seriesData = [];
			var serieIndexedData,
					serieData;
			for(var i in indexedData) {
				serieIndexedData = indexedData[i];
				serieData = [];
				for(var j in indexedKeys) {
					obj = {};
					setX(obj, j);
					setY[widget.aggregation || "count"](obj, serieIndexedData[j] || { sum : 0, count : 0 });
					serieData.push(obj);
				}
				serieData.sort(sortFunctions[xColumn.type || "string"]);

				if(widget.cumulative == "true") {
					var prev = 0;
					for(var j = 0; j < serieData.length; j++) {
						serieData[j].y = serieData[j].y + prev;
						prev = serieData[j].y;
					}
				}

				seriesData.push({
					name: i,
					data: serieData,
					type: widget.charttype,
					stack: 0
				})

			}

			highchartsData.series = seriesData;

			highChartsContainer.highcharts(highchartsData);
		});
};
