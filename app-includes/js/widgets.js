function deepReplace(obj, oldString, newString) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i], oldString, newString);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i], oldString, newString);
        }
        return out;
    }
	if (typeof obj === 'string') {
		var regExp = new RegExp(oldString, 'g');
		return obj.replace(regExp, newString);
	}
    return obj;
}


var widgetry = {
	list: [],
	displaySettings: function(widget){
		var type = $('#dash-wg-in-type').val();
		// Common
		var edit = typeof widget !== 'undefined';
		var container = $('#dash-modal-settings-body');

		container.append('<hr><h4>Global options</h4>');

    // __Size
    container.append('<label for="dash-wg-in-width">Width</label>');
    var widthSelect = $('<select class="form-control" id="dash-wg-in-width"></select>');
    (["col-xs-1", "col-xs-2", "col-xs-3", "col-xs-4", "col-xs-5", "col-xs-6", "col-xs-7", "col-xs-8", "col-xs-9", "col-xs-10", "col-xs-11", "col-xs-12"])
      .forEach(function(widthOption) {
        widthSelect.append('<option value="' + widthOption + '">' + widthOption + '</option>');
      });
    container.append(widthSelect);

    container.append('<label for="dash-wg-in-height">Height</label>');
    var heightSelect = $('<select class="form-control" id="dash-wg-in-height"></select>');
    (["height-100", "height-200", "height-300", "height-400", "height-500", "height-600", "height-700", "height-800", "height-auto"])
      .forEach(function(widthOption) {
        heightSelect.append('<option value="' + widthOption + '">' + widthOption + '</option>');
      });
    container.append(heightSelect);

		// __Title
		container.append('<label for="dash-wg-in-title">Title</label>');
    container.append('<input type="text" class="form-control" id="dash-wg-in-title" placeholder="Title" />');

    if (edit) {
      $('#dash-wg-in-width').val(widget.width);
      $('#dash-wg-in-height').val(widget.height);
      $('#dash-wg-in-title').val(widget.title);
    }

		// Specific
		typeof widgetry[type].displaySettings == 'function' ? widgetry[type].displaySettings(widget) : null;
	},
	canSaveWidget: function(){
		var type = $('#dash-wg-in-type').val();
		// Common
		if(!($('#dash-wg-in-width').val()) || !($('#dash-wg-in-height').val())){ return 'You must specify a size.'; }
		//if(!($('#dash-wg-in-title').val())){ return 'You must specify a title.'; }
		// Specific
		return (typeof widgetry[type].canSaveWidget == 'function' ? widgetry[type].canSaveWidget() : true);
	},
	editWidget: function(widget){
		var type = $('#dash-wg-in-type').val();
		// Common
		widget.type = type;
		widget.width = $('#dash-wg-in-width').val();
		widget.height = $('#dash-wg-in-height').val();
		widget.title = $('#dash-wg-in-title').val();
		// Specific
		typeof widgetry[type].editWidget == 'function' ? widgetry[type].editWidget(widget) : null;
		// Show
		widgetry.showWidget(widget);
	},
	showWidget: function(widget){
		var type = widget.type;
		var element = $('#dashContainer .widget').filter(function(index, elmt){ return $(elmt).attr('widgetid') == widget.id; })[0];
		// Create a new if doesn't exist
		if(typeof element == 'undefined'){
			element = document.createElement('div');
			$(element).attr('class', 'widget ' + widget.width + ' ' + widget.height).attr('widgetid', widget.id).append('<div class="widget-content panel panel-default"></div>');
			$('#dashContainer').append(element).packery('addItems', element);
		}
		// Update element content
		$(element).attr('class', 'widget ' + widget.width + ' ' + widget.height);
		$(element).find('.widget-content').empty().append('<div class="show-settings"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><span class="sr-only">Settings</span></div>').find('.show-settings').click(function(){ widgetry.thisDA.showModalWidget(widget); });
		// Show title
		$(element).find('.widget-content').append($('<div class="panel-heading"></div>').text(widget.title));
		// Specific
		typeof widgetry[type].showWidget == 'function' ? widgetry[type].showWidget(widget, element) : null;
	},
	displayWidget: function(widget, dashdisp){
		var type = widget.type;
		var element = $('#dashContainer .widget').filter(function(index, elmt){ return $(elmt).attr('widgetid') == widget.id; })[0];

    var wrapper;

		// Create a new if doesn't exist
		if(typeof element == 'undefined'){
			element = document.createElement('div');
			$(element)
        .attr('class', 'widget ' + widget.width + ' ' + widget.height + ' ' + widget.type + (widgetry[widget.type].maximizable ? ' maximizable' : ''))
        .attr('widgetid', widget.id);

      var header = $('<div class="panel-heading"><span class="title">' + widget.title + '</div>');
      if(widgetry[widget.type].maximizable) {
        var button = $('<button data-toggle="modal" data-target="#maximized-widget" data-widgetid="' + widget.id + '">\
            <span class="glyphicon glyphicon-new-window"></span>\
          </button>');
        header.append($('<div class="toolbar"></div>').append(button));

        // Creating the modal container if necessary
        if($("#maximized-widget").length == 0) {
          $('#dashContainer').append('\
            <div class="modal fade" id="maximized-widget">\
              <div class="modal-dialog modal-fullwidth">\
                <div class="modal-content">\
                  <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
                    <h4 class="modal-title">Title</h4>\
                  </div>\
                  <div class="modal-body">\
                  </div>\
                </div>\
              </div>');

          $("#maximized-widget").on('show.bs.modal', function(event) {
            var modal = $(this);
            var button = $(event.relatedTarget),
                widgetId = button.data('widgetid');

            var widget = dashdisp.dash.widgets.filter(function(widget) { return widget.id == widgetId; })[0];

            $('.modal-title', modal).html(widget.title);
            $('.modal-body', modal)
              .empty()
              .replaceWith('<div class="modal-body widget-content ' + widget.type + '"></div>');
          });

          $("#maximized-widget").on('shown.bs.modal', function(event) {
            var modal = $(this);
            var button = $(event.relatedTarget),
                widgetId = button.data('widgetid');

            var widget = dashdisp.dash.widgets.filter(function(widget) { return widget.id == widgetId; })[0];

            // Replace argument
            if(typeof dashdisp.argObj == 'object'){
              var thisWidget = deepReplace(widget, '\\[' + dashdisp.argObj.code + '\\]', dashdisp.argValue);
            }
            else{
              var thisWidget = widget;
            }

            if(typeof widgetry[widget.type].displayWidget == 'function') {
              widgetry[widget.type].displayWidget(thisWidget, dashdisp, $('.modal-body', modal), true);
            }
          })
        }
      }

      wrapper = $('<div class="widget-content panel panel-default"></div>');
      wrapper.append(header);
      $(element).append(wrapper);

			$('#dashContainer')
        .append(element)
        .packery('addItems', element);
		}
    else {
      wrapper = $(".widget-content", element);
    }


    // Replace argument
    if(typeof dashdisp.argObj == 'object'){
      var thisWidget = deepReplace(widget, '\\[' + dashdisp.argObj.code + '\\]', dashdisp.argValue);
    }
    else{
      var thisWidget = widget;
    }

		// Specific
		typeof widgetry[type].displayWidget == 'function' ? widgetry[type].displayWidget(thisWidget, dashdisp, wrapper) : null;
	}
};

// Filter

widgetry.displayFilterSettings = function(container, reportType){
	container.append('<h5>Filters</h5><textarea class="form-control" rows="4" id="dash-wg-in-filter" style="font-family:monospace;"></textarea>');
	var helper = "<p>This Javascript executable code must return a boolean value. You can use as variables all entry's values: ";
	reportType.columns.forEach(function(col, id){ if(id>0){ helper += ', '; } helper += '<code>entry.' + col.data + '</code>'; });
	helper += ', and the current user login: <code>login</code>.</p>';
	helper += '<p>You can use <a href="http://momentjs.com/docs/" target="_blank">Moment.js</a> to manipulate dates.</p>';
	container.append(helper);
};

widgetry.filter = function(widget, entry){
	// Get user login
	var login = widgetry.thisD.userOptions.login;
	// Evaluate the filter code
	if(typeof widget.filter != "string" || widget.filter == ''){ return true; }
	else{ var cond = eval(widget.filter); return (typeof cond == "boolean" ? cond : true); }
};

// Generalities
$(document).click(function(){
	$('.popover').remove();
});

// Widgets are included after that
