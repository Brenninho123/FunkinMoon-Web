class WinAPI {
    static isWindows = /Win/i.test(navigator.userAgent) || (typeof process !== 'undefined' && process.platform === 'win32');
    static nativeBridge = window.WindowsInterface || (window.electronAPI ? window.electronAPI.win : null);

    static minimizeWindow() {
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.minimize === 'function') {
            WinAPI.nativeBridge.minimize();
            return;
        }

        if (window.nw) {
            window.nw.Window.get().minimize();
        }
    }

    static maximizeWindow() {
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.maximize === 'function') {
            WinAPI.nativeBridge.maximize();
            return;
        }

        if (window.nw) {
            const win = window.nw.Window.get();
            if (win.isMaximized) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    }

    static closeWindow() {
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.close === 'function') {
            WinAPI.nativeBridge.close();
            return;
        }

        if (window.nw) {
            window.nw.Window.get().close();
        }
    }

    static setWindowTitle(title) {
        document.title = title;
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.setTitle === 'function') {
            WinAPI.nativeBridge.setTitle(title);
        }
    }

    static setDarkModeHeader(enabled = true) {
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.setDarkModeHeader === 'function') {
            WinAPI.nativeBridge.setDarkModeHeader(enabled);
        }
    }

    static getSystemMemoryInfo() {
        if (WinAPI.nativeBridge && typeof WinAPI.nativeBridge.getMemoryInfo === 'function') {
            return WinAPI.nativeBridge.getMemoryInfo();
        }

        if (performance && performance.memory) {
            return {
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024))
            };
        }

        return { totalJSHeapSize: 0, usedJSHeapSize: 0, jsHeapSizeLimit: 0 };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WinAPI;
}
