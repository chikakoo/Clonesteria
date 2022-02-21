let GameUI = {
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
     */
    startRound: function() {
        hideElement(Main.preRoomJoinElement);
        hideElement(Main.roomLobbyElement);
        showElement(Main.gameElement);

        this._playerType = Main.player.type;
        this.selectedPsychicId = Object.keys(Main.player.psychics)[0];

        this._cardIdsToSend = {};
        this._selectedAnswer = null;

        let _this = this;
        Object.keys(Main.player.psychics).forEach(function(psychicId) {
            _this._cardIdsToSend[psychicId] = [];
            if (!_this._attempt[psychicId]) {
                _this._attempt[psychicId] = 1;
            }
        });

        this._initializePsychicContainer();
        this._initializeUIForSelectedPsychic();
    },

    /**
     * Initializes the psychic container with the list of psychics
     */
    _initializePsychicContainer: function() {
        let psychicContainer = document.getElementById("psychicContainer");
        psychicContainer.innerHTML = "";

        let _this = this;
        Object.keys(Main.player.psychics).forEach(function psychicIds(id) {
            let psychicButton = dce("div", "psychic-button");
            psychicButton.id = _this._getIdForPsychic(id);
            psychicButton.innerText = Number(id) + 1;
            psychicButton.onclick = function() {
                if (_this.selectedPsychicId !== id) {
                    _this.selectedPsychicId = id;
                    _this._initializeUIForSelectedPsychic();
                }
            }
            
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
        this.refreshPsychicUI();
        this._initializeVisionCards();
        this.refreshChoices();
    },

    /**
     * Refresh the styles so that the currently selected psychic shows up correctly
     */
    refreshPsychicUI: function() {
        let _this = this;
        Object.keys(Main.player.psychics).forEach(function psychicIds(id) {
            let elementId = _this._getIdForPsychic(id);
            let psychicButton = document.getElementById(elementId);

            _this._setPsychicImage(psychicButton, Main.player.psychics[id].state);
            removeCssClass(psychicButton, "selected-psychic");
            if (_this.selectedPsychicId === id) {
                addCssClass(psychicButton, "selected-psychic");
            }
        });

        //TODO: put these in their own function
        if (this._playerType == PlayerType.GHOST) {
            let visionCardsButton = document.getElementById("sendVisionCardsButton");
            addOrRemoveCssClass(visionCardsButton, "disabled-send-button", this.didSelectedPsychicReceiveVisionCards());
            showElement(visionCardsButton);
            hideElement(document.getElementById("sendChoiceButton"));
        } else {
            let sendChoiceButton = document.getElementById("sendChoiceButton");
            addOrRemoveCssClass(sendChoiceButton, "disabled-send-button", !this.isSelectedPsychicSendingChoice())
            showElement(sendChoiceButton);
            hideElement(document.getElementById("sendVisionCardsButton"));
        }
    },

    /**
     * Sets the psychic image for the given button, based on the given state
     * @param {HTMLElement} psychicButton - the button to set the image on
     */
    _setPsychicImage: function(psychicButton, state) {
        let classToAdd = "";
        switch(state) {
            case States.Rounds.PRE_VISION:
                classToAdd = "pre-vision";
                break;
            case States.Rounds.POST_VISION:
                classToAdd = "post-vision";
                break;
            case States.Rounds.POST_ANSWER:
                classToAdd = "post-answer";
                break;
        }

        addCssClass(psychicButton, classToAdd);
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
                if (!Reroll.rerolling && !_this.didSelectedPsychicReceiveVisionCards()) {
                    _this._addOrRemoveSelectedCardIDFormArray(
                        card.id, visionCard, _this._cardIdsToSend[_this.selectedPsychicId], "selected-for-sending");
                }
            };

            visionCardsContainer.appendChild(visionCard);
        });
    },

    /**
     * Returns whether the current selected psychic received their vision cards
     */
    didSelectedPsychicReceiveVisionCards: function() {
        return Main.getPsychicState(this.selectedPsychicId) !== States.Rounds.PRE_VISION;
    },

    /**
     * Returns whether the current selected psychic is currently sending their choice
     */
    isSelectedPsychicSendingChoice: function() {
        return Main.getPsychicState(this.selectedPsychicId) === States.Rounds.POST_VISION;
    },

    /**
     * Returns whether the current selected psychic received their vision cards
     */
    didSelectedPsychicSendChoice: function() {
        return Main.getPsychicState(this.selectedPsychicId) === States.Rounds.POST_ANSWER;
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
            let choiceElement = Choices.createBaseChoiceElement(choice, _this._getIdForChoice(choice.id));

            if (_this._shouldDisableChoice(round, choice)) {
                addCssClass(choiceElement, "already-chosen");
            }

            choiceElement.onclick = function() {
                let wasAlreadyChosen = ChoiceHistory.checkIfInHistory(_this.selectedPsychicId, round, choice.id);

                if (_this.didSelectedPsychicSendChoice()) {
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

                _this._showImageForChoiceDisplay(choice);
            };

            if (_this._selectedAnswer && _this._selectedAnswer.id === choice.id) {
                addCssClass(choiceElement, "choice-selected");
                _this._showImageForChoiceDisplay(choice);
            }
            
            if (_this.didSelectedPsychicSendChoice()) {
                let lastAnswerData = ChoiceHistory.history[_this.selectedPsychicId][round];
                let lastAnswerId = lastAnswerData[lastAnswerData.length - 1];

                if (lastAnswerId === choice.id) {
                    addCssClass(choiceElement, "choice-selected");
                }
            }

            if (_this._playerType === PlayerType.GHOST) {
                if (choice.answer === Number(_this.selectedPsychicId)) {
                    addCssClass(choiceElement, "choice-answer");
                }
            }

            choicesContainer.appendChild(choiceElement);
        });
    },

    /**
     * Gets whether the choice should be disabled - 2 criteria
     * - the choice wasn't already chosen on an earlier round
     * - the choice wasn't an answer for another psychic
     * @param {Number} round - the current round
     * @param {Any} choice - the choice to check
     */
    _shouldDisableChoice: function(round, choice) {
        let otherPsychics = Object.keys(Main.player.psychics);
        let index = otherPsychics.indexOf(this.selectedPsychicId);
        otherPsychics.splice(index, 1);

        let wasOtherPsychicAnswer = false;
        otherPsychics.forEach(function(psychicId) {
            let isPsychicPassedThisRound = Main.player.psychics[psychicId].round > round;
            if (isPsychicPassedThisRound && choice.answer === Number(psychicId)) {
                wasOtherPsychicAnswer = true;
            }
        });

        let wasAlreadyChosen = ChoiceHistory.checkIfInHistory(this.selectedPsychicId, round, choice.id);
        return wasOtherPsychicAnswer || wasAlreadyChosen;
    },

    /**
     * Shows the given image on the main display
     * @param {String} choice - the choice to display
     */ 
     _showImageForChoiceDisplay: function(choice) {
        let choiceDisplay = document.getElementById("choiceDisplay");
        choiceDisplay.innerHTML = "";

        let elementId = `${this._getIdForChoice(choice.id)}-display`;
        let choiceElement = Choices.createBaseChoiceElement(choice, elementId);
        choiceDisplay.appendChild(choiceElement);
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
     onSendVisionCardsClicked: async function() {
        if (this.didSelectedPsychicReceiveVisionCards() || this._playerType === PlayerType.PSYCHIC) {
            return;
        }

        let numberOfCardsToSend = this._cardIdsToSend[this.selectedPsychicId].length;
        if (numberOfCardsToSend === 0) {
            ModalPopup.displayPopup("Select some vision cards to send by</br> right clicking them!");
            return;
        }

        let message = numberOfCardsToSend === 1 
            ? `Are you sure you want to send</br>this ${numberOfCardsToSend} card?`
            : `Are you sure you want to send</br>these ${numberOfCardsToSend} cards?`;
        ModalPopup.displayPopup(
            message,
            [
                { text: "Yes", callback: await this.sendVisionCards.bind(this) },
                { text: "No" }
            ]
        );
    },

    /**
     * Sends the selected vision cards
     */
    sendVisionCards: async function() {
        let cardsToSend = await VisionCardDeck.replaceCards(this._cardIdsToSend[this.selectedPsychicId]);

        this.removeSelectedCardsToSend(this._cardIdsToSend[this.selectedPsychicId]);
        this._cardIdsToSend[this.selectedPsychicId] =  [];
        
        let round = Main.player.psychics[this.selectedPsychicId].round;
        let attempt = this._attempt[this.selectedPsychicId]
        VisionCardHistory.add(this.selectedPsychicId, round, attempt, cardsToSend);
        SocketClient.sendVisionsToPsychic(this.selectedPsychicId, round, attempt, cardsToSend);

        Main.setPsychicState(this.selectedPsychicId, States.Rounds.POST_VISION);
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
     * Validates that a choice is actually selected and then sends that choice to the ghost
     */
    onSendChoiceClicked: function() {
        if (!this.isSelectedPsychicSendingChoice() || this._playerType === PlayerType.GHOST) {
            return;
        }

        if (!this._selectedAnswer) {
            ModalPopup.displayPopup("Please click a previously unselected</br>answer first!");
            return;
        }

        ModalPopup.displayPopup(
            `Are you sure you want to send</br>your current selection?`,
            [
                { text: "Yes", callback: this.sendChoice.bind(this) },
                { text: "No" }
            ]
        )
    },

    /**
     * Sends the selected choice to the ghost
     */
    sendChoice: function() {
        let round = Main.player.psychics[this.selectedPsychicId].round;
        ChoiceHistory.add(this.selectedPsychicId, round, this._selectedAnswer.id)
        SocketClient.sendChoiceToGhost(this.selectedPsychicId, round, this._selectedAnswer.id);

        this._selectedAnswer = null;

        Main.setPsychicState(this.selectedPsychicId, States.Rounds.POST_ANSWER);
        this.checkForRoundEnd();
    },

    /**
     * Checks whether the round should end
     * Increments the psychic's round if necessary
     * Also sets the attempt values appropriately
     */
    checkForRoundEnd: function() {
        if (Main.areAllChoicesSent()) {
            let results = "<strong>Results</strong>";
            let _this = this;
            Object.keys(Main.player.psychics).forEach(function(psychicId) {
                let round = Main.getPsychicRound(psychicId);
                let latestAnswer = ChoiceHistory.getLatestAnswer(psychicId, round);
                let isCorrect = Choices.checkAnswer(psychicId, round, latestAnswer);
                let resultsString = isCorrect
                    ? "CORRECT! :D"
                    : "INCORRECT! D:"

                results += `<br/>Psychic ${Number(psychicId) + 1}: ${resultsString}`;

                if (isCorrect) {
                    _this._attempt[psychicId] = 1;
                    Main.advancePsychicRound(psychicId);
                } else {
                    _this._attempt[psychicId]++;
                }
            });

            if (Main.isClient) {
                ModalPopup.displayPopup(results,  [{ text: "Waiting for host..." }], true);
            } else {
                ModalPopup.displayPopup(
                    results, 
                    [{ text: "Next Round!", callback: this.startNextRound }]
                );
            }
        }
    },

    /**
     * Starts the next round
     */
    startNextRound: function() {
        SocketClient.nextRound();
        Main.nextRound();
    }
}