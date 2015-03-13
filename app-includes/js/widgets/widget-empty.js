
var widgetParams = {name: "Empty", id:"empty", sizes: ["small", "medium thin"]};

widgetry.list.push(widgetParams);
widgetry[widgetParams.id] = widgetParams;
/*
	------------
	Empty widget
	------------
*/

widgetry.empty.showWidget = function(widget, element){
	$(element).find('.widget-content').append($('<p></p>').text("Empty"));
};

widgetry.empty.displayWidget = function(widget, dashdisp, element){
	
};