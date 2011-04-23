var started = false;
var target;
var port;
var channel;
var updating = false;
var socket = new io.Socket('onehalf.libelabo.jp');

socket.on('connect', function() {
  chrome.tabs.getSelected(null,function(currentTab){
    console.log('connect', channel);
    send({status: "connect", channel: channel});
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
  if (!started) {
    return;
  }
  if (message.status != "update") {
    port.postMessage(message);
  }
  if (message.status && message.status == "update") {
    console.log("on socket", message);
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
  port.postMessage({status: "binded", channel: channel, me: socket.transport.sessionid});
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
function start(currentChannel) {
  channel = currentChannel;
  socket.connect();
}

chrome.browserAction.setPopup({popup: 'popup.html'});
chrome.extension.onRequest.addListener(function(request, sender, callback) {
  if (request.status == "popup") {
    if (started) {
      if (target && sender.tab.id == target.id) {
        callback({status: "started", target: "this"});
      }
      else {
        callback({status: "started", target: "other"});
      }
    }
    else {
      callback({status: "stopped"});
    }
    return;
  }
  chrome.tabs.getSelected(null,function(currentTab){
    if (!started && !target && request.status == "start") {
      start(request.channel);
      chrome.browserAction.setPopup({popup: ''});
    }
  });
});
chrome.browserAction.onClicked.addListener(function(tab) {
  if (!started) {
    return;
  }
  else if (target && target.id == tab.id) {
    finish();
    chrome.browserAction.setPopup({popup: 'popup.html'});
  }
  else if (target && target.id != tab.id) {
    chrome.tabs.update(target.id, {selected: true});
    chrome.browserAction.setPopup({popup: ''});
  }
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
