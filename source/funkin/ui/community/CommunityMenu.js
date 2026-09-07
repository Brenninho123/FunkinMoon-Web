class CommunityMenu {
    constructor(engine) {
        this.engine = engine;
        this.discord = null;
        this.online = null;

        this.communities = [];
        this.selectedCommunityIndex = 0;
        this.activeChannel = null;

        this.chatMessages = [];
        this.activeUser = null;
        this.isActive = false;
    }

    create() {
        this.isActive = true;

        if (typeof DiscordLogin !== 'undefined') {
            this.discord = new DiscordLogin();
            this.activeUser = {
                name: this.discord.getUsername() || 'Guest',
                avatar: this.discord.getAvatarUrl() || ''
            };
        }

        if (typeof OnlineManager !== 'undefined') {
            this.online = new OnlineManager();
            this.setupOnlineListeners();
        }

        this.loadDefaultCommunities();
    }

    loadDefaultCommunities() {
        this.communities = [
            { id: 'global', name: 'Global Moon Lounge', description: 'General chat for MoonEngine players', members: 0 },
            { id: 'modding', name: 'Modding & Scripts', description: 'Discuss Lua, Haxe, and custom stages', members: 0 },
            { id: 'multiplayer', name: 'Lobby Finder', description: 'Find players for online rhythm battles', members: 0 }
        ];
    }

    setupOnlineListeners() {
        if (!this.online) return;

        this.online.on('communityList', (list) => {
            if (Array.isArray(list) && list.length > 0) {
                this.communities = list;
            }
        });

        this.online.on('chatMessage', (msg) => {
            this.receiveMessage(msg);
        });

        this.online.on('roomJoined', (data) => {
            this.activeChannel = data.roomId;
            this.chatMessages = data.history || [];
        });
    }

    connectToServer(serverUrl) {
        if (this.online) {
            this.online.connect(serverUrl);
        }
    }

    createCommunity(name, description = '') {
        const newCommunity = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            description: description,
            members: 1
        };

        this.communities.push(newCommunity);

        if (this.online && this.online.isConnected) {
            this.online.send('createCommunity', newCommunity);
        }

        return newCommunity;
    }

    joinCommunity(index) {
        if (index < 0 || index >= this.communities.length) return;

        this.selectedCommunityIndex = index;
        const target = this.communities[index];

        if (this.online && this.online.isConnected) {
            this.online.joinRoom(target.id);
        } else {
            this.activeChannel = target.id;
            this.chatMessages = [];
        }
    }

    sendMessage(text) {
        if (!text || text.trim() === '') return;

        const messageData = {
            sender: this.activeUser ? this.activeUser.name : 'Guest',
            avatar: this.activeUser ? this.activeUser.avatar : '',
            channelId: this.activeChannel,
            text: text.trim(),
            timestamp: Date.now()
        };

        if (this.online && this.online.isConnected) {
            this.online.send('sendMessage', messageData);
        } else {
            this.receiveMessage(messageData);
        }
    }

    receiveMessage(msg) {
        this.chatMessages.push(msg);
        if (this.chatMessages.length > 100) {
            this.chatMessages.shift();
        }
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
                this.joinCommunity(this.selectedCommunityIndex);
                break;
            case 'escape':
            case 'backspace':
                this.close();
                break;
        }
    }

    changeSelection(change) {
        if (this.communities.length === 0) return;

        this.selectedCommunityIndex += change;
        if (this.selectedCommunityIndex < 0) {
            this.selectedCommunityIndex = this.communities.length - 1;
        } else if (this.selectedCommunityIndex >= this.communities.length) {
            this.selectedCommunityIndex = 0;
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
