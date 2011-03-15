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
        size: this.options.size || 10,
        height: this.getSize()
      });
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
      var size = Items.size();
      this.$(".stats").html(this.statsTemplate({
        total: Items.length,
        filtered: size,
        from: this.state.get('top'),
        to: Math.min(size, this.state.get('top') + this.state.get('size')),
        ajax: 0
      }));
      this.$('ul').height(this.state.get('height') * Math.min(size, this.state.get('size')))
                  .html(this.listTemplate({collection: Items}));
    },
    filter: function() {
      console.log("filtering!", arguments);
    },
    scroll: function() {
      console.log("scrolling!", arguments)
    }
  });
  
  window.List = new ListView();
});