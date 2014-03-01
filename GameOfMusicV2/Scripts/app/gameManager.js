define('gameManager',
    ['createjs', 'constants', 'gameLogic', 'assetManager'], function (createjs, c, gameLogic, assetManager) {
        var canvasWidth, canvasHeight, stage, cellHeight, cellWidth,
            boardContainer, columnIndicator,
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false, currentColumn = 0,
            grid = [],
            bpm = 120, initialTimeForColumnStep = 60000 / (4 * bpm), timeForColumnStep = initialTimeForColumnStep, timeSinceLastBeat = 0, beats = 0, average = 0,
            
            isMouseDown = false, mouseDownStartState = false, //true for dead
            init = function () {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();         
                stage = new createjs.Stage("game-canvas");
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
                        var shape = createCell(x, y, gameLogic.getCell(x, y).dead);
                        arr.push(shape);
                        boardContainer.addChild(shape);
                    }
                    grid.push(arr);
                }
                stage.addChild(boardContainer);
                
                stage.addEventListener("stagemousedown", function (event) {
                    var x = Math.floor(event.rawX / (cellWidth + c.CELL_MARGIN)),
                        y = Math.floor(event.rawY / (cellHeight + c.CELL_MARGIN));

                    mouseDownStartState = !gameLogic.getCell(x, y).dead;
                    isMouseDown = true;
                    gameLogic.getCell(x, y).dead = mouseDownStartState;
                    paintSquare(grid[y][x], mouseDownStartState);
                    
                });
                stage.addEventListener("stagemouseup", function (event) {
                    isMouseDown = false;
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
                var shape = new createjs.Shape();
                var shapeX = x, shapeY = y;
                shape.enableMouseOver = true;
                shape.addEventListener("mouseover", function (event) {
                    if (isMouseDown) {
                        gameLogic.getCell(shapeX, shapeY).dead = mouseDownStartState;
                        paintSquare(shape, mouseDownStartState);
                    } else {
                        shape.graphics.f(gameLogic.getCell(shapeX, shapeY).dead ? '#CCCCCC' : '#777777').drawRect(0, 0, cellWidth, cellHeight);
                    }
                });
                shape.addEventListener("mouseout", function (event) {
                    paintSquare(shape, gameLogic.getCell(shapeX, shapeY).dead);
                });
                
                shape.x = xPos;
                shape.y = yPos;
                paintSquare(shape, isDead);
                return shape;
            },
            clear=function() {
                gameLogic.clear();
                matchLogic();
            },
            matchLogic = function() {
                for (var y = 0; y < c.ROWS; y++) {
                    for (var x = 0; x < c.COLUMNS; x++) {
                        paintSquare(grid[y][x], gameLogic.getCell(x, y));
                    }
                }
            },
            paintSquare = function (square, isDead) {
                square.graphics.f(isDead ? 'black' : '#FFF8DC').drawRect(0, 0, cellWidth, cellHeight);
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