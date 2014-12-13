///#source 1 1 /Scripts/app/analytics.js
define('analytics',
    [], function() {
        var
            identify = function () {

            },
            track = function(eventName, extraData) {
                                mixpanel.track(eventName, extraData);
            };

        return {
            identify: identify,
            track:track
        };
    });
///#source 1 1 /Scripts/app/bootstrapper.js
define('bootstrapper',
    ['analytics', 'gameManager'],
    function (analytics, gameManager) {
        var run = function () {
            var url = window.location.href;
            analytics.track('Page View', { URL: url});
            Math.sign = function (number) { return number ? number < 0 ? -1 : 1 : 0; };
            startApp();
        },
            startApp = function () {
                gameManager.init();
                
            };

        return {
            run: run,
        };
    });

(function (d) {
    var root = this;

    require.config({
        baseUrl: "/Scripts/app",
//        paths: {
//            'Screens': 'screens',
//            'Entities': 'entities',
//        }
    });
    define3rdPartyModules();
    runShims();
    loadPluginsAndBoot();

    function define3rdPartyModules() {
        // These are already loaded via bundles. 
        // We define them and put them in the root object.
        define('ko', [], function () { return root.ko; });
        define('hopscotch', [], function () { return root.hopscotch; });
        define('createjs', [], function () { return root.createjs; });
    }
    
    function runShims() {
        Math.range = function(start, end) {
            var arr = [];
            if (end < start)
                return arr;
            for (var i = start; i <= end; i++) {
                arr.push(i);
            }
            return arr;
        };

        Array.prototype.each = function (callback) {
            var i = 0;
            while (i < this.length) {
                callback.call(this, this[i]);
                i++;
            }
            return this;
        };

        Array.prototype.map = function (callback) {
            var i = this.length;
            var found = [];
            while (i--) {
                if (callback.call(this, this[i])) {
                    found.push(this[i]);
                }
            }
            return found;
        };

        Array.prototype.contains = function (obj) {
            var i = this.length;
            while (i--) {
                if (this[i] === obj) {
                    return true;
                }
            }
            return false;
        };

        Array.prototype.remove = function (element) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === element) {
                    this.splice(i, 1);
                    break;
                }
            }
        };
        
        //RAF. from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }

    function loadPluginsAndBoot() {
        // Plugins must be loaded after jQuery and Knockout, 
        // since they depend on them.
        requirejs([
        ], boot);
    }

    function boot() {
        require(['bootstrapper'], function (bs) { bs.run(d); });
    }
})(document);
///#source 1 1 /Scripts/app/constants.js
define('constants',
    [], function() {
        return {
            //world constants
            ROWS: 9,
            COLUMNS: 16,
            CELL_MARGIN:3,
            
            //asset constants
            FONT: 'calibri',

            //speed
            
            //keys
            KEY_A: 65,
            KEY_B: 66,
            KEY_C: 67,
            KEY_D: 68,
            KEY_E: 69,
            KEY_F: 70,
            KEY_G: 71,
            KEY_H: 72,
            KEY_I: 73,
            KEY_J: 74,
            KEY_K: 75,
            KEY_L: 76,
            KEY_M: 77,
            KEY_N: 78,
            KEY_O: 79,
            KEY_P: 80,
            KEY_Q: 81,
            KEY_R: 82,
            KEY_S: 83,
            KEY_T: 84,
            KEY_U: 85,
            KEY_V: 86,
            KEY_W: 87,
            KEY_X: 88,
            KEY_Y: 89,
            KEY_Z: 90,
            KEY_UP: 38,
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_DOWN: 40,
            KEY_SPACE: 32,
            KEY_LCTRL: 17,
            KEY_ENTER: 13,
            KEY_ESC:27
        };
    });
///#source 1 1 /Scripts/app/gameLogic.js
define('gameLogic',
    ['constants'], function (constants) {
        function World(width, height) {
            this.width = width;
            this.height = height;
            this.stepTime = 0;
            var i = width * height;
            var x, y;

            this.cells = [];
            while (i--) {
                y = Math.floor(i / width);
                x = i - (y * width);
                var cell = new Cell(this, x, y);
                this.cells.unshift(cell);
            }
        }

        World.prototype.getCell = function(x, y) {
            return this.cells[(y * this.width) + x];
        };

        World.prototype.printState = function() {
            for (var i = 0; i < this.height; i++) {
                var line = '';
                for (var j = 0; j < this.width; j++) {
                    line += this.getCell(i, j).dead ? "o " : "x ";
                }
                console.log(line);
            }
            console.log(this.time);
        };
        
        World.prototype.step = function () {
            var start = new Date().getTime();
            var affected = [];
            this.cells.each(function (currentCell) {
                if (currentCell.locked)
                    return;
                
                var liveNeighboursCount = currentCell.liveNeighbours().length;
                if (currentCell.isLive()) {
                    if (liveNeighboursCount < 2) {
                        affected.unshift(currentCell);
                    } else if (liveNeighboursCount > 3) {
                        affected.unshift(currentCell);
                    }
                } else {
                    if (liveNeighboursCount === 3) {
                        affected.unshift(currentCell);
                    }
                }
            });

            affected.each(function(cell) {
                cell.toggle();
            });
            var end = new Date().getTime();
            this.time = end - start;
            return affected;
        };

        function Cell(world, x, y) {
            this.world = world;
            this.x = x;
            this.y = y;
            this.dead = true;
            this.locked = false;
        }

        Cell.prototype.neighbours = function() {
            var neighbourX, neighbourY;
            var found = [];
            neighbourX = this.x - 1;
            while (neighbourX <= this.x + 1) {
                neighbourY = this.y - 1;
                while (neighbourY <= this.y + 1) {
                    if (neighbourX !== -1 && neighbourX !== this.world.width &&
                        neighbourY !== -1 && neighbourY !== this.world.height &&
                        (neighbourX !== this.x || neighbourY !== this.y)) {
                        found.push(this.world.getCell(neighbourX, neighbourY));
                    }
                    neighbourY++;
                }
                neighbourX++;
            }
            return found;
        };

        Cell.prototype.liveNeighbours = function () {
            var arr = this.neighbours();
            if (arr.length === 8 && arr[7] === undefined) {
                debugger;
            }
            return this.neighbours().map(function(cell) {
                return cell.isLive();
            });
        };

        Cell.prototype.die = function() {
            return this.dead = true;
        };

        Cell.prototype.isDead = function() {
            return this.dead;
        };

        Cell.prototype.live = function() {
            return this.dead = false;
        };

        Cell.prototype.isLive = function() {
            return !this.isDead();
        };

        Cell.prototype.toggle = function() {
            this.dead = !this.dead;
            return this.dead;
        };

        var generation = 0,
            world = new World(constants.COLUMNS, constants.ROWS),
            step = function () {
                generation++;
                return world.step();
            },
            clear = function() {
                for (var y = 0; y < constants.ROWS; y++) {
                    for (var x = 0; x < constants.COLUMNS; x++) {
                        var cell = world.getCell(x, y);
                        cell.dead = true;
                        cell.locked = false;

                    }
                }
            },
            getBoard = function() {
                var liveCells = [];
                world.cells.each(function(cell) {
                    if (!cell.dead || cell.locked)
                        liveCells.push({ x: cell.x, y: cell.y, locked:cell.locked, dead:cell.dead });
                });
                return liveCells;
            },
            setBoard = function (newBoard) {
                
            };
        
        return {
            step: step,
            getCell: function(x, y) {
                return world.getCell(x, y);
            },
            clear: clear,
            getBoard: getBoard,
            setBoard: setBoard
        };
});
///#source 1 1 /Scripts/app/gameManager.js
define('gameManager',
    ['ko', 'constants', 'gameLogic', 'soundManager', 'gameView', 'tour', 'hopscotch', 'analytics', 'trackService'],
    function (ko, c, gameLogic, sm, gameView, tour, hopscotch, analytics, trackService) {
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
            init = function () {
                if (sm.browserNotSupported) {
                    $('#container').empty();
                    $('#browser-not-supported').show();
                    analytics.track('Browser not supported');
                    return;
                }
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
                var id = getParameterByName('id');
                if (id) {
                    var that = this;
                    trackService.get(id).done(function(track) {
                        if (track) {
                            that.loadTrack(track);
                        }
                    });
                    
                }

                tick();
                enablePopover();

                setupHtmlHooks();
            },
            getParameterByName = function(name){
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            setupHtmlHooks = function() {
                $(window).blur(function (e) {
                    if (isPlaying()) {
                        togglePlay();
                    }
                });
                $('html').on('mouseup', function (e) {
                    if (!$(e.target).closest('.popover.in').length) {
                        $('.popover').each(function () {
                            $(this.previousSibling).popover('destroy');
                        });
                        $('.popover').remove();
                        enablePopover();
                    }
                });
                $('#sound-set-input').change(function () {
                    sm.setSoundBank($(this).val());
                });

                //sharing
                $('#share-track-dlg').on('show.bs.modal', function (e) {
                    generateLink();
                });
                $('#share-track-dlg').on('hidden.bs.modal', function (e) {
                    trackUrl("");
                    $('#copy-btn').html('Copy');

                });
                $('a.popup').on('click', function (e) {
                    var that = $(this);
                    popupCenter(that.attr('href'), 'checkout my track', 580, 470);
                    analytics.track('Social Click', { id: that.attr('id') });
                    e.preventDefault();
                });

                var clip = new ZeroClipboard(document.getElementById("copy-btn"), {
                    moviePath: "/Content/ZeroClipboard.swf"
                });

                clip.on('complete', function (client, args) {
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
                    if (isPlaying()) {
                        gameView.moveColumn(currentNote);
                        last16thNoteDrawn = currentNote;
                    }
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
            removeChord = function (chord) {
                if (song.chords().length == song.chords().indexOf(chord) + 1 &&
                    currentChord == song.chords().indexOf(chord)) {
                    currentChord = 0;
                }
                song.chords.remove(chord);
                song.chords()[currentChord].isCurrent(true);
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
                trackService.save(trackObj)
                      .done(function (id) {
                            trackUrl(window.location.origin + '?id=' + id);
                            analytics.track('Share Click', { id: id });
                        })
                        .fail(function (data) {
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
                analytics.track('Help Click');
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
            changeKey: changeKey, changeMod: changeMod, toggleLock: toggleLock, copyLink: copyLink, showTour: showTour, loadTrack:loadTrack
        };
    });
///#source 1 1 /Scripts/app/gameView.js
define('gameView',
    ['constants'], function (c) {
        var containerId = '#game-container', 
            grid = [],
            leftMouseDownStartState = false, //true for dead
            rightMouseDownStart = false, //lock / unlock
            leftMouseDown = false, rightMouseDown = false,
            cellLivenessChanged = $.Callbacks(),
            cellLockStateChanged = $.Callbacks(),
            getCellStateDelegate = undefined,
            divs = [],
            init = function (getCellState) {
                getCellStateDelegate = getCellState;
                $('body').on('contextmenu', containerId, function (e) { return false; });
            },
            initializeGraphics = function () {
                var table = $('#game-table');
                for (var y = 0; y < c.ROWS; y++) {
                    var arr = [];
                    divs.push([]);
                    var tr = $('<tr></tr>');
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var td = createCell(x, y, getCellStateDelegate(x, y).dead);
                        arr.push(td);
                        tr.append(td);
                    }
                    grid.push(arr);
                    table.append(tr);
                }
                table.on('mousedown', 'td', function (evt) {
                    var td = $(evt.currentTarget), row = td.data('row'), col = td.data('col');
                    if (evt.which === 1) { //left button
                        leftMouseDownStartState = !getCellStateDelegate(td.data('col'), td.data('row')).dead;
                        paintCell(td, leftMouseDownStartState);
                        cellLivenessChanged.fire(col, row, leftMouseDownStartState);
                        td.removeClass('hover');
                        leftMouseDown = true;
                    }
                    if (evt.which === 3) { //right button
                        rightMouseDownStart = !getCellStateDelegate(td.data('col'), td.data('row')).locked;
                        setLockVisibility(td, rightMouseDownStart);
                        cellLockStateChanged.fire(col, row, rightMouseDownStart);
                        td.removeClass('hover');
                        rightMouseDown = true;
                    }
                });
                $('body').on('mouseup', function (evt) {
                    rightMouseDown = leftMouseDown = false;
                });
                table.on('mouseenter', 'td', function (evt) {
                    var td = $(evt.currentTarget), row = td.data('row'), col = td.data('col');
                    
                    if (leftMouseDown) { //left button
                        if (getCellStateDelegate(col, row).dead !== leftMouseDownStartState) {
                            paintCell(td, leftMouseDownStartState);
                            cellLivenessChanged.fire(col, row, leftMouseDownStartState);
                        }
                    }
                    else if (rightMouseDown) { //right button
                        setLockVisibility(td, rightMouseDownStart);
                        cellLockStateChanged.fire(col, row, rightMouseDownStart);
                    } else {
                        td.addClass('hover');
                    }
                });
                table.on('mouseleave', 'td', function (evt) {
                    var td = $(evt.currentTarget), row = td.data('row'), col = td.data('col');
                    td.removeClass('hover');
                });
            },
            createCell = function (x, y, isDead) {
                var td = $('<td><div></div></td>');
                td.attr('data-row', y);
                td.attr('data-col', x);
                divs[y].push(td.find('div')); //save the divs instead of finding them each time for better performance
                return td;
            },
            paintCell = function (cellContainer, isDead) {
                if (isDead) {
                    cellContainer.removeClass('alive');
                } else {
                    cellContainer.addClass('alive');
                }
            },
            setCellLiveness = function (row, col, isDead) {
                paintCell(grid[row][col], isDead);
            },
            setLockVisibility = function (cellContainer, isLocked) {
                if (!isLocked) {
                    cellContainer.removeClass('locked');
                } else {
                    cellContainer.addClass('locked');
                }
            },
            setCellLock = function (row, col, isLocked) {
                setLockVisibility(grid[row][col], isLocked);
            },
            moveColumn = function (column) {
                //$('div.playing').removeClass('playing');
                var prev = column == 0 ? c.COLUMNS - 1 : column - 1;
                $.each(divs, function (i, row) {
                    row[prev].removeClass('playing');
                    row[column].addClass('playing');
                });
                //$('td:nth-child(' + (column+1) + ') > div').addClass('playing');
            },
            setColumnIndicatorVisibility = function (visible, column) {
                if (visible) {
                    moveColumn(column);
                } else {
                    $('div.playing').removeClass('playing');
                }
            };

        return {
            init: init,
            initializeGraphics: initializeGraphics,
            setCellLiveness: setCellLiveness,
            setCellLock: setCellLock,
            moveColumn: moveColumn,
            setColumnIndicatorVisibility: setColumnIndicatorVisibility,
            cellLockStateChanged: cellLockStateChanged,
            cellLivenessChanged: cellLivenessChanged,
        };
    });
///#source 1 1 /Scripts/app/soundManager.js
define('soundManager',
    ['constants'], function (c) {
        var soundBanks = {
            '8bit': {
                'drums': Math.range(0, 3),
                'bass': Math.range(4, 15),
                'melody': Math.range(16, 39)
            },
            'Rock': {
                'drums': Math.range(40, 43),
                'bass': Math.range(44, 55),
                'melody': Math.range(56, 79)
            },
            'Latin': {
                'drums': Math.range(80, 83),
                'bass': Math.range(84, 95),
                'melody': Math.range(96, 119)
            }
        },
            context, soundBuffers,
            currentSoundBank = '8bit',
            browserNotSupported = false,
            play = function (sounds, time, chord) {
                var index = 0;
                var chordArr = buildChord(chord);
                for (var i = 0; i < sounds.length; i++) {
                    if (sounds[i] > 4) { // drums
                        index = soundBanks[currentSoundBank]['drums'][c.ROWS - 1 - sounds[i]];
                    }
                    else if (sounds[i] == 4){ //bass
                        index = soundBanks[currentSoundBank]['bass'][chordArr[sounds[i]]];
                    }
                    else {
                        index = soundBanks[currentSoundBank]['melody'][chordArr[sounds[i]]];
                    }
                    playSound(index, time);
                    
                }
            },
            finishedLoading = function(bufferList) {
                // Create two sources and play them both together.
                soundBuffers = bufferList;
                playSound(120, 0); //play noop
            },
            playSound = function (index, time) {
                var source = context.createBufferSource();
                source.buffer = soundBuffers[index];
                source.connect(context.destination);
                source.start(time);
            },
            buildChord = function (chordName) {
                var arr = [], base = 0, bassBase = 0;
                switch (chordName[0]) {
                    case 'A': base = bassBase = 5; break;
                    case 'B': base = bassBase = 7; break;
                    case 'C': base = bassBase = 8; break;
                    case 'D': base = bassBase = 10; break;
                    case 'E': base = bassBase = 0; break;
                    case 'F': base = bassBase = 1; break;
                    case 'G': base = bassBase = 3; break;
                }
                chordName = chordName.substr(1);
                if (chordName[0] == '#') {
                    base++;
                    bassBase++;
                    chordName = chordName.substr(1);
                }
                if (chordName == 'maj') { //major
                    arr = [base, base + 4, base + 7, base + 12].reverse();
                }
                else if (chordName === 'min') { //minor
                    arr = [base, base + 3, base + 7, base + 12].reverse();
                }
                else if (chordName === '7') { //seven
                    arr = [base, base + 4, base + 7, base + 10].reverse();
                }
                else if (chordName === 'maj7') { //major sevn
                    arr = [base, base + 4, base + 7, base + 11].reverse();
                }
                else if (chordName === 'min7') { //minor seven
                    arr = [base, base + 3, base + 7, base + 10].reverse();
                }
                else if (chordName === 'aug') { //minor seven
                    arr = [base, base + 4, base + 7, base + 8].reverse();
                }
                arr.push(bassBase);
                //arr.push(bassBase + 7 > 15 ? bassBase - 5 : bassBase + 7);
                return arr;
            },
            init = function() {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!window.AudioContext) {
                    browserNotSupported = true;
                    return;
                }
                context = new AudioContext();

                var bufferLoader = new BufferLoader(
                    context,
                    [
                        './Content/Sounds/8bit-kick.ogg', //0
                        './Content/Sounds/8bit-snare.ogg', //1
                        './Content/Sounds/8bit-special.ogg', //2
                        './Content/Sounds/8bit-hh.ogg', //3
                        './Content/Sounds/8bit-bass-E0.ogg', //4
                        './Content/Sounds/8bit-bass-F0.ogg', //5
                        './Content/Sounds/8bit-bass-F_0.ogg', //6
                        './Content/Sounds/8bit-bass-G0.ogg', //7
                        './Content/Sounds/8bit-bass-G_0.ogg', //8
                        './Content/Sounds/8bit-bass-A0.ogg', //9
                        './Content/Sounds/8bit-bass-A_0.ogg', //10
                        './Content/Sounds/8bit-bass-B0.ogg', //11
                        './Content/Sounds/8bit-bass-C1.ogg', //12
                        './Content/Sounds/8bit-bass-C_1.ogg', //13
                        './Content/Sounds/8bit-bass-D1.ogg', //14
                        './Content/Sounds/8bit-bass-D_1.ogg', //15
                        './Content/Sounds/8bit-E1.ogg',  //16
                        './Content/Sounds/8bit-F1.ogg', //17
                        './Content/Sounds/8bit-F_1.ogg', //18
                        './Content/Sounds/8bit-G1.ogg', //19
                        './Content/Sounds/8bit-G_1.ogg', //20
                        './Content/Sounds/8bit-A1.ogg', //21
                        './Content/Sounds/8bit-A_1.ogg', //22
                        './Content/Sounds/8bit-B1.ogg', //23
                        './Content/Sounds/8bit-C2.ogg', //24
                        './Content/Sounds/8bit-C_2.ogg', //25
                        './Content/Sounds/8bit-D2.ogg', //26
                        './Content/Sounds/8bit-D_2.ogg', //27
                        './Content/Sounds/8bit-E2.ogg', //28
                        './Content/Sounds/8bit-F2.ogg', //29
                        './Content/Sounds/8bit-F_2.ogg', //30
                        './Content/Sounds/8bit-G2.ogg', //31
                        './Content/Sounds/8bit-G_2.ogg', //32
                        './Content/Sounds/8bit-A2.ogg', //33
                        './Content/Sounds/8bit-A_2.ogg', //34
                        './Content/Sounds/8bit-B2.ogg', //35
                        './Content/Sounds/8bit-C3.ogg', //36
                        './Content/Sounds/8bit-C_3.ogg', //37
                        './Content/Sounds/8bit-D3.ogg', //38
                        './Content/Sounds/8bit-D_3.ogg', //39
                        './Content/Sounds/rock-kick.ogg', //40
                        './Content/Sounds/rock-snare.ogg', //41
                        './Content/Sounds/rock-special.ogg', //42
                        './Content/Sounds/rock-hh.ogg', //43
                        './Content/Sounds/rock-bass-E0.ogg', //44
                        './Content/Sounds/rock-bass-F0.ogg', //45
                        './Content/Sounds/rock-bass-F_0.ogg', //46
                        './Content/Sounds/rock-bass-G0.ogg', //47
                        './Content/Sounds/rock-bass-G_0.ogg', //48
                        './Content/Sounds/rock-bass-A0.ogg', //49
                        './Content/Sounds/rock-bass-A_0.ogg', //50
                        './Content/Sounds/rock-bass-B0.ogg', //51
                        './Content/Sounds/rock-bass-C1.ogg', //52
                        './Content/Sounds/rock-bass-C_1.ogg', //53
                        './Content/Sounds/rock-bass-D1.ogg', //54
                        './Content/Sounds/rock-bass-D_1.ogg', //55
                        './Content/Sounds/rock-E1.ogg',  //56
                        './Content/Sounds/rock-F1.ogg', //57
                        './Content/Sounds/rock-F_1.ogg', //58
                        './Content/Sounds/rock-G1.ogg', //59
                        './Content/Sounds/rock-G_1.ogg', //60
                        './Content/Sounds/rock-A1.ogg', //61
                        './Content/Sounds/rock-A_1.ogg', //62
                        './Content/Sounds/rock-B1.ogg', //63
                        './Content/Sounds/rock-C2.ogg', //64
                        './Content/Sounds/rock-C_2.ogg', //65
                        './Content/Sounds/rock-D2.ogg', //66
                        './Content/Sounds/rock-D_2.ogg', //67
                        './Content/Sounds/rock-E2.ogg', //68
                        './Content/Sounds/rock-F2.ogg', //69
                        './Content/Sounds/rock-F_2.ogg', //70
                        './Content/Sounds/rock-G2.ogg', //71
                        './Content/Sounds/rock-G_2.ogg', //72
                        './Content/Sounds/rock-A2.ogg', //73
                        './Content/Sounds/rock-A_2.ogg', //74
                        './Content/Sounds/rock-B2.ogg', //75
                        './Content/Sounds/rock-C3.ogg', //76
                        './Content/Sounds/rock-C_3.ogg', //77
                        './Content/Sounds/rock-D3.ogg', //78
                        './Content/Sounds/rock-D_3.ogg', //79
                        './Content/Sounds/latin-kick.ogg', //80
                        './Content/Sounds/latin-snare.ogg', //81
                        './Content/Sounds/latin-special.ogg', //82
                        './Content/Sounds/latin-hh.ogg', //83
                        './Content/Sounds/latin-bass-E0.ogg', //84
                        './Content/Sounds/latin-bass-F0.ogg', //85
                        './Content/Sounds/latin-bass-F_0.ogg', //86
                        './Content/Sounds/latin-bass-G0.ogg', //87
                        './Content/Sounds/latin-bass-G_0.ogg', //88
                        './Content/Sounds/latin-bass-A0.ogg', //89
                        './Content/Sounds/latin-bass-A_0.ogg', //90
                        './Content/Sounds/latin-bass-B0.ogg', //91
                        './Content/Sounds/latin-bass-C1.ogg', //92
                        './Content/Sounds/latin-bass-C_1.ogg', //93
                        './Content/Sounds/latin-bass-D1.ogg', //94
                        './Content/Sounds/latin-bass-D_1.ogg', //95
                        './Content/Sounds/latin-E1.ogg',  //96
                        './Content/Sounds/latin-F1.ogg', //97
                        './Content/Sounds/latin-F_1.ogg', //98
                        './Content/Sounds/latin-G1.ogg', //99
                        './Content/Sounds/latin-G_1.ogg', //100
                        './Content/Sounds/latin-A1.ogg', //101
                        './Content/Sounds/latin-A_1.ogg', //102
                        './Content/Sounds/latin-B1.ogg', //103
                        './Content/Sounds/latin-C2.ogg', //104
                        './Content/Sounds/latin-C_2.ogg', //105
                        './Content/Sounds/latin-D2.ogg', //106
                        './Content/Sounds/latin-D_2.ogg', //107
                        './Content/Sounds/latin-E2.ogg', //108
                        './Content/Sounds/latin-F2.ogg', //109
                        './Content/Sounds/latin-F_2.ogg', //110
                        './Content/Sounds/latin-G2.ogg', //111
                        './Content/Sounds/latin-G_2.ogg', //112
                        './Content/Sounds/latin-A2.ogg', //113
                        './Content/Sounds/latin-A_2.ogg', //114
                        './Content/Sounds/latin-B2.ogg', //115
                        './Content/Sounds/latin-C3.ogg', //116
                        './Content/Sounds/latin-C_3.ogg', //117
                        './Content/Sounds/latin-D3.ogg', //118
                        './Content/Sounds/latin-D_3.ogg', //119
                        './Content/Sounds/noop.ogg'
                    ],
                    finishedLoading
                );

                bufferLoader.load();

                window.buildChord = buildChord;
            };

        init();

        return {
            play: play,
            context: context,
            buildChord: buildChord,
            setSoundBank: function(bank) { currentSoundBank = bank; },
            getSoundBank: function () { return currentSoundBank; },
            browserNotSupported: browserNotSupported
            
    };
    });
///#source 1 1 /Scripts/app/tour.js
define('tour',
    [], function() {
        return {
            id: "hello-hopscotch",
                steps: [
                  {
                      title: "Overview",
                      content: "Game of Music is a music sequencer where every state is computed according to the rules of Conway's Game of Life. Fill in the initial state, set the BPM, pick a sound set, set your track's chords and click play!",
                      target: "controls-container",
                      placement: "bottom",
                      xOffset: 'center',
                      arrowOffset: 'center'
                  },
                  {
                      title: "Build Your Track",
                      content: "The four bottom rows control the drum section, top four the melody instrument and the middle is the bass. Left click to fill in the cell, right click to lock the cell (state will not change).",
                      target: "game-container",
                      placement: "bottom",
                      xOffset: 'center',
                      arrowOffset: 'center',
                      showPrevButton:true
                  },
                  {
                      title: "Play/Pause",
                      content: "Click to play/pause.",
                      target: 'play-btn',
                      xOffset: 'center',
                      arrowOffset: 'center',
                      placement: "bottom",
                      showPrevButton: true
                  },
                  {
                      title: "Clear",
                      content: "Click to clear the track.",
                      target: 'clear-btn',
                      xOffset: 'center',
                      arrowOffset: 'center',
                      placement: "bottom",
                      showPrevButton: true
                  },
                    {
                        title: "Lock",
                        content: "Lock the entire board (good for figuring out the initial state).",
                        target: 'lock-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        title: "BPM",
                        content: "Set the track's BPM.",
                        target: 'bpm-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        title: "Sound Set",
                        content: "Pick a sound set.",
                        target: 'sound-set-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        title: "Help",
                        content: "See this tour.",
                        target: 'help-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        title: "Share",
                        content: "Click to generate a unique link to your track and share it.",
                        target: 'share-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        title: "Chords",
                        content: "Click the chord letter to change the chords key, and click the chord modulator to change the chord type. Click the +/- signs to add/remove a chord.",
                        target: 'chord-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                    {
                        content: "Don't forget to share your track, and have fun!",
                        target: 'share-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom",
                        showPrevButton: true
                    },
                ]
        };
});
///#source 1 1 /Scripts/app/trackService.js
define('trackService',
    [], function() {
        var serviceUrl = 'http://gameofmusicapi.azurewebsites.net/api/tracks/',
            get = function (id, callback) {
                return $.get(serviceUrl + id);
            },
            save = function(track) {
                return $.post(serviceUrl, track);                   
            };

        return {
            get: get,
            save: save
        };
    });
///#source 1 1 /Scripts/app/utils.js
define('utils',
    ['constants'], function (constants) {
        var
            msToReadableTime = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                return (minutes == 0 ? '00' : (minutes < 10 ? '0' + minutes.toString() : minutes)) + ':' +
                    (seconds == 0 ? '00' : (seconds < 10 ? '0' + seconds.toString() : seconds));

            },
            getTimespanInText = function (ms) {
                var totalSeconds = ms / 1000;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = Math.floor(totalSeconds - minutes * 60);
                var txt = '';
                if (minutes > 0) {
                    txt = minutes + ' minutes ';
                    if (seconds > 0)
                        txt += 'and ';
                }
                if (seconds > 0)
                    txt += seconds + ' seconds';
                return txt;
            };
        return {
            getTimespanInText: getTimespanInText,
            msToReadableTime: msToReadableTime
        };
    });
