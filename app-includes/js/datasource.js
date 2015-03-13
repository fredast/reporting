
var AssociativeObject = function(leafElement) {
  this.data = {};
  this.leafElement = leafElement;
};

AssociativeObject.prototype.new = function() {
  if(Array.isArray(this.leafElement)) {
    return [];
  }
  else if (typeof this.leafElement == "object") {
    return {};
  }
  else if (typeof this.leafElement == "function") {
    return this.leafElement();
  }
}

AssociativeObject.prototype.get = function(oneOrMoreArguments) {
  var key = Array.prototype.join.call(arguments, ".");
  if(!this.data[key]) {
    this.data[key] = this.new();
  }
  return this.data[key];
};

AssociativeObject.prototype.forEach = function(callback) {
  this.keys().forEach((function(key) {
    callback(this.get.apply(this, key), key);
  }).bind(this));
};

AssociativeObject.prototype.keys = function() {
  var keys = Object.keys(this.data);
  return keys.map(function(key) {
    return key.split(".");
  });
};

var DataSource = function(urlData) {
  this.urlData = urlData;
  this.filters = [];
  this.cache = DataSource.cache;
  this.listeners = new AssociativeObject([]);
};

DataSource.cache = new AssociativeObject({})


DataSource.prototype.addFilter = function(filterFunction) {
  this.filters.push(filterFunction);
};

DataSource.prototype.registerStreamListener = function(streamInfo, listener) {
  var dataType = streamInfo.dataType,
      all = streamInfo.all;

  this.listeners.get(dataType, all).push({
    func: listener,
    lastRequestDate: undefined
  });

  this.fetch(dataType, all);
};

DataSource.prototype.fetch = function(dataType, all) {
  var cacheEntry = this.cache.get(dataType, all);
  if(cacheEntry.pending === undefined || cacheEntry.pending === false) {
    if(cacheEntry.result === undefined) {
      cacheEntry.pending = true;

      $.ajax({
        type: "POST",
        url: this.urlData,
        data: {
    			type: 'report',
    			request: 'load',
    			dataType: dataType,
    			all: all
    		},
        dataType: 'json',
        success: (function(result){
          var currentTime = (new Date()).getTime();

          this.fireListeners(dataType, all, result);

          cacheEntry.lastRequestDate = currentTime;
          cacheEntry.pending = false;
          cacheEntry.result = result;
        }).bind(this),
        error: function(error, text){
          cacheEntry.pending = false;
          console.log(error);
          console.log(error.responseText);
        }
      });
    }
    else {
      this.fireListeners(dataType, all, cacheEntry.result);
    }
  }
};

DataSource.prototype.filterFunction = function(item) {
  for(var i = 0; i < this.filters.length; i++) {
    if(!this.filters[i](item)) {
      return false;
    }
  }
  return true;
};

DataSource.prototype.refresh = function() {
  this.listeners.forEach((function(listeners, key) {
    for(var i in listeners) {
      listeners[i].lastRequestDate = undefined;
    }
    this.fetch.apply(this, key);
  }).bind(this));
};

DataSource.prototype.fireListeners = function(dataType, all, results) {
  var currentTime = (new Date()).getTime(),
      listeners = this.listeners.get(dataType, all);

  var filteredResults = Object.create(results || {});
  if(filteredResults.data) {
    filteredResults.data = filteredResults.data.filter(this.filterFunction.bind(this));
  }

  for(var i = 0; i < listeners.length; i++) {
    if(!listeners[i].lastRequestDate) {
      listeners[i].lastRequestDate = currentTime,
      listeners[i].func(filteredResults);
    }
  }
};
