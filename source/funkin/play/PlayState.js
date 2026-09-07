class PlayState {
    constructor(engine) {
        this.engine = engine;
        this.score = 0;
        this.misses = 0;
        this.accuracy = 100.00;
        this.totalNotesHit = 0;
        this.totalNotesPlayed = 0;

        this.songName = 'Test Song';
        this.songSpeed = 2.0;

        this.strumCount = 4;
        this.strumLineY = 80;
        this.strumPositions = [100, 200, 300, 400];
        this.notes = [];

        this.keys = ['a', 's', 'w', 'd'];
        this.keyDirections = ['left', 'down', 'up', 'right'];
    }

    create() {
        this.generateDummyNotes();
        this.setupMobileControls();
    }

    generateDummyNotes() {
        this.notes = [];
        for (let i = 0; i < 20; i++) {
            this.notes.push({
                lane: i % 4,
                time: (i + 1) * 1.5,
                hit: false,
                missed: false,
                y: 0
            });
        }
    }

    setupMobileControls() {
        if (!this.engine || !this.engine.canvas) return;

        this.engine.canvas.addEventListener('touchstart', (e) => {
            const rect = this.engine.canvas.getBoundingClientRect();
            for (let i = 0; i < e.touches.length; i++) {
                const touchX = e.touches[i].clientX - rect.left;
                const lane = Math.floor((touchX / rect.width) * 4);
                if (lane >= 0 && lane < 4) {
                    this.onNotePress(lane);
                }
            }
        }, { passive: true });
    }

    handleInput(key, isPressed) {
        if (!isPressed) return;

        const lane = this.keys.indexOf(key);
        if (lane !== -1) {
            this.onNotePress(lane);
        }
    }

    onNotePress(lane) {
        const targetNote = this.notes.find(n => n.lane === lane && !n.hit && !n.missed && Math.abs(n.y - this.strumLineY) < 40);

        if (targetNote) {
            targetNote.hit = true;
            this.score += 350;
            this.totalNotesHit++;
            this.totalNotesPlayed++;
            this.recalculateAccuracy();
        } else {
            this.misses++;
            this.score = Math.max(0, this.score - 100);
            this.totalNotesPlayed++;
            this.recalculateAccuracy();
        }
    }

    recalculateAccuracy() {
        if (this.totalNotesPlayed > 0) {
            this.accuracy = ((this.totalNotesHit / this.totalNotesPlayed) * 100).toFixed(2);
        }
    }

    update(dt) {
        this.notes.forEach(note => {
            if (!note.hit && !note.missed) {
                note.time -= dt;
                note.y = this.strumLineY + (note.time * 100 * this.songSpeed);

                if (note.y < this.strumLineY - 50) {
                    note.missed = true;
                    this.misses++;
                    this.totalNotesPlayed++;
                    this.recalculateAccuracy();
                }
            }
        });
    }

    render(gl) {
    }

    destroy() {
        this.notes = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayState;
}
