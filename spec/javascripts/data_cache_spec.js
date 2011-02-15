describe("DataCache", function() {
  var cache;
  var ajaxDelay = 500;

  beforeEach(function() {
    var content = $("<div class='listener'></div>");
    jasmine.fixture().append(content);
    cache = new DataCache('jasminetest', {
      url: "earl",
      batchSize: 2,
      ajaxDelayMs: ajaxDelay,
      queryRequestFormatter: function requestFormatter(request) { return { "keys[]": request }; },
      queryResponseFormatter: function responseFormatter(response) { return response; },
      indexer: function testingIndexer(key, value) {
        return (key + (value || '')).toLowerCase().replace(/ /g, '');
      }
    });
  });

  describe("#lookup", function() {
    it('should return the key when there is no mapping', function() {
      expect(cache.lookup(['missing'])).toEqual([{value:'missing', mapped:false}]);
    });

    it('should return the value when there is a mapping', function() {
      cache.map({found: "Kelly's Mom"});
      expect(cache.lookup(['found'])).toEqual([{value:"Kelly's Mom", mapped:true}]);
    });

    it('should invoke #startQueries on a cache miss', function() {
      spyOn(cache, 'startQueries');
      cache.lookup('missing');
      expect(cache.startQueries).wasCalled();
    });
  });

  describe('#queryServer', function() {
    it('should ajax for missing addresses', function() {
      cache.queryServer(['foo']);

      var ajaxRequest = mostRecentAjaxRequest();
      expect(ajaxRequest).not.toBe(null);
      expect(ajaxRequest.params).toHaveAjaxData({'keys[]': 'foo'}); //'keys%5B%5D=foo');
      expect(ajaxRequest.method.toLowerCase()).toEqual('post');
      expect(ajaxRequest.url).toEqual(cache.url);

      simulateAjaxSuccess({ foo: 'but I HATE foo'});

      expect(cache.lookup(['foo'])).toEqual([{value:'but I HATE foo', mapped:true}]);
    });

    it('should trigger the listener after a query completes', function() {
      var triggered = false;
      $('body').bind(cache.eventName, function(){ triggered = true; });
      cache.subscribe('body');
      cache.queryServer(['foo']);
      expect(triggered).toBeFalsy();
      simulateAjaxSuccess({ foo: 'but I HATE foo' });
      expect(triggered).toBeTruthy();
    });

    it('should update the search criteria with the returned item', function() {
      expect(cache.find('but')).toEqual([]);
      cache.lookup(['foo', 'bar', 'baz']);
      simulateAjaxSuccess({ foo: 'but I HATE foo' });
      expect(cache.find('but')).toEqual(['foo']);
    });
  });

  describe('#startQueries', function() {
    beforeEach(function() {
      cache.lookup(['gargling', 'whiskey', 'kelly']);
    });

    it('should disallow multiple simultaneous in-flight queries', function() {
      expect(ajaxRequests.length).toEqual(1);
      cache.startQueries();
      expect(ajaxRequests.length).toEqual(1);
    });

    it('should only fetch batchSize records in a call', function() {
      var found = 0;
      var ajaxRequest = mostRecentAjaxRequest();
      expect(ajaxRequest).not.toBe(null);
      expect(ajaxRequest.params).toHaveAjaxData({ 'keys[]': ['gargling', 'whiskey'] })
    });

    it('should submit the next batch', function() {
      expect(ajaxRequests.length).toEqual(1);
      simulateAjaxSuccess({ gargling: 'often', whiskey: 'sure' });
      jasmine.Clock.tick(ajaxDelay);

      expect(ajaxRequests.length).toEqual(2);
      simulateAjaxSuccess({ kelly: 'cookies' });
      jasmine.Clock.tick(ajaxDelay);

      expect(ajaxRequests.length).toEqual(2);
    });

    it('should respect the ajax delay', function() {
      simulateAjaxSuccess({ gargling: 'often', whiskey: 'sure' });
      jasmine.Clock.tick(ajaxDelay / 2);
      cache.startQueries();
      expect(ajaxRequests.length).toEqual(1);
    });
  });

  describe('missing key prioritization', function() {
    var remainingKey;
    beforeEach(function() {
      cache.lookup(['gargling', 'whiskey', 'kelly']);
    });

    it('should load keys in the specified order', function() {
      expect(ajaxRequests.length).toEqual(1);
      expect(mostRecentAjaxRequest().params).toHaveAjaxData({'keys[]': ['gargling', 'whiskey']});
    });

    it('should prioritize based on the most recent lookup', function() {
      cache.lookup(['third']);
      cache.lookup(['second']);
      cache.lookup(['first']);
      simulateAjaxSuccess({});
      jasmine.Clock.tick(ajaxDelay);
      expect(ajaxRequests.length).toEqual(2);
      expect(mostRecentAjaxRequest().params).toHaveAjaxData({'keys[]': ['first', 'second']});
    });

    it('should reprioritize keys already in the queue', function() {
      cache.lookup(['third']);
      cache.lookup(['gargling']);
      cache.lookup(['kelly']);
      simulateAjaxSuccess({});
      jasmine.Clock.tick(ajaxDelay);
      expect(ajaxRequests.length).toEqual(2);
      expect(mostRecentAjaxRequest().params).toHaveAjaxData({'keys[]': ['kelly', 'gargling']});

      simulateAjaxSuccess({ gargling: 'often', kelly: 'sure' });
      jasmine.Clock.tick(ajaxDelay);
      expect(ajaxRequests.length).toEqual(3);
      expect(mostRecentAjaxRequest().params).toHaveAjaxData({'keys[]': ['third', 'whiskey']});

      simulateAjaxSuccess({ third: 'often', whiskey: 'sure' });
      jasmine.Clock.tick(ajaxDelay);
      expect(ajaxRequests.length).toEqual(3);
    });

    describe('insertion performance', function() {
      var size;

      it('should insert 10 records in like no time at all', function() { size = 10; });

      it('should insert 1250 records in like no time at all', function() { size = 1250; });

      it('should insert 2500 records in like no time at all', function() { size = 2500; });

      it('should insert 5000 records and have some time on the clock', function() { size = 5000; });

      afterEach(function() {
        if(typeof console === 'object') {
          var keys = [];
          for(var i = 0; i < size; i++) {
            keys.push("test" + i + "@example.com");
          }

          var t0 = new Date().getTime();
          cache.lookup(keys);
          console.log("Elapsed time for lookup of", size, "is", (new Date().getTime() - t0), "ms");
        }
      });
    });

  });

  describe('#find', function() {
    beforeEach(function() {
      cache.map({
        'sea': "Seattle",
        'lax': "Los Angeles",
        'sfo': "San Francisco",
        'phl': "Philadelphia"
      });
      cache.lookup(['iad', 'bwi']);
      jasmine.Clock.tick(10);
    });

    it('should return matching value elements', function() {
      var result = cache.find('el');

      $.each(['lax', 'phl'], function(_, key) {
        expect(result).toContain(key);
      });
    });

    it('should allow matching multiple search terms', function() {
      var result = cache.find('el os');

      $.each(['lax'], function(_, key) {
        expect(result).toContain(key);
      });
    });

    it('should return matching key elements', function() {
      expect(cache.find('bw')).toEqual(['bwi']);
    });

    it('should return all elements on an empty search', function() {
      var results = cache.find('');
      
      $.each(['sea', 'lax', 'sfo', 'phl', 'iad', 'bwi'], function(_, key) {
        expect(results).toContain(key);
      });
    });

    it('should return an empty array on a non-matching search', function() {
      expect(cache.find('class')).toBeEmpty();
    });
  });
});
