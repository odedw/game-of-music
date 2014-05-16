define('gameView',
    ['constants', 'assetManager'], function (c, assetManager) {
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