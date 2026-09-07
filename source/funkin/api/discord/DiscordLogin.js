class DiscordLogin {
    static CLIENT_ID = '1540653184530251847';
    static SCOPES = ['identify'];

    constructor() {
        this.token = null;
        this.user = null;
        this.listeners = new Map();
        this.init();
    }

    static getRedirectUri() {
        let uri = window.location.origin + window.location.pathname;
        return uri.endsWith('/') ? uri : uri + '/';
    }

    init() {
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            this.token = params.get('access_token');
            const expiresIn = parseInt(params.get('expires_in') || '604800', 10);
            
            window.location.hash = '';
            this.saveToken(this.token, expiresIn);
            this.fetchUserData();
        } else {
            this.loadToken();
        }
    }

    login() {
        const redirectUri = DiscordLogin.getRedirectUri();
        const authUrl = `https://discord.com/oauth2/authorize?client_id=${DiscordLogin.CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(DiscordLogin.SCOPES.join(' '))}`;
        window.location.href = authUrl;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('moon_discord_token');
        localStorage.removeItem('moon_discord_expiry');
        this.emit('logout');
    }

    saveToken(token, expiresInSeconds) {
        try {
            const expiryTime = Date.now() + (expiresInSeconds * 1000);
            localStorage.setItem('moon_discord_token', token);
            localStorage.setItem('moon_discord_expiry', expiryTime.toString());
        } catch (e) {
        }
    }

    loadToken() {
        try {
            const savedToken = localStorage.getItem('moon_discord_token');
            const savedExpiry = localStorage.getItem('moon_discord_expiry');

            if (savedToken && savedExpiry) {
                if (Date.now() < parseInt(savedExpiry, 10)) {
                    this.token = savedToken;
                    this.fetchUserData();
                } else {
                    this.logout();
                }
            }
        } catch (e) {
            this.logout();
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
                this.emit('login', this.user);
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

    getUserId() {
        return this.user ? this.user.id : null;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiscordLogin;
}
