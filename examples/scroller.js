$(function() {
  window.Items = new Backbone.SearchableCollection();
  
  window.ListView = Backbone.View.extend({
    el: $("#main"),
    listTemplate: _.template($("#list-template").html()),
    statsTemplate: _.template($("#stats-template").html()),
    template: _.template('<div class="spacer"/><ul />'),
    
    events: {
      "keyup #main input": "filter"
    },
    
    initialize: function() {
      _.bindAll(this, 'render', 'filter', 'scroll');
      this.$(".viewport").html(this.template());
      this.state = new Backbone.Model({
        top: 0,
        length: this.options.size || 10,
        height: this.getSize(),
        filter: ''
      });
      console.log('filtered', Items.toArray())
      this.$('.viewport').scroll(this.scroll);
      this.state.bind('change', this.render);
      Items.bind('all', this.render);
    },
    getSize: function() {
      var height, test = new Backbone.Model({id:0});
      
      this.$('ul').html(this.listTemplate({collection: _([test])}));
      height = this.$('ul li:first').height();
      this.$('ul').empty();
      
      return height;
    },
    render: function() {
      var length = this.state.get('length'),
          height = this.state.get('height'),
          filtered = Items.fulltextSearch(this.state.get('filter')),
          top = this.state.get('top');
          
      this.$(".stats").html(this.statsTemplate({
        filtered: Items.length - filtered.length,
        from: top + 1,
        to: Math.min(filtered.length, top + length),
        loaded: 0
      }));
      
      this.$('ul').height(height * Math.min(filtered.length, length))
                  .html(this.listTemplate({ collection: _(filtered) }));
    },
    filter: function(e) {
      this.state.set({ filter: e.target.value });
    },
    scroll: function(e) {
      this.state.set({top: Math.floor(e.target.scrollTop / this.state.get('height'))});
    }
  });
  
  window.List = new ListView();
  
  _.times(12, function(n){ Items.add({ data: "poop"+n }); });
  
});