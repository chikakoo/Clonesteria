/**
 * Retrieves a random name for each encounter
 */
let UnsplashAPI = {
    key: SecretSettings.UnsplashAPIKey1,
    numberOfPhotos: 30,
    visionCardIdCount: 0,

    /**
     * Arrays of the current images
     */
    _visionCardImageBank: [],
    _sceneCardImageBank: [],

    //TODO; if this is going to be objects, maybe this should be more generic and also used by the suspect cards?
    _weaponCardImageBank: [], 

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
     * Gets the next vision card image data - will request 30 more if it's empty
     * @returns An image in the form { id: <Number>, url: <String> }
     */
    getVisionCardImage: async function() {
        if (this._visionCardImageBank.length > 0) {
            return this._visionCardImageBank.pop();
        }

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

        this._visionCardImageBank = await this._getImageURLs(parameters);
        return this._visionCardImageBank.pop();
    },

    /**
     * Returns the next susepct card image data
     * The array of urls will be parsed into the image by the UI code
     * @returns An array of suspect card images in the form { urls: <Array<String>> }
     */
    getSuspectCardImage: async function() {
        //TODO: this logic - probably another bank of object images to use here as well

        // This is just for a test - remove this!
        return {
            urls: [Random.getRandomValueFromArray(StaticImages), Random.getRandomValueFromArray(StaticImages)]
        };
    },

    /**
     * Gets the next scene card image data - will request 30 more if it's empty
     * @returns An image in the form { id: <Number>, url: <String> }
     */
    getSceneCardImage: async function() {
        if (this._sceneCardImageBank.length > 0) {
            return this._sceneCardImageBank.pop();
        }

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

        this._sceneCardImageBank = await this._getImageURLs(parameters, true); //TODO: remove the second param when done
        return this._sceneCardImageBank.pop();
    },

    /**
     * Gets a list of weapon card images
     * @returns An image in the form { id: <Number>, url: <String> }
     */
    getWeaponCardImage: async function() {
        if (this._weaponCardImageBank.length > 0) {
            return this._sceneCardImageBank.pop();
        }

        let parameters = [
            {
                property: "query", 
                value: "objects"
            }
        ];

        this._weaponCardImageBank = await this._getImageURLs(parameters, true); //TODO: remove the second param when done
        return this._weaponCardImageBank.pop();
    },

    /**
     * Gets a list of image urls - uses the static images if appropriate
     * @param {Array<Any>} parameters - the parameters to pass to the api 
     * @returns An array of images in the form { id: <Number>, url: <String> }
     */
    _getImageURLs: async function(parameters, forceStaticImages) { //TODO: remove the second param when done - just for testing
        if (Settings.useStaticImages || forceStaticImages) {
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