/**
 * This is the screen that the host will choose settings for before
 * starting the actual game
 * 
 * TODO: add the configurable settings here
 */
let Lobby = {
    /**
     * The currently selected player
     */
    selectedPlayerType: null,

    /**
     * Sets up the lobby for the first time play
     */
    initialize: function() {
        if (!Main.isClient) {
            this.selectedPlayerType = PlayerType.GHOST;
            this.refreshPlayerTypeUI();
        } else {
            SocketClient.getPlayerType();
        }
    },

    /**
     * Called when the player type is being changed - only the host can do this
     * @param {Event} event - unused
     * @param {Number} playerType - the player type to change to
     */
    onPlayerTypeSelected: function(event, playerType) {
        if (Main.isClient || this.selectedPlayerType === playerType) {
            return;
        }

        this.selectedPlayerType = playerType;

        SocketClient.sendPlayerType(this.getOtherPlayerType());
        this.refreshPlayerTypeUI();
    },

    /**
     * Returns the player type opposite to the current one
     * @returns
     */
    getOtherPlayerType: function() {
        return this.selectedPlayerType === PlayerType.GHOST 
            ? PlayerType.PSYCHIC 
            : PlayerType.GHOST;
    },

    /**
     * Refreshes the UI for the player type
     */
    refreshPlayerTypeUI: function() {
        let ghostElement = document.getElementById("ghostSelection");
        let psychicElement = document.getElementById("psychicSelection");
        const selectedCssClass = "type-selected";

        removeCssClass(ghostElement, selectedCssClass);
        removeCssClass(psychicElement, selectedCssClass);

        if (this.selectedPlayerType === PlayerType.GHOST) {
            addCssClass(ghostElement, selectedCssClass);
        } else {
            addCssClass(psychicElement, selectedCssClass);
        }
    }
};