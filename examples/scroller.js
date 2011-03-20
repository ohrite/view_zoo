  window.ListView = Backbone.Plugins.FilterableScrollableView.extend({
    el: $("#main"),
    listTemplate: _.template($("#item-template").html()),
    statsTemplate: _.template($("#stats-template").html()),
    template: _.template('<div class="spacer"/><div class="list" />'),
    
    events: {
      "keyup #main input": "filter"
    },
    
    initialize: function() {
      this.loaded = 0;
      
      _.bindAll(this, 'refilter', 'redraw', 'render', 'remodel');
      this.viewportEl.html(this.template());
      this._scrollState.set({ height: this.getSize() });
      this.collection.bind('add', this.refilter);
      this.collection.bind('remove', this.refilter);
      this.collection.bind('change:fetched', this.remodel);
      this.collection.bind('change', this.render);
    },
    remodel: function() {
      this.loaded++;
    },
    refilter: function() {
      var filter = this._filterState.get('filter');
      this._filterState.set({
        filtered: this.collection.fulltextSearch(filter)
      });
      this.viewportEl.scrollTop(0);
    },
    render: function() {
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
      
      this.viewportEl.height(height * Math.min(filtered.length, length));
      this.$('.spacer').height(from * height);
      this.$('.list').html(this.listTemplate({
                        collection: _(filtered.slice(from, to))
                      }))
                     .height(height * (filtered.length - from));
    },
    getSize: function() {
      return this.$('.list')
                 .html(this.listTemplate({
                    collection: _([ new Backbone.Model({}) ])
                  }))
                 .select("> *:first")
                 .height();
    }
  });
  
  Backbone.emulateJSON = true;
  Backbone.emulateHTTP = true;
  
  var StubbedModel = Backbone.Model.extend({
    url: './fake_ajax.json'
  });
  
  var StubbedSearchableCollection = Backbone.Plugins.SearchableCollection.extend({
    model: StubbedModel
  });
  
  window.List = new ListView({
    collection: new StubbedSearchableCollection
  });
  
  _.times(50, function(n){ window.List.collection.add({ data: "poop"+n }); });

  var pass = 0, iterator = setInterval(function(){
    var item = window.List.collection.at(pass++);
    if (!item) { return clearInterval(iterator); }
    item.fetch();
  }, 250);
