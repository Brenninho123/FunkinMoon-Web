class AndroidAPI {
    static isAndroid = /Android/i.test(navigator.userAgent);
    static nativeBridge = window.AndroidInterface || null;

    static vibrate(pattern = 50) {
        if (AndroidAPI.nativeBridge && typeof AndroidAPI.nativeBridge.vibrate === 'function') {
            AndroidAPI.nativeBridge.vibrate(Array.isArray(pattern) ? JSON.stringify(pattern) : pattern);
            return;
        }

        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    static showToast(message, isLong = false) {
        if (AndroidAPI.nativeBridge && typeof AndroidAPI.nativeBridge.showToast === 'function') {
            AndroidAPI.nativeBridge.showToast(message, isLong);
        }
    }

    static setKeepScreenOn(enabled = true) {
        if (AndroidAPI.nativeBridge && typeof AndroidAPI.nativeBridge.setKeepScreenOn === 'function') {
            AndroidAPI.nativeBridge.setKeepScreenOn(enabled);
            return;
        }

        if ('wakeLock' in navigator) {
            if (enabled) {
                navigator.wakeLock.request('screen').catch(() => {});
            }
        }
    }

    static async getBatteryInfo() {
        if (AndroidAPI.nativeBridge && typeof AndroidAPI.nativeBridge.getBatteryLevel === 'function') {
            return {
                level: AndroidAPI.nativeBridge.getBatteryLevel(),
                isCharging: AndroidAPI.nativeBridge.isCharging()
            };
        }

        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                return {
                    level: Math.round(battery.level * 100),
                    isCharging: battery.charging
                };
            } catch (e) {
            }
        }

        return { level: 100, isCharging: false };
    }

    static registerBackButtonHandler(callback) {
        if (typeof callback !== 'function') return;

        window.onAndroidBackPressed = () => {
            callback();
        };

        window.addEventListener('popstate', () => {
            callback();
        });
    }

    static exitApp() {
        if (AndroidAPI.nativeBridge && typeof AndroidAPI.nativeBridge.exitApp === 'function') {
            AndroidAPI.nativeBridge.exitApp();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AndroidAPI;
}
