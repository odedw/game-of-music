define('gameManager',
    ['ko', 'constants', 'gameLogic', 'assetManager', 'soundManager', 'gameView', 'tour', 'hopscotch', 'analytics'], function (ko, c, gameLogic, assetManager, sm, gameView, tour, hopscotch, analytics) {
        var keysDown = {},
            song = {
                chords: ko.observableArray([
                    { key: ko.observable('A'), mod: ko.observable('maj'), isCurrent: ko.observable(true) }
                ]),
                bpm: ko.observable(123),
            },
            isPlaying = ko.observable(false), isMuted = ko.observable(false), isVerifyingClear = ko.observable(false), trackUrl = ko.observable(""),
            isLocked = ko.observable(false),
            currentColumn = 0,
            //initialTimeForColumnStep = 60000 / (4 * song.bpm()), timeSinceLastStep = 0, lastTimestamp = 0, timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            nextNoteTime = 0.0, // when the next note is due.
            current16thNote, // What note is currently last scheduled?
            notesInQueue = [],
            lookahead = 25.0, // How frequently to call scheduling function 
            //(in milliseconds)
            scheduleAheadTime = 0.1, // How far ahead to schedule audio (sec)
            timerId = 0, // setInterval identifier.
            last16thNoteDrawn = -1, // the last "box" we drew on the screen
           
            currentChord = 0,
            init = function() {
                ko.applyBindings(this);
                gameView.init(function(x, y) {
                    return gameLogic.getCell(x, y);
                });
                gameView.cellLivenessChanged.add(function(x, y, dead) {
                    gameLogic.getCell(x, y).dead = dead;
                });
                gameView.cellLockStateChanged.add(function(x, y, locked) {
                    gameLogic.getCell(x, y).locked = locked;
                });
                setupKeys();
                gameView.initializeGraphics();
                if (window.track) {
                    //setTimeout(function () {
                        loadTrack(window.track);
                    //}, 1);
                }
                tick();
                enablePopover();
                $('html').on('mouseup', function(e) {
                    if (!$(e.target).closest('.popover.in').length) {
                        $('.popover').each(function() {
                            $(this.previousSibling).popover('destroy');
                        });
                        $('.popover').remove();
                        enablePopover();
                    }
                });
                $('#sound-set-input').change(function() {
                    sm.setSoundBank($(this).val());
                });

                //sharing
                $('#share-track-dlg').on('show.bs.modal', function(e) {
                    generateLink();
                });
                $('#share-track-dlg').on('hidden.bs.modal', function(e) {
                    trackUrl("");
                    $('#copy-btn').html('Copy');

                });
                $('a.popup').on('click', function(e) {
                    var that = $(this);
                    popupCenter(that.attr('href'), 'checkout my track', 580, 470);
                    analytics.track('Social Click', { id: that.attr('id') });
                    e.preventDefault();
                });

                var clip = new ZeroClipboard(document.getElementById("copy-btn"), {
                    moviePath: "/Content/ZeroClipboard.swf"
                });

                clip.on('complete', function(client, args) {
                    $(this).html('Copied!');
                });
            },
            loadTrack = function (track) {
                resetTrack();

                //set bpm
                song.bpm(track.bpm);

                //set sound set
                sm.setSoundBank(track.sound);
                $('#sound-set-input').val(track.sound);

                //set chords
                track.chords = JSON.parse(track.chords);
                var chords = [];
                track.chords.each(function(chord) {
                    chords.push({ key: ko.observable(chord.key), mod: ko.observable(chord.mod), isCurrent: ko.observable(false) });
                });
                if (chords.length > 0) {
                    chords[0].isCurrent(true);
                } else {
                    chords.push({ key: ko.observable('A'), mod: ko.observable('maj'), isCurrent: ko.observable(true) });
                }
                song.chords(chords);

                //set board
                track.cells = JSON.parse(track.cells);
                track.cells.each(function(cell) {
                    gameLogic.getCell(cell.x, cell.y).dead = cell.dead;
                    gameLogic.getCell(cell.x, cell.y).locked = cell.locked;
                });
                matchLogic();

            },
            setupKeys = function() {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
            },
            handleKeyDown = function(e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;
                    if (e.keyCode === c.KEY_SPACE) {
                        togglePlay();
                    } else if (e.keyCode === c.KEY_R) {
                        clear();
                    }
                }
            },
            handleKeyUp = function(e) {
                keysDown[e.keyCode] = false;
            },
            tick = function() {
                var currentNote = last16thNoteDrawn;
                var currentTime = sm.context.currentTime;

                while (notesInQueue.length && notesInQueue[0].time < currentTime) {
                    currentNote = notesInQueue[0].note;
                    notesInQueue.splice(0, 1); // remove note from queue
                }

                // We only need to draw if the note has moved.
                if (last16thNoteDrawn !== currentNote) {
                    gameView.moveColumn(currentNote);
                    last16thNoteDrawn = currentNote;
                }

                // set up to draw again
                window.requestAnimationFrame(tick);
            },
            nextChord = function() {
                song.chords()[currentChord].isCurrent(false);
                currentChord++;
                if (currentChord >= song.chords().length) //loop
                    currentChord = 0;
                song.chords()[currentChord].isCurrent(true);
            },
            //Sound scheduling
            nextNote = function() {
                // Advance current note and time by a 16th note...
                var secondsPerBeat = 60.0 / song.bpm(); // Notice this picks up the CURRENT 
                // tempo value to calculate beat length.
                nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time

                current16thNote++; // Advance the beat number, wrap to zero
                if (current16thNote === 16) {
                    current16thNote = 0;
                }
            },
            scheduleNote = function(beatNumber, time) {
                // push the note on the queue, even if we're not playing.
                if (beatNumber === 0 && last16thNoteDrawn !== -1) {
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
            scheduler = function() {
                // while there are notes that will need to play before the next interval, 
                // schedule them and advance the pointer.
                while (nextNoteTime < sm.context.currentTime + scheduleAheadTime) {
                    scheduleNote(current16thNote, nextNoteTime);
                    nextNote();
                }
                timerId = window.setTimeout(scheduler, lookahead);
            },
            //click events
            togglePlay = function() {
                isPlaying(!isPlaying());
                gameView.setColumnIndicatorVisibility(isPlaying(), currentColumn);
                if (isPlaying()) { // start playing
                    current16thNote = 0;
                    nextNoteTime = sm.context.currentTime;
                    scheduler(); // kick off scheduling
                    return "stop";
                } else {
                    window.clearTimeout(timerId);
                    return "play";
                }
            },
            toggleMute = function() {
                isMuted(!isMuted());
            },
            clear = function() {
                if (isVerifyingClear()) { //double clicked, clear
                    resetTrack();
                }
                isVerifyingClear(!isVerifyingClear());
            },
            resetTrack = function() {
                gameLogic.clear();
                matchLogic();
                song.chords([]);
                song.chords.push({ key: ko.observable('A'), mod: ko.observable('maj'), isCurrent: ko.observable(false) });
                currentChord = 0;
            },
            stopVerifyingClear = function() {
                isVerifyingClear(false);
            },
            matchLogic = function() {
                for (var y = 0; y < c.ROWS; y++) {
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cell = gameLogic.getCell(x, y);
                        gameView.setCellLiveness(y, x, cell.dead);
                        gameView.setCellLock(y, x, cell.locked);
                    }
                }
            },
            removeChord = function(chord) {
                song.chords.remove(chord);
            },
            addChord = function(chord) {
                song.chords.splice(song.chords().indexOf(chord) + 1, 0, { key: ko.observable('A'), mod: ko.observable('maj'), isCurrent: ko.observable(false) });
            },
            changeKey = function(chord, evt) {
                var target = $(evt.currentTarget);
                target.on('shown.bs.popover', function() {
                    target.parent().find('.popover.in td').click(function() {
                        var val = $(this).text();
                        target.popover('destroy');
                        chord.key(val);
                    });
                });

            },
            changeMod = function(chord, evt) {
                var target = $(evt.currentTarget);
                target.on('shown.bs.popover', function() {
                    target.parent().find('.popover.in td').click(function() {
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
            copyLink = function() {
            },
            generateLink = function() {
                var chords = [];
                song.chords().each(function(chord) {
                    chords.push({ key: chord.key(), mod: chord.mod() });
                });
                var trackObj = {
                    sound: sm.getSoundBank(),
                    bpm: song.bpm(),
                    chords: JSON.stringify(chords),
                    cells: JSON.stringify(gameLogic.getBoard())
                };
                $.post("api/tracks", trackObj)
                    .done(function(id) {
                        trackUrl(window.location.origin + '?id=' + id);
                        analytics.track('Share Click', {id: id});
                    })
                    .fail(function(data) {
                        trackUrl('');
                        analytics.track('Failed generating share', { data: data });
                    });
            },
            popupCenter = function(url, title, w, h) {
                // Fixes dual-screen position                         Most browsers      Firefox
                var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
                var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

                var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                var left = ((width / 2) - (w / 2)) + dualScreenLeft;
                var top = ((height / 3) - (h / 3)) + dualScreenTop;

                var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

                // Puts focus on the newWindow
                if (window.focus) {
                    newWindow.focus();
                }
            },
            showTour = function () {
                hopscotch.startTour(tour);
            },
            enablePopover = function() {
                $('.enable-popover').popover({ html: true });
                $('.enable-popover.key').attr('data-content', $('#chords-list').html());
                $('.enable-popover.mod').attr('data-content', $('#mod-list').html());
            };
        return {
            init: init,
            song: song, isPlaying: isPlaying, isMuted: isMuted, isVerifyingClear: isVerifyingClear, isLocked:isLocked, trackUrl: trackUrl,
            togglePlay: togglePlay, toggleMute: toggleMute, clear: clear, stopVerifyingClear: stopVerifyingClear, removeChord: removeChord, addChord: addChord,
            changeKey: changeKey, changeMod: changeMod, toggleLock: toggleLock, copyLink: copyLink, showTour: showTour
        };
    });