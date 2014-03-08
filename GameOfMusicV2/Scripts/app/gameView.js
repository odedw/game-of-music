define('gameView',
    ['constants', 'createjs', 'assetManager'], function (c, createjs, assetManager) {
        var canvasId = '#game-canvas', canvasWidth, canvasHeight, stage, cellHeight, cellWidth,
            boardContainer, columnIndicator,
            grid = [],
            isLeftMouseDown = false, leftMouseDownStartState = false, //rue for dead
            isRightMouseDown = false, rightMouseDownStart = false, //lock / unlock
            cellLivenessChanged = $.Callbacks(),
            cellLockStateChanged = $.Callbacks(),
            getCellStateDelegate = undefined,
            init = function (getCellState) {
                getCellStateDelegate = getCellState;

                //create stage
                $('body').on('contextmenu', canvasId, function (e) { return false; });

                canvasWidth = $(canvasId).width();
                canvasHeight = $(canvasId).height();
                stage = new createjs.Stage(canvasId.substr(1));
                stage.snapPixelsEnabled = true;
                stage.enableMouseOver(50);
            },
            initializeGraphics = function() {
                cellWidth = (canvasWidth - c.CELL_MARGIN * (c.COLUMNS - 1)) / c.COLUMNS;
                cellHeight = (canvasHeight - c.CELL_MARGIN * (c.ROWS - 1)) / c.ROWS;
                
                boardContainer = new createjs.Container();
                for (var y = 0; y < c.ROWS; y++) {
                    var arr = [];
                    for (var x = 0; x < c.COLUMNS; x++) {
                        var cellContainer = createCell(x, y, getCellStateDelegate(x, y).dead);
                        arr.push(cellContainer);
                        boardContainer.addChild(cellContainer);
                    }
                    grid.push(arr);
                }
                stage.addChild(boardContainer);

                stage.addEventListener("stagemousedown", function(event) {
                    var x = Math.floor(event.rawX / (cellWidth + c.CELL_MARGIN)),
                        y = Math.floor(event.rawY / (cellHeight + c.CELL_MARGIN));

                    if (event.nativeEvent.button === 0) { //left button
                        leftMouseDownStartState = !getCellStateDelegate(x, y).dead;
                        cellLivenessChanged.fire(x,y,leftMouseDownStartState);
                        paintCell(grid[y][x], leftMouseDownStartState);
                        isLeftMouseDown = true;

                    } else if (event.nativeEvent.button === 2) {
                        rightMouseDownStart = !getCellStateDelegate(x, y).locked;
                        cellLockStateChanged.fire(x,y,rightMouseDownStart);
                        setLockVisibility(grid[y][x], rightMouseDownStart);
                        isRightMouseDown = true;
                    }
                });
                stage.addEventListener("stagemouseup", function(event) {
                    isLeftMouseDown = isRightMouseDown = false;
                });

                columnIndicator = new createjs.Shape();

                for (var i = 0; i < c.ROWS; i++) {
                    columnIndicator.graphics.f('#00FF00').drawRect(0, i * cellHeight + i * c.CELL_MARGIN, cellWidth, cellHeight);
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
                lockImg.x = cellWidth / 2 - 8;
                lockImg.y = cellHeight / 2 - 8;
                lockImg.alpha = 0;
                cellContainer.lock = lockImg;
                cellContainer.addChild(lockImg);
                var shapeX = x, shapeY = y;
                cellContainer.enableMouseOver = true;
                cellContainer.addEventListener("mouseover", function (event) {
                    if (isLeftMouseDown) {
                        cellLivenessChanged.fire(shapeX, shapeY, leftMouseDownStartState);
                        paintCell(cellContainer, leftMouseDownStartState);
                    } else if (isRightMouseDown) {
                        cellLockStateChanged.fire(shapeX,shapeY,rightMouseDownStart);
                        setLockVisibility(cellContainer, rightMouseDownStart);
                    } else {
                        shape.graphics.f(getCellStateDelegate(shapeX, shapeY).dead ? '#CCCCCC' : '#777777').drawRect(0, 0, cellWidth, cellHeight);
                    }
                });
                cellContainer.addEventListener("mouseout", function (event) {
                    paintCell(cellContainer, getCellStateDelegate(shapeX, shapeY).dead);
                });
                
                cellContainer.x = xPos;
                cellContainer.y = yPos;
                paintCell(cellContainer, isDead);
                return cellContainer;
            },
            paintCell = function(cellContainer, isDead) {
                cellContainer.square.graphics.f(isDead ? 'black' : '#FFF8DC').drawRect(0, 0, cellWidth, cellHeight);
            },
            setCellLiveness = function (row, col, isDead) {
                paintCell(grid[row][col], isDead);
            },
            setLockVisibility = function(cellContainer, isLocked) {
                cellContainer.lock.alpha = isLocked ? 1 : 0;
            },
            setCellLock = function (row, col, isLocked) {
                setLockVisibility(grid[row][col], isLocked);
            },
            moveColumn = function (column) {
                columnIndicator.x = grid[0][column].x;
            },
            setColumnIndicatorVisibility = function(visible) {
                columnIndicator.alpha = visible ? 0.5 : 0;
            },
            tick = function(evt) {
                stage.update();
            };

        return {
            init:init,
            initializeGraphics: initializeGraphics,
            setCellLiveness: setCellLiveness,
            setCellLock: setCellLock,
            moveColumn: moveColumn,
            setColumnIndicatorVisibility: setColumnIndicatorVisibility,
            cellLockStateChanged: cellLockStateChanged,
            cellLivenessChanged:cellLivenessChanged,
            tick:tick,
        };
});