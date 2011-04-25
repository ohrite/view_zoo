(function(){
  Backbone.Plugins = Backbone.Plugins || {};
  Backbone.Plugins.SortedCollection = Backbone.Collection.extend({
    comparator: function(model) {
      return model.id;
    },
    _reset : function(options) {
      this.length = 0;
      this._byId  = {};
      this._byCid = {};
      this.root = null;
    },
    _add : function(model, options) {
      options || (options = {});
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model, {collection: this});
      }
      var already = this.getByCid(model);
      if (already) throw new Error(["Can't add the same model to a set twice", already.id]);
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      if (!model.collection) {
        model.collection = this;
      }
      this.root = _w.insert(this.root, model, this.comparator);
      model.bind('all', this._onModelEvent);
      this.length++;
      if (!options.silent) model.trigger('add', model, this, options);
      return model;
    },
    _remove : function(model, options) {
      options || (options = {});
      model = this.getByCid(model) || this.get(model);
      if (!model) return null;
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      this.root = _w.remove(this.root, model, this.comparator);
      this.length--;
      if (!options.silent) model.trigger('remove', model, this, options);
      this._removeReference(model);
      return model;
    },
    at: function(index) {
      var state = null;
      _w.any(this.root, function(model, position) {
        if (index == position) {
          state = model;
          return true;
        }
      });
      return state;
    },
    pluck : function(attr) {
      return this.map(function(model) { return model.get(attr); });
    },
    chain: function () {
      throw new Error("Chaining disabled.");
    },
    sort: function() {},
    sortBy: function() {},
    sortedIndex: function() {}
  });
    
  // Underwear methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'invoke', 'max', 'min', 'toArray', 'size', 'first', 'rest', 'last', 'without',
    'indexOf', 'lastIndexOf', 'isEmpty', 'search'];

  // Mix in each Underwear method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _w[method].apply(_, [this.root].concat(_.toArray(arguments)));
    };
  });
})();