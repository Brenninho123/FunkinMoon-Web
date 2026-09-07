class FreeplayState {
    constructor(engine) {
        this.engine = engine;
        this.songs = [
            { name: 'Bopeebo', week: 1, icon: 'dad' },
            { name: 'Fresh', week: 1, icon: 'dad' },
            { name: 'Dad Battle', week: 1, icon: 'dad' },
            { name: 'Spookeez', week: 2, icon: 'spooky' },
            { name: 'South', week: 2, icon: 'spooky' },
            { name: 'Pico', week: 3, icon: 'pico' },
            { name: 'Philly Nice', week: 3, icon: 'pico' },
            { name: 'Blammed', week: 3, icon: 'pico' }
        ];

        this.difficulties = ['EASY', 'NORMAL', 'HARD'];
        this.selectedSongIndex = 0;
        this.selectedDifficultyIndex = 1;

        this.currentHighScore = 0;
        this.currentAccuracy = 0;
        this.previewAudio = null;
    }

    create() {
        this.updateScoreData();
        this.playInstPreview();
    }

    getSelectedSong() {
        return this.songs[this.selectedSongIndex];
    }

    getSelectedDifficulty() {
        return this.difficulties[this.selectedDifficultyIndex];
    }

    changeSong(delta = 1) {
        this.selectedSongIndex = (this.selectedSongIndex + delta + this.songs.length) % this.songs.length;
        if (this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('scrollMenu');
        }
        this.updateScoreData();
        this.playInstPreview();
    }

    changeDifficulty(delta = 1) {
        this.selectedDifficultyIndex = (this.selectedDifficultyIndex + delta + this.difficulties.length) % this.difficulties.length;
        if (this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('scrollMenu');
        }
        this.updateScoreData();
    }

    updateScoreData() {
        const song = this.getSelectedSong();
        const diff = this.getSelectedDifficulty();

        if (typeof Save !== 'undefined') {
            this.currentHighScore = Save.getSongScore(song.name, diff);
            this.currentAccuracy = Save.getSongAccuracy(song.name, diff);
        }
    }

    playInstPreview() {
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
        }

        const song = this.getSelectedSong();
        const instPath = typeof Paths !== 'undefined' ? Paths.inst(song.name) : `assets/songs/${song.name.toLowerCase()}/Inst.ogg`;

        this.previewAudio = new Audio(instPath);
        this.previewAudio.volume = 0.5;
        this.previewAudio.play().catch(() => {});
    }

    confirmSelection() {
        if (this.previewAudio) {
            this.previewAudio.pause();
        }

        if (this.engine && typeof this.engine.playSound === 'function') {
            this.engine.playSound('confirmMenu');
        }

        const song = this.getSelectedSong();
        const difficulty = this.getSelectedDifficulty();

        if (this.engine && typeof PlayState !== 'undefined') {
            const playState = new PlayState(this.engine);
            playState.songName = song.name;
            playState.difficulty = difficulty;
            this.engine.switchState(playState);
        }
    }

    handleInput(key, isPressed) {
        if (!isPressed) return;

        if (key === 'arrowup' || key === 'w') {
            this.changeSong(-1);
        } else if (key === 'arrowdown' || key === 's') {
            this.changeSong(1);
        } else if (key === 'arrowleft' || key === 'a') {
            this.changeDifficulty(-1);
        } else if (key === 'arrowright' || key === 'd') {
            this.changeDifficulty(1);
        } else if (key === 'enter') {
            this.confirmSelection();
        }
    }

    update(dt) {
    }

    render(gl) {
    }

    destroy() {
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeplayState;
}