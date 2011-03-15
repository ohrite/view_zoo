// filtered_list.js
// Copyright (c) 2010, 2011 EMI Music.
// https://github.com/emi/filtered_list/raw/master/LICENSE.txt

function FilteredList(viewport, options) {
  var self = this;

  $.extend(this, {
    viewport: viewport,
    scrollable: options.scrollable || false,
    filterBox: options.filterBox || null,
    selectable: options.selectable || false,
    dataCache: options.dataCache,
    keys: options.keys || [],
    filteredKeys: options.keys ? options.keys.slice(0) : [],
    previousOffset: 0,
    previousCapacity: 0,
    childHeight: 0,
    containerItemOffset: 0,
    containerItemCapacity: 0,
    renderHit: options.renderHit,
    renderMiss: options.renderMiss,
    selector: options.selector || '#' + viewport.attr('id')
  });

  if (this.scrollable) {
    this.spacer = $("<div></div>").appendTo(this.viewport);
    this.container = $("<ul></ul>").appendTo(this.viewport);
  } else {
    this.container = viewport;
  }

  if (this.selectable) {
    this.selected = [];
    this.container.click(function(event) {
      self.onClick(event);
    });
  }

  var loadingEl = $(this.renderMiss("Loading..."));
  this.container.append(loadingEl);
  this.childHeight = $(loadingEl).height();
  this.container.empty();
  this.containerItemCapacity = Math.ceil(this.viewport.height() / this.childHeight);

  if (this.scrollable) {
    viewport.scroll(function() {
      self.onScroll();
      return true;
    });
  }

  var timeout;

  this.filterBox.keydown(function(event) {
    self.onKeyDown(event);
  }).keyup(function(event) {
    event.preventDefault();
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      self.onFilter(event);
    }, 250);
    return false;
  });

  this.dataCache.subscribe(this.selector);
  viewport.bind(this.dataCache.eventName, function() {
    self.refilter().redraw();
  });
}

$.extend(FilteredList.prototype, {
  onScroll: function() {
    this.onOffset(Math.floor(this.viewport.scrollTop() / this.childHeight));
  },

  onKeyDown: function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  },

  onClick: function(event) {
    var item = $(event.target);

    if (event.target != this.container[0]) {
      var key = item.data("key");
      if (!key) {
        item = item.parent();
        key = item.data("key");
      }

      if (ArrayUtilities.includes(this.selected, key)) {
        this.selected = ArrayUtilities.removeSorted(this.selected, key);
        item.removeClass("selected");
      } else {
        this.selected = ArrayUtilities.insertSorted(this.selected, key);
        item.addClass("selected");
      }
    }
  },

  refilter: function() {
    var self = this;
    var filter = this.filterBox.val();
    if (filter == this.filterBox.attr('title')) {
      filter = '';
    }

    var matches = this.dataCache.find(filter);
    matches = matches.sort(function (a, b) { return a.localeCompare(b); });

    this.filteredKeys = _js.select(this.keys, function(key) {
      return ArrayUtilities.includes(matches, key);
    });

    return this;
  },

  onFilter: function() {
    this.refilter();

    if (this.selectable) {
      this.selected = [];
    }

    this.previousOffset = 0;
    this.containerItemOffset = 0;
    this.container.empty();

    this.redraw();
  },

  redraw: function() {
    var self = this;

    if (this.scrollable) {
      this.spacer.height(this.childHeight * this.containerItemOffset);
      this.container.height(this.childHeight * (this.filteredKeys.length - this.containerItemOffset));
    }

    this.previousCapacity = this.containerItemCapacity;
    this.containerItemCapacity = Math.ceil(this.viewport.height() / this.childHeight);

    this.renderItems(this.containerItemOffset, Math.min(this.filteredKeys.length - this.containerItemOffset, this.containerItemCapacity + 1));

    return this;
  },

  renderItems: function (offset, length) {
    var desiredEnd = offset + length - 1;
    var previousEnd = this.previousOffset + this.container.children().length - 1;
    var killCount = previousEnd - desiredEnd;
    var orphanage = this.container.children();

    if (killCount > 0) {
      orphanage.slice(orphanage.length - killCount).remove();
    }

    if (this.previousOffset < offset) {
      this.container.children().slice(0, offset - this.previousOffset).remove();
    }

    var content = this.filteredKeys.slice(offset, offset + length);
    var mappedContent = this.dataCache.lookup(content);
    var prependAnchor = this.container.children('*:first');

    for (var index = 0, obj; obj = mappedContent[index]; index++) {
      var elementOffset = index + offset;
      var orphanageIndex = elementOffset - this.previousOffset;

      if (elementOffset < this.previousOffset) {
        if (prependAnchor.length > 0) {
          prependAnchor.before(this.buildElement(content[index], obj));
        } else {
          this.container.append(this.buildElement(content[index], obj));
        }
      } else if (elementOffset > previousEnd) {
        this.container.append(this.buildElement(content[index], obj));
      } else {
        var extant = $(orphanage[orphanageIndex]);
        if (content[index] != extant.data('key') || obj.mapped != extant.data('mapped')) {
          extant.after(this.buildElement(content[index], obj));
          extant.remove();
        }
      }
    }

    return this;
  },

  buildElement: function(key, obj) {
    var renderFn = obj.mapped ? this.renderHit : this.renderMiss;
    var item = $(renderFn.call(this, key, obj.value));

    item.data('key', key);
    item.data('mapped', obj.mapped ? true : false);

    if (this.selectable) {
      if (ArrayUtilities.includes(this.selected, key)) {
        item.addClass("selected");
      }
    }

    return item;
  },

  onOffset: function(offset) {
    this.previousOffset = this.containerItemOffset;
    this.containerItemOffset = Math.max(0, Math.min(offset, this.filteredKeys.length - this.containerItemCapacity));
    this.redraw();
  },

  nextPage: function() {
    this.onOffset(this.containerItemOffset + this.containerItemCapacity);

    return this;
  },

  previousPage: function() {
    this.onOffset(this.containerItemOffset - this.containerItemCapacity);

    return this;
  },

  setPage: function(page) {
    this.onOffset(this.containerItemCapacity * page);

    return this;
  },

  getPageCount: function() {
    return Math.ceil(this.filteredKeys.length / this.containerItemCapacity);
  },

  acceptSelected: function(selectedKeys) {
    if (!this.selectable) { return; }
    var self = this;

    $.each(selectedKeys, function(_, key) {
      ArrayUtilities.insertSorted(self.keys, key);
    });

    this.onFilter();
  },

  handoffSelected: function(filteredList) {
    if (!this.selectable) { return; }

    var self = this;
    filteredList.acceptSelected(this.selected);

    $.each(this.selected, function(_, key) {
      ArrayUtilities.removeSorted(self.keys, key);
    });

    this.onFilter();
  }
});

jQuery.fn.filteredList = function (options) {
  options = options || {};
  var fl = new FilteredList(this, options);
  fl.redraw();
  return fl;
};
