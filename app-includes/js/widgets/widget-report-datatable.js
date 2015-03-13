
var widgetParams = {name: "Report Datatable", id:"reportDatatable", maximizable : true};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;

widgetry.reportDatatable.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');

	// __Report type
	container.append('<h5>Report type</h5><select class="form-control" id="dash-wg-in-reportType"></select>');
	widgetry.thisDA.reportTypeList.forEach(function(reportType){ $('#dash-wg-in-reportType').append($('<option></option>').attr('value',reportType.code).text(reportType.name)); });
	$('#dash-wg-in-reportType').prop("selectedIndex", -1);
	// _*_ Dynamic
	$('#dash-wg-in-reportType').off().change(function(){
		$('#dash-wg-in-reportType').nextAll().remove();
		var reportType = widgetry.thisDA.reportTypeList.filter(function(obj){return obj.code == $('#dash-wg-in-reportType').val();})[0];

		// __Columns
		container.append('<h5>Columns</h5><select multiple id="dash-wg-in-columns"></select>');
		$('#dash-wg-in-columns').tagsinput({
			trimValue: true,
			confirmKeys: [13, 188, 190, 32, 186],
			tagClass: 'label label-default',
			typeahead: {
				source: reportType.columns.map(function(obj){return obj.data;}),
				displayText: function(item) { return item; }
			},
			freeInput: false
		});
		$('#dash-wg-in-columns').off().on('itemAdded itemRemoved', function(){
			var placeholder = $('#dash-wg-in-columns').tagsinput('items').length > 0 ? '' : 'Tags...';
			$('#dash-wg-in-columns').next().find('input').attr({'placeholder':placeholder});
		});


		// __Columns in maximized modal
		container.append('<h5>Columns when maximized</h5><select multiple id="dash-wg-in-columns-maximized"></select>');
		$('#dash-wg-in-columns-maximized').tagsinput({
			trimValue: true,
			confirmKeys: [13, 188, 190, 32, 186],
			tagClass: 'label label-default',
			typeahead: {
				source: reportType.columns.map(function(obj){return obj.data;}),
				displayText: function(item) { return item; }
			},
			freeInput: false
		});
		$('#dash-wg-in-columns-maximized').off().on('itemAdded itemRemoved', function(){
			var placeholder = $('#dash-wg-in-columns-maximized').tagsinput('items').length > 0 ? '' : 'Tags...';
			$('#dash-wg-in-columns-maximized').next().find('input').attr({'placeholder':placeholder});
		});

		// __Columns sorting
		container.append('<h5>Column sorting index</h5><input type="number" class="form-control" id="dash-wg-in-columnSortingIndex" value="1"><p>Index of the column to sort along. Start from 0.</p>');
		container.append('<h5>Order</h5><select class="form-control" id="dash-wg-in-columnSortingOrder"><option value="true">Ascending</option><option value="false">Descending</option></select>');
		$('#dash-wg-in-columnSortingOrder').prop("selectedIndex", -1);
		// __Filter
		widgetry.displayFilterSettings(container, reportType);
	});

	if(edit){
		$('#dash-wg-in-reportType').val(widget.reportType).trigger('change');
		$('#dash-wg-in-columns').val(widget.column).trigger('change');
		if(typeof widget.columns == 'object'){
			widget.columns.forEach(function(col){
				$('#dash-wg-in-columns').tagsinput('add', col);
			});
		}
		$('#dash-wg-in-columns-maximized').val(widget.column).trigger('change');
		if(typeof widget.columnsMaximized == 'object'){
			widget.columnsMaximized.forEach(function(col){
				$('#dash-wg-in-columns-maximized').tagsinput('add', col);
			});
		}
		$('#dash-wg-in-columnSortingIndex').val(widget.columnSortingIndex).trigger('change');
		$('#dash-wg-in-columnSortingOrder').val(widget.columnSortingOrder).trigger('change');
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportDatatable.editWidget = function(widget){
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.columns = $('#dash-wg-in-columns').tagsinput('items').slice();
	widget.columnsMaximized = $('#dash-wg-in-columns-maximized').tagsinput('items').slice();
	widget.columnSortingIndex = $('#dash-wg-in-columnSortingIndex').val();
	widget.columnSortingOrder = $('#dash-wg-in-columnSortingOrder').val();
	widget.filter = $('#dash-wg-in-filter').val();
};

widgetry.reportDatatable.showWidget = function(widget, element){
	// __Report Type
	$(element).find('.widget-content').append($('<p></p>').text(widget.reportType));
	// __Columns
	var tagsList = $('<p></p>');
	if(typeof widget.columns == 'object'){
		widget.columns.forEach(function(col){ tagsList.append($('<span class="label label-default"></span>').text(col)).append(' '); });
	}
	$(element).find('.widget-content').append(tagsList);
};

widgetry.reportDatatable.displayWidget = function(widget, dashdisp, element, maximized){
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];

	var columns = maximized ? widget.columnsMaximized : widget.columns;

	var columnDefinitions = columns.map(function(column) {
		var columnIndex = reportType.columns.reduce(function(previousValue, currentColumn, index) {
				if(currentColumn.data == column) {
					return index;
				}
				else {
					return previousValue;
				}
			}, -1);

		var typeMapping = {
			"date": "num",
			"numeric": "num-fmt",
			"string": "string"
		};

		var rendererMapping = {
			"numeric": function(value, type) {
				if(type == "sort") {
					return value;
				}
				else if(value != '') {
					return numeraljs(value).format(reportType.columns[columnIndex].format);
				}
			},
			"date": function(value, type) {
				var momentValue = moment(value, "DD/MM/YYYY");
				if(type == "sort") {
					return momentValue.unix();
				}
				else {
					return momentValue.format(reportType.columns[columnIndex].dateFormat.toUpperCase());
				}
			}
		};

		return {
			title: reportType.shortColumnsHeader && reportType.shortColumnsHeader[columnIndex] || reportType.columnsHeader[columnIndex] || column,
			type: typeMapping[reportType.columns[columnIndex] && reportType.columns[columnIndex].type || "string"] || "string",
			defaultContent: "&mdash;",
			data: column,
			render: reportType.columns[columnIndex] && rendererMapping[reportType.columns[columnIndex].type || "string"]
		};
	});

	var safeFilename = widget.title.replace(/ /g, "_").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

	// Initialiazing datatable
	var table = $('<table class="table table-condensed table-hover"></table>');
	element.append(table);
	$(table).dataTable({
		"columns": columnDefinitions,
		"paging": false,
		"order": [[ widget.columnSortingIndex || 0, (widget.columnSortingOrder == "false" ? "desc" : "asc") ]],
		"dom": maximized ? 'fT<"table-responsive"t>' : 't',
		"tableTools": {
			"sSwfPath": "../app-includes/lib/datatables-1.10.5/tabletools/swf/copy_csv_xls_pdf.swf",
			"aButtons" : [
				{
					"sExtends": "copy",
					"oSelectorOpts": {
						"filter": "applied"
					}
				},
				{
					"sExtends": "csv",
					"oSelectorOpts": {
						"filter": "applied"
					},
          "sFileName": "export_" + safeFilename + ".csv"
				},
				{
					"sExtends": "xls",
					"oSelectorOpts": {
						"filter": "applied"
					},
          "sFileName": "export_" + safeFilename + ".xls"
				},
				{
					"sExtends": "pdf",
					"oSelectorOpts": {
						"filter": "applied"
					},
					"sPdfOrientation": "landscape",
          "sFileName": "export_" + safeFilename + ".pdf"
				}
			]
		}
	});

	var dataTable = $(table).DataTable();

	var sideInfo;
	if(maximized) {
		sideInfo = {
				dom: $('<div class="sideinfo col-xs-5 hidden">\
					<h4>\
						<div class="pull-right">\
							<a href="#" class="action-previous"><span class="glyphicon glyphicon-menu-left"></span></a>\
							<a href="#" class="action-next"><span class="glyphicon glyphicon glyphicon-menu-right"></span></a>\
							<a href="#" class="action-close"><span class="glyphicon glyphicon-remove action-close"></span></a>\
						</div>\
						Details\
					</h4>\
					<div class="content"></div>\
				</div>'),

				current: undefined,

				previousNext: function(orientation) {
					if(this.current == undefined) {
						return undefined;
					}
					else {
						var newRow;

						// if node is detached (user changed its search and the row doesn't appear anymore
						if(!$.contains(table[0], this.current[0])) {
							newRow = $("tbody tr", table).first();
						}
						else {
							newRow = $(this.current)[orientation]('tr');
						}

						if(newRow.length == 0) {
							return this.current;
						}
						else {
							return newRow;
						}
					}
				},

				previous: function() {
					return this.previousNext("prev");
				},

				next: function() {
					return this.previousNext("next");
				},

				show: function(row) {
					if(this.current == row) {
						return;
					}

					this.current = $(row);

					//removing highlight on row
					$('tr.active', table).removeClass('active');

					if(row === undefined) {
						this.dom.addClass("hidden");
						$(dataTable.table().container()).removeClass("col-xs-7");
					}
					else {
						this.dom.removeClass("hidden");
						$(dataTable.table().container()).addClass("col-xs-7");

						var entry = dataTable.row( this.current ).data() || {};

						// adding highlight on row
						$(this.current).addClass("active");

						var content = '<table class="table table-striped table-condensed popover-table">';
						reportType.columns.forEach(function(col, id){
							var value = (entry[col.data] || '');
							if(col.type == "numeric" && value != ''){
								value = numeraljs(value).format(col.format);
							}
							// Timecodes
							if(col.dataType == "time"){
								value = moment(value, "X").format("DD/MM/YYYY");
							}
							content += '<tr><td style="width: 200px;">' + reportType.columnsHeader[id] + '</td><td>' + value + '</td></tr>';
						});
						content += '<tr><td>Last update by</td><td>' + (entry.updatedUser || '') + '</td></tr>';
						content += '<tr><td>Last update on</td><td>' + (moment(entry.updatedTime, "X").format('HH:mm DD/MM/YYYY') || '') + '</td></tr>';
						content += '</table>';

						$(".content", this.dom).html(content);
					}

				}
			};
		element.append(sideInfo.dom);


		$(".action-previous", sideInfo.dom).click(function(e) {
			sideInfo.show(sideInfo.previous());
			e.preventDefault();
		});

		$(".action-next", sideInfo.dom).click(function(e) {
			sideInfo.show(sideInfo.next());
			e.preventDefault();
		});

		$(".action-close", sideInfo.dom).click(function(e) {
			sideInfo.show(undefined);
			e.preventDefault();
		});

		$('html').keydown(function(e){
				switch (e.which) {
					// Up or Left arrow:
					case 38:
					case 37:
						sideInfo.show(sideInfo.previous());
						e.preventDefault();
						break;
					case 40:
					case 39:
						sideInfo.show(sideInfo.next());
						e.preventDefault();
						break;
				}
		});
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

			// Display the table
			dataTable
				.clear()
				.rows
					.add(reportData)
				.columns
					.adjust()
				.draw();

			if(sideInfo) {
				$("tbody", table).on( 'click', 'tr', function () {
					sideInfo.show(this);
				} );
			}
		});
};
