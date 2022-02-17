let GameUI = {
    /**
     * The current round being shown
     */
    _round: 0,

    /**
     * The currently selected psychic ID - determines which psychic's info to show
     * Will defaultto selecting the first one
     */
    _selectedPsychicId: 0,

    /**
     * The player type - quick reference from the data in Main
     */
    _playerType: null,

    /**
     * Starts the game at the passed in round
     * @param {Number} round - the round to start at
     */
    startRound: function(round) {
        hideElement(Main.preRoomJoinElement);
        hideElement(Main.roomLobbyElement);
        showElement(Main.gameElement);

        this._playerType = Main.player.type;
        this._round = round;
        this._selectedPsychicId = Object.keys(Main.player.psychics)[0];

        this._initializeRerolls();
        this._initializeGhostVisionCards();
        this._initializePsychicContainer();
        this._initializeUIForSelectedPsychic();
    },

    _initializeRerolls: function() {
        document.getElementById("rerolls").innerText = Settings.numberOfRerolls;
    },

    /**
     * Sets up the ghost vision card deck and allocates the initial set of cards from the deck
     */
    _initializeGhostVisionCards: function() {

    },

    /**
     * Initializes the psychic container with the list of psychics
     */
    _initializePsychicContainer: function() {
        let psychicContainer = document.getElementById("psychicContainer");
        let _this = this;
        Object.keys(Main.player.psychics).forEach(function psychicIds(id) {
            let psychicButton = dce("div", "psychic-button");
            psychicButton.id = _this._getIdForPsychic(id);
            psychicButton.innerText = id; //TODO: use an image instead of this text!
            psychicButton.onclick = function() {
                if (_this._selectedPsychicId !== id) {
                    _this._selectedPsychicId = id;
                    _this._initializeUIForSelectedPsychic();
                }
            };

            psychicContainer.appendChild(psychicButton);
        });
    },

    /**
     * Gets the DOM element ID for the given psychic id
     * @param {Number} id - the psychic id
     * @returns The element ID
     */
    _getIdForPsychic: function(id) {
        return `psychic-${id}`;
    },

    /**
     * Initializes the UI for the selected psychic
     */
    _initializeUIForSelectedPsychic: function() {
        this._refreshPsychicUI();
        this._initializeVisionCards();
        this._initializeChoices();
    },

    /**
     * Refresh the styles so that the currently selected psychic shows up correctly
     */
    _refreshPsychicUI: function() {
        let _this = this;
        Object.keys(Main.player.psychics).forEach(function psychicIds(id) {
            let elementId = _this._getIdForPsychic(id);
            let psychicButton = document.getElementById(elementId);

            removeCssClass(psychicButton, "selected-psychic");
            if (_this._selectedPsychicId === id) {
                addCssClass(psychicButton, "selected-psychic");
            }
        });
    },

    /**
     * Shows the appropriate vision cards
     */
    _initializeVisionCards: function() {
        if (this._playerType === PlayerType.GHOST) {
            this._initializeVisionCardsForGhost();
        } else {
            this._initializeVisionCardsForPsychic();
        }
    },

    /**
     * Shows the current choices of vision cards for the ghost to select
     * TODO: this
     */
    _initializeVisionCardsForGhost: function() {
        let visionCardsContainer = document.getElementById("visionCards");
        visionCardsContainer.innerHTML = "";

        let _this = this;
        VisionCardDeck.currentCards.forEach(function(card) {
            let visionCard = dce("div", "vision-card");
            visionCard.id = _this._getIdForVisionCard(card.id);
            visionCard.style["backgroundImage"] = `url("${card.url}")`;

            visionCard.onclick = function() {
                _this._showImageForVisionCardDisplay(card.url);
            }

            visionCardsContainer.appendChild(visionCard);
        });
    },

    /**
     * Shows the given image on the main display
     * @param {String} imageUrl - the image url to show
     */
     _showImageForVisionCardDisplay: function(imageUrl) {
        let visionCardDisplay = document.getElementById("visionCardDisplay");
        visionCardDisplay.style["backgroundImage"] = `url("${imageUrl}")`;
    },

    /**
     * Gets the DOM element ID for the given vision card
     * @param {Number} id - the vision card id
     * @returns The element ID
     */
    _getIdForVisionCard: function(id) {
        return `vision-${id}`;
    },

    /**
     * Returns the vision card ID given the card's HTML element
     * @param {HTMLElement} element - the vision card element
     * @returns The ID of the card
     */
    _getIdFromVisonCardElement: function(element) {
        return Number(element.id.split("-")[1]);
    },

    /**
     * Shows the history of vision cards sent to them
     * TODO: create a history object and display it here
     */
    _initializeVisionCardsForPsychic: function() {

    },

    /**
     * TODO: show the choices that the psychic can choose from
     * - The ghost should see the correct answer for the current selected psychic
     */
    _initializeChoices: function() {
        let choicesContainer = document.getElementById("choices");
        choicesContainer.innerHTML = "";

        let choices = Choices.getChoices(Main.player.psychics[this._selectedPsychicId].round);
        let _this = this;
        choices.forEach(function(choice) {
            let choiceElement = dce("div", "choice");
            choiceElement.id = _this._getIdForChoice(choice.id);
            choiceElement.style["backgroundImage"] = `url("${choice.url}")`;

            choiceElement.onclick = function() {
                _this._showImageForChoiceDisplay(choice.url);
            };

            if (_this._playerType === PlayerType.GHOST && choice.answer === Number(_this._selectedPsychicId)) {
                addCssClass(choiceElement, "choice-answer");
            }

            choicesContainer.appendChild(choiceElement);
        });
    },

    /**
     * Shows the given image on the main display
     * @param {String} imageUrl - the image url to show
     */
     _showImageForChoiceDisplay: function(imageUrl) {
        let choiceDisplay = document.getElementById("choiceDisplay");
        choiceDisplay.style["backgroundImage"] = `url("${imageUrl}")`;
    },

    /**
     * Gets the DOM element ID for the given choice
     * @param {Number} id - the choice id
     * @returns The element ID
    */
    _getIdForChoice: function(id) {
        return `choice-${id}`;
    },

    /**
     * Returns the choice ID given the choice's HTML element
     * @param {HTMLElement} element - the choice element
     * @returns The ID of the card
     */
    _getIdFromChoiceElement: function(element) {
        return Number(element.id.split("-")[1]);
    },
}