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
     */
    choices: [],

    /**
     * Resets the choices - should only be done when the game is completely restarting!
     */
    reset: async function() {
        this.choices = [];
        await this.initialize();
    },

    /**
     * Initializes the choices for the game
     */
    initialize: async function() {
        await this._pushSuspectChoices();
        await this._pushSceneChoices();
        
        Settings.useStories
        ? await this._pushStoryChoices()
        : await this._pushWeaponChoices();

        await this._assignAnswers();
    },

    /**
     * Pushes a list of suspect choices
     */
    _pushSuspectChoices: async function() {
        this._insertImageDataToChoices(
            await this._getImageData(UnsplashAPI.getSuspectCardImage.bind(UnsplashAPI)));
    },

    /**
     * Pushes a list of scene choices
     */
    _pushSceneChoices: async function() {
        this._insertImageDataToChoices(
            await this._getImageData(UnsplashAPI.getSceneCardImage.bind(UnsplashAPI)));
    },

    /**
     * Pushes a list of weapon choices
     */
     _pushWeaponChoices: async function() {
        this._insertImageDataToChoices(
            await this._getImageData(UnsplashAPI.getWeaponCardImage.bind(UnsplashAPI)));
    },

    /**
     * Pushes a list of story choices
     */
     _pushStoryChoices: async function() {
        this._insertImageDataToChoices(
            await this._getImageData(UnsplashAPI.getWeaponCardImage.bind(UnsplashAPI))); //TODO: update this when there's a story API call
    },

    /**
     * Formats the image data
     * @param {Function} imageFunction - the function used to get the base object for the images to add
     */
    _getImageData: async function(imageFunction) {
        let imageData = [];
        for (let i = 0; i < Settings.numberOfChoices; i++) {
            let image = await imageFunction();
            image.id = i;
            image.answer = -1;
            imageData.push(image);
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
     * @param {Number} round - the round - 1-indexed
     */
    getChoices: function(round) {
        return this.choices[round - 1];
    },

    /**
     * Gets the sorted choices for the final round
     * @param {Array<Any>} choices - the array of unsorted choices
     * @param {Boolean} includeLastSet - includes the last, unused set of choices
     */
    getChoicesForFinalRound: function(choices, includeLastSet) {
        let psychicChoices = choices.filter(choice => choice.answer > -1)
            .sort((a, b) => (a.answer > b.answer) ? 1 : -1);
        let otherChoices = choices.filter(choice => choice.answer < 0);
        let sortedChoices = psychicChoices.concat(otherChoices);

        if (!includeLastSet) {
            sortedChoices.splice(sortedChoices.length - 1, 1);
        }
        return sortedChoices;
    },

    /**
     * Gets an array of the final round choices, sorted as follows:
     * - [id] - [<imageData1>, ...]
     * - ...
     * @returns The above data
     */
    getFinalRoundChoicesForPsychics: function() {
        let roundData = [];
        const numberOfRounds = 3;
        for (let i = 0; i < numberOfRounds; i++) {
            roundData.push(this.getChoicesForFinalRound(this.choices[i]));
        }

        let psychicData = [];
        const numberOfPsychics = 4;
        for (let i = 0; i < numberOfPsychics; i++) {
            for (let j = 0; j < numberOfRounds; j++) {
                psychicData[i] = psychicData[i] || [];
                psychicData[i].push(roundData[j][i]);
            }
        }

        return psychicData;
    },

    /**
     * Checks whether the given answer is correct
     * @param {Number} psychicId - the psychic ID
     * @param {Number} round - the round to check
     * @param {Number} chosenAnswerId - the chosen answer ID
     */
    checkAnswer: function(psychicId, round, chosenAnswerId) {
        let roundChoices = this.getChoices(round);
        let choice = roundChoices.find(choices => choices.id === chosenAnswerId);
        return choice.answer === Number(psychicId);
    },

    /**
     * Creates a div based on the given choice
     * @param {Any} choice - the choice
     * @param {String} elementId - the id to assign the element - skips this if null
     * @return - the created div
     */
    createBaseChoiceElement: function(choice, elementId) {
        let choiceElement = dce("div", "choice");

        if (elementId) {
            choiceElement.id = elementId;
        }
        
        if (choice.url) {
            choiceElement.style["backgroundImage"] = `url("${choice.url}")`;
        } else if (choice.urls && choice.urls.length > 0) {
            choiceElement.style["backgroundImage"] = `url("${choice.urls[0]}")`;

            //TODO: rework this logic to be how we actually want it!
            if (choice.urls.length > 1) {
                let suspectItem = dce("div", "suspect-item");
                suspectItem.style["backgroundImage"] = `url("${choice.urls[1]}")`;
                choiceElement.appendChild(suspectItem);
            }
        }

        return choiceElement;
    }
}