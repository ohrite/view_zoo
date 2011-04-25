(function(){
  Backbone.Plugins = Backbone.Plugins || {};
  Backbone.Plugins.FilterableView = Backbone.View.extend({
    filterEl: 'input[type=text]',
    events: {
      "keyup input[type=text]": "filter"
    },

    _configure: function(options) {
      Backbone.Plugins.FilterableView.__super__._configure.call(this, options);
      this._filterState = new Backbone.Model({
        filter: '',
        filtered: _([])
      });
      _.bindAll(this, 'render', 'refilter', 'filter');
      this._filterState.bind('change:filter', this.refilter);
      this._filterState.bind('change:filtered', this.render);
      this.collection.bind('add', this.refilter);
      this.collection.bind('remove', this.refilter);
      this.collection.bind('change', this.render);
    },
    _ensureElement: function() {
      Backbone.Plugins.FilterableView.__super__._ensureElement.call(this);
      if (_.isString(this.filterEl)) {
        this.filterEl = $(this.filterEl);
      }
    },
    refilter: function() {
      var filter = this._filterState.get('filter'),
          terms = filter.split(/\s+/),
          selected = this.collection.select(function(model) {
            var index = model.index || _.values(model.attributes).join('').replace(/\s+/, '').toLowerCase();
            return _.all(terms, function(term){
              return index.indexOf(term) != -1;
            });
          });
      this._filterState.set({
        filtered: selected
      });
    },
    filter: function(e) {
      this._filterState.set({
        filter: this.filterEl.val()
      });
    }
  });
})();