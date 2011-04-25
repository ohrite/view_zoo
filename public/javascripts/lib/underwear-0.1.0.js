/*
 * Underwear.js 0.1.0
 * (c) 2011 Eric "Doc" Ritezel
 * Undertree is freely distributable under the MIT license.
 * Portions of Undertree are inspired or borrowed from Underscore,
 * especially this sentence. The tree implementation was planted
 * by Arne Andersson.
 *
 * For more information:
 * http://github.com/ohrite/underwear
 */

(function() {
  var root = this;
  
  var previousUnderwear = root._w;
  
  var breaker = {};
  var _w = {};
  
  if (typeof value !== 'undefined' && module.exports) {
    module.exports = _w;
    _w._w = _w;
  } else {
    root._w = _w;
  }
  
  _w.VERSION = '0.1.0';
  
  _w.noConflict = function() {
    root._w = previousUnderwear;
    return this;
  };
  
  function Node(data, level) {
    this.level = level || 0;
    this.data = data || null;
    this.left = null;
    this.right = null;
  }
  
  function skew(node) {
    if (node !== null && node.left !== null && node.level == node.left.level) {
      var left = node.left;
      node.left = left.right;
      left.right = node;
      return left;
    }
    
    return node;
  }
  
  function split(node) {
    if (node !== null && node.right !== null && node.right.right !== null && node.level == node.right.right.level) {
      var right = node.right;
      node.right = right.left;
      right.left = node;
      right.level++;
      return right;
    }
    
    return node;
  }
  
  _w.insert = function(root, value, comparator, context) {
    var node = root, stack = [], parent;
    comparator = comparator || _.identity;
    
    if (!root || root === null) {
      return new Node(value, 1);
    }

    while (true) {
      stack.push(node);

      if (comparator.call(context, value) < comparator.call(context, node.data)) {
        if (node.left === null) {
          node.left = new Node(value, 1);
          break;
        } else {
          node = node.left;
        }
      } else {
        if (node.right === null) {
          node.right = new Node(value, 1);
          break;
        } else {
          node = node.right;
        }
      }
    }
    
    while (stack.length > 1) {
      node = stack.pop();
      
      if (stack.length > 0) {
        parent = stack[stack.length - 1];
        
        if (parent.left === node) {
          parent.left = split(skew(parent.left));
        } else {
          parent.right = split(skew(parent.right));
        }
      }
    }
    
    return split(skew(root));
  };
  
  _w.remove = function(root, value, comparator, context) {
    var node = root, stack = [], target, parent;
    comparator = comparator || _.identity;

    while (true) {
      if (node === null) { return root; }
      
      stack.push(node);
      if (node.data == value) { break; }
      
      if (comparator.call(context, value) < comparator.call(context, node.data)) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    
    if (node.left === null || node.right === null) {
      stack.pop();
      
      if (stack.length > 0) {
        parent = stack[stack.length - 1];

        if (parent.left === node) {
          parent.left = node.left || node.right;
        } else {
          parent.right = node.left || node.right;
        }
      } else {
        root = node.right || node.left;
      }
    } else {
      var heir = node.left;
      var prev = node;
      
      while (heir.right !== null) {
        stack.push(prev = heir);
        heir = heir.right;
      }
      
      node.data = heir.data;
      
      if (prev === node) {
        prev.left = heir.right;
      } else {
        prev.right = heir.right;
      }
    }
    
    
    while (stack.length > 0) {
      node = stack.pop();
      
      if (stack.length > 0) {
        parent = stack[stack.length - 1];
      }
      
      if ((node.left  && node.left.level  < node.level - 1) ||
          (node.right && node.right.level < node.level - 1)) {
        node.level--;
        if (node.right && node.right.level > node.level) {
          node.right.level = node.level;
        }
        
        node = skew(node);
        node.right = skew(node.right);
        if (node.right) {
          node.right.right = skew(node.right.right);
        }
        node = split(node);
        node.right = split(node.right);
        
        if (stack.length > 0) {
          if (parent.left === node) {
            parent.left = node;
          } else {
            parent.right = node;
          }
        } else {
          root = node;
        }
      }
    }
    return root;
  };
  
  var each = _w.each = _w.forEach = function(node, iterator, context) {
    var index = 0, stack = [];
    if (node === null) { return; }
    while (stack.length > 0 || node !== null) {
      if (node !== null) {
        stack.push(node);
        node = node.left;
      } else {
        node = stack.pop();
        if (iterator.call(context, node.data, index++, node) === breaker) {
          break;
        }
        node = node.right;
      }
    }
  };
    
  var reverse = _w.reverse = function(node, iterator, context) {
    var index = 0, stack = [];
    if (node === null) { return; }
    while (stack.length > 0 || node !== null) {
      if (node !== null) {
        stack.push(node);
        node = node.right;
      } else {
        node = stack.pop();
        if (iterator.call(context, node.data, index++, node) === breaker) { break; }
        node = node.left;
      }
    }
  };
  
  _w.preorder = function (node, iterator, context) {
    var index = 0, stack = [node];
    if (node === null) { return; }
    while (stack.length > 0) {
      node = stack.pop();
      if (node.right !== null) {
        stack.push(node.right);
      }
      if (node.left !== null) {
        stack.push(node.left);
      }
      if (iterator.call(context, node.data, index++, node) === breaker) { break; }
    }
  };
  
  _w.map = function(tree, iterator, context) {
    var results = [];
    each(tree, function(value, index, tree) {
      results.push(iterator.call(context, value, index, tree));
    });
    
    return results;
  };
  
  _w.reduce = _w.foldl = _w.inject = function(tree, iterator, memo, context) {
    var initial = memo !== void 0;
    each(tree, function(value, index, tree) {
      if (!initial && index === 0) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, tree);
      }
    });
    if (!initial) { throw new TypeError("Reduce of empty tree with no initial value"); }
    return memo;
  };
  
  _w.reduceRight = _w.foldr = function(tree, iterator, memo, context) {
    var initial = memo !== void 0;
    reverse(tree, function(value, index, tree) {
      if (!initial && index === 0) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, tree);
      }
    });
    if (!initial) { throw new TypeError("Reduce of empty tree with no initial value"); }
    return memo;
  };
  
  _w.find = _w.detect = function(tree, iterator, context) {
    var result;
    any(tree, function(value, index, tree) {
      if (iterator.call(context, value, index, tree)) {
        result = value;
        return true;
      }
    });
    return result;
  };
  
  _w.filter = _w.select = function(tree, iterator, context) {
    var results = [];
    if (tree === null) { return results; }
    each(tree, function(value, index, tree) {
      if (iterator.call(context, value, index, tree)) {
        results.push(value);
      }
    });
    return results;
  };
  
  _w.reject = function(tree, iterator, context) {
    var results = [];
    if (tree === null) { return results; }
    each(tree, function(value, index, tree) {
      if (!iterator.call(context, value, index, tree)) {
        results.push(value);
      }
    });
    return results;
  };
  
  _w.every = _w.all = function(tree, iterator, context) {
    iterator = iterator || _.identity;
    var result = true;
    if (tree === null) { return result; }
    each(tree, function(value, index, tree) {
      result = result && iterator.call(context, value, index, tree);
      if (!result) { return breaker; }
    });
    return result;
  };
  
  var any = _w.some = _w.any = function(tree, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (tree === null) { return result; }
    each(tree, function(value, index, tree) {
      result = iterator.call(context, value, index, tree);
      if (result) { return breaker; }
    });
    return result;
  };
  
  _w.include = _w.contains = function(tree, target) {
    var found = false;
    if (target === null) { return found; }
    any(tree, function(value) {
      found = (value === target);
      if (found) { return true; }
    });
    return found;
  };
  
  _w.invoke = function(tree, method) {
    var args = Array.prototype.slice.call(arguments, 2);
    return _w.map(tree, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };
  
  _w.pluck = function(tree, key) {
    return _w.map(tree, function(value){ return value[key]; });
  };
  
  _w.max = function(tree, iterator, context) {
    if (!iterator) { return _w.last(tree); }
    var result = { computed: -Infinity };
    each(tree, function(value, index, list) {
      var computed = iterator.call(context, value, index, list);
      if (computed >= result.computed) {
        result.value = value;
        result.computed = computed;
      }
    });
    return result.value;
  };
  
  _w.min = function(tree, iterator, context) {
    if (!iterator) { return _w.first(tree); }
    var result = {computed: Infinity};
    each(tree, function(value, index, list) {
      var computed = iterator.call(context, value, index, list);
      if (computed < result.computed) {
        result.value = value;
        result.computed = computed;
      }
    });
    return result.value;
  };
  
  _w.toArray = function(tree) {
    if (!tree) { return []; }
    return _w.values(tree);
  };
  
  _w.size = function(tree) {
    var size = 0;
    if (!tree) { return size; }
    each(tree, function() { size++; });
    return size;
  };
  
  _w.first = _w.head = function(tree, n, guard) {
    var results = [];
    if (!tree) { return results; }
    if (n === undefined || !!guard) {
      while (tree.left !== null) { tree = tree.left; }
      return tree.data;
    }
    each(tree, function(value, index) {
      if (n <= index) { return breaker; }
      results.push(value);
    });
    return results;
  };
  
  _w.last = function(tree) {
    if (!tree) { return null; }
    while (tree.right !== null) { tree = tree.right; }
    return tree.data;
  };
  
  _w.rest = _w.tail = function(tree, n, guard) {
    var results = [], start = _.isUndefined(n) || guard ? 1 : n;
    if (!tree) { return results; }
    if (start === 0) { return _w.toArray(tree); }
    each(tree, function(value, index) {
      if (start <= index) {
        results.push(value);
      }
    });
    return results;
  };
  
  _w.without = function(tree) {
    var values = Array.prototype.slice.call(arguments, 1);
    return _w.filter(tree, function(value) { return !_.include(values, value); });
  };
  
  _w.indexOf = function(tree, item) {
    var position = -1;
    if (tree === null) { return position; }
    each(tree, function(value, index) {
      if (value == item) {
        position = index;
        return breaker;
      }
    });
    return position;
  };
  
  _w.lastIndexOf = function(tree, item) {
    var position = -1;
    if (tree === null) { return position; }
    reverse(tree, function(value, index) {
      if (value == item) {
        position = index;
        return breaker;
      }
    });
    return position;
  };
  
  _w.isEmpty = function(tree) {
    return tree === null || tree.level === 0;
  };
  
  _w.values = function(tree) {
    var result = [];
    if (tree === null) { return result; }
    each(tree, function(value) {
      result.push(value);
    });
    return result;
  };
  
  _w.search = function(tree, comparator, context) {
    if (tree === null || !comparator) { return null; }
    while (tree.level !== 0) {
      var comparison = comparator.call(context, tree.data);
      if (comparison === 0) {
        return tree.data;
      } else if (comparison < 0) {
        tree = tree.left;
      } else {
        tree = tree.right;
      }
    }
    return null;
  };
})();