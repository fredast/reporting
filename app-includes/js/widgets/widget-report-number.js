
var widgetParams = {name: "Report Number", id:"reportNumber", sizes: ["small", "medium thin"]};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;
/*
	------------
	Report Number
	------------
*/

widgetry.reportNumber.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');

	// __Number format
	container.append('<h5>Number format</h5><input type="text" class="form-control" id="dash-wg-in-numberFormat"><p>Syntax is the one provided by <a href="http://numeraljs.com/" target="_blank">numeral.js</a></p>');
	// __Divisor
	container.append('<h5>Divisor</h5><input type="number" class="form-control" id="dash-wg-in-divisor" value="1"><p>The number computed will be divided by the divisor before being displayed</p>');
	// __Unit
	container.append('<h5>Unit</h5><input type="text" class="form-control" id="dash-wg-in-unit">');
	// __Report type
	container.append('<h5>Report type</h5><select class="form-control" id="dash-wg-in-reportType"></select>');
	widgetry.thisDA.reportTypeList.forEach(function(reportType){ $('#dash-wg-in-reportType').append($('<option></option>').attr('value',reportType.code).text(reportType.name)); });
	$('#dash-wg-in-reportType').prop("selectedIndex", -1);
	// _*_ Dynamic
	$('#dash-wg-in-reportType').off().change(function(){
		$('#dash-wg-in-reportType').nextAll().remove();
		var reportType = widgetry.thisDA.reportTypeList.filter(function(obj){return obj.code == $('#dash-wg-in-reportType').val();})[0];
		// __Column
		container.append('<h5>Column</h5><select class="form-control" id="dash-wg-in-column"></select>');
		reportType.columns.forEach(function(col){ $('#dash-wg-in-column').append($('<option></option>').attr('value',col.data).text(col.data)); });
		$('#dash-wg-in-column').prop("selectedIndex", -1);
		// _*_ Dynamic
		$('#dash-wg-in-column').off().change(function(){
			$('#dash-wg-in-column').nextAll().remove();
			var column = reportType.columns.filter(function(col){ return col.data == $('#dash-wg-in-column').val(); })[0];
			// __Operation
			container.append('<h5>Operation</h5><select class="form-control" id="dash-wg-in-operation"><option value="count">Count</option><option value="countU">Count unique</option></select>');
			if(column.dataType == 'numeric'){
				$('#dash-wg-in-operation').append('<option value="sum">Sum</option><option value="mean">Mean</option>');
			}
			$('#dash-wg-in-operation').prop("selectedIndex", -1);
			// __Filter
			widgetry.displayFilterSettings(container, reportType);
		});
	});

	if(edit){
		$('#dash-wg-in-numberFormat').val(widget.numberFormat).trigger('change');
		$('#dash-wg-in-divisor').val(widget.divisor).trigger('change');
		$('#dash-wg-in-unit').val(widget.unit).trigger('change');
		$('#dash-wg-in-reportType').val(widget.reportType).trigger('change');
		$('#dash-wg-in-column').val(widget.column).trigger('change');
		$('#dash-wg-in-operation').val(widget.operation).trigger('change');
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportNumber.editWidget = function(widget){
	widget.numberFormat = $('#dash-wg-in-numberFormat').val();
	widget.divisor = $('#dash-wg-in-divisor').val();
	widget.unit = $('#dash-wg-in-unit').val();
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.column = $('#dash-wg-in-column').val();
	widget.operation = $('#dash-wg-in-operation').val();
	widget.filter = $('#dash-wg-in-filter').val();
};

widgetry.reportNumber.showWidget = function(widget, element){
	// __Report Type
	$(element).find('.widget-content').append($('<p></p>').text(widget.reportType));
	// __Operation
	$(element).find('.widget-content').append($('<p></p>').text(widget.operation));
	// __Column
	$(element).find('.widget-content').append($('<p></p>').text(widget.column));
};

widgetry.reportNumber.displayWidget = function(widget, dashdisp, element){
	var reportData, value;
	
	element.append('<p class="widget-number"><span class="widget-number-value"></span> <span class="widget-number-unit">' + widget.unit + '</span></p>');

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
		// Compute the value
		switch(widget.operation){
			case 'count':
				value = reportData.length;
				break;
			case 'countU':
				var count = {};
				reportData.forEach(function(entry){
					count[entry[widget.column]] = (count[entry[widget.column]] || 0) + 1;
				});
				value = Object.keys(count).length;
				break;
			case 'sum':
				value = reportData.reduce(function(prev, entry){ return prev + (parseFloat(entry[widget.column]) || 0); }, 0);
				break;
			case 'mean':
				value = reportData.reduce(function(prev, entry){ return prev + (parseFloat(entry[widget.column]) || 0); }, 0) / reportData.length;
				break;
		}
		// Display the value
		var strValue = numeral(value).format(widget.numberFormat);
		$(".widget-number-value", element).text(strValue);
	});
};
