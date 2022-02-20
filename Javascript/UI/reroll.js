/**
 * The reroll button
 */
let Reroll = {
    /**
     * The number of rerolls remaining
     */
    rerolls: 0,

    /**
     * Indicates whether we're currently rerolling
     */
    rerolling: false,

    /**
     * The IDs of the cards selected for reroll
     */
    selectedCardIds: [],

    /**
     * Reset the reroll count
     * Should only be called when the game is restarting
     */
    reset: function() {
        this.rerolls = Settings.numberOfRerolls;
        this.refreshText();
    },

    /**
     * Iuitializes the reroll UI
     */
     refreshText: function() {
        document.getElementById("rerolls").innerText = this.rerolls;
    },

    /**
     * Puts the game into a state where cards can be selected for rerolling
     * Does not allow the psychic to enter this state
     */
    onRerollClicked: async function() {
        if (Main.player.type !== PlayerType.GHOST || GameUI.didSelectedPsychicReceiveVisionCards() || this.rerolls <= 0) {
            this.rerolling = false;
            return;
        }

        if (!this.rerolling) {
            ModalPopup.displayElevatedElements([ 
                document.getElementById("rerolls"),
                document.getElementById("visionCards") 
            ]);
        } else {
            if (this.selectedCardIds.length !== 0) {
                this.rerolls--;
                await VisionCardDeck.replaceCards(this.selectedCardIds);
            }
            
            ModalPopup.hide();
        }

        
        this.rerolling = !this.rerolling;
        GameUI.removeSelectedCardsToSend(this.selectedCardIds);
        GameUI.refreshVisionCardsForGhost();
        this.selectedCardIds = [];
        this.refreshText();
    }
}