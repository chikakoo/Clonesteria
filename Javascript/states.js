let States = {
    // These states are for each individual psychic
    Rounds: {
        // The psychic has not received a vision
        PRE_VISION: 0,

        // The psychic received a vision and is choosing their answer
        POST_VISION: 1,

        // The psychic has sent their answer and is waiting for the round to end
        // OR the psychic is already done with everything and they started in this state
        POST_ANSWER: 2
    }
};