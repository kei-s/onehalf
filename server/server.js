require.paths.unshift('./node_modules')

var express = require('express')
  , jade = require('jade')
  , io = require("socket.io")
  , _ = require("underscore");


app = express.createServer();
app.get('/', function(req, res) {
  res.render('index.jade');
});
app.listen(3333);

var socket = io.listen(app);
socket.on('connection', function(client) {
  client.on('message', function(message) {
    console.log(client.sessionId, message);
    client.broadcast(message);
  });
});
