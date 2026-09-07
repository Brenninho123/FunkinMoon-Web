class PlayState {
    constructor(engine) {
        this.engine = engine;
        this.songName = '';
        this.bpm = 100;
        this.scrollSpeed = 1.0;
        
        this.inst = null;
        this.voices = null;
        
        this.songPosition = 0;
        this.notes = [];
        this.strumLines = [];

        this.score = 0;
        this.misses = 0;
        this.accuracy = 100.0;
        
        this.isPaused = false;
        this.isEnded = false;
    }

    create(songData) {
        if (!songData) return;

        this.songName = songData.song || 'Test';
        this.bpm = songData.bpm || 100;
        this.scrollSpeed = songData.speed || 1.0;
        this.notes = songData.notes || [];

        this.initStrumLines();
        this.loadAudio();
    }

    initStrumLines() {
        this.strumLines = [
            { id: 0, key: 'left', x: 100, y: 50 },
            { id: 1, key: 'down', x: 210, y: 50 },
            { id: 2, key: 'up', x: 320, y: 50 },
            { id: 3, key: 'right', x: 430, y: 50 }
        ];
    }

    loadAudio() {
        if (typeof Paths === 'undefined') return;

        const instPath = Paths.inst(this.songName);
        const voicesPath = Paths.voices(this.songName);

        this.inst = new Audio(instPath);
        this.voices = new Audio(voicesPath);

        this.inst.addEventListener('canplaythrough', () => {
            this.startSong();
        });
    }

    startSong() {
        if (this.inst) {
            this.inst.play();
        }
        if (this.voices) {
            this.voices.play();
        }
    }

    update(elapsed) {
        if (this.isPaused || this.isEnded) return;

        if (this.inst) {
            this.songPosition = this.inst.currentTime * 1000;
        } else {
            this.songPosition += elapsed * 1000;
        }

        this.updateNotes();
    }

    updateNotes() {
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (!note.wasHit && this.songPosition >= note.strumTime - 1000) {
                note.y = this.calculateNoteY(note.strumTime);
            }
        }
    }

    calculateNoteY(strumTime) {
        const timeDiff = strumTime - this.songPosition;
        return 50 + (timeDiff * 0.45 * this.scrollSpeed);
    }

    handleInput(key, isPressed) {
        if (!isPressed || this.isPaused) return;

        const keyMap = {
            'a': 0, 'arrowleft': 0,
            's': 1, 'arrowdown': 1,
            'w': 2, 'arrowup': 2,
            'd': 3, 'arrowright': 3
        };

        const noteData = keyMap[key];
        if (noteData !== undefined) {
            this.checkNoteHit(noteData);
        }
    }

    checkNoteHit(noteData) {
        const hitWindow = 135;

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];

            if (!note.wasHit && note.noteData === noteData) {
                const diff = Math.abs(note.strumTime - this.songPosition);

                if (diff <= hitWindow) {
                    note.wasHit = true;
                    this.score += 350;
                    break;
                }
            }
        }
    }

    render(gl) {
    }

    destroy() {
        if (this.inst) {
            this.inst.pause();
            this.inst = null;
        }
        if (this.voices) {
            this.voices.pause();
            this.voices = null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayState;
}
