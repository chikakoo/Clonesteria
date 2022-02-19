/**
 * Retrieves a random name for each encounter
 */
let UnsplashAPI = {
    key: SecretSettings.UnsplashAPIKey1,
    numberOfPhotos: 30,
    visionCardIdCount: 0,

    /**
     * The topic ids from Unsplash
     */
    Topics: {
        ARCHITECTURE: "rnSKDHwwYUk",
        EXPERIMENTAL: "qPYsDzvJOYc",
        INTERIORS: "R_Fyn-Gwtlw",
        PEOPLE: "towJZFskpGg",
        STREET_PHOTOGRAPHY: "xHxYTMHLgOc",
        TRAVEL: "Fzo3zuOHN6w"
    },
    
    /**
     * Gets a list of vision card images
     * @returns An array of images in the form { id: <Number>, url: <String> }
     */
    getVisionCardImages: async function() {
        let parameters = [
            {
                property: "topics", 
                value: this.Topics.EXPERIMENTAL
            }, 
            {
                property: "orientation",
                value: "portrait"
            }
        ];

       return await this._getImageURLs(parameters);
    },

    /**
     * Gets a list of scene  card images
     * @returns An array of images in the form { id: <Number>, url: <String> }
     */
    getSceneCardImages: async function() {
        let parameters = [
            {
                property: "topics", 
                value: `${this.Topics.ARCHITECTURE}, ${this.Topics.INTERIORS}, ${this.Topics.STREET_PHOTOGRAPHY}, ${this.Topics.TRAVEL}`
            }, 
            {
                property: "orientation",
                value: "landscape"
            }
        ];
    },

    /**
     * Gets a list of weapon card images
     * @returns An array of images in the form { id: <Number>, url: <String> }
     */
    getWeaponCardImages: async function() {
        let parameters = [
            {
                property: "query", 
                value: "objects"
            }
        ];
    },

    /**
     * Gets a list of image urls - uses the static images if appropriate
     * @param {Array<Any>} parameters - the parameters to pass to the api 
     * @returns An array of images in the form { id: <Number>, url: <String> }
     */
    _getImageURLs: async function(parameters) {
        if (Settings.useStaticImages) {
            return this._getStaticImages();
        }

        const response = await fetch(this._buildURL(parameters));
		const jsonResponse = await response.json();
        let imageUrls = [];
		
        let _this = this;
        jsonResponse.forEach(function(photo){
            imageUrls.push(
                {
                    id: _this.visionCardIdCount, 
                    url: photo.urls.small
                }
            );

            _this.visionCardIdCount++;
        });

        return imageUrls;
    },

    /**
     * Randomly gets a list of static images
     */
    _getStaticImages: function() {
        let imageData = [];
        for (let i = 0; i < this.numberOfPhotos; i++) {
            imageData.push({
                id: i,
                url: Random.getRandomValueFromArray(StaticImages)
            });
        }
        return imageData;
    },

    /**
     * 
     * @param {Array<Any>} apiParameters - the parameters to pass to the api 
     * @returns The built URL given the parameters
     */
    _buildURL: function(apiParameters) {
        let apiURL = `https://api.unsplash.com/photos/random?client_id=${this.key}&count=${this.numberOfPhotos}`;

        apiParameters.forEach(function(parameter){
            apiURL += `&${parameter.property}=${parameter.value}`
        });

        return apiURL;
    }
}