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
    reset: async function() {
        this.deck = [];
        this.currentCards = [];
        await this.initialize();
    },

    /**
     * Initializes the deck and deals out the initial set of cards
     */
    initialize: async function() {
        this.deck = await this._getImageData();
        for (let i = 0; i < Settings.numberOfVisionCards; i++) {
            this.currentCards.push(this.deck.pop());
        }
    },

    /**
     * Replaces the given card ids and gets new cards from the deck
     * @param {Array<Number>} cardIdsToReplace - Uses the given card ids
     * @return An array of the card objects replaced, containing the url of the card - used for card history
     */
    replaceCards: async function(cardIdsToReplace) {
        // Remove cards from the currentCards array and add them to usedCards
        let newCurrentCards = [];
        let removedCards = [];
        let _this = this;
        this.currentCards.forEach(function(card) {
            if (!cardIdsToReplace.includes(card.id)) {
                newCurrentCards.push(card);
            } else {
                _this.usedCards.push(card);
                removedCards.push({ url: card.url });
            }
        });

        this.currentCards = newCurrentCards;

        // Deal out new cards from the deck
        for (let i = 0; i < cardIdsToReplace.length; i++) {
            this.currentCards.push(await this._getNextCardFromDeck());
        }

        return removedCards;
    },

    /**
     * Gets the next card from the deck
     * Will shuffle the used cards if necessary
     */
    _getNextCardFromDeck: async function() {
        if (this.deck.length === 0) {
            this.deck = await this._getImageData();
        }

        return this.deck.pop();
    },

    /**
     * TODO: call some sort of API to get these images instead
     */
    _getImageData: async function() {
        return await UnsplashAPI.getVisionCardImages();
    }
};