	chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='https']").eq(0).attr("href");
      console.log(firstHref);
    }
  }
);