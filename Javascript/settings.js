/**
 * The player types
 * TODO: move this into a separate file probably
 */
 let PlayerType = {
    GHOST: 0,
    PSYCHIC: 1
}

let StaticImages = [
    "https://wallpaperaccess.com/full/154009.jpg",
    "https://www.wikihow.com/images/thumb/b/b5/Write-a-Business-Letter-Step-1-Version-5.jpg/aid95752-v4-728px-Write-a-Business-Letter-Step-1-Version-5.jpg"
];

let Settings = {
    debug: {
        enabled: true,
        playerType: PlayerType.GHOST,
        //playerType: PlayerType.PSYCHIC,
        startingRound: 1, // (1 = suspect; 2 = location; 3 = weapon/story; 4 = final)
        startingVisionCardHistory: {
            // 0: { // psychic id
            //     1: { // round
            //         1: [ // attempt
            //             { url: StaticImages[0] }, 
            //             { url: StaticImages[1] }
            //         ],
            //         2: [{ url: StaticImages[0] }]
            //     }
            // }
        },
        startingChoiceHistory: {
            // 0: { // psychic id
            //     1: [ // round
            //         0, 3 // Ids already chosen
            //     ] 
            // }
        }
    },
    useStaticImages: true,
    numberOfRerolls: 3,
    numberOfVisionCards: 8,
    numberOfChoices: 5,
    numberOfPsychics: 2, //TODO: this isn't really used where it should be
    visionCardDeckSize: 100,
    useStories: false // As opposed to weapons
};