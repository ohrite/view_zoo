(function(){
  window.ListView = Backbone.Plugins.ScrollableFilterableView.extend({
    el: "#main",
    viewportEl: "#main .viewport",
    listTagName: "div",
    itemTemplate: _.template($("#item-template").html()),
    statsTemplate: _.template($("#stats-template").html()),
    
    events: {
      "keyup #main input": "filter"
    },
    
    initialize: function() {
      this.loaded = 0;
      
      _.bindAll(this, 'render', 'remodel');
      this.collection.bind('change:fetched', this.remodel);
    },
    remodel: function() {
      this.loaded++;
    },
    render: function() {
      window.ListView.__super__.render.call(this);
      var length = this._scrollState.get('length'),
          height = this._scrollState.get('height'),
          top = this._scrollState.get('top'),
          filtered = this._filterState.get('filtered'),
          from = top,
          to = Math.min(filtered.length, top + length + 1);

      this.$(".stats").html(this.statsTemplate({
        filtered: this.collection.length - filtered.length,
        from: from + 1,
        to: to,
        loaded: this.loaded
      }));
    }
  });
  
  Backbone.emulateJSON = true;
  Backbone.emulateHTTP = true;
  
  var StubbedModel = Backbone.Model.extend({
    url: './fake_ajax.json'
  });
  
  var StubbedSortedCollection = Backbone.Plugins.SortedCollection.extend({
    model: StubbedModel
  });
  
  window.List = new ListView({
    collection: new StubbedSortedCollection
  });
  
  _.times(50, function(n){ window.List.collection.add({ data: "poop"+n }); });

  var pass = 0, iterator = setInterval(function(){
    var item = window.List.collection.at(pass++);
    if (!item) { return clearInterval(iterator); }
    item.fetch();
  }, 250);
})();