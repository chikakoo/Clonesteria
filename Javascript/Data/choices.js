/**
 * A structure to store the current choices for the game
 */
let Choices = {
    /**
     * The set of choices for this game
     * This is indexed by round
     * 
     * Format - each element will contain this object:
     * {
     *  [ id: <Number>, url: <String>, answer: <Number> ],
     *  ...
     * }
     * 
     * The answer will be -1 if it's not the answer for any psychic
     * 
     * TODO: how to determine which sets of choices will be for the final round
     */
    choices: [],

    /**
     * Resets the choices - should only be done when the game is completely restarting!
     */
    reset: function() {
        this.choices = [];
        this.initialize();
    },

    /**
     * Initializes the choices for the game
     */
    initialize: function() {
        this._pushLocationChoices();
        this._pushSuspectChoices();
        
        Settings.useStories
        ? this._pushStoryChoices()
        : this._pushWeaponChoices();

        this._assignAnswers();
    },

    /**
     * Pushes a list of location choices
     */
    _pushLocationChoices: function() {
        this._insertImageDataToChoices(this._getImageData());
    },

    /**
     * Pushes a list of suspect choices
     */
     _pushSuspectChoices: function() {
        this._insertImageDataToChoices(this._getImageData());
    },

    /**
     * Pushes a list of weapon choices
     */
     _pushWeaponChoices: function() {
        this._insertImageDataToChoices(this._getImageData());
    },

    /**
     * Pushes a list of story choices
     */
     _pushStoryChoices: function() {
        this._insertImageDataToChoices(this._getImageData());
    },

    /**
     * TODO: call some sort of API to get these images instead - adjust all the above functions to use it appropriately
     */
    _getImageData: function() {
        let imageData = [];
        for (let i = 0; i < Settings.numberOfChoices; i++) {
            imageData.push({
                id: i,
                url: Random.getRandomValueFromArray(StaticImages),
                answer: -1
            });
        }
        return imageData;
    },

    /**
     * Inserts the image data to the choices object
     * @param {Array} imageData 
     */
    _insertImageDataToChoices: function(imageData) {
        let nextIndex = Object.keys(this.choices).length;
        this.choices[nextIndex] = imageData;
    },

    /**
     * Assign each round an answer for each psychic
     */
    _assignAnswers: function() {
        let _this = this;
        let numberOfPsychics = Settings.numberOfPsychics;
        Object.keys(this.choices).forEach(function(roundNumber) {
            let choicesForRound = _this.choices[roundNumber];
            let answers = Random.getRandomValuesFromArray(choicesForRound, numberOfPsychics);

            for (let i = 0; i < numberOfPsychics; i++) {
                answers[i].answer = i;
            }
            choicesForRound.shuffle();
        });
    },

    /**
     * Gets the choices for the current round
     * @param {Number} round - the round
     */
    getChoices: function(round) {
        return this.choices[round];
    },

    /**
     * Checks whether the given answer is correct
     * @param {Number} round - the round to check
     * @param {Number} psychicId - the psychic ID
     * @param {Number} chosenAnswerId - the chosen answer ID
     */
    checkAnswer: function(round, psychicId, chosenAnswerId) {
        let roundChoices = this.getChoices(round);
        let choice = roundChoices.find(choices => choices.id === chosenAnswerId);
        return choice.answer === psychicId;
    }
}