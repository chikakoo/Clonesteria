/**
 * Contains data about what choices the phychics made
 * Used to disable choices that were already made and to show the history
 */
let ChoiceHistory = {
    /**
     * An object containing the history of the choices the psychics made
     * {
     *   <psychic id>: {
     *     <round number>: [<attempt 1 id>, <attempt 2 id>]
     *   }
     * }
     */
    history: {},

    /**
     * Clears the history - should only be called after a game
     */
    reset: function() {
        this.history = {};
    },

    /**
     * @param {Number} psychic - the psychic id
     * @param {Number} round - the round number
     * @param {Number} choiceId - the choice that was made this attempt
     */
    add: function(psychic, round, choiceId) {
        this.history[psychic] = this.history[psychic] || {};
        this.history[psychic][round] = this.history[psychic][round] || [];
        this.history[psychic][round].push(choiceId);
    },

    /**
     * Checks whether a given id is in the history
     * @param {Number} psychic - the psychic id
     * @param {Number} round - the round number
     * @param {Number} choiceId - the choice to check
     */
    checkIfInHistory(psychic, round, choiceId) {
        return this.history[psychic] &&
            this.history[psychic][round] &&
            this.history[psychic][round].includes(choiceId);
    }
}