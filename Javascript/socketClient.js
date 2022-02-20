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
         * Receive the player type from the host and refresh the lobby accordingly
         */
        this._socket.on('receive_player_type', function(playerType) {
            Lobby.selectedPlayerType = playerType;
            Lobby.refreshPlayerTypeUI();
        });

        /**
         * This will be called by the host - simply call to send the player type
         */
        this._socket.on('send_player_type', function() {
            SocketClient.sendPlayerType(Lobby.getOtherPlayerType());
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

        /**
         * Only called on the non-host, so that both players start at the same time
         * Will hide the modal popup that's currently blocking them as well
         */
        this._socket.on('next_round', function() {
            ModalPopup.hide();
            Main.nextRound();
        });

        // ---- Psychic receiving messages from ghost ---- //
        this._socket.on('receive_visions_from_ghost', function(psychicId, round, attempt, visions) {
            VisionCardHistory.add(psychicId, round, attempt, visions);
            Main.setPsychicState(psychicId, States.Rounds.POST_VISION);
            GameUI.refreshVisionCardsForPsychic();
        });

        this._socket.on('receive_rerolls_from_ghost', function(rerolls) {
            Reroll.refreshText(rerolls);
        });

        // ---- Ghost receiving messages from psychic ---- //
        this._socket.on('receive_choice_from_psychic', function(psychicId, round, choiceId) {
            ChoiceHistory.add(psychicId, round, choiceId);
            Main.setPsychicState(psychicId, States.Rounds.POST_ANSWER);
            GameUI.refreshChoices();
            GameUI.checkForRoundEnd();
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
     * Sends the player type to the client
     * TODO eventually: make it behave correctly with multiple clients
     * @param {Number} - the player type to set the other players to
     */
    sendPlayerType: function(playerType) {
        if (this._socket) {
            this._socket.emit("send_player_type", Main.roomName, playerType);
        }
    },

    /**
     * Gets the player type from the ghost
     */
    getPlayerType: function() {
        if (this._socket) {
            this._socket.emit("get_player_type", Main.roomName);
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

    /**
     * Starts the next round
     */
    nextRound: function() {
        if (this._socket) {
            this._socket.emit("next_round", Main.roomName);
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

    /**
     * Sends over the reroll count
     * @param {Number} rerolls - the reroll count
     */
    refreshRerolls: function(rerolls) {
        if (this._socket && Main.player.type === PlayerType.GHOST) {
            this._socket.emit("send_rerolls_to_psychic", Main.roomName, rerolls);
        }
    },

    // ---- Psychic communicating with Ghost ---- //
    sendChoiceToGhost: function(psychicId, round, choiceId) {
        if (this._socket && Main.player.type === PlayerType.PSYCHIC) {
            this._socket.emit("send_choice_to_ghost", Main.roomName, psychicId, round, choiceId);
        }
    }
};
