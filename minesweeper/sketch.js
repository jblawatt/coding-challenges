

COLOR_DEFAULT = 255;
COLOR_REVEALED = 220;
COLOR_BOMB = 200;
COLOR_TEXT = 70;
COLOR_FLAG = 50;

KEY_LEFT_CTRL = 17;

const resetColor = () => {
    fill(COLOR_DEFAULT);
}


class Cell {
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
        resetColor();
        if (this.isRevealed) {
            if (this.isBomb) {
                // draw the bomb
                fill(COLOR_BOMB);
                circle(
                    this.x + (this.width / 2),
                    this.y + (this.height / 2)
                    , 20);
                resetColor();
            } else {
                // draw the neighbours
                var neighbours = this.neighbours(g);
                if (neighbours > 0) {
                    textAlign(CENTER);
                    fill(COLOR_TEXT);
                    text(neighbours,
                        this.x + (this.width / 2) + 5,
                        this.y + (this.height / 2) + 5,
                    )
                    resetColor();
                }
            }
        } else {
            if (this.isFlagged) {
                // draw the flag if it's a bomb
                textAlign(CENTER);
                fill(COLOR_FLAG);
                text('?',
                    this.x + (this.width / 2) + 5,
                    this.y + (this.height / 2) + 5,
                )
                resetColor();
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

    constructor(height, width, bombs, cellCount) {
        this.height = height;
        this.width = width;
        this.cells = [];
        this.cellNumbers = cellCount;
        var cellWidth = this.height / this.cellNumbers;
        var cellHeight = this.width / this.cellNumbers;

        // construct cells
        for (var i = 0; i < this.cellNumbers; i++) {
            for (var j = 0; j < this.cellNumbers; j++) {
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
        // fixme: inperfomant
        var wrapper = [];
        var clone = [...this.cells];
        while (clone.length) {
            wrapper.push(clone.splice(0, this.cellNumbers));
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
                var c2 = g.get(cell.positionX + xAdd, cell.positionY + yAdd);
                if (c2 && !c2.isRevealed) {
                    c2.reveal();
                    if (c2.neighbours(g) == 0) {
                        this.revealNeighbours(c2);
                    }
                }
            });
        });
    }


    onMouseClicked(x, y) {
        this.cells.forEach(c => {
            if (c.contains(x, y)) {
                if (mouseButton === LEFT && !keyIsDown(KEY_LEFT_CTRL)) {
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
                if (mouseButton === LEFT && keyIsDown(KEY_LEFT_CTRL)) {
                    c.toggleFlag();
                }
            }
        })
    }
}

FIELD_HEIGHT = 500;
FIELD_WIDTH = 500;


var g = null;

function setup() {
    createCanvas(FIELD_WIDTH, FIELD_HEIGHT);
    g = new Grid(FIELD_WIDTH, FIELD_HEIGHT, 50, 20);
}

function mousePressed() {
    g.onMouseClicked(mouseX, mouseY);
}

function draw() {
    background(30);
    fill(255);
    g.draw();
}
