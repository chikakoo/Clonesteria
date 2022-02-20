let Main = {
    /**
     * The current room you're connected to
     */
    roomName: "",

    /**
     * Whether you're the client (as opposed to the host)
     * The host will have this set to false when the room is created
     */
    isClient: true,

    /**
     * An object representing the player - properties listed below
     * - type: GHOST or PSYCHIC
     * - psychics: an object of psychics with the following properties (keyed by an incrementing id)
     *   - round: 
     *       Round 1: Suspect
     *       Round 2: Location
     *       Round 3: Weapon/Story
     *       Round 4: Final
     *   - state: either ghostState or psychicState
     *   - TODO: what cards to display - vision cards/answer for ghosts, the choices for psychics and ghosts, etc.
     */
    player: {},

    /**
     * The current round - increments on round start
     * Note that this is for the overall round, not the individual psychic round
     */
    currentRound: 0,

    /**
     * The relevant divs for easy reference - set in this._initializeRelementReferences
     * _preRoomJoinElement: the username/room screen
     * _roomLobbyElement: the settings/start game button screen
     * _gameElement: the main game screen
     */
    preRoomJoinElement: null,
    roomLobbyElement: null,
    gameElement: null,

    /**
     * Initialize the application
     */
    initialize: function() {
        this._initializeElementReferences();

        if (Settings.debug.enabled) {
            this.gameStart(Settings.debug.playerType);
            return;
        }
        SocketClient.connect();
        SocketClient.updateRooms();
    },

    _initializeElementReferences: function() {
        this.preRoomJoinElement = document.getElementById("preRoomJoin");
        this.roomLobbyElement = document.getElementById("roomLobby");
        this.gameElement = document.getElementById("game");
    },

    /**
     * Update the list of connected users
     * Also enables the start game button for the host if there's more than one player
     * @param usernames - the usernames
     */
    updateConnectedUsernames: function(usernames) {
        let playerList = document.getElementById("playerList");
        playerList.innerText = usernames.join(" | ");

        if (!Main.isClient && usernames.length > 1) {
            document.getElementById("startGame").removeAttribute("disabled");
        }
    },

    /**
     * Called when the host starts the game
     */
    onStartGameClicked: async function() {
        //TODO: move these resets to a post-game place
        VisionCardHistory.reset();
        await VisionCardDeck.reset();
        ChoiceHistory.reset();
        Choices.reset();
        Reroll.reset();

        SocketClient.gameStart(Lobby.getOtherPlayerType(), Choices.choices);
        await this.gameStart(Lobby.selectedPlayerType);
    },

    /**
     * Starts the game
     * TODO: when images and such are decided, this is where they would be set/sent across!
     */
    gameStart: async function(playerType) {
        this.player = this._initializePlayer(playerType); 

        if (Settings.debug.enabled) {
            VisionCardHistory.reset();
            await VisionCardDeck.reset();
            ChoiceHistory.reset();
            Choices.reset();
            Reroll.reset();
            VisionCardHistory.history = Settings.debug.startingVisionCardHistory;
            ChoiceHistory.history = Settings.debug.startingChoiceHistory;
        }

        this.nextRound();
    },

    /**
     * Initializes the player object to contain its type and the relevant states
     * @param {Number} playerType - the player type
     * @returns The player object
     */
    _initializePlayer: function(playerType) {
        let round = Settings.debug.enabled ? Settings.debug.startingRound : 1
        return {
            type: playerType,
            psychics: this._createPsychicObject(round)
        };
    },

    /**
     * Creates the psychic object based on the number of psychics to create
     * @param {Number} round - the round to start the psychics at
     * @returns The created psychic object
     */
    _createPsychicObject: function(round) {
        let psychicContainer = {};
        for (let i = 0; i < Settings.numberOfPsychics; i++) {
            psychicContainer[i] = { 
                state: States.Rounds.PRE_VISION,
                round: round 
            };
        }
        return psychicContainer;
    }, 

    /**
     * Returns the round of the given psychic
     * @param {Number} psychicId - the psychic id
     */
    getPsychicRound: function(psychicId) {
        return this.player.psychics[psychicId].round;
    },

    /**
     * Advances the round for the psychic
     * @param {Number} psychicId - the psychic id
     */
    advancePsychicRound: function(psychicId) {
        this.player.psychics[psychicId].round++;
    },

    /**
     * Returns the state of the given psychic id
     * @param {Number} psychicId - the psychic id
     */
    getPsychicState: function(psychicId) {
        return this.player.psychics[psychicId].state;
    },

    /**
     * Sets the psychic state and updates the visual
     * @param {Number} psychicId - the id
     * @param {Number} state  -the state to set to
     */
    setPsychicState: function(psychicId, state) {
        this.player.psychics[psychicId].state = state;
        GameUI.refreshPsychicUI();
    },

    /**
     * Starts the round
     */
    nextRound: function() {
        this.currentRound++;

        Object.values(this.player.psychics).forEach(function(psychic) {
            psychic.state = States.Rounds.PRE_VISION
        });

        SocketClient.refreshRerolls(Reroll.rerolls);
        GameUI.startRound();
    },

    /**
     * Gets whether every psychic is done choosing their choice
     * @returns True if so, false otherwise
     */
    areAllChoicesSent: function() {
        return Object.values(this.player.psychics)
            .every(psychic => psychic.state === States.Rounds.POST_ANSWER);
    }
};