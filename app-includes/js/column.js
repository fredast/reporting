

var Column = function () {
  Object.defineProperty(this, 'context', {
    enumerable: false,
    writable: true,
    value: Column.CONTEXT_DEFAULT
  });
};

Column.CONTEXT_RAW = 'RAW';
Column.CONTEXT_DEFAULT = '_'

// Methods are not enumerable
Object.defineProperties(Column.prototype,
{
  'changeContext': {
    enumerable: false,
    value: function(newContext) {
      this.context = newContext;
      return this;
    }
  },
  'toString': {
    enumerable: false,
    value: function() {
      var str = "{\n";
      for(var i in this) {
        str += "\t" + i + ': ' + JSON.stringify(this[i]) + "\n";
      }
      str += '}';
      return str;
    }
  },
  'formatValue': {
    enumerable: false,
    value: function(val, customFormat) {
      if(this.type == "numeric") {
		var typedVal = this.typeValue(val);
		if(isNaN(typedVal)) {
			return "&mdash;";
		}
        return numeraljs(typedVal).format(customFormat || this.format);
      }
      else if(this.type === "date") {
        return this.typeValue(val).format(customFormat || this.dateFormat);
      }
      else if(this.type === "checkbox") {
        return this.typeValue(val) ? "\u2713" : "\u2717";
      }
      else {
        return val || '';
      }
    }
  },
  'typeValue': {
    enumerable: false,
    value: function(val) {
      if(this.type == "numeric") {
        return parseFloat(val);
      }
      else if (this.type == "date") {
        return moment(val, ["YYYY-MM-DD", "x"]);
      }
      else if (this.type == "checkbox") {
        return val == true || val == 'true';
      }
      else {
        return val || '';
      }
    }
  },
  'unshell': {
    enumerable: false,
    value: function() {
      var ret = {};
      for(var i in this) {
        ret[i] = this[i];
      }
      return ret;
    }
  }
});

var buildColumnFromJSON = function(jsonObject) {
  var propertiesDescriptors = {};

  var getPropertyDescriptor = function(name, value) {
    return {
      configurable: false, // Property cannot be changed or deleted
      enumerable: true, // Property can be iterated on
      // Getter, change value depending on context
      get: function() {
        if(this.context === Column.CONTEXT_RAW) {
          return value;
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          return value[this.context] || value[Column.CONTEXT_DEFAULT];
        }
        else {
          return value;
        }
      },
      set: undefined // No setter, read-only
    };
  };

  for(var i in jsonObject) {
    propertiesDescriptors[i] = getPropertyDescriptor(i, jsonObject[i]);
  }

  var SpecificColumn = function() {
    Column.call(this);
  }
  SpecificColumn.prototype = Object.create(Column.prototype, propertiesDescriptors);
  Object.defineProperty(SpecificColumn.prototype, "constructor", {
    enumerable: false,
    value:SpecificColumn
  });

  return new SpecificColumn();
};

var Columns = function () {
  Array.call(this);
  Object.defineProperty(this, 'length', {enumerable: false, writable: true});
};

Columns.prototype = Object.create(Array.prototype,
  {
    'constructor': {
      value: Columns
    },
    'columnsByData': {
      enumerable: false,
      value: {}
    },
    'column': {
      value: function(dataAttr) {
        return this.columnsByData[dataAttr];
      }
    },
    'push': {
      value: function(newColumn) {
        var overriddenMethod = Array.prototype.push.bind(this);

        // if the object doesn't have a data attribute, it is
        // silently ignored.
        if(!newColumn.data) {
          return this.length;
        }

        this.columnsByData[newColumn.data] = newColumn;
        return overriddenMethod(newColumn);
      }
    },
    'unshell': {
      enumerable: false,
      value: function() {
        return this.map(function(col) { return col.unshell(); });
      }
    }
  });

var buildColumnsFromJSON = function(jsonArray, context) {
  var columns = new Columns(),
      column;
  for(var i = 0; i < jsonArray.length; i++) {
    column = buildColumnFromJSON(jsonArray[i]);
    if(context) {
      column.changeContext(context);
    }
    columns.push(column);
  }
  return columns;
};
