(function(){
  Backbone.Plugins = Backbone.Plugins || {};
  Backbone.Plugins.ScrollableFilterableView = Backbone.Plugins.FilterableView.extend({
    viewportEl: ".viewport",
    spacerTagName: "div",
    listTagName: "ul",
    itemTemplate: _.template("<%collection.each(function(i){%><li><%=i.cid%></li><%});%>"),

    _configure: function(options) {
      console.log("scrollable configure")
      Backbone.Plugins.ScrollableFilterableView.__super__._configure.call(this, options);
      this._scrollState = new Backbone.Model({
        top: 0,
        length: options.length || 10,
        height: 0
      });
      _.bindAll(this, 'render', 'refilter', 'rescroll', 'scroll');
    },
    _ensureElement: function() {
      console.log("scrollable ensure")
      Backbone.Plugins.ScrollableFilterableView.__super__._ensureElement.call(this);
      if (_.isString(this.viewportEl)) {
        this.viewportEl = $(this.viewportEl);
      }
      this.spacerEl = this.make(this.spacerTagName);
      this.listEl = this.make(this.listTagName);
      this.viewportEl.prepend(this.spacerEl).append(this.listEl).scroll(this.scroll);
      this._scrollState.set({ height: this.getSize() });
      this._scrollState.bind('change:top', this.rescroll);
      this._scrollState.bind('change:length', this.rescroll);
      this._scrollState.bind('change', this.render);
    },
    refilter: function() {
      console.log("scrollable refilter")
      Backbone.Plugins.ScrollableFilterableView.__super__.refilter.call(this);
      this.viewportEl.scrollTop(0);
    },
    rescroll: function() {
      console.log("scrollable rescroll")
      var height = this._scrollState.get('height'),
          top = this._scrollState.get('top'),
          filtered = this._filterState.get('filtered').length;
          
      this.viewportEl.height(height * Math.min(filtered, this._scrollState.get('length')));
      this.spacerEl.height(top * height);
      this.listEl.height(height * (filtered - top));
    },
    scroll: function(e) {
      console.log("scrollable rescroll")
      this._scrollState.set({
        top: Math.floor(e.target.scrollTop / this._scrollState.get('height'))
      });
    },
    render: function() {
      Backbone.Plugins.ScrollableFilterableView.__super__.render.call(this);
      var length = this._scrollState.get('length'),
          from = this._scrollState.get('top'),
          filtered = this._filterState.get('filtered'),
          to = Math.min(filtered.length, top + length + 1),
          sliced = filtered.slice(from, to),
          templated = this.itemTemplate({
            collection: _(sliced)
          });
          
      console.log("scrollable render with", this.listEl, sliced, templated)
      $(this.listEl).html(templated);
    },
    getSize: function() {
      console.log("scrollable getSize")
      var h = $(this.listEl).html(this.itemTemplate({
                               collection: _([ new Backbone.Model({}) ])
                             }))
                            .select("> *:first")
                            .height();
      $(this.listEl).empty();
      return h;
    }
  });
})();