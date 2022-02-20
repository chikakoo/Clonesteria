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

     client.on('send_player_type', function(roomName, playerType) {
        client.to(roomName).broadcast.emit('receive_player_type', playerType);
     });
     
     client.on('get_player_type', function(roomName) {
        client.to(roomName).broadcast.emit('send_player_type');
     });
 
     /**
      * Called when the game starts
      */
     client.on('game_start', function(roomName, playerType, choices) {
         console.log(`Game starting for room: ${roomName}`);
         client.to(roomName).broadcast.emit('game_start', playerType, choices);
     });

     client.on('next_round', function(roomName) {
        console.log("Starting next round.");
        client.to(roomName).broadcast.emit('next_round');
     });

    // ---- Ghost communicating with Psychic ---- //
    client.on('send_visions_to_psychic', function(roomName, psychicId, round, attempt, visions) {
        console.log(`Recevied visions from psychic, ID|Round|Attempt|Count: ${psychicId}|${round}|${attempt}|${visions.length}`);
        client.to(roomName).broadcast.emit('receive_visions_from_ghost', psychicId, round, attempt, visions);
    });

    client.on('send_rerolls_to_psychic', function(roomName, rerolls) {
        console.log(`Sending over reroll count: ${rerolls}`);
        client.to(roomName).broadcast.emit('receive_rerolls_from_ghost', rerolls);
    });

    // ---- Psychic communicating with Ghost ---- //
    client.on('send_choice_to_ghost', function(roomName, psychicId, round, choiceId) {
        console.log(`Recevied choice from psychic, ID|Round|ChoiceID: ${psychicId}|${round}|${choiceId}`);
        client.to(roomName).broadcast.emit('receive_choice_from_psychic', psychicId, round, choiceId);
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