var port;
var listener = {
  mousemove: function(event) {
    post('mousemove', {x: event.clientX, y: event.clientY});
  },
  scroll: function(event) {
    post('scroll', {x: window.scrollX, y: window.scrollY});
  }
};

var fireflies = {};
function Firefly(origin) {
  var hue = origin * 47 % 360;
  this.element = document.createElement('div');
  this.element.setAttribute("style", "position: fixed; height: 30px; width: 30px; background-image: -webkit-gradient(radial, center center, 5, center center, 15, from(hsla(" + hue + ", 100%, 70%, 1)), to(hsla(0, 100%, 100%, 0)))");
}
Firefly.prototype = {
  flyTo: function(position) {
    this.element.style.top = position.y - 15 + "px";
    this.element.style.left = position.x - 15 + "px";
    document.body.appendChild(this.element);
    return this.element;
  },
  remove: function() {
    document.body.removeChild(this.element);
  }
};
var action = {
  mousemove: function(origin,data) {
    if (!fireflies[origin]) {
      fireflies[origin] = new Firefly(origin);
    }
    var firefly = fireflies[origin];
    firefly.flyTo(data);
  },
  scroll: function(origin,data) {
    console.log('scroll',origin,data)
  }
};
function setChannel(channel, origin) {
  var hue = origin * 47 % 360;
  console.log(origin);
  console.log(hue);
  var span = document.createElement('span');
  span.textContent = channel;
  span.setAttribute('style', 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; color: #666; background-color: hsla(' + hue + ', 100%, 70%, 1); border-radius: 5px;');
  document.body.appendChild(span);
}
function post(name, data) {
  port.postMessage({event: name, data: data});
}
function talk(currentPort) {
  port = currentPort;
  port.onMessage.addListener(function(message) {
    if (message.status == "binded") {
      setChannel(message.channel, message.me);
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
