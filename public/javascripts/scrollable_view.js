(function(){
  Backbone.Plugins = Backbone.Plugins || {};
  Backbone.Plugins.ScrollableView = Backbone.View.extend({
    viewportEl: $('.viewport'),
    _configure: function(options) {
      Backbone.Plugins.ScrollableView.__super__._configure.call(this, options);
      this._scrollState = new Backbone.Model({
        top: 0,
        length: options.length || 10,
        height: options.height || 10
      });
      _.bindAll(this, 'render', 'rescroll', 'scroll');
      this._scrollState.bind('change:length', this.render);
      this._scrollState.bind('change:height', this.render);
      this._scrollState.bind('change:top', this.rescroll);
    },
    _ensureElement: function() {
      Backbone.Plugins.ScrollableView.__super__._ensureElement.call(this);
      this.viewportEl.scroll(this.scroll);
    },
    rescroll: function() {
      this.render();
    },
    scroll: function(e) {
      var offset = Math.floor(e.target.scrollTop / this._scrollState.get('height'));
      this._scrollState.set({ top: offset });
    }
  });
})();