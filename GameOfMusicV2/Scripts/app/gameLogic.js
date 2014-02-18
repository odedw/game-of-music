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
            this.cells.each(function(currentCell) {
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
                        world.getCell(x, y).dead = true;
                    }
                }
            };
        
        return {
            step: step,
            getCell: function(x, y) {
                return world.getCell(x, y);
            },
            clear: clear
        };
});