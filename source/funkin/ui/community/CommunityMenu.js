class CommunityMenu {
    constructor(engine) {
        this.engine = engine;
        this.selectedCommunityIndex = 0;
        this.communities = [];
        this.chatMessages = [];
        this.userProfile = {
            username: 'Guest',
            avatar: 'assets/images/iconMoon.png',
            badge: 'Member'
        };

        this.storageKey = 'MoonEngine_CommunityData';
    }

    create() {
        this.loadUserProfile();
        this.loadCommunitiesData();
        if (this.communities.length === 0) {
            this.setupDefaultCommunities();
        }
        this.selectCommunity(0);
    }

    loadUserProfile() {
        if (typeof Save !== 'undefined' && Save.getCustom) {
            const savedProfile = Save.getCustom('userProfile');
            if (savedProfile) {
                this.userProfile = Object.assign(this.userProfile, savedProfile);
            }
        }
    }

    updateUserProfile(username, avatar, badge = 'Member') {
        this.userProfile = { username, avatar, badge };
        if (typeof Save !== 'undefined' && Save.setCustom) {
            Save.setCustom('userProfile', this.userProfile);
        }
    }

    setupDefaultCommunities() {
        this.communities = [
            {
                id: 'general',
                name: 'general-chat',
                description: 'General discussion about MoonEngine and FNF modding.',
                owner: 'System',
                membersCount: 128,
                messages: [
                    { sender: 'MoonBot', avatar: 'assets/images/iconMoon.png', badge: 'BOT', text: 'Welcome to the MoonEngine General Community!', timestamp: Date.now() - 3600000 }
                ]
            },
            {
                id: 'modding',
                name: 'mod-showcase',
                description: 'Share your custom charts, Lua scripts, and stages.',
                owner: 'System',
                membersCount: 84,
                messages: [
                    { sender: 'MoonBot', avatar: 'assets/images/iconMoon.png', badge: 'BOT', text: 'Post your latest mod preview links here.', timestamp: Date.now() - 1800000 }
                ]
            },
            {
                id: 'support',
                name: 'help-and-support',
                description: 'Need help with WebGL, chart loading, or PWA setups?',
                owner: 'System',
                membersCount: 42,
                messages: [
                    { sender: 'MoonBot', avatar: 'assets/images/iconMoon.png', badge: 'BOT', text: 'Check out the documentation or ask your questions below.', timestamp: Date.now() - 900000 }
                ]
            }
        ];
        this.saveCommunitiesData();
    }

    loadCommunitiesData() {
        if (typeof Save !== 'undefined' && Save.getCustom) {
            const stored = Save.getCustom('communityList');
            if (stored && Array.isArray(stored)) {
                this.communities = stored;
            }
        }
    }

    saveCommunitiesData() {
        if (typeof Save !== 'undefined' && Save.setCustom) {
            Save.setCustom('communityList', this.communities);
        }
    }

    selectCommunity(index) {
        if (index >= 0 && index < this.communities.length) {
            this.selectedCommunityIndex = index;
            const current = this.communities[this.selectedCommunityIndex];
            this.chatMessages = current.messages || [];
            return current;
        }
        return null;
    }

    joinCommunity(index) {
        return this.selectCommunity(index);
    }

    createCommunity(name, description = '') {
        const cleanName = name.toLowerCase().trim().replace(/\s+/g, '-');
        if (!cleanName) return false;

        const exists = this.communities.some(c => c.name === cleanName);
        if (exists) return false;

        const newCommunity = {
            id: `comm_${Date.now()}`,
            name: cleanName,
            description: description || 'User created community.',
            owner: this.userProfile.username,
            membersCount: 1,
            messages: [
                {
                    sender: 'MoonBot',
                    avatar: 'assets/images/iconMoon.png',
                    badge: 'BOT',
                    text: `Room #${cleanName} created by ${this.userProfile.username}.`,
                    timestamp: Date.now()
                }
            ]
        };

        this.communities.push(newCommunity);
        this.saveCommunitiesData();
        this.selectCommunity(this.communities.length - 1);
        return true;
    }

    deleteCommunity(index) {
        if (index < 0 || index >= this.communities.length) return false;
        
        const comm = this.communities[index];
        if (comm.owner === 'System') return false; // Prevent deleting core system rooms

        this.communities.splice(index, 1);
        this.saveCommunitiesData();

        if (this.selectedCommunityIndex >= this.communities.length) {
            this.selectedCommunityIndex = Math.max(0, this.communities.length - 1);
        }
        this.selectCommunity(this.selectedCommunityIndex);
        return true;
    }

    sendMessage(text) {
        if (!text || !text.trim()) return false;
        const trimmed = text.trim();

        if (trimmed.startsWith('/')) {
            return this.handleCommand(trimmed);
        }

        const current = this.communities[this.selectedCommunityIndex];
        if (!current) return false;

        const messageObj = {
            id: `msg_${Date.now()}`,
            sender: this.userProfile.username,
            avatar: this.userProfile.avatar,
            badge: this.userProfile.badge,
            text: trimmed,
            timestamp: Date.now()
        };

        current.messages.push(messageObj);
        this.chatMessages = current.messages;
        this.saveCommunitiesData();
        return true;
    }

    handleCommand(cmdString) {
        const parts = cmdString.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        const current = this.communities[this.selectedCommunityIndex];

        switch (command) {
            case '/clear':
                if (current) {
                    current.messages = [];
                    this.chatMessages = [];
                    this.saveCommunitiesData();
                }
                return true;

            case '/help':
                if (current) {
                    current.messages.push({
                        sender: 'MoonBot',
                        avatar: 'assets/images/iconMoon.png',
                        badge: 'BOT',
                        text: 'Available commands: /clear, /members, /join <room_index>, /help',
                        timestamp: Date.now()
                    });
                }
                return true;

            case '/members':
                if (current) {
                    current.messages.push({
                        sender: 'MoonBot',
                        avatar: 'assets/images/iconMoon.png',
                        badge: 'BOT',
                        text: `Active members in #${current.name}: ${current.membersCount}`,
                        timestamp: Date.now()
                    });
                }
                return true;

            case '/join':
                const targetIdx = parseInt(args[0], 10);
                if (!isNaN(targetIdx) && this.selectCommunity(targetIdx)) {
                    return true;
                }
                return false;

            default:
                return false;
        }
    }

    getCurrentCommunity() {
        return this.communities[this.selectedCommunityIndex] || null;
    }

    destroy() {
        this.communities = [];
        this.chatMessages = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityMenu;
}
