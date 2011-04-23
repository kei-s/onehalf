require.paths.unshift('./node_modules')

var express = require('express')
  , jade = require('jade')
  , io = require("socket.io")
  , _ = require("underscore");


app = express.createServer();
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});
app.get('/', function(req, res) {
  res.render('index.jade');
});
app.listen(80);

var socket = io.listen(app);
var clients = {};
socket.on('connection', function(client) {
  client.on('message', function(message) {
    if(message.status && message.status == 'connect') {
      client._channel = message.channel;
    }
    console.log("<- ["+client._channel+"] "+client.sessionId, message);
    _.each(socket.clients, function(destClient) {
      if(destClient._channel && client._channel == destClient._channel) {
        destClient.send(message);
        console.log("-> ["+destClient._channel+"] "+destClient.sessionId, message);
      }
    });
  });
});
