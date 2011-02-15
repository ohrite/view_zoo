beforeEach(function () {
  jasmine.Clock.useMock();
  jasmine.Clock.reset();

  $.fx.off = true;

  if ($('.fake_dom').length) {
    $('.fake_dom').empty();
  }

  this.addMatchers(new CustomMatchers());
});

afterEach(function () {
  $.fx.off = false;
});

jasmine.fixture = function () {
  if (!$('.fake_dom').length) {
    $("body", document).prepend($('<div></div>').attr("style", "position: fixed; left: 100%").addClass('fake_dom'));
  }
  return $('.fake_dom');
};

function _helper_isObject(arg) {
  return arg != null && typeof(arg) == 'object';
}

function _helper_isArray(arg) {
  return _helper_isObject(arg) && Object.prototype.toString.apply(arg) == '[object Array]';
}

function decodeParams(string_or_object) {
  if(typeof string_or_object !== 'string') {
    return string_or_object;
  }

  var keyValuePairs = string_or_object.replace(/\+/g, "%20").split("&");
  var hash = {};
  $(keyValuePairs).each(function () {
    var equalSplit = this.split("=");
    var key = decodeURIComponent(equalSplit[0]);
    if (hash[key] == null) {
      hash[key] = decodeURIComponent(equalSplit[1]);
    } else if (jQuery.isArray(hash[key])) {
      hash[key].push(decodeURIComponent(equalSplit[1]));
    } else {
      hash[key] = [hash[key]];
      hash[key].push(decodeURIComponent(equalSplit[1]));
    }
  });
  return hash;
}

CustomMatchers = function() {};
CustomMatchers.prototype = {
  toBeEmpty: function() {
    this.message = function() {
      return 'Expected ' + jasmine.pp(this.actual) + (this.isNot ? ' not' : '') + ' to be empty';
    };

    if (this.actual instanceof jQuery) {
      return this.actual.size() == 0
    } else if (_helper_isArray(this.actual)) {
      return this.actual.length == 0;
    } else if (_helper_isObject(this.actual)) {
      // any property means not empty
      for(var property in this.actual) {
        return false;
      }

      return true;
    }

    return false;
  },

  toHaveAjaxData: function(expected) {
    this.message = function() {
      return 'Expected ' + jasmine.pp(decodeParams(this.actual)) + (this.isNot ? ' not' : '') + ' to match ' + jasmine.pp(expected);
    }
    return this.env.equals_(decodeParams(this.actual), expected);
  }
};
