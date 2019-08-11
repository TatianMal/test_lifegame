Vue.config.devtools = true;

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
            this.calculateScore();

            //notice players with websocket and calculate result
        },

    },
    methods: {
        getCellClass: function(cell) {
            if (!this.opponentCells[cell.xCoord][cell.yCoord].status) {
                return cell.status ? 'cell-living-player' : 'cell-died';
            }
            else /*is_creator*/ {
                return "cell-living-opponent";
            }
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
                this.sendOwnCell(cell);
            }
            else if (cell.status) {
                //if switch living cell to dead state, when count cell is maximum
                cell.status = false;
                this.countNewCell--;
                this.sendOwnCell(cell);
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
        updateOpponentOneCell: function (cell, user) {
            if (user !== this.playerId) {
                this.opponentCells[cell.xCoord][cell.yCoord].status = cell.status;
            }
        },
        sendOwnCell: function(cell) {
            this.socket.send(
                JSON.stringify({
                    'cell': cell,
                    'user': this.playerId,
                })
            );
        },
        sendOwnGen: function(gen) {
            this.socket.send(
                JSON.stringify({
                    'gen': gen,
                    'user': this.playerId,
                })
            );
        },
        updateOpponentCells: function(gen, user) {
            if (user !== this.playerId) {
                this.clearField(this.opponentCells);
                gen.forEach(function (row, i) {
                    row.forEach(function (cell, j) {
                        if (cell.status) {
                            lifeGame.opponentCells[i][j].status = cell.status;
                        }
                    })
                })
            }
        },
        getCells: function () {
            let rows = [];
            for (let i = 0; i < this.canvasSize / this.cellSize; i++) {
                let cells = [];
                for (let j = 0; j < this.canvasSize / this.cellSize; j++) {
                    cells.push({
                        status: false,
                        xCoord: i,
                        yCoord: j,
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
                row.forEach(function (cell, j) {
                    let neighbors = 0;
                    if (i) {
                        let topRow = rows[i - 1];
                        neighbors += lifeGame.checkLiveNeighbor(topRow[j - 1]);
                        neighbors += lifeGame.checkLiveNeighbor(topRow[j]);
                        neighbors += lifeGame.checkLiveNeighbor(topRow[j + 1]);
                    }
                    neighbors += lifeGame.checkLiveNeighbor(row[j - 1]);
                    neighbors += lifeGame.checkLiveNeighbor(row[j + 1]);
                    if (i + 1 !== lifeGame.canvasSize / lifeGame.cellSize) {
                        let bottomRow = rows[i + 1];
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[j - 1]);
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[j]);
                        neighbors += lifeGame.checkLiveNeighbor(bottomRow[j + 1]);
                    }
                    let newCell = {status: cell.status, xCoord: i, yCoord: j};
                    if (!cell.status) {
                        if (neighbors === 3) {
                            newCell.status = true;
                        }
                    } else {
                        if (neighbors < 2 || neighbors > 3) {
                            newCell.status = false;
                        }
                    }
                    nextStep[i][j] = newCell;
                });
            });
            this.playerCells = nextStep;
            this.sendOwnGen(this.playerCells);
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
                if (lifeGame.currGen <= lifeGame.countGen) {
                    lifeGame.generateNextGen();
                    lifeGame.currGen++;
                }
                else {
                    clearInterval(lifeGame.timerGameId);
                    lifeGame.socket.send(
                        JSON.stringify({
                            'end_round': true,
                            'user': this.playerId,
                        })
                    );
                }
            }, this.speed);
        },
        keepGoingGame: function() {
            this.currRound++;
            this.currGen = 1;
            this.play();
        },
        clearField: function (cells) {
            cells.forEach(function (row) {
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
        this.playerId = userId;

        this.socket.onmessage = function(e) {
            let data = JSON.parse(e.data);

            if ("cell" in data) {
                lifeGame.updateOpponentOneCell(data["cell"], data["user"]);
            }
            else if ("gen" in data) {
                lifeGame.updateOpponentCells(data["gen"], data["user"]);
            }
            else if ("game_over" in data) {
                lifeGame.gameOver = data["game_over"];
            }
        };
    },
    mounted: function () {
        this.playerCells = this.getCells();
        this.opponentCells = this.getCells();
    }
});