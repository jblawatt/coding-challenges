
COLOR_DEFAULT = 255;
COLOR_REVEALED = 220;
COLOR_BOMB = 'red';
COLOR_TEXT = 70;
COLOR_FLAG = 'lime';
COLOR_BACKGROUND = 30;
COLOR_CROSS = 'red';

STROKE_WEIGHT_CROSS = 8;

KEY_LEFT_CTRL = 17;

FIELD_HEIGHT = 800;
FIELD_WIDTH = 800;

FIELD_ROWS = 20;
FIELD_BOMBS = 50;

FONT_SIZE = 20;

const resetOutput = () => {
    fill(COLOR_DEFAULT);
    stroke(0);
    strokeWeight(1);
    textSize(FONT_SIZE);
}


class Bomb {
    /**
     * @param {Cell} cell
     */
    constructor(cell) {
        this.cell = cell;
    }

    draw() {

    }

}


class Flag {
    /**
     * @param {Cell} cell
     */
    constructor(cell) {
        this.cell = cell;
    }

    draw() {

    }

}

class Cell {

    /**
     * @param {Grid} grid
     */
    constructor(grid, x, y, height, width, positionX, positionY) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.isBomb = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    draw() {
        if (this.isRevealed) {
            fill(COLOR_REVEALED);
        }
        rect(this.x, this.y, this.width, this.height);
        resetOutput();
        if (this.isRevealed) {
            if (this.isBomb) {
                // draw the bomb
                const b = new Bomb(this);
                b.draw();
                image(this.grid.game.bombImage, this.x + 5, this.y + 5, this.width - 10 , this.height - 10);
                /*
                fill(COLOR_BOMB);
                circle(
                    this.x + (this.width / 2),
                    this.y + (this.height / 2)
                    , 20);
                */
                resetOutput();
            } else {
                // draw the neighbours
                const neighbours = this.neighbours();
                if (neighbours > 0) {
                    textAlign(CENTER, CENTER);
                    fill(COLOR_TEXT);
                    text(neighbours,
                        this.x + (this.width / 2),
                        this.y + (this.height / 2),
                    )
                    resetOutput();
                }
            }
        } else {
            if (this.isFlagged) {
                /**
                strokeWeight(STROKE_WEIGHT_CROSS);
                stroke(COLOR_CROSS);
                const borderDistance = 10;
                line(
                    this.x + borderDistance,
                    this.y + borderDistance,
                    this.x + this.width - borderDistance,
                    this.y + this.height - borderDistance,
                    75
                );
                line(
                    this.x + borderDistance,
                    this.y + this.height - borderDistance,
                    this.x + this.width - borderDistance,
                    this.y + borderDistance,
                    75
                );
                strokeWeight(1);
                **/
               image(this.grid.game.pinImage, this.x + 10, this.y + 5, this.width - 20, this.height - 10);
                resetOutput();
            }
        }
    }

    neighbours() {
        // check for neigbours. returns int
        const a = [-1, 0, 1];
        const b = [-1, 0, 1];
        var neighbours = 0;
        a.forEach(x => {
            b.forEach(y => {
                var c = this.grid.get(this.positionX + x, this.positionY + y);
                if (c && c.isBomb) {
                    neighbours++;
                }
            });
        });
        return neighbours;
    }

    contains(x, y) {
        // check if this cell is in the given position
        return (
            (x > this.x && x < this.x + this.width)
            &&
            (y > this.y && y < this.y + this.height)
        );
    }

    reveal() {
        this.isRevealed = true;
    }

    toggleFlag() {
        this.isFlagged = !this.isFlagged;
    }
}



class Grid {

    /**
     * @param {Game} game
     * @param {Integer} height
     */
    constructor(game, height, width, bombs, fieldSize) {
        this.game = game;
        this.height = height;
        this.width = width;
        this.cells = [];
        this.fieldSize = fieldSize;
        var cellWidth = this.height / this.fieldSize;
        var cellHeight = this.width / this.fieldSize;

        // construct cells
        for (var i = 0; i < this.fieldSize; i++) {
            for (var j = 0; j < this.fieldSize; j++) {
                this.cells.push(new Cell(
                    this,
                    cellWidth * j,
                    cellHeight * i,
                    cellHeight, cellWidth,
                    i,
                    j
                ));
            }
        }

        var selected = 0;

        // choose bomb cells
        while (selected < bombs) {
            var idx = Math.floor(Math.random() * this.cells.length);
            if (!this.cells[idx].isBomb) {
                this.cells[idx].isBomb = true;
                console.log(idx);
                selected++;
            }
        }

    }

    get(x, y) {
        // fixme: inperformant
        var wrapper = [];
        var clone = [...this.cells];
        while (clone.length) {
            wrapper.push(clone.splice(0, this.fieldSize));
        }
        try {
            return wrapper[x][y];
        } catch (TypeError) {
            return null;
        }
    }

    draw() {
        this.cells.forEach(c => c.draw());
    }

    revealNeighbours(cell) {
        [-1, 0, 1].forEach(xAdd => {
            [-1, 0, 1].forEach(yAdd => {
                var cellInner = this.get(cell.positionX + xAdd, cell.positionY + yAdd);
                if (cellInner != null && !cellInner.isRevealed) {
                    cellInner.reveal();
                    if (cellInner.neighbours() == 0) {
                        this.revealNeighbours(cellInner);
                    }
                }
            });
        });
    }

    /**
     * @param {Cell} c
     */
    _handleClick(c) {
        c.reveal();
        if (c.isBomb) {
            this.cells.forEach(cc => cc.reveal());
        } else {
            var n = c.neighbours();
            if (n == 0) {
                this.revealNeighbours(c);
            }
        }
    }

    _handleMark(c) {
        c.toggleFlag();
    }

    onMousePressed(x, y) {
        this.cells.forEach(c => {
            if (c.contains(x, y)) {
                if (mouseButton === LEFT && !keyIsDown(KEY_LEFT_CTRL)) {
                    this._handleClick(c);
                }
                if (mouseButton === LEFT && keyIsDown(KEY_LEFT_CTRL)) {
                    this._handleMark(c);
                }
            }
        })
    }
}

class Game {
    constructor(width, height, bombs, rows) {
        this.grid = null;
        this.width = width;
        this.height = height;
        this.bombs = bombs;
        this.rows = rows;
        this.bombImage = null;
        this.pinImage = null;
    }
    preload() {
        this.bombImage = loadImage('images/bomb.png');
        this.pinImage = loadImage('images/pin2.png');
    }
    setup() {
        frameRate(10);
        createCanvas(this.width, this.height);
        this.grid = new Grid(this, this.width, this.height, this.bombs, this.rows);
    }
    draw() {
        background(COLOR_BACKGROUND)
        resetOutput();
        this.grid.draw();
    }
    onMousePressed() {
        this.grid.onMousePressed(mouseX, mouseY)
    }
}

const game = new Game(
    FIELD_WIDTH,
    FIELD_HEIGHT,
    FIELD_BOMBS,
    FIELD_ROWS
);


function preload() {
    game.preload();
}

function setup() {
    game.setup();
}

function draw() {
    game.draw();
}

function mousePressed() {
    game.onMousePressed();
}
