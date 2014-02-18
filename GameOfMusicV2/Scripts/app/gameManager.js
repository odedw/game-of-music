define('gameManager',
    ['createjs','constants','gameLogic'], function(createjs,constants,gameLogic) {
        var canvasWidth, canvasHeight, stage, cellHeight, cellWidth,
            boardContainer,
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false,
            grid = [],
            isMouseDown = false, mouseDownStartState = false, //true for dead
            init = function () {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();         
                stage = new createjs.Stage("game-canvas");
                stage.snapPixelsEnabled = true;
                stage.enableMouseOver(50);

                createjs.Ticker.requestRAF = true;
                createjs.Ticker.setFPS(constants.FPS);
                createjs.Ticker.addEventListener("tick", tick);
                
                setupKeys();
                
                initializeGraphics();
            },
            initializeGraphics = function () {
                cellWidth = (canvasWidth - constants.CELL_MARGIN * (constants.COLUMNS - 1)) / constants.COLUMNS;
                cellHeight = (canvasHeight - constants.CELL_MARGIN * (constants.ROWS - 1)) / constants.ROWS;
                console.log(cellWidth+','+cellHeight);
                boardContainer = new createjs.Container();
                for (var y = 0; y < constants.ROWS; y++) {
                    var arr = [];
                    for (var x = 0; x < constants.COLUMNS; x++) {
                        var shape = createCell(x, y, gameLogic.getCell(x, y).dead);
                        arr.push(shape);
                        boardContainer.addChild(shape);
                    }
                    grid.push(arr);
                }
                stage.addChild(boardContainer);
                
                stage.addEventListener("stagemousedown", function (event) {
                    var x = Math.floor(event.rawX / (cellWidth + constants.CELL_MARGIN)),
                        y = Math.floor(event.rawY / (cellHeight + constants.CELL_MARGIN));

                    mouseDownStartState = !gameLogic.getCell(x, y).dead;
                    isMouseDown = true;
                    gameLogic.getCell(x, y).dead = mouseDownStartState;
                    paintSquare(grid[y][x], mouseDownStartState);
                    
                });
                stage.addEventListener("stagemouseup", function (event) {
                    isMouseDown = false;
                });
            },
            createCell = function (x, y, isDead) {
                var yPos = y * cellHeight + y * constants.CELL_MARGIN;
                var xPos = x * cellWidth + x * constants.CELL_MARGIN;
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
                for (var y = 0; y < constants.ROWS; y++) {
                    for (var x = 0; x < constants.COLUMNS; x++) {
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
                    if (e.keyCode == constants.KEY_SPACE) {
                        isRunning = !isRunning;
                    }
                    else if (e.keyCode == constants.KEY_R) {
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
                    if (timeSinceLastStep > 250) {
                        timeSinceLastStep = 0;
                        var affectedCells = gameLogic.step();
                        affectedCells.each(function(currentCell) {
                            paintSquare(grid[currentCell.y][currentCell.x], currentCell.dead);
                        });
                    }
                }
                stage.update();
            };
        return {
            init: init
    };
    });