

var Dashboard = function(urlData){
	this.urlData = urlData;
	this.data = [];
	this.openedDashdisp = [];
	this.requestCache = [];
	widgetry.thisD = this;

	var thisD = this;
	$(document).ready(function () {
		// Initialize
		thisD.load();
	});
};

Dashboard.filterFunctions = {
	"business": function(argValue) {
		return function(entry) {
			return (typeof entry.business == "string" ? entry.business.split(" ")[0] == argValue : false);
		};
	},
	"pricer": function(argValue) {
		return function(entry) {
			return entry && (entry.pricer == argValue || entry.pricer2 == argValue || entry.pricer3 == argValue);
		};
	}
};

/*
	---------------
	LOAD
	---------------
*/

Dashboard.prototype.load = function(){
	var thisD = this;
	$.ajax({
		type: "POST",
		url: thisD.urlData,
		data: {type: 'dashboard', request: 'load'},
		dataType: 'json',
		success: function(result){
			thisD.data = result.data;
			thisD.argList = result.argList;
			thisD.user = result.user;
			thisD.userOptions = result.userOptions;
			thisD.reportTypeList = result.reportTypeList;

			for(var i = 0; i < thisD.reportTypeList.length; i++) {
				if(thisD.reportTypeList[i].columns) {
					thisD.reportTypeList[i].columns = buildColumnsFromJSON(thisD.reportTypeList[i].columns, "dashboard");
				}
			}

			thisD.initialize();
		},
		error: function(error, text){
			console.log(error);
			console.log(error.responseText);
		}
	});
};

Dashboard.prototype.initialize = function(){
	var thisD = this;


	var canAccess = function(dash, argValue) {
		if(!dash.accessType) {
			return true;
		}
		else if (typeof dash.access != 'object' || !dash.access.length) {
			return false;
		}

		var accessType,
				access;
		for(var i = 0; i < dash.accessType.length; i++) {
			accessType = dash.accessType[i];

			for(var j = 0; j < dash.access.length; j++) {
				access = argValue ? dash.access[j].replace('[' + dash.arg + ']', argValue) : dash.access[j];
				if(thisD.user[accessType] && thisD.user[accessType].indexOf(access) > -1) {
					return true;
				}
			}
		}

		return false;
	};

	// Typeahead search bar
	thisD.searchTypeahead = [];
	thisD.dashdispList = [];
	thisD.data.forEach(function(dash){


		if(dash.arg == 'none'){
			// Access
			if(canAccess(dash)){
				thisD.searchTypeahead.push(dash.name);
				thisD.dashdispList.push({name: dash.name, dash: dash});
			}
		}
		else{
			// Generate dashdisps
			var argObj = thisD.argList.filter(function(obj){return obj.code == dash.arg;})[0];
			argObj.listData.forEach(function(argValue){
				var name = dash.name.replace('[' + argObj.code + ']', argValue);
				// Access
				if(canAccess(dash, argValue)){
					thisD.searchTypeahead.push(name);
					thisD.dashdispList.push({name: name, dash: dash, argObj: argObj, argValue: argValue});
				}
			});
		}
	});
	
	thisD.searchTypeahead.sort();
	
	$('#dash-search-box').typeahead({
		source: thisD.searchTypeahead,
		minLength: 0,
		autoSelect: false,
		items: 'all',
		updater: function(item){
			thisD.displayDashdispFromName(item);
			$('#dash-search-box').val('').blur();
		}
	});
	$('#dash-search-box').click(function() {
		$(this).typeahead("lookup");
	});

	// Event after "ENTER" in the search bar
	$('#dash-search-box').keyup(function(e){
		if(e.keyCode == 13){
			// Search the corresponding dashdisp
			thisD.displayDashdispFromName($('#dash-search-box').val());
			$('#dash-search-box').val('').blur();
		}
	});

	// Open saved dashdisp
	if(typeof thisD.userOptions.openedDashdisp == 'object'){
		for(var i in thisD.userOptions.openedDashdisp) {
			for(var j  in thisD.dashdispList) {
				if(thisD.dashdispList[j].name == thisD.userOptions.openedDashdisp[i]) {
					this.addTab(thisD.dashdispList[j]);
					this.openedDashdisp.push(thisD.dashdispList[j]);
				}
			}
		}

		if(thisD.userOptions.openedDashdisp.length > 0){
			thisD.displayDashdispFromName(thisD.userOptions.openedDashdisp[0]);
		}
	}

	// Autosave
	thisD.autosave = setInterval(function(){thisD.saveOpenedDashdisp();}, 5000);
	this.modified = false;
};

/*
	---------------
	SAVE
	---------------
*/

Dashboard.prototype.saveOpenedDashdisp = function(){
	var thisD = this;
	if(!thisD.modified){ return true; }
	var list = thisD.openedDashdisp.map(function(obj){ return obj.name; });
	thisD.modified = false;
	$.ajax({
		type: "POST",
		url: thisD.urlData,
		data: {type: 'userOptions', request: 'save', data: {openedDashdisp: list}},
		success: function(result){
			console.log(result);
		}
	});
};

/*
	---------------
	DASHDISP
	---------------
*/

Dashboard.prototype.displayDashdispFromName = function(name){
	var thisD = this;
	var dashdisp = thisD.dashdispList.filter(function(obj){return obj.name == name;})[0];
	if(typeof dashdisp == 'object'){
		// Display the dashdisp
		thisD.displayDashdisp(dashdisp);
	}
};

Dashboard.prototype.displayDashdisp = function(dashdisp){
	var thisD = this;

	// Update the tab bar
	$('#dash-tabs-bar li').attr('class', ''); // Desactivate all tabs
	var alreadyOpen = thisD.openedDashdisp.filter(function(obj){return obj == dashdisp;}).length != 0;
	if(!alreadyOpen){
		// Create a tab
		thisD.addTab(dashdisp);
		thisD.openedDashdisp.push(dashdisp);
		thisD.modified = true;
	}

	// Creating the datasource
	dashdisp.datasource = new DataSource(this.urlData);
	if(dashdisp.argObj && Dashboard.filterFunctions[dashdisp.argObj.code]) {
		dashdisp.datasource.addFilter(Dashboard.filterFunctions[dashdisp.argObj.code](dashdisp.argValue));
	};

	// Activate the tab
	$('#dash-tabs-bar li').filter(
		function(index, element){
			return $(element).find('.dash-tab-name').text() == dashdisp.name;
		})
		.attr('class', 'active');

	var bodyWidth = $('body').width();

	// Launch packery
	var dashContainer = $('#dashContainer');
	dashContainer
		.empty()
		.append('<div class="grid-sizer col-xs-1 height-100" id="grid-sizer"></div>')
		.packery({
			itemSelector: '.widget',
			columnWidth: '.grid-sizer',
			rowHeight: 10,
			gutter: 0,
			transitionDuration: '0s'
		});

	// Display widgets
	if(typeof dashdisp.dash.widgets == 'object'){
		dashdisp.dash.widgets.sort(function(obj1, obj2){return obj1.order - obj2.order;});
		dashdisp.dash.widgets.forEach(function(widget, index){ widgetry.displayWidget(widget, dashdisp); });
	}
	dashContainer.packery();

	// If the scrollbar became visible, relayout to remove gaps
	if($('body').width() != bodyWidth) {
		dashContainer.packery('layout');
	}

	// Mark the dashdisp as current
	thisD.currentDashdisp = dashdisp;
};

Dashboard.prototype.closeDashdisp = function(dashdisp){
	var thisD = this;

	// Search the dashdisp
	var index = thisD.openedDashdisp.indexOf(dashdisp);
	if(index < 0){ return true;}

	// Remove the tab
	$('#dash-tabs-bar li').filter(function(index, element){ return $(element).find('.dash-tab-name').text() == dashdisp.name; }).remove();

	// Remove the dashdisp from opened dashdisp
	thisD.openedDashdisp.splice(index, 1);
	thisD.modified = true;

	// Open another dashdisp if the one about to close is open
	if(thisD.currentDashdisp == dashdisp){
		if(typeof thisD.openedDashdisp[index] == 'object'){ thisD.displayDashdisp(thisD.openedDashdisp[index]); }
		else if(typeof thisD.openedDashdisp[index-1] == 'object'){ thisD.displayDashdisp(thisD.openedDashdisp[index-1]); }
		else{ $('#dashContainer').empty(); }
	}
};

Dashboard.prototype.addTab = function(dashdisp){
	var thisD = this;
	var newTab = $('<li role="presentation"><a href="#"><span class="dash-tab-name"></span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></a></li>');
	newTab.find('.dash-tab-name').text(dashdisp.name);
	newTab.find('a').click(function(){thisD.displayDashdisp(dashdisp);});
	newTab.find('.close').click(function(event){
		event.stopPropagation();
		thisD.closeDashdisp(dashdisp);
		$(document).trigger("click");
	});
	$('#dash-tabs-bar').append(newTab);
};
