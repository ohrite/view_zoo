beforeEach(function () {
  clearAjaxRequests();
  spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
    var newXhr = new FakeXMLHttpRequest();
    ajaxRequests.push(newXhr);
    return newXhr;
  });
});

function simulateAjaxSuccess(responseText, xhr) {
  simulateAjaxResponse(200, responseText, xhr);
}

function simulateAjaxResponse(statusCode, responseText, xhr) {
  xhr = xhr || mostRecentAjaxRequest();
  xhr.response({
    status: statusCode,
    contentType: 'application/json',
    responseText: responseText || ""
  });
  jasmine.Clock.tick(13); // jquery-1.3 compatibility
}
