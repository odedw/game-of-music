define('gameManager',
    ['constants', 'gameLogic', 'assetManager', 'soundPlayer', 'gameView'], function (c, gameLogic, assetManager, sp, gameView) {
        var 
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false, currentColumn = 0, lastTimestamp = 0,
            bpm = 100, initialTimeForColumnStep = 60000 / (4 * bpm), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            
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
                tick(0);
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
                    }
                    else if (e.keyCode == c.KEY_R) {
                        clear();
                    }
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
            },
            tick = function (currentTimestamp) {
                var delta = currentTimestamp - lastTimestamp;
                if (isRunning) {
                    timeSinceLastStep += delta;
                    timeSinceLastBeat += delta;
                    if (timeSinceLastStep > initialTimeForColumnStep){//timeForColumnStep) {
                        //timeForColumnStep = initialTimeForColumnStep - (timeSinceLastStep - initialTimeForColumnStep);
                        //console.log(timeSinceLastStep + ' -> ' + timeForColumnStep);
                        console.log(timeSinceLastStep);
                        
                        timeSinceLastStep = 0;
                        currentColumn++;
                        if (currentColumn == c.COLUMNS) { //step life
                            var affectedCells = gameLogic.step();
                            affectedCells.each(function (currentCell) {
                                gameView.setCellLiveness(currentCell.y, currentCell.x, currentCell.dead);
                            });
                            currentColumn = 0;
                           
                        }
                        gameView.moveColumn(currentColumn);
                        
                        //if (currentColumn % 4 === 0) {
                        //    if (beats == 0)
                        //        average = timeSinceLastBeat;
                        //    else {
                        //        average = (average * beats) / (beats + 1) + timeSinceLastBeat / (beats + 1);
                        //    }
                        //    timeSinceLastBeat = 0;
                        //    beats++;
                        //    console.log(average);
                        //}
                        var rowsAlive = [];
                        for (var i = 0; i < c.ROWS; i++) {
                            if (!gameLogic.getCell(currentColumn, i).dead) {
                                rowsAlive.push(i);
                            }
                        }
                        //sp.play(rowsAlive);
                    }
                }
                lastTimestamp = currentTimestamp;
                window.requestAnimationFrame(tick);
            };
        return {
            init: init
    };
    });