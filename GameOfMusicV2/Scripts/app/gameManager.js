﻿define('gameManager',
    ['constants', 'gameLogic', 'assetManager', 'soundPlayer', 'gameView'], function (c, gameLogic, assetManager, sp, gameView) {
        var 
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false, currentColumn = 0, lastTimestamp = 0,
            bpm = 100, initialTimeForColumnStep = 60000 / (4 * bpm), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            nextNoteTime = 0.0,     // when the next note is due.
            current16thNote,        // What note is currently last scheduled?
            notesInQueue = [],
            lookahead = 25.0,       // How frequently to call scheduling function 
            //(in milliseconds)
            scheduleAheadTime = 0.1,    // How far ahead to schedule audio (sec)
            timerId = 0,            // setInterval identifier.
            last16thNoteDrawn = -1, // the last "box" we drew on the screen
            init = function () {
                gameView.init(function(x,y) {
                    return gameLogic.getCell(x, y);
                });
                gameView.cellLivenessChanged.add(function(x, y, dead) {
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
            clear = function() {
                gameLogic.clear();
                matchLogic();
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
           
            setupKeys = function () {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
            },
            handleKeyDown = function (e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;
                    if (e.keyCode == c.KEY_SPACE) {
                        isRunning = !isRunning;
                        gameView.setColumnIndicatorVisibility(isRunning, currentColumn);
                        togglePlay();
                    }
                    else if (e.keyCode == c.KEY_R) {
                        clear();
                    }
                    else if (e.keyCode == c.KEY_A) {
                        sp.play([9],0);
                    }
                    else if (e.keyCode == c.KEY_S) {
                        sp.play([8],0);
                    }
                    else if (e.keyCode == c.KEY_D) {
                        sp.play([7],0);
                    }
                    else if (e.keyCode == c.KEY_F) {
                        sp.play([6],0);
                    }
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
            },
        tick = function () {
            var currentNote = last16thNoteDrawn;
            var currentTime = sp.context.currentTime;

            while (notesInQueue.length && notesInQueue[0].time < currentTime) {
                currentNote = notesInQueue[0].note;
                notesInQueue.splice(0,1);   // remove note from queue
            }

            // We only need to draw if the note has moved.
            if (last16thNoteDrawn != currentNote) {
                gameView.moveColumn(currentNote);
                if (currentNote == 0 && last16thNoteDrawn != -1) { //step life
                    var affectedCells = gameLogic.step();
                    affectedCells.each(function (currentCell) {
                        gameView.setCellLiveness(currentCell.y, currentCell.x, currentCell.dead);
                    });
                }
                
                last16thNoteDrawn = currentNote;
            }

            
            
            // set up to draw again
            window.requestAnimationFrame(tick);
        },
        //Sound scheduling
        nextNote = function () {
            // Advance current note and time by a 16th note...
            var secondsPerBeat = 60.0 / bpm;    // Notice this picks up the CURRENT 
            // tempo value to calculate beat length.
            nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

            current16thNote++;    // Advance the beat number, wrap to zero
            if (current16thNote == 16) {
                current16thNote = 0;
            }
        },
        scheduleNote = function (beatNumber, time) {
            // push the note on the queue, even if we're not playing.
            notesInQueue.push( { note: beatNumber, time: time } );
            var rowsAlive = [];
            for (var i = 0; i < c.ROWS; i++) {
                if (!gameLogic.getCell(beatNumber, i).dead) {
                    rowsAlive.push(i);
                }
            }
            sp.play(rowsAlive, time);
        },
        scheduler = function () {
            // while there are notes that will need to play before the next interval, 
            // schedule them and advance the pointer.
            while (nextNoteTime < sp.context.currentTime + scheduleAheadTime) {
                scheduleNote( current16thNote, nextNoteTime );
                nextNote();
            }
            timerId = window.setTimeout(scheduler, lookahead);
        },
        togglePlay = function () {
            if (isRunning) { // start playing
                current16thNote = 0;
                nextNoteTime = sp.context.currentTime;
                scheduler();    // kick off scheduling
                return "stop";
            } else {
                window.clearTimeout( timerId );
                return "play";
            }
        }
                
                
                
                
                
                
                ;
        return {
            init: init
    };
    });