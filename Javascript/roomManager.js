/**
 * Deals with the rooms of the server, including joining and displaying them
 */
let RoomManager = {
    /**
     * Creates and joins the new server room
     */
    onCreateRoomClicked: function() {
        let errorDiv = document.getElementById("errors");
        hideElement(errorDiv);

        let roomAndUsername = this._getRoomAndUsername();
        if (!roomAndUsername) {
            return;
        }

        SocketClient.createRoom(roomAndUsername.roomName, roomAndUsername.username);
    },

    /**
     * Updates the list of rooms to join
     */
    updateRoomList: function(roomList) {
        let roomListDiv = document.getElementById("roomList");
        roomListDiv.innerHTML = "";

        roomList.forEach(function(roomName) {
            let roomButton = dce("button");
            roomButton.innerText = roomName;

            roomButton.onclick = function() {
                let roomAndUsername = RoomManager._getRoomAndUsername(true);
                if (!roomAndUsername) {
                    return;
                }
                SocketClient.joinRoom(roomButton.innerText, roomAndUsername.username);
            }
            roomListDiv.appendChild(roomButton);
        });
    },

    /**
     * Gets the room and user name - includes showing errors if necessary
     * @skipRoomName - pass true if you only want the username
     * @return - the room and username in an object (roomName, username as properties); falsey if there's a problem
     */
    _getRoomAndUsername: function(skipRoomName) {
        let roomName = document.getElementById("inputRoomName").value;
        if (!roomName && !skipRoomName) {
            this._showError("Please enter a room name!");
            return null;
        }

        let username = document.getElementById("inputUsername").value;
        if (!username) {
            this._showError("Please enter a username!");
            return null;
        }

        return { roomName: roomName, username: username };
    },

    /**
     * Shows an error in the error div
     * @param error - the error message
     */
    _showError: function(error) {
        let errorDiv = document.getElementById("errors");
        errorDiv.innerText = error;
        showElement(errorDiv);
    },

    /**
     * Called when a room is joined
     * @param roomname - the name of the room
     */
    onRoomJoined: function(roomName) {
        Main.roomName = roomName;
        Main.currentLevel = 1;

        hideElement(document.getElementById("preRoomJoin"));
        showElement(document.getElementById("roomLobby"));
        document.getElementById("startGame").setAttribute("disabled", "");

        SocketClient.updateConnectedUsernames();
    },
};