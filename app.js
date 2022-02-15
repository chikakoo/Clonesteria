/**
 * **TODO: Actually do this - this is copied from the widget game
 * Host will set isClient to FALSE when creating a room
 * When someone joins, isClient will be changed to TRUE only for them!
 * ONLY the host will have the "Start" button be active (and only when there's 2 players)
 */
 const staticServer = require('node-static');
 const http = require('http');
 const port = 25565;
 
 /**
  * Contains keys of room names with an object of client Ids and their
  * corresponding names
  */
 var rooms = {};
 
 var file = new(staticServer.Server)();
 
 // Static server (for css, images, etc.)
 var httpServer = http.createServer(function (req, res) {
     file.serve(req, res);
 });
 
 const io = require('socket.io')(httpServer);
 io.on('connection', function(client) {
     console.log(`Connection to client ${client.id} established`);
 
     client.on('disconnect', function() {
         console.log(`Client ${client.id} has disconnected`);
     });
 
     client.on("create_room", function(roomName, username) {
         // One day we should deal with overwriting existing room names
         rooms[roomName] = {
             name: roomName,
             players: {}
         };
         rooms[roomName].players[client.id] = {
             username: username,
             isHost: true
         };
         client.join(roomName);
         client.emit("room_created", roomName);
         client.broadcast.emit("update_rooms", Object.keys(rooms));
     });
 
     client.on("join_room", function(roomName, username) {
         if (!rooms[roomName]) {
             console.log(`ERROR: ${username} tried to join non-existant room ${roomName}`);
         }
 
         rooms[roomName].players[client.id] = {
             username: username
         };
 
         client.join(roomName);
         client.emit("room_joined", roomName);
         client.broadcast.emit("update_connected_usernames", getConnectedUsernames(roomName));
         console.log(`${username} joined room ${roomName}!`);
     });
 
     client.on("update_rooms", function() {
         client.emit("update_rooms", Object.keys(rooms));
     });
 
     client.on('update_connected_usernames', function(roomName) {
         client.emit("update_connected_usernames", getConnectedUsernames(roomName));
     });
 
     /**
      * Called when the game starts
      * TODO: Probably pass the state of all of the images, etc
      */
     client.on('game_start', function(roomName) {
         console.log(`Game starting for room: ${roomName}`);
         client.to(roomName).broadcast.emit('game_start');
     });
 });
 
 /**
  * Gets the list of connected usernames in a given room
  * @param roomName - the name of the room
  */
 getConnectedUsernames = function(roomName) {
     let players = rooms[roomName].players;
     let usernames = [];
 
     Object.keys(players).forEach(function(playerId) {
         usernames.push(players[playerId].username);
     });
 
     return usernames;
 };
 
 httpServer.listen(port, function(err) {
     if (err) throw err;
     console.log(`listening on port ${port}`);
 });