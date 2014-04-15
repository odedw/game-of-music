define('gameManager',
    ['ko', 'constants', 'gameLogic', 'assetManager', 'soundManager', 'gameView'], function (ko, c, gameLogic, assetManager, sm, gameView) {
        var keysDown = {},
            isPlaying = ko.observable(false), bpm = ko.observable(123), isMuted = ko.observable(false),
            timeSinceLastStep = 0, currentColumn = 0, lastTimestamp = 0,
            initialTimeForColumnStep = 60000 / (4 * bpm()), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            nextNoteTime = 0.0, // when the next note is due.
            current16thNote, // What note is currently last scheduled?
            notesInQueue = [],
            lookahead = 25.0, // How frequently to call scheduling function 
            //(in milliseconds)
            scheduleAheadTime = 0.1, // How far ahead to schedule audio (sec)
            timerId = 0, // setInterval identifier.
            last16thNoteDrawn = -1, // the last "box" we drew on the screen
            song = {
                chords: ['F7', 'F7', 'Cm', 'A#']
            },
            currentChord = 0,
            init = function () {
                ko.applyBindings(this);
                gameView.init(function (x, y) {
                    return gameLogic.getCell(x, y);
                });
                gameView.cellLivenessChanged.add(function (x, y, dead) {
                    gameLogic.getCell(x, y).dead = dead;
                });
                gameView.cellLockStateChanged.add(function (x, y, locked) {
                    gameLogic.getCell(x, y).locked = locked;
                });
                setupKeys();
                assetManager.loadCompleteEvent.add(function () {
                    gameView.initializeGraphics();
                });
                assetManager.loadAssets();
                tick();
            },         
            setupKeys = function () {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
            },
            handleKeyDown = function (e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;
                    if (e.keyCode == c.KEY_SPACE) {
                        togglePlay();
                    }
                    else if (e.keyCode == c.KEY_R) {
                        clear();
                    }
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
            },

            tick = function () {
                var currentNote = last16thNoteDrawn;
                var currentTime = sm.context.currentTime;

                while (notesInQueue.length && notesInQueue[0].time < currentTime) {
                    currentNote = notesInQueue[0].note;
                    notesInQueue.splice(0, 1);   // remove note from queue
                }

                // We only need to draw if the note has moved.
                if (last16thNoteDrawn != currentNote) {
                    gameView.moveColumn(currentNote);
                    last16thNoteDrawn = currentNote;
                }

                // set up to draw again
                window.requestAnimationFrame(tick);
            },
            nextChord = function () {
                currentChord++;
                if (currentChord >= song.chords.length) //loop
                    currentChord = 0;
            },
            //Sound scheduling
            nextNote = function () {
                // Advance current note and time by a 16th note...
                var secondsPerBeat = 60.0 / bpm();    // Notice this picks up the CURRENT 
                // tempo value to calculate beat length.
                nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

                current16thNote++;    // Advance the beat number, wrap to zero
                if (current16thNote == 16) {
                    current16thNote = 0;
                }
            },
            scheduleNote = function(beatNumber, time) {
                // push the note on the queue, even if we're not playing.
                if (beatNumber == 0 && last16thNoteDrawn != -1) {
                    //if (currentNote == 0 && last16thNoteDrawn != -1) { //step life
                    var affectedCells = gameLogic.step();
                    affectedCells.each(function(currentCell) {
                        gameView.setCellLiveness(currentCell.y, currentCell.x, currentCell.dead);
                    });
                    nextChord();
                    //}
                }
                notesInQueue.push({ note: beatNumber, time: time });
                var rowsAlive = [];
                for (var i = 0; i < c.ROWS; i++) {
                    if (!gameLogic.getCell(beatNumber, i).dead) {
                        rowsAlive.push(i);
                    }
                }
                if (!isMuted()) {
                    sm.play(rowsAlive, time, song.chords[currentChord]);
                }
            },
            scheduler = function () {
                // while there are notes that will need to play before the next interval, 
                // schedule them and advance the pointer.
                while (nextNoteTime < sm.context.currentTime + scheduleAheadTime) {
                    scheduleNote(current16thNote, nextNoteTime);
                    nextNote();
                }
                timerId = window.setTimeout(scheduler, lookahead);
            },

            //click events
            togglePlay = function () {
                isPlaying(!isPlaying());
                gameView.setColumnIndicatorVisibility(isPlaying(), currentColumn);
                if (isPlaying()) { // start playing
                    current16thNote = 0;
                    nextNoteTime = sm.context.currentTime;
                    scheduler();    // kick off scheduling
                    return "stop";
                } else {
                    window.clearTimeout(timerId);
                    return "play";
                }
            },
            toggleMute = function () {
                isMuted(!isMuted());
            },
             clear = function () {
                 gameLogic.clear();
                 matchLogic();
             },
            matchLogic = function () {
                for (var y = 0; y < c.ROWS; y++) {
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cell = gameLogic.getCell(x, y);
                        gameView.setCellLiveness(y, x, cell.dead);
                        gameView.setCellLock(y, x, cell.locked);
                    }
                }
            };
        return {
            init: init,
            bpm: bpm, isPlaying: isPlaying, isMuted: isMuted,
            togglePlay: togglePlay, toggleMute: toggleMute, clear: clear,
        };
    });