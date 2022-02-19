/**
 * Retrieves a random name for each encounter
 */
let UnsplashAPI = {
    key:"Put your Unsplash Access Key Here",
    numberOfPhotos: 30,
    visionCardIdCount: 0,

    Topics: {
        ARCHITECTURE: "rnSKDHwwYUk",
        EXPERIMENTAL: "qPYsDzvJOYc",
        INTERIORS: "R_Fyn-Gwtlw",
        PEOPLE: "towJZFskpGg",
        STREET_PHOTOGRAPHY: "xHxYTMHLgOc",
        TRAVEL: "Fzo3zuOHN6w"
    },
    
    getVisionCardImages: async function(){
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

    getSceneCardImages: async function(){
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

    getWeaponCardImages: async function(){
        
        let parameters = [
            {
                property: "query", 
                value: "objects"
            }
        ];
    },
    

    _getImageURLs: async function(parameters){

        const response = await fetch(this._buildURL(parameters));
		const jsonResponse = await response.json();
        let imageUrls = [];
		
        let _this=this;
        jsonResponse.forEach(function(photo){
                imageUrls.push(
                    {
                        id: _this.visionCardIdCount, 
                        url: photo.urls.small
                    }
                );

                _this.visionCardIdCount++;
            }
        );

        return imageUrls;
        
    },

    /**
     * 
     * @param {Array<Any>} apiParameters 
     * @returns 
     */
    _buildURL: function(apiParameters){
        let apiURL = `https://api.unsplash.com/photos/random?client_id=${this.key}&count=${this.numberOfPhotos}`;

        apiParameters.forEach(function(parameter){
            apiURL += `&${parameter.property}=${parameter.value}`
        });

        return apiURL;
    }

}