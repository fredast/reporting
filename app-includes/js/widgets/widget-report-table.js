
var widgetParams = {name: "Report Table", id:"reportTable", sizes: ["large thin", "large"]};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;

/*
	------------
	Report Table
	------------
*/

reportTableUpdateColumnWidth = function(element, nbColumns){
	var colWidth = $(element).find('.handsontable-container').width() / nbColumns;
	colWidths = [];
	for(i=0;i<nbColumns;i++){
		colWidths[i] = colWidth;
	}
	return colWidths;
}

widgetry.reportTable.displaySettings = function(widget){
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
		$('#dash-wg-in-columnSortingIndex').val(widget.columnSortingIndex).trigger('change');
		$('#dash-wg-in-columnSortingOrder').val(widget.columnSortingOrder).trigger('change');
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportTable.editWidget = function(widget){
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.columns = $('#dash-wg-in-columns').tagsinput('items').slice();
	widget.columnSortingIndex = $('#dash-wg-in-columnSortingIndex').val();
	widget.columnSortingOrder = $('#dash-wg-in-columnSortingOrder').val();
	widget.filter = $('#dash-wg-in-filter').val();
};

widgetry.reportTable.showWidget = function(widget, element){
	// __Report Type
	$(element).find('.widget-content').append($('<p></p>').text(widget.reportType));
	// __Columns
	var tagsList = $('<p></p>');
	if(typeof widget.columns == 'object'){
		widget.columns.forEach(function(col){ tagsList.append($('<span class="label label-default"></span>').text(col)).append(' '); });
	}
	$(element).find('.widget-content').append(tagsList);
};

widgetry.reportTable.displayWidget = function(widget, dashdisp, element){
	var reportData, columnsIndex;
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];

	// Request data
	dashdisp.datasource.registerStreamListener(
		{
			dataType: widget.reportType,
			all: true
		},
		function(result){
			// Filter the data
			reportData = result.data.filter(function(entry){
				if(entry.deleted){ return false; }
				return widgetry.filter(widget, entry);
			});
			// Select the columns
			columnsIndex = widget.columns.map(function(col){
				var index;
				reportType.columns.some(function(obj, id){
					if(obj.data == col){
						index = id;
						return true;
					}
					return false;
				})
				return index;
			});
			// Display the table
			element.append('<div class="handsontable-container"></div>');
			element.find('.handsontable-container').handsontable({
				data: reportData,
				minSpareRows: 0,
				colHeaders: columnsIndex.map(function(id){ return reportType.columnsHeader[id]; }),
				/*columnSorting: {
					column: parseInt(widget.columnSortingIndex),
					sortOrder: Boolean(widget.columnSortingOrder)
				},*/
				columnSorting: true,
				//stretchH: 'all',
				colWidths: reportTableUpdateColumnWidth(element, columnsIndex.length),
				columns: columnsIndex.map(function(id){
					reportType.columns[id].readOnly = true;
					// Timecodes
					if(reportType.columns[id].dataType == 'time'){
						reportType.columns[id].renderer = function(instance, TD, row, col, prop, value, cellProperties){
							var dateTime = moment(value, "X");
							if(dateTime.isValid()){
								$(TD).html(dateTime.format('YYYY-MM-DD'));
							}
						}
					}
					// Remove dropdown menu
					if(reportType.columns[id].type == "date" || reportType.columns[id].type == "dropdown" || reportType.columns[id].type == "autocomplete"){
						// ---------- DELETED -----------
						// Messes up with other widgets
						//delete reportType.columns[id].type;
					}
					return reportType.columns[id];
				}),
				afterSelection: function(r, c, r2, c2){
					if(r != r2 || c != c2){ $('.popover').remove(); return true;}
					// Popover with additional info
					var handler = element.find('.handsontable-container').handsontable('getInstance');
					var dbId = handler.getDataAtRowProp(r, 'dbId');
					var entry = reportData.filter(function(obj){ return obj.dbId == dbId; })[0];
					var row = handler.getCell(r, c).parentElement;
					// Popover content
					var content = '<table class="table table-striped table-condensed popover-table"><col width="30%"><col width="70%">';
					reportType.columns.forEach(function(col, id){
						var value = (entry[col.data] || '');
						if(col.type == "numeric" && value != ''){
							value = numeral(value).format(col.format);
						}
						// Timecodes
						if(col.dataType == "time"){
							value = moment(value, "X").format("DD/MM/YYYY");
						}
						content += '<tr><td>' + reportType.columnsHeader[id] + '</td><td>' + value + '</td></tr>';
					});
					content += '<tr><td>Last update by</td><td>' + (entry.updatedUser || '') + '</td></tr>';
					content += '<tr><td>Last update on</td><td>' + (moment(entry.updatedTime, "X").format('HH:mm DD/MM/YYYY') || '') + '</td></tr>';
					content += '</table>';
					// Display popover
					$('.popover').remove();
					$(row).popover({
						content: content,
						container: "body",
						trigger: "manual",
						html: true,
						placement: function(arg1, sourceDiv){
							if($(sourceDiv).offset().left + $(sourceDiv).width() / 2 - $(window).width() / 2 > 0){
								return 'left';
							}
							return 'right';
						}
					});
					$(row).popover('show');
					$('.popover').click(function(event){event.stopPropagation();});
				}
			});
			var handsontableHandler = $(element).find('.handsontable-container').handsontable('getInstance');
			handsontableHandler.notSorted = true;
			handsontableHandler.addHook('afterRender', function(){
				if(handsontableHandler.notSorted){
					handsontableHandler.notSorted = false;
					handsontableHandler.sort(parseInt(widget.columnSortingIndex), (widget.columnSortingOrder == "true"));
				}
			});
			element.find('tbody').click(function(event){ event.stopPropagation(); });
			// Ajust columns width when window resize
			$( window ).resize(function() {
				handsontableHandler.updateSettings({colWidths: reportTableUpdateColumnWidth(element, columnsIndex.length)});
			});
	});
};
