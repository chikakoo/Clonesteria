/**
 * Used by the psychics
 * Contains data about what vision cards were sent to them and what choices they made that round
 * 
 * Used to display the vision cards to the psychics during the game
 */
let VisionCardHistory = {
    /**
     * An object containing the history of visions sent over to the psychic
     * {
     *   <psychic id>: {
     *     <round number>: {
     *       <attempt number>: [ { url: <String> }, ... ]
     *     }
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
     * @param {Number} attempt - the attempt number in the round
     * @param {Array<Object>} cards - the array of cards that was sent over, which is an object containing a url
     */
    add: function(psychic, round, attempt, cards) {
        this.history[psychic] = this.history[psychic] || {};
        this.history[psychic][round] = this.history[psychic][round] || {};
        this.history[psychic][round][attempt] = cards;
    }
}