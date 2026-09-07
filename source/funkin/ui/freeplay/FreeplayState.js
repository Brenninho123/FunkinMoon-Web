class FreeplayState {
    constructor(engine, params = {}) {
        this.engine = engine;
        this.currentCharacterId = params.character || 'bf';

        this.songs = [
            { id: 'tutorial', name: 'Tutorial', week: 0, icon: 'gf', albumId: 'volume1', bpm: 100, banner: 'assets/images/freeplay/banners/tutorial.png' },
            { id: 'bopeebo', name: 'Bopeebo', week: 1, icon: 'dad', albumId: 'volume1', bpm: 100, banner: 'assets/images/freeplay/banners/bopeebo.png' },
            { id: 'fresh', name: 'Fresh', week: 1, icon: 'dad', albumId: 'volume1', bpm: 120, banner: 'assets/images/freeplay/banners/fresh.png' },
            { id: 'dad-battle', name: 'Dad Battle', week: 1, icon: 'dad', albumId: 'volume1', bpm: 180, banner: 'assets/images/freeplay/banners/dadbattle.png' },
            { id: 'spookeez', name: 'Spookeez', week: 2, icon: 'spooky', albumId: 'volume1', bpm: 150, banner: 'assets/images/freeplay/banners/spookeez.png' },
            { id: 'south', name: 'South', week: 2, icon: 'spooky', albumId: 'volume1', bpm: 165, banner: 'assets/images/freeplay/banners/south.png' },
            { id: 'pico', name: 'Pico', week: 3, icon: 'pico', albumId: 'volume1', bpm: 150, banner: 'assets/images/freeplay/banners/pico.png' },
            { id: 'philly-nice', name: 'Philly Nice', week: 3, icon: 'pico', albumId: 'volume1', bpm: 175, banner: 'assets/images/freeplay/banners/philly.png' },
            { id: 'blammed', name: 'Blammed', week: 3, icon: 'pico', albumId: 'volume1', bpm: 165, banner: 'assets/images/freeplay/banners/blammed.png' }
        ];

        this.difficulties = ['EASY', 'NORMAL', 'HARD', 'ERECT', 'NIGHTMARE'];
        this.selectedSongIndex = 0;
        this.selectedDifficultyIndex = 2;

        this.curSelectedFloat = 0;
        this.lerpScore = 0;
        this.intendedScore = 0;
        this.lerpCompletion = 0;
        this.intendedCompletion = 0;

        this.previewAudio = null;
        this.previewTimer = null;
        this.favorites = new Set();

        this.isInteracting = false;
        this.isExiting = false;

        this.loadedImages = new Map();
        this.containerUI = null;
    }

    create() {
        this.loadFavorites();
        this.rememberSelection();
        this.preloadAssets();
        this.buildUIOverlay();
        this.changeSelection(0);
    }

    preloadAssets() {
        const iconsToLoad = ['dad', 'spooky', 'pico', 'gf', 'bf'];
        iconsToLoad.forEach(icon => {
            const img = new Image();
            img.src = `assets/images/icons/icon-${icon}.png`;
            this.loadedImages.set(`icon_${icon}`, img);
        });

        this.songs.forEach(song => {
            const banner = new Image();
            banner.src = song.banner;
            this.loadedImages.set(`banner_${song.id}`, banner);
        });

        const bg = new Image();
        bg.src = `assets/images/freeplay/freeplayBGweek1-${this.currentCharacterId}.png`;
        this.loadedImages.set('bg', bg);
    }

    buildUIOverlay() {
        this.containerUI = document.createElement('div');
        this.containerUI.id = 'freeplay-ui-overlay';

        Object.assign(this.containerUI.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '100',
            display: 'flex',
            flexDirection: 'column',
            justify-content: 'space-between',
            padding: '20px',
            boxSizing: 'border-box'
        });

        const scoreBox = document.createElement('div');
        scoreBox.id = 'freeplay-score-box';
        Object.assign(scoreBox.style, {
            alignSelf: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            border: '2px solid #00f5d4',
            borderRadius: '8px',
            padding: '10px 18px',
            color: '#ffffff',
            fontFamily: 'Consolas, Monaco, monospace',
            textAlign: 'right',
            backdropFilter: 'blur(5px)'
        });

        scoreBox.innerHTML = `
            <div id="fp-score" style="font-size: 20px; font-weight: bold; color: #00f5d4;">SCORE: 0</div>
            <div id="fp-acc" style="font-size: 14px; color: #e0aaff;">ACCURACY: 0.00%</div>
            <div id="fp-diff" style="font-size: 16px; font-weight: bold; margin-top: 4px; color: #ffb703;">HARD</div>
        `;

        const songBannerContainer = document.createElement('div');
        songBannerContainer.id = 'freeplay-banner-container';
        Object.assign(songBannerContainer.style, {
            position: 'absolute',
            left: '40px',
            top: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        });

        const iconImg = document.createElement('img');
        iconImg.id = 'fp-icon';
        iconImg.style.width = '64px';
        iconImg.style.height = '64px';

        const bannerText = document.createElement('div');
        bannerText.id = 'fp-title';
        Object.assign(bannerText.style, {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 10px #7b2cbf, 2px 2px 0px #000'
        });

        songBannerContainer.appendChild(iconImg);
        songBannerContainer.appendChild(bannerText);

        this.containerUI.appendChild(songBannerContainer);
        this.containerUI.appendChild(scoreBox);
        document.body.appendChild(this.containerUI);
    }

    loadFavorites() {
        if (typeof Save !== 'undefined' && Save.getCustom) {
            const savedFavs = Save.getCustom('freeplayFavorites');
            if (Array.isArray(savedFavs)) {
                this.favorites = new Set(savedFavs);
            }
        }
    }

    saveFavorites() {
        if (typeof Save !== 'undefined' && Save.setCustom) {
            Save.setCustom('freeplayFavorites', Array.from(this.favorites));
        }
    }

    toggleFavorite() {
        const song = this.getSelectedSong();
        if (!song) return;

        if (this.favorites.has(song.id)) {
            this.favorites.delete(song.id);
            if (this.engine && typeof this.engine.playSound === 'function') {
                this.engine.playSound('unfav');
            }
        } else {
            this.favorites.add(song.id);
            if (this.engine && typeof this.engine.playSound === 'function') {
                this.engine.playSound('fav');
            }
        }
        this.saveFavorites();
        this.updateUI();
    }

    getSelectedSong() {
        return this.songs[this.selectedSongIndex] || this.songs[0];
    }

    getSelectedDifficulty() {
        return this.difficulties[this.selectedDifficultyIndex];
    }

    rememberSelection() {
        if (typeof Save !== 'undefined' && Save.getCustom) {
            const lastSong = Save.getCustom('lastFreeplaySong');
            const lastDiff = Save.getCustom('lastFreeplayDiff');

            if (lastSong) {
                const idx = this.songs.findIndex(s => s.id === lastSong);
                if (idx !== -1) this.selectedSongIndex = idx;
            }
            if (lastDiff) {
                const diffIdx = this.difficulties.indexOf(lastDiff);
                if (diffIdx !== -1) this.selectedDifficultyIndex = diffIdx;
            }
        }
    }

    changeSelection(delta = 0) {
        if (this.isExiting) return;

        const prevIndex = this.selectedSongIndex;
        this.selectedSongIndex = (this.selectedSongIndex + delta + this.songs.length) % this.songs.length;
        this.curSelectedFloat = this.selectedSongIndex;

        if (delta !== 0 && this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('scrollMenu');
        }

        this.updateScoreData();
        this.updateUI();

        if (prevIndex !== this.selectedSongIndex || delta === 0) {
            this.playSongPreview();
        }

        if (typeof Save !== 'undefined' && Save.setCustom) {
            Save.setCustom('lastFreeplaySong', this.getSelectedSong().id);
        }
    }

    changeDifficulty(delta = 0) {
        if (this.isExiting) return;

        this.selectedDifficultyIndex = (this.selectedDifficultyIndex + delta + this.difficulties.length) % this.difficulties.length;

        if (delta !== 0 && this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('scrollMenu');
        }

        this.updateScoreData();
        this.updateUI();

        if (typeof Save !== 'undefined' && Save.setCustom) {
            Save.setCustom('lastFreeplayDiff', this.getSelectedDifficulty());
        }
    }

    updateScoreData() {
        const song = this.getSelectedSong();
        const diff = this.getSelectedDifficulty();

        if (typeof Save !== 'undefined' && Save.getSongScore) {
            this.intendedScore = Save.getSongScore(song.id, diff) || 0;
            this.intendedCompletion = Save.getSongAccuracy(song.id, diff) || 0;
        } else {
            this.intendedScore = 0;
            this.intendedCompletion = 0;
        }
    }

    updateUI() {
        const song = this.getSelectedSong();
        const diff = this.getSelectedDifficulty();

        const titleEl = document.getElementById('fp-title');
        const iconEl = document.getElementById('fp-icon');
        const diffEl = document.getElementById('fp-diff');

        if (titleEl) {
            const isFav = this.favorites.has(song.id) ? ' ★' : '';
            titleEl.textContent = `${song.name}${isFav}`;
        }

        if (iconEl) {
            iconEl.src = `assets/images/icons/icon-${song.icon}.png`;
        }

        if (diffEl) {
            diffEl.textContent = `< ${diff} >`;
        }
    }

    playSongPreview() {
        this.stopPreviewAudio();

        const song = this.getSelectedSong();
        const instPath = typeof Paths !== 'undefined'
            ? Paths.inst(song.name)
            : `assets/songs/${song.id.toLowerCase()}/Inst.ogg`;

        this.previewAudio = new Audio(instPath);
        this.previewAudio.volume = 0.0;

        this.previewAudio.play().then(() => {
            let volume = 0;
            const fadeInterval = setInterval(() => {
                if (!this.previewAudio) {
                    clearInterval(fadeInterval);
                    return;
                }
                volume = Math.min(0.6, volume + 0.05);
                this.previewAudio.volume = volume;
                if (volume >= 0.6) clearInterval(fadeInterval);
            }, 50);
        }).catch(() => {});
    }

    stopPreviewAudio() {
        if (this.previewTimer) {
            clearTimeout(this.previewTimer);
            this.previewTimer = null;
        }
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
        }
    }

    confirmSelection() {
        if (this.isExiting) return;
        this.isExiting = true;

        this.stopPreviewAudio();

        if (this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('confirmMenu');
        }

        const song = this.getSelectedSong();
        const difficulty = this.getSelectedDifficulty();

        setTimeout(() => {
            this.destroyUI();
            if (this.engine && typeof PlayState !== 'undefined') {
                const playState = new PlayState(this.engine);
                playState.songName = song.id;
                playState.difficulty = difficulty;
                this.engine.switchState(playState);
            }
        }, 500);
    }

    handleInput(key, isPressed) {
        if (!isPressed || this.isExiting) return;

        const k = key.toLowerCase();

        if (k === 'arrowup' || k === 'w') {
            this.changeSelection(-1);
        } else if (k === 'arrowdown' || k === 's') {
            this.changeSelection(1);
        } else if (k === 'arrowleft' || k === 'a') {
            this.changeDifficulty(-1);
        } else if (k === 'arrowright' || k === 'd') {
            this.changeDifficulty(1);
        } else if (k === 'f') {
            this.toggleFavorite();
        } else if (k === 'enter') {
            this.confirmSelection();
        } else if (k === 'escape' || k === 'backspace') {
            this.goBack();
        }
    }

    goBack() {
        if (this.isExiting) return;
        this.isExiting = true;
        this.stopPreviewAudio();

        if (this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('cancelMenu');
        }

        this.destroyUI();

        if (this.engine && typeof MainMenuState !== 'undefined') {
            this.engine.switchState(new MainMenuState(this.engine));
        }
    }

    update(dt) {
        this.lerpScore += (this.intendedScore - this.lerpScore) * Math.min(1, dt * 10);
        this.lerpCompletion += (this.intendedCompletion - this.lerpCompletion) * Math.min(1, dt * 8);

        const scoreEl = document.getElementById('fp-score');
        const accEl = document.getElementById('fp-acc');

        if (scoreEl) scoreEl.textContent = `SCORE: ${Math.round(this.lerpScore)}`;
        if (accEl) accEl.textContent = `ACCURACY: ${(this.lerpCompletion * 100).toFixed(2)}%`;
    }

    render(gl) {
    }

    destroyUI() {
        if (this.containerUI && this.containerUI.parentNode) {
            this.containerUI.parentNode.removeChild(this.containerUI);
            this.containerUI = null;
        }
    }

    destroy() {
        this.stopPreviewAudio();
        this.destroyUI();
        this.loadedImages.clear();
        this.songs = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeplayState;
}
