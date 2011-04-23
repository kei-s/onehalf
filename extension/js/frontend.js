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
  mousemove: function(origin,data) {
    console.log('mousemove',origin,data)
  },
  scroll: function(origin,data) {
    console.log('scroll',origin,data)
  }
};
function setChannel(channel) {
  var span = document.createElement('span');
  span.textContent = channel;
  span.setAttribute('style', 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; background-color: rgba(255, 255, 255, 0.75); border-radius: 5px;');
  document.body.appendChild(span);
}
function post(name, data) {
  port.postMessage({event: name, data: data});
}
function talk(currentPort) {
  port = currentPort;
  port.onMessage.addListener(function(message) {
    if (message.status == "binded") {
      setChannel(message.channel);
    }
    else if (action[message.event]) {
      action[message.event](message.origin,message.data);
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
  console.assert(port.name == "one-half");
  talk(port);
});
