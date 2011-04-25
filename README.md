# Backbone View Zoo

This assortment of views for Backbone.js demonstrates complex View and 
Collection logic, dependent upon [Underwear.js](http://github.com/ohrite/underwear)
and a bit of cleverness.

These examples are built for LOC brevity and simplicity, not speed, but
their production versions work quite fine.

The original jQuery version of this code can be found here at EMI's
[github page](http://emi.github.com/filtered_list) and
[github repo](http://github.com/emi/filtered_list).

## View Types

The view zoo contains 5 examples of views, including mutations:

  * ### Filterable View
  
    This view accepts `filterEl`, a selector for a text input element.
    The selected input element is monitored for keyup events and sets
    the `filter` attribute on its state model, called `_filterState`.
    
    If the value has changed, the `filtered` attribute is updated by
    selecting matching models from the view's `collection`. The current
    selection mechanism provides an `O(n)` search time.  Faster search
    mechanisms are advisable.
  
  * ### Paginatable Filterable View

    This view mutates the Filterable view to add a pagination manager,
    which can be appropriate for use cases where scrolling is not
    appropriate.  The view accepts a `viewportEl`, which displays the
    output and a `pagerEl` selector, which displays pagination controls.

    It initializes with a passable `length` option, which determines
    how many whole items will be shown at once in the `viewportEl`;
    it defaults to `10`.  This sets the `length` attribute on the
    `_paginationState` model, which tracks internal state.
    
  * ### Scrollable Filterable View
  
    This view mutates the Filterable View to add a scroll manager, a
    critical component for displaying thousand-item lists.  The view
    accepts `viewportEl`, a selector for a container with the `overflow-y`
    CSS rule set to `scroll` or `auto`.
    
    It initializes with a passable `length` option, which determines
    how many whole items will be shown at once in the `viewportEl`;
    it defaults to `10`.  This sets the `length` attribute on the
    `_scrollState` model, which tracks internal state.
    
    When the list is initialized, if `spacerEl` does not exist, then
    `spacerTemplate` is evaluated and made the first child of the
    `viewportEl`. Likewise, if `listEl` does not exist, `listTemplate`
    is evaluated and made the last child of `viewportEl`.
    
    Then, `getSize()` evaluated `listTemplate` with a single dummy
    model inside a dummy collection, which calculates the `clientHeight`
    of an item underneath `listEl`.
    
    When the jQuery `scroll()` event is triggered on `viewportEl`, 
    the inner `spacerEl` is adjusted to offset the top of the list.
    Then, the height of the `listEl` is adjusted to reflect the new
    offset.
    
    When the `filter` event fires, the list is scrolled back to the top.

## To test:
Filtered List uses Jasmine tests and assumes a Ruby environment.

   1. gem install bundler
   1. bundle install
   1. rake jasmine

and now you will be able to run the tests at
[http://localhost:8888](http://localhost:8888)

## MIT License

Copyright (c) 2011 Doc Ritezel

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
