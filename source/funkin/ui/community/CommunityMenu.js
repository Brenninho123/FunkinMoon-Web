class CommunityMenu {
    constructor(engine) {
        this.engine = engine;
        this.discord = null;
        this.online = null;
        this.rooms = [];
        this.selectedRoomIndex = 0;
        this.isActive = false;
    }

    create() {
        this.isActive = true;
        
        if (typeof DiscordLogin !== 'undefined') {
            this.discord = new DiscordLogin();
        }

        if (typeof OnlineManager !== 'undefined') {
            this.online = new OnlineManager();
            this.setupOnlineListeners();
        }
    }

    setupOnlineListeners() {
        if (!this.online) return;

        this.online.on('roomList', (roomData) => {
            this.rooms = roomData || [];
        });

        this.online.on('roomJoined', (data) => {
            this.onRoomJoined(data);
        });
    }

    connectToServer(serverUrl) {
        if (this.online) {
            this.online.connect(serverUrl);
        }
    }

    createRoom(roomName) {
        if (this.online && this.online.isConnected) {
            this.online.createRoom(roomName);
        }
    }

    joinSelectedRoom() {
        if (!this.online || !this.online.isConnected) return;

        const targetRoom = this.rooms[this.selectedRoomIndex];
        if (targetRoom) {
            this.online.joinRoom(targetRoom.id);
        }
    }

    onRoomJoined(data) {
    }

    handleInput(key, isPressed) {
        if (!isPressed || !this.isActive) return;

        switch (key) {
            case 'w':
            case 'arrowup':
                this.changeSelection(-1);
                break;
            case 's':
            case 'arrowdown':
                this.changeSelection(1);
                break;
            case 'enter':
                this.joinSelectedRoom();
                break;
            case 'escape':
            case 'backspace':
                this.close();
                break;
        }
    }

    changeSelection(change) {
        if (this.rooms.length === 0) return;

        this.selectedRoomIndex += change;
        if (this.selectedRoomIndex < 0) {
            this.selectedRoomIndex = this.rooms.length - 1;
        } else if (this.selectedRoomIndex >= this.rooms.length) {
            this.selectedRoomIndex = 0;
        }
    }

    close() {
        this.isActive = false;
        if (this.online) {
            this.online.disconnect();
        }
    }

    update(elapsed) {
    }

    render(gl) {
    }

    destroy() {
        this.close();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityMenu;
}
