describe("SearchableCollection", function() {
  var collection;
  
  beforeEach(function() {
    collection = new SearchableCollection();
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
  
  describe("#search", function() {
    var model1, model2;
    
    beforeEach(function() {
      model1 = new Backbone.Model({ id: 'alpha', thingo: 'betty' });
      model2 = new Backbone.Model({ id: 'charlie', thingo: 'dingus' });
      collection.add([model1, model2]);
    });

    it("should not match against model keys", function() {
      expect(collection.search('thingo')).toBeEmpty();
    });
    
    it("should accept a search string and return a match", function() {
      expect(collection.search('al')).toEqual([model1]);
    });
    
    it("should accept a multi-term string and return a match", function() {
      expect(collection.search('a e')).toEqual([model1, model2]);
    });
    
    it("should complete a search after a model has changed", function() {
      model1.set({ thingo: 'beefy' });
      expect(collection.search('beefy')).toEqual([model1]);
    });
  });
  
  describe("#add", function() {
    
  });
  
  describe("#change", function() {
    
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

      it("should add 125 keys ploppily quickly", function() { size = 125; });
      it("should add 1250 keys fairly quickly", function() { size = 1250; });
      it("should add 2500 keys sorta quickly", function() { size = 2500; });
      it("should add 5000 keys like quickly", function() { size = 5000; });

      afterEach(function() {
        var t0 = new Date().getTime();
        collection.add(makeArray(size));
        console.log("Elapsed time for addition of", size, "is", (new Date().getTime() - t0), "ms");
      });
    });
    
    describe("#search", function() {
      var size;
      
      function makeTerms(length) {
        var array = [];
        
        function digit(d) { return d % 26; }
        function second(i, d) { return (i - d) / 26; }
        function toChar(c) { return String.fromCharCode('a'.charCodeAt() + c); }
        
        _.times(size, function(i) {
          array.push((second(i, 0) > 1 ? toChar(second(i, digit(i))) : '') + toChar(digit(i)));
        });
        
        return array.join(' ');
      }
      
      beforeEach(function() {
        collection.add(makeArray(5000))
      });
      
      it("should search 5000 keys with 30 terms fairly quickly", function() { size = 30; });
      it("should search 5000 keys with 300 terms fairly quickly", function() { size = 300; });
      
      afterEach(function() {
        var t0 = new Date().getTime(), terms = makeTerms(size);
        collection.search(terms);
        console.log("Elapsed time for search of", size, "is", (new Date().getTime() - t0), "ms");
      });
    });
  });
});
