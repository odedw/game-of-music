define('gameManager',
    ['createjs', 'constants', 'gameLogic', 'assetManager', 'soundPlayer', 'gameView'], function (createjs, c, gameLogic, assetManager, sp, gameView) {
        var 
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false, currentColumn = 0,
            bpm = 120, initialTimeForColumnStep = 60000 / (4 * bpm), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            
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
                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(c.FPS);
                createjs.Ticker.addEventListener("tick", tick);
                setupKeys();
                assetManager.loadCompleteEvent.add(function () {
                    gameView.initializeGraphics();
                });
                assetManager.loadAssets();
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
                        gameView.setColumnIndicatorVisibility(isRunning);
                    }
                    else if (e.keyCode == c.KEY_R) {
                        clear();
                    }
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
            },
            tick = function (evt) {
                if (isRunning) {
                    timeSinceLastStep += evt.delta;
                    timeSinceLastBeat += evt.delta;
                    if (timeSinceLastStep > timeForColumnStep) {
                        timeForColumnStep = initialTimeForColumnStep - (timeSinceLastStep - initialTimeForColumnStep);
//                        console.log(timeSinceLastStep + ' -> ' + timeForColumnStep);
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
                        
                        if (currentColumn % 4 === 0) {
                            if (beats == 0)
                                average = timeSinceLastBeat;
                            else {
                                average = (average * beats) / (beats + 1) + timeSinceLastBeat / (beats + 1);
                            }
                            timeSinceLastBeat = 0;
                            beats++;
                            //console.log(average);
                        }

                        var rowsAlive = [];
                        for (var i = 0; i < c.ROWS; i++) {
                            if (!gameLogic.getCell(currentColumn, i).dead) {
                                rowsAlive.push(i);
                            }
                        }
                        sp.play(rowsAlive);
                    }
                }
                gameView.tick(evt);
            };
        return {
            init: init
    };
    });