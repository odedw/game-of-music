define('gameView',
    ['constants', 'createjs', 'assetManager'], function (c, createjs, assetManager) {
        var containerId = '#game-container', containerWidth, containerHeight, //stage,
            cellHeight, cellWidth,
            //boardContainer,
            columnIndicator,
            grid = [],
            leftMouseDownStartState = false, //true for dead
            rightMouseDownStart = false, //lock / unlock
            cellLivenessChanged = $.Callbacks(),
            cellLockStateChanged = $.Callbacks(),
            getCellStateDelegate = undefined,
            init = function (getCellState) {
                getCellStateDelegate = getCellState;
                $('body').on('contextmenu', containerId, function (e) { return false; });
            },
            initializeGraphics = function () {
                var table = $('#game-table');
                for (var y = 0; y < c.ROWS; y++) {
                    var arr = [];
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
                    }
                    if (evt.which === 3) { //right button
                        rightMouseDownStart = !getCellStateDelegate(td.data('col'), td.data('row')).locked;
                        setLockVisibility(td, rightMouseDownStart);
                        cellLockStateChanged.fire(col, row, rightMouseDownStart);
                        td.removeClass('hover');
                    }
                });
                table.on('mouseenter', 'td', function (evt) {
                    var td = $(evt.currentTarget), row = td.data('row'), col = td.data('col');
                    
                    if (evt.which === 1) { //left button
                        if (getCellStateDelegate(col, row).dead !== leftMouseDownStartState) {
                            paintCell(td, leftMouseDownStartState);
                            cellLivenessChanged.fire(col, row, leftMouseDownStartState);
                        }
                    }
                    else if (evt.which === 3) { //right button
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
                $('td').removeClass('playing');
                $('td[data-col="' + column + '"]').addClass('playing');
            },
            setColumnIndicatorVisibility = function (visible, column) {
                if (visible) {
                    moveColumn(column);
                } else {
                    $('td').removeClass('playing');
                }
            },
            tick = function (evt) {
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
            tick: tick,
        };
    });