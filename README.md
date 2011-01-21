Filtered List is a jquery plugin that allows for scrolling and filtering
of very large lists of items. It allows for the initial data summary
to be simple, with richer (i.e. more expensive to retrieve) descriptions
of each item fetched on demand. For example, you might start with a page
that has a list of email addresses on it, and then asynchronously perform
a lookup that returns the user's full name, phone extension, etc. The
filtering works with whatever information is currently available.

The [API and Examples](http://emi.github.com/filtered_list) are on
Filtered List's [github page](http://emi.github.com/filtered_list).

## Features:
   * remains very fast even with thousands of items
   * items can be filtered by search terms
   * items can be asynchronously fleshed out
   * the most recently requested items are fetched first

## Limitations:
   * assumes that all rendered items have the same height
   * attempts to load all items (is not fully lazy)
   * does not support paging yet, just scrolling


## To test:
Filtered List uses Jasmine tests and assumes a Ruby environment.

   1. gem install bundler
   1. bundle install
   1. rake jasmine

and now you will be able to run the tests at http://localhost:8888/

## Alternative plugins:

### [FlatListWidget](http://plugins.jquery.com/project/FlatListWidget)
Supports paging, works well with static content. Uses jQuery UI to create
buttons. Simpler than Filtered List, which is a good thing unless you
really need a feature of Filtered List.
[demo](http://materio.fabicutv.com/flatlistwidget/demo.html)

### [SlickGrid](https://github.com/mleibman/SlickGrid)
This is geared towards being a spreadsheet, and includes editable cells.
It uses similar approaches towards only showing the browser what it needs
to know in order to keep rendering speed excellent.
[demo](https://github.com/mleibman/SlickGrid/wiki/Examples)
