Vue.config.devtools = true;

socket1 = new WebSocket("ws://" + window.location.host + "/ws/game/" + gameId + "/");

let lifeGame = new Vue({
    el: "#life",
    delimiters: ["[[", "]]"],
    data: {
        gameOver: false,
        canvasSize: 450,
        cellSize: 25,
        speed: 500,
        countRound: 0,
        countCell: 0,
        currRound: 0,
        currGen: 1,
        countNewCell: 0,
        playerScore: 0,
        opponentScore: 0,
        playerCells: [],
        opponentCells: [],
        playerId: "",
        isUnblockedInterface: false,
        socket: "",
        timerGameId: false,
        counterReadyPlayers: 1,
        gameCreatorId: "",
        gameMessage: "",
        blockPlayCreator: false,
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
            this.playerScore = this.calculateScore(this.playerCells);
            this.opponentScore = this.calculateScore(this.opponentCells);
            this.showResult();

            let score1;
            let score2;
            if (this.checkPlayerIsCreator()) {
                score1 = this.playerScore;
                score2 = this.opponentScore;
            }
            else {
                score1 = this.opponentScore;
                score2 = this.playerScore;
            }

            this.socket.send(
                JSON.stringify({
                    "result": true,
                    "score_creator": score1,
                    "score_opponent": score2,
                })
            );
            this.socket.send(
                JSON.stringify({
                    "game_over": true,
                })
            );
        },
    },
    methods: {
        checkPlayerIsCreator: function() {
            return this.playerId === this.gameCreatorId;
        },
        showResult: function() {
            if (this.playerScore > this.opponentScore) {
                this.gameMessage = "Вы выиграли";
            }
            else if (this.playerScore === this.opponentScore) {
                this.gameMessage = "Ничья";
            }
            else {
                this.gameMessage = "Вы проиграли";
            }

        },
        getCellClass: function(cell) {
            if (!this.opponentCells[cell.yCoord][cell.xCoord].status) {
                return cell.status ? "cell-living-player" : "cell-died";
            }
            else if (this.opponentCells[cell.yCoord][cell.xCoord].status === this.playerCells[cell.yCoord][cell.xCoord].status) {
                return "cell-living-both";
            }
            else {
                return "cell-living-opponent";
            }
        },
        checkGameOver: function() {
            if (this.currRound === this.countRound) {
                this.gameOver = true;
            }
        },
        checkNewCells: function (cell) {
            if (this.isUnblockedInterface){
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
            }
        },
        calculateScore: function (cells) {
            let result  = 0;
            cells.forEach(function (row) {
                row.forEach(function (cell){
                    if (cell.status !== false) {
                        result++;
                    }
                })
            });
            return result;
        },
        updateOpponentOneCell: function (cell, user) {
            if (user !== this.playerId) {
                this.opponentCells[cell.yCoord][cell.xCoord].status = cell.status;
            }
        },
        sendOwnCell: function(cell) {
            this.socket.send(
                JSON.stringify({
                    "cell": cell,
                    "user": this.playerId,
                })
            );
        },
        sendOwnGen: function(gen) {
            this.socket.send(
                JSON.stringify({
                    "gen": gen,
                    "user": this.playerId,
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
                        yCoord: i,
                        xCoord: j,
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
                    let newCell = {status: cell.status, yCoord: i, xCoord: j};
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
            if (!this.isUnblockedInterface && !this.blockPlayCreator) {
                this.timerGameId = setInterval(function () {
                    if (lifeGame.currGen <= lifeGame.countGen) {
                        lifeGame.generateNextGen();
                        lifeGame.currGen++;
                    }
                    else {
                        clearInterval(lifeGame.timerGameId);
                        console.log("after end of gen");
                        lifeGame.checkGameOver();
                        if (!lifeGame.gameOver) {
                            lifeGame.sendReadySignal();
                        }
                    }
                }, this.speed);
                this.countNewCell = 0;
            }
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
        sendReadySignal: function() {
            this.socket.send(
                JSON.stringify({
                    "pl_ready": true,
                    "user": this.playerId,
                })
            );
        },

        checkUnblockInterface: function() {
            console.log("are you here unblock");
            if (this.counterReadyPlayers === 2) {
                console.log("check unblock");
                this.isUnblockedInterface = true;
                this.counterReadyPlayers = 0;
            }
        },
        startPlay: function () {
            this.sendReadySignal();
            this.isUnblockedInterface = false;
            console.log("start play");
            if (this.checkPlayerIsCreator()) {
                this.blockPlayCreator = true;
                console.log("block creator gen");
            }
            this.keepGoingGame();
        }
    },
    created: function() {
        this.socket = new WebSocket("ws://" + window.location.host + "/ws/game/" + gameId + "/");
        this.countRound = gameRound;
        this.countCell = gameCells;
        this.countGen = gameGens;
        this.playerId = userId;
        this.gameCreatorId = gameCreatorId;

        if (!this.checkPlayerIsCreator()) {
            this.counterReadyPlayers = 0;
        }

        this.socket.onopen = function () {
             if (!lifeGame.checkPlayerIsCreator()) {
                lifeGame.sendReadySignal();
                lifeGame.counterReadyPlayers++;
            }
        };

        this.socket.onmessage = function(e) {
            let data = JSON.parse(e.data);

            if ("cell" in data) {
                lifeGame.updateOpponentOneCell(data["cell"], data["user"]);
            }
            else if ("gen" in data) {
                lifeGame.updateOpponentCells(data["gen"], data["user"]);
            }
            else if ("opponent_ready" in data) {
                if (data["user"] !== lifeGame.playerId) {

                    if (!lifeGame.gameOver) {
                        console.log(data);
                        if (lifeGame.blockPlayCreator) {  // if receiver is creator with blocked generator
                            console.log("unblock creator");
                            lifeGame.blockPlayCreator = false;
                            lifeGame.counterReadyPlayers = 1;
                            lifeGame.play();
                        }
                        else {
                            lifeGame.counterReadyPlayers++;
                            lifeGame.checkUnblockInterface();
                        }
                    }
                }
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