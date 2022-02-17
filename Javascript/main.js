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
     * Initial settings of states
     * These properties will be updated as the game progresses
     */
     gameState: States.Game.LOBBY,
     globalState: 0, // This can either use ghost or psychic, depending on what this player is

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
    onStartGameClicked: function() {
        SocketClient.gameStart();
        this.gameStart();
    },

    /**
     * Starts the game
     * TODO: when images and such are decided, this is where they would be set!
     */
    gameStart: function() {
        this.player = this._initializePlayer(PlayerType.GHOST); //TODO: grab this from the settings via the lobby instead
        VisionCardDeck.reset();
        Choices.reset();
        this._startRound();
    },

    /**
     * Initializes the player object to contain its type and the relevant states
     * TODO: is this even going to be how we do it? seems overengineered...
     * @returns The player object
     */
    _initializePlayer: function(playerType) {
        let round = Settings.debug.enabled ? Settings.debug.startingRound : 1

        // Initial state - 
        // Ghosts start by sending
        // Psychics start by waiting
        let psychics = playerType == PlayerType.GHOST 
            ? {
                0: { state: States.Ghost.SENDING, round: round },
                1: { state: States.Ghost.SENDING, round: round }
            }
            : {
                0: { state: States.Psychic.WAITING, round: round },
                1: { state: States.Psychic.WAITING, round: round }
            }

        return {
            type: playerType,
            psychics: psychics
        };
    },

    /**
     * Starts the round
     */
    _startRound: function() {
        this.currentRound++;
        GameUI.startRound(this.currentRound);
    }
};