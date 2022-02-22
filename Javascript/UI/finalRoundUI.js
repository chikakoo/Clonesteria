/**
 * Final round-specific UI elements
 * Note that the vision cards and some top bar buttons are still from GameUI
 */
let FinalRoundUI = {
    _gameUIToHideElementIds: [
        "psychicContainer", "sendChoiceButton", "sendVisionCardsButton", "previewButton",
        "choiceDisplay", "visionCardDisplay",
        "choices"
    ],
    _finalRoundElementIds: ["finalRoundPsychicContainer", "finalRoundSelections"],

    /**
     * Whether the game is in the final round
     */
    isActive: false,

    /**
     * The currently selected psychic
     */
    _selectedPsychicId: 0,

    /**
     * Whether the ghost sent the visions
     */
    didGhostSendVisions: false,

    /**
     * An array of selected vision card info, indexed by the selected psychic ids each element structured like so:
     * {
     *   0: <Card object>,
     *   ...
     * }
     */
    _visionCardInfo: [],

    /**
     * An array of the three received visions
     */
    receivedVisions: [],
    
    /**
     * The final submitted answer
     */
     finalAnswer: 0,

    /**
     * Resets the UI - should only be called between games
     */
    reset: function() {
        this._selectedPsychicId = 0;
        this.didGhostSendVisions = false;
        this.receivedVisions = [];
        this.finalAnswer = 0;

        hideElement(document.getElementById("finalRoundSubmit"));
        if (Main.player.type === PlayerType.GHOST) {
            showElement(document.getElementById("finalRoundSubmit"));
        }

        hideElement(document.getElementById("returnToLobby"));
        this._intializeVisionCardInfo();
        this.refreshPsychicContainer();
        this.refreshVisionCardSelectionContainer();
    },

    /**
     * Creates a blank _visionCardInfo object
     */
    _intializeVisionCardInfo: function() {
        const numberOfPsychics = 4;
        for (let i = 0; i < numberOfPsychics; i++) {
            let psychicSelections = {
                0: null,
                1: null,
                2: null
            };

            this._visionCardInfo.push(psychicSelections);
        }
    },

    /**
     * Creates the psychic container that the player/ghost can click on to see bigger images of
     */
    refreshPsychicContainer: function() {
        let psychicContainer = document.getElementById("finalRoundPsychicContainer");
        psychicContainer.innerHTML = "";

        let psychicData = Choices.getFinalRoundChoicesForPsychics();
        let _this = this;
        psychicData.forEach(function(data, index) {
            let psychicChoice = dce("div", "final-round-psychic");
            psychicContainer.appendChild(psychicChoice);

            psychicChoice.onclick = function() {                
                _this._selectedPsychicId = index;
                _this._fillChoiceCards(data);
                _this.refreshPsychicContainer();
                _this.refreshVisionCardSelectionContainer();
            }

            data.forEach(function(choice) {
                let imageElementContainer = dce("div", "final-round-psychic-image");
                let imageElement = Choices.createBaseChoiceElement(choice);
                imageElementContainer.appendChild(imageElement)
                psychicChoice.appendChild(imageElementContainer);

                if (_this._selectedPsychicId === index) {
                    if (!_this.didGhostSendVisions || Main.player.type === PlayerType.PSYCHIC) {
                        addCssClass(psychicChoice, "physic-selected");
                    }
                    
                    _this._fillChoiceCards(data);
                }

                let isGhostAndFinalSelection = _this.didGhostSendVisions && Main.player.type === PlayerType.GHOST && index === _this.finalAnswer;
                if (isGhostAndFinalSelection) {
                    addCssClass(psychicChoice, "physic-selected");
                }
            });
        });
    },

    /**
     * Create the vision card container where the cards can be dragged to
     */
     refreshVisionCardSelectionContainer: function() {
        if (this.didGhostSendVisions && Main.player.type === PlayerType.GHOST) { return; } // Don't update this once the final set is there

        let finalRoundVisionCardContainer = document.getElementById("finalRoundVisionCards");
        finalRoundVisionCardContainer.innerHTML = "";

        const rounds = 3;
        let _this = this;
        for (let i = 0; i < rounds; i++) {
            let visionCardElement = dce("div");

            if (Main.player.type === PlayerType.GHOST) {
                visionCardElement.ondragenter = function(event) { event.preventDefault(); };
                visionCardElement.ondragover = function(event) { event.preventDefault(); };
                visionCardElement.ondrop = function(event) {
                    if (this.didGhostSendVisions) { return; }
    
                    let visionCardId = Number(event.dataTransfer.getData("text/plain"));
                    let card = VisionCardDeck.getCurrentCardById(visionCardId);
                    visionCardElement.style["backgroundImage"] = `url("${card.url}")`;
    
                    // Null out any existing cards with ths key first
                    Object.keys(_this._visionCardInfo[_this._selectedPsychicId]).forEach(function(key) {
                        let card = _this._visionCardInfo[_this._selectedPsychicId][key];
                        if (card && card.id === visionCardId) {
                            _this._visionCardInfo[_this._selectedPsychicId][key] = null;
                            delete visionCardElement.style["backgroundImage"];
                        }
                    });
                    _this._visionCardInfo[_this._selectedPsychicId][i] = card;
                    _this.refreshVisionCardSelectionContainer();
                };

                if (_this._visionCardInfo[_this._selectedPsychicId][i]) {
                    let selectedCard = _this._visionCardInfo[_this._selectedPsychicId][i];
                    visionCardElement.style["backgroundImage"] = `url("${selectedCard.url}")`;
                }
            } else if (this.didGhostSendVisions && this.receivedVisions.length > 0) {
                visionCardElement.style["backgroundImage"] = `url("${this.receivedVisions[i].url}")`;
            }

            finalRoundVisionCardContainer.appendChild(visionCardElement);
        }
    },
    
    /**
     * Fills the choice cards with the selection
     * @param {Array<Any>} choiceData - the choice image data
     */
    _fillChoiceCards: function(choiceData) {
        choiceData.forEach(function(choice, index) {
            let baseElement = document.getElementById(`finalRoundSelection${index + 1}`);
            baseElement.innerHTML = "";

            let choiceImage = Choices.createBaseChoiceElement(choice);
            baseElement.appendChild(choiceImage);
        });
    },

    /**
     * Removes the given cards from all selections
     * @param {Array<Number>} cardIds - the card ids to remove
     */
    removeRerolledCards: function(cardIds) {
        this._visionCardInfo.forEach(function(psychicSelections) {
            Object.keys(psychicSelections).forEach(function(roundNumber) {
                let card = psychicSelections[roundNumber];
                if (card && cardIds.includes(card.id)) {
                    psychicSelections[roundNumber] = null;
                }
            });
        });

        this.refreshVisionCardSelectionContainer();
    },

    /**
     * Called when the submit button is clicked
     */
    onSubmit: function() {
        if (Main.player.type === PlayerType.GHOST) {
            let visions = Object.values(this._visionCardInfo[this._selectedPsychicId]);
            if (visions.some(card => card === null)) {
                ModalPopup.displayPopup("Please drag all visions to all three slots</br>before submitting!");
                return;
            }

            ModalPopup.displayPopup(
                "Submit this set of visions?",
                [
                    { text: "Yes", callback: this._submitVisions.bind(this, visions) },
                    { text: "No" }
                ]
            );
        } else {
            if (!this.didGhostSendVisions || this.receivedVisions.length === 0) {
                return;
            }

            ModalPopup.displayPopup(
                "Submit the currently selected set of cards?",
                [
                    { text: "Yes", callback: this._submitAnswer.bind(this) },
                    { text: "No" }
                ]
            );
        }
    },

    /**
     * Submits the visions to the psychic
     * @param {Array<Any>} visions - the visions
     */
    _submitVisions: function(visions) {
        hideElement(document.getElementById("finalRoundSubmit"));
        SocketClient.sendFinalVisionsToPsyshic(visions.shuffle(), this._selectedPsychicId);
        this.finalAnswer = this._selectedPsychicId;
        this.didGhostSendVisions = true;
    },

    /**
     * Submits the current answer
     */
    _submitAnswer: function() {
        hideElement(document.getElementById("finalRoundSubmit"));
        let wasGameWon = this._selectedPsychicId === this.finalAnswer;
        SocketClient.submitFinalAnswer(wasGameWon);
        this.onGameEnd(wasGameWon);
    },

    /**
     * Called when the game is over
     * @param {Number} victorious - whether the game was won
     */
    onGameEnd: function(victorious) {
        if (victorious) {
            ModalPopup.displayPopup("You win!</br>Detailed summary to come later...");
        } else {
            ModalPopup.displayPopup(`Better luck next time... the answer was psychic ${this.finalAnswer + 1}`);
        }

        showElement(document.getElementById("returnToLobby"));
    },

    /**
     * Allows the player to return to the lobby to start anew
     */
    onReturnToLobbyClicked: function() {
        this.hide();
        showElement(Main.roomLobbyElement);
        hideElement(Main.gameElement);
    },

    /**
     * Shows the UI, hiding the normal GameUI elements
     */
    show: function() {
        this.isActive = true;
        this._gameUIToHideElementIds.forEach(id => hideElement(document.getElementById(id)));
        this._finalRoundElementIds.forEach(id => showElement(document.getElementById(id)));
    },

    /**
     * Hides the UI, bringing back the normal GameUI elements
     */
    hide: function() {
        this.isActive = false;
        this._gameUIToHideElementIds.forEach(id => showElement(document.getElementById(id)));
        this._finalRoundElementIds.forEach(id => hideElement(document.getElementById(id)));
    }
};