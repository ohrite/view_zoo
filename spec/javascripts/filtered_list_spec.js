describe("FilteredList", function() {
  var viewport, filterBox, cache;

  var template = '\
  <style>\
    .viewport { height: 50px; }\
    .scrollable { overflow-y: scroll; }\
    .viewport li { height: 10px; }\
  </style>\
  <div class="context">\
    <input type="text" />\
    <div class="viewport"></div>\
  </div>\
';

  beforeEach(function() {
    jasmine.fixture().append(template);
    var context = jasmine.fixture().find('.context');
    viewport = $('.viewport', context);
    filterBox = $('input', context);

    cache = new DataCache('jasminetest', {
      url: "earl",
      batchSize: 2,
      queryRequestFormatter: function requestFormatter(request) { return { "keys[]": request }; },
      queryResponseFormatter: function responseFormatter(response) { return response; },
      indexer: function testingIndexer(key, value) {
        return (key + (value || '')).toLowerCase().replace(/ /g, '');
      }
    });
  });

  describe('scrollable list', function() {
    var list;

    beforeEach(function(){
      viewport.addClass('scrollable');
      list = viewport.filteredList({
        scrollable: true,
        filterBox: filterBox,
        selectable: true,
        dataCache: cache,
        selector: '.context .viewport',
        renderMiss: function missRenderer(key){ return $('<li></li>').text(key); },
        renderHit: function hitRenderer(key, value){ return $('<li></li>').text(key + '=' + value); }
      });
    });

    describe('initialization', function() {
      it('should create display list and spacer for scrolling lists', function() {
        expect(viewport.children().length).toEqual(2);
        expect($(viewport.children()[0]).is('div')).toBeTruthy();
        expect($(viewport.children()[1]).is('ul')).toBeTruthy();
      });
    });

    describe('scrolling', function() {
      var pageSize;
      beforeEach(function() {
        expect(list.childHeight).toBeGreaterThan(0);
        _js(50).times(function() { list.keys.push(_js.uniqueId('email_')); });
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();
        pageSize = 5;
      });

      function expectVisiblesToStartWith(expectedOffset) {
        var visibles = _js.map(list.container.children(), function(child){ return $(child).text(); });
        expect(visibles).toEqual(list.keys.slice(expectedOffset, expectedOffset + pageSize + 1));
      }

      it('should compute the first and last elements visible in the select box when scrolled to the top', function() {
        spyOn(list, 'renderItems');
        list.onOffset(0);
        expect(list.renderItems).wasCalledWith(0, 6);
      });

      xit('should show the same elements after scrolling down by less than an element', function() {
        expect(list.container.children().length).toEqual(6);
        list.viewport.scrollTop(list.childHeight / 2);
        expectVisiblesToStartWith(0)
      });

      it('should show the next element after scrolling down an element', function() {
        list.onOffset(1);
        expectVisiblesToStartWith(1);
      });

      it('should show the next page after scrolling down by a page', function() {
        list.onOffset(list.containerItemCapacity);
        expectVisiblesToStartWith(5);
      });

      it('should scroll up by an element', function() {
        list.onOffset(list.containerItemCapacity);
        list.onOffset(list.containerItemCapacity - 1);
        expectVisiblesToStartWith(4);
      });
    });

    describe("selecting items", function() {
      var container;

      beforeEach(function() {
        container = list.container;
        list.keys = ['adin@test.com', 'dva@test.com', 'tri@test.com'];
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();
      });

      it('should copy objects to the selected list when they are clicked', function() {
        container.find('*:first').click();
        expect(list.selected).toEqual(['adin@test.com']);
      });

      it('should remove emails from the selected list when the are deselected', function() {
        list.selected.push('adin@test.com');
        list.selected.push('dva@test.com');

        container.find('li:first').click();

        expect(list.selected).toEqual(['dva@test.com']);
      });

      it('should toggle the selected class on the li', function() {
        expect(container.find('li:first').hasClass('selected')).toBeFalsy();

        container.find('li:first').click();
        expect(container.find('li:first').hasClass('selected')).toBeTruthy();

        container.find('li:first').click();
        expect(container.find('li:first').hasClass('selected')).toBeFalsy();
      });

      it('should persist selected class while scrolling', function () {
        container.find('li:first').click();
        expect(container.find('li:first').is('.selected')).toBeTruthy();

        list.viewport.scroll();

        expect(container.find('li:first').is('.selected')).toBeTruthy();
      });
    });

    describe('filtering', function() {
      var container;

      beforeEach(function() {
        container = list.container;
        list.keys = ['adin@test.com', 'dva@test.com', 'tri@test.com'];
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();
      });

      it("should filter options based on visible text", function() {
        expect(container.find('li').size()).toEqual(3);

        list.filterBox.val("dva").simulate("keyup");
        jasmine.Clock.tick(450);

        expect(container.find('li').size()).toEqual(1);
        expect(container.find('li').text()).toEqual("dva@test.com");

        list.filterBox.val("").simulate("keyup");
        jasmine.Clock.tick(450);

        expect(container.find('li').size()).toEqual(3);
      });

      it('should reset scroll to top of list', function() {
        _js(100).times(function() { list.keys.push(_js.uniqueId('email_')); });
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();

        list.viewport.scrollTop(100);

        list.filterBox.val("one").simulate("keyup");
        jasmine.Clock.tick(450);
        expect(list.viewport.scrollTop()).toEqual(0);
      });

      it('should recalculate height of list on filter', function() {
        spyOn(list.container, 'height');

        list.filterBox.val("one").simulate("keyup");
        jasmine.Clock.tick(450);

        expect(list.container.height).wasCalled();
      });

      it('should clear all highlighted items', function() {
        list.selected = list.keys;
        list.filterBox.val("one").simulate("keyup");
        jasmine.Clock.tick(450);

        expect(list.selected).toBeEmpty();
      });
    });

    describe('ajax updates', function() {
      beforeEach(function() {
        container = list.container;
        list.keys = ['adin@test.com', 'dva@test.com', 'tri@test.com'];
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();
      });

      it('should recreate items that are newly mapped', function() {
        expect(list.container.children('*:first').text()).toEqual("adin@test.com");
        list.dataCache.map({ "adin@test.com": "One in Russian" });
        expect(list.container.children('*:first').text()).toEqual("adin@test.com=One in Russian");
      })
    });
  });

  describe('non-scrollable list', function() {
    var list;

    beforeEach(function(){
      list = viewport.filteredList({
        scrollable: false,
        filterBox: filterBox,
        selectable: true,
        dataCache: cache,
        renderMiss: function missRenderer(key){ return $('<li></li>').text(key) },
        renderHit: function hitRenderer(key, value){ return $('<li></li>').text(key + '=' + value) }
      });
    });

    describe('initialization', function() {
      it('should not create any extra markup', function() {
        expect(viewport.children().length).toEqual(0);
      });
    });

    describe('offsetting', function() {
      beforeEach(function() {
        _js(100).times(function() { list.keys.push(_js.uniqueId('email_')); });
        list.dataCache.lookup(list.keys);
        list.refilter().redraw();
      });

      it('should allow paging forward', function() {
        list.onOffset(20);
        spyOn(list, 'onOffset');
        list.nextPage();
        expect(list.onOffset).wasCalledWith(25);
      });

      it('should allow paging backwards', function() {
        list.onOffset(40);
        spyOn(list, 'onOffset');
        list.previousPage();
        expect(list.onOffset).wasCalledWith(35);
      });

      it('should allow arbitrary page offsets', function() {
        spyOn(list, 'onOffset');
        list.setPage(3);
        expect(list.onOffset).wasCalledWith(15);
      });

      it('should calculate the number of pages for an exact fit', function() {
        expect(list.getPageCount()).toEqual(20);
      });

      it('should calculate the number of pages when the last page is ragged', function() {
        list.keys.splice(17, 100);
        list.onFilter();
        expect(list.getPageCount()).toEqual(4);
      });
    });
  });
});
