/**
 * The player types
 * TODO: move this into a separate file probably
 */
 let PlayerType = {
    GHOST: 0,
    PSYCHIC: 1
}

let Settings = {
    debug: {
        enabled: true,
        playerType: PlayerType.GHOST,
        startingRound: 1 // 0-indexed (0 = suspect; 1 = location; 2 = weapon/story; 3 = final)
    },
    numberOfRerolls: 3,
    numberOfVisionCards: 8,
    numberOfChoices: 5,
    visionCardDeckSize: 100,
    useStories: false // As opposed to weapons
};

let StaticImages = [
    "https://wallpaperaccess.com/full/154009.jpg",
    "https://www.wikihow.com/images/thumb/b/b5/Write-a-Business-Letter-Step-1-Version-5.jpg/aid95752-v4-728px-Write-a-Business-Letter-Step-1-Version-5.jpg"
];