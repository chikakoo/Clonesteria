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
         * Syncs up the choices for the game as well as passes in the correct player type
         */
        this._socket.on('game_start', async function(playerType, choices) {
            console.log(`Game starting as player type: ${playerType}`);
            Choices.choices = choices;
            await Main.gameStart(playerType);
        });

        // ---- Psychic receiving messages from ghost ---- //
        this._socket.on('receive_visions_from_psychic', function(psychicId, round, attempt, visions) {
            VisionCardHistory.add(psychicId, round, attempt, visions);
            GameUI.refreshVisionCardsForPsychic(Main.roomName, psychicId, round, attempt, visions);
            Main.setPsychicState(psychicId, States.Rounds.POST_VISION);

            //TODO: AND enable them to send cards... well they have to be disabled first!
        });

        // ---- Ghost receiving messages from psychic ---- //
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
     * @param {Number} otherPlayerType - the type of player to make the other player (only the host will call this)
     * @param {Array<Any>} choices - the set of choices that both players will be seeing for each round
     */
    gameStart: function(otherPlayerType, choices) {
        if (this._socket) {
            this._socket.emit("game_start", Main.roomName, otherPlayerType, choices);
        }
    },

    // ---- Ghost communicating with Psychic ---- //

    /**
     * Sends vision cards to the psychic
     * @param {Number} psychicId - the psychic ID to send to
     * @param {Number} round - the round
     * @param {Number} attempt - the attempt number
     * @param {Array<Any>} cardsToSend - An array of the card objects (contains a url property) to send over
     */
    sendVisionsToPsychic: function(psychicId, round, attempt, visions) {
        if (this._socket && Main.player.type === PlayerType.GHOST) {
            this._socket.emit("send_visions_to_psychic", Main.roomName, psychicId, round, attempt, visions);
        }
    },

    // ---- Psychic communicating with Ghost ---- //
    sendChoiceToGhost: function(psychicId, round, choiceId) {
        if (this._socket && Main.player.type === PlayerType.PSYCHIC) {
            this._socket.emit("send_choice_to_ghost", Main.roomName, psychicId, round, choiceId); //TODO: not done yet!!!
        }
    }
};
