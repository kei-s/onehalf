function talk(port) {
  port.onMessage.addListener(function(message) {
    console.log(message);
    port.postMessage({status: "client"});
  });
}

chrome.extension.onConnect.addListener(function(port) {
  console.assert(port.name == "nibunnoichi");
  talk(port);
});
chrome.extension.sendRequest({status: "loaded"});
