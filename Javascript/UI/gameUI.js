let GameUI = {
    /**
     * The current round being shown
     */
    _round: 0,

    /**
     * The currently selected psychic ID - determines which psychic's info to show
     * Will default to selecting the first one
     */
    selectedPsychicId: 0,

    /**
     * The player type - quick reference from the data in Main
     */
    _playerType: null,

    /**
     * Whether the ghost is currently selecting vision cards to send
     */
    _sendingVisionCards: false,

    /**
     * Whether the vision cards were sent - indexed by the psychic id
     * Used by both the ghost and the psychic
     */
    cardsSent: {},

    /**
     * Arrays of all card ids to send to the psychic - indexed by the psychic id
     */
    _cardIdsToSend: {},

    /**
     * An object containing the current attempt number for each psychic, keyed by the psychic id
     */
    _attempt: {},

    /**
     * The currently selected answer - this is the one being looked at in the display
     */
    _selectedAnswer: null,

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
        this.selectedPsychicId = Object.keys(Main.player.psychics)[0];

        this.cardsSent = {};
        this._cardIdsToSend = {};
        this._attempt = {};

        let _this = this;
        Object.keys(Main.player.psychics).forEach(function(psychicId) {
            _this.cardsSent[psychicId] = false;
            _this._cardIdsToSend[psychicId] = [];
            _this._attempt[psychicId] = 1;
        });

        this._initializePsychicContainer();
        this._initializeUIForSelectedPsychic();
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
                if (_this.selectedPsychicId !== id) {
                    _this.selectedPsychicId = id;
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
        this.refreshChoices();
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
            if (_this.selectedPsychicId === id) {
                addCssClass(psychicButton, "selected-psychic");
            }
        });
    },

    /**
     * Shows the appropriate vision cards
     */
    _initializeVisionCards: function() {
        if (this._playerType === PlayerType.GHOST) {
            this.refreshVisionCardsForGhost();
        } else {
            this.refreshVisionCardsForPsychic();
        }
    },

    /**
     * Shows the current choices of vision cards for the ghost to select
     */
     refreshVisionCardsForGhost: function() {
        let visionCardsContainer = document.getElementById("visionCards");
        removeCssClass(visionCardsContainer, "psychic-vision-cards");
        visionCardsContainer.innerHTML = "";

        addOrRemoveCssClass(
            document.getElementById("sendVisionCardsButton"), 
            "nodisp", 
            this.cardsSent[this.selectedPsychicId]);

        hideElement(document.getElementById("sendChoiceButton"));

        let _this = this;
        VisionCardDeck.currentCards.forEach(function(card) {
            let visionCard = dce("div", "vision-card");
            visionCard.id = _this._getIdForVisionCard(card.id);
            visionCard.style["backgroundImage"] = `url("${card.url}")`;

            visionCard.onclick = function() {
                if (!Reroll.rerolling) {
                    _this._showImageForVisionCardDisplay(card.url);
                } else {
                    _this._addOrRemoveSelectedCardIDFormArray(
                        card.id, visionCard, Reroll.selectedCardIds, "selected-for-reroll");
                }
            }

            if (_this._cardIdsToSend[_this.selectedPsychicId].includes(card.id)) {
                addCssClass(visionCard, "selected-for-sending");
            }

            visionCard.oncontextmenu = function() {
                if (!Reroll.rerolling && !_this.cardsSent[_this.selectedPsychicId]) {
                    _this._addOrRemoveSelectedCardIDFormArray(
                        card.id, visionCard, _this._cardIdsToSend[_this.selectedPsychicId], "selected-for-sending");
                }
            };

            visionCardsContainer.appendChild(visionCard);
        });
    },

    /**
     * Adds or removed the given card ID from the given array
     * Also handles adding or removing the appropriate css class from the element
     * @param {Number} cardId - the card id
     * @param {HTMLElement} cardElement - the card element
     * @param {Array<Number>} array - the array of card ids to modify
     * @param {String} cardElement - the class that's used for the selection styling
     */
    _addOrRemoveSelectedCardIDFormArray: function(cardId, cardElement, array, selectedClass) {
        if (array.includes(cardId)) {
            let index = array.indexOf(cardId);
            array.splice(index, 1);
            removeCssClass(cardElement, selectedClass);
        } else {
            array.push(cardId);
            addCssClass(cardElement, selectedClass);
        }
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
     refreshVisionCardsForPsychic: function() {
        let visionCardsContainer = document.getElementById("visionCards");
        addCssClass(visionCardsContainer,"psychic-vision-cards");
        visionCardsContainer.innerHTML = "";

        addOrRemoveCssClass(
            document.getElementById("sendChoiceButton"), 
            "nodisp", 
            this.cardsSent[this.selectedPsychicId]);

        hideElement(document.getElementById("sendVisionCardsButton"));

        let round = Main.player.psychics[this.selectedPsychicId].round;
        if (!VisionCardHistory.history[this.selectedPsychicId] ||
            !VisionCardHistory.history[this.selectedPsychicId][round]) {
            return;
        }

        let _this = this;
        let relevantHistory = VisionCardHistory.history[this.selectedPsychicId][round];
        Object.keys(relevantHistory).reverse().forEach(function(attempt) {
            let cardsInAttempt = relevantHistory[attempt];
            let attemptDiv = dce("div", "vision-card-attempt");
            cardsInAttempt.forEach(function(card) {
                let visionCard = dce("div", "vision-card");
                visionCard.style["backgroundImage"] = `url("${card.url}")`;
                visionCard.onclick = function() {
                    _this._showImageForVisionCardDisplay(card.url);
                }

                attemptDiv.appendChild(visionCard);
            });
            visionCardsContainer.appendChild(attemptDiv);
        });
    },

    /**
     * Shows the possible answers for the round
     * Shows the ghost the correct answer
     * 
     * TODO: also show the ghost what the psychic actually answered!
     */
    refreshChoices: function() {
        let choicesContainer = document.getElementById("choices");
        choicesContainer.innerHTML = "";

        let round = Main.player.psychics[this.selectedPsychicId].round;
        let choices = Choices.getChoices(round);
        let _this = this;
        choices.forEach(function(choice) {
            let choiceElement = dce("div", "choice");
            choiceElement.id = _this._getIdForChoice(choice.id);
            choiceElement.style["backgroundImage"] = `url("${choice.url}")`;

            let wasAlreadyChosen = ChoiceHistory.checkIfInHistory(_this.selectedPsychicId, round, choice.id);
            if (wasAlreadyChosen) {
                addCssClass(choiceElement, "already-chosen");
            }

            choiceElement.onclick = function() {
                if (_this.cardsSent[_this.selectedPsychicId]) {
                    // Don't do anything if we're done, just show the image that was clicked
                } else if (_this._playerType === PlayerType.PSYCHIC && wasAlreadyChosen) { 
                    if (_this._selectedAnswer) {
                        let selectedChoice = document.getElementById(_this._getIdForChoice(_this._selectedAnswer.id));
                        removeCssClass(selectedChoice, "choice-selected");
                        _this._selectedAnswer = null;
                    }
                } else if (_this._playerType === PlayerType.PSYCHIC) {
                    if (_this._selectedAnswer) {
                        let selectedChoice = document.getElementById(_this._getIdForChoice(_this._selectedAnswer.id));
                        removeCssClass(selectedChoice, "choice-selected");
                    }
                    _this._selectedAnswer = choice;
                    addCssClass(choiceElement, "choice-selected");
                }

                _this._showImageForChoiceDisplay(choice.url);
            };

            if (_this._selectedAnswer && _this._selectedAnswer.id === choice.id) {
                addCssClass(choiceElement, "choice-selected");
                _this._showImageForChoiceDisplay(choice.url);
            }

            if (_this._playerType === PlayerType.GHOST) {
                if (choice.answer === Number(_this.selectedPsychicId)) {
                    addCssClass(choiceElement, "choice-answer");
                }
                
                // Show the current answer
                //TODO: design this to instead look at the last element - and do so
                // if we get some sort of flag that the psychic sent something?
                // maybe "lastSentChoiceId" - and unset it between attempts?
                if (ChoiceHistory.history[_this.selectedPsychicId] &&
                    ChoiceHistory.history[_this.selectedPsychicId][round]) {
                    let historyData = ChoiceHistory.history[_this.selectedPsychicId][round];
                    if (_this._attempt[_this.selectedPsychicId] === historyData.length + 1 &&
                        historyData[historyData.length - 1] === choice.id) {
                            addCssClass(choiceElement, "choice-selected");
                    }
                }
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

    /**
     * Validates the vision card selection and either prompts to for a selection,
     * or asks the user whether they wish to proceed with sending
     */
     onSendVisionCardsClicked: function() {
        if (this.cardsSent[this.selectedPsychicId]) {
            return;
        }

        let numberOfCardsToSend = this._cardIdsToSend[this.selectedPsychicId].length;
        if (numberOfCardsToSend === 0) {
            ModalPopup.displayPopup("Select some vision cards to send by</br> right clicking them!");
            return;
        }

        ModalPopup.displayPopup(
            `Are you sure you want to send</br> these ${numberOfCardsToSend} cards?`,
            [
                { text: "Yes", callback: this.sendVisionCards.bind(this) },
                { text: "No" }
            ]
        );
    },

    /**
     * Sends the selected vision cards
     * TODO: ACTUALLY send the cards to the psychic!
     */
    sendVisionCards: function() {
        let cardsToSend = VisionCardDeck.replaceCards(this._cardIdsToSend[this.selectedPsychicId]);

        this.removeSelectedCardsToSend(this._cardIdsToSend[this.selectedPsychicId]);
        this._cardIdsToSend[this.selectedPsychicId] =  [];

        this.cardsSent[this.selectedPsychicId] = true;
        hideElement(document.getElementById("sendVisionCardsButton"));
        
        let round = Main.player.psychics[this.selectedPsychicId].round;
        VisionCardHistory.add(this.selectedPsychicId, round, this._attempt[this.selectedPsychicId], cardsToSend);
        //TODO: socket call to give the above data to the psychic, so they can add it to the history as well and refresh their page

        this._attempt[this.selectedPsychicId]++; //TODO: move this to a more general place, like when the attempt actually advances?
        this.refreshVisionCardsForGhost();
    },

    /**
     * Removes any entries from the cards to send that appear in the given array
     * Used to cull duplicates when sending cards or rerolling
     * @param {Array<Number>} cardIdsToRemove 
     */
    removeSelectedCardsToSend: function(cardIdsToRemove) {
        let _this = this;
        Object.keys(this._cardIdsToSend).forEach(function(psychicId) {
            let cardIdsArr = _this._cardIdsToSend[psychicId];
            cardIdsToRemove.forEach(function(idToRemove) {
                if (cardIdsArr.includes(idToRemove)) {
                    let index = cardIdsArr.indexOf(idToRemove);
                    cardIdsArr.splice(index, 1);
                }
            });
        });
    },

    /**
     * Validates that a choice is actually selected and then sents that choice to the ghost
     */
    onSendChoiceClicked: function() {
        if (this._playerType === PlayerType.GHOST) {
            return;
        }

        if (!this._selectedAnswer) {
            ModalPopup.displayPopup("Please click a previously unselected</br>answer first!");
            return;
        }


        let round = Main.player.psychics[this.selectedPsychicId].round;
        ChoiceHistory.add(this.selectedPsychicId, round, this._selectedAnswer.id)
        //TODO: socket call here with the above info to send to the ghost so their history can be updated as well

        this.cardsSent[this.selectedPsychicId] = true;
        this._selectedAnswer = null;

        this._attempt[this.selectedPsychicId]++; //TODO: move this to a more general place, like when the attempt actually advances?
        hideElement(document.getElementById("sendChoiceButton"));
    }
}