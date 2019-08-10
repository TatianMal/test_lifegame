let lifeGame = new Vue({
    el: '#life',
    delimiters: ['[[', ']]'],
    data: {
        gameOver: false,
        canvasSize: 450,
        cellSize: 25,
        speed: 500,
        countRound: 0,
        countCell: 0,
        currRound: 1,
        currGen: 1,
        countNewCell: 0,
        playerScore: 0,
        playerCells: [],
        opponentCells: [],
        playerId: "",
        isUnblockedInterface: false,
        socket: '',
        timerGameId: false,
    },
    computed: {
        // если свойство только возвращает данные, достаточно простой функции:
        canvasSizeStyles: function () {
            return {
                width: this.canvasSize + "px",
                height: this.canvasSize + "px",
            }
        },
        cellSizeStyles: function () {
            return {
                width: this.cellSize + "px",
                height: this.cellSize + "px",
            }
        }
    },
    watch: {
        gameOver: function () {
            //notice players with websocket and calculate result
        }
    },
    methods: {
        getCellClass: function(cell) {
            return cell.status ? 'cell-living-player' : 'cell-died'
        },
        checkGameOver: function() {
            if (this.currRound === this.countRound /*|| event when one of players exit game*/ ) {
                this.gameOver = true;
            }
        },
        checkNewCells: function (cell) {
            if (this.countNewCell < this.countCell) {
                cell.status ? cell.status = false : cell.status = true;
                if (cell.status) {
                    this.countNewCell++;
                }
                else {
                    this.countNewCell--;
                }
            }
            else if (cell.status) {
                //if switch living cell to dead state, when count cell is maximum
                cell.status = false;
                this.countNewCell--;
            }
        },
        calculateScore: function () {
            this.playerCells.forEach(function (row) {
                row.forEach(function (cell){
                    if (cell.status !== false) {
                        lifeGame.playerScore++;
                    }
                })
            });
        },
        updateOpponentOneCell: function () {
            //webhook send coordinates of update cell (live or dead)
        },
        updateOpponentCells: function () {
            //webhook send array of all cells
        },
        getCells: function () {
            let rows = [];
            for (let i = 0; i < this.canvasSize / this.cellSize; i++) {
                let cells = [];
                for (let b = 0; b < this.canvasSize / this.cellSize; b++) {
                    cells.push({
                        status: false
                    });
                }
                rows.push(cells);
            }
            return rows;
        },
        generateNextGen: function () {
            let nextStep = [];
            let rows = this.playerCells;
            this.playerCells.forEach(function (row, i) {
                nextStep[i] = [];
                row.forEach(function (cell, b) {
                    let neighbors = 0;
                    if (i) {
                        let topRow = rows[i - 1];
                        neighbors += lifeGame.checkLiveNeighbor(topRow[b - 1]);
                        neighbors += lifeGame.checkLiveNeighbor(topRow[b]);
                        neighbors += lifeGame.checkLiveNeighbor(topRow[b + 1]);
                    }
                    neighbors += lifeGame.checkLiveNeighbor(row[b - 1]);
                    neighbors += lifeGame.checkLiveNeighbor(row[b + 1]);
                    if (i + 1 !== lifeGame.canvasSize / lifeGame.cellSize) {
                        let bottomRow = rows[i + 1];
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[b - 1]);
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[b]);
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[b + 1]);
                    }
                    let newCell = {status: cell.status};
                    if (!cell.status) {
                        if (neighbors === 3) {
                            newCell.status = true;
                        }
                    } else {
                        if (neighbors < 2 || neighbors > 3) {
                            newCell.status = false;
                        }
                    }
                    nextStep[i][b] = newCell;
                });
            });
            this.playerCells = nextStep;
        },
        checkLiveNeighbor: function (neighbor) {
            if (neighbor !== undefined) {
                if (neighbor.status) {
                    return 1;
                }
            }
            return 0;
        },
        play: function () {
            this.timerGameId = setInterval(function () {
                console.log("play");
                if (lifeGame.currGen <= lifeGame.countGen) {
                    lifeGame.generateNextGen();
                    lifeGame.currGen++;
                }
                else {
                    clearInterval(lifeGame.timerGameId);
                }
            }, this.speed);
        },
        completeGame: function() {
            this.currRound++;
            this.currGen=1;
            this.play();
        },
        clearField: function () {
            this.playerCells.forEach(function (row) {
                row.forEach(function (cell){
                    cell.status = false;
                })
            })
        },
    },
    created: function() {
        this.socket = new WebSocket('ws://' + window.location.host + '/ws/game/' + gameId + '/');
        this.countRound = gameRound;
        this.countCell = gameCells;
        this.countGen = gameGens;
    },
    mounted: function () {
        this.playerCells = this.getCells();
    }
});