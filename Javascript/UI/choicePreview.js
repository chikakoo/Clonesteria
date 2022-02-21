/**
 * The UI that allows the ghost to see the upcoming answers
 */
let ChoicePreview = {
    /**
     * Resets the UI to the current choices
     * Should only be called when starting a new game
     */
    reset: function() {
        document.getElementById("previewHeaders").innerHTML = "";
        document.getElementById("previewChoices").innerHTML = "";

        let previewButton = document.getElementById("previewButton");
        hideElement(previewButton);

        if (Main.player.type === PlayerType.GHOST) {
            showElement(previewButton);
        }

        this._addChoiceHeaders();
        this._addChoiceImages();
    },

    /**
     * Adds the headers to the UI
     */
    _addChoiceHeaders: function() {
        let previewHeaders = document.getElementById("previewHeaders");
        for (let i = 0; i < Settings.numberOfPsychics; i++) {
            let headerElement = dce("div", "choice-preview-header");
            headerElement.innerText = `Psychic ${i + 1}`;
            previewHeaders.appendChild(headerElement);
        }
    },

    /**
     * Adds the choice images to the UI
     */
    _addChoiceImages: function() {
        let previewChoices = document.getElementById("previewChoices");
        Object.values(Choices.choices).forEach(function(choices) {
            let roundContainer = dce("div", "choice-round-container")
            previewChoices.appendChild(roundContainer);

            let sortedChoices = Choices.getChoicesForFinalRound(choices, true);
            sortedChoices.forEach(function(choice, index) {
                let choiceElement = Choices.createBaseChoiceElement(choice);
                roundContainer.appendChild(choiceElement);
            });
        });
    },

    /**
     * Shows the UI
     */
    show: function() {
        showElement(document.getElementById("choicePreview"));
    },

    /**
     * Hides the UI
     */
    hide: function() {
        hideElement(document.getElementById("choicePreview"));
    }
};