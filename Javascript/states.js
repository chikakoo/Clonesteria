let States = {
    // The overall state of the game
    Game: {
        // The initial state before a room is joined
        LOBBY: 0,

        // You are in a room waiting for it to start
        // This is where the settings can be changed as the host
        PRE_GAME: 1,

        // The round is active - ghosts are sending visions/psychics are guessing
        ROUND_ACTIVE: 2,

        // The round has ended, results are being shown
        // It will now go back to ROUND_ACTIVE, or FINAL_ROUND_ACTIVE depending on 
        // whether the psychics successfully completed every main round
        ROUND_END: 3,

        // The final round is active - the game will now use the final round UI
        FINAL_ROUND_ACTIVE: 4,

        // The game is over - the results screen is shown
        // Players can go back to the pre-game state where they can start again
        GAME_END: 5
    },

    // These states are for each individual psychic that the ghost is sending to
    Ghost: {
        // The vision has not yet been sent
        SENDING: 0,

        // The vision has been sent - waiting for the psychic to choose
        SENT: 1
    },

    // These states are for each individual psychic
    Psychic: {
        // The psychic has not received a vision
        WAITING: 0,

        // The psychic received a vision and is choosing their answer
        CHOOSING: 1,

        // The psychic has sent their answer and is waiting for the round to end
        // OR the psychic is already done with everything and they started in this state
        CHOSEN: 2
    }
};