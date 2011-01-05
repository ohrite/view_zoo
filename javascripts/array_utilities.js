// array_utilities.js
// Copyright (c) 2010, 2011 EMI Music.
// https://github.com/emi/filtered_list/raw/master/LICENSE.txt

ArrayUtilities = {
  sortIndex: function(array, find) {
    var low = 0, high = array.length - 1;
    var i, comparison;
    while (low <= high) {
      i = (low + high) >> 1;
      comparison = array[i].localeCompare(find);
      if (comparison < 0) {
        low = i + 1;
        continue;
      }
      if (comparison > 0) {
        high = i - 1;
        continue;
      }
      return i;
    }
    if (comparison < 0) {
      return low;
    } else {
      return high + 1;
    }
  },
  includes: function(array, find) {
    return array[this.sortIndex(array, find)] == find;
  },
  insertSorted: function(array, value) {
    array.splice(this.sortIndex(array, value), 0, value);
    return array;
  },
  removeSorted: function(array, value) {
    var i = this.sortIndex(array, value);
    if (array[i] == value) {
      array.splice(i, 1);
    }
    return array;
  }
};