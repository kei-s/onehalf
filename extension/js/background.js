var started = false;
var target;
var socket = new io.Socket('localhost',{port: 3000});

chrome.extension.onRequest.addListener(function(request, sender, response){
  if (started && sender.tab.id == target.id) {
    establish(target);
  }
});
function establish(target) {
  socket.connect();
  var port = chrome.tabs.connect(target.id, {name: "nibunnoichi"});
  port.postMessage({started: true});
  port.onMessage.addListener(function(message) {
    console.log(message);
  });
  port.onDisconnect.addListener(function(message) {
    console.log("disconnect", message);
  });
}
function connected() {
  chrome.browserAction.setIcon({path: "connected.png"})
}
function enable() {
  chrome.browserAction.setIcon({path: "enable.png"})
}
function disable() {
  chrome.browserAction.setIcon({path: "disable.png"})
}
function finish() {
  started = false;
  target = undefined;
  enable();
}
function start(currentTab) {
  started = true;
  target = currentTab;
  establish(target);
  connected();
}

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.getSelected(null,function(currentTab){
    if (!started && !target) {
      start(currentTab);
    }
    else if (target && target.id == currentTab.id) {
      finish();
    }
  });
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  if (started && tabId == target.id) {
    connected();
  }
  else if (started) {
    disable();
  }
  else {
    enable();
  }
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (started && tabId == target.id) {
    finish();
  }
});
