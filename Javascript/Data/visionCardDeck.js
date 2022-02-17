/**
 * Represents the current vision card deck that the ghost will use
 * Not used by the psychics
 */
let VisionCardDeck = {
    deck: [],
    currentCards: [],
    usedCards: [],

    /**
     * Resets the deck and creates a new one
     * Should only be calld when starting a new game completely
     */
    reset: function() {
        this.deck = [];
        this.currentCards = [];
        this.initialize();
    },

    /**
     * Initializes the deck and deals out the initial set of cards
     */
    initialize: function() {
        this.deck = this._getImageData(Settings.visionCardDeckSize);
        for (let i = 0; i < Settings.numberOfVisionCards; i++) {
            this.currentCards.push(this.deck.pop());
        }
    },

    /**
     * Replaces the given card ids and gets new cards from the deck
     * @param {Array<Number>} cardIdsToReplace - Uses the given card ids
     */
    replaceCards: function(cardIdsToReplace) {
        // Remove cards from the currentCards array and add them to usedCards
        let newCurrentCards = [];
        this.currentCards.forEach(function(card) {
            if (!cardIdsToReplace.includes(card.id)) {
                newCurrentCards = cardIdsToReplace;
            } else {
                usedCards.push(card);
            }
        });

        this.currentCards = newCurrentCards;

        // Deal out new cards from the deck
        for (let i = 0; i < cardIdsToReplace.length; i++) {
            this.currentCards.push(this._getNextCardFromDeck());
        }
    },

    /**
     * Gets the next card from the deck
     * Will shuffle the used cards if necessary
     */
    _getNextCardFromDeck: function() {
        if (this.deck.length === 0) {
            this.deck = this.usedCards.shuffle();
            this.usedCards = [];
        }

        return this.deck.pop();
    },

    /**
     * TODO: call some sort of API to get these images instead
     */
    _getImageData: function(numberOfImages) {
        let imageData = [];
        for (let i = 0; i < numberOfImages; i++) {
            imageData.push({
                id: i,
                url: Random.getRandomValueFromArray(StaticImages)
            });
        }
        return imageData.shuffle();
    }
};