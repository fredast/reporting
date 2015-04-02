
var widgetParams = {name: "Report Chart", id:"reportChart", maximizable : true};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;

var UNAMED_SERIE = 'unamed';

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
			Overrides the column format. For numeric columns, syntax is provided by <a target="_blank" href="http://numeraljs.com">numeral.js</a>, \
			for date ones, <a target="_blank" href="http://momentjs.com/docs/#/displaying/format/">moment.js</a>.\
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
				<option value="countU">Count unique</option>\
				<option value="sum">Sum</option>\
				<option value="avg">Average</option>\
			</select>')
			.appendTo(container);

		container.append('<label for="dash-wg-in-series">Series</label>');
		$('<select class="form-control" id="dash-wg-in-series">\
				<option value="' + UNAMED_SERIE + '">(none)</option>\
			</select>')
			.append(buildOptionsForColumns(reportType))
			.appendTo(container);

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
			$('#dash-wg-in-stacked input[value=' + widget.stacked + ']').attr('checked', true);
		}
		$('#dash-wg-in-xaxis').val(widget.xaxis).trigger('change');
		$('#dash-wg-in-xaxis-format').val(widget.xaxisFormat).trigger('change');
		$('#dash-wg-in-yaxis').val(widget.yaxis).trigger('change');
		$('#dash-wg-in-yaxis-format').val(widget.yaxisFormat).trigger('change');
		$('#dash-wg-in-aggregation').val(widget.aggregation).trigger('change');
		$('#dash-wg-in-series').val(widget.series).trigger('change');
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
	widget.series = $('#dash-wg-in-series').val();
	widget.filter = $('#dash-wg-in-filter').val();
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

	if(widget.series != UNAMED_SERIE) {
		container
			.append('<dt>Series</dt>')
			.append('<dd>' + widget.series + '</dd>');
	}

	$(element).find('.widget-content').append(container);
};

widgetry.reportChart.displayWidget = function(widget, dashdisp, element, maximized){
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];

	var highChartsContainer = $('<div class="highcharts"></div>'),
			chartWrapper = $('<div class="wrapper"></div>');
	element.append(chartWrapper.append(highChartsContainer));

	// Columns descriptions for axes
	var xColumn = reportType.columns.column(widget.xaxis);
	var yColumn = reportType.columns.column(widget.yaxis);

	// For a data point, set the X
	var setX = function(obj, key) {
		if(xColumn.type == "numeric" || xColumn.type == "date") {
			obj.x = xColumn.typeValue(key).valueOf();
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
		"countU" : function(obj, indexedElement) {
			var uniqueValues = indexedElement.allValues.filter(function(v, i, arr) { return i == arr.indexOf(v)});
			obj.y = uniqueValues.length;
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
		return function() {
			var value = (this.value !== undefined) ? this.value : this.y;
			return column.formatValue(value, customFormat);
		};
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


	Highcharts.setOptions({
					global: {
							useUTC: false
					}
			});

	// Chart definition (minus the data)
	var highchartsData = {
		useUTC: false,
		chart: {
			zoomType: maximized ? "x" : undefined,
			panning: maximized,
      panKey: 'shift'
		},
		exporting: {
			// We're using custom buttons
			enabled: false,
			csv: {
				dateFormat: '%Y-%m-%d'
			}
		},
		title: {
			animation: false,
			text: ""
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: maximized && widget.series != UNAMED_SERIE
		},
		xAxis: {
			type: axisTypeMapping[xColumn.type] || "category",
			labels: {
				rotation: maximized ? -45 : 0,
				formatter: formatter(xColumn, widget.xaxisFormat),
				style: {
					fontSize: (maximized ? '14' : '10') + 'px'
				}
			}
		},
		yAxis: {
			type: axisTypeMapping[yColumn.type],
      reversedStacks: false,
			title: "",
			minPadding: 0,
			maxPadding: 0,
			labels: {
				formatter: formatter(yColumn, widget.yaxisFormat),
				style: {
					fontSize: (maximized ? '14' : '10') + 'px'
				}
			}
		},
		tooltip: {
			enabled: maximized ? true : false,
			useHTML: true,
			headerFormat: '<table><tr><th colspan="3" style="font-weight: bold">{point.key}</th><th></th></tr>',
			pointFormatter: function() {
				var y = formatter(yColumn, widget.yaxisFormat).apply(this),
						color = this.color;
						name = this.series.name;

				var row = '<tr>\
					<td>' + ((widget.series == UNAMED_SERIE && name == UNAMED_SERIE) ? '' : name) + ' </td>\
					<td style="font-weight: bold; color: ' + color + '; padding-left: 6px; text-align: right;"> ' + y + ' </td> \
					<td style="font-size: 10px; text-align: right; vertical-align: bottom; padding-left: 6px;"> ' + (this.percentage ? numeraljs(this.percentage / 100).format('0[.]00%') : '') + '</td>\
				</tr>';
				return row;
			},
			footerFormat: '</table>',
			shared: widget.stacked == 'true'
		},
		plotOptions: {
	    series: {
	        animation: false,
					stacking: widget.stacked == "true" ? "normal": null,
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
			},
			bar: {
				dataLabels: {
					enabled: (maximized && widget.stacked != 'true') ? true : false,
					formatter: formatter(yColumn, widget.yaxisFormat),
          align: 'right',
					x: -5
				}
			},
			column: {
				dataLabels: {
					enabled: (maximized && widget.stacked != 'true') ? true : false,
					formatter: formatter(yColumn, widget.yaxisFormat),
					y: 30
				}
			}
		}
	};

	// Adding custom export buttons when maximized
	// and side-info as well.
	var sideInfo;
	if(maximized) {
		// Export buttons
		var exportButtons = $('<div class="btn-group pull-right"></div>');

		var safeFilename = widget.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

		var formats = [ "PNG", "JPEG", "SVG", "PDF", "CSV", "XLS" ];
		var exportButton;
		formats.forEach(function(format) {
			exportButton = $('<button class="btn btn-default"></button>').text(format);
			exportButton.click(function() {
				$(highChartsContainer).highcharts().exportChart({
					scale: 1,
					type: Highcharts.exporting.MIME_TYPES[format],
					filename: "export_" + safeFilename
				});
			});
			exportButtons.append(exportButton);
		});

		exportButtons.insertBefore(highChartsContainer);

		// Sideinfo
		sideInfo = {
				dom: $('<div class="sideinfo col-xs-5 hidden">\
					<h4>\
						<div class="pull-right">\
							<a href="#" class="action-close"><span class="glyphicon glyphicon-remove action-close"></span></a>\
						</div>\
						Data\
					</h4>\
					<div class="content"></div>\
				</div>'),
				isShown: function() {
					return !this.dom.hasClass("hidden");
				},
				show: function() {
					this.dom.removeClass("hidden");
					chartWrapper.addClass("col-xs-7");
					$(".show-data", chartWrapper).attr("disabled", "disabled");
					highChartsContainer.highcharts().reflow();

					if(!this.init) {

						var table = $('<table class="table"></table>'),
								thead = $('<thead></thread>').appendTo(table)
								tbody = $('<tbody></tbody>').appendTo(table),
								rawData = highChartsContainer.highcharts().getDataRows(),
								rawHeaders = rawData.shift();

						var xFormatter = formatter(xColumn, widget.xaxisFormat),
								yFormatter = formatter(yColumn, widget.yaxisFormat),
								xType = xColumn.type || "string",
								yType = yColumn.type || "string";

						var row = $('<tr></tr>');
						rawHeaders.forEach(function(header, i) {
							row.append(
								$('<th></th>')
									.addClass('type-' + (i ? yType : xType))
									.text(header == UNAMED_SERIE ? 'Value' : header)
							);
						});
						thead.append(row);

						rawData.forEach(function(data, i) {
							var row = $('<tr></tr>'),
									val,
									formattedVal;

							for (j = 0; j < data.length; j++) {
								val = data[j];
								formattedVal = (j ? yFormatter : xFormatter).bind({ value : val })();

								row.append(
									$('<td></td>')
										.attr('data-order', val)
										.addClass('type-' + (j ? yType : xType))
										.html(formattedVal)
								);
							}

							tbody.append(row);
						});

						$(".content", sideInfo.dom).append(table);

						var dataTable = table.DataTable({
								"paging": false,
								"dom": 't',
							});
						dataTable
							.columns
								.adjust()
							.draw();

						this.init = true;
					}
				},
				hide: function() {
					this.dom.addClass("hidden");
					chartWrapper.removeClass("col-xs-7");
					$(".show-data", chartWrapper).removeAttr("disabled");
					highChartsContainer.highcharts().reflow();
				}
			};
		element.append(sideInfo.dom);


		$(".action-close", sideInfo.dom).click(function(e) {
			sideInfo.hide();
			e.preventDefault();
		});

		var showDataLink = $('<button class="btn btn-default pull-right show-data">Show Data</button>');
		showDataLink
			.insertBefore(exportButtons)
			.click(function(e) {
				sideInfo.show();
				e.preventDefault();
			});



		widget.keydownHandler = function(e){
				switch (e.which) {
					case 27:
						if(sideInfo.isShown()) {
							sideInfo.hide();
						}
						else {
							$('#maximized-widget').modal('hide');
						}
						break;
				}
		};
		$('html').bind('keydown', widget.keydownHandler);
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
			var currentSerie = widget.series;

			reportData.forEach(function(reportRow) {
				var x, y, serie;
				serie = currentSerie && reportRow[currentSerie] || UNAMED_SERIE;
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
						count: 0,
						allValues: []
					};
				}

				if(indexedKeys[x] === undefined) {
					indexedKeys[x] = true;
				}

				indexedData[serie][x].sum += parseFloat(y) || 0;
				indexedData[serie][x].count += 1;
				indexedData[serie][x].allValues.push(y);
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

widgetry.reportChart.destroyWidget = function(widget, dashdisp, element, maximized) {
	widget.keydownHandler && $('html').unbind('keydown', widget.keydownHandler);
};
