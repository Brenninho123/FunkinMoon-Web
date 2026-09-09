class HTTP {
    static defaultConfig = {
        baseURL: '',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    static setBaseURL(url) {
        HTTP.defaultConfig.baseURL = url;
    }

    static setHeader(key, value) {
        HTTP.defaultConfig.headers[key] = value;
    }

    static removeHeader(key) {
        delete HTTP.defaultConfig.headers[key];
    }

    static buildURL(endpoint, params = {}) {
        let fullURL = endpoint.startsWith('http') ? endpoint : `${HTTP.defaultConfig.baseURL}${endpoint}`;
        const queryKeys = Object.keys(params);

        if (queryKeys.length > 0) {
            const queryString = queryKeys
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            fullURL += (fullURL.includes('?') ? '&' : '?') + queryString;
        }

        return fullURL;
    }

    static async request(endpoint, options = {}) {
        const {
            method = 'GET',
            params = {},
            data = null,
            headers = {},
            timeout = HTTP.defaultConfig.timeout,
            responseType = 'json'
        } = options;

        const url = HTTP.buildURL(endpoint, params);
        const mergedHeaders = { ...HTTP.defaultConfig.headers, ...headers };

        if (data && !(data instanceof FormData) && typeof data === 'object') {
            options.body = JSON.stringify(data);
        } else if (data) {
            options.body = data;
            if (data instanceof FormData) {
                delete mergedHeaders['Content-Type'];
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method,
                headers: mergedHeaders,
                body: options.body || null,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.text();
                return {
                    success: false,
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                };
            }

            let resultData;
            if (responseType === 'json') {
                resultData = await response.json();
            } else if (responseType === 'blob') {
                resultData = await response.blob();
            } else if (responseType === 'arrayBuffer') {
                resultData = await response.arrayBuffer();
            } else {
                resultData = await response.text();
            }

            return {
                success: true,
                status: response.status,
                data: resultData
            };
        } catch (err) {
            clearTimeout(timeoutId);
            return {
                success: false,
                status: 0,
                error: err.name === 'AbortError' ? 'Request Timeout' : err.message
            };
        }
    }

    static get(endpoint, params = {}, options = {}) {
        return HTTP.request(endpoint, { ...options, method: 'GET', params });
    }

    static post(endpoint, data = {}, options = {}) {
        return HTTP.request(endpoint, { ...options, method: 'POST', data });
    }

    static put(endpoint, data = {}, options = {}) {
        return HTTP.request(endpoint, { ...options, method: 'PUT', data });
    }

    static delete(endpoint, params = {}, options = {}) {
        return HTTP.request(endpoint, { ...options, method: 'DELETE', params });
    }

    static upload(endpoint, file, fieldName = 'file', additionalData = {}) {
        const formData = new FormData();
        formData.append(fieldName, file);

        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return HTTP.post(endpoint, formData);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTTP;
}
