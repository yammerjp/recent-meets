chrome.runtime.onMessage.addListener((request, sender, response) => {
  chrome.history.search( { text: "https://meet.google.com/" }, function(historyItems) {
    response(JSON.stringify(historyItems.map(item => item.url)))
  });

  return true
})
