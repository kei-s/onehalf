var started = false;
var target;
var port;
var updating = false;
var socket = new io.Socket('localhost',{port: 3000});

socket.on('connect', function() {
  chrome.tabs.getSelected(null,function(currentTab){
    started = true;
    target = currentTab;
    establish(target, target.url);
    disable();
  });
});
socket.on('disconnect', function() {
  started = false;
  target = undefined;
  enable();
});
socket.on('message', function(message) {
  console.log("on socket", message);
  if (message.status != "update") {
    port.postMessage(message);
  }
  if (message.status && message.status == "update") {
    chrome.tabs.update(target.id, {url: message.url}, function(tab) {
      if (tab.id == target.id) {
        updating = true;
      }
    });
  }
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (target && tabId == target.id) {
    if (!updating && changeInfo.status == "loading") {
      send({status: "update", url: changeInfo.url});
    }
    else if (updating && changeInfo.status == "complete") {
      bind(chrome.tabs.connect(target.id, {name: "one-half"}));
      updating = false;
    }
  }
});

function send(message) {
  socket.send(_.extend(message, {origin: socket.transport.sessionid}));
}
function bind(currentPort) {
  port = currentPort;
  port.onMessage.addListener(function(message) {
    send(message);
  });
}
function establish(target, url) {
  bind(chrome.tabs.connect(target.id, {name: "one-half"}));
  send({status: "update", url: url});
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
  socket.disconnect();
}
function start() {
  socket.connect();
}

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.getSelected(null,function(currentTab){
    if (!started && !target) {
      start();
    }
    else if (target && target.id == currentTab.id) {
      finish();
    }
    else if (target) {
      chrome.tabs.update(target.id, {selected: true});
    }
  });
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  if (started && tabId == target.id) {
    disable();
  }
  else if (started) {
    connected();
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
