// data_cache.js
// Copyright (c) 2010, 2011 EMI Music.
// https://github.com/emi/filtered_list/raw/master/LICENSE.txt

function DataCache(name, options) {
  options = options || {};
  $.extend(this, {
    name: name,
    batchSize: options.batchSize || 100,
    url: options.url,
    cache: options.cache || {},

    index: [],
    indexValues: [],

    pendingKeys: null,   // double-linked list in retrieval priority

    subscribers: this.subscribers || [],
    inFlight: false,
    eventName: 'datacache.' + name + '.event',
    queryRequestFormatter: options.queryRequestFormatter,
    queryResponseFormatter: options.queryResponseFormatter || function(response){ return response; },
    indexer: options.indexer,
    ajaxType: options.ajaxType || 'post',
    ajaxDelayMs: options.ajaxDelayMs || 50
  });
}

DataCache.prototype = {
  walk: function() {
    var values = [];
    var previousEl = null;

    for (var el = this.pendingKeys; el; el = el.right) {
      console.assert(el.left == previousEl, el);
      values.push(el.key);
      previousEl = el;
    }
    return values;
  },

  notify: function() {
    for (var s = 0, subscriber; subscriber = this.subscribers[s]; s++) {
      $(subscriber).trigger(this.eventName, this);
    }
  },

  subscribe: function(selector) {
    if(_js.indexOf(this.subscribers, selector) == -1) {
      this.subscribers.push(selector);
    }
  },

  unlinkPendingKey: function(listElement) {
    if (listElement.right) {
      listElement.right.left = listElement.left;
    }
    if (listElement.left) {
      listElement.left.right = listElement.right;
    } else {
      this.pendingKeys = listElement.right;
    }
    return listElement;
  },

  lookup: function(keys) {
    var results = [];

    for (var k = keys.length - 1; k >= 0; k--) {
      var key = keys[k];
      if (key in this.cache) {
        results.unshift({
          value: this.cache[key],
          mapped: true
        });
      } else {
        // Update index
        var indexPosition = ArrayUtilities.sortIndex(this.index, key);

        if (this.index[indexPosition] !== key) {
          var listElement = { key: key, left: null, right: this.pendingKeys };
          if (this.pendingKeys) { this.pendingKeys.left = listElement; }
          this.pendingKeys = listElement;
          this.index.splice(indexPosition, 0, key);
          this.indexValues.splice(indexPosition, 0, {
            search: this.indexer(key),
            node: listElement
          });

        } else {
          var node = this.indexValues[indexPosition].node;
          var listElement = this.unlinkPendingKey(node);
          listElement.left = null;
          listElement.right = this.pendingKeys;
          if (this.pendingKeys) {
            this.pendingKeys.left = listElement;
          }
          this.pendingKeys = listElement;
        }

        results.unshift({
          value: key,
          mapped: false
        });
      }
    }

    this.startQueries();

    return results;
  },

  map: function(mappings) {
    // expects mappings to be { id: value }, not [{id :value}, ..] or {values:[...]}
    var self = this;

    _js.each(mappings, function(mapping, key) {
      self.cache[key] = mapping;

      var indexPosition = ArrayUtilities.sortIndex(self.index, key);

      if (self.index[indexPosition] != key) {
        self.index.splice(indexPosition, 0, key);
        self.indexValues.splice(indexPosition, 0, {
          search: self.indexer(key, mapping),
          node: null
        });
      } else {
        var value = self.indexValues[indexPosition];
        if (value.node !== null) {
          self.unlinkPendingKey(value.node);
          value.node = null;
        }
        value.search = self.indexer(key, mapping);
      }
    });

    self.notify();
  },

  startQueries: function() {
    if (this.inFlight === false) {
      var batch = [];
      for (var count = 0, el = this.pendingKeys; count < this.batchSize && el !== null; count++, el = el.right) {
        batch.push(el.key);
      }

      if (batch.length > 0) {
        this.queryServer(batch);
      }
    }
  },

  queryServer: function(keys) {
    var self = this;
    self.inFlight = true;
    $.ajax({
      url: self.url,
      type: self.ajaxType,
      dataType: "json",
      data: self.queryRequestFormatter(keys),
      success: function(response) {
        self.map(self.queryResponseFormatter(response));
        setTimeout(function(){
          self.inFlight = false;
          self.startQueries();
        }, self.ajaxDelayMs);
      },
      error: function() {
        self.inFlight = false;
      }
    });
  },

  find: function(filterString) {
    filterString = _js.select(filterString.toLowerCase().split(' '), function(string){ return string.length > 0; });

    var indexValuePile = this.indexValues.slice(0);
    var indexPile = this.index.slice(0);

    for (var f = 0, filterTerm; filterTerm = filterString[f]; f++) {
      var keyPile = [], valuePile = [];

      for (var i = 0, indexKey, indexValue; (indexKey = indexPile[i]) && (indexValue = indexValuePile[i]); i++) {
        if (indexValue.search.indexOf(filterTerm) >= 0) {
          keyPile.push(indexKey);
          valuePile.push(indexValue);
        }
      }

      indexPile = keyPile;
      indexValuePile = valuePile;
    }

    return indexPile;
  }

};