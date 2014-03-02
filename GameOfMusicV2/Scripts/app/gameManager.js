define('gameManager',
    ['createjs', 'constants', 'gameLogic', 'assetManager'], function (createjs, c, gameLogic, assetManager) {
        var canvasId = '#game-canvas', canvasWidth, canvasHeight, stage, cellHeight, cellWidth,
            boardContainer, columnIndicator,
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false, currentColumn = 0,
            grid = [],
            bpm = 120, initialTimeForColumnStep = 60000 / (4 * bpm), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            
            isLeftMouseDown = false, leftMouseDownStartState = false, //rue for dead
            isRightMouseDown = false, rightMouseDownStart = false, //lock / unlock
            init = function () {
                $('body').on('contextmenu', canvasId, function (e) { return false; });
                
                //create stage
                canvasWidth = $(canvasId).width();
                canvasHeight = $(canvasId).height();
                stage = new createjs.Stage(canvasId.substr(1));
                stage.snapPixelsEnabled = true;
                stage.enableMouseOver(50);

                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(c.FPS);
                createjs.Ticker.addEventListener("tick", tick);
                
                setupKeys();

                assetManager.loadCompleteEvent.add(function () {
                    initializeGraphics();
                });
                assetManager.loadAssets();

            },
            initializeGraphics = function () {
                cellWidth = (canvasWidth - c.CELL_MARGIN * (c.COLUMNS - 1)) / c.COLUMNS;
                cellHeight = (canvasHeight - c.CELL_MARGIN * (c.ROWS - 1)) / c.ROWS;

                
                
                boardContainer = new createjs.Container();
                for (var y = 0; y < c.ROWS; y++) {
                    var arr = [];
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cellContainer = createCell(x, y, gameLogic.getCell(x, y).dead);
                        arr.push(cellContainer);
                        boardContainer.addChild(cellContainer);
                    }
                    grid.push(arr);
                }
                stage.addChild(boardContainer);
                
                stage.addEventListener("stagemousedown", function (event) {
                    var x = Math.floor(event.rawX / (cellWidth + c.CELL_MARGIN)),
                        y = Math.floor(event.rawY / (cellHeight + c.CELL_MARGIN));

                    if (event.nativeEvent.button === 0) { //left button
                        leftMouseDownStartState = !gameLogic.getCell(x, y).dead;
                        gameLogic.getCell(x, y).dead = leftMouseDownStartState;
                        paintSquare(grid[y][x], leftMouseDownStartState);
                        isLeftMouseDown = true;

                    } else if (event.nativeEvent.button === 2) {
                        rightMouseDownStart = !gameLogic.getCell(x, y).locked;
                        gameLogic.getCell(x, y).locked = rightMouseDownStart;
                        setLockVisibility(grid[y][x], rightMouseDownStart);
                        isRightMouseDown = true;
                    }
                    
                    
                });
                stage.addEventListener("stagemouseup", function (event) {
                    isLeftMouseDown = isRightMouseDown = false;
                });
                
                columnIndicator = new createjs.Shape();
                
                for (var i = 0; i < c.ROWS; i++) {
                    columnIndicator.graphics.f('#00FF00').drawRect(0, i*cellHeight + i*c.CELL_MARGIN, cellWidth, cellHeight);
                    columnIndicator.alpha = 0.0;
                }
                columnIndicator.x = columnIndicator.y = 0;

                stage.addChild(columnIndicator);
            },
            createCell = function (x, y, isDead) {
                var yPos = y * cellHeight + y * c.CELL_MARGIN;
                var xPos = x * cellWidth + x * c.CELL_MARGIN;
                var cellContainer = new createjs.Container();
                var shape = new createjs.Shape();
                cellContainer.addChild(shape);
                cellContainer.square = shape;
                var lockImg = new createjs.Bitmap(assetManager.images['lock']);
                lockImg.x = cellWidth / 2 - 3.5;
                lockImg.y = cellHeight / 2 - 4;
                lockImg.alpha = 0;
                cellContainer.lock = lockImg;
                cellContainer.addChild(lockImg);
                var shapeX = x, shapeY = y;
                cellContainer.enableMouseOver = true;
                cellContainer.addEventListener("mouseover", function (event) {
                    if (isLeftMouseDown) {
                        gameLogic.getCell(shapeX, shapeY).dead = leftMouseDownStartState;
                        paintSquare(cellContainer, leftMouseDownStartState);
                    } else if (isRightMouseDown) {
                        gameLogic.getCell(shapeX, shapeY).locked = rightMouseDownStart;
                        setLockVisibility(cellContainer, rightMouseDownStart);
                    } else {
                        shape.graphics.f(gameLogic.getCell(shapeX, shapeY).dead ? '#CCCCCC' : '#777777').drawRect(0, 0, cellWidth, cellHeight);
                    }
                });
                cellContainer.addEventListener("mouseout", function (event) {
                    paintSquare(cellContainer, gameLogic.getCell(shapeX, shapeY).dead);
                });
                
                cellContainer.x = xPos;
                cellContainer.y = yPos;
                paintSquare(cellContainer, isDead);
                return cellContainer;
            },
            clear=function() {
                gameLogic.clear();
                matchLogic();
            },
            matchLogic = function() {
                for (var y = 0; y < c.ROWS; y++) {
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cell = gameLogic.getCell(x, y);
                        paintSquare(grid[y][x], cell.dead);
                        setLockVisibility(grid[y][x], cell.locked);
                    }
                }
            },
            paintSquare = function (cellContainer, isDead) {
                cellContainer.square.graphics.f(isDead ? 'black' : '#FFF8DC').drawRect(0, 0, cellWidth, cellHeight);
            },
            setLockVisibility = function(cellContainer, isLocked) {
                cellContainer.lock.alpha = isLocked ? 1 : 0;
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
                        columnIndicator.alpha = isRunning ? 0.5 : 0;
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
                                paintSquare(grid[currentCell.y][currentCell.x], currentCell.dead);
                            });
                            currentColumn = 0;
                           
                        }
                        moveColumn();
                        
                        
                        if (currentColumn % 4 === 0) {
                            assetManager.playSound('click');
                            if (beats == 0)
                                average = timeSinceLastBeat;
                            else {
                                average = (average * beats) / (beats + 1) + timeSinceLastBeat / (beats + 1);
                            }
                            timeSinceLastBeat = 0;
                            beats++;
                            console.log(average);
                            
                        }
                    }
                }
                stage.update();
            },
            moveColumn = function() {
                columnIndicator.x = grid[0][currentColumn].x;
            };
        return {
            init: init
    };
    });