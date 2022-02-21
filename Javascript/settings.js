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
    "https://www.wikihow.com/images/thumb/b/b5/Write-a-Business-Letter-Step-1-Version-5.jpg/aid95752-v4-728px-Write-a-Business-Letter-Step-1-Version-5.jpg",
    "https://rlv.zcache.com/space_background_planets_of_the_solar_system_roc_fleece_blanket-r28628b9c05aa4a3b8c532a936e3d19d8_zke88_307.jpg",
    "https://cdn.shopify.com/s/files/1/1536/4459/products/KayeBlegvad_Blankets_Comets_1024x1024.png?v=1604075279",
    "https://cdn.shopify.com/s/files/1/1536/4459/products/KayeBlegvad_Blankets_Sunscape_1024x1024.png?v=1604075061"
];

let Settings = {
    debug: {
        enabled: false,
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
    startAtTheEnd: false,
    useStaticImages: true,
    numberOfRerolls: 3,
    numberOfVisionCards: 7,
    numberOfChoices: 5,
    numberOfFinalRoundChoices: 4, // MUST be <= numberOfChoices! 
    numberOfPsychics: 2, // MUST be <= number of choices
    visionCardDeckSize: 100,
    useStories: false // As opposed to weapons
};