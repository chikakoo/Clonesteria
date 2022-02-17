SocketClient = {
	_socket: null,

    isServerRunning: function() {
		return typeof io !== 'undefined';
	},
	
	connect: function() {
		if (!this.isServerRunning()) {
			return;
		}

		this._socket = io();
		this._socket.connect('http://127.0.0.1:25565');

		// Connect/Disconnect listeners
		this._socket.on('connect', function() {
			console.log("Connected to the server");
		});
		
		this._socket.on('disconnect', function() {
			console.log('Disconnected from the server');
		});

        /**
         * Used by the host so that the isClient flag is set to false
         * Also handles the UI for the lobby
         */
        this._socket.on('room_created', function(roomName) {
            Main.isClient = false;
            RoomManager.onRoomJoined(roomName);
        });

        /**
         * Used by the client so that the isClient flag is set to true
         * Also handles the UI for the lobby
         */
        this._socket.on('room_joined', function(roomName) {
            Main.isClient = true;
            RoomManager.onRoomJoined(roomName);
        });

        /**
         * Updates the list of rooms to join
         */
        this._socket.on('update_rooms', function(rooms) {
            RoomManager.updateRoomList(rooms);
        });

        /**
         * Updates the list of connected players
         */
        this._socket.on('update_connected_usernames', function(usernames) {
            Main.updateConnectedUsernames(usernames);
        });

        /**
         * Only called on the non-host, since the host's version will be called already
         */
        this._socket.on('game_start', function() {
            console.log("Game starting!");
            Main.gameStart();
        });
    },

    /**
     * Creates the server room
     * @param roomName - the name of the room
     * @param username - the user who created the room
     */
    createRoom: function(roomName, username) {
        if (this._socket) {
            this._socket.emit("create_room", roomName, username);
        }
    },

    /**
     * Joins the room
     * @param roomName - the room name 
     * @param username - the user who is joining
     */
    joinRoom: function(roomName, username) {
        if (this._socket) {
            this._socket.emit("join_room", roomName, username);
        }
    },

    /**
     * Updates the room list
     */
    updateRooms: function() {
        if (this._socket) {
            this._socket.emit("update_rooms");
        }
    },

    /**
     * Updates the current set of connected users
     * @param roomName - the room name
     */
    updateConnectedUsernames: function() {
        if (this._socket) {
            this._socket.emit("update_connected_usernames", Main.roomName);
        }
    },

    /**
     * Starts the game - uses the properties set in Main
     */
    gameStart: function() {
        if (this._socket) {
            this._socket.emit("game_start", Main.roomName);
        }
    }
};
