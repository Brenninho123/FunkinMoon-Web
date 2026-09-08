class FunkinSound {
    constructor(soundPath, options = {}) {
        this.path = soundPath;
        this.volume = options.volume !== undefined ? options.volume : 1.0;
        this.pitch = options.pitch !== undefined ? options.pitch : 1.0;
        this.loop = options.loop || false;
        this.onComplete = options.onComplete || null;

        this.audio = new Audio(this.path);
        this.audio.volume = this.volume;
        this.audio.loop = this.loop;
        this.audio.playbackRate = this.pitch;

        this.fadeTween = null;

        this.audio.addEventListener('ended', () => {
            if (typeof this.onComplete === 'function') {
                this.onComplete();
            }
        });
    }

    play(forceRestart = false) {
        if (forceRestart) {
            this.audio.currentTime = 0;
        }
        return this.audio.play().catch(() => {});
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        this.audio.volume = this.volume;
    }

    setPitch(val) {
        this.pitch = val;
        this.audio.playbackRate = val;
    }

    fadeIn(duration = 1.0, fromVol = 0.0, toVol = 1.0) {
        if (this.fadeTween) clearInterval(this.fadeTween);

        this.setVolume(fromVol);
        this.play();

        const stepTime = 50;
        const steps = (duration * 1000) / stepTime;
        const volStep = (toVol - fromVol) / steps;
        let currentStep = 0;

        this.fadeTween = setInterval(() => {
            currentStep++;
            this.setVolume(this.volume + volStep);

            if (currentStep >= steps) {
                this.setVolume(toVol);
                clearInterval(this.fadeTween);
                this.fadeTween = null;
            }
        }, stepTime);
    }

    fadeOut(duration = 1.0, toVol = 0.0, stopOnComplete = true) {
        if (this.fadeTween) clearInterval(this.fadeTween);

        const stepTime = 50;
        const steps = (duration * 1000) / stepTime;
        const volStep = (this.volume - toVol) / steps;
        let currentStep = 0;

        this.fadeTween = setInterval(() => {
            currentStep++;
            this.setVolume(this.volume - volStep);

            if (currentStep >= steps) {
                this.setVolume(toVol);
                if (stopOnComplete) this.stop();
                clearInterval(this.fadeTween);
                this.fadeTween = null;
            }
        }, stepTime);
    }

    static playOnce(key, volume = 0.6) {
        const soundPath = typeof Paths !== 'undefined' ? Paths.sound(key) : `assets/sounds/${key}.ogg`;
        const snd = new FunkinSound(soundPath, { volume });
        snd.play();
        return snd;
    }

    static playMusic(key, options = {}) {
        const musicPath = typeof Paths !== 'undefined' ? Paths.music(key) : `assets/music/${key}.ogg`;
        const snd = new FunkinSound(musicPath, {
            volume: options.volume !== undefined ? options.volume : 0.7,
            loop: options.loop !== undefined ? options.loop : true,
            pitch: options.pitch || 1.0
        });

        if (options.fadeIn) {
            snd.fadeIn(options.fadeInDuration || 1.0, 0, snd.volume);
        } else {
            snd.play();
        }

        return snd;
    }

    destroy() {
        if (this.fadeTween) clearInterval(this.fadeTween);
        this.stop();
        this.audio = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FunkinSound;
}
