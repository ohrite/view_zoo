(function(){
  Backbone.Plugins.FilterableScrollableView = Backbone.Plugins.ScrollableView.extend({
    filterEl: $('input[type=text]'),

    _configure: function(options) {
      Backbone.Plugins.FilterableScrollableView.__super__._configure.call(this, options);
      this._filterState = new Backbone.Model({
        filter: this.filterEl.val(),
        filtered: _([])
      });
      _.bindAll(this, 'render', 'refilter', 'filter');
      this._filterState.bind('change:filter', this.refilter);
      this._filterState.bind('change:filtered', this.render);
    },
    _ensureElement: function() {
      Backbone.Plugins.FilterableScrollableView.__super__._ensureElement.call(this);
      this.filterEl.keyup(this.filter);
    },
    refilter: function() {},
    filter: function(e) {
      this._filterState.set({ filter: this.filterEl.val() });
    }
  });
})();