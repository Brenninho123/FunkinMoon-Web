class Conductor {
    static bpm = 100;
    static crotchet = ((60 / 100) * 1000);
    static stepCrochet = (Conductor.crotchet / 4);
    static songPosition = 0;
    static lastSongPos = 0;
    static offset = 0;

    static safeZoneOffset = (10 / 60) * 1000;
    static safeFrames = 10;

    static bpmChangeMap = [];

    static changeBPM(newBpm) {
        Conductor.bpm = newBpm;
        Conductor.crotchet = ((60 / newBpm) * 1000);
        Conductor.stepCrochet = (Conductor.crotchet / 4);
    }

    static mapBPMChanges(songData) {
        Conductor.bpmChangeMap = [];

        if (!songData || !songData.notes) return;

        let curBPM = songData.bpm;
        let totalSteps = 0;
        let totalPos = 0;

        for (let i = 0; i < songData.notes.length; i++) {
            const section = songData.notes[i];

            if (section.changeBPM && section.bpm !== curBPM) {
                curBPM = section.bpm;
                const event = {
                    stepTime: totalSteps,
                    songTime: totalPos,
                    bpm: curBPM,
                    stepCrochet: (((60 / curBPM) * 1000) / 4)
                };
                Conductor.bpmChangeMap.push(event);
            }

            const deltaSteps = section.lengthInSteps || 16;
            totalSteps += deltaSteps;
            totalPos += (((60 / curBPM) * 1000) / 4) * deltaSteps;
        }
    }

    static judgeNote(noteTime, songTime = Conductor.songPosition) {
        const diff = Math.abs(noteTime - songTime);

        if (diff <= 22.5) return { rating: 'sick', score: 350, accuracy: 1.0, isHit: true };
        if (diff <= 45.0) return { rating: 'good', score: 200, accuracy: 0.75, isHit: true };
        if (diff <= 90.0) return { rating: 'bad', score: 100, accuracy: 0.5, isHit: true };
        if (diff <= 135.0) return { rating: 'shit', score: 50, accuracy: 0.25, isHit: true };

        return { rating: 'miss', score: 0, accuracy: 0.0, isHit: false };
    }

    static update(time) {
        Conductor.lastSongPos = Conductor.songPosition;
        Conductor.songPosition = time + Conductor.offset;
    }

    static reset() {
        Conductor.bpm = 100;
        Conductor.crotchet = ((60 / 100) * 1000);
        Conductor.stepCrochet = (Conductor.crotchet / 4);
        Conductor.songPosition = 0;
        Conductor.lastSongPos = 0;
        Conductor.offset = 0;
        Conductor.bpmChangeMap = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Conductor;
}
