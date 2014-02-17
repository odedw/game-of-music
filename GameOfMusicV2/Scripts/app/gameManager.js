define('gameManager',
    ['createjs','constants','gameLogic'], function(createjs,constants,gameLogic) {
        var canvasWidth, canvasHeight, stage, cellHeight,cellWidth,
            boardContainer,
            keysDown = {},
            timeSinceLastStep = 0, isRunning = false,
            init = function () {
                //create stage
                canvasWidth = $('#game-canvas').width();
                canvasHeight = $('#game-canvas').height();         
                stage = new createjs.Stage("game-canvas");
                stage.snapPixelsEnabled = true;
                stage.enableMouseOver(10);

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
                var g = new createjs.Graphics();
                boardContainer = new createjs.Shape(g);
                
                for (var i = 0; i < constants.ROWS; i++) {
                    for (var j = 0; j < constants.COLUMNS; j++) {
                        paintCell(i, j, gameLogic.getCell(i, j).dead);
                    }
                }
                stage.addChild(boardContainer);
            },
            paintCell = function (i, j, isDead) {
                var y = i * cellHeight + i * constants.CELL_MARGIN;
                var x = j * cellWidth + j * constants.CELL_MARGIN;

                boardContainer.graphics.f(isDead ? 'black' : '#FFF8DC').drawRect(x, y, cellWidth,cellHeight);
            },
            setupKeys = function () {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
                //                document.onmousedown = handleKeyDown;
                //                document.onmouseup = handleKeyUp;
            },
            handleKeyDown = function (e) {
                if (!keysDown[e.keyCode]) {
                    keysDown[e.keyCode] = true;
                }
            },
            handleKeyUp = function (e) {
                keysDown[e.keyCode] = false;
            },
            

            run = function() {
                timeSinceLastStep = 0;
                isRunning = true;
            },
            tick = function (evt) {
                timeSinceLastStep += evt.delta;
                if (timeSinceLastStep > 250) {
                    timeSinceLastStep = 0;
                    var affectedCells = gameLogic.step();
                    affectedCells.each(function(currentCell) {
                        paintCell(currentCell.x, currentCell.y, currentCell.dead);
                    });
                }
                stage.update();
            };
        return {          
            init:init
        };
    });