var port;
var listener = {
  mousemove: function(event) {
    post('mousemove', {x: event.clientX, y: event.clientY});
  },
  scroll: function(event) {
    post('scroll', {x: window.scrollX, y: window.scrollY});
  }
};
var action = {
  mousemove: function(data) {
    console.log('mousemove',data.origin,data)
  },
  scroll: function(data) {
    console.log('scroll',data.origin,data)
  }
};
function post(name, data) {
  port.postMessage({event: name, data: data});
}
function talk(currentPort) {
  port = currentPort;
  port.onMessage.addListener(function(message) {
    console.log(message);
    if (action[message.event]) {
      action[message.event](message.data);
    }
  });
  for (var key in listener) {
    window.addEventListener(key, listener[key]);
  }
  port.onDisconnect.addListener(function() {
    for (var key in listener) {
      window.removeEventListener(key, listener[key]);
    }
  });
}

chrome.extension.onConnect.addListener(function(port) {
  console.assert(port.name == "nibunnoichi");
  talk(port);
});
