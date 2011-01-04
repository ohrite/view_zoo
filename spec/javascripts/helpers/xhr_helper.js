function decodeParams(string) {
  var keyValuePairs = string.replace(/\+/g, "%20").split("&");
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
function replaceNextXhr(xhrHash) {
  xhrSpy.andCallFake(function() {
    var newXhr = stubXhr(xhrHash);
    xhrs.push(newXhr);
    return newXhr;
  });
}

function stubXhr(options) {
  var xhr = {
    open: function() {
    },
    setRequestHeader: function() {
    },
    abort: function() {
    },
    readyState: 1,
    status: null,
    send: function() {
    },
    getResponseHeader: function() {
    },
    responseText: null
  };
  $.extend(xhr, options || {});
  return xhr;
}

function simulateAjaxSuccess(responseText, xhr) {
  simulateAjaxResponse(200, responseText, xhr);
}

function simulateAjaxResponse(statusCode, responseText, xhr) {
  xhr = xhr || mostRecentXhr();
  xhr.status = statusCode;
  xhr.responseText = responseText || "";
  xhr.readyState = 4;

  jasmine.Clock.tick(13);
}

function mostRecentXhr() {
  if (xhrs.length == 0) {
    return null;
  }
  return xhrs[xhrs.length - 1];
}
