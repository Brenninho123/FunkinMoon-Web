class DiscordLogin {
    static CLIENT_ID = '1540653184530251847';
    static REDIRECT_URI = window.location.origin + window.location.pathname;
    static SCOPES = ['identify'];

    constructor() {
        this.token = null;
        this.user = null;
        this.init();
    }

    init() {
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            this.token = params.get('access_token');
            window.location.hash = '';
            this.saveToken(this.token);
            this.fetchUserData();
        } else {
            this.loadToken();
        }
    }

    login() {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DiscordLogin.CLIENT_ID}&redirect_uri=${encodeURIComponent(DiscordLogin.REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(DiscordLogin.SCOPES.join(' '))}`;
        window.location.href = authUrl;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('moon_discord_token');
    }

    saveToken(token) {
        try {
            localStorage.setItem('moon_discord_token', token);
        } catch (e) {
        }
    }

    loadToken() {
        try {
            const saved = localStorage.getItem('moon_discord_token');
            if (saved) {
                this.token = saved;
                this.fetchUserData();
            }
        } catch (e) {
        }
    }

    async fetchUserData() {
        if (!this.token) return null;

        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.user = await response.json();
                return this.user;
            } else {
                this.logout();
            }
        } catch (e) {
            this.logout();
        }
        return null;
    }

    getAvatarUrl() {
        if (!this.user || !this.user.avatar) return null;
        return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png`;
    }

    getUsername() {
        if (!this.user) return null;
        return this.user.global_name || this.user.username;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiscordLogin;
}
