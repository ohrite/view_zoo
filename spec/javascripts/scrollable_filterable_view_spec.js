describe("ScrollableView", function() {
  var collection, view;
  
  beforeEach(function() {
    collection = new Backbone.SearchableCollection();
    view = new Backbone.ScrollableView({ collection: collection });
  });
});