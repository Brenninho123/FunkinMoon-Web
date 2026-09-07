class YoutubeChannels {
    static apiKey = '';
    static cache = new Map();

    static setApiKey(key) {
        YoutubeChannels.apiKey = key;
    }

    static async getChannelInfo(channelId) {
        if (YoutubeChannels.cache.has(channelId)) {
            return YoutubeChannels.cache.get(channelId);
        }

        if (!YoutubeChannels.apiKey) {
            return null;
        }

        const endpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YoutubeChannels.apiKey}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) return null;

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                const formattedData = {
                    id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    customUrl: item.snippet.customUrl,
                    avatar: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    subscribers: parseInt(item.statistics.subscriberCount || 0, 10),
                    views: parseInt(item.statistics.viewCount || 0, 10),
                    videoCount: parseInt(item.statistics.videoCount || 0, 10),
                    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
                };

                YoutubeChannels.cache.set(channelId, formattedData);
                return formattedData;
            }
        } catch (e) {
        }

        return null;
    }

    static async getLatestVideos(uploadsPlaylistId, maxResults = 5) {
        if (!YoutubeChannels.apiKey || !uploadsPlaylistId) return [];

        const endpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YoutubeChannels.apiKey}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) return [];

            const data = await response.json();
            if (data.items) {
                return data.items.map(item => ({
                    videoId: item.contentDetails.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                    publishedAt: item.snippet.publishedAt
                }));
            }
        } catch (e) {
        }

        return [];
    }

    static getEmbedUrl(videoId, autoplay = false) {
        return `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
    }

    static clearCache() {
        YoutubeChannels.cache.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YoutubeChannels;
}
