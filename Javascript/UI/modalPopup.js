/**
 * A modal popup that disallows the screen from being interacted with until an
 * option is selected
 */
let ModalPopup = {
    /**
     * The class used to indicate that elements are above the modal popup
     */
    _elevateCssClass: "aboveModal",

    /**
     * The description to show to the user - can accept HTML and will
     * need to contian line breaks
     */
    description: "",

    /**
     * Whether to override the hide functionality on button press
     * Is re-disabled when hidden
     */
    overrideHide: false,

    /**
     * An array of button options - contains objects of the following:
     * - text: <String>
     * - callback: <Function>
     * 
     * Note that all callbacks will also close the popup by default
     * Passing nothing to callback will only close the pop
     */
    buttonOptions: [],

    /**
     * An array of HTML elements that will be elevated above the modal popup
     * so they can still be interacted with
     * 
     * Used when the popup version of this is not used
     */
    elementsToElevate: [],

    /**
     * Displays the popup with the given options passed in
     * @param {String} description 
     * @param {Array<Object>} buttonOptions 
     * @param {Boolean} overrideHide
     */
    displayPopup: function(description, buttonOptions, overrideHide) {
        if (!buttonOptions || buttonOptions.length === 0) {
            buttonOptions = [{ text: "OK" }];
        }

        this.overrideHide = overrideHide;
        this.description = description;
        this.buttonOptions = buttonOptions;

        document.getElementById("modalDescription").innerHTML = description;
        this._createAndAddButtons();

        showElement(document.getElementById("modalPopup"));
        this._show();
    },

    /**
     * Displays the popup with the given elements elevated
     * @param {Array<HTMLElement>} elementsToElevate - an array of HTML elements to show above the popup
     */
    displayElevatedElements: function(elementsToElevate) {
        this.elementsToElevate = elementsToElevate;

        _this = this;
        this.elementsToElevate.forEach(function(element) {
            addCssClass(element, _this._elevateCssClass);
        });

        this._show();
    },

    /**
     * Creates and adds the button elements to the popup
     */
    _createAndAddButtons: function() {
        let buttonContainer = document.getElementById("modalButtonContainer");
        buttonContainer.innerHTML = "";

        let _this = this;
        this.buttonOptions.forEach(function(option) {
            let modalButton = dce("button", "modal-button");
            modalButton.innerText = option.text;
            modalButton.onclick = function() {
                if (!_this.overrideHide) {
                    _this.hide();
                }
                
                if (option.callback) {
                    option.callback();
                }
            }

            buttonContainer.appendChild(modalButton);
        });
    },

    /**
     * Hides the popup
     * Also the description/buttonOptions/elevatedElements as well
     */
    hide: function() {
        this._deElevateElements();

        this.description = "";
        this.overrideHide = false;
        this.buttonOptions = [];
        this.elementsToElevate = [];
        hideElement(document.getElementById("modalScreen"));
        hideElement(document.getElementById("modalPopup"));
    },

    /**
     * Removes the CSS class from all the elements that were elevated
     */
    _deElevateElements: function() {
        let _this = this;
        this.elementsToElevate.forEach(function(element) {
            removeCssClass(element, _this._elevateCssClass);
        });
    },

    /**
     * Shows the popup
     */
    _show: function() {
        showElement(document.getElementById("modalScreen"));
    }
}