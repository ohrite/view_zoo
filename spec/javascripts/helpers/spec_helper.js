beforeEach(function () {
  jasmine.Clock.useMock();
  jasmine.Clock.reset();

  $.fx.off = true;
  spyOn(jQuery, 'ajax').andCallThrough();

  if ($('.fake_dom').length) {
    $('.fake_dom').empty();
  }

  xhrs = [];
  xhrSpy = spyOn(jQuery.ajaxSettings, 'xhr');
  xhrSpy.andCallFake(function() {
    var newXhr = stubXhr();
    xhrs.push(newXhr);
    return newXhr;
  });

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
  }
};
