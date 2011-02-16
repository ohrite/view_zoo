SearchableCollection = Backbone.Collection.extend({
  comparator: function(model) {
    return model.get(model.idAttribute);
  },
  _reset : function(options) {
    Backbone.Collection.prototype._reset.apply(this, arguments);
    // this.models = {};
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
    
    var index = this.comparator ? this.sortedIndex(model, this.comparator) : this.length;
    this.models.splice(index, 0, model);
    
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
    
    this.models.splice(this.indexOf(model), 1);
    
    this.length--;
    if (!options.silent) model.trigger('remove', model, this, options);
    this._removeReference(model);
    return model;
  },
  search: function(filter) {
    var filters = filter.toLowerCase().split(/\s+/);
    
    return _.select(this.models, function(model) {
      var values = _.values(model.attributes).join('').toLowerCase();
      
      return _.all(filters, function(match) {
        return values.indexOf(match) != -1;
      });
    });
  }
});