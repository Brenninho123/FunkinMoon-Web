class PlayState {
    constructor(engine) {
        this.engine = engine;
        this.songData = null;
        this.songName = 'Tutorial';
        this.difficulty = 'normal';
        this.inst = null;
        this.voices = null;
        this.notes = [];
        this.unspawnNotes = [];
        this.playerStrums = [];
        this.opponentStrums = [];
        this.score = 0;
        this.combo = 0;
        this.health = 1.0;
        this.misses = 0;
        this.accuracy = 100.0;
        this.totalNotesHit = 0;
        this.totalNotesPossible = 0;
        this.songSpeed = 1.0;
        this.modScripts = [];
        this.isPaused = false;
        this.hasEnded = false;
    }

    async create() {
        this.resolveActiveModData();
        await this.loadChartData();
        this.setupConductor();
        this.loadAudioTracks();
        this.loadModScripts();
        this.generateStrumLines();
        this.generateNotes();
        this.callScriptEvent('onCreate');
        this.startSong();
    }

    resolveActiveModData() {
        if (typeof Mods !== 'undefined') {
            const activeMod = Mods.getActiveMod();
            if (activeMod && activeMod.songs && activeMod.songs.length > 0) {
                this.songName = activeMod.songs[0].folder || activeMod.songs[0].name.toLowerCase();
            }
        }
    }

    async loadChartData() {
        let chartPath = `assets/songs/${this.songName}/${this.songName.toLowerCase()}-${this.difficulty}.json`;
        if (typeof Mods !== 'undefined') {
            chartPath = Mods.resolveModAsset(chartPath);
        }
        try {
            const response = await fetch(chartPath);
            if (response.ok) {
                const rawJson = await response.json();
                this.songData = rawJson.song || rawJson;
                this.songSpeed = this.songData.speed || 1.0;
            } else {
                this.createDummyChart();
            }
        } catch (e) {
            this.createDummyChart();
        }
    }

    createDummyChart() {
        this.songData = {
            song: this.songName,
            bpm: 100,
            speed: 2.0,
            notes: []
        };
        this.songSpeed = 2.0;
    }

    setupConductor() {
        if (typeof Conductor !== 'undefined') {
            Conductor.reset();
            Conductor.changeBPM(this.songData.bpm || 100);
            if (this.songData) {
                Conductor.mapBPMChanges(this.songData);
            }
        }
    }

    loadAudioTracks() {
        let instPath = `assets/songs/${this.songName}/Inst.ogg`;
        let voicesPath = `assets/songs/${this.songName}/Voices.ogg`;

        if (typeof Mods !== 'undefined') {
            instPath = Mods.resolveModAsset(instPath);
            voicesPath = Mods.resolveModAsset(voicesPath);
        }

        if (typeof FunkinSound !== 'undefined') {
            this.inst = new FunkinSound(instPath, { volume: 0.8 });
            this.voices = new FunkinSound(voicesPath, { volume: 0.8 });
        } else {
            this.inst = new Audio(instPath);
            this.voices = new Audio(voicesPath);
        }
    }

    loadModScripts() {
        this.modScripts = [];
        if (typeof Mods !== 'undefined') {
            const activeMod = Mods.getActiveMod();
            if (activeMod && activeMod.scripts) {
                activeMod.scripts.forEach(scriptPath => {
                    const resolved = Mods.resolveModAsset(`mods/${activeMod.id}/${scriptPath}`);
                    this.modScripts.push(resolved);
                });
            }
        }
    }

    startSong() {
        if (this.inst) {
            if (typeof this.inst.play === 'function') {
                this.inst.play();
            } else {
                this.inst.play().catch(() => {});
            }
        }
        if (this.voices) {
            if (typeof this.voices.play === 'function') {
                this.voices.play();
            } else {
                this.voices.play().catch(() => {});
            }
        }
        this.callScriptEvent('onSongStart');
    }

    callScriptEvent(eventName, ...args) {
        if (typeof window.executeLuaCallback === 'function') {
            window.executeLuaCallback(eventName, ...args);
        }
    }

    generateStrumLines() {
        this.playerStrums = [0, 1, 2, 3].map(lane => ({
            lane,
            pressed: false,
            confirmTime: 0,
            direction: ['left', 'down', 'up', 'right'][lane]
        }));
        this.opponentStrums = [0, 1, 2, 3].map(lane => ({
            lane,
            pressed: false,
            confirmTime: 0,
            direction: ['left', 'down', 'up', 'right'][lane]
        }));
    }

    generateNotes() {
        this.unspawnNotes = [];
        if (!this.songData || !this.songData.notes) return;

        this.songData.notes.forEach(section => {
            if (!section.sectionNotes) return;

            section.sectionNotes.forEach(songNote => {
                const noteTime = songNote[0];
                const noteData = songNote[1] % 4;
                const isMustHitSection = section.mustHitSection;
                const isPlayer = songNote[1] >= 4 ? !isMustHitSection : isMustHitSection;

                this.unspawnNotes.push({
                    strumTime: noteTime,
                    noteData: noteData,
                    isPlayer: isPlayer,
                    sustainLength: songNote[2] || 0,
                    wasHit: false,
                    tooLate: false,
                    isSustainHead: (songNote[2] || 0) > 0
                });
            });
        });

        this.unspawnNotes.sort((a, b) => a.strumTime - b.strumTime);
    }

    handleInput(key, isPressed) {
        if (this.isPaused || this.hasEnded) return;

        const keyMap = {
            'a': 0, 'arrowleft': 0,
            's': 1, 'arrowdown': 1,
            'w': 2, 'arrowup': 2,
            'd': 3, 'arrowright': 3
        };

        const lane = keyMap[key.toLowerCase()];
        if (lane !== undefined) {
            this.playerStrums[lane].pressed = isPressed;

            if (isPressed) {
                this.checkNoteHit(lane);
            }
        }

        if (key.toLowerCase() === 'p' || key === 'Escape') {
            if (isPressed) this.togglePause();
        }
    }

    checkNoteHit(lane) {
        const currentTime = this.getCurrentTime();
        let possibleNotes = this.notes.filter(n => n.isPlayer && n.noteData === lane && !n.wasHit && !n.tooLate);

        if (possibleNotes.length > 0) {
            possibleNotes.sort((a, b) => a.strumTime - b.strumTime);
            const note = possibleNotes[0];
            const timeDiff = Math.abs(note.strumTime - currentTime);

            if (timeDiff <= 135.0) {
                note.wasHit = true;
                this.registerNoteRating(timeDiff);
                this.callScriptEvent('onNoteHit', lane, note.strumTime);
            }
        }
    }

    registerNoteRating(timeDiff) {
        let judgment = { rating: 'sick', score: 350, accuracy: 1.0 };

        if (typeof Conductor !== 'undefined' && Conductor.judgeNote) {
            judgment = Conductor.judgeNote(timeDiff);
        } else {
            if (timeDiff > 90) judgment = { rating: 'bad', score: 100, accuracy: 0.5 };
            else if (timeDiff > 45) judgment = { rating: 'good', score: 200, accuracy: 0.75 };
            else if (timeDiff > 22.5) judgment = { rating: 'sick', score: 350, accuracy: 1.0 };
        }

        this.score += judgment.score;
        this.combo++;
        this.totalNotesHit++;
        this.totalNotesPossible++;
        this.recalculateAccuracy();
        this.health = Math.min(2.0, this.health + 0.04);

        if (this.engine && this.engine.playSound) {
            this.engine.playSound('confirmMenu', 0.15);
        }
    }

    registerMiss(lane) {
        this.misses++;
        this.combo = 0;
        this.totalNotesPossible++;
        this.recalculateAccuracy();
        this.score -= 10;
        this.health = Math.max(0.0, this.health - 0.08);

        if (this.engine && this.engine.playSound) {
            this.engine.playSound('cancelMenu', 0.2);
        }

        if (this.health <= 0.0) {
            this.gameOver();
        }

        this.callScriptEvent('onNoteMiss', lane);
    }

    recalculateAccuracy() {
        if (this.totalNotesPossible === 0) {
            this.accuracy = 100.0;
        } else {
            this.accuracy = Math.max(0, Math.min(100, (this.totalNotesHit / this.totalNotesPossible) * 100));
        }
    }

    getCurrentTime() {
        if (typeof Conductor !== 'undefined' && Conductor.songPosition !== undefined) {
            return Conductor.songPosition;
        }
        return this.inst ? (this.inst.currentTime || 0) * 1000 : 0;
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            if (this.inst && typeof this.inst.pause === 'function') this.inst.pause();
            if (this.voices && typeof this.voices.pause === 'function') this.voices.pause();
            this.callScriptEvent('onPause');
        } else {
            if (this.inst && typeof this.inst.play === 'function') this.inst.play();
            if (this.voices && typeof this.voices.play === 'function') this.voices.play();
            this.callScriptEvent('onResume');
        }
    }

    gameOver() {
        this.hasEnded = true;
        if (this.inst) this.inst.pause();
        if (this.voices) this.voices.pause();
        this.callScriptEvent('onGameOver');
    }

    update(dt) {
        if (this.isPaused || this.hasEnded) return;

        const currentTime = this.getCurrentTime();

        while (this.unspawnNotes.length > 0 && this.unspawnNotes[0].strumTime - currentTime < 1500) {
            this.notes.push(this.unspawnNotes.shift());
        }

        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];

            if (!note.isPlayer && !note.wasHit && note.strumTime <= currentTime) {
                note.wasHit = true;
                const strum = this.opponentStrums[note.noteData];
                if (strum) strum.confirmTime = currentTime;
                this.callScriptEvent('onOpponentNoteHit', note.noteData, note.strumTime);
            }

            if (note.isPlayer && !note.wasHit && currentTime - note.strumTime > 135.0) {
                note.tooLate = true;
                this.registerMiss(note.noteData);
                this.notes.splice(i, 1);
            } else if (note.wasHit) {
                this.notes.splice(i, 1);
            }
        }

        this.callScriptEvent('onUpdate', dt);
    }

    destroy() {
        if (this.inst) {
            if (typeof this.inst.stop === 'function') this.inst.stop();
            else if (typeof this.inst.pause === 'function') this.inst.pause();
        }

        if (this.voices) {
            if (typeof this.voices.stop === 'function') this.voices.stop();
            else if (typeof this.voices.pause === 'function') this.voices.pause();
        }

        this.notes = [];
        this.unspawnNotes = [];
        this.playerStrums = [];
        this.opponentStrums = [];
        this.callScriptEvent('onDestroy');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayState;
}
