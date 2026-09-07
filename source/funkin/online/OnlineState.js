class OnlineManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.ping = 0;
        this.pingStartTime = 0;
        
        this.callbacks = new Map();
    }

    connect(serverUrl = 'wss://localhost:8080') {
        if (this.socket) {
            this.disconnect();
        }

        try {
            this.socket = new WebSocket(serverUrl);

            this.socket.onopen = () => {
                this.isConnected = true;
                this.startPingInterval();
                this.trigger('connect');
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.currentRoom = null;
                this.stopPingInterval();
                this.trigger('disconnect');
            };

            this.socket.onerror = (error) => {
                this.trigger('error', error);
            };
        } catch (e) {
            this.isConnected = false;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.currentRoom = null;
        this.stopPingInterval();
    }

    send(type, data = {}) {
        if (!this.isConnected || !this.socket) return;

        const payload = JSON.stringify({ type, data, timestamp: Date.now() });
        this.socket.send(payload);
    }

    handleMessage(rawData) {
        try {
            const packet = JSON.parse(rawData);
            
            if (packet.type === 'pong') {
                this.ping = Date.now() - this.pingStartTime;
                this.trigger('pingUpdate', this.ping);
                return;
            }

            if (packet.type === 'roomJoined') {
                this.currentRoom = packet.data.roomId;
            }

            this.trigger(packet.type, packet.data);
        } catch (e) {
        }
    }

    startPingInterval() {
        this.pingTimer = setInterval(() => {
            if (this.isConnected) {
                this.pingStartTime = Date.now();
                this.send('ping');
            }
        }, 5000);
    }

    stopPingInterval() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    joinRoom(roomId) {
        this.send('joinRoom', { roomId });
    }

    createRoom(roomName) {
        this.send('createRoom', { roomName });
    }

    sendScore(score, accuracy, misses) {
        this.send('updateScore', { score, accuracy, misses });
    }

    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.callbacks.has(event)) return;
        const list = this.callbacks.get(event).filter(cb => cb !== callback);
        this.callbacks.set(event, list);
    }

    trigger(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => callback(data));
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnlineManager;
}
