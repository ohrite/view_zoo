describe("SortedCollection", function() {
  var collection;
  
  beforeEach(function() {
    collection = new Backbone.Plugins.SortedCollection();
  });
  
  describe("Backbone.Collection compatibility", function() {
    var model;
    
    beforeEach(function() {
      model = new Backbone.Model({ id: 'alpha', thingo: 'betty' });
      collection.add(model);
    });
    
    it("should add and remove a model", function() {
      expect(collection.at(0)).toEqual(model);
      collection.remove(model);
      expect(collection.length).toEqual(0);
    });

    it("should find a model", function() {
      expect(collection.find(function(obj) { return obj.get('thingo') == model.get('thingo'); })).toEqual(model);
    });

    it("should return undefined when fetching a non-existent model", function() {
      expect(collection.find(function(obj) { return obj.get('thingo') == 'gonzo'; })).toBeUndefined();
    });
  });
  
  describe("speed", function() {
    function makeArray(size) {
      var array = [];

      _.times(size, function(i) {
        array.push({ id: 'testa-' + i, thingo: 'cles-' + (size - i) });
      });
      
      return array;
    }
    
    describe("#add", function() {
      var size;

      it("should add 125 keys almostly quickly", function() { size = 125; });
      it("should add 1250 keys fairly quickly", function() { size = 1250; });
      it("should add 2500 keys sorta quickly", function() { size = 2500; });
      it("should add 10000 keys like quickly", function() { size = 10000; });

      afterEach(function() {
        var t0 = new Date().getTime();
        collection.add(makeArray(size));
        console.log("Elapsed time for addition of", size, "is", (new Date().getTime() - t0), "ms");
      });
    });
  });
});
