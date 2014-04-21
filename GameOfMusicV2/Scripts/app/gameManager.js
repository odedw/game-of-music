define('gameManager',
    ['ko', 'constants', 'gameLogic', 'assetManager', 'soundManager', 'gameView', 'utils'], function (ko, c, gameLogic, assetManager, sm, gameView, utils) {
        var keysDown = {},
             song = {
                 chords: ko.observableArray([
                     { key: ko.observable('B'), mod: ko.observable('min7'), isCurrent: ko.observable(true) },
                     { key: ko.observable('D'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },
                     { key: ko.observable('F#'), mod: ko.observable('min'), isCurrent: ko.observable(false) },
                     { key: ko.observable('E'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },
                     
                     // { key: ko.observable('F'), mod: ko.observable('aug'), isCurrent: ko.observable(true)},
                     //{ key: ko.observable('C#'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('F'), mod: ko.observable('aug'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('C#'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('A#'), mod: ko.observable('aug'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('F#'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('A#'), mod: ko.observable('aug'), isCurrent: ko.observable(false) },
                     //{ key: ko.observable('F#'), mod: ko.observable('maj'), isCurrent: ko.observable(false) },

                 ]),
                 bpm: ko.observable(123),
             },
            isPlaying = ko.observable(false), isMuted = ko.observable(false), isVerifyingClear = ko.observable(false),
            isLocked = ko.observable(false),
            initialTimeForColumnStep = 60000 / (4 * song.bpm()), currentColumn = 0,
            //timeSinceLastStep = 0, lastTimestamp = 0, timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            nextNoteTime = 0.0, // when the next note is due.
            current16thNote, // What note is currently last scheduled?
            notesInQueue = [],
            lookahead = 25.0, // How frequently to call scheduling function 
            //(in milliseconds)
            scheduleAheadTime = 0.1, // How far ahead to schedule audio (sec)
            timerId = 0, // setInterval identifier.
            last16thNoteDrawn = -1, // the last "box" we drew on the screen
           
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
                enablePopover();
                $('html').on('mouseup', function (e) {
                    if (!$(e.target).closest('.popover.in').length) {
                        $('.popover').each(function () {
                            $(this.previousSibling).popover('destroy');
                        });
                        $('.popover').remove();
                        enablePopover();
                    }
                });
                $('#sound-set-input').change(function() {
                    sm.setSoundBank($(this).val());
                });
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
                song.chords()[currentChord].isCurrent(false);
                currentChord++;
                if (currentChord >= song.chords().length) //loop
                    currentChord = 0;
                song.chords()[currentChord].isCurrent(true);
            },
            //Sound scheduling
            nextNote = function () {
                // Advance current note and time by a 16th note...
                var secondsPerBeat = 60.0 / song.bpm();    // Notice this picks up the CURRENT 
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
                    if (!isLocked()) {
                        var affectedCells = gameLogic.step();
                        affectedCells.each(function(currentCell) {
                            gameView.setCellLiveness(currentCell.y, currentCell.x, currentCell.dead);
                        });
                    }
                    nextChord();
                }
                notesInQueue.push({ note: beatNumber, time: time });
                var rowsAlive = [];
                for (var i = 0; i < c.ROWS; i++) {
                    if (!gameLogic.getCell(beatNumber, i).dead) {
                        rowsAlive.push(i);
                    }
                }
                if (!isMuted()) {
                    sm.play(rowsAlive, time, getChordString(song.chords()[currentChord]));
                }
            },
            getChordString = function(chordObj) {
                return chordObj.key() + chordObj.mod();
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
                 if (isVerifyingClear()) { //double clicked, clear
                     gameLogic.clear();
                     matchLogic();
                 }
                 isVerifyingClear(!isVerifyingClear());
             },
            stopVerifyingClear = function () {
                isVerifyingClear(false);
            },
            matchLogic = function () {
                for (var y = 0; y < c.ROWS; y++) {
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cell = gameLogic.getCell(x, y);
                        gameView.setCellLiveness(y, x, cell.dead);
                        gameView.setCellLock(y, x, cell.locked);
                    }
                }
            },
            removeChord = function (chord) {
                song.chords.remove(chord);
            },
            addChord = function(chord) {
                song.chords.splice(song.chords().indexOf(chord) + 1, 0, { key: ko.observable('A'), mod: ko.observable('maj'), isCurrent: ko.observable(false) });
            },
            changeKey = function (chord, evt) {
                var target = $(evt.currentTarget);
                target.on('shown.bs.popover', function () {
                    target.parent().find('.popover.in td').click(function () {
                        var val = $(this).text();
                        target.popover('destroy');
                        chord.key(val);
                    });
                });

            },
            changeMod = function (chord, evt) {
                var target = $(evt.currentTarget);
                target.on('shown.bs.popover', function () {
                    target.parent().find('.popover.in td').click(function () {
                        var val = $(this).text();
                        target.popover('destroy');                        
                        $('.popover').remove();
                        chord.mod(val);
                    });
                });
            },
            toggleLock = function() {
                isLocked(!isLocked());
            },
            shareSong = function () {
                var chords = [];
                song.chords().each(function(chord) {
                    chords.push({ key: chord.key(), mod: chord.mod() });
                });
                var songObj = {
                    sound: sm.getSoundBank(),
                    bpm: song.bpm(),
                    chords: chords,
                    cells: gameLogic.getBoard()
                };
            },
            enablePopover = function() {
                $('.enable-popover').popover({ html: true });
                $('.enable-popover.key').attr('data-content', $('#chords-list').html());
                $('.enable-popover.mod').attr('data-content', $('#mod-list').html());
            };
        return {
            init: init,
            song: song, isPlaying: isPlaying, isMuted: isMuted, isVerifyingClear: isVerifyingClear, isLocked:isLocked,
            togglePlay: togglePlay, toggleMute: toggleMute, clear: clear, stopVerifyingClear: stopVerifyingClear, removeChord: removeChord, addChord: addChord,
            changeKey: changeKey, changeMod: changeMod, toggleLock: toggleLock, shareSong: shareSong
        };
    });